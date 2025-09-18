import java.util.Scanner;

// Node class (Car)
class Car {
    String carNumber;
    String ownerName;
    Car prev, next;;

    public Car(String carNumber, String ownerName) {
        this.carNumber = carNumber;
        this.ownerName = ownerName;
        //this.prev = null;
        //this.next = null;
    }
}

// Parking Lot class (Doubly Linked List)
class ParkingLot {
    private Car head, tail;
    private int capacity, size;

    public ParkingLot(int capacity) {
        this.capacity = capacity;
        this.size = 0;
    }

    // Park a car
    public void parkCar(String carNumber, String ownerName) {
        if (size == capacity) {
            System.out.println("Parking Lot Full! Cannot park " + carNumber);
            return;
        }

        Car newCar = new Car(carNumber, ownerName);

        if (head == null) {
            head = tail = newCar;
        } else {
            tail.next = newCar;
            newCar.prev = tail;
            tail = newCar;
        }

        size++;
        System.out.println("Car " + carNumber + " parked successfully.");
    }

    // Remove a car
    public void removeCar(String carNumber) {
        if (head == null) {
            System.out.println("Parking Lot is empty.");
            return;
        }

        Car current = head;
        while (current != null && !current.carNumber.equals(carNumber)) {
            current = current.next;
        }

        if (current == null) {
            System.out.println("Car " + carNumber + " not found.");
            return;
        }

        if (current == head) {
            head = head.next;
            if (head != null) head.prev = null;
        } else if (current == tail) {
            tail = tail.prev;
            if (tail != null) tail.next = null;
        } else {
            current.prev.next = current.next;
            current.next.prev = current.prev;
        }

        size--;
        System.out.println("Car " + carNumber + " removed successfully.");
    }

    // Display cars forward
    public void displayForward() {
        if (head == null) {
            System.out.println("Parking Lot is empty.");
            return;
        }
        System.out.println("Cars in Parking Lot (Front → End):");
        Car current = head;
        while (current != null) {
            System.out.println("Car No: " + current.carNumber + " | Owner: " + current.ownerName);
            current = current.next;
        }
    }

    // Display cars backward
    public void displayBackward() {
        if (tail == null) {
            System.out.println("Parking Lot is empty.");
            return;
        }
        System.out.println("Cars in Parking Lot (End → Front):");
        Car current = tail;
        while (current != null) {
            System.out.println("Car No: " + current.carNumber + " | Owner: " + current.ownerName);
            current = current.prev;
        }
    }
}

// Main class (Menu Driven Program)
public class vehicle {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter Parking Lot Capacity: ");
        int capacity = sc.nextInt();
        ParkingLot lot = new ParkingLot(capacity);

        int choice;
        do {
            System.out.println("\n=== Parking Lot Menu ===");
            System.out.println("1. Park Car");
            System.out.println("2. Remove Car");
            System.out.println("3. Display Cars (Front → End)");
            System.out.println("4. Display Cars (End → Front)");
            System.out.println("5. Exit");
            System.out.print("Enter your choice: ");
            choice = sc.nextInt();

            switch (choice) {
                case 1:
                    System.out.print("Enter Car Number: ");
                    String carNum = sc.next();
                    System.out.print("Enter Owner Name: ");
                    String owner = sc.next();
                    lot.parkCar(carNum, owner);
                    break;

                case 2:
                    System.out.print("Enter Car Number to Remove: ");
                    String removeNum = sc.next();
                    lot.removeCar(removeNum);
                    break;

                case 3:
                    lot.displayForward();
                    break;

                case 4:
                    lot.displayBackward();
                    break;

                case 5:
                    System.out.println("Exiting Parking Lot System.");
                    break;

                default:
                    System.out.println("Invalid choice. Please try again.");
            }
        } while (choice != 5);

        sc.close();
    }
}
