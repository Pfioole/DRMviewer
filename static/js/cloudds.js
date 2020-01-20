

function Link(leftLink, rightLink) {
    var self = this;
    self.leftLink = ko.observable("");
    self.rightLink = ko.observable("");
}

function Sort(sortField, sortDirection) {
    var self = this;
    self.sortField = ko.observable("");
    self.sortDirection = ko.observable("");
}


function StudyQuery(SQLquery, domainList, SQLfieldList) {
    var self = this;
    self.SQLquery = ko.observable("");
    self.domainList = [];
    self.SQLfieldList = ko.observableArray();
    self.sortFields = ko.observableArray();
}


function SinglepageViewModel() {
    // Data
    var self = this;
    self.studypathText = ko.observable("C:/CDR/3945/56021927PCR1024/DRMdata/");
    self.datasetsList = ko.observableArray();
    self.datasetsLijst = [];
    self.leftFile = ko.observable();
    self.rightFile = ko.observable();
    self.leftFieldList = ko.observable();
    self.rightFieldList = ko.observable();
    self.leftField = ko.observable();
    self.rightField = ko.observable();
    self.selectedFields = ko.observableArray();
    self.sortDirections = ["ASC", "DESC"];
    self.whereClause = ko.observable("");
    self.SQLquery = ko.observable();
    self.links = ko.observableArray([]);
    self.sorts = ko.observableArray([]);
//    self.sortField = ko.observable();
//    self.sortFields = ko.observableArray([]);


    // Operations
    self.fetchDatasets = function() {
        $.getJSON("/fetchdatasets", {
            studyPath: self.studypathText(),
        }).done(function (result, status, xhr) {
            lijst = result.datasetsList;
            self.datasetsList(lijst);
            self.datasetsLijst = lijst;
            self.domainList = result.datasetsList;
            self.sq = new StudyQuery("", lijst,);
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }

    self.fetchFields = function() {
        $.getJSON("/fetchfields", {
            studyPath: self.studypathText(),
            selectedDomain: self.leftFile(),
        }).done(function (result, status, xhr) {
            lijst = result.fieldList;
            self.leftFieldList(lijst);
            self.links.removeAll();
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }

    self.fetchRightFields = function() {
        $.getJSON("/fetchfields", {
            studyPath: self.studypathText(),
            selectedDomain: self.rightFile(),
        }).done(function (result, status, xhr) {
            lijst = result.fieldList;
            self.rightFieldList(lijst);
            self.links.removeAll();
            self.selectedFields.removeAll();
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }


    self.addLink = function() {
        self.links.push(new Link("", ""));
        //alert("array: " + self.links()[0].toString());
    };

    self.addSort = function() {
        self.sorts.push(new Sort("", ""));
        //alert("array: " + self.links()[0].toString());
    };


    self.addLeftFieldSelect = function() {
        //alert("selected: " + self.rightField());
        insert = self.leftFile() + "." + self.leftField();
        self.selectedFields.push(insert);
    }

    self.addRightFieldSelect = function() {
        //alert("selected: " + self.rightField());
        insert = self.rightFile() + "." + self.rightField();
        self.selectedFields.push(insert);
    }

    self.runQuery = function() {

    }

    self.saveQuery = function() {
        linksLength =  self.links().length;
        alert("linksLength: " + linksLength);
        if (linksLength > 0) {
            joinText = " INNER JOIN " + self.rightFile() + " ON (" + self.links()[0].leftLink() + " = " + self.links()[0].rightLink();
            if (linksLength > 1) {
                for (i = 1; i < linksLength; i++) {
                    joinText += ") AND (" + self.links()[i].leftLink() + " = " + self.links()[i].rightLink();
                }
            }
            joinText += ")";
        } else {
            joinText ="";
        }
        orderLength =  self.sorts().length;
        orderText ="";
        if (orderLength > 0) {
            orderText += " ORDER BY " + self.sorts()[0].sortField() + " " + self.sorts()[0].sortDirection();
            if (orderLength > 1) {
                for (i = 1; i < orderLength; i++) {
                    orderText += ", " + self.sorts()[i].sortField() + " " + self.sorts()[i].sortDirection();
                }
            }
        }
        if (self.whereClause().length > 0) {
            whereSQL = " WHERE " + self.whereClause();
        } else {
            whereSQL = "";
        }


        SQLquery = "SELECT " + self.selectedFields() + " FROM " + self.leftFile() + joinText + orderText + whereSQL + ";";
        self.SQLquery(SQLquery);
        $('#saveModal').modal('toggle');
    }

    self.removeLink = function(link) {self.links.remove(link)}

    self.removeSort = function(sort) {self.sorts.remove(sort)}

    self.removeSelectField = function() {
        { self.selectedFields.pop();}
    }

    self.removeAllLinks = function() {

    }


}


ko.applyBindings(new SinglepageViewModel());


