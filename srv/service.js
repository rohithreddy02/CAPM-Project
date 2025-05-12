const cds=require("@sap/cds");
const nodemailer = require('nodemailer');


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

    srv.after('READ', Order, async ( orders, req) => {
        const db= cds.transaction(req);
        const results=Array.isArray(orders)? orders: [orders];

        for(const order of results){
            const [result]=await db.run(
                `SELECT SUM(price * quantity) as totalPrice  FROM ${OrderItem} WHERE order_ID =?`,[order.ID]
            );
            
            
            order.TOTALPRICE = result.TOTALPRICE;
            //console.log(`Calculated total price for Order ${order.ID}: ${result.TOTALPRICE}`);
        }
    });

    srv.before('CREATE', Order, async (req) => {

        const { customer_ID, orderItem, date } = req.data;

        if (!customer_ID) {
            return req.error(400, 'Customer ID is required.');
        }
      
         
        if (!Array.isArray(orderItem) || orderItem.length === 0) {
            return req.error(400, 'Order must include at least one item.');
        }
      
          
        if (!date) {
            return req.error(400, 'Order date is required.');
        }

        const db = await cds.connect.to('db');


        const result=await db.run(`SELECT "CAPMDEMO"."SEQ_ORDER_ID".NEXTVAL FROM DUMMY`);
        console.log(result);
        const nextval = result[0]['SEQ_ORDER_ID.NEXTVAL'];


        const orderId='ORD'+ String(nextval).padStart(3,'0');

        req.data.ID=orderId;
    });

    srv.on('isAdmin', async (req) => {
        console.log(req.user);
        const isAdmin = req.user.is('Admin'); 
        const email = req.user.id;
        
        if (!email) {
            return req.reject(400, 'Email not found in user attributes.');
        }
    
        const db = await cds.connect.to('db');
        let result;
    
        if (req.user.is('Admin')) {
            return {role:"Admin"};
        }
        
        // if (req.user.is('Customer')) {
        //     result= await db.run(`SELECT * FROM ${Customer} WHERE email=?`,[email]);
        //     if (result?.length > 0) {
        //       return {role: "Customer", ID: result[0].ID,name: result[0].NAME};
        //     } else {
        //       return req.reject(404, 'Customer data not found.');
        //     }
        // }
    
        //   if (req.user.is('DeliveryAgent')) {
        //     return {role:"DeliveryAgent"};
        //   }
          
    });
    const transporter = nodemailer.createTransport({
        secure: true,
        host: `smtp.gmail.com`,
        auth: {
          user: "rohithreddykotha5424@gmail.com",      
          pass: "plnm noad ugeg tmge"    
        }
    });
    srv.after('CREATE', Order, async (order,req) => {
        const {customer_ID}=req.data;
        const db = await cds.connect.to('db');
        const result= await db.run(`SELECT email from ${Customer} where ID=?`,[customer_ID]);
        console.log(result);
        const email=result[0].EMAIL

        const items=await db.run(`SELECT product,quantity,price from ${OrderItem} where order_ID=?`,[order.ID]);
        console.log(items);
        const itemDetails = items.map(item =>
            `• Product: ${item.PRODUCT}, Quantity: ${item.QUANTITY}, Price: ${item.PRICE}`
          ).join('\n');          


        await transporter.sendMail({
          from: "rohithreddykotha5424@gmail.com",
          to: email,  
          subject: 'New Order Created',
          text: `A new order was placed.\n\nOrder ID: ${order.ID}\n\nItems:\n${itemDetails}`
        });
    });

    // srv.on('avgOrderValue', async (req) => {
    //     const db = cds.transaction(req);
    
    //     const query = `
    //       SELECT AVG(order_totals.total) as "avgOrderValue"
    //       FROM (
    //         SELECT "order_ID", SUM("quantity" * "price") as total
    //         FROM ${OrderItem}
    //         GROUP BY "order_ID"
    //       ) AS order_totals
    //     `;
    
    //     const result = await db.run(query);
    //     return result[0]; 
    //   });
    
    
    

    // srv.before('CREATE', Order, async (req) => {
    //     const db = await cds.connect.to('db');
    
        
    //     const query = `SELECT "ID" FROM ${Order} WHERE "ID" LIKE 'ORD%'`;
    //     const result = await db.run(query);
    
    
    //     const existingIds = new Set(result.map(row => row.ID));
        
    

    //     let nextId = null;
    //     for (let i = 1; i <= 5; i++) {
    //         const candidateId = 'ORD' + String(i).padStart(3, '0');
    //         if (!existingIds.has(candidateId)) {
    //             nextId = candidateId;
    //             break;
    //         }
    //     }
    
    //     if (!nextId) {
    //         req.error(400, 'All Order IDs from ORD001 to ORD005 are currently in use.');
    //     }
    
    //     req.data.ID = nextId;
    //     req.data.date = new Date();
    
    //     console.log(`Assigned auto-generated Order ID: ${nextId}`);
    // });

    

     


    




}
