/**
 * Created by G on 04.10.2017.
 */
var CComponentTree = function(selector){
    var self = this;
    this.domObject = null;
    this.__construct = function(selector){
        var _domObject = $(selector);
        if  ( _domObject.length == 1 ) {
            this.domObject = _domObject;
        }
        return this;
    };
    self.__construct(selector);
    return self;
};

CComponentTree.prototype.init = function(data){
    var self = this;
    self.domObject.tree({
        autoOpen: true,
        dragAndDrop: false,
        data: data
    });
    self.initListeners();
    return self;
};

CComponentTree.prototype.initListeners = function(){
    var self = this;
    self.domObject.bind({
        'tree.select': function(event) {
            if ( event.node ) {
                self.fillForm(event.node);
            } else {
                self.resetForm();
            }
        }
    });
};

CComponentTree.prototype.getSelected = function(){
    return self.domObject.tree('getSelectedNode');
};

CComponentTree.prototype.resetForm = function(){
    var inputID = $('[name="SystemComponent[_id]"]');
    var inputName = $('[name="SystemComponent[name]"]');
    var inputLabel = $('[name="SystemComponent[label]"]');
    var inputComponent = $('[name="SystemComponent[component]"]');
    var inputEnabled = $('[name="SystemComponent[enabled]"]');
    var inputRelatedTo = $('[name="SystemComponent[relatedTo]"]');
    inputEnabled.removeAttr('disabled');
    inputRelatedTo.removeAttr('disabled');
    inputComponent.val('');
    inputLabel.val('');
    inputName.val('');
    inputID.val('');
    inputRelatedTo.val('').select2();
    if ( inputEnabled.is(':checked') ) {
        inputEnabled.click();
    }
};

CComponentTree.prototype.fillForm = function(nodeData){
    var inputID = $('[name="SystemComponent[_id]"]');
    var inputName = $('[name="SystemComponent[name]"]');
    var inputLabel = $('[name="SystemComponent[label]"]');
    var inputComponent = $('[name="SystemComponent[component]"]');
    var inputEnabled = $('[name="SystemComponent[enabled]"]');
    var inputRelatedTo = $('[name="SystemComponent[relatedTo]"]');
    if ( nodeData ) {
        inputComponent.val(nodeData.component);
        inputLabel.val(nodeData._label);
        inputName.val(nodeData.name);
        inputID.val(nodeData.id);
        inputRelatedTo.val(nodeData._parent).select2();
        if ( nodeData.enabled ) {
            if ( !inputEnabled.is(':checked') ) {
                inputEnabled.click();
            }
            inputEnabled.attr('checked', true);
        } else {
            if ( inputEnabled.is(':checked') ) {
                inputEnabled.click();
            }
        }
        if ( nodeData.alwaysEnabled ) {
            inputEnabled.attr('disabled', true);
            inputRelatedTo.attr('disabled', true);
        } else {
            inputEnabled.removeAttr('disabled');
            inputRelatedTo.removeAttr('disabled');
        }
    }
};