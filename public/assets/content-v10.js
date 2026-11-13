// CV page content (version 10): headline, value, verified experience, case studies and the certificates database.
// Personal identifiers (national ID / iqama numbers, birth dates, any military-service remark) are NOT part of this data.
// Preview images in assets/certs/ have those areas painted over inside the image file itself.
// Project Manager | Eng. Ahmed Zahran
(function () {
  const L = (ar, en = "") => ({ ar, en });

  const PROFILE = {
    cvTitle: L("مدير مشاريع | إدارة وتنفيذ وتخطيط مشاريع العقد الموحد بالمملكة\nمهندس اختبارات كابلات / شركة الكهرباء بمصر",
      "Project Manager | Managing, executing and planning unified-contract projects in Saudi Arabia\nCable testing engineer / Electricity company, Egypt"),
    cvSubtitle: L("مهندس قوى كهربائية ومصمم مواقع ومنصات رقمية", "Electrical power engineer, website and digital platform designer"),
    cvHeadline: L("أقود التنفيذ برؤية واضحة، وأربط التخطيط بواقع المشروع.", "I lead delivery with a clear view, and tie planning to the reality of the project."),
    cvLead: L("أجمع بين خبرة المشاريع الكهربائية والبنية التحتية، والتخطيط والمتابعة وتنسيق فرق العمل، وتصميم أدوات رقمية تساعد على تنظيم المعلومات ودعم القرار.",
      "I combine experience in electrical and infrastructure projects, planning, follow-up and team coordination with the design of digital tools that help organize information and support decisions."),
    cvFacts: L(
      "الخبرة|أكثر من 15 عامًا\nالمجال|مشاريع العقد الموحد — الشركة السعودية للكهرباء\nالشبكات|جهد متوسط ومنخفض (33 و13.8 ك.ف)\nالاختبارات|اختبار الكابلات وتحديد الأعطال\nالموقع|نجران، المملكة العربية السعودية",
      "Experience|More than 15 years\nField|Unified-contract projects for Saudi Electricity Company\nNetworks|Medium and low voltage (33 and 13.8 kV)\nTesting|Cable testing and fault location\nLocation|Najran, Saudi Arabia"),
    cvAbout: L(
      "أنا المهندس أحمد زهران، مدير مشاريع متخصص في إدارة التنفيذ والتخطيط والمتابعة، بخلفية في هندسة القوى الكهربائية ومشاريع البنية التحتية. تشمل خبرتي تنسيق الأعمال بين فرق التنفيذ والمقاولين والاستشاريين، ومتابعة الجداول الزمنية والتكاليف والمخاطر ومتطلبات الجودة والسلامة.\n\nوإلى جانب عملي الهندسي والإداري، أصمم مواقع ومنصات رقمية تنطلق من احتياجات العمل الفعلية، بهدف تنظيم المعلومات وتسهيل المتابعة وتقديم الخدمات بصورة واضحة. أركز على الجمع بين فهم الميدان، والانضباط في التخطيط، واستخدام الأدوات الرقمية لدعم الفريق واتخاذ القرار.",
      "I am Eng. Ahmed Zahran, a project manager specialized in managing execution, planning and follow-up, with a background in electrical power engineering and infrastructure projects. My experience includes coordinating work between delivery teams, contractors and consultants, and following schedules, costs, risks, and quality and safety requirements.\n\nAlongside my engineering and management work, I design websites and digital platforms that start from real work needs, to organize information, make follow-up easier and present services clearly. I focus on combining an understanding of the field, discipline in planning, and the use of digital tools to support the team and its decisions."),
    cvContactTitle: L("لنتحدث عن احتياجات مشروعك وفريقك", "Let's talk about your project and your team"),
    cvContactText: L("إذا كنت تبحث عن مدير مشاريع يجمع بين فهم التنفيذ والتخطيط والمتابعة والقدرة على تطوير أدوات العمل، يسعدني مناقشة الدور ومتطلبات فريقك.",
      "If you are looking for a project manager who combines an understanding of execution, planning and follow-up with the ability to develop work tools, I would be glad to discuss the role and your team's requirements."),
  };

  const VALUE = () => ({
    id: "value", type: "value", visible: true,
    title: L("القيمة التي أضيفها لفريقك", "The value I add to your team"),
    items: [
      ["val-plan", "plan", "التخطيط والمتابعة", "Planning and follow-up", "تنظيم الأنشطة والأولويات ومتابعة تقدم الأعمال.", "Organizing activities and priorities and following the progress of the work."],
      ["val-lead", "lead", "قيادة التنفيذ", "Leading delivery", "تنسيق الفرق والمقاولين والاستشاريين ومعالجة معوقات العمل.", "Coordinating teams, contractors and consultants, and resolving obstacles to the work."],
      ["val-control", "control", "ضبط المشروع", "Project control", "متابعة التكاليف والمخاطر ومتطلبات الجودة والسلامة.", "Following costs, risks, and quality and safety requirements."],
      ["val-digital", "digital", "تطوير العمل رقميًا", "Digitizing the work", "تنظيم البيانات والتقارير وبناء أدوات تخدم الإجراءات.", "Organizing data and reports and building tools that serve the procedures."],
    ].map(([id, icon, ar, en, dar, den]) => ({ id, visible: true, featured: false, tags: [], verified: true, icon, title: L(ar, en), description: L(dar, den) })),
  });

  const EXPERIENCE = [
    {
      title: L("مدير مشاريع / مهندس كهربائي عام — مشاريع العقد الموحد", "Project Manager / General Electrical Engineer — unified-contract projects"),
      org: L("شركة ناصر مانع وبران وشركاه — مقاول لأعمال الشركة السعودية للكهرباء", "Nassir Mana Wabran Co. & Partners — contractor for Saudi Electricity Company works"),
      client: L("الشركة السعودية للكهرباء. وهي جهة العميل، وليست جهة التوظيف المباشر.", "Saudi Electricity Company. It is the client, not the direct employer."),
      location: L("المنطقة الجنوبية — نجران وحبونا والمدن التابعة لها", "Southern Region — Najran, Habouna and surrounding cities"),
      start: "2021-01", end: "", current: true, tools: "",
      achievements: L(
        [
          "الإدارة والتخطيط والإشراف لجميع الأعمال الخاصة بالمقاول، من إسناد أوامر العمل بأقسام المشاريع والإنشاءات والصيانة والطوارئ والتوزيع.",
          "الإشراف الميداني على الفرق بالمواقع المختلفة في نطاقات حبونا ونجران والمدن التابعة لها، والتأكد من التصاريح والرخص والسلامة وتوفير المواد اللازمة للعمل.",
          "الإشراف على إغلاق أوامر العمل، من إرجاع وصرف بعد تعديل المقايسات، وإصدار الشهادات وعمل المستخلصات المالية.",
          "الإشراف على تمديد شبكات الضغط المنخفض وشبكات الجهد المتوسط (33 ك.ف و13.8 ك.ف)، وتثبيت وتركيب الوحدات الحلقية (RMU) والمحولات الكهربائية الهوائية والأرضية.",
          "اختبار الكابلات والمعدات بأجهزة الاختبار المختلفة، وشحن المعدات والمشاريع وتسليمها النهائي.",
          "الإشراف على ملفات تأهيل العاملين، وعمل برنامج لإدارة المواد بمستودعات الشركة، وتدريب العاملين على الفنيات والتنفيذ والاختبارات والسلامة والأمن الصناعي وإدارة ملف السلامة.",
        ].join("\n"),
        [
          "Managing, planning and supervising all of the contractor's work, from assigning work orders across projects, construction, maintenance, emergency and distribution departments.",
          "Field supervision of teams at various sites in the Habouna and Najran areas and surrounding cities, checking permits, licences and safety and securing the materials needed for the work.",
          "Supervising the closing of work orders, including returns and issues after adjusting bills of quantities, issuing certificates and preparing financial claims.",
          "Supervising the laying of low-voltage and medium-voltage (33 kV and 13.8 kV) networks, and installing ring main units (RMU) and overhead and ground-mounted transformers.",
          "Testing cables and equipment with the various test instruments, and energizing and finally handing over equipment and projects.",
          "Supervising staff qualification files, building a materials management program for the company's warehouses, and training workers on techniques, execution, testing, safety and industrial security, and managing the safety file.",
        ].join("\n")),
      evidence: L("خطاب الشركة بتاريخ 15/10/2025: ما زال على رأس العمل، والعقد مجدد حتى 31/12/2026. شهادة الخدمة المستخرجة من منصة قوى تسجّل الفترة 15/01/2021 – 16/01/2023، وتصف المسمى «مهندس كهربائي».",
        "Company letter dated 15/10/2025: still in post, with the contract renewed until 31/12/2026. The service certificate issued from the Qiwa platform records the period 15/01/2021 – 16/01/2023 with the job title \"Electrical Engineer\"."),
      certRef: "cert-service",
    },
    {
      title: L("مهندس ثانٍ — اختبارات الكابلات والشبكات الكهربائية", "Second Engineer — cable and electrical network testing"),
      org: L("شركة جنوب القاهرة لتوزيع الكهرباء (الشركة القابضة لكهرباء مصر)", "South Cairo Electricity Distribution Company (Egyptian Electricity Holding Company)"),
      client: L("", ""),
      location: L("قطاع شبكات المقطم — الإدارة العامة لشبكات البساتين، القاهرة", "Mokattam Networks Sector — General Administration of Bassatin Networks, Cairo"),
      start: "2013-01", end: "2021-01", current: false, tools: "",
      achievements: L(
        [
          "اختبار وتحديد الأعطال في كابلات الجهد المتوسط والمنخفض.",
          "تحليل أعطال الشبكات.",
          "صيانة الشبكات.",
          "إحلال وتجديد الكابلات وتوصيل التغذية للمنشآت.",
        ].join("\n"),
        [
          "Testing and locating faults in medium- and low-voltage cables.",
          "Analyzing network faults.",
          "Network maintenance.",
          "Replacing and renewing cables and connecting supply to facilities.",
        ].join("\n")),
      evidence: L("تعيين مؤقت بتاريخ 27/01/2013، ودائم بتاريخ 01/07/2014 (الدرجة الثالثة). حاليًا في إجازة رسمية مجددة.",
        "Temporary appointment on 27/01/2013 and permanent on 01/07/2014 (third grade). Currently on renewed official leave."),
      certRef: "cert-egypt",
    },
  ];

  const PROJECTS = [
    {
      id: "prj-najran", scene: "grid",
      title: L("مشاريع التحويل وإنهاء المغذيات بمنطقة نجران (العقد الموحد)", "Network conversion and feeder completion projects, Najran region (unified contract)"),
      kind: L("شبكات توزيع 33 و13.8 ك.ف — العقد الموحد", "33 and 13.8 kV distribution networks — unified contract"),
      scope: L("الأخدود، العزيزية، الحضن، الفهد، العرايسة، يدمة، خباش، بدر الجنوب، الغويلا، ومغذيات الشرفة وبدر الجنوب ويدمة.",
        "Al-Ukhdood, Al-Aziziyah, Al-Hadhn, Al-Fahd, Al-Uraisiyah, Yadamah, Khabash, Badr Al-Janoub, Al-Ghuwaila, and the Al-Sharafa, Badr Al-Janoub and Yadamah feeders."),
      challenge: L("نطاق جغرافي واسع يضم عدة مناطق ومغذيات في وقت واحد، مع ربط التنفيذ بالاختبار وإغلاق أوامر العمل فنيًا وماليًا.",
        "A wide geographic scope with several areas and feeders at the same time, linking execution with testing and closing work orders technically and financially."),
      role: L("مدير مشاريع بشركة ناصر مانع وبران وشركاه.", "Project manager at Nassir Mana Wabran Co. & Partners."),
      actions: L("التخطيط\nإسناد أوامر العمل\nالإشراف الميداني\nالاختبارات\nإغلاق المستخلصات", "Planning\nAssigning work orders\nField supervision\nTesting\nClosing financial claims"),
      results: L("إنهاء وشحن مشاريع المغذيات والتحويل لشبكات 33 و13.8 ك.ف وتسليمها النهائي\nإغلاق أوامر العمل فنيًا وماليًا",
        "Completed and energized the feeder and conversion projects for 33 and 13.8 kV networks and handed them over\nClosed work orders technically and financially"),
    },
    {
      id: "prj-ring", scene: "cable",
      title: L("إحلال وتجديد كابلات الجهد المتوسط بالطريق الدائري الأوسطي (شبكات حلوان)", "Medium-voltage cable replacement and renewal on the Regional Ring Road (Helwan networks)"),
      kind: L("كابلات جهد متوسط — شبكات توزيع", "Medium-voltage cables — distribution networks"),
      scope: L("الطريق الدائري الأوسطي، شبكات حلوان.", "Regional Ring Road, Helwan networks."),
      challenge: L("إحلال كابلات جهد متوسط قائمة وربطها بالشبكة مع الالتزام بالمواصفات الفنية.", "Replacing existing medium-voltage cables and connecting them to the network while meeting the technical specifications."),
      role: L("مهندس شبكات واختبارات كابلات بشركة جنوب القاهرة لتوزيع الكهرباء.", "Network and cable testing engineer at South Cairo Electricity Distribution Company."),
      actions: L("تمديد الكابلات\nاختبار العزل\nإحلال الكابلات وربطها بالشبكة", "Laying cables\nInsulation testing\nReplacing cables and connecting them to the network"),
      results: L("تمديد واختبار العزل وإحلال كابلات الجهد المتوسط وربطها بالشبكة وفق المواصفات الفنية", "Laid and insulation-tested the medium-voltage cables, replaced them and connected them to the network to the technical specifications"),
    },
    {
      id: "prj-cement", scene: "factory",
      title: L("التوزيع الكهربي وتصميم التحكم بخط إنتاج مصنع أسمنت (مشروع التخرج)", "Electrical distribution and control design for a cement plant production line (graduation project)"),
      kind: L("توزيع كهربي وتحكم صناعي — مشروع التخرج", "Electrical distribution and industrial control — graduation project"),
      scope: L("هندسة حلوان بالتعاون مع FLSmidth Helwan Cement Institute ومصنع أسمنت الرملية.", "Helwan Engineering in cooperation with FLSmidth Helwan Cement Institute and the Al-Ramlah cement plant."),
      challenge: L("تصميم منظومة توزيع كهربي وأتمتة خطوط التعبئة والخلط لمصنع أسمنت.", "Designing an electrical distribution system and automating the packing and mixing lines of a cement plant."),
      role: L("طالب بكلية الهندسة (مشروع تخرج).", "Engineering student (graduation project)."),
      actions: L("تصميم منظومة التوزيع الكهربي\nتصميم التحكم وأتمتة خطوط التعبئة والخلط", "Designing the electrical distribution system\nDesigning the control and automation of the packing and mixing lines"),
      results: L("تصميم منظومة التوزيع الكهربي وأتمتة خطوط التعبئة والخلط (Automation & Distribution of Packing and Mixing)\nتقدير امتياز لمشروع التخرج",
        "Designed the electrical distribution system and the automation of the packing and mixing lines (Automation & Distribution of Packing and Mixing)\nExcellent grade for the graduation project"),
    },
  ];

  /* [id, tab, title ar, title en, issuer, date, docType, grade, ref, skills, relevance, example, images] */
  const CERTS = [
    ["cert-bsc", "academic", "بكالوريوس هندسة القوى والآلات الكهربية", "B.Sc. in Electrical Power and Machines Engineering",
      "كلية الهندسة بحلوان — جامعة حلوان", "مايو 2011 (اعتماد سبتمبر 2011)", "مؤهل أكاديمي رسمي", "التقدير العام: جيد (69.23%) — مشروع التخرج: امتياز", "", "",
      "تأسيس هندسي أكاديمي رصين في نظم القوى والآلات الكهربائية وشبكات التوزيع.", "مراجعة الحسابات الفنية لأحمال المحطات والكابلات قبل التنفيذ.", ""],
    ["cert-syndicate", "academic", "عضوية وقيد نقابة المهندسين المصرية (شعبة كهرباء — تخصص قوى وآلات كهربية)", "Membership of the Egyptian Syndicate of Engineers (Electrical division — power and machines)",
      "نقابة المهندسين المصرية", "17/10/2011", "اعتماد مهني نقابي", "", "رقم القيد النقابي: 45/08160", "",
      "توثيق رسمي لمزاولة المهنة الهندسية في تخصص القوى والآلات الكهربية.", "اعتماد التقارير الفنية ومحاضر التسليم الهندسية.", ""],
    ["cert-service", "academic", "شهادة الخدمة (منصة قوى) وخطاب جهة العمل", "Service certificate (Qiwa) and employer letter",
      "شركة ناصر مانع وبران وشركاه — بالمملكة العربية السعودية", "الخدمة المسجلة في قوى: 15/01/2021 – 16/01/2023. خطاب الشركة (15/10/2025): على رأس العمل، والعقد مجدد حتى 31/12/2026.",
      "شهادة خبرة عملية موثقة", "المسمى في الوثائق: مهندس كهربائي / مهندس كهربائي عام", "رقم شهادة قوى: 101386-10408732", "",
      "تثبت الخبرة الميدانية المباشرة في مشاريع العقد الموحد بالمملكة العربية السعودية.", "قيادة فرق التنفيذ وإدارة دورة حياة أوامر العمل من التخطيط حتى المستخلص النهائي.", "qiwa-service-certificate\ncompany-letter-2025"],
    ["cert-egypt", "academic", "شهادة خبرة (مهندس ثانٍ — قطاع شبكات المقطم / الإدارة العامة لشبكات البساتين)", "Experience certificate (Second Engineer — Mokattam Networks Sector / Bassatin Networks)",
      "شركة جنوب القاهرة لتوزيع الكهرباء — وزارة الكهرباء والطاقة المتجددة بمصر", "التعيين المؤقت 27/01/2013 — الدائم 01/07/2014 (الدرجة الثالثة)", "شهادة خبرة حكومية رسمية", "", "", "",
      "تؤكد الخبرة التأسيسية والميدانية داخل مرفق توزيع الكهرباء الرسمي في تشغيل وصيانة واختبار الشبكات.", "إدارة فرق الصيانة، فحص الكابلات، وتطبيق القواعد الفنية لتوصيل التغذية.", "egypt-experience-certificate"],

    ["cert-claude-adv", "pm", "برنامج Claude For Business Advanced", "Claude For Business Advanced program",
      "Marketing Growth Hub (MGH)", "نوفمبر 2026", "شهادة إتمام برنامج تدريبي عملي", "", "", "النمذجة\nالتحليل المالي\nدعم اتخاذ القرار الاستراتيجي بالذكاء الاصطناعي",
      "يدعم إعداد تقارير أوضح ومراجعة المعلومات المالية والفنية لدعم القرار.", "بناء نماذج تحليلية لمراجعة مستخلصات المشاريع ومعدلات الإنجاز.", ""],
    ["cert-ai-diploma", "pm", "دبلوم Artificial Intelligence & Intelligent Automation Diploma", "Artificial Intelligence & Intelligent Automation Diploma",
      "Easy PMP Academy", "29 سبتمبر 2026", "شهادة إنجاز مشروع عملي ودبلوم تدريبي", "+25 ساعة", "مرجع الشهادة: 29-Sep-26", "Workflow Automation\nIntelligent Process Design\nAI Productivity Tools",
      "يدعم تنظيم البيانات والتقارير وأتمتة مسارات العمل الروتينية لخدمة الإجراءات.", "أتمتة تجميع التقارير الميدانية اليومية وتحديث لوحات متابعة الرخص وأوامر العمل.", ""],
    ["cert-nahj", "pm", "شهادة تقدير Claude For Business", "Certificate of Appreciation — Claude For Business",
      "NAHJ For Smart Consultation & Training", "يوليو 2026", "شهادة تقدير ومشاركة فعالة", "", "", "",
      "توظيف أدوات الذكاء الاصطناعي الحديثة في تنظيم وثائق العمل.", "هيكلة المراسلات الفنية ومحاضر الاجتماعات بكفاءة.", "nahj-appreciation"],
    ["cert-pmp-prep", "pm", "دورة PMP® Preparation Course", "PMP® Preparation Course",
      "Easy Academy / Easy PMP", "16 يناير 2026", "شهادة إتمام دورة تحضيرية لإدارة المشاريع (35 PDUs). وليست اعتماد PMP النهائي.", "+35 ساعة / 35 PDUs", "رقم الشهادة: ES-PMP-2898", "",
      "التخطيط: يدعم تنظيم الأنشطة ومتابعة الانحراف عن الجدول الزمني وضبط المخاطر والتكاليف.", "إعداد هيكل تجزئة العمل (WBS) ومتابعة المسار الحرج لمشاريع الشبكات.", "pmp-prep-course"],
    ["cert-hse", "pm", "دورة السلامة والصحة المهنية طبقًا لمعايير نيبوش (IGC)", "Occupational Health and Safety course to NEBOSH (IGC) standards",
      "معهد الخبير العالي للتدريب — معتمدة من المؤسسة العامة للتدريب التقني والمهني (TVTC)", "22-05-1446 هـ (نوفمبر 2024)", "شهادة حضور دورة تطويرية معتمدة من TVTC", "39 ساعة تدريبية", "رقم اعتماد الدورة: 344397614 — رقم الشهادة: 2411344325661812821961", "",
      "السلامة: يعزز فهم المخاطر وإجراءات العمل الآمن والامتثال لاشتراطات السلامة في المواقع.", "مراجعة تصاريح العمل وتطبيق قوائم التحقق من السلامة والعزل الآمن قبل الحفر أو الشحن.", ""],

    ["cert-dist-1", "power", "دورة Electrical Distribution Phase 1", "Electrical Distribution Phase 1 course",
      "نقابة المهندسين المصرية — معمل شنايدر إلكتريك (Schneider Electric Engineering Lab)", "مارس 2019", "شهادة إتمام دورة تدريبية فنية", "24 ساعة", "رقم: (0451)", "",
      "يدعم فهم المتطلبات الفنية لتوزيع القوى الكهربائية ومراجعة الأعمال ضمن نطاق التدريب.", "مراجعة مخططات لوحات التوزيع وتنسيق القواطع.", ""],
    ["cert-fault-2018", "power", "دورتا اختبار وتحديد الأعطال في الكابلات (يناير 2018 وأكتوبر 2018)", "Two cable testing and fault location courses (January 2018 and October 2018)",
      "شركة جنوب القاهرة لتوزيع الكهرباء — معهد تدريب المقطم", "يناير 2018 (اجتياز بنجاح) — 01/10/2018 إلى 18/10/2018", "شهادتا اجتياز برنامج تدريبي تخصصي", "تقدير الدورة الثانية: 89%", "", "",
      "يدعم دقة تشخيص أعطال الكابلات وتقليل زمن الانقطاعات وفحص الكابلات الجديدة قبل استلامها.", "قيادة فريق اختبارات الكابلات لتحديد موقع العطل بدقة قبل الحفر واللحام.", ""],
    ["cert-supply-rules", "power", "دورة قواعد توصيل التغذية للمنشآت", "Rules for connecting supply to facilities course",
      "شركة جنوب القاهرة لتوزيع الكهرباء — معهد تدريب المقطم", "نوفمبر 2017", "شهادة اجتياز برنامج تدريبي", "التقدير: 89%", "", "",
      "يدعم مطابقة توصيلات المنشآت والمشتركين مع القواعد الفنية والتعاقدية لشركات الكهرباء.", "مراجعة المقايسات الفنية ومتطلبات غرف المحولات للمنشآت.", ""],
    ["cert-solar", "power", "دورة الطاقة الشمسية", "Solar energy course",
      "شركة جنوب القاهرة لتوزيع الكهرباء — معهد تدريب المقطم", "أكتوبر 2017", "شهادة اجتياز برنامج تدريبي", "التقدير: 94%", "", "",
      "يدعم فهم حسابات وتصميم أنظمة الطاقة الشمسية ومتطلبات ربطها بالشبكة.", "مراجعة المخططات الأولية لمحطات الطاقة الشمسية الفرعية.", ""],
    ["cert-network-design", "power", "دورة تصميم شبكات التوزيع والقواعد المكملة", "Distribution network design and supplementary rules course",
      "شركة جنوب القاهرة لتوزيع الكهرباء — معهد تدريب المقطم", "03/06/2017 إلى 07/06/2017", "شهادة اجتياز برنامج تدريبي", "التقدير: 94%", "", "",
      "يربط بين أسس تصميم الشبكات والواقع الميداني لتجنب تعارضات التنفيذ.", "مراجعة تعديلات مسارات الشبكات والمقايسات قبل التنفيذ.", ""],
    ["cert-fault-analysis", "power", "دورتا تحليل الأعطال بالشبكات (يوليو 2015 ويناير 2016)", "Two network fault analysis courses (July 2015 and January 2016)",
      "شركة جنوب القاهرة لتوزيع الكهرباء — قطاع التدريب", "25/07/2015 إلى 28/07/2015 — 03/01/2016 إلى 06/01/2016", "شهادتا حضور واجتياز برنامج تدريبي", "التقدير: 91% و94%", "", "",
      "يدعم التحليل الجذري لأعطال الشبكات المتكررة ورفع موثوقية التغذية.", "إعداد تقارير تحليلية لأسباب الفصل المتكرر في المغذيات واقتراح الحلول.", ""],
    ["cert-cables", "power", "دورة كابلات الجهد المتوسط والمنخفض", "Medium- and low-voltage cables course",
      "شركة جنوب القاهرة لتوزيع الكهرباء — قطاع التدريب", "07/02/2015 إلى 12/02/2015", "شهادة حضور واجتياز دورة تدريبية", "التقدير: 91%", "", "",
      "يدعم الإشراف الفني على تمديد الكابلات وتنفيذ الوصلات والنهايات (Cable Terminations & Joints).", "متابعة تأهيل فنيي لحام الكابلات وضبط جودة التنفيذ بالموقع.", ""],
    ["cert-meters", "power", "دورة توصيل ومعايرة عدادات الطاقة الكهربائية", "Electric energy meter connection and calibration course",
      "شركة جنوب القاهرة لتوزيع الكهرباء", "15/02/2014 إلى 27/02/2014", "شهادة حضور واجتياز دورة تدريبية", "التقدير: 92%", "", "",
      "يدعم دقة فحص وتوصيل منظومات القياس والعدادات.", "مراجعة توصيلات عدادات الطاقة ومحولات التيار بالمنشآت.", ""],
    ["cert-lv-maint", "power", "دورة صيانة شبكة الجهد المنخفض", "Low-voltage network maintenance course",
      "شركة جنوب القاهرة لتوزيع الكهرباء", "08/10/2013 إلى 10/10/2013", "شهادة حضور واجتياز دورة تدريبية", "التقدير: 88%", "", "",
      "يعزز تنظيم خطط الصيانة الوقائية والطارئة لشبكات الجهد المنخفض.", "جدولة أعمال صيانة الصناديق والمحولات الهوائية والأرضية.", ""],
    ["cert-hse-2013", "power", "دورة السلامة والصحة المهنية (قطاع الكهرباء)", "Occupational Health and Safety course (electricity sector)",
      "شركة جنوب القاهرة لتوزيع الكهرباء", "04/05/2013 إلى 11/05/2013", "شهادة حضور واجتياز دورة تدريبية", "التقدير: 96%", "", "",
      "ترسيخ قواعد السلامة المهنية الخاصة بالعمل على الشبكات الكهربائية منذ بداية المسار المهني.", "التأكد من مهمات الوقاية الشخصية وتأريض الشبكة قبل بدء الصيانة.", ""],
    ["cert-jelecom-dist", "power", "دورة Electrical Power Systems Distribution Basic Applications", "Electrical Power Systems Distribution Basic Applications course",
      "شركة Jelecom Egypt (ISO 9001 Certified)", "18/12/2012 إلى 17/01/2013", "إفادة إتمام حضور دورة تدريبية", "", "", "",
      "يدعم فهم تطبيقات توزيع القوى الكهربائية الأساسية.", "مراجعة المكونات الأساسية لشبكات التوزيع الفرعية.", ""],

    ["cert-flsmidth", "control", "برنامج FLSmidth Helwan Cement Institute Training Program", "FLSmidth Helwan Cement Institute Training Program",
      "جامعة حلوان بالتعاون مع شركة FLSmidth الدنماركية", "2011", "شهادة إتمام برنامج تدريبي صناعي", "", "", "",
      "يعزز فهم النظم الكهربائية وأنظمة التحكم في المشاريع الصناعية الكبرى.", "تنسيق متطلبات القوى والتحكم في خطوط الإنتاج والمحطات.", "flsmidth-helwan-2011"],
    ["cert-plc-basic", "control", "دورة PLC Applications Basic Training", "PLC Applications Basic Training",
      "كلية الهندسة بجامعة عين شمس بالتعاون مع Jelecom", "17/08/2011 إلى 28/08/2011", "شهادة إتمام برنامج تدريبي", "التقدير: Very Good (جيد جدًا)", "", "",
      "يدعم فهم المنطق البرمجي لدوائر التحكم الآلي واللوحات الذكية.", "مراجعة مخططات الإشارات والتحكم في لوحات التشغيل.", ""],
    ["cert-plc-adv", "control", "دورات التحكم المنطقي المبرمج والتدريب الصناعي (PLC Advanced Level-1 وIDCS Industrial Control)", "PLC and industrial training courses (PLC Advanced Level-1 and IDCS Industrial Control)",
      "شركة Jelecom (يناير إلى مارس 2009) — مركز التصميمات الصناعية وأنظمة التحكم IDCS وIT Gate Academy (أغسطس 2010، مع تدريب عملي بشركات PLC-EHA والحلول الصناعية وورش CNC)", "2009 و2010", "شهادات إتمام دورات تدريبية وعملية", "التقدير: جيد جدًا", "", "",
      "يربط بين التصميم النظري والتطبيق العملي لدوائر القوى والتحكم.", "الإشراف على فحص لوحات التحكم والتشغيل قبل الاستلام.", "jelecom-plc-advanced-letter-2010"],
    ["cert-scada", "control", "دورة بناء أنظمة المراقبة والتحكم SCADA", "Building SCADA monitoring and control systems course",
      "Shrooq Training Courses (مشروع أفضل خريج)", "", "شهادة إتمام دورة تدريبية (Certification of Completion)", "", "", "Hardware Configuration\nDatabase Overview\nGraphics Creation\nAlarms & Real-time Trending\nPLC Data Transfer",
      "يدعم فهم منظومات المراقبة والتحكم عن بُعد (SCADA) المرتبطة بشبكات الكهرباء.", "فهم متطلبات ربط الوحدات الحلقية والمحطات بنظام المراقبة المركزي.", ""],
    ["cert-don-bosco", "control", "دبلومتان فنيتان من معهد السالزيان الإيطالي «دون بوسكو» (موثقتان من القنصلية الإيطالية بالقاهرة)", "Two technical diplomas from the Italian Salesian Institute \"Don Bosco\" (certified by the Italian Consulate in Cairo)",
      "معهد السالزيان الإيطالي «دون بوسكو»", "26/08/2008 إلى 20/10/2008 — 19/08/2009 إلى 20/11/2009", "شهادتا إتمام تدريب فني عملي مكثف",
      "التركيبات الكهربائية المدنية (60 ساعة): ممتاز — كهرباء تحكم آلي بالكونتاكتورات (90 ساعة): مقبول", "", "",
      "يمنح مدير المشروع معرفة عملية دقيقة بأصول التركيبات ودوائر الكنترول التقليدية.", "فحص جودة التوصيلات الداخلية للوحات الكهربائية بالموقع.", "don-bosco-contactors-2009\ndon-bosco-civil-2008"],
    ["cert-software", "control", "حزمة البرمجيات الهندسية بجامعة القاهرة (AutoCAD Electrical 2009، AutoCAD 2D، وMatlab 7 Simulink / SimPowerSystems)", "Engineering software package, Cairo University (AutoCAD Electrical 2009, AutoCAD 2D, Matlab 7 Simulink / SimPowerSystems)",
      "كلية الهندسة — جامعة القاهرة (معمل حاسبات قسم القوى والآلات الكهربية)", "يوليو 2008", "3 شهادات حضور دورات تدريبية هندسية", "75 ساعة تدريبية", "", "AutoCAD Electrical\nAutoCAD 2D\nMatlab Simulink / SimPowerSystems",
      "يدعم قراءة ومراجعة وتعديل المخططات التنفيذية الكهربية (Shop Drawings & As-Built) ومحاكاة الشبكات.", "مطابقة مخططات مسارات الكابلات على AutoCAD مع الواقع الميداني قبل الاعتماد.", "cairo-autocad-electrical-2008"],
    ["cert-summer", "control", "شهادتا التدريب الصيفي الميداني في قطاعات النقل والتوزيع", "Two field summer training certificates in transmission and distribution",
      "الشركة المصرية لنقل الكهرباء — مركز تدريب الشبكات بحلوان (يوليو 2009) وشركة جنوب القاهرة لتوزيع الكهرباء (أغسطس 2010)", "2009 و2010", "شهادتا اجتياز تدريب ميداني", "تقدير شبكات التوزيع: 85%", "", "",
      "تأسيس مبكر داخل محطات المحولات وشبكات التوزيع.", "فهم الربط بين شبكات النقل ومحطات التوزيع الفرعية.", ""],
    ["cert-soft-skills", "control", "حزمة المهارات الإدارية واللغوية والحاسوبية التأسيسية", "Foundational management, language and computer skills package",
      "مؤسسة «زدني» وجمعية رابعة، مشروع نورماندي 2، ICDL (مركز KIT)، والجامعة الأمريكية بالقاهرة (AUC)", "2007 إلى 2010", "شهادات حضور وإتمام تأسيسية", "", "",
      "Project Management\nPresentation Skills\nCreative Thinking\nPrinciples of Marketing\nPrinciples of Sales",
      "يدعم التواصل الفعال، وإعداد العروض التقديمية، وتدريب فرق العمل.", "تقديم عروض متابعة المشاريع للإدارة العليا وتدريب الفنيين الجدد.", ""],
  ];

  const CERT_NOTES = {
    "cert-plc-adv": "المرفق خطاب إفادة من Jelecom بتاريخ 13/03/2010: حضور دورة PLC Advanced Course (Level-1) من 31/01/2009 إلى 01/03/2009 بتقدير جيد جدًا. لم يُرفق بعد مستند مركز IDCS.",
    "cert-flsmidth": "الشهادة موقعة من رئيس جامعة حلوان ونائب رئيس FLSmidth، وتحمل عبارة «Year 2011».",
    "cert-don-bosco": "المرفقان: شهادة «Control by Contactors» (19/08/2009 – 20/11/2009، 90 ساعة، تقدير Pass) وشهادة «Electricity for Civil Installations» (26/08/2008 – 20/10/2008، 60 ساعة، تقدير Excellent). كلتاهما مصدّقة من قنصلية السفارة الإيطالية بالقاهرة.",
    "cert-software": "المرفق شهادة AutoCAD 2009 (Electrical) لمدة 24 ساعة (يوليو 2008). بقية شهادات الحزمة غير مرفقة بعد.",
    "cert-soft-skills": "تشمل: سلسلة محاضرات مؤسسة «زدني» وجمعية رابعة (يوليو 2010)، وشهادة تقدير كمدرب من طلاب مشروع نورماندي 2، والرخصة الدولية لقيادة الحاسب ICDL (يونسكو 2007 ومركز KIT)، ودورة اللغة الإنجليزية بالجامعة الأمريكية بالقاهرة AUC (سبتمبر 2007).",
  };

  const certItem = (r) => {
    const [id, tab, ar, en, issuer, date, docType, grade, ref, skills, relevance, example, images] = r;
    return {
      id, visible: true, featured: false, tags: [], verified: true, tab,
      title: L(ar, en), issuer: L(issuer), date, docType: L(docType), grade, ref,
      skills: L(skills), relevance: L(relevance), example: L(example), images: images || "", note: L(CERT_NOTES[id] || ""),
    };
  };

  const CERTS_SECTION = () => ({
    id: "certs", type: "certs", visible: true,
    title: L("الشهادات والاعتمادات", "Certificates and accreditations"),
    items: CERTS.map(certItem),
  });

  const hostOf = (u) => { try { return new URL(u).host; } catch { return ""; } };

  function apply(c) {
    c.profile = { ...(c.profile || {}), ...JSON.parse(JSON.stringify(PROFILE)) };
    c.contact = c.contact || {};
    if (!c.contact.phone2) c.contact.phone2 = { value: "0536324462", country: "966", visible: true };
    const secs = c.sections || (c.sections = []);

    // experience: documented employer / client / evidence
    const exp = secs.find((s) => s.type === "experience");
    if (exp) {
      EXPERIENCE.forEach((e, i) => {
        const cur = exp.items[i];
        if (cur) Object.assign(cur, JSON.parse(JSON.stringify(e)));
        else exp.items.push({ id: "exp-v10-" + i, visible: true, featured: i === 0, tags: [], verified: true, ...JSON.parse(JSON.stringify(e)) });
      });
      exp.items.forEach((it, i) => { if (i === 0) it.featured = true; });
      exp.title = L("الخبرات العملية", "Professional experience");
    }

    // projects: three case studies; earlier one-line cards stay in the admin panel, hidden
    const prj = secs.find((s) => s.type === "projects");
    if (prj) {
      const old = (prj.items || []).filter((i) => !i.scene).map((i) => ({ ...i, visible: false }));
      prj.items = PROJECTS.map((p) => ({ visible: true, featured: false, tags: ["eng"], verified: true, ...JSON.parse(JSON.stringify(p)) })).concat(old);
      prj.title = L("مشاريع مختارة", "Selected projects");
    }

    // value + certificates
    const ensure = (type, make, afterTypes) => {
      let s = secs.find((x) => x.type === type);
      if (!s) {
        s = make();
        let at = -1;
        afterTypes.forEach((t) => { const k = secs.findIndex((x) => x.type === t); if (k > at) at = k; });
        secs.splice(at + 1, 0, s);
      }
      return s;
    };
    const val = secs.find((s) => s.type === "value");
    if (!val) {
      const k = secs.findIndex((s) => s.type === "experience");
      secs.splice(k < 0 ? 0 : k, 0, VALUE());
    }
    const certs = secs.find((s) => s.type === "certs");
    if (!certs) ensure("certs", CERTS_SECTION, ["skills", "projects", "experience"]);
    else {
      const have = new Set(certs.items.map((i) => i.id));
      CERTS.map(certItem).forEach((it) => { if (!have.has(it.id)) certs.items.push(it); });
    }

    // the earlier education / courses lists are replaced by the certificates database; kept hidden, not deleted
    secs.forEach((s) => { if (s.type === "education" || s.type === "courses") s.visible = false; });

    // platform copy: the CV page shows the contractors platform first (display order is set by the renderer)
    c.version = 10;
    return c;
  }

  const DOCS = {
    "cert-plc-adv": "jelecom-plc-advanced-letter-2010", "cert-flsmidth": "flsmidth-helwan-2011",
    "cert-don-bosco": "don-bosco-contactors-2009\ndon-bosco-civil-2008", "cert-software": "cairo-autocad-electrical-2008",
  };
  function docs(c) {
    const sec = (c.sections || []).find((s) => s.type === "certs");
    if (sec) sec.items.forEach((it) => {
      if (DOCS[it.id] && !String(it.images || "").trim()) it.images = DOCS[it.id];
      if (CERT_NOTES[it.id] && !(it.note && (it.note.ar || it.note.en))) it.note = L(CERT_NOTES[it.id]);
    });
    c.version = 11;
    return c;
  }

  window.V10 = { apply, docs, hostOf, CERT_TABS: [
    { id: "academic", ar: "المؤهلات والخبرة", en: "Qualifications and experience",
      long: L("المؤهلات الأكاديمية، الاعتمادات المهنية، وشهادات الخبرة الرسمية", "Academic qualifications, professional accreditations and official experience certificates") },
    { id: "pm", ar: "الإدارة والسلامة والذكاء الاصطناعي", en: "Management, safety and AI",
      long: L("إدارة المشاريع، السلامة المهنية، والذكاء الاصطناعي والأتمتة", "Project management, occupational safety, and AI and automation") },
    { id: "power", ar: "هندسة القوى والكابلات", en: "Power engineering and cables",
      long: L("هندسة القوى الكهربائية، اختبارات الكابلات، وشبكات التوزيع", "Electrical power engineering, cable testing and distribution networks") },
    { id: "control", ar: "التحكم والبرمجيات والتدريب التأسيسي", en: "Control, software and foundational training",
      long: L("التحكم الآلي الصناعي، البرمجيات الهندسية، والتدريب التأسيسي", "Industrial automatic control, engineering software and foundational training") },
  ] };
})();
