"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  cartLines,
  changeDue,
  eventCategories,
  eventMenu,
  formatLbp,
  formatUsd,
  linesTotal,
  methodLabel,
  summarize,
  summaryText,
  toLbp,
  type Cart,
  type Method,
  type Sale,
} from "@/lib/cashier";

// Everything stays on this phone, so the till keeps working when the event Wi-Fi drops.
const KEYS = {
  sales: "beams-cashier-sales",
  cart: "beams-cashier-cart",
  rate: "beams-cashier-rate",
  paper: "beams-cashier-paper",
  autoPrint: "beams-cashier-autoprint",
};
// The owner's WhatsApp number comes from the environment so it stays out of the repo.
const OWNER_WHATSAPP = process.env.NEXT_PUBLIC_OWNER_WHATSAPP ?? "";
const DEFAULT_RATE = 89500;

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const clock = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Beirut" }).format(
    new Date(iso),
  );

const number = (text: string) => {
  const value = Number(text.replace(/,/g, "").trim());
  return Number.isFinite(value) && value > 0 ? value : 0;
};

const stamp = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Beirut",
  }).format(new Date(iso));

// Only this shows on paper. Sized for receipt printers (58 or 80 mm rolls); the page is
// exactly as long as the receipt, so the roll is not fed a full A4 page.
const Receipt = ({ sale, rate, paper, onReady }: { sale: Sale; rate: number; paper: number; onReady: () => void }) => {
  const box = useRef<HTMLDivElement>(null);
  const [length, setLength] = useState(0);

  useLayoutEffect(() => {
    if (box.current) setLength(Math.ceil((box.current.offsetHeight * 25.4) / 96) + 8);
  }, [sale, paper]);

  useEffect(() => {
    if (length) onReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length]);

  return (
  <div ref={box} className="till-receipt" style={{ width: `${paper - 6}mm` }}>
    {length > 0 && <style>{`@page { size: ${paper}mm ${length}mm; margin: 3mm; }`}</style>}
    <p className="rc-mark">BEAMS</p>
    <p className="rc-sub">The Coffee House</p>
    <p className="rc-no">Order #{sale.no}</p>
    <p className="rc-when">{stamp(sale.at)}</p>
    <ul>
      {sale.lines.map((line) => (
        <li key={line.id}>
          <span>
            {line.qty} x {line.name}
          </span>
          <b>{formatUsd(line.qty * line.cents)}</b>
        </li>
      ))}
    </ul>
    <p className="rc-total">
      <span>Total</span>
      <b>{formatUsd(sale.total)}</b>
    </p>
    <p className="rc-row">
      <span>In LBP</span>
      <span>{formatLbp(toLbp(sale.total, rate))}</span>
    </p>
    {sale.name && (
      <p className="rc-row">
        <span>For</span>
        <span>{sale.name}</span>
      </p>
    )}
    <p className="rc-row">
      <span>Paid</span>
      <span>{methodLabel(sale.method)}</span>
    </p>
    {sale.change ? (
      <p className="rc-row">
        <span>Change</span>
        <span>{formatUsd(sale.change)}</span>
      </p>
    ) : null}
    <p className="rc-thanks">Thank you for coming to Beams</p>
    <p className="rc-sub">@beams_specialtycoffee</p>
  </div>
  );
};

const PaySheet = ({
  total,
  rate,
  onClose,
  onDone,
}: {
  total: number;
  rate: number;
  onClose: () => void;
  onDone: (method: Method, change: number, name: string) => void;
}) => {
  const [method, setMethod] = useState<Method>("cash");
  const [usd, setUsd] = useState("");
  const [lbp, setLbp] = useState("");
  const [name, setName] = useState("");

  const handedOver = usd.trim() !== "" || lbp.trim() !== "";
  const change = handedOver ? changeDue(total, number(usd), number(lbp), rate) : 0;
  const short = method === "cash" && change < 0;
  const notes = [5, 10, 20, 50, 100].filter((n) => n * 100 >= total);

  return (
    <div className="till-sheet" role="dialog" aria-modal="true" aria-label="Payment">
      <div className="till-sheet-box">
        <div className="till-sheet-head">
          <div>
            <p>To pay</p>
            <strong>{formatUsd(total)}</strong>
            <span>{formatLbp(toLbp(total, rate))}</span>
          </div>
          <button className="till-close" onClick={onClose} aria-label="Back to the order">
            ×
          </button>
        </div>

        <div className="till-methods">
          <button className={method === "cash" ? "on" : ""} onClick={() => setMethod("cash")}>
            Cash
          </button>
          <button className={method === "other" ? "on" : ""} onClick={() => setMethod("other")}>
            Card / Whish
          </button>
          <button className={method === "later" ? "on" : ""} onClick={() => setMethod("later")}>
            Pay later
          </button>
        </div>

        {method === "later" && (
          <label className="till-name">
            <span>Who is it for?</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name or table"
              maxLength={40}
              autoFocus
            />
          </label>
        )}

        {method === "cash" && (
          <>
            <div className="till-notes">
              <button onClick={() => { setUsd(""); setLbp(""); }}>Exact</button>
              {notes.map((n) => (
                <button key={n} onClick={() => { setUsd(String(n)); setLbp(""); }}>
                  ${n}
                </button>
              ))}
            </div>
            <div className="till-paid">
              <label>
                <span>Paid in $</span>
                <input value={usd} onChange={(e) => setUsd(e.target.value)} inputMode="decimal" placeholder="0" />
              </label>
              <label>
                <span>Paid in LBP</span>
                <input value={lbp} onChange={(e) => setLbp(e.target.value)} inputMode="numeric" placeholder="0" />
              </label>
            </div>
            <div className={`till-change${short ? " short" : ""}`}>
              {short ? (
                <>
                  <span>Still missing</span>
                  <strong>{formatUsd(-change)}</strong>
                  <small>{formatLbp(toLbp(-change, rate))}</small>
                </>
              ) : (
                <>
                  <span>Change</span>
                  <strong>{formatUsd(change)}</strong>
                  <small>{formatLbp(toLbp(change, rate))}</small>
                </>
              )}
            </div>
          </>
        )}

        <button
          className="till-go"
          disabled={short || (method === "later" && !name.trim())}
          onClick={() => onDone(method, method === "cash" ? change : 0, name.trim())}
        >
          {method === "later" ? "Save, pay later" : "Paid, save order"}
        </button>
      </div>
    </div>
  );
};

export const CashierApp = () => {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<"sell" | "sales">("sell");
  const [cart, setCart] = useState<Cart>({});
  const [sales, setSales] = useState<Sale[]>([]);
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [paying, setPaying] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [done, setDone] = useState<Sale | null>(null);
  const [paper, setPaper] = useState(80);
  const [autoPrint, setAutoPrint] = useState(false);
  const [printing, setPrinting] = useState<{ sale: Sale; at: number } | null>(null);
  const sections = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    setCart(load(KEYS.cart, {}));
    setSales(load(KEYS.sales, []));
    setRate(load(KEYS.rate, DEFAULT_RATE));
    setPaper(load(KEYS.paper, 80));
    setAutoPrint(load(KEYS.autoPrint, false));
    setReady(true);
  }, []);

  // Prints once the receipt has been measured and its page size is set.
  const receiptReady = () => requestAnimationFrame(() => window.print());

  const print = (sale: Sale) => setPrinting({ sale, at: Date.now() });

  useEffect(() => {
    if (ready) save(KEYS.cart, cart);
  }, [cart, ready]);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => setDone(null), 4000);
    return () => clearTimeout(timer);
  }, [done]);

  const lines = useMemo(() => cartLines(cart, eventMenu), [cart]);
  const total = linesTotal(lines);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  const summary = useMemo(() => summarize(sales), [sales]);

  const add = (id: string, delta: number) =>
    setCart((current) => {
      const next = { ...current, [id]: Math.max((current[id] ?? 0) + delta, 0) };
      if (next[id] === 0) delete next[id];
      return next;
    });

  const storeSales = (next: Sale[]) => {
    setSales(next);
    save(KEYS.sales, next);
  };

  const finish = (method: Method, change: number, name: string) => {
    const no = sales.reduce((max, s) => Math.max(max, s.no), 0) + 1;
    const sale: Sale = { no, at: new Date().toISOString(), lines, total, method, change: Math.max(change, 0) };
    if (name) sale.name = name;
    storeSales([sale, ...sales]);
    setCart({});
    setPaying(false);
    setCartOpen(false);
    setDone(sale);
    if (autoPrint) print(sale);
  };

  const markPaid = (sale: Sale, method: Method) => {
    const label = method === "cash" ? "cash" : "card / Whish";
    if (!window.confirm(`Order #${sale.no}${sale.name ? ` (${sale.name})` : ""}: ${formatUsd(sale.total)} paid by ${label}?`)) return;
    storeSales(sales.map((s) => (s.no === sale.no ? { ...s, method, paidAt: new Date().toISOString() } : s)));
  };

  const cancelSale = (no: number) => {
    if (!window.confirm(`Cancel order #${no}? It will not count in the totals.`)) return;
    storeSales(sales.map((s) => (s.no === no ? { ...s, void: true } : s)));
  };

  const newDay = () => {
    if (!window.confirm("Clear all sales and start again from order #1? Send the summary first.")) return;
    storeSales([]);
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText(sales));
      window.alert("Summary copied");
    } catch {
      window.alert("Could not copy on this phone");
    }
  };

  const cartPanel = (
    <aside className={`till-cart${cartOpen ? " open" : ""}`} aria-label="Order">
      <div className="till-cart-head">
        <h2>Order</h2>
        {count > 0 && (
          <button className="till-link" onClick={() => setCart({})}>
            Clear
          </button>
        )}
        <button className="till-close till-cart-close" onClick={() => setCartOpen(false)} aria-label="Hide the order">
          ×
        </button>
      </div>
      {lines.length === 0 ? (
        <p className="till-empty">Tap a drink to start an order.</p>
      ) : (
        <ul className="till-lines">
          {lines.map((line) => (
            <li key={line.id}>
              <div>
                <b>{line.name}</b>
                <small>{formatUsd(line.cents)} each</small>
              </div>
              <div className="till-qty">
                <button onClick={() => add(line.id, -1)} aria-label={`One less ${line.name}`}>
                  −
                </button>
                <span>{line.qty}</span>
                <button onClick={() => add(line.id, 1)} aria-label={`One more ${line.name}`}>
                  +
                </button>
              </div>
              <strong>{formatUsd(line.qty * line.cents)}</strong>
            </li>
          ))}
        </ul>
      )}
      <div className="till-total">
        <span>Total</span>
        <strong>{formatUsd(total)}</strong>
        <small>{formatLbp(toLbp(total, rate))}</small>
      </div>
      <button className="till-go" disabled={count === 0} onClick={() => setPaying(true)}>
        Charge {formatUsd(total)}
      </button>
    </aside>
  );

  return (
    <main className="till">
      <header className="till-top">
        <span className="till-mark">BEAMS</span>
        <nav className="till-views">
          <button className={view === "sell" ? "on" : ""} onClick={() => setView("sell")}>
            Sell
          </button>
          <button className={view === "sales" ? "on" : ""} onClick={() => setView("sales")}>
            Sales <small>{formatUsd(summary.total)}</small>
            {summary.unpaidOrders.length > 0 && <i className="till-owed">{summary.unpaidOrders.length}</i>}
          </button>
        </nav>
      </header>

      {view === "sell" && (
        <div className="till-sell">
          <div className="till-products">
            <nav className="till-cats" aria-label="Jump to">
              {eventCategories.map((cat) => (
                <button key={cat} onClick={() => sections.current[cat]?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                  {cat}
                </button>
              ))}
            </nav>
            {eventCategories.map((cat) => (
              <section key={cat} ref={(el) => { sections.current[cat] = el; }} className="till-section">
                <h2>{cat}</h2>
                <div className="till-grid">
                  {eventMenu
                    .filter((p) => p.cat === cat)
                    .map((p) => (
                      <button key={p.id} className={`till-item${cart[p.id] ? " in" : ""}`} onClick={() => add(p.id, 1)}>
                        <span>{p.name}</span>
                        <b>{formatUsd(p.cents)}</b>
                        {cart[p.id] ? <i>{cart[p.id]}</i> : null}
                      </button>
                    ))}
                </div>
              </section>
            ))}
          </div>
          {cartPanel}
          <button className="till-bar" disabled={count === 0} onClick={() => setCartOpen(true)}>
            <span>{count === 0 ? "No items yet" : `${count} item${count === 1 ? "" : "s"}`}</span>
            <strong>{count === 0 ? "" : `Order ${formatUsd(total)}`}</strong>
          </button>
        </div>
      )}

      {view === "sales" && (
        <div className="till-sales">
          <div className="till-stats">
            <div>
              <span>Total</span>
              <strong>{formatUsd(summary.total)}</strong>
              <small>{formatLbp(toLbp(summary.total, rate))}</small>
            </div>
            <div>
              <span>Orders</span>
              <strong>{summary.orders}</strong>
            </div>
            <div>
              <span>Cash</span>
              <strong>{formatUsd(summary.cash)}</strong>
            </div>
            <div>
              <span>Card / Whish</span>
              <strong>{formatUsd(summary.other)}</strong>
            </div>
          </div>

          <div className="till-actions">
            <a
              className="till-go small"
              href={`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(summaryText(sales))}`}
              target="_blank"
              rel="noreferrer"
            >
              Send to owner on WhatsApp
            </a>
            <button className="till-ghost" onClick={copySummary}>
              Copy summary
            </button>
            <button className="till-ghost danger" onClick={newDay} disabled={sales.length === 0}>
              Start new day
            </button>
          </div>

          {summary.unpaidOrders.length > 0 && (
            <section className="till-block">
              <h2>
                Not paid yet <small>{formatUsd(summary.unpaid)}</small>
              </h2>
              <ul className="till-orders till-unpaid">
                {summary.unpaidOrders.map((s) => (
                  <li key={s.no}>
                    <div>
                      <b>
                        #{s.no} · {s.name} · {clock(s.at)}
                      </b>
                      <small>{s.lines.map((l) => `${l.qty} ${l.name}`).join(", ")}</small>
                    </div>
                    <strong>{formatUsd(s.total)}</strong>
                    <span className="till-pay-now">
                      <button onClick={() => markPaid(s, "cash")}>Paid cash</button>
                      <button onClick={() => markPaid(s, "other")}>Paid card</button>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {summary.items.length > 0 && (
            <section className="till-block">
              <h2>Sold</h2>
              <ul className="till-sold">
                {summary.items.map((i) => (
                  <li key={i.name}>
                    <span>
                      <b>{i.qty}</b> {i.name}
                    </span>
                    <strong>{formatUsd(i.total)}</strong>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="till-block">
            <h2>Orders</h2>
            {sales.length === 0 && <p className="till-empty">No orders yet.</p>}
            <ul className="till-orders">
              {sales.map((s) => (
                <li key={s.no} className={s.void ? "void" : s.method === "later" ? "owed" : ""}>
                  <div>
                    <b>
                      #{s.no} · {clock(s.at)}
                      {s.name ? ` · ${s.name}` : ""} · {methodLabel(s.method)}
                      {s.paidAt ? `, paid ${clock(s.paidAt)}` : ""}
                    </b>
                    <small>{s.lines.map((l) => `${l.qty} ${l.name}`).join(", ")}</small>
                  </div>
                  <strong>{s.void ? "Cancelled" : formatUsd(s.total)}</strong>
                  {!s.void && (
                    <span className="till-row-actions">
                      <button className="till-link print" onClick={() => print(s)}>
                        Print
                      </button>
                      <button className="till-link" onClick={() => cancelSale(s.no)}>
                        Cancel
                      </button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="till-block till-print-set">
            <h2>Receipts</h2>
            <div className="till-methods">
              {[58, 80].map((size) => (
                <button
                  key={size}
                  className={paper === size ? "on" : ""}
                  onClick={() => {
                    setPaper(size);
                    save(KEYS.paper, size);
                  }}
                >
                  {size} mm paper
                </button>
              ))}
            </div>
            <label className="till-check">
              <input
                type="checkbox"
                checked={autoPrint}
                onChange={(e) => {
                  setAutoPrint(e.target.checked);
                  save(KEYS.autoPrint, e.target.checked);
                }}
              />
              <span>Print a receipt after every order</span>
            </label>
          </section>

          <label className="till-rate">
            <span>Dollar rate (LBP for $1)</span>
            <input
              value={rate}
              inputMode="numeric"
              onChange={(e) => {
                const value = number(e.target.value);
                setRate(value);
                save(KEYS.rate, value);
              }}
            />
          </label>
        </div>
      )}

      {paying && <PaySheet total={total} rate={rate} onClose={() => setPaying(false)} onDone={finish} />}

      {done && (
        <div className="till-done" role="status" onClick={() => setDone(null)}>
          <span>Order</span>
          <strong>#{done.no}</strong>
          {done.change ? <small>Give back {formatUsd(done.change)}</small> : null}
          {done.method === "later" && <small>Pay later · {done.name}</small>}
          {!autoPrint && (
            <button
              className="till-done-print"
              onClick={(e) => {
                e.stopPropagation();
                print(done);
              }}
            >
              Print receipt
            </button>
          )}
        </div>
      )}

      {printing && (
        <Receipt key={printing.at} sale={printing.sale} rate={rate} paper={paper} onReady={receiptReady} />
      )}
    </main>
  );
};
