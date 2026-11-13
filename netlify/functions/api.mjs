// Backend API for «اللوحة المهنية — م. أحمد زهران»
// Storage: Netlify Blobs. Admin auth: ADMIN_TOKEN environment variable, checked on the server for every write.
// Project Manager | Eng. Ahmed Zahran
import { getStore } from "@netlify/blobs";
import { timingSafeEqual, randomUUID } from "node:crypto";

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });

const store = (name) => getStore({ name, consistency: "strong" });

function isAuthed(req) {
  const expected = Netlify.env.get("ADMIN_TOKEN") || "";
  if (expected.length < 12) return false; // refuse weak/missing token configuration
  const header = req.headers.get("authorization") || "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Remove hidden sections/items/contact fields from the public payload.
function toPublic(content) {
  const c = structuredClone(content);
  c.sections = (c.sections || [])
    .filter((s) => s.visible !== false)
    .map((s) => ({ ...s, items: (s.items || []).filter((i) => i.visible !== false) }));
  if (c.contact) {
    for (const k of ["email", "whatsapp"]) {
      if (c.contact[k] && c.contact[k].visible === false) c.contact[k] = { visible: false };
    }
  }
  return c;
}

const validHttpUrl = (u) => {
  try {
    const x = new URL(u);
    return x.protocol === "https:" || x.protocol === "http:";
  } catch {
    return false;
  }
};

async function postWebhook(url, payload) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    let text = "";
    try { text = (await r.text()).slice(0, 300); } catch {}
    return { ok: r.ok, status: r.status, message: text || r.statusText };
  } catch (e) {
    return { ok: false, status: 0, message: e.name === "AbortError" ? "timeout (10s)" : String(e.message || e) };
  } finally {
    clearTimeout(timer);
  }
}

async function logMessage(entry) {
  const key = `msg/${Date.now()}-${randomUUID().slice(0, 8)}`;
  await store("messages").setJSON(key, { id: key, ...entry });
  return key;
}

async function getSettings() {
  return (await store("private").get("settings", { type: "json" })) || { webhookUrl: "", lastTest: null };
}

export default async (req, context) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
  const method = req.method;

  try {
    // ---------- health ----------
    if (path === "health") {
      const tokenConfigured = (Netlify.env.get("ADMIN_TOKEN") || "").length >= 12;
      return json({ ok: true, server: true, tokenConfigured });
    }

    // ---------- auth check ----------
    if (path === "auth" && method === "POST") {
      return isAuthed(req) ? json({ ok: true }) : json({ ok: false, error: "unauthorized" }, 401);
    }

    // ---------- content ----------
    if (path === "content" && method === "GET") {
      const full = url.searchParams.get("full") === "1";
      if (full && !isAuthed(req)) return json({ error: "unauthorized" }, 401);
      const entry = await store("content").getWithMetadata("current", { type: "json" });
      if (entry === null) return json({ content: null, updatedAt: null }); // nothing published yet: the page falls back to its built-in content
      return json({ content: full ? entry.data : toPublic(entry.data), updatedAt: entry.metadata?.updatedAt || null });
    }

    if (path === "content" && method === "PUT") {
      if (!isAuthed(req)) return json({ error: "unauthorized" }, 401);
      const body = await req.json();
      if (!body || typeof body.content !== "object" || !Array.isArray(body.content.sections)) {
        return json({ error: "invalid_content" }, 400);
      }
      const s = store("content");
      const prev = await s.getWithMetadata("current", { type: "json" });
      if (prev !== null) {
        const ts = prev.metadata?.updatedAt || new Date().toISOString();
        await s.setJSON(`versions/${ts}`, prev.data, { metadata: { updatedAt: ts } });
        // keep the 15 most recent versions
        const { blobs } = await s.list({ prefix: "versions/" });
        const keys = blobs.map((b) => b.key).sort();
        for (const k of keys.slice(0, Math.max(0, keys.length - 15))) await s.delete(k);
      }
      const updatedAt = new Date().toISOString();
      await s.setJSON("current", body.content, { metadata: { updatedAt } });
      return json({ ok: true, updatedAt });
    }

    // public list of the certificates (visible items only), optional ?tab=academic|pm|power|control and ?q=text
    if (path === "certificates" && method === "GET") {
      const entry = await store("content").get("current", { type: "json" });
      if (entry === null) return json({ count: 0, certificates: [], published: false });
      const sec = (toPublic(entry).sections || []).find((s) => s.type === "certs");
      let items = sec ? sec.items : [];
      const tab = url.searchParams.get("tab"), q = (url.searchParams.get("q") || "").trim().toLowerCase();
      if (tab) items = items.filter((i) => i.tab === tab);
      if (q) items = items.filter((i) => JSON.stringify(i).toLowerCase().includes(q));
      return json({ count: items.length, certificates: items }, 200, { "cache-control": "public, max-age=60" });
    }

    if (path === "versions" && method === "GET") {
      if (!isAuthed(req)) return json({ error: "unauthorized" }, 401);
      const { blobs } = await store("content").list({ prefix: "versions/" });
      return json({ versions: blobs.map((b) => b.key.replace("versions/", "")).sort().reverse() });
    }

    if (path.startsWith("versions/") && method === "GET") {
      if (!isAuthed(req)) return json({ error: "unauthorized" }, 401);
      const data = await store("content").get(path, { type: "json" });
      return data === null ? json({ error: "not_found" }, 404) : json({ content: data });
    }

    // ---------- private settings (webhook) ----------
    if (path === "settings" && method === "GET") {
      if (!isAuthed(req)) return json({ error: "unauthorized" }, 401);
      return json({ settings: await getSettings() });
    }

    if (path === "settings" && method === "PUT") {
      if (!isAuthed(req)) return json({ error: "unauthorized" }, 401);
      const body = await req.json();
      const webhookUrl = String(body.webhookUrl || "").trim();
      if (webhookUrl && !validHttpUrl(webhookUrl)) return json({ error: "invalid_url" }, 400);
      const current = await getSettings();
      const next = { ...current, webhookUrl, lastTest: webhookUrl === current.webhookUrl ? current.lastTest : null };
      await store("private").setJSON("settings", next);
      return json({ ok: true, settings: next });
    }

    if (path === "webhook-test" && method === "POST") {
      if (!isAuthed(req)) return json({ error: "unauthorized" }, 401);
      const settings = await getSettings();
      if (!settings.webhookUrl) return json({ ok: false, error: "not_configured" }, 400);
      const payload = {
        type: "contact_message",
        test: true,
        name: "اختبار الاتصال",
        contact: "test",
        subject: "رسالة تجريبية من لوحة الإدارة",
        message: "هذه رسالة تجريبية للتحقق من عمل الرد التلقائي.",
        submittedAt: new Date().toISOString(),
        source: context?.site?.url || url.origin,
      };
      const result = await postWebhook(settings.webhookUrl, payload);
      const lastTest = { ...result, at: payload.submittedAt };
      await store("private").setJSON("settings", { ...settings, lastTest });
      await logMessage({ ...payload, delivered: result.ok, status: result.status, response: result.message });
      return json({ ok: result.ok, lastTest });
    }

    // ---------- public contact form ----------
    if (path === "contact" && method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (body.website) return json({ ok: false, error: "rejected" }, 400); // honeypot
      const clean = (v, n) => String(v || "").trim().slice(0, n);
      const msg = {
        type: "contact_message",
        test: false,
        name: clean(body.name, 120),
        contact: clean(body.contact, 160),
        company: clean(body.company, 160),
        subject: clean(body.subject, 200),
        message: clean(body.message, 4000),
        lang: clean(body.lang, 5),
        submittedAt: new Date().toISOString(),
        source: context?.site?.url || url.origin,
      };
      if (!msg.name || !msg.contact || !msg.message) return json({ ok: false, error: "missing_fields" }, 400);
      const settings = await getSettings();
      if (!settings.webhookUrl) {
        await logMessage({ ...msg, delivered: false, status: 0, response: "webhook not configured" });
        return json({ ok: false, error: "not_configured" }, 503);
      }
      const result = await postWebhook(settings.webhookUrl, msg);
      await logMessage({ ...msg, delivered: result.ok, status: result.status, response: result.message });
      return result.ok ? json({ ok: true }) : json({ ok: false, error: "delivery_failed", status: result.status }, 502);
    }

    if (path === "messages" && method === "GET") {
      if (!isAuthed(req)) return json({ error: "unauthorized" }, 401);
      const s = store("messages");
      const { blobs } = await s.list({ prefix: "msg/" });
      const keys = blobs.map((b) => b.key).sort().reverse().slice(0, 50);
      const items = (await Promise.all(keys.map((k) => s.get(k, { type: "json" })))).filter(Boolean);
      return json({ messages: items });
    }

    if (path === "messages" && method === "DELETE") {
      if (!isAuthed(req)) return json({ error: "unauthorized" }, 401);
      const s = store("messages");
      const { blobs } = await s.list({ prefix: "msg/" });
      for (const b of blobs) await s.delete(b.key);
      return json({ ok: true });
    }

    // ---------- files (images / certificates / attachments) ----------
    if (path === "upload" && method === "POST") {
      if (!isAuthed(req)) return json({ error: "unauthorized" }, 401);
      const type = req.headers.get("content-type") || "application/octet-stream";
      const allowed = /^(image\/(png|jpeg|webp|gif|svg\+xml)|application\/pdf)$/;
      if (!allowed.test(type)) return json({ error: "unsupported_type" }, 415);
      const buf = await req.arrayBuffer();
      if (buf.byteLength > 4 * 1024 * 1024) return json({ error: "too_large" }, 413);
      const name = decodeURIComponent(req.headers.get("x-filename") || "file").replace(/[^\w.\-؀-ۿ ]/g, "_").slice(0, 80);
      const key = `${Date.now()}-${randomUUID().slice(0, 8)}`;
      await store("files").set(key, buf, { metadata: { type, name } });
      return json({ ok: true, url: `/api/file/${key}`, name });
    }

    if (path.startsWith("file/") && method === "GET") {
      const key = path.slice(5);
      const entry = await store("files").getWithMetadata(key, { type: "arrayBuffer" });
      if (entry === null) return new Response("Not found", { status: 404 });
      const type = entry.metadata?.type || "application/octet-stream";
      const headers = { "content-type": type, "cache-control": "public, max-age=31536000, immutable" };
      if (type === "image/svg+xml") headers["content-security-policy"] = "default-src 'none'; style-src 'unsafe-inline'";
      return new Response(entry.data, { headers });
    }

    // ---------- inline-preview check for platform links ----------
    if (path === "frame-check" && method === "GET") {
      const target = url.searchParams.get("url") || "";
      const entry = await store("content").get("current", { type: "json" });
      const known = new Set();
      for (const s of entry?.sections || []) for (const i of s.items || []) if (i.url) known.add(i.url);
      if (!validHttpUrl(target) || !known.has(target)) return json({ embeddable: false, reason: "unknown_url" });
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      try {
        const r = await fetch(target, { method: "GET", redirect: "follow", signal: ctrl.signal });
        const xfo = (r.headers.get("x-frame-options") || "").toLowerCase();
        const csp = (r.headers.get("content-security-policy") || "").toLowerCase();
        let embeddable = r.ok && !xfo;
        const fa = csp.match(/frame-ancestors([^;]*)/);
        if (fa && !/\*/.test(fa[1])) embeddable = false;
        return json({ embeddable }, 200, { "cache-control": "public, max-age=3600" });
      } catch {
        return json({ embeddable: false, reason: "fetch_failed" });
      } finally {
        clearTimeout(timer);
      }
    }

    return json({ error: "not_found" }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: "server_error", message: String(e.message || e) }, 500);
  }
};

export const config = { path: "/api/*" };
