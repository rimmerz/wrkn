/**
 * Created by G on 18.07.2017.
 */
exports.coreGlobals = function(){
    global.CHTTP_DIR = global.ROOT_DIR + '/modules/CHttp';
    global.CORE_DIR = global.ROOT_DIR + '/core';
    global.COREMODELS_DIR = global.CORE_DIR + '/models';
    global.CHTTPVIEWS_DIR = global.CHTTP_DIR + '/views';

    this._config = require(global.CORE_DIR + '/constants/config.json');
    //this.moment = require('moment');
    this.debug = require('debug')('app');
    this.db = {
        mongo: {
            connection: null,
            mongoose: null
        },
        mysql: {
            connection: null,
            activerecord: null
        },
        mssql: {
            connection: null,
            sequelize: null
        }
    };
    this.framework = null;
    this.frameworkLib = null;

    this.loadMongo();
    this.loadMysql();
    this.loadMssql();
    this.loadApplicationComponents();
    return this;
};

exports.coreGlobals.prototype.loadApplicationComponents = function(){
    this.frameworkLib = require('express');
    this.framework = this.frameworkLib();
};

exports.coreGlobals.prototype.loadMysql = function(){
    var self = this;

    /*self.db.mysql.activerecord = require('mysql-activerecord');
    self.db.mysql.connection = new self.db.mysql.activerecord.Adapter({
        host: self._config.db.mysql.host,
        port: self._config.db.mysql.port,
        user: self._config.db.mysql.user,
        password: self._config.db.mysql.pass,
        database: self._config.db.mysql.slaveDb
    });*/
};

exports.coreGlobals.prototype.loadMongo = function(){
    var self = this;
    self.db.mongo.mongoose = require('mongoose');

    self.db.mongo.connection = self.db.mongo.mongoose.createConnection('mongodb://' +
        self._config.db.mongo.user + ':' +
        self._config.db.mongo.pass + '@' +
        self._config.db.mongo.host + '/' +
        self._config.db.mongo.db + '?authSource=' +
        self._config.db.mongo.authDb + '&authMechanism=' +
        self._config.db.mongo.authMechanism, function(err, res){
        if (err) {
            console.log ('MongoDb: ERROR connecting: ' + err);
        } else {
            console.log ('MongoDb: Connected');
        }
    });
};

exports.coreGlobals.prototype.loadMssql = function(){
    /*var self = this;
    var Sequelize = require('sequelize');
    self.db.mssql.sequelize = Sequelize;

    self.db.mssql.connection = new Sequelize(self._config.db.mssql.db, self._config.db.mssql.user, self._config.db.mssql.pass, {
        host: self._config.db.mssql.host,
        dialect: 'mssql',
        benchmark: false,
        logging: false,
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        }
    });

    self.db.mssql.connection.authenticate().then(function(){
        console.log ('MSSql: Connected');
    }).catch(function(err){
        console.log ('MSSql: ERROR connecting: ' + err);
    });*/
};