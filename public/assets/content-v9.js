// Showcase content (version 9): hero message, verified platform descriptions, services.
// Applied to the seed and, once, to already-saved content. Everything stays editable in the admin panel.
// Project Manager | Eng. Ahmed Zahran
(function () {
  const L = (ar, en = "") => ({ ar, en });

  const PROFILE = {
    title: L("مصمم مواقع ومنصات رقمية | مدير تنفيذ وتخطيط مشاريع | مهندس قوى كهربائية",
      "Website & platform designer | Project execution & planning manager | Electrical power engineer"),
    headline: L("أحوّل الأفكار إلى منصات… والخطط إلى واقع.", "I turn ideas into platforms, and plans into reality."),
    bio: L("أجمع بين خبرة إدارة وتنفيذ المشاريع وتصميم الحلول الرقمية، لأقدّم مواقع ومنصات تساعد على تنظيم العمل، وتقديم المعرفة، وعرض الخدمات بوضوح.",
      "I combine project management and delivery experience with digital solution design to build websites and platforms that help organize work, share knowledge and present services clearly."),
    about: L(
      "أنا المهندس أحمد زهران، مصمم مواقع ومنصات رقمية ومدير تنفيذ وتخطيط مشاريع، بخلفية هندسية في القوى الكهربائية وإدارة أعمال البنية التحتية. أجمع بين فهم متطلبات العمل الميداني والتخطيط والمتابعة، وبين تصميم تجارب رقمية واضحة تخدم احتياجات المستخدمين.\n\nأعمل على تحويل الأفكار والإجراءات إلى مواقع وأدوات عملية تساعد على تنظيم المعلومات، وتسهيل المتابعة، وتقديم الخدمات والمحتوى بصورة احترافية. أؤمن أن قيمة التصميم تظهر حين يجمع بين جمال العرض، وسهولة الاستخدام، وخدمة هدف واضح.",
      "I am Eng. Ahmed Zahran, a website and platform designer and a project execution and planning manager, with an engineering background in electrical power and infrastructure works. I bring together an understanding of field work, planning and follow-up with the design of clear digital experiences that serve what users need.\n\nI turn ideas and procedures into practical websites and tools that help organize information, make follow-up easier, and present services and content professionally. I believe design shows its value when it combines a good-looking presentation, ease of use and a clear purpose."
    ),
  };

  // Keyed by host. Descriptions are based on what each live platform shows (checked Nov 2026) and the owner's notes.
  const PLATFORMS = [
    {
      host: "iltizam-training.netlify.app", scene: "learn", status: "live", image: "assets/shots/training.jpg",
      url: "https://iltizam-training.netlify.app/",
      title: L("التزام للتدريب", "Iltizam Training"),
      pitch: L("ابدأ بخطوة تعلم واضحة، واستكشف المحتوى والمسارات المناسبة لتطورك المهني.", "Start with one clear learning step, and explore the content and tracks that fit your professional growth."),
      description: L("منصة تجمع كورسات مجانية مرتبة من يوتيوب ودبلومات مدفوعة في مشاريع الكهرباء والعقد الموحد والمكتب الفني والذكاء الاصطناعي واللغات.",
        "A platform that gathers free courses curated from YouTube and paid diplomas in electricity projects, unified contracts, technical office work, AI and languages."),
      audience: L("مهندسو وفنيو مشاريع الكهرباء، والمتدربون والمدربون، ومتعلمو الذكاء الاصطناعي واللغات.", "Electricity project engineers and technicians, trainees and instructors, and learners of AI and languages."),
      problem: L("المحتوى التعليمي المجاني كثير ومبعثر، ويصعب على المتعلم أن يعرف من أين يبدأ وبأي ترتيب.", "Free learning content is plentiful but scattered, so it is hard to know where to start and in what order."),
      benefits: L("كورسات مجانية مرتبة في مسارات واضحة\nحسابات للمتدرب والمدرب والمدرّس والمقاول\nتصفح كزائر قبل إنشاء حساب", "Free courses arranged in clear tracks\nAccounts for trainees, instructors, teachers and contractors\nBrowse as a guest before creating an account"),
      steps: L("ادخل كزائر أو أنشئ حسابًا\nاختر المسار أو الكورس المناسب لك\nتابع الدروس بالترتيب", "Enter as a guest or create an account\nPick the track or course that suits you\nFollow the lessons in order"),
      goalLabel: L("استكشف مسارات التعلم", "Explore learning tracks"), goalUrl: "https://iltizam-training.netlify.app/#/home",
      joinLabel: L("أنشئ حساب متدرب", "Create a trainee account"), joinUrl: "https://iltizam-training.netlify.app/join/trainee",
      note: L("", ""), tags: ["edu", "comm"],
    },
    {
      host: "iltizam-najran.netlify.app", scene: "grid", status: "live", image: "assets/shots/iltizam.jpg",
      url: "https://iltizam-najran.netlify.app/",
      title: L("التزام لإدارة أوامر العمل ومشاريع الكهرباء", "Iltizam: work orders & electricity projects"),
      pitch: L("تابع أمر العمل من بدايته إلى الاستلام، واجمع الفريق على صورة أوضح للمشروع.", "Follow a work order from start to handover, and bring the team around a clearer picture of the project."),
      description: L("أربع منصات مترابطة بحساب واحد: سجل أوامر العمل، ومحفظة المقاولين، ومراحل الرخص، ومحاضر الاستلام.",
        "Four connected platforms under one account: the work-order register, the contractors' wallet, permit stages and handover minutes."),
      audience: L("إدارات المشاريع والمقاولون والاستشاريون في مشاريع الكهرباء.", "Project management teams, contractors and consultants in electricity projects."),
      problem: L("معلومات أمر العمل تتوزع بين ملفات ورسائل، فيصعب معرفة آخر موقف ومن المسؤول عنه.", "Work-order information is spread across files and messages, so the latest status and its owner are hard to find."),
      benefits: L("لوحة تعرض كل أمر عمل وموقفه، مع تقارير وتصدير إلى Excel\nتوثيق مراحل الرخص بالصور والفيديو من الجوال\nمحضر استلام يُعدّ من بيانات أمر العمل وجاهز للطباعة", "A board showing every work order and its status, with reports and Excel export\nPermit stages documented with photos and video from the phone\nHandover minutes built from the work-order data, ready to print"),
      steps: L("سجّل أمر العمل أو استورده من Excel\nوثّق مراحل الرخص وارفع ملفات المقاول\nراجع محضر الاستلام واعتمده واطبعه", "Register the work order or import it from Excel\nDocument the permit stages and upload the contractor's files\nReview, approve and print the handover minutes"),
      goalLabel: L("اطلب عرضًا تجريبيًا", "Request a demo"), goalUrl: "https://iltizam-najran.netlify.app/#contact",
      joinLabel: L("", ""), joinUrl: "",
      note: L("الدخول إلى المنصات الأربع لأصحاب الحسابات.", "The four platforms are for account holders."), tags: ["mgmt", "eng"],
    },
    {
      host: "nourmadinty.netlify.app", scene: "estate", status: "beta", image: "assets/shots/nour.jpg",
      url: "https://nourmadinty.netlify.app",
      title: L("نور فيو مدينتي", "Noor View Madinaty"),
      pitch: L("ابحث عن العقار المناسب في مدينتي، وقارن بين الخيارات قبل أن تستفسر.", "Search for the right property in Madinaty and compare options before you ask."),
      description: L("موقع عقاري متخصص في عقارات مدينتي بالقاهرة الجديدة: بحث وتصفية ومقارنة وحاسبة تقسيط واستفسار عبر واتساب.",
        "A real estate site focused on Madinaty, New Cairo: search, filters, comparison, an installment calculator and WhatsApp inquiries."),
      audience: L("الباحثون عن شراء أو إيجار عقار في مدينتي.", "People looking to buy or rent a property in Madinaty."),
      problem: L("مقارنة الوحدات بين المجموعات والأسعار تأخذ وقتًا حين تكون المعلومات موزعة.", "Comparing units across groups and prices takes time when the information is scattered."),
      benefits: L("بحث بالكلمة أو رقم الوحدة، وتصفية بالنوع وعدد الغرف والسعر\nمفضلة ومقارنة بين الوحدات\nحاسبة تقسيط وحاسبة عائد، واستفسار مباشر عبر واتساب", "Search by keyword or unit number; filter by type, bedrooms and price\nFavorites and side-by-side comparison\nInstallment and return calculators, and direct WhatsApp inquiry"),
      steps: L("حدّد نوع الوحدة وعدد الغرف وحدود السعر\nقارن الوحدات وأضف ما يعجبك إلى المفضلة\nأرسل استفسارك عبر واتساب", "Choose the unit type, bedrooms and price limit\nCompare units and add the ones you like to favorites\nSend your inquiry on WhatsApp"),
      goalLabel: L("استكشف العقارات", "Explore properties"), goalUrl: "",
      joinLabel: L("", ""), joinUrl: "",
      note: L("نموذج أولي. دوري هنا تصميم الموقع وتنفيذه فقط؛ النشاط العقاري وبياناته يخصّان أصحابه.", "Prototype. My role here is designing and building the site only; the real estate business and its data belong to its owners."), tags: ["prog"],
    },
    {
      host: "mujassid-prompt-studio.netlify.app", scene: "prompt", status: "live", image: "assets/shots/mujassid.jpg",
      url: "https://mujassid-prompt-studio.netlify.app/",
      title: L("مجسّد", "Mujassid"),
      pitch: L("اكتب فكرتك، واحصل على برومبت مرتب ومعاينة تقريبية قبل أن تبدأ التنفيذ.", "Write your idea and get a structured prompt and a rough preview before you start building."),
      description: L("أداة تحوّل وصف فكرة موقع أو فيديو إلى برومبت مفصّل، وترسم معاينة تقريبية تختبر بها الفكرة قبل التنفيذ.",
        "A tool that turns a short description of a website or video idea into a detailed prompt, and draws a rough preview to test the idea before building."),
      audience: L("من يريد بناء موقع أو فيديو بأدوات الذكاء الاصطناعي ويحتاج وصفًا واضحًا لفكرته.", "Anyone building a website or video with AI tools who needs a clear description of the idea."),
      problem: L("الفكرة المكتوبة باختصار تعطي نتائج بعيدة عن المقصود، فتتكرر المحاولات.", "A briefly written idea gives results far from what was meant, so attempts get repeated."),
      benefits: L("برومبت منظم بالعربية أو الإنجليزية، بثلاثة مستويات من التفصيل\nخيارات للنوع واتجاه التصميم والألوان والجهاز\nقوالب جاهزة، وسجل يُحفظ في متصفحك", "A structured prompt in Arabic or English, at three levels of detail\nOptions for type, design direction, colors and device\nReady templates, and a history saved in your browser"),
      steps: L("اكتب وصف الفكرة واختر الخيارات\nراجع البرومبت والمعاينة التقريبية\nعدّل ثم انسخ البرومبت إلى أداة التنفيذ", "Write the idea and choose the options\nReview the prompt and the rough preview\nEdit, then copy the prompt into your building tool"),
      goalLabel: L("حوّل فكرتك إلى برومبت", "Turn your idea into a prompt"), goalUrl: "",
      joinLabel: L("", ""), joinUrl: "",
      note: L("المعاينة رسم تقريبي تنتجه الأداة نفسها، وليست ناتج نموذج توليد صور.", "The preview is a rough sketch drawn by the tool itself, not the output of an image-generation model."), tags: ["ai"],
    },
    {
      host: "securitynmwabran.netlify.app", scene: "gate", status: "live", image: "assets/shots/gate.jpg",
      url: "https://securitynmwabran.netlify.app/",
      title: L("بوابة الأمن", "Security Gate"),
      pitch: L("يُسجَّل الزائر عند البوابة، ويصل الإشعار إلى المسؤول.", "The visitor is registered at the gate, and the manager is notified."),
      description: L("بوابة لموظفي الأمن المعتمدين في المنشأة لتسجيل الزائرين وإبلاغ مدير المكان بوجودهم.",
        "A gate app for a facility's authorized security staff to register visitors and notify the site manager of their arrival."),
      audience: L("الشركات والمنشآت التي تستقبل زوارًا وتريد أن يعلم المسؤول بوصولهم.", "Companies and facilities that receive visitors and want the manager to know when they arrive."),
      problem: L("المسؤول لا يعلم بوصول الزائر إلا باتصال أو بعد انتظار عند البوابة.", "The manager only learns a visitor has arrived through a phone call or after a wait at the gate."),
      benefits: L("دخول للموظفين المعتمدين فقط\nتسجيل الزائر عند وصوله\nإبلاغ مدير المكان بوجود الزائر", "Sign-in for authorized staff only\nVisitor registered on arrival\nSite manager notified that a visitor is present"),
      steps: L("يسجّل موظف الأمن دخوله إلى البوابة\nيسجّل بيانات الزائر\nيصل الإشعار إلى مدير المكان", "The security officer signs in to the gate\nThe officer registers the visitor's details\nThe site manager receives the notification"),
      goalLabel: L("استفسر عن الخدمة", "Ask about this service"), goalUrl: "wa",
      joinLabel: L("", ""), joinUrl: "",
      note: L("الدخول للموظفين المعتمدين فقط.", "Sign-in is for authorized staff only."), tags: ["prog"],
    },
  ];

  const SERVICES = () => ({
    id: "services", type: "services", visible: true,
    title: L("خدمات تصميم وتنفيذ المواقع", "Website design & build services"),
    items: [
      ["svc-profile", "مواقع مهنية وشخصية", "Professional & personal websites",
        "موقع يعرّف بك وبأعمالك وخبرتك، بصفحة سيرة ذاتية ووسائل تواصل واضحة.", "A site that presents you, your work and your experience, with a CV page and clear contact options.",
        "صفحة رئيسية وصفحة سيرة ذاتية\nعربي وإنجليزي\nلوحة إدارة لتحديث المحتوى دون كود", "Home page and CV page\nArabic and English\nAdmin panel to update content without code"],
      ["svc-landing", "صفحات عرض الخدمات", "Service landing pages",
        "صفحة واحدة تشرح خدمتك أو منتجك، وتقود الزائر إلى طلب أو استفسار.", "A single page that explains your service or product and leads the visitor to a request or inquiry.",
        "رسالة واضحة ودعوة واحدة للزائر\nنموذج تواصل وزر واتساب\nمهيأة للمشاركة على الجوال", "One clear message and one call to action\nContact form and WhatsApp button\nReady to share on mobile"],
      ["svc-dashboard", "لوحات متابعة وتقارير", "Tracking dashboards & reports",
        "لوحة تجمع بيانات العمل في مكان واحد ليعرف الفريق آخر موقف.", "A dashboard that gathers work data in one place so the team knows the latest status.",
        "جداول وتصفية وبحث\nمؤشرات وتقارير\nتصدير البيانات", "Tables, filters and search\nIndicators and reports\nData export"],
      ["svc-platform", "منصات مخصصة", "Custom platforms",
        "منصة تُبنى على إجراءات عملك: حسابات وأدوار ومحتوى ونماذج.", "A platform built around your procedures: accounts, roles, content and forms.",
        "حسابات وصلاحيات لكل دور\nرفع ملفات وصور\nتعمل على الجوال", "Accounts and permissions per role\nFile and photo uploads\nWorks on mobile"],
    ].map(([id, ar, en, dar, den, lar, len]) => ({ id, visible: true, featured: false, tags: [], verified: true, title: L(ar, en), description: L(dar, den), list: L(lar, len) })),
  });

  const hostOf = (u) => { try { return new URL(u).host; } catch { return ""; } };

  function apply(c) {
    c.profile = { ...(c.profile || {}), ...JSON.parse(JSON.stringify(PROFILE)) };
    const secs = c.sections || (c.sections = []);
    const pl = secs.find((s) => s.id === "platforms");
    if (pl) {
      pl.title = L("منصات صممتها لتخدم احتياجات حقيقية", "Platforms I designed to serve real needs");
      pl.items = pl.items || [];
      const ordered = [];
      for (const p of PLATFORMS) {
        const { host, ...data } = p;
        const cur = pl.items.find((i) => hostOf(i.url) === host);
        const fresh = JSON.parse(JSON.stringify(data));
        if (cur) { Object.assign(cur, fresh, { embed: false }); ordered.push(cur); }
        else ordered.push({ id: "plt-" + host.split(".")[0], visible: true, featured: false, verified: true, embed: false, ...fresh });
      }
      pl.items = [...ordered, ...pl.items.filter((i) => !ordered.includes(i))];
    }
    if (!secs.some((s) => s.type === "services")) {
      const at = secs.findIndex((s) => s.id === "platforms");
      secs.splice(at < 0 ? 0 : at + 1, 0, SERVICES());
    }
    c.version = 9;
    return c;
  }

  window.V9 = { apply, PLATFORMS, SERVICES };
})();
