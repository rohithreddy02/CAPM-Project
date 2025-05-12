sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/f/library",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/date/UI5Date"
  ], function (Controller,JSONModel,Fragment,MessageToast,MessageBox,fioriLibrary,DateFormat,UI5Date) {
    "use strict";
  
    return Controller.extend("ui5.controller.order", {

        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("order").attachPatternMatched(this._onRouteMatched, this);
            var oNewOrderEntryModel = new JSONModel({
                ID:"",
                Date:null,
                Customer_ID:"",
                headerText:"Customer"

            });
            this.getView().setModel(oNewOrderEntryModel, "newOrder");
            
            
        },
        _onRouteMatched: function (oEvent) {
            this._customerId = oEvent.getParameter("arguments").customerId;
            this._customerName = oEvent.getParameter("arguments").customerName;

            var oViewModel = this.getView().getModel("newOrder");
            oViewModel.setProperty("/headerText", this._customerName );

            var oFCL=this.getView().getParent().getParent();
            oFCL.setLayout(sap.f.LayoutType.OneColumn);
        
            var oTable = this.byId("orderTable");
            var oBinding = oTable.getBinding("items");
        
            if (oBinding) {
                var oFilter = new sap.ui.model.Filter("customer_ID", "EQ", this._customerId);
                var oSorter = new sap.ui.model.Sorter("date", true);
                oBinding.filter([oFilter]);
                oBinding.sort([oSorter]);
            }
        },
        
        // onCreateOrder: function(){
        //     var oView = this.getView();

        //     if (!this._oCreateOrderDialog) {
        //         Fragment.load({
        //             id: oView.getId(),
        //             name: "ui5.view.fragments.createOrder",
        //             controller: this
        //         }).then(function (oDialog) {
        //             oView.addDependent(oDialog);
        //             this._oCreateOrderDialog = oDialog;
        //             this._oCreateOrderDialog.open();
        //         }.bind(this));
        //     } else {
        //         this._oCreateOrderDialog.open();
        //     }

        // },
        // onSaveOrder: function () {
           
        //     var oModel = this.getView().getModel();
        //     var oNewOrderData = this.getView().getModel("newOrder").getData();
            
        //     //let formattedDate = DateFormat.getDateInstance({style: "long"}).format(UI5Date.getInstance());
            
        //     var oPayload = {
        //          date: new Date(),
        //         //date: formattedDate,
        //         customer_ID:this._customerId   ,
        //         orderItem: [{
        //             product: oNewOrderData.Product,
        //             quantity: oNewOrderData.Quantity,
        //             price: oNewOrderData.Price
        //         }]
        //     };

        //     var that=this;
        //     oModel.create("/Order", oPayload, {
        //         urlParameters: {
        //             "$expand": "orderItem"  
        //         },
        //         success: function (oData) {
        //             MessageToast.show("Order created successfully");
        //             var oNewOrderModel = that.getView().getModel("newOrder");
        //             var oCurrentData = oNewOrderModel.getData();

        //             oNewOrderModel.setData({
        //                 ...oCurrentData,
        //                 Product: "",
        //                 Quantity: "",
        //                 Price: ""
        //             });

        //             that._oCreateOrderDialog.close();
        //         },
        //         error: function (oError) {
        //             MessageToast.show("Error while creating order");
        //             console.error(oError);
        //         }
        //     });
        // },

        onCreateOrder: function () {
            var oView = this.getView();
        
            if (!this._oCreateOrderDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "ui5.view.fragments.createOrder",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    this._oCreateOrderDialog = oDialog;
                    this._oCreateOrderDialog.open();
                }.bind(this));
            } else {
                this._oCreateOrderDialog.open();
            }
        },
        validateOrderInputs: function (oNewOrderData, oModel) {
            var bValid = true;
        

            if (!oNewOrderData.product || oNewOrderData.product.trim() === "") {
                oNewOrderData.ProductValueState = "Error";
                oNewOrderData.ProductValueStateText = "Product name cannot be empty.";
                bValid = false;
            } else {
                oNewOrderData.ProductValueState = "None";
                oNewOrderData.ProductValueStateText = "";
            }
        

            if (oNewOrderData.quantity === undefined || oNewOrderData.quantity === null || isNaN(oNewOrderData.quantity) || oNewOrderData.quantity <= 0) {
                oNewOrderData.QuantityValueState = "Error";
                oNewOrderData.QuantityValueStateText = "Enter a valid quantity greater than 0.";
                bValid = false;
            } else {
                oNewOrderData.QuantityValueState = "None";
                oNewOrderData.QuantityValueStateText = "";
            }
        

            if (oNewOrderData.price === undefined || oNewOrderData.price === null || isNaN(oNewOrderData.price) || oNewOrderData.price <= 0) {
                oNewOrderData.PriceValueState = "Error";
                oNewOrderData.PriceValueStateText = "Enter a valid price greater than 0.";
                bValid = false;
            } else {
                oNewOrderData.PriceValueState = "None";
                oNewOrderData.PriceValueStateText = "";
            }
        
            oModel.setData(oNewOrderData); 
            return bValid;
        },
        
        
        onAddItem: function () {
            var oModel = this.getView().getModel("newOrder");
            var oNewOrderData = oModel.getData();
        
            if (!this.validateOrderInputs(oNewOrderData, oModel)) {
                return MessageToast.show("Failed to add item.");
            }
        
            if (!oNewOrderData.OrderItems) {
                oNewOrderData.OrderItems = [];
            }
        
            var newOrderItem = {
                product: oNewOrderData.product,
                quantity: oNewOrderData.quantity,
                price: oNewOrderData.price
            };
        
            oNewOrderData.OrderItems.push(newOrderItem);
        
            oNewOrderData.product = "";
            oNewOrderData.quantity = "";
            oNewOrderData.price = "";
            oNewOrderData.ProductValueState = "None";
            oNewOrderData.ProductValueStateText = "";
            oNewOrderData.QuantityValueState = "None";
            oNewOrderData.QuantityValueStateText = "";
            oNewOrderData.PriceValueState = "None";
            oNewOrderData.PriceValueStateText = "";
        
            oModel.setData(oNewOrderData);
        },
        
        
        onDeleteItem: function (oEvent) {
            var oModel = this.getView().getModel("newOrder");
            var oNewOrderData = oModel.getData();
        
            var oItem = oEvent.getSource(); 
            var sPath = oItem.getBindingContext("newOrder").getPath();
            var iIndex = sPath.split("/").pop();
            
            MessageBox.confirm("Are you sure you want to delete this item?", {
                title: "Delete Item",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        
                        oNewOrderData.OrderItems.splice(iIndex, 1);
                        oModel.setData(oNewOrderData);
                        MessageToast.show("Item deleted successfully");
                    }
                }
            });
        },
        
        onSaveOrder: function () {
            var oModel = this.getView().getModel();
            var oNewOrderModel = this.getView().getModel("newOrder");
            var oNewOrderData = oNewOrderModel.getData();
        
            if (oNewOrderData.product || oNewOrderData.quantity || oNewOrderData.price) {
                if (!this.validateOrderInputs(oNewOrderData, oNewOrderModel)) {
                    return MessageToast.show("Please correct the errors before saving.");
                }
        
                if (!oNewOrderData.OrderItems) {
                    oNewOrderData.OrderItems = [];
                }
        
                var newOrderItem = {
                    product: oNewOrderData.product,
                    quantity: oNewOrderData.quantity,
                    price: oNewOrderData.price
                };
        
                oNewOrderData.OrderItems.push(newOrderItem);
        
                oNewOrderData.product = "";
                oNewOrderData.quantity = "";
                oNewOrderData.price = "";
                oNewOrderData.ProductValueState = "None";
                oNewOrderData.ProductValueStateText = "";
                oNewOrderData.QuantityValueState = "None";
                oNewOrderData.QuantityValueStateText = "";
                oNewOrderData.PriceValueState = "None";
                oNewOrderData.PriceValueStateText = "";
        
                oNewOrderModel.setData(oNewOrderData);
            }
        
            var oPayload = {
                date: new Date(),
                customer_ID: this._customerId,
                orderItem: oNewOrderData.OrderItems
            };
        
            var that = this;
            oModel.create("/Order", oPayload, {
                urlParameters: { "$expand": "orderItem" },
                success: function () {
                    MessageToast.show("Order created successfully");
                    oNewOrderModel.setData({
                        product: "",
                        quantity: "",
                        price: "",
                        OrderItems: []
                    });
                    that._oCreateOrderDialog.close();
                },
                error: function (oError) {
                    MessageToast.show("Error while creating order");
                    console.error(oError);
                }
            });
        },
        
        onCancelOrder: function () {
            var oNewOrderModel = this.getView().getModel("newOrder");
            var oCurrentData = oNewOrderModel.getData();

   
            oNewOrderModel.setData({
                ...oCurrentData,
                product: "",
                quantity: "",
                price: "",
                OrderItems: [] 
            });
            
            this._oCreateOrderDialog.close();
        },
        onDeleteOrder: function (oEvent) {
            const oListItem = oEvent.getParameter("listItem");
            const oBindingContext = oListItem.getBindingContext();
            const oModel = this.getView().getModel();
        
            const sId = oModel.getProperty(oBindingContext.getPath() + "/ID");
            const sPath = `/Order/${sId}`;
        
            sap.m.MessageBox.confirm(
                `Are you sure you want to delete Order ?`,
                {
                    title: "Confirm Deletion",
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            oModel.remove(sPath, {
                                success: function () {
                                    sap.m.MessageToast.show("Order deleted successfully.");
                                },
                                error: function () {
                                    sap.m.MessageBox.error("Failed to delete the order.");
                                }
                            });
                        }
                    }
                }
            );
        },              
        onShowOrderItem: function (oEvent) {
  
            var oContext = oEvent.getSource().getBindingContext();
            var sOrderId = oContext.getProperty("ID"); 

            var oFCL = this.getView().getParent().getParent();
			oFCL.setLayout(sap.f.LayoutType.TwoColumnsMidExpanded);
    
          
            this.getOwnerComponent().getRouter().navTo("orderItem", {
                customerId:this._customerId,
                customerName:this._customerName,
                orderId: sOrderId
            });
        },
        onNavBack: function () {
            var oFCL = this.getView().getParent().getParent(); 
            oFCL.setLayout(sap.f.LayoutType.OneColumn);
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteadminDashboard");
        }

    });
  });
  