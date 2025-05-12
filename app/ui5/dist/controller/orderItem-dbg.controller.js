sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/Fragment",
  "sap/f/library",
], (Controller, Fragment, fioriLibrary) => {
  "use strict";

  return Controller.extend("ui5.controller.orderItem", {

      onInit: function () {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.getRoute("orderItem").attachPatternMatched(this._onRouteMatched, this);
      },

      _onRouteMatched: function (oEvent) {
           this._sOrderId = oEvent.getParameter("arguments").orderId;
           this._customerId = oEvent.getParameter("arguments").customerId;
           this._customerName = oEvent.getParameter("arguments").customerName;  
          var oModel = this.getOwnerComponent().getModel();  

          var that = this;

         
          oModel.read("/Order('"+this._sOrderId+"')", {
              urlParameters: {
                  "$expand": "orderItem"  
              },
              success: function (oData) {
                console.log(oData);
                if (oData.orderItem && oData.orderItem.results && oData.orderItem.results.length > 0) {
                    var oOrderModel = new sap.ui.model.json.JSONModel(oData);
                    that.getView().setModel(oOrderModel, "order")
                  var oJSONModel = new sap.ui.model.json.JSONModel(oData.orderItem.results);
                  console.log(oData.orderItem.results);  
                  that.getView().setModel(oJSONModel, "orderItem");  
              } else {
                  sap.m.MessageToast.show("No order items found for this order.");
              }
              },
              error: function (oError) {
                  sap.m.MessageToast.show("Failed to fetch order items.");
                  console.error(oError);  
              }
          });
        },
        // onAddOrderItem: function(){
        //     var oView=this.getView();
        //     if (!oView.getModel("orderItemForm")) {
        //         var oFormModel = new sap.ui.model.json.JSONModel({
        //             product: "",
        //             productValueState: "None",
        //             productValueStateText: "",
        //             quantity: "",
        //             quantityValueState: "None",
        //             quantityValueStateText: "",
        //             price: "",
        //             priceValueState: "None",
        //             priceValueStateText: ""
        //         });
        //         oView.setModel(oFormModel, "orderItemForm");
        //     }
        //     if(!this._createOrderItemDialog){
        //         Fragment.load({
        //             id:oView.getId(),
        //             name:"ui5.view.fragments.createOrderItem",
        //             controller: this
        //         }).then(function(oDialog){
        //             oView.addDependent(oDialog);
        //             this._createOrderItemDialog=oDialog;
        //             this._createOrderItemDialog.open();
        //         }.bind(this));
        //     }else{
        //         this._createOrderItemDialog.open();
        //     }
        // },
        // onRead: function(){
        //     var oModel = this.getOwnerComponent().getModel();  

          
        //   var that = this;

         
        //   oModel.read("/Order('"+this._sOrderId+"')", {
        //       urlParameters: {
        //           "$expand": "orderItem"  
        //       },
        //       success: function (oData) {
        //         console.log(oData);
        //         if (oData.orderItem && oData.orderItem.results && oData.orderItem.results.length > 0) {
                  
        //           var oJSONModel = new sap.ui.model.json.JSONModel(oData.orderItem.results);
        //           console.log(oData.orderItem.results);  
        //           that.getView().setModel(oJSONModel, "orderItem");  
        //       } else {
        //           sap.m.MessageToast.show("No order items found for this order.");
        //       }
        //       },
        //       error: function (oError) {
        //           sap.m.MessageToast.show("Failed to fetch order items.");
        //           console.error(oError);  
        //       }
        //   });
        // },
        // onSaveOrderItem: function () {
        //     var oView = this.getView();
        //     var oModel = this.getOwnerComponent().getModel();
        //     var oFormModel = oView.getModel("orderItemForm");
        //     var oData = oFormModel.getData();

        //     // var oNewEntryModel = this.getView().getModel("NewCustomer");
        //     // var oData = oNewEntryModel.getData();
        
        //     var isValid = true;
        
        //     // Reset value states first
        //     oData.productValueState = "None";
        //     oData.productValueStateText = "";
        //     oData.quantityValueState = "None";
        //     oData.quantityValueStateText = "";
        //     oData.priceValueState = "None";
        //     oData.priceValueStateText = "";
        
        //     // Validate Product
        //     if (!oData.product) {
        //         oData.productValueState = "Error";
        //         oData.productValueStateText = "Product is required";
        //         isValid = false;
        //     }
        
        //     // Validate Quantity
        //     if (!oData.quantity) {
        //         oData.quantityValueState = "Error";
        //         oData.quantityValueStateText = "Quantity is required";
        //         isValid = false;
        //     } else if (parseInt(oData.quantity) <= 0) {
        //         oData.quantityValueState = "Error";
        //         oData.quantityValueStateText = "Quantity must be greater than 0";
        //         isValid = false;
        //     }
        
        //     // Validate Price
        //     if (!oData.price) {
        //         oData.priceValueState = "Error";
        //         oData.priceValueStateText = "Price is required";
        //         isValid = false;
        //     } else if (parseFloat(oData.price) <= 0) {
        //         oData.priceValueState = "Error";
        //         oData.priceValueStateText = "Price must be greater than 0";
        //         isValid = false;
        //     }
        
        //     // Update the model after validation
        //     oFormModel.setData(oData);
        
        //     if (!isValid) {
        //         sap.m.MessageToast.show("Please fill all required fields correctly.");
        //         return;
        //     }
        
        //     // Prepare Payload
        //     var oPayload = {
        //         product: oData.product,
        //         quantity: parseInt(oData.quantity),
        //         price: parseFloat(oData.price)
        //     };
        
        //     // Get OrderId from Router
        //     //var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        //     //var sOrderId = oRouter._oCurrentMatchedRoute.arguments.orderId;
        
        //     var that = this;
        
        //     oModel.create("/Order('" + this._sOrderId + "')/orderItem", oPayload, {
        //         success: function () {
        //             sap.m.MessageToast.show("Order Item added successfully!");
        
        //             // Reset the form model
        //             oFormModel.setData({
        //                 product: "",
        //                 productValueState: "None",
        //                 productValueStateText: "",
        //                 quantity: "",
        //                 quantityValueState: "None",
        //                 quantityValueStateText: "",
        //                 price: "",
        //                 priceValueState: "None",
        //                 priceValueStateText: ""
        //             });
        //             that.onRead();
        //             that._createOrderItemDialog.close();
                    
        //         },
        //         error: function (oError) {
        //             sap.m.MessageBox.error("Failed to add Order Item!", {
        //                 title: "Error",
        //                 onClose: function () {
        //                     console.error(oError);
        //                 }
        //             });
        //         }
        //     });
        // },
        // onCancelOrderItem: function(){
        //     this._createOrderItemDialog.close();
        // },
        onNavBack: function(){
            var oFCL=this.getView().getParent().getParent();
            oFCL.setLayout(sap.f.LayoutType.OneColumn);
            var oRouter=this.getOwnerComponent().getRouter();
            oRouter.navTo("order",{
                customerId:this._customerId,
                customerName:this._customerName
            });

        }
        
  });
});
