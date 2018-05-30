/**
 * Created by G on 17.08.2017.
 */
var CHttpHelper = function() {
    this._code = 200;
    this._success = true;
    this._data = {
        response: {},
        success: null,
        error: null
    };
    this._redirect = false;
};

CHttpHelper.prototype.error = function(message, code) {
    this._data.success = false;
    this._code = (code > 0) ? code : 404;
    this._data.error = message;
    return this;
};

CHttpHelper.prototype.success = function(code) {
    this._data.success = true;
    this._code = (code > 0) ? code : 200;
    return this;
};

CHttpHelper.prototype.redirect = function(redirectTo) {
    this._redirect = redirectTo;
    return this;
};

CHttpHelper.prototype.body = function(bodyData) {
    this._data.response = bodyData;
    return this;
};

CHttpHelper.prototype.applyTo = function(res) {
    var self = this;
    res.status(self._code).send(self._data);
};

exports.CHttpHelper = new CHttpHelper;