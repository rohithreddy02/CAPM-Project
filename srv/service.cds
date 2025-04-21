using {DATA} from '../db/tables';

service MyService @(path: '/myservice'){
    entity Customer as projection on DATA.Customers;
    entity Order as projection on DATA.Orders;
    entity OrderItem as projection on DATA.OrderItems;
}
