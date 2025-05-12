using {DATA} from '../db/tables';
using {CV_ORDER_SUMMARY} from '../db/views';




@requires : 'authenticated-user'
service MyService @(path: '/myservice'){
    entity Customer as projection on DATA.Customers;
    entity Order as projection on DATA.Orders;
    entity OrderItem as projection on DATA.OrderItems;

    entity OrderSummary as projection on CV_ORDER_SUMMARY;
    
     function isAdmin() returns UserInfo;
     type UserInfo : {
        role  : String;
        id: UUID;
        name: String

    };

    

}
