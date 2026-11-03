import { MyNode, List } from "./lista-encadeada.js";
const favorites = new List();
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
function getFavorites() {
    return favorites.getAll();
}
function deleteFavorite(id) {
    const removed = favorites.remove(id);
    if (removed) {
        saveFavorites();
    }
    return removed;
}
function isFavorite(url) {
    return favorites.getAll().some((favorite) => favorite.url === url);
}
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
    const savedFavorites = JSON.parse(savedData);
    savedFavorites.forEach((data) => {
        const favorite = new MyNode(data.url, data.title);
        favorite.icon = data.icon;
        favorites.add(favorite);
    });
}
export { addFavorite, getFavorites, deleteFavorite, isFavorite, loadFavorites };
