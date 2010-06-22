
var MF = {
    "version": {
        "/freebase/site/routing": null,
        "/freebase/site/promise": null,
        "/freebase/libs/jquery": "release",
        "/freebase/libs/service": "release"
    },
    "freebase": {
        "resource": {
            "hash" : "dd20b6623a39c3624ab666c6f4e69f80423c7186ab9f8add7c53dd927ad389fa",
            "base_url": "http://res.freebase.com/s/"
        }
    },
    
    "apps" : { 
        "routing" : "//routing.site.freebase.dev",
        "promise" : "//promise.site.freebase.dev",
        "jquery" : "//release.jquery.libs.freebase.dev",
        "service" : "//release.service.libs.freebase.dev"
    }
};
MF.freebase.resource.base_url += MF.freebase.resource.hash;

var h_util = acre.require("helpers_util");
var h_url = acre.require("helpers_url");



function decompose_path(path, kind /* only required if doing a file in the old syntax */) {
  var _DEFAULT_HOST_NS = "/freebase/apps/hosts";
  var acre_host_re = /\.(freebaseapps|sandbox\-freebaseapps|branch\.qa\-freebaseapps|trunk\.qa\-freebaseapps)\.com\.$/;
  var acre_to_freebase_map = {
    "freebaseapps" : "http://www.freebase.com",
    "sandbox-freebaseapps" : "http://www.sandbox-freebase.com",
    "branch.qa-freebaseapps" : "http://branch.qa.metaweb.com",
    "trunk.qa-freebaseapps" : "http://trunk.qa.metaweb.com"
  };
  
  var resource = {
    service_url : acre.freebase.service_url,
    appid       : null,
    fileid      : null,
    filename    : null,
    path_info   : null,
    querystring : null
  };

  var bits = path.split('//');
  
  // old-style graph ID syntax
  if (bits.length != 2) {
    if (kind == "file") {
      var segs = path.split("/");
      resource.filename = segs.pop();
      resource.appid = segs.join("/");
    } else {
      resource.appid = path;
    }
    return resource;
  }
  
  // new require-style styntax
  sid = bits[1];
  var qparts = sid.split("?");
  if (qparts.length > 1) {
    resource.querystring = qparts[1];
    sid = qparts[0];
  }
  
  var parts = sid.split('/');
  var app_ver_id_part = parts.shift();
  
  if (parts.length) {
    resource.filename = parts.pop();
    resource.path_info = "/" + parts.join("/");
  }

  var app_ver_id = '';
  var app_ver_id_parts = app_ver_id_part.split('.');
  
  // check whether it's an acre host
  var app_host = app_ver_id_parts.join(".");
  var match = app_host.match(acre_host_re);
  if(match) {
    app_ver_id_parts = app_host.replace(acre_host_re,"").split(".");
    resource.service_url = acre_to_freebase_map[match[1]];
  }

  if (app_ver_id_parts[app_ver_id_parts.length-1] == 'dev') {
    // ends in '.dev' so it's fully-qualified ID
    app_ver_id = '/' + app_ver_id_parts.slice(0, app_ver_id_parts.length-1).reverse().join('/');
  } else if (app_ver_id_parts[app_ver_id_parts.length-1] == '') {
    // ends in '.' so it's a hostname
    app_ver_id_parts.pop();
    
    app_ver_id_parts.reverse().unshift(_DEFAULT_HOST_NS);
    app_ver_id = app_ver_id_parts.join('/');
  } else {
    app_ver_id_parts = app_ver_id_parts.reverse();

    var host_base_parts = acre.host.name.split('.');
    for (var a in host_base_parts) {
      app_ver_id_parts.unshift(host_base_parts[a]);
    }

    app_ver_id_parts.unshift(_DEFAULT_HOST_NS);
    app_ver_id = app_ver_id_parts.join('/');
  }
  
  resource.appid = app_ver_id;
  
  return resource;
}



/**
 * usage:
 *   var MF = {...};
 *   acre.require("/freebase/site/core/MANIFEST").init(MF, this);
 */
function init(MF, scope, options) {
  extend_manifest(MF, scope, options);
  if (scope.acre.current_script === scope.acre.request.script) {
    MF.main();
  }
  // routes hack to call sjs main()
  scope.main = MF.main;
};

/**
 * All apps' MANIFEST.MF must extend the base_manifest to be able to:
 * - serve (less)css/js as defined in the MANIFEST
 * - serve MANIFEST.MF as json/p
 */
function extend_manifest(MF, scope, options) {
  var orig = h_util.extend({}, MF, options);
  return h_util.extend(MF, base_manifest(MF, scope), orig);
};

/**
 * The base MANIFEST core library.
 */
function base_manifest(MF, scope, undefined) {
  var base = {
    /**
     * MF.version, MF.stylesheet, MF.javascript default to empty dictionary
     */
    version: {},
    stylesheet: {},
    javascript: {},

    /**
     * The base url prefix for retrieving css and js. All apps who extend the base_manifest
     * will have a "/MANIFEST/..." entry-point to serve css and js as specified in their MF.stylesheet
     * and MF.javascript.
     *
     * The idea is that once an app is branched/deployed, this static_base_url will be changed
     * to a permanent static server (i.e., http://freebaselibs.com/statc/freebase_site/foo/[version]/...).
     * But when developing, we want the resources to be served dynamically through "/MANIFEST/...".
     *
     */
    static_base_url: scope.acre.current_script.app.base_url +  "/MANIFEST",

    /**
     * This is like static_base_url but for images (*.png, *.gif, etc.).
     *
     */
    image_base_url: scope.acre.current_script.app.base_url,

    /**
     * Generate the proper url to serve the css resource(s) specified by MF.stylesheet[key].
     * The css resource(s) in MF.stylesheet[key] can be a relative css (local app file)
     * or absolute (external app file). For an external resource,
     * you MUST specify the app id containing the external resource in MF.version.
     *
     * usage:
     *   <link rel="stylesheet" type="text/css" href="${MF.css_src("foo.css")}"/>
     */
    css_src: function(key) {
      return MF.static_base_url + "/" + key;
    },
    /** DEPRECATED: use css_src **/
    link_href: function(key) {
      return MF.css_src(key);
    },

    /**
     * Generate the proper url to serve the js resource(s) specified by MF.javascript[key].
     * The js resource(s) in MF.javascript[key] can be a relative js (local app file)
     * or absolute (external app file). For an external resource,
     * you MUST specify the app id containing the external resource in MF.version.
     *
     * usage:
     *   <script type="text/javascript" src="${MF.script_src("foo.js")}"></script>
     */
    js_src: function(key) {
      return MF.static_base_url + "/" + key;
    },
    /** DEPRECATED: use js_src **/
    script_src: function(key) {
      return MF.js_src(key);
    },


    /**
     * Generate the proper url to serve an image resource specified by the resource_path.
     * The resource_path can be a relative resource (local app file)
     * or absolute (external app file). For an external resource,
     * you MUST specify the app id containing the external resource in MF.version.
     *
     * usage:
     *   <img src="${MF.img_src('local.png')}" /><!-- local image -->
     *   <img src="${MF.img_src('/freebase/site/app/external.png')}" /><!-- external image -->
     */
    img_src: function(resource_path) {
      var resource = MF._resource_info(resource_path);
      if (resource.local) {
        // local image files relative to the current app
        return MF.image_base_url + "/" + resource.name;
      }
      else {
        // get the url through the external app MANIFEST.MF.img_src(resource.name)
        var ext_resource = h_util.extend({}, resource, {id:resource.appid+"/MANIFEST", name:"MANIFEST"});
        try {
          var ext_mf = MF.require(ext_resource).MF;
          return ext_mf.img_src(resource.name);
        }
        catch (ex) {
          console.log("MF.img_src: no MANIFEST in external app", resource.appid, ex);
          return MF.resource_url(resource);
        }
      }
    },

    /**
     * less (css) parser.
     */
    less: function(data /*required*/, callback /*required*/, errback /*optional*/) {
      console.log("less", MF, scope);
      if (!MF.less.parser) {
          MF.less.parser = new(MF.require("core", "less").less.Parser)({optimization:3});
      }
      MF.less.parser.parse(data, function(e, root) {
        if (e) {
          if (errback) {
            errback(e);
          }
        }
        else {
          callback(root.toCSS());
        }
      });
    },

    /**
     * Serve (acre.write) all css declared in MF.stylesheet[key].
     * Run the less css parser on all of the css afterwards
     */
    css: function(key, scope, buffer) {
      if (!MF.stylesheet[key]) {
        return MF.not_found();
      }
      scope.acre.response.set_header("content-type", "text/css");

      var buf = [];
      var re =  /^(\/.*\/MANIFEST)\/([^\/]+\.css)$/;
      MF.stylesheet[key].forEach(function(id) {
        var m = re.exec(id);
        if (m) {
          buf = buf.concat(MF.require(m[1]).MF.css(m[2], scope, true));
        }
        else {
          try {
            // css preprocessor to replace url(resource_path) declarations
            buf.push(MF.css_preprocessor(MF.require(id).body));
          }
          catch (ex) {
            console.error(ex);
            scope.acre.write("\n/** " + ex.toString() + " **/\n");
            acre.exit();
          }
        }
      });

      if (buffer) {
        return buf;
      }

      // run less on concatenated css/less
      MF.less(buf.join(""),
              scope.acre.write,
              function(e) {
                scope.acre.write(scope.JSON.stringify(e, null, 2));
              });
    },

    css_preprocessor: function(str) {
      var fburl = MF.require("/freebase/site/core/helpers_url2").freebase_static_resource_url;
      var buf = [];
      var m, regex = /url\s*\(\s*([^\)]+)\s*\)/gi;
      str.split(/[\n\r\f]/).forEach(function(l) {
        buf.push(l.replace(regex, function(m, group) {
          var url = group.replace(/^\s+|\s+$/g, "");
          if (url.indexOf("http://") == 0 || url.indexOf("https://") === 0) {
            return m;
          }
          else if (url.indexOf("static://") === 0) {
            return "url(" + fburl(url.substring(9)) + ")";
          }
          else {
            return "url(" + MF.resource_url(url) + ")";
          }
        }));
      });
      return buf.join("\n");
    },

    /**
     * Serve (acre.write) all js declared in MF.javascript[key].
     */
    js: function(key, scope) {
      if (!MF.javascript[key]) {
        return MF.not_found();
      }
      scope.acre.response.set_header("content-type", "text/javascript");
      var re =  /^(\/.*\/MANIFEST)\/([^\/]+\.js)$/;
      MF.javascript[key].forEach(function(id) {
        var m = re.exec(id);
        if (m) {
          MF.require(m[1]).MF.js(m[2], scope);
          return;
        }
        try {
          scope.acre.write(MF.require(id).body);
        }
        catch (ex) {
          scope.acre.write("\n/** " + ex.toString() + " **/\n");
          return;
        }
      });
    },

    /**
     * Match resource_path to an app version declared in MF.version
     * If resource_path is unrecognized (i.e., app_id not declared in MF.version),
     * throws error.
     */
    _resource_info: function(resource_path) {
      if (resource_path[0] !== "/") {
        return {
          id: scope.acre.current_script.app.id + "/" + resource_path,
          version: null,
          appid: scope.acre.current_script.app.id,
          name: resource_path,
          local: true
        };
      }
      var appid = resource_path.split("/");
      var name = appid.pop();
      appid = appid.join("/");
      if (appid in MF.version) {
        return {
          id: resource_path,
          version: MF.version[appid],
          appid: appid,
          name: name,
          local: false
        };
      }
      throw "A version for " + appid + " must be declared in the MANIFEST.";
    },

      _resource_info2: function(id, file) { 
          console.log('IN: ' + id + ' ' + file);

          var res = { 
              //full graph id of the resource - includes files, excludes version
              //you can pass this to acre.require()
              //e.g. /freebase/site/core/MANIFEST
              'id' : null,
              //version of app
              //you can pass this to acre.require()
              //e.g. 5
              'version' : null,
              //if the id was a label in MF.apps, this will be the label value
              //e.g. //release.core.site.freebase.dev
              'label' : null,
              //graph id of the app, without version or file
              //e.g. /freebase/site/core
              'appid' : null,
              //name of the resource (file)
              //e.g. MANIFEST
              'name' : null,
              //if this is a relative file to the current app, local is true
              'local' : false
          };

          if (!id) { 
              return res;
          }

          //label or file
          if (id[0] != '/') { 

              //if there is no second argument, it's a relative file require
              if (!file) { 
                  res.id = scope.acre.current_script.app.id + "/" + id;
                  res.appid = scope.acre.current_script.app.id;
                  res.version = null;
                  res.local = true;
                  res.name = id;

                  return res;
              }
          
              //both label and file
              if (! (MF.apps && MF.apps[id]) ) {
                  console.log('resource resolution error: no label ' + id + ' in manifest.apps');
                  return null;
              }

              res.label = true;
          }    
  
          //console.log(id);
          // graph id: /freebase/site/core/helpers
          if (id[0] == '/' && id.length > 1 && id[1] != '/') { 
            var appid = id.split("/");
            res.name = appid.pop();
            res.appid = appid.join("/");
            res.version = null; //tough luck - old style ids
            res.id = id;

            return res;
          }

          resource = MF.apps[id]; 
          //console.log(resource);

          // new style id: //<something>
          if (resource.indexOf('//') == 0) { 

            //find out if there is a file, and only use the first part
            var bits = resource.slice(2).split('/');

            //5-long paths begin with versions
            //e.g. bits[0] would be 4.core.site.freebase.dev
            var parts = bits[0].split('.');
            if (parts[parts.length-1] == 'dev' && parts.length == 5) { 
              res.version = parts[0];
              parts.shift();      
            }

            var new_resource = '//' + parts.join('.') + (bits[1] ? '/' + bits[1] : '');

            //resolve the id
            var context = decompose_path(new_resource);
            //finally, if we have a resulting appid, require it  
            if (context.appid) { 
              res.appid = context.appid;
              //if this was a pre-baked new id, use the filename from the id
              //e.g. //services/lib (lib is the file)
              if (context.filename) { 
                res.name = context.filename;
                res.id = res.appid + '/' + res.name;

                //if this was a label that resolved into a new id 
                //and there is a file argument, use the file argument
                //e.g. mf.require('services', 'lib');
              } else if (res.label && file) { 
                res.id = res.appid + '/' + file;
              } 

              return res;
            //couldnt resolve
            } else {
                console.log('mf.require error: cannot resolve id: ' + new_resource);
                return null;
            }
            

          }
      
        //this is the case of mf.require('/') and any other stranglers
        console.log('mf.require error: unable to figure out what to do with resource ' + resource);
        return null;



      },

    /**
     * resource can be a string (resource_path) or
     * an object (returned by MF._resource_info)
     *
     * You can pass an object returned by MF._resource_info
     * to avoid another MF._resource_info lookup.
     * @see MF.img_src
     */
    require_DEPRECATED: function(resource /** string or object **/) {

      if (typeof resource === "string") {
        resource = MF._resource_info(resource);
      }
      return scope.acre.require(resource.id, resource.version);
    },

      require: function(resource /**string or object**/, file /**string**/) { 
          
          if (!resource) { 
              return null;
          }
          var res = resource;

          //resource not a string - just pass to acre.require  
          if (typeof resource === "string")  {
              res = MF._resource_info2(resource, file);
          }  

          console.log('require FROM: ' + resource + ' ' + file + '  TO: ' + res.id + ' ' + res.version);
          return scope.acre.require(res.id, res.version);

      },

    resource_url: function(resource /** string or object **/) {
      if (typeof resource === "string") {
        resource = MF._resource_info(resource);
      }
      return h_url.resource_url(resource.id, resource.version);
    },

    not_found: function() {
      scope.acre.response.status = 404;
      scope.acre.exit();
    },

    /**
     * Main block. DO NOT MODIFY!
     *
     * Responsible for routing request to "/MANIFEST/..." or serve MF (json/p).
     *
     * usage:
     *   var MF = {...};
     *   acre.require("/freebase/site/core/MANIFEST").extend_manifest(MF, this);
     *   if (acre.current_script == acre.request.script) {
     *     MF.main();
     *   };
     */
    main: function() {
      if (scope.acre.request.path_info && scope.acre.request.path_info.length) {
        var path = scope.acre.request.path_info.substring(1);
        if (/\.js$/.exec(path)) {
          return MF.js(path, scope);
        }
        else if (/\.css$/.exec(path)) {
          return MF.css(path, scope);
        }
        else if (scope.acre.request.path_info !== "/") {
          return MF.not_found();
        }
      }
      var service = scope.acre.require("/freebase/libs/service/lib", "release");
      return service.GetService(function() {
        return MF;
      }, scope);
    }
  };

  return base;
};

this.init(MF, this);
