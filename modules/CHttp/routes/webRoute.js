/**
 * Created by G on 08.08.2017.
 */
'use strict';

module.exports = function(app) {
    var ejs = require('ejs');
    var auth = require(global.CHTTP_DIR + '/auth/auth');
    app.set('view engine', 'html');
    app.engine('.html', ejs.renderFile);
    app.set('views', global.CHTTP_DIR + '/views');

    var authController = require(global.CHTTP_DIR + '/controllers/AuthController');
    var webController = require(global.CHTTP_DIR + '/controllers/WebController');
    var landingController = require(global.CHTTP_DIR + '/controllers/LandingController');

    app.get('/', landingController.indexAction);
    app.get('/login', authController.loginAction);
    app.post('/login', authController.authenticateAction);
    app.get('/dashboard', auth.checkAccessorWeb, webController.dashboardAction);
};