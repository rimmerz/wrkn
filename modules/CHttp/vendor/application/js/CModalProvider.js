/**
 * Created by G on 05.10.2017.
 */
var CModalProvider = function(){
    this.__construct = function(){

    };
    this.__construct();
    return this;
};

CModalProvider.prototype.notify = function(text){
    $.notiny({
        text: text
    });
};

CModalProvider.prototype.notifyOnError = function(text){
    var image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABOFBMVEUAAAD/AAD/fwD/VVWZzMyqqtS2tra/v7+pxsayssy5ubmqv7+wxMS2tsitucWxvMe0v8mxwcGsu8OuvcSxv8azwMeuu8KxvMetvcOwwMWvvsOyu8WwvsKxvsauv8OvvMSwvcXzQzfzQTbzQzT0RDXyQjaxvcbzQjauvcPzRDXzQzSwv8XzQjeuvcXzQTbzQzXzQzXzQjbzQzXzQzavvcX0QTavvsWwvcWvvsWwvcWvvsWwvcSwvcSwvMSwvcWwvcWvvsTzQjWuvsOwvcWvvcXyQzX0QzawvMOwvsWuvcSwvcWwvMSwvcWvvMWvvsOwvMWuvsSwvcOuvsWuvsWwvsWvvcSuvMOvvMSwvsOwvMWuvMWwvsOuvsSuvsOwvMOwvsOwvMOuvMXyQzTyQTSwvsOuvMOwvsX0QzZ9tc3HAAAAZnRSTlMAAQIDBQYHCAkKCwwNDhYXGCEiIyQlJi4vMTM1Nzs8PT5AQkRHVFVVVlZXWFhZWVpba25xdHR3eIaJioyYmZucnZ2en6Cio7i5u7/Aw8fKz9HS1NjZ2tvn6err7PT19vn6+/v8/f7sLHY+AAABzklEQVQ4jW1Td1/CQAyNgzoARcGJe1u34sYCTlRA3FXRVmlfv/83sHfXCdwfbZL3krzkd0fkndiGUvnS9c+Kshaj5jN8/gPvfOdSDXD36S/Mu8xkXyTSP5W5N6GfdAXxoScYuaTvp/IGqgF/7APP4+GS6Reoo17+B26ijZpiRahOjZ4n3HQ2q+4soip0nOK5KZ/XeMUxn+/XYP079q/mXWjheq+d6TB01uQcORbct6y6LPCtumXtMuMCClH8x+RariyXwXCrwIubtSht4I6nzdcdxiYz/mZ5sIQVUpARhWXBEPiiiB0gSxVMUpDB8WUnNI0yfaGPggyGr7qRBFTSEaEwo+7hJEELEdYFQQ4RPtHvuptOC5/BWlQwRf5+hEiPMWOL9Mbc5vpX5SDj0B5zDfdi/+58gjHnLGqJYt8mv3/X3vxycNW9RDnkmbPn748xdphxiTP7m9KNtP1r3y3MuuLnCjtt9m/C1AaZe4KXVu+A4m844kb3I4otrlzkFg+SMJMqik014rd4H3CdURWv6TA+8Yb3Ed9NVmFcDPn+8KWJh4FgQtexDrN0MJ2QpMTMYQnQjqSGnkml5j/e2tlgi7GiK9myqmlqObvU60f/Aaq+hHtbSZCQAAAAAElFTkSuQmCC';
    $.notiny({
        text: text,
        image: image,
        autohide: false
    });
};