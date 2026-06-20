"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Mode = "signin" | "signup";

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
    setMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.session) {
        // Email confirmation is disabled in Supabase — user is signed in immediately.
        // onAuthStateChange will fire and redirect automatically; nothing to do here.
      } else {
        setMessage("Account created! Check your email for a confirmation link, then sign in.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Supabase returns "Invalid login credentials" for both wrong password
        // and unconfirmed email — surface a friendlier message.
        if (error.message.toLowerCase().includes("invalid login")) {
          setError("Incorrect email or password. If you just signed up, confirm your email first.");
        } else {
          setError(error.message);
        }
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 w-full max-w-sm p-6">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">✨</div>
          <h1 className="font-bold text-gray-900 text-xl tracking-tight">DeedTracker</h1>
          <p className="text-sm text-gray-500 mt-1">Build streaks. Track progress.</p>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
                mode === m ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {m === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder="••••••••"
              minLength={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
            {mode === "signup" && (
              <p className="text-[11px] text-gray-400 mt-1">Minimum 6 characters</p>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          {message && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
