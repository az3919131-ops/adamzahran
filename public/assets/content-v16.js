// Content version 16: the Odoo materials & warehouse platform joins the platforms list (after the two Iltizam platforms).
// The description uses only what the owner stated about the work, plus general facts about Odoo itself.
// Project Manager | Eng. Ahmed Zahran
(function () {
  const L = (ar, en = "") => ({ ar, en });
  const HOST = "alwabrn-inventory.onrender.com";

  const ODOO = {
    id: "plt-odoo-materials", visible: true, featured: false, verified: true, embed: false,
    scene: "stock", status: "live", image: "assets/shots/odoo.jpg", imageIllustrative: true,
    url: "https://alwabrn-inventory.onrender.com/odoo/action-alwabrn_warehouse.action_explorer",
    title: L("منصة المواد والمستودعات (أودو)", "Materials & Warehouse Platform (Odoo)"),
    pitch: L("مواد مشاريع العقد الموحد ومستودعاتها في نظام واحد، مضبوط على نظام شركة الكهرباء.",
      "The materials and warehouses of unified-contract projects in one system, aligned with the electricity company's system."),
    description: L("برمجة وتخصيص نظام أودو (Odoo) لإدارة المواد والمستودعات في مشاريع العقد الموحد، وضبطه ليتوافق مع نظام شركة الكهرباء.",
      "Programming and customizing Odoo to manage materials and warehouses in unified-contract projects, aligned with the electricity company's system."),
    audience: L("مقاولو مشاريع العقد الموحد، وأمناء المستودعات، ومهندسو المشاريع ومراقبو المواد.",
      "Unified-contract project contractors, storekeepers, project engineers and materials controllers."),
    problem: L("حين تُتابَع المواد في جداول منفصلة يصعب معرفة الرصيد الفعلي، وتأخذ مطابقته مع بيانات شركة الكهرباء وقتًا.",
      "When materials are tracked in separate spreadsheets, the real balance is hard to know, and matching it with the electricity company's data takes time."),
    benefits: L("تعريف المواد والمستودعات ومواقع التخزين في نظام واحد\nتسجيل حركات الاستلام والصرف والتحويل بين المستودعات\nضبط النظام ليتوافق مع نظام شركة الكهرباء",
      "Materials, warehouses and storage locations defined in one system\nReceipts, issues and transfers between warehouses recorded\nThe system aligned with the electricity company's system"),
    steps: L("سجّل الدخول إلى النظام\nافتح مستكشف المستودعات واختر المستودع\nتابع أرصدة المواد وحركاتها",
      "Sign in to the system\nOpen the warehouse explorer and choose a warehouse\nFollow material balances and movements"),
    goalLabel: L("افتح مستكشف المستودعات", "Open the warehouse explorer"), goalUrl: "",
    joinLabel: L("", ""), joinUrl: "",
    note: L("عن أودو: Odoo منصة لإدارة أعمال الشركات مفتوحة المصدر، ووحدة المخزون فيها تتابع أرصدة المواد ومواقعها وحركات الاستلام والصرف. بُنيت منصة المواد هنا عليها. الدخول لأصحاب الحسابات المعتمدين.",
      "About Odoo: Odoo is an open-source business management platform; its Inventory app tracks material balances, locations, receipts and issues. This materials platform is built on it. Sign-in is for authorized account holders."),
    tags: ["mgmt", "eng"],
  };

  const hostOf = (u) => { try { return new URL(u).host; } catch { return ""; } };

  function apply(c) {
    const pl = (c.sections || []).find((s) => s.type === "platforms");
    if (pl) {
      pl.items = pl.items || [];
      if (!pl.items.some((i) => hostOf(i.url) === HOST)) {
        const after = pl.items.findIndex((i) => hostOf(i.url) === "iltizam-najran.netlify.app");
        pl.items.splice(after < 0 ? pl.items.length : after + 1, 0, JSON.parse(JSON.stringify(ODOO)));
      }
    }
    c.version = 16;
    return c;
  }

  window.V16 = { apply, ODOO, HOST };
})();
