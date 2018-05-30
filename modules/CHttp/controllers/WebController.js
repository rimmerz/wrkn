/**
 * Created by G on 08.08.2017.
 */
'use strict';


exports.dashboardAction = function(req, res) {
    var CComponent = require(global.CORE_DIR + '/components/CComponent');
    var CSocketProvider = CComponent.loadComponent(req, res, 'web/CSocketProvider', {});
    res.render('dashboard', {
        title: 'The index page!',
        description: ''
    });
    return false;
    //res.status(200).send('Hello World!');
};

exports.customersAction = function(req, res) {
    res.render('customers', {
        title: 'Customers',
        description: 'Real accounts'
    });
    return false;
};