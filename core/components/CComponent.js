/**
 * Created by G on 29.09.2017.
 */
String.prototype.replaceAll = function(search, replace){
    return this.split(search).join(replace);
};
String.prototype.md5hash = function(){
    var _self = this.toString();
    _self = _self.replace(/^\//, '');
    _self = _self.replace(/\/$/, '');
    var crypto = require('crypto');
    return crypto.createHash('md5').update(_self).digest('hex');
};
String.prototype.nohash = function(){
    var _self = this.toString();
    var crypto = require('crypto');
    return _self;
};
var CComponentProxy = require(global.CORE_DIR + '/components/CComponentProxy');
var CComponentIterator = function(componentTree, component, callback){
    var componentPath = component.replace(/^\//, '').split('/');
    var currentComponentPath = componentPath[0];
    if (componentTree.hasOwnProperty(currentComponentPath) && componentTree[currentComponentPath].enabled) {
        if ( componentPath.length > 1 ) {
            delete componentPath[0];
            component = componentPath.join('/');
            return CComponentIterator(componentTree[currentComponentPath], component, callback);
        }
        if ( typeof callback == 'boolean' && callback == true) {
            return currentComponentPath;
        }
        if ( typeof callback == 'function' ) {
            return callback(currentComponentPath);
        }
        return true;
    }
    return false;
};

var CComponent = function(){
    this.components = {};
    this.UIProviderData = {};
    this.CComponentMutable = {};
    this.route = {
        key: null,
        path: null
    };
    this.session = {};
    this.rebuildConfig = function () {
        var self = this;
        var SystemComponent = require(global.COREMODELS_DIR + '/SystemComponent.js').SystemComponent;
        var SystemComponents = new SystemComponent();
        SystemComponents.CComponentRules(function(componentRules){
            self.components = componentRules;
            global.CComponentConfig = componentRules;
        });
    };
    this.__construct = function(){
        var self = this;
        if ( global.hasOwnProperty('CComponentConfig') ) {
            self.components = global.CComponentConfig;
        } else {
            self.rebuildConfig();
        }
    };
    this.__construct();
    return CComponentProxy.applyFor(this);
};
CComponent.prototype.requestPatch = function(req, res, next){
    var self = this;
    var routeBasedKey = req._parsedUrl.pathname.md5hash();
    self.route.key = routeBasedKey;
    self.route.path = req._parsedUrl.pathname.toString();

    var provideJS = function(route, UIProviderDataJS) {
        var jsMarkup = '\t<!--@begin JS-->\n';
        if ( UIProviderDataJS.hasOwnProperty(self.route.key) ) {
            for (var i in UIProviderDataJS[self.route.key].js) {
                if (UIProviderDataJS[self.route.key].js[i].match(/^js\:/)) {
                    var rawScript = UIProviderDataJS[self.route.key].js[i].replace('js:', '');
                    jsMarkup += '\t\t<script type="text/javascript">' + rawScript + '</script>\n';
                } else {
                    jsMarkup += '\t\t<script type="text/javascript" src="' + UIProviderDataJS[self.route.key].js[i] + '"></script>\n';
                }
            }
        }
        jsMarkup += '\t<!--@end JS-->\n';
        return jsMarkup;
    };
    var provideCSS = function(route,UIProviderDataCSS) {
        var cssMarkup = '\t<!--@begin CSS-->\n';
        if ( UIProviderDataCSS.hasOwnProperty(self.route.key) ) {
            for (var i in UIProviderDataCSS[self.route.key].css) {
                if (UIProviderDataCSS[self.route.key].css[i].match(/^css\:/)) {
                    var rawScript = UIProviderDataCSS[self.route.key].css[i].replace('css:', '');
                    cssMarkup += '\t\t<style type="text/css">' + rawScript + '</style>\n';
                } else {
                    cssMarkup += '\t\t<link rel="stylesheet" href="' + UIProviderDataCSS[self.route.key].css[i] + '"/>\n';
                }
            }
        }
        cssMarkup += '\t<!--@end CSS-->\n';
        return cssMarkup;
    };
    if ( global.CComponentMutable != undefined ) {
        for ( var component in global.CComponentMutable ) {
            res.locals[component] = global.CComponentMutable[component];
        }
    }
    res.locals['CComponent'] = {
        'load': function (component, options){
            var _options = (typeof options == 'undefined') ? {} : options;
            var CComponent = require('./CComponent');
            return CComponent.loadComponent(req, res, component);
        },
        'allowed': function (component){
            let CComponent = require('./CComponent');
            return CComponent.allowed(component);
        },
        'isCurrentRoute': function (route){
            let CComponent = require('./CComponent');
            return CComponent.isCurrentRoute(route);
        },
        'UIProvider': function(){
            let CComponent = require('./CComponent');
            var providedMarkup = '\n\t<!--@begin CComponent UI provider-->\n';
            providedMarkup += provideJS(req.route, CComponent.UIProviderData);
            providedMarkup += provideCSS(req.route, CComponent.UIProviderData);
            providedMarkup += '\t<!--@end CComponent UI provider-->\n';

            CComponent.UIProviderData[CComponent.route.key] = {
                js: {},
                css: {}
            };
            return providedMarkup;
        }
    };
    next();
};
CComponent.prototype.patchUIProvider = function(CComponentMutable){
    var self = this;
    if ( self.route.key != null ) {
        if ( CComponentMutable.hasOwnProperty('UIProviderData') ) {
            if ( !self.UIProviderData.hasOwnProperty(self.route.key) ) {
                self.UIProviderData[self.route.key] = {
                    js: {},
                    css: {}
                };
            }
            if ( CComponentMutable.UIProviderData.hasOwnProperty('js') ) {
                self.UIProviderData[self.route.key].js = Object.assign(self.UIProviderData[self.route.key].js, CComponentMutable.UIProviderData.js);
            }
            if ( CComponentMutable.UIProviderData.hasOwnProperty('css') ) {
                self.UIProviderData[self.route.key].css = Object.assign(self.UIProviderData[self.route.key].css, CComponentMutable.UIProviderData.css);
            }
        }
    }
};
CComponent.prototype.useComponent = function(component){
    var self = this;
    if (self.route.key != null) {
        if ( self.allowed(component) ) {
            var CComponentKey = CComponentIterator(self.components, component, true);
            if (CComponentKey) {
                var CComponentMutable = require('./' + CComponentKey + '/' + CComponentKey)(self);
                if ( !global.hasOwnProperty('CComponentMutable') ) {
                    global.CComponentMutable = {};
                }
                if ( !global.CComponentMutable.hasOwnProperty(CComponentKey) ) {
                    global.CComponentMutable[CComponentKey] = CComponentMutable;
                }
                self.patchUIProvider(CComponentMutable);

                CComponentMutable['render'] = function(template){
                    var ejs = require('ejs');
                    var fs = require('fs');
                    var templateFile = null;
                    try {
                        templateFile = fs.readFileSync(__dirname + '/' + CComponentKey + '/views/' + template + '.html', 'ascii');
                    } catch(e) {
                        templateFile = '';
                    }
                    return ejs.render(templateFile, { locals: { items:[1,2,3] } });
                };
                return CComponentMutable;
            }
        }
    }
    return new CComponentEmulator;
};
/*
 * Load component and transfer public methods or load dummy component that realised these methods for null/empty result
 */
CComponent.prototype.loadComponent = function(req, res, component){
    var self = this;
    var routeBasedKey = req._parsedUrl.pathname.md5hash();
    self.route.key = routeBasedKey;
    self.route.path = req._parsedUrl.pathname.toString();
    self.session = req.session;

    return self.useComponent(component);
};

CComponent.prototype.allowed = function(component){
    var self = this;
    console.log(':::::COMPONENT: ', component, CComponentIterator(self.components, component), self.route.path);
    return CComponentIterator(self.components, component);
};

CComponent.prototype.isCurrentRoute = function(route){
    var self = this;
    return ( self.route.key == route.md5hash() );
};

module.exports = new CComponent;

var CComponentEmulator = function(){
    return CComponentProxy.applyFor(this);
};

