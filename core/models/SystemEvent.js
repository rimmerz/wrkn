/**
 * Created by G on 02.11.2017.
 */
exports.SystemEvent = function(){
    this.collection = 'SystemEvents';
    this.mongo = global.core.db.mongo;
    this.model = null;
    this.__construct();
    return this;
};
exports.SystemEvent.prototype.__construct = function(){
    var self = this;
    var Schema = self.mongo.mongoose.Schema;
    var ObjectId = Schema.ObjectId;
    self.model = self.mongo.connection.model(self.collection, new Schema({
        event: String,
        scenario: String,
        usage: Number
    }), self.collection);
};
exports.SystemEvent.prototype.getAll = function(callback){
    var self = this;
    var SystemEvents = self.model;
    SystemEvents.find({}).exec(function(err, result){
        callback(err, result);
    });
};
exports.SystemEvent.prototype.getAllGrouped = function(callback){
    var self = this;
    var SystemEvents = self.model;
    SystemEvents.find({}).exec(function(err, result){
        var mappedEvents = {};
        if ( err == null && result ) {
            for (var i in result) {
                if ( !mappedEvents.hasOwnProperty(result[i].event) ) {
                    mappedEvents[result[i].event] = [];
                }
                mappedEvents[result[i].event].push(result[i]);
            }
        }
        callback(err, mappedEvents);
    });
};
exports.SystemEvent.prototype.getWithFilters = function(filters, offset, limit, sortColumn, sortOrder, callback){
    var self = this;
    var SystemEvents = self.model;

    var sort = {};
    sort[sortColumn] = sortOrder;

    SystemEvents.find(filters).sort(sort).limit(limit).skip(offset).lean().exec(function(err, result){
        SystemEvents.count(filters, function(_cerr, total) {
            callback(err, result, total);
        });
    });
};
exports.SystemEvent.prototype.addEvent = function(options, callback){
    var self = this;
    var SystemEvents = self.model;

    var systemEvent = new SystemEvents(options);
    systemEvent.save(function(err, result){
        callback(err, result);
    });
};
exports.SystemEvent.prototype.trackUsage = function(event){
    var self = this;
    var SystemEvents = self.model;

    SystemEvents.update({
        'event': event
    }, {
        '$inc': {
            'usage': 1
        }
    }, { multi: true }, function(err, result){

    });
};