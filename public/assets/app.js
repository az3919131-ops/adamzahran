// Router & boot.
// Project Manager | Eng. Ahmed Zahran
(function () {
  const root = document.getElementById("app");
  let route = null, publicContent = null;

  const routeOf = (h) => (h.startsWith("#/admin") ? "admin" : h.startsWith("#/preview") ? "preview" : h.startsWith("#/cv") ? "cv" : h.startsWith("#sec-") && route ? route : "public");

  const App = {
    previewMode: false,
    pendingScroll: null,
    async go(force = false) {
      const r = routeOf(location.hash);
      if (!force && r === route) return;
      route = r;
      App.previewMode = r === "preview";
      if (!App.pendingScroll) window.scrollTo(0, 0);
      if (r === "admin") return AdminView.mount(root);
      if (r === "preview") {
        const d = Store.getDraft();
        const c = d && d.content ? Store.normalize(d.content) : publicContent || (publicContent = await Store.loadPublic());
        return PublicView.render(root, c, { preview: true, page: "home" });
      }
      publicContent = await Store.loadPublic();
      PublicView.render(root, publicContent, { page: r === "cv" ? "cv" : "home" });
    },
    rerender() { App.go(true); },
  };
  window.App = App;

  window.addEventListener("hashchange", () => App.go());
  window.addEventListener("storage", (e) => { if (e.key === "az_draft" && route === "preview") App.rerender(); });

  (async () => {
    await Store.init();
    await App.go(true);
  })();
})();
