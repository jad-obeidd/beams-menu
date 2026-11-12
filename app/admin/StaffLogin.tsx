"use client";

import { useEffect, useState } from "react";

// The same login for the menu dashboard and the stock check.
export const StaffLogin = ({
  title,
  button,
  onDone,
}: {
  title: string;
  button: string;
  onDone: (name: string) => void;
}) => {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setName(localStorage.getItem("beams-staff-name") ?? "");
    } catch {}
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pin }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Wrong name or PIN");
      setPin("");
      return;
    }
    try {
      localStorage.setItem("beams-staff-name", name.trim());
    } catch {}
    onDone(data.name);
  };

  return (
    <form className="admin-login" onSubmit={submit}>
      <span className="admin-mark">BEAMS</span>
      <h1>{title}</h1>
      <p>Log in with the same name and PIN you use for the coffee card.</p>
      <label>
        <span>Your name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="username" required />
      </label>
      <label>
        <span>Your PIN</span>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          required
        />
      </label>
      {error && <p className="admin-error">{error}</p>}
      <button className="admin-btn">{button}</button>
    </form>
  );
};
