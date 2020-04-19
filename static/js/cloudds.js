
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
    self.selectedFields = ko.observableArray();
    self.whereClause = ko.observable("");
    self.sorts = ko.observableArray();
    self.sortFields = ko.observableArray();
    self.leftFile = ko.observable();
    self.rightFile = ko.observable();
    self.datasets = ko.observableArray();
    self.joins = ko.observableArray();
    //self._id = {};

}

function InputQuery(name, description, scope, dataModel, SQLquery, selectedFields,  whereClause, sorts,
                    sortFields, leftFile, rightFile, datasets, joins) {
    var self = this;
    self.name = "";
    self.description = "";
    self.scope = "";
    self.dataModel = "";
    self.status = "";
    self.author = "";
    self.SQLquery = "";
    self.selectedFields = [];
    self.whereClause = "";
    self.sorts = [];
    self.sortFields = [];
    self.leftFile = "";
    self.rightFile = "";
    self.datasets = [];
    self.joins = [];
    //self._id = {};

}

function SearchQuery(name, description, scope, dataModel, author, status, _id) {
    self.name = ko.observable("");
    self.description = ko.observable("");
    self.scope = ko.observable("");
    self.dataModel = ko.observable("");
    self.author = ko.observable("");
    self.status = ko.observable("");
    self._id = {};
}

var ViewModel = function () {
    var self = this;
    self.studypathText = ko.observable();
    self.datasetsList = ko.observableArray();
    self.datasetsLijst = [];
    self.leftFile = ko.observable();
    self.rightFile = ko.observable();
    self.leftFieldList = ko.observable();
    self.rightFieldList = ko.observable();
    self.leftField = ko.observable();
    self.rightField = ko.observable();
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
    self.sq = new StudyQuery("","",  "", "","", [,],
         "", [],[],"" , "" , [], []);

    self.searchQuery = new SearchQuery("", "", "", "", "", "", {});
    self.dataModels = ["", "SDTM", "DRM", "Other"];
    self.statuses = ["", "Personal", "Development", "In Test", "Approved"];
    self.scopes = ["", "Global", "Neurosciences", "Oncology", "Immunology", "CVM", "IDV", "PHA"];
    self.query_list = ko.observableArray([]);

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
 //           for (i=0; i < lijst.length; i++) {
                // lijst[i] = self.sq.leftFile() + "." + lijst[i];
 //           }
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

    self.adapt_domain_field_list= function(domain, side) {
        $.getJSON("/fetchfields", {
            studyPath: self.studypathText(),
            selectedDomain: domain
            //selectedDomain: self.leftFile(),
        }).done(function (result, status, xhr) {
            lijst = result.fieldList;
            if (side = "left") {
                self.leftFieldList(lijst);
            } else {
                self.rightFieldList(lijst);
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
    };

    self.addNewLink = function(leftlink, rightlink) {
        self.links.push(new Link(leftlink, rightlink));
    };

    self.createJoin = function() {
        self.sq.joins.removeAll();
        newJoin1 = new Join(self.leftFile(), self.joinType(), self.rightFile(), self.links())
        self.sq.joins.push(newJoin1);
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
            //alert("self.buildSQLstring linkslength: " + linksLength);

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
        console.log("BuildQuery jointext :"  + joinText);

        if ((self.sq.whereClause() !== "") && (typeof self.sq.whereClause() !== "undefined")) {
            //if  (self.sq.whereClause().length >0) {
            whereSQL = " WHERE " + self.sq.whereClause();
            //alert(whereSQL)
        } else {
            whereSQL = "";
        }
        console.log("BuildQuery whereclause :"  + whereSQL);


        if (self.sq.selectedFields().length == 0) {
            self.sq.selectedFields.push(self.leftFile() + ".*")
        };
        selection = self.sq.selectedFields().toString();
        selection = selection.replace(/,/g, "\, ");  //in order to add a blank after each comma for readability

        console.log("BuildQuery sql selection(fields) :"  + selection);


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
        console.log("BuildQuery sql query :"  + SQLquery);
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
        console.log("sq.selectedFields at start of runSQLquery :" + self.sq.selectedFields());
        console.log("sq.SQLquery at start of runSQLquery :" + self.sq.SQLquery());
        self.buildSQLstring();
        //self.sq.selectedFields = self.selectedFields();
        //alert("JS sent selected fields : " + self.sq.selectedFields);
        sqstring = JSON.stringify(ko.toJS(self.sq));

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

//            viewModel.adapt_domain_field_list(self.leftFile(), "left");
//            viewModel.adapt_domain_field_list(self.rightFile(), "right");
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

    self.add_Mongo_query = function() {
	    sqstring = JSON.stringify(ko.toJS(self.sq));
	    //alert(sqstring);
        return $.ajax({
            url: '/add_Mongo_query',
            contentType: 'application/json',
            type: 'POST',
            data: sqstring,
	    success: function(data) {
            alert("query successfully added to the database")
            console.log("query successfully added to the database");
            $('#saveModal').modal('toggle');
		    return;
	    },
	    error: function() {
            alert("Failed to add the query to the database: Query Name already exists");
		    return console.log("Failed to add the query to the database");
	    }
	});
    };

    self.searchMongo = function() {
        let searchString = JSON.stringify(ko.toJS(self.searchQuery));
        $.getJSON("/searchMongo", {
            searchString: searchString //{"test":"test"},
        }).done(function (result, status, xhr) {
            //alert("JS received data: " + JSON.stringify(result));

            var t = $.map(result.query_list, function(item) {
	            currentQuery = new InputQuery();
	            returned = Object.assign(currentQuery, item);
                return returned;
	        });
            //self.query_list(result.query_list);
            console.log(JSON.stringify(returned));
            self.query_list(t);
            console.log(JSON.stringify(self.query_list()));
            //alert(JSON.stringify(result.query_list[0].name));

        }).fail(function (xhr, status, error) {
            alert("Error retrieving AJAX data: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
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

            for (i = 0; i < list.length; i++) {

                element = '<a href="#" class="list-group-item list-group-item-action viewQuery" id="' + list[i] + '">' +
                    list[i] + '</a>'
                $("#loadList").append(element);
            }
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }

    self.viewMongoQuery = function(mongoQuery) {
        console.log("Selected entry from Mongo query_list: " + JSON.stringify(mongoQuery));
        viewQueryFunction(mongoQuery);
        //alert(mongoQuery.name);
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

function viewQueryFunction(result) {
    //alert("full data: " + JSON.stringify(result));
    viewModel.sq.name(result.name);
    viewModel.sq.dataModel(result.dataModel);
    //alert(result.dataModel());
    viewModel.sq.scope(result.scope);
    viewModel.sq.description(result.description);
    datasets = result.datasets;
    viewModel.leftFile(datasets[0]);
    // viewModel.fetchLeftFields(); /////////////////////////////needs completion!!!!!!!!!!!!!!!!!!!!
    if (datasets.length >1) {
        viewModel.rightFile(datasets[1]);
    } else {
        viewModel.rightFile(datasets[0]);
    }
    // viewModel.fetchRightFields(); ////////////////////////////needs completion!!!!!!!!!!!!!!!!!!!!!
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
    console.log("ViewQueryFunction sq.selectedFields : " + viewModel.sq.selectedFields());

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
    console.log(JSON.stringify("sq.SQLquery formed from load query: " + viewModel.sq.SQLquery()));
    console.log(JSON.stringify("sq.selectedFields formed selected fields: " + viewModel.sq.selectedFields()));
}



/*
viewQuery = function(queryFile) {
        alert("queryfile : " + queryFile);
    }
*/

let data = {};

$(document).ready( function () {

    $(".joindivs").hide();
    $("#btnSingle").hide();

    $.getJSON("/fetchCDRpath", {
        //??: ??,
    }).done(function (result, status, xhr) {
        viewModel.studypathText(result.CDRpath);
    }).fail(function (xhr, status, error) {
        alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
    });

    $(document).on("click", ".viewQuery", function() {
        var queryFile = $(this).attr("id");
        $.getJSON("/fetchQueryContent", {
            queryFile: queryFile,
         }).done(function (result, status, xhr) {
                alert("full data: " + JSON.stringify(result));

                viewQueryFunction(result);
/*
                viewModel.sq.name(result.name);
                viewModel.sq.dataModel(result.dataModel);
                viewModel.sq.scope(result.scope);
                viewModel.sq.description(result.description);
                datasets = result.datasets;
                viewModel.leftFile(datasets[0]);
                viewModel.fetchLeftFields();
                if (datasets.length >1) {
                    viewModel.rightFile(datasets[1]);
                } else {
                    viewModel.rightFile(datasets[0]);
                }
                viewModel.fetchRightFields();
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
*/
         }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
         });
    })

    $('#openModal').on('hidden.bs.modal', function () {
            viewModel.adapt_domain_field_list(viewModel.leftFile(), "left");
            viewModel.adapt_domain_field_list(viewModel.rightFile(), "right");
    });

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

} );

