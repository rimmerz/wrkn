var CComponentProxy = function(){
    var self = this;
    this.CComponentUser = require('./CComponentUser');
    this.behaviour = {
        get(target, property, receiver) {
            const calledProperty = target[property];
            if ( property == 'getInstance' ) {
                return function() {
                    return target;
                };
            } else {
                if (calledProperty == undefined) {
                    return function () {
                        return null;
                    }
                } else {
                    switch (typeof calledProperty) {
                        case 'object':
                            return calledProperty;
                            break;
                        case 'function':
                            return function () {
                                if ( property == 'requestPatch' ) {
                                    self.CComponentUser.discoverRequest(arguments[0], arguments[1], arguments[2]);
                                }
                                let result = calledProperty.apply(this, arguments);
                                return result;
                            };
                            break;
                        default:
                            return calledProperty;
                            break;
                    }
                }
            }
        }
    };
    this.applyFor = function(client){
        return new Proxy(client, self.behaviour);
    };
    return self;
};

module.exports = new CComponentProxy;