// classe nó base para lista encadeada
class MyNode {
    static nextId: number = 1;

    id: number;
    url: string;
    title: string;
    next: MyNode | null;
    icon: string;

    constructor(url: string, title: string = "") {
        this.url = url;
        this.title = title;
        this.id = MyNode.nextId++;
        this.next = null;
        this.icon = "";
    }
}
// classe lista encadeada para historico e favoritos
class List{
    length: number;
    start: MyNode | null
    constructor(){
        this.start = null;
        this.length = 0;
    }

    add(node: MyNode): void{
        node.next = this.start;
        this.start = node;
        ++ this.length;
    }
        
    remove(id: number ): boolean {
        let current_node: MyNode | null = this.start;
        let previous_node: MyNode | null = null;
        let found = false;

        while (current_node !== null && !found) {
            if (current_node.id === id) {
                found = true;
                if (previous_node !== null) {
                    previous_node.next = current_node.next;
                } else {
                    this.start = current_node.next;
                }

                current_node.next = null;
                --this.length;

            } else {
                previous_node = current_node;
                current_node = current_node.next;
            }
        }

        return found;
    }

    getAll(): MyNode[]{
        let current_node: MyNode | null = this.start;
        let response: MyNode[] = [];

        while(current_node !== null){
            response.push(current_node);
            current_node = current_node.next;
        }
        return response;
    }

    moveToStart(id: number): boolean {
    if (this.start === null || this.start.id === id) {
        return false;
    }

    let previous: MyNode = this.start;
    let current: MyNode | null = this.start.next;

    while (current !== null && current.id !== id) {
        previous = current;
        current = current.next;
    }

    if (current === null) return false;

    previous.next = current.next;
    current.next = this.start;
    this.start = current;

    return true;
}

    }

//----------funcoes auxiliares para montar o nó---------


// Função auxiliar para obter o ícone da página a partir da URL
function getPageIcon(url: string): string {
    const domain = new URL(url).hostname;

    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;;
}

// Função auxiliar para obter o domínio da página a partir da URL
function getDomain(url: string): string {
    try {
        const domain = new URL(url).hostname.replace("www.", "");
        return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
        return url;
    }
}
// Função auxiliar para buscar o título da página a partir da URL
async function fetchPageTitle(url: string): Promise<string | null> {
    try {
        const response = await fetch(
            `/api/page-title?url=${encodeURIComponent(url)}`
        );

        if (!response.ok) return null;

        const data: { title: string | null } = await response.json();

        return data.title;
    } catch {
        return null;
    }
}

export { MyNode, List, getDomain, getPageIcon, fetchPageTitle };
