/**
 * Created by G on 08.08.2017.
 */
'use strict';


exports.indexAction = function(req, res) {
    console.log('Landong');
    res.render('landing', { title: 'The index page!' });
    return false;
    //res.status(200).send('Hello World!');
};