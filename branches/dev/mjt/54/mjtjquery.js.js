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
                    console.warn("acre template '" + def + "' does not exist in package '" + pkgid + "'");
                }
            } else {
                console.warn("acre template package '" + pkgid + "' has not been registered");
            }            
        } else {
            var html = mjt.flatten_markup(markup_or_pkgid);
        }
        return this.each(function(){
            this.innerHTML = html;
        });
    };

})(jQuery);
