// Ponto de entrada do navegador
import {
  MyNode,
  registerVisit,
  updateVisitTitle,
  getHistory,
  deleteVisit,
  selectVisit,
} from "./history.js";
import {
  addFavorite,
  getFavorites,
  deleteFavorite,
  isFavorite,
  loadFavorites,
} from "./favorites.js";
import { backStack, forwardStack } from "./navigation.js";

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (element === null) {
    throw new Error(`Elemento #${id} não encontrado no HTML.`);
  }
  return element as T;
}

const frame = getElement<HTMLIFrameElement>("browser-frame");
const input = getElement<HTMLInputElement>("url-input");
const navigateButton = getElement<HTMLButtonElement>("navigate-button");
const backButton = getElement<HTMLButtonElement>("back-button");
const forwardButton = getElement<HTMLButtonElement>("forward-button");
const refreshButton = getElement<HTMLButtonElement>("refresh-button");
const historyList = getElement<HTMLElement>("history-list");
const historyTemplate = getElement<HTMLTemplateElement>("history-item-template");
const favoritesList = getElement<HTMLElement>("favorites-list");
const favoritesTemplate = getElement<HTMLTemplateElement>("favorites-item-template");

let currentVisit: MyNode | null = null;
let expectingLoad = false;

function normalizeUrl(rawUrl: string): string {
  const value = rawUrl.trim();
  if (value === "") return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function updateNavigationButtons(): void {
  backButton.disabled = backStack.isEmpty();
  forwardButton.disabled = forwardStack.isEmpty();
}

function renderHistory(): void {
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
    const item = clone.querySelector<HTMLElement>(".history-item");
    const title = clone.querySelector<HTMLElement>(".history-item-title");
    const icon = clone.querySelector<HTMLImageElement>(".history-item-icon");
    const deleteButton = clone.querySelector<HTMLButtonElement>('[data-action="delete"]');
    const favoriteButton = clone.querySelector<HTMLButtonElement>('[data-action="favorite"]');

    if (!item || !title || !icon || !deleteButton || !favoriteButton) return;

    title.textContent = visit.title || visit.url;
    item.dataset.id = String(visit.id);
    icon.src = visit.icon;
    icon.onerror = () => { icon.hidden = true; };

    if (currentVisit?.id === visit.id) item.classList.add("active");
    if (isFavorite(visit.url)) favoriteButton.classList.add("favorited");

    title.addEventListener("click", () => {
      const selectedVisit = selectVisit(visit.id);
      if (selectedVisit === null) return;
      if (currentVisit !== null && currentVisit.id !== selectedVisit.id) {
        backStack.push(currentVisit);
        forwardStack.clear();
      }
      showVisit(selectedVisit);
      renderHistory();
      renderFavorites();
    });

    deleteButton.addEventListener("click", () => {
      const wasCurrent = currentVisit?.id === visit.id;
      deleteVisit(visit.id);
      if (wasCurrent) {
        currentVisit = null;
        expectingLoad = false;
        frame.src = "about:blank";
      }
      renderHistory();
      updateNavigationButtons();
    });

    favoriteButton.addEventListener("click", () => {
      if (isFavorite(visit.url)) {
        const favorite = getFavorites().find((entry) => entry.url === visit.url);
        if (favorite) deleteFavorite(favorite.id);
      } else {
        addFavorite(visit);
      }
      renderHistory();
      renderFavorites();
    });

    historyList.appendChild(clone);
  });
}

function renderFavorites(): void {
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
    const clone = favoritesTemplate.content.cloneNode(true) as DocumentFragment;
    const item = clone.querySelector<HTMLElement>(".favorite-item");
    const title = clone.querySelector<HTMLElement>(".favorite-item-title");
    const icon = clone.querySelector<HTMLImageElement>(".favorite-item-icon");
    const favoriteButton = clone.querySelector<HTMLButtonElement>('[data-action="favorite"]');

    if (!item || !title || !icon || !favoriteButton) return;

    title.textContent = favorite.title || favorite.url;
    item.dataset.id = String(favorite.id);
    icon.src = favorite.icon;
    icon.onerror = () => { icon.hidden = true; };

    if (currentVisit?.url === favorite.url) item.classList.add("favorite-item-active");

    title.addEventListener("click", () => {
      const existingVisit = getHistory().find((visit) => visit.url === favorite.url);
      if (existingVisit) {
        const selectedVisit = selectVisit(existingVisit.id);
        if (selectedVisit === null) return;
        if (currentVisit !== null && currentVisit.id !== selectedVisit.id) {
          backStack.push(currentVisit);
          forwardStack.clear();
        }
        showVisit(selectedVisit);
      } else {
        navigateTo(favorite.url);
      }
      renderHistory();
      renderFavorites();
    });

    favoriteButton.addEventListener("click", () => {
      deleteFavorite(favorite.id);
      renderFavorites();
      renderHistory();
    });

    favoritesList.appendChild(clone);
  });
}

function showVisit(visit: MyNode): void {
  currentVisit = visit;
  input.value = visit.url;
  expectingLoad = true;
  frame.src = `/proxy?url=${encodeURIComponent(visit.url)}`;
  updateNavigationButtons();
}

function navigateTo(rawUrl: string): void {
  const url = normalizeUrl(rawUrl);
  if (url === "") return;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return;
  }
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") return;

  if (currentVisit !== null) backStack.push(currentVisit);
  forwardStack.clear();

  const visit = registerVisit(parsedUrl.href);
  showVisit(visit);
  renderHistory();
  renderFavorites();

  // Usa o endpoint existente para obter título quando o proxy não fornecer um.
  void updateVisitTitle(visit).then((title) => {
    if (title && getHistory().some((entry) => entry.id === visit.id)) {
      renderHistory();
    }
  });
}

function goBack(): void {
  if (currentVisit === null) return;
  const previous = backStack.pop();
  if (previous === null) return;
  forwardStack.push(currentVisit);
  const selected = selectVisit(previous.id) ?? previous;
  showVisit(selected);
  renderHistory();
  renderFavorites();
}

function goForward(): void {
  if (currentVisit === null) return;
  const next = forwardStack.pop();
  if (next === null) return;
  backStack.push(currentVisit);
  const selected = selectVisit(next.id) ?? next;
  showVisit(selected);
  renderHistory();
  renderFavorites();
}

function reload(): void {
  if (currentVisit === null) return;
  expectingLoad = true;
  frame.src = `/proxy?url=${encodeURIComponent(currentVisit.url)}&reload=${Date.now()}`;
}

navigateButton.addEventListener("click", () => navigateTo(input.value));
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") navigateTo(input.value);
});
backButton.addEventListener("click", goBack);
forwardButton.addEventListener("click", goForward);
refreshButton.addEventListener("click", reload);

window.addEventListener("message", (event: MessageEvent<unknown>) => {
  if (event.source !== frame.contentWindow || event.origin !== window.location.origin) return;
  if (typeof event.data !== "object" || event.data === null) return;

  const data = event.data as { type?: unknown; url?: unknown; title?: unknown };
  if (data.type !== "navegador:navigated" || typeof data.url !== "string") return;

  let url: URL;
  try {
    url = new URL(data.url);
  } catch {
    return;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  const title = typeof data.title === "string" ? data.title : "";
  if (expectingLoad && currentVisit !== null) {
    expectingLoad = false;
    currentVisit.url = url.href;
    if (title) currentVisit.title = title;
    input.value = url.href;
    renderHistory();
    renderFavorites();
    return;
  }

  if (currentVisit !== null) backStack.push(currentVisit);
  forwardStack.clear();
  const visit = registerVisit(url.href);
  if (title) visit.title = title;
  currentVisit = visit;
  input.value = url.href;
  renderHistory();
  renderFavorites();
  updateNavigationButtons();
});

loadFavorites();
renderHistory();
renderFavorites();
updateNavigationButtons();
navigateTo("https://example.com");
