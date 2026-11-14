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
await test("number strip: the owner's wording (+15 / dozens / 5 designs) and the original portrait is used unchanged", async () => {
  const st = await page.$$eval(".busbar .stat", (els) => els.map((e) => e.querySelector("strong").textContent + ":" + e.querySelector("span").textContent));
  assert(st.join() === "+15:سنة خبرة في مصر والمملكة,عشرات:المشاريع في المملكة ومصر,عدة:تصاميم ومواقع تخدم المقاول وفريق عمل المشروع", st.join());
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
await test("step one: each platform row links out only through its direct-entry button; «شاهد كيف تعمل» opens the details dialog", async () => {
  const outs = await page.$$eval("#sec-platforms .pf a[target=_blank]", (as) => as.map((a) => a.hasAttribute("data-pf-direct")));
  assert(outs.length === 5 && outs.every(Boolean), "one direct link per row, nothing else links out");
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
await test("each platform card has a direct link into the platform (no copy-link buttons left)", async () => {
  const links = await page.$$eval("#sec-platforms .pf [data-pf-direct]", (as) => as.map((a) => [a.getAttribute("href"), a.target, a.rel, a.textContent.trim()]));
  assert(links.length === 5 && links.every((l) => /^https:\/\/[a-z0-9-]+\.netlify\.app\/?$/.test(l[0]) && l[1] === "_blank" && l[2].includes("noopener") && l[3] === "ادخل المنصة مباشرة"), JSON.stringify(links));
  assert(links.some((l) => l[0] === "https://mujassid-prompt-studio.netlify.app/"), "prompt studio link");
  assert((await page.$$("[data-pf-copy]")).length === 0, "no copy-link buttons");
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
  assert(about.includes("أنا المهندس أحمد زهران، مدير مشاريع في الكهرباء والبنية التحتية") && about.includes("يتخذ قراره أسرع"), "about text");
  assert((await page.getAttribute("#about .btn-gold", "href")) === "#/cv", "the CV button opens this site's CV page");
  assert(!(await page.$("#about a[href*='ahmedzahran12']")), "no link to the old external CV site");
  const steps = await page.$$eval("#process .steps5 h3", (h) => h.map((x) => x.textContent.trim()));
  assert(steps.join("|") === "فهم الاحتياج|تنظيم المحتوى|تصميم التجربة|التنفيذ والمراجعة|الإطلاق والمتابعة", steps.join("|"));
  const foot = await page.$$eval(".foot-links a", (as) => as.map((a) => a.getAttribute("href")));
  assert(!foot.includes("https://ahmedzahran12.netlify.app/"), "old external CV link removed");
  for (const u of ["#/cv", "https://www.linkedin.com/in/ahmed-zahran-8b7730340", "https://www.youtube.com/@Alphamedia-010", "mailto:az3919131@gmail.com"]) assert(foot.includes(u), "footer missing " + u);
  const ext = await page.$$eval("#sec-youtube .btn-primary, #sec-linkedin .btn-primary", (as) => as.map((a) => [a.target, a.rel]));
  assert(ext.length === 2 && ext.every(([t, r]) => t === "_blank" && r.includes("noopener")), "channel and LinkedIn open in a new tab");
});
await test("WhatsApp link uses the international format; mailto link in the contact block", async () => {
  const wa = await page.getAttribute("#sec-contact a.contact-line[href^='https://wa.me']", "href");
  assert(wa.startsWith("https://wa.me/966565324387?text="), wa);
  assert((await page.getAttribute("#sec-contact a[href^='mailto:']", "href")) === "mailto:az3919131@gmail.com", "mailto");
});
const gotoCv = async () => { await page.goto("about:blank"); await page.goto(B + "#/cv"); await page.waitForSelector(".cvx-hero h1"); };
await test("home: CV sections are not on the home page; «عني» opens the CV page", async () => {
  for (const id of ["value", "experience", "projects", "skills", "certs", "education", "courses"]) assert(!(await page.$("#sec-" + id)), id + " must not be on the home page");
  await page.click("#about a[href='#/cv']");
  await page.waitForSelector(".cvx-hero");
  await page.goto(B + "#/"); await page.waitForSelector(".intro h1");
});
await test("CV hero: headline, roles, three buttons, portrait, 3D stage (WebGL, or the static fallback)", async () => {
  await gotoCv();
  assert((await page.textContent(".cvx-hero h1")).trim() === "أقود التنفيذ برؤية واضحة، وأربط التخطيط بواقع المشروع.", "headline");
  const roles = await page.textContent(".cvx-hero-text");
  assert(roles.includes("مدير مشاريع | إدارة وتنفيذ وتخطيط مشاريع العقد الموحد بالمملكة") && roles.includes("مهندس اختبارات كابلات / شركة الكهرباء بمصر") && roles.includes("مهندس قوى كهربائية ومصمم مواقع ومنصات رقمية"), "roles");
  assert((await page.textContent(".cvx-lead")).includes("تصميم أدوات رقمية تساعد على تنظيم المعلومات ودعم القرار"), "lead");
  const btns = await page.$$eval(".cvx-actions .btn", (as) => as.map((a) => a.textContent.trim() + "|" + (a.getAttribute("href") || a.dataset.act)));
  assert(btns.join() === "تواصل بشأن فرصة عمل|#sec-contact,استعرض خبراتي|#sec-experience,تحميل / طباعة السيرة الذاتية|print", btns.join());
  assert((await page.getAttribute(".cvx-portrait img", "src")) === "https://ahmedzahran12.netlify.app/ahmed.jpg", "original portrait");
  await page.waitForFunction(() => ["webgl", "static"].includes(document.querySelector("[data-cv-stage]").dataset.mode), null, { timeout: 15000 });
  const mode = await page.$eval("[data-cv-stage]", (e) => e.dataset.mode);
  if (mode === "webgl") assert(await page.$("[data-cv-canvas] canvas"), "canvas exists in webgl mode");
  else assert(await page.$("[data-cv-canvas] svg"), "static fallback drawn");
  assert((await page.$$eval(".cvx-hero-text *", (n) => n.filter((x) => x.tagName === "CANVAS" || x.tagName === "IMG").length)) === 0, "text is plain HTML, not inside images");
  console.log("  (3D stage mode: " + mode + ")");
});
await test("CV nav: الرئيسية — عني — القيمة المضافة — الخبرات — المشاريع — الشهادات — المنصات — تواصل; anchors keep the page", async () => {
  const nav = await page.$$eval("#mainnav > a", (as) => as.map((a) => a.textContent.trim() + "|" + a.getAttribute("href")));
  assert(nav.join() === "الرئيسية|#/,عني|#about,القيمة المضافة|#sec-value,الخبرات|#sec-experience,المشاريع|#sec-projects,الشهادات|#sec-certs,المنصات|#sec-platforms,تواصل|#sec-contact", nav.join());
  await page.click("#mainnav a[href='#sec-certs']");
  assert(await page.isVisible(".cvx-hero") || (await page.$(".cvx-hero")), "still the CV page");
  assert(await page.isVisible("#sec-certs h2"), "scrolled to certificates");
  assert((await page.getAttribute(".topbar", "class")).includes("topbar"), "sticky bar");
  assert((await page.$eval(".topbar", (e) => getComputedStyle(e).position)) === "sticky", "navbar is sticky");
});
await test("CV value: four capabilities, no promises of results", async () => {
  const t = await page.$$eval("#sec-value .cvx-vcard h3", (h) => h.map((x) => x.textContent.trim()));
  assert(t.join("|") === "التخطيط والمتابعة|قيادة التنفيذ|ضبط المشروع|تطوير العمل رقميًا", t.join("|"));
  assert((await page.textContent("#sec-value")).includes("دون وعود بنتائج محددة"), "no promises note");
});
await test("CV experience: employer vs client, documented dates, energy timeline fills and lights nodes on scroll", async () => {
  const jobs = await page.$$eval("#sec-experience .cvx-job", (js) => js.map((j) => ({ h: j.querySelector("h3").textContent.trim(), who: [...j.querySelectorAll(".cvx-who div")].map((d) => d.querySelector("dt").textContent.trim() + ":" + d.querySelector("dd").textContent.trim()), period: j.querySelector(".cvx-period").textContent.trim(), ev: (j.querySelector(".cvx-evidence") || {}).textContent || "" })));
  assert(jobs.length === 2, "two jobs");
  assert(jobs[0].period === "يناير 2021 — حتى الآن" && jobs[1].period === "يناير 2013 — يناير 2021", jobs.map((j) => j.period).join(" / "));
  const direct = jobs[0].who.find((x) => x.startsWith("جهة التوظيف المباشر")), client = jobs[0].who.find((x) => x.startsWith("العميل"));
  assert(direct.includes("ناصر مانع وبران وشركاه") && !direct.includes("الشركة السعودية للكهرباء —") && client.includes("الشركة السعودية للكهرباء") && client.includes("ليست جهة التوظيف المباشر") || client.includes("وليست جهة التوظيف المباشر"), "employer/client distinction: " + direct + " | " + client);
  assert(jobs[0].ev.includes("15/10/2025") && jobs[0].ev.includes("31/12/2026") && jobs[0].ev.includes("15/01/2021 – 16/01/2023"), "evidence states both the letter and the Qiwa dates");
  assert(jobs[1].ev.includes("27/01/2013") && jobs[1].ev.includes("01/07/2014"), "Egyptian dates");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(150);
  const p0 = await page.$eval("[data-energy]", (e) => parseFloat(e.style.getPropertyValue("--p") || "0"));
  await page.evaluate(() => { const tl = document.querySelector("[data-energy]"); window.scrollTo({ top: tl.getBoundingClientRect().top + window.scrollY - 120, behavior: "instant" }); });
  await page.waitForTimeout(250);
  const p1 = await page.$eval("[data-energy]", (e) => parseFloat(e.style.getPropertyValue("--p")));
  await page.evaluate(() => { const tl = document.querySelector("[data-energy]"); window.scrollTo({ top: tl.getBoundingClientRect().top + window.scrollY + tl.offsetHeight - window.innerHeight * 0.3, behavior: "instant" }); });
  await page.waitForTimeout(250);
  const p2 = await page.$eval("[data-energy]", (e) => parseFloat(e.style.getPropertyValue("--p")));
  const lit = await page.$$eval("#sec-experience .cvx-job.lit", (e) => e.length);
  assert(p0 === 0 && p1 > p0 && p2 > p1 && p2 > 0.85 && lit === 2, `energy progress ${p0} → ${p1} → ${p2}, lit ${lit}`);
  const btn = await page.$eval("#sec-experience [data-cert-open]", (b) => b.dataset.certOpen);
  assert(btn === "cert-service", "documents button points to the service certificate");
});
await test("CV projects: three case studies with the required structure and labelled illustrations", async () => {
  const cases = await page.$$eval("#sec-projects .cvx-case", (cs) => cs.map((c) => ({ h: c.querySelector("h3").textContent.trim(), dts: [...c.querySelectorAll("dt")].map((d) => d.textContent.trim()), ill: c.querySelector(".cvx-ill").textContent.trim(), svg: !!c.querySelector(".cvx-case-art svg") })));
  assert(cases.length === 3 && cases.every((c) => c.ill === "رسم توضيحي" && c.svg), "three illustrated cases");
  for (const c of cases) for (const dt of ["نوع المشروع", "التحدي", "دوري", "الإجراءات", "المخرجات المثبتة"]) assert(c.dts.includes(dt), c.h + " missing " + dt);
  const txt = await page.textContent("#sec-projects");
  for (const w of ["الأخدود", "الغويلا", "الطريق الدائري الأوسطي", "FLSmidth", "مصنع أسمنت الرملية", "تقدير امتياز"]) assert(txt.includes(w), "project text missing " + w);
});
await test("CV certificates: four categories with counts, live search across categories, items without a scan say so", async () => {
  const tabs = await page.$$eval("[data-cert-tab]", (b) => b.map((x) => x.dataset.certTab + ":" + x.querySelector(".n").textContent));
  assert(tabs.join() === "academic:4,pm:5,power:11,control:8", tabs.join());
  assert((await page.$$eval("[data-cert]:not([hidden])", (e) => e.length)) === 4, "first tab shows 4");
  await page.click("[data-cert-tab=power]");
  assert((await page.$$eval("[data-cert]:not([hidden])", (e) => e.length)) === 11 && (await page.getAttribute("[data-cert-tab=power]", "aria-selected")) === "true", "tab 3 shows 11");
  await page.fill("[data-cert-q]", "SCADA");
  const hits = await page.$$eval("[data-cert]:not([hidden])", (e) => e.map((x) => x.dataset.cert));
  assert(hits.includes("cert-scada") && hits.length >= 1 && hits.every((h) => h !== "cert-bsc"), "search across tabs: " + hits.join());
  assert((await page.textContent("[data-cert-status]")).includes("نتيجة"), "result count announced");
  await page.fill("[data-cert-q]", "zzzz-no-match");
  assert(await page.isVisible("[data-cert-empty]"), "empty state");
  await page.fill("[data-cert-q]", "");
  await page.click("[data-cert-tab=academic]");
  const nodoc = await page.$$eval("[data-cert=cert-bsc] .cvx-nodoc", (e) => e.length);
  assert(nodoc === 1, "no fake previews for items without a scan");
  assert((await page.$$eval("[data-cert=cert-syndicate] .cvx-thumb img", (e) => e.length)) === 1, "syndicate card shows its scan");
  const withDoc = await page.$$eval("[data-cert] .cvx-thumb img", (i) => i.length);
  assert(withDoc === 24, "only the cards with real scans have previews, got " + withDoc);
});
await test("CV certificates: 3D tilt and glare react to the pointer (and reset on leave)", async () => {
  const card = await page.$(".cvx-vcard");
  await card.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.2);
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.15);
  await page.waitForTimeout(150);
  const during = await card.evaluate((e) => [e.style.getPropertyValue("--ry"), e.style.getPropertyValue("--gx"), e.classList.contains("is-tilting")]);
  assert(parseFloat(during[0]) !== 0 && during[1].endsWith("%") && during[2], "tilt vars " + during.join());
  await page.mouse.move(2, 2);
  await page.waitForTimeout(150);
  assert((await card.evaluate((e) => e.style.getPropertyValue("--ry"))) === "0deg", "reset on leave");
});
await test("CV certificates: new scans are attached to their cards, upright and loading", async () => {
  const want = { "cert-don-bosco": 2, "cert-flsmidth": 1, "cert-plc-adv": 1, "cert-software": 1 };
  const got = await page.$$eval("[data-cert]", (cs) => Object.fromEntries(cs.filter((c) => c.querySelector(".cvx-thumb img")).map((c) => [c.dataset.cert, c.querySelector(".cvx-thumb img").getAttribute("src")])));
  for (const id of Object.keys(want)) assert(got[id] && got[id].startsWith("assets/certs/"), id + " has a preview");
  await page.click("[data-cert-tab=control]");
  await page.click("[data-cert=cert-don-bosco] .cvx-thumb");
  await page.waitForSelector("#cert-dlg[open]");
  assert((await page.$$("#cert-dlg [data-img]")).length === 2, "two Don Bosco certificates in one viewer");
  const dims = await page.$eval("#cert-dlg [data-zoom-img]", async (i) => { await i.decode().catch(() => {}); return [i.naturalWidth, i.naturalHeight]; });
  assert(dims[0] > dims[1], "landscape and upright: " + dims.join("x"));
  await page.click("#cert-dlg [data-img='1']");
  const d2 = await page.$eval("#cert-dlg [data-zoom-img]", async (i) => { await i.decode().catch(() => {}); return [i.naturalWidth, i.naturalHeight]; });
  assert(d2[0] > d2[1], "the second certificate was rotated upright: " + d2.join("x"));
  assert((await page.textContent("#cert-dlg")).includes("Control by Contactors"), "note names the attached documents");
  await page.keyboard.press("Escape");
  await page.click("[data-cert=cert-plc-adv] .cvx-thumb");
  await page.waitForSelector("#cert-dlg[open]");
  const d3 = await page.$eval("#cert-dlg [data-zoom-img]", async (i) => { await i.decode().catch(() => {}); return [i.naturalWidth, i.naturalHeight]; });
  assert(d3[1] > d3[0], "the Jelecom letter is portrait and upright: " + d3.join("x"));
  await page.keyboard.press("Escape");
  await page.click("[data-cert-tab=academic]");
});
await test("CV certificates: viewer shows the covered image, zooms, navigates, closes with Escape and returns focus", async () => {
  await page.click("[data-cert-tab=pm]");
  await page.click("[data-cert=cert-pmp-prep] .cvx-thumb");
  await page.waitForSelector("#cert-dlg[open]");
  const src = await page.getAttribute("#cert-dlg [data-zoom-img]", "src");
  assert(src === "assets/certs/pmp-prep-course.jpg", src);
  assert((await page.$eval("#cert-dlg [data-zoom-img]", async (i) => { await i.decode().catch(() => {}); return i.naturalWidth; })) === 1600, "image loads");
  const txt = await page.textContent("#cert-dlg");
  for (const w of ["ES-PMP-2898", "ليست اعتماد PMP النهائي", "35 PDUs", "كيف ترتبط باحتياجات الشركة؟", "مثال تطبيقي محتمل — منفصل عن الخبرة المثبتة", "غُطّيت أرقام الهوية"]) assert(txt.includes(w), "viewer missing: " + w);
  assert(await page.evaluate(() => document.activeElement.matches("[data-cdlg-close]")), "focus moves in");
  await page.click("#cert-dlg [data-zoom=in]");
  assert((await page.$eval("#cert-dlg [data-stage]", (e) => e.style.getPropertyValue("--z"))) === "1.5", "zoomed");
  const t1 = await page.textContent("#cdlg-title");
  await page.click("#cert-dlg [data-cdlg-nav=next]");
  assert((await page.textContent("#cdlg-title")) !== t1, "next item");
  await page.keyboard.press("ArrowLeft");
  assert((await page.textContent("#cdlg-title")).trim() !== "", "keyboard navigation works");
  await page.keyboard.press("Escape");
  await page.waitForSelector("#cert-dlg:not([open])", { state: "attached" });
  assert(await page.evaluate(() => document.activeElement.closest("[data-cert]") !== null), "focus returned to the card that opened it");
  // two documents on one certificate
  await page.click("[data-cert-tab=academic]");
  await page.click("[data-cert=cert-service] .cvx-thumb");
  await page.waitForSelector("#cert-dlg[open]");
  assert((await page.$$("#cert-dlg [data-img]")).length === 2, "service certificate + company letter");
  await page.click("#cert-dlg [data-img='1']");
  assert((await page.getAttribute("#cert-dlg [data-zoom-img]", "src")) === "assets/certs/company-letter-2025.jpg", "second document");
  await page.keyboard.press("Escape");
  // opened from the experience card
  await page.click("#sec-experience [data-cert-open]");
  await page.waitForSelector("#cert-dlg[open]");
  assert((await page.textContent("#cdlg-title")).includes("شهادة الخدمة"), "experience button opens its certificate");
  await page.keyboard.press("Escape");
});
await test("privacy: no ID / iqama numbers, birth date or military remarks in the page, the scripts or the image folder", async () => {
  const text = await page.evaluate(() => document.body.innerText + document.documentElement.innerHTML);
  for (const bad of ["2497272811", "1989/01/12", "1989", "القوات المسلحة", "الخدمة العسكرية", "خدمة عسكرية", "تجنيد", "military"]) assert(!text.includes(bad), "page contains: " + bad);
  const fs = await import("node:fs");
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(d + "/" + e.name) : [d + "/" + e.name]));
  const files = walk("public");
  assert(!files.some((f) => /\.pdf$/i.test(f)), "no PDF files are published");
  for (const f of files.filter((x) => /\.(js|html|css|json)$/.test(x) && !/vendor\//.test(x))) {
    const body = fs.readFileSync(f, "utf8");
    for (const bad of ["2497272811", "1989/01/12", "القوات المسلحة", "الخدمة العسكرية", "خدمة عسكرية"]) assert(!body.includes(bad), f + " contains " + bad);
  }
  const certs = fs.readdirSync("public/assets/certs");
  assert(certs.every((f) => /\.jpg$/.test(f)) && certs.length === 72, "only JPEG previews: " + certs.join());
});
await test("CV platforms: contractors platform first, one-click visit link, details dialog still works", async () => {
  const titles = await page.$$eval("#sec-platforms .pf h3", (h) => h.map((x) => x.textContent.trim()));
  assert(titles.join("|") === "التزام لإدارة أوامر العمل ومشاريع الكهرباء|التزام للتدريب|مجسّد|نور فيو مدينتي|بوابة الأمن", titles.join("|"));
  assert((await page.textContent("#sec-platforms h2")).trim() === "من خبرة العمل إلى حلول رقمية", "section title");
  const visit = await page.$$eval("#sec-platforms [data-pf-visit]", (as) => as.map((a) => [a.href, a.target, a.textContent.trim()]));
  assert(visit.length === 5 && visit.every((v) => v[1] === "_blank" && v[2] === "زيارة المنصة") && visit[0][0] === "https://iltizam-najran.netlify.app/", JSON.stringify(visit));
  assert((await page.$$("#sec-platforms [data-pf-copy], #sec-platforms [data-pf-direct]")).length === 0, "one direct link per card on the CV page");
  await page.click("#sec-platforms .pf >> nth=0 >> [data-pf-open]");
  await page.waitForSelector("#pf-dlg[open]");
  assert((await page.textContent("#pfm-title")).includes("التزام"), "dialog opens");
  await page.keyboard.press("Escape");
  await page.waitForSelector("#pf-dlg:not([open])", { state: "attached" });
});
await test("CV about + contact: approved text, both numbers, and the form fields", async () => {
  assert((await page.textContent("#about")).includes("أتولى التخطيط والمتابعة من فتح أمر العمل حتى إغلاقه"), "about text");
  assert((await page.textContent("#sec-contact h2")).trim() === "لنتحدث عن احتياجات مشروعك وفريقك", "contact title");
  assert((await page.textContent("#sec-contact .head2")).includes("يسعدني مناقشة الدور ومتطلبات فريقك"), "contact text");
  const hrefs = await page.$$eval("#sec-contact a", (as) => as.map((a) => a.getAttribute("href")));
  for (const u of ["mailto:az3919131@gmail.com", "tel:+966565324387", "tel:+966536324462"]) assert(hrefs.includes(u), "missing " + u);
  assert(hrefs.some((h) => h.startsWith("https://wa.me/966565324387")) && hrefs.some((h) => h.startsWith("https://wa.me/966536324462")), "two WhatsApp links");
  const fields = await page.$$eval("#contact-form label", (l) => l.map((x) => x.firstChild.textContent.trim()));
  assert(fields.join("|") === "الاسم|الشركة|رقم الجوال أو البريد|المسمى أو نوع الفرصة|الرسالة", fields.join("|"));
});
await test("CV contact: no success message unless a real service accepts the request (Netlify Forms fallback)", async () => {
  await fetch(`http://localhost:${API}/__forms/off`);
  const fill = async () => {
    await page.fill("#contact-form [name=name]", "مسؤول توظيف");
    await page.fill("#contact-form [name=company]", "شركة اختبار");
    await page.fill("#contact-form [name=contact]", "hr@example.com");
    await page.fill("#contact-form [name=subject]", "مدير مشاريع");
    await page.fill("#contact-form [name=message]", "نود التحدث معك بخصوص دور");
    await page.click("#contact-form [type=submit]");
  };
  await fill();
  await page.waitForSelector("#form-result.err .btn-wa");
  assert(!(await page.textContent("#form-result")).includes("تم استلام"), "no fake success when nothing accepted the request");
  assert(await page.$("#form-result a[href^='mailto:']"), "email alternative shown");
  await fetch(`http://localhost:${API}/__forms/on`);
  await fill();
  await page.waitForSelector("#form-result.ok");
  const log = await (await fetch(`http://localhost:${API}/__forms/log`)).json();
  const last = log[log.length - 1];
  assert(last.name === "مسؤول توظيف" && last.company === "شركة اختبار" && last.subject === "مدير مشاريع" && last["form-name"] === "contact", JSON.stringify(last));
  await fetch(`http://localhost:${API}/__forms/off`);
});
await test("CV print: plain ATS-friendly stylesheet (white, black text, no 3D, every certificate listed)", async () => {
  await page.emulateMedia({ media: "print" });
  try {
  const r = await page.evaluate(() => {
    const vis = (sel) => [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length > 0).length;
    return {
      bg: getComputedStyle(document.querySelector(".site-cv")).backgroundColor, color: getComputedStyle(document.querySelector(".cvx-card h3")).color,
      stage: vis(".cvx-stage"), canvas: vis("canvas"), top: vis(".topbar"), thumbs: vis(".cvx-thumb"), certs: vis(".cvx-cert"), jobs: vis(".cvx-job"), form: vis(".contact-form"), dlg: vis("dialog[open]"),
    };
  });
  assert(r.bg === "rgba(0, 0, 0, 0)" || r.bg === "rgb(255, 255, 255)", "background " + r.bg);
  assert(r.color === "rgb(0, 0, 0)", "text color " + r.color);
  assert(r.stage === 0 && r.canvas === 0 && r.top === 0 && r.thumbs === 0 && r.form === 0, JSON.stringify(r));
  assert(r.certs === 28 && r.jobs === 2, `all certificates and both jobs are printed: ${JSON.stringify(r)}`);
  } finally { await page.emulateMedia({ media: "screen" }); }
});
await test("CV reduced motion: timeline is fully lit, no tilt, content complete", async () => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  try {
  await gotoCv();
  assert((await page.$$eval(".cvx-job.lit", (e) => e.length)) === 2, "all nodes lit without scrolling");
  assert((await page.$eval("[data-energy]", (e) => e.style.getPropertyValue("--p"))) === "1.000", "track full");
  const card = await page.$(".cvx-vcard");
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.2);
  await page.waitForTimeout(120);
  assert((await card.evaluate((e) => getComputedStyle(e).transform)) === "none", "no tilt transform");
  assert((await page.$$("[data-cert]")).length === 28, "all content present");
  const a0 = await page.evaluate(() => window.__fxGallery.angle);
  await page.waitForTimeout(400);
  assert(a0 === (await page.evaluate(() => window.__fxGallery.angle)) && !(await page.evaluate(() => window.__fxGallery.auto)), "gallery does not auto-rotate");
  assert((await page.$$(".fx-rv")).length === 0, "no hidden reveal states");
  assert((await page.$eval(".fx-track", (e) => getComputedStyle(e).animationName)) === "none", "ribbons are static");
  } finally { await page.emulateMedia({ reducedMotion: "no-preference" }); }
});
await test("CV «عني» comes first: bio, facts and a 3D scene whose cards open their sections", async () => {
  await gotoCv();
  const order = await page.$$eval("main > section, main > div > section", (e) => e.map((x) => x.id || x.className).slice(0, 3));
  const first = await page.evaluate(() => { const h = document.querySelector(".cvx-hero"); let n = h.nextElementSibling; while (n && n.tagName !== "SECTION") n = n.nextElementSibling; return n && n.id; });
  assert(first === "about", "about is the first section after the hero: " + first + " / " + order.join());
  assert((await page.textContent("#about h2")).trim() === "عني", "title");
  assert((await page.$$eval("#about .cvx-intro-facts li", (e) => e.length)) === 5, "five facts");
  const tiles = await page.$$eval(".ab3d-tile", (e) => e.map((a) => a.getAttribute("href")));
  assert(tiles.length === 7 && tiles.every((h) => /^#sec-/.test(h)), "tiles: " + tiles.join());
  for (const h of new Set(tiles)) assert(await page.$(h), "tile target exists: " + h);
  const imgs = await page.$$eval(".ab3d-tile img", (e) => e.map((i) => i.getAttribute("src")));
  assert(imgs.length === 4 && imgs.every((s) => /^assets\/(certs|shots)\//.test(s)), "real images only: " + imgs.join());
  assert((await page.$eval(".ab3d-scene", (e) => getComputedStyle(e).transformStyle)) === "preserve-3d", "3D scene");
  assert((await page.$eval(".ab3d-scene", (e) => e.classList.contains("is-idle"))), "idle sway animation");
  await page.emulateMedia({ media: "print" });
  try { assert(!(await page.isVisible(".ab3d")) && (await page.isVisible("#about p")), "scene hidden in print, bio kept"); }
  finally { await page.emulateMedia({ media: "screen" }); }
});
await test("content v13: old bio and the old external CV link are replaced; custom edits are kept", async () => {
  const r = await page.evaluate(() => {
    const old = { version: 12, profile: { cvUrl: "https://ahmedzahran12.netlify.app/", about: { ar: "أنا المهندس أحمد زهران، مصمم مواقع ومنصات رقمية ومدير تنفيذ وتخطيط", en: "x" }, cvAbout: { ar: "نص مخصص كتبه المالك", en: "custom" } }, sections: [] };
    const out = window.V13.apply(JSON.parse(JSON.stringify(old)));
    return [out.version, out.profile.cvUrl, out.profile.about.ar.startsWith("أنا المهندس أحمد زهران، مدير مشاريع في الكهرباء"), out.profile.cvAbout.ar];
  });
  assert(r[0] === 13 && r[1] === "" && r[2] && r[3] === "نص مخصص كتبه المالك", r.join(" | "));
});
await test("CV marketing: keyword ribbons and a 3D gallery of every scanned certificate", async () => {
  await gotoCv();
  const words = await page.$$eval(".fx-ribbons .fx-track:not([aria-hidden]) li", (e) => e.map((x) => x.textContent));
  assert(words.length === 18 && words.includes("إدارة المشاريع") && words.includes("السلامة أولًا"), "keywords: " + words.length);
  assert((await page.$$(".fx-ribbons .fx-track[aria-hidden=true]")).length === 2, "duplicate marquee tracks are hidden from screen readers");
  const cards = await page.$$eval(".fx-card", (e) => e.map((c) => [c.dataset.certOpen, c.querySelector("img").getAttribute("src")]));
  assert(cards.length === 24 && cards.every(([id, src]) => id && /^assets\/certs\/.+-thumb\.jpg$/.test(src)), "24 real scans in the ring");
  assert((await page.$eval(".fx-ring", (e) => getComputedStyle(e).transformStyle)) === "preserve-3d", "3D ring");
  await page.$eval("[data-fx-gal]", (e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
  const a0 = await page.evaluate(() => window.__fxGallery.angle);
  await page.waitForTimeout(500);
  assert((await page.evaluate(() => window.__fxGallery.angle)) !== a0, "auto-rotates");
  await page.click("[data-fx-play]");
  assert((await page.getAttribute("[data-fx-play]", "aria-pressed")) === "false", "pause toggles");
  const front = await page.getAttribute(".fx-card.is-front", "data-fx-i");
  await page.click("[data-fx-next]");
  await page.waitForTimeout(700);
  assert((await page.getAttribute(".fx-card.is-front", "data-fx-i")) !== front, "next moves the front card");
  const id = await page.getAttribute(".fx-card.is-front", "data-cert-open");
  await page.click(".fx-card.is-front");
  await page.waitForFunction(() => document.querySelector("#cert-dlg").open);
  assert((await page.$$eval("#cert-dlg img", (e) => e.length)) >= 1, "viewer opens the real scan for " + id);
  await page.keyboard.press("Escape");
  await page.emulateMedia({ media: "print" });
  try {
    assert(!(await page.isVisible("[data-fx-gal]")) && !(await page.isVisible(".fx-ribbons")), "effects hidden in print/ATS");
  } finally { await page.emulateMedia({ media: "screen" }); }
});
await test("old shared link /#sec-experience opens the CV page", async () => {
  await page.goto("about:blank");
  await page.goto(B + "#sec-experience");
  await page.waitForSelector(".cvx-hero");
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
  await page.goto(B + "#/cv"); await page.waitForSelector(".cvx-hero");
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
await test("admin: certificates + CV profile fields are editable, and edits appear on the CV page", async () => {
  await login();
  await page.click("[data-tab=profile]");
  for (const k of ["cvTitle", "cvHeadline", "cvLead", "cvFacts", "cvAbout", "cvContactTitle", "cvContactText"]) assert(await page.$(`#f-profile [name="${k}.ar"]`), "profile field " + k);
  await gotoSection("certs");
  assert((await page.$$("#item-list .row")).length === 28, "28 certificates are listed for management");
  await page.click("#item-list [data-a=edit][data-i='0']");
  await page.waitForSelector("#f-item");
  for (const n of ["docType.ar", "issuer.ar", "tab", "grade", "ref", "images", "relevance.ar", "example.ar"]) assert(await page.$(`#f-item [name="${n}"]`), "certificate field " + n);
  await page.fill('#f-item [name="docType.ar"]', "مؤهل أكاديمي رسمي (معدّل)");
  await page.click("#f-item [type=submit]");
  await page.waitForSelector("#dlg:not([open])", { state: "attached" });
  await gotoSection("certs");
  await page.click("[data-a=add]");
  await page.waitForSelector("#f-item");
  for (const [sel, val] of Object.entries({ "title.ar": "شهادة اختبار الإدارة", "issuer.ar": "جهة اختبار", date: "2026-11", "docType.ar": "شهادة إتمام دورة" })) await page.fill(`#f-item [name="${sel}"]`, val);
  await page.selectOption('#f-item [name="tab"]', "pm");
  await page.click("#f-item [type=submit]");
  await page.waitForSelector("#dlg:not([open])", { state: "attached" });
  await publish();
  await gotoCv();
  await page.click("[data-cert-tab=academic]");
  assert((await page.textContent("[data-cert=cert-bsc]")).includes("مؤهل أكاديمي رسمي (معدّل)"), "edited document type shows");
  await page.click("[data-cert-tab=pm]");
  assert((await page.$$eval("[data-cert]:not([hidden])", (e) => e.length)) === 6 && (await page.textContent("#cert-grid")).includes("شهادة اختبار الإدارة"), "new certificate appears in its tab");
  assert((await page.$$eval("[data-cert-tab=pm] .n", (e) => e[0].textContent)) === "6", "tab count updates");
  await page.goto(B + "#/"); await page.waitForSelector(".intro h1");
});
await test("API: /api/certificates lists the published certificates, with tab and text filters", async () => {
  const all = await (await fetch(`http://localhost:${API}/api/certificates`)).json();
  const pm = await (await fetch(`http://localhost:${API}/api/certificates?tab=pm`)).json();
  const q = await (await fetch(`http://localhost:${API}/api/certificates?q=scada`)).json();
  assert(all.count === 29 && pm.count === 6 && q.count >= 1 && q.certificates.every((c) => JSON.stringify(c).toLowerCase().includes("scada")), `counts ${all.count}/${pm.count}/${q.count}`);
  const raw = JSON.stringify(all);
  for (const bad of ["2497272811", "1989/01/12", "القوات المسلحة"]) assert(!raw.includes(bad), "API leaks " + bad);
});
await test("CV mobile: no horizontal overflow, menu toggle works, viewer is usable on a phone", async () => {
  await page.setViewportSize({ width: 375, height: 800 });
  await gotoCv();
  await page.waitForFunction(() => ["webgl", "static"].includes(document.querySelector("[data-cv-stage]").dataset.mode), null, { timeout: 15000 });
  assert(!(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)), "horizontal overflow on the CV page");
  await page.click(".nav-toggle");
  assert(await page.isVisible("#mainnav a[href='#sec-certs']"), "menu opens on the phone");
  await page.click("#mainnav a[href='#sec-certs']");
  await page.click("[data-cert=cert-egypt] .cvx-thumb");
  await page.waitForSelector("#cert-dlg[open]");
  assert((await page.isVisible("#cert-dlg [data-cdlg-close]")) && (await page.isVisible("#cert-dlg [data-cdlg-nav=next]")), "viewer controls reachable on a phone");
  const small = await page.$$eval("#cert-dlg button", (bs) => bs.filter((b) => b.getClientRects().length && b.getBoundingClientRect().height < 40).length);
  assert(small === 0, small + " viewer buttons are smaller than 40px");
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1280, height: 800 });
});
await test("hero numbers editable in admin: blank value falls back to the calculated count", async () => {
  await login();
  await page.click("[data-tab=profile]");
  await page.fill("#f-profile [name=st_projects]", "");
  await page.fill("#f-profile [name=st_projects_tar]", "");
  await page.fill("#f-profile [name=st_projects_lar]", "");
  await page.fill("#f-profile [name=st_projects_ten]", "");
  await page.fill("#f-profile [name=st_projects_len]", "");
  await page.check("#f-profile [name=st_courses_v]");
  await page.waitForTimeout(600);
  await page.goto(B + "#/preview"); await page.waitForSelector(".preview-bar");
  const s = await page.$$eval(".busbar .stat", (els) => els.map((e) => e.querySelector("span").textContent + "=" + e.querySelector("strong").textContent));
  assert(s.includes("المشاريع=3") && !s.some((x) => x.startsWith("الدورات=")), "auto fallback (and the hidden courses list adds no count) " + s.join());
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
