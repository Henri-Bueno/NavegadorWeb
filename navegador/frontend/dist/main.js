"use strict";
// Ponto de entrada do navegador; funcionalidades serão adicionadas posteriormente.
const frame = document.getElementById("browser-frame");
const input = document.getElementById("url-input");
const button = document.getElementById("navigate-button");
if (frame !== null && input !== null && button !== null) {
    button.addEventListener("click", () => {
        let url = input.value.trim();
        if (url === "") {
            return;
        }
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }
        frame.src = url;
    });
}
