module.exports = async function proxy(request, response) {
  try {
    const target = new URL(String(request.query.url));
    if (!["http:", "https:"].includes(target.protocol)) {
      return response.status(400).send("URL inválida");
    }

    const upstream = await fetch(target, {
      redirect: "follow",
      headers: { "user-agent": request.headers["user-agent"] || "Mozilla/5.0" },
    });

    const type = upstream.headers.get("content-type") || "";
    response.status(upstream.status).set("content-type", type);

    if (!type.includes("text/html")) {
      return response.send(Buffer.from(await upstream.arrayBuffer()));
    }

    const finalUrl = upstream.url.replace(/"/g, "&quot;"); 
    const scriptUrl = `${request.protocol}://${request.get("host")}/dist/inject.js`;
    const injected =
      `<base href="${finalUrl}">` +
      `<script src="${scriptUrl}" data-url="${finalUrl}"></script>`;

    const html = (await upstream.text()).replace(
      /<head[^>]*>/i,
      (match) => match + injected
    );
    response.send(html);
  } catch {
    response.status(502).send("Não foi possível carregar a página.");
  }
};