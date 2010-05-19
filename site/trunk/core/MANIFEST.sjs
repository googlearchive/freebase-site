

function extend() {
    var a = arguments[0];
    for (var i=1,len=arguments.length; i<len; i++) {
        var b = arguments[i];
        for (var prop in b) {
            a[prop] = b[prop];
        }
    }
    return a;
};

/**
 * All apps' MANIFEST.MF must extend the base_manifest to be able to:
 * - serve (less)css/js as defined in the MANIFEST
 * - serve MANIFEST.MF as json
 *
 * usage:
 *   var MF = {...};
 *   acre.require("/freebase/site/core/MANIFEST").extend_manifest(MF, this);
 */
function extend_manifest(MF, scope) {
    return extend(MF, base_manifest(MF, scope), MF);
};

/**
 * The base MANIFEST core library.
 */
function base_manifest(MF, scope) {
    return {
        link_href: function(key) {
            return MF.static_base_url() + key;
        },

        script_src: function(key) {
            return MF.static_base_url() + key;
        },

        static_base_url: function() {
            return scope.acre.request.base_url + "MANIFEST/static/";
        },

        less: function(data, callback, errback) {
            if (!MF.less.parser) {
                MF.less.parser = new(scope.acre.require("/freebase/site/core/less", MF.version["/freebase/site/core"]).less.Parser)({optimization:3});
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


        "static": function(key) {
            if (/\.js$/.exec(key)) {
                MF.js(key);
            }
            else if (/\.css$/.exec(key)) {
                MF.css(key);
            }
        },


        css: function(key) {
            if (! (MF.stylesheet && (key in MF.stylesheet))) {
                return;
            }
            MF.stylesheet[key]
                .forEach(function(id) {
                             var source = scope.acre.require(id, MF.resource_version(id)).body;
                             if (/\.less$/.exec(id)) {
                                 MF.less(source, scope.acre.write, function(e) {
                                             scope.acre.write(scope.JSON.stringify(e, null, 2));
                                 });
                             }
                             else {
                                 scope.acre.write(source);
                             }
                });
        },

        js: function(key) {
            if (! (MF.javascript && (key in MF.javascript))) {
                return;
            }
            MF.javascript[key]
                .forEach(function(id) {
                             var source = scope.acre.require(id, MF.resource_version(id)).body;
                             scope.acre.write(source);
                         });
        },

        resource_version: function(resource_id) {
            var appid = resource_id.split("/");

            if (appid.length === 1) {
                return null;
            }

            appid.pop();
            appid = appid.join("/");
            if (appid in MF.version) {
                return MF.version[appid];
            }
            throw "A version for " + appid + " must be declared in the MANIFEST.";
        },

        main: function() {
            if (scope.acre.request.path_info && scope.acre.request.path_info.length) {
                var path = scope.acre.request.path_info.substring(1).split("/", 2);

                if (path.length === 2) {
                    if (typeof MF[path[0]] === "function") {
                        return MF[path[0]](path[1]);
                    }
                }
            }

            var service = scope.acre.require("/freebase/libs/service/lib", "release");
            return service.GetService(function() {
                                          return MF;
                                      }, scope);
        }
    };
};

