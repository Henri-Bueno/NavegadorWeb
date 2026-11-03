import { MyNode, List, getDomain, getPageIcon, fetchPageTitle } from "./lista-encadeada.js";
const history = new List();
function registerVisit(url) {
    const visit = new MyNode(url, getDomain(url));
    try {
        visit.icon = getPageIcon(url);
    }
    catch {
        visit.icon = "";
    }
    history.add(visit);
    return visit;
}
async function updateVisitTitle(visit) {
    const title = await fetchPageTitle(visit.url);
    if (title) {
        visit.title = title;
    }
    return title;
}
function getHistory() {
    return history.getAll();
}
function deleteVisit(id) {
    return history.remove(id);
}
function selectVisit(id) {
    const visit = history.getAll().find((visit) => visit.id === id);
    if (visit !== undefined) {
        history.moveToStart(id);
        return visit;
    }
    return null;
}
export { MyNode, registerVisit, updateVisitTitle, getHistory, deleteVisit, selectVisit };
