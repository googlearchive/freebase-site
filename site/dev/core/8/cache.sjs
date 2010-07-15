var extend = acre.require("helpers_util").extend;

var CACHE_POLICIES = {
  "nocache": {
    "private": true,
    "no-cache": true,
    "max-age": 0,
    "s-maxage": 0
  },
  "private": {
    "private": true,
    "no-cache": "Set-Cookie",
    "max-age": 0,
    "s-maxage": 3600
  },
  "public-short": {
    "public": true,
    "no-cache": "Set-Cookie",
    "max-age": 3600,
    "s-maxage": 3600
  },
  "public-long": {
    "public": true,
    "no-cache": "Set-Cookie",
    "max-age": 28800,
    "s-maxage": 28800
  }
};

function cache_control(policy, options) {
  var options = options || {};
  var cache_options = {};
  
  if (typeof policy === "string") {
    if (!CACHE_POLICIES[policy]) {
      throw new Error("No cache policy called '"+policy+"'");
    };
    cache_options = extend(cache_options, CACHE_POLICIES[policy], options);
  } else if (typeof policy === "object") {
    cache_options = extend(cache_options, policy);
  }
  
  if (cache_options['max-age'] && cache_options['max-age'] > 0) {
    cache_options["stale-while-revalidate"] = cache_options['max-age'];
    
    if (cache_options['pubic']) {
      cache_options["stale-if-error"] = cache_options['max-age'];
    }
    
    if (cache_options['max-age'] > (cache_options['s-maxage'] || 0)) {
      cache_options["maxage-vary-cookie"] = cache_options['max-age']+"|mwLastWriteTime";
    }
  }
  
  var cache_options_list = [];
  for (var key in cache_options) {
    var value = cache_options[key];
    if (typeof value === "string") {
      value = key+'="'+value+'"';
    } else if (typeof value === "number") {
      value = key+'='+value;
    } else {
      value = key;
    }
    cache_options_list.push(value);
  }
  
  return [cache_options_list.join(", "), cache_options];
}

function set_cache_policy(policy, options) {
  var [cache_control_value, cache_options] = cache_control(policy, options);
  acre.response.headers["cache-control"] = cache_control_value;
  
  if (typeof cache_options["max-age"] === "number") {
    var expires = new Date(acre.request.start_time.getTime() + cache_options["max-age"] * 1000);
    acre.response.headers["expires"] = expires.toUTCString();
  }
}