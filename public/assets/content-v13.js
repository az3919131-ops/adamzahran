// Content version 13: a rewritten professional bio (home "about" and the CV "about"), and the CV button
// now opens this site's own CV page instead of the older external CV site.
// Only replaces texts that are still the earlier defaults, so edits made in the admin panel are kept.
// Project Manager | Eng. Ahmed Zahran
(function () {
  const L = (ar, en = "") => ({ ar, en });

  const BIO = L(
    "أنا المهندس أحمد زهران، مدير مشاريع في الكهرباء والبنية التحتية بخبرة تزيد على 15 عامًا. أعمل في نجران مديرًا لمشاريع العقد الموحد لدى مقاول لأعمال الشركة السعودية للكهرباء، على شبكات الجهد المتوسط والمنخفض (33 و13.8 ك.ف). وبدأت مسيرتي مهندسًا لاختبار الكابلات وتحديد الأعطال في شركة الكهرباء بمصر.\n\n" +
    "أتولى التخطيط والمتابعة من فتح أمر العمل حتى إغلاقه وتسليم مستخلصه. أنسق بين فرق التنفيذ والمقاولين والاستشاريين، وأتابع الجدول الزمني والتكلفة والمخاطر، وأطبق متطلبات الجودة والسلامة في كل مرحلة.\n\n" +
    "وأصمم إلى جانب ذلك مواقع ومنصات رقمية تخدم العمل نفسه، منها منصة للتدريب ومنصة للتسويق العقاري وبوابة أمنية للشركات. أبنيها لأن الفريق الذي يجد بياناته منظمة يتخذ قراره أسرع.",
    "I am Eng. Ahmed Zahran, a project manager in electrical power and infrastructure with more than 15 years of experience. In Najran I manage unified-contract projects for a contractor working for Saudi Electricity Company, on medium and low voltage networks (33 and 13.8 kV). I started my career as a cable testing and fault location engineer at the electricity company in Egypt.\n\n" +
    "I handle planning and follow-up from the moment a work order opens until it is closed and its claim is submitted. I coordinate delivery teams, contractors and consultants, track schedule, cost and risk, and apply quality and safety requirements at every stage.\n\n" +
    "I also design websites and digital platforms built around the same work, including a training platform, a real estate marketing platform and a security gateway for companies. I build them because a team that finds its data organized makes decisions faster."
  );

  // Earlier defaults (start of each text) that may be replaced safely.
  const OLD = ["أنا المهندس أحمد زهران، مصمم مواقع ومنصات رقمية ومدير تنفيذ", "أنا المهندس أحمد زهران، مدير مشاريع متخصص في إدارة التنفيذ"];
  const OLD_CV_URL = /^https?:\/\/ahmedzahran12\.netlify\.app\/?$/;
  const isOld = (v) => !v || !String(v.ar || "").trim() || OLD.some((o) => String(v.ar || "").startsWith(o));

  function apply(c) {
    const pr = c.profile || (c.profile = {});
    if (isOld(pr.about)) pr.about = { ...BIO };
    if (isOld(pr.cvAbout)) pr.cvAbout = { ...BIO };
    if (OLD_CV_URL.test(String(pr.cvUrl || "").trim())) pr.cvUrl = "";
    c.version = 13;
    return c;
  }

  // v14: the hero number strip reads as phrases (display text + label), editable in the admin panel.
  const STATS = {
    years: { text: L("+15", "15+"), label: L("سنة خبرة في مصر والمملكة", "Years of experience in Egypt and Saudi Arabia") },
    projects: { text: L("عشرات", "Dozens"), label: L("المشاريع في المملكة ومصر", "Projects in Saudi Arabia and Egypt") },
    platforms: { label: L("تصاميم ومواقع تخدم المقاول وفريق عمل المشروع", "Designs and websites that serve the contractor and the project team") },
  };
  function stats14(c) {
    const st = c.stats || (c.stats = {});
    for (const [k, v] of Object.entries(STATS)) {
      const o = st[k] || (st[k] = { show: true, value: "" });
      if (v.text && !(o.text && (o.text.ar || o.text.en))) o.text = { ...v.text };
      if (!(o.label && (o.label.ar || o.label.en))) o.label = { ...v.label };
    }
    c.version = 14;
    return c;
  }

  window.V13 = { apply, stats14, BIO };
})();
