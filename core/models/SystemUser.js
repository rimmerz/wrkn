/**
 * Created by G on 18.07.2017.
 */
exports.SystemUser = function(){
    this.collection = 'SystemUsers';
    this.mongo = global.core.db.mongo;
    this.model = null;
    this.__construct();
    this.departments = {};
    return this;
};
exports.SystemUser.prototype.__construct = function(){
    var self = this;
    var Schema = self.mongo.mongoose.Schema;
    var ObjectId = Schema.ObjectId;
    self.model = self.mongo.connection.model(self.collection, new Schema({
        _id: String,
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        authOnline: Boolean,
        authIp: String,
        authHash: String,
        department_id: ObjectId
    }), self.collection);

    /*var SystemDepartment = require(global.COREMODELS_DIR + '/SystemDepartment').SystemDepartment;
    var SystemDepartments = new SystemDepartment;
    SystemDepartments.getAll(function(err, result){
        if ( !err && result ) {
            for ( var i in result ) {
                self.departments[result[i]._id] = result[i];
            }
        }
    });*/

};
exports.SystemUser.prototype.getProfile = function(criteria){
    var self = this;
    var SystemUsers = self.model;

    return new Promise(function(resolve, reject){
        SystemUsers.findOne(criteria).lean().exec(function(err, result){
            if ( !err && result ) {
                //TODO get permissions for user and for department then merge and return full data (SystemUser 46 Line)
                resolve(result);

            } else {
                reject((err != null) ? err : 'Not found');
            }
        });
    });
};
exports.SystemUser.prototype.getAll = function(callback){
    var self = this;
    var SystemUsers = self.model;
    SystemUsers.find({}).exec(function(err, result){
        callback(err, result);
    });
};
exports.SystemUser.prototype.getWithFilters = function(filters, offset, limit, sortColumn, sortOrder, callback){
    var self = this;
    var SystemUsers = self.model;

    var sort = {};
    sort[sortColumn] = sortOrder;

    SystemUsers.find(filters).sort(sort).limit(limit).skip(offset).lean().exec(function(err, result){
        SystemUsers.count(filters, function(_cerr, total) {
            callback(err, result, total);
        });
    });
};
exports.SystemUser.prototype.addUser = function(options, callback){
    var self = this;
    var SystemUsers = self.model;

    var systemUser = new SystemUsers(options);
    systemUser.save(function(err, result){
        callback(err, result);
    });
};