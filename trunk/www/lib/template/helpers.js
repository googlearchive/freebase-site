/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function($, fb) {



  var h = fb.h = {

    /**
     * cached way of doing "typeof xxx"
     */
    type: $.type || (function() {
      //
      // from jQuery > 1.4.4
      //
      // [[Class]] -> type pairs
      var class2type = {};
      "Boolean Number String Function Array Date RegExp Object".split(" ").forEach(function(c) {
        class2type["[object " + c + "]"] = c.toLowerCase();
      });
      return function(obj) {
        return obj == null ? String(obj) : class2type[Object.prototype.toString.call(obj)] || "object";
      };
    })(),

   /**
    * params can be an array of tuples
    *
    * @param params:Object,Array - Query string parameters can be
    *                              a dictonary of {name: value, ...} or
    *                              an array of [ [name, value] .., ] tuples.
    */
    parse_params: function(params) {
      if ($.isArray(params)) {
        var dict = {};
        $.each(params, function(i, p) {
          dict[p[0]] = p[1];
        });
        return dict;
      }
      return params;
    },

  /**
   * All url helpers take variable number of arguments (varargs),
   * where you can pass it a list of paths followed by
   * a querystring dicionary or tuple array (@see parse_params).
   *
   * *_url(path1, path2, path3, ..., params) => path1 + path2 + path3 + ? + $.params(params)
   */

   /**
    * build url
    * Use to construct urls to any host
    * (i.e, host/path?params)
    */
    build_url: function(host /**, path1, path2, ..., params **/) {
      if (host && host.indexOf('://') === -1) {
        throw "Host must contain scheme: " + host;
      }

      console.log("build_url host", host);

      var url = (host || "");
      if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments);
        args.shift();
        console.log("build_url args", args);

        var path_params = {path:[], params:null};
        $.each(args, function(i, arg) {
          var t = h.type(arg);
          if (t === "string") {
            path_params.path.push(arg);
          }
          else {
            // last argument is the params dictionary or array
            path_params.params = h.parse_params(arg);
            return false;
          }
        });
        var path = path_params.path.join("");
        if (path && path.indexOf("/") !== 0) {
          throw "Path must begin with a '/': " + path;
        }
        url += path;
        if (!$.isEmptyObject(path_params.params)) {
          url += ("?" + $.param(path_params.params, true));
        }
      }
      return url;
    },

   /**
    * freebase url
    * Use to link to pages on freebase.com
    * (i.e, http://www.freebase.com/path?params)
    *
    * id is optional, and if not included then
    * params takes precidents
    */
    fb_url: function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(null); // host is null to specify relative url
      return h.build_url.apply(null, args);
    },

    /**
     * ajax url
     * Use to call ajax entry points
     */
    ajax_url: function() {
      return h.ajax_app_url.apply(null, arguments);
    },

    /**
     * /ajax/app.www.trunk/...
     */
    ajax_app_url: function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(fb.ajax.app);
      return h.fb_url.apply(null, args);
    },

    /**
     * /ajax/lib.www.trunk/...
     */
    ajax_lib_url: function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(fb.ajax.lib);
      return h.fb_url.apply(null, args);
    },

    /**
     * legacy freebase url
     * Use for pages that haven't been ported to acre yet
     * (i.e, http://www.freebase.com/path?params)
     */
    legacy_fb_url: function() {
      var args = Array.prototype.slice.call(arguments);
      var host = fb.acre.freebase.site_host
        .replace('devel.', 'www.')
        .replace(':' + fb.acre.request.server_port, '');
      args.unshift(host);
      return h.build_url.apply(null, args);
    },

    /**
     * freebase api url
     * Use for links to freebase apis
     * (i.e., http://api.freebase.com/path?params)
     */
    fb_api_url: function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(fb.acre.freebase.service_url);
      return h.build_url.apply(null, args);
    },

    /**
     * freebase wiki url
     * Use for links to the freebase wiki
     */
    wiki_url: function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift("http://wiki.freebase.com", "/wiki");
      return h.build_url.apply(null, args);
    }

  };

})(jQuery, window.freebase);
