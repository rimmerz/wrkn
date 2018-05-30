/**
 * Created by G on 02.10.2017.
 */
var CComponentProxy = require(global.CORE_DIR + '/components/CComponentProxy');
var CSocketProvider = function(CComponent){
    this.CComponentRegistration = 'web/CSocketProvider';
    this.CComponent = null;
    this.UIProviderData = {
        js: {}
    };
    this.__construct = function(CComponent){
        var self = this;
        self.CComponent = CComponent;
        self.CComponent.useComponent('web/CModalProvider');
        if ( CComponent.session.hasOwnProperty('authId') ) {
            self.UIProviderData.js = {
                'socketio':'/lib/socketio/socket.io.min.js',
                'CSocketProvider_lib':'/js/CSocketProvider.js',
                'CSocketProvider_init':'js: var CSocketProvider = new CSocketProvider({' +
                'host: \'' + global.core._config.tcp.socket.host + ':' + global.core._config.tcp.socket.port + '\',' +
                'cid: \'' + CComponent.session.authId + '\'});'
            }
        }
    };
    this.__construct(CComponent);
    return CComponentProxy.applyFor(this);
};

module.exports = function(CComponent){
    return new CSocketProvider(CComponent);
};