var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("/freebase/site/promise/deferred");
var freebase = mf.require("/freebase/site/promise/apis").freebase;

groupBy = function(array, key) {
  var res = {};
  array.forEach(function(x) {
    var k = (typeof key === "function" ? key.apply(this, [x]) : x[key]);
    var v = res[k];
    if (!v) v = res[k] = [];
    v.push(x);
  });
  return res;
};

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
};

var commons_domains = function() {
  var q_domains = acre.require("commons_domains").query;
  
  return freebase.mqlread(q_domains)
    .then(function(envelope) {
      return envelope.result.map(function(domain) {
        return {
          "id": domain.id,
          "name": domain.name
        };
      });
    },
    function (error) {
      return [];
    });
};

var alphabetically_grouped_commons_domains = function() {
  return commons_domains()
    .then(function(domains) {
      return groupBy(domains, function(r) {
        return r.name[0].toLowerCase();
      });
    });
};