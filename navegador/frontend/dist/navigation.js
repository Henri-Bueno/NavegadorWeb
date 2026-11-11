//classe nó para pilha de navegacao
class StackNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}
//classe para pilhas de navegacao
class Stack {
    constructor() {
        this.length = 0;
        this.top = null;
    }
    push(node) {
        const stackNode = new StackNode(node);
        stackNode.next = this.top;
        this.top = stackNode;
        this.length++;
    }
    pop() {
        if (this.top === null) {
            return null;
        }
        const removed = this.top;
        this.top = removed.next;
        removed.next = null;
        this.length--;
        return removed.value;
    }
    peek() {
        return this.top ? this.top.value : null;
    }
    isEmpty() {
        return this.length === 0;
    }
    clear() {
        this.top = null;
        this.length = 0;
    }
}
//cria as pilhas de navegacao para tras e frente
const backStack = new Stack();
const forwardStack = new Stack();
export { Stack, backStack, forwardStack };
