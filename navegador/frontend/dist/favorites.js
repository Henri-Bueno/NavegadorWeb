import { MyNode, List } from "./lista-encadeada.js";
const favorites = new List();
//----------funcoes para manipular a lista favoritos---------
//registra uma visita na lista de favoritos
function addFavorite(visit) {
    //verifica se ja esta nos favoritos
    const existingFavorite = favorites.getAll().find((favorite) => favorite.url === visit.url);
    if (existingFavorite)
        return;
    const favorite = new MyNode(visit.url, visit.title);
    favorite.icon = visit.icon;
    favorites.add(favorite);
    saveFavorites();
}
//busca todas as visitas nos favoritos
function getFavorites() {
    return favorites.getAll();
}
//deleta uma visita nos favoritos
function deleteFavorite(id) {
    const removed = favorites.remove(id);
    if (removed) {
        saveFavorites();
    }
    return removed;
}
//verifica se a visita esta nos favoritos
function isFavorite(url) {
    return favorites.getAll().some((favorite) => favorite.url === url);
}
//-----funcoes para salvar e carregar os favoritos do localStorage-----
function saveFavorites() {
    const data = favorites.getAll().map((favorite) => ({
        url: favorite.url,
        title: favorite.title,
        icon: favorite.icon
    }));
    localStorage.setItem("browser-favorites", JSON.stringify(data));
}
function loadFavorites() {
    const savedData = localStorage.getItem("browser-favorites");
    if (savedData === null)
        return;
    let savedFavorites;
    try {
        const parsed = JSON.parse(savedData);
        if (!Array.isArray(parsed))
            return;
        savedFavorites = parsed.filter((item) => typeof item?.url === "string" && typeof item?.title === "string" && typeof item?.icon === "string");
    }
    catch {
        return;
    }
    savedFavorites.forEach((data) => {
        if (isFavorite(data.url))
            return;
        const favorite = new MyNode(data.url, data.title);
        favorite.icon = data.icon;
        favorites.add(favorite);
    });
}
export { addFavorite, getFavorites, deleteFavorite, isFavorite, loadFavorites };
