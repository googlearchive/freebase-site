
/**
 *   most of this should become "package.js" since is
 *   the TemplatePackage implementation.
 * 
 */

(function(mjt){

/**
 *
 * @constructor
 * @class a TemplatePackage is a namespace of template functions,
 * usually loaded from a single html document.
 * 
 * there are several ways to get Template
 * 
 * it is common to refer to a loaded TemplatePackage through the
 * namespace it defines.  this is a js object whose properties
 * contain the top-level defs from a template file.  it is accessible
 * inside a template file under the name "exports".
 * 
 * to find the TemplatePackage associated with a compiled namespace
 * "exports", use "exports._main.prototype.tpackage".
 *
 * @param name  is used for debugging only right now
 * @param stringtable  is the array of literal strings used by the template
 * @param code  contains the code to build the template, as a string or as a function.
 */
mjt.TemplatePackage = function () {
    // source url or other string for debug logging
    // put in a mjt.Resource?
    this.source = null;

    // list of strings used by the generated template code.
    // this is used to generate source code - for runtime speed
    // all the entries here are pre-wrapped as markup and cached
    // in this._template_fragments.
    this._template_strings = null;

    // compiled and evaluated js template functions
    this._compiled = null;

    // source code for the template, if it was provided as a string.
    // otherwise null if the template was loaded from a js file rather
    // than built from source or loaded from a string.
    this._codeblock = null;

    // optional debug info mapping js line number to template source location
    this.debug_locs = null;

    // output mode specified in the template, may be 'text' 'html' 'xml'
    this.output_mode = null;

    // runtime data

    // markup for template fragments
    this._template_fragments = null;

    // namespace will contain at least '_main'
    //  and possibly other toplevel mjt.defs.
    // it is populated by evaluating _codeblock to build
    //  a function and evaluating that function to build
    //  the package's toplevel namespace.
    this.namespace = null;
};

// functions exported to template code
mjt.TemplatePackage.prototype.runtime = {
    _break_token: mjt._break_token,
    _continue_token: mjt._continue_token,
    bless: mjt.bless,
    cleanup_noquote: mjt.cleanup_noquote,
    foreach: mjt.foreach,
    htmlencode: mjt.htmlencode,
    make_attr_safe: mjt.make_attr_safe,
    new_markuplist: function () { return new mjt.MarkupList() },
    ondomready: mjt.ondomready,
    ref: mjt.ref,
    tfunc_factory: mjt.tfunc_factory,
    uniqueid: mjt.uniqueid
};



// called internally to do the initialization once more template info is available
mjt.TemplatePackage.prototype.init_from_json = function (info) {
    if (typeof info.file != 'undefined')
        this.source = info.file;

    if (typeof info.stringtable != 'undefined')
        this._template_strings = info.stringtable;

    // source code for the template, if it was provided as a string.
    // otherwise null if the template was loaded from a js file rather
    // than built from source or loaded from a string.
    this._codeblock = null;

    if (typeof info.code == 'string') {
        this._codeblock = new mjt.Codeblock(this.source, info.code);
    } else if (typeof info.code == 'function') {
        // if the template was precompiled, we have a closure that
        // renders the main template.
        this._compiled = info.code;
    }

    if (typeof info.debug_locs != 'undefined')
        this.debug_locs = info.debug_locs;

    if (typeof info.output_mode != 'undefined')
        this.output_mode = info.output_mode;

    return this;
};

// code comes before metadata to avoid disturbing line numbers when using
// this method as a prefix
mjt.TemplatePackage.prototype.init_from_js = function (obj) {
    var code = obj.def;
    var info = obj.info;
    this.init_from_json(info);
    this._compiled = code;
    return this;
};

mjt.TemplatePackage.prototype.get_metadata = function () {
    var pkgjson = {
        file: this.source,
        stringtable: this._template_strings,
        debug_locs: this.debug_locs,
        output_mode: this.output_mode
    };
    return pkgjson;
};

mjt.TemplatePackage.prototype.toJSON = function () {
    var pkgjson = this.get_metadata();
    if (this._codeblock === null) {
        mjt.warn('TemplatePackage.toJSON: complete source code unavailable', this.source);
        pkgjson.code = this._compiled;
    } else {
        pkgjson.code = this._codeblock.codestr;
    }

    return JSON.stringify(pkgjson);
};

/**
 * output the template package in a format that can be
 * evaluated as javascript to return a new TemplatePackage.
 * the difference between this and toJSON() is that the
 * compiled template code is serialized as a javascript function
 * declaration rather than as a string.
 *
 * a new template package can be created from this js using:
 *  var pkg = (new mjt.TemplatePackage()).init_from_js(jsobj);
 * 
 */
mjt.TemplatePackage.prototype.toJS = function (strip) {
    var codestr = null;
    if (this._codeblock === null) {
        mjt.warn('TemplatePackage.toJS: complete source code unavailable', this.source);
        codestr = this._compiled;
    } else {
        codestr = '(function () {' + this._codeblock.codestr + '})()';
    }

    // note prefix does not include newlines so line numbers are undisturbed
    // this object can be turned into a package using TemplatePackage.init_from_js()
    var strs = ['{def: ', codestr,
                ',\ninfo:', JSON.stringify(this.get_metadata()),
                '}\n'
               ];
    return strs.join('');
};

/**
 * look up the template source line number from the generated
 * js line number, if we have debug_locs
 * 
 */
mjt.TemplatePackage.prototype.lookup_line = function (js_lineno) {
    if (!(debug_locs instanceof Array) || js_lineno >= this.debug_locs.length)
        return null;
    return this.debug_locs[js_lineno-1];
};


/**
 * compiles the package to a js codeblock.
 *   the codeblock defines one function "rawmain" which runs the toplevel template
 *   and defines any internal mjt.defs.
 * all prereqs must already be present.
 * top is a DOM node.
 */
mjt.TemplatePackage.prototype.compile_document = function (top, compiler) {

    var t0 = (new Date()).getTime();

    if (typeof compiler == 'undefined')
        compiler = new mjt.TemplateCompiler();

    // set additional options here...

    compiler.compile_top(top, 'rawmain()');
    var dt = (new Date()).getTime() - t0;
    // restore this as a debug message at some point
    //mjt.note('template compiled in ', dt, 'msec from ', this.source);

    var info = { source: this.source,
                 stringtable: compiler.strings,
                 code: (compiler.codestr + '; return rawmain;'),
                 debug_locs: compiler.debug_locs,
                 output_mode: compiler.output_mode
               };
    return this.init_from_json(info);
}


/**
 * compiles and evaluates the package.
 * all prereqs must already be present.
 *
 * returns the evaluated toplevel.
 */
mjt.TemplatePackage.prototype.load_document = function (top, targs) {
    this.source += '#' + top.id,
    this.compile_document(top);
    return this.load(targs);
};

/**
 *  get the template namespace for a TemplatePackage
 * 
 *  the namespace is built if the template is not fully loaded yet.
 * 
 *  user code should probably use this instead of TemplatePackage.load()
 *
 */
mjt.TemplatePackage.prototype.toplevel = function (targs) {
    if (this.namespace === null)
        this.load(targs);
    return this.namespace;
};

/**
 *  return the generated markup string from a template package.
 */
mjt.TemplatePackage.prototype.toString = function () {
    if (this.namespace === null)
        this.load(targs);

    return mjt.flatten_markup(this.namespace._main.prototype.tpackage.tcall);
};

/**
 *  finish loading a TemplatePackage, so it is ready for use.
 *
 *  the package should already be compiled.
 *  evaluate the javascript source code for the template package if needed.
 *  run the template code to generate the toplevel TemplateCall.
 *  pull out the toplevel namespace from the TemplateCall.
 *
 *  XXX rename this
 */
mjt.TemplatePackage.prototype.load = function (targs) {
    // pre-bless everything in the string table
    this._template_fragments = [];
    for (var tsi = 0; tsi < this._template_strings.length; tsi++)
        this._template_fragments[tsi] = mjt.bless(this._template_strings[tsi]);

    // evaluate the code string if needed
    if (this._compiled === null) {
        if (this._codeblock === null) {
            mjt.error('TemplatePackage has no code', this.source);
        } else {
            // evaluate the code string, generating a raw function for
            // the toplevel template.
            this._compiled = this._codeblock.evaluate();
        }
    }

    if (typeof targs == 'undefined')
        targs = [];
    this._args = targs;

    // build a template function object around the raw code
    var mainfunc = mjt.tfunc_factory("_main()", this._compiled,
                                     this, false, true);

    // create the top-level TemplateCall for main(), and render 
    // it to create the toplevel mjt.def= definitions and 
    // any toplevel markup.
    var tcall = new mainfunc();
    tcall.render(this._args);

    this.tcall = tcall;
    tcall.pkg = this;
    if (typeof this._compiled.doc_content_type != 'undefined')
        tcall.doc_content_type = this._compiled.doc_content_type;

    if (typeof tcall.exports._main != 'undefined') {
        throw new Error("_main() is illegal as a template function name");
    }

    this.namespace = tcall.exports;
    this.namespace._main = mainfunc;

    // TODO remove this once all references to main are removed
    // from user templates
    if (typeof tcall.exports.main != 'undefined') {
        throw new Error("main() is illegal as a template function name");
    }
    this.namespace.main = mainfunc;
    if (typeof mjt.deprecate == 'function')
         mjt.deprecate(this.namespace, 'main', '._main');

    // end TODO

    return this;
};
})(mjt);
