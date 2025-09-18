public class Test {
    class Node{
        int data;
        Node prev;
        Node next;
        Node(int data) {
            this.data = data;
            this.prev = null;
            this.next = null;
        }
    }
    public void traversing(Node start){
        Node curr = start;
        while(curr != null){
            System.out.println(curr.data + " ");
            curr = curr.next;
        }
    }
    
public void main(String[] args) {
    Node head = new Node(3);
    Node temp1 = new Node(4);
    Node temp2 = new Node(5);
    head.next = temp1;
    temp1.prev = head;
    temp1.next = temp2;
    temp2.prev = temp1;
    traversing(head);
}
    
}
