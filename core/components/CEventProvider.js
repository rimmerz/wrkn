/**
 * Created by G on 19.10.2017.
 */
const EventEmitter = require('events');
var SystemEvent = require(global.COREMODELS_DIR + '/SystemEvent.js').SystemEvent;
var SystemEvents = new SystemEvent();
var CEventProvider = function(){
    this.events = null;
    this.__construct = function(){
        if ( this.events == null ) {
            this.events = new EventEmitter;
            this.events['_eventsDetails'] = {};
            this.events['setEventDetails'] = function (event, name, description) {
                this._eventsDetails[event] = {
                    name: name,
                    description: description
                }
            };
        }
    };
    this.__construct();
    return this;
};

CEventProvider.prototype.registerEvents = function (events) {
    var self = this;
    for ( var event in events ) {
        if ( !events[event].hasOwnProperty('name') ) {
            events[event]['name'] = 'Unnamed event';
        }
        if ( !events[event].hasOwnProperty('description') ) {
            events[event]['description'] = null;
        }
        if ( events[event].hasOwnProperty('scenario') ) {
            if ( typeof events[event].scenario == 'function' ) {
                self.on(event, events[event].scenario, events[event].name, events[event].description);
            }
        }
    }
};

CEventProvider.prototype.on = function(event, scenario, name, description){
    var self = this;

    self.events.setEventDetails(event, name, description);
    self.events.on(event, function(args){
        setImmediate(function(){
                SystemEvents.trackUsage(event);
            //TODO apply configurable scenarios
            scenario(event, args);
        });
    });
};

CEventProvider.prototype.emit = function(event, arguments){
    var self = this;
    self.events.emit(event, arguments);
};

CEventProvider.prototype.listEvents = function(){
    var self = this;
    var listEventsData = {};
    for ( var event in self.events._eventsDetails ) {
        if ( event in self.events._events ) {
            listEventsData[event] = {
                name: self.events._eventsDetails[event].name,
                description: self.events._eventsDetails[event].description,
                event: event
            };
        }
    }
    return listEventsData;
};

module.exports = new CEventProvider;


//ON -> listeners and EMIT -> triggers