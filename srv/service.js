const cds=require("@sap/cds");

module.exports = (srv) => {
    const {Customer, Order, OrderItem} = srv.entities;

    srv.before(['CREATE','UPDATE'], Customer, (req) => {

        const {email, name} = req.data;

        if(!name || name.trim() === ''){
            req.error(400, 'Customer name is required');
        }

        if(!email || email.trim() === ''){
            req.error(400, 'Email is required');
        }

        const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            req.error(400,'Invalid email format.');
        }

        console.log("Customer record is created by following all the validations");
    });

    srv.before(['CREATE', 'UPDATE'], OrderItem, (req)=> {
        const {quantity, price, product} = req.data;

        if(!product || product.trim() === ''){
            req.error(400, "Product name is required");
        }

        if(quantity == null || quantity <=0){
            req.error(400, 'Quantity must be greater than 0');
        }

        if(price==null || price <0){
            req.error(400, 'Price cannot be negative.');
        }

        console.log("OrderItem is created with all validations.");
    });

    // srv.after('READ', Order, async ( orders, req) => {
    //     const db= cds.transaction(req);
    //     const results=Array.isArray(orders)? orders: [orders];

    //     for(const order of results){
    //         const items=await db.run(
    //              //SELECT.from(OrderItem).where({order_ID: order.ID})
    //             `SELECT SUM(price * quantity) FROM ${OrderItem} WHERE order_ID =?`,[order.ID]
    //         );
    //         //console.log(items);

    //         const totalPrice=items.reduce((sum, item) => {
    //             return sum + (item.quantity ?? 0) * (item.price ?? 0);
    //         },0);

    //         order.totalPrice=totalPrice;
    //         console.log(`Calculated total price for Order ${order.ID}: ${totalPrice}`);
    //     }
    // });

    srv.after('READ', Order, async ( orders, req) => {
        const db= cds.transaction(req);
        const results=Array.isArray(orders)? orders: [orders];

        for(const order of results){
            const [result]=await db.run(
                `SELECT SUM(price * quantity) as totalPrice  FROM ${OrderItem} WHERE order_ID =?`,[order.ID]
            );
            console.log(result);
            

            order.TOTALPRICE = result.TOTALPRICE;
            console.log(`Calculated total price for Order ${order.ID}: ${result.TOTALPRICE}`);
        }
    });

    srv.before('CREATE', Order, async (req) => {
        const db = await cds.connect.to('db');
    
        
        const query = `SELECT "ID" FROM ${Order} WHERE "ID" LIKE 'ORD%'`;
        const result = await db.run(query);
    
    
        const existingIds = new Set(result.map(row => row.ID));
        
    

        let nextId = null;
        for (let i = 1; i <= 5; i++) {
            const candidateId = 'ORD' + String(i).padStart(3, '0');
            if (!existingIds.has(candidateId)) {
                nextId = candidateId;
                break;
            }
        }
    
        if (!nextId) {
            req.error(400, 'All Order IDs from ORD001 to ORD005 are currently in use.');
        }
    
        req.data.ID = nextId;
        req.data.date = new Date();
    
        console.log(`Assigned auto-generated Order ID: ${nextId}`);
    });
    




}
