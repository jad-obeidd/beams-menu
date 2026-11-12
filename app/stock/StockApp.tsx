"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { StaffLogin } from "@/app/admin/StaffLogin";
import type { StockCheck } from "@/lib/db";
import {
  formatAmount,
  nudge,
  parseAmount,
  stepFor,
  stockSections,
  toBuy,
  type CheckSummary,
  type Counts,
  type SectionId,
  type StockItem,
} from "@/lib/stock";

type Toast = { text: string; bad?: boolean } | null;
type Result = { summary: CheckSummary; text: string; title: string };
type View = "count" | "edit" | "result";

// The shopping list goes straight to the owner.
// The owner's WhatsApp number comes from the environment so it stays out of the repo.
const OWNER_WHATSAPP = process.env.NEXT_PUBLIC_OWNER_WHATSAPP ?? "";

const send = (url: string, method: string, body?: object) =>
  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

const when = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Beirut",
      }).format(new Date(iso))
    : "";

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

// Rows of one section, with a small heading where the group changes (Syrups, Sauces...).
const withGroups = <T extends { grp: string | null }>(rows: T[]) =>
  rows.map((row, i) => ({ row, heading: row.grp && row.grp !== rows[i - 1]?.grp ? row.grp : null }));

const CountRow = ({
  item,
  count,
  onChange,
}: {
  item: StockItem;
  count: number | undefined;
  onChange: (value: number | undefined) => void;
}) => {
  const [text, setText] = useState(count === undefined ? "" : String(count));

  // Keeps the box in step with the + and - buttons without fighting the typing.
  useEffect(() => {
    if (parseAmount(text) !== (count ?? null)) setText(count === undefined ? "" : String(count));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const type = (value: string) => {
    setText(value);
    if (value.trim() === "") return onChange(undefined);
    const amount = parseAmount(value);
    if (amount !== null) onChange(amount);
  };

  const step = stepFor(item.target);
  const short = count !== undefined && item.target !== null ? toBuy(item.target, count) : 0;

  return (
    <div className={`stock-row${count === undefined ? "" : " counted"}`}>
      <div className="stock-row-text">
        <b>{item.name}</b>
        <small>{item.target === null ? "no target" : `target ${formatAmount(item.target, item.unit)}`}</small>
        {short > 0 && <em>buy {formatAmount(short, item.unit)}</em>}
      </div>
      <div className="stock-stepper">
        <button type="button" aria-label={`Less ${item.name}`} onClick={() => onChange(nudge(count, -step))}>
          −
        </button>
        <input
          value={text}
          onChange={(e) => type(e.target.value)}
          inputMode="decimal"
          aria-label={`How much ${item.name} is left`}
        />
        <button type="button" aria-label={`More ${item.name}`} onClick={() => onChange(nudge(count, step))}>
          +
        </button>
      </div>
    </div>
  );
};

const EditRow = ({
  item,
  onSave,
  onRemove,
}: {
  item: StockItem;
  onSave: (patch: Record<string, unknown>) => Promise<boolean>;
  onRemove: () => void;
}) => {
  const [name, setName] = useState(item.name);
  const [unit, setUnit] = useState(item.unit ?? "");
  const [target, setTarget] = useState(item.target === null ? "" : String(item.target));

  const save = async (patch: Record<string, unknown>, undo: () => void) => {
    if (!(await onSave(patch))) undo();
  };

  return (
    <div className="stock-edit-row">
      <input
        className="stock-edit-name"
        value={name}
        aria-label="Item name"
        maxLength={60}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => name.trim() !== item.name && save({ name }, () => setName(item.name))}
      />
      <input
        value={target}
        aria-label={`Target for ${item.name}`}
        placeholder="Target"
        inputMode="decimal"
        onChange={(e) => setTarget(e.target.value)}
        onBlur={() => {
          const value = target.trim() === "" ? null : parseAmount(target);
          if (value === item.target) return;
          if (target.trim() !== "" && value === null) return setTarget(item.target === null ? "" : String(item.target));
          save({ target: value }, () => setTarget(item.target === null ? "" : String(item.target)));
        }}
      />
      <input
        value={unit}
        aria-label={`Unit for ${item.name}`}
        placeholder="Unit"
        maxLength={20}
        onChange={(e) => setUnit(e.target.value)}
        onBlur={() => unit.trim().toLowerCase() !== (item.unit ?? "") && save({ unit }, () => setUnit(item.unit ?? ""))}
      />
      <button type="button" className="admin-link danger" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
};

const AddItem = ({ onAdd }: { onAdd: (values: { name: string; target: number | null; unit: string }) => Promise<boolean> }) => {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await onAdd({ name, target: target.trim() === "" ? null : parseAmount(target), unit });
    if (ok) {
      setName("");
      setTarget("");
      setUnit("");
    }
  };

  return (
    <form className="stock-edit-row stock-add" onSubmit={submit}>
      <input
        className="stock-edit-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New item"
        aria-label="New item name"
        maxLength={60}
        required
      />
      <input
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="Target"
        aria-label="New item target"
        inputMode="decimal"
      />
      <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit" aria-label="New item unit" maxLength={20} />
      <button className="admin-btn small">Add</button>
    </form>
  );
};

const ResultView = ({
  result,
  onCopy,
  onBack,
  backLabel,
}: {
  result: Result;
  onCopy: () => void;
  onBack: () => void;
  backLabel: string;
}) => {
  const { summary, text, title } = result;
  return (
    <section className="stock-result">
      <p className="stock-result-title">{title}</p>
      <h2>{summary.buyCount === 0 ? "Nothing to buy" : `${plural(summary.buyCount, "item")} to buy`}</h2>

      {summary.buy.map((group) => (
        <div key={group.section} className="stock-buy">
          <h3>{group.title}</h3>
          <ul>
            {group.lines.map((line) => (
              <li key={line.id}>
                <span>{line.name}</span>
                <b>{formatAmount(line.amount, line.unit)}</b>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {summary.needTarget.length > 0 && (
        <div className="stock-buy">
          <h3>No target set, check these yourself</h3>
          <ul>
            {summary.needTarget.map((line) => (
              <li key={line.id}>
                <span>{line.name}</span>
                <b>{formatAmount(line.onHand, line.unit)} left</b>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.okCount > 0 && <p className="stock-note">{plural(summary.okCount, "item")} had enough.</p>}

      {summary.notCounted.length > 0 && (
        <details className="stock-note">
          <summary>{plural(summary.notCounted.length, "item")} not counted</summary>
          <p>{summary.notCounted.map((i) => i.name).join(", ")}</p>
        </details>
      )}

      <div className="stock-result-actions">
        <a className="admin-btn" href={`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">
          Send to owner on WhatsApp
        </a>
        <button className="admin-btn ghost" onClick={onCopy}>
          Copy list
        </button>
        <button className="admin-btn ghost" onClick={onBack}>
          {backLabel}
        </button>
      </div>
    </section>
  );
};

export const StockApp = ({
  staffName,
  initialItems,
  initialOpen,
  initialHistory,
}: {
  staffName: string | null;
  initialItems: StockItem[];
  initialOpen: StockCheck | null;
  initialHistory: StockCheck[];
}) => {
  const [staff, setStaff] = useState(staffName);
  const [items, setItems] = useState(initialItems);
  const [open, setOpen] = useState(initialOpen);
  const [history, setHistory] = useState(initialHistory);
  const [counts, setCounts] = useState<Counts>(initialOpen?.counts ?? {});
  const [section, setSection] = useState<SectionId>("beans");
  const [view, setView] = useState<View>("count");
  const [result, setResult] = useState<Result | null>(null);
  const [fromHistory, setFromHistory] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saving = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const load = async () => {
    const res = await send("/api/stock", "GET");
    if (!res.ok) return;
    const data = (await res.json()) as { items: StockItem[]; open: StockCheck | null; history: StockCheck[] };
    setItems(data.items);
    setOpen(data.open);
    setHistory(data.history);
    setCounts(data.open?.counts ?? {});
  };

  const fail = async (res: Response) => {
    const data = await res.json().catch(() => ({}));
    setToast({ text: data.error ?? "That did not work, try again", bad: true });
    if (res.status === 401) setStaff(null);
  };

  // Saves a moment after the last tap, so a closed phone loses nothing.
  const changeCounts = (next: Counts) => {
    setCounts(next);
    setUnsaved(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saving.current = send("/api/stock/check", "PUT", { counts: next })
        .then((res) => {
          if (res.ok) setUnsaved(false);
          else return fail(res);
        })
        .catch(() => setToast({ text: "Not saved, check the internet", bad: true }));
    }, 600);
  };

  const setCount = (id: string, value: number | undefined) => {
    const next = { ...counts };
    if (value === undefined) delete next[id];
    else next[id] = value;
    changeCounts(next);
  };

  const sectionItems = useMemo(
    () => items.filter((i) => i.section === section).sort((a, b) => a.position - b.position),
    [items, section],
  );
  const countedIn = (id: SectionId) => items.filter((i) => i.section === id && counts[i.id] !== undefined).length;
  const counted = items.filter((i) => counts[i.id] !== undefined).length;

  const finish = async () => {
    const left = items.length - counted;
    if (left > 0 && !window.confirm(`${plural(left, "item")} not counted yet. Finish anyway?`)) return;
    setFinishing(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await saving.current;
    const res = await send("/api/stock/finish", "POST", { counts }).catch(() => null);
    setFinishing(false);
    if (!res) return setToast({ text: "No internet, your count is still here", bad: true });
    if (!res.ok) return fail(res);
    const data = (await res.json()) as { summary: CheckSummary; text: string };
    setResult({ ...data, title: `Today, counted by ${staff}` });
    setFromHistory(false);
    setView("result");
    setCounts({});
    setUnsaved(false);
    setOpen(null);
    window.scrollTo(0, 0);
    load();
  };

  const startOver = async () => {
    if (!window.confirm("Clear this count and start over?")) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await saving.current;
    const res = await send("/api/stock/check", "DELETE");
    if (!res.ok) return fail(res);
    setCounts({});
    setUnsaved(false);
    setOpen(null);
  };

  const showPast = (check: StockCheck) => {
    if (!check.summary || !check.shopping_text) return;
    setResult({
      summary: check.summary,
      text: check.shopping_text,
      title: `${when(check.finished_at)}, counted by ${check.finished_by}`,
    });
    setFromHistory(true);
    setView("result");
    window.scrollTo(0, 0);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ text: "List copied" });
    } catch {
      setToast({ text: "Could not copy on this phone", bad: true });
    }
  };

  const saveItem = async (id: string, patch: Record<string, unknown>) => {
    const res = await send(`/api/stock/items/${encodeURIComponent(id)}`, "PATCH", patch);
    if (!res.ok) {
      await fail(res);
      return false;
    }
    const saved = (await res.json()) as StockItem;
    setItems((rows) => rows.map((r) => (r.id === id ? saved : r)));
    setToast({ text: "Saved" });
    return true;
  };

  const removeItem = async (item: StockItem) => {
    if (!window.confirm(`Remove ${item.name} from the list?`)) return;
    const res = await send(`/api/stock/items/${encodeURIComponent(item.id)}`, "DELETE");
    if (!res.ok) return fail(res);
    setItems((rows) => rows.filter((r) => r.id !== item.id));
    if (counts[item.id] !== undefined) setCount(item.id, undefined);
  };

  const addItem = async (values: { name: string; target: number | null; unit: string }) => {
    const grp = sectionItems[sectionItems.length - 1]?.grp ?? null;
    const res = await send("/api/stock/items", "POST", { ...values, section, grp });
    if (!res.ok) {
      await fail(res);
      return false;
    }
    const saved = (await res.json()) as StockItem;
    setItems((rows) => [...rows, saved]);
    setToast({ text: `${saved.name} added` });
    return true;
  };

  if (!staff) {
    return (
      <main className="admin">
        <StaffLogin
          title="Stock check"
          button="Open stock check"
          onDone={(name) => {
            setStaff(name);
            load();
          }}
        />
        {toast && <div className={`admin-toast${toast.bad ? " bad" : ""}`}>{toast.text}</div>}
      </main>
    );
  }

  const tabs = (
    <nav className="stock-tabs" aria-label="Stock groups">
      {stockSections.map((s) => (
        <button key={s.id} className={section === s.id ? "on" : ""} onClick={() => setSection(s.id)}>
          {s.title}
          {view === "count" && (
            <small>
              {countedIn(s.id)}/{items.filter((i) => i.section === s.id).length}
            </small>
          )}
        </button>
      ))}
    </nav>
  );

  return (
    <main className="admin stock">
      <header className="admin-head">
        <div>
          <span className="admin-mark">BEAMS</span>
          <h1>Stock check</h1>
        </div>
        <div className="admin-head-actions">
          <span>{staff}</span>
          <a className="admin-btn ghost small" href="/admin">
            Menu
          </a>
          {view === "count" && (
            <button className="admin-btn ghost small" onClick={() => setView("edit")}>
              Edit list
            </button>
          )}
          {view === "edit" && (
            <button className="admin-btn small" onClick={() => setView("count")}>
              Done
            </button>
          )}
        </div>
      </header>

      {view === "result" && result && (
        <ResultView
          result={result}
          onCopy={() => copy(result.text)}
          onBack={() => setView("count")}
          backLabel={fromHistory ? "Back" : "Start new check"}
        />
      )}

      {view === "edit" && (
        <>
          <p className="stock-intro">Change a name, target or unit, then tap outside the box to save it.</p>
          {tabs}
          <div className="stock-list">
            {withGroups(sectionItems).map(({ row, heading }) => (
              <div key={row.id}>
                {heading && <h3>{heading}</h3>}
                <EditRow item={row} onSave={(patch) => saveItem(row.id, patch)} onRemove={() => removeItem(row)} />
              </div>
            ))}
          </div>
          <AddItem key={section} onAdd={addItem} />
        </>
      )}

      {view === "count" && (
        <>
          <p className="stock-intro">
            Write how much is left. Leave it empty if you did not count it, write 0 if there is none.
            {open && open.started_by !== staff && ` ${open.started_by} started this check.`}
          </p>
          {tabs}
          <div className="stock-list">
            {withGroups(sectionItems).map(({ row, heading }) => (
              <div key={row.id}>
                {heading && <h3>{heading}</h3>}
                <CountRow item={row} count={counts[row.id]} onChange={(value) => setCount(row.id, value)} />
              </div>
            ))}
          </div>

          {counted > 0 && (
            <button className="admin-link danger stock-clear" onClick={startOver}>
              Clear this count
            </button>
          )}

          {history.length > 0 && (
            <section className="stock-history">
              <h2>Past checks</h2>
              <ul>
                {history.map((check) => (
                  <li key={check.id}>
                    <button onClick={() => showPast(check)}>
                      <span>
                        {when(check.finished_at)}, {check.finished_by}
                      </span>
                      <b>{check.summary?.buyCount ?? 0} to buy</b>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="stock-bar">
            <span>
              {counted} of {items.length} counted
              {unsaved && <small>Saving...</small>}
            </span>
            <button className="admin-btn" onClick={finish} disabled={counted === 0 || finishing}>
              {finishing ? "Working..." : "Finish"}
            </button>
          </div>
        </>
      )}

      {toast && <div className={`admin-toast${toast.bad ? " bad" : ""}`}>{toast.text}</div>}
    </main>
  );
};
