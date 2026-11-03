// Ponto de entrada do navegador
import { registerVisit, updateVisitTitle, getHistory, deleteVisit, selectVisit } from "./history.js";
import { addFavorite, getFavorites, deleteFavorite, isFavorite, loadFavorites } from "./favorites.js";
// Obtém referências aos elementos do DOM
const frame = document.getElementById("browser-frame");
const input = document.getElementById("url-input");
const button = document.getElementById("navigate-button");
// Obtém referência à lista de histórico
const historyList = document.getElementById("history-list");
const historyTemplate = document.getElementById("history-item-template");
// Obtém referência à lista de favoritos
const favoritesList = document.getElementById("favorites-list");
const favoritesTemplate = document.getElementById("favorites-item-template");
let currentVisit = null;
// Função auxiliar para realizar a navegação
function handleNavigation() {
    if (input === null)
        return;
    let url = input.value.trim();
    if (url === "")
        return;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }
    navigateTo(url);
}
// Função auxiliar para navegar para uma URL
function navigateTo(url) {
    if (frame === null)
        return;
    if (input !== null) {
        input.value = url;
    }
    const visit = registerVisit(url);
    currentVisit = visit;
    frame.src = url;
    renderHistory();
    renderFavorites();
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
}
;
// Função auxiliar para renderizar o histórico de visitas
function renderHistory() {
    if (historyList === null || historyTemplate === null)
        return;
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
            if (frame === null || input === null)
                return;
            const selectedVisit = selectVisit(visit.id);
            if (selectedVisit === null)
                return;
            currentVisit = selectedVisit;
            frame.src = selectedVisit.url;
            input.value = selectedVisit.url;
            renderHistory();
            renderFavorites();
        });
        // Excluir visita do histórico
        const deleteButton = clone.querySelector('[data-action="delete"]');
        deleteButton.addEventListener("click", () => {
            deleteVisit(visit.id);
            renderHistory();
        });
        // Adicionar ou remover favorito
        const favoriteButton = clone.querySelector('[data-action="favorite"]');
        if (isFavorite(visit.url)) {
            favoriteButton.classList.add("favorited");
        }
        favoriteButton.addEventListener("click", () => {
            if (isFavorite(visit.url)) {
                const favorite = getFavorites().find((favorite) => favorite.url === visit.url);
                if (favorite) {
                    deleteFavorite(favorite.id);
                }
            }
            else {
                addFavorite(visit);
            }
            renderHistory();
            renderFavorites();
        });
        // Insere o item depois de configurar os eventos
        historyList.appendChild(clone);
    });
}
function renderFavorites() {
    if (favoritesList === null || favoritesTemplate === null)
        return;
    const favorites = getFavorites();
    favoritesList.innerHTML = "";
    if (favorites.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-state";
        emptyMessage.textContent = "Seus favoritos aparecerão aqui.";
        favoritesList.appendChild(emptyMessage);
        return;
    }
    favorites.forEach((favorite) => {
        const clone = favoritesTemplate.content.cloneNode(true);
        const item = clone.querySelector(".favorite-item");
        const title = clone.querySelector(".favorite-item-title");
        const icon = clone.querySelector(".favorite-item-icon");
        title.textContent = favorite.title || favorite.url;
        item.dataset.id = String(favorite.id);
        icon.src = favorite.icon;
        if (currentVisit?.url === favorite.url) {
            item.classList.add("favorite-item-active");
        }
        // Reacessar página ao clicar no título do favorito
        title.addEventListener("click", () => {
            const existingVisit = getHistory().find((visit) => visit.url === favorite.url);
            if (existingVisit) {
                const selectedVisit = selectVisit(existingVisit.id);
                if (selectedVisit === null)
                    return;
                currentVisit = selectedVisit;
                if (frame !== null)
                    frame.src = selectedVisit.url;
                if (input !== null)
                    input.value = selectedVisit.url;
                renderHistory();
            }
            else {
                navigateTo(favorite.url);
            }
        });
        const favoriteButton = clone.querySelector('[data-action="favorite"]');
        favoriteButton.addEventListener("click", () => {
            deleteFavorite(favorite.id);
            renderFavorites();
            renderHistory();
        });
        // insere o item depois de configurar os eventos
        favoritesList.appendChild(clone);
    });
}
// Carrega os favoritos salvos
loadFavorites();
// Renderização inicial
renderHistory();
renderFavorites();
