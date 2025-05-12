sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/f/library",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/FilterOperator" 
  ], function (Controller, Fragment, fioriLibrary, MessageToast,JSONModel,FilterOperator) {
    "use strict";
  
    return Controller.extend("ui5.controller.delivery", {
  
      onInit: function () {
        this.onRead();
      },
      onRead: function () {
        var oModel = this.getOwnerComponent().getModel();
  
        oModel.read("/Order", {
            urlParameters: {
                "$filter": "status eq 'Shipped' "
            },
          success: function (oData) {
            var oJSONModel = new JSONModel(oData.results);
            this.getView().setModel(oJSONModel, "data");
          }.bind(this),
          error: function () {
            MessageToast.show("Failed to fetch order data");
          }
        });
      },
      onSearchOrder: function(oEvent){
        console.log("search");
        var sQuery=oEvent.getParameter("newValue");
        var oList=this.byId("orderList");
        var oBinding=oList.getBinding("items");
        if(sQuery && sQuery.length>0){
          const aFileds=["ID"];
          const aFilters=aFileds.map(field => 
            new sap.ui.model.Filter({
              path: field,
              operator: FilterOperator.Contains,
              value1: sQuery,
              caseSensitive: false 
            })
          );
          const oCombinedFilter=new sap.ui.model.Filter(aFilters,false);
          oBinding.filter([oCombinedFilter]);
        }
        else{
          oBinding.filter([]);
        }

      },
      onMarkDelivered: function (oEvent) {
        const oButton = oEvent.getSource();
        const oContext = oButton.getBindingContext("data"); 
        const oModel = this.getView().getModel(); 
        const oOrderData = oContext.getObject();
        const sOrderID = oOrderData.ID; 
      
        const oUpdatedData = {
          status: "Delivered"
        };
      
       
        const sUpdatePath = "/Order('" + sOrderID + "')";
        var that=this;
      
        oModel.update(sUpdatePath, oUpdatedData, {
          success: function () {
            sap.m.MessageBox.success("Order Delivered", {
                title: "Success", 
                onClose: function() {
                  that.onRead(); 
                }
              });
          },
          error: function () {
            sap.m.MessageBox.error("Failed to update the order", {
                title: "Error", 
                onClose: function() {
                  
                }
            });
          }
        });
      }
      
      

  
    });
  });
  