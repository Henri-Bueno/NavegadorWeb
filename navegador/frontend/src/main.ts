// Ponto de entrada do navegador; funcionalidades serão adicionadas posteriormente.
const frame = document.getElementById("browser-frame") as HTMLIFrameElement | null;
const input = document.getElementById("url-input") as HTMLInputElement | null;
const button = document.getElementById("navigate-button") as HTMLButtonElement | null;

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