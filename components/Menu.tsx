"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addOns, findItem, formatPrice, posters, shop, type Item, type Section } from "@/lib/menu";
import {
  addLine,
  changeQty,
  lineKey,
  orderCount,
  orderLines,
  orderTotal,
  whatsappMessage,
  type Handover,
  type Order,
} from "@/lib/order";
import { Art } from "./Art";
import { Drawer } from "./Drawer";

const OPEN_HOUR = 7;
const CLOSE_HOUR = 22;

// Open or closed right now, in Tripoli time. Worked out after load so the server and phone agree.
const useOpenNow = () => {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    const check = () => {
      const hour = Number(
        new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Beirut" }).format(new Date()),
      );
      setOpen(hour >= OPEN_HOUR && hour < CLOSE_HOUR);
    };
    check();
    const timer = setInterval(check, 60_000);
    return () => clearInterval(timer);
  }, []);
  return open;
};

// Adds "in" to anything with data-reveal once it scrolls into view, which starts its CSS animation.
const useReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        }),
      { rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
};

// Highlights the category in the bar that's currently on screen.
// While a tapped category is scrolling into place, the bar keeps that category highlighted
// instead of flicking through every section it passes.
const useActiveSection = (ids: string[]) => {
  const [active, setActive] = useState(ids[0]);
  const holdUntil = useRef(0);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < holdUntil.current) return;
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  const jumpTo = (id: string) => {
    // Hold until the scroll finishes; the timeout covers browsers without "scrollend".
    holdUntil.current = Date.now() + 2000;
    window.addEventListener("scrollend", () => (holdUntil.current = 0), { once: true });
    setActive(id);
  };
  return [active, jumpTo] as const;
};

// Position on the page ignoring CSS transforms, so a section that's still sliding in
// is measured where it will end up.
const pageTop = (el: HTMLElement) => {
  let top = 0;
  for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) top += node.offsetTop;
  return top;
};

type AddHandler = (item: Item, index: number, from: HTMLElement) => void;

const matches = (text: string, query: string) => text.toLowerCase().includes(query.trim().toLowerCase());

// Splits the sections, in order, into two columns of about the same length for wide screens.
// On a phone the two columns simply stack, so the menu still reads top to bottom.
const splitInTwo = (list: Section[]) => {
  const weight = (s: Section) => s.items.length + 3;
  const half = list.reduce((sum, s) => sum + weight(s), 0) / 2;
  let running = 0;
  const cut = list.findIndex((s) => (running += weight(s)) >= half) + 1;
  return [list.slice(0, cut), list.slice(cut)];
};

const Plus = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// What each item row needs to add to, take from and read the current order.
type OrderControls = {
  onAdd: AddHandler;
  onRemove: (item: Item, index: number) => void;
  qty: (item: Item, index: number) => number;
};

const Minus = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// "+" until the item is in the order, then a − 2 + counter right on the row.
const Stepper = ({ item, index, controls }: { item: Item; index: number; controls: OrderControls }) => {
  const count = controls.qty(item, index);
  if (count === 0) {
    return (
      <button className="add" onClick={(e) => controls.onAdd(item, index, e.currentTarget)} aria-label={`Add ${item.name}`}>
        <Plus />
      </button>
    );
  }
  return (
    <span className="stepper">
      <button onClick={() => controls.onRemove(item, index)} aria-label={`One less ${item.name}`}>
        <Minus />
      </button>
      <b key={count}>{count}</b>
      <button onClick={(e) => controls.onAdd(item, index, e.currentTarget)} aria-label={`One more ${item.name}`}>
        <Plus />
      </button>
    </span>
  );
};

const ItemRow = ({ item, index, controls }: { item: Item; index: number; controls: OrderControls }) => {
  const single = item.prices.length === 1;
  const inOrder = item.prices.some((_, i) => controls.qty(item, i) > 0);
  const soldOut = item.available === false;
  return (
    <li
      className={`item${inOrder ? " in-order" : ""}${soldOut ? " sold-out" : ""}`}
      style={{ "--i": index } as React.CSSProperties}
    >
      <div className="item-line">
        <span className="item-name">{item.name}</span>
        <span className="leader" aria-hidden="true" />
        {single && <span className="item-price">{formatPrice(item.prices[0].amount)}</span>}
        {single && !soldOut && <Stepper item={item} index={0} controls={controls} />}
      </div>
      {soldOut && <span className="soldout-tag">Not available now</span>}
      {item.description && <p className="item-desc">{item.description}</p>}
      {!single && !soldOut && (
        <div className="options">
          {item.prices.map((price, i) => {
            const count = controls.qty(item, i);
            return (
              <button
                key={i}
                className={`option${count ? " picked" : ""}`}
                onClick={(e) => controls.onAdd(item, i, e.currentTarget)}
              >
                {price.label && <span>{price.label}</span>}
                {formatPrice(price.amount)}
                {count > 0 ? <i key={count}>×{count}</i> : <Plus />}
              </button>
            );
          })}
        </div>
      )}
      {item.note && <p className="item-note">{item.note}</p>}
    </li>
  );
};

const MenuSection = ({ section, controls }: { section: Section; controls: OrderControls }) => (
  <section id={section.id} className="section" data-reveal>
    <header className="section-head">
      <h2>{section.title}</h2>
      <Art name={section.art} className="section-art" />
    </header>
    <ul>
      {section.items.map((item, i) => (
        <ItemRow key={item.id} item={item} index={i} controls={controls} />
      ))}
    </ul>
    {section.id === "cold" && (
      <aside className="addons" data-reveal>
        <h3>Add-ons</h3>
        <ul>
          {addOns.map((addOn) => (
            <li key={addOn.name}>
              <span>{addOn.name}</span>
              <b>{addOn.amount}</b>
            </li>
          ))}
        </ul>
        <p>Ask the barista, or write it in the note when you order.</p>
      </aside>
    )}
  </section>
);

const tiltToward = (event: React.PointerEvent<HTMLElement>) => {
  if (event.pointerType !== "mouse") return;
  const el = event.currentTarget;
  const box = el.getBoundingClientRect();
  const x = (event.clientX - box.left) / box.width;
  const y = (event.clientY - box.top) / box.height;
  el.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
  el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
  el.style.setProperty("--gx", `${x * 100}%`);
  el.style.setProperty("--gy", `${y * 100}%`);
  el.classList.add("tilting");
};

const resetTilt = (event: React.PointerEvent<HTMLElement>) => event.currentTarget.classList.remove("tilting");

// Featured items: Beams' own photos, framed like the prints on the wall at the shop.
const PosterWall = ({ sections, onAdd }: { sections: Section[]; onAdd: AddHandler }) => (
  <section className="posters" aria-label="Featured">
    {posters.map((poster, i) => {
      const item = findItem(sections, poster.sectionId, poster.itemId);
      if (!item) return null;
      const soldOut = item.available === false;
      return (
        <article
          key={poster.itemId}
          className={`poster poster-${poster.theme}`}
          data-reveal
          style={{ "--tilt": `${[-1.6, 1.2, -0.8][i]}deg` } as React.CSSProperties}
          onPointerMove={tiltToward}
          onPointerLeave={resetTilt}
        >
          <div className="poster-photo">
            <Image src={poster.photo} alt={poster.alt} fill sizes="(min-width: 860px) 340px, 78vw" />
            {poster.badge && <span className="badge">{poster.badge}</span>}
          </div>
          <div className="poster-plate">
            <h2 className="poster-title">{poster.title}</h2>
            <p className="poster-notes">{poster.notes}</p>
            <div className="poster-foot">
              <span>{formatPrice(item.prices[0].amount)}</span>
              {soldOut ? (
                <span className="poster-soldout">Not available now</span>
              ) : (
                <button className="poster-add" onClick={(e) => onAdd(item, 0, e.currentTarget)}>
                  Add to order
                </button>
              )}
            </div>
          </div>
        </article>
      );
    })}
  </section>
);

type Bean = { id: number; x: number; y: number };

const OrderSheet = ({
  order,
  setOrder,
  onClose,
}: {
  order: Order;
  setOrder: (next: Order) => void;
  onClose: () => void;
}) => {
  const [handover, setHandover] = useState<Handover>({ mode: "delivery", name: "", address: "", note: "" });
  const lines = orderLines(order);
  const message = whatsappMessage(order, handover);
  const link = `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(message)}`;
  const set = (patch: Partial<Handover>) => setHandover({ ...handover, ...patch });

  useEffect(() => {
    if (lines.length === 0) onClose();
  }, [lines.length, onClose]);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label="Your order" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Your order</h2>
          <button className="text-button" onClick={onClose}>
            Keep browsing
          </button>
        </div>

        <ul className="sheet-lines">
          {lines.map((line) => (
            <li key={line.key}>
              <span className="sheet-name">{line.name}</span>
              <span className="qty">
                <button onClick={() => setOrder(changeQty(order, line.key, -1))} aria-label={`One less ${line.name}`}>
                  −
                </button>
                <b>{line.qty}</b>
                <button onClick={() => setOrder(changeQty(order, line.key, 1))} aria-label={`One more ${line.name}`}>
                  +
                </button>
              </span>
              <span className="sheet-price">{formatPrice(line.qty * line.amount)}</span>
            </li>
          ))}
        </ul>

        <div className="sheet-total">
          <span>Total</span>
          <b>{formatPrice(orderTotal(order))}</b>
        </div>

        <div className="mode" role="radiogroup" aria-label="Delivery or pickup">
          {(["delivery", "pickup"] as const).map((mode) => (
            <button
              key={mode}
              role="radio"
              aria-checked={handover.mode === mode}
              className={handover.mode === mode ? "on" : ""}
              onClick={() => set({ mode })}
            >
              {mode === "delivery" ? "Delivery" : "Pick up"}
            </button>
          ))}
        </div>

        <label className="field">
          <span>Your name</span>
          <input value={handover.name} onChange={(e) => set({ name: e.target.value })} autoComplete="given-name" />
        </label>
        {handover.mode === "delivery" && (
          <label className="field">
            <span>Address</span>
            <input
              value={handover.address}
              onChange={(e) => set({ address: e.target.value })}
              autoComplete="street-address"
              placeholder="Street, building, floor"
            />
          </label>
        )}
        <label className="field">
          <span>Note (optional)</span>
          <input value={handover.note} onChange={(e) => set({ note: e.target.value })} placeholder="Oat milk, less sugar…" />
        </label>

        <a className="send" href={link} target="_blank" rel="noopener noreferrer">
          Send order on WhatsApp
        </a>
        <p className="sheet-fine">
          This opens WhatsApp with your order written out for Beams ({shop.phoneDisplay}). Nothing is sent until you
          press send there.
        </p>
      </div>
    </div>
  );
};

export const Menu = ({ sections }: { sections: Section[] }) => {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const closeSearch = () => {
    setQuery("");
    setSearching(false);
  };
  const [order, setOrder] = useState<Order>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const [barHidden, setBarHidden] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);
  const autoScrollUntil = useRef(0);
  const [bump, setBump] = useState(0);
  const [beans, setBeans] = useState<Bean[]>([]);
  const open = useOpenNow();
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (searching) searchRef.current?.focus();
  }, [searching]);
  const visibleSections = useMemo(
    () =>
      query.trim()
        ? sections
            .map((s) => ({ ...s, items: s.items.filter((i) => matches(i.name, query) || matches(s.title, query)) }))
            .filter((s) => s.items.length > 0)
        : sections,
    [query, sections],
  );
  const ids = useMemo(() => visibleSections.map((s) => s.id), [visibleSections]);
  const [active, jumpTo] = useActiveSection(ids);
  useReveal();

  // Keep the active chip centred in the bar. Only the bar scrolls sideways; the page stays put
  // (scrollIntoView here used to pull the whole page down to the bar on load).
  useEffect(() => {
    const bar = barRef.current;
    const chip = bar?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!bar || !chip) return;
    bar.scrollTo({ left: chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  // The blue bar slides away while you scroll down to read and comes back when you scroll up.
  // It stays while searching, and while the page glides to a tapped category.
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        const stuck = (stickyRef.current?.getBoundingClientRect().top ?? 1) <= 0;
        if (Date.now() < autoScrollUntil.current || searching) {
          lastY = y;
          return;
        }
        if (delta > 8 && stuck) setBarHidden(true);
        else if (delta < -8 || !stuck) setBarHidden(false);
        if (Math.abs(delta) > 8) lastY = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [searching]);

  // Tapping a category glides the page to it, landing just under the sticky bar.
  const scrollToId = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return false;
    if (ids.includes(id)) jumpTo(id);
    const barHeight = document.querySelector(".bar")?.getBoundingClientRect().height ?? 0;
    const top = pageTop(target) - barHeight - 12;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Keep the bar while gliding; "scrollend" releases it, the timeout covers older browsers.
    autoScrollUntil.current = Date.now() + 3000;
    window.addEventListener("scrollend", () => (autoScrollUntil.current = Date.now() + 150), { once: true });
    setBarHidden(false);
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    return true;
  };

  const goToSection = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (scrollToId(id)) event.preventDefault();
  };

  const add: AddHandler = (item, index, from) => {
    setOrder((current) => addLine(current, item, item.prices[index]));
    setBump((n) => n + 1);
    const box = from.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setBeans((current) => [...current, { id, x: box.left + box.width / 2, y: box.top + box.height / 2 }]);
    // Backup in case the browser skips animationend (e.g. the tab was in the background).
    setTimeout(() => setBeans((current) => current.filter((b) => b.id !== id)), 1000);
  };

  const controls: OrderControls = {
    onAdd: add,
    onRemove: (item, index) => setOrder((current) => changeQty(current, lineKey(item, item.prices[index]), -1)),
    qty: (item, index) => order[lineKey(item, item.prices[index])]?.qty ?? 0,
  };

  const count = orderCount(order);

  return (
    <>
      <header className="cover-wrap">
        <div className="topline">
          <span className={`sign ${open === null ? "" : open ? "is-open" : "is-closed"}`} aria-live="polite">
            <b>{open === false ? "Closed" : "Open"}</b>
            <span>{open === null ? "7 am – 10 pm" : open ? "until 10 pm" : "opens at 7 am"}</span>
          </span>
          <span className="topline-links">
            <a href={shop.instagram} target="_blank" rel="noopener noreferrer" className="insta">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.3" cy="6.7" r="1.1" className="dot" />
              </svg>
              <span>
                <small>Follow us</small>
                @beams_specialtycoffee
              </span>
            </a>
            <button className="menu-button" onClick={() => setDrawerOpen(true)} aria-label="Open the Beams menu panel">
              <span />
              <span />
            </button>
          </span>
        </div>

        <div className="cover">
          <div className="cover-inner">
            <p className="cover-kicker">Specialty coffee · Tripoli</p>
            <h1 className="cover-mark">
              BEAMS
              <small>The Coffee House</small>
            </h1>
            <div className="cover-rule" aria-hidden="true">
              <span />
              <i />
              <span />
            </div>
            <p className="cover-line">Hot or iced, your kind of coffee is always at Beams.</p>
            <a className="cover-cta" href="#espresso" onClick={(e) => goToSection(e, "espresso")}>
              See the menu
            </a>
          </div>
          <span className="cover-beam" aria-hidden="true" />
        </div>
      </header>
      <div className="ribbon" aria-hidden="true" />

      {!query && <PosterWall sections={sections} onAdd={add} />}

      <div className={`bar${barHidden && !searching ? " bar-hidden" : ""}`} ref={stickyRef}>
        <div className="bar-inner">
          {searching ? (
            <div className="search">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="9" cy="9" r="6" />
                <path d="M14 14l4 4" />
              </svg>
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && closeSearch()}
                placeholder="Latte, mango, cookie…"
                aria-label="Search the menu"
                type="search"
              />
              <button className="search-close" onClick={closeSearch} aria-label="Close search">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <button className="search-open" onClick={() => setSearching(true)} aria-label="Search the menu">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <circle cx="9" cy="9" r="6" />
                  <path d="M14 14l4 4" />
                </svg>
              </button>
              <nav className="chips" ref={barRef} aria-label="Menu sections">
                {visibleSections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    data-id={s.id}
                    className={s.id === active ? "on" : ""}
                    onClick={(e) => goToSection(e, s.id)}
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </>
          )}
          <button className="burger burger-bar" onClick={() => setDrawerOpen(true)} aria-label="Open the Beams menu panel">
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <main className="menu">
        {visibleSections.length === 0 ? (
          <p className="empty">
            Nothing called “{query}” on the menu. Try “latte”, “mango” or “cookie”.
          </p>
        ) : (
          splitInTwo(visibleSections).map((column, i) => (
            <div key={i} className="menu-col">
              {column.map((section) => (
                <MenuSection key={section.id} section={section} controls={controls} />
              ))}
            </div>
          ))
        )}
      </main>

      <div className="ribbon" aria-hidden="true" />
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-copy" data-reveal>
            <h2>See you at the bar.</h2>
            <p className="footer-address">{shop.address}</p>

            <ul className="facts">
              <li>
                <span>Hours</span>
                <b>{shop.hours}</b>
              </li>
              <li>
                <span>Delivery</span>
                <b>
                  <a href={`tel:+${shop.whatsapp}`}>{shop.phoneDisplay}</a>
                </b>
              </li>
            </ul>

            <div className="footer-actions">
              <a className="pill pill-orange" href={shop.maps} target="_blank" rel="noopener noreferrer">
                Get directions
              </a>
              <a className="pill pill-white" href={`https://wa.me/${shop.whatsapp}`} target="_blank" rel="noopener noreferrer">
                WhatsApp us
              </a>
              <a className="pill pill-ghost" href={shop.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </div>

            <a className="review-card" href={shop.review} target="_blank" rel="noopener noreferrer">
              <span className="review-stars" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} viewBox="0 0 24 24">
                    <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
                  </svg>
                ))}
              </span>
              <span className="review-text">
                <b>Enjoyed your coffee?</b>
                <span>Leave us a review on Google Maps. It helps Beams a lot.</span>
              </span>
              <span className="review-go">Write a review</span>
            </a>

            <a className="card-promo" href={shop.loyaltyCard} target="_blank" rel="noopener noreferrer">
              <span className="promo-stamps" aria-hidden="true">
                {Array.from({ length: 9 }, (_, i) => (
                  <i key={i} className={i < 5 ? "full" : i === 8 ? "free" : ""} />
                ))}
              </span>
              <b>Get your Beams coffee card</b>
              <span>Buy 8 coffees, the 9th is on us. It lives on your phone.</span>
            </a>
          </div>

          <a id="map" className="map" href={shop.maps} target="_blank" rel="noopener noreferrer" data-reveal aria-label="Beams on the map, open directions">
            <iframe
              title="Map of Beams in Tripoli"
              src={shop.mapEmbed}
              loading="lazy"
              tabIndex={-1}
              referrerPolicy="no-referrer"
            />
            <span className="map-tint" aria-hidden="true" />
            <span className="pin" aria-hidden="true">
              <span className="pin-pulse" />
              <span className="pin-head">BEAMS</span>
            </span>
            <span className="map-label">Dam w Farz · Tripoli</span>
          </a>
        </div>

        <p className="footer-mark" aria-hidden="true">
          BEAMS
        </p>
        <p className="footer-small">
          Beams Specialty Coffee · Tripoli, Lebanon · Prices in USD
        </p>
      </footer>

      {count > 0 && (
        <button className="tray" onClick={() => setSheetOpen(true)}>
          <span key={bump} className="tray-count">
            {count}
          </span>
          <span>View order</span>
          <b>{formatPrice(orderTotal(order))}</b>
        </button>
      )}

      {beans.map((bean) => (
        <span
          key={bean.id}
          className="bean"
          aria-hidden="true"
          style={
            {
              left: bean.x,
              top: bean.y,
              "--dx": `${window.innerWidth / 2 - bean.x}px`,
              "--dy": `${window.innerHeight - 40 - bean.y}px`,
            } as React.CSSProperties
          }
          onAnimationEnd={() => setBeans((current) => current.filter((b) => b.id !== bean.id))}
        />
      ))}

      {/* When the bar slides away, this keeps the side menu one tap away. */}
      <button
        className={`burger burger-float${barHidden && !searching && !drawerOpen ? " show" : ""}`}
        onClick={() => setDrawerOpen(true)}
        aria-label="Open the Beams menu panel"
        tabIndex={barHidden ? 0 : -1}
      >
        <span />
        <span />
        <span />
      </button>

      <Drawer sections={sections} open={drawerOpen} isOpenNow={open} onClose={closeDrawer} onJump={scrollToId} />

      {sheetOpen && count > 0 && <OrderSheet order={order} setOrder={setOrder} onClose={() => setSheetOpen(false)} />}
    </>
  );
};
