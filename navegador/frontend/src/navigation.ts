import { MyNode } from "./history.js";

//classe nó para pilha de navegacao
class StackNode {
    value: MyNode;
    next: StackNode | null;

    constructor(value: MyNode) {
        this.value = value;
        this.next = null;
    }
}
//classe para pilhas de navegacao
class Stack {
    length: number;
    top: StackNode | null;

    constructor() {
        this.length = 0;
        this.top = null;
    }

    push(node: MyNode): void {
        const stackNode = new StackNode(node);
        stackNode.next = this.top;
        this.top = stackNode;
        this.length++;
    }

    pop(): MyNode | null {
        if (this.top === null) {
            return null;
        }

        const removed = this.top;
        this.top = removed.next;
        removed.next = null;
        this.length--;

        return removed.value;
    }

    peek(): MyNode | null {
        return this.top ? this.top.value : null;
    }

    isEmpty(): boolean {
        return this.length === 0;
    }

    clear(): void {
        this.top = null;
        this.length = 0;
    }
}

//cria as pilhas de navegacao para tras e frente
const backStack = new Stack();
const forwardStack = new Stack();

export { Stack, backStack, forwardStack };
