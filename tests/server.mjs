// Local test server: static files from public/ + (optionally) the real API function with mocked Blobs.
// usage: node tests/server.mjs <port> [--api]
import { register } from "node:module";
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
register("./loader.mjs", import.meta.url);

const port = +process.argv[2] || 8888;
const withApi = process.argv.includes("--api");
globalThis.Netlify = { env: { get: (k) => (k === "ADMIN_TOKEN" ? "test-admin-token-123" : undefined) } };
const api = withApi ? (await import("../netlify/functions/api.mjs")).default : null;
const root = path.resolve(new URL("../public", import.meta.url).pathname);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".json": "application/json" };
export const hookLog = [];
const formLog = [];
let formsOn = false;

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  if (url.pathname.startsWith("/hook-")) { // fake automation webhooks
    let body = ""; for await (const c of req) body += c;
    hookLog.push({ path: url.pathname, body });
    const code = url.pathname === "/hook-ok" ? 200 : 500;
    res.writeHead(code, { "content-type": "text/plain", "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" });
    return res.end(req.method === "OPTIONS" ? "" : code === 200 ? "received" : "boom");
  }
  // stand-in for Netlify Forms: POST / with form-name=contact is accepted only while switched on
  if (url.pathname === "/__forms/on" || url.pathname === "/__forms/off") { formsOn = url.pathname.endsWith("on"); res.writeHead(200); return res.end("ok"); }
  if (url.pathname === "/__forms/log") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify(formLog)); }
  if (req.method === "POST" && url.pathname === "/") {
    let body = ""; for await (const c of req) body += c;
    if (formsOn && /form-name=contact/.test(body)) { formLog.push(Object.fromEntries(new URLSearchParams(body))); res.writeHead(200); return res.end("ok"); }
    res.writeHead(404); return res.end("not found");
  }
  if (url.pathname === "/__hooklog") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify(hookLog)); }
  if (url.pathname.startsWith("/api/")) {
    if (!api) { res.writeHead(404); return res.end("no api"); }
    const chunks = []; for await (const c of req) chunks.push(c);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const r = new Request(url, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : body });
    const out = await api(r, { site: { url: `http://localhost:${port}` } });
    res.writeHead(out.status, Object.fromEntries(out.headers));
    return res.end(Buffer.from(await out.arrayBuffer()));
  }
  let p = path.join(root, decodeURIComponent(url.pathname));
  if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (url.pathname.endsWith("/")) p = path.join(p, "index.html");
  try { const d = await readFile(p); res.writeHead(200, { "content-type": types[path.extname(p)] || "application/octet-stream" }); res.end(d); }
  catch { res.writeHead(404); res.end("not found"); }
}).listen(port, () => console.log(`listening ${port} api=${withApi}`));
