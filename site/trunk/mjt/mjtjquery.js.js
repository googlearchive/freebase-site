/*
* jQuery mjt glue
*
*  example usage: $('#some_id').mjt(my_mjt_lib.my_template(template_args));
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

    $.fn.acre = function(pkgid, def, args) {
        var pkg = templates[pkgid];
        if (typeof pkg === 'object') {
            var template = pkg[def];
            if (typeof template === 'function') {
                var html = mjt.flatten_markup(template.apply(this, args));
                return this.each(function(){
                    this.innerHTML = html;
                });
            } else {
                console.warn("acre template '" + def + "' does not exist in package '" + pkgid + "'");
            }
        } else {
            console.warn("acre template package '" + pkgid + "' has not been registered");
        }
        return this;
    };

})(jQuery);
