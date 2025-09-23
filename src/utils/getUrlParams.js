"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUrlParam = getUrlParam;
exports.getUrlParamNumber = getUrlParamNumber;
/** Get url parameter by name */
function getUrlParam(param) {
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    return urlParams.get(param);
}
/** Get url parameter by name and ensure value as number, if that can be converted, or null otherwise */
function getUrlParamNumber(param) {
    var value = getUrlParam(param);
    if (!value)
        return null;
    var valueNumber = Number(value);
    if (isNaN(valueNumber))
        return null;
    return valueNumber;
}
