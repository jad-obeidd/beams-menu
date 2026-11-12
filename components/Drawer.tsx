"use client";

import { useEffect, useRef, useState } from "react";
import { shop, type Section } from "@/lib/menu";

type Props = {
  sections: Section[];
  open: boolean;
  isOpenNow: boolean | null;
  onClose: () => void;
  onJump: (id: string) => void;
};

// Line icons, drawn to match the doodles on the menu boards.
const icons = {
  directions: <path d="M12 21s-6-5.6-6-10.5A6 6 0 0 1 18 10.5C18 15.4 12 21 12 21zM12 12.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />,
  map: <path d="M3 6.5l5-2 8 3 5-2v13l-5 2-8-3-5 2zM8 4.5v13M16 7.5v13" />,
  whatsapp: <path d="M4 20l1.3-3.8A8 8 0 1 1 8 19zM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-.9.8c-1-.4-2-1.4-2.4-2.4l.8-.9-1-2z" />,
  call: <path d="M5 4h3.5l1.5 4-2 1.3a10 10 0 0 0 4.7 4.7L14 12l4 1.5V17a2 2 0 0 1-2 2A13 13 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  card: <path d="M3 6.5h18v11H3zM6.5 10.5h.01M10 10.5h.01M13.5 10.5h.01M17 10.5h.01M6.5 14h11" />,
  share: <path d="M12 3v12M7.5 7.5L12 3l4.5 4.5M5 12v7h14v-7" />,
  review: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
  instagram: <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17.3 6.7h.01" />,
};

const Icon = ({ name }: { name: keyof typeof icons }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {icons[name]}
  </svg>
);

const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`;

export const Drawer = ({ sections, open, isOpenNow, onClose, onJump }: Props) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [shared, setShared] = useState("");

  // Escape closes it, focus starts on the close button, and the page behind can't scroll.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  const share = async () => {
    const data = { title: "Beams menu", text: "The Beams Specialty Coffee menu", url: window.location.origin };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(data.url);
        setShared("Link copied");
        setTimeout(() => setShared(""), 2000);
      }
    } catch {}
  };

  const jump = (id: string) => {
    onClose();
    // Wait until the drawer has let go of the page's scroll before moving.
    setTimeout(() => onJump(id), 60);
  };

  return (
    <div className={`drawer-root${open ? " open" : ""}`} aria-hidden={!open}>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Beams" inert={!open}>
        <header className="drawer-head">
          <span className="drawer-mark">
            BEAMS
            <small>The Coffee House</small>
          </span>
          <button ref={closeRef} className="drawer-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </header>

        <div className={`drawer-status ${isOpenNow === null ? "" : isOpenNow ? "is-open" : "is-closed"}`}>
          <b>{isOpenNow === false ? "Closed now" : "Open now"}</b>
          <span>{shop.hours}</span>
        </div>

        <a className="drawer-hero" href={directionsUrl} target="_blank" rel="noopener noreferrer">
          <Icon name="directions" />
          <span>
            <b>Take me there</b>
            <small>Directions from where you are, in Google Maps</small>
          </span>
        </a>

        <ul className="drawer-links">
          <li>
            <button onClick={() => jump("map")}>
              <Icon name="map" />
              <span>
                <b>See the map</b>
                <small>{shop.address}</small>
              </span>
            </button>
          </li>
          <li>
            <a href={`https://wa.me/${shop.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" />
              <span>
                <b>Order on WhatsApp</b>
                <small>Delivery or pick up</small>
              </span>
            </a>
          </li>
          <li>
            <a href={`tel:+${shop.whatsapp}`}>
              <Icon name="call" />
              <span>
                <b>Call us</b>
                <small>{shop.phoneDisplay}</small>
              </span>
            </a>
          </li>
          <li>
            <a href={shop.loyaltyCard} target="_blank" rel="noopener noreferrer">
              <Icon name="card" />
              <span>
                <b>Your coffee card</b>
                <small>Buy 8, the 9th is on us</small>
              </span>
            </a>
          </li>
          <li>
            <a href={shop.review} target="_blank" rel="noopener noreferrer">
              <Icon name="review" />
              <span>
                <b>Leave us a review</b>
                <small>Tell people about Beams on Google Maps</small>
              </span>
            </a>
          </li>
          <li>
            <button onClick={share}>
              <Icon name="share" />
              <span>
                <b>{shared || "Share this menu"}</b>
                <small>Send it to a friend</small>
              </span>
            </button>
          </li>
          <li>
            <a href={shop.instagram} target="_blank" rel="noopener noreferrer">
              <Icon name="instagram" />
              <span>
                <b>Instagram</b>
                <small>@beams_specialtycoffee</small>
              </span>
            </a>
          </li>
        </ul>

        <h3 className="drawer-sub">The menu</h3>
        <ul className="drawer-sections">
          {sections.map((section) => (
            <li key={section.id}>
              <button onClick={() => jump(section.id)}>
                {section.title}
                <span>{section.items.length}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};
