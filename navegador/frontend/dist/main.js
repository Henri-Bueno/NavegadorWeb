// Ponto de entrada do navegador
import { MyNode, history } from "./history.js";
// Obtém referências aos elementos do DOM
const frame = document.getElementById("browser-frame");
const input = document.getElementById("url-input");
const button = document.getElementById("navigate-button");
// Obtém referência à lista de histórico
const historyList = document.getElementById("history-list");
const historyTemplate = document.getElementById("history-item-template");
// Função auxiliar para navegar para uma URL
function navigateTo(url) {
    if (frame === null)
        return;
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
function renderHistory() {
    if (historyList === null || historyTemplate === null)
        return;
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
        const clone = historyTemplate.content.cloneNode(true);
        const item = clone.querySelector(".history-item");
        const title = clone.querySelector(".history-item-title");
        const icon = clone.querySelector(".history-item-icon");
        title.textContent = visit.title || visit.url;
        item.dataset.id = String(visit.id);
        icon.src = visit.icon;
        if (currentVisit?.id === visit.id) {
            item.classList.add("active");
        }
        // Reacessar página ao clicar no título
        title.addEventListener("click", () => {
            if (frame === null)
                return;
            history.moveToStart(visit.id);
            currentVisit = visit;
            frame.src = visit.url;
            renderHistory();
        });
        // Excluir visita do histórico
        const deleteButton = clone.querySelector('[data-action="delete"]');
        deleteButton.addEventListener("click", () => {
            history.remove(visit.id);
            renderHistory();
        });
        // Insere o item depois de configurar os eventos
        historyList.appendChild(clone);
    });
}
// Função auxiliar para obter o domínio da página a partir da URL
function getDomain(url) {
    try {
        const domain = new URL(url).hostname.replace("www.", "");
        return domain.charAt(0).toUpperCase() + domain.slice(1);
    }
    catch {
        return url;
    }
}
// Função auxiliar para obter o ícone da página a partir da URL
function getPageIcon(url) {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}
async function fetchPageTitle(url) {
    try {
        const response = await fetch(`/api/page-title?url=${encodeURIComponent(url)}`);
        if (!response.ok)
            return null;
        const data = await response.json();
        return data.title;
    }
    catch {
        return null;
    }
}
let currentVisit = null;
// Adiciona um listener de evento ao botão de navegação
if (frame !== null && input !== null && button !== null) {
    button.addEventListener("click", () => {
        let url = input.value.trim();
        if (url === "")
            return;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }
        navigateTo(url);
    });
}
