// CV page (#/cv): recruiter-facing showcase. Hero with a WebGL scene, value, energy timeline, case studies,
// certificates with filters and a viewer, platforms, about, contact.
// Project Manager | Eng. Ahmed Zahran
(function () {
  const { t, loc, esc, safeUrl, lines, waLink } = AZ;
  const T = (ar, en) => (AZ.state.lang === "en" ? en : ar);
  const I = () => PublicView.ICON;
  const reduced = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const finePointer = () => !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);

  /* ---------- small helpers ---------- */
  const MONTHS = {
    ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  };
  const fmtMonth = (s) => {
    const m = String(s || "").match(/^(\d{4})(?:-(\d{2}))?/);
    if (!m) return "";
    return m[2] ? `${MONTHS[AZ.state.lang === "en" ? "en" : "ar"][+m[2] - 1]} ${m[1]}` : m[1];
  };
  const period = (it) => [fmtMonth(it.start), it.current ? T("حتى الآن", "Present") : fmtMonth(it.end)].filter(Boolean).join(" — ");
  const intl = (o) => {
    const raw = String(o?.value || "").replace(/\D/g, "");
    if (!raw) return "";
    const cc = String(o.country || "966").replace(/\D/g, "");
    return "+" + (raw.startsWith(cc) ? raw : cc + raw.replace(/^0+/, ""));
  };
  const textOf = (it) => Object.values(it).map((v) => (v && typeof v === "object" ? `${v.ar || ""} ${v.en || ""}` : typeof v === "string" ? v : "")).join(" ").toLowerCase();
  const para = (s) => String(s || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  /* ---------- illustration scenes (isometric SVG, labelled «رسم توضيحي») ---------- */
  const SC = () => {
    const { P, box, flat, line, svg, ground, GOLD, BLUE, STEEL, PAPER } = Home.iso;
    return {
      grid: () => Home.scene("grid"),
      cable: () => svg(
        ground(170) + flat(-75, -14, 0, 150, 28, "#1b2f4a") + flat(-75, -4, 0.4, 150, 8, "#0a1626") +
        [-2, 0, 2].map((o) => line(P(-75, o, 1), P(75, o, 1), "#d4af6a", 2.6)).join("") +
        box(-6, -6, 0, 12, 12, 7, BLUE) + box(-4, -4, 7, 8, 8, 3, GOLD) +
        box(36, 18, 0, 24, 15, 13, STEEL) + box(38, 20, 13, 20, 11, 3, PAPER) +
        `<path class="flow" d="M ${P(-75, 14, 1).join(" ")} L ${P(-20, 16, 1).join(" ")} L ${P(36, 24, 8).join(" ")}" fill="none" stroke="#4d8dff" stroke-width="2" stroke-dasharray="5 6"/>` +
        box(-66, 16, 0, 10, 10, 10, STEEL) + box(-52, 18, 0, 10, 10, 10, STEEL)),
      factory: () => svg(
        ground(170) + box(-62, -34, 0, 28, 28, 72, STEEL) + box(-26, -34, 0, 24, 24, 54, STEEL) + box(-2, -30, 0, 20, 20, 40, STEEL) +
        flat(-70, 8, 8, 130, 11, "#27405f") + box(-70, 8, 0, 3, 11, 8, STEEL) + box(-10, 8, 0, 3, 11, 8, STEEL) + box(50, 8, 0, 3, 11, 8, STEEL) +
        [0, 1, 2, 3].map((i) => flat(-60 + i * 30, 10, 8.2, 14, 7, i % 2 ? "#d4af6a" : "#f4f7fb")).join("") +
        box(32, -30, 0, 30, 15, 44, BLUE) + [0, 1, 2].map((i) => flat(36 + i * 8, -15, 38 - i * 10, 5, 0.1, "#d4af6a")).join("") +
        `<g class="bob">` + box(-20, 34, 14, 40, 3, 22, PAPER) + flat(-16, 34, 30, 30, 0.1, "#4d8dff") + `</g>`),
    };
  };
  const sceneSvg = (k) => { const s = SC(); return (s[k] || s.grid)(); };

  const VALUE_ICON = {
    plan: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="8" width="26" height="6" rx="3"/><rect x="14" y="21" width="30" height="6" rx="3"/><rect x="8" y="34" width="22" height="6" rx="3"/></svg>',
    lead: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="12" r="6"/><circle cx="10" cy="36" r="6"/><circle cx="38" cy="36" r="6"/><path d="M24 18v8M24 26 12 31M24 26l12 5" fill="none"/></svg>',
    control: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 34a18 18 0 1 1 36 0" fill="none"/><path d="M24 34 34 20" fill="none"/><circle cx="24" cy="34" r="3"/><path d="M10 40h28" fill="none"/></svg>',
    digital: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="8" width="40" height="32" rx="4" fill="none"/><path d="M4 16h40" fill="none"/><rect x="10" y="22" width="12" height="12" rx="2"/><path d="M28 24h10M28 30h10" fill="none"/></svg>',
  };

  /* ---------- sections ---------- */
  function hero(c, ctx) {
    const pr = c.profile, photo = safeUrl(pr.photo);
    const titleLines = lines(pr.cvTitle);
    const facts = lines(pr.cvFacts).map((l) => l.split("|").map((x) => x.trim())).filter((p) => p[1]);
    const stat = PublicView.computeStats(c).find((s) => s.k === "stat_years");
    return `<section class="cvx-hero" id="top">
      <div class="cvx-hero-bg" aria-hidden="true"></div>
      <div class="wrap cvx-hero-in">
        <div class="cvx-hero-text">
          <a class="back-link" href="#/">${I().home}<span>${esc(t("backHome"))}</span></a>
          <p class="cvx-name">${esc(loc(pr.name))}</p>
          <p class="cvx-role1">${esc(titleLines[0] || loc(pr.title))}</p>
          ${titleLines[1] ? `<p class="cvx-role2">${esc(titleLines[1])}</p>` : ""}
          ${loc(pr.cvSubtitle) ? `<p class="cvx-support">${esc(loc(pr.cvSubtitle))}</p>` : ""}
          <h1>${esc(loc(pr.cvHeadline) || t("navCv"))}</h1>
          <p class="cvx-lead">${esc(loc(pr.cvLead) || loc(pr.bio))}</p>
          <div class="cvx-actions">
            <a class="btn btn-gold" href="#sec-contact">${esc(T("تواصل بشأن فرصة عمل", "Contact about a role"))}</a>
            <a class="btn btn-line" href="#sec-experience">${esc(T("استعرض خبراتي", "Explore my experience"))}</a>
            <button type="button" class="btn btn-ghost no-print" data-act="print">${I().print}<span>${esc(T("تحميل / طباعة السيرة الذاتية", "Download / print the CV"))}</span></button>
          </div>
        </div>
        <div class="cvx-stage" data-cv-stage data-mode="pending">
          <div class="cvx-canvas" data-cv-canvas role="img" aria-label="${esc(T("مشهد توضيحي ثلاثي الأبعاد: خط نقل كهربائي ومحطة ومخطط زمني للتنفيذ", "Illustrative 3D scene: a power line, a substation and an execution schedule"))}"></div>
          <ul class="cvx-tags" aria-hidden="true">
            <li>${esc(T("شبكة 33 / 13.8 ك.ف", "33 / 13.8 kV network"))}</li><li>${esc(T("محطة وأحمال", "Substation"))}</li><li>${esc(T("مخطط التنفيذ", "Execution schedule"))}</li>
          </ul>
          ${photo ? `<figure class="cvx-portrait"><img src="${esc(photo)}" alt="${esc(loc(pr.name))}" width="200" height="250"></figure>` : ""}
          <p class="cvx-ill-note">${esc(T("رسم توضيحي", "Illustration"))}</p>
        </div>
      </div>
      ${facts.length || stat ? `<div class="wrap"><ul class="cvx-strip" aria-label="${esc(T("الملخص التنفيذي", "Executive summary"))}">
        ${facts.map(([k, v]) => `<li><b>${esc(k)}</b><span>${esc(v)}</span></li>`).join("")}</ul></div>` : ""}
    </section>`;
  }

  function value(sec) {
    if (!sec) return "";
    const items = sec.items.filter((i) => i.visible !== false);
    return `<section class="section cvx-value" id="sec-${esc(sec.id)}"><div class="wrap">
      <header class="head2"><h2>${esc(loc(sec.title))}</h2><p>${esc(T("ما يلي مبني على خبرات موضحة في هذه الصفحة، دون وعود بنتائج محددة.", "What follows is based on the experience shown on this page, without promises of specific results."))}</p></header>
      <div class="cvx-vgrid">${items.map((it) => `<article class="cvx-vcard tilt"><span class="cvx-vicon">${VALUE_ICON[it.icon] || VALUE_ICON.plan}</span>
        <h3>${esc(loc(it.title))}</h3><p>${esc(loc(it.description))}</p><i class="glare" aria-hidden="true"></i></article>`).join("")}</div>
    </div></section>`;
  }

  function experience(sec) {
    if (!sec) return "";
    const items = sec.items.filter((i) => i.visible !== false);
    return `<section class="section cvx-exp" id="sec-${esc(sec.id)}"><div class="wrap">
      <header class="head2"><h2>${esc(loc(sec.title))}</h2><p>${esc(T("مسار زمني موثق، مع التمييز بين جهة التوظيف المباشر والعميل.", "A documented timeline, distinguishing the direct employer from the client."))}</p></header>
      <div class="cvx-tl" data-energy>
        <div class="cvx-track" aria-hidden="true"><i class="cvx-fill"></i></div>
        ${items.map((it) => {
          const ach = lines(it.achievements);
          return `<article class="cvx-job" data-node><span class="cvx-node" aria-hidden="true"></span>
            <div class="cvx-card tilt">
              <header><h3>${esc(loc(it.title))}</h3><p class="cvx-period">${esc(period(it))}</p></header>
              <dl class="cvx-who">
                ${loc(it.org) ? `<div><dt>${esc(T("جهة التوظيف المباشر", "Direct employer"))}</dt><dd>${esc(loc(it.org))}</dd></div>` : ""}
                ${loc(it.client) ? `<div><dt>${esc(T("العميل", "Client"))}</dt><dd>${esc(loc(it.client))}</dd></div>` : ""}
                ${loc(it.location) ? `<div><dt>${esc(T("الموقع", "Location"))}</dt><dd>${esc(loc(it.location))}</dd></div>` : ""}
              </dl>
              ${ach.length ? `<h4>${esc(T("نطاق المسؤولية", "Scope of responsibility"))}</h4><ul class="cvx-bul">${ach.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}
              ${loc(it.evidence) ? `<p class="cvx-evidence"><b>${esc(T("التوثيق", "Documentation"))}:</b> ${esc(loc(it.evidence))}</p>` : ""}
              ${it.certRef ? `<div class="cvx-card-actions no-print"><button type="button" class="btn btn-line btn-small" data-cert-open="${esc(it.certRef)}">${I().file}<span>${esc(T("عرض الوثائق", "View documents"))}</span></button></div>` : ""}
              <i class="glare" aria-hidden="true"></i>
            </div></article>`;
        }).join("")}
      </div>
    </div></section>`;
  }

  function projects(sec) {
    if (!sec) return "";
    const items = sec.items.filter((i) => i.visible !== false);
    return `<section class="section cvx-projects" id="sec-${esc(sec.id)}"><div class="wrap">
      <header class="head2"><h2>${esc(loc(sec.title))}</h2><p>${esc(T("دراسات حالة قصيرة. الرسوم المرافقة توضيحية وليست صورًا من المشاريع.", "Short case studies. The accompanying drawings are illustrations, not photos of the projects."))}</p></header>
      <div class="cvx-cases">${items.map((it) => {
        const acts = lines(it.actions), res = lines(it.results);
        return `<article class="cvx-case tilt">
          <div class="cvx-case-art">${sceneSvg(it.scene)}<span class="cvx-ill">${esc(T("رسم توضيحي", "Illustration"))}</span></div>
          <div class="cvx-case-body"><h3>${esc(loc(it.title))}</h3>
            <dl>
              ${loc(it.kind) ? `<div><dt>${esc(T("نوع المشروع", "Project type"))}</dt><dd>${esc(loc(it.kind))}</dd></div>` : ""}
              ${loc(it.scope) ? `<div><dt>${esc(T("النطاق / الجهة", "Scope / entity"))}</dt><dd>${esc(loc(it.scope))}</dd></div>` : ""}
              ${loc(it.challenge) ? `<div><dt>${esc(T("التحدي", "Challenge"))}</dt><dd>${esc(loc(it.challenge))}</dd></div>` : ""}
              ${loc(it.role) ? `<div><dt>${esc(T("دوري", "My role"))}</dt><dd>${esc(loc(it.role))}</dd></div>` : ""}
              ${acts.length ? `<div><dt>${esc(T("الإجراءات", "Actions"))}</dt><dd><ul>${acts.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></dd></div>` : ""}
              ${res.length ? `<div><dt>${esc(T("المخرجات المثبتة", "Documented outputs"))}</dt><dd><ul>${res.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></dd></div>` : ""}
            </dl></div><i class="glare" aria-hidden="true"></i></article>`;
      }).join("")}</div>
    </div></section>`;
  }

  function skills(sec) {
    if (!sec) return "";
    const items = sec.items.filter((i) => i.visible !== false);
    return `<section class="section cvx-skills" id="sec-${esc(sec.id)}"><div class="wrap">
      <header class="head2"><h2>${esc(loc(sec.title))}</h2></header>
      <div class="cvx-sgrid">${items.map((it) => `<div class="cvx-sgroup"><h3>${esc(loc(it.title))}</h3><ul>${lines(it.list).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div>
    </div></section>`;
  }

  /* certificates */
  const tabs = () => window.V10.CERT_TABS;
  const imgSrc = (n, thumb) => (/^(https?:|data:|\/|assets\/)/.test(n) ? safeUrl(n) : `assets/certs/${n}${thumb ? "-thumb" : ""}.jpg`);
  const previews = (it) => {
    const names = lines(it.images);
    const out = names.map((n) => ({ full: imgSrc(n, false), thumb: imgSrc(n, true) }));
    const extra = safeUrl(it.image);
    if (extra) out.push({ full: extra, thumb: extra });
    return out.filter((p) => p.full);
  };
  const tabOf = (id) => tabs().find((x) => x.id === id) || tabs()[0];
  const tabName = (tb) => (AZ.state.lang === "en" ? tb.en : tb.ar);

  function certCard(it) {
    const pv = previews(it), tb = tabOf(it.tab), sk = lines(it.skills).slice(0, 3);
    return `<article class="cvx-cert tilt" data-cert="${esc(it.id)}" data-tab="${esc(tb.id)}" data-text="${esc(textOf(it))}">
      <button type="button" class="cvx-thumb" data-cert-open="${esc(it.id)}" aria-label="${esc(T("عرض الشهادة وتفاصيلها", "View the certificate and its details"))}: ${esc(loc(it.title))}">
        ${pv.length ? `<img src="${esc(pv[0].thumb)}" alt="" loading="lazy" width="640" height="450">${pv.length > 1 ? `<span class="cvx-count">${pv.length}</span>` : ""}` : `<span class="cvx-nodoc">${I().file}<span>${esc(T("المستند الأصلي متاح عند الطلب", "Original document available on request"))}</span></span>`}
      </button>
      <div class="cvx-cert-body">
        <p class="cvx-tabname">${esc(tabName(tb))}</p>
        ${loc(it.docType) ? `<p class="badge badge-gold cvx-doctype">${esc(loc(it.docType))}</p>` : ""}
        <h3>${esc(loc(it.title))}</h3>
        <p class="cvx-meta">${esc(loc(it.issuer))}${it.date ? ` · <span class="cvx-date">${esc(it.date)}</span>` : ""}</p>
        ${it.grade ? `<p class="cvx-grade">${esc(it.grade)}</p>` : ""}
        ${it.ref ? `<p class="cvx-ref" dir="auto">${esc(it.ref)}</p>` : ""}
        ${sk.length ? `<ul class="cvx-chips">${sk.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        ${loc(it.relevance) ? `<p class="cvx-rel"><b>${esc(T("كيف ترتبط باحتياجات الشركة؟", "How does it relate to a company's needs?"))}</b> ${esc(loc(it.relevance))}</p>` : ""}
        <button type="button" class="btn btn-line btn-small no-print" data-cert-open="${esc(it.id)}">${esc(T("التفاصيل والمعاينة", "Details and preview"))}</button>
      </div><i class="glare" aria-hidden="true"></i></article>`;
  }

  function certs(sec) {
    if (!sec) return "";
    const items = sec.items.filter((i) => i.visible !== false);
    const first = tabs()[0];
    return `<section class="section cvx-certs" id="sec-${esc(sec.id)}"><div class="wrap">
      <header class="head2"><h2>${esc(loc(sec.title))}</h2><p>${esc(T("وثائق مرفقة بعد تغطية أرقام الهوية والبيانات الشخصية في الصور. الأمثلة التطبيقية المذكورة منفصلة عن الخبرة المثبتة.", "Documents attached after painting over ID numbers and personal data in the images. Application examples are kept separate from the documented experience."))}</p></header>
      <div class="cvx-cfilter no-print" data-cert-filter>
        <label class="cvx-search"><span class="sr-only">${esc(T("ابحث في الشهادات والمهارات", "Search certificates and skills"))}</span>
          <input type="search" data-cert-q placeholder="${esc(T("ابحث في الشهادات والمهارات…", "Search certificates and skills…"))}" autocomplete="off"></label>
        <div class="cvx-tabs" role="tablist" aria-label="${esc(T("تصنيف الشهادات", "Certificate categories"))}">
          ${tabs().map((tb, i) => `<button type="button" role="tab" id="ctab-${tb.id}" aria-selected="${i === 0}" aria-controls="cert-grid" tabindex="${i === 0 ? 0 : -1}" data-cert-tab="${tb.id}">${esc(tabName(tb))}<span class="n">${items.filter((x) => x.tab === tb.id).length}</span></button>`).join("")}
        </div>
        <p class="cvx-status" data-cert-status role="status" aria-live="polite"></p>
      </div>
      <h3 class="cvx-tabtitle" data-cert-title>${esc(loc(first.long))}</h3>
      <div class="cvx-cgrid" id="cert-grid" role="tabpanel" aria-labelledby="ctab-${first.id}" data-cert-grid>${items.map(certCard).join("")}</div>
      <p class="cvx-empty" data-cert-empty hidden>${esc(T("لا توجد شهادات مطابقة لبحثك.", "No certificates match your search."))}</p>
    </div></section>`;
  }

  function about(c) {
    const text = loc(c.profile.cvAbout);
    if (!text) return "";
    return `<section class="section cvx-about" id="about"><div class="wrap cvx-about-in">
      <header class="head2"><h2>${esc(T("النبذة المهنية", "Professional summary"))}</h2></header>
      ${para(text).map((p) => `<p>${esc(p)}</p>`).join("")}
    </div></section>`;
  }

  function contact(c, ctx) {
    const ct = c.contact || {};
    const email = ctx.email, p1 = ct.whatsapp?.visible !== false ? intl(ct.whatsapp) : "", p2 = ct.phone2?.visible !== false ? intl(ct.phone2) : "";
    const row = (num) => num ? `<p class="cvx-phone"><a class="contact-line" href="tel:${esc(num)}" dir="ltr">${I().phone}<span>${esc(num)}</span></a>
      <a class="btn btn-wa btn-small" href="https://wa.me/${esc(num.replace(/\D/g, ""))}?text=${encodeURIComponent(loc(ct.whatsappMessage))}" target="_blank" rel="noopener noreferrer">${I().wa}<span>${esc(T("واتساب", "WhatsApp"))}</span></a></p>` : "";
    return `<section class="section cvx-contact" id="sec-contact"><div class="wrap">
      <header class="head2"><h2>${esc(loc(c.profile.cvContactTitle) || t("contactTitle"))}</h2><p>${esc(loc(c.profile.cvContactText))}</p></header>
      <div class="contact-grid">
        <div class="contact-info">
          ${ct.name?.visible !== false && ct.name?.value ? `<p class="contact-name">${esc(ct.name.value)}</p>` : ""}
          ${email ? `<p><a href="mailto:${esc(email)}" class="contact-line">${I().mail}<span dir="ltr">${esc(email)}</span></a>
            <button type="button" class="btn btn-small btn-icon" data-act="copy-email" data-email="${esc(email)}" aria-label="${esc(t("copyEmail"))}" title="${esc(t("copyEmail"))}">${I().copy}</button></p>` : ""}
          ${row(p1)}${row(p2)}
        </div>
        ${ct.formVisible !== false ? `<form class="card contact-form no-print" id="contact-form" novalidate>
          <label>${esc(t("f_name"))}<input name="name" required maxlength="120" autocomplete="name"></label>
          <label>${esc(T("الشركة", "Company"))}<input name="company" maxlength="160" autocomplete="organization"></label>
          <label>${esc(t("f_contact"))}<input name="contact" required maxlength="160" autocomplete="email"></label>
          <label>${esc(T("المسمى أو نوع الفرصة", "Role or type of opportunity"))}<input name="subject" maxlength="200"></label>
          <label>${esc(t("f_message"))}<textarea name="message" required rows="5" maxlength="4000"></textarea></label>
          <input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
          <button class="btn btn-blue" type="submit">${esc(t("send"))}</button>
          <div class="form-result" id="form-result" role="status" aria-live="polite"></div>
        </form>` : ""}
      </div>
    </div></section>`;
  }

  function main(c, ctx) {
    const by = (type) => ctx.allSecs.find((s) => s.type === type);
    const plat = by("platforms");
    const platHTML = plat && Home.realPlatforms(plat).length
      ? Home.platforms(plat, c, {
          order: ["iltizam-najran.netlify.app", "iltizam-training.netlify.app", "mujassid-prompt-studio.netlify.app", "nourmadinty.netlify.app", "securitynmwabran.netlify.app"],
          title: T("من خبرة العمل إلى حلول رقمية", "From work experience to digital solutions"),
          sub: T("منصات بنيتها انطلاقًا من احتياجات العمل الفعلية. اضغط «شاهد كيف تعمل» لترى رحلة الاستخدام قبل الدخول.", "Platforms I built from real work needs. Press \"See how it works\" to view the user journey before you enter."),
          visit: true, visitLabel: T("زيارة المنصة", "Visit the platform"),
        })
      : "";
    return `${hero(c, ctx)}
      ${value(by("value"))}
      ${experience(by("experience"))}
      ${projects(by("projects"))}
      ${skills(by("skills"))}
      ${certs(by("certs"))}
      ${platHTML}
      ${about(c)}
      ${contact(c, ctx)}
      <dialog id="cert-dlg" class="cert-dlg" aria-labelledby="cdlg-title"></dialog>`;
  }

  /* ---------- behaviour ---------- */
  let cleanups = [];
  const onWindow = (type, fn, opts) => { window.addEventListener(type, fn, opts); cleanups.push(() => window.removeEventListener(type, fn, opts)); };

  async function mountStage(root) {
    const st = root.querySelector("[data-cv-stage]");
    if (!st) return;
    const host = st.querySelector("[data-cv-canvas]");
    const fallback = (why) => {
      st.dataset.mode = "static"; st.dataset.why = why;
      host.innerHTML = `<div class="cvx-static">${Home.scene("grid")}</div>`;
    };
    const lowPower = (navigator.connection && navigator.connection.saveData) || (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
    if (lowPower) return fallback("low-power");
    let started = false, ctrl = null;
    const go = async () => {
      if (started) return; started = true;
      try {
        const mod = await import("/assets/scene3d.js");
        if (!document.body.contains(host)) return;
        ctrl = mod.mount(host, { reduced: reduced() });
        st.dataset.mode = "webgl";
      } catch (e) { fallback(String(e && e.message || e).slice(0, 40)); }
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); (window.requestIdleCallback || ((f) => setTimeout(f, 60)))(go); } }, { rootMargin: "100px" });
      io.observe(st);
      cleanups.push(() => io.disconnect());
    } else go();
    cleanups.push(() => { if (ctrl) ctrl.destroy(); });
  }

  function energy(root) {
    const tl = root.querySelector("[data-energy]");
    if (!tl) return;
    const nodes = [...tl.querySelectorAll("[data-node]")];
    const paint = (p, mid) => {
      tl.style.setProperty("--p", p.toFixed(3));
      nodes.forEach((n) => { const r = n.querySelector(".cvx-node").getBoundingClientRect(); n.classList.toggle("lit", mid === null || r.top + r.height / 2 < mid); });
    };
    if (reduced()) return paint(1, null);
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = tl.getBoundingClientRect(), mid = window.innerHeight * 0.55;
      paint(Math.min(1, Math.max(0, (mid - r.top) / r.height)), mid);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(update); };
    onWindow("scroll", kick, { passive: true });
    onWindow("resize", kick);
    update();
  }

  function tilt(root) {
    if (reduced() || !finePointer()) return;
    root.querySelectorAll(".tilt").forEach((el) => {
      let raf = 0;
      el.addEventListener("pointermove", (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          el.style.setProperty("--ry", ((x - 0.5) * 9).toFixed(2) + "deg");
          el.style.setProperty("--rx", ((0.5 - y) * 7).toFixed(2) + "deg");
          el.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
          el.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
          el.classList.add("is-tilting");
        });
      });
      el.addEventListener("pointerleave", () => {
        el.classList.remove("is-tilting");
        ["--rx", "--ry"].forEach((k) => el.style.setProperty(k, "0deg"));
      });
    });
  }

  function certTools(root, c) {
    const grid = root.querySelector("[data-cert-grid]");
    if (!grid) return;
    const sec = c.sections.find((s) => s.type === "certs");
    const byId = (id) => sec && sec.items.find((i) => i.id === id);
    const cards = [...grid.querySelectorAll("[data-cert]")];
    const q = root.querySelector("[data-cert-q]"), status = root.querySelector("[data-cert-status]"), empty = root.querySelector("[data-cert-empty]"), title = root.querySelector("[data-cert-title]");
    const tabBtns = [...root.querySelectorAll("[data-cert-tab]")];
    const box = root.querySelector("[data-cert-filter]");
    let active = tabs()[0].id;
    const visibleCards = () => cards.filter((el) => !el.hidden);

    const apply = () => {
      const term = (q.value || "").trim().toLowerCase();
      cards.forEach((el) => { el.hidden = term ? !el.dataset.text.includes(term) : el.dataset.tab !== active; });
      const n = visibleCards().length;
      box.dataset.searching = term ? "1" : "0";
      tabBtns.forEach((b) => { const on = b.dataset.certTab === active && !term; b.setAttribute("aria-selected", String(on)); b.tabIndex = on || (term && b === tabBtns[0]) ? 0 : -1; });
      title.textContent = term ? T("نتائج البحث في كل التصنيفات", "Search results across all categories") : loc(tabOf(active).long);
      status.textContent = term ? T(`${n} نتيجة من ${cards.length}`, `${n} of ${cards.length} results`) : "";
      empty.hidden = n > 0;
      grid.setAttribute("aria-labelledby", "ctab-" + active);
    };
    const setTab = (id, focus) => { active = id; q.value = ""; apply(); if (focus) root.querySelector(`[data-cert-tab="${id}"]`).focus(); };
    q.addEventListener("input", apply);
    tabBtns.forEach((b, i) => {
      b.addEventListener("click", () => setTab(b.dataset.certTab));
      b.addEventListener("keydown", (e) => {
        const rtl = document.documentElement.dir === "rtl";
        const dir = e.key === "ArrowRight" ? (rtl ? -1 : 1) : e.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
        if (e.key === "Home") { e.preventDefault(); setTab(tabBtns[0].dataset.certTab, true); }
        else if (e.key === "End") { e.preventDefault(); setTab(tabBtns[tabBtns.length - 1].dataset.certTab, true); }
        else if (dir) { e.preventDefault(); setTab(tabBtns[(i + dir + tabBtns.length) % tabBtns.length].dataset.certTab, true); }
      });
    });
    apply();

    /* viewer */
    const dlg = root.querySelector("#cert-dlg");
    let cur = null, opener = null, imgIx = 0, zoom = 1;
    const render = () => {
      const it = byId(cur); if (!it) return;
      const pv = previews(it), tb = tabOf(it.tab), list = visibleCards(), at = list.findIndex((el) => el.dataset.cert === cur);
      const sk = lines(it.skills);
      dlg.innerHTML = `<div class="cdlg">
        <header class="cdlg-head"><div>${loc(it.docType) ? `<p class="badge badge-gold">${esc(loc(it.docType))}</p>` : ""}<h2 id="cdlg-title">${esc(loc(it.title))}</h2><p class="cdlg-issuer">${esc(loc(it.issuer))}</p></div>
          <button type="button" class="btn btn-icon cdlg-close" data-cdlg-close aria-label="${esc(t("close"))}">✕</button></header>
        <div class="cdlg-body">
          <section class="cdlg-view" aria-label="${esc(T("معاينة الوثيقة", "Document preview"))}">
            ${pv.length ? `<div class="cdlg-stage" style="--z:${zoom}" data-stage><img src="${esc(pv[imgIx].full)}" alt="${esc(T("صورة الوثيقة بعد تغطية البيانات الشخصية", "Document image with personal data covered"))}: ${esc(loc(it.title))}" data-zoom-img></div>
              <div class="cdlg-tools"><button type="button" class="btn btn-line btn-small" data-zoom="out" aria-label="${esc(T("تصغير", "Zoom out"))}">−</button><button type="button" class="btn btn-line btn-small" data-zoom="in" aria-label="${esc(T("تكبير", "Zoom in"))}">+</button><button type="button" class="btn btn-line btn-small" data-zoom="reset">${esc(T("الحجم الأصلي", "Fit"))}</button>
                ${pv.length > 1 ? `<span class="cdlg-thumbs" role="group" aria-label="${esc(T("وثائق هذه الشهادة", "Documents for this item"))}">${pv.map((p, k) => `<button type="button" class="btn btn-small ${k === imgIx ? "btn-gold" : "btn-line"}" data-img="${k}" aria-pressed="${k === imgIx}">${esc(T("وثيقة", "Document"))} ${k + 1}</button>`).join("")}</span>` : ""}</div>
              <p class="cdlg-priv">${esc(T("غُطّيت أرقام الهوية والإقامة وتواريخ الميلاد وأي بيانات شخصية أخرى داخل ملف الصورة نفسه.", "ID and residence numbers, birth dates and other personal data are painted over inside the image file itself."))}</p>`
              : `<div class="cdlg-nodoc">${I().file}<p>${esc(T("لا توجد معاينة مرفقة لهذه الشهادة. المستند الأصلي متاح عند الطلب.", "No preview is attached for this item. The original document is available on request."))}</p></div>`}
          </section>
          <section class="cdlg-info">
            <dl>
              <div><dt>${esc(T("الجهة المصدرة", "Issued by"))}</dt><dd>${esc(loc(it.issuer))}</dd></div>
              ${it.date ? `<div><dt>${esc(T("التاريخ", "Date"))}</dt><dd>${esc(it.date)}</dd></div>` : ""}
              ${loc(it.docType) ? `<div><dt>${esc(T("نوع الوثيقة", "Document type"))}</dt><dd>${esc(loc(it.docType))}</dd></div>` : ""}
              ${it.grade ? `<div><dt>${esc(T("التقدير / الساعات", "Grade / hours"))}</dt><dd>${esc(it.grade)}</dd></div>` : ""}
              ${it.ref ? `<div><dt>${esc(T("المرجع", "Reference"))}</dt><dd dir="auto">${esc(it.ref)}</dd></div>` : ""}
              <div><dt>${esc(T("التصنيف", "Category"))}</dt><dd>${esc(loc(tb.long))}</dd></div>
            </dl>
            ${sk.length ? `<h3>${esc(T("المهارات", "Skills"))}</h3><ul class="cvx-chips">${sk.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
            ${loc(it.note) ? `<p class="cdlg-note">${esc(loc(it.note))}</p>` : ""}
            ${loc(it.relevance) ? `<h3>${esc(T("كيف ترتبط باحتياجات الشركة؟", "How does it relate to a company's needs?"))}</h3><p>${esc(loc(it.relevance))}</p>` : ""}
            ${loc(it.example) ? `<div class="cdlg-example"><p class="cdlg-sep">${esc(T("مثال تطبيقي محتمل — منفصل عن الخبرة المثبتة", "Possible application example — separate from the documented experience"))}</p><p>${esc(loc(it.example))}</p></div>` : ""}
          </section>
        </div>
        <footer class="cdlg-foot"><button type="button" class="btn btn-line" data-cdlg-nav="prev" ${list.length < 2 ? "disabled" : ""}>${esc(T("السابقة", "Previous"))}</button>
          <span class="cdlg-count" aria-live="polite">${at + 1} / ${list.length}</span>
          <button type="button" class="btn btn-line" data-cdlg-nav="next" ${list.length < 2 ? "disabled" : ""}>${esc(T("التالية", "Next"))}</button></footer>
      </div>`;
    };
    const open = (id, from) => {
      const it = byId(id); if (!it) return;
      if (!cards.find((el) => el.dataset.cert === id && !el.hidden)) { active = it.tab; q.value = ""; apply(); }
      cur = id; imgIx = 0; zoom = 1; opener = from || document.activeElement;
      render(); if (!dlg.open) dlg.showModal();
      dlg.querySelector("[data-cdlg-close]").focus();
    };
    const step = (d) => {
      const list = visibleCards(); if (list.length < 2) return;
      const at = list.findIndex((el) => el.dataset.cert === cur);
      cur = list[(at + d + list.length) % list.length].dataset.cert; imgIx = 0; zoom = 1; render();
      dlg.querySelector(`[data-cdlg-nav="${d > 0 ? "next" : "prev"}"]`)?.focus();
    };
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg || e.target.closest("[data-cdlg-close]")) return dlg.close();
      const nav = e.target.closest("[data-cdlg-nav]"); if (nav) return step(nav.dataset.cdlgNav === "next" ? 1 : -1);
      const z = e.target.closest("[data-zoom]");
      if (z) { zoom = z.dataset.zoom === "reset" ? 1 : Math.min(3, Math.max(1, zoom + (z.dataset.zoom === "in" ? 0.5 : -0.5))); dlg.querySelector("[data-stage]").style.setProperty("--z", zoom); return; }
      const im = e.target.closest("[data-img]"); if (im) { imgIx = +im.dataset.img; zoom = 1; render(); dlg.querySelector(`[data-img="${imgIx}"]`)?.focus(); return; }
      if (e.target.closest("[data-zoom-img]")) { zoom = zoom > 1 ? 1 : 2; dlg.querySelector("[data-stage]").style.setProperty("--z", zoom); }
    });
    dlg.addEventListener("keydown", (e) => {
      const rtl = document.documentElement.dir === "rtl";
      if (e.key === "ArrowLeft") { e.preventDefault(); step(rtl ? 1 : -1); }
      if (e.key === "ArrowRight") { e.preventDefault(); step(rtl ? -1 : 1); }
    });
    dlg.addEventListener("close", () => { if (opener && document.contains(opener)) opener.focus(); opener = null; });
    if (root._cvClick) root.removeEventListener("click", root._cvClick);
    root._cvClick = (e) => { const b = e.target.closest("[data-cert-open]"); if (b) open(b.dataset.certOpen, b); };
    root.addEventListener("click", root._cvClick);
  }

  function bind(root, c) {
    cleanups.forEach((f) => { try { f(); } catch {} });
    cleanups = [];
    mountStage(root);
    energy(root);
    tilt(root);
    certTools(root, c);
    Home.bind(root, c);
  }

  window.CV = { main, bind };
})();
