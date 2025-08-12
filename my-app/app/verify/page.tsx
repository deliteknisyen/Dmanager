"use client";

import { useState } from "react";

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/product/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || "Verification failed");
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Product Verification</h1>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Enter product code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          disabled={loading || !code.trim()}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      {error && (
        <div className="border border-red-300 bg-red-50 text-red-800 rounded p-3">
          {error}
        </div>
      )}

      {result && (
        <div className="border rounded p-4 space-y-2">
          <div className="font-semibold">Verified: {String(result?.ok && result?.data?.verified)}</div>
          {result?.data?.product ? (
            <pre className="text-sm overflow-auto bg-gray-50 p-3 rounded">
{JSON.stringify(result.data.product, null, 2)}
            </pre>
          ) : null}
        </div>
      )}
    </div>
  );
}
