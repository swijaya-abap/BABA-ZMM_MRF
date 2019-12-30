sap.ui.define([
	//	"com/babaZMM_MRFINV/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"com/babaZMM_MRFINV/model/function",
	"com/babaZMM_MRFINV/model/formatter"
], function(Controller, JSONModel, functions, formatter) {
	"use strict";

	return Controller.extend("com.babaZMM_MRFINV.controller.Main", {

		formatter: formatter,

		onInit: function() {
			var oModel = new JSONModel();
			var oTable = this.getView().byId("tab");
			oTable.setModel(oModel);

			this.byId("DATE").setDateValue(new Date());
		},

		onRefresh: function(oControlEvent) {
			this.onGet(oControlEvent);
		},

		onBusyS: function(oBusy) {
			oBusy.open();
			oBusy.setBusyIndicatorDelay(40000);
		},

		onBusyE: function(oBusy) {
			oBusy.close();
		},

		onPress: function(oEvent) {
			var oItem = oEvent.getSource();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			var MAT = oItem.getBindingContext().getProperty("MATNR") + "-" + oItem.getBindingContext().getProperty("MAKTX");
			var NOWT = oItem.getBindingContext().getProperty("NOWT");

			oRouter.navTo("View", {
				objectId: oItem.getBindingContext().getProperty("VBELN"),
				objectLn: oItem.getBindingContext().getProperty("POSNR"),
				objectMat: MAT,
				objectNowt: NOWT
			});
		},

		onText: function(oControlEvent) {
			var that = this;

			var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZMMO_MIGO_SRV/", true);
			var oEntry = {};
			oEntry.VBELN = that.getView().byId("INVDELV").getValue();
			oEntry.HTEXT1 = that.getView().byId("HTEXT1").getValue();
			oEntry.HTEXT2 = that.getView().byId("HTEXT2").getValue();

			var sVal = "/TEXTSet";
			oModel1.create(sVal, oEntry, {
				success: function(oData, oResponse) {
					sap.m.MessageToast.show("Text Updated");
				},
				error: function(oResponse) {
					var oMsg = JSON.parse(oResponse.responseText);
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageToast.show(oMsg.error.message.value);
				}
			});
		},

		onGet: function(oControlEvent) {
			var that = this;
			var LIFNRV, EBELNV, BOLNRV, SIGNIV, HTEXT1, HTEXT2;
			var oValue = that.getView().byId("INVDELV")._lastValue;

			if (oValue === "") {
				sap.m.MessageToast.show("Please provide Inbound Delivery No");
			} else {

				// //************************set blank values to table*******************************************//
				var oModel = that.getView().byId("tab").getModel();
				functions.blank(oModel);

				// //************************get values from backend based on filter Date*******************************************//
				var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZMMO_MIGO_SRV/", true);
				that.getView().setModel(oModel1);
				var itemData = oModel.getProperty("/data");

				// //************************filter Date*******************************************//
				var PLFilters = [];
				PLFilters.push(new sap.ui.model.Filter({
					path: "VBELN",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oValue
				}));

				var oBusy = new sap.m.BusyDialog();
				that.onBusyS(oBusy);

				oModel1.read("/INVDETSet", {
					filters: PLFilters,
					success: function(oData, oResponse) {
						var res = [];
						res = oData.results;

						if (res.length > 0) {
							for (var iRowIndex = 0; iRowIndex < res.length; iRowIndex++) {
								var itemRow = {
									VBELN: res[iRowIndex].VBELN,
									POSNR: res[iRowIndex].POSNR,
									MATNR: res[iRowIndex].MATNR,
									MAKTX: res[iRowIndex].MAKTX,
									NTGEW: res[iRowIndex].NTGEW,
									ONTGEW: res[iRowIndex].ONTGEW,
									GEWEI: res[iRowIndex].GEWEI,
									CHARG: res[iRowIndex].CHARG,
									NOWT: res[iRowIndex].NOWT,
									SIGNI: res[iRowIndex].SIGNI
								};

								if (typeof itemData !== "undefined" && itemData.length > 0) {
									itemData.push(itemRow);
								} else {
									itemData = [];
									itemData.push(itemRow);
								}
								if (iRowIndex === 0) {
									LIFNRV = res[iRowIndex].NAME1;
									BOLNRV = res[iRowIndex].BOLNR;
									EBELNV = res[iRowIndex].EBELN;
									SIGNIV = res[iRowIndex].SIGNI;
									HTEXT1 = res[iRowIndex].HTEXT1;
									HTEXT2 = res[iRowIndex].HTEXT2;

									that.getView().byId("LIFNRV").setText(LIFNRV);
									that.getView().byId("BOLNRV").setText(BOLNRV);
									that.getView().byId("EBELNV").setText(EBELNV);
									that.getView().byId("SIGNIV").setText(SIGNIV);
									that.getView().byId("HTEXT1").setValue(HTEXT1);
									that.getView().byId("HTEXT2").setValue(HTEXT2);
								}
							}
						}

						// // Set Model
						oModel.setData({
							data: itemData
						});

						oModel.refresh(true);

						//************************get values from backend based on filter Date*******************************************//
						that.onBusyE(oBusy);

					},
					error: function(oResponse) {
						that.onBusyE(oBusy);
						var oMsg = JSON.parse(oResponse.responseText);
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageToast.show(oMsg.error.message.value);
					}
				});

			}
		},

		onSave: function(oControlEvent) {
			var that = this;
			var oTable = that.getView().byId("tab");
			// Get the table Model
			var oModel = oTable.getModel();
			// Get Items of the Table
			var aItems = oTable.getItems(oModel); //All rows

			if (aItems.length > 0) {
				for (var i = 0; i < aItems.length; i++) {
					var l_charg = aItems[i].getCells()[5].getText();
					var l_netgw = aItems[i].getCells()[4].getNumber();
					var val = Number(l_netgw);
					
					if (l_charg === "" || ( val === 0 || val < 0 ) ) {
						var oFlg = "X";
						var line = aItems[i].getCells()[1].getText();
						break;
					}
				}

				if (oFlg === "X") {
					var oMsg = "Line Item " + line + " don't have assigned batch or don't have valid Final Weight";
					sap.m.MessageToast.show(oMsg);
				} else {
					var oBusy = new sap.m.BusyDialog();
					that.onBusyS(oBusy);

					var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZMMO_MIGO_SRV/", true);
					oModel1.setUseBatch(true);

					// return back from SAP-Backend to Firoi and show success or error
					var mParameters = {
						success: function(oEntry, oResponse) {
							that.onBusyE(oBusy);
						},
						error: function(oResponse) {
							that.onBusyE(oBusy);
							var oMsg = JSON.parse(oResponse.responseText);
							var oSev = oMsg.error.innererror.errordetails[0].severity;
							if (oSev === "success") {
								that.getView().byId("INVDELV").setValue();
								that.getView().byId("LIFNRV").setText();
								that.getView().byId("BOLNRV").setText();
								that.getView().byId("EBELNV").setText();
								that.getView().byId("SIGNIV").setText();
								that.getView().byId("HTEXT1").setValue();
								that.getView().byId("HTEXT2").setValue();
								functions.blank(oModel);
							}
							jQuery.sap.require("sap.m.MessageBox");
							sap.m.MessageToast.show(oMsg.error.message.value);

						}
					};

					var l_htext1 = that.getView().byId("HTEXT1").getValue();
					var l_htext2 = that.getView().byId("HTEXT2").getValue();
					var l_date   = this._convertDateToSAP(that.getView().byId("DATE").getValue());

					for (var iRowIndex = 0; iRowIndex < aItems.length; iRowIndex++) {
						var l_vbeln = aItems[iRowIndex].getCells()[0].getText();
						var l_posnr = aItems[iRowIndex].getCells()[1].getText();

						var oEntry = {};
						oEntry.VBELN = l_vbeln;
						oEntry.POSNR = l_posnr;
						oEntry.HTEXT1 = l_htext1;
						oEntry.HTEXT2 = l_htext2;
						oEntry.WADAT_IST = l_date;

						var sVal = "/INVDETSet";

						///////////
						mParameters.changeSetId = "changeset";
						oModel1.create(sVal, oEntry, mParameters);
						////////////

					} //end of for

					//Finally, submit all the batch changes 
					oModel1.submitChanges({
						chageSetId: mParameters,
						success: function() {},
						error: function() {}
					});
				}
			}
		}

		_convertDateToSAP: function (e) {
			var t = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd.MM.yyyy"
			});
			return t.format(new Date(e))
		},

		///////////////////////////
	});
});