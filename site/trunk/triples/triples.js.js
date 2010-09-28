(function($, fb) {

  var schema = fb.schema = {};

  function init() {

    /**
     * $.tablesorter defaults
     */
    $.tablesorter.addParser({
      id: "triplesName",
      is: function(s) {
        return false;
      },
      format: function(s) {
        return $(s).text().toLowerCase();
      },
      type: 'text'
    });
    $.tablesorter.addParser({
      // set a unique id
      id: 'commaDigit',
      is: function(s) {
        // return false so this parser is not auto detected
        return false;
      },
      format: function(s) {
        // format your data for normalization
        return parseInt(s.replace(/\,/g, ""));
      },
      // set type, either numeric or text
      type: 'numeric'
    });

    $.tablesorter.defaults.cssAsc = "column-header-asc";
    $.tablesorter.defaults.cssDesc = "column-header-desc";
    $.tablesorter.defaults.cssHeader =  "column-header";
 
    // init table sorter
    var table = $(".table-sortable").tablesorter();

  };

  $(init);

})(jQuery, window.freebase);
