var mf = acre.require("MANIFEST").MF;
var queries = mf.require("queries");

var FEATURED_DOMAIN_IDS =  [
  "/tv", "/film", "/book",
  "/people", "/location", "/business",
  "/government", "/music"
];

function domain_sort(func) {
  return function(a, b) {
    if (a.id.match("/default_domain$")) {
      return -1;
    } else if (b.id.match("/default_domain$")) {
      return 1;
    } else {
      return func(a, b);
    }
  };
}

var cache_policy = "public-long";

var p_domains;
if (acre.request.params.category) {
  p_domains = queries.domains_for_category(acre.request.params.category);
  
} else if (acre.request.params.domains === "featured") {
  p_domains = queries.domains_for_ids(FEATURED_DOMAIN_IDS);
  
} else if (acre.request.params.domains === "all") {
  mf.require("template", "renderer").render_def(
    null,
    mf.require("templates"),
    "domain_toc_panel",
    queries.alphabetically_grouped_domains(true)
  );
  mf.require("core", "cache").set_cache_policy(cache_policy);
  acre.exit();
  
} else if (acre.request.params.user) {
  cache_policy = "nocache";
  p_domains = queries.domains_for_user(acre.request.params.user);
}

p_domains
  .then(function(domains) {
    
    // Sort the domains as specified
    if (acre.request.params.sort === "name") {
      // Sort domains alphabetically by name
      return domains.sort(domain_sort(function(a, b) {
        if (a.name < b.name) {
          return -1
        } else if (a.name > b.name) {
          return 1;
        } else {
          return 0;
        }
      }));
    
    } else if (acre.request.params.sort === "members") {
       // Sort domains by total topics
       return domains.sort(domain_sort(function(a, b) {
         return b.member_count - a.member_count;
       }));
    
    } else if (acre.request.params.sort === "facts") {
      // Sort domains by total facts
      return domains.sort(domain_sort(function(a, b) {
        var a_facts = a.activity ? a.activity.total.e : 0;
        var b_facts = b.activity ? b.activity.total.e : 0;
        return b_facts - a_facts;
      }));
    
    } else if (acre.request.params.sort === "topics") {
       // Sort domains by total topics
       return domains.sort(domain_sort(function(a, b) {
         var a_topics = a.activity ? a.activity.total.t : 0;
         var b_topics = b.activity ? b.activity.total.t : 0;
         return b_topics - a_topics;
       }));
    
    } else {
      // Sort domains by recent activity
      return domains.sort(domain_sort(function(a, b) {
        var a_activity = a.activity ? a.activity.weeks[a.activity.weeks.length-1].e : 0;
        var b_activity = b.activity ? b.activity.weeks[b.activity.weeks.length-1].e : 0;
        return b_activity - a_activity;
      }));
    }
  });

mf.require("template", "renderer").render_def(
  null,
  mf.require("templates"),
  "category_panel",
  p_domains
);

mf.require("core", "cache").set_cache_policy(cache_policy);
