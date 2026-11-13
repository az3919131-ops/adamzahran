// Admin panel (Arabic UI).
// Project Manager | Eng. Ahmed Zahran
(function () {
  const { esc, safeUrl, uid, STR } = AZ;
  const AR = STR.ar;
  const L = (v) => (v && typeof v === "object" ? v.ar || v.en || "" : v || "");

  const S = {
    content: null, published: null, baseUpdatedAt: null, tab: "profile", sectionId: null,
    settings: { webhookUrl: "", lastTest: null }, saveTimer: null, savedAt: null, restoredDraft: false,
  };
  let root;

  // ---------- helpers ----------
  const fmtDate = (iso) => { if (!iso) return "—"; try { return new Date(iso).toLocaleString("ar-SA-u-nu-latn", { dateStyle: "medium", timeStyle: "short" }); } catch { return iso; } };
  const isDirty = () => JSON.stringify(S.content) !== JSON.stringify(S.published);
  const toast = (m) => PublicView.toast(m);
  const sec = (id) => S.content.sections.find((s) => s.id === id);
  const move = (arr, from, to) => { if (to < 0 || to >= arr.length) return; const [x] = arr.splice(from, 1); arr.splice(to, 0, x); };

  function changed(rerender = true) {
    clearTimeout(S.saveTimer);
    S.saveTimer = setTimeout(() => {
      S.savedAt = Store.saveDraft(S.content, S.baseUpdatedAt);
      updateStatus();
    }, 400);
    if (rerender) renderPanel();
    updateStatus();
  }

  function updateStatus() {
    const el = root.querySelector("#save-status");
    if (!el) return;
    const dirty = isDirty();
    el.className = "save-status " + (dirty ? "dirty" : "clean");
    el.textContent = dirty
      ? `تغييرات غير منشورة${S.savedAt ? ` · حُفظت المسودة تلقائيًا ${fmtDate(S.savedAt)}` : ""}`
      : `منشور ومتطابق${S.baseUpdatedAt ? ` · آخر نشر ${fmtDate(S.baseUpdatedAt)}` : ""}`;
    const pb = root.querySelector("[data-a=publish]");
    if (pb) pb.disabled = !dirty;
  }

  // ---------- entry ----------
  async function mount(el) {
    root = el;
    root.onclick = null;
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    document.title = "لوحة الإدارة — " + AR.appName;
    if (Store.mode === "server" && !Store.token) return renderLogin();
    try {
      const { content, updatedAt, draft } = await Store.loadAdmin();
      S.published = Store.clone(content);
      S.baseUpdatedAt = updatedAt;
      S.content = content;
      if (draft && draft.content && JSON.stringify(Store.normalize(draft.content)) !== JSON.stringify(content)) {
        S.content = Store.normalize(draft.content);
        S.savedAt = draft.savedAt;
        S.restoredDraft = true;
      }
      if (Store.mode === "server") S.settings = await Store.getSettings();
      else S.settings = await Store.getSettings();
      renderShell();
    } catch (e) {
      if (String(e.message) === "unauthorized") { Store.logout(); return renderLogin("انتهت الجلسة أو الرمز غير صحيح."); }
      root.innerHTML = `<div class="wrap admin-error"><h1>تعذّر تحميل البيانات</h1><p>${esc(e.message)}</p><a class="btn" href="#/">الصفحة العامة</a></div>`;
    }
  }

  function renderLogin(err = "") {
    root.innerHTML = `
      <div class="login-wrap">
        <form class="card login" id="login">
          <h1>لوحة الإدارة</h1>
          <p class="muted">أدخل رمز الإدارة. يتم التحقق من الرمز على الخادم في كل عملية حفظ، ولا يُخزَّن داخل كود الواجهة.</p>
          ${!Store.tokenConfigured ? `<p class="alert warn">لم يُضبط رمز الإدارة على الخادم بعد (متغير البيئة <code>ADMIN_TOKEN</code> في إعدادات Netlify، 12 حرفًا على الأقل). لن يعمل الحفظ حتى يُضبط.</p>` : ""}
          <label>رمز الإدارة<input type="password" name="token" required autocomplete="current-password" dir="ltr"></label>
          ${err ? `<p class="alert err" role="alert">${esc(err)}</p>` : ""}
          <button class="btn btn-primary" type="submit">دخول</button>
          <a class="muted-link" href="#/">العودة للصفحة العامة</a>
        </form>
      </div>
      <footer class="site-footer"><div class="wrap"><p class="sig">${esc(AR.footer)}</p></div></footer>`;
    root.querySelector("#login").addEventListener("submit", async (e) => {
      e.preventDefault();
      const token = e.target.token.value.trim();
      const ok = await Store.login(token).catch(() => false);
      if (ok) mount(root); else renderLogin("الرمز غير صحيح.");
    });
  }

  const TABS = [
    ["profile", "الملف الشخصي"],
    ["sections", "الأقسام والمحتوى"],
    ["future", "التطوير والإضافات المستقبلية"],
    ["contact", "التواصل والرد التلقائي"],
    ["messages", "سجل الرسائل"],
    ["tags", "الوسوم"],
    ["backup", "النسخ والاستيراد"],
  ];

  function renderShell() {
    root.innerHTML = `
      <div class="admin">
        <header class="admin-top">
          <div class="admin-top-in">
            <div class="admin-title"><strong>لوحة الإدارة</strong>
              <span class="mode-badge ${Store.mode}">${Store.mode === "server" ? "حفظ سحابي (Netlify)" : "حفظ محلي في هذا المتصفح"}</span></div>
            <span id="save-status" class="save-status"></span>
            <div class="admin-actions">
              <a class="btn btn-small" href="#/preview" target="_blank" rel="noopener" data-a="preview">معاينة</a>
              <button class="btn btn-small btn-primary" data-a="publish">نشر التغييرات</button>
              <a class="btn btn-small" href="#/">الصفحة العامة</a>
              ${Store.mode === "server" ? `<button class="btn btn-small" data-a="logout">خروج</button>` : ""}
            </div>
          </div>
        </header>
        ${Store.mode === "local" ? `<p class="alert warn wrap">وضع الحفظ المحلي: البيانات تُحفظ في LocalStorage على هذا المتصفح فقط، ولا توجد حماية حقيقية لوضع الإدارة هنا. للنشر لجميع الزوار والحماية بالرمز استخدم النسخة المنشورة على Netlify.</p>` : ""}
        ${S.restoredDraft ? `<p class="alert info wrap" id="draft-banner">تم استرجاع مسودة محفوظة تلقائيًا (${fmtDate(S.savedAt)}) لم تُنشر بعد.
          <button class="btn btn-small" data-a="discard-draft">تجاهل المسودة والعودة للنسخة المنشورة</button></p>` : ""}
        <div class="admin-body">
          <nav class="admin-nav" aria-label="أقسام لوحة الإدارة">
            ${TABS.map(([k, l]) => `<button class="tab ${S.tab === k ? "active" : ""}" data-tab="${k}">${l}</button>`).join("")}
          </nav>
          <section class="admin-panel" id="panel" tabindex="-1"></section>
        </div>
        <footer class="site-footer"><div class="wrap"><p class="sig">${esc(AR.footer)}</p></div></footer>
      </div>
      <dialog id="dlg" class="dlg"></dialog>`;

    root.querySelector(".admin-nav").addEventListener("click", (e) => {
      const b = e.target.closest("[data-tab]"); if (!b) return;
      S.tab = b.dataset.tab; S.sectionId = null;
      root.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x === b));
      renderPanel();
    });
    root.querySelector(".admin-top").addEventListener("click", async (e) => {
      const b = e.target.closest("[data-a]"); if (!b) return;
      if (b.dataset.a === "preview") { clearTimeout(S.saveTimer); S.savedAt = Store.saveDraft(S.content, S.baseUpdatedAt); }
      if (b.dataset.a === "publish") publish();
      if (b.dataset.a === "logout") { Store.logout(); location.hash = "#/"; }
    });
    root.querySelector("#draft-banner")?.addEventListener("click", (e) => {
      if (!e.target.closest("[data-a=discard-draft]")) return;
      if (!confirm("سيتم حذف المسودة غير المنشورة. متابعة؟")) return;
      Store.clearDraft(); S.content = Store.clone(S.published); S.savedAt = null; S.restoredDraft = false;
      e.currentTarget.remove(); renderPanel(); updateStatus();
    });
    renderPanel();
    updateStatus();
  }

  async function publish() {
    const missing = validate();
    if (missing.length) { alert("لا يمكن النشر — حقول مطلوبة ناقصة:\n" + missing.slice(0, 8).join("\n")); return; }
    if (!confirm("نشر التغييرات الحالية في الصفحة العامة؟")) return;
    try {
      const at = await Store.publish(S.content);
      S.published = Store.clone(S.content); S.baseUpdatedAt = at; Store.clearDraft(); S.savedAt = null;
      S.restoredDraft = false; root.querySelector("#draft-banner")?.remove();
      toast("تم النشر بنجاح"); updateStatus();
    } catch (e) {
      if (String(e.message) === "unauthorized") { alert("انتهت الجلسة، سجّل الدخول مجددًا. مسودتك محفوظة."); Store.logout(); renderLogin(); return; }
      alert("فشل النشر: " + e.message + "\nمسودتك محفوظة محليًا.");
    }
  }

  function validate() {
    const out = [];
    for (const s of S.content.sections) {
      for (const it of s.items) {
        for (const f of AZ.fieldsFor(s)) {
          if (!f.required) continue;
          const v = it[f.key];
          const empty = f.kind.startsWith("l") ? !L(v).trim() : f.kind === "file" ? !(v && v.url) : !String(v || "").trim();
          if (empty) out.push(`• ${L(s.title)} ← ${L(it.title) || "(بدون عنوان)"}: ${f.label}`);
        }
      }
    }
    return out;
  }

  // ---------- panels ----------
  function renderPanel() {
    const p = root.querySelector("#panel");
    if (!p) return;
    const map = { profile: panelProfile, sections: panelSections, future: () => panelSection("future"), contact: panelContact, messages: panelMessages, tags: panelTags, backup: panelBackup };
    if (S.tab === "sections" && S.sectionId) panelSection(S.sectionId, p);
    else (map[S.tab] || panelProfile)(p);
  }

  // Bilingual input pair
  const lInput = (name, v, label, area = false, rows = 3, req = false) => `
    <fieldset class="lpair"><legend>${esc(label)}${req ? ' <span class="req">*</span>' : ""}</legend>
      <label>عربي${area ? `<textarea name="${name}.ar" rows="${rows}" ${req ? "required" : ""}>${esc(v?.ar || "")}</textarea>` : `<input name="${name}.ar" value="${esc(v?.ar || "")}" ${req ? "required" : ""}>`}</label>
      <label>English${area ? `<textarea name="${name}.en" rows="${rows}" dir="ltr">${esc(v?.en || "")}</textarea>` : `<input name="${name}.en" value="${esc(v?.en || "")}" dir="ltr">`}</label>
    </fieldset>`;

  function panelProfile(p) {
    const pr = S.content.profile;
    p.innerHTML = `<h2>الملف الشخصي والنبذة</h2>
      <form class="form" id="f-profile">
        ${lInput("name", pr.name, "الاسم المعروض", false, 0, true)}
        ${lInput("title", pr.title, "المسمى المهني")}
        ${lInput("headline", pr.headline, "العنوان الرئيسي في أعلى الصفحة")}
        ${lInput("location", pr.location, "الموقع")}
        ${lInput("experienceSummary", pr.experienceSummary, "ملخص الخبرة", true, 2)}
        ${lInput("bio", pr.bio, "النص الداعم تحت العنوان الرئيسي", true, 4)}
        ${lInput("about", pr.about, "نبذة «عني» (فقرة في كل سطرين)", true, 9)}
        ${fieldHTML({ key: "photo", kind: "image", label: "الصورة الشخصية (اختياري)" }, pr.photo)}
        ${fieldHTML({ key: "cvUrl", kind: "url", label: "رابط السيرة الذاتية (يظهر كزر في أعلى الصفحة)" }, pr.cvUrl)}
        <fieldset class="tags-pick stats-edit"><legend>أرقام الواجهة</legend>
          <p class="muted small">اكتب الرقم الذي تريد عرضه، أو اترك الخانة فارغة ليُحسب تلقائيًا من البيانات. ألغِ «إظهار» لإخفاء الرقم.</p>
          ${[["years", "سنوات الخبرة"], ["projects", "المشاريع"], ["courses", "الدورات"], ["platforms", "المنصات"]].map(([k, l]) => `<div class="grid-2">
            <label>${l}<input name="st_${k}" value="${esc(S.content.stats?.[k]?.value || "")}" dir="ltr" maxlength="8" placeholder="تلقائي"></label>
            <label class="switch inline"><input type="checkbox" name="st_${k}_v" ${S.content.stats?.[k]?.show !== false ? "checked" : ""}><span>إظهار</span></label></div>`).join("")}
        </fieldset>
      </form>`;
    const f = p.querySelector("#f-profile");
    bindUploads(f);
    f.addEventListener("input", () => {
      for (const k of ["name", "title", "headline", "location", "experienceSummary", "bio", "about"]) pr[k] = { ar: f[`${k}.ar`].value, en: f[`${k}.en`].value };
      pr.photo = f.photo.value.trim();
      pr.cvUrl = f.cvUrl.value.trim();
      S.content.stats = Object.fromEntries(["years", "projects", "courses", "platforms"].map((k) => [k, { show: f[`st_${k}_v`].checked, value: f[`st_${k}`].value.trim() }]));
      changed(false);
    });
  }

  function panelSections(p) {
    const secs = S.content.sections;
    p.innerHTML = `<h2>الأقسام والمحتوى</h2>
      <p class="muted">اسحب الأقسام لترتيبها في الصفحة العامة. القسم الذي لا يحتوي عناصر ظاهرة لا يظهر للزوار تلقائيًا.</p>
      <ul class="sortable sec-list" id="sec-list">
        ${secs.map((s, i) => {
          const vis = s.items.filter((x) => x.visible !== false).length;
          const shown = s.visible !== false && vis > 0;
          return `<li class="row" data-id="${esc(s.id)}">
            <span class="handle" title="اسحب للترتيب" aria-hidden="true">⠿</span>
            <div class="row-main"><strong>${esc(L(s.title))}</strong>
              <span class="muted small">${s.items.length} عنصر · ${vis} ظاهر${s.type === "custom" ? ` · قسم مخصص (${esc(AR["card_" + (s.cardType || "link")])})` : ""}</span>
              <span class="pill ${shown ? "pill-on" : "pill-off"}">${shown ? "ظاهر للزوار" : s.visible === false ? "مخفي" : "لا يظهر (لا توجد عناصر ظاهرة)"}</span></div>
            <div class="row-actions">
              <button class="btn btn-small btn-icon" data-a="up" data-i="${i}" aria-label="تحريك لأعلى">▲</button>
              <button class="btn btn-small btn-icon" data-a="down" data-i="${i}" aria-label="تحريك لأسفل">▼</button>
              <label class="switch"><input type="checkbox" data-a="vis" data-i="${i}" ${s.visible !== false ? "checked" : ""}><span>إظهار القسم</span></label>
              <button class="btn btn-small btn-primary" data-a="edit" data-id="${esc(s.id)}">إدارة العناصر</button>
              ${s.type === "custom" ? `<button class="btn btn-small btn-danger" data-a="del" data-i="${i}">حذف القسم</button>` : ""}
            </div></li>`;
        }).join("")}
      </ul>
      <div class="card new-sec">
        <h3>إنشاء قسم جديد</h3>
        <form id="f-newsec" class="form grid-2">
          <label>اسم القسم (عربي) <span class="req">*</span><input name="ar" required></label>
          <label>اسم القسم (English)<input name="en" dir="ltr"></label>
          <label>شكل البطاقات<select name="cardType">
            <option value="link">رابط</option><option value="text">نص</option><option value="image">صورة</option><option value="file">ملف</option></select></label>
          <label class="switch inline"><input type="checkbox" name="visible" checked><span>إظهار القسم</span></label>
          <button class="btn btn-primary" type="submit">إنشاء القسم</button>
        </form>
      </div>`;

    p.querySelector("#sec-list").addEventListener("click", (e) => {
      const b = e.target.closest("[data-a]"); if (!b) return;
      const i = +b.dataset.i;
      if (b.dataset.a === "up") { move(secs, i, i - 1); changed(); }
      if (b.dataset.a === "down") { move(secs, i, i + 1); changed(); }
      if (b.dataset.a === "edit") { S.sectionId = b.dataset.id; renderPanel(); }
      if (b.dataset.a === "del" && confirm(`حذف القسم «${L(secs[i].title)}» وكل عناصره؟`)) { secs.splice(i, 1); changed(); }
    });
    p.querySelector("#sec-list").addEventListener("change", (e) => {
      const b = e.target.closest("[data-a=vis]"); if (!b) return;
      secs[+b.dataset.i].visible = b.checked; changed();
    });
    makeSortable(p.querySelector("#sec-list"), secs);
    p.querySelector("#f-newsec").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      if (!f.ar.value.trim()) return;
      secs.push({ id: uid("sec"), type: "custom", cardType: f.cardType.value, visible: f.visible.checked, title: { ar: f.ar.value.trim(), en: f.en.value.trim() }, items: [] });
      changed(); toast("تم إنشاء القسم");
    });
  }

  function itemBadges(s, it) {
    const b = [];
    if (it.visible === false) b.push('<span class="pill pill-off">مخفي</span>');
    else b.push('<span class="pill pill-on">ظاهر</span>');
    if (it.featured) b.push('<span class="pill pill-gold">رئيسي</span>');
    if (it.status) b.push(`<span class="pill">${esc(AR["status_" + it.status] || it.status)}</span>`);
    if (s.type === "courses") b.push(`<span class="pill">${it.kind === "certificate" ? "شهادة معتمدة" : "دورة تدريبية"}</span>`);
    return b.join("");
  }

  function panelSection(id, p = root.querySelector("#panel")) {
    const s = sec(id);
    if (!s) { S.sectionId = null; return panelSections(p); }
    const label = s.type === "custom" ? "عنصر" : (AZ.SCHEMAS[s.type] || {}).label || "عنصر";
    p.innerHTML = `
      ${S.tab === "sections" ? `<button class="btn btn-small" data-a="back">→ العودة لقائمة الأقسام</button>` : ""}
      <h2>${esc(L(s.title))}</h2>
      ${s.type === "future" ? `<p class="alert info">هذه العناصر لا تظهر في الصفحة العامة إلا عند تفعيل «إظهار» لكل عنصر. حدّد الحالة بدقة: لا تختر «شهادة معتمدة» أو «مكتمل» إلا إذا كان ذلك موثقًا.</p>` : ""}
      ${s.type === "insurance" && !s.items.length ? `<p class="alert info">القسم فارغ حاليًا ولن يظهر في الصفحة العامة حتى تضيف أول موقع وتفعّله.</p>` : ""}
      <form class="form grid-2 sec-meta" id="f-secmeta">
        <label>اسم القسم (عربي)<input name="ar" value="${esc(s.title.ar || "")}"></label>
        <label>اسم القسم (English)<input name="en" value="${esc(s.title.en || "")}" dir="ltr"></label>
        <label class="switch inline"><input type="checkbox" name="visible" ${s.visible !== false ? "checked" : ""}><span>إظهار القسم في الصفحة العامة</span></label>
        ${s.type === "custom" ? `<label>شكل البطاقات<select name="cardType">${["link", "text", "image", "file"].map((c) => `<option value="${c}" ${s.cardType === c ? "selected" : ""}>${AR["card_" + c]}</option>`).join("")}</select></label>` : ""}
      </form>
      <div class="list-head"><h3>العناصر (${s.items.length})</h3><button class="btn btn-primary" data-a="add">+ إضافة ${esc(label)} جديد</button></div>
      ${s.items.length ? "" : `<p class="muted">لا توجد عناصر بعد.</p>`}
      <ul class="sortable item-list" id="item-list">
        ${s.items.map((it, i) => `<li class="row" data-id="${esc(it.id)}">
          <span class="handle" title="اسحب للترتيب" aria-hidden="true">⠿</span>
          <div class="row-main"><strong>${esc(L(it.title) || "(بدون عنوان)")}</strong> ${itemBadges(s, it)}</div>
          <div class="row-actions">
            <button class="btn btn-small btn-icon" data-a="up" data-i="${i}" aria-label="لأعلى">▲</button>
            <button class="btn btn-small btn-icon" data-a="down" data-i="${i}" aria-label="لأسفل">▼</button>
            <label class="switch"><input type="checkbox" data-a="vis" data-i="${i}" ${it.visible !== false ? "checked" : ""}><span>إظهار</span></label>
            <label class="switch"><input type="checkbox" data-a="feat" data-i="${i}" ${it.featured ? "checked" : ""}><span>رئيسي</span></label>
            <button class="btn btn-small" data-a="edit" data-i="${i}">تعديل</button>
            <button class="btn btn-small btn-danger" data-a="del" data-i="${i}">حذف</button>
          </div></li>`).join("")}
      </ul>`;

    p.querySelector("[data-a=back]")?.addEventListener("click", () => { S.sectionId = null; renderPanel(); });
    const meta = p.querySelector("#f-secmeta");
    meta.addEventListener("input", () => {
      s.title = { ar: meta.ar.value, en: meta.en.value };
      s.visible = meta.visible.checked;
      if (meta.cardType) s.cardType = meta.cardType.value;
      changed(false);
    });
    meta.addEventListener("change", (e) => { if (e.target.name === "cardType") renderPanel(); });
    p.querySelector("[data-a=add]").addEventListener("click", () => editItem(s, null));
    const list = p.querySelector("#item-list");
    list.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-a]"); if (!b) return;
      const i = +b.dataset.i;
      if (b.dataset.a === "up") { move(s.items, i, i - 1); changed(); }
      if (b.dataset.a === "down") { move(s.items, i, i + 1); changed(); }
      if (b.dataset.a === "edit") editItem(s, i);
      if (b.dataset.a === "del" && confirm(`حذف «${L(s.items[i].title) || "العنصر"}»؟`)) { s.items.splice(i, 1); changed(); toast("تم الحذف"); }
    });
    list.addEventListener("change", (e) => {
      const b = e.target.closest("input[data-a]"); if (!b) return;
      const it = s.items[+b.dataset.i];
      if (b.dataset.a === "vis") it.visible = b.checked;
      if (b.dataset.a === "feat") it.featured = b.checked;
      changed();
    });
    makeSortable(list, s.items);
  }

  function makeSortable(el, arr) {
    if (!window.Sortable || !el) return;
    Sortable.create(el, {
      handle: ".handle", animation: 150,
      onEnd: (ev) => { if (ev.oldIndex !== ev.newIndex) { move(arr, ev.oldIndex, ev.newIndex); changed(); } },
    });
  }

  // ---------- generic field rendering ----------
  function fieldHTML(f, v) {
    const req = f.required ? ' <span class="req">*</span>' : "";
    const help = f.help ? `<small class="muted">${esc(f.help)}</small>` : "";
    switch (f.kind) {
      case "ltext": return lInput(f.key, v, f.label, false, 0, f.required);
      case "ltextarea": return lInput(f.key, v, f.label, true, 3, f.required);
      case "llines": return lInput(f.key, v, f.label, true, 6, f.required);
      case "bool": return `<label class="switch inline"><input type="checkbox" name="${f.key}" ${v ? "checked" : ""}><span>${esc(f.label)}</span></label>`;
      case "select": return `<label>${esc(f.label)}${req}<select name="${f.key}">${f.options.map((o) => `<option value="${o}" ${v === o ? "selected" : ""}>${esc(AR[f.prefix + o] || o)}</option>`).join("")}</select>${help}</label>`;
      case "url": return `<label>${esc(f.label)}${req}<input type="url" name="${f.key}" value="${esc(v || "")}" dir="ltr" placeholder="https://" ${f.required ? "required" : ""}></label>`;
      case "year": return `<label>${esc(f.label)}${req}<input name="${f.key}" value="${esc(v || "")}" dir="ltr" placeholder="2024 أو 2024-05" pattern="\\d{4}(-\\d{2})?(-\\d{2})?"></label>`;
      case "image": return `<div class="upload-field"><label>${esc(f.label)}${req}<input name="${f.key}" value="${esc(v || "")}" dir="ltr" placeholder="رابط الصورة أو ارفع ملفًا"></label>
          <label class="btn btn-small upload-btn">رفع صورة<input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" data-upload="${f.key}" hidden></label>
          ${safeUrl(v) ? `<img class="upload-preview" src="${esc(safeUrl(v))}" alt="">` : ""}</div>`;
      case "file": return `<div class="upload-field"><label>${esc(f.label)}${req}<input name="${f.key}.url" value="${esc(v?.url || "")}" dir="ltr" placeholder="رابط الملف أو ارفع ملفًا"></label>
          <label>اسم الملف المعروض<input name="${f.key}.name" value="${esc(v?.name || "")}"></label>
          <label class="btn btn-small upload-btn">رفع ملف (PDF أو صورة)<input type="file" accept="application/pdf,image/png,image/jpeg,image/webp" data-upload="${f.key}.url" data-name="${f.key}.name" hidden></label></div>`;
      default: return `<label>${esc(f.label)}${req}<input name="${f.key}" value="${esc(v || "")}" ${f.required ? "required" : ""}></label>${help}`;
    }
  }

  function readField(form, f) {
    switch (f.kind) {
      case "ltext": case "ltextarea": case "llines": return { ar: form[`${f.key}.ar`].value.trim(), en: form[`${f.key}.en`].value.trim() };
      case "bool": return form[f.key].checked;
      case "file": { const url = form[`${f.key}.url`].value.trim(); return url ? { url, name: form[`${f.key}.name`].value.trim() } : null; }
      default: return form[f.key].value.trim();
    }
  }

  function bindUploads(form) {
    form.querySelectorAll("[data-upload]").forEach((inp) => inp.addEventListener("change", async () => {
      const file = inp.files[0]; if (!file) return;
      const target = form.querySelector(`[name="${inp.dataset.upload}"]`);
      const lbl = inp.parentElement; const old = lbl.firstChild.textContent; lbl.firstChild.textContent = "جارٍ الرفع…";
      try {
        const r = await Store.upload(file);
        target.value = r.url;
        if (inp.dataset.name) { const n = form.querySelector(`[name="${inp.dataset.name}"]`); if (n && !n.value) n.value = r.name; }
        target.dispatchEvent(new Event("input", { bubbles: true }));
        toast("تم رفع الملف");
      } catch (e) { alert("فشل الرفع: " + e.message); }
      lbl.firstChild.textContent = old; inp.value = "";
    }));
  }

  function editItem(s, index) {
    const isNew = index === null;
    const it = isNew ? { id: uid(s.type), visible: s.type !== "future", featured: false, tags: [] } : s.items[index];
    const fields = AZ.fieldsFor(s);
    const dlg = root.querySelector("#dlg");
    dlg.innerHTML = `<form method="dialog" class="form dlg-form" id="f-item" novalidate>
      <header class="dlg-head"><h3>${isNew ? "إضافة" : "تعديل"} — ${esc(L(s.title))}</h3><button type="button" class="btn btn-icon" data-a="close" aria-label="إغلاق">✕</button></header>
      <div class="dlg-body">
        ${fields.map((f) => fieldHTML(f, it[f.key] ?? (f.kind === "select" ? f.options[0] : ""))).join("")}
        <fieldset class="tags-pick"><legend>الوسوم</legend>
          ${S.content.tags.map((tg) => `<label class="check"><input type="checkbox" name="tag" value="${esc(tg.id)}" ${(it.tags || []).includes(tg.id) ? "checked" : ""}><span>${esc(tg.ar)}</span></label>`).join("") || '<span class="muted">لا توجد وسوم — أضفها من تبويب الوسوم.</span>'}
        </fieldset>
        <div class="grid-2">
          <label class="switch inline"><input type="checkbox" name="_visible" ${it.visible !== false ? "checked" : ""}><span>إظهار في الصفحة العامة</span></label>
          <label class="switch inline"><input type="checkbox" name="_featured" ${it.featured ? "checked" : ""}><span>تمييز كعنصر رئيسي</span></label>
        </div>
        <p class="alert err" id="item-err" hidden></p>
      </div>
      <footer class="dlg-foot"><button type="submit" class="btn btn-primary">حفظ</button><button type="button" class="btn" data-a="close">إلغاء</button></footer>
    </form>`;
    const form = dlg.querySelector("#f-item");
    bindUploads(form);
    dlg.querySelectorAll("[data-a=close]").forEach((b) => b.addEventListener("click", () => dlg.close()));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = {};
      for (const f of fields) data[f.key] = readField(form, f);
      const errs = fields.filter((f) => f.required && (f.kind.startsWith("l") ? !(data[f.key].ar || data[f.key].en) : f.kind === "file" ? !data[f.key] : !data[f.key])).map((f) => f.label);
      const badUrl = fields.filter((f) => (f.kind === "url" || f.kind === "image") && data[f.key] && !safeUrl(data[f.key])).map((f) => f.label + " (رابط غير صالح)");
      const badYear = fields.filter((f) => f.kind === "year" && data[f.key] && !/^\d{4}(-\d{2})?(-\d{2})?$/.test(data[f.key])).map((f) => f.label + " (الصيغة: 2024 أو 2024-05)");
      const all = [...errs.map((x) => x + " (مطلوب)"), ...badUrl, ...badYear];
      if (all.length) { const el = form.querySelector("#item-err"); el.hidden = false; el.textContent = "يرجى تصحيح: " + all.join("، "); return; }
      for (const f of fields) if (f.kind === "url" || f.kind === "image") data[f.key] = data[f.key] ? safeUrl(data[f.key]) : "";
      Object.assign(it, data);
      it.tags = [...form.querySelectorAll("[name=tag]:checked")].map((x) => x.value);
      it.visible = form._visible.checked;
      it.featured = form._featured.checked;
      if (isNew) s.items.push(it);
      dlg.close();
      changed();
      toast(isNew ? "تمت الإضافة" : "تم الحفظ");
    });
    dlg.showModal();
    form.querySelector("input,textarea,select")?.focus();
  }

  // ---------- contact & webhook ----------
  function webhookState() {
    const s = S.settings;
    if (!s.webhookUrl) return ["off", "غير مضبوط"];
    if (s.lastTest && !s.lastTest.ok) return ["fail", `فشل آخر اختبار (${fmtDate(s.lastTest.at)})`];
    if (s.lastTest && s.lastTest.ok) return ["ok", `مضبوط — نجح آخر اختبار (${fmtDate(s.lastTest.at)})`];
    return ["set", "مضبوط — لم يُختبر بعد"];
  }

  function panelContact(p) {
    const c = S.content.contact;
    const [st, stLabel] = webhookState();
    p.innerHTML = `<h2>التواصل والرد التلقائي</h2>
      <form class="form" id="f-contact">
        <div class="grid-2">
          <label>الاسم<input name="name" value="${esc(c.name?.value || "")}"></label>
          <label class="switch inline"><input type="checkbox" name="name_v" ${c.name?.visible !== false ? "checked" : ""}><span>إظهار الاسم</span></label>
          <label>البريد الإلكتروني<input type="email" name="email" value="${esc(c.email?.value || "")}" dir="ltr"></label>
          <label class="switch inline"><input type="checkbox" name="email_v" ${c.email?.visible !== false ? "checked" : ""}><span>إظهار البريد</span></label>
          <label>رقم واتساب (محلي)<input name="wa" value="${esc(c.whatsapp?.value || "")}" dir="ltr" inputmode="tel"></label>
          <label>رمز الدولة<input name="cc" value="${esc(c.whatsapp?.country || "966")}" dir="ltr" inputmode="numeric"></label>
          <label class="switch inline"><input type="checkbox" name="wa_v" ${c.whatsapp?.visible !== false ? "checked" : ""}><span>إظهار واتساب</span></label>
          <label class="switch inline"><input type="checkbox" name="form_v" ${c.formVisible !== false ? "checked" : ""}><span>إظهار نموذج التواصل</span></label>
        </div>
        ${lInput("waMsg", c.whatsappMessage, "رسالة واتساب الجاهزة", true, 2)}
        <p class="muted small">رابط واتساب الناتج: <a id="wa-preview" href="#" target="_blank" rel="noopener" dir="ltr"></a></p>
      </form>

      <div class="card webhook">
        <h3>الرد التلقائي (Webhook)</h3>
        <p class="muted">عند إرسال نموذج التواصل تُرسَل بيانات الرسالة بصيغة JSON إلى هذا الرابط (مثل بوت n8n) ليتولى الرد على العميل. التطبيق لا يرسل ردودًا بنفسه ولا يخزّن أي مفاتيح أو توكنات في الواجهة.
        ${Store.mode === "server" ? "الرابط محفوظ في الخادم ولا يظهر للزوار." : "في وضع الحفظ المحلي يُرسل المتصفح مباشرة إلى الرابط (قد يتطلب السماح بـ CORS في أداة الأتمتة)."}</p>
        <p class="wh-status wh-${st}" id="wh-status"><span class="dot"></span>${esc(stLabel)}</p>
        <form id="f-webhook" class="form">
          <label>رابط Webhook للرد التلقائي<input type="url" name="url" value="${esc(S.settings.webhookUrl || "")}" dir="ltr" placeholder="https://your-n8n/webhook/..."></label>
          <div class="actions"><button class="btn btn-primary" type="submit">حفظ الرابط</button>
            <button class="btn" type="button" data-a="test" ${S.settings.webhookUrl ? "" : "disabled"}>اختبار الاتصال</button></div>
        </form>
        <div id="wh-result" role="status" aria-live="polite"></div>
        <details class="muted small"><summary>شكل البيانات المرسلة (JSON)</summary>
<pre dir="ltr">{ "type": "contact_message", "test": false, "name": "...", "contact": "...", "subject": "...",
  "message": "...", "lang": "ar", "submittedAt": "ISO-8601", "source": "https://..." }</pre></details>
      </div>`;

    const f = p.querySelector("#f-contact");
    const sync = () => {
      c.name = { value: f.name.value.trim(), visible: f.name_v.checked };
      c.email = { value: f.email.value.trim(), visible: f.email_v.checked };
      c.whatsapp = { value: f.wa.value.trim(), country: f.cc.value.trim() || "966", visible: f.wa_v.checked };
      c.formVisible = f.form_v.checked;
      c.whatsappMessage = { ar: f["waMsg.ar"].value, en: f["waMsg.en"].value };
      const link = AZ.waLink(c, c.whatsappMessage.ar);
      const a = p.querySelector("#wa-preview"); a.textContent = link || "—"; a.href = link || "#";
    };
    sync();
    f.addEventListener("input", () => { sync(); changed(false); });

    const wf = p.querySelector("#f-webhook");
    wf.addEventListener("submit", async (e) => {
      e.preventDefault();
      const url = wf.url.value.trim();
      if (url && !/^https?:\/\//i.test(url)) { alert("الرابط يجب أن يبدأ بـ http:// أو https://"); return; }
      try { S.settings = await Store.saveSettings({ webhookUrl: url }); toast("تم حفظ الرابط"); panelContact(p); }
      catch (err) { alert("فشل الحفظ: " + err.message); }
    });
    p.querySelector("[data-a=test]").addEventListener("click", async (e) => {
      const out = p.querySelector("#wh-result");
      e.target.disabled = true; out.className = "alert info"; out.textContent = "جارٍ إرسال رسالة تجريبية…";
      const r = await Store.testWebhook().catch((err) => ({ ok: false, lastTest: { status: 0, message: err.message } }));
      if (r.notConfigured) { out.className = "alert warn"; out.textContent = "الرابط غير مضبوط."; e.target.disabled = false; return; }
      S.settings.lastTest = r.lastTest;
      const lt = r.lastTest || {};
      const [st2, lbl2] = webhookState();
      const sEl = p.querySelector("#wh-status"); sEl.className = `wh-status wh-${st2}`; sEl.innerHTML = `<span class="dot"></span>${esc(lbl2)}`;
      out.className = r.ok ? "alert ok" : "alert err";
      out.textContent = r.ok ? `نجح الاتصال — رمز الاستجابة ${lt.status}. ${lt.message ? "الرد: " + lt.message : ""}`
        : `فشل الاتصال — ${lt.status ? "رمز الاستجابة " + lt.status : "لم يصل الطلب"}. ${lt.message || ""}`;
      e.target.disabled = false;
    });
  }

  async function panelMessages(p) {
    p.innerHTML = `<h2>سجل الرسائل</h2><p class="muted">آخر الرسائل المرسلة من نموذج التواصل والاختبارات، وحالة تسليمها للرد التلقائي.</p>
      <div class="actions"><button class="btn btn-small" data-a="refresh">تحديث</button><button class="btn btn-small btn-danger" data-a="clear">مسح السجل</button></div>
      <div id="msgs" class="table-wrap"><p class="muted">جارٍ التحميل…</p></div>`;
    const load = async () => {
      const msgs = await Store.listMessages().catch(() => []);
      p.querySelector("#msgs").innerHTML = msgs.length ? `<table class="table"><thead><tr><th>التاريخ</th><th>الاسم</th><th>التواصل</th><th>الموضوع</th><th>الرسالة</th><th>الحالة</th></tr></thead><tbody>
        ${msgs.map((m) => `<tr><td>${esc(fmtDate(m.submittedAt))}</td><td>${esc(m.name)}${m.test ? ' <span class="pill">تجريبية</span>' : ""}</td><td dir="ltr">${esc(m.contact)}</td>
          <td>${esc(m.subject || "")}</td><td class="msg-cell">${esc(m.message || "")}</td>
          <td><span class="pill ${m.delivered ? "pill-on" : "pill-off"}">${m.delivered ? "تم التسليم" : "فشل"}</span> <small class="muted">${esc(String(m.status ?? ""))} ${esc(m.response || "")}</small></td></tr>`).join("")}
        </tbody></table>` : `<p class="muted">لا توجد رسائل.</p>`;
    };
    p.querySelector("[data-a=refresh]").addEventListener("click", load);
    p.querySelector("[data-a=clear]").addEventListener("click", async () => { if (confirm("مسح سجل الرسائل؟")) { await Store.clearMessages(); load(); } });
    load();
  }

  function panelTags(p) {
    const tags = S.content.tags;
    p.innerHTML = `<h2>الوسوم</h2><p class="muted">تُستخدم لتصنيف العناصر والتصفية في الصفحة العامة.</p>
      <form id="f-tags" class="form">
        ${tags.map((tg, i) => `<div class="grid-3 tag-row"><input name="ar-${i}" value="${esc(tg.ar)}" aria-label="الوسم عربي"><input name="en-${i}" value="${esc(tg.en || "")}" dir="ltr" aria-label="Tag English">
          <button type="button" class="btn btn-small btn-danger" data-del="${i}">حذف</button></div>`).join("")}
      </form>
      <form id="f-newtag" class="form grid-3"><input name="ar" placeholder="وسم جديد (عربي)" required><input name="en" placeholder="English" dir="ltr"><button class="btn btn-primary">إضافة وسم</button></form>`;
    const f = p.querySelector("#f-tags");
    f.addEventListener("input", () => { tags.forEach((tg, i) => { tg.ar = f[`ar-${i}`].value; tg.en = f[`en-${i}`].value; }); changed(false); });
    f.addEventListener("click", (e) => {
      const b = e.target.closest("[data-del]"); if (!b) return;
      const tg = tags[+b.dataset.del];
      if (!confirm(`حذف الوسم «${tg.ar}» وإزالته من كل العناصر؟`)) return;
      tags.splice(+b.dataset.del, 1);
      S.content.sections.forEach((s) => s.items.forEach((it) => (it.tags = (it.tags || []).filter((x) => x !== tg.id))));
      changed();
    });
    p.querySelector("#f-newtag").addEventListener("submit", (e) => {
      e.preventDefault(); const t = e.target;
      if (!t.ar.value.trim()) return;
      tags.push({ id: uid("tag"), ar: t.ar.value.trim(), en: t.en.value.trim() }); changed();
    });
  }

  // ---------- backup / import / versions / CV ----------
  async function panelBackup(p) {
    p.innerHTML = `<h2>النسخ الاحتياطي والاستيراد</h2>
      <div class="card"><h3>تصدير واستيراد JSON</h3>
        <p class="muted">يشمل التصدير كل المحتوى ورابط الرد التلقائي.</p>
        <div class="actions"><button class="btn btn-primary" data-a="export">تصدير البيانات (JSON)</button>
        <label class="btn">استيراد ملف JSON<input type="file" accept="application/json,.json" id="imp" hidden></label></div></div>
      <div class="card"><h3>استرجاع نسخة منشورة سابقة</h3>
        <p class="muted">يُحفظ تلقائيًا ما قبل كل نشر. الاسترجاع يحمّل النسخة كمسودة، ثم تنشرها إن أردت.</p>
        <div id="versions"><p class="muted">جارٍ التحميل…</p></div></div>
      <div class="card"><h3>استيراد سيرة ذاتية (PDF)</h3>
        <p class="muted">يُستخرج النص من ملف PDF داخل المتصفح، ثم تُعرض البيانات المقترحة للمراجعة والتعديل قبل اعتمادها. لا يُضاف شيء دون موافقتك.</p>
        <label class="btn">اختيار ملف CV بصيغة PDF<input type="file" accept="application/pdf" id="cv" hidden></label>
        <div id="cv-out"></div></div>
      <div class="card"><h3>إعادة التعيين</h3>
        <p class="muted">إرجاع المسودة إلى البيانات الأولية (لن يُنشر شيء حتى تضغط «نشر»).</p>
        <button class="btn btn-danger" data-a="reset">إعادة إلى البيانات الأولية</button></div>`;

    p.querySelector("[data-a=export]").addEventListener("click", () => {
      const data = { app: "az-professional-dashboard", exportedAt: new Date().toISOString(), content: S.content, settings: { webhookUrl: S.settings.webhookUrl || "" } };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = `ahmed-zahran-backup-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast("تم التصدير");
    });
    p.querySelector("#imp").addEventListener("change", async (e) => {
      const file = e.target.files[0]; if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        const content = data.content || data;
        if (!content || !Array.isArray(content.sections)) throw new Error("الملف لا يحتوي بيانات صالحة");
        if (!confirm("سيتم استبدال المسودة الحالية بالبيانات المستوردة. متابعة؟")) return;
        S.content = Store.normalize(content);
        if (data.settings && typeof data.settings.webhookUrl === "string" && data.settings.webhookUrl !== (S.settings.webhookUrl || "")
          && confirm("الملف يحتوي رابط رد تلقائي مختلفًا. استيراده أيضًا؟")) {
          S.settings = await Store.saveSettings({ webhookUrl: data.settings.webhookUrl });
        }
        changed(false); toast("تم الاستيراد — راجع البيانات ثم انشر"); panelBackup(p);
      } catch (err) { alert("فشل الاستيراد: " + err.message); }
      e.target.value = "";
    });
    p.querySelector("[data-a=reset]").addEventListener("click", () => {
      if (!confirm("إرجاع المسودة إلى البيانات الأولية؟")) return;
      S.content = Store.clone(window.SEED); changed(false); toast("تمت الإعادة — لم يُنشر شيء بعد");
    });
    p.querySelector("#cv").addEventListener("change", (e) => { const f = e.target.files[0]; if (f) CVImport.run(f, p.querySelector("#cv-out"), applyCv); e.target.value = ""; });

    const vs = await Store.listVersions().catch(() => []);
    const vEl = p.querySelector("#versions");
    if (!vEl) return;
    vEl.innerHTML = vs.length ? `<ul class="plain">${vs.map((v) => `<li><span>${esc(fmtDate(v))}</span> <button class="btn btn-small" data-v="${esc(v)}">استرجاع كمسودة</button></li>`).join("")}</ul>` : `<p class="muted">لا توجد نسخ سابقة بعد (تُنشأ عند النشر).</p>`;
    vEl.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-v]"); if (!b) return;
      const c = await Store.getVersion(b.dataset.v);
      if (!c) return alert("تعذّر تحميل النسخة");
      if (!confirm("استبدال المسودة الحالية بهذه النسخة؟")) return;
      S.content = c; changed(false); toast("تم الاسترجاع كمسودة — اضغط «نشر» لاعتمادها");
    });
  }

  function applyCv(result) {
    const c = S.content;
    const hidden = result.hidden;
    if (result.contact.email) c.contact.email.value = result.contact.email;
    if (result.contact.phone) c.contact.whatsapp.value = result.contact.phone;
    if (result.contact.linkedin) {
      const li = sec("linkedin");
      if (li && !li.items.some((x) => x.url === result.contact.linkedin))
        li.items.push({ id: uid("li"), visible: !hidden, featured: false, tags: [], kind: "personal", title: { ar: "LinkedIn", en: "LinkedIn" }, url: result.contact.linkedin });
    }
    const add = (sid, items) => { const s = sec(sid); if (s) items.forEach((x) => s.items.push({ id: uid(sid), visible: !hidden, featured: false, tags: [], ...x })); };
    add("experience", result.experience.map((x) => ({ title: { ar: x.title, en: "" }, org: { ar: "", en: "" }, location: { ar: "", en: "" }, start: x.start || "", end: x.end || "", current: !!x.current, achievements: { ar: x.details, en: "" }, tools: "" })));
    add("education", result.education.map((x) => ({ title: { ar: x, en: "" }, org: { ar: "", en: "" }, year: "" })));
    add("courses", result.courses.map((x) => ({ title: { ar: x, en: "" }, kind: "course" })));
    if (result.skills.length) add("skills", [{ title: { ar: "مهارات مستوردة من CV", en: "" }, list: { ar: result.skills.join("\n"), en: "" } }]);
    changed(false);
    toast("تمت إضافة البيانات المعتمدة إلى المسودة");
  }

  window.AdminView = { mount };
})();
