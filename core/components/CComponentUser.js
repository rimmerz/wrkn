/**
 * Created by G on 19.10.2017.
 */
var CComponentUser = function(){
    this.discovered = {
        total: 0
    };
    this.discoverRequest = function(req, res, next){
        var self = this;
        if ( req.session.hasOwnProperty('authKey')  && req.session.hasOwnProperty('authId') ) {
            if ( !self.discovered.hasOwnProperty(req.session.authKey) ) {
                console.log('>>>>>>>>>>>>>>>>>DISCOVERING:');
                self.discovered[req.session.authKey] = {
                    user: req.session.user,
                    department: {},
                    permissions: {},
                    sessionData: {
                        authKey: req.session.authKey,
                        authId: req.session.authId
                    }
                };
                self.discovered.total++;
            }
            console.log('<<<<<<<<<<<<<<<<<<<TOTAL DISCOVERED:', self.discovered.total);
            res.locals['CComponentUser'] = {
                user: self.discovered[req.session.authKey].user,
                permitted: self.permitted
            };
        }
    };

    return this;
};

CComponentUser.prototype.permitted = function(permission){

    return false;
};

module.exports = new CComponentUser;