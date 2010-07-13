var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var urlfetch = mf.require("promise", "apis").urlfetch;
var feeds = acre.require('feeds');

function groupBy(array, key) {
  var res = {};
  array.forEach(function(x) {
    var k = (typeof key === "function" ? key.apply(this, [x]) : x[key]);
    var v = res[k];
    if (!v) { v = res[k] = []; }
    v.push(x);
  });
  return res;
}

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

var example_domain_data = {

"total":{"e":84809, "t":442, "a":250, "i":147}, 

"days":[{"e":182, "d":"2010-05-30"}, {"e":252, "d":"2010-05-31"}, {"e":193, "d":"2010-06-01"}, {"e":284, "d":"2010-06-02"}, {"e":178, "d":"2010-06-03"}, {"e":185, "d":"2010-06-04"}, {"e":240, "d":"2010-06-05"}, {"e":247, "d":"2010-06-06"}, {"e":184, "d":"2010-06-07"}, {"e":421, "d":"2010-06-08"}, {"e":251, "d":"2010-06-09"}, {"e":122, "d":"2010-06-10"}, {"e":144, "d":"2010-06-11"}, {"e":160, "d":"2010-06-12"}, {"e":284, "d":"2010-06-13"}, {"e":138, "d":"2010-06-14"}, {"e":138, "d":"2010-06-15"}, {"e":115, "d":"2010-06-16"}, {"e":184, "d":"2010-06-17"}, {"e":250, "d":"2010-06-18"}, {"e":241, "d":"2010-06-19"}, {"e":297, "d":"2010-06-20"}, {"e":169, "d":"2010-06-21"}, {"e":161, "d":"2010-06-22"}, {"e":179, "d":"2010-06-23"}, {"e":123, "d":"2010-06-24"}, {"e":148, "d":"2010-06-25"}, {"e":91, "d":"2010-06-26"}, {"e":289, "d":"2010-06-27"}, {"e":76, "d":"2010-06-28"}], 

"users":{"b":{"/user/mw_template_bot":142, "/user/mwcl_images":1, "/user/mw_prop_bot":5}, "h":{"/user/tfmorris":20, "/user/mouth04":5, "/user/reijo_casimero":18, "/user/jh":21, "/user/jrodriguez89":4}, "s":{"/user/gmackenz":1, "/user/teeler":5, "/user/djs111":65, "/user/iyella":166, "/user/akeko":51, "/user/ellennor":44, "/user/tina526":2, "/user/nanette":1, "/user/alden":22, "/user/mbaker":174, "/user/carolah":28, "/user/jon":26, "/user/szong":5, "/user/khendraw":42, "/user/jkatigbac":74, "/user/mgutierrezt":120, "/user/goddess888":62}}, 

"types":{"/film/film_job":183, "/film/film_featured_song":4, "/film/film_cut":1969, "/film/film_format":1, "/film/dubbing_performance":7, "/film/film_festival_event":32, "/film/film_set_designer":39, "/film/film_location":53, "/film/film_company":11, "/film/film_festival_sponsor":6, "/film/film_art_director":60, "/film/film_casting_director":31, "/film/cinematographer":232, "/film/film_crewmember":1135, "/film/film_theorist":3, "/film/content_rating_system":1, "/film/film_character":1267, "/film/film_awards_ceremony":2, "/film/editor":197, "/film/film_distributor":4, "/film/production_company":91, "/film/director":838, "/film/film_production_designer":57, "/film/producer":705, "/film/film_film_distributor_relationship":688, "/film/film_genre":20, "/film/music_contributor":234, "/film/content_rating":2, "/film/performance":9077, "/film/film_critic":5, "/film/film":3658, "/film/writer":757, "/film/film_series":10, "/film/film_regional_release_date":61, "/film/film_costumer_designer":84, "/film/actor":2607, "/film/film_film_company_relationship":1, "/film/film_screening_venue":1, "/film/personal_film_appearance":180, "/film/film_story_contributor":116, "/film/film_crew_gig":2501, "/film/film_festival":36, "/film/film_subject":67}, 

"weeks":[{"e":1493, "c":51690, "f":23411, "d":"2010-05-03"}, {"e":1136, "c":52457, "f":23642, "d":"2010-05-10"}, {"e":1745, "c":53729, "f":24431, "d":"2010-05-17"}, {"e":1530, "c":54864, "f":24863, "d":"2010-05-24"}, {"e":1819, "c":56138, "f":25478, "d":"2010-05-31"}, {"e":1511, "c":57188, "f":25942, "d":"2010-06-07"}, {"e":1520, "c":58096, "f":26377, "d":"2010-06-14"}, {"e":1394, "c":58998, "f":26832, "d":"2010-06-21"}, {"e":1067, "c":59679, "f":27091, "d":"2010-06-28"}]

};

function get_top_user(users) {
  var top_user = {e:0};
  for (var userid in users) {
    var edits = users[userid];
    if (edits > top_user.e) {
      top_user = {"e": edits, "id": userid};
    }
  }
  return top_user.e > 0 ? top_user : null;
}

var add_domain_activity = function(domains) {
  var promises = [];
  
  // Get activity for each domain
  domains.forEach(function(domain) {
    promises.push(freebase.get_static("activity", "summary_"+domain.id)
      .then(function(activity) {
        if (!activity) { return null; }
        
        domain.activity = activity;
        
        domain.top_user = get_top_user(activity.users.h);
        if (!domain.top_user) {
          domain.top_user = get_top_user(activity.users.s);
        }
        if (!domain.top_user) {
          domain.top_user = get_top_user(activity.users.b);
        }
        
        return activity;
      }));
  });
  
  return deferred.all(promises).then(function() {return domains;});
};

var process_domains = function(envelope) {
  return envelope.result.map(function(domain) {
    return {
      "id": domain.id,
      "name": domain.name,
      "member_count": domain["/freebase/domain_profile/users"] || 0
    };
  });
};

var domains_for_category = function(category_id) {
  var q_category = acre.require("domain_info").extend(
    {"!/freebase/domain_category/domains.id": category_id}
  );
  
  return freebase.mqlread(q_category.query)
    .then(process_domains)
    .then(add_domain_activity);
};

var domains_for_ids = function(domain_ids) {
  var q_domains = acre.require("domain_info").extend(
    {"id|=": domain_ids}
  );
  
  return freebase.mqlread(q_domains.query)
    .then(process_domains)
    .then(add_domain_activity);
};

///////////////////
// Freebase Blog //
///////////////////
function blog_entries() {
  var maxcount = 2;
  var url     = 'http://blog.freebase.com';
  var rss_url = 'http://feeds.feedburner.com/FreebaseBlog'; // skip blog.freebase.com/feed redirect for speed
  return feeds.get_rss_entries(rss_url,maxcount)
   .then(function(items) {
     return {items:items, url:url, rss_url:rss_url};
    }, function(error) {
    ///XXX: what goes here?
    return null;
  });
}

///////////////////
// Freebase Wiki //
///////////////////
function wiki_entries() {
  var maxcount = 3;
  var url = 'http://wiki.freebase.com';
  var rss_url  = url + '/w/index.php?title=Special:RecentChanges&feed=rss';
  var user_url = url + '/wiki/User';
  return feeds.get_rss_entries(rss_url,maxcount,feeds.filter_wiki_entries)
   .then(function(items) {
     return {items:items, url:url, rss_url:rss_url, user_url:user_url};
    }, function(error) {
    ///XXX: what goes here?
    return null;
  });
}


