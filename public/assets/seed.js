// Initial (prototype) content — taken only from the owner's brief. Everything here is editable from the admin panel.
// Project Manager | Eng. Ahmed Zahran
(function () {
  const L = (ar, en = "") => ({ ar, en });
  let n = 0;
  const id = (p) => `${p}-seed-${++n}`;

  const TAGS = [
    { id: "eng", ...L("هندسي", "Engineering") },
    { id: "mgmt", ...L("إداري", "Management") },
    { id: "fin", ...L("مالي", "Financial") },
    { id: "prog", ...L("برمجي", "Software") },
    { id: "ai", ...L("ذكاء اصطناعي", "AI") },
    { id: "edu", ...L("تعليمي", "Educational") },
    { id: "comm", ...L("مجتمعي", "Community") },
  ];

  const base = (extra) => ({ visible: true, featured: false, tags: [], verified: true, ...extra });

  const sections = [
    {
      id: "experience", type: "experience", visible: true,
      title: L("الخبرات العملية", "Professional Experience"),
      items: [
        base({
          id: id("exp"), featured: true, tags: ["mgmt", "eng", "fin"],
          title: L("مدير مشاريع", "Project Manager"),
          org: L("شركة وبران بالتعاون مع الشركة السعودية للكهرباء", "Wabran Company in cooperation with Saudi Electricity Company"),
          location: L("نجران", "Najran"),
          start: "2021", end: "", current: true,
          achievements: L(
            [
              "الإشراف على تنفيذ مشاريع العقود الموحدة.",
              "إدارة الجداول الزمنية ومتابعة الميزانيات وضبط التكاليف.",
              "متابعة ميزانيات مشاريع تتجاوز 25 مليون ريال سعودي.",
              "التنسيق مع المقاولين والاستشاريين والجهات الحكومية.",
              "إعداد التقارير الدورية للإدارة العليا.",
              "متابعة معايير السلامة والجودة.",
              "تقييم المواد الفنية والتأكد من مطابقتها لمواصفات الشركة السعودية للكهرباء.",
              "إعداد تقييمات المخاطر وخطط المعالجة.",
            ].join("\n"),
            [
              "Supervised the execution of unified-contract projects.",
              "Managed schedules, tracked budgets and controlled costs.",
              "Tracked project budgets exceeding SAR 25 million.",
              "Coordinated with contractors, consultants and government entities.",
              "Prepared periodic reports for senior management.",
              "Monitored safety and quality standards.",
              "Evaluated technical materials and verified compliance with Saudi Electricity Company specifications.",
              "Prepared risk assessments and mitigation plans.",
            ].join("\n")
          ),
          tools: "",
        }),
        base({
          id: id("exp"), tags: ["eng"],
          title: L("مهندس كهرباء", "Electrical Engineer"),
          org: L("شركة جنوب القاهرة لتوزيع الكهرباء", "South Cairo Electricity Distribution Company"),
          location: L("", ""),
          start: "2013", end: "2021", current: false,
          achievements: L(
            [
              "تنفيذ أعمال البنية التحتية الكهربائية.",
              "تصميم وتنفيذ مخططات كابلات الجهد المتوسط والمنخفض.",
              "اختبار وتحديد أعطال الكابلات والمحولات.",
              "صيانة كابلات الجهد المتوسط والوصلات والنهايات.",
              "اختبار المحولات والقواطع ووحدات الربط الحلقي والمفاتيح الكهربائية.",
              "الصيانة التنبؤية باستخدام الكاميرا الحرارية وبرنامج FLIR Tools.",
              "إدارة فرق صيانة شبكات الجهد المنخفض.",
              "التدريب الفني في RTC حلوان.",
            ].join("\n"),
            [
              "Executed electrical infrastructure works.",
              "Designed and implemented medium- and low-voltage cable layouts.",
              "Tested and located cable and transformer faults.",
              "Maintained medium-voltage cables, joints and terminations.",
              "Tested transformers, circuit breakers, ring main units and switchgear.",
              "Predictive maintenance using thermal cameras and FLIR Tools.",
              "Managed low-voltage network maintenance teams.",
              "Technical training at RTC Helwan.",
            ].join("\n")
          ),
          tools: "FLIR Tools",
        }),
      ],
    },
    {
      id: "projects", type: "projects", visible: true,
      title: L("المشاريع", "Projects"),
      items: [
        base({ id: id("prj"), tags: ["eng"], title: L("مشاريع تحويل الشبكات في نجران", "Network conversion projects in Najran") }),
        base({ id: id("prj"), tags: ["eng"], title: L("مشاريع الربط بين المحطات", "Substation interconnection projects") }),
        base({ id: id("prj"), tags: ["eng"], title: L("تنفيذ واختبار كابلات المحطات", "Substation cable installation and testing") }),
        base({ id: id("prj"), tags: ["eng"], title: L("الفحص الحراري والصيانة", "Thermal inspection and maintenance") }),
      ],
    },
    {
      id: "skills", type: "skills", visible: true,
      title: L("المهارات", "Skills"),
      items: [
        base({ id: id("skl"), featured: true, tags: ["mgmt"], title: L("إدارة المشاريع", "Project Management"),
          list: L("التخطيط\nإدارة العقود\nالميزانيات\nالمخاطر\nالتقارير\nتنسيق الأطراف", "Planning\nContract management\nBudgets\nRisk\nReporting\nStakeholder coordination") }),
        base({ id: id("skl"), featured: true, tags: ["eng"], title: L("الهندسة الكهربائية", "Electrical Engineering"),
          list: L("شبكات الجهد المتوسط والمنخفض\nالمحولات\nالاختبارات\nالأعطال\nالصيانة", "MV & LV networks\nTransformers\nTesting\nFault finding\nMaintenance") }),
        base({ id: id("skl"), tags: ["eng", "prog"], title: L("البرمجيات الهندسية", "Engineering Software"), list: L("AutoCAD\nDIALux\nETAP", "AutoCAD\nDIALux\nETAP") }),
        base({ id: id("skl"), tags: ["fin"], title: L("تحليل البيانات", "Data Analysis"), list: L("Excel\nPower Query\nأدوات تحليل البيانات", "Excel\nPower Query\nData analysis tools") }),
        base({ id: id("skl"), tags: [], title: L("الأدوات المكتبية", "Office Tools"), list: L("Word\nExcel\nPowerPoint", "Word\nExcel\nPowerPoint") }),
        base({ id: id("skl"), tags: ["mgmt"], title: L("التخطيط والمتابعة", "Planning & Control"), list: L("Primavera", "Primavera") }),
        base({ id: id("skl"), tags: ["eng"], title: L("الأنظمة الصناعية", "Industrial Systems"), list: L("PLC\nSCADA\nأنظمة التحكم", "PLC\nSCADA\nControl systems") }),
      ],
    },
    {
      id: "education", type: "education", visible: true,
      title: L("المؤهل العلمي", "Education"),
      items: [
        base({ id: id("edu"), title: L("بكالوريوس هندسة القوى والآلات الكهربائية", "B.Sc. in Electrical Power and Machines Engineering"),
          org: L("جامعة حلوان", "Helwan University"), year: "2011" }),
      ],
    },
    {
      id: "courses", type: "courses", visible: true,
      title: L("الدورات والتدريب", "Courses & Training"),
      items: [
        base({ id: id("crs"), tags: [], kind: "course", title: L("السلامة والصحة المهنية HSE", "Occupational Health & Safety (HSE)") }),
        base({ id: id("crs"), tags: ["fin"], kind: "course", title: L("تحليل البيانات باستخدام Excel وPower Query", "Data analysis with Excel and Power Query") }),
        base({ id: id("crs"), tags: ["mgmt"], kind: "course", year: "2025", title: L("دورة PMP", "PMP preparation course") }),
        base({ id: id("crs"), tags: ["mgmt"], kind: "course", title: L("Primavera", "Primavera") }),
        base({ id: id("crs"), tags: ["mgmt"], kind: "course", title: L("المكتب الفني", "Technical Office") }),
        base({ id: id("crs"), tags: ["eng"], kind: "course", title: L("AutoCAD", "AutoCAD") }),
        base({ id: id("crs"), tags: ["eng"], kind: "course", title: L("PLC وSCADA", "PLC and SCADA") }),
        base({ id: id("crs"), tags: [], kind: "course", title: L("الإسعافات الأولية", "First Aid") }),
        base({ id: id("crs"), tags: ["eng"], kind: "course", title: L("العزل الآمن", "Safe Isolation") }),
      ],
    },
    {
      id: "platforms", type: "platforms", visible: true,
      title: L("منصات صممتها لخدمة المجتمع", "Platforms I Built for the Community"),
      items: [
        base({ id: id("plt"), featured: true, tags: ["edu", "comm", "prog"],
          title: L("منصة التزام للتدريب", "Iltizam Training Platform"),
          description: L("منصة تعليمية.", "An educational platform."),
          url: "https://iltizam-training.netlify.app/#/home", category: L("منصة تعليمية", "Educational"), status: "live", embed: true }),
        base({ id: id("plt"), featured: true, tags: ["mgmt", "prog"],
          title: L("منصة التزام لإدارة وتحليل أعمال المقاولين", "Iltizam Contractor Management & Analytics Platform"),
          description: L("منصة لإدارة وتحليل أعمال المقاولين.", "A platform for managing and analyzing contractors' work."),
          url: "https://iltizam-najran.netlify.app/", category: L("إدارة وتحليل", "Management & analytics"), status: "live", embed: true }),
      ],
    },
    {
      id: "youtube", type: "youtube", visible: true,
      title: L("قناة اليوتيوب", "YouTube Channel"),
      items: [
        base({ id: id("yt"), kind: "channel", title: L("Alphamedia-010", "Alphamedia-010"), url: "https://www.youtube.com/@Alphamedia-010" }),
      ],
    },
    {
      id: "linkedin", type: "linkedin", visible: true,
      title: L("صفحات LinkedIn", "LinkedIn Pages"),
      items: [
        base({ id: id("li"), kind: "personal", title: L("م. أحمد زهران — الحساب الشخصي", "Eng. Ahmed Zahran — personal profile"),
          url: "https://www.linkedin.com/in/ahmed-zahran-8b7730340" }),
      ],
    },
    {
      id: "insurance", type: "insurance", visible: true,
      title: L("مواقع التأمين الإلكتروني", "Online Insurance Websites"),
      items: [],
    },
    {
      id: "pages", type: "pages", visible: true,
      title: L("صفحاتي الخاصة", "My Pages"),
      items: [],
    },
    {
      id: "future", type: "future", visible: true,
      title: L("التطوير والإضافات المستقبلية", "Development & Upcoming Additions"),
      items: [
        ["شهادة إدارة المشاريع PMP", "PMP project management certification", "mgmt"],
        ["دورات التحليل الفني والمالي", "Technical and financial analysis courses", "fin"],
        ["تصميم وتخطيط المواقع", "Website design and planning", "prog"],
        ["ربط المواقع والأنظمة بالذكاء الاصطناعي", "Connecting websites and systems to AI", "ai"],
        ["Vibe Coding وتطوير التطبيقات بمساعدة الذكاء الاصطناعي", "Vibe Coding and AI-assisted app development", "ai"],
        ["مهارات البرمجة وتطوير الويب", "Programming and web development skills", "prog"],
      ].map(([ar, en, tag]) => ({ id: id("fut"), visible: false, featured: false, verified: false, tags: [tag], status: "planned", title: L(ar, en) })),
    },
  ];

  window.SEED = {
    version: 1,
    profile: {
      name: L("م. أحمد زهران", "Eng. Ahmed Zahran"),
      title: L("مدير مشاريع ومهندس قوى كهربائية", "Project Manager & Electrical Power Engineer"),
      location: L("نجران، المملكة العربية السعودية", "Najran, Saudi Arabia"),
      experienceSummary: L(
        "أكثر من 12 عامًا في البنية التحتية الكهربائية، وتوزيع الطاقة، وتنفيذ وإدارة المشاريع.",
        "12+ years in electrical infrastructure, power distribution, and project execution and management."
      ),
      bio: L(
        "مدير مشاريع ومهندس قوى كهربائية ذو خبرة تتجاوز 12 عامًا في تنفيذ مشاريع البنية التحتية والتوزيع الكهربائي، وإدارة العقود والميزانيات والمقاولين والاستشاريين، مع خبرة في اختبار وصيانة شبكات الجهد المتوسط والمنخفض والمحولات، وتحليل البيانات وإعداد التقارير الإدارية والفنية، وتصميم منصات ويب تخدم العمل الهندسي والمجتمع.",
        "Project manager and electrical power engineer with more than 12 years of experience delivering electrical infrastructure and distribution projects and managing contracts, budgets, contractors and consultants, with hands-on experience testing and maintaining medium- and low-voltage networks and transformers, analyzing data and preparing management and technical reports, and building web platforms that serve engineering work and the community."
      ),
      photo: "",
    },
    contact: {
      name: { value: "م. أحمد زهران", visible: true },
      email: { value: "az3919131@gmail.com", visible: true },
      whatsapp: { value: "0565324387", country: "966", visible: true },
      whatsappMessage: L("مرحبًا م. أحمد، أود التواصل معك بخصوص:", "Hello Eng. Ahmed, I would like to contact you about:"),
      formVisible: true,
    },
    tags: TAGS,
    sections,
  };
})();
