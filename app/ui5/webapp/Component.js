sap.ui.define([
    "sap/ui/core/UIComponent",
    "ui5/model/models",
    "sap/m/MessageBox",
], (UIComponent, models,MessageBox) => {
    "use strict";

    return UIComponent.extend("ui5.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
            const oModel = this.getModel();
            this._checkUserRole(oModel);
        },

        _checkUserRole: function (oModel) {
            
            oModel.callFunction("/isAdmin", {
                method: "GET",
                success: function (oData) {
                    let oUserModel = new sap.ui.model.json.JSONModel();
                    if (oData.isAdmin.role=== 'Customer') {
                        console.log("Customer")
                        const customerId = oData.isAdmin.ID;
                        const customerName = oData.isAdmin.name;

                        oUserModel.setData({ role: "Customer" });
                        this.setModel(oUserModel, "userModel");
        
                        this.getRouter().navTo("order", {
                            customerId:customerId,
                            customerName: customerName
                        });
                    } else if (oData.isAdmin.role=== 'Admin') {
                        oUserModel.setData({ role: "Admin" });
                        this.setModel(oUserModel, "userModel");
                
                        this.getRouter().navTo("TargetadminDashboard");
                    } else if(oData.isAdmin.role=== 'DeliveryAgent') {
                        this.getRouter().navTo("delivery");
                    }
                }.bind(this),
                error: function () {
                    MessageBox.error("Error while checking user role.");
                }
            });
        },
        
    });
});