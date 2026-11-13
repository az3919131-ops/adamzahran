// Core helpers, i18n dictionary and section schemas.
// Project Manager | Eng. Ahmed Zahran
(function () {
  const STR = {
    ar: {
      appName: "اللوحة المهنية — م. أحمد زهران",
      nav_home: "الرئيسية", nav_contact: "تواصل", admin: "لوحة الإدارة", publicView: "الصفحة العامة",
      langToggle: "English", share: "مشاركة", print: "طباعة / PDF", copied: "تم النسخ", copyLink: "نسخ رابط القسم",
      cv: "السيرة الذاتية", navCv: "السيرة الذاتية", navHome: "الرئيسية", navPlatforms: "المنصات", navServices: "خدماتي", navAbout: "عني", startProject: "ابدأ مشروعك",
      explore: "استكشف المنصات", discuss: "ناقش مشروعك معي", howItWorks: "شاهد كيف تعمل", copyUrl: "نسخ الرابط", linkCopied: "تم نسخ رابط المنصة",
      shared: "تمت المشاركة", forWho: "لمن هذه المنصة؟", theProblem: "المشكلة التي تعالجها", canDo: "ماذا تستطيع إنجازه؟", howSteps: "ثلاث خطوات للاستخدام",
      demo: "عرض توضيحي", demoNote: "مشهد مبسّط يشرح رحلة الاستخدام، وليس تسجيلًا من المنصة.", play: "تشغيل", pause: "إيقاف مؤقت", replay: "إعادة", step: "الخطوة",
      enter: "الدخول إلى المنصة", newTab: "يفتح في تبويب جديد", close: "إغلاق", shotOf: "لقطة من واجهة", myRole: "ملاحظة",
      platformsSub: "خمس منصات تعمل الآن. لكل واحدة جمهورها والمشكلة التي بُنيت لحلها. اضغط «شاهد كيف تعمل» لترى رحلة الاستخدام قبل الدخول.",
      servicesSub: "هذه خدمات أنفذها عند الطلب، وهي غير المنصات المعروضة أعلاه.", servicesCta: "لنحوّل فكرتك إلى موقع", includes: "يشمل",
      aboutTitle: "عني", fullCv: "السيرة الذاتية الكاملة", cvSite: "موقع السيرة الذاتية",
      processTitle: "كيف أعمل معك", processSub: "خمس خطوات بالترتيب، وتراجع معي نتيجة كل خطوة قبل الانتقال لما بعدها.",
      p1: "فهم الاحتياج", p1d: "نتحدث عن هدف الموقع وجمهوره وما تريد أن يفعله الزائر.",
      p2: "تنظيم المحتوى", p2d: "أرتّب النصوص والصفحات والروابط قبل أي تصميم.",
      p3: "تصميم التجربة", p3d: "أرسم مسار الزائر وشكل الصفحات على الجوال والكمبيوتر.",
      p4: "التنفيذ والمراجعة", p4d: "أبني الموقع وتراجعه معي حتى يطابق المطلوب.",
      p5: "الإطلاق والمتابعة", p5d: "أنشر الموقع وأبقى متاحًا للتعديل والأسئلة.",
      footLinks: "روابط مهنية", askAbout: "استفسار بخصوص", backHome: "العودة للصفحة الرئيسية", cvPageSub: "الخبرات والمشاريع والمهارات والمؤهل والدورات", browseSites: "تصفح مواقع ومنصات التزام", waShort: "راسلني واتساب", mailShort: "راسلني بالبريد", whatsapp: "تواصل عبر واتساب", emailMe: "راسلني بالبريد", copyEmail: "نسخ البريد",
      stat_years: "سنوات الخبرة", stat_projects: "المشاريع", stat_courses: "الدورات", stat_platforms: "المنصات",
      stat_note: "تُحسب تلقائيًا من البيانات المدخلة",
      search: "بحث في المحتوى…", f_section: "كل الأقسام", f_year: "كل السنوات", f_status: "كل الحالات", f_tag: "كل الوسوم",
      clearFilters: "مسح الفلاتر", noResults: "لا توجد نتائج مطابقة.",
      present: "حتى الآن", featured: "رئيسي", openPlatform: "فتح الموقع", visitChannel: "زيارة القناة", watch: "مشاهدة",
      openPage: "فتح الصفحة", openLink: "فتح الرابط", viewFile: "عرض الملف", achievements: "الإنجازات", tools: "الأدوات",
      role: "الدور", results: "النتائج", launched: "تاريخ الإطلاق", subscribers: "المشتركون", views: "المشاهدات",
      course: "دورة تدريبية", certificate: "شهادة معتمدة", planNote: "عناصر قيد التطوير — ليست خبرات أو شهادات مكتملة ما لم تُذكر حالتها كذلك.",
      contactTitle: "تواصل معي", f_name: "الاسم", f_contact: "رقم الجوال أو البريد", f_subject: "الموضوع", f_message: "الرسالة",
      send: "إرسال", sending: "جارٍ الإرسال…", sentOk: "تم استلام رسالتك، شكرًا لتواصلك.",
      sentFail: "تعذّر إرسال الرسالة حاليًا. يمكنك التواصل مباشرة عبر واتساب أو البريد:",
      required: "يرجى تعبئة الاسم ووسيلة التواصل والرسالة.",
      preview: "وضع المعاينة — هذه المسودة لم تُنشر بعد", backToAdmin: "العودة للوحة الإدارة",
      footer: "Project Manager | Eng. Ahmed Zahran",
      skip: "تخطَّ إلى المحتوى", menu: "القائمة",
      scene_generic: "عام", scene_learn: "تعلّم (كتاب ومسار)", scene_grid: "شبكة كهرباء ولوحة متابعة", scene_estate: "عقارات", scene_prompt: "فكرة إلى برومبت", scene_gate: "بوابة وزائر", status_none: "بدون حالة", status_live: "يعمل", status_beta: "تجريبي", status_stopped: "متوقف",
      status_planned: "مخطط", status_studying: "قيد الدراسة", status_completed: "مكتمل", status_certified: "شهادة معتمدة", status_applied: "خبرة تطبيقية",
      kind_channel: "قناة", kind_video: "فيديو", kind_personal: "حساب شخصي", kind_company: "صفحة شركة", kind_project: "صفحة مشروع",
      kind_course: "دورة تدريبية", kind_certificate: "شهادة معتمدة",
      card_link: "رابط", card_text: "نص", card_image: "صورة", card_file: "ملف",
    },
    en: {
      appName: "Professional Dashboard — Eng. Ahmed Zahran",
      nav_home: "Home", nav_contact: "Contact", admin: "Admin", publicView: "Public page",
      langToggle: "العربية", share: "Share", print: "Print / PDF", copied: "Copied", copyLink: "Copy section link",
      cv: "View my CV", navCv: "CV", navHome: "Home", navPlatforms: "Platforms", navServices: "Services", navAbout: "About", startProject: "Start your project",
      explore: "Explore the platforms", discuss: "Discuss your project with me", howItWorks: "See how it works", copyUrl: "Copy link", linkCopied: "Platform link copied",
      shared: "Shared", forWho: "Who is this platform for?", theProblem: "The problem it addresses", canDo: "What can you get done?", howSteps: "Three steps to use it",
      demo: "Illustrative demo", demoNote: "A simplified scene explaining the user journey, not a recording of the platform.", play: "Play", pause: "Pause", replay: "Replay", step: "Step",
      enter: "Enter the platform", newTab: "Opens in a new tab", close: "Close", shotOf: "Screenshot of", myRole: "Note",
      platformsSub: "Five platforms are live now. Each has its audience and the problem it was built to solve. Press \"See how it works\" to view the user journey before you enter.",
      servicesSub: "These are services I deliver on request. They are separate from the platforms shown above.", servicesCta: "Let's turn your idea into a website", includes: "Includes",
      aboutTitle: "About me", fullCv: "Full CV", cvSite: "CV website",
      processTitle: "How I work with you", processSub: "Five steps in order. You review the result of each step with me before we move on.",
      p1: "Understand the need", p1d: "We talk about the site's goal, its audience and what the visitor should do.",
      p2: "Organize the content", p2d: "I arrange the texts, pages and links before any design.",
      p3: "Design the experience", p3d: "I map the visitor's path and the page layouts on mobile and desktop.",
      p4: "Build and review", p4d: "I build the site and you review it with me until it matches the brief.",
      p5: "Launch and follow up", p5d: "I publish the site and stay available for edits and questions.",
      footLinks: "Professional links", askAbout: "Inquiry about", backHome: "Back to home page", cvPageSub: "Experience, projects, skills, education and courses", browseSites: "Browse Iltizam sites and platforms", waShort: "WhatsApp me", mailShort: "Email me", whatsapp: "Chat on WhatsApp", emailMe: "Email me", copyEmail: "Copy email",
      stat_years: "Years of experience", stat_projects: "Projects", stat_courses: "Courses", stat_platforms: "Platforms",
      stat_note: "Calculated automatically from the entered data",
      search: "Search content…", f_section: "All sections", f_year: "All years", f_status: "All statuses", f_tag: "All tags",
      clearFilters: "Clear filters", noResults: "No matching results.",
      present: "Present", featured: "Featured", openPlatform: "Open website", visitChannel: "Visit channel", watch: "Watch",
      openPage: "Open page", openLink: "Open link", viewFile: "View file", achievements: "Achievements", tools: "Tools",
      role: "Role", results: "Results", launched: "Launched", subscribers: "Subscribers", views: "Views",
      course: "Training course", certificate: "Accredited certificate", planNote: "Items in development — not completed experience or certificates unless their status says so.",
      contactTitle: "Get in touch", f_name: "Name", f_contact: "Mobile or email", f_subject: "Subject", f_message: "Message",
      send: "Send", sending: "Sending…", sentOk: "Your message was received. Thank you!",
      sentFail: "The message could not be sent right now. You can reach me directly via WhatsApp or email:",
      required: "Please fill in name, contact and message.",
      preview: "Preview mode — this draft is not published yet", backToAdmin: "Back to admin",
      footer: "Project Manager | Eng. Ahmed Zahran",
      skip: "Skip to content", menu: "Menu",
      status_none: "No status", status_live: "Live", status_beta: "Beta", status_stopped: "Stopped",
      status_planned: "Planned", status_studying: "Under study", status_completed: "Completed", status_certified: "Accredited certificate", status_applied: "Hands-on experience",
      kind_channel: "Channel", kind_video: "Video", kind_personal: "Personal profile", kind_company: "Company page", kind_project: "Project page",
      kind_course: "Training course", kind_certificate: "Accredited certificate",
      card_link: "Link", card_text: "Text", card_image: "Image", card_file: "File",
    },
  };

  const state = { lang: "ar" };
  try { state.lang = localStorage.getItem("az_lang") || "ar"; } catch {}

  const t = (k) => (STR[state.lang] && STR[state.lang][k]) || STR.ar[k] || k;
  // Localized value: {ar, en} → string in current language (falls back to Arabic).
  const loc = (v) => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    return (state.lang === "en" ? v.en || v.ar : v.ar || v.en) || "";
  };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => {
    u = String(u || "").trim();
    if (!u) return "";
    if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
    if (/^data:(image\/(png|jpeg|webp|gif)|application\/pdf);base64,/i.test(u)) return u;
    if (/^\/api\/file\//.test(u)) return u;
    if (/^assets\/[\w./-]+$/.test(u) && !u.includes("..")) return u;
    if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u)) return "https://" + u;
    return "";
  };
  const uid = (p = "it") => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const lines = (v) => loc(v).split("\n").map((x) => x.trim()).filter(Boolean);
  const csv = (s) => String(s || "").split(/[,،\n]/).map((x) => x.trim()).filter(Boolean);
  const yearOf = (s) => { const m = String(s || "").match(/(\d{4})/); return m ? +m[1] : null; };
  const waLink = (contact, msg) => {
    const raw = String(contact?.whatsapp?.value || "").replace(/\D/g, "");
    if (!raw) return "";
    const cc = String(contact?.whatsapp?.country || "966").replace(/\D/g, "");
    const intl = raw.startsWith(cc) ? raw : cc + raw.replace(/^0+/, "");
    return `https://wa.me/${intl}` + (msg ? `?text=${encodeURIComponent(msg)}` : "");
  };

  // ---------- schemas ----------
  // kinds: ltext, ltextarea, llines, text, url, year, bool, select, image, file
  const F = {
    title: { key: "title", kind: "ltext", label: "العنوان / الاسم", required: true },
    description: { key: "description", kind: "ltextarea", label: "الوصف" },
    url: { key: "url", kind: "url", label: "الرابط" },
    link: { key: "link", kind: "url", label: "رابط إضافي (اختياري)" },
    image: { key: "image", kind: "image", label: "صورة أو أيقونة" },
    attachment: { key: "attachment", kind: "file", label: "ملف إثبات / مرفق" },
    start: { key: "start", kind: "year", label: "تاريخ البداية (سنة أو سنة-شهر)" },
    end: { key: "end", kind: "year", label: "تاريخ النهاية" },
    tools: { key: "tools", kind: "text", label: "الأدوات (مفصولة بفواصل)" },
  };
  const statusPlatform = { key: "status", kind: "select", label: "الحالة", options: ["live", "beta", "stopped", "none"], prefix: "status_" };

  const SCHEMAS = {
    experience: { label: "خبرة", fields: [
      { ...F.title, label: "المسمى الوظيفي" }, { key: "org", kind: "ltext", label: "الجهة" }, { key: "location", kind: "ltext", label: "الموقع" },
      F.start, F.end, { key: "current", kind: "bool", label: "حتى الآن" },
      { key: "achievements", kind: "llines", label: "الإنجازات (نقطة في كل سطر)" }, F.tools, F.attachment, F.link] },
    projects: { label: "مشروع", fields: [
      { ...F.title, label: "اسم المشروع" }, F.description, { key: "role", kind: "ltext", label: "الدور" }, F.start, F.end,
      F.tools, { key: "results", kind: "llines", label: "النتائج (نقطة في كل سطر)" }, F.image, F.attachment, F.link] },
    skills: { label: "مجموعة مهارات", fields: [
      { ...F.title, label: "اسم المجموعة" }, { key: "list", kind: "llines", label: "المهارات (مهارة في كل سطر)" }] },
    services: { label: "خدمة", fields: [
      { ...F.title, label: "اسم الخدمة" }, F.description, { key: "list", kind: "llines", label: "يشمل (نقطة في كل سطر)" }] },
    education: { label: "مؤهل", fields: [
      { ...F.title, label: "المؤهل" }, { key: "org", kind: "ltext", label: "الجامعة / الجهة" }, { key: "year", kind: "year", label: "سنة التخرج" }, F.attachment] },
    courses: { label: "دورة / شهادة", fields: [
      { ...F.title, label: "اسم الدورة" }, { key: "provider", kind: "ltext", label: "الجهة المقدمة (اختياري)" }, { key: "year", kind: "year", label: "السنة (اختياري)" },
      { key: "kind", kind: "select", label: "النوع", options: ["course", "certificate"], prefix: "kind_", help: "لا تختر «شهادة معتمدة» إلا إذا كانت شهادة فعلية موثقة." },
      F.attachment, F.link] },
    platforms: { label: "موقع / مربع", fields: [
      { ...F.title, label: "اسم الموقع / عنوان المربع" }, F.description, F.url, { key: "buttonLabel", kind: "ltext", label: "نص زر الرابط (اختياري)" },
      { key: "cta", kind: "bool", label: "مربع عرض/مراسلة: إظهار أزرار واتساب والبريد (لا يُحسب ضمن عدد المواقع)" },
      { key: "pitch", kind: "ltext", label: "جملة تعريفية قصيرة" },
      { key: "audience", kind: "ltext", label: "الجمهور المستفيد" }, { key: "problem", kind: "ltext", label: "المشكلة التي تعالجها" },
      { key: "benefits", kind: "llines", label: "الفوائد (ثلاث، واحدة في كل سطر)" }, { key: "steps", kind: "llines", label: "خطوات الاستخدام (ثلاث، واحدة في كل سطر)" },
      { key: "goalLabel", kind: "ltext", label: "عبارة الدعوة (مثل: استكشف مسارات التعلم)" },
      { key: "goalUrl", kind: "text", label: "رابط الدعوة (اختياري — اكتب wa لفتح واتساب)" },
      { key: "joinLabel", kind: "ltext", label: "نص رابط التسجيل (اختياري)" }, { key: "joinUrl", kind: "url", label: "رابط التسجيل الفعلي (اختياري)" },
      { key: "note", kind: "ltext", label: "ملاحظة تظهر مع المنصة (اختياري)" },
      { key: "scene", kind: "select", label: "المجسم والعرض التوضيحي", options: ["generic", "learn", "grid", "estate", "prompt", "gate"], prefix: "scene_" },
      { key: "category", kind: "ltext", label: "التصنيف" },
      statusPlatform, { ...F.image, label: "لقطة من واجهة المنصة" }, { key: "launchDate", kind: "year", label: "تاريخ الإطلاق (اختياري)" },
      { key: "embed", kind: "bool", label: "محاولة عرض معاينة مضمنة (تظهر فقط إذا سمح الموقع بذلك)" }] },
    insurance: { label: "موقع", fields: [
      { ...F.title, label: "اسم الموقع" }, F.description, { ...F.url, required: true }, { key: "category", kind: "ltext", label: "التصنيف" }, statusPlatform, F.image] },
    youtube: { label: "قناة / فيديو", fields: [
      F.title, { key: "kind", kind: "select", label: "النوع", options: ["channel", "video"], prefix: "kind_" }, { ...F.url, required: true }, F.description,
      { key: "subscribers", kind: "text", label: "عدد المشتركين (اختياري — يُعرض فقط إذا أدخلته)" },
      { key: "views", kind: "text", label: "عدد المشاهدات (اختياري — يُعرض فقط إذا أدخلته)" }] },
    linkedin: { label: "صفحة LinkedIn", fields: [
      { ...F.title, label: "اسم الصفحة" }, { key: "kind", kind: "select", label: "النوع", options: ["personal", "company", "project"], prefix: "kind_" },
      { ...F.url, required: true }, { ...F.description, label: "وصف قصير" }] },
    pages: { label: "صفحة / رابط", fields: [F.title, F.description, { ...F.url, required: true }, F.image] },
    future: { label: "إضافة مستقبلية", fields: [
      F.title, F.description, { key: "status", kind: "select", label: "الحالة", options: ["planned", "studying", "completed", "certified", "applied"], prefix: "status_" },
      { key: "category", kind: "ltext", label: "التصنيف" }, F.attachment, F.link] },
    custom: {
      label: "عنصر",
      byCard: {
        link: [F.title, F.description, { ...F.url, required: true }],
        text: [F.title, { key: "body", kind: "ltextarea", label: "النص" }],
        image: [F.title, { ...F.image, required: true }, F.description],
        file: [F.title, { key: "file", kind: "file", label: "الملف", required: true }, F.description],
      },
    },
  };
  const fieldsFor = (section) =>
    section.type === "custom" ? SCHEMAS.custom.byCard[section.cardType || "link"] : (SCHEMAS[section.type] || SCHEMAS.pages).fields;

  window.AZ = { STR, state, t, loc, esc, safeUrl, uid, lines, csv, yearOf, waLink, SCHEMAS, fieldsFor };
})();
