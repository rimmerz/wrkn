/**
 * Created by G on 08.08.2017.
 */
'use strict';

var CComponent = require(global.CORE_DIR + '/components/CComponent');
var CEventProvider = require(global.CORE_DIR + '/components/CEventProvider');

exports.loginAction = function(req, res) {

    var CFormProvider = CComponent.loadComponent(req, res, 'web/CFormProvider', {});

    /*var SystemComponent = require(global.COREMODELS_DIR + '/SystemComponent.js').SystemComponent;
    var SystemComponents = new SystemComponent();
    SystemComponents.getComponentsRepresentation();*/

    //console.log('LOGIN ACTION', CFormProvider.render('login'));
    res.render('login', { title: 'The index page!' })
};
exports.authenticateAction = function(req, res) {
    var auth = require(global.CHTTP_DIR + '/auth/auth');
    var CModalProvider = CComponent.loadComponent(req, res, 'web/CModalProvider', {});

    if ( req.body.hasOwnProperty('authenticate') ) {
        var postData = req.body.authenticate;
        var email = postData.email;
        var password = postData.password;

        if ( email && password ) {
            auth.authenticate(email, password).then(function(systemUser){
                auth.logIn(req, systemUser, false).then(function(){
                    CEventProvider.emit('systemuser:login', {systemuser: systemUser});
                    CEventProvider.emit('appservice:flash', {systemuser_id: systemUser._id, message: 'Joined: ' + systemUser.firstName + ' ' + systemUser.lastName});
                    res.redirect('/dashboard');
                }).catch(function(err){
                    CModalProvider.notifyOnError('Unable to log signing');
                    res.redirect('/login');
                });
            }).catch(function(err){
                CModalProvider.notifyOnError('Account not found');
                res.redirect('/login');
            });
        } else {
            CModalProvider.notifyOnError('Email and password must be filled');
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
};