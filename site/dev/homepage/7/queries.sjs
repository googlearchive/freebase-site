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

var all_domains = function(commons_only) {
  var q_domains = acre.require("domain_info");
  if (commons_only) {
    q_domains = q_domains.extend({"key": {"namespace": "/", "limit": 0}});
  }
  
  return freebase.mqlread(q_domains.query)
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

var alphabetically_grouped_domains = function(commons_only) {
  return all_domains(commons_only)
    .then(function(domains) {
      return groupBy(domains, function(r) {
        return r.name[0].toLowerCase();
      });
    });
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

var domains_for_ids = function(domain_ids) {
  if (!domain_ids || domain_ids.length === 0) {
    return [];
  }
  
  var q_domains = acre.require("domain_info").extend(
    {"id|=": domain_ids}
  );
  
  return freebase.mqlread(q_domains.query)
    .then(process_domains)
    .then(add_domain_activity)
};

var domains_for_category = function(category_id) {
  var q_category = acre.require("domain_info").extend(
    {"!/freebase/domain_category/domains.id": category_id}
  );
  
  return freebase.mqlread(q_category.query)
    .then(process_domains)
    .then(add_domain_activity);
};

var domains_for_user = function(user_id) {
  var q_members = [{
    "id": null,
    "type": "/type/domain",
    "/freebase/domain_profile/users": {"id": user_id},
    "limit": 1000
  }];
  var q_admins = [{
    "id": null,
    "type": "/type/domain",
    "/type/domain/owners": {
      "/type/usergroup/member": {"id": user_id},
      "limit": 0
    },
    "limit": 1000
  }];
  
  return deferred.all([freebase.mqlread(q_members), freebase.mqlread(q_admins)])
    .then(function(envelopes) {
      var ids = [];
      envelopes.forEach(function(envelope) {
        envelope.result.forEach(function(domain) {
          ids.push(domain.id);
        });
      });
      
      return domains_for_ids(ids)
        .then(function(domains) {
          domains.forEach(function(domain) {
            if (domain.id === user_id+"/default_domain") {
              domain.name = domain.name.replace("types", "profile");
            }
          })
          return domains;
        });
    });
};

var messages = function(user_id) {
  var q_messages = mf.require("messages")
    .extend({"post.author.id": user_id})
    .extend({"replies:post.author.id!=": user_id})
    .query;
  
  return freebase.mqlread(q_messages)
    .then(function(envelope) {
      var message_count = 0;
      envelope.result.forEach(function(result) {
        var replies = result['replies:post'];
        var timestamp = result.post.timestamp;
        
        replies.forEach(function(reply) {
          if (reply.timestamp > timestamp) {
            message_count += 1;
          }
        })
      });
      
      return message_count;
    });
};

var user_info = function(user_id) {
  var deferreds = {};
  var q_user = mf.require("user_info").extend({"id": user_id}).query;
  deferreds.user = freebase.mqlread(q_user);
  deferreds.activity = freebase.get_static("activity", user_id);
  deferreds.messages = messages(user_id);
  
  return deferred.all(deferreds)
    .then(function(results) {
      var user = results.user.result;
      var activity = results.activity || {};
      
      return {
        "id": user.id,
        "name": user.name,
        "created": acre.freebase.date_from_iso(user.timestamp),
        "following_count": user['/freebase/user_profile/watched_items'] || 0,
        "followers_count": user['!/freebase/user_profile/watched_items'] || 0,
        "messages_count": results.messages || 0,
        "assertions": activity.total || 0
      };
    });
};

var is_registration_off = function() {
  return freebase.mqlread({
      "id": "/freebase/maintenance",
      "/freebase/maintenance_profile/registration_off": null
    })
    .then(function(envelope) {
      return envelope.result["/freebase/maintenance_profile/registration_off"];
    })
}

///////////////////
// Freebase Blog //
///////////////////
function blog_entries(maxcount) {
  var maxcount = maxcount || 2;
  var url = 'http://blog.freebase.com';
  var rss_url = 'http://feeds.feedburner.com/FreebaseBlog'; // skip blog.freebase.com/feed redirect for speed
  return feeds.get_rss_entries(rss_url, maxcount)
    .then(null, function(error) {return [];})
    .then(function(items) {
      return {items:items, url:url, rss_url:rss_url};
    })
}

///////////////////
// Freebase Wiki //
///////////////////
function wiki_entries(maxcount) {
  var maxcount = maxcount || 2;
  var url = 'http://wiki.freebase.com';
  var rss_url = url + '/w/index.php?title=Special:RecentChanges&feed=rss';
  var user_url = url + '/wiki/User';
  return feeds.get_rss_entries(rss_url, maxcount, feeds.filter_wiki_entries)
    .then(null, function(error) {return [];})
    .then(function(items) {
      return {items:items, url:url, rss_url:rss_url, user_url:user_url};
    });
}


