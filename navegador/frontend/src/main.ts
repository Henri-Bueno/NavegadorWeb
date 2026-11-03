// Ponto de entrada do navegador
import { MyNode, history } from "./history.js";
import { backStack, forwardStack } from "./navigation.js";

// --- DOM -------------------------------------------------------------

// Falha com mensagem clara se o id não existir no HTML
function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (element === null) {
    throw new Error(`Elemento #${id} não encontrado no HTML.`);
  }
  return element as T;
}

const frame = getElement<HTMLIFrameElement>("browser-frame");
const input = getElement<HTMLInputElement>("url-input");
const goButton = getElement<HTMLButtonElement>("navigate-button");
const backButton = getElement<HTMLButtonElement>("back-button");
const forwardButton = getElement<HTMLButtonElement>("forward-button");
const refreshButton = getElement<HTMLButtonElement>("refresh-button");
const historyList = getElement<HTMLElement>("history-list");

// --- Estado ----------------------------------------------------------

let currentVisit: MyNode | null = null;

// true quando o usuário pede a página (digitar, voltar, avançar)
let expectingLoad = false;

// --- Auxiliares ------------------------------------------------------

function normalizeUrl(raw: string): string {
  const value = raw.trim();
  if (value === "") return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function getPageTitle(url: string): string {
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    return url;
  }
}

// --- Interface -------------------------------------------------------

function renderHistory(): void {
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
    const item = document.createElement("div");
    item.className = "history-item";
    item.textContent = visit.title || visit.url;
    historyList.appendChild(item);
  });
}

function updateNavigationButtons(): void {
  backButton.disabled = backStack.isEmpty();
  forwardButton.disabled = forwardStack.isEmpty();
}

// Carrega pelo proxy e atualiza a barra de endereço
function showVisit(visit: MyNode): void {
  currentVisit = visit;
  input.value = visit.url;
  expectingLoad = true;
  frame.src = `/proxy?url=${encodeURIComponent(visit.url)}`;
  updateNavigationButtons();
}

// --- Navegação -------------------------------------------------------

function navigateTo(rawUrl: string): void {
  const url = normalizeUrl(rawUrl);
  if (url === "") return;

  if (currentVisit !== null) {
    backStack.push(currentVisit);
  }
  forwardStack.clear(); // nova navegação invalida o "avançar"

  const visit = new MyNode(url, getPageTitle(url));
  history.add(visit);

  showVisit(visit);
  renderHistory();
}

function goBack(): void {
  if (backStack.isEmpty() || currentVisit === null) return;

  const previous = backStack.pop();
  if (previous === null) return;

  forwardStack.push(currentVisit);
  showVisit(previous);
}

function goForward(): void {
  if (forwardStack.isEmpty() || currentVisit === null) return;

  const next = forwardStack.pop();
  if (next === null) return;

  backStack.push(currentVisit);
  showVisit(next);
}

function reload(): void {
  if (currentVisit === null) return;
  expectingLoad = true;
  try {
    frame.contentWindow?.location.reload();
  } catch {
    showVisit(currentVisit);
  }
}

// --- Eventos ---------------------------------------------------------

goButton.addEventListener("click", () => navigateTo(input.value));
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") navigateTo(input.value);
});
backButton.addEventListener("click", goBack);
forwardButton.addEventListener("click", goForward);
refreshButton.addEventListener("click", reload);

// Avisos enviados pelo script que o servidor injeta nas páginas
window.addEventListener("message", (event) => {
  if (event.source !== frame.contentWindow) return;
  if (event.data?.type !== "navegador:navigated") return;

  const url: string = event.data.url;
  const title: string = event.data.title;

  // Corrige para a URL final após redirecionamentos 
  if (expectingLoad && currentVisit !== null) {
    expectingLoad = false;
    currentVisit.url = url;
    currentVisit.title = title || currentVisit.title;
    input.value = url;
    renderHistory();
    return;
  }

  // Navegação feita pelo site (vira uma nova visita)
  if (currentVisit !== null) {
    backStack.push(currentVisit);
  }
  forwardStack.clear();

  const visit = new MyNode(url, title || getPageTitle(url));
  history.add(visit);
  currentVisit = visit;
  input.value = url;

  renderHistory();
  updateNavigationButtons();
});

// --- Início ----------------------------------------------------------

navigateTo("https://example.com"); // a página inicial entra no histórico