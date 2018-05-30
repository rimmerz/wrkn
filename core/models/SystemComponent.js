/**
 * Created by G on 18.07.2017.
 */
exports.SystemComponent = function(){
    this.collection = 'SystemComponents';
    this.mongo = global.core.db.mongo;
    this.model = null;
    this.__construct();
    return this;
};
exports.SystemComponent.prototype.__construct = function(){
    var self = this;
    var Schema = self.mongo.mongoose.Schema;
    var ObjectId = Schema.ObjectId;
    self.model = self.mongo.connection.model(self.collection, new Schema({
        _id: ObjectId,
        component: String,
        name: String,
        label: String,
        enabled: Boolean,
        relatedTo: String,
        alwaysEnabled: Boolean
    }), self.collection);

};
var CComponentIterator = function(componentTree, componentItem){
    var componentPath = componentItem.relatedTo.replace(/^\:/, '').split(':');
    var currentComponentPath = componentPath[0];
    if ( componentTree.hasOwnProperty(currentComponentPath) ) {
        if ( componentPath.length > 1 ) {
            delete componentPath[0];
            componentItem.relatedTo = componentPath.join(':');
            componentTree[currentComponentPath] = CComponentIterator(componentTree[currentComponentPath], componentItem);
        } else {
            componentTree[currentComponentPath][componentItem.component] = {
                'enabled': componentItem.enabled,
                'id': componentItem._id
            };
        }
    }
    return componentTree;
};
var RepresentationIterator = function(componentTree, componentItem){
    var componentPath = componentItem.relatedTo.replace(/^\:/, '').split(':');
    var currentComponentPath = componentPath[0];
    if ( componentTree.hasOwnProperty(currentComponentPath) ) { //IF MATCHED PARENT
        if ( !componentTree[currentComponentPath].hasOwnProperty('children') ) {
            componentTree[currentComponentPath]['children'] = {};
        }
        if ( componentPath.length > 1 ) {
            componentPath.splice(0, 1);
            componentItem.relatedTo = componentPath.join(':');
            componentTree[currentComponentPath]['children'] = RepresentationIterator(componentTree[currentComponentPath]['children'], componentItem);
        } else {
            componentTree[currentComponentPath]['children'][componentItem.component] = {
                'component': componentItem.component,
                '_label': componentItem.label,
                'name': componentItem.name,
                'enabled': componentItem.enabled,
                'id': componentItem._id,
                '_parent': componentItem.parent,
                'alwaysEnabled': componentItem.alwaysEnabled
            };
        }
    }
    return componentTree;
};
exports.SystemComponent.prototype.CComponentRules = function(callback){
    var self = this;
    var SystemComponents = self.model;
    SystemComponents.find({}).sort({relatedTo: 1}).exec(function(err, result){
        if ( !err ) {
            var mappedComponents = {};
            for (var key in result) {
                if ( result[key].relatedTo == null ) {
                    mappedComponents[result[key].component] = {
                        'enabled': result[key].enabled,
                        'id': result[key]._id
                    };
                } else {
                    mappedComponents = CComponentIterator(mappedComponents, result[key]);
                }
            }
            callback(mappedComponents);
        } else {
            callback({});
        }
    });
};
exports.SystemComponent.prototype.getComponentsRepresentation = function(){
    var self = this;
    var SystemComponents = self.model;
    return new Promise(function(resolve, reject){
        SystemComponents.find({}).sort({relatedTo: 1}).exec(function(err, result){
            var mappedComponents = {
                list: [],
                tree: {},
                total: 0
            };
            if ( !err ) {
                mappedComponents.total = result.length;
                for (var key in result) {
                    result[key]['parent'] = result[key].relatedTo;
                    mappedComponents.list.push({
                        'component': result[key].component,
                        'label': result[key].label,
                        'name': result[key].name,
                        'enabled': result[key].enabled,
                        'id': result[key].id,
                        'relatedTo': result[key].relatedTo,
                        'alwaysEnabled': result[key].alwaysEnabled
                    });
                    if ( result[key].relatedTo == null ) {
                        mappedComponents.tree[result[key].component] = {
                            'component': result[key].component,
                            '_label': result[key].label,
                            'name': result[key].name,
                            'enabled': result[key].enabled,
                            'id': result[key]._id,
                            '_parent': result[key].parent,
                            'alwaysEnabled': result[key].alwaysEnabled
                        };
                    } else {
                        mappedComponents.tree = RepresentationIterator(mappedComponents.tree, result[key]);
                    }
                }
                resolve(mappedComponents);
            } else {
                reject(mappedComponents);
            }
        });
    });
};
exports.SystemComponent.prototype.getRule = function(id){
    var self = this;
    var SystemComponents = self.model;
    return new Promise(function(resolve, reject){
        SystemComponents.findOne({_id: id}).exec(function(err, result){
            if ( err == null && result != null ) {
                resolve(result);
            } else {
                reject(err);
            }
        });
    });
};
exports.SystemComponent.prototype.updateRule = function(id, attributes){
    var self = this;
    var SystemComponents = self.model;
    if ( !attributes.hasOwnProperty('enabled') ) {
        attributes['enabled'] = false;
    }
    if ( attributes.hasOwnProperty('relatedTo') ) {
        attributes['relatedTo'] = (attributes['relatedTo'] == '') ? null : attributes['relatedTo'];
    }
    return new Promise(function(resolve, reject){
        self.getRule(id).then(function(rule){
            if ( rule.alwaysEnabled ) {
                delete attributes['enabled'];
                delete attributes['relatedTo'];
            }
            SystemComponents.update({
                '_id': id
            }, {
                '$set': attributes
            }, { multi: true }, function(err, result){
                if ( err == null ) {
                    resolve(result);
                } else {
                    reject(err);
                }
            });
        }).catch(function(err){
            console.log('TU', err);
            reject(err);
        });
    });
};