var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("/freebase/site/promise/deferred");
var freebase = mf.require("/freebase/site/promise/apis").freebase;

var domain_categories = function () {
  var q_categories = acre.require("domain_categories").query;
  
  return freebase.mqlread(q_categories)
    .then(function(envelope) {
      return envelope.result.map(function(category) {
        return {
          "id": category.id,
          "name": category.name
        };
      });
    },
    
    function(error) {
      return [];
    });
}

//AlphabeticallyGroupedCommonsDomains(self, "grouped_commons_domains").do_query()