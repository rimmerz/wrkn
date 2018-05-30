/**
 * Created by G on 02.10.2017.
 */
var CComponentProxy = require(global.CORE_DIR + '/components/CComponentProxy');
var CModalProvider = function(CComponent){
    this.CComponentRegistration = 'web/CModalProvider';
    this.CComponent = null;
    this.UIProviderData = {
        js: {
            'notiny':'/lib/notiny/notiny.min.js',
            'CModalProvider_lib':'/js/CModalProvider.js',
            'CModalProvider_init':'js: var CModalProvider = new CModalProvider;'
        },
        css: {
            'notiny':'/lib/notiny/notiny.min.css'
        }
    };
    this.__construct = function(CComponent){
        var self = this;
        self.CComponent = CComponent;
    };
    this.__construct(CComponent);
    return CComponentProxy.applyFor(this);
};

CModalProvider.prototype.notify = function(text){
    var self = this;

    self.UIProviderData.js['CModalProvider_notification'] = 'js: CModalProvider.notify(\'' + text + '\');';
    self.CComponent.patchUIProvider(self);
    return self;
};

CModalProvider.prototype.notifyOnError = function(text){
    var self = this;

    self.UIProviderData.js['CModalProvider_notification'] = 'js: CModalProvider.notifyOnError(\'' + text + '\');';
    self.CComponent.patchUIProvider(self);
    return self;
};

module.exports = function(CComponent){
    return new CModalProvider(CComponent);
};