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
 
var h = acre.require("core/helpers");

var to_process = {
  "src": {
    "img": true,
    "script": true
  },
  "href": {
    "link": true
  }
};

function compile_mjt(source, pkgid) {
  var code = [];
  code.push("(function(acre, h) {\n");
  code.push("if (jQuery) {\n");
  code.push("jQuery(window).trigger('acre.template.register', {pkgid: '" + pkgid + "', source: ");
  code.push(acre.template.string_to_js(source, pkgid));
  code.push("});\n");
  code.push("}\n");
  code.push("})(window.freebase.acre, window.freebase.h);\n\n")
  return code.join("");
};

var handler = function() {
  return {
    'to_js': function(script) {
      
      mjt.TemplateCompiler.prototype.get_attributes = function(n, attrs, mjtattrs) {
        // if the tag was namespaced with the mjt namespace, then treat any attributes
        //  without an explicit namespace as mjt attributes
        var mjttag = this.mjtns_re.exec(n.nodeName);

        var srcattrs = n.attributes;
        for (var ai = 0; ai < srcattrs.length; ai++) {
          var attr = srcattrs[ai];
          if (!attr.specified) continue;

          var aname = attr.nodeName;
          var m = this.mjtns_re.exec(aname);
          if (m) {
            var mname = m[1];
            mjtattrs[mname] = attr.nodeValue;
            continue;
          }

          // if the tag is in the mjt: namespace, treat plain attributes as mjt namespaced
          if (mjttag && aname.indexOf(':') == -1) {
            if (typeof mjtattrs[aname] != 'undefined')
            throw new Error('template compiler: ambiguous template attribute: both '
            + aname + ' and ' + attr.nodeName + ' are specified');
            mjtattrs[aname] = attr.nodeValue;
            continue;            
          }

          var a = {
            name: aname
          };

          if (typeof attr.nodeValue != 'undefined')
          a.value = attr.nodeValue;

          // Here's the monkey-patch...
          if (to_process[a.name] && to_process[a.name][n.nodeName] && /^[^/:$][^:$]*$/.test(a.value)) {
            var full_path = script.scope.acre.resolve(a.value);
            if (full_path) {
              a.value = h.static_url(full_path)           
            }
          }

          attrs.push(a);
        }
      };
        
      var res = script.get_content();
      var pkgid = "//" + script.app.host + "/" + script.name;
      res.body = compile_mjt(res.body, pkgid);
      var str = "var module = ("+ JSON.stringify(res) +");";
      return str;
    },
    'to_module': function(compiled_js, script) {
      return compiled_js.module;
    },
    'to_http_response': function(module, script) {
      module.headers['content-type'] = 'application/x-javascript';
      return module;
    }
  };
};
