// Ponto de entrada do navegador
import { MyNode, history } from "./history.js";

// Obtém referências aos elementos do DOM
const frame = document.getElementById("browser-frame") as HTMLIFrameElement | null;
const input = document.getElementById("url-input") as HTMLInputElement | null;
const button = document.getElementById("navigate-button") as HTMLButtonElement | null;

// Obtém referência à lista de histórico
const historyList = document.getElementById("history-list");
const historyTemplate = document.getElementById("history-item-template") as HTMLTemplateElement | null;


// Função auxiliar para navegar para uma URL

function navigateTo(url: string): void {
    if (frame === null) return;

    const visit = new MyNode(url, getDomain(url));

    visit.icon = getPageIcon(url);

    history.add(visit);
    currentVisit = visit;

    frame.src = url;
    renderHistory();

    fetchPageTitle(url).then((title) => {
        if (title) {
            visit.title = title;
            renderHistory();
        }
    });
}


// Função auxiliar para renderizar o histórico de visitas
function renderHistory(): void {
    if (historyList === null || historyTemplate === null) return;

    const visits = history.getAll();

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
        if (frame === null) return;
        
        history.moveToStart(visit.id);

        currentVisit = visit;
        frame.src = visit.url;

        renderHistory();
});

        // Excluir visita do histórico
        const deleteButton = clone.querySelector(
            '[data-action="delete"]'
        ) as HTMLButtonElement;

        deleteButton.addEventListener("click", () => {
            history.remove(visit.id);
            renderHistory();
        });

        // Insere o item depois de configurar os eventos
        historyList.appendChild(clone);
    });
}

// Função auxiliar para obter o domínio da página a partir da URL
function getDomain(url: string): string {
    try {
        const domain = new URL(url).hostname.replace("www.", "");
        return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
        return url;
    }
}

// Função auxiliar para obter o ícone da página a partir da URL
function getPageIcon(url: string): string {
    const domain = new URL(url).hostname;

    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

async function fetchPageTitle(url: string): Promise<string | null> {
    try {
        const response = await fetch(
            `/api/page-title?url=${encodeURIComponent(url)}`
        );

        if (!response.ok) return null;

        const data: { title: string | null } = await response.json();

        return data.title;
    } catch {
        return null;
    }
}


let currentVisit: MyNode | null = null;

// Adiciona um listener de evento ao botão de navegação
if (frame !== null && input !== null && button !== null) {

  button.addEventListener("click", () => {
    let url = input.value.trim();

    if (url === "") return;

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }

    navigateTo(url);
});
}
