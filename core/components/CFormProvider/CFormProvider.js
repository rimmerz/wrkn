/**
 * Created by G on 02.10.2017.
 */
var CComponentProxy = require(global.CORE_DIR + '/components/CComponentProxy');
var CFormProvider = function(CComponent){
    this.CComponentRegistration = 'web/CFormProvider';
    this.CComponent = null;
    this.UIProviderData = {
        js: {
            'CFormProvider':'/js/CFormProvider.js',
            'Select2_lib':'/plugins/select2/select2.full.min.js',
            'Select2_init':'js: $(\'select\').select2();'
        },
        css: {
            'Select2_lib':'/plugins/select2/select2.min.css'
        }
    };
    this.__construct = function(CComponent){
        var self = this;
        self.CComponent = CComponent;
        self.CComponent.useComponent('web/CModalProvider');
        self.CComponent.allowed(self.CComponentRegistration + '/CFormLogin');
        self.CComponent.allowed(self.CComponentRegistration + '/CFormSearch');
    };
    this.__construct(CComponent);
    return CComponentProxy.applyFor(this);
};

CFormProvider.prototype.applyFor = function(formId, options, behaviour){
    var self = this;
    self.UIProviderData.js['CFormProvider_' + formId] = 'js: var CFormProvider = new CFormProvider(\'' + formId + '\');';
    if ( typeof options == 'object' ) {
        self.UIProviderData.js['CFormProvider_' + formId] += 'CFormProvider.actionPatches('+JSON.stringify(options)+');';
    }
    if ( behaviour != undefined ) {
        if ( behaviour.hasOwnProperty('src') ){
            self.UIProviderData.js['CFormProvider_' + formId + '_behaviourLib'] = behaviour.src;
        }
        if ( behaviour.hasOwnProperty('exec') ){
            self.UIProviderData.js['CFormProvider_' + formId + '_behaviourExec'] = 'js: ' + behaviour.exec;
        }
    }
    self.CComponent.patchUIProvider(self);
    return self;
};

module.exports = function(CComponent){
    return new CFormProvider(CComponent);
};