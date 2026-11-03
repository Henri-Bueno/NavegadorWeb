// Ponto de entrada do navegador
import { MyNode, registerVisit, updateVisitTitle, getHistory, deleteVisit, selectVisit } from "./history.js";

// Obtém referências aos elementos do DOM
const frame = document.getElementById("browser-frame") as HTMLIFrameElement | null;
const input = document.getElementById("url-input") as HTMLInputElement | null;
const button = document.getElementById("navigate-button") as HTMLButtonElement | null;

// Obtém referência à lista de histórico
const historyList = document.getElementById("history-list");
const historyTemplate = document.getElementById("history-item-template") as HTMLTemplateElement | null;

let currentVisit: MyNode | null = null;

// Função auxiliar para realizar a navegação
function handleNavigation(): void {
    if (input === null) return;

    let url = input.value.trim();

    if (url === "") return;

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }

    navigateTo(url);
}

// Função auxiliar para navegar para uma URL
function navigateTo(url: string): void {
    if (frame === null) return;

    if (input !== null) {
    input.value = url;
}

    const visit = registerVisit(url);
    currentVisit = visit;

    frame.src = url;
    renderHistory();

    updateVisitTitle(visit).then((title) => {
        if (title) {
            renderHistory();
        }
    });
}

// Adiciona um listener de evento ao botão de navegação
if (frame !== null && input !== null && button !== null) {

  button.addEventListener("click", handleNavigation);

input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleNavigation();
    }
});
};

// Função auxiliar para renderizar o histórico de visitas
function renderHistory(): void {
    if (historyList === null || historyTemplate === null) return;

    const visits = getHistory();

    historyList.innerHTML = "";

    if (visits.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-state";
        emptyMessage.textContent = "Suas páginas recentes aparecerão aqui.";

        historyList.appendChild(emptyMessage);
        return;
    }

    visits.forEach((visit) => {
        const clone = historyTemplate.content.cloneNode(true) as DocumentFragment;

        const item = clone.querySelector(".history-item") as HTMLElement;
        const title = clone.querySelector(".history-item-title") as HTMLElement;
        const icon = clone.querySelector(".history-item-icon") as HTMLImageElement;

        title.textContent = visit.title || visit.url;

        item.dataset.id = String(visit.id);

        icon.src = visit.icon;

        if (currentVisit?.id === visit.id) {
    item.classList.add("active");
}

        // Reacessar página ao clicar no título
        title.addEventListener("click", () => {
        if (frame === null || input === null) return;

        const selectedVisit = selectVisit(visit.id);

        if (selectedVisit === null) return;

        currentVisit = selectedVisit;
        frame.src = selectedVisit.url;
        input.value = selectedVisit.url;

        renderHistory();
});

        // Excluir visita do histórico
        const deleteButton = clone.querySelector('[data-action="delete"]') as HTMLButtonElement;

        deleteButton.addEventListener("click", () => {
            deleteVisit(visit.id);
            renderHistory();
        });

        // Insere o item depois de configurar os eventos
        historyList.appendChild(clone);
    });
}