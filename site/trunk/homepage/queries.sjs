var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("/freebase/site/promise/deferred");
var freebase = mf.require("/freebase/site/promise/apis").freebase;
var urlfetch = mf.require("/freebase/site/promise/apis").urlfetch;

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

var categories = function () {
  var q_categories = acre.require("categories").query;
  
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

var domains_for_category = function(category_id) {
  var category_q = [{
    "id": null,
    "name": null,
    "/common/topic/article": {"mid": null, "limit": 1, "optional": true},
    "type": "/type/domain",
    "!/freebase/domain_category/domains": {"id": category_id},
    "sort": "name"
  }];
  
  return freebase.mqlread(category_q)
    .then(function(envelope) {
      return envelope.result.map(function(domain) {
        return {
          "id": domain.id,
          "name": domain.name,
          "article": domain['/common/topic/article']
        };
      });
    })
    .then(function(domains) {
      promises = [];
      
      // Get article for each domain
      domains.forEach(function(domain) {
        if (domain.article) {
          var url = acre.freebase.service_url;
          url += "/api/trans/blurb"+domain.article.mid;
          url += "?length=150";
          promises.push(urlfetch(url)
            .then(function(response) {
              domain.description = response.body;
              return response.body;
            }));
          delete domain.article;
        }
      });
      
      // Get topic counts for each domain
      promises.push(freebase.get_static("activity", "all_freebase")
        .then(function(activity) {
          var topic_counts = {};
          activity.domains.topics.forEach(function(d) {
            topic_counts[d.id] = d.v;
          });
          
          domains.forEach(function(domain) {
            domain['topic_count'] = topic_counts[domain.id] || 0;
          });
          return activity
        }));
      
      return deferred.all(promises).then(function() {return domains;});
    })
}
