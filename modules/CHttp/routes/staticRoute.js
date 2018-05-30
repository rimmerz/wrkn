/**
 * Created by G on 08.08.2017.
 */
'use strict';

module.exports = function(app) {
    app.use(global.core.frameworkLib.static(global.CHTTP_DIR + '/vendor/gentenella'));
    app.use(global.core.frameworkLib.static(global.CHTTP_DIR + '/vendor/application'));
};