// Home page showcase: 3D hero stage, platform rows, details dialog with an illustrative demo, services, about, process.
// The 3D is CSS transforms + isometric SVG (no WebGL), so it is light and works on every device.
// Project Manager | Eng. Ahmed Zahran
(function () {
  const { t, loc, esc, safeUrl, lines, waLink } = AZ;
  const T = (ar, en) => (AZ.state.lang === "en" ? en : ar);

  /* ---------- isometric drawing helpers ---------- */
  const P = (x, y, z = 0) => [((x - y) * 0.866).toFixed(1), ((x + y) * 0.5 - z).toFixed(1)];
  const poly = (pts, fill, extra = "") => `<polygon points="${pts.map((p) => p.join(",")).join(" ")}" fill="${fill}" ${extra}/>`;
  // cuboid with its near corner at (x,y,z), size w (x), d (y), h (z)
  const box = (x, y, z, w, d, h, [top, left, right]) =>
    poly([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)], left) +
    poly([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], right) +
    poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], top);
  const flat = (x, y, z, w, d, fill, extra = "") => poly([P(x, y, z), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z)], fill, extra);
  const line = (a, b, stroke, w = 2, extra = "") => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const GOLD = ["#f0d9a8", "#b8934f", "#d4af6a"], BLUE = ["#8db6ff", "#2f62c4", "#4d8dff"], STEEL = ["#3a5273", "#1b2f4a", "#27405f"], PAPER = ["#f4f7fb", "#b6c3d4", "#dbe4ef"];
  const svg = (body, vb = "-150 -150 300 230") => `<svg viewBox="${vb}" class="iso" aria-hidden="true" focusable="false">${body}</svg>`;
  const ground = (r = 120) => flat(-r / 2, -r / 2, 0, r, r, "rgba(77,141,255,.07)", 'stroke="rgba(77,141,255,.35)" stroke-width="1" stroke-dasharray="4 5"');

  const SCENES = {
    // book + learning cards + progress path
    learn: () => svg(
      ground(150) +
      box(-50, -30, 0, 70, 50, 8, BLUE) + box(-46, -26, 8, 62, 42, 5, PAPER) + box(-50, -30, 13, 70, 50, 4, GOLD) +
      flat(-40, -22, 17.2, 34, 4, "#081322") + flat(-40, -12, 17.2, 22, 3, "rgba(8,19,34,.6)") +
      `<g class="bob">` + box(34, -40, 30, 34, 4, 26, PAPER) + box(40, -20, 44, 34, 4, 26, GOLD) + `</g>` +
      [0, 1, 2, 3].map((i) => { const a = P(-55 + i * 28, 45), done = i < 3; return `<circle cx="${a[0]}" cy="${a[1]}" r="6" fill="${done ? "#d4af6a" : "#12243a"}" stroke="#d4af6a" stroke-width="2"/>` + (i < 3 ? line(P(-49 + i * 28, 45), P(-33 + i * 28, 45), "#d4af6a", 2, i === 2 ? 'stroke-dasharray="3 4"' : "") : ""); }).join("")),
    // mini power grid wired to a dashboard panel
    grid: () => svg(
      ground(160) +
      [[-55, -35], [-5, -35]].map(([x, y]) => box(x, y, 0, 6, 6, 62, STEEL) + box(x - 12, y + 1, 50, 30, 4, 3, GOLD) + box(x - 8, y + 1, 36, 22, 4, 3, GOLD)).join("") +
      line(P(-64, -32, 52), P(-14, -32, 52), "#d4af6a", 1.5) + line(P(-37, -32, 52), P(13, -32, 52), "#d4af6a", 1.5) +
      box(-40, 20, 0, 22, 18, 20, BLUE) + box(-36, 24, 20, 14, 10, 5, STEEL) +
      `<path class="flow" d="M ${P(-2, -32, 52).join(" ")} L ${P(-29, 29, 25).join(" ")} L ${P(30, 30, 40).join(" ")}" fill="none" stroke="#4d8dff" stroke-width="2" stroke-dasharray="5 6"/>` +
      `<g class="bob">` + box(26, 6, 22, 58, 4, 44, STEEL) + poly([P(30, 6, 60), P(80, 6, 60), P(80, 6, 28), P(30, 6, 28)], "#0d1c30") +
      [0, 1, 2].map((i) => poly([P(36 + i * 14, 6, 34), P(44 + i * 14, 6, 34), P(44 + i * 14, 6, 40 + i * 6), P(36 + i * 14, 6, 40 + i * 6)], i === 2 ? "#d4af6a" : "#4d8dff")).join("") + `</g>`),
    // small buildings + a property card + filter chips
    estate: () => svg(
      ground(160) +
      box(-55, -45, 0, 30, 30, 70, STEEL) + box(-15, -40, 0, 26, 26, 44, BLUE) + box(-52, 0, 0, 34, 28, 26, PAPER) + box(-48, 4, 26, 26, 20, 8, GOLD) +
      [0, 1, 2, 3].map((i) => flat(-25.1 + 0.2, -40 + 4, 0, 0, 0, "none") + poly([P(-25, -41 + 0, 12 + i * 14), P(-25, -41 + 0, 20 + i * 14), P(-25, -35, 20 + i * 14), P(-25, -35, 12 + i * 14)], "rgba(240,217,168,.85)") + poly([P(-25, -29, 12 + i * 14), P(-25, -29, 20 + i * 14), P(-25, -23, 20 + i * 14), P(-25, -23, 12 + i * 14)], "rgba(240,217,168,.5)")).join("") +
      `<g class="bob">` + box(24, -6, 20, 56, 4, 40, PAPER) + poly([P(28, -6, 56), P(76, -6, 56), P(76, -6, 40), P(28, -6, 40)], "#4d8dff") + poly([P(28, -6, 36), P(62, -6, 36), P(62, -6, 32), P(28, -6, 32)], "#081322") + poly([P(28, -6, 28), P(50, -6, 28), P(50, -6, 25), P(28, -6, 25)], "#b8934f") + `</g>` +
      [0, 1, 2].map((i) => box(20 + i * 22, 44, 0, 18, 10, 4, i === 1 ? GOLD : STEEL)).join("")),
    // idea -> structured text -> interface preview
    prompt: () => svg(
      ground(160) +
      `<g class="bob"><circle cx="${P(-50, -20, 46)[0]}" cy="${P(-50, -20, 46)[1]}" r="15" fill="#d4af6a"/><rect x="${P(-50, -20, 46)[0] - 6}" y="${+P(-50, -20, 46)[1] + 14}" width="12" height="7" rx="2" fill="#b8934f"/></g>` +
      box(-62, -32, 0, 24, 24, 8, STEEL) +
      box(-18, -24, 0, 44, 34, 5, PAPER) + [0, 1, 2, 3].map((i) => flat(-12, -18 + i * 7, 5.2, i % 2 ? 24 : 32, 3, i === 0 ? "#b8934f" : "#27405f")).join("") +
      box(34, 4, 0, 52, 40, 6, BLUE) + flat(38, 8, 6.2, 44, 8, "#081322") + flat(38, 20, 6.2, 20, 20, "#f4f7fb") + flat(62, 20, 6.2, 20, 9, "#d4af6a") + flat(62, 31, 6.2, 20, 9, "rgba(244,247,251,.6)") +
      `<path class="flow" d="M ${P(-38, -20, 10).join(" ")} L ${P(-18, -8, 10).join(" ")} M ${P(26, -4, 10).join(" ")} L ${P(40, 10, 10).join(" ")}" fill="none" stroke="#d4af6a" stroke-width="2.5" stroke-dasharray="5 6"/>`),
    // gate + visitor card + notification
    gate: () => svg(
      ground(160) +
      box(-58, -30, 0, 12, 12, 64, STEEL) + box(4, -30, 0, 12, 12, 64, STEEL) + box(-58, -30, 64, 74, 12, 8, GOLD) +
      box(-44, -25, 22, 46, 3, 5, GOLD) + box(-44, -25, 8, 46, 3, 3, STEEL) +
      box(-50, 22, 0, 26, 20, 26, BLUE) + box(-46, 26, 26, 18, 12, 4, STEEL) +
      `<g class="bob">` + box(30, 0, 18, 48, 4, 32, PAPER) + `<circle cx="${P(42, 0, 38)[0]}" cy="${P(42, 0, 38)[1]}" r="6" fill="#27405f"/>` + poly([P(52, 0, 42), P(72, 0, 42), P(72, 0, 38), P(52, 0, 38)], "#081322") + poly([P(52, 0, 34), P(66, 0, 34), P(66, 0, 31), P(52, 0, 31)], "#b8934f") + `</g>` +
      `<g class="ping"><circle cx="${P(70, 40, 60)[0]}" cy="${P(70, 40, 60)[1]}" r="13" fill="#d4af6a"/><path d="M ${+P(70, 40, 60)[0] - 5} ${+P(70, 40, 60)[1] + 3} q5 -14 10 0 z" fill="#081322"/><circle cx="${P(70, 40, 60)[0]}" cy="${+P(70, 40, 60)[1] + 5}" r="1.8" fill="#081322"/></g>` +
      `<path class="flow" d="M ${P(54, 2, 30).join(" ")} L ${P(68, 36, 52).join(" ")}" fill="none" stroke="#4d8dff" stroke-width="2" stroke-dasharray="4 5"/>`),
    generic: () => svg(ground(150) + box(-45, -35, 0, 80, 60, 6, STEEL) + `<g class="bob">` + box(-35, -25, 24, 70, 50, 5, BLUE) + box(-25, -15, 48, 60, 40, 5, GOLD) + `</g>`),
  };
  const scene = (k) => (SCENES[k] || SCENES.generic)();

  /* ---------- status + small bits ---------- */
  const ICON = () => PublicView.ICON;
  const statusBadge = (st) => (st && st !== "none" ? `<span class="badge status-${esc(st)}">${esc(t("status_" + st))}</span>` : "");
  const hostLabel = (u) => { try { return new URL(u).host; } catch { return ""; } };
  const realPlatforms = (sec) => (sec ? sec.items.filter((i) => i.visible !== false && !i.cta) : []);
  const itemText = (it) => Object.values(it).map((v) => (v && typeof v === "object" ? `${v.ar || ""} ${v.en || ""}` : typeof v === "string" ? v : "")).join(" ").toLowerCase();

  /* ---------- hero ---------- */
  function hero(c, { stats, wa }) {
    const pr = c.profile, photo = safeUrl(pr.photo);
    return `<section class="intro" id="top">
      <div class="intro-bg" aria-hidden="true"></div>
      <div class="wrap intro-in">
        <div class="intro-text">
          <p class="hero-name">${esc(loc(pr.name))}</p>
          <p class="role">${esc(loc(pr.title)).split("|").map((x) => `<span>${x.trim()}</span>`).join("")}</p>
          <h1>${esc(loc(pr.headline) || loc(pr.name))}</h1>
          <p class="lead">${esc(loc(pr.bio))}</p>
          <div class="intro-actions">
            <a class="btn btn-blue" href="#sec-platforms">${esc(t("explore"))}</a>
            <a class="btn btn-line" href="#sec-contact">${esc(t("discuss"))}</a>
          </div>
        </div>
        <div class="stage" data-anim>
          <div class="stage-world">
            <div class="st-plan" aria-hidden="true">
              <svg viewBox="0 0 400 300" preserveAspectRatio="none"><defs><pattern id="g1" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="rgba(77,141,255,.28)" stroke-width="1"/></pattern></defs>
                <rect width="400" height="300" fill="url(#g1)"/><rect x="1" y="1" width="398" height="298" fill="none" stroke="rgba(77,141,255,.55)" stroke-width="2"/>
                <path d="M40 40h150v90H40z M210 40h150v60H210z M210 120h150v140H210z M40 150h150v110H40z" fill="rgba(77,141,255,.06)" stroke="rgba(244,247,251,.55)" stroke-width="1.5"/>
                <path class="route" d="M60 240 L60 130 L200 130 L200 70 L340 70" fill="none" stroke="#d4af6a" stroke-width="3" stroke-dasharray="7 7"/>
                <g fill="#d4af6a"><circle cx="60" cy="240" r="6"/><circle cx="200" cy="130" r="6"/><circle cx="340" cy="70" r="6"/></g>
                <path d="M40 280h320M40 274v12M360 274v12" stroke="rgba(182,195,212,.7)" stroke-width="1.2" fill="none"/></svg>
            </div>
            <div class="st-browser" aria-hidden="true"><div class="chrome"><i></i><i></i><i></i></div>
              <div class="b-hero"><b></b><b></b><em></em></div><div class="b-cards"><i></i><i></i><i></i></div></div>
            <div class="st-gantt" aria-hidden="true"><i style="--w:70%"></i><i style="--w:45%;--o:20%"></i><i style="--w:55%;--o:40%"></i></div>
            <svg class="st-links" viewBox="0 0 400 400" aria-hidden="true"><path d="M90 300 C120 220 160 200 215 150 M300 290 C300 240 280 200 245 160 M210 330 C210 280 222 230 228 170" fill="none" stroke="rgba(212,175,106,.75)" stroke-width="1.5" stroke-dasharray="4 5"/>
              <g fill="#d4af6a"><circle cx="90" cy="300" r="5"/><circle cx="300" cy="290" r="5"/><circle cx="210" cy="330" r="5"/></g></svg>
            ${photo ? `<figure class="st-portrait"><img src="${esc(photo)}" alt="${esc(loc(pr.name))}" width="200" height="250"></figure>` : ""}
          </div>
        </div>
      </div>
      ${stats.length ? `<div class="busbar wrap" aria-label="stats">
        <div class="bus" aria-hidden="true"></div>
        <div class="feeders">${stats.map((s) => `<div class="stat"><i class="brk" aria-hidden="true"></i><strong>${esc(s.v)}</strong><span>${esc(t(s.k))}</span></div>`).join("")}</div>
        ${stats.every((x) => !x.manual) ? `<p class="stat-note">${esc(t("stat_note"))}</p>` : ""}</div>` : ""}
    </section>`;
  }

  /* ---------- platforms ---------- */
  function platforms(sec, c, opts = {}) {
    let items = realPlatforms(sec);
    if (opts.order) {
      const rank = (it) => { const k = opts.order.findIndex((h) => hostLabel(it.url) === h); return k < 0 ? 99 : k; };
      items = items.slice().sort((a, b) => rank(a) - rank(b));
    }
    if (!items.length) return "";
    return `<section class="section sec-platforms" id="sec-${esc(sec.id)}" data-section-block="${esc(sec.id)}"><div class="wrap">
      <header class="head2"><h2>${esc(opts.title || loc(sec.title))}</h2><p>${esc(opts.sub || t("platformsSub"))}</p></header>
      <nav class="pf-index" aria-label="${esc(t("navPlatforms"))}">${items.map((it) => `<a href="#pf-${esc(it.id)}"><i class="dot status-${esc(it.status || "none")}"></i>${esc(loc(it.title))}</a>`).join("")}</nav>
      ${items.map((it, i) => {
        const shot = safeUrl(it.image), ben = lines(it.benefits);
        return `<article class="pf ${i % 2 ? "pf-flip" : ""}" id="pf-${esc(it.id)}" data-filter-item data-text="${esc(itemText(it))}">
          <div class="pf-visual" data-anim>
            <div class="pf-world">
              <div class="pf-screen"><div class="chrome"><i></i><i></i><i></i><span dir="ltr">${esc(hostLabel(it.url))}</span></div>
                ${shot ? `<img src="${esc(shot)}" alt="${esc(t("shotOf"))} ${esc(loc(it.title))}" loading="lazy" width="960" height="600">` : `<div class="pf-noshot" aria-hidden="true"></div>`}</div>
              <div class="pf-obj">${scene(it.scene)}</div>
            </div>
          </div>
          <div class="pf-body">
            <p class="pf-top">${statusBadge(it.status)}${it.featured ? `<span class="badge badge-gold">${esc(t("featured"))}</span>` : ""}</p>
            <h3>${esc(loc(it.title))}</h3>
            ${loc(it.pitch) ? `<p class="pf-pitch">${esc(loc(it.pitch))}</p>` : ""}
            ${loc(it.description) ? `<p class="pf-desc">${esc(loc(it.description))}</p>` : ""}
            ${loc(it.audience) || loc(it.problem) ? `<dl class="pf-facts">
              ${loc(it.audience) ? `<div><dt>${esc(t("forWho"))}</dt><dd>${esc(loc(it.audience))}</dd></div>` : ""}
              ${loc(it.problem) ? `<div><dt>${esc(t("theProblem"))}</dt><dd>${esc(loc(it.problem))}</dd></div>` : ""}</dl>` : ""}
            ${ben.length ? `<ul class="pf-benefits">${ben.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
            ${loc(it.note) ? `<p class="pf-note">${esc(loc(it.note))}</p>` : ""}
            <div class="pf-actions">
              <button type="button" class="btn btn-blue" data-pf-open="${esc(it.id)}">${ICON().tri}<span>${esc(t("howItWorks"))}</span></button>
              ${opts.visit && safeUrl(it.url) ? `<a class="btn btn-gold" data-pf-visit href="${esc(safeUrl(it.url))}" target="_blank" rel="noopener noreferrer">${ICON().ext}<span>${esc(opts.visitLabel || "")}</span></a>` : ""}
              <button type="button" class="btn btn-line" data-pf-share="${esc(it.id)}">${ICON().share}<span>${esc(t("share"))}</span></button>
              <button type="button" class="btn btn-line" data-pf-copy="${esc(it.id)}">${ICON().copy}<span>${esc(t("copyUrl"))}</span></button>
            </div>
          </div>
        </article>`;
      }).join("")}
    </div></section>`;
  }

  /* ---------- services ---------- */
  function services(sec, platSec, c, { wa }) {
    if (!sec) return "";
    const items = sec.items.filter((i) => i.visible !== false);
    const offers = platSec ? platSec.items.filter((i) => i.visible !== false && i.cta) : [];
    const ct = c.contact || {};
    if (!items.length && !offers.length) return "";
    return `<section class="section sec-services" id="services" data-section-block="${esc(sec.id)}"><div class="wrap">
      <header class="head2"><h2>${esc(loc(sec.title))}</h2><p>${esc(t("servicesSub"))}</p></header>
      <div class="svc-grid">${items.map((it) => `<article class="svc" data-filter-item data-text="${esc(itemText(it))}">
        <h3>${esc(loc(it.title))}</h3>${loc(it.description) ? `<p>${esc(loc(it.description))}</p>` : ""}
        ${lines(it.list).length ? `<ul>${lines(it.list).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</article>`).join("")}</div>
      <div class="svc-cta">
        <div><h3>${esc(t("servicesCta"))}</h3></div>
        <div class="svc-actions">
          <a class="btn btn-gold" href="#sec-contact">${esc(t("discuss"))}</a>
          ${offers.map((o) => {
            const u = safeUrl(o.url);
            const owa = ct.whatsapp?.visible !== false ? waLink(ct, `${loc(ct.whatsappMessage)} ${loc(o.title)}`.trim()) : "";
            return `<div class="offer" data-offer="${esc(o.id)}"><strong>${esc(loc(o.title))}</strong>${loc(o.description) ? `<span>${esc(loc(o.description))}</span>` : ""}
              <span class="offer-actions">${u ? `<a class="btn btn-line btn-small" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${ICON().ext}<span>${esc(loc(o.buttonLabel) || t("openLink"))}</span></a>` : ""}
              ${owa ? `<a class="btn btn-wa btn-small" href="${esc(owa)}" target="_blank" rel="noopener noreferrer">${ICON().wa}<span>${esc(t("waShort"))}</span></a>` : ""}</span></div>`;
          }).join("")}
        </div>
      </div>
    </div></section>`;
  }

  /* ---------- about + process ---------- */
  function about(c, hasCv) {
    const pr = c.profile, text = loc(pr.about), cv = safeUrl(pr.cvUrl);
    if (!text) return "";
    return `<section class="section sec-about" id="about"><div class="wrap about-in">
      <div><header class="head2"><h2>${esc(t("aboutTitle"))}</h2></header>
        ${text.split(/\n\s*\n/).map((p) => `<p>${esc(p.trim())}</p>`).join("")}
        <p class="about-meta">${ICON().pin}<span>${esc(loc(pr.location))}</span></p>
        <div class="about-actions">
          ${hasCv ? `<a class="btn btn-gold" href="#/cv">${ICON().file}<span>${esc(t("fullCv"))}</span></a>` : ""}
          ${cv ? `<a class="btn btn-line btn-cv" href="${esc(cv)}" target="_blank" rel="noopener noreferrer">${ICON().ext}<span>${esc(t("cvSite"))}</span></a>` : ""}
        </div></div>
    </div></section>`;
  }
  function process() {
    return `<section class="section sec-process" id="process"><div class="wrap">
      <header class="head2"><h2>${esc(t("processTitle"))}</h2><p>${esc(t("processSub"))}</p></header>
      <ol class="steps5">${[1, 2, 3, 4, 5].map((n) => `<li><span class="n" aria-hidden="true">${n}</span><h3>${esc(t("p" + n))}</h3><p>${esc(t("p" + n + "d"))}</p></li>`).join("")}</ol>
    </div></section>`;
  }

  /* ---------- illustrative demo frames (one mock screen per step) ---------- */
  const rows = (n, cls = "") => Array.from({ length: n }, (_, i) => `<i class="m-row ${cls}" style="--i:${i}"></i>`).join("");
  const DEMOS = {
    learn: () => [
      `<div class="m-cards">${[T("كهرباء", "Electrical"), T("العقد الموحد", "Unified contract"), T("ذكاء اصطناعي", "AI")].map((x, i) => `<div class="m-card ${i === 1 ? "pick" : ""}" style="--i:${i}"><b></b><span>${x}</span></div>`).join("")}</div>`,
      `<div class="m-player"><div class="m-video"><em></em></div><div class="m-list">${rows(4)}</div></div>`,
      `<div class="m-path">${[1, 2, 3, 4].map((n) => `<i class="${n < 4 ? "ok" : ""}" style="--i:${n}">${n}</i>`).join("")}<span class="m-bar"><u style="--to:75%"></u></span></div>`,
    ],
    grid: () => [
      `<div class="m-table"><div class="m-th"><span>${T("أمر العمل", "Work order")}</span><span>${T("الموقف", "Status")}</span></div>${[T("جارٍ", "In progress"), T("متأخر", "Late"), T("مقفل", "Closed")].map((x, i) => `<div class="m-tr" style="--i:${i}"><i></i><span class="m-chip c${i}">${x}</span></div>`).join("")}</div>`,
      `<div class="m-stages">${[T("تجهيز", "Prep"), T("حفر", "Dig"), T("تنفيذ", "Works"), T("ردم", "Backfill")].map((x, i) => `<div class="${i < 3 ? "ok" : ""}" style="--i:${i}"><b></b><span>${x}</span></div>`).join("")}</div>`,
      `<div class="m-doc">${rows(5)}<span class="m-stamp">${T("معتمد", "Approved")}</span></div>`,
    ],
    estate: () => [
      `<div class="m-filters"><div class="m-input">${T("ابحث بالكلمة أو رقم الوحدة", "Search by word or unit no.")}</div><div class="m-chips">${[T("شقة", "Apartment"), T("فيلا", "Villa"), T("٣ غرف", "3 beds")].map((x, i) => `<span class="m-chip ${i === 0 ? "on" : ""}" style="--i:${i}">${x}</span>`).join("")}</div></div>`,
      `<div class="m-cards">${[0, 1, 2].map((i) => `<div class="m-card ${i !== 1 ? "pick" : ""}" style="--i:${i}"><b></b>${rows(2)}</div>`).join("")}</div><p class="m-cap">${T("مقارنة بين وحدتين", "Comparing two units")}</p>`,
      `<div class="m-chat"><div class="m-bubble">${T("أرغب في الاستفسار عن هذه الوحدة", "I'd like to ask about this unit")}</div><span class="m-btn wa">${T("استفسار واتساب", "WhatsApp inquiry")}</span></div>`,
    ],
    prompt: () => [
      `<div class="m-idea"><div class="m-input type">${T("متجر لقهوة مختصة بتصميم دافئ", "A specialty coffee shop, warm design")}</div><div class="m-chips">${[T("موقع", "Website"), T("فاخر", "Luxury"), T("جوال", "Mobile")].map((x, i) => `<span class="m-chip ${i === 0 ? "on" : ""}" style="--i:${i}">${x}</span>`).join("")}</div></div>`,
      `<div class="m-split"><div class="m-doc">${rows(6)}</div><div class="m-wire"><b></b><i></i><i></i><i></i></div></div>`,
      `<div class="m-doc sel">${rows(5)}<span class="m-btn">${T("نسخ البرومبت", "Copy prompt")}</span></div>`,
    ],
    gate: () => [
      `<div class="m-login"><div class="m-input">${T("البريد الإلكتروني", "Email")}</div><div class="m-input">••••••••</div><span class="m-btn">${T("دخول", "Sign in")}</span></div>`,
      `<div class="m-visitor"><b></b><div>${rows(3)}</div><span class="m-btn">${T("تسجيل الزائر", "Register visitor")}</span></div>`,
      `<div class="m-notify"><div class="m-bell"></div><div class="m-bubble">${T("زائر عند البوابة", "A visitor is at the gate")}</div></div>`,
    ],
    generic: () => [1, 2, 3].map((n) => `<div class="m-doc">${rows(3 + n)}</div>`),
  };

  /* ---------- details dialog ---------- */
  let player = null, opener = null;
  const STEP_MS = 6500; // 3 steps ≈ 19.5 s
  const reduced = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function dialogHTML(it, c) {
    const ct = c.contact || {};
    const steps = lines(it.steps), ben = lines(it.benefits);
    const frames = (DEMOS[it.scene] || DEMOS.generic)();
    const caps = [0, 1, 2].map((i) => steps[i] || `${t("step")} ${i + 1}`);
    const url = safeUrl(it.url);
    const wa = ct.whatsapp?.visible !== false ? waLink(ct, `${t("askAbout")} ${loc(it.title)}`) : "";
    const goalUrl = it.goalUrl === "wa" ? wa : safeUrl(it.goalUrl);
    const join = safeUrl(it.joinUrl);
    return `<form method="dialog" class="pfm" novalidate>
      <header class="pfm-head"><div><p class="pfm-kicker">${statusBadge(it.status)}</p><h2 id="pfm-title">${esc(loc(it.title))}</h2>${loc(it.pitch) ? `<p class="pfm-pitch">${esc(loc(it.pitch))}</p>` : ""}</div>
        <button type="button" class="btn btn-icon pfm-close" data-pfm-close aria-label="${esc(t("close"))}">✕</button></header>
      <div class="pfm-body">
        <section class="pfm-demo" aria-label="${esc(t("demo"))}">
          <p class="demo-tag">${esc(t("demo"))}</p>
          <div class="demo-screen" data-scene="${esc(it.scene || "generic")}"><div class="chrome"><i></i><i></i><i></i></div>
            ${frames.map((f, i) => `<div class="demo-frame ${i === 0 ? "on" : ""}" data-frame="${i}" aria-hidden="${i === 0 ? "false" : "true"}">${f}</div>`).join("")}</div>
          <p class="demo-cap" aria-live="polite"><b>${esc(t("step"))} <span data-demo-n>1</span>/3</b> <span data-demo-cap>${esc(caps[0])}</span></p>
          <div class="demo-progress" aria-hidden="true"><i data-demo-bar></i></div>
          <div class="demo-controls">
            <button type="button" class="btn btn-line btn-small" data-demo-toggle aria-pressed="false">${esc(t("play"))}</button>
            <div class="demo-steps" role="group" aria-label="${esc(t("howSteps"))}">${[0, 1, 2].map((i) => `<button type="button" data-demo-go="${i}" aria-label="${esc(t("step"))} ${i + 1}" ${i === 0 ? 'aria-current="step"' : ""}>${i + 1}</button>`).join("")}</div>
          </div>
          <p class="demo-note">${esc(t("demoNote"))}</p>
          <script type="application/json" data-demo-caps>${JSON.stringify(caps).replace(/</g, "\\u003c")}</script>
        </section>
        <section class="pfm-info">
          ${loc(it.audience) ? `<h3>${esc(t("forWho"))}</h3><p>${esc(loc(it.audience))}</p>` : ""}
          ${ben.length ? `<h3>${esc(t("canDo"))}</h3><ul class="pf-benefits">${ben.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : loc(it.description) ? `<h3>${esc(t("canDo"))}</h3><p>${esc(loc(it.description))}</p>` : ""}
          ${steps.length ? `<h3>${esc(t("howSteps"))}</h3><ol class="pfm-steps">${steps.slice(0, 3).map((s) => `<li>${esc(s)}</li>`).join("")}</ol>` : ""}
          ${loc(it.note) ? `<p class="pf-note">${esc(loc(it.note))}</p>` : ""}
        </section>
      </div>
      <footer class="pfm-foot">
        ${loc(it.goalLabel) ? `<p class="pfm-goal">${esc(loc(it.goalLabel))}</p>` : ""}
        <div class="pfm-actions">
          ${url ? `<a class="btn btn-gold btn-big" data-pfm-enter href="${esc(url)}" target="_blank" rel="noopener noreferrer">${ICON().ext}<span>${esc(t("enter"))}</span><small>${esc(t("newTab"))}</small></a>` : ""}
          ${goalUrl && goalUrl !== url && loc(it.goalLabel) ? `<a class="btn btn-blue" data-pfm-goal href="${esc(goalUrl)}" target="_blank" rel="noopener noreferrer">${esc(loc(it.goalLabel))}</a>` : ""}
          ${join && loc(it.joinLabel) ? `<a class="btn btn-line" data-pfm-join href="${esc(join)}" target="_blank" rel="noopener noreferrer">${esc(loc(it.joinLabel))}</a>` : ""}
          <button type="button" class="btn btn-line" data-pf-copy="${esc(it.id)}">${ICON().copy}<span>${esc(t("copyUrl"))}</span></button>
        </div>
      </footer>
    </form>`;
  }

  function makePlayer(dlg) {
    const frames = [...dlg.querySelectorAll(".demo-frame")], bar = dlg.querySelector("[data-demo-bar]"), toggle = dlg.querySelector("[data-demo-toggle]");
    const caps = JSON.parse(dlg.querySelector("[data-demo-caps]").textContent);
    let i = 0, playing = false, start = 0, elapsed = 0, raf = 0, ended = false;
    const show = (n) => {
      i = n;
      frames.forEach((f, k) => { f.classList.toggle("on", k === n); f.setAttribute("aria-hidden", String(k !== n)); });
      dlg.querySelector("[data-demo-n]").textContent = n + 1;
      dlg.querySelector("[data-demo-cap]").textContent = caps[n];
      dlg.querySelectorAll("[data-demo-go]").forEach((b, k) => (k === n ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current")));
    };
    const paint = () => { bar.style.width = Math.min(100, ((i * STEP_MS + elapsed) / (3 * STEP_MS)) * 100) + "%"; };
    const label = () => { toggle.textContent = playing ? t("pause") : ended ? t("replay") : t("play"); toggle.setAttribute("aria-pressed", String(playing)); dlg.querySelector(".demo-screen").classList.toggle("is-paused", !playing); };
    const tick = (now) => {
      if (!playing) return;
      elapsed = now - start;
      if (elapsed >= STEP_MS) {
        if (i < 2) { show(i + 1); start = now; elapsed = 0; }
        else { elapsed = STEP_MS; playing = false; ended = true; paint(); label(); return; }
      }
      paint();
      raf = requestAnimationFrame(tick);
    };
    const play = () => { if (ended) { ended = false; elapsed = 0; show(0); } playing = true; start = performance.now() - elapsed; label(); raf = requestAnimationFrame(tick); };
    const pause = () => { playing = false; cancelAnimationFrame(raf); label(); };
    toggle.addEventListener("click", () => (playing ? pause() : play()));
    dlg.querySelectorAll("[data-demo-go]").forEach((b) => b.addEventListener("click", () => { pause(); ended = false; elapsed = 0; show(+b.dataset.demoGo); paint(); }));
    show(0); paint(); label();
    return { play, pause, get playing() { return playing; }, get step() { return i; } };
  }

  function openPlatform(root, c, id, from) {
    const sec = c.sections.find((s) => s.type === "platforms");
    const it = sec && sec.items.find((x) => x.id === id);
    const dlg = root.querySelector("#pf-dlg");
    if (!it || !dlg) return;
    opener = from || document.activeElement;
    dlg.innerHTML = dialogHTML(it, c);
    dlg.setAttribute("aria-labelledby", "pfm-title");
    player = makePlayer(dlg);
    window.__demo = player;
    dlg.showModal();
    dlg.querySelector("[data-pfm-close]").focus();
    if (!reduced()) player.play();
  }
  function closePlatform(dlg) { if (player) player.pause(); player = null; if (dlg.open) dlg.close(); }

  /* ---------- sharing ---------- */
  async function copyText(text, msg) {
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
    PublicView.toast(msg);
  }
  function platformById(c, id) { const s = c.sections.find((x) => x.type === "platforms"); return s && s.items.find((x) => x.id === id); }

  /* ---------- behaviour ---------- */
  function bind(root, c) {
    const dlg = root.querySelector("#pf-dlg");
    root.querySelectorAll("[data-pf-open]").forEach((b) => b.addEventListener("click", () => openPlatform(root, c, b.dataset.pfOpen, b)));
    if (dlg) {
      dlg.addEventListener("click", (e) => {
        if (e.target === dlg || e.target.closest("[data-pfm-close]")) closePlatform(dlg);
      });
      dlg.addEventListener("close", () => { if (player) player.pause(); player = null; if (opener && document.contains(opener)) opener.focus(); opener = null; });
    }
    if (root._pfClick) root.removeEventListener("click", root._pfClick);
    root._pfClick = async (e) => {
      const cp = e.target.closest("[data-pf-copy]"), sh = e.target.closest("[data-pf-share]");
      if (cp) { const it = platformById(c, cp.dataset.pfCopy); if (it) copyText(safeUrl(it.url), t("linkCopied")); }
      if (sh) {
        const it = platformById(c, sh.dataset.pfShare); if (!it) return;
        const data = { title: loc(it.title), text: loc(it.pitch) || loc(it.description), url: safeUrl(it.url) };
        if (navigator.share) { try { await navigator.share(data); PublicView.toast(t("shared")); } catch {} }
        else copyText(data.url, t("linkCopied"));
      }
    };
    root.addEventListener("click", root._pfClick);

    // Run scene animations only while they are on screen.
    const anims = [...root.querySelectorAll("[data-anim]")];
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => es.forEach((en) => en.target.classList.toggle("is-live", en.isIntersecting)), { rootMargin: "80px" });
      anims.forEach((el) => io.observe(el));
    } else anims.forEach((el) => el.classList.add("is-live"));

    // Limited depth movement with a mouse; none on touch or with reduced motion.
    const stage = root.querySelector(".stage");
    if (stage && !reduced() && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const intro = root.querySelector(".intro"), world = stage.querySelector(".stage-world");
      let rafId = 0;
      intro.addEventListener("pointermove", (e) => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const r = intro.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          world.style.setProperty("--ry", (-x * 10).toFixed(2) + "deg");
          world.style.setProperty("--rx", (y * -6).toFixed(2) + "deg");
        });
      });
      intro.addEventListener("pointerleave", () => { world.style.setProperty("--ry", "0deg"); world.style.setProperty("--rx", "0deg"); });
    }
  }

  window.Home = { hero, platforms, services, about, process, bind, realPlatforms, STEP_MS, scene, iso: { P, poly, box, flat, line, svg, ground, GOLD, BLUE, STEEL, PAPER }, copyText };
})();
