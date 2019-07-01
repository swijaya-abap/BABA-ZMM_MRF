sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {
		numberUnit: function(sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(3);
		},

		colorval: function(sValue) {
			if (sValue !== "") {
				debugger;
				return "Success";
			}
		}

	};
});