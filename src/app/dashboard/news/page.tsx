"use client";
import { useEffect, useState } from "react";

export default function DashboardNewsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/news");
    setItems(res.ok ? await res.json() : []);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { setError((await res.json()).error); return; }
    setForm({ title: "", content: "" });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Tin tức</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <form onSubmit={create} className="card h-fit space-y-3 p-4">
          <div className="font-display text-base font-semibold">+ Viết bài mới</div>
          {error && <div className="rounded bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}
          <input className="input" placeholder="Tiêu đề" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="input" placeholder="Nội dung" rows={6} required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <button className="btn-primary w-full">Đăng bài</button>
        </form>
        <div className="space-y-2">
          {items.map((n) => (
            <div key={n.id} className="card p-3 text-sm">{n.title}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
