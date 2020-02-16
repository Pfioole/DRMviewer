
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

function StudyQuery(name, description, scope, dataModel, SQLquery, domainList, selectedFields, SQLfieldList, sortFields, leftFile, rightFile) {
    var self = this;
    self.name = ko.observable("");
    self.description = ko.observable();
    self.scope = ko.observable();
    self.dataModel = ko.observable();
    self.SQLquery = ko.observable("");
    self.domainList =  ko.observableArray();
    self.selectedFields = ko.observableArray();
    self.SQLfieldList = ko.observableArray();
    self.sortFields = ko.observableArray();
    self.leftFile = ko.observable();
    self.rightFile = ko.observable();
}

var ViewModel = function () {
//function SinglepageViewModel() {
//var VM = function() {
    // Data
    var self = this;
    self.studypathText = ko.observable("C:/CDR/3945/56021927PCR1024/DRMdata/");
    self.datasetsList = ko.observableArray();
    self.datasetsLijst = [];
    //self.leftFile = ko.observable();
    //self.rightFile = ko.observable();
    self.leftFieldList = ko.observable();
    self.rightFieldList = ko.observable();
    self.leftField = ko.observable();
    self.rightField = ko.observable();
    //self.selectedFields = ko.observableArray();
    self.joinTypes = ["INNER JOIN", "OUTER JOIN", "LEFT JOIN"];
    self.sortDirections = ["ASC", "DESC"];
    self.whereClause = ko.observable("");
    self.SQLquery = ko.observable();
    self.links = ko.observableArray([]);
    self.sorts = ko.observableArray([]);
    //self.sqé = new StudyQuery()
    self.sq = new StudyQuery("","",  "", "","", [,],
        [], [,], [,],"" , "" );
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
            $("#MasterDiv").removeClass('d-none'); //view the MasterDiv of the QueryBuilder
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
            self.sq.selectedFields.removeAll();

        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }

    self.fetchRightFields = function() {
        $.getJSON("/fetchfields", {
            studyPath: self.studypathText(),
            selectedDomain: self.sq.rightFile(),
        }).done(function (result, status, xhr) {
            lijst = result.fieldList;
            for (i=0; i < lijst.length; i++) {
                lijst[i] = self.sq.rightFile() + "." + lijst[i];
            }
            self.rightFieldList(lijst);
            self.links.removeAll();
            self.sorts.removeAll();
            self.sq.selectedFields.removeAll();
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }


    self.addLink = function() {
        self.links.push(new Link("", "", ""));
        //alert("array: " + self.links()[0].toString());
    };

    this.leftDomainField = ko.computed(function() {
        return this.sq.leftFile() + " " + this.leftField();
    }, this);

    self.addSort = function() {
        self.sorts.push(new Sort("", ""));
        //alert("array: " + self.links()[0].toString());
    };


    self.addLeftFieldSelect = function() {
        //alert("selected: " + self.rightField());
        domainField = self.sq.leftFile() + "." + self.leftField();
        self.sq.selectedFields.push(domainField);
    }

    self.addRightFieldSelect = function() {
        //alert("selected: " + self.rightField());
        self.sq.selectedFields.push(self.rightField());
    }

    self.buildSQLstring = function() {
         linksLength =  self.links().length;
        if (linksLength > 0) {
            joinText = " " + self.links()[0].joinType() + " " + self.sq.rightFile() + " ON (" +
                self.sq.leftFile() + "." + self.links()[0].leftLink() + " = " + self.links()[0].rightLink();
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

        selection = self.sq.selectedFields().toString();
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
        //self.sq.selectedFields = self.selectedFields();
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
        //self.sq.selectedFields = self.selectedFields();
        //alert("JS sent selected fields : " + self.sq.selectedFields);
        sqstring = JSON.stringify(ko.toJS(self.sq));
//        $.getJSON('/fetchSQLdata', {
        $.getJSON('/fetchSQLdata2', {
            studyPath: self.studypathText(),
            sqstring: sqstring
        }, function(data, status, xhr) {
            //alert("full data: " + JSON.stringify(data));
            if (qTable !== null) {
              qTable.destroy();
              qTable = null;
              $("#queryTable").empty();
            }

            headings = "<thead id='queryTableHead'></thead>";
	        $("#queryTable").html(headings);

            qTable = $("#queryTable").DataTable({
                columns: data.cols,
                data: data.data,
                columnDefs: data.coldefs
            });
            /*
            headings = "<tr>";
	        for (i=0; i< data.cols.length; i++) {
		        headings += "<th>" + data.cols[i].data + "</th>"
                //headings += "<th>" + result.cols[i] + "</th>"
	        }
	        headings += "</tr>";
	        $("#queryTableHead").html(headings);
            */
            $("#DatatableDiv").removeClass('d-none');
            $("#QueryBuilderDiv").addClass('d-none');
            $("#btnEditQuery").removeClass('d-none');
            $("#btnRunQuery").addClass('d-none');
            $("#openModal .close").click();
        });
        return false;
    }

    self.editSQLquery = function() {
        $("#QueryBuilderDiv").removeClass('d-none');
        $("#btnEditQuery").addClass('d-none');
        $("#btnRunQuery").removeClass('d-none');
    }

    self.saveQueryModal = function() {
        self.buildSQLstring();
        $('#saveModal').modal('toggle');
    }

    self.saveQuery = function() {
        sqstring = JSON.stringify(ko.toJS(self.sq));
        $.getJSON("/saveQuery", {
            sqstring: sqstring,
        }).done(function (result, status, xhr) {
            alert("saved data: " + JSON.stringify(result));
            $('#saveModal').modal('toggle');
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }

    self.loadQueries = function() {
        $("#DatatableDiv").addClass('d-none');
        sqstring = JSON.stringify(ko.toJS(self.sq));
        $.getJSON("/fetchQueries", {
            sqstring: sqstring,
        }).done(function (result, status, xhr) {
            //alert("full data: " + JSON.stringify(result));
            list = result["queryList"]
            $("#loadList").html("");

            for (i=0; i<list.length; i++ ) {

                element = '<a href="#" class="list-group-item list-group-item-action viewQuery" id="' + list[i] + '">' +
                    list[i] + '</a>'

                //element = '<li class="list-group-item viewQuery" id="' +
                  //  list[i] + '">' + list[i]+ '</li>'
                $("#loadList").append(element);
            }
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }

    self.test = function(){
        alert("TEST OK!");
    }
    self.viewQuery = function(queryFile) {
        alert("queryfile : " + queryFile);
    }

    self.removeLink = function(link) {self.links.remove(link)}

    self.removeSort = function(sort) {self.sorts.remove(sort)}

    self.removeSelectField = function() { { self.sq.selectedFields.pop();} }

    self.removeAllLinks = function() {    }


}

var viewModel = new ViewModel();
ko.applyBindings(viewModel);
//ko.applyBindings(new SinglepageViewModel());
//ko.applyBindings(VM());
//var firstround = true;

viewQuery = function(queryFile) {
        alert("queryfile : " + queryFile);



    }



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
    $(document).on("click", ".viewQuery", function() {
        var queryFile = $(this).attr("id");

        $.getJSON("/fetchQueryContent", {
            queryFile: queryFile,
         }).done(function (result, status, xhr) {
                //alert("full data: " + JSON.stringify(result));
                //alert(JSON.stringify(result));
                viewModel.sq.name(result.name);
                viewModel.sq.dataModel(result.dataModel);
                viewModel.sq.scope(result.scope);
                viewModel.sq.description(result.description);
                viewModel.sq.rightFile(result.rightFile);
                viewModel.sq.leftFile(result.leftFile);
                if (typeof result.sorts != "undefined") {
                    viewModel.sorts(result.sorts);
                } else {
                    viewModel.sorts([]);
                }
                viewModel.sq.SQLquery(result.SQLquery);
                viewModel.sq.selectedFields(result.selectedFields);
                $('#openModal').modal('toggle');

         }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
         });
    })
} );

