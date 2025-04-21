namespace DATA;

entity Customers {
    key ID : UUID;
        name: String;
        email: String;
        order: Composition of many Orders on order.customer=$self
}

entity Orders {
    key ID: UUID;
        date: Date;
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