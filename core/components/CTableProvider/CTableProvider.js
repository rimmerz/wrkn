/**
 * Created by G on 02.10.2017.
 */
var CComponentProxy = require(global.CORE_DIR + '/components/CComponentProxy');
var CTableProvider = function(CComponent){
    this.CComponentRegistration = 'web/CTableProvider';
    this.CComponent = null;
    this.UIProviderData = {
        js: {
            'watable_lib':'/lib/watable/jquery.watable.js',
            'CTableProvider':'/js/CTableProvider.js',
            'CTableProviderExtraAction':'/js/CTableProviderExtraAction.js',
            'CTableProviderFilterManagement':'/js/CTableProviderFilterManagement.js'
        },
        css: {
            'CTableProvider':'/css/CTableProvider.css',
            'watable_lib':'/lib/watable/watable.css',
            'zui-pager_lib':'/lib/watable/zui-pager.css'
        }
    };
    this.__construct = function(CComponent){
        var self = this;
        self.CComponent = CComponent;
        self.CComponent.useComponent('web/CModalProvider');
    };
    this.__construct(CComponent);
    return CComponentProxy.applyFor(this);
};

CTableProvider.prototype.applyFor = function(tableId, actionUrl, behaviours){
    var self = this;

    self.UIProviderData.js['CTableProvider' + tableId] = 'js: CTableProvider.initTable(\'' + tableId + '\', \'' + actionUrl + '\', {export: true});';
    if ( typeof behaviours == 'object' ) {
        for ( var column in behaviours ) {
            self.UIProviderData.js['CTableProvider' + tableId] += 'var CTableProviderConfigurator = CTableProvider.configure(\'' + tableId + '\', \'' + column + '\');';
            var _columnBehaviour = behaviours[column];
            for ( var configurationMethod in _columnBehaviour ) {
                var behaviour = _columnBehaviour[configurationMethod];
                switch (configurationMethod) {
                    case 'column':
                        var type = 'string';
                        var lastState = null;
                        if ( behaviour.hasOwnProperty('type') ) {
                            type = behaviour.type;
                        }
                        if ( behaviour.hasOwnProperty('lastState') ) {
                            lastState = behaviour.lastState;
                        }
                        self.UIProviderData.js['CTableProvider' + tableId] += 'CTableProviderConfigurator.column(\''+column+'\', \''+type+'\', \''+lastState+'\');';
                        break;
                    case 'label':
                        self.UIProviderData.js['CTableProvider' + tableId] += 'CTableProviderConfigurator.label(\''+behaviour+'\');';
                        break;
                    case 'checkable':
                        self.UIProviderData.js['CTableProvider' + tableId] += 'CTableProviderConfigurator.checkable('+behaviour+');';
                        break;
                    case 'filter':
                        if ( behaviour.hasOwnProperty('isEnabled') && behaviour.hasOwnProperty('placeholder') ) {
                            var predefinedFilters = null;
                            if ( behaviour.hasOwnProperty('predefinedFilters') ) {
                                predefinedFilters = JSON.stringify(behaviour.predefinedFilters);
                            }
                            self.UIProviderData.js['CTableProvider' + tableId] += 'CTableProviderConfigurator.filter(' + behaviour.isEnabled + ', \'' + behaviour.placeholder + '\', ' + predefinedFilters + ');';
                        }
                        break;
                    case 'onFilter':
                        if ( typeof behaviour == 'function' ) {
                            self.UIProviderData.js['CTableProvider' + tableId] += 'CTableProviderConfigurator.onFilter(' + behaviour + ');';
                        }
                        break;
                    case 'sort':
                        self.UIProviderData.js['CTableProvider' + tableId] += 'CTableProviderConfigurator.sort('+behaviour+');';
                        break;
                    case 'onSort':
                        if ( typeof behaviour == 'function' ) {
                            self.UIProviderData.js['CTableProvider' + tableId] += 'CTableProviderConfigurator.onSort(' + behaviour + ');';
                        }
                        break;
                }
            }
        }
    }
    self.CComponent.patchUIProvider(self);
    return self;
};

module.exports = function(CComponent){
    return new CTableProvider(CComponent);
};