/**
 * Created by G on 21.05.2018.
 */
'use strict';

global.ROOT_DIR = __dirname;
let _coreGlobals = require('./core/core.js').coreGlobals;
global.core = new _coreGlobals;

var mongo = global.core.db.mongo;
var framework = global.core.framework;
mongo.connection.on('connected', function(){
    var CSocketApp = require('./modules/CSocketApp.js').CSocketApp;
    new CSocketApp(framework);
    var CHttpApp = require('./modules/CHttpApp.js').CHttpApp;
    new CHttpApp(framework);
});