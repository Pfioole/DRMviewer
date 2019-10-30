$(document).ready(function() {
    //$('#example').DataTable();
			
	$(window).resize(function() {
		var x = $("#tableHolder").offset();
		var tableheight = parseInt($(window).height() - x.top - 30);
		$("#tableHolder").height(tableheight);
		var afterheight = parseInt($("#tableHolder").height());
	}); 

	var x = $("#tableHolder").offset();
	var tableheight = parseInt($(window).height() - x.top - 30);
	$("#tableHolder").height(tableheight);
	
	$("#ds_filter").on("keyup", function() {
		var value = $(this).val().toLowerCase();
		$("#ds_body tr").filter(function() {
			$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
		});
	});


	
} );
	
// COLUMN HIDE
$("input:checkbox:not(:checked)").each(function() {
    var column = "table ." + $(this).attr("name");
    $(column).hide();
});

$("input:checkbox").click(function(){
    var column = "table ." + $(this).attr("name");
    $(column).toggle();
});
	
