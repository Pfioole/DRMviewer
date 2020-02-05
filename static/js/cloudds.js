
var qTable = null;

function Link(joinType, leftLink, rightLink) {
    var self = this;
    self.joinType = ko.observable("");
    self.leftLink = ko.observable("");
    self.rightLink = ko.observable("");
}

function Sort(sortField, sortDirection) {
    var self = this;
    self.sortField = ko.observable("");
    self.sortDirection = ko.observable("");
}


function StudyQuery(SQLquery, domainList, selectedFields, SQLfieldList, sortFields, leftFile, rightFile) {
    var self = this;
    self.SQLquery = ko.observable("");
    self.domainList =  ko.observableArray();
    self.selectedFields = ko.observableArray();
    self.SQLfieldList = ko.observableArray();
    self.sortFields = ko.observableArray();
    self.leftFile = ko.observable();
    self.rightFile = ko.observable();
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
    self.joinTypes = ["INNER JOIN", "OUTER JOIN", "LEFT JOIN", "RIGHT JOIN"];
    self.sortDirections = ["ASC", "DESC"];
    self.whereClause = ko.observable("");
    self.SQLquery = ko.observable();
    self.links = ko.observableArray([]);
    self.sorts = ko.observableArray([]);
    self.sq = new StudyQuery("SQL statement", [,], [], [,], [,],"" ,
        "" );
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
            //var sq = new StudyQuery("", lijst,[], );
            self.sq.domainList(lijst);
            //sqstring = JSON.stringify(self.sq);
            //alert(sqstring);
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }

    self.fetchLeftFields = function() {
        $.getJSON("/fetchfields", {
            studyPath: self.studypathText(),
            selectedDomain: self.sq.leftFile(),
        }).done(function (result, status, xhr) {
            lijst = result.fieldList;
            for (i=0; i < lijst.length; i++) {
                // lijst[i] = self.sq.leftFile() + "." + lijst[i];
            }
            self.leftFieldList(lijst);
            self.links.removeAll();
            self.sorts.removeAll();
            self.selectedFields.removeAll();

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
            for (i=0; i < lijst.length; i++) {
                lijst[i] = self.rightFile() + "." + lijst[i];
            }
            self.rightFieldList(lijst);
            self.links.removeAll();
            self.sorts.removeAll();
            self.selectedFields.removeAll();
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }


    self.addLink = function() {
        self.links.push(new Link("", "", ""));
        //alert("array: " + self.links()[0].toString());
    };

    self.addSort = function() {
        self.sorts.push(new Sort("", ""));
        //alert("array: " + self.links()[0].toString());
    };


    self.addLeftFieldSelect = function() {
        //alert("selected: " + self.rightField());
        //insert = self.leftFile() + "." + self.leftField();
        self.selectedFields.push(self.leftField());
    }

    self.addRightFieldSelect = function() {
        //alert("selected: " + self.rightField());
        //insert = self.rightFile() + "." + self.rightField();
        self.selectedFields.push(self.rightField());
    }

    self.buildSQLstring = function() {
         linksLength =  self.links().length;
        if (linksLength > 0) {
            joinText = " " + self.links()[0].joinType() + " " + self.rightFile() + " ON (" +
                self.links()[0].leftLink() + " = " + self.links()[0].rightLink();
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
        //alert(" result: " + orderText);
        if (self.whereClause() != "") {
            whereSQL = " WHERE " + self.whereClause();
        } else {
            whereSQL = "";
        }

        selection = self.selectedFields().toString();
        selection = selection.replace(/,/g, "\, ");
        //,str.replace(/blue/g, "red");

        SQLquery = "SELECT " + selection + " FROM " + self.sq.leftFile() + joinText + orderText + whereSQL + ";";
        self.SQLquery(SQLquery);
        self.sq.SQLquery(SQLquery);

        //var json2 = ko.toJS(self.sq);
        //alert(JSON.stringify(json2));
    }

    self.runQuery4 = function() {
        self.buildSQLstring();
        self.sq.selectedFields = self.selectedFields();
        //alert("JS sent selected fields : " + self.sq.selectedFields);
        sqstring = JSON.stringify(ko.toJS(self.sq));
        $.getJSON('/fetchQueryData', {
            studyPath: self.studypathText(),
            sqstring: sqstring
        }, function(data, status, xhr) {
            //$("#elements").text(data.number_elements);
            if (qTable !== null) {
              qTable.destroy();
              qTable = null;
              $("#queryTable").empty();
            }

            headings = "<thead id='queryTableHead'></thead>";
	        $("#queryTable").html(headings);

            qTable = $("#queryTable").DataTable({
              data: data.data,
              columns: data.cols
            });

             headings = "<tr>";
	        for (i=0; i< data.cols.length; i++) {
		        headings += "<th>" + data.cols[i].data + "</th>"
                //headings += "<th>" + result.cols[i] + "</th>"
	        }
	        headings += "</tr>";
	        $("#queryTableHead").html(headings);


        });
        return false;
    }

    self.runSQLquery = function() {
        self.buildSQLstring();
        self.sq.selectedFields = self.selectedFields();
        //alert("JS sent selected fields : " + self.sq.selectedFields);
        sqstring = JSON.stringify(ko.toJS(self.sq));
        $.getJSON('/fetchSQLdata', {
            studyPath: self.studypathText(),
            sqstring: sqstring
        }, function(data, status, xhr) {
            //$("#elements").text(data.number_elements);
            if (qTable !== null) {
              qTable.destroy();
              qTable = null;
              $("#queryTable").empty();
            }

            headings = "<thead id='queryTableHead'></thead>";
	        $("#queryTable").html(headings);

            qTable = $("#queryTable").DataTable({
              data: data.data,
              columns: data.cols
            });

             headings = "<tr>";
	        for (i=0; i< data.cols.length; i++) {
		        headings += "<th>" + data.cols[i].data + "</th>"
                //headings += "<th>" + result.cols[i] + "</th>"
	        }
	        headings += "</tr>";
	        $("#queryTableHead").html(headings);


        });
        return false;
    }

/*
    self.runInitial = function() {
        self.buildSQLstring();
        self.sq.selectedFields = self.selectedFields();
        //alert("JS sent selected fields : " + self.sq.selectedFields);
        sqstring = JSON.stringify(ko.toJS(self.sq));

        var qTable = $('#queryTable').DataTable({
            scrollCollapse: false,
            paging: true,
            pagingType: 'simple_numbers',
            lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']],
            processing: true,
            serverSide: true,
            ajax: {
                url: "/fetchQueryData",
                data: {
                    studyPath: self.studypathText(),
                    sqstring: sqstring,
                    //draw: parseInt(1),
                    length: (10),
                    start: parseInt(1)
                }
            },
            searching: false,
            info: false,
        });
    }

    self.runQuery3 = function () {
        self.buildSQLstring();
        sqstring = JSON.stringify(ko.toJS(self.sq));

        $.getJSON( '/fetchQueryData', {
                studyPath: self.studypathText(),
                sqstring: sqstring
            }, function ( json ) {
            //table.destroy();
            //$('#queryTable').empty(); // empty in case the columns change
            headings = "<thead><tr>";
	        for (i=0; i< data.cols.length; i++) {
		        headings += "<th>" + data.cols[i].data + "</th>";
                //headings += "<th>" + result.cols[i] + "</th>"
	        }
	        headings += "</tr></thead>";
            var qTable = $('#queryTable').DataTable( {
                columns: json.cols,
                data:    json.data
            } );
        } );
    };

    self.runQuery2 = function() {
        self.buildSQLstring();
        self.sq.selectedFields = self.selectedFields();
        //alert("JS sent selected fields : " + self.sq.selectedFields);
        sqstring = JSON.stringify(ko.toJS(self.sq));
        $.getJSON("/fetchQueryData", {
            studyPath: self.studypathText(),
            sqstring: sqstring
        }).done(function (result, status, xhr) {
            selectlijst = JSON.stringify(result);
            alert("volledig lijst non stringified = " + selectlijst);
            data.content = result.data;
            // data.content = lijst.data;
            data.cols = result.cols;

            if (firstround == true) {
                alert('firstround is true');
            } else {
                alert("in the loop");
                qTable.destroy();
                $('#queryTable').empty(); // empty in case the columns change
            }

            //qTable.destroy();
            //$('#queryTable').empty(); // empty in case the columns change

            headings = "<thead><tr>";
	        for (i=0; i< data.cols.length; i++) {
		        headings += "<th>" + data.cols[i].data + "</th>";
                //headings += "<th>" + result.cols[i] + "</th>"
	        }
	        headings += "</tr></thead>";


	        //data.content = result.data
	        alert("headings: " + headings);

            //qTable.destroy();
            $('#queryTable').empty();
 	        $("#queryTable").html(headings);
 	        if (firstround == true) {
 	            var qTable = $('#queryTable').DataTable({ data:data.content, columns: data.cols} );
            } else {
 	            qTable = $('#queryTable').DataTable({ data:data.content, columns: data.cols} );
            }
            firstround = false;

            // $('#queryTable').DataTable({destroy: true ,data: data.content, columns: data.cols} );
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });

    }

    self.runQuery = function() {
        self.buildSQLstring();
        self.sq.selectedFields = self.selectedFields();
        //alert("JS sent selected fields : " + self.sq.selectedFields);
        sqstring = JSON.stringify(ko.toJS(self.sq));
        $.getJSON("/fetchQueryData", {
            studyPath: self.studypathText(),
            sqstring: sqstring
        }).done(function (result, status, xhr) {
            selectlijst = JSON.stringify(result);
            alert("volledig lijst non stringified = " + selectlijst);
            data.content = result.data;
            // data.content = lijst.data;
            data.cols = result.cols;

            headings = "";
	        for (i=0; i< data.cols.length; i++) {
		        headings += "<th>" + data.cols[i].data + "</th>"
                //headings += "<th>" + result.cols[i] + "</th>"
	        }
	        //data.content = result.data
	        //alert("headings: " + headings);
	        $("#queryTableHead").html(headings);
            $('#queryTable').DataTable({destroy: true, data:data.content, columns: data.cols} );

            // $('#queryTable').DataTable({destroy: true ,data: data.content, columns: data.cols} );
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });

    }
*/

    self.saveQueryModal = function() {
        self.buildSQLstring();
        $('#saveModal').modal('toggle');
    }

    self.saveQuery = function() {

    }

    self.removeLink = function(link) {self.links.remove(link)}

    self.removeSort = function(sort) {self.sorts.remove(sort)}

    self.removeSelectField = function() { { self.selectedFields.pop();} }

    self.removeAllLinks = function() {

    }


}

function print() {}

ko.applyBindings(new SinglepageViewModel());
var firstround = true;


/*
$('#submit').on( 'click', function () {
    $.getJSON( '/fetchQueryData', {
            studyPath: "C:/CDR/3945/56021927PCR1024/DRMdata/",
            sqstring: sqstring
        }, function ( json ) {
        //table.destroy();
        //$('#queryTable').empty(); // empty in case the columns change

        var qTable = $('#queryTable').DataTable( {
            columns: json.cols,
            data:    json.data
        } );
    } );
} );
*/

let data = { "content" :
	[
		{
			"SITEID":		"Tiger",
			"STUDYID":	"Architect",
            "SUBJID":     "NaN"
		},
		{
			"SUBJID":       "123",
		    "SITEID":		"Garret",
			"STUDYID":	"Director"
		}
	],


			"cols" :
				[
				    {data: "SITEID"},
					{data: "STUDYID"},
                    {data: "SUBJID"}
				]
};
//var qTable = $('#queryTable').DataTable() ;

$(document).ready( function () {

    //var qTable = $('#queryTable').DataTable();
    //var qTable = $('#queryTable').DataTable();
} );

