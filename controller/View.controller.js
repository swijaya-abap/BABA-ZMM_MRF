sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/babaZMM_MRFINV/model/function",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, History, functions, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("com.babaZMM_MRFINV.controller.View", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.babaZMM_MRFINV.view.View
		 */
		onInit: function () {
			var oModel = new JSONModel();
			this.getView().byId("tab").setModel(oModel);
			this.getView().byId("tab").getModel().setSizeLimit('500');

			var oMode2 = new JSONModel();
			this.getView().byId("oSelect1").setModel(oMode2); //added

			var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZMMO_MIGO_SRV/", true);
			this.getView().byId("BAGT").setModel(oModel1);

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("View").attachPatternMatched(this._onObjectMatched, this);
			this.oSearchField = this.getView().byId("BAGT");

		},

		_onObjectMatched: function (oEvent) {
			var that = this;
			var CHARG, VFDAT, BAGTYP, BRGEW, NTGEW, TFWT, TSWT, STNDWT, STNDTY, TFINWT, TBWT, MFRPN, TOTBAG = 0;
			var sObjectId = oEvent.getParameter("arguments").objectId;
			var sObjectLn = oEvent.getParameter("arguments").objectLn;
			var sObjectMat = oEvent.getParameter("arguments").objectMat;
			var sObjectNowt = oEvent.getParameter("arguments").objectNowt;

			if (sObjectNowt === "Y") {
				that.byId("tab").getColumns()[3].setVisible(false);

			} else if (sObjectNowt === "X") {
				that.byId("tab").getColumns()[3].setVisible(true);
			}

			//************************set blank values to table*******************************************//
			var oTable = that.getView().byId("tab");
			var oModel = oTable.getModel();

			functions.blank(oModel);
			//************************set blank values to table*******************************************//

			var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZMMO_MIGO_SRV/", true);
			// that.getView().setModel(oModel1); //not required as it overides getview model again
			var itemData = oModel.getProperty("/data");

			var oBusy = new sap.m.BusyDialog();
			that.onBusyS(oBusy);

			//************************filter HU*******************************************//
			var PLFilters = [];
			PLFilters.push(new sap.ui.model.Filter({
				path: "VBELN",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: sObjectId
			}));

			PLFilters.push(new sap.ui.model.Filter({
				path: "POSNR",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: sObjectLn
			}));

			var today = new Date();
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyMMdd"
			});

			var ovaluec = dateFormat.format(new Date(today)); //current date
			CHARG = ovaluec + "0000";

			oModel1.read("/INVDETHUSet", {
				filters: PLFilters,
				success: function (oData, oResponse) {
					var res = [];
					res = oData.results;

					if (res.length > 0) {
						for (var iRowIndex = 0; iRowIndex < res.length; iRowIndex++) {

							var itemRow = {
								VBELN: res[iRowIndex].VBELN,
								POSNR: res[iRowIndex].POSNR,
								PALLET: res[iRowIndex].PALLET,
								NOBAG: res[iRowIndex].NOBAG,
								FWEIGHT: res[iRowIndex].FWEIGHT,
								SWEIGHT: res[iRowIndex].SWEIGHT,
								BAGWT: res[iRowIndex].BAGWT,
								PWEIGHT: res[iRowIndex].PWEIGHT,

								SEQ: res[iRowIndex].SEQ
							};
							if (iRowIndex === 0) {
								CHARG = res[iRowIndex].CHARG;
								VFDAT = res[iRowIndex].VFDAT;
								BAGTYP = res[iRowIndex].BAGTYP;
								MFRPN = res[iRowIndex].MFRPN;
								BRGEW = res[iRowIndex].BRGEW;
								NTGEW = res[iRowIndex].NTGEW;
								TFWT = res[iRowIndex].TFWT;
								TSWT = res[iRowIndex].TSWT;
								TBWT = res[iRowIndex].TBWT;
								TFINWT = res[iRowIndex].TFINWT;
								STNDTY = res[iRowIndex].STNDTY;
								STNDWT = res[iRowIndex].STNDWT;

								if (BRGEW === "") {
									BRGEW = "0.000";
								}

								BAGTYP = BAGTYP + "-" + MFRPN;
								that.getView().byId("CHARG").setValue(CHARG);
								that.getView().byId("VFDAT").setValue(VFDAT);
								that.getView().byId("BAGT").setValue(BAGTYP);
								that.getView().byId("BAGWTP").setText(BRGEW);
								that.getView().byId("TFWT").setText(TFWT);
								that.getView().byId("TSWT").setText(TSWT);
								that.getView().byId("TBWT").setText(TBWT);
								that.getView().byId("TFINWT").setText(TFINWT);
								that.getView().byId("STNDTY").setValue(STNDTY);
								that.getView().byId("STNDWT").setText(STNDWT);
								that.getView().byId("TNWT").setText(NTGEW);
							}

							if (typeof itemData !== "undefined" && itemData.length > 0) {
								itemData.push(itemRow);
							} else {
								itemData = [];
								itemData.push(itemRow);
							}

							TOTBAG = TOTBAG + Number(res[iRowIndex].NOBAG);
						}
					}

					// // Set Model
					oModel.setData({
						data: itemData
					});
					oModel.refresh(true);
					// Reset table selection in UI5
					oTable.removeSelections(true);
					//************************get values from backend based on filter Date*******************************************//
					//sap.ui.core.BusyIndicator.hide();
					that.onBusyE(oBusy);
					that.getView().byId("TNBWT").setText(TOTBAG);
				},
				error: function (oResponse) {
					//sap.ui.core.BusyIndicator.hide();
					that.onBusyE(oBusy);
				}
			});
			//************************filter HU*******************************************//

			that.getView().byId("VBELN").setText(sObjectId);
			that.getView().byId("POSNR").setText(sObjectLn);
			that.getView().byId("MATNR").setText(sObjectMat);
			that.getView().byId("NOWT").setText(sObjectNowt);

			that.getView().byId("CHARG").setValue(CHARG);
			that.getView().byId("BAGT").setValue(BAGTYP);
			that.getView().byId("BAGWTP").setText(BRGEW);
			that.getView().byId("TFWT").setText(TFWT);
			that.getView().byId("TSWT").setText(TSWT);
			that.getView().byId("TBWT").setText(TSWT);
			that.getView().byId("STNDTY").setValue(STNDTY);
			that.getView().byId("STNDWT").setText(STNDWT);
			that.getView().byId("TFINWT").setText(TFINWT);
			that.getView().byId("TNWT").setText(NTGEW);
			that.getView().byId("oSelect1").setEditable(true);

			//************************filter printer*******************************************//
			var oModel3 = that.getView().byId("oSelect1").getModel();
			functions.blank(oModel3);

			var itemData3 = oModel3.getProperty("/data");

			var PLFilters1 = [];
			// var vbeln = "'" + sObjectId + "'";
			// var posnr = "'" + sObjectLn + "'";

			PLFilters1.push(new sap.ui.model.Filter({
				path: "VBELN",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: sObjectId
			}));

			PLFilters1.push(new sap.ui.model.Filter({
				path: "POSNR",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: sObjectLn
			}));

			oModel1.read("/PRINTERSet", {
				filters: PLFilters1,
				success: function (oData1, oResponse) {
					var res1 = [];
					res1 = oData1.results;
					var cnt = 0;
					if (res1.length > 0) {
						for (var iRowIndex = 0; iRowIndex < res1.length; iRowIndex++) {

							cnt = Number(cnt) + 1;

							var itemRow1 = {
								PRINTERN: res1[iRowIndex].PRINTERN,
								DEF: res1[iRowIndex].DEF
							};

							if (iRowIndex === 0) {
								that.getView().byId("oSelect1").setValue(res1[iRowIndex].PRINTERN);
							}

							if (typeof itemData3 !== "undefined" && itemData3.length > 0) {
								itemData3.push(itemRow1);
							} else {
								itemData3 = [];
								itemData3.push(itemRow1);
							}
						}
						if (cnt === 1) {
							that.getView().byId("oSelect1").setEditable(false);
						}

						// // Set Model
						oModel3.setData({
							data: itemData3
						});
						oModel3.refresh(true);
					}
					that.onBusyE(oBusy);
				},
				error: function (oResponse) {
					//sap.ui.core.BusyIndicator.hide();
					that.onBusyE(oBusy);
				}
			});

			//************************filter printer*******************************************//			

		},

		onSearch: function (event) {
			var item = event.getParameter("suggestionItem");
		},

		onSuggest: function (event) {
			var sQuery = event.getParameter("suggestValue");
			var aFilters = [];
			if (sQuery) {
				aFilters = new Filter({
					filters: [
						new Filter("MATNR", FilterOperator.Contains, sQuery),
						new Filter("MATNR", FilterOperator.Contains, sQuery.toUpperCase()),
						new Filter("MFRPN", FilterOperator.Contains, sQuery),
						new Filter("MFRPN", FilterOperator.Contains, sQuery.toUpperCase())
					],
					and: false
				});
			}

			this.oSearchField.getBinding("suggestionItems").filter(aFilters);
			this.oSearchField.suggest();
		},

		onGet: function (oControlEvent) {
			var that = this;

			var NUM_DECIMAL_PLACES = 3;
			var oBagV = this.getView().byId("BAGT").getValue();
			if (oBagV === "") {
				sap.m.MessageToast.show("Please provide Bag Type");
				var val = "0.000";
				that.getView().byId("BAGWTP").setText(val);
			} else {
				var BagT = [];
				BagT = oBagV.split("-");
				var oBagT = BagT[0];
				var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZMMO_MIGO_SRV/", true);
				var sVal = "/INVPCKSet(MATNR='" + oBagT + "')";

				oModel1.read(sVal, {
					success: function (oData, oResponse) {
						val = Number(oData.NTGEW).toFixed(NUM_DECIMAL_PLACES);
						that.getView().byId("BAGWTP").setText(val);
						var oflg = "X";
						that.onsubCal(oflg);
					},
					error: function () {
						var res = "0.000";
						var cres = Number(res).toFixed(NUM_DECIMAL_PLACES);
						that.getView().byId("BAGWTP").setText(cres);
					}

				});
			}
		},

		onCal: function (oControlEvent) {
			
			var that = this;
			var oRow = oControlEvent.getSource().getParent();
			var NUM_DECIMAL_PLACES = 3;
			var aCells = oRow.getCells();
			var bagwtp = Number(this.getView().byId("BAGWTP").getText()).toFixed(NUM_DECIMAL_PLACES);
			if (aCells.length > 0) {
				//var colnwt;
				for (var i = 6; i < aCells.length; i++) {
					var colnobag = aCells[i - 5]._lastValue;
					var colfwt = aCells[i - 4]._lastValue;
					if (colfwt === "") {
						colfwt = "0.000";
					}
					var colswt = aCells[i - 3]._lastValue;
					if (colswt === "") {
						colswt = "0.000";
					}
					var colpwt = aCells[i - 2]._lastValue;
					if (colpwt === "") {
						colpwt = "0.000";
					}

					var colbwt = Number(colnobag) * bagwtp;
					colfwt = Number(colfwt).toFixed(NUM_DECIMAL_PLACES);
					colswt = Number(colswt).toFixed(NUM_DECIMAL_PLACES);
					colpwt = Number(colpwt).toFixed(NUM_DECIMAL_PLACES);
					colbwt = Number(colbwt).toFixed(NUM_DECIMAL_PLACES);

					// colnwt = functions.compare(colfwt, colswt, colbwt, colnwt);

					// colnwt = colnwt.toFixed(NUM_DECIMAL_PLACES);
					if (colfwt !== "0.000") {
						aCells[i - 4].setValue(colfwt);
					}
					if (colswt !== "0.000") {
						aCells[i - 3].setValue(colswt);
					}
					if (colpwt !== "0.000") {
						aCells[i - 2].setValue(colpwt);
					}
					aCells[i - 1].setValue(colbwt);
					// aCells[i - 1].setValue(colnwt);
				}

				that.onsubCal();
			}

		},

		onsubCal: function (oflg) {
			var that = this;
			var NUM_DECIMAL_PLACES = 3;
			var oTable = that.getView().byId("tab");
			var oModel2 = oTable.getModel();
			var aItems = oTable.getItems(oModel2); //All rows

			if (oflg === "X") {
				var bagwtp = that.getView().byId("BAGWTP").getText();
			}
			var stndty = that.getView().byId("STNDTY").getValue();
			var NOWT = that.getView().byId("NOWT").getText();
			var tfwt, tswt, tbwt, tnbt, stndwt, tfinwt, tnbwt;
			var result = functions.sum(aItems, NUM_DECIMAL_PLACES, tfwt, tswt, tbwt, tnbt, stndty, stndwt, tfinwt,
				bagwtp, oflg, tnbwt, NOWT);

			if (result !== undefined) {
				that.getView().byId("TFWT").setText(result.tfwt);
				that.getView().byId("TSWT").setText(result.tswt);
				that.getView().byId("TBWT").setText(result.tbwt);
				that.getView().byId("TNWT").setText(result.tnwt);
				that.getView().byId("TNBWT").setText(result.tnbwt);
				that.getView().byId("STNDWT").setText(result.stndwt);
				that.getView().byId("TFINWT").setText(result.tfinwt);
			}
		},

		onAdd: function (oControlEvent) {
			debugger;
			var that = this;
			var oBusy = new sap.m.BusyDialog();
			that.onBusyS(oBusy);

			var oModel = that.getView().byId("tab").getModel();
			var itemData = oModel.getProperty("/data");

			var oVbeln = that.getView().byId("VBELN").getText();
			var oPosnr = that.getView().byId("POSNR").getText();
			var oSeq = "01";

			//table value
			var oTable = that.getView().byId("tab");
			var oModel2 = oTable.getModel();
			var aRows = oTable.getItems(oModel2);

			if (aRows.length > 0) {
				//row value				
				var oVal = Number(aRows[aRows.length - 1].getCells()[6].getValue());
				oSeq = oVal + 1;
				if (oSeq < 10) {
					oSeq = "0" + oSeq;
				}
			}
			//table value

			var itemRow = {
				PALLET: oVbeln + oPosnr + oSeq,
				SEQ: oSeq,
				NOBAG: "",
				CHARG: ""
			};

			if (typeof itemData !== "undefined" && itemData.length > 0) {
				itemData.push(itemRow);
			} else {
				itemData = [];
				itemData.push(itemRow);
			}

			// // Set Model
			oModel.setData({
				data: itemData
			});

			oModel.refresh(true);
			that.onBusyE(oBusy);
		},

		onDel: function (oControlEvent) {
			var oTable = this.getView().byId("tab");
			var oModel2 = oTable.getModel();
			var aRows = oModel2.getData().data;
			var aContexts = oTable.getSelectedContexts();
			// Loop backward from the Selected Rows

			for (var i = aContexts.length - 1; i >= 0; i--) {
				// Selected Row
				var oThisObj = aContexts[i].getObject();
				// $.map() is used for changing the values of an array.
				// Here we are trying to find the index of the selected row
				// refer - http://api.jquery.com/jquery.map/
				var oIndex = $.map(aRows, function (obj, oIndex) {
					if (obj === oThisObj) {
						return oIndex;
					}
				});

				// The splice() method adds/removes items to/from an array
				// Here we are deleting the selected index row
				aRows.splice(oIndex, 1);
			}
			// Set the Model with the Updated Data after Deletion
			oModel2.setData({
				data: aRows
			});
			// Reset table selection in UI5
			oTable.removeSelections(true);

			this.onsubCal();
		},

		// onPri: function(oControlEvent) {
		// 	var that = this;

		// 	var oTable = that.getView().byId("tab");
		// 	// Get the table Model
		// 	var oModel = oTable.getModel();
		// 	// // Get Items of the Table
		// 	// var aItems = oTable.getItems(oModel); //All rows
		// 	// get selected rows
		// 	var aContexts = oTable.getSelectedContexts();
		// 	var pallet;

		// 	if (aContexts.length > 0) {
		// 		var oBusy = new sap.m.BusyDialog();
		// 		that.onBusyS(oBusy);

		// 		for (var iRowIndex = 0; iRowIndex < aContexts.length; iRowIndex++) {
		// 			var l_pallet = aContexts[iRowIndex].getObject().PALLET;

		// 			if (typeof pallet === "undefined") {
		// 				pallet = l_pallet;
		// 			} else {
		// 				pallet = pallet + "-" + l_pallet;
		// 			}
		// 		}

		// 		var url = "/sap/opu/odata/sap/ZMMO_MIGO_SRV/ZMMSTSTSet('" + pallet + "')/$value";
		// 		sap.m.URLHelper.redirect(url, true);
		// 		that.onBusyE(oBusy);

		// 	} else {
		// 		sap.m.MessageToast.show("Please select for Print");
		// 	}

		// },

		onPri: function (oControlEvent) {
			var that = this;

			var oTable = that.getView().byId("tab");
			var PLFilters = [];

			var l_printern = that.getView().byId("oSelect1").getValue();
			if (l_printern === "" || l_printern === undefined) {
				sap.m.MessageToast.show("Printer Name can not be blank");
			} else {

				// Get the table Model
				// // Get Items of the Table
				// get selected rows
				var aContexts = oTable.getSelectedContexts();

				if (aContexts.length > 0) {
					var oBusy = new sap.m.BusyDialog();
					that.onBusyS(oBusy);

					for (var iRowIndex = 0; iRowIndex < aContexts.length; iRowIndex++) {
						var l_pallet = aContexts[iRowIndex].getObject().PALLET;

						PLFilters.push(new sap.ui.model.Filter({
							path: "PALLET",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: l_pallet
						}));
					}

					// var printn = "'" + l_printern + "'";

					PLFilters.push(new sap.ui.model.Filter({
						path: "PRINTERN",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: l_printern
					}));

					var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZMMO_MIGO_SRV/", true);
					oModel1.read("/PRINTSet", {
						filters: PLFilters,
						success: function (oData, oResponse) {
							sap.m.MessageToast.show("Print Successful");
							that.onBusyE(oBusy);
						},
						error: function (oResponse) {
							var oMsg = JSON.parse(oResponse.responseText);
							jQuery.sap.require("sap.m.MessageBox");
							sap.m.MessageToast.show(oMsg.error.message.value);
							that.onBusyE(oBusy);
						}
					});
				} else {
					sap.m.MessageToast.show("No Pallet marked to be print");
				}
			}

		},

		onSave: function (oControlEvent) {
			var that = this;

			var c_BagType = that.getView().byId("BAGWTP").getText();
			var c_BagVal = that.getView().byId("BAGT").getValue();
			var l_tfinwt = that.getView().byId("TFINWT").getText();
			var l_stndwt = that.getView().byId("STNDWT").getText();
			var l_nstndwt = Number(l_stndwt);
			var l_ntfinwt = Number(l_tfinwt);

			var aItems = that.getView().byId("tab").getItems();
			var flg = "";

			if (aItems.length > 0) {
				if (that.getView().byId("CHARG").getValue() === "") {
					sap.m.MessageToast.show("Please provide Batch");
					flg = "X";
				} else if ((c_BagType === "0.000" || c_BagType === "") || c_BagVal === "") {
					sap.m.MessageToast.show("Please check Bag Type Value");
					flg = "X";
				} else if ( ( l_stndwt === "" || l_stndwt === undefined || l_stndwt === 0 || l_stndwt < 0 ) || ( l_nstndwt === 0 || l_nstndwt < 0) ) {
					sap.m.MessageToast.show("Standard Bag Weight/Total Bag Weight can not be blank/Zero");
					flg = "X";
				}
			}

			// else if (l_ntfinwt < 0 || l_ntfinwt === 0) {
			// 	sap.m.MessageToast.show("Total Final Weight can not be 0/less than 0");
			// } 

			// else {
			if (flg === "") {
				var oTable = that.getView().byId("tab");
				// Get the table Model
				var oModel = oTable.getModel();
				// Get Items of the Table
				var aItems = oTable.getItems(oModel); //All rows
				var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZMMO_MIGO_SRV/", true);
				var l_vbeln = that.getView().byId("VBELN").getText();
				var l_posnr = that.getView().byId("POSNR").getText();
				var oBusy = new sap.m.BusyDialog();
				if (aItems.length > 0) {
					that.onBusyS(oBusy);
					oModel1.setUseBatch(true);

					// return back from SAP-Backend to Firoi and show success or error
					var mParameters = {
						success: function (oEntry, oResponse) {
							sap.m.MessageToast.show("Data Deleted");
							that.onBusyE(oBusy);
						},
						error: function (oResponse) {
							var oMsg = JSON.parse(oResponse.responseText);
							jQuery.sap.require("sap.m.MessageBox");
							sap.m.MessageToast.show(oMsg.error.message.value);
							that.onBusyE(oBusy);
						}
					};

					//header procesiing

					//var l_bagtyp = that.getView().byId("BAGT").getSelectedKey();

					var oBagV = this.getView().byId("BAGT").getValue();
					var BagT = [];
					BagT = oBagV.split("-");
					var l_bagtyp = BagT[0];
					var flg = "";

					var l_brgew = that.getView().byId("BAGWTP").getText();
					var l_charg = that.getView().byId("CHARG").getValue();
					var l_vfdat = that.getView().byId("VFDAT").getValue();
					var l_tfwt = that.getView().byId("TFWT").getText();
					var l_tswt = that.getView().byId("TSWT").getText();
					var l_stndty = that.getView().byId("STNDTY").getValue();
					var l_tbwt = that.getView().byId("TBWT").getText();
					var l_ntgew = that.getView().byId("TNWT").getText();
					// var l_stndwt = that.getView().byId("STNDWT").getText();
					//var l_tfinwt = that.getView().byId("TFINWT").getText();

					for (var iRowIndex1 = 0; iRowIndex1 < aItems.length; iRowIndex1++) {
						var l_pallet1 = aItems[iRowIndex1].getCells()[0].getValue();
						var l_nobag1 = aItems[iRowIndex1].getCells()[1].getValue();
						var l_fweight1 = aItems[iRowIndex1].getCells()[2].getValue();
						if (l_fweight1 === "" || l_fweight1 === "0") {
							l_fweight1 = "0.000";
						}
						if (l_nobag1 === "" || l_nobag1 === "0") {
							l_nobag1 = "0";
						}
						var val = Number(l_fweight1);
						var val1 = Number(l_nobag1);
						
						var val2 = Number(aItems[iRowIndex1].getCells()[3].getValue());
						
						if (val1 === 0 || val < 0) {
							sap.m.MessageToast.show("No. of Bags can not be/less than 0 for pallet " + l_pallet1);
							flg = "X";
							that.onBusyE(oBusy);
						}
						if (val === 0 || val < 0) {
							sap.m.MessageToast.show("1st Weight can not be/less than 0 for pallet " + l_pallet1);
							flg = "X";
							that.onBusyE(oBusy);
						}
						if( val2 < 0 ){
							sap.m.MessageToast.show("2nd Weight can not be/less than 0 for pallet " + l_pallet1);
							flg = "X";
							that.onBusyE(oBusy);
						}
					}

					if (flg === "") {

						for (var iRowIndex = 0; iRowIndex < aItems.length; iRowIndex++) {
							//Item procesiing					
							var l_pallet = aItems[iRowIndex].getCells()[0].getValue();
							var l_nobag = aItems[iRowIndex].getCells()[1].getValue();
							var l_fweight = aItems[iRowIndex].getCells()[2].getValue();
							if (l_fweight === "") {
								l_fweight = "0.000";
							}

							var l_sweight = aItems[iRowIndex].getCells()[3].getValue();
							if (l_sweight === "") {
								l_sweight = "0.000";
							}
							var l_pweight = aItems[iRowIndex].getCells()[4].getValue();
							if (l_pweight === "") {
								l_pweight = "0.000";
							}

							var l_bweight = aItems[iRowIndex].getCells()[5].getValue();

							var oEntry = {};
							oEntry.VBELN = l_vbeln;
							oEntry.POSNR = l_posnr;
							oEntry.PALLET = l_pallet;
							oEntry.FWEIGHT = l_fweight;
							oEntry.SWEIGHT = l_sweight;
							oEntry.BAGWT = l_bweight;
							oEntry.BRGEW = l_brgew;
							oEntry.BAGTYP = l_bagtyp;
							oEntry.PWEIGHT = l_pweight;
							oEntry.NOBAG = l_nobag;
							oEntry.CHARG = l_charg;
							oEntry.VFDAT = l_vfdat;
							oEntry.TFWT = l_tfwt;
							oEntry.TSWT = l_tswt;
							oEntry.STNDTY = l_stndty;
							oEntry.TBWT = l_tbwt;
							oEntry.STNDWT = l_stndwt;
							oEntry.NTGEW = l_ntgew;
							oEntry.STNDWT = l_stndwt;
							oEntry.TFINWT = l_tfinwt;

							var sVal = "/INVDETHUSet";

							///////////
							mParameters.changeSetId = "changeset";
							oModel1.create(sVal, oEntry, mParameters);
							////////////

						} //end of for

						//Finally, submit all the batch changes 
						oModel1.submitChanges({
							chageSetId: mParameters,
							success: function () {},
							error: function () {}
						});

					}

				} else {
					that.onBusyS(oBusy);
					oModel1.remove("/DELETESet(VBELN='" + l_vbeln + "',POSNR='" + l_posnr + "')", {
						success: function (oData, oResponse) {
							//************************get values from backend based on filter Date*******************************************//
							var oMsg = JSON.parse(oResponse.responseText);
							jQuery.sap.require("sap.m.MessageBox");
							sap.m.MessageToast.show(oMsg.error.message.value);
							that.onBusyE(oBusy);
						},
						error: function (oResponse) {
							that.onBusyE(oBusy);
							var oMsg = JSON.parse(oResponse.responseText);
							jQuery.sap.require("sap.m.MessageBox");
							sap.m.MessageToast.show(oMsg.error.message.value);
						}
					});

				}
			}

			// }
		},

		onBusyS: function (oBusy) {
			oBusy.open();
			oBusy.setBusyIndicatorDelay(40000);
		},

		onBusyE: function (oBusy) {
			oBusy.close();
		},

		/**
		 * Event handler  for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function () {
			// var sPreviousHash = History.getInstance().getPreviousHash(),
			// 	oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			// if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {

			// 	history.go(-1);
			// } else {
			//  	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// oRouter.getRouter().navTo("Main", {}, true);

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Main");
			// }
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.babaZMM_MRFINV.view.View
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.babaZMM_MRFINV.view.View
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.babaZMM_MRFINV.view.View
		 */
		//	onExit: function() {
		//
		//	}

	});

});