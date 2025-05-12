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
                    console.log(oData);
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
        onCancelOrder: function () {
            var oModel = this.getOwnerComponent().getModel();  // Get OData model
            var sPath = "/Order('" + this._sOrderId + "')";  // The path to the order entity
        
            var oData = {
                status: "Cancelled"  // Update status to 'Cancelled'
            };
        
            // Call OData update
            oModel.update(sPath, oData, {
                success: function () {
                    sap.m.MessageToast.show("Order has been cancelled.");
                    // Optionally, navigate back after successful update
                    this.onNavBack();
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageToast.show("Failed to cancel the order.");
                    console.error(oError);
                }
            });
        }, 
        onUpdateStatus: function () {
            var oView = this.getView();
        
            if (!this._oUpdateStatusDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "ui5.view.fragments.updateOrderStatus", // path to your fragment file
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    this._oUpdateStatusDialog = oDialog;
        
                    // Set initial model data (selectedStatus)
                    var oModel = new sap.ui.model.json.JSONModel({
                        selectedStatus: this.getView().getModel("order").getProperty("/status") || "Pending"
                    });
                    this._oUpdateStatusDialog.setModel(oModel);
        
                    this._oUpdateStatusDialog.open();
                }.bind(this));
            } else {
                // Update selectedStatus if needed before reopening
                var oStatus = this.getView().getModel("order").getProperty("/status") || "Pending";
                this._oUpdateStatusDialog.getModel().setProperty("/selectedStatus", oStatus);
                this._oUpdateStatusDialog.open();
            }
        },
        onUpdateOrderStatusSave: function () {
            var oDialog = this._oUpdateStatusDialog;
            var oModel = this.getOwnerComponent().getModel(); // main OData model
            var selectedStatus = oDialog.getModel().getProperty("/selectedStatus");
        
            var sPath = "/Order('" + this._sOrderId + "')";
            var oPayload = {
                status: selectedStatus
            };
        
            oModel.update(sPath, oPayload, {
                success: function () {
                    sap.m.MessageToast.show("Order status updated to " + selectedStatus);
                    oDialog.close();
                    // Refresh the data
                    this._onRouteMatched({ getParameter: () => ({ orderId: this._sOrderId, customerId: this._customerId, customerName: this._customerName }) });
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error("Failed to update order status.");
                    console.error(oError);
                }
            });
        },
        
        onUpdateOrderStatusCancel: function () {
            if (this._oUpdateStatusDialog) {
                this._oUpdateStatusDialog.close();
            }
        },                     

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
