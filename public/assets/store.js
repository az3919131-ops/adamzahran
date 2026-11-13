// Data layer: talks to the Netlify Function API when available ("server" mode),
// otherwise falls back to LocalStorage ("local" mode — clearly labelled in the UI).
// Project Manager | Eng. Ahmed Zahran
(function () {
  const LS = {
    get(k, d = null) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };
  const SS = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch {} },
    del(k) { try { sessionStorage.removeItem(k); } catch {} },
  };

  const clone = (o) => JSON.parse(JSON.stringify(o));

  function normalize(c) {
    const seed = clone(window.SEED);
    if (!c || typeof c !== "object") return seed;
    const out = { ...seed, ...c };
    out.profile = { ...seed.profile, ...(c.profile || {}) };
    out.contact = { ...seed.contact, ...(c.contact || {}) };
    out.tags = Array.isArray(c.tags) ? c.tags : seed.tags;
    out.sections = Array.isArray(c.sections) ? c.sections : seed.sections;
    if ((out.version || 1) < 2) {
      const pl = out.sections.find((s) => s.id === "platforms");
      if (pl) {
        if (pl.title && pl.title.ar === "منصات صممتها لخدمة المجتمع") pl.title = { ar: "مواقع من تنفيذي", en: "Websites I Built" };
        pl.items = Array.isArray(pl.items) ? pl.items : [];
        for (const o of window.SEED_OFFERS()) if (!pl.items.some((i) => i.id === o.id)) pl.items.push(o);
      }
      out.version = 2;
    }
    if ((out.version || 1) < 3) {
      if (!out.profile.photo) out.profile.photo = seed.profile.photo;
      if (!out.profile.cvUrl) out.profile.cvUrl = seed.profile.cvUrl;
      out.version = 3;
    }
    if ((out.version || 1) < 4) {
      const fix = (v) => (typeof v === "string" ? v.replace("12 عامًا", "15 عامًا").replace("12+ years", "15+ years").replace("more than 12 years", "more than 15 years") : v);
      for (const k of ["experienceSummary", "bio"]) {
        const f = out.profile[k];
        if (f && typeof f === "object") out.profile[k] = { ar: fix(f.ar), en: fix(f.en) };
      }
      out.stats = clone(seed.stats);
      out.version = 4;
    }
    if ((out.version || 1) < 5) {
      const pl = out.sections.find((s) => s.id === "platforms");
      if (pl && !pl.items.some((i) => i.id === "plt-site-builder" || i.url === "https://eltezam-platform.netlify.app/")) {
        const at = pl.items.findIndex((i) => i.id === "plt-offer-choose");
        pl.items.splice(at < 0 ? pl.items.length : at, 0, window.SEED_SITE_BUILDER());
      }
      out.version = 5;
    }
    if ((out.version || 1) < 6) {
      // the website-design platform card was replaced by the real estate marketing platform
      const pl = out.sections.find((s) => s.id === "platforms");
      if (pl) {
        const old = pl.items.findIndex((i) => i.id === "plt-site-builder" || i.url === "https://eltezam-platform.netlify.app/");
        const fresh = window.SEED_SITE_BUILDER();
        if (!pl.items.some((i) => i.id === fresh.id || i.url === fresh.url)) {
          if (old >= 0) pl.items.splice(old, 1, fresh);
          else { const at = pl.items.findIndex((i) => i.id === "plt-offer-choose"); pl.items.splice(at < 0 ? pl.items.length : at, 0, fresh); }
        } else if (old >= 0) pl.items.splice(old, 1);
      }
      out.version = 6;
    }
    if ((out.version || 1) < 7) {
      const pl = out.sections.find((s) => s.id === "platforms");
      const fresh = window.SEED_PROMPT_STUDIO();
      if (pl && !pl.items.some((i) => i.id === fresh.id || i.url === fresh.url)) {
        const at = pl.items.findIndex((i) => i.id === "plt-offer-choose");
        pl.items.splice(at < 0 ? pl.items.length : at, 0, fresh);
      }
      out.version = 7;
    }
    out.stats = { ...seed.stats, ...(out.stats || {}) };
    out.sections.forEach((s) => { s.items = Array.isArray(s.items) ? s.items : []; if (s.visible === undefined) s.visible = true; });
    return out;
  }

  const Store = {
    mode: "local",
    tokenConfigured: false,

    async init() {
      try {
        const r = await fetch("/api/health", { cache: "no-store" });
        const j = r.ok ? await r.json() : null;
        if (j && j.server) { this.mode = "server"; this.tokenConfigured = !!j.tokenConfigured; }
      } catch {}
      return this.mode;
    },

    // ---------- auth ----------
    get token() { return SS.get("az_token") || ""; },
    async login(token) {
      if (this.mode !== "server") return true;
      const r = await fetch("/api/auth", { method: "POST", headers: { authorization: `Bearer ${token}` } });
      if (r.ok) { SS.set("az_token", token); return true; }
      return false;
    },
    logout() { SS.del("az_token"); },
    authHeaders(extra = {}) { return { authorization: `Bearer ${this.token}`, ...extra }; },

    // ---------- public content ----------
    async loadPublic() {
      if (this.mode === "server") {
        try {
          const r = await fetch("/api/content", { cache: "no-store" });
          if (r.ok) return normalize((await r.json()).content);
        } catch {}
        return normalize(null);
      }
      return normalize(LS.get("az_published"));
    },

    // ---------- admin content ----------
    async loadAdmin() {
      let server = null, updatedAt = null;
      if (this.mode === "server") {
        const r = await fetch("/api/content?full=1", { headers: this.authHeaders(), cache: "no-store" });
        if (r.status === 401) throw new Error("unauthorized");
        if (r.ok) { const j = await r.json(); server = j.content; updatedAt = j.updatedAt; }
      } else {
        const p = LS.get("az_published_meta");
        server = LS.get("az_published");
        updatedAt = p?.updatedAt || null;
      }
      return { content: normalize(server), updatedAt, draft: LS.get("az_draft") };
    },

    saveDraft(content, baseUpdatedAt) {
      const savedAt = new Date().toISOString();
      const ok = LS.set("az_draft", { content, savedAt, baseUpdatedAt });
      return ok ? savedAt : null;
    },
    getDraft() { return LS.get("az_draft"); },
    clearDraft() { LS.del("az_draft"); },

    async publish(content) {
      if (this.mode === "server") {
        const r = await fetch("/api/content", {
          method: "PUT", headers: this.authHeaders({ "content-type": "application/json" }), body: JSON.stringify({ content }),
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
        return (await r.json()).updatedAt;
      }
      const prev = LS.get("az_published");
      const prevMeta = LS.get("az_published_meta");
      if (prev) {
        const versions = LS.get("az_versions", []);
        versions.unshift({ at: prevMeta?.updatedAt || new Date().toISOString(), content: prev });
        LS.set("az_versions", versions.slice(0, 10));
      }
      const updatedAt = new Date().toISOString();
      if (!LS.set("az_published", content)) throw new Error("storage_full");
      LS.set("az_published_meta", { updatedAt });
      return updatedAt;
    },

    async listVersions() {
      if (this.mode === "server") {
        const r = await fetch("/api/versions", { headers: this.authHeaders() });
        return r.ok ? (await r.json()).versions : [];
      }
      return LS.get("az_versions", []).map((v) => v.at);
    },
    async getVersion(at) {
      if (this.mode === "server") {
        const r = await fetch(`/api/versions/${encodeURIComponent(at)}`, { headers: this.authHeaders() });
        return r.ok ? normalize((await r.json()).content) : null;
      }
      const v = LS.get("az_versions", []).find((x) => x.at === at);
      return v ? normalize(v.content) : null;
    },

    // ---------- private settings ----------
    async getSettings() {
      if (this.mode === "server") {
        const r = await fetch("/api/settings", { headers: this.authHeaders() });
        return r.ok ? (await r.json()).settings : { webhookUrl: "", lastTest: null };
      }
      return LS.get("az_settings", { webhookUrl: "", lastTest: null });
    },
    async saveSettings(s) {
      if (this.mode === "server") {
        const r = await fetch("/api/settings", { method: "PUT", headers: this.authHeaders({ "content-type": "application/json" }), body: JSON.stringify(s) });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
        return (await r.json()).settings;
      }
      const cur = LS.get("az_settings", { webhookUrl: "", lastTest: null });
      const next = { ...cur, webhookUrl: s.webhookUrl, lastTest: s.webhookUrl === cur.webhookUrl ? cur.lastTest : null };
      LS.set("az_settings", next);
      return next;
    },

    async directWebhook(url, payload) {
      try {
        const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
        const text = (await r.text().catch(() => "")).slice(0, 300);
        return { ok: r.ok, status: r.status, message: text || r.statusText };
      } catch (e) {
        return { ok: false, status: 0, message: String(e.message || e) };
      }
    },
    logLocal(entry) {
      const log = LS.get("az_messages", []);
      log.unshift({ id: AZ.uid("msg"), ...entry });
      LS.set("az_messages", log.slice(0, 50));
    },

    async testWebhook() {
      if (this.mode === "server") {
        const r = await fetch("/api/webhook-test", { method: "POST", headers: this.authHeaders() });
        const j = await r.json().catch(() => ({}));
        if (j.error === "not_configured") return { ok: false, notConfigured: true };
        return { ok: !!j.ok, lastTest: j.lastTest };
      }
      const s = LS.get("az_settings", { webhookUrl: "" });
      if (!s.webhookUrl) return { ok: false, notConfigured: true };
      const payload = { type: "contact_message", test: true, name: "اختبار الاتصال", contact: "test", subject: "رسالة تجريبية من لوحة الإدارة",
        message: "هذه رسالة تجريبية للتحقق من عمل الرد التلقائي.", submittedAt: new Date().toISOString(), source: location.origin };
      const res = await this.directWebhook(s.webhookUrl, payload);
      const lastTest = { ...res, at: payload.submittedAt };
      LS.set("az_settings", { ...s, lastTest });
      this.logLocal({ ...payload, delivered: res.ok, status: res.status, response: res.message });
      return { ok: res.ok, lastTest };
    },

    async sendContact(msg) {
      if (this.mode === "server") {
        try {
          const r = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(msg) });
          const j = await r.json().catch(() => ({}));
          return { ok: r.ok && j.ok === true };
        } catch { return { ok: false }; }
      }
      const s = LS.get("az_settings", { webhookUrl: "" });
      const payload = { type: "contact_message", test: false, ...msg, submittedAt: new Date().toISOString(), source: location.origin };
      delete payload.website;
      if (!s.webhookUrl) { this.logLocal({ ...payload, delivered: false, status: 0, response: "webhook not configured" }); return { ok: false }; }
      const res = await this.directWebhook(s.webhookUrl, payload);
      this.logLocal({ ...payload, delivered: res.ok, status: res.status, response: res.message });
      return { ok: res.ok };
    },

    async listMessages() {
      if (this.mode === "server") {
        const r = await fetch("/api/messages", { headers: this.authHeaders() });
        return r.ok ? (await r.json()).messages : [];
      }
      return LS.get("az_messages", []);
    },
    async clearMessages() {
      if (this.mode === "server") await fetch("/api/messages", { method: "DELETE", headers: this.authHeaders() });
      else LS.del("az_messages");
    },

    // ---------- files ----------
    async upload(file) {
      const okType = /^(image\/(png|jpeg|webp|gif|svg\+xml)|application\/pdf)$/.test(file.type);
      if (!okType) throw new Error("نوع الملف غير مدعوم (صور أو PDF فقط)");
      if (this.mode === "server") {
        if (file.size > 4 * 1024 * 1024) throw new Error("الحد الأقصى لحجم الملف 4 ميجابايت");
        const r = await fetch("/api/upload", {
          method: "POST", headers: this.authHeaders({ "content-type": file.type, "x-filename": encodeURIComponent(file.name) }), body: file,
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
        const j = await r.json();
        return { url: j.url, name: file.name };
      }
      if (file.type === "image/svg+xml") throw new Error("ملفات SVG غير مدعومة في وضع الحفظ المحلي");
      if (file.size > 700 * 1024) throw new Error("في وضع الحفظ المحلي الحد الأقصى 700 كيلوبايت — استخدم رابطًا خارجيًا للملفات الأكبر");
      const url = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
      return { url, name: file.name };
    },

    normalize,
    clone,
    LS,
  };

  window.Store = Store;
})();
