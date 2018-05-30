/**
 * Created by Viktor G on 14.07.2017.
 */
function CSocketProvider(options){
    var self = this;
    this.options = {
        host: null,
        cid: null
    };
    this.socketIO = null;
    this.serviceIO = null;

    if ( options != undefined ) {
        for ( var option in options ) {
            if ( self.options.hasOwnProperty(option) ) {
                self.options[option] = options[option];
            }
        }
    }

    this.init();

    return self;
};
CSocketProvider.prototype.init = function(){
    var self = this;

    if ( self.options.host != null ) {
        //self.socketIO = io(self.options.host + '/widgets');
        self.serviceIO = io(self.options.host + '/services');
        self.runListener();
    }
};

CSocketProvider.prototype.runListener = function(){
    var self = this;

    var rtc_status = $('#rtc_status');
    self.serviceIO.on('connect', function(){

        rtc_status.addClass('online');
        rtc_status.removeClass('offline');

        self.serviceIO.emit('listen', {
            cid: self.options.cid
        });
        self.serviceIO.on('service', function(json){
            switch (json.event) {
                case 'appservice:flash':
                    CModalProvider.notify(json.data.message);
                    break;
                case 'appservice:feed_insert':
                    var feed_data = json.data.feed_data;
                    $('#feed-pending h3').after('<a href="#"><div class="proposalContainer">' +
                        '<div class="proposalAssessment">%' + feed_data.assessment +'</div>' +
                        '<div class="proposalTitle">' + feed_data.title +'</div>' +
                        '<div class="proposalDescription">' + feed_data.description +'</div>' +
                        '<div class="proposalInfo">' +
                        '<span>Budget: ' + feed_data.budget +' / Spent: ' + feed_data.spent +'</span>' +
                        '<span>Client: ' + feed_data.client +'</span>' +
                        '<span>Country: ' + feed_data.country +'</span>' +
                        '</div></div></a>');
                    break;
            }
        });
        self.serviceIO.on('reconnect_attempt', function(){
            rtc_status.removeClass('online');
            rtc_status.addClass('offline');
        });
    });

    /*self.socketIO.on('connect', function(){
        self.socketIO.emit('listen', {
            event: 'updateEvent',
            cid: self.options.cid
        });
        self.socketIO.on('update', function(json){
            switch (json.component) {
                case 'call_list':
                    var _data = json.data;
                    self.updateWidgetCallList('.call_list', _data, function(dataItem){
                        if ( dataItem['NextCall'] != null && dataItem['IsPlanned'] == true ) {
                            var _callTime = Date.parse(dataItem['NextCall']);
                            var _nowTime = Date.parse(new Date);
                            return _callTime >= _nowTime;
                        }
                        return false;
                    });
                    break;
                case 'core_restart':
                    if (json.data.hasOwnProperty('jsAction')) {
                        self.jsAction(json.data.jsAction, json.data.arguments);
                    }
                    break;
                default:

                    break;
            }
        });
    });*/
};