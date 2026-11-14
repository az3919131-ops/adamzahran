// CV page showcase effects: recruiter keyword ribbons, a 3D rotating certificate gallery,
// scroll reveals, count-up numbers, a hero spotlight and magnetic buttons.
// Everything degrades to a static, readable page with prefers-reduced-motion.
// Project Manager | Eng. Ahmed Zahran
(function () {
  const { esc } = AZ;
  const T = (ar, en) => (AZ.state.lang === "en" ? en : ar);
  const reduced = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const fine = () => !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);

  // Keywords employers scan for, each backed by the experience and certificates on this page.
  const WORDS = [
    ["إدارة المشاريع", "Project Management"], ["قيادة الفرق الميدانية", "Field Team Leadership"], ["ضبط التكاليف", "Cost Control"],
    ["إدارة المخاطر", "Risk Management"], ["السلامة أولًا", "Safety First · HSE"], ["الجودة والامتثال", "Quality & Compliance"],
    ["إدارة أصحاب المصلحة", "Stakeholder Management"], ["التخطيط والجدولة", "Planning & Scheduling"], ["تقارير الإدارة العليا", "Executive Reporting"],
    ["شبكات 33 / 13.8 ك.ف", "33 / 13.8 kV Networks"], ["اختبار الكابلات وتحديد الأعطال", "Cable Testing & Fault Location"], ["مشاريع العقد الموحد", "Unified-Contract Projects"],
    ["إغلاق أوامر العمل والمستخلصات", "Work-Order Close-out & Claims"], ["التحول الرقمي", "Digital Transformation"], ["أتمتة العمل بالذكاء الاصطناعي", "AI Workflow Automation"],
    ["لوحات متابعة وقرارات بالبيانات", "Data-Driven Dashboards"], ["PLC · SCADA", "PLC · SCADA"], ["التدريب ونقل الخبرة", "Training & Mentoring"],
  ];

  function ribbons() {
    const half = Math.ceil(WORDS.length / 2);
    const row = (list, cls) => {
      const items = list.map(([ar, en]) => `<li>${esc(T(ar, en))}</li>`).join("");
      return `<div class="fx-row ${cls}"><ul class="fx-track">${items}</ul><ul class="fx-track" aria-hidden="true">${items}</ul></div>`;
    };
    return `<section class="fx-ribbons no-print" aria-label="${esc(T("كلمات مفتاحية عن خبرتي", "Keywords about my experience"))}">
      ${row(WORDS.slice(0, half), "fx-a")}${row(WORDS.slice(half), "fx-b")}
    </section>`;
  }

  // 3D ring of certificate thumbnails. `items` = [{id, title, thumb}]
  function gallery(items) {
    if (items.length < 3) return "";
    const n = items.length;
    return `<div class="fx-gal no-print" data-fx-gal style="--n:${n}">
      <div class="fx-gal-head">
        <p class="fx-gal-kicker">${esc(T("معرض الشهادات ثلاثي الأبعاد", "3D certificate gallery"))}</p>
        <h3>${esc(T("شهادات حقيقية… تتحدث عن خبرتي", "Real certificates that speak for my experience"))}</h3>
        <p>${esc(T(`${n} وثيقة أصلية. اسحب لتدوير المعرض، أو اضغط أي شهادة لعرضها كاملة.`, `${n} original documents. Drag to rotate the gallery, or press any certificate to view it in full.`))}</p>
      </div>
      <div class="fx-stage" data-fx-stage>
        <div class="fx-ring" data-fx-ring>
          ${items.map((it, i) => `<button type="button" class="fx-card" style="--i:${i}" data-cert-open="${esc(it.id)}" data-fx-i="${i}" aria-label="${esc(T("عرض", "View"))}: ${esc(it.title)}">
            <img src="${esc(it.thumb)}" alt="" loading="lazy" width="640" height="450"><span class="fx-cap">${esc(it.title)}</span></button>`).join("")}
        </div>
        <div class="fx-floor" aria-hidden="true"></div>
      </div>
      <div class="fx-gal-ctrl">
        <button type="button" class="btn btn-line btn-small" data-fx-prev aria-label="${esc(T("السابقة", "Previous"))}">‹</button>
        <button type="button" class="btn btn-line btn-small" data-fx-play aria-pressed="true">${esc(T("إيقاف الدوران", "Pause rotation"))}</button>
        <button type="button" class="btn btn-line btn-small" data-fx-next aria-label="${esc(T("التالية", "Next"))}">›</button>
      </div>
    </div>`;
  }

  /* ---------- behaviour ---------- */
  let offs = [];
  const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); offs.push(() => el.removeEventListener(ev, fn, o)); };

  function bindGallery(root) {
    const g = root.querySelector("[data-fx-gal]");
    if (!g) return;
    const ring = g.querySelector("[data-fx-ring]"), stage = g.querySelector("[data-fx-stage]"), play = g.querySelector("[data-fx-play]");
    const n = +getComputedStyle(g).getPropertyValue("--n") || ring.children.length;
    const step = 360 / n;
    let angle = 0, vel = 0, auto = !reduced(), hover = false, dragging = false, lastX = 0, moved = 0, raf = 0, visible = true;
    const apply = () => {
      ring.style.transform = `translateZ(calc(var(--r) * -1)) rotateY(${angle}deg)`;
      const front = ((Math.round(-angle / step) % n) + n) % n;
      ring.querySelectorAll(".fx-card").forEach((c, i) => c.classList.toggle("is-front", i === front));
    };
    const label = () => { play.textContent = auto ? T("إيقاف الدوران", "Pause rotation") : T("تشغيل الدوران", "Play rotation"); play.setAttribute("aria-pressed", String(auto)); };
    const tick = () => {
      raf = 0;
      if (!visible) return;
      if (!dragging) {
        if (Math.abs(vel) > 0.02) { angle += vel; vel *= 0.94; }
        else if (auto && !hover) angle -= 0.12;
      }
      apply();
      if (auto || dragging || Math.abs(vel) > 0.02) raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const snap = (dir) => { vel = 0; angle = Math.round(angle / step) * step + dir * step; ring.classList.add("is-snap"); apply(); setTimeout(() => ring.classList.remove("is-snap"), 650); };
    on(g.querySelector("[data-fx-prev]"), "click", () => { auto = false; label(); snap(1); });
    on(g.querySelector("[data-fx-next]"), "click", () => { auto = false; label(); snap(-1); });
    on(play, "click", () => { auto = !auto; label(); kick(); });
    on(stage, "pointerdown", (e) => { dragging = true; moved = 0; lastX = e.clientX; vel = 0; kick(); });
    on(stage, "pointermove", (e) => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx); if (moved > 8 && !stage.hasPointerCapture?.(e.pointerId)) stage.setPointerCapture?.(e.pointerId); const d = dx * (document.documentElement.dir === "rtl" ? -0.35 : 0.35); angle += d; vel = d; });
    const up = () => { dragging = false; kick(); };
    on(stage, "pointerup", up); on(stage, "pointercancel", up);
    // a drag must not count as a click on a certificate
    on(ring, "click", (e) => { if (moved > 8) { e.stopPropagation(); e.preventDefault(); moved = 0; } }, true);
    on(g, "keydown", (e) => { if (e.key === "ArrowLeft") { auto = false; label(); snap(document.documentElement.dir === "rtl" ? -1 : 1); } if (e.key === "ArrowRight") { auto = false; label(); snap(document.documentElement.dir === "rtl" ? 1 : -1); } });
    on(stage, "pointerenter", (e) => { if (e.pointerType === "mouse") hover = true; });
    on(stage, "pointerleave", () => { hover = false; kick(); });
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) kick(); }, { rootMargin: "60px" });
      io.observe(g); offs.push(() => io.disconnect());
    }
    label(); apply(); kick();
    window.__fxGallery = { get angle() { return angle; }, get auto() { return auto; } };
  }

  function reveal(root) {
    const els = [...root.querySelectorAll(".cvx-intro-text > *, .cvx-vcard, .cvx-job, .cvx-case, .cvx-cert, .cvx-sgroup, .head2, .cvx-strip li, .cvx-proof li, .pf")];
    if (reduced() || !("IntersectionObserver" in window)) return;
    els.forEach((el, i) => { el.classList.add("fx-rv"); el.style.setProperty("--d", `${(i % 4) * 70}ms`); });
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("fx-in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
    offs.push(() => io.disconnect());
    // safety net: never leave content hidden (e.g. print, very tall screens)
    const t = setTimeout(() => els.forEach((el) => el.classList.add("fx-in")), 4000);
    offs.push(() => clearTimeout(t));
  }

  function countUp(root) {
    const nums = [...root.querySelectorAll(".cvx-proof b")];
    if (reduced() || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const el = en.target, txt = el.textContent, m = txt.match(/^(\d+)(.*)$/);
      if (!m) return;
      const end = +m[1], rest = m[2], t0 = performance.now();
      const run = (now) => { const p = Math.min(1, (now - t0) / 1100), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e) + rest; if (p < 1) requestAnimationFrame(run); };
      requestAnimationFrame(run);
    }), { threshold: 0.6 });
    nums.forEach((n) => io.observe(n));
    offs.push(() => io.disconnect());
  }

  function spotlight(root) {
    const hero = root.querySelector(".cvx-hero");
    if (!hero || reduced() || !fine()) return;
    on(hero, "pointermove", (e) => { const r = hero.getBoundingClientRect(); hero.style.setProperty("--mx", `${e.clientX - r.left}px`); hero.style.setProperty("--my", `${e.clientY - r.top}px`); });
  }

  function magnetic(root) {
    if (reduced() || !fine()) return;
    root.querySelectorAll(".cvx-actions .btn, .btn-start").forEach((b) => {
      on(b, "pointermove", (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`; });
      on(b, "pointerleave", () => { b.style.transform = ""; });
    });
  }

  // About scene: idle sway, then it follows the pointer while the pointer is over it.
  function intro3d(root) {
    const scene = root.querySelector("[data-ab3d-scene]");
    if (!scene || reduced()) return;
    scene.classList.add("is-idle");
    if (!fine()) return;
    const box = root.querySelector("[data-ab3d]");
    on(box, "pointermove", (e) => {
      const r = box.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      scene.classList.remove("is-idle");
      scene.style.setProperty("--ry", `${(px * 34).toFixed(1)}deg`);
      scene.style.setProperty("--rx", `${(8 - py * 22).toFixed(1)}deg`);
    });
    on(box, "pointerleave", () => { scene.style.removeProperty("--rx"); scene.style.removeProperty("--ry"); scene.classList.add("is-idle"); });
  }

  function bind(root) {
    offs.forEach((f) => { try { f(); } catch {} });
    offs = [];
    intro3d(root);
    bindGallery(root);
    reveal(root);
    countUp(root);
    spotlight(root);
    magnetic(root);
  }

  window.CVFX = { ribbons, gallery, bind, WORDS };
})();
