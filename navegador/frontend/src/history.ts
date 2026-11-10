import { MyNode, List, getDomain, getPageIcon, fetchPageTitle } from "./lista-encadeada.js";

const history = new List();

//----------funcoes para manipular a lista histórico---------

//registra uma visita no histórico pelo dominio
function registerVisit(url: string): MyNode {
    const visit = new MyNode(url, getDomain(url));

    try {
        visit.icon = getPageIcon(url);
    } catch {
        visit.icon = "";
    }

    history.add(visit);

    return visit;
}
//atualiza o o titulo da visita pelo dominio
async function updateVisitTitle(visit: MyNode): Promise<string | null> {
    const title = await fetchPageTitle(visit.url);

    if (title) {
        visit.title = title;
    }

    return title;
}
//busca todas as visitas no histórico
function getHistory(): MyNode[] {
    return history.getAll();
}
//deleta uma visita n historico
function deleteVisit(id: number): boolean {
    return history.remove(id);
}
//seleciona e retorna uma visita e depois move ela para o inicio da lista
function selectVisit(id: number): MyNode | null {
    const visit = history.getAll().find((visit) => visit.id === id);

    if (visit !== undefined) {
        history.moveToStart(id);
        return visit;
    }

    return null;
}

export { MyNode, registerVisit, updateVisitTitle, getHistory, deleteVisit, selectVisit };