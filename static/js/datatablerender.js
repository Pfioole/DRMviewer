    <script type="text/javascript">
      $(document).ready(function() {
        var table = null;
        $('a#calculate').bind('click', function() {
          $.getJSON('/_get_table', {
            a: $('input[name="a"]').val(),
            b: $('input[name="b"]').val()
          }, function(data) {
            $("#elements").text(data.number_elements);
            if (table !== null) {
              table.destroy();
              table = null;
              $("#a_nice_table").empty();
            }
            table = $("#a_nice_table").DataTable({
              data: data.my_table,
              columns: data.columns
            });
          });
          return false;
        });
      });
    </script>