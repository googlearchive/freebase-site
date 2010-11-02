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

/*
* jQuery mjt glue
*
*  example usage: $('#some_id').mjt(my_mjt_lib.my_template(template_args));
* 
*  example usage: $('#some_id').acre(my_mjt_lib.my_template(template_args));
*
*  example usage: $(window).trigger("acre.template.register", { pkgid: "my_mjt_lib", source: my_mjt_js_source });
*  example usage: $('#some_id').acre("my_mjt_lib", "my_template", template_args_array);
*/
;if (typeof jQuery != 'undefined') (function($) {

    if (typeof $ == 'undefined') return;

    var templates = {};

    function register_template_package(pkgid, pkg) {
        if (typeof pkgid === 'string' && typeof pkg === 'object') {
            // if it's a raw JS package sent from the server, instantiate it as a template package
            if (pkg.def) {
                pkg = (new mjt.TemplatePackage()).init_from_js(pkg).toplevel();
            }
            templates[pkgid] = pkg;
        }
    }

    // Handle compiled template package source sent from the server
    $(window).bind('acre.template.register', function(e, data){
        register_template_package(data.pkgid, data.source);
    });

    // set the innerHTML for each selected node to a mjt template result
    $.fn.mjt = function(markup) {
        var html = mjt.flatten_markup(markup);
        return this.each(function(){
            this.innerHTML = html;
        });
    };

    $.fn.acre = function(markup_or_pkgid, def, args) {
        var html = "";
        if (typeof def !== 'undefined') {
            var pkg = templates[markup_or_pkgid];
            if (typeof pkg === 'object') {
                var template = pkg[def];
                if (typeof template === 'function') {
                    var html = mjt.flatten_markup(template.apply(this, args));
                } else {
                    console.warn("acre template '" + def + "' does not exist in package '" + markup_or_pkgid + "'");
                }
            } else {
                console.warn("acre template package '" + markup_or_pkgid + "' has not been registered");
            }            
        } else {
            var html = mjt.flatten_markup(markup_or_pkgid);
        }
        return this.each(function(){
            this.innerHTML = html;
        });
    };

})(jQuery);
