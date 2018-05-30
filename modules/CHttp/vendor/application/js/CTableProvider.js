/**
 * Created by G on 30.08.2017.
 */
function CTableProvider(){
    this.tables = {};

    this.initTable = function(tableHolderId, actionUrl, options, defaults) {
        var self = this;

        var tableHolderDomObject = $('#' + tableHolderId);
        if ( tableHolderDomObject.length == 1 ) {
            self.tables[tableHolderId] = {
                domSelector: '#' + tableHolderId,
                domIdentifier: tableHolderId,
                domHolderObject: tableHolderDomObject,
                actionUrl: actionUrl,
                defaults: {
                    page: 0,
                    perPage: 50,
                    sortColumn: (defaults !== null && typeof defaults.sortColumn !== 'undefined') ? defaults.sortColumn : 'CreationTime',
                    sortOrder: (defaults !== null && typeof defaults.sortOrder !== 'undefined') ? defaults.sortOrder : -1
                },
                pagerData: {
                    page: 0,
                    total: 0,
                },
                sortData: {
                    sortColumn: 'CreationTime',
                    sortOrder: -1
                },
                callbacks: {
                    afterLoad: function(){},
                },
                rendered: false,
                renderObject: null,
                filters: {},
                toolbar: {
                    holder: null,
                    tools: null,
                    label: null,
                    flash: function(text, isSuccess){
                        CModalProvider.notify(text);
                    },
                    options: options
                },
                widgets: {},
                columnState: {},
                spinner: null,
                columnConfiguration:{},
                totalColumns: 0
            };
            self.afterInit(tableHolderId);
        }

        return self;
    };

    this.checkedItems = function(tableHolderId) {
        var self = this;
        var tableProvider = self.tables[tableHolderId];

        var dataProvider = tableProvider.renderObject.getData(true);

        return dataProvider.rows;
    };

    this.afterLoad = function(tableHolderId, callback) {
        var self = this;
        var tableProvider = self.tables[tableHolderId];
        if ( typeof callback === 'function') {
            tableProvider.callbacks.afterLoad = callback;
        }
        return self;
    };

    this.__construct = function() {
        var self = this;
        return this;
    };
    return this.__construct();
}

CTableProvider.prototype.afterInit = function(tableHolderId) {
    var self = this;
    var tableProvider = self.tables[tableHolderId];

    if ( tableProvider.actionUrl ) {
        self.loadTableData(tableHolderId, tableProvider.defaults.page, tableProvider.defaults.perPage, tableProvider.defaults.sortColumn, tableProvider.defaults.sortOrder)
    }
};

CTableProvider.prototype.callHost = function (url, data, successCallback, failedCallback) {
    var type = (typeof data === 'undefined' || !data) ? 'GET' : 'POST';

    if(typeof failedCallback === 'undefined' || !failedCallback){
        failedCallback = errorFunction;
    }

    $.ajax({
        url: url,
        type: type,
        data: data,
        headers: {
            'employee-visibility':'[]',
            'auth-key':'a76014c5-b9a6-4938-89d3-40f904eef84a',
            //'Content-Type':'application/json'
        },
        success: function(jsonData, textStatus, jqXHR) {
            if ( jsonData.success ) {
                successCallback(jsonData, textStatus, jqXHR);
            } else {
                failedCallback(jsonData, textStatus, jqXHR);
            }
        },
        error: failedCallback
    });
};

CTableProvider.prototype.applyFilter = function(tableHolderId, postData) {
    var self = this;
    var tableProvider = self.tables[tableHolderId];

    for ( var filter in postData ) {
        tableProvider.filters[filter] = postData[filter];
    }

    self.loadTableData(tableHolderId, tableProvider.defaults.page, tableProvider.defaults.perPage, tableProvider.sortData.sortColumn, tableProvider.sortData.sortOrder, tableProvider.filters);
};

CTableProvider.prototype.applySort = function(tableHolderId, column, order) {
    var self = this;
    var tableProvider = self.tables[tableHolderId];

    self.loadTableData(tableHolderId, tableProvider.defaults.page, tableProvider.defaults.perPage, column, order, tableProvider.filters);
};

CTableProvider.prototype.applyPage = function(tableHolderId, page) {
    var self = this;
    var tableProvider = self.tables[tableHolderId];

    self.loadTableData(tableHolderId, page, tableProvider.defaults.perPage, tableProvider.sortData.sortColumn, tableProvider.sortData.sortOrder, tableProvider.filters);
};

CTableProvider.prototype.applyPageFromInput = function(tableHolderId, input) {
    var self = this;
    var tableProvider = self.tables[tableHolderId];

    var UIpage = parseInt(tableProvider.pagerData.page + 1);
    var UItotalPages = parseInt((tableProvider.pagerData.total / tableProvider.defaults.perPage) + 1) || 1;

    var inputValue = parseInt($(input).val());
    if ( inputValue > 0 && inputValue <= UItotalPages ) {
        var page = inputValue - 1;
        self.loadTableData(tableHolderId, page, tableProvider.defaults.perPage, tableProvider.defaults.sortColumn, tableProvider.defaults.sortOrder, tableProvider.filters);
    } else {
        $(input).val(UIpage);
        CModalProvider.notifyOnError('Please, put positive numeric value form interval of available pages!');
    }
};

CTableProvider.prototype.createToolbar = function(tableHolderId) {
    var self = this;
    var tableProvider = self.tables[tableHolderId];

    if ( tableProvider.toolbar.holder == null ) {
        var tableToolbarTemplate = '<div class="CTableProviderToolbar"></div>';
        var tableToolbalLabelTemplate = '<h6></h6>';
        var tableToolbalToolsTemplate = '<div class="tools"></div>';

        tableProvider.toolbar.holder = $(tableToolbarTemplate).prependTo(tableProvider.domHolderObject);
        tableProvider.toolbar.label = $(tableToolbalLabelTemplate).appendTo(tableProvider.toolbar.holder);
        tableProvider.toolbar.tools = $(tableToolbalToolsTemplate).appendTo(tableProvider.toolbar.holder);

        self.createFilterManager(tableHolderId);

        if(tableProvider.toolbar.options.export === true) {
            self.createReportManager(tableHolderId);
        }

        self.createColumnManager(tableHolderId);
        self.createExtraActionWidgets(tableHolderId);
    }
};

CTableProvider.prototype.createFilterManager = function(tableHolderId) {
    var self = this;
    var tableProvider = self.tables[tableHolderId];

    if (tableProvider.toolbar.tools != null) {
        tableProvider.toolbar.tools.append('<button onclick="CTableProviderFilterManagement.manageFilters(\'' + tableHolderId + '\')">' +
            '<span class="glyphicon glyphicon-option-vertical"></span> ' +
            'FILTER_TEMPLATES' +
            '</button>');

        var currentTableInfo = tableProvider.renderObject.getData(true);

        for ( var field in currentTableInfo.cols ) {
            tableProvider.filters[field] = '';
        }
    }
};

CTableProvider.prototype.createReportManager = function(tableHolderId) {
    var self = this;
    var tableProvider = self.tables[tableHolderId];

    if (tableProvider.toolbar.tools != null) {
        tableProvider.toolbar.tools.append('<button onclick="CTableProvider.loadReportFile(this, \'' + tableHolderId + '\')">' +
            '<span class="glyphicon glyphicon-cloud-download"></span> ' +
            'REPORT_EXPORT_CSV' +
            '</button>');
    }
};

CTableProvider.prototype.toggleColumn = function(tableHolderId, checkboxDom, field) {
    var self = this;
    var tableProvider = self.tables[tableHolderId];

    tableProvider.columnState[field] = checkboxDom;
    tableProvider.renderObject.columnPickerClicked(checkboxDom);
};

CTableProvider.prototype.retoggleColumns = function(tableHolderId) {
    var self = this;
    var tableProvider = self.tables[tableHolderId];
    for ( var column in tableProvider.columnState ) {
        tableProvider.renderObject.columnPickerClicked(tableProvider.columnState[column]);
    }
};

CTableProvider.prototype.createColumnManager = function(tableHolderId) {
    var self = this;
    var tableProvider = self.tables[tableHolderId];

    if (tableProvider.toolbar.tools != null) {
        var pickerTemplate = $('<button data-toggle="dropdown">' +
            '<span class="glyphicon glyphicon-pushpin"></span> ' +
            'COLUMN_PICKER' +
            '</button>').appendTo(tableProvider.toolbar.tools);
        var pickerItemsHolderTemplate = $('<ul class="dropdown-menu pull-right"></ul>').appendTo(tableProvider.toolbar.tools);

        var currentTableInfo = tableProvider.renderObject.getData(true);
        var columnPickerItems = '';
        for (var field in currentTableInfo.cols) {
            if (!( currentTableInfo.cols[field].hasOwnProperty('hidden') && currentTableInfo.cols[field].hidden )) {
                $('<li>' +
                    '<input type="checkbox" checked id="picker' + field + '" name="' + field + '" value="' + field + '" onclick="CTableProvider.toggleColumn(\''+tableHolderId+'\', this, \'' + field + '\');">' +
                    currentTableInfo.cols[field].friendly + '' +
                    '</li>').appendTo(pickerItemsHolderTemplate);
            }
        }
    }
};

CTableProvider.prototype.createExtraActionWidgets = function(tableHolderId) {
    var self = this;
    var tableProvider = self.tables[tableHolderId];

    var extraAction = new CTableProviderExtraAction(tableHolderId);
    tableProvider.widgets['selectedAssignToEmployee'] = extraAction.selectedAssignToEmployee();
    tableProvider.widgets['selectedChangeStatus'] = extraAction.selectedChangeStatus();
    tableProvider.widgets['selectedDelete'] = extraAction.selectedDelete();
};

CTableProvider.prototype.createPager = function(tableHolderId) {
    var self = this;
    var tableProvider = self.tables[tableHolderId];

    var UIpage = parseInt(tableProvider.pagerData.page + 1);
    var UItotalPages = parseInt((tableProvider.pagerData.total / tableProvider.defaults.perPage) + 1) || 1;
    var codeTotalPages = UItotalPages - 1;

    tableProvider.domHolderObject.find('tfoot').find('.CTableProviderPager').remove();

    var pagerTemplate = '<tr class="CTableProviderPager"><td colspan="999"><div class="zui-pager">' +
        '<ol class="btn-group">' +
            /*'<li class="btn-group__item">' +
                '<i class="i-chevron-left"></i>' +
            '</li>' +*/
            '<li class="btn-group__item">' +
                '<button onclick="CTableProvider.applyPage(\''+tableHolderId+'\', 0);" class="btn btn--basic '+((UIpage == 1) ? 'current' : '' )+'">1</button>' +
            '</li>' ;
    if ( UItotalPages > UIpage ) {
        pagerTemplate += '<li class="btn-group__item">' +
            '<button class="btn btn--basic" disabled="disabled">...</button>' +
            '</li>';
        var UInextPage = (UIpage > 1) ? UIpage : parseInt(UIpage + 1);
        var UInextPageEnd = parseInt(UIpage + 10);
        if ( UInextPageEnd >= UItotalPages ) {
            UInextPageEnd = UItotalPages;
        }
        for (var UIpageCounter = UInextPage; UIpageCounter < UInextPageEnd; UIpageCounter++) {
            var codePageCounter = UIpageCounter-1;
            pagerTemplate += '<li class="btn-group__item">' +
                '<button onclick="CTableProvider.applyPage(\''+tableHolderId+'\', '+codePageCounter+');" class="btn btn--basic '+((UIpage == UIpageCounter) ? 'current' : '' )+'"><span>' + UIpageCounter + '</span></button>' +
                '</li>';
        }
    }
    pagerTemplate += '<li class="btn-group__item">' +
                '<div class="zui-pager__input">' +
                    'PAGE' + ': ' +
                    '<input type="text" value="' + UIpage + '" onchange="CTableProvider.applyPageFromInput(\''+tableHolderId+'\', this)">' +
                    ' ' + 'OF' + ' ' + UItotalPages +
                '</div>' +
            '</li>' +
            '<li class="btn-group__item">' +
                '<button onclick="CTableProvider.applyPage(\''+tableHolderId+'\', '+codeTotalPages+');" class="btn btn--basic '+((UIpage == UItotalPages) ? 'current' : '' )+'"><span>' + UItotalPages + '</span></button>' +
            '</li>' +
            /*'<li class="btn-group__item">' +
                '<i class="i-chevron-right"></i>' +
            '</li>' +*/
        '</ol>' +
    '</div></td></tr>';

    tableProvider.domHolderObject.find('tfoot').append(pagerTemplate);
};

CTableProvider.prototype.loadTableData = function(tableHolderId, page, perPage, sortColumn, sortOrder, postData) {
    var self = this;
    var tableProvider = self.tables[tableHolderId];

    var postDataProvider = {
        'filters': (postData != undefined) ? postData : {},
        'TableDataProvider': tableProvider.domIdentifier,
        'limit': perPage,
        'offset': page,
        'sortColumn': sortColumn,
        'sortOrder': sortOrder,
        'preset': null
    };
    tableProvider.spinner = $('<div class="spinner"></div>').prependTo(tableProvider.domHolderObject);

    var targetUrl = tableProvider.actionUrl;
    self.callHost(targetUrl, postDataProvider, function(jsonData, textStatus, jqXHR){
        tableProvider.callbacks.afterLoad(tableHolderId, jsonData);

        tableProvider.pagerData.page = page;
        tableProvider.pagerData.total = jsonData.response.total;
        tableProvider.sortData.sortColumn = sortColumn;
        tableProvider.sortData.sortOrder = sortOrder;
        $('.CTableProviderExtraAction').show();
        self.refreshDomData(tableHolderId, jsonData);
        tableProvider.spinner.remove();
    }, function(jsonData, textStatus, jqXHR){
        tableProvider.spinner.remove();
        tableProvider.toolbar.flash('Failed loading data...', false);
    });
};

CTableProvider.prototype.loadReportFile = function(buttonDom, tableHolderId) {
    var self = this;
    var tableProvider = self.tables[tableHolderId];
    var buttonObj = $(buttonDom);

    buttonObj.html('<span class="glyphicon glyphicon-transfer"></span> Transfering...');

    var postDataProvider = {
        filters: tableProvider.filters,
        TableDataProvider: tableProvider.domIdentifier
    };
    tableProvider.spinner = $('<div class="spinner"></div>').prependTo(tableProvider.domHolderObject);
    tableProvider.toolbar.flash('Preparing report...', true);

    var targetUrl = tableProvider.actionUrl + '/csv';
    self.callHost(targetUrl, postDataProvider, function(jsonData, textStatus, jqXHR){
        if ( jsonData.status ) {
            if ( jsonData.provider.file != null ) {
                window.location.href = jsonData.provider.file;
                buttonObj.html('<span class="glyphicon glyphicon-cloud-download"></span> ' + 'REPORT_EXPORT_CSV');
                tableProvider.toolbar.flash('Done!', true);
            } else {
                buttonObj.html('<span class="glyphicon glyphicon-cloud-download"></span> ' + 'REPORT_EXPORT_CSV');
                tableProvider.toolbar.flash('Unable to locate report file');
            }
            if ( jsonData.error ) {
                buttonObj.html('<span class="glyphicon glyphicon-cloud-download"></span> ' + 'REPORT_EXPORT_CSV');
                tableProvider.toolbar.flash('With error: ' + jsonData.error);
            }
        } else {
            buttonObj.html('<span class="glyphicon glyphicon-cloud-download"></span> ' + 'REPORT_EXPORT_CSV');
            tableProvider.toolbar.flash('Failed generating report...', false);
        }
        tableProvider.spinner.remove();
    }, function(jsonData, textStatus, jqXHR){
        buttonObj.html('<span class="glyphicon glyphicon-cloud-download"></span> ' + 'REPORT_EXPORT_CSV');
        tableProvider.toolbar.flash('Failed generating report...', false);
        tableProvider.spinner.remove();
    });
};

CTableProvider.prototype.refreshDomData = function(tableHolderId, jsonData) {
    var self = this;
    var tableProvider = self.tables[tableHolderId];

    if ( tableProvider.rendered ) {
        for ( var field in tableProvider.filters ) {
            tableProvider.columnConfiguration[field].lastState = tableProvider.filters[field];
        }

        tableProvider.renderObject.setData({
            cols: tableProvider.columnConfiguration,
            rows: jsonData.response.data
        });
        self.retoggleColumns(tableHolderId);
    } else {
        tableProvider.domHolderObject.hide();
        tableProvider.renderObject = tableProvider.domHolderObject.WATable({
            pageSize: tableProvider.defaults.perPage,
            pageSizes: false,
            filter: true,
            sorting: true,
            columnPicker: true,
            pager: false,
            checkboxes: true,
            data: {
                cols: tableProvider.columnConfiguration,
                rows: jsonData.response.data
            },
            tableCreated: function(e){
                self.createPager(tableHolderId);
                setTimeout(function() {
                    self.createToolbar(tableHolderId);
                    tableProvider.domHolderObject.fadeIn();
                }, 500);
            }
        }).data('WATable');
        tableProvider.rendered = true;
    }
};

CTableProvider.prototype.configure = function(tableHolderId, _column){
    var self = this;
    var tableProvider = self.tables[tableHolderId];
    return {
        column: function(_column, type, lastState){
            if ( !tableProvider.columnConfiguration.hasOwnProperty(_column) ) {
                tableProvider.columnConfiguration[_column] = {
                    index: tableProvider.totalColumns,
                    type: type,
                    friendly: '',
                    format: '',
                    unique: false,
                    filterTooltip: false,
                    placeHolder: '',
                    onFilter: false,
                    onSort: false,
                    lastState: (lastState != undefined) ? lastState : '',
                };
                tableProvider.totalColumns++;
            }
            return self.configure(tableHolderId, _column);
        },
        label: function(template){
            tableProvider.columnConfiguration[_column].friendly = template;
            return self.configure(tableHolderId, _column);
        },
        checkable: function(isHidden){
            if ( isHidden == true ) {
                tableProvider.columnConfiguration[_column].unique = true;
                if (typeof isHidden == 'boolean') {
                    tableProvider.columnConfiguration[_column].hidden = isHidden;
                }
            }
            return self.configure(tableHolderId, _column);
        },
        filter: function(isEnabled, placeholder, predefinedFilters){
            if ( typeof isEnabled == 'boolean' && !isEnabled) {
                tableProvider.columnConfiguration[_column].filter = isEnabled;
            }
            if ( placeholder != undefined && placeholder != null ) {
                tableProvider.columnConfiguration[_column].placeHolder = placeholder;
            }
            if ( typeof predefinedFilters == 'object' && predefinedFilters != null) {
                tableProvider.columnConfiguration[_column].type = 'predefined';
                tableProvider.columnConfiguration[_column].predefinedFilters = predefinedFilters;
            }
            return self.configure(tableHolderId, _column);
        },
        onFilter: function(jsFunction){
            if ( typeof jsFunction == 'function') {
                tableProvider.columnConfiguration[_column].onFilter = jsFunction;
            }
            return self.configure(tableHolderId, _column);
        },
        sort: function(isEnabled){
            if ( isEnabled == false ) {
                tableProvider.columnConfiguration[_column].sorting = false;
            }
            return self.configure(tableHolderId, _column);
        },
        onSort: function(jsFunction){
            if ( typeof jsFunction == 'function') {
                tableProvider.columnConfiguration[_column].onSort = jsFunction;
            }
            return self.configure(tableHolderId, _column);
        }
    };
};

var CTableProvider = new CTableProvider();