sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel", 
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/FilterOperator",
    "sap/f/library"
], (Controller,JSONModel,ODataModel,MessageToast,MessageBox,Fragment,FilterOperator,fioriLibrary) => {
    "use strict";

    return Controller.extend("ui5.controller.adminDashboard", {
        onRead: function () {
            var oModel=this.getOwnerComponent().getModel();

            oModel.read("/Customer", {
                success: function (oData) {
                    var oJSONModel = new JSONModel(oData);
                    this.getView().setModel(oJSONModel, "Customer");
                }.bind(this),
                error: function () {
                    MessageToast.show("Failed to fetch data");
                }
            });
        },
        onInit() {
            this.onRead();
            
            var oNewEntryModel = new JSONModel({
                ID: "",
                Name: "",
                Email: "",
                ContactNumber: "",
                headerText: "",
                totalOrders: "",
                avgOrderValue:"",
                ordersDelivered:"",
                pendingOrders:""
            });
            this.getView().setModel(oNewEntryModel, "NewCustomer");
            this.groupOfFunctions();
            

        },

        groupOfFunctions: function(){
            this.updateCount();
            this.updateTotalOrders();
            this.updateAvgerageOrderValue();
            this.updateOrdersDelivered();
            this.updatePendingOrders();
        },

        updateOrdersDelivered: function(){
            var oViewModel = this.getView().getModel("NewCustomer");
            var oModel=this.getOwnerComponent().getModel();

            oModel.read("/Order", {
                urlParameters: {
                    "$filter": "status eq 'Delivered' "
                },
                success: function(data){
                    console.log(data);
                    oViewModel.setProperty("/ordersDelivered",data.results.length);
                },
                error: function(data){
                    console.error("Failed to get Orders Delivered count",error);
                }
            })
        },
        updatePendingOrders: function(){
            var oViewModel=this.getView().getModel("NewCustomer");
            var oModel=this.getOwnerComponent().getModel();

            oModel.read("/Order",{
                urlParameters: {
                    "$filter": "status eq 'Confirmed' or status eq 'Shipped' or status eq 'Packed'"
                },
                success: function(data){
                    console.log(data);
                    oViewModel.setProperty("/pendingOrders",data.results.length)
                },
                error: function(data){
                    console.error("Failed to get Pending Orders count", error);
                }
            })
        },
        updateCount: function () {
            var oViewModel = this.getView().getModel("NewCustomer");
            var oModel=this.getOwnerComponent().getModel();
            
            oModel.read("/Customer/$count", {
                
                success: function (data) {
                    //console.log(data)
                    oViewModel.setProperty("/headerText", data);
                },
                error: function (err) {
                    console.error("Failed to get Customer count", err);
                }
            });
        },
        updateTotalOrders: function(){
            var oViewModel = this.getView().getModel("NewCustomer");
            var oModel=this.getOwnerComponent().getModel();
            
            oModel.read("/Order/$count", {
                urlParameters: {
                    "$filter": "status ne 'Cancelled' "
                },
                success: function (data) {
                    //console.log(data)
                    oViewModel.setProperty("/totalOrders", data);
                },
                error: function (err) {
                    console.error("Failed to get Order count", err);
                }
            });

        },
        
        updateAvgerageOrderValue: function(){
            var oViewModel=this.getView().getModel("NewCustomer");
            var oModel=this.getOwnerComponent().getModel();

            oModel.read("/Order",{
                urlParameters: {
                    "$filter": "status ne 'Cancelled' "
                },

                success: function(data){
                    //console.log(data);
                    var results = data.results;

                    if (results.length === 0) {
                        console.log("No orders found.");
                        return;
                    }

                    var totalSum = results.reduce(function (acc, order) {
                        return acc + order.TOTALPRICE;
                    }, 0);

                    var average = totalSum / results.length;

                    //console.log("Average Order Value:", average);
                    oViewModel.setProperty("/avgOrderValue", average);
                },
                error: function(){

                }
            })

        },
        onSearch: function(oEvent){
            var sQuery=oEvent.getParameter("newValue");
            var oTable=this.byId("customerTable");
            var oBinding=oTable.getBinding("items");

            if(sQuery && sQuery.length >0){
                const aFields=["name","email","contactNumber"];
                const aFilters=aFields.map(field => 
                    new sap.ui.model.Filter({
                        path: field,
                        operator: FilterOperator.Contains,
                        value1: sQuery,
                        caseSensitive: false
                    })
                );
                const oCombinedFilter = new sap.ui.model.Filter(aFilters,false);
                oBinding.filter([oCombinedFilter]);
            }
            else{
                oBinding.filter([]);
            }
        },
        onCreate: function () {
            var oView = this.getView();

            if (!this._oCreateCustomerDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "ui5.view.fragments.createCustomer",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    this._oCreateCustomerDialog = oDialog;
                    this._oCreateCustomerDialog.open();
                }.bind(this));
            } else {
                this._oCreateCustomerDialog.open();
            }
        },
        onSave: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oNewEntryModel = this.getView().getModel("NewCustomer");
            var oData = oNewEntryModel.getData();
        
            var isValid = true;
            oData.NameValueState = "None";
            oData.NameValueStateText = "";
            oData.EmailValueState = "None";
            oData.EmailValueStateText = "";
            oData.ContactNumberValueState = "None";
            oData.ContactNumberValueStateText = "";
            if (!oData.Name) {
                oData.NameValueState = "Error";
                oData.NameValueStateText = "Name is required";
                isValid = false;
            }
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!oData.Email) {
                oData.EmailValueState = "Error";
                oData.EmailValueStateText = "Email is required";
                isValid = false;
            }
            else if(!emailRegex.test(oData.Email)){
                oData.EmailValueState = "Error";
                oData.EmailValueStateText = "Enter a valid Email";
                isValid = false;
            }
             var phoneRegex = /^\d{10}$/;
            if (!oData.ContactNumber) {
                oData.ContactNumberValueState = "Error";
                oData.ContactNumberValueStateText = "Contact Number is required";
                isValid = false;
            } else if (!phoneRegex.test(oData.ContactNumber)) {
                oData.ContactNumberValueState = "Error";
                oData.ContactNumberValueStateText = "Enter a valid 10-digit number";
                isValid = false;
            }
        
            oNewEntryModel.setData(oData);
        
            if (!isValid) {
                sap.m.MessageToast.show("Please fill in all required fields.");
                return;
            }
        
            var oPayload = {
                name: oData.Name,
                email: oData.Email,
                contactNumber: oData.ContactNumber
            };
        
            var that = this;
            oModel.create("/Customer", oPayload, {
                success: function () {
                    MessageToast.show("Customer created successfully!");
        
                    oNewEntryModel.setData({
                        Name: "",
                        NameValueState: "None",
                        NameValueStateText: "",
                        Email: "",
                        EmailValueState: "None",
                        EmailValueStateText: "",
                        ContactNumber: "",
                        ContactNumberValueState: "None",
                        ContactNumberValueStateText: ""
                    });
                    that.groupOfFunctions();
        
                    that._oCreateCustomerDialog.close();
                },
                error: function (oError) {
                    sap.m.MessageBox.error("Failed to create customer!", {
                        title: "Error",
                        onClose: function () {
                            console.error(oError);
                        }
                    });
                }
            });
            
        },
        onCancel: function (oEvent) {
            var oNewEntryModel = this.getView().getModel("NewCustomer");
            oNewEntryModel.setData({
                Name: "",
                NameValueState: "None",
                NameValueStateText: "",
                Company: "",
                CompanyValueState: "None",
                CompanyValueStateText: "",
                Email: "",
                EmailValueState: "None",
                EmailValueStateText: "",
                ContactNumber: "",
                ContactNumberValueState: "None",
                ContactNumberValueStateText: ""
            });
            oEvent.getSource().getParent().close();
        },
        onUpdate: function () {
            var oTable = this.getView().byId("customerTable");
            var oSelectedItem = oTable.getSelectedItem();
    

            if (!oSelectedItem) {
                MessageToast.show("Please select an customer to update");
                return;
            }

            var oSelectedData = oSelectedItem.getBindingContext().getObject();
            console.log(oSelectedData);
            var oNewEntryModel = new sap.ui.model.json.JSONModel(oSelectedData);
            console.log(oNewEntryModel);
            this.getOwnerComponent().setModel(oNewEntryModel, "NewUpdatedCustomer");

            var oView = this.getView();
            if (!this._oUpdateDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "ui5.view.fragments.updateCustomer",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    this._oUpdateDialog = oDialog;
                    this._oUpdateDialog.open();
                }.bind(this));
            } else {
                this._oUpdateDialog.open();
            }
        },
        onUpdateSave: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oUpdatedEntryModel = this.getView().getModel("NewUpdatedCustomer");
            var oData = oUpdatedEntryModel.getData();
        
            var isValid = true;
        
            oData.NameValueState = "None";
            oData.NameValueStateText = "";
            oData.EmailValueState = "None";
            oData.EmailValueStateText = "";
            oData.ContactNumberValueState = "None";
            oData.ContactNumberValueStateText = "";
        

            if (!oData.name) {
                oData.NameValueState = "Error";
                oData.NameValueStateText = "Name is required";
                isValid = false;
            }
        
 
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!oData.email) {
                oData.EmailValueState = "Error";
                oData.EmailValueStateText = "Email is required";
                isValid = false;
            } else if (!emailRegex.test(oData.email)) {
                oData.EmailValueState = "Error";
                oData.EmailValueStateText = "Enter a valid Email";
                isValid = false;
            }
        

            var phoneRegex = /^\d{10}$/;
            if (!oData.contactNumber) {
                oData.ContactNumberValueState = "Error";
                oData.ContactNumberValueStateText = "Contact Number is required";
                isValid = false;
            } else if (!phoneRegex.test(oData.contactNumber)) {
                oData.ContactNumberValueState = "Error";
                oData.ContactNumberValueStateText = "Enter a valid 10-digit number";
                isValid = false;
            }
        
 
            oUpdatedEntryModel.setData(oData);
        
            if (!isValid) {
                sap.m.MessageToast.show("Please fill in all required fields correctly.");
                return;
            }
        

            if (!oData.ID) {
                sap.m.MessageToast.show("Missing Customer ID.");
                return;
            }
        
            var oPayload = {
                name: oData.name,
                email: oData.email,
                contactNumber: oData.contactNumber
            };
        
            var sPath = "/Customer(" + oData.ID + ")";
            var that = this;
        
            oModel.update(sPath, oPayload, {
                success: function () {
                    MessageToast.show("Customer updated successfully!");
                    that.groupOfFunctions();
        
                    oUpdatedEntryModel.setData({
                        ID: "",
                        name: "",
                        NameValueState: "None",
                        NameValueStateText: "",
                        email: "",
                        EmailValueState: "None",
                        EmailValueStateText: "",
                        contactNumber: "",
                        ContactNumberValueState: "None",
                        ContactNumberValueStateText: ""
                    });
        
                    that._oUpdateDialog.close();
                },
                error: function (oError) {
                    var oResponse = oError.responseText ? JSON.parse(oError.responseText) : {};
                    var sMessage = (oResponse.error && oResponse.error.message && oResponse.error.message.value) || "Failed to update customer.";
        
                    sap.m.MessageBox.error(sMessage, {
                        title: "Update Failed",
                        onClose: function () {
                            console.error(oError);
                        }
                    });
                }
            });
        },
        
        onUpdateCancel: function () {
            this._oUpdateDialog.close();
        },

        onDelete: function () {
            var oTable = this.getView().byId("customerTable");
            var oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageToast.show("Please select an customer to delete.");
                return;
            }

            var oSelectedData=oSelectedItem.getBindingContext().getObject();
            var sID = oSelectedData.ID;
            var sPath = "/Customer(" + sID + ")";
            var oModel = this.getView().getModel();

            var that=this;

            MessageBox.confirm("Are you sure you want to delete customer ?", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        oModel.remove(sPath, {
                            success: function () {
                                that.groupOfFunctions();
                                MessageToast.show("Customer deleted successfully!");
                            },
                            error: function (oError) {
                                MessageBox.error("Delete failed. Check console for details.");
                                console.error("Delete Error:", oError);
                            }
                        });
                    }
                }
            });
        },
        onOrderView: function(oEvent){
            var oRouter=this.getOwnerComponent().getRouter();

            var oContext=oEvent.getSource().getBindingContext();
            var sCustomerId=oContext.getProperty("ID");
            var sCustomerName=oContext.getProperty("name");
            var oFCL = this.oView.getParent().getParent();
			oFCL.setLayout(fioriLibrary.LayoutType.OneColumn);
            oRouter.navTo("order",{
                customerId:sCustomerId,
                customerName:sCustomerName
            });
        }
        
    });
});