/**
 * Created by G on 06.09.2017.
 */
function CTableProviderExtraAction(tableHolderId){

    this.tableProvider = null;
    this.tableHolderId = null;

    this.__construct = function(tableHolderId) {
        var self = this;
        self.tableProvider = CTableProvider.tables[tableHolderId];
        self.tableHolderId = tableHolderId;
        return this;
    };

    return this.__construct(tableHolderId);
}

CTableProviderExtraAction.prototype.selectedAssignToEmployee = function() {
    var self = this;

    return {
        proceedOne: function(guid, selectId){
            var selectDom = $('#' + selectId);
            var selectedValue = selectDom.val();
            var url = selectDom.closest('form').attr('data-url');

            var assignToEmployeeData = {
                assignToEmployee: {}
            };

            assignToEmployeeData.assignToEmployee[guid] = {
                employeeId: selectedValue,
                guid: guid
            };

            CTableProvider.callHost(url, assignToEmployeeData, function(jsonData, textStatus, jqXHR){
                self.tableProvider.toolbar.flash((jsonData.status) ? 'Assigned successfully' : jsonData.error, jsonData.status);
            }, function(jsonData, textStatus, jqXHR){
                self.tableProvider.toolbar.flash(jsonData.error, jsonData.status);
            });
        },
        proceedSelected: function(selectId){
            var selectedRows = self.tableProvider.renderObject.getData(true);
            if ( selectedRows.rows.length > 0 ) {
                var selectDom = $('#' + selectId);
                var selectedValue = selectDom.val();
                var url = selectDom.closest('form').attr('data-url');
                var assignToEmployeeData = {
                    assignToEmployee: {}
                };
                if ( typeof selectedValue == 'object' && selectedValue.length > 0 ) {
                    for ( var i in selectedRows.rows ) {
                        var guid = selectedRows.rows[i]['_id'];
                        var iteration = parseInt(i % parseInt(selectedValue.length));
                        console.log(i, iteration, selectedValue.length);
                        assignToEmployeeData.assignToEmployee[guid] = {
                            employeeId: selectedValue[iteration],
                            guid: guid
                        };
                    }
                    CTableProvider.callHost(url, assignToEmployeeData, function(jsonData, textStatus, jqXHR){
                        self.tableProvider.toolbar.flash((jsonData.status) ? 'Assigned successfully' : jsonData.error, jsonData.status);
                        if ( jsonData.status ) {
                            CTableProvider.applyPage(self.tableHolderId, 0);
                        }
                    }, function(jsonData, textStatus, jqXHR){
                        self.tableProvider.toolbar.flash(jsonData.error, jsonData.status);
                    });
                } else {
                    self.tableProvider.toolbar.flash('Choose one or more employees first', false);
                }
            } else {
                self.tableProvider.toolbar.flash('Choose one or more customers first', false);
            }
        }
    };
};

CTableProviderExtraAction.prototype.selectedChangeStatus = function() {
    var self = this;

    return {
        proceedSelected: function(selectId){
            var selectedRows = self.tableProvider.renderObject.getData(true);
            if ( selectedRows.rows.length > 0 ) {
                var selectDom = $('#' + selectId);
                var selectedValue = selectDom.val();
                var url = selectDom.closest('form').attr('data-url');
                var changeStatusData = {
                    changeSalesStatus: {}
                };
                for ( var i in selectedRows.rows ) {
                    var guid = selectedRows.rows[i]['_id'];
                    changeStatusData.changeSalesStatus[guid] = {
                        salesStatusId: selectedValue,
                        guid: guid
                    };
                }
                self.tableProvider.toolbar.flash('Deleting in pogress', true);
                CTableProvider.callHost(url, changeStatusData, function(jsonData, textStatus, jqXHR){
                    self.tableProvider.toolbar.flash((jsonData.status) ? 'Changed successfully' : jsonData.error, jsonData.status);
                    if ( jsonData.status ) {
                        CTableProvider.applyPage(self.tableHolderId, 0);
                    }
                }, function(jsonData, textStatus, jqXHR){
                    self.tableProvider.toolbar.flash(jsonData.error, jsonData.status);
                });
            } else {
                self.tableProvider.toolbar.flash('Choose one or more customers first', false);
            }
        }
    };
};

TableProviderExtraAction.prototype.selectedNotifyGroup = function() {
    var self = this;

    return {
        proceedSelected: function(selectId){
            var selectedRows = self.tableProvider.renderObject.getData(true);
            if ( selectedRows.rows.length > 0 ) {
                var selectDom = $('#' + selectId);
                var url = selectDom.closest('form').attr('data-url');
                var notifyData = {
                    customers: [],
                    notificationContent: selectDom.val()
                };
                var selectedAll = selectedRows.rows.length == TableProvider.tables[tableHolderId].pagerData.perPage;

                console.log(selectedAll);
                if(selectedAll) {
                    selectedRows.rows  = TableProvider.getRowsWithSelection(self.tableHolderId, 0);
                    for ( var i in selectedRows.rows ) {
                        var guid = selectedRows.rows[i]['_id'];
                        notifyData.customers.push(guid);
                    }
                } else {
                    for ( var i in selectedRows.rows ) {
                        var guid = selectedRows.rows[i]['_id'];
                        notifyData.customers.push(guid);
                    }
                }

                console.log(url);
                self.tableProvider.toolbar.flash('Notification in pogress', true);
                TableProvider.callHost(url, notifyData, function(jsonData, textStatus, jqXHR){
                    self.tableProvider.toolbar.flash((jsonData.status) ? 'Successfully notified' : jsonData.error, jsonData.status);
                    if ( jsonData.status ) {
                        TableProvider.applyPageWithSelection(self.tableHolderId, 0, selectedRows);
                    }
                }, function(jsonData, textStatus, jqXHR){
                    self.tableProvider.toolbar.flash(jsonData.error, jsonData.status);
                });
            } else {
                self.tableProvider.toolbar.flash('Choose one or more customers first', false);
            }
        }
    };
};

CTableProviderExtraAction.prototype.selectedDelete = function() {
    var self = this;

    return {
        proceedSelected: function(url){
            var selectedRows = self.tableProvider.renderObject.getData(true);
            if ( selectedRows.rows.length > 0 ) {
                if ( confirm('Delete selected records?') ) {
                    var deleteLeadData = {
                        deleteLead: []
                    };
                    for (var i in selectedRows.rows) {
                        var guid = selectedRows.rows[i]['_id'];
                        deleteLeadData.deleteLead.push(guid);
                    }
                    CTableProvider.callHost(url, deleteLeadData, function (jsonData, textStatus, jqXHR) {
                        self.tableProvider.toolbar.flash((jsonData.status) ? 'Deleted successfully' : jsonData.error, jsonData.status);
                        if (jsonData.status) {
                            CTableProvider.applyPage(self.tableHolderId, 0);
                        }
                    }, function (jsonData, textStatus, jqXHR) {
                        self.tableProvider.toolbar.flash(jsonData.error, jsonData.status);
                    });
                }
            } else {
                self.tableProvider.toolbar.flash('Choose one or more customers first', false);
            }
        }
    };
};