/**
 * Created by Viktor G on 13.07.2017.
 */
var AppServiceEventStorage = {
    queue: {},
    queueInterval: {}
};
exports.CSocketAppServices = function(io){
    var self = this;
    this.channel = io.of('/services');
    this.events = {
        updateEvent: 0,
        refreshEvent: 0
    };
    this.clients = {};
    this.__construct = function(){
        this.channel.on('connection', function(client){
            self.joinListeners(client);
        });
        self.applyBehaviour();
        var CEventProvider = require(global.CORE_DIR + '/components/CEventProvider');
        CEventProvider.registerEvents({
            'appservice:flash': {
                name: 'Application messages service',
                description: 'Any message realtime delivering',
                scenario: function(event, arg){
                    if ( arg.hasOwnProperty('systemuser_id') ) {
                        if ( !self.clients.hasOwnProperty(arg.systemuser_id) && !AppServiceEventStorage.queueInterval.hasOwnProperty(arg.systemuser_id) ) {

                            /*Delayed queue for clients that not connected*/

                            if (!AppServiceEventStorage.queue.hasOwnProperty(arg.systemuser_id)) {
                                AppServiceEventStorage.queue[arg.systemuser_id] = {};
                            }
                            AppServiceEventStorage.queue[arg.systemuser_id] = {
                                event: event,
                                data: arg
                            };
                            AppServiceEventStorage.queueInterval[arg.systemuser_id] = setInterval(function(){
                                global.core.debug('DELAYED EXECUTION:::::::::::::: for employee: ', arg.systemuser_id, self.clients.hasOwnProperty(arg.systemuser_id));
                                if ( self.clients.hasOwnProperty(arg.systemuser_id) && AppServiceEventStorage.queueInterval.hasOwnProperty(arg.systemuser_id) ) {
                                    clearInterval(AppServiceEventStorage.queueInterval[arg.systemuser_id]);
                                    delete AppServiceEventStorage.queueInterval[arg.systemuser_id];
                                    if ( AppServiceEventStorage.queue.hasOwnProperty(arg.systemuser_id) ) {
                                        self.ServiceEmitor(arg.systemuser_id, AppServiceEventStorage.queue[arg.systemuser_id]);
                                        delete AppServiceEventStorage.queue[arg.systemuser_id];
                                    }
                                }
                            }, 5000);
                        } else {
                            if (self.clients.hasOwnProperty(arg.systemuser_id)) {
                                self.ServiceEmitor(arg.systemuser_id, {
                                    event: event,
                                    data: arg
                                });
                            }
                        }
                    }
                }
            }
        });
    };
    this.__construct();
    return self;
};

exports.CSocketAppServices.prototype.ServiceEmitor = function(id, data){
    var self = this;
    var _receiverId = self.clients[id].id;
    self.channel.to(_receiverId).emit('service', data);
};

exports.CSocketAppServices.prototype.joinListeners = function(client){
    var self = this;

    //Outgoing event for client
    client.on('listen', function(listen){
        global.core.debug('JOIN -> service client ID: ' + listen.cid, listen);
        client.join('service');

        if ( !self.clients.hasOwnProperty(listen.cid) ) {
            self.clients[listen.cid] = {};
        }
        self.clients[listen.cid] = client;
        AppServiceEventStorage.clients = self.clients;
        self.ServiceEmitor(listen.cid, {
            event: 'appservice:flash',
            data: {systemuser_id: listen.cid, message: 'RTC online'}
        });

        client.on('disconnect', function(){
            console.log('DISCONNECTION', listen);
            delete self.clients[listen.cid];
            AppServiceEventStorage.clients = self.clients;
        });
    });
};

exports.CSocketAppServices.prototype.applyService = function(cid){
    var self = this;

    self.ServiceEmitor(cid, {
        event: 'appservice:feed_insert',
        data: {systemuser_id: cid, message: 'WorkOn for: ' + cid, feed_data: {
            title: 'Proposal title - ' + cid,
            description: 'Some description of posted proposal',
            budget: '$50+',
            spent: '$6k+',
            client: 'A. Adams',
            country: 'Canada',
            assessment: 7
        }}
    });
};

exports.CSocketAppServices.prototype.applyBehaviour = function(){
    var self = this;

    setInterval(function(){
        for ( var cid in self.clients ) {
            self.applyService(cid);
        }
    }, 5000);
};
