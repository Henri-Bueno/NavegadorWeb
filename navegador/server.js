const express = require("express");
const path = require("node:path");
const proxy = require("./proxy");

const app = express();
const frontendPath = path.join(__dirname, "frontend");

app.get("/", (_request, response) => {
  response.sendFile(path.join(frontendPath, "index.html"));
});

app.get("/proxy", proxy);

app.use(express.static(frontendPath));

app.listen(3000, "127.0.0.1", () => {
  console.log("Servidor disponível em http://localhost:3000");
});