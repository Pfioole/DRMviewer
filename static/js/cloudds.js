/*
function Task(data) {
    this.title = ko.observable(data.title);
    this.isDone = ko.observable(data.isDone);
}
*/

/*
function Study(data) {
    this.studypath = ko.observable(data.studypath);
    this.datasetsList = ko.observable(data.datasetsList);
}
*/

function Link(leftLink, rightLink) {
    var self = this;
    self.leftLink = ko.observable("");
    self.rightLink = ko.observable("");
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
 /*
    self.tasks = ko.observableArray([]);
    self.newTaskText = ko.observable();
    self.incompleteTasks = ko.computed(function() {
        return ko.utils.arrayFilter(self.tasks(), function(task) { return !task.isDone() });
    });

 */

    self.links = ko.observableArray([]);

    // Operations
    self.fetchDatasets = function() {
        $.getJSON("/fetchdatasets", {
            studyPath: self.studypathText(),
        }).done(function (result, status, xhr) {
            lijst = result.datasetsList;
            self.datasetsList(lijst);
            self.datasetsLijst = lijst;
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });

    }

    self.fetchFields = function() {
        $.getJSON("/fetchfields", {
            studyPath: self.studypathText(),
            selectedFile: self.leftFile(),
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
            selectedFile: self.rightFile(),
        }).done(function (result, status, xhr) {
            lijst = result.fieldList;
            self.rightFieldList(lijst);
            self.links.removeAll();
        }).fail(function (xhr, status, error) {
            alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        });
    }


    self.addLink = function() {
        self.links.push(new Link("", ""));
        //alert("array: " + self.links()[0].toString());
    };

    self.removeLink = function(link) {self.links.remove(link)}

    self.removeAllLinks = function() {

    }


}


ko.applyBindings(new SinglepageViewModel());


