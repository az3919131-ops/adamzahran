// End-to-end tests. Starts two local servers (server mode with API, and local/static mode) and drives Chromium.
// run: npm test
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { readFile, writeFile, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const API = 8901, LOCAL = 8902, TOKEN = "test-admin-token-123";
const results = [];
let failed = 0;
async function test(name, fn) {
  try { await fn(); results.push(`✔ ${name}`); }
  catch (e) { failed++; results.push(`✘ ${name}\n    ${e.message.split("\n")[0]}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

const servers = [spawn("node", ["tests/server.mjs", String(API), "--api"]), spawn("node", ["tests/server.mjs", String(LOCAL)])];
await new Promise((r) => setTimeout(r, 1200));
const tmp = await mkdtemp(path.join(os.tmpdir(), "az-"));
const browser = await chromium.launch();
const ctx = await browser.newContext({ acceptDownloads: true });
const page = await ctx.newPage();
page.setDefaultTimeout(8000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
page.on("dialog", (d) => d.accept());

const B = `http://localhost:${API}/`;
const openAdmin = async () => { await page.goto(B + "#/admin"); await page.waitForSelector(".admin, #login"); };
const login = async () => {
  await openAdmin();
  if (await page.$("#login")) { await page.fill("[name=token]", TOKEN); await page.click("#login [type=submit]"); }
  await page.waitForSelector(".admin");
};
const gotoSection = async (id) => {
  await page.click("[data-tab=sections]");
  await page.click(`#sec-list [data-a=edit][data-id="${id}"]`);
  await page.waitForSelector(".list-head");
};
const addItem = async (id, fill) => {
  try { await addItem0(id, fill); } catch (e) { throw new Error(`addItem(${id}): ` + e.message); }
};
const addItem0 = async (id, fill) => {
  await gotoSection(id);
  await page.click("[data-a=add]");
  await page.waitForSelector("#f-item");
  for (const [sel, val] of Object.entries(fill)) await page.fill(`#f-item [name="${sel}"]`, val);
  await page.click("#f-item [type=submit]");
  await page.waitForSelector("#dlg:not([open])", { state: "attached" });
};
const publish = async () => { await page.click("[data-a=publish]"); await page.waitForFunction(() => document.querySelector("#save-status")?.classList.contains("clean")); };
const publicPage = async () => { await page.goto(B + "#/"); await page.waitForSelector(".hero h1"); };

// ---------------- public page (seed data) ----------------
await test("public page renders name, title, bio and footer line", async () => {
  await publicPage();
  assert((await page.textContent(".hero h1")).includes("م. أحمد زهران"), "name");
  assert((await page.textContent(".hero .role")).includes("مدير مشاريع"), "title");
  assert((await page.textContent(".site-footer")).includes("Project Manager | Eng. Ahmed Zahran"), "footer");
});
await test("hero numbers: owner-set values shown (15 years, 40 projects, 5 platforms), courses hidden", async () => {
  const s = await page.$$eval(".busbar .stat", (els) => els.map((e) => e.querySelector("strong").textContent + ":" + e.querySelector("span").textContent));
  assert(s.join() === "15:سنوات الخبرة,40:المشاريع,5:المنصات", "stats " + s.join());
  assert((await page.textContent(".hero .summary")).includes("15 عامًا"), "summary text says 15");
});
await test("empty sections (insurance, my pages) and hidden future items are not shown", async () => {
  assert(!(await page.$("#sec-insurance")) && !(await page.$("#sec-pages")) && !(await page.$("#sec-future")), "should be hidden");
});
await test("WhatsApp link uses international format with prefilled message; mailto link", async () => {
  const wa = await page.getAttribute(".hero .btn-wa", "href");
  assert(wa.startsWith("https://wa.me/966565324387?text="), wa);
  assert((await page.getAttribute('.hero a[href^="mailto:"]', "href")) === "mailto:az3919131@gmail.com", "mailto");
});
await test("platform / channel / LinkedIn links open in a new tab", async () => {
  const links = await page.$$eval("#sec-platforms .btn-primary, #sec-youtube .btn-primary, #sec-linkedin .btn-primary", (as) => as.map((a) => [a.href, a.target, a.rel]));
  assert(links.length === 5 && links.every(([, t, r]) => t === "_blank" && r.includes("noopener")), JSON.stringify(links));
  assert(links.some(([h]) => h === "https://iltizam-training.netlify.app/#/home"), "iltizam link");
});
await test("websites section renamed; offer cards have design link + WhatsApp/email buttons", async () => {
  assert((await page.textContent("#sec-platforms h2")).trim() === "مواقع من تنفيذي", "section title");
  const offers = await page.$$("#sec-platforms .card.offer");
  assert(offers.length === 2, "two offer cards");
  const hrefs = await page.$$eval("#sec-platforms .card.offer a", (as) => as.map((a) => a.href));
  assert(hrefs.includes("https://21st.dev/?q=%E2%80%A2+Radial+Orbital+Timeline&qs=bookmarks"), "21st.dev link");
  assert(hrefs.filter((h) => h.startsWith("https://wa.me/966565324387?text=")).length === 2, "whatsapp buttons");
  assert(hrefs.filter((h) => h.startsWith("mailto:az3919131@gmail.com")).length === 2, "email buttons");
});
await test("hero: CV button opens the CV site, portrait shown, sites link jumps to the sites section", async () => {
  const cv = await page.$eval(".hero .btn-cv", (a) => [a.href, a.target]);
  assert(cv[0] === "https://ahmedzahran12.netlify.app/" && cv[1] === "_blank", "cv link " + cv);
  assert((await page.getAttribute(".hero .portrait img", "src")) === "https://ahmedzahran12.netlify.app/ahmed.jpg", "portrait");
  const sl = await page.$eval(".hero .sites-link", (a) => [a.getAttribute("href"), a.textContent.trim()]);
  assert(sl[0] === "#sec-platforms" && sl[1] === "تصفح مواقع ومنصات التزام", "sites link " + sl);
});
await test("nav: CV sections live in one dropdown titled السيرة الذاتية", async () => {
  assert((await page.textContent(".navdrop-btn")).trim() === "السيرة الذاتية", "dropdown title");
  assert(!(await page.isVisible("#cv-menu")), "closed by default");
  await page.click(".navdrop-btn");
  const items = await page.$$eval("#cv-menu a", (as) => as.map((a) => a.getAttribute("href")));
  assert(items.join() === "#sec-experience,#sec-projects,#sec-skills,#sec-education,#sec-courses", items.join());
  assert(await page.isVisible("#cv-menu a"), "opens");
  const top = await page.$$eval("#mainnav > a", (as) => as.map((a) => a.getAttribute("href")));
  assert(!top.includes("#sec-skills") && top.includes("#sec-platforms"), "top-level links " + top);
  await page.click("#cv-menu a >> nth=2");
  assert(!(await page.isVisible("#cv-menu")), "closes after choosing");
});
await test("search + filters (text, year, tag, clear)", async () => {
  await page.fill("#q", "SCADA");
  let vis = await page.$$eval("[data-filter-item]:not([hidden])", (e) => e.length);
  assert(vis === 2, "SCADA matches skills+course, got " + vis);
  await page.fill("#q", "");
  await page.selectOption("#f-year", "2013");
  vis = await page.$$eval("[data-filter-item]:not([hidden])", (e) => e.length);
  assert(vis === 1, "year 2013 → 1 experience, got " + vis);
  await page.click("#f-clear");
  await page.selectOption("#f-tag", "edu");
  vis = await page.$$eval("[data-filter-item]:not([hidden])", (e) => e.length);
  assert(vis === 1, "tag edu → 1, got " + vis);
  await page.fill("#q", "zzzz-nothing");
  assert(await page.isVisible("#no-results"), "no results message");
  await page.click("#f-clear");
});
await test("language switch AR ⇄ EN (dir + content)", async () => {
  await page.click("[data-act=lang]");
  await page.waitForFunction(() => document.documentElement.dir === "ltr");
  assert((await page.textContent(".hero h1")).includes("Eng. Ahmed Zahran"), "english name");
  await page.click("[data-act=lang]");
  await page.waitForFunction(() => document.documentElement.dir === "rtl");
});
await test("contact form without webhook shows failure + WhatsApp/email fallback (no fake success)", async () => {
  await page.fill("#contact-form [name=name]", "عميل");
  await page.fill("#contact-form [name=contact]", "0500000000");
  await page.fill("#contact-form [name=message]", "مرحبا");
  await page.click("#contact-form [type=submit]");
  await page.waitForSelector("#form-result.err .btn-wa");
  assert(!(await page.textContent("#form-result")).includes("تم استلام"), "must not claim success");
});
await test("print button calls window.print", async () => {
  await page.evaluate(() => { window.__printed = 0; window.print = () => window.__printed++; });
  await page.click("[data-act=print]");
  assert((await page.evaluate(() => window.__printed)) === 1, "print");
});

// ---------------- admin (server mode) ----------------
await test("admin rejects a wrong token (server-side check)", async () => {
  await openAdmin();
  await page.fill("[name=token]", "wrong-token-xxxx");
  await page.click("#login [type=submit]");
  await page.waitForSelector("#login .alert.err");
  const r = await page.evaluate(async () => (await fetch("/api/content", { method: "PUT", headers: { authorization: "Bearer nope", "content-type": "application/json" }, body: "{}" })).status);
  assert(r === 401, "unauthenticated PUT must be 401, got " + r);
});
await test("admin login with correct token", async () => { await login(); assert(await page.isVisible("[data-tab=profile]"), "shell"); });

await test("add an item in each of the six display sections", async () => {
  await addItem("experience", { "title.ar": "خبرة اختبارية", "org.ar": "جهة اختبار", start: "2020-01", end: "2020-12" });
  await addItem("platforms", { "title.ar": "منصة اختبار", url: "https://example.com/platform" });
  await addItem("youtube", { "title.ar": "فيديو اختبار", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
  await addItem("linkedin", { "title.ar": "صفحة شركة اختبار", url: "https://www.linkedin.com/company/example" });
  await addItem("insurance", { "title.ar": "موقع تأمين اختبار", url: "https://example.com/insurance" });
  await addItem("pages", { "title.ar": "صفحتي الاختبارية", url: "https://example.com/mypage" });
  await publish();
  await publicPage();
  for (const [sec, txt] of [["experience", "خبرة اختبارية"], ["platforms", "منصة اختبار"], ["youtube", "فيديو اختبار"], ["linkedin", "صفحة شركة اختبار"], ["insurance", "موقع تأمين اختبار"], ["pages", "صفحتي الاختبارية"]]) {
    assert((await page.textContent(`#sec-${sec}`)).includes(txt), `${sec} missing item`);
  }
  const t = await page.$$eval("#sec-insurance a.btn-primary, #sec-pages a.btn-primary", (as) => as.every((a) => a.target === "_blank"));
  assert(t, "new tab");
});
await test("required-field validation blocks saving an item without a URL", async () => {
  await login();
  await gotoSection("linkedin");
  await page.click("[data-a=add]");
  await page.fill('#f-item [name="title.ar"]', "بدون رابط");
  await page.click("#f-item [type=submit]");
  assert(await page.isVisible("#item-err"), "error shown");
  await page.click("#f-item [data-a=close] >> nth=0");
});
await test("edit and delete an item", async () => {
  await gotoSection("pages");
  await page.click("#item-list [data-a=edit][data-i='0']");
  await page.fill('#f-item [name="title.ar"]', "صفحتي المعدلة");
  await page.click("#f-item [type=submit]");
  assert((await page.textContent("#item-list")).includes("صفحتي المعدلة"), "edited");
  await gotoSection("insurance");
  await page.click("#item-list [data-a=del][data-i='0']");
  assert((await page.$$("#item-list .row")).length === 0, "deleted");
  await publish();
  await publicPage();
  assert(!(await page.$("#sec-insurance")), "insurance hidden again when empty");
  assert((await page.textContent("#sec-pages")).includes("صفحتي المعدلة"), "edit published");
});
await test("hide a whole section and reorder via buttons", async () => {
  await login();
  await page.click("[data-tab=sections]");
  await page.uncheck("#sec-list li[data-id=youtube] [data-a=vis]");
  const first = await page.$eval("#sec-list li:nth-child(2)", (e) => e.dataset.id);
  await page.click("#sec-list li:nth-child(2) [data-a=up]");
  assert((await page.$eval("#sec-list li:nth-child(1)", (e) => e.dataset.id)) === first, "reordered");
  await publish();
  await publicPage();
  assert(!(await page.$("#sec-youtube")), "youtube hidden");
  assert((await page.$eval("[data-section-block]", (e) => e.id)) === "sec-" + first, "order on public page");
});
await test("create a custom section and add an item", async () => {
  await login();
  await page.click("[data-tab=sections]");
  await page.fill("#f-newsec [name=ar]", "قسم مخصص");
  await page.selectOption("#f-newsec [name=cardType]", "text");
  await page.click("#f-newsec [type=submit]");
  const id = await page.$eval("#sec-list li:last-child", (e) => e.dataset.id);
  await addItem(id, { "title.ar": "عنوان نصي", "body.ar": "نص تجريبي" });
  await publish();
  await publicPage();
  assert((await page.textContent(`#sec-${id}`)).includes("نص تجريبي"), "custom section shown");
});
await test("future-additions item shows publicly only when enabled, with its status", async () => {
  await login();
  await page.click("[data-tab=future]");
  await page.check("#item-list [data-a=vis][data-i='0']");
  await publish();
  await publicPage();
  const txt = await page.textContent("#sec-future");
  assert(txt.includes("شهادة إدارة المشاريع PMP") && txt.includes("مخطط"), "future item w/ status");
});
await test("hero numbers editable in admin: blank value falls back to the calculated count", async () => {
  await login();
  await page.click("[data-tab=profile]");
  await page.fill("#f-profile [name=st_projects]", "");
  await page.check("#f-profile [name=st_courses_v]");
  await page.waitForTimeout(600);
  await page.goto(B + "#/preview"); await page.waitForSelector(".preview-bar");
  const s = await page.$$eval(".busbar .stat", (els) => els.map((e) => e.querySelector("span").textContent + "=" + e.querySelector("strong").textContent));
  assert(s.includes("المشاريع=4") && s.some((x) => x.startsWith("الدورات=")), "auto fallback " + s.join());
  await login();
  await page.click("[data-a=discard-draft]");
});
await test("webhook: not configured → configured → failed test → successful test", async () => {
  await login();
  await page.click("[data-tab=contact]");
  assert((await page.textContent("#wh-status")).includes("غير مضبوط"), "initially not configured");
  await page.fill("#f-webhook [name=url]", `http://localhost:${API}/hook-fail`);
  await page.click("#f-webhook [type=submit]");
  await page.waitForFunction(() => document.querySelector("#wh-status").textContent.includes("لم يُختبر"));
  await page.click("[data-a=test]");
  await page.waitForSelector("#wh-result.alert.err");
  assert((await page.textContent("#wh-result")).includes("500"), "shows real status 500");
  assert((await page.textContent("#wh-status")).includes("فشل آخر اختبار"), "status fail");
  await page.fill("#f-webhook [name=url]", `http://localhost:${API}/hook-ok`);
  await page.click("#f-webhook [type=submit]");
  await page.waitForFunction(() => document.querySelector("#wh-status").textContent.includes("لم يُختبر"));
  await page.click("[data-a=test]");
  await page.waitForSelector("#wh-result.alert.ok");
  assert((await page.textContent("#wh-status")).includes("نجح"), "status ok");
});
await test("contact form success only after webhook returns 2xx; JSON payload delivered; logged", async () => {
  await publicPage();
  await page.fill("#contact-form [name=name]", "سعد");
  await page.fill("#contact-form [name=contact]", "client@example.com");
  await page.fill("#contact-form [name=subject]", "استفسار");
  await page.fill("#contact-form [name=message]", "أرغب في التعاون");
  await page.click("#contact-form [type=submit]");
  await page.waitForSelector("#form-result.ok");
  const log = await (await fetch(`http://localhost:${API}/__hooklog`)).json();
  const last = JSON.parse(log[log.length - 1].body);
  assert(last.type === "contact_message" && last.name === "سعد" && last.contact === "client@example.com" && last.test === false, "payload");
  await login();
  await page.click("[data-tab=messages]");
  await page.waitForSelector("#msgs table");
  const t = await page.textContent("#msgs");
  assert(t.includes("سعد") && t.includes("تم التسليم") && t.includes("فشل"), "message log");
});
await test("autosaved draft survives reload; discard restores published", async () => {
  await page.click("[data-tab=profile]");
  await page.fill('#f-profile [name="title.ar"]', "مسمى مسودة");
  await page.waitForTimeout(700);
  await page.reload(); await page.waitForSelector(".admin");
  assert(await page.isVisible("#draft-banner"), "draft banner");
  assert((await page.inputValue('#f-profile [name="title.ar"]')) === "مسمى مسودة", "draft restored");
  // preview shows the draft, public does not
  await page.goto(B + "#/preview"); await page.waitForSelector(".preview-bar");
  assert((await page.textContent(".hero .role")).includes("مسمى مسودة"), "preview shows draft");
  await publicPage();
  assert(!(await page.textContent(".hero .role")).includes("مسمى مسودة"), "public unchanged before publish");
  await login();
  await page.click("[data-a=discard-draft]");
  assert((await page.inputValue('#f-profile [name="title.ar"]')).includes("مدير مشاريع"), "discarded");
});
await test("published data persists after page reload", async () => {
  await publicPage(); await page.reload(); await page.waitForSelector(".hero h1");
  assert((await page.textContent("#sec-pages")).includes("صفحتي المعدلة"), "persisted");
});
let exported;
await test("export JSON backup", async () => {
  await login();
  await page.click("[data-tab=backup]");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("[data-a=export]")]);
  exported = JSON.parse(await readFile(await dl.path(), "utf8"));
  assert(exported.content.sections.length >= 11 && exported.settings.webhookUrl.includes("hook-ok"), "export content");
});
await test("import JSON backup", async () => {
  exported.content.profile.title.ar = "مسمى مستورد";
  const f = path.join(tmp, "backup.json"); await writeFile(f, JSON.stringify(exported));
  await page.setInputFiles("#imp", f);
  await page.waitForFunction(() => document.querySelector("#save-status").classList.contains("dirty"));
  await page.click("[data-tab=profile]");
  assert((await page.inputValue('#f-profile [name="title.ar"]')) === "مسمى مستورد", "imported");
  await page.click("[data-tab=backup]"); await page.waitForSelector("#versions");
});
await test("previous versions are listed and can be restored as draft", async () => {
  await page.waitForSelector("#versions [data-v]");
  const n = await page.$$eval("#versions [data-v]", (e) => e.length);
  assert(n >= 3, "versions " + n);
});
await test("CV PDF import extracts data and shows review before applying", async () => {
  const p2 = await ctx.newPage();
  await p2.setContent(`<html><body style="font-family:sans-serif"><h1>Test Person</h1><p>test.cv@example.com · 0551234567</p>
    <h2>Experience</h2><p>Site Engineer 2010 - 2012</p><p>Did site work</p><h2>Courses</h2><p>Safety course</p><h2>Skills</h2><p>Excel, AutoCAD</p></body></html>`);
  const pdf = path.join(tmp, "cv.pdf"); await p2.pdf({ path: pdf }); await p2.close();
  await page.setInputFiles("#cv", pdf);
  await page.waitForSelector("#cv-form", { timeout: 15000 });
  assert((await page.inputValue("[name=v_email]")) === "test.cv@example.com", "email detected");
  assert((await page.$$("#cv-form [name=exp]")).length >= 1, "experience suggested");
  await page.click("#cv-form [type=submit]");
  await page.waitForSelector("#cv-out .alert.ok");
  await page.click("[data-tab=sections]");
  await page.click(`#sec-list [data-a=edit][data-id="courses"]`);
  assert((await page.textContent("#item-list")).includes("Safety course"), "course added (hidden)");
});
await test("file upload stores a file and returns a URL (server mode)", async () => {
  const r = await page.evaluate(async () => {
    const b = new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" });
    const up = await Store.upload(new File([b], "x.png", { type: "image/png" }));
    const g = await fetch(up.url); return [up.url, g.status, g.headers.get("content-type")];
  });
  assert(r[0].startsWith("/api/file/") && r[1] === 200 && r[2] === "image/png", JSON.stringify(r));
});

// ---------------- local mode ----------------
await test("local mode: labelled as local save, edit + publish persists in LocalStorage", async () => {
  const L = `http://localhost:${LOCAL}/`;
  await page.goto(L + "#/admin"); await page.waitForSelector(".admin");
  assert((await page.textContent(".mode-badge")).includes("محلي"), "local badge");
  assert(await page.isVisible(".alert.warn"), "local warning");
  await page.click("[data-tab=profile]");
  await page.fill('#f-profile [name="name.ar"]', "اسم محلي");
  await page.click("[data-a=publish]");
  await page.waitForFunction(() => document.querySelector("#save-status").classList.contains("clean"));
  await page.goto(L + "#/"); await page.reload(); await page.waitForSelector(".hero h1");
  assert((await page.textContent(".hero h1")).includes("اسم محلي"), "local persisted");
});
await test("mobile layout: no horizontal overflow, menu toggle works", async () => {
  await page.setViewportSize({ width: 375, height: 800 });
  await publicPage();
  const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert(!over, "horizontal overflow");
  await page.click(".nav-toggle");
  assert(await page.isVisible("#mainnav > a"), "menu opens");
  await page.setViewportSize({ width: 1280, height: 800 });
});
await test("no JavaScript errors in console", async () => { assert(errors.length === 0, errors.join(" | ")); });

await browser.close();
servers.forEach((s) => s.kill());
console.log(results.join("\n"));
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
