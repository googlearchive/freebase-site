
/**
 *  compile.js - compile a mjt.TemplatePackage from a DOM representation.
 * 
 * The TemplateCompiler object keeps the state of the translation.
 * You can get the code out of it afterwards from the "codestr" property.
 * The generated code looks roughly like this:
 * 
 *     var rawmain = function(){
 *         ...
 *     };
 * 
 * the rawmain function can be used to construct a mjt.TemplatePackage object.
 * 
 * this is a pretty simple single-pass compiler.
 * it is mostly standalone - it requires the following from the mjt
 * runtime though some of these will become parameters.
 *   mjt.debug
 *   mjt.warn() mjt.log() mjt.error()
 * 
 * the compiler keeps a stack of Scope objects, one for each enclosing
 * mjt.def= declaration.  the top-level Scope is annotated with the
 * name of the toplevel generated function ("rawmain()").  the toplevel
 * namespace is handled differently so that toplevel mjt.def= declarations
 * can be exported nicely.
 *
 * there are two output streams, one for markup and one for code.
 * the markup stream is temporary and so that sequential markup writes
 * can be collapsed to a single line of code.
 *
 * the generated code only makes use of the TemplatePackage.runtime
 * entry points, so it does not depend on the "mjt" toplevel symbol.
 *
 * the exception is _mjt.eventcb which is only used browser-side.
 * this is referenced within event handlers so the __pkg.runtime
 * interface is not available.
 */

(function(mjt){

/**
 *
 *  @constructor
 *  @class mjt.Scope holds a stack of mjt.def= definitions.
 *
 */
mjt.Scope = function(template, parent, decl) {
    this.template = template;
    if (!parent) parent = null;
    this.parent = parent;

    if (!decl) decl = '[unnamed]';
    this.decl = decl;

    this.tasks = {};

    this.toplevel = false;

    // possibly this should be on Compiler instead of Scope?

    // a stack of open microdata items
    this.microdata = {
        items: {},       // all items indexed by id= attribute
        item: null,      // the currently open item
        stack: [],       // containing items
        lastvalue: null  // the value - used to store last subvalue when building
    };

    // there is only one items dictionary per compiler.
    if (parent !== null)
        this.microdata.items = parent.microdata.items;
};

/**
 *
 *  @constructor
 *  @class holds the state of a Template compiler, which compiles a DOM to Javascript.
 *
 * @param top  DomElement  the parsed markup element
 *
 * most of this class will break out into TemplateCompiler.
 * the remainder moves to TemplatePackage.
 */

mjt.TemplateCompiler = function () {

    // template fragment strings.
    // these get copied into TemplatePackage._tstrings
    this.strings = [];

    // codestr gets copied into TemplatePackage._codestr
    this.codestr = null;

    // maps js line numbers to template source code locations
    this.debug_locs = [];

    // this is the compiler state
    this.source_loc = null;
    this.compiler_dt = null;
    this._markup = [];
    this._code = [];

    this.next_unique_id = {};

    this.debug = mjt.debug;

    // this distinguishes browser-side from server-side mjt
    this.browser_dom = (typeof navigator != 'undefined');

    // later this will choose between compiling to run in a browser
    // vs. compiling to run on the server.
    this.browser_target = true;

    // this holds the <?xml?> processing instruction if desired
    this.output_prefix = null;

    // this may be overridden by a template
    this.document_content_type = null;

    // set the output mode to html by default
    this.set_output_mode('html');

    // look for both mjt. tags
    // and mjt: tags
    // should really be more xml namespace aware though -
    //  this counts on people bringing in the namespaces with xmlns:mjt
    this.mjtns_re = /^(?:mjt\.|mjt:|acre:)(.+)$/;

    // capability check
    this._ie_attribute_bs = this.browser_dom && /MSIE/.test(navigator.userAgent);
};

/**
 * set the output mode for the compiled template.
 * choices are 'html' and 'xml'
 */
mjt.TemplateCompiler.prototype.set_output_mode = function(mode) {
    this.output_mode = mode;

    this.empty_tags = {};
    this.boolean_attrs = {};
    this.preserve_space_tags = {};
    this.noescape_tags = {};

    switch (mode) {
      case 'text':
        break;

      case 'xml':
        // no special tag handling for xml
        break;

      case 'html':
        // self-closing tags
        this.empty_tags = { area:1, base:1, basefont:1, br:1, col:1, frame:1,
                            hr:1, img:1, input:1, isindex:1, link:1, meta:1, param:1
        };
        // attributes that should not have  ="..."
        this.boolean_attrs = {
            selected:1, checked:1, compact:1, declare:1,
            defer:1, disabled:1, ismap:1, multiple:1,
            nohref:1, noresize:1, noshade:1, nowrap:1
        };

        // whitespace-sensitive contents
        this.preserve_space_tags = {
            pre:1, textarea:1
        };

        // don't html-encode contents
        this.noescape_tags = {
            script:1,
            style:1
        };
        break;

      default:
        throw new Error('set_output_mode: unknown mode "' + mode + '"');
        break;
    }
};

/**
 *
 * compile the template
 *
 */
mjt.TemplateCompiler.prototype.compile_top = function(top, toplevel_def) {
    // set up the toplevel scope
    this.scope = new mjt.Scope(this, null, '[toplevel]');
    this.scope.toplevel = true;
    this.scope.toplevel_def = toplevel_def;

    this.compile_node(top);
    
    this.codestr = this._code.join('');
    this._code = null;   // for gc
    this._markup = null;   // for gc

    if (this.codestr == '') {
        // this isn't necessarily an error, but usually indicates
        // a problem in the compiler.
        throw new Error('template compiled with no output');
    }
};


/**
 *  
 */
mjt.TemplateCompiler.prototype.uniqueid = function (prefix) {
    var id = this.next_unique_id[prefix];
    if (typeof id !== 'number')
        id = 1;
    this.next_unique_id[prefix] = id + 1;
    return prefix + '_' + id;
};

mjt.TemplateCompiler.prototype._ampRE = /\&/g;
mjt.TemplateCompiler.prototype._ltRE = /\</g;
mjt.TemplateCompiler.prototype._gtRE = /\>/g;

/**
 *
 * escape <>& characters with html entities.
 *
 */
mjt.TemplateCompiler.prototype.htmlencode = function (s) {
    return s.replace(this._ampRE,'&amp;').replace(this._ltRE,'&lt;').replace(this._gtRE,'&gt;');
};

/**
 *  encode a string for inclusion into javascript code.
 *  e.g.   jsencode("\n")  -->   "\"\\n\""
 */
mjt.TemplateCompiler.prototype.jsencode = function (s) {
    // strictly speaking you can't JSON encode a string, only an object or array.
    // in order to re-use the existing JSON encoder, this code wraps the string
    // in an array and then remove the brackets from the resulting JSON string.
    // this is a hack - the alternative would be to copy the quote()
    // function from json2.js instead of using whatever version of JSON.stringify()
    // is provided.
    return JSON.stringify([s]).replace(/^[^"]*/, '').replace(/[^"]*$/, ''); 
};

/**
 *
 *
 */
mjt.TemplateCompiler.prototype.flush_markup = function(no_output) {
    if (this._markup.length == 0)
        return -1;

    var s = this._markup.join('');
    this._markup = [];

    var texti = this.strings.length;
    this.strings[texti] = s;

    if (this.debug) {
        // generate comments with the text in them

        var indent = '                                                  ';
        var commentstart = '// ';
        var x = s.replace(/\r?\n/gm, '\n' + indent + commentstart);

        var c = '__m[__n++]=__ts[' + texti + '];';
        if (c.length < indent.length)
            c += indent.substr(c.length);
        this.emit(c, commentstart, x, '\n');

    } else if (! no_output) {
        this.emit('__m[__n++]=__ts[', texti, '];\n');
    }

    return texti;
};

/**
 * emit code
 * args are converted to strings and appended to the generated code.
 * the template string buffer is flushed first if needed.
 * this also tracks newlines to maintain a template <-> js line mapping
 */
mjt.TemplateCompiler.prototype.emit = function () {
    // make sure there is no pending markup before we start inserting code
    // note that this will re-enter emit() as part of flushing the markup!
    if (this._markup.length)
        this.flush_markup();

    // handle the arguments one by one
    for (var i = 0; i < arguments.length; i++) {
        var arg = '' + arguments[i];
        // split on newlines so we can count generated lines
        // for the line number mapping.
        var lines = arg.split('\n');
        for (var li = 0; li < lines.length; li++) {
            if (li > 0) {
                this._code.push('\n');
                this.debug_locs.push(this.source_loc);
            }
            this._code.push(lines[li]);
        }
    }
};

/**
 * emit code and append a newline.
 */
mjt.TemplateCompiler.prototype.emitln = function () {
    this.emit.apply(this, arguments);
    this.emit('\n');
};


/**
 * emit strings that will be passed through to the template output unchanged.
 * args are converted to strings and lazily added to the string table.
 */
mjt.TemplateCompiler.prototype.markup = function () {
    for (var i = 0; i < arguments.length; i++) {
        this._markup.push(arguments[i]);
    }
};


/**
 * warn at runtime by adding the warning into the template output
 */
mjt.TemplateCompiler.prototype.warn = function(s) {
    this.markup('<span style="outline-style:solid;color:red;">',
             this.htmlencode(s),
             '</span>');
};


/**
 *
 * compile code to create or reference a mjt task.
 *   the task is only created once, not on each redraw!
 *
 */
mjt.TemplateCompiler.prototype.compile_task = function(taskname, n) {
    // should be an error to have other mjt.* attrs?

    // the query is in the text
    if (n.firstChild === null || n.firstChild.nodeType != 3
        || n.firstChild.nextSibling !== null) {
        throw new Error('mjt.task=' + taskname + ' declaration may only contain text');
    }

    var mq = n.firstChild.nodeValue;
    if (mq.match(/;\s*$/)) {
        mjt.warn('mjt.task=', taskname,
                 'definition should not end with a semicolon');
        mq = mq.replace(/;\s*$/, ''); // but fix it and continue
    }

    if (this.browser_dom && mq.match(/\/\/ /)) {
        // no way to fix this - IE doesnt preserve whitespace
        mjt.warn('"//" comments in mjt.task=', taskname,
                 'definition will fail on IE6');
    }

    // create the Task if it hasn't already been created.
    // in the browser runtime, we could be redrawing an existing template,
    // in which case we must not re-create its tasks.
    // note also that we won't even evaluate the body of the task declaration
    // unless we're actually creating it.
    // "this" in the generated code refers to the TemplateCall object
    this.emitln('var ', taskname, ' = this.tasks && this.tasks.', taskname, ';');
    this.emitln('if (!', taskname, ') { ', taskname, ' = this.mktask("', taskname, '", (\n', mq, ')); }');

    // mark the current function as requiring a TemplateCall to be created at runtime
    this.scope.has_tasks = true;
};

/**
 *
 * compile a text node or attribute value,
 *  looking for $$ or $var or ${expr} and expanding
 *
 *  @param s string            the source text
 *  @param attrtext   boolean  flag indicating that the text is inside an xml attribute
 *  @trim_leading_ws  boolean  flag to ignore whitespace at the start of the text
 *  @trim_trailing_ws boolean  flag to ignore whitespace at the end of the text
 *  @complex_substitutions_only boolean  flag to only allow ${} style substitutions
 */
mjt.TemplateCompiler.prototype.compile_text = function(s, attrtext,
                                                       trim_leading_ws, trim_trailing_ws,
                                                       complex_substitutions_only) {
    var endsimplesub = /[^A-Za-z0-9_.]/gm;
    var closebrace = /\}/gm;
    var closebracket = /\]/gm;
    
    var ret = {
      has_subs : false,
      next_node_leading_ws : null
    };
    
    if (typeof attrtext == 'undefined')
        attrtext = false;

    if (typeof trim_leading_ws == 'undefined')
        trim_leading_ws = false;
    if (typeof trim_trailing_ws == 'undefined')
        trim_trailing_ws = false;
    if (typeof complex_substitutions_only == 'undefined')
        complex_substitutions_only = false;

    // temporaries: match and substring
    var m, ss, nlines;

    var slen = s.length;
    var lasti = 0;
    var si = s.indexOf('$', lasti)

    // fastpath
    if (si == -1) {
        nlines = s.split('\n').length - 1;

        if (trim_leading_ws)
            s = s.replace(/^\s+/m, '');
        if (trim_trailing_ws)
            s = s.replace(/\s+$/m, '');
        
        var re = /\n\s*$/.exec(s);
        if (re) {
            ret.next_node_leading_ws = re[0];
            s = s.substr(0, re.index); 
        }

        this.markup(this.htmlencode(s));
        this.source_loc += nlines;
        return ret;
    }

    while (si >= 0) {
        // pass through anything before the $
        ss = s.substring(lasti, si);

        nlines = ss.split('\n').length - 1;
        if (lasti == 0 && trim_leading_ws)
            ss = ss.replace(/^\s+/m, '');

        this.markup(this.htmlencode(ss));
        this.source_loc += nlines;

        si++;
        if (si >= slen) {
            this.warn('premature end of $ substitution in ' + this.jsencode(s));
            return ret;
        }

        switch (s.charAt(si)) {
          case '$':
            if (complex_substitutions_only) {
                this.markup('$');
                break;
            }
            // "$$" becomes "$"
            si++; // skip the second $
            this.markup('$');
            break;

          case '(':
            // "$(" is always passed through because it's very common in jQuery
            this.markup('$');
            break;

          case '{':
            // "${" starts a complex substitution
            closebrace.lastIndex = si+1;
            m = closebrace.exec(s);
            if (m === null) {
                this.warn('missing close after ${ in ' + this.jsencode(s));
                return ret;
            }
            ss = s.substring(si+1, closebrace.lastIndex-1);
            si = closebrace.lastIndex;

            if (/\{/.test(ss))
                throw new Error('template compiler: "{" and "}" are forbidden inside "${...}"');

            if (attrtext)
                this.emitln('__m[__n++]=__pkg.runtime.make_attr_safe(', ss, ');');
            else
                this.emitln('__m[__n++]=(', ss, ');');
            ret.has_subs = true;
            this.source_loc += ss.split('\n').length - 1;
            break;

          case '[':
            if (complex_substitutions_only) {
                this.markup('$');
                break;
            }

            // "$[" is for wikiref-like behavior
            if (attrtext)
                throw new Error('template compiler: "$[...]" is illegal in an attribute');

            closebracket.lastIndex = si+1;
            m = closebracket.exec(s);
            if (m === null) {
                this.warn('missing close after $[ in ' + this.jsencode(s));
                return ret;
            }
            ss = s.substring(si+1, closebracket.lastIndex-1);
            si = closebracket.lastIndex;

            if (/\[/.test(ss))
                throw new Error('template compiler: "[" and "]" are forbidden inside "$[...]"');

            this.emitln('__m[__n++]=__pkg.runtime.ref(', this.jsencode(ss), ');');
            ret.has_subs = true;
            this.source_loc += ss.split('\n').length - 1;
            break;

          default:
            if (complex_substitutions_only) {
                this.markup('$');
                break;
            }

            // "$" followed by anything in [A-Za-z0-9.] is a simple substitution
            // (an identifier or dot-separated property path)
            endsimplesub.lastIndex = si;
            m = endsimplesub.exec(s);
            if (m === null) {
               ss = s.substring(si);
               si = slen;
            } else if (m.index > si) {
               ss = s.substring(si, m.index);
               si = m.index;
            } else {
                this.warn('unknown character following $ in ' + this.jsencode(s));
                return ret;
            }
            if (attrtext)
                this.emitln('__m[__n++]=__pkg.runtime.make_attr_safe(', ss, ');');
            else
                this.emitln('__m[__n++]=', ss, ';');
            ret.has_subs = true;
        }

        lasti = si;
        si = s.indexOf('$', lasti);
    }
    if (lasti >= 0 && lasti < slen) {
        ss = s.substring(lasti);
        nlines = ss.split('\n').length - 1;

        if (trim_trailing_ws)
            ss = ss.replace(/\s+$/m, '');
        
        var re = /\n\s*$/.exec(ss);
        if (re) {
            ret.next_node_leading_ws = re[0];
            ss = ss.substr(0, re.index); 
        }

        this.markup(this.htmlencode(ss));
        this.source_loc += nlines;
    }
    return ret;
};

/**
 * generate the body of an onevent handler
 * UNLIKE HTML, event handlers use the lexical scope of the template function.
 *  this makes it much easier to write handlers for tags that are generated
 *  inside loops or functions.
 * the disadvantage is that we create lots of little anonymous functions, many of
 *  them unnecessary.  in many cases it would be safe to just inline the event
 *  handler rather than capturing the environment in a closure, but we cant tell
 *  whether an onevent handler has free variables so we always have to create the
 *  closure.
 * there are almost certainly leaks here - use something like
 *  MochiKit.signal for onevent management?
 */
mjt.TemplateCompiler.prototype.compile_onevent_attr = function (aname, avalue) {
    // TODO make sure aname is a known event handler.  we assume it's clean below.

    // BUG http://code.google.com/p/mjt/issues/detail?id=5
    //  this could leak over time, and there's no good
    //  way to gc these keys.  should hang off TemplateCall
    //  rather than mjt._eventcb so the closures will go away
    //  at some point.  the TemplateCall instance is not easily
    //  accessible from the handler string though?
    // probably event setup should be done using jquery once
    //  the dom is constructed.

    var uvar = this.uniqueid(aname + '_cb');  // unique variable
    this.emitln('var ', uvar, ' = __pkg.runtime.uniqueid("', aname, '");');
    // this.emitln('if (typeof this._cb == "undefined") this._cb = {};');
    this.emitln('mjt._eventcb[', uvar, '] = function (event) {');
    this.emit(avalue);
    this.emitln('}');

    // return the new onevent attribute string
    return ('return mjt._eventcb.${' + uvar + '}.apply(this, [event])');
};

/**
 *
 * Extract mjt-specific attributes from a DOM node and 
 * return the non-mjt attributes into a list.
 * Expansion of dynamic attributes is done later.
 *
 * This function is a profiling hotspot - it is one of
 * the inner loops of the compiler since you often have
 * multiple attributes per node.  Speedups welcomed.
 * 
 */
mjt.TemplateCompiler.prototype.get_attributes = function(n, attrs, mjtattrs) {
    // if the tag was namespaced with the mjt namespace, then treat any attributes
    //  without an explicit namespace as mjt attributes
    var mjttag = this.mjtns_re.exec(n.nodeName);

    // mjt.src is used to hide src= attributes within
    //  the template so they arent fetched until the
    //  template is expanded.
    // otherwise, if you have an <img src="$var"> in your you'll
    //  template source you'll get a bogus fetch before template
    //  expansion.
    // this is only needed if compiling HTML in the browser.
    var src_attr = null;

    var srcattrs = n.attributes;
    for (var ai = 0; ai < srcattrs.length; ai++) {
        var attr = srcattrs[ai];
        if (!attr.specified) continue;

        var aname = attr.nodeName;
        var m = this.mjtns_re.exec(aname);
        if (m) {
            var mname = m[1];

            // we dont warn about unknown mjt attrs yet
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

        // hold off on src= attribute in case mjt.src= is present.
        // mjt.src is only needed if compiling from browser dom, but 
        // we handle it here too for compatibility.
        if (aname == 'src') {
            src_attr = attr.nodeValue;
            continue;
        }

        var a = {
            name: aname
        };

        if (typeof attr.nodeValue != 'undefined')
            a.value = attr.nodeValue;

        // handle browser DOM quirks
        if (this.browser_dom) {
            // TODO: see
            //  http://tobielangel.com/2007/1/11/attribute-nightmare-in-ie
    
            // cant do vanilla onevent= on IE6 because the dom doesnt
            //  have access to the original string, only to the
            //  compiled js function.  use mjt.onevent=.
            if (aname.substr(0,2) == 'on') {
                mjt.warn(aname, '="..."',
                         'will break on IE6, use',
                         'mjt.' + aname);
            }
    
            if (this._ie_attribute_bs) {
                if (aname == "style") {
                    // IE makes it hard to find out the style value
                    a.value = '' + n.style.cssText;
                } else if (aname == 'CHECKED') {
                    aname = 'checked';
                    a.value = '1';
                } else {
                    var ie_whatever = n.getAttribute(aname, 2);
                    if (ie_whatever)
                        a.value = ie_whatever;
                }
            }
    
            if (typeof a.value == 'number')  // some ie attributes
                a.value = '' + a.value;
        }

        attrs.push(a);
    }

    // IE doesnt show form value= as a node attribute
    if (this.browser_dom && this._ie_attribute_bs && n.nodeName == "INPUT") {
        a = { name: 'value', value: n.value };
        attrs.push(a);
    }

    // finally, patch up the src= attribute if mjt.src was used
    // we do this even if we're not in browser mode for compatibility.
    if (typeof mjtattrs.src != 'undefined') {
        attrs.push({ name: 'src', value: mjtattrs.src });
    } else if (src_attr !== null) {
        attrs.push({ name: 'src', value: src_attr });
    }
};

/**
 *
 * compile a mjt.choose directive
 *
 */
mjt.TemplateCompiler.prototype.compile_choose = function(cn, choose) {
    var choose_state = 'init';
    var tablevar = false;
    var default_label = false;

    if (choose) {
        this.emitln('switch (', choose, ') {');
        choose_state = 'dispatch_init';
    } else {
        mjt.log('choose="" is deprecated, use if...elif...else instead');
    }

    var n = cn.firstChild;
    while (n != null) {
        var nextchild = n.nextSibling;

        var nt = n.nodeType;

        if (nt == 3) { // TEXT_NODE
            if (n.nodeValue.match(/[^ \t\r\n]/)) {
                mjt.warn('only whitespace text is allowed in mjt.choose, found',
                         '"' + n.nodeValue + '"');
            }
            n = nextchild;
            continue;
        }

        if (nt == 1) { // ELEMENT_NODE
            var next_choose_state = choose_state;
            var mjtattrs = {};
            var attrs = [];
            this.get_attributes(n, attrs, mjtattrs);
            var defaultcase = false;

            if (typeof(mjtattrs.when) != 'undefined') {
                defaultcase = false;
            } else if (typeof(mjtattrs.otherwise) != 'undefined') {
                defaultcase = true;
            } else {
                mjt.warn('all elements inside mjt.choose must have a mjt.when= or mjt.otherwise= attribute');
                break;
            }


            if (choose_state == 'init') {
                if (defaultcase) {
                    this.emitln('{');
                    next_choose_state = 'closed';
                } else {
                    this.emitln('if (', mjtattrs.when, ') {');
                    next_choose_state = 'open';
                }
            } else if (choose_state == 'open') {
                if (defaultcase) {
                    // for an if-else chain this is the final else
                    this.emitln('} else {');
                    next_choose_state = 'closed';
                } else {
                    this.emitln('} else if (', mjtattrs.when, ') {');
                    next_choose_state = 'open';
                }
            } else if (choose_state.match(/^dispatch/)) {
                if (choose_state != 'dispatch_init')
                    this.emitln('break;');

                if (defaultcase) {
                    this.emitln('default:');
                    // a slight improvement would be to have a state
                    // 'dispatch_closed' which would detect any
                    // subsequent 'when' clauses.
                    next_choose_state = 'dispatch';
                } else {
                    this.emit('case ');
                    this.emit(this.jsencode(mjtattrs.when));
                    this.emitln(':');
                    next_choose_state = 'dispatch';
                }
            }

            this.compile_node(n, { choose_state: 'in_choose' });

            choose_state = next_choose_state;
        }

        n = nextchild;
    }

    if (choose == '') {
        // end if-else chain
        this.emitln('}');
    } else {
        if (choose_state != 'dispatch_init')
            this.emitln('break;');
        // close switch statement
        this.emitln('};');
    }
};


mjt.TemplateCompiler.prototype.compile_def = function (defattr, n) {
    // parse the signature
    var defn = defattr.match(/^([^(]+)\(([^)]*)\)$/ );
    if (! defn) {
        mjt.warn('bad mjt.def=', defattr,
        ': must contain an argument list');
        return;
    }
    var defname = defn[1];
    var defargs = defn[2];

    if (this.debug)
        this.emitln('// mjt.def=', defattr);

    // this is the actual function declaration
    this.emitln('var ', defname, ' = function (', defargs, ') {');

    // push the function declaration stack
    this.scope = new mjt.Scope(this, this.scope, defattr);

    //this.emit("mjt.log('TCALL', this);\n");
};


mjt.TemplateCompiler.prototype.complete_def = function () {
    // pop the scope declaration stack
    this.scope = this.scope.parent;

    // for text output, the easiest thing to do is to generate the
    //  text will all tags elided but with quoting, then strip
    //  the quoting at the last moment.
    // note that this is only done at the toplevel of a template:
    //  if you have a template library in "text" mode it will
    //  strip the tags but any template definitions from the
    //  library will still return markup-encoded text.
    if (this.scope.toplevel && this.output_mode == 'text')
        this.emitln('return __pkg.runtime.cleanup_noquote(__m);');
    else
        this.emitln('return __m;');
    this.emitln('};');
};


mjt.TemplateCompiler.prototype.generate_open_tag = function (tagname, attrs, attrcode, generate_tcall_id) {
    this.markup('<',tagname);

    var static_attrs = {};
    for (var ai = 0; ai < attrs.length; ai++) {
        var a = attrs[ai];
        if (typeof(a.value) == 'function') {
            mjt.warn('ignoring function-valued attr',
                     tagname, a.name, a.value);
            continue;
        }

        static_attrs[a.name] = a.value;
    }

    if ('id' in static_attrs)
        generate_tcall_id = false;

    // if there is any mjt.attrs code, we must dynamically generate all attributes
    // to handle overrides.
    if (attrcode) {
        var dvar = this.uniqueid('dattrs');
        var svar = this.uniqueid('sattrs');
        this.emitln('var ', dvar, ' = (', attrcode, ');');
        this.emitln('var ', svar, ' = {};');

        for (ai = 0; ai < attrs.length; ai++) {
            var k = attrs[ai].name;
            var v = attrs[ai].value;
            // generate static attributes from template, but check that they
            // are not in the dynamic list first.
            this.emit('if (!(', this.jsencode(k), ' in ', dvar, ')) {'); {
                if (k in this.boolean_attrs) {
                    this.markup(' ', k);
                } else {
                    this.markup(' ', k, '="');
                    this.compile_text(v, true);
                    this.markup('"');
                }
            }
            this.emitln(' }');
        }

        if (generate_tcall_id)
            this.emitln('if (this.subst_id && !("id" in ', dvar, ')) ', dvar, '.id=this.subst_id;');

        // generate dynamic attributes from mjt.attrs code.
        // TODO generate these in sorted order for deterministic output
        var divar = this.uniqueid('di');
        this.emitln('for (var ', divar, ' in ', dvar, ') {');

        // BUG http://code.google.com/p/mjt/issues/detail?id=4
        //     currently boolean_attrs is not passed through to the runtime template
        this.emitln("__m[__n++]=' ' + " + divar + ";");
        this.emitln("__m[__n++]=__pkg.runtime.bless('=\"');");
        this.emitln("__m[__n++]=__pkg.runtime.htmlencode(''+" + dvar + "[" + divar + "]);");
        this.emitln("__m[__n++]=__pkg.runtime.bless('\"');");

        this.emitln('}');
    } else {
        for (ai = 0; ai < attrs.length; ai++) {
            var a = attrs[ai];

            this.markup(' ', a.name, '="');
            this.compile_text(a.value, true);
            this.markup('"');
        }

        // uncomment this to put debug line info into the output.  probably
        //   TemplatePackage.debug_locs is a better way to get this though.
        // if (this.source_loc !== null) {
        //    this.emitln('__m[__n++]=__pkg.runtime.bless(\' loc="' + this.debug_locs.length + ',' + this.source_loc + '"\');\n');
        // }

        if (generate_tcall_id) {
            this.emitln('if (this.subst_id) { __m[__n++]=__pkg.runtime.bless(\' id="\' + this.subst_id + \'"\'); }');
        }
    }
};

/**
 *
 * compile a template from a dom representation.
 *
 */
mjt.TemplateCompiler.prototype.compile_node = function(n, options) {
    if (typeof(options) == 'undefined')
        options = {};

    var choose_state = 'none';
    if (typeof(options.choose_state) != 'undefined')
        choose_state = options.choose_state;

    //mjt.log('NODE', n.nodeType, n.nodeName);

    if (typeof n.getUserData != 'undefined') {
        try {
            var lineno = n.getUserData('lineNumber');
            if (lineno !== null) {
                // getUserData should return a string or null
                if (typeof lineno == 'string')
                    lineno = parseInt(lineno);

                this.source_loc = lineno;
            }
        } catch (e) {
            this.source_loc = null;
        }
    }

    var next_node_leading_ws = null;

    switch (n.nodeType) {
      case 1: // ELEMENT_NODE
        this.compile_element(n, choose_state, options.leading_ws);
        break;

      case 2: // ATTRIBUTE_NODE
        // these are handled in compile_element()
        break;

      case 3: // TEXT_NODE
        var text = n.nodeValue;
        var text_compile = this.compile_text(text, false, options.trim_leading_ws, options.trim_trailing_ws);
        next_node_leading_ws = text_compile.next_node_leading_ws;
        break;

      case 4: // CDATA_SECTION_NODE
        // check that this is doing the correct thing
        //mjt.log('CDATA node');
        if (options.leading_ws)
            this.markup(options.leading_ws);
        this.compile_text(n.nodeValue, false);
        break;
      case 5: // ENTITY_REFERENCE_NODE     &foo;
        // maybe these should be folded into unicode by the time we see them?
        // we pass them through if they get here.
        if (options.leading_ws)
            this.markup(options.leading_ws);
        this.markup('&'+n.nodeName+';');
        break;
      case 6: // ENTITY_NODE
        // should these be folded into unicode by the time we see them?
        mjt.warn('template compiler: skipping dom node type', n.nodeType);
        break;
      case 7: // PROCESSING_INSTRUCTION_NODE    <? ... ?>
        // the browser html parser hides these, but we can get them server-side
        mjt.warn('template compiler: got <? ?>', n.nodeName, n.nodeValue);
        break;
      case 8: // COMMENT_NODE       <!--   -->
        if (options.leading_ws)
            this.markup(options.leading_ws);
        if (this.output_mode != 'text')
            this.markup('<!--'+n.nodeValue+'-->');
        break;
      case 9: // DOCUMENT_NODE
        // should be handled by the xml processor?
        mjt.warn('template compiler: skipping dom node type', n.nodeType);
        break;
      case 10: // DOCUMENT_TYPE_NODE   <!DOCTYPE ... >?
        // should be handled by the xml processor?
        if (options.leading_ws)
            this.markup(options.leading_ws);
      	this.markup('<!DOCTYPE ' + n.nodeName + ' PUBLIC "' + n.publicId + '" "' + n.systemId + '">');
      	mjt.warn('ignoring DOCTYPE', n.nodeName, n.nodeValue);
        break;
      case 11: // DOCUMENT_FRAGMENT_NODE
        // ???
        mjt.warn('template compiler: skipping dom node type', n.nodeType);
        break;
      case 12: // NOTATION_NODE
        // ???
        mjt.warn('template compiler: skipping dom node type', n.nodeType);
        break;

      default:
        mjt.warn('template compiler: unknown dom node type', n.nodeType);
    }
    
    return next_node_leading_ws;
};

mjt.TemplateCompiler.prototype.compile_element = function(n, choose_state, leading_ws) {
    // completions is a call stack but without all the function calls.
    // many attribute handlers require some action before compiling the
    // contents and another action afterward.  this stack accumulates the
    // "afterward" actions.
    var completions = [];
    var render_outer_tag = true;

    var tagname = n.nodeName;
    var tagname_lower = tagname.toLowerCase();
    //mjt.log('ELEMENT', tagname);

    var mjtattrs = {};
    var attrs = [];

    // extract mjt-specific attributes and put the rest in a list.
    //  expansion of mjt.attrs="..." dynamic attributes is done later.
    this.get_attributes(n, attrs, mjtattrs);

    var attrs_by_name = {};
    for (ai = 0; ai < attrs.length; ai++) {
         var a = attrs[ai];
         attrs_by_name[a.name] = a;
    }

    if (this.scope.toplevel) {
        if (typeof mjtattrs.def != 'undefined')
            throw new Error('template compiler: def="' + mjtattrs.def + '" illegal at top element');
        mjtattrs.def = this.scope.toplevel_def;
    }

    // don't output any xml tags if we're in text mode.
    if (this.output_mode == 'text')
        mjtattrs.strip = '1';

    // special handling for some mjt namespaced tags
    var mjttag = this.mjtns_re.exec(n.nodeName);
    if (mjttag) {
        switch (mjttag[1]) {
          case 'script':
            mjtattrs.script = '';          // fake out the existing test
            break;
          case 'none':
            mjt.warn('<mjt:none> is deprecated, use <mjt:block> instead');
            mjtattrs.strip = '1';          // fake out the existing test
            break;
          case 'block':
            mjtattrs.strip = '1';          // fake out the existing test
            break;
          case 'task':
            //mjt.log('got mjt:task');
            if (typeof mjtattrs['var'] == 'string') {
                mjtattrs.task = mjtattrs['var'];
            } else {
                mjt.error('mjt:task requires var= or mjt:var= attribute');
            }
            break;
          case 'doc':
            if (!this.scope.toplevel) {
                mjt.error('mjt:doc is only legal as the toplevel tag');
            }
            mjtattrs.strip = '1';
            if (typeof mjtattrs.type != 'undefined')
                this.document_content_type = mjtattrs.type;
            else
                this.document_content_type = 'text/html';

            if (typeof mjtattrs['xml-pi'] != 'undefined') {
                if (mjtattrs['xml-pi'] == 'true' || mjtattrs['xml-pi'] == '1')
                    this.output_prefix = '<?xml version="1.0" encoding="utf-8" ?>\n';
                else if (mjtattrs['xml-pi'] == 'false' || mjtattrs['xml-pi'] == '0')
                    this.output_prefix = null;
            }

            // compiler settings to change the output style
            if (this.document_content_type == 'text/html')
                this.set_output_mode('html');
            else if (/^text\//.test(this.document_content_type))
                this.set_output_mode('text');
            else if (/^application\/.*xml$/.test(this.document_content_type))
                this.set_output_mode('xml');
            else
                // xml if we don't recognize the content-type
                this.set_output_mode('xml');

            break;
          default:
            mjt.error('ignoring unknown mjt tag', tagname);
            break;
        }
    }

    // the subcompiler is the function that will be used to traverse
    //  the children of this node.  by default it calls compile_node
    //  recursively, but depending on various mjt directives it might
    //  compile subnodes specially or bypass them entirely.
    var subcompiler = null;

    var trim_whitespace = false;
    if (typeof mjtattrs.trim != 'undefined')
        trim_whitespace = true;

    // only set up a subcompiler if there are actually child nodes
    if (n.firstChild !== null) {
        subcompiler = function(n) {
            var child = n.firstChild;

            var opts = {};

            // trim leading ws on the first child only
            if (trim_whitespace)
                opts.trim_leading_ws = true;

            while (child != null) {
                var nextchild = child.nextSibling;

                // trim trailing ws on the last child only
                if (trim_whitespace && nextchild === null)
                    opts.trim_trailing_ws = true;

                opts.leading_ws = this.compile_node(child, opts);

                // reset trim options for the next child
                opts.trim_leading_ws = false;
                opts.trim_trailing_ws = false;

                child = nextchild;
            }
            
            return opts.leading_ws;
        };
    }

    if (tagname_lower == 'script' && this.browser_dom) {
        // passing <script> tags through is confusing in this case
        //  because the browser's dom parser has already evaluated the tag
        //  by the time we see it!
        // passing it through to possibly get executed a second time
        //  in a different environment is too confusing and dangerous
        //  to be useful and is suppressed right here.
        return;
    }
    if (tagname_lower in this.noescape_tags) {
        // noescape_tags include <script> and <style> if generating HTML.
        subcompiler = function (n) {
            var bodyelt = n.firstChild;
            if (bodyelt === null)
                return;
            if (bodyelt.nodeType != 3 || bodyelt.nextSibling) {
                mjt.warn('<' + tagname + '> tag should contain only text');
                return;
            }

            // because we're generating html and not xml we
            // leave script tag bodies unescaped to counteract html's
            // weird rules inside <script>.
            // in particular, html special characters like & are fair game inside
            // <script> except for the specific string "</script" which could
            // be construed as closing the script.

            // for xml we should just wrap //<![CDATA[  ...  ]]>
            //  around the unescaped body, but then we have to look for
            //  ]]> in the body and escape that somehow.  does xml
            //  even have a way of quoting that?
            // perhaps   ]]>]]&gt;<![CDATA[  would work.
            var body = bodyelt.nodeValue;
            var bad_body_re = new RegExp('<\/' + tagname);
            if (body.match(bad_body_re)) {
                // the easy approach to sanitization
                mjt.warn('illegal content for HTML script tag, removed');
            } else {
                // should make it through html <script> body ok

                // compile body, handling ${} substitutions only

                this.emitln(' __m[__n++]=(function () {');
                this.emitln('var __m=__pkg.runtime.new_markuplist(),__n=0;');

                var text_compile = this.compile_text(bodyelt.nodeValue, false, false, false, true);
                var has_subs = text_compile.has_subs;

                // need to do substitution on any </script> or </style> that might
                // have been introduced by substitution.
                // really need to start a subtemplate so that we can capture the
                // output of compile_text at runtime and fix it if needed.
                this.emitln('return __pkg.runtime.cleanup_noquote(__m, '
                            + this.jsencode(tagname_lower) + ');');
                this.emitln('})();');
                
                return text_compile.next_node_leading_ws;
            }
        };
    }

    if (typeof(mjtattrs.task) != 'undefined') {
        this.compile_task(mjtattrs.task, n);
        return;  // elide the whole element
    }

    if (typeof(mjtattrs.def) != 'undefined') {
        if (typeof(attrs.id) != 'undefined') {
            mjt.warn('mjt.def=', mjtattrs.def,
            'must not have an id="..." attribute');
        }

        this.compile_def(mjtattrs.def, n);

        if (this.scope.parent.toplevel) {
            this.emitln('var __pkg = this.tpackage;');
            this.emitln('var exports = this.exports;');
            this.emitln('var __ts=__pkg._template_fragments;');
            this.emitln('var __m=__pkg.runtime.new_markuplist(),__n=0;');
            if (this.output_prefix != null)
                this.markup(this.output_prefix);
        } else {
            this.emitln('var __m=__pkg.runtime.new_markuplist(),__n=0;');
        }

        // completion actions after the inside of the function
        // has been processed.
        completions.push(function () {
            var defscope = this.scope;

            if (defscope.has_tasks) {
                if (!render_outer_tag || typeof(mjtattrs.strip) != 'undefined') {
                    mjt.error('can\'t strip toplevel tag of mjt.def="' + mjtattrs.def + '" tag because it contains tasks');
                }
            }

            // pop the def context
            this.complete_def();

            var defname = mjtattrs.def.replace(/\(.*/, '');

            // toplevel gets a doc_content_type label if available
            if (this.scope.toplevel && this.document_content_type != null) {
                this.emitln(defname, '.doc_content_type = ', this.jsencode(this.document_content_type), ';');
            }

            // except for toplevel functions, build the template function factory here
            if (! this.scope.toplevel) {
                var templatevar = '__pkg';
                this.emitln(defname, ' = __pkg.runtime.tfunc_factory(',
                            this.jsencode(mjtattrs.def), ', ',
                            defname, ', ', templatevar, ', ', defscope.has_tasks, ', ', false, ');');
            }
    
            // template functions defined just below the toplevel go into exports
            if (this.scope.parent && this.scope.parent.toplevel)
                this.emitln('exports.', defname, ' = ', defname, ';');

            // template functions defined just below the toplevel go into exports
            if (typeof defscope.microdata != 'undefined') {
                this.emitln(defname, '.source_microdata = ', JSON.stringify(defscope.microdata.lastvalue), ';');
            }
        });
    }

    if (typeof(mjtattrs['when']) != 'undefined') {
        this.flush_markup();

        // make sure we are in a mjt.choose clause.
        //  if so, the containing compile_choose takes care of things
        if (choose_state != 'in_choose')
            mjt.warn('unexpected mjt.when, in choice state', choose_state);

        completions.push(function () {
            this.flush_markup();
        });
    }

    if (typeof(mjtattrs['otherwise']) != 'undefined') {
        this.flush_markup();

        // make sure we are in a mjt.choose clause.
        //  if so, the containing compile_choose takes care of things
        if (choose_state != 'in_choose')
            mjt.warn('unexpected mjt.otherwise, in choice state ', choose_state);

        completions.push(function () {
            this.flush_markup();
        });
    }


    // handle html5 microdata

    // for some well-known tags the html5 'value' is stored 
    //  in a particular attribute.
    // for others it is in the node's children
    // the <time> tag is special in that the h5value may go in
    //  either the datetime= attribute or the text content
    var h5_tags = {
        'meta':'content',
        'audio':'src', 'embed':'src', 'iframe':'src',
        'img':'src', 'source':'src', 'video':'src',
        'a':'href', 'area':'href', 'link':'href',
        'object':'data',
        'time':'datetime'
    };

    var md = this.scope.microdata;

    // mjt.itemprop="foo" roughly exands to:
    //    mjt.for="itemindex,itemvalue in itemvalue"
    //    itemprop="foo"
    // if the html5 value attribute or element content is not
    //    explicitly provided, the attribute or body will be
    //    set to $itemvalue
    // this has to be checked ahead of mjt.for= because it
    //  generates a synthetic mjt.for= attribute.
    if (md && typeof mjtattrs.itemprop != 'undefined') {
        if (!('itemprop' in attrs_by_name))
            attrs.push({ name: 'itemprop', value: mjtattrs.itemprop });

        // set a property on the currently open item

        // for now forbid props if there is no lexically containing item
        // XXX should allow this, but there must be a variable
        //  called "itemvalue" defined in the function.
        if (md.item === null)
            throw new Error('got mjt.itemprop= without containing mjt.item=');

        // there is an implicit mjt.for= associated with mjt.itemprop=
        if (typeof mjtattrs['for'] != 'undefined') {
            throw new Error(tagname + ' element has both acre:itemprop= and mjt.for="" attributes');
        }
        var itemtmp = 'itemvalue[' + this.jsencode(mjtattrs.itemprop) + ']';
        mjtattrs['for'] = ('itemindex,itemvalue in ('
                           + '(typeof ' + itemtmp + ' == "object" && '
                           + itemtmp + ' !== null && '
                           + itemtmp + ' instanceof Array) ? '
                           + itemtmp + ' : [' + itemtmp + '])');

        if (tagname_lower in h5_tags) {
            var value_attr = h5_tags[tagname_lower];
            if (value_attr in attrs_by_name) {
                // there is a right thing here, not sure what it is yet.
                // for now we ignore the itemprop
                // and assume that the template author has provided
                //  a more useful value than "$itemvalue"
                //mjt.warn(tagname + ' element ' has both acre:itemprop= and '
                //         + value_attr + '= provided');
            } else {
                // insert a new attr 
                attrs.push({ name: value_attr, value: '$itemvalue' });
            }
        } else {
            // if the element content is empty, fill it in with the item value
            if (n.firstChild === null) {
                mjtattrs.content = 'itemvalue';
            }
        }

        // check for special itemprop values?

        // at compile time we build a JSON structure containing the
        //  acre:microdata from the template source.
        // the html5 "value" may be determined by the contents,
        // so we don't do the actual property assignment until we've
        // compiled the children.
        completions.push(function () {
            // figure out the html5 microdata value of the contents

            // XXX should use md.item.contents to generate standard 
            // microdata json format

            var itemprop = mjtattrs.itemprop;
            if (tagname_lower in h5_tags) {
                // get the value of the attr if present
                var value_attr = h5_tags[tagname_lower];
                if (value_attr in attrs) {
                    md.item[itemprop] = attrs[value_attr];
                } else {
                    md.item[itemprop] = null;
                }
            } else {
                // get the microdata value of the element content if
                //  present.  
                if (n.firstChild === null) {
                    md.item[itemprop] = null;
                } else {
                    md.item[itemprop] = md.lastvalue;
                }
            }
//            md.lastvalue = null;
        });
    }

    if (typeof(mjtattrs['for']) != 'undefined') {

        // expect a python style "VAR in EXPR" loop declaration
        var matches = /^(\w+)(\s*,\s*(\w+))?\s+in\s+(.+)$/.exec(mjtattrs['for']);

        if (!matches) {
            // handle javascript style
            //   "(var i = 0 ; i < 3; i++)" declarations
            if (mjtattrs['for'].charAt(0) == '(') {
                this.emitln('for ', mjtattrs['for'], ' {');
                completions.push(function () {
                                     this.emitln('}');  // for (...)
                                 });
            } else {
                mjt.warn('bad mjt.for= syntax');
            }
        } else {
            var var1 = matches[1];
            var var2 = matches[3];
            var forexpr = matches[4];
            var itemid, indexid;

            if (!var2) {   // "for v in items"
                indexid = this.uniqueid(var1 + '_index');
                itemid = var1;
            } else {       // "for k,v in items"
                indexid = var1;
                itemid = var2;
            }

            this.emitln('__pkg.runtime.foreach(this, (', forexpr, '), function (',
                        indexid, ', ', itemid, ') {');

            // "once" is a hack to make "continue;" work inside mjt.for=
            // making "break" and "return" work is too expensive to do all the
            // time but we could scan the body of the for to see if it's
            // necessary?
            var onceid = this.uniqueid('once');
            this.emitln('var ', onceid, ' = 1;');
            this.emitln('while (', onceid, ') {');
            completions.push(function () {
                this.emitln(onceid, '--;');
                this.emitln('} /* while once */');
                this.emitln('return ', onceid, ' ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;');
                this.emitln('}); /* foreach */');
            });
        }
    }

    if (typeof(mjtattrs['if']) != 'undefined') {
        this.emitln('if (', mjtattrs['if'], ') {');

        completions.push(function () {
            this.emitln('}');
        });
    }

    if (typeof(mjtattrs['elif']) != 'undefined') {
        if (!/^\s*$/.exec(this._markup.join(''))) {
            throw new Error('only whitespace is permitted between if="" and elif=""');
        }
        this._markup = [];

        this.emitln('else if (', mjtattrs['elif'], ') {');

        completions.push(function () {
            this.emitln('}');
        });
    }

    if (typeof(mjtattrs['else']) != 'undefined') {
        if (!/^\s*$/.exec(this._markup.join(''))) {
            throw new Error('only whitespace is permitted between if="" and else=""');
        }
        this._markup = [];

        this.emitln('else {');

        completions.push(function () {
            this.emitln('}');
        });
    }

    if (typeof(mjtattrs.script) != 'undefined') {
        // the attribute value specifies an event that
        // should trigger the script.  the default is to
        // run it inline during template generation.
        var ondomready = false;
        switch (mjtattrs.script) {
            case '':
                break;
            case '1':
                // accepted for backwards compat
                break;
            case 'ondomready':
                // delay execution of the script until
                // the surrounding dom is ready in the browser
                ondomready = true;
                break;
            default:
                mjt.warn('reserved mjtattrs.script= value:', mjtattrs.script);
                break;
        }

        // TODO mjt.script should play better with other mjt.* attrs

        if (ondomready) {
            this.emitln('__pkg.runtime.ondomready(function () {');
        }

        var textnode = n.firstChild;
        if (!textnode) {
        } else if (textnode.nodeType != 3 || textnode.nextSibling) {
            mjt.warn("the mjt.script element can only contain javascript text, not HTML.  perhaps you need to quote '<', '>', or '&' (this is unlike a <script> tag!)");
        } else {
            var txt = textnode ? textnode.nodeValue : '';

            if (txt.match(/\/\/ /) && this.browser_dom) {
                // no way to fix this - IE doesnt preserve whitespace
                mjt.warn('"//" comments in mjt.script= definition will fail on IE6');
            }
            var codelines = txt.split('\n');
            for (var li = 0; li < codelines.length; li++) {
                this.emitln(codelines[li]);
                this.source_loc++;
            }
        }

        if (ondomready) {
            this.emitln('}, this);');
        }

        // dont expand anything inside mjt.script
        render_outer_tag = false;
        subcompiler = null;
    }

    if (typeof(mjtattrs.choose) != 'undefined') {
        this.flush_markup();

        subcompiler = function(n) {
            this.compile_choose(n, mjtattrs.choose);
        };
    }

    if (typeof(mjtattrs.replace) != 'undefined') {
        // behaves like mjt.content but strips the outer tag
        render_outer_tag = false;
        subcompiler = function(n) {
            this.emitln('__m[__n++]=(', mjtattrs.replace, ');');
        };
    }

    if (typeof(mjtattrs.content) != 'undefined') {
        subcompiler = function(n) {
            this.emitln('__m[__n++]=(', mjtattrs.content, ');');
        };
    }

    // handle mjt.onevent attrs
    for (var evname in mjtattrs) {
        if (evname.substr(0,2) != 'on') continue;
        if (!this.browser_target) {
            mjt.warn('mjt:onevent= attributes only make sense if targeting a browser');
            continue;
        }
        a = { name: evname,
              value: this.compile_onevent_attr(evname, mjtattrs[evname])
            };
        attrs.push(a);
    }

    // if this.debug is set, annotate the html output with mjt_template="" attributes.
    // this is kind of dirty but handy for debugging.
    // it's definitely not ok when generating xml though, so check for browser_dom.
    //  XXX browser_dom check here isn't quite right
    if (this.debug && this.browser_dom && typeof(mjtattrs.def) != 'undefined') {
        attrs.push({ name: 'mjt_template',
                     value: mjtattrs.def });
    }

    // mjt.item roughly expands to
    //       item
    // mjt.item="foo" roughly expands to
    //       item="foo"
    // and causes "item" to be set to the current "itemvalue"
    // 
    if (md && typeof mjtattrs.item != 'undefined') {
        if (!('item' in attrs_by_name))
            attrs.push({ name: 'item', value: mjtattrs.item });

        // push the microdata item stack
        // create a new item with type and id
        md.stack.push(md.item);

        if ('id' in attrs_by_name) {
            var itemid = attrs_by_name.id.value;
            if (itemid in md.items) {
                md.item = md.items[itemid];
            } else {
                md.item = md.items[itemid] = {};
            }
        } else {
            md.item = {};
        }

        if (mjtattrs.item != '')
            md.item.__type = mjtattrs.item;

        this.emitln('var item = itemvalue;');

        completions.push(function () {
            // pop the microdata item stack
            md.lastvalue = md.item;
            md.item = md.stack.pop();
        });
    }
    if (md && typeof mjtattrs.itemfor != 'undefined') {
        if (!('itemfor' in attrs_by_name))
            attrs.push({ name: 'itemfor', value: mjtattrs.itemfor });

        // push the microdata item stack
        md.stack.push(md.item);

        // work on the item 'itemfor'.
        //  create it if it isn't present
        if (typeof md.items[mjtattrs.itemfor] == 'undefined')
            md.items[mjtattrs.itemfor] = {};
        md.item = md.items[mjtattrs.itemfor];

        completions.push(function () {
            // pop the microdata item stack
            md.lastvalue = md.item;
            md.item = md.stack.pop();
        });
    }

    var stripexpr = (typeof(mjtattrs.strip) != 'undefined')
         ? mjtattrs.strip : null;
    var stripvar = null;

    // if mjt.strip="1" don't bother to generate the if (...) test
    if (stripexpr == '1')
        render_outer_tag = false;

    // the surrounding tag may not get included in the
    // output if it contains some special attributes.
    if (render_outer_tag) {
        var attrcode =  (typeof(mjtattrs.attrs) != 'undefined') ? mjtattrs.attrs : null;

        if (stripexpr !== null) {
            stripvar = this.uniqueid('strip');
            this.emitln('var ', stripvar, ' = (', stripexpr, ');');
            this.emitln('if (!', stripvar, ') {');
        }
        
        if (leading_ws && typeof mjtattrs.def === 'undefined') 
            this.markup(leading_ws);

        if (typeof mjtattrs.def != 'undefined')
            this.generate_open_tag(tagname, attrs, attrcode, true);
        else
            this.generate_open_tag(tagname, attrs, attrcode, false);

        if (subcompiler === null && this.output_mode == 'xml')
            this.markup('/>');
        else
            this.markup('>');

        if (stripexpr !== null)
            this.emitln('}');
    }

    if (subcompiler !== null) {
        if (tagname_lower in this.empty_tags)
            mjt.warn('tag "' + tagname + '" must be empty, content ignored');
        else
            var closing_ws = subcompiler.apply(this, [n]);
    }

    if (render_outer_tag) {
        if (subcompiler === null && this.output_mode == 'xml') {
            // in this case the tag was already closed using <tagname/>
        } else if (tagname_lower in this.empty_tags) {
            // in this case we don't close the tag
        } else if (stripvar) {
            this.emitln('if (!', stripvar, ') {');
            if (typeof closing_ws !== 'undefined')
                this.markup(closing_ws);
            this.markup('</', tagname, '>');
            this.emitln('}');
        } else {
            if (typeof closing_ws !== 'undefined')
                this.markup(closing_ws);
            this.markup('</', tagname, '>');
        }
    }

    // run any completion functions that were queued up by 
    // various features...
    for (var ci = completions.length-1; ci >= 0 ; ci--) {
        completions[ci].apply(this, []);
    }
};
})(mjt);
