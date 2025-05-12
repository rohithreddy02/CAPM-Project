namespace DATA;

@requires: 'Admin'
entity Customers {
    key ID : UUID;
        name: String;
        email: String;
        contactNumber: String(25);
        order: Composition of many Orders on order.customer=$self
}

entity Orders {
    key ID: UUID;
        date: Date;
        status : OrderStatus;
        deliveryDate: Date;
        customer: Association to Customers;
        orderItem: Composition of many OrderItems on orderItem.order=$self;

}

entity OrderItems {
    key ID: UUID;
    order: Association to Orders;
    product: String;
    quantity: Integer;
    price: Integer;
}
type OrderStatus : String enum {
    Confirmed;
    Shipped;
    Delivered;
    Cancelled;
}
