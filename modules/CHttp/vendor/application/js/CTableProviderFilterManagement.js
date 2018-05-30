/**
 * Created by G on 06.09.2017.
 */
function CTableProviderFilterManagement(){

    this.filterableID = null;

    this.__construct = function() {
        var self = this;
        return this;
    };

    this.init = function(tableHolderId) {
        var self = this;
        var tableProvider = CTableProvider.tables[tableHolderId];

        if ( $('#filterable'+tableHolderId).length == 0 ) {
            tableProvider.domHolderObject.append('<div id="filterable' + tableHolderId + '" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modalFilterTitle">' +
                '<div class="modal-dialog">' +
                '<div class="modal-content">' +
                '<div class="modal-body" id="modalFilterBody">' +
                '<table class="table table-bordered table-striped">' +
                '<thead>' +
                '<tr>' +
                '<th>'+Core.t('NAME')+'</th><th>'+Core.t('DESCRIPTION')+'</th><th class="col-sm-4">'+Core.t('ACTION')+'</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody></tbody>' +
                '</table>' +
                '</div>' +
                '<div class="modal-footer">' +
                '<button type="button" class="btn btn-danger btn-sm" data-dismiss="modal">'+Core.t('CLOSE')+'</button>' +
                '<button type="button" class="btn btn-success  btn-sm" data-dismiss="modal" onclick="CTableProviderFilterManagement.filterable(\'' + tableHolderId + '\').formCreate();">'+Core.t('ADD')+'</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>');
        }
        if ( $('#filterableForm'+tableHolderId).length == 0 ) {
            tableProvider.domHolderObject.append('<div id="filterableForm' + tableHolderId + '" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modalFilterFormTitle">' +
                '<div class="modal-dialog">' +
                '<div class="modal-content">' +
                '<div class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>' +
                '<h4 class="modal-title" id="modalFilterFormTitle">'+Core.t('FILTER_TEMPLATE')+'</h4>' +
                '</div>' +
                '<div class="modal-body" id="modalFilterFormBody">' +
                '<div class="form-group col-sm-12">' +
                '<label for="filterName" class="col-sm-3 control-label">'+Core.t('NAME')+'</label>' +
                '<div class="col-sm-9">' +
                '<input type="text" class="form-control" id="filterName" name="filterName">' +
                '</div>' +
                '</div>' +
                '<div class="form-group col-sm-12">' +
                '<label for="filterDescription" class="col-sm-3 control-label">'+Core.t('DESCRIPTION')+'</label>' +
                '<div class="col-sm-9">' +
                '<input type="text" class="form-control" id="filterDescription" name="filterDescription">' +
                '</div>' +
                '</div>' +
                '<form class="row">' +
                '</form>' +
                '</div>' +
                '<div class="modal-footer">' +
                '<button type="button" class="btn btn-danger btn-sm" data-dismiss="modal">'+Core.t('CLOSE')+'</button>' +
                '<button type="button" class="btn btn-success  btn-sm" data-dismiss="modal" onclick="CTableProviderFilterManagement.filterable(\'' + tableHolderId + '\').formSave();">'+Core.t('SAVE')+'</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>');
        }
    };

    return this.__construct();
}

CTableProviderFilterManagement.prototype.manageFilters = function(tableHolderId) {
    var self = this;
    self.init(tableHolderId);
    var tableProvider = CTableProvider.tables[tableHolderId];


    var modalFilters = $('#filterable'+tableHolderId);
    var modalFiltersTable = modalFilters.find('table tbody');
    if ( !modalFilters.is(':visible') ) {

        var listFilters = self.filterable(tableHolderId).listFilters(tableHolderId);
        modalFiltersTable.html('');
        for (var id in listFilters) {
            modalFiltersTable.append('' +
                '<tr>' +
                '<th class="text-nowrap" scope="row">' +
                '<button style="text-align: left;" class="btn btn-success btn-sm col-sm-12" onclick="CTableProviderFilterManagement.filterable(\'' + tableHolderId + '\').applyFilter('+id+', \''+tableHolderId+'\');">' +
                listFilters[id].name +
                '</button>' +
                '</th>' +
                '<td><small>' + listFilters[id].description + '</small></td>' +
                '<td>' +
                '<div class="btn-group col-sm-12">' +
                '<button class="btn btn-warning btn-sm col-sm-6" onclick="CTableProviderFilterManagement.filterable(\'' + tableHolderId + '\').formEdit('+id+', \''+tableHolderId+'\');"><i class="fa fa-edit"></i> '+Core.t('EDIT')+'</button>' +
                '<button class="btn btn-danger btn-sm col-sm-6" onclick="CTableProviderFilterManagement.filterable(\'' + tableHolderId + '\').deleteFilter('+id+', \''+tableHolderId+'\');"><i class="fa fa-trash-o"></i> '+Core.t('DELETE')+'</button>' +
                '</div>' +
                '</td>' +
                '</tr>');
        }
        modalFilters.modal('show');
    }
};
CTableProviderFilterManagement.prototype.filterableID = null;
CTableProviderFilterManagement.prototype.filterable = function(tableHolderId) {
    var self = this;
    var tableProvider = CTableProvider.tables[tableHolderId];
    var modalFilters = $('#filterable'+tableHolderId);
    var modalFiltersForm = $('#filterableForm'+tableHolderId);
    var _getAvailableFilters = function(){
        var availableFilters = [];

        var currentTableInfo = tableProvider.renderObject.getData(true);
        for ( var field in currentTableInfo.cols ) {
            var excludedFilter = (typeof currentTableInfo.cols[field].filter == 'boolean' && currentTableInfo.cols[field].filter == false);
            if ( !excludedFilter ) {
                var _multi = [];
                if (field == 'LastComment') {
                    _multi = ['Never', '0-7 Days', '8-15 Days', '16-30 Days', '30+ Days'];
                } else if (field == 'LeadStatus' || field == 'SaleStatus') {
                    /*$('#ChangeStatus option').each(function () {
                     _multi.push($(this).text());
                     })*/
                } else if (field == 'VerificationStatus') {
                    _multi = ['None', 'Unverified', 'Partial', 'Full'];
                } else if (field == 'IsoCountry') {
                    _multi = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua &amp; Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas"
                        , "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia &amp; Herzegovina", "Botswana", "Brazil", "British Virgin Islands"
                        , "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Chad", "Chile", "China", "Colombia", "Congo", "Cook Islands", "Costa Rica"
                        , "Cote D Ivoire", "Croatia", "Cruise Ship", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea"
                        , "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Polynesia", "French West Indies", "Gabon", "Gambia", "Georgia", "Germany", "Ghana"
                        , "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India"
                        , "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyz Republic", "Laos", "Latvia"
                        , "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania"
                        , "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Namibia", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia"
                        , "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal"
                        , "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Pierre &amp; Miquelon", "Samoa", "San Marino", "Satellite", "Saudi Arabia", "Senegal", "Serbia", "Seychelles"
                        , "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "St Kitts &amp; Nevis", "St Lucia", "St Vincent", "St. Lucia", "Sudan"
                        , "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor L'Este", "Togo", "Tonga", "Trinidad &amp; Tobago", "Tunisia"
                        , "Turkey", "Turkmenistan", "Turks &amp; Caicos", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Virgin Islands (US)"
                        , "Yemen", "Zambia", "Zimbabwe"];

                } else if (field == 'employeeName') {
                    $('#MoveToUsers option').each(function () {
                        _multi.push($(this).text());
                    })
                }

                availableFilters.push({
                    id: field,
                    label: currentTableInfo.cols[field].friendly,
                    multi: _multi
                });
            }
        }

        return availableFilters;
    };
    var _listFilters = function(tableHolderId){
        if ( localStorage.hasOwnProperty('filterable') ) {
            var _filtersStorage = JSON.parse(localStorage['filterable']);
            if ( _filtersStorage.hasOwnProperty(tableHolderId) ) {
                return _filtersStorage[tableHolderId];
            }
        }
        return [];
    };
    var _deleteFilters = function(tableHolderId, id){
        if ( localStorage.hasOwnProperty('filterable') ) {
            var _filtersStorage = JSON.parse(localStorage['filterable']);
            if ( _filtersStorage.hasOwnProperty(tableHolderId) ) {
                if ( _filtersStorage[tableHolderId].hasOwnProperty(id) ) {
                    var _remappedScopeOfFiltersStorage = [];
                    for ( var field in _filtersStorage[tableHolderId] ) {
                        if ( field != id ) {
                            _remappedScopeOfFiltersStorage.push(_filtersStorage[tableHolderId][field]);
                        }
                    }
                    _filtersStorage[tableHolderId] = _remappedScopeOfFiltersStorage;
                    localStorage.setItem('filterable', JSON.stringify(_filtersStorage));
                }
            }
        }
    };
    var _writeFilters = function(tableHolderId, dataArray, _name, _description){
        var _filtersStorage = {};
        if ( !localStorage.hasOwnProperty('filterable') ) {
            _filtersStorage[tableHolderId] = [];
            localStorage.setItem('filterable', JSON.stringify(_filtersStorage));
        }
        _filtersStorage = JSON.parse(localStorage['filterable']);
        if ( !_filtersStorage.hasOwnProperty(tableHolderId) ) {
            _filtersStorage[tableHolderId] = [];
        }
        if ( CTableProviderFilterManagement.filterableID != null ) {
            _filtersStorage[tableHolderId][CTableProviderFilterManagement.filterableID]['name'] = _name;
            _filtersStorage[tableHolderId][CTableProviderFilterManagement.filterableID]['description'] = _description;
            _filtersStorage[tableHolderId][CTableProviderFilterManagement.filterableID]['filtersData'] = dataArray;
        } else {
            var increment = 0;
            for (var i in _filtersStorage[tableHolderId]) {
                increment = parseInt(i) + 1;
            }

            _filtersStorage[tableHolderId][increment] = {
                name: _name,
                description: _description,
                filtersData: dataArray
            };
        }
        localStorage.setItem('filterable', JSON.stringify(_filtersStorage));
    };
    return {
        listFilters: function() {
            CTableProviderFilterManagement.filterableID = null;
            return _listFilters(tableHolderId);
        },
        formEdit: function(id) {
            CTableProviderFilterManagement.filterableID = parseInt(id);
            var filters = _listFilters(tableHolderId);
            var options = filters[CTableProviderFilterManagement.filterableID].filtersData;
            var _form = modalFiltersForm.find('.modal-body form');
            var _body = modalFiltersForm.find('.modal-body');

            _body.find('#filterName').val(filters[CTableProviderFilterManagement.filterableID].name);
            _body.find('#filterDescription').val(filters[CTableProviderFilterManagement.filterableID].description);

            var _fields = _getAvailableFilters();
            _form.html('');

            for ( var i in _fields ) {
                var field = '';
                var _filterValue = (options.hasOwnProperty(i)) ? options[i] : '';
                var _hidden = (_fields[i].label.length > 0) ? '' : 'style="display: none;"';

                if( _fields[i].multi.length > 0 ) {

                    var selectOptions = '';

                    for ( var o in _fields[i].multi ) {
                        if(_filterValue.indexOf(_fields[i].multi[o]) != -1) {
                            selectOptions += '<option selected value="' + _fields[i].multi[o] + '">' + _fields[i].multi[o] + '</option>';
                        } else {
                            selectOptions += '<option value="' + _fields[i].multi[o] + '">' + _fields[i].multi[o] + '</option>';
                        }
                    }

                    field = '<div class="col-sm-9">'+
                        '<select multiple class="form-control chosen-select filters-multiselect">' +
                        selectOptions +
                        '</select>'+
                        '</div>';
                } else {
                    field = '<div class="col-sm-9">' +
                        '<input type="text" class="form-control" id="' + _fields[i].id + '" name="' + _fields[i].id + '" value="'+_filterValue+'">' +
                        '</div>';
                }

                _form.append('<div class="form-group col-sm-12" ' + _hidden + '>' +
                    '<label for="concept" class="col-sm-3 control-label">' + _fields[i].label + '</label>' +
                    field+
                    '</div>');
            }

            _body.find('.filters-multiselect').chosen({
                no_results_text: 'No Results',
                placeholder_text_multiple: 'Select',
                width: '100%'
            });

            modalFilters.modal('hide');
            modalFiltersForm.modal('show');
        },
        deleteFilter: function(id) {
            _deleteFilters(tableHolderId, id);
            modalFilters.modal('hide');
        },
        formCreate: function() {
            CTableProviderFilterManagement.filterableID = null;
            var _form = modalFiltersForm.find('.modal-body form');
            var _body = modalFiltersForm.find('.modal-body');

            _body.find('#filterName').val('');
            _body.find('#filterDescription').val('');

            var _fields = _getAvailableFilters();
            _form.html('');

            for ( var i in _fields ) {
                var _hidden = (_fields[i].label.length > 0) ? '' : 'style="display: none;"';
                var field = '';

                if ( _fields[i].multi.length > 0 ) {

                    var options = '';

                    for ( var o in _fields[i].multi ) {
                        options += '<option value="' + _fields[i].multi[o] + '">' + _fields[i].multi[o] + '</option>';
                    }
                    field = '<div class="col-sm-9">'+
                        '<select multiple class="form-control chosen-select filters-multiselect">' +
                        options +
                        '</select>'+
                        '</div>';
                } else {
                    field = '<div class="col-sm-9">' +
                        '<input type="text" class="form-control" id="' + _fields[i].id + '" name="' + _fields[i].id + '">' +
                        '</div>';
                }

                _form.append('<div class="form-group col-sm-12" ' + _hidden + '>' +
                    '<label for="concept" class="col-sm-3 control-label">' + _fields[i].label + '</label>' +
                    field+
                    '</div>');
            }

            _body.find('.filters-multiselect').chosen({
                no_results_text: 'No Results',
                placeholder_text_multiple: 'Select',
                width: '100%'
            });

            modalFilters.modal('hide');
            modalFiltersForm.modal('show');
        },
        applyFilter: function(id) {
            CTableProviderFilterManagement.filterableID = parseInt(id);
            var filters = _listFilters(tableHolderId);
            var availableFilters = _getAvailableFilters(tableHolderId);
            var options = filters[CTableProviderFilterManagement.filterableID].filtersData;

            var mappedFilters = [];
            for (var key in options) {
                if ( availableFilters.hasOwnProperty(key) ) {
                    mappedFilters[availableFilters[key].id] = (options[key].constructor === Array) ? options[key].join(' & ') : options[key];
                }
            }

            if ( options.length > 0 ) {
                CTableProvider.applyFilter(tableHolderId, mappedFilters);
                modalFilters.modal('hide');
            }
        },
        formSave: function() {
            var _form = modalFiltersForm.find('.modal-body form');
            var _name = modalFiltersForm.find('.modal-body #filterName').val();
            var _description = modalFiltersForm.find('.modal-body #filterDescription').val();
            var dataArray = [];
            _form.find(':input').each(function(){

                if($(this).parent().attr('class') != 'search-field'){
                    if($(this).is('input')) {
                        var _value = $.trim($(this).val());
                    } else {
                        var _value = [];
                        $(this).find('option:selected').each(function () {
                            _value.push($(this).text());
                        });
                    }

                    dataArray.push(_value);
                }

            });

            _writeFilters(tableHolderId, dataArray, _name, _description);
        }
    };
};

var CTableProviderFilterManagement = new CTableProviderFilterManagement();