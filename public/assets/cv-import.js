// CV (PDF) import: extract text in the browser with pdf.js, suggest items, let the owner review before applying.
// Project Manager | Eng. Ahmed Zahran
(function () {
  const { esc } = AZ;

  async function extractLines(file) {
    if (!window.pdfjsLib) {
      await new Promise((res, rej) => { const sc = document.createElement("script"); sc.src = "vendor/pdf.min.js"; sc.onload = res; sc.onerror = () => rej(new Error("تعذّر تحميل مكتبة قراءة PDF")); document.head.appendChild(sc); });
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/pdf.worker.min.js";
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const out = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const tc = await page.getTextContent();
      const rows = new Map();
      for (const it of tc.items) {
        if (!it.str || !it.str.trim()) continue;
        const y = Math.round(it.transform[5] / 3) * 3;
        if (!rows.has(y)) rows.set(y, []);
        rows.get(y).push({ x: it.transform[4], s: it.str });
      }
      [...rows.entries()].sort((a, b) => b[0] - a[0]).forEach(([, parts]) => {
        const rtl = parts.some((x) => /[؀-ۿ]/.test(x.s));
        parts.sort((a, b) => (rtl ? b.x - a.x : a.x - b.x));
        const line = parts.map((x) => x.s).join(" ").replace(/\s+/g, " ").trim();
        if (line) out.push(line);
      });
    }
    return out;
  }

  const HEAD = {
    experience: /^(work\s+)?experience|employment|work history|professional experience|الخبرات?|الخبرة العملية|الخبرات العملية/i,
    education: /^education|qualifications?|academic|المؤهل|التعليم|المؤهلات/i,
    courses: /^courses?|training|certifications?|certificates|الدورات|الدورات التدريبية|التدريب|الشهادات/i,
    skills: /^skills|competenc|المهارات|الكفاءات/i,
    other: /^(summary|profile|objective|languages|references|personal|contact|projects|نبذة|الملخص|اللغات|المراجع|البيانات الشخصية|التواصل|المشاريع)/i,
  };
  const YEAR_RANGE = /((?:19|20)\d{2})(?:\s*[-–—]\s*((?:19|20)\d{2}|present|current|now|حتى الآن|الآن|حاليًا|حاليا))?/i;

  function parse(lines) {
    const text = lines.join("\n");
    const email = (text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [])[0] || "";
    const phone = ((text.match(/(?:\+?966|0)5\d[\d\s-]{6,}\d/) || [])[0] || "").replace(/[\s-]/g, "");
    const linkedin = (text.match(/(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[\w%-]+/i) || [])[0] || "";
    const buckets = { experience: [], education: [], courses: [], skills: [] };
    let cur = null;
    for (const raw of lines) {
      const line = raw.replace(/^[•●▪\-*·]\s*/, "").trim();
      if (line.length < 2) continue;
      const short = line.length < 40;
      let head = null;
      if (short) for (const [k, re] of Object.entries(HEAD)) if (re.test(line)) { head = k; break; }
      if (head) { cur = head === "other" ? null : head; continue; }
      if (cur) buckets[cur].push(line);
    }
    // group experience: a line with a year starts a new entry
    const experience = [];
    for (const l of buckets.experience) {
      const m = l.match(YEAR_RANGE);
      if (m || !experience.length) {
        const end = m && m[2] && /\d/.test(m[2]) ? m[2] : "";
        experience.push({ title: l, start: m ? m[1] : "", end, current: !!(m && m[2] && !/\d/.test(m[2])), details: [] });
      } else experience[experience.length - 1].details.push(l);
    }
    const skills = buckets.skills.flatMap((l) => l.split(/[,،|•]/)).map((x) => x.trim()).filter((x) => x.length > 1 && x.length < 60);
    return {
      raw: text,
      contact: { email, phone, linkedin: linkedin && !/^https?:/.test(linkedin) ? "https://" + linkedin : linkedin },
      experience: experience.map((e) => ({ ...e, details: e.details.join("\n") })),
      education: buckets.education,
      courses: buckets.courses,
      skills: [...new Set(skills)],
    };
  }

  async function run(file, out, apply) {
    out.innerHTML = `<p class="alert info">جارٍ قراءة الملف…</p>`;
    let r;
    try { r = parse(await extractLines(file)); }
    catch (e) { out.innerHTML = `<p class="alert err">تعذّر قراءة الملف: ${esc(e.message)}</p>`; return; }
    if (!r.raw.trim()) { out.innerHTML = `<p class="alert warn">لم يُعثر على نص قابل للاستخراج (قد يكون الملف صورة ممسوحة ضوئيًا).</p>`; return; }

    const chk = (name, i, label, extra = "") => `<label class="check cv-row"><input type="checkbox" name="${name}" value="${i}" checked><span>${label}</span>${extra}</label>`;
    out.innerHTML = `<form class="form cv-review" id="cv-form">
      <h4>مراجعة البيانات المستخرجة</h4>
      <p class="muted small">ألغِ تحديد ما لا تريده، وعدّل النصوص قبل الاعتماد. التعرّف آلي وتقريبي.</p>
      <fieldset><legend>بيانات التواصل</legend>
        ${r.contact.email ? chk("c_email", 0, `البريد: <input name="v_email" value="${esc(r.contact.email)}" dir="ltr">`) : ""}
        ${r.contact.phone ? chk("c_phone", 0, `الجوال: <input name="v_phone" value="${esc(r.contact.phone)}" dir="ltr">`) : ""}
        ${r.contact.linkedin ? chk("c_li", 0, `LinkedIn: <input name="v_li" value="${esc(r.contact.linkedin)}" dir="ltr">`) : ""}
        ${!r.contact.email && !r.contact.phone && !r.contact.linkedin ? '<p class="muted">لم يُعثر على بيانات تواصل.</p>' : ""}
      </fieldset>
      <fieldset><legend>خبرات مقترحة (${r.experience.length})</legend>
        ${r.experience.map((e, i) => `<div class="cv-item">${chk("exp", i, `<input name="exp_t_${i}" value="${esc(e.title)}">`)}
          <div class="grid-3"><input name="exp_s_${i}" value="${esc(e.start)}" placeholder="البداية" dir="ltr"><input name="exp_e_${i}" value="${esc(e.end)}" placeholder="النهاية" dir="ltr">
          <label class="check"><input type="checkbox" name="exp_c_${i}" ${e.current ? "checked" : ""}><span>حتى الآن</span></label></div>
          <textarea name="exp_d_${i}" rows="3">${esc(e.details)}</textarea></div>`).join("") || '<p class="muted">لا شيء.</p>'}
      </fieldset>
      <fieldset><legend>مؤهلات مقترحة (${r.education.length})</legend>
        ${r.education.map((x, i) => chk("edu", i, `<input name="edu_${i}" value="${esc(x)}">`)).join("") || '<p class="muted">لا شيء.</p>'}</fieldset>
      <fieldset><legend>دورات مقترحة (${r.courses.length}) — تُضاف كـ«دورة تدريبية» وليست شهادة معتمدة</legend>
        ${r.courses.map((x, i) => chk("crs", i, `<input name="crs_${i}" value="${esc(x)}">`)).join("") || '<p class="muted">لا شيء.</p>'}</fieldset>
      <fieldset><legend>مهارات مقترحة (${r.skills.length})</legend>
        ${r.skills.map((x, i) => chk("skl", i, `<input name="skl_${i}" value="${esc(x)}">`)).join("") || '<p class="muted">لا شيء.</p>'}</fieldset>
      <details><summary>النص الكامل المستخرج</summary><textarea readonly rows="10">${esc(r.raw)}</textarea></details>
      <label class="switch inline"><input type="checkbox" name="hidden" checked><span>إضافة العناصر مخفية حتى أراجعها وأفعّلها</span></label>
      <div class="actions"><button class="btn btn-primary" type="submit">اعتماد المحدد وإضافته للمسودة</button><button class="btn" type="button" data-a="cancel">إلغاء</button></div>
    </form>`;
    const f = out.querySelector("#cv-form");
    f.querySelector("[data-a=cancel]").addEventListener("click", () => (out.innerHTML = ""));
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const sel = (n) => [...f.querySelectorAll(`[name=${n}]:checked`)].map((x) => +x.value);
      const res = {
        hidden: f.hidden.checked,
        contact: {
          email: f.c_email?.checked ? f.v_email.value.trim() : "",
          phone: f.c_phone?.checked ? f.v_phone.value.trim() : "",
          linkedin: f.c_li?.checked ? f.v_li.value.trim() : "",
        },
        experience: sel("exp").map((i) => ({ title: f[`exp_t_${i}`].value.trim(), start: f[`exp_s_${i}`].value.trim(), end: f[`exp_e_${i}`].value.trim(), current: f[`exp_c_${i}`].checked, details: f[`exp_d_${i}`].value.trim() })).filter((x) => x.title),
        education: sel("edu").map((i) => f[`edu_${i}`].value.trim()).filter(Boolean),
        courses: sel("crs").map((i) => f[`crs_${i}`].value.trim()).filter(Boolean),
        skills: sel("skl").map((i) => f[`skl_${i}`].value.trim()).filter(Boolean),
      };
      apply(res);
      out.innerHTML = `<p class="alert ok">تمت إضافة البيانات المعتمدة إلى المسودة. راجعها في تبويب «الأقسام والمحتوى» ثم انشر.</p>`;
    });
  }

  window.CVImport = { run, parse };
})();
