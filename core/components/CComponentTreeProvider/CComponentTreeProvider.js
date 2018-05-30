/**
 * Created by G on 05.10.2017.
 */
var CComponentProxy = require(global.CORE_DIR + '/components/CComponentProxy');
var CComponentTreeProvider = function(CComponent){
    this.CComponentRegistration = 'web/CNavigationProvider/CSettings/CComponentTreeProvider';
    this.CComponent = null;
    this.UIProviderData = {
        js: {
            'jqTree':'/js/tree.jquery.js',
            'CComponentTree':'/js/CComponentTree.js'
        },
        css: {
            'CComponentTree':'/css/CComponentTree.css'
        }
    };
    this.__construct = function(CComponent){
        var self = this;
        self.CComponent = CComponent;
    };
    this.__construct(CComponent);

    this.handler = {
        get(target, property, receiver) {
            const calledProperty = target[property];
            if ( calledProperty == undefined ) {
                return function () {
                    return null;
                }
            } else {
                switch ( typeof calledProperty ) {
                    case 'object':
                        return calledProperty;
                        break;
                    case 'function':
                        return function () {
                            console.log('>>>>>>>>> GET HANDLER', typeof calledProperty, property, JSON.stringify(arguments));
                            let result = calledProperty.apply(this, arguments);
                            return result;
                        };
                        break;
                    default:
                        return calledProperty;
                        break;
                }
            }
        }
    };
    return CComponentProxy.applyFor(this);
};

CComponentTreeProvider.prototype.buildTree = function(selector, data){
    var self = this;

    self.UIProviderData.js['CComponentTreeInit'] = 'js: ' +
        '$(document).ready(function() {' +
        'var CComponent = new CComponentTree(\'' + selector + '\');' +
        'CComponent.init('+JSON.stringify(data)+');' +
        '});';
    self.CComponent.patchUIProvider(self);
    return self;
};

module.exports = function(CComponent){
    return new CComponentTreeProvider(CComponent);
};