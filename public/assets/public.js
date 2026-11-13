// Public page renderer.
// Project Manager | Eng. Ahmed Zahran
(function () {
  const { t, loc, esc, safeUrl, lines, csv, yearOf, waLink } = AZ;

  const ICON = {
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M3 5h18v14H3z M3 6l9 7 9-7"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M8 8h12v12H8z M4 16V4h12"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
    ext: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M14 4h6v6 M20 4l-9 9 M18 14v6H4V6h6"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M12 3v12 M7 8l5-5 5 5 M5 14v6h14v-6"/></svg>',
    print: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M7 9V3h10v6 M7 17H4V9h16v8h-3 M7 14h10v7H7z"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.6 2.6 0 0 0-1.8 1.8A27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15V9l5.2 3Z"/></svg>',
    li: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1a4.2 4.2 0 0 1 3.8-2.1c4 0 4.8 2.7 4.8 6.1V21h-4v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z"/></svg>',
    file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M6 2h8l4 4v16H6z M14 2v4h4"/></svg>',
    globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M3 11l9-8 9 8 M5 10v10h5v-6h4v6h5V10"/></svg>',
    tri: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M12 21s7-6.3 7-12a7 7 0 0 0-14 0c0 5.7 7 12 7 12Z M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/></svg>',
  };

  const tagName = (content, id) => { const tg = content.tags.find((x) => x.id === id); return tg ? (AZ.state.lang === "en" ? tg.en || tg.ar : tg.ar) : null; };
  const tagChips = (content, item) =>
    (item.tags || []).map((id) => tagName(content, id)).filter(Boolean).map((n) => `<span class="chip">${esc(n)}</span>`).join("");

  const btn = (href, label, icon, cls = "btn btn-ghost") => {
    const u = safeUrl(href);
    if (!u) return "";
    const ext = /^https?:/.test(u) || u.startsWith("/api/file/") || u.startsWith("data:");
    return `<a class="${cls}" href="${esc(u)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}>${ICON[icon] || ""}<span>${esc(label)}</span></a>`;
  };
  const fileBtn = (f) => (f && f.url ? btn(f.url, f.name ? `${t("viewFile")}: ${f.name}` : t("viewFile"), "file") : "");

  const period = (it) => {
    const s = it.start || "", e = it.current ? t("present") : it.end || "";
    if (!s && !e) return "";
    return `<span class="period">${esc(s)}${s && e ? " — " : ""}${esc(e)}</span>`;
  };

  const itemYears = (it) => {
    const ys = new Set();
    const a = yearOf(it.start), b = it.current ? new Date().getFullYear() : yearOf(it.end);
    if (a && b && b >= a && b - a < 60) for (let y = a; y <= b; y++) ys.add(y);
    else if (a) ys.add(a);
    for (const k of ["year", "launchDate"]) { const y = yearOf(it[k]); if (y) ys.add(y); }
    return [...ys];
  };
  const itemStatus = (it, s) => (["platforms", "insurance", "future"].includes(s.type) && it.status !== "none" ? it.status || "" : "");
  const itemText = (it) => {
    const parts = [];
    for (const v of Object.values(it)) {
      if (v && typeof v === "object" && ("ar" in v || "en" in v)) parts.push(v.ar || "", v.en || "");
      else if (typeof v === "string") parts.push(v);
    }
    return parts.join(" ").toLowerCase();
  };
  const dataAttrs = (it, s) =>
    `data-filter-item data-section="${esc(s.id)}" data-years="${itemYears(it).join(",")}" data-status="${esc(itemStatus(it, s))}" data-tags="${esc((it.tags || []).join(","))}" data-text="${esc(itemText(it))}"`;

  const featuredBadge = (it) => (it.featured ? `<span class="badge badge-gold">${ICON.bolt}${esc(t("featured"))}</span>` : "");
  const statusBadge = (st) => (st && st !== "none" ? `<span class="badge status-${esc(st)}">${esc(t("status_" + st))}</span>` : "");
  const thumb = (it, fallbackIcon) => {
    const u = safeUrl(it.image);
    return u ? `<img class="thumb" src="${esc(u)}" alt="" loading="lazy">` : `<div class="thumb thumb-icon">${ICON[fallbackIcon]}</div>`;
  };

  // ---------- card renderers per section type ----------
  const R = {
    experience(it, s, c) {
      const ach = lines(it.achievements);
      const tools = csv(it.tools);
      return `<article class="tl-item ${it.featured ? "is-featured" : ""}" ${dataAttrs(it, s)}>
        <span class="tl-dot" aria-hidden="true"></span>
        <div class="card">
          <div class="card-head"><h3>${esc(loc(it.title))}</h3>${featuredBadge(it)}</div>
          <p class="meta">${esc(loc(it.org))}${loc(it.location) ? ` · <span class="loc">${ICON.pin}${esc(loc(it.location))}</span>` : ""} ${period(it)}</p>
          ${ach.length ? `<ul class="bullets">${ach.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}
          ${tools.length ? `<p class="tools"><strong>${t("tools")}:</strong> ${tools.map((x) => `<span class="chip chip-outline">${esc(x)}</span>`).join("")}</p>` : ""}
          <div class="chips">${tagChips(c, it)}</div>
          <div class="actions">${fileBtn(it.attachment)}${btn(it.link, t("openLink"), "link")}</div>
        </div></article>`;
    },
    projects(it, s, c) {
      const res = lines(it.results), tools = csv(it.tools);
      return `<article class="card ${it.featured ? "is-featured" : ""}" ${dataAttrs(it, s)}>
        ${safeUrl(it.image) ? `<img class="cover" src="${esc(safeUrl(it.image))}" alt="" loading="lazy">` : ""}
        <div class="card-head"><h3>${esc(loc(it.title))}</h3>${featuredBadge(it)}</div>
        ${period(it) ? `<p class="meta">${period(it)}</p>` : ""}
        ${loc(it.description) ? `<p>${esc(loc(it.description))}</p>` : ""}
        ${loc(it.role) ? `<p class="kv"><strong>${t("role")}:</strong> ${esc(loc(it.role))}</p>` : ""}
        ${res.length ? `<p class="kv"><strong>${t("results")}:</strong></p><ul class="bullets">${res.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}
        ${tools.length ? `<p class="tools">${tools.map((x) => `<span class="chip chip-outline">${esc(x)}</span>`).join("")}</p>` : ""}
        <div class="chips">${tagChips(c, it)}</div>
        <div class="actions">${fileBtn(it.attachment)}${btn(it.link, t("openLink"), "link")}</div></article>`;
    },
    skills(it, s, c) {
      return `<article class="card skill ${it.featured ? "is-featured" : ""}" ${dataAttrs(it, s)}>
        <div class="card-head"><h3>${esc(loc(it.title))}</h3>${featuredBadge(it)}</div>
        <div class="chips">${lines(it.list).map((x) => `<span class="chip chip-skill">${esc(x)}</span>`).join("")}</div></article>`;
    },
    education(it, s, c) {
      return `<article class="card" ${dataAttrs(it, s)}>
        <div class="card-head"><h3>${esc(loc(it.title))}</h3>${featuredBadge(it)}</div>
        <p class="meta">${esc(loc(it.org))}${it.year ? ` · <span class="period">${esc(it.year)}</span>` : ""}</p>
        <div class="actions">${fileBtn(it.attachment)}</div></article>`;
    },
    courses(it, s, c) {
      const kind = it.kind === "certificate" ? "certificate" : "course";
      return `<article class="card course ${it.featured ? "is-featured" : ""}" ${dataAttrs(it, s)}>
        <div class="card-head"><h3>${esc(loc(it.title))}</h3>${featuredBadge(it)}</div>
        <p class="meta"><span class="badge ${kind === "certificate" ? "badge-gold" : "badge-blue"}">${esc(t(kind))}</span>
          ${loc(it.provider) ? ` · ${esc(loc(it.provider))}` : ""}${it.year ? ` · <span class="period">${esc(it.year)}</span>` : ""}</p>
        <div class="chips">${tagChips(c, it)}</div>
        <div class="actions">${fileBtn(it.attachment)}${btn(it.link, t("openLink"), "link")}</div></article>`;
    },
    platforms(it, s, c) {
      const u = safeUrl(it.url);
      const ct = c.contact || {};
      const subject = loc(it.title);
      const wa = it.cta && ct.whatsapp?.visible !== false ? waLink(ct, `${loc(ct.whatsappMessage)} ${subject}`.trim()) : "";
      const mail = it.cta && ct.email?.visible !== false && ct.email?.value ? `mailto:${ct.email.value}?subject=${encodeURIComponent(subject)}` : "";
      const cta = (wa ? `<a class="btn btn-wa" href="${esc(wa)}" target="_blank" rel="noopener noreferrer">${ICON.wa}<span>${esc(t("waShort"))}</span></a>` : "") +
        (mail ? `<a class="btn btn-gold" href="${esc(mail)}">${ICON.mail}<span>${esc(t("mailShort"))}</span></a>` : "");
      return `<article class="card platform ${it.cta ? "offer" : ""} ${it.featured ? "is-featured" : ""}" ${dataAttrs(it, s)}>
        <div class="preview" ${it.embed && u ? `data-embed="${esc(u)}"` : ""}>${thumb(it, it.cta ? (u ? "link" : "mail") : "globe")}</div>
        <div class="card-head"><h3>${esc(loc(it.title))}</h3>${featuredBadge(it)}</div>
        <p class="meta">${statusBadge(it.status)}${loc(it.category) ? ` <span class="chip">${esc(loc(it.category))}</span>` : ""}${it.launchDate ? ` · ${t("launched")}: ${esc(it.launchDate)}` : ""}</p>
        ${loc(it.description) ? `<p>${esc(loc(it.description))}</p>` : ""}
        <div class="chips">${tagChips(c, it)}</div>
        <div class="actions">${btn(it.url, loc(it.buttonLabel) || t("openPlatform"), "ext", "btn btn-primary")}${cta}</div></article>`;
    },
    insurance(it, s, c) { return R.platforms({ ...it, embed: false }, s, c); },
    youtube(it, s, c) {
      const u = safeUrl(it.url);
      const vid = (u.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/) || [])[1];
      const embed = it.kind === "video" && vid
        ? `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${vid}" title="${esc(loc(it.title))}" loading="lazy" allowfullscreen allow="encrypted-media; picture-in-picture"></iframe></div>` : "";
      return `<article class="card yt ${it.featured ? "is-featured" : ""}" ${dataAttrs(it, s)}>
        ${embed || `<div class="yt-icon">${ICON.play}</div>`}
        <div class="card-head"><h3>${esc(loc(it.title))}</h3>${featuredBadge(it)}</div>
        <p class="meta"><span class="badge badge-blue">${esc(t("kind_" + (it.kind || "channel")))}</span>
          ${it.subscribers ? ` · ${t("subscribers")}: ${esc(it.subscribers)}` : ""}${it.views ? ` · ${t("views")}: ${esc(it.views)}` : ""}</p>
        ${loc(it.description) ? `<p>${esc(loc(it.description))}</p>` : ""}
        <div class="actions">${btn(it.url, it.kind === "video" ? t("watch") : t("visitChannel"), "ext", "btn btn-primary")}</div></article>`;
    },
    linkedin(it, s, c) {
      return `<article class="card li ${it.featured ? "is-featured" : ""}" ${dataAttrs(it, s)}>
        <div class="card-head"><span class="li-icon">${ICON.li}</span><h3>${esc(loc(it.title))}</h3>${featuredBadge(it)}</div>
        <p class="meta"><span class="badge badge-blue">${esc(t("kind_" + (it.kind || "personal")))}</span></p>
        ${loc(it.description) ? `<p>${esc(loc(it.description))}</p>` : ""}
        <div class="actions">${btn(it.url, t("openPage"), "ext", "btn btn-primary")}</div></article>`;
    },
    pages(it, s, c) {
      return `<article class="card ${it.featured ? "is-featured" : ""}" ${dataAttrs(it, s)}>
        ${safeUrl(it.image) ? `<img class="cover" src="${esc(safeUrl(it.image))}" alt="" loading="lazy">` : ""}
        <div class="card-head"><h3>${esc(loc(it.title))}</h3>${featuredBadge(it)}</div>
        ${loc(it.description) ? `<p>${esc(loc(it.description))}</p>` : ""}
        <div class="chips">${tagChips(c, it)}</div>
        <div class="actions">${btn(it.url, t("openPage"), "ext", "btn btn-primary")}</div></article>`;
    },
    future(it, s, c) {
      return `<article class="card future" ${dataAttrs(it, s)}>
        <div class="card-head"><h3>${esc(loc(it.title))}</h3>${statusBadge(it.status || "planned")}</div>
        ${loc(it.category) ? `<p class="meta"><span class="chip">${esc(loc(it.category))}</span></p>` : ""}
        ${loc(it.description) ? `<p>${esc(loc(it.description))}</p>` : ""}
        <div class="chips">${tagChips(c, it)}</div>
        <div class="actions">${fileBtn(it.attachment)}${btn(it.link, t("openLink"), "link")}</div></article>`;
    },
    custom(it, s, c) {
      const ct = s.cardType || "link";
      const img = safeUrl(it.image);
      return `<article class="card ${it.featured ? "is-featured" : ""}" ${dataAttrs(it, s)}>
        ${ct === "image" && img ? `<img class="cover" src="${esc(img)}" alt="${esc(loc(it.title))}" loading="lazy">` : ""}
        <div class="card-head"><h3>${esc(loc(it.title))}</h3>${featuredBadge(it)}</div>
        ${ct === "text" && loc(it.body) ? `<p class="prose">${esc(loc(it.body)).replace(/\n/g, "<br>")}</p>` : ""}
        ${loc(it.description) ? `<p>${esc(loc(it.description))}</p>` : ""}
        <div class="chips">${tagChips(c, it)}</div>
        <div class="actions">${ct === "link" ? btn(it.url, t("openLink"), "ext", "btn btn-primary") : ""}${ct === "file" ? fileBtn(it.file) : ""}</div></article>`;
    },
  };

  const visibleSections = (c) => c.sections.filter((s) => s.visible !== false && s.items.some((i) => i.visible !== false));

  function computeStats(c) {
    const vis = (type) => c.sections.filter((s) => s.type === type && s.visible !== false).flatMap((s) => s.items.filter((i) => i.visible !== false));
    const exp = vis("experience");
    const starts = exp.map((e) => yearOf(e.start)).filter(Boolean);
    const years = starts.length ? new Date().getFullYear() - Math.min(...starts) : 0;
    const auto = { years: starts.length ? years : 0, projects: vis("projects").length, courses: vis("courses").length, platforms: vis("platforms").filter((i) => !i.cta).length };
    const cfg = c.stats || {};
    return ["years", "projects", "courses", "platforms"].map((k) => {
      const o = cfg[k] || {};
      const manual = String(o.value ?? "").trim();
      return { k: "stat_" + k, v: manual || auto[k], auto: auto[k], manual: !!manual, show: o.show !== false };
    }).filter((x) => x.show && (x.manual || x.v > 0));
  }

  function render(root, c, opts = {}) {
    const lang = AZ.state.lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = `${loc(c.profile.name)} — ${loc(c.profile.title)}`;

    const isCv = opts.page === "cv";
    const CV_TYPES = ["experience", "projects", "skills", "education", "courses"];
    const allSecs = visibleSections(c);
    // The CV sections live on their own page (#/cv); the home page shows everything else.
    const secs = allSecs.filter((x) => CV_TYPES.includes(x.type) === isCv);
    const hasCvPage = allSecs.some((x) => CV_TYPES.includes(x.type));
    const ct = c.contact || {};
    const wa = ct.whatsapp?.visible !== false ? waLink(ct, loc(ct.whatsappMessage)) : "";
    const email = ct.email?.visible !== false ? ct.email?.value || "" : "";
    const stats = computeStats(c);
    const cv = safeUrl(c.profile.cvUrl);
    const navLink = (x) => `<a href="#sec-${esc(x.id)}">${esc(loc(x.title))}</a>`;
    const platSec = secs.find((x) => x.type === "platforms");
    const svcSec = secs.find((x) => x.type === "services");
    const hasPlatforms = !isCv && platSec && Home.realPlatforms(platSec).length > 0;
    const navHTML = isCv
      ? `<a href="#/">${esc(t("navHome"))}</a>` + secs.map(navLink).join("")
      : `<a href="#top">${esc(t("navHome"))}</a>
         ${hasPlatforms ? `<a href="#sec-${esc(platSec.id)}">${esc(t("navPlatforms"))}</a>` : ""}
         ${svcSec ? `<a href="#services">${esc(t("navServices"))}</a>` : ""}
         ${loc(c.profile.about) ? `<a href="#about">${esc(t("navAbout"))}</a>` : ""}`;
    const photo = safeUrl(c.profile.photo);

    const contactBlock = !isCv && (ct.formVisible !== false || wa || email);

    const secHTML = (s) => {
          const items = s.items.filter((i) => i.visible !== false);
          const fn = R[s.type] || R.pages;
          const body = items.map((i) => fn(i, s, c)).join("");
          return `<section class="section sec-${esc(s.type)}" id="sec-${esc(s.id)}" data-section-block="${esc(s.id)}"><div class="wrap">
            <div class="section-head"><h2>${esc(loc(s.title))}</h2>
              <button class="btn btn-icon btn-small no-print" data-act="copy-link" data-id="sec-${esc(s.id)}" title="${esc(t("copyLink"))}" aria-label="${esc(t("copyLink"))}">${ICON.link}</button></div>
            ${s.type === "future" ? `<p class="note">${esc(t("planNote"))}</p>` : ""}
            ${s.type === "experience" ? `<div class="timeline">${body}</div>` : `<div class="grid grid-${esc(s.type)}">${body}</div>`}
          </div></section>`;
        };
    const restSecs = secs.filter((x) => x.type !== "platforms" && x.type !== "services");
    const linkOf = (type) => { const sx = allSecs.find((x) => x.type === type); const it = sx && sx.items.find((i) => i.visible !== false && safeUrl(i.url)); return it ? { url: safeUrl(it.url), title: loc(it.title) } : null; };
    const li = linkOf("linkedin"), yt = linkOf("youtube");
    const startHref = contactBlock ? "#sec-contact" : wa || "#/";

    root.innerHTML = `<div class="site ${isCv ? "site-cv" : "site-home"}">
      <a class="skip" href="#main">${t("skip")}</a>
      ${opts.preview ? `<div class="preview-bar" role="status">${esc(t("preview"))} <a class="btn btn-small" href="#/admin">${esc(t("backToAdmin"))}</a></div>` : ""}
      <header class="topbar">
        <div class="wrap topbar-in">
          <a class="brand" href="${isCv ? "#/" : "#top"}"><span class="brand-mark">${ICON.bolt}</span><span>${esc(loc(c.profile.name))}</span></a>
          <button class="btn btn-icon nav-toggle" aria-expanded="false" aria-controls="mainnav" aria-label="${esc(t("menu"))}">☰</button>
          <nav id="mainnav" class="mainnav" aria-label="sections">
            ${navHTML}
            ${contactBlock ? `<a href="#sec-contact">${esc(t("nav_contact"))}</a>` : ""}
            <button type="button" class="btn btn-small nav-lang" data-act="lang">${esc(t("langToggle"))}</button>
          </nav>
          <div class="top-actions">
            <button class="btn btn-small btn-lang" data-act="lang">${esc(t("langToggle"))}</button>
            <a class="btn btn-small btn-start" href="${esc(startHref)}"${/^https?:/.test(startHref) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(t("startProject"))}</a>
          </div>
        </div>
      </header>

      <main id="main">
        ${isCv ? `        <section class="hero cv-hero" id="top">
          <div class="hero-grid" aria-hidden="true"></div>
          <div class="wrap cv-hero-in">
            <a class="back-link" href="#/">${ICON.home}<span>${esc(t("backHome"))}</span></a>
            <h1>${esc(t("navCv"))}</h1>
            <p class="role">${esc(loc(c.profile.name))}${loc(c.profile.title) ? ` · ${esc(loc(c.profile.title))}` : ""}</p>
            <p class="bio">${esc(t("cvPageSub"))}</p>
            <div class="hero-actions">
              ${wa ? `<a class="btn btn-wa" href="${esc(wa)}" target="_blank" rel="noopener noreferrer">${ICON.wa}<span>${esc(t("whatsapp"))}</span></a>` : ""}
              ${email ? `<a class="btn btn-gold" href="mailto:${esc(email)}">${ICON.mail}<span>${esc(t("emailMe"))}</span></a>` : ""}
              <button class="btn btn-ghost-light no-print" data-act="print">${ICON.print}<span>${esc(t("print"))}</span></button>
            </div>
          </div>
        </section>

` : `
        ${Home.hero(c, { stats, wa })}
        ${hasPlatforms ? Home.platforms(platSec, c) : ""}
        ${Home.services(svcSec, platSec, c, { wa })}
        ${Home.about(c, hasCvPage)}
        ${Home.process()}
`}

        ${restSecs.map(secHTML).join("")}

        ${contactBlock ? `<section class="section wrap contact" id="sec-contact">
          <div class="section-head"><h2>${esc(t("contactTitle"))}</h2>
            <button class="btn btn-icon btn-small no-print" data-act="copy-link" data-id="sec-contact" title="${esc(t("copyLink"))}" aria-label="${esc(t("copyLink"))}">${ICON.link}</button></div>
          <div class="contact-grid">
            <div class="contact-info">
              ${ct.name?.visible !== false && ct.name?.value ? `<p class="contact-name">${esc(ct.name.value)}</p>` : ""}
              ${email ? `<p><a href="mailto:${esc(email)}" class="contact-line">${ICON.mail}<span dir="ltr">${esc(email)}</span></a>
                <button class="btn btn-small btn-icon" data-act="copy-email" data-email="${esc(email)}" aria-label="${esc(t("copyEmail"))}" title="${esc(t("copyEmail"))}">${ICON.copy}</button></p>` : ""}
              ${wa ? `<p><a href="${esc(wa)}" class="contact-line" target="_blank" rel="noopener noreferrer">${ICON.wa}<span dir="ltr">${esc(ct.whatsapp.value)}</span></a></p>` : ""}
            </div>
            ${ct.formVisible !== false ? `<form class="card contact-form no-print" id="contact-form" novalidate>
              <label>${esc(t("f_name"))}<input name="name" required maxlength="120" autocomplete="name"></label>
              <label>${esc(t("f_contact"))}<input name="contact" required maxlength="160" autocomplete="email"></label>
              <label>${esc(t("f_subject"))}<input name="subject" maxlength="200"></label>
              <label>${esc(t("f_message"))}<textarea name="message" required rows="5" maxlength="4000"></textarea></label>
              <input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
              <button class="btn btn-blue" type="submit">${esc(t("send"))}</button>
              <div class="form-result" id="form-result" role="status" aria-live="polite"></div>
            </form>` : ""}
          </div></section>` : ""}
      </main>
      <footer class="site-footer"><div class="wrap">
        <nav class="foot-links no-print" aria-label="${esc(t("footLinks"))}">
          ${hasCvPage ? `<a href="#/cv">${esc(t("navCv"))}</a>` : ""}
          ${cv ? `<a href="${esc(cv)}" target="_blank" rel="noopener noreferrer">${esc(t("cvSite"))}</a>` : ""}
          ${li ? `<a href="${esc(li.url)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : ""}
          ${yt ? `<a href="${esc(yt.url)}" target="_blank" rel="noopener noreferrer">YouTube</a>` : ""}
          ${wa ? `<a href="${esc(wa)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>` : ""}
          ${email ? `<a href="mailto:${esc(email)}">${esc(email)}</a>` : ""}
          <button type="button" class="linklike" data-act="share">${esc(t("share"))}</button>
          <button type="button" class="linklike" data-act="print">${esc(t("print"))}</button>
        </nav>
        <p class="sig">${esc(t("footer"))}</p>
        <p class="no-print"><a href="#/admin" class="muted-link">${esc(t("admin"))}</a></p>
      </div></footer>
      <dialog id="pf-dlg" class="pf-dlg"></dialog>
    </div>`;

    bind(root, c, { wa, email, page: opts.page });
    if (!isCv) Home.bind(root, c);
    const want = window.App.pendingScroll || (location.hash.startsWith("#sec-") ? location.hash.slice(1) : "");
    window.App.pendingScroll = null;
    if (want) {
      const el = document.getElementById(want);
      if (el) setTimeout(() => el.scrollIntoView(), 50);
      else if (!isCv && allSecs.some((x) => CV_TYPES.includes(x.type) && "sec-" + x.id === want)) {
        // old link to a CV section: open the CV page at that section
        window.App.pendingScroll = want;
        location.replace("#/cv");
      }
    }
  }

  function toast(msg) {
    let el = document.getElementById("toast");
    if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
    el.textContent = msg; el.classList.add("show");
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 2200);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
    toast(t("copied"));
  }

  function bind(root, c, ctx) {
    root.querySelector(".nav-toggle")?.addEventListener("click", (e) => {
      const nav = root.querySelector("#mainnav");
      const open = nav.classList.toggle("open");
      e.currentTarget.setAttribute("aria-expanded", String(open));
    });
    root.querySelectorAll("#mainnav a").forEach((a) => a.addEventListener("click", () => root.querySelector("#mainnav").classList.remove("open")));

    root.onclick = async (e) => {
      const b = e.target.closest("[data-act]");
      if (!b) return;
      const act = b.dataset.act;
      if (act === "lang") { AZ.state.lang = AZ.state.lang === "ar" ? "en" : "ar"; try { localStorage.setItem("az_lang", AZ.state.lang); } catch {} window.App.rerender(); }
      if (act === "print") window.print();
      if (act === "copy-email") copy(b.dataset.email);
      if (act === "copy-link") copy(location.origin + location.pathname + "#" + b.dataset.id);
      if (act === "share") {
        const data = { title: document.title, url: location.origin + location.pathname + (ctx.page === "cv" ? "#/cv" : "") };
        if (navigator.share) { try { await navigator.share(data); } catch {} } else copy(data.url);
      }
    };

    // filters
    const q = root.querySelector("#q"), fs = root.querySelector("#f-section"), fy = root.querySelector("#f-year"),
      fst = root.querySelector("#f-status"), ft = root.querySelector("#f-tag");
    const apply = () => {
      const term = (q.value || "").trim().toLowerCase();
      const active = term || fs.value || fy.value || fst.value || ft.value;
      let any = 0;
      root.querySelectorAll("[data-filter-item]").forEach((el) => {
        const ok = (!term || el.dataset.text.includes(term)) &&
          (!fs.value || el.dataset.section === fs.value) &&
          (!fy.value || el.dataset.years.split(",").includes(fy.value)) &&
          (!fst.value || el.dataset.status === fst.value) &&
          (!ft.value || el.dataset.tags.split(",").includes(ft.value));
        el.hidden = !ok; if (ok) any++;
      });
      root.querySelectorAll("[data-section-block]").forEach((sec) => {
        sec.hidden = !!active && !sec.querySelector("[data-filter-item]:not([hidden])");
      });
      const contact = root.querySelector("#sec-contact"); if (contact) contact.hidden = !!active;
      root.querySelector("#no-results").hidden = !active || any > 0;
    };
    [q, fs, fy, fst, ft].forEach((el) => el && el.addEventListener("input", apply));
    root.querySelector("#f-clear")?.addEventListener("click", () => { q.value = ""; [fs, fy, fst, ft].forEach((s) => (s.value = "")); apply(); });

    // contact form
    const form = root.querySelector("#contact-form");
    if (form) form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const out = form.querySelector("#form-result");
      const fd = Object.fromEntries(new FormData(form).entries());
      if (!fd.name.trim() || !fd.contact.trim() || !fd.message.trim()) { out.className = "form-result err"; out.textContent = t("required"); return; }
      const sb = form.querySelector("[type=submit]"); sb.disabled = true; sb.textContent = t("sending");
      out.className = "form-result"; out.textContent = "";
      const res = window.App.previewMode ? { ok: false } : await Store.sendContact({ ...fd, lang: AZ.state.lang });
      sb.disabled = false; sb.textContent = t("send");
      if (res.ok) { out.className = "form-result ok"; out.textContent = t("sentOk"); form.reset(); }
      else {
        out.className = "form-result err";
        out.innerHTML = `<p>${esc(t("sentFail"))}</p><div class="actions">
          ${ctx.wa ? `<a class="btn btn-wa btn-small" href="${esc(ctx.wa)}" target="_blank" rel="noopener noreferrer">${ICON.wa}<span>${esc(t("whatsapp"))}</span></a>` : ""}
          ${ctx.email ? `<a class="btn btn-gold btn-small" href="mailto:${esc(ctx.email)}">${ICON.mail}<span>${esc(t("emailMe"))}</span></a>` : ""}</div>`;
      }
    });
  }

  // Inline preview: only when the server confirms the target site allows framing.
  async function loadEmbeds(root) {
    if (Store.mode !== "server") return;
    for (const el of root.querySelectorAll("[data-embed]")) {
      const u = el.dataset.embed;
      try {
        const r = await fetch(`/api/frame-check?url=${encodeURIComponent(u)}`);
        const j = await r.json();
        if (j.embeddable) {
          const f = document.createElement("iframe");
          f.src = u; f.loading = "lazy"; f.title = "preview"; f.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups allow-forms");
          f.className = "embed"; el.innerHTML = ""; el.appendChild(f);
        }
      } catch {}
    }
  }

  window.PublicView = { render, toast, copy, ICON, computeStats };
})();
