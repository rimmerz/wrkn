/**
 * Created by G on 19.10.2017.
 */
var CDataProvider = function(){
    this._collection = {};
    this.scenarios = {
        decorate: function(row, fields, decorator){
            if (!String.prototype.format) {
                String.prototype.format = function(arguments) {
                    var args = arguments;
                    return this.replace(/{(\d+)}/g, function(match, needle) {
                        return (typeof args[needle] != 'undefined') ? args[needle] : match;
                    });
                };
            }
            var _values = [];
            for ( var i in fields ) {
                if ( row.hasOwnProperty(fields[i]) ) {
                    _values.push(row[fields[i]]);
                }
            }
            return decorator.format(_values);
        }
    };
    return this;
};

CDataProvider.prototype.useCollection = function(collection){
    var self = this;
    self._collection = collection;
    return self;
};
CDataProvider.prototype.applyMap = function(dataMapping){
    var self = this;
    var collection = self._collection;
    for ( var i in self._collection ) {
        for ( var field in dataMapping ) {
            if ( typeof dataMapping[field] == 'function' ) {
                collection[i][field] = dataMapping[field](collection[i]);
            }
        }
    }
    return collection;
};
CDataProvider.prototype.applyRemap = function(dataMapping){
    var self = this;
    var collection = self._collection;
    for ( var i in self._collection ) {
        for ( var field in dataMapping ) {
            if ( typeof dataMapping[field] == 'function' ) {
                collection[i][field] = dataMapping[field](collection[i]);
            }
        }
    }
    return collection;
};

CDataProvider.prototype.useScenario = function(scenario){

};

module.exports = new CDataProvider;