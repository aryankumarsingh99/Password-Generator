"use client";
import React, { useMemo, useState } from "react";

export default function AuthForm({ onAuth }: { onAuth?: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0..4
  }, [password]);

  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = [
    "bg-rose-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-emerald-400",
    "bg-emerald-600",
  ][strength];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!emailValid) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    setLoading(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (res.ok && json.token) {
        localStorage.setItem("pv_token", json.token);
        onAuth?.(json.token);
      } else if (res.ok && json.ok) {
        // registration succeeded, prompt login
        setMode("login");
        setError(null);
        alert("Registered successfully. Please log in.");
      } else {
        setError(json.error || "Authentication failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Welcome</h2>
          <p className="text-sm text-slate-400">Sign in or create an account — your data stays encrypted.</p>
        </div>
        <div className="text-xs text-slate-400">{mode === "login" ? "Sign in" : "Register"}</div>
      </div>

      <form onSubmit={submit} className="space-y-3 w-full" noValidate>
        <label className="block w-full">
          <span className="text-sm text-slate-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border ${email && !emailValid ? "border-rose-500" : "border-slate-700"} text-slate-50 focus:outline-none`}
            placeholder="you@example.com"
            required
            aria-invalid={!emailValid && !!email}
          />
        </label>

        <label className="block w-full">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-slate-300">Password</span>
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="mt-1 relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-50 focus:outline-none"
              placeholder="Choose a strong password"
              required
              aria-describedby="pw-strength"
            />
          </div>

          <div id="pw-strength" className="mt-2 flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-700 rounded overflow-hidden">
              <div className={`h-full ${strengthColor}`} style={{ width: `${(strength / 4) * 100}%` }} />
            </div>
            <div className="text-xs text-slate-400 w-24 text-right">{strengthLabel}</div>
          </div>
        </label>

        {error && <div className="text-sm text-rose-400">{error}</div>}

        <div className="flex flex-col sm:flex-row gap-2 items-center w-full">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="3" strokeOpacity="0.25" />
                <path d="M22 12a10 10 0 00-10-10" strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : null}
            <span>{mode === "login" ? "Login" : "Register"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "login" ? "register" : "login"));
              setError(null);
            }}
            className="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-700 text-slate-200 text-sm"
          >
            {mode === "login" ? "Create account" : "Have an account?"}
          </button>
        </div>
      </form>
    </div>
  );
}