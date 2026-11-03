class MyNode {
    constructor(url, title = "") {
        this.url = url;
        this.title = title;
        this.id = MyNode.nextId++;
        this.next = null;
    }
}
MyNode.nextId = 1;
class List {
    constructor() {
        this.start = null;
        this.length = 0;
    }
    add(node) {
        node.next = this.start;
        this.start = node;
        ++this.length;
    }
    remove(id) {
        let current_node = this.start;
        let previous_node = null;
        let found = false;
        while (current_node !== null && !found) {
            if (current_node.id == id) {
                found = true;
                previous_node !== null
                    ? previous_node.next = current_node.next
                    : this.start = current_node.next;
                --this.length;
            }
            else {
                previous_node = current_node;
                current_node = current_node.next;
            }
        }
        return found;
    }
    getAll() {
        let current_node = this.start;
        let response = [];
        while (current_node !== null) {
            response.push(current_node);
            current_node = current_node.next;
        }
        return response;
    }
}
const history = new List();
export { MyNode, List, history };
