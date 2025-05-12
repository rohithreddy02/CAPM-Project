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
                    if (oData.results.length === 1) {
                    
                        const customerId = oData.results[0].ID;
                        const customerName = oData.results[0].NAME;
        
                        this.getRouter().navTo("order", {
                            customerId:customerId,
                            customerName: customerName
                        });
                    } else if (oData.results.length > 1) {
                
                        this.getRouter().navTo("TargetadminDashboard");
                    } else {
                        MessageBox.error("Unexpected response or empty user data.");
                    }
                }.bind(this),
                error: function () {
                    MessageBox.error("Error while checking user role.");
                }
            });
        }
        
        

    });
});