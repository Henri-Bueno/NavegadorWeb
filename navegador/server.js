const express = require("express");
const path = require("node:path");

const app = express();
const frontendPath = path.join(__dirname, "frontend");

app.get("/api/page-title", async (request, response) => {
    try {
        const url = new URL(request.query.url);

        if (!["http:", "https:"].includes(url.protocol)) {
            return response.status(400).json({ title: null });
        }

        // Bloqueia alguns endereços locais básicos.
        const hostname = url.hostname.toLowerCase();

        if (
            hostname === "localhost" ||
            hostname === "::1" ||
            hostname.startsWith("127.") ||
            hostname.startsWith("10.") ||
            hostname.startsWith("192.168.") ||
            hostname.startsWith("169.254.") ||
            /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
        ) {
            return response.status(400).json({ title: null });
        }

        const page = await fetch(url, {
            signal: AbortSignal.timeout(5000),
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        if (!page.ok) {
            return response.json({ title: null });
        }

        const html = await page.text();
        const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

        const title = match
            ? match[1].trim().replace(/\s+/g, " ")
            : null;

        response.json({ title: title || null });

    } catch {
        response.json({ title: null });
    }
});


app.get("/", (_request, response) => {
  response.sendFile(path.join(frontendPath, "index.html"));
});

app.use(express.static(frontendPath));

app.listen(3000, () => {
  console.log("Servidor disponível em http://localhost:3000");
});
