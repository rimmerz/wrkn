/**
 * Created by G on 03.10.2017.
 */
var CComponentProxy = require(global.CORE_DIR + '/components/CComponentProxy');
var CNavigationProvider = function(CComponent){
    this.CComponentRegistration = 'web/CNavigationProvider';
    this.CComponent = null;
    this.__construct = function(CComponent){
        var self = this;
        self.CComponent = CComponent;
    };
    this.__construct(CComponent);
    return CComponentProxy.applyFor(this);
};

CNavigationProvider.prototype.getMenuItems = function(){
    return [
        {'link': '/dashboard', 'label': 'Dashboard', 'icon': 'dashboard', 'component': 'web/CNavigationProvider/CDashboard'},
        {'link': '/customers', 'label': 'Customers', 'icon': 'users', 'component': 'web/CNavigationProvider/CCustomers'},
        {'link': '/settings', 'label': 'Settings', 'icon': 'gear', 'component': 'web/CNavigationProvider/CSettings'},
        {'link': '/backoffice', 'label': 'Backoffice', 'icon': 'cubes', 'component': 'web/CNavigationProvider/CBackOffice'}
    ];
};

module.exports = function(CComponent){
    return new CNavigationProvider(CComponent);
};