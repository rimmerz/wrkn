/**
 * Created by G on 17.08.2017.
 */
var CFilterHelper = function() {

};

CFilterHelper.prototype.prepareFilters = function(requestFilters, requestHeaders) {
    var filters = {};
    var prepareFilterData = function(stringToProcess){
        console.log(stringToProcess);
        var filterData = {
            type: null,
            query: null
        };
        var rawString = stringToProcess;
        if ( stringToProcess != '' ) {
            stringToProcess = stringToProcess.toLowerCase();
            var _matchNot = stringToProcess.match(/(^\!)|(\!$)/);
            var _matchAny = stringToProcess.match(/(^\*)|(\*$)/);
            var _matchAnd = stringToProcess.match(/( \& )/);
            if (_matchNot != null) {
                filterData.type = 'notlike';
                stringToProcess = stringToProcess.replace(/(^\!)/, '');
                stringToProcess = stringToProcess.replace(/(\!$)/, '');
                filterData.query = new RegExp(stringToProcess, 'i');
                return filterData;
            } else if(_matchAnd != null) {
                filterData.type = 'matchin';
                stringToProcess = rawString.replace(/(^\&)/, '');
                stringToProcess = stringToProcess.replace(/(\&$)/, '');
                var arrayToProcess = stringToProcess.split(' & ');
                filterData.query = arrayToProcess;
                return filterData;
            } else if(_matchAny != null) {
                filterData.type = 'orlike';
                stringToProcess = stringToProcess.replace(/(^\*)/, '');
                stringToProcess = stringToProcess.replace(/(\*$)/, '');
                filterData.query = new RegExp(stringToProcess, 'i');
                return filterData;
            } else {
                filterData.type = 'equals';
                filterData.query = rawString;
                return filterData;
            }
        }
        return null;
    };
    for ( var field in requestFilters ) {
        if ( requestFilters[field] != '' ) {
            if ( typeof requestFilters[field] === 'object' ) {
                for ( var nested in requestFilters[field]) {
                    var tmpFilter = {};

                    var preparedData = prepareFilterData(requestFilters[field][nested]);
                    if ( preparedData != null ) {
                        switch(preparedData.type) {
                            case 'notlike':
                                if ( !filters.hasOwnProperty('$nor') ) {
                                    filters['$nor'] = [];
                                }
                                tmpFilter[nested] = preparedData.query;
                                filters['$nor'].push(tmpFilter);
                                break;
                            case 'orlike':
                                if ( !filters.hasOwnProperty('$or') ) {
                                    filters['$or'] = [];
                                }
                                tmpFilter[nested] = preparedData.query;
                                filters['$or'].push(tmpFilter);
                                break;
                            case 'equals':
                                if ( !filters.hasOwnProperty('$or') ) {
                                    filters['$or'] = [];
                                }
                                tmpFilter[nested] = preparedData.query;
                                filters['$or'].push(tmpFilter);
                                break;
                        }
                    }
                }
            } else {
                var preparedData = prepareFilterData(requestFilters[field]);
                if ( preparedData != null ) {
                    var tmpFilter = {};
                    switch(preparedData.type) {
                        case 'notlike':
                            tmpFilter['$not'] = preparedData.query;
                            filters[field] = tmpFilter;
                            break;
                        case 'orlike':
                            filters[field] = preparedData.query;
                            break;
                        case 'matchin':
                            tmpFilter['$in'] = preparedData.query;
                            filters[field] = tmpFilter;
                            break;
                        case 'equals':
                            filters[field] = preparedData.query;
                            break;
                    }
                }
            }
        }
    }

    if ( requestHeaders.hasOwnProperty('employee-visibility') ) {
        var employeeVisibility = JSON.parse(requestHeaders['employee-visibility']);
        if ( employeeVisibility.length > 0 ) {
            filters['employeeId'] = employeeVisibility;
        }
    }

    return filters;
};

CFilterHelper.prototype.prepareLimit = function(limit, defaultLimit) {
    return (parseInt(limit) >= 0) ? parseInt(limit) : defaultLimit;
};

CFilterHelper.prototype.prepareSortColumn = function(column, defaultColumn) {
    return (column.length > 0) ? column : defaultColumn;
};

CFilterHelper.prototype.prepareSortOrder = function(order, defaultOrder) {
    return (order == 1 || order == -1) ? order : defaultOrder;
};

CFilterHelper.prototype.prepareOffset = function(offset, limit) {
    var preparedOffset = 0;
    if ( parseInt(offset) > 0 && limit > 0 ) {
        preparedOffset = parseInt(offset) * limit;
    }
    return preparedOffset;
};

exports.CFilterHelper = new CFilterHelper;