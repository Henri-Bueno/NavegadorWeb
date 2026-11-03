class MyNode {
    static nextId: number = 1;

    id: number;
    url: string;
    title: string;
    next: MyNode | null;

    constructor(url: string, title: string = "") {
        this.url = url;
        this.title = title;
        this.id = MyNode.nextId++;
        this.next = null;
    }
}

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

    remove(id:number): boolean{
        let current_node: MyNode | null = this.start;
        let previous_node: MyNode | null = null;
        let found = false;

        while(current_node !== null && !found){ 
            if( current_node.id == id){
                found = true;
                previous_node !== null
                ? previous_node.next = current_node.next
                : this.start = current_node.next;
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

    }

    const history = new List();

    export { MyNode, List, history };
