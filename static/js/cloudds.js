
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
    self.leftLink = ko.observable("");
    self.rightLink = ko.observable("");
}

function Listedlink(leftLink, rightLink) {
    var self = this;
    self.leftLink = leftLink;
    self.rightLink = rightLink;
}
/*
function Sort(sortField, sortDirection) {
    var self = this;
    self.sortField = ko.observable("");
    self.sortDirection = ko.observable("");
}
*/

function StudyQuery(name, description, scope, dataModel, status, author, SQLquery,
                    datasets, joins, limit, _id, bm) {
    var self = this;
    self.name = ko.observable("");
    self.description = ko.observable();
    self.scope = ko.observable();
    self.dataModel = ko.observable();
    self.status = ko.observable();
    self.author = ko.observable("");
    self.SQLquery = ko.observable("");
    self.datasets = ko.observableArray();
    self.joins = ko.observableArray();
    self.limit = ko.observable(10000);
    self._id = {};
    self.bm = ko.observableArray();
}


function InputQuery(name, description, scope, dataModel, SQLquery,
                    datasets, joins, limit, _id, bm) {
    var self = this;
    self.name = "";
    self.description = "";
    self.scope = "";
    self.dataModel = "";
    self.status = "";
    self.author = "";
    self.SQLquery = "";
    self.datasets = [];
    self.joins = [];
    self.limit = 10000;
    self._id = {};
    self.bm = [];
}

function SearchQuery(name, description, scope, dataModel, author, status) {
    var self = this;
    self.name = ko.observable("");
    self.description = ko.observable("");
    self.scope = ko.observable("");
    self.dataModel = ko.observable("");
    self.author = ko.observable("");
    self.status = ko.observable("");
}

/*
function BuildMatrix(usedfields, showfields, as, groupings, sortings, filters) {
    var self = this;
    self.usedfields = ko.observableArray();
    self.showfields = ko.observableArray();
    self.as = ko.observableArray();
    self.groupings = ko.observableArray();
    self.sortings = ko.observableArray();
    self.filters = ko.observableArray();
}
*/


function BuildField(usedField, showField, as, grouping, sorting, filter) {
    var self = this;
    self.usedField = ko.observable();
    self.showField = ko.observable();
    self.as = ko.observable();
    self.grouping = ko.observable();
    self.sorting = ko.observable();
    self.filter = ko.observable();
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
    self.sortDirections = ["", "ASC", "DESC"];
    self.joinedLeftDS = ko.observable();
    self.joinedRightDS = ko.observable();
    self.joinType = ko.observable();
    self.links = ko.observableArray();   //can be removed?
    self.leftLinkFieldList = ko.observableArray();
    self.rightLinkFieldList = ko.observableArray();
    self.sq = new StudyQuery("","",  "", "","", [,],
         "", [],[],"" , {} , []);
    self.searchQuery = new SearchQuery("", "", "", "", "", "");
    self.dataModels = ["", "SDTM", "DRM", "Other"];
    self.statuses = ["", "Personal", "Development", "In Test", "Approved"];
    self.scopes = ["", "Global", "Neurosciences", "Oncology", "Immunology", "CVM", "IDV", "PHA"];
    self.query_list = ko.observableArray([]);
    self.booleantest = ko.observable(false);
    self.bm = ko.observableArray([]);

    // Operations
    self.fetchDatasets = function() {
        $.getJSON("/fetchdatasets", {
            studyPath: self.studypathText(),
        }).done(function (result, status, xhr) {
            lijst = result.datasetsList;
            self.datasetsList(lijst);
            self.datasetsLijst = lijst;
            self.domainList = result.datasetsList;
            $("#MasterDiv").removeClass('d-none'); //view the MasterDiv of the QueryBuilder
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
        getMetadata(self.studypathText());
    }

    self.fetchLeftFields = function() {
        $.getJSON("/fetchfields", {
            studyPath: self.studypathText(),
            selectedDomain: self.leftFile(),
        }).done(function (result, status, xhr) {
            lijst = result.fieldList;
            self.links.removeAll();
            self.leftFieldList(lijst);
            self.sq.bm.removeAll();
            if (self.sq.datasets().length < 1) {
                self.sq.datasets.push(self.leftFile());
            } else {
                self.sq.datasets.splice(0, 1, self.leftFile());
            }
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
            self.sq.bm.removeAll();
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
        }).done(function (result, status, xhr) {
            lijst = result.fieldList;
            self.rightLinkFieldList(lijst);
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
/*
    this.leftDomainField = ko.computed(function() {
        return this.leftFile() + " " + this.leftField();
    }, this);
*/
    self.addLeftFieldSelect = function() {
        //alert("selected: " + self.rightField());
        _domainField = self.leftFile() + "." + self.leftField();
        bf = new BuildField( "",  true, "", "", "", "");
        bf.usedField(_domainField);
        bf.showField(true);
        self.sq.bm.push(bf);
    }

    self.addRightFieldSelect = function() {
        //alert("selected: " + self.rightField());
        _domainField = self.rightFile() + "." + self.rightField();
        bf = new BuildField( "",  true, "", "", "", "");
        bf.usedField(_domainField);
        bf.showField(true);
        self.sq.bm.push(bf);
    }

    self.buildSQLstring = function() {
        //assumes _bm_length is > 0
        _bm_length = self.sq.bm().length;

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

        // Where clause
        _subset_array = []
        for (i=0; i < _bm_length; i++) {
            if ((self.sq.bm()[i].filter() != null) && (self.sq.bm()[i].filter() != "")) {
                _subset_array.push(self.sq.bm()[i].usedField() + " " + self.sq.bm()[i].filter());
            }
        }
        if (_subset_array.length > 0) {
            whereSQL = " WHERE (" + _subset_array[0]
            if (_subset_array.length >1) {
                for (i=1; i < _subset_array.length; i++){
                    whereSQL += ") AND (" + _subset_array[i];
                }
            }
            whereSQL += ")";
        } else {
            whereSQL = "";
        }

        //select fields
        _subset_array = []
        for (i=0; i < _bm_length; i++) {
            if (self.sq.bm()[i].showField()) {
                _entry = self.sq.bm()[i].usedField();
                if ((self.sq.bm()[i].as() != null) && (self.sq.bm()[i].as() != "")) {
                    _entry += " AS " + self.sq.bm()[i].as();
                }
                _subset_array.push(_entry);
            }
        }
        selection = _subset_array.toString();
        selection = selection.replace(/,/g, "\, ");  //add a blanks after comma for readability

        _subset_array = [];
        for (i=0; i < _bm_length; i++) {
            if ((self.sq.bm()[i].sorting() != null) && (self.sq.bm()[i].sorting() != "")) {
                _entry = self.sq.bm()[i].usedField() + " " + self.sq.bm()[i].sorting();
                _subset_array.push(_entry);
            }
        }
        if (_subset_array.length == 0) {
            sorting = "";
        } else {
            sorting = " ORDER BY " + _subset_array.toString();
            sorting = sorting.replace(/,/g, "\, ");  //add a blanks after comma for readability
        }

        if (self.sq.limit().length != 0) {
            limit = " LIMIT " + self.sq.limit().toString();
        } else {
            limit = "";
        }

        SQLquery = "SELECT " + selection + " FROM " + self.leftFile() + joinText + whereSQL + sorting + limit + ";";
        //self.SQLquery(SQLquery);
        console.log("BuildQuery sql query :"  + SQLquery);
        self.sq.SQLquery(SQLquery);
    }


    self.runQuery4 = function() {
/*        self.buildSQLstringold();
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
   */
    }


    self.runSQLquery = function() {
        self.buildSQLstring();
        sqstring = JSON.stringify(ko.toJS(self.sq));
        $.getJSON('/fetchSQLdata3', {
            studyPath: self.studypathText(),
            sqstring: sqstring
        }, function(data, status, xhr) {
            if (typeof data.ERROR == "undefined") {
                /*
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
                */
                queryname = self.sq.name();

                //create the corresponding input query object for later use
                if (typeof self.sq._id == "undefined") {
                    self.sq._id({});
                }

                showTable(data.cols, data.data, data.coldefs, self.sq);

                //            viewModel.adapt_domain_field_list(self.leftFile(), "left");
                //            viewModel.adapt_domain_field_list(self.rightFile(), "right");
                $("#DatatableDiv").removeClass('d-none');
                $("#QueryBuilderDiv").addClass('d-none');
                $("#btnEditQuery").removeClass('d-none');
                $("#btnRunQuery").addClass('d-none');
                $("#openModal .close").click();
            } else {
                alert("An error occurred retrieving the queried data :" + data.ERROR);
            }
        });
        return false;
    }

    self.editSQLquery = function() {
        $("#QueryBuilderDiv").removeClass('d-none');
        $("#btnEditQuery").addClass('d-none');
        $("#btnRunQuery").removeClass('d-none');
        self.sq.name("");
        self.sq.description("");
        self.sq.scope("");
        self.sq.dataModel("");
        self.sq.status("");
        self.sq.author("");
    }

    self.saveQueryModal = function() {
        self.buildSQLstring();
        //self.buildSQLstringold();
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
	            //alert(JSON.stringify(returned));
                return returned;
	        });
            //self.query_list(result.query_list);
            // console.log(JSON.stringify(returned));
            self.query_list(t);
            //console.log(JSON.stringify(self.query_list()));
        }).fail(function (xhr, status, error) {
            alert("Error retrieving AJAX data: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }

    self.getMongoJSONstring = function() {
        let searchString = JSON.stringify(ko.toJS(self.searchQuery));
        $.getJSON("/Mongo_query", {

            searchString: searchString //{"test":"test"},
        }).done(function (result, status, xhr) {
            alert("JS received data: " + JSON.stringify(result));
            console.log(JSON.stringify(result));

        }).fail(function (xhr, status, error) {
            alert("Error retrieving AJAX data: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }

    self.clearMongoFilter = function() {
        self.searchQuery.name("");
        self.searchQuery.description("");
        self.searchQuery.dataModel("");
        self.searchQuery.scope("");
        self.searchQuery.status("");
        self.searchQuery.author("");
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
        //console.log("Selected entry from Mongo query_list: " + JSON.stringify(mongoQuery));
        viewQueryFunction(mongoQuery);
    }

    self.deleteMongoQuery = function(mongoQuery) {
        // console.log("To be deleted entry from Mongo query_list: " + JSON.stringify(mongoQuery));
        deleteQueryFunction(mongoQuery);
    }

    self.viewJSONmodal = function(mongoQuery) {
        _JSONlink = http_path +  "/Mongo_query?name=" + mongoQuery.name;
        _pretty = JSON.stringify(mongoQuery, undefined, 4)
        $("#JSONlink").html(_JSONlink);
        $("#JSONprettyPrint").html(_pretty);
        $('#prettyPrintModal').modal('toggle');
    }

    self.removeLink = function(link) {
        self.links.remove(link);
    }

    self.removeUsedField = function(field) {
        self.sq.bm.remove(field);
    }

    self.removeAllLinks = function() {    }

    self.makeString = function(KOobject) {
        return JSON.stringify(ko.toJS(KOobject));
    }

}

var viewModel = new ViewModel();
ko.applyBindings(viewModel);

function deleteQueryFunction(mongoQuery) {
    let delete_id = JSON.stringify(mongoQuery._id);
    // alert(delete_id);
    return $.ajax({
        url: '/Mongo_query',
        contentType: 'application/json',
        type: 'DELETE',
        data: delete_id,
        success: function (response) {
            alert( response.ok + " of " + response.n + " query succesfully deleted from the database")
            console.log( response.ok + " of " + response.n + " query succesfully deleted from the database");
            //$('#saveModal').modal('toggle');
            viewModel.searchMongo();
            return;
        },
        error: function () {
            alert("Failed to delete the query from the database");
            return console.log("Failed to delete the query from the database");
        }

    })
}

function viewQueryFunction(result) {
    //console.log("full data received: " + JSON.stringify(result));
    viewModel.sq.name(result.name);
    viewModel.sq.description(result.description);
    viewModel.sq.scope(result.scope);
    viewModel.sq.dataModel(result.dataModel);
    viewModel.sq.status(result.status);
    viewModel.sq.author(result.author);
    datasets = result.datasets;
    viewModel.leftFile(datasets[0]);
    // viewModel.fetchLeftFields(); /////////////////////////////needs completion!!!!!!!!!!!!!!!!!!!!
    if (datasets.length >1) {
        viewModel.rightFile(datasets[1]);
    } else {
        viewModel.rightFile(datasets[0]);
    }
    // viewModel.fetchRightFields(); ////////////////////////////needs completion!!!!!!!!!!!!!!!!!!!!!
    viewModel.sq.datasets(result.datasets);

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
    }

    if (typeof result.bm != "undefined") {
        viewModel.sq.bm.removeAll();
        for (var i = 0; i < result.bm.length; i++) {
            _usedField = result.bm[i].usedField;
            _showField = result.bm[i].showField;
            _as = result.bm[i].as;
            _grouping = result.bm[i]._grouping;
            _sorting = result.bm[i].sorting;
            _filter = result.bm[i].filter;
            bf = new BuildField( "",true, "", "", "", "");
            bf.usedField(result.bm[i].usedField);
            bf.showField(result.bm[i].showField);
            bf.as(result.bm[i].as);
            bf.grouping(result.bm[i].grouping);
            bf.sorting(result.bm[i].sorting);
            bf.filter(result.bm[i].filter);
            viewModel.sq.bm.push(bf);
            //console.log(viewModel.makeString(viewModel.sq));
        }
    }

    if (typeof result.limit != "undefined") {
        viewModel.sq.limit(result.limit);
    } else {
        viewModel.sq.limit(10000);
    }
    viewModel.sq.SQLquery(result.SQLquery);
    //console.log( "SQ object at end: " + viewModel.makeString(viewModel.sq));

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
    //console.log(JSON.stringify("sq.SQLquery formed from load query: " + viewModel.sq.SQLquery()));
}

function getMetadata(study_path) {
   $.getJSON("/getMetadata", {
        studyPath: study_path,
    }).done(function (result, status, xhr) {
        metadata = result;
        drawMetadaTable(metadata);
    }).fail(function (xhr, status, error) {
        alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
    });
}

function drawMetadaTable(metadata){
    _domain_table = '<table  class="table table-striped table-sm table-hover"><thead>' +
        '<th>Domain</th><th>Rows</th><th>Columns</th><th>Encoding</th><th>SAS File Label</th><tbody>';
    metadata.domains.forEach(function (item, index) {
      _domain_table += "<tr><td>" + item + "</td><td>" +
          metadata[item].number_rows + "</td><td>" +
          "<a href='#' class='domainselection' id='" + item + "'>" +
          metadata[item].number_columns + "</a></td><td>" + metadata[item].file_encoding + "</td><td>" +
          metadata[item].file_label + "</td></tr>";
    });
    _domain_table += "" + "</tbody></table>";
    $("#domaintable").html(_domain_table);
    _pretty = JSON.stringify(metadata, undefined, 4);
    //$("#metadatacontent").html(_pretty);
}

let data = {};  //declaration of object to be used for datatables content
var tabcounter = 4; //must be 1 less the fixed amount of tabs
var http_path;


function showTable(cols, data, coldefs, studyQuery){

    var nextTab = tabcounter - 3;
    tabcounter +=1;

    //addTabQuery(self.sq, nextTab);
    //inputQuery2 = new InputQuery( studyQuery.name(), )
    _name= studyQuery.name();

    _inputQuery = JSON.parse(JSON.stringify(ko.toJS(studyQuery)));
    /*
    _inputQuery = new InputQuery(_name, studyQuery.description(), studyQuery.scope(),
            studyQuery.dataModel(), studyQuery.SQLquery(), studyQuery.datasets(), studyQuery.joins(),
           studyQuery.limit(), studyQuery._id, studyQuery.bm());

    _inputQuery.name = studyQuery.name();
    _inputQuery.datasets = studyQuery.datasets();
    */
    if (_inputQuery.name.length == 0) {
        _queryname = "view" + nextTab;
    } else {
        _queryname = _inputQuery.name;
    }

    console.log("input query: " + JSON.stringify(_inputQuery));
    console.log("sq originally: " + JSON.stringify(ko.toJS(studyQuery)));
    console.log("query name as in sq: " + studyQuery.name());
    console.log("queryname used from sq: " + _queryname);
    console.log("name from inputquery: " + _inputQuery.name);

    arrTabInputQueries[nextTab] = _inputQuery;

    // create the tab

    $('<li class="nav-item" id="nav_item' + nextTab + '"><a class="nav-link" id="tab"' + nextTab +
        ' href="#tab'+nextTab+'" data-toggle="tab"' + ' role="tab"><h5><i class="fa fa-window-close close_tab" ' +
        'id="close_tab'+ nextTab + '" aria-hidden="true"></i> ' + _queryname +'</h5></a></li>').appendTo('#navTabs');

    tab_content = '<table id="queryTable' + nextTab + '" class="display table-sm"><thead id="queryTableHead' + nextTab +
        '"></thead></table>';

    // create the tab content
    $('<div class="tab-pane" id="tab'+nextTab+'">' + tab_content + '</div>').appendTo('.tab-content');

    current_table_id = "#queryTable" + nextTab;
    pTable = $(document).find(current_table_id).DataTable({
        columns: cols,
        data: data,
        columnDefs: coldefs
    });

    // make the new tab active
    $('#navTabs a:last').tab('show');

};

$(document).ready( function () {

    $(".joindivs").hide();
    $("#btnSingle").hide();
    $("#btnMetadataBack").hide();
    arrTabInputQueries = [];

    $.getJSON("/fetchCDRpath", {
        //??: ??,
    }).done(function (result, status, xhr) {
        viewModel.studypathText(result.CDRpath);
        http_path = result.http_path;
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
         }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
         });
    })

    $(document).on("click", ".domainselection", function() {
        var _domain = $(this).attr("id");
        _metadata_table = '<h3>' + _domain +' domain variables</h3>' +
            '<table  class="table table-striped table-sm table-hover"><thead>' +
            '<th>Name</th><th>Label</th><th>Column Width</th><tbody>';
        metadata[_domain].column_names.forEach(function (item, index) {
            _metadata_table += "<tr><td><a href='#' class='fieldrowselection' id='" + _domain + "." + item + "'>" +
                item + "</a></td><td>" +
              metadata[_domain]["column_labels"][index] + "</td><td>" +
              metadata[_domain]["variable_storage_width"][item] + "</td></tr>";
        })
        _metadata_table +=  "</tbody></table>";
        $("#domaintable").html(_metadata_table);
        $("#btnMetadataBack").show();
    })

    $(document).on("click", ".fieldrowselection", function() {
        var _full_field = $(this).attr("id");
        var _domain = _full_field.split(".")[0];
        var _field = _full_field.split(".")[1];

        $.getJSON("/columnFrequency", {
            studyPath: viewModel.studypathText(),
            domain: _domain,
            field: _field
         }).done(function (result, status, xhr) {
                _metadata_table = '<h3>' + _field +' frequencies from ' + _domain + ' in study ' + viewModel.studypathText() + '</h3>' +
                    '<table  class="table table-striped table-sm table-hover"><thead>' +
                    '<th>Field</th><th>Observations</th><tbody>';
                    for (let [key, value] of Object.entries(result)) {
                        _metadata_table += "<tr><td>" + key + "</td><td>" + value + "</td></tr>";
                    }
                _metadata_table +=  "</tbody></table>";
                $("#domaintable").html(_metadata_table);
                $("#btnMetadataBack").show();

         }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
         });


    })

    $(document).on("click", ".close_tab", function() {
        icon_nr = $(this).attr("id").substring(9);
        //currentDataTableDiv = "#DataTableDiv" + icon_nr;
        currentTab = "tab" + icon_nr;
        current_nav_item =  "#nav_item" + icon_nr;
        //$(currentDataTableDiv).remove();
        $(currentTab).remove();
        $(current_nav_item).remove();
            // make the last tab active
        $('#navTabs a:last').tab('show');
        //$('#navTabsContent a:last').tab('show');
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
        viewModel.sq.bm.removeAll();
    });

     $("#btnMetadataBack").click(function(){
        getMetadata(viewModel.studypathText());
        $("#btnMetadataBack").hide();
    });
  /*
    function addTabQuery(studyQuery) {
        inputQuery = new InputQuery(studyQuery.name(), studyQuery.description(), studyQuery.scope(),
            studyQuery.dataModel(), studyQuery.SQLquery(), studyQuery.datasets(), studyQuery.joins(),
           studyQuery.limit(), studyQuery._id, studyQuery.sq.bm());
    }
  */





} );

