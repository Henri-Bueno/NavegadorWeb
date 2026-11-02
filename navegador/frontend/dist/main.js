// Ponto de entrada do navegador
import { MyNode, history } from "./history.js";
// Obtém referências aos elementos do DOM
const frame = document.getElementById("browser-frame");
const input = document.getElementById("url-input");
const button = document.getElementById("navigate-button");
// Obtém referência à lista de histórico
const historyList = document.getElementById("history-list");
// Função auxiliar para renderizar o histórico de visitas
function renderHistory() {
    if (historyList === null)
        return;
    // Busca todas as visitas
    const visits = history.getAll();
    // Limpa a lista visual atual
    historyList.innerHTML = "";
    // Se não houver visitas, mostra a mensagem vazia
    if (visits.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-state";
        emptyMessage.textContent = "Suas páginas recentes aparecerão aqui.";
        historyList.appendChild(emptyMessage);
        return;
    }
    // Cria um elemento visual para cada visita
    visits.forEach((visit) => {
        const item = document.createElement("div");
        item.className = "history-item";
        item.textContent = visit.title || visit.url;
        historyList.appendChild(item);
    });
}
// Função auxiliar para obter o domínio da página a partir da URL
function getPageTitle(url) {
    try {
        const domain = new URL(url).hostname.replace("www.", "");
        return domain.charAt(0).toUpperCase() + domain.slice(1);
    }
    catch {
        return url;
    }
}
let currentVisit = null;
// Adiciona um listener de evento ao botão de navegação
if (frame !== null && input !== null && button !== null) {
    frame.addEventListener("load", () => {
        if (currentVisit === null)
            return;
        try {
            const title = frame.contentDocument?.title;
            if (title) {
                currentVisit.title = title;
                renderHistory();
            }
        }
        catch {
            // O navegador bloqueou o acesso ao conteúdo.
        }
    });
    button.addEventListener("click", () => {
        let url = input.value.trim();
        if (url === "")
            return;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }
        const visit = new MyNode(url, getPageTitle(url));
        history.add(visit);
        currentVisit = visit;
        frame.src = url;
        renderHistory();
    });
}
