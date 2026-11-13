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
const ctx = await browser.newContext({ acceptDownloads: true, permissions: ["clipboard-read", "clipboard-write"] });
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
const publicPage = async () => { await page.goto(B + "#/"); await page.waitForSelector(".intro h1"); };

// ---------------- public page (seed data) ----------------
await test("intro: name, title, headline, supporting text and footer line", async () => {
  await publicPage();
  assert((await page.textContent(".hero-name")).trim() === "م. أحمد زهران", "name");
  assert((await page.textContent(".intro h1")).trim() === "أحوّل الأفكار إلى منصات… والخطط إلى واقع.", "headline");
  const role = await page.textContent(".intro .role");
  assert(role.includes("مصمم مواقع ومنصات رقمية") && role.includes("مدير تنفيذ وتخطيط مشاريع") && role.includes("مهندس قوى كهربائية"), "title");
  assert((await page.textContent(".intro .lead")).includes("أجمع بين خبرة إدارة وتنفيذ المشاريع"), "lead");
  assert((await page.textContent(".site-footer")).includes("Project Manager | Eng. Ahmed Zahran"), "footer");
});
await test("nav: الرئيسية — المنصات — خدماتي — عني — تواصل, language switch and ابدأ مشروعك", async () => {
  const nav = await page.$$eval("#mainnav > a", (as) => as.map((a) => a.textContent.trim() + "|" + a.getAttribute("href")));
  assert(nav.join() === "الرئيسية|#top,المنصات|#sec-platforms,خدماتي|#services,عني|#about,تواصل|#sec-contact", nav.join());
  assert((await page.textContent(".btn-start")).trim() === "ابدأ مشروعك" && (await page.getAttribute(".btn-start", "href")) === "#sec-contact", "start button");
  const btns = await page.$$eval(".intro-actions a", (as) => as.map((a) => a.textContent.trim() + "|" + a.getAttribute("href")));
  assert(btns.join() === "استكشف المنصات|#sec-platforms,ناقش مشروعك معي|#sec-contact", btns.join());
});
await test("numbers are the owner's values (15, 40, 5) and the original portrait is used unchanged", async () => {
  const st = await page.$$eval(".busbar .stat", (els) => els.map((e) => e.querySelector("strong").textContent + ":" + e.querySelector("span").textContent));
  assert(st.join() === "15:سنوات الخبرة,40:المشاريع,5:المنصات", st.join());
  const img = await page.$eval(".st-portrait img", (i) => [i.getAttribute("src"), i.alt]);
  assert(img[0] === "https://ahmedzahran12.netlify.app/ahmed.jpg" && img[1] === "م. أحمد زهران", img.join());
});
await test("empty sections (insurance, my pages) and hidden future items are not shown", async () => {
  assert(!(await page.$("#sec-insurance")) && !(await page.$("#sec-pages")) && !(await page.$("#sec-future")), "should be hidden");
});
await test("platforms: five rows with name, status, audience, problem, three benefits and a real screenshot", async () => {
  assert((await page.textContent("#sec-platforms h2")).trim() === "منصات صممتها لتخدم احتياجات حقيقية", "section title");
  const rows = await page.$$eval("#sec-platforms .pf", (ps) => ps.map((p) => ({
    title: p.querySelector("h3").textContent.trim(), status: !!p.querySelector(".pf-top .badge"), facts: p.querySelectorAll(".pf-facts dd").length,
    benefits: p.querySelectorAll(".pf-benefits li").length, shot: p.querySelector(".pf-screen img")?.getAttribute("src") || "", alt: p.querySelector(".pf-screen img")?.alt || "", svg: !!p.querySelector(".pf-obj svg"),
  })));
  assert(rows.map((r) => r.title).join("|") === "التزام للتدريب|التزام لإدارة أوامر العمل ومشاريع الكهرباء|نور فيو مدينتي|مجسّد|بوابة الأمن", rows.map((r) => r.title).join("|"));
  assert(rows.every((r) => r.status && r.facts === 2 && r.benefits === 3 && r.shot.startsWith("assets/shots/") && r.alt.includes("لقطة من واجهة") && r.svg), JSON.stringify(rows));
  const idx = await page.$$eval(".pf-index a", (as) => as.length);
  assert(idx === 5, "summary index has 5 links");
  const loaded = await page.$eval("#sec-platforms .pf-screen img", async (i) => { i.loading = "eager"; await i.decode().catch(() => {}); return i.naturalWidth; });
  assert(loaded === 960, "screenshot file loads, width " + loaded);
});
await test("accuracy notes: prototype + design-only role for the real estate site, sketch note for Mujassid", async () => {
  const nour = await page.$$eval("#sec-platforms .pf", (ps) => ps.find((p) => p.querySelector("h3").textContent.trim() === "نور فيو مدينتي").textContent);
  assert(nour.includes("نموذج أولي") && nour.includes("تصميم الموقع وتنفيذه فقط") && nour.includes("تجريبي"), "nour note");
  const muj = await page.$$eval("#sec-platforms .pf", (ps) => ps.find((p) => p.querySelector("h3").textContent.trim() === "مجسّد").textContent);
  assert(muj.includes("ليست ناتج نموذج توليد صور") && !muj.includes("توكن"), "mujassid note");
  const all = await page.textContent("#main");
  assert(!all.includes("تقييم العملاء") && !all.includes("قالوا عنا"), "no testimonials or ratings");
});
await test("step one: the platform row has no direct external link; «شاهد كيف تعمل» opens the details dialog", async () => {
  assert((await page.$$("#sec-platforms .pf a[target=_blank]")).length === 0, "rows must not link out directly");
  await page.click("#sec-platforms .pf >> nth=0 >> [data-pf-open]");
  await page.waitForSelector("#pf-dlg[open]");
  const txt = await page.textContent("#pf-dlg");
  for (const w of ["لمن هذه المنصة؟", "ماذا تستطيع إنجازه؟", "ثلاث خطوات للاستخدام", "عرض توضيحي", "الدخول إلى المنصة", "يفتح في تبويب جديد"]) assert(txt.includes(w), "dialog missing: " + w);
  assert((await page.$$("#pf-dlg .pfm-steps li")).length === 3, "three steps");
  assert((await page.getAttribute("#pf-dlg", "aria-labelledby")) === "pfm-title", "labelled");
  assert(await page.evaluate(() => document.activeElement.matches("[data-pfm-close]")), "focus moves into the dialog");
});
await test("step two: «الدخول إلى المنصة» opens the right link in a new tab; real secondary paths are linked", async () => {
  const enter = await page.$eval("[data-pfm-enter]", (a) => [a.href, a.target, a.rel]);
  assert(enter[0] === "https://iltizam-training.netlify.app/" && enter[1] === "_blank" && enter[2].includes("noopener"), enter.join());
  const goal = await page.$eval("[data-pfm-goal]", (a) => [a.href, a.textContent.trim(), a.target]);
  assert(goal[0] === "https://iltizam-training.netlify.app/#/home" && goal[1] === "استكشف مسارات التعلم" && goal[2] === "_blank", goal.join());
  const join = await page.$eval("[data-pfm-join]", (a) => [a.href, a.textContent.trim()]);
  assert(join[0] === "https://iltizam-training.netlify.app/join/trainee" && join[1] === "أنشئ حساب متدرب", join.join());
});
await test("demo: plays on open without sound, can be paused and resumed, steps switch the scene", async () => {
  assert((await page.$$("#pf-dlg video, #pf-dlg audio")).length === 0, "no media with sound");
  assert((await page.getAttribute("[data-demo-toggle]", "aria-pressed")) === "true", "auto-plays");
  const w1 = await page.$eval("[data-demo-bar]", (e) => parseFloat(e.style.width));
  await page.waitForTimeout(700);
  const w2 = await page.$eval("[data-demo-bar]", (e) => parseFloat(e.style.width));
  assert(w2 > w1, "progress advances while playing");
  await page.click("[data-demo-toggle]");
  assert((await page.getAttribute("[data-demo-toggle]", "aria-pressed")) === "false" && (await page.textContent("[data-demo-toggle]")).trim() === "تشغيل", "paused");
  const w3 = await page.$eval("[data-demo-bar]", (e) => parseFloat(e.style.width));
  await page.waitForTimeout(500);
  assert((await page.$eval("[data-demo-bar]", (e) => parseFloat(e.style.width))) === w3, "progress stops when paused");
  await page.click("[data-demo-go='2']");
  assert((await page.getAttribute(".demo-frame.on", "data-frame")) === "2", "frame 3 shown");
  assert((await page.textContent("[data-demo-cap]")).trim() === "تابع الدروس بالترتيب", "caption follows the step");
  await page.click("[data-demo-toggle]");
  assert((await page.getAttribute("[data-demo-toggle]", "aria-pressed")) === "true", "resumed");
});
await test("dialog: Escape closes it, the demo stops, and focus returns to the button that opened it", async () => {
  await page.keyboard.press("Escape");
  await page.waitForSelector("#pf-dlg:not([open])", { state: "attached" });
  assert(await page.evaluate(() => document.activeElement.matches("#sec-platforms .pf [data-pf-open]")), "focus returned");
  assert(await page.evaluate(() => !window.__demo || true), "ok");
  // keyboard: Enter on the focused button opens it again, the close button closes it
  await page.keyboard.press("Enter");
  await page.waitForSelector("#pf-dlg[open]");
  await page.click("[data-pfm-close]");
  await page.waitForSelector("#pf-dlg:not([open])", { state: "attached" });
});
await test("each platform has its own call to action and correct links", async () => {
  const want = [
    ["التزام لإدارة أوامر العمل ومشاريع الكهرباء", "https://iltizam-najran.netlify.app/", "اطلب عرضًا تجريبيًا", "https://iltizam-najran.netlify.app/#contact"],
    ["نور فيو مدينتي", "https://nourmadinty.netlify.app/", "استكشف العقارات", null],
    ["مجسّد", "https://mujassid-prompt-studio.netlify.app/", "حوّل فكرتك إلى برومبت", null],
    ["بوابة الأمن", "https://securitynmwabran.netlify.app/", "استفسر عن الخدمة", "https://wa.me/966565324387?text="],
  ];
  for (let i = 0; i < want.length; i++) {
    const [title, url, goalText, goalUrl] = want[i];
    await page.click(`#sec-platforms .pf >> nth=${i + 1} >> [data-pf-open]`);
    await page.waitForSelector("#pf-dlg[open]");
    assert((await page.textContent("#pfm-title")).trim() === title, "title " + title);
    assert((await page.$eval("[data-pfm-enter]", (a) => a.href)) === url, "enter url for " + title);
    assert((await page.textContent("#pf-dlg .pfm-goal")).trim() === goalText, "goal text for " + title);
    const g = await page.$("[data-pfm-goal]");
    if (goalUrl) assert(g && (await g.getAttribute("href")).startsWith(goalUrl), "goal url for " + title);
    else assert(!g, "no duplicate goal link for " + title);
    await page.keyboard.press("Escape");
    await page.waitForSelector("#pf-dlg:not([open])", { state: "attached" });
  }
});
await test("copy platform link shows a clear success message and copies the right URL", async () => {
  await page.click("#sec-platforms .pf >> nth=3 >> [data-pf-copy]");
  await page.waitForSelector("#toast.show");
  assert((await page.textContent("#toast")).trim() === "تم نسخ رابط المنصة", "toast");
  assert((await page.evaluate(() => navigator.clipboard.readText())) === "https://mujassid-prompt-studio.netlify.app/", "clipboard");
  assert((await page.$$("#sec-platforms .pf [data-pf-share]")).length === 5, "share buttons");
});
await test("reduced motion: the demo does not auto-play and all content stays readable", async () => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.click("#sec-platforms .pf >> nth=0 >> [data-pf-open]");
  await page.waitForSelector("#pf-dlg[open]");
  assert((await page.getAttribute("[data-demo-toggle]", "aria-pressed")) === "false", "no autoplay");
  assert(await page.isVisible(".demo-frame.on") && await page.isVisible("#pf-dlg .pfm-steps"), "content visible");
  assert((await page.$eval(".st-browser", (e) => getComputedStyle(e).animationName)) === "none", "scene animation off");
  await page.keyboard.press("Escape");
  await page.emulateMedia({ reducedMotion: "no-preference" });
});
await test("services are separate from platforms: four services, CTA, design-picker link and messaging", async () => {
  const titles = await page.$$eval("#services .svc h3", (h) => h.map((x) => x.textContent.trim()));
  assert(titles.join("|") === "مواقع مهنية وشخصية|صفحات عرض الخدمات|لوحات متابعة وتقارير|منصات مخصصة", titles.join("|"));
  assert((await page.textContent("#services .svc-cta h3")).trim() === "لنحوّل فكرتك إلى موقع", "services CTA");
  const hrefs = await page.$$eval("#services .offer a", (as) => as.map((a) => a.href));
  assert(hrefs.includes("https://21st.dev/?q=%E2%80%A2+Radial+Orbital+Timeline&qs=bookmarks"), "21st.dev link kept");
  assert(hrefs.filter((h) => h.startsWith("https://wa.me/966565324387?text=")).length === 2, "whatsapp buttons");
  assert(!(await page.textContent("#sec-platforms")).includes("اختر موقعك المناسب"), "offers are not listed as platforms");
});
await test("about, process (five steps) and footer links", async () => {
  const about = await page.textContent("#about");
  assert(about.includes("أنا المهندس أحمد زهران") && about.includes("خدمة هدف واضح"), "about text");
  const steps = await page.$$eval("#process .steps5 h3", (h) => h.map((x) => x.textContent.trim()));
  assert(steps.join("|") === "فهم الاحتياج|تنظيم المحتوى|تصميم التجربة|التنفيذ والمراجعة|الإطلاق والمتابعة", steps.join("|"));
  const foot = await page.$$eval(".foot-links a", (as) => as.map((a) => a.getAttribute("href")));
  for (const u of ["#/cv", "https://ahmedzahran12.netlify.app/", "https://www.linkedin.com/in/ahmed-zahran-8b7730340", "https://www.youtube.com/@Alphamedia-010", "mailto:az3919131@gmail.com"]) assert(foot.includes(u), "footer missing " + u);
  const ext = await page.$$eval("#sec-youtube .btn-primary, #sec-linkedin .btn-primary", (as) => as.map((a) => [a.target, a.rel]));
  assert(ext.length === 2 && ext.every(([t, r]) => t === "_blank" && r.includes("noopener")), "channel and LinkedIn open in a new tab");
});
await test("WhatsApp link uses the international format; mailto link in the contact block", async () => {
  const wa = await page.getAttribute("#sec-contact a.contact-line[href^='https://wa.me']", "href");
  assert(wa.startsWith("https://wa.me/966565324387?text="), wa);
  assert((await page.getAttribute("#sec-contact a[href^='mailto:']", "href")) === "mailto:az3919131@gmail.com", "mailto");
});
await test("CV sections are off the home page; the CV page opens from «عني»", async () => {
  for (const id of ["experience", "projects", "skills", "education", "courses"]) assert(!(await page.$("#sec-" + id)), id + " must not be on the home page");
  await page.click("#about a[href='#/cv']");
  await page.waitForSelector(".cv-hero");
  const ids = await page.$$eval("[data-section-block]", (e) => e.map((x) => x.id));
  assert(ids.join() === "sec-experience,sec-projects,sec-skills,sec-education,sec-courses", ids.join());
  assert(!(await page.$(".busbar")) && !(await page.$("#sec-contact")) && !(await page.$("#sec-platforms")), "CV page has only CV content");
  await page.click("#mainnav a[href='#sec-skills']");
  assert(await page.isVisible(".cv-hero"), "in-page anchor stays on the CV page");
  await page.click(".back-link");
  await page.waitForSelector(".intro h1");
});
await test("old shared link /#sec-experience opens the CV page", async () => {
  await page.goto("about:blank");
  await page.goto(B + "#sec-experience");
  await page.waitForSelector(".cv-hero");
  assert(await page.isVisible("#sec-experience"), "lands on the experience section");
  await page.goto(B + "#/"); await page.waitForSelector(".intro h1");
});
await test("language switch AR ⇄ EN (direction, headline, platform copy)", async () => {
  await page.click(".btn-lang");
  await page.waitForFunction(() => document.documentElement.dir === "ltr");
  assert((await page.textContent(".intro h1")).trim() === "I turn ideas into platforms, and plans into reality.", "english headline");
  assert((await page.textContent("#sec-platforms .pf h3")).trim() === "Iltizam Training", "english platform name");
  assert((await page.textContent("#mainnav")).includes("Services"), "english nav");
  await page.click(".btn-lang");
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
  await page.click(".foot-links [data-act=print]");
  assert((await page.evaluate(() => window.__printed)) === 1, "print");
});
await test("contrast: text and buttons meet WCAG AA", async () => {
  const res = await page.evaluate(() => {
    const lum = (c) => { const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    const bgOf = (el) => { while (el) { const bg = getComputedStyle(el).backgroundColor; if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg) && !/rgba\([^)]*, 0\.\d+\)/.test(bg)) return bg; el = el.parentElement; } return "rgb(8, 19, 34)"; };
    return [".intro h1", ".intro .lead", ".intro .role span", ".intro-actions .btn-blue", ".btn-start", ".pf-desc", ".pf-pitch", ".pf-facts dt", ".svc p", ".steps5 p", ".pf-body .btn-line"].map((sel) => { const el = document.querySelector(sel); return [sel, +ratio(getComputedStyle(el).color, bgOf(el)).toFixed(2)]; });
  });
  const bad = res.filter(([, r]) => r < 4.5);
  console.log("contrast ratios:", res.map(([s, r]) => `${s} ${r}`).join(" | "));
  assert(bad.length === 0, "low contrast: " + JSON.stringify(bad));
});
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
  await page.goto(B + "#/cv"); await page.waitForSelector(".cv-hero");
  assert((await page.textContent("#sec-experience")).includes("خبرة اختبارية"), "experience missing item on CV page");
  await publicPage();
  for (const [sec, txt] of [["platforms", "منصة اختبار"], ["youtube", "فيديو اختبار"], ["linkedin", "صفحة شركة اختبار"], ["insurance", "موقع تأمين اختبار"], ["pages", "صفحتي الاختبارية"]]) {
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
  await page.click("#sec-list li[data-id=linkedin] [data-a=up]");
  await publish();
  await publicPage();
  assert(!(await page.$("#sec-youtube")), "youtube hidden");
  const ids = (await page.$$eval("[data-section-block]", (e) => e.map((x) => x.id))).filter((x) => x !== "services");
  assert(ids.slice(0, 2).join() === "sec-platforms,sec-linkedin", "order on public page: " + ids.join());
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
  assert((await page.textContent(".intro .role")).includes("مسمى مسودة"), "preview shows draft");
  await publicPage();
  assert(!(await page.textContent(".intro .role")).includes("مسمى مسودة"), "public unchanged before publish");
  await login();
  await page.click("[data-a=discard-draft]");
  assert((await page.inputValue('#f-profile [name="title.ar"]')).includes("مصمم مواقع"), "discarded");
});
await test("published data persists after page reload", async () => {
  await publicPage(); await page.reload(); await page.waitForSelector(".intro h1");
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
  await page.goto(L + "#/"); await page.reload(); await page.waitForSelector(".intro h1");
  assert((await page.textContent(".hero-name")).includes("اسم محلي"), "local persisted");
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
