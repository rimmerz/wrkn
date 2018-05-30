/**
 * Created by Viktor G on 13.07.2017.
 */
exports.CSocketApp = function(app) {
    this.expressApp = app;
    this._transport = {
        IO: null,
        server: null
    };
    this.namespaces = {
        'CSocketAppServices' : null
    };
    this.runSocketInstance();
};

exports.CSocketApp.prototype.runSocketInstance = function(){
    var self = this;
    self._transport.server = require('http').createServer(self.expressApp).listen(global.core._config.tcp.socket.port, function(){
        console.log('TRANSPORT APP: ' + global.core._config.tcp.socket.host + ':' + global.core._config.tcp.socket.port);
    });
    self._transport.IO = require('socket.io').listen(self._transport.server);

    self.applyNamespaces();
};
exports.CSocketApp.prototype.onDisconnect = function(){
    //TODO on disconnect action
};
exports.CSocketApp.prototype.applyNamespaces = function(){
    var self = this;
    for (var namespace in self.namespaces) {
        var _namespace = require('./CSocket/' + namespace + '.js')[namespace];
        self.namespaces[namespace] = new _namespace(self._transport.IO);
    }
};