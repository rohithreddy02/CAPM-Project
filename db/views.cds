

@cds.persistence.exists 
@cds.persistence.calcview


Entity CV_ORDER_SUMMARY {
key     ID: String(36)  @title: 'ID: ID' ; 
        CUSTOMER_ID: String(36)  @title: 'CUSTOMER_ID: CUSTOMER_ID' ; 
        DATE: Date  @title: 'DATE: DATE' ; 
        Total_Price: Integer  @title: 'TOTAL_PRICE: Total_Price' ; 
}