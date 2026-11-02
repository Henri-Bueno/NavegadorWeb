const express = require("express");
const path = require("node:path");

const app = express();
const frontendPath = path.join(__dirname, "frontend");

app.get("/", (_request, response) => {
  response.sendFile(path.join(frontendPath, "index.html"));
});

app.use(express.static(frontendPath));

app.listen(3000, () => {
  console.log("Servidor disponível em http://localhost:3000");
});
