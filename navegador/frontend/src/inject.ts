(function () {
  const script = document.currentScript as HTMLScriptElement | null;
  if (script === null) return;

  const real = script.dataset.url ?? location.href; 
  const proxyBase = new URL(script.src).origin + "/proxy?url="; 

  function notify(): void {
    parent.postMessage(
      { type: "navegador:navigated", url: real, title: document.title },
      "*"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", notify);
  } else {
    notify();
  }

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target as Element | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (link === null || !/^https?:/i.test(link.href)) return;

      event.preventDefault();
      location.href = proxyBase + encodeURIComponent(link.href);
    },
    true
  );
})();