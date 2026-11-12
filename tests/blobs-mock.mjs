// In-memory stand-in for @netlify/blobs used only by the local test server.
const stores = globalThis.__blobStores || (globalThis.__blobStores = new Map());
export function getStore(opts) {
  const name = typeof opts === "string" ? opts : opts.name;
  if (!stores.has(name)) stores.set(name, new Map());
  const m = stores.get(name);
  const conv = (v, type) => {
    if (v == null) return null;
    if (type === "json") return JSON.parse(typeof v === "string" ? v : Buffer.from(v).toString());
    if (type === "arrayBuffer") return v;
    return typeof v === "string" ? v : Buffer.from(v).toString();
  };
  return {
    async get(k, o = {}) { const e = m.get(k); return e ? conv(e.data, o.type) : null; },
    async getWithMetadata(k, o = {}) { const e = m.get(k); return e ? { data: conv(e.data, o.type), metadata: e.metadata || {}, etag: "x" } : null; },
    async set(k, data, o = {}) { m.set(k, { data, metadata: o.metadata }); return { modified: true }; },
    async setJSON(k, data, o = {}) { m.set(k, { data: JSON.stringify(data), metadata: o.metadata }); return { modified: true }; },
    async delete(k) { m.delete(k); },
    async list(o = {}) { return { blobs: [...m.keys()].filter((k) => !o.prefix || k.startsWith(o.prefix)).map((key) => ({ key, etag: "x" })) }; },
  };
}
