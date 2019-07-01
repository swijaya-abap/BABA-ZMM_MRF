sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"com/babaZMM_MRFINV/model/function"
], function (JSONModel, Device, functions) {
	"use strict";

	return {

		blank: function (soModel) {
			//************************set blank values to table*******************************************//
			var data;
			var noData = soModel.getProperty("/data");
			soModel.setData({
				modelData: noData
			});
			soModel.setData({
				modelData: data
			});
			//************************set blank values to table*******************************************//
			// return parseFloat(sValue).toFixed(2);
		},

		sum: function (aItems, NUM_DECIMAL_PLACES, tfwt, tswt, tbwt, tnwt, stndty, stndwt, tfinwt, bagwtp, oflg, tnbwt, nowt) {
			tfwt = 0;
			tswt = 0;
			tbwt = 0;
			tnwt = 0;
			tfinwt = 0;
			tnbwt = 0;
			var tnobag = 0;

			if (aItems.length > 0) {
				for (var iRowIndex = 0; iRowIndex < aItems.length; iRowIndex++) {
					var l_nobag = Number(aItems[iRowIndex].getCells()[1].getValue());
					var l_fweight = Number(aItems[iRowIndex].getCells()[2].getValue());
					var l_sweight = Number(aItems[iRowIndex].getCells()[3].getValue());

					if (oflg === "X") {
						var bagwt = l_nobag * Number(bagwtp);
						bagwt = bagwt.toFixed(NUM_DECIMAL_PLACES);
						aItems[iRowIndex].getCells()[5].setValue(bagwt);
					}

					var l_bweight = Number(aItems[iRowIndex].getCells()[5].getValue());

					if (l_fweight === "") {
						l_fweight = 0;
					}
					if (l_sweight === "") {
						l_sweight = 0;
					}
					if (l_bweight === "") {
						l_bweight = 0;
					}
					if (l_nobag === "") {
						l_nobag = 0;
					}

					tfwt = tfwt + l_fweight;
					tswt = tswt + l_sweight;
					tbwt = tbwt + l_bweight;
					tnobag = tnobag + l_nobag;

				}

				if (nowt === "X") {      // when have 1st wt & 2nd wt
					if (tswt === 0) {   // if 2nd wt is  0 
						tnwt = 0;       // t net wt = 0
					} else {
						if (tfwt <= tswt) {       // compare which one is lowest in tot 1st and tot 2nd wt
							tnwt = (tfwt - tbwt); //net wt = f wt - bag wt
						} else if (tswt <= tfwt) {
							tnwt = (tswt - tbwt); //net wt = s wt - bag wt
						}
						
						if	(tnwt < 0) { //if less than 0
							tnwt = 0;
						}
					}
				} else if (nowt === "Y") { //when don't have 2nd weight 
					tnwt = tfwt - tbwt;  //then net wt = tot f wt - t bag wt
				}

				stndwt = stndty * tnobag; // tot snd wt = stndty * no of bags
				if (tnwt === 0) {        // tot net wt = o
					tfinwt = 0;          // fin wt = 0
				} else {
					if (stndwt <= tnwt) {  // compare tot stnd wt with tot net wt
						tfinwt = stndwt;    // if tot stnd wt wt is less then final wt = tot net wt
					} else {
						tfinwt = tnwt;     // else tot final wt = tot net wt
					}
				}

				tfwt = tfwt.toFixed(NUM_DECIMAL_PLACES);
				tswt = tswt.toFixed(NUM_DECIMAL_PLACES);
				tbwt = tbwt.toFixed(NUM_DECIMAL_PLACES);
				tnwt = tnwt.toFixed(NUM_DECIMAL_PLACES);
				stndwt = stndwt.toFixed(NUM_DECIMAL_PLACES);
				tfinwt = tfinwt.toFixed(NUM_DECIMAL_PLACES);
				tnbwt = tnobag.toFixed(0);

				return {
					tfwt: tfwt,
					tswt: tswt,
					tbwt: tbwt,
					tnwt: tnwt,
					stndwt: stndwt,
					tfinwt: tfinwt,
					tnbwt: tnbwt
				};
			} else {

				return {
					tfwt: tfwt,
					tswt: tswt,
					tbwt: tbwt,
					tnwt: tnwt,
					stndwt: stndwt,
					tfinwt: tfinwt,
					tnbwt: tnbwt
				};

			}
		},



		compare: function (sFwt, sSwt, sBwt, sNwt) {
			debugger;
			sFwt = Number(sFwt);
			sSwt = Number(sSwt);
			sBwt = Number(sBwt);
			sNwt = Number(sNwt);

			if (sFwt <= sSwt) {
				sNwt = (sFwt - sBwt);
			} else if (sSwt <= sFwt) {
				sNwt = (sSwt - sBwt);
			}

			return sNwt;
		}

	};
});