var mf = acre.require("MANIFEST").mf;
var queries = mf.require("queries");
 
var CATEGORIES = {
  released  : {
    title        : "Recently Released Apps",
    apps_func    : queries.released_apps
  },
  featured  : {
    title        : "Featured Apps",
    apps_func    : queries.list_apps
  },
  games  : {
    title        : "Data Games",
    apps_func    : queries.list_apps
  },
  recent   : {
    title        : "Recently Updated Apps",
    apps_func    : queries.recent_apps
  },
  user      : {
    title        : "Apps by ",
    apps_func    : queries.user_apps
  },
  search    : {
    title        : "Search Results for ",
    apps_func    : queries.search_apps
  }
};

function do_route(path) {
  var segs = path.split("/");
  segs.shift();
  var file = segs.shift() || "";
  var path = "/" + segs.join("/");
  
  // Pass image requests through;
  if ( /\.(png|gif|jpg)$/.test(file)) {
    acre.route(file);
  }
  
  switch (file) {
    
    // special-case MANIFEST files
    case "MANIFEST" :
      acre.route("MANIFEST" + path);
      break;
      
    // app lists
    case "" :
    case "index" :
    case "released" :
      do_explore("released");
      break;
    case "featured" :
      do_explore("featured", null, {list:"featured"});
      break;
    case "recent" :
      do_explore("recent");
      break;
    case "games" :
      do_explore("games", null, {list:"games"});
      break;
    case "user" :
      if (segs.length > 1) {
        path = "/" + file + path;
        do_app("view", path, {article:true});
      } else if (segs.length === 1) {
        do_explore("user", segs[0], acre.request.params);
      } else {
        do_explore("user");
      }
      break;
    case "search" : 
      do_explore("search", acre.request.params.q, acre.request.params);
      break;
      
    // app list feeds
    case "feed":
      do_feed(segs.shift(), segs.shift());
      break;
    
    // app pages
    case "create" :
      do_app("create");
      break;
    case "admin" :
    case "edit" : 
    case "api_keys" :
      do_app("admin", path,  {article: true, api_keys:true});
      break;
      
    // ajax entrypoints for editing
    case "get" :
    case "post" :
    case "form" :
      do_ajax(file, segs.shift(), segs.shift());
      break;
    
    // these are for backwards-compatibility
    case "updated" :
      do_redirect( acre.request.url.replace("/updated","/recent"));
      break;
    case "directory" : 
      do_redirect(acre.request.url.replace("/directory",""));
      break;
    case "app" :
      do_redirect(acre.request.url.replace(/\/app\//,"/"));
      break;

    // if there is a path, but no match, assume path is an appid
    default :
      path = "/" + file + path;
      do_app("view", path, {article:true});
      break;
  }
}


function do_redirect(url) {
  acre.response.status = 301;
  acre.response.set_header("location", url);
  acre.exit();
}


function do_explore(category, query, opts) {
  // Reset the base_path
  acre.request.base_path = acre.request.base_path.replace(new RegExp("\/" + category + "(/.*)?$"), "")
  
  var cat = CATEGORIES[category || "released"];
  var data = {
    category : category,
    query : query,
    title : cat.title,
    apps  : cat.apps_func.apply(this, [query, opts])
  };

  mf.require("template", "renderer").render_page(
    data,
    mf.require("explore")
  );
}


function do_feed(category, query) {
  var cat = CATEGORIES[category || "released"];
  
  var data = {
    category : category,
    query : query,
    title : cat.title,
    apps  : cat.apps_func.apply(this, cat.apps_args)
  };

  mf.require("template", "renderer").render_def(
    data,
    mf.require("feed"),
    "feed"
  );
}


function do_app(page, appid, opts) {
  // Reset the base_path
  acre.request.base_path = acre.request.base_path.replace(new RegExp("(\/" + page + ")?" + (appid||"") + "\/?$"), "");
  
  if (typeof appid === 'string') {
    // if it's a host-style ID use acre to resolve it, otherwise assume it's a graph ID
    var segs = appid.split("/");
    appid = (segs.length === 2) ? acre.get_metadata("//" + segs[1]).app_id : segs.join("/");    
  }
  
  var data = {
    user : queries.freebase.get_user_info(),
    app : queries.app(appid, opts)
  };
    
  mf.require("template", "renderer").render_page(
    data,
    mf.require(page)
  );
}


function do_ajax(method, file, funcname) {
  var service = mf.require("service", "lib");

  var f = function() {
    if (method !== "get") {
      service.check_user();      
    }
    var lib = mf.require(file);
    var args = service.parse_request_args();
    return lib[funcname].apply(this, [args]);
  };
  
  var svc_method = method.substr(0,1).toUpperCase() + method.substr(1) + "Service";
  service[svc_method](f, this);
}


if (acre.current_script === acre.request.script) {
  
  // HACK - kill trailing slash in case it's there
  var path = acre.request.path_info.replace(/\/$/,"");
  
  do_route(path);
}
