/**
 * Created by G on 05.10.2017.
 */
var CFormProvider = function(domObjectId){
    this.options = {
        domObjectId: null,
        action: null,
        _actionPatches: {},
        method: 'POST'
    };
    this.crud = {
        get: {
            action: '/ds/get/:scenario/id/:id',
            method: 'GET'
        },
        list: {
            action: '/ds/list/:scenario',
            method: 'GET'
        },
        delete: {
            action: '/ds/delete/:scenario/id/:id',
            method: 'GET'
        },
        create: {
            action: '/ds/create/:scenario',
            method: 'POST'
        },
        update: {
            action: '/ds/update/:scenario/id/:id',
            method: 'POST'
        }
    };
    this.domObject = null;
    this.__construct = function(domObjectId){
        var self = this;
        var domObject = $('#' + domObjectId);
        if ( domObject.length == 1 ) {
            self.options.domObjectId = domObjectId;
            self.domObject = domObject;
            self.options.action = (domObject[0].hasAttribute('action')) ? domObject.attr('action') : window.location.href;
            self.applyHandlers();
        }
    };
    this.__construct(domObjectId);
    return this;
};

CFormProvider.prototype.actionPatch = function(){
    var self = this;
    var patches = self.options._actionPatches;
    var patchedAction = self.options.action;
    for ( var alias in patches ) {
        if ( alias.match(/\:*/) ) {
            if (patches[alias].match(/value\:*/)) {
                var value = patches[alias].replace('value:', '');
                patchedAction = patchedAction.replace(alias, value);
            }
            if (patches[alias].match(/element\:*/)) {
                var selector = patches[alias].replace('element:', '');
                var value = $(selector).val();
                patchedAction = patchedAction.replace(alias, value);
            }
        }
    }
    self.domObject.attr('action', patchedAction);
    return patchedAction;
};

CFormProvider.prototype.actionPatches = function(options){
    var self = this;
    self.options._actionPatches = options;
    return self;
};

CFormProvider.prototype.makeRequest = function(isOriginalEvent, onSuccess, onFailed){
    var self = this;
    var patchedAction = self.actionPatch();
    var type = (isOriginalEvent) ? self.domObject.attr('method') : self.options.method;
    var data = (type == 'POST') ? self.domObject.serializeArray() : null;

    $.ajax({
        url: patchedAction,
        type: type,
        data: data,
        success: function(json, textStatus, jqXHR) {
            CModalProvider.notify('Done');
            if ( typeof onSuccess == 'function' ) {
                onSuccess(json, textStatus, jqXHR);
            }
        },
        error: function(json, textStatus, jqXHR){
            CModalProvider.notifyOnError(json.error);
            if ( typeof onFailed == 'function' ) {
                onFailed(json, textStatus, jqXHR);
            }
        }
    });
};

CFormProvider.prototype.applyHandlers = function(){
    var self = this;
    var CFormProviderActions = {
        get: function(onSuccess, onFailed){
            self.options.action = self.crud.get.action;
            self.options.method = self.crud.get.method;
            self.makeRequest(false, onSuccess, onFailed);
        },
        list: function(onSuccess, onFailed){
            self.options.action = self.crud.list.action;
            self.options.method = self.crud.list.method;
            self.makeRequest(false, onSuccess, onFailed);
        },
        create: function(onSuccess, onFailed){
            self.options.action = self.crud.create.action;
            self.options.method = self.crud.create.method;
            self.makeRequest(false, onSuccess, onFailed);
        },
        update: function(onSuccess, onFailed){
            self.options.action = self.crud.update.action;
            self.options.method = self.crud.update.method;
            self.makeRequest(false, onSuccess, onFailed);
        },
        delete: function(onSuccess, onFailed){
            self.options.action = self.crud.delete.action;
            self.options.method = self.crud.delete.method;
            self.makeRequest(false, onSuccess, onFailed);
        }
    };
    self.domObject[0]['CFormProvider'] = CFormProviderActions;
    self.domObject.__proto__.CFormProvider = CFormProviderActions;
    self.domObject.on({
        'submit': function(event) {
            event.preventDefault();
            self.makeRequest(true);
        }
    });
};