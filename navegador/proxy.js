module.exports = async function proxy(request, response) {
  try {
    const rawUrl = request.query.url;
    if (typeof rawUrl !== "string") {
      return response.status(400).send("URL inválida");
    }

    const target = new URL(rawUrl);
    if (!["http:", "https:"].includes(target.protocol)) {
      return response.status(400).send("URL inválida");
    }

    const hostname = target.hostname.toLowerCase();
    const isPrivateIpv4 =
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
      /^127\./.test(hostname) ||
      /^169\.254\./.test(hostname);
    if (
      hostname === "localhost" ||
      hostname === "::1" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("fc") ||
      hostname.startsWith("fd") ||
      isPrivateIpv4
    ) {
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

    const source = await upstream.text();
    const html = /<head[^>]*>/i.test(source)
      ? source.replace(/<head[^>]*>/i, (match) => match + injected)
      : injected + source;
    response.send(html);
  } catch {
    response.status(502).send("Não foi possível carregar a página.");
  }
};