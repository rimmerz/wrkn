/**
 * Created by Viktor G on 13.07.2017.
 */
exports.CHttpApp = function(app) {
    this.expressApp = app;
    var CComponent = require(global.CORE_DIR + '/components/CComponent'); //JUST init CComponent base
    this.runHttpInstance();
};

exports.CHttpApp.prototype.runHttpInstance = function(){
    var self = this;
    var bodyParser = require('body-parser');
    var session = require('express-session');
    var cookieParser = require('cookie-parser');
    var CComponent = require(global.CORE_DIR + '/components/CComponent'); //JUST init CComponent base
    var apiRoutes = require(global.CHTTP_DIR + '/routes/saasRoute');
    var webRoutes = require(global.CHTTP_DIR + '/routes/webRoute');
    var crudRoutes = require(global.CHTTP_DIR + '/routes/crudRoute');
    var staticRoutes = require(global.CHTTP_DIR + '/routes/staticRoute')(self.expressApp);

    var CEventProvider = require(global.CORE_DIR + '/components/CEventProvider');
    CEventProvider.registerEvents({
        'systemuser:login': {
            name: 'System user login',
            description: 'Fire when user successfully logged in',
            scenario: function(event, arg){
                global.core.debug('---------LOGGED IN USER', event, arg);
            }
        },
        'route:usage': {
            name: 'Route usage',
            description: 'Fire on any action',
            scenario: function(event, arg){
                global.core.debug('---------AZAZ2', event, arg); //Collect usage for stat
            }
        }
    });

    var guid = function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };

    self.expressApp.use(session({
        genid: function(req) {
            return guid();
        },
        cookie: {
            maxAge: 36000000,
            secure: false,
            httpOnly: false
        },
        secret: 'aezakmi',
        resave: false,
        saveUninitialized: false
    }));

    self.expressApp.use(bodyParser.urlencoded({extended: true}));
    self.expressApp.use(bodyParser.json());
    self.expressApp.use(cookieParser());
    self.expressApp.use(function(req, res, next){
        CComponent.requestPatch(req, res, next);
        var authId = (req.session.hasOwnProperty('authId')) ? req.session.authId : null;
        if ( typeof req == 'object' && req.hasOwnProperty('route') ) {
            if (req.route.hasOwnProperty('path')) {
                CEventProvider.emit('route:usage', {
                    route: req.route.path,
                    session: authId
                });
            }
        }
    });


    var server = self.expressApp.listen(global.core._config.tcp.http.port, function() {
        global.core.debug('WEB APP: ' + global.core._config.tcp.http.host + ':' + global.core._config.tcp.http.port);
    });

    server.setTimeout(10*60*1000);

    apiRoutes(self.expressApp);
    webRoutes(self.expressApp);
    crudRoutes(self.expressApp);
};