
var qTable = null;

function Join(joinedLeftDS, joinType, joinedRightDS, links) {
    var self = this;
    self.joinedLeftDS = joinedLeftDS;
    self.joinType = joinType;
    self.joinedRightDS = joinedRightDS;
    self.links = links
}

function Link(leftLink, rightLink) {
    var self = this;
    //self.joinType = ko.observable("");
    self.leftLink = ko.observable("");
    self.rightLink = ko.observable("");
}

function Listedlink(leftLink, rightLink) {
    var self = this;
    //self.joinType = ko.observable("");
    self.leftLink = leftLink;
    self.rightLink = rightLink;
}

function Sort(sortField, sortDirection) {
    var self = this;
    self.sortField = ko.observable("");
    self.sortDirection = ko.observable("");
}

function StudyQuery(name, description, scope, dataModel, SQLquery, selectedFields,  whereClause, sorts,
                    sortFields, leftFile, rightFile, datasets, joins) {
    var self = this;
    self.name = ko.observable("");
    self.description = ko.observable();
    self.scope = ko.observable();
    self.dataModel = ko.observable();
    self.SQLquery = ko.observable("");
    //self.domainList =  ko.observableArray();
    self.selectedFields = ko.observableArray();
    //self.SQLfieldList = ko.observableArray();
    self.whereClause = ko.observable("");
    self.sorts = ko.observableArray();
    self.sortFields = ko.observableArray();
    self.leftFile = ko.observable();
    self.rightFile = ko.observable();
    self.datasets = ko.observableArray();
    self.joins = ko.observableArray();

}

var ViewModel = function () {
//function SinglepageViewModel() {
//var VM = function() {
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
    //self.selectedFields = ko.observableArray();
    self.joinTypes = ["INNER JOIN", "OUTER JOIN", "LEFT JOIN"];
    self.sortDirections = ["ASC", "DESC"];
    self.sortDomain = ko.observable();
    self.sortField = ko.observable();
    self.sortFieldList = ko.observableArray();
    self.sortDirection = ko.observable();
    self.joinedLeftDS = ko.observable();
    self.joinedRightDS = ko.observable();
    self.joinType = ko.observable();
    self.links = ko.observableArray();   //can be removed?
    self.leftLinkFieldList = ko.observableArray();
    self.rightLinkFieldList = ko.observableArray();
    //self.whereClause = ko.observable("");
    //self.SQLquery = ko.observable();
    //self.sorts = ko.observableArray([]);
    self.sq = new StudyQuery("","",  "", "","", [,],
         "", [],[],"" , "" , [], []);



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
            //self.sq.domainList(lijst);
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
            selectedDomain: self.leftFile(),
        }).done(function (result, status, xhr) {
            lijst = result.fieldList;
            for (i=0; i < lijst.length; i++) {
                // lijst[i] = self.sq.leftFile() + "." + lijst[i];
            }
            self.links.removeAll();

            self.leftFieldList(lijst);

            self.sq.sorts.removeAll();
            self.sq.selectedFields.removeAll();
            if (self.sq.datasets().length < 1) {
                self.sq.datasets.push(self.leftFile());
            } else {
                self.sq.datasets.splice(0, 1, self.leftFile());
            }
            //lijst.shift(); // remove the first element: *, not needed in the link list
            self.leftLinkFieldList.removeAll;
            for (i=1; i < lijst.length; i++) {
                self.leftLinkFieldList.push(lijst[i]);
            }

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
            self.sq.sortFields.removeAll();
            self.sq.sorts.removeAll();
            self.sq.selectedFields.removeAll();
            if (self.sq.datasets().length < 2) {
                self.sq.datasets.push(self.rightFile());
            } else {
                self.sq.datasets.splice(1, 1, self.rightFile());
            }
            self.rightLinkFieldList.removeAll;
            for (i=1; i < lijst.length; i++) {
                self.rightLinkFieldList.push(lijst[i]);
            }
            //self.addLink();
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }


     self.fetchLeftLinkFields = function() {
        $.getJSON("/fetchfields", {
            studyPath: self.studypathText(),
            selectedDomain: self.joinedLeftDS,
            //origin: "sort"
        }).done(function (result, status, xhr) {
            lijst = result.fieldList;
            self.leftLinkFieldList(lijst);
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }

     self.fetchRightLinkFields = function() {
        $.getJSON("/fetchfields", {
            studyPath: self.studypathText(),
            selectedDomain: self.joinedRightDS(),
            //origin: "sort"
        }).done(function (result, status, xhr) {
            lijst = result.fieldList;
            self.rightLinkFieldList(lijst);
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }

    self.fetchSortFields = function() {
        $.getJSON("/fetchfields", {
            studyPath: self.studypathText(),
            selectedDomain: self.sortDomain(),
            //origin: "sort"
        }).done(function (result, status, xhr) {
            lijst = result.fieldList;
            self.sortFieldList(lijst);
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }


    self.addLink = function() {
        self.links.push(new Link("", ""));
        //alert("array: " + self.links()[0].toString());
    };

    self.addNewLink = function(leftlink, rightlink) {
        self.links.push(new Link(leftlink, rightlink));
        //alert("array: " + self.links()[0].toString());
    };

    self.createJoin = function() {
        self.sq.joins.removeAll();
        newJoin1 = new Join(self.leftFile(), self.joinType(), self.rightFile(), self.links())
        self.sq.joins.push(newJoin1);
        //alert(self.sq.joins()[0].joinedLeftDS);
        //alert(self.sq.joins()[0].links[0].leftLink());
    }

    this.leftDomainField = ko.computed(function() {
        return this.leftFile() + " " + this.leftField();
    }, this);

    self.addSort = function() {
        self.sq.sortFields.push(new Sort("", ""));
    };

    self.addOrderBy = function() {
        self.sq.sorts.push(self.sortDomain() + "." + self.sortField() + " " + self.sortDirection());
    }

    self.addLeftFieldSelect = function() {
        //alert("selected: " + self.rightField());
        domainField = self.leftFile() + "." + self.leftField();
        self.sq.selectedFields.push(domainField);
    }

    self.addRightFieldSelect = function() {
        //alert("selected: " + self.rightField());
        domainField = self.rightFile() + "." + self.rightField();
        self.sq.selectedFields.push(domainField);
    }

    self.buildSQLstring = function() {

        // JOIN text
        joinLength = self.sq.joins().length;
        if ((joinLength > 0) && (self.leftFile() !== self.rightFile())) {
            self.createJoin();
            linksLength = self.sq.joins()[0].links.length;
            alert("self.buildSQLstring linkslength: " + linksLength);

            joinText = " " + self.sq.joins()[0].joinType + " " + self.sq.joins()[0].joinedRightDS + " ON (" +
                self.sq.joins()[0].joinedLeftDS + "." + self.sq.joins()[0].links[0].leftLink() + " = "
                + self.sq.joins()[0].joinedRightDS + "." + self.sq.joins()[0].links[0].rightLink();

            if (linksLength > 1) {
                for (i = 1; i < linksLength; i++) {
                    joinText += ") AND (" + self.leftFile() + "." + self.sq.joins()[0].links[i].leftLink()
                        + " = " + self.sq.joins()[0].joinedRightDS + "." + self.sq.joins()[0].links[i].rightLink();
                }
            }
            joinText += ")";
        } else {
            joinText = "";
        }

        if ((self.sq.whereClause() !== "") && (typeof self.sq.whereClause() !== "undefined")) {
            //if  (self.sq.whereClause().length >0) {
            whereSQL = " WHERE " + self.sq.whereClause();
            //alert(whereSQL)
        } else {
            whereSQL = "";
        }

        if (self.sq.selectedFields().length == 0) {
            self.sq.selectedFields.push(self.leftFile() + ".*")
        }
        ;
        selection = self.sq.selectedFields().toString();
        selection = selection.replace(/,/g, "\, ");  //in order to add a blank after each comma for readability

        if (typeof self.sq.sorts() != "undefined") {
             if (self.sq.sorts().length != 0) {
                orderBy = " ORDER BY " + self.sq.sorts().toString();
                orderBy = orderBy.replace(/,/g, "\, ");  //in order to add a blank after each comma for readability
            } else {
                 orderBy = "";
            }
        } else {
             orderBy = "";
        }

        SQLquery = "SELECT " + selection + " FROM " + self.leftFile() + joinText + whereSQL + orderBy + ";";
        //self.SQLquery(SQLquery);
        self.sq.SQLquery(SQLquery);
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
        $.getJSON('/fetchSQLdata3', {
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

    self.removeLink = function(link) {
        self.links.remove(link);
    }

    self.removeSort = function(sort) {self.sq.sortFields.remove(sort)}

    self.removeSort2 = function() { { self.sq.sorts.pop();} }

    self.removeSelectField = function() { { self.sq.selectedFields.pop();} }

    self.removeAllLinks = function() {    }

    self.makeString = function(KOobject) {
        return JSON.stringify(ko.toJS(KOobject));
    }



}

var viewModel = new ViewModel();
ko.applyBindings(viewModel);
//ko.applyBindings(new SinglepageViewModel());
//ko.applyBindings(VM());
//var firstround = true;

viewQuery = function(queryFile) {
        alert("queryfile : " + queryFile);



    }


let data = {};
/*
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

 */
//var qTable = $('#queryTable').DataTable() ;

$(document).ready( function () {

    $(".joindivs").hide();
    $("#btnSingle").hide();

    $(document).on("click", ".viewQuery", function() {
        var queryFile = $(this).attr("id");

        $.getJSON("/fetchQueryContent", {
            queryFile: queryFile,
         }).done(function (result, status, xhr) {
                //alert("full data: " + JSON.stringify(result));
                viewModel.sq.name(result.name);
                viewModel.sq.dataModel(result.dataModel);
                viewModel.sq.scope(result.scope);
                viewModel.sq.description(result.description);
                datasets = result.datasets;
                viewModel.leftFile(datasets[0]);
                if (datasets.length >1) {
                    viewModel.rightFile(datasets[1]);
                } else {
                    viewModel.rightFile(datasets[0]);
                }
                //viewModel.rightFile(result.rightFile);
                //viewModel.leftFile(result.leftFile);
                viewModel.sq.datasets(result.datasets);
                if (typeof result.whereClause != "undefined") {
                    viewModel.sq.whereClause(result.whereClause);
                } else {
                    viewModel.sq.whereClause("");
                }
                viewModel.sq.sortFields.removeAll();
                if (typeof result.sortFields != "undefined") {
                    for (var i = 0; i < result.sortFields.length; i++) {
                        viewModel.sq.sortFields.push(new Sort(result.sortFields[i].sortField, result.sortFields[i].sortDirection));
                    }
                } else {
                    alert (" sortFields undefined ");
                    viewModel.sq.sortFields([]);
                }
                viewModel.sq.sorts.removeAll();
                if (typeof result.sorts != "undefined") {
                     for (var i = 0; i < result.sorts.length; i++) {
                        viewModel.sq.sorts.push(result.sorts[i]);
                    }
                } else {
                    alert (" sorts undefined ");
                    viewModel.sq.sorts([]);
                }
                //viewModel.sq.sorts(result.sorts);

                if (typeof result.joins != "undefined") {
                    //alert( "SQ object before: " + viewModel.makeString(viewModel.sq));
                    viewModel.sq.joins.removeAll();
                    viewModel.links.removeAll();
                    //alert( "SQ object after join removal: " + viewModel.makeString(viewModel.sq));
                    for (var i = 0; i < result.joins.length; i++) {
                        links = [];
                        listedlinks = [];
                        for (var j = 0; j < result.joins[i].links.length ; j++) {
                            leftlink = result.joins[i].links[j].leftLink;
                            rightlink = result.joins[i].links[j].rightLink;
                            link = new Link(leftlink, rightlink);
                            listedlink = new Listedlink(leftlink, rightlink);
                            var newlink = new Link(leftlink, rightlink);
                            listedlinks.push(listedlink);

                            viewModel.addLink();
                            viewModel.links()[j].leftLink(leftlink);
                            viewModel.links()[j].rightLink(rightlink);

                        }
                        join = new Join( result.joins[i].joinedLeftDS,
                                        result.joins[i].joinType,
                                        result.joins[i].joinedRightDS,
                                        listedlinks);
                        viewModel.sq.joins.push(join);
                    }
                } else {
                    viewModel.sq.joins.removeAll();
                    //alert("All joins removed as the joins object was undefined")
                }


                //alert( "SQ object at end: " + viewModel.makeString(viewModel.sq));

                viewModel.sq.SQLquery(result.SQLquery);
                viewModel.sq.selectedFields(result.selectedFields);

                //Prepare the query edit view to fit either single table or joined tables
                if (viewModel.sq.joins().length > 0) {
                    $(".joindivs").show();
                    $("#btnSingle").show();
                    $("#btnJoin").hide();
                    //viewModel.createJoin();
                } else {
                    $(".joindivs").hide();
                    $("#btnJoin").show();
                    $("#btnSingle").hide();
                    //viewModel.links.removeAll();
                }
                $('#openModal').modal('toggle');

         }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
         });
    })

    $("#btnJoin").click(function(){
        $(".joindivs").show();
        $("#btnSingle").show();
        $("#btnJoin").hide();
        viewModel.addLink();
        viewModel.createJoin();
    });

    $("#btnSingle").click(function(){
        $(".joindivs").hide();
        $("#btnJoin").show();
        $("#btnSingle").hide();
        viewModel.links.removeAll();
        viewModel.sq.joins.removeAll();
        viewModel.sq.selectedFields.removeAll();
        //viewModel.sq.datasets.length = 1; //remove all datasets except the leftFile
    });

        //$("#btnJoinToggle").button('toggle')
        //[DIV].style.visibility='visible'
        //[DIV].style.visibility='hidden'
        //$(elem).hide();
        //$(elem).show();

} );

