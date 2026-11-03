import { MyNode, List, getDomain, getPageIcon, fetchPageTitle } from "./lista-encadeada.js";

const history = new List();

function registerVisit(url: string): MyNode {
    const visit = new MyNode(url, getDomain(url));

    visit.icon = getPageIcon(url);

    history.add(visit);

    return visit;
}

async function updateVisitTitle(visit: MyNode): Promise<string | null> {
    const title = await fetchPageTitle(visit.url);

    if (title) {
        visit.title = title;
    }

    return title;
}

function getHistory(): MyNode[] {
    return history.getAll();
}

function deleteVisit(id: number): boolean {
    return history.remove(id);
}

function selectVisit(id: number): MyNode | null {
    const visit = history.getAll().find((visit) => visit.id === id);

    if (visit !== undefined) {
        history.moveToStart(id);
        return visit;
    }

    return null;
}

export { MyNode, registerVisit, updateVisitTitle, getHistory, deleteVisit, selectVisit };