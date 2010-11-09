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

/**
 *  mjt functions to make use of compiled templates.
 *  most of these are browser-specific and not part of the minimal runtime.
 *  
 */

(function(mjt){

/**
 *
 * walk the html dom, extracting mjt.* attributes, recording
 *   and compiling templates, queries, and template insertion sites.
 *
 */
mjt.run = function (target, tfunc, targs) {
    //mjt.log('mjt.run', target, tfunc, targs);
    var target_id;

    // there is always a single app
    if (typeof mjt.app == 'undefined') {
        mjt.app = new mjt.App();
    }

    // special case for mjt.run() with no arguments
    if (arguments.length == 0) {
        var pkg = new mjt.TemplatePackage();
        return mjt.run_page(pkg);
    }

    // look up first arg as a string (element id) or a dom element object.
    if (typeof target === null) {
        throw new Error ('mjt.run: null target');
    } else if (typeof target == 'string') {
        target_id = target;
        target = document.getElementById(target_id);
    } else if (typeof target == 'object') {
        //mjt.log('mjt.run id ', typeof target.id, target_id, target);
        if (target.id == '')
            target.id = mjt.uniqueid('run_target');
        target_id = target.id;
    }

    if (arguments.length == 1) {
        var pkg = new mjt.TemplatePackage();
        pkg.source = window.location.protocol + '//'
            + window.location.host + window.location.pathname
            + '#' + target_id;
        return mjt.run_element(pkg, target, targs);
    }

    if (typeof tfunc !== 'function') {
        mjt.error('invalid template function', tfunc, arguments);
        throw new Error('mjt.run: invalid args');
    }

    // create a templatecall object and run the template function
    var tcall = new tfunc();
    tcall.subst_id = target_id;
    tcall.render(targs).display();
    return tcall.exports;
};

/**
 *
 * load template metadata from a dom document.
 * the metadata is encoded inside the html <head> element.
 *
 */
var load_page_metadata = function (pkg, head) {
    var elts = [];
    var e;
    for (e = head.firstChild; e !== null; e = e.nextSibling) {
        if (e.nodeType != 1)
            continue;
        // nodeType == NODE
        elts.push(e);
    }

    for (var i = 0; i < elts.length; i++) {
        e = elts[i];
        switch (e.nodeName) {
          case 'TITLE':
            pkg.title = e.innerHTML;
            break;

          case 'META':
            //d.push({ name: e.name, content: e.content, http_equiv: e.httpEquiv });
            switch (e.name) {
              case 'description':
                pkg.summary = e.content;
                break;
              case 'author':
                pkg.author = e.content;
                break;
              case 'content-language':
                pkg.language = e.content;
                break;
              case 'x-mjt-id':
                pkg.id = e.content;
                break;
            }
            break;

          case 'SCRIPT':
            // skip this, its already been evaluated by the browser
            //d.push({ type: e.type, src: e.src, text: e.text });
            break;

          case 'STYLE':
            //d.push({ media: e.media,  type: e.type, innerHTML: e.innerHTML });
            break;

/*
          case 'LINK':
            //d.push({ rel: e.rel, href: e.href, type: e.type, title: e.title, id: e.id });
            switch (e.rel) {
              case 'x-mjt-script':
                require_package('js', e.href, e.title,
                             (e.type || 'text/javascript'));
                break;
              case 'x-mjt-import':
                require_package('mjt', e.href, e.title,
                             (e.type || 'text/x-metaweb-mjt'));
                break;
              case 'stylesheet':
              case 'alternate stylesheet':
                break;
            }
            break;
*/

          default:
            break;
        }
    }
};

/*
 *  support the special case of mjt.run() with no arguments.
 *  extracts package metadata from the <head> tag
 *  moves the contents of <body> into a separate <div> for compilation
 *
 *  @returns DomElement  the <div> element holding the template source.
 */
mjt.run_page = function (pkg) {
    //   get package metadata from <head>
    //   extract the <body>

    // get package metadata from this page's <head>
    load_page_metadata(pkg, document.getElementsByTagName('head')[0]);

    // XXX add any prereqs here too
    var prereq_task = mjt.Succeed();

    pkg.source = window.location.protocol + '//'
        + window.location.host + window.location.pathname;
    // pull the template contents of <body> into a subdiv
    var target = document.createElement('div');

    var body = document.getElementsByTagName('body')[0];
    var e = body.firstChild;
    while (e !== null) {
        var tmp = e;
        e = e.nextSibling;

        // while compiling the body, sometimes we run into
        // iframes that were created to load external resources
        // rather than being part of the source code.  ignore them.
        if (tmp.nodeName === 'IFRAME'
            && tmp.className === 'mjt_dynamic') {
            continue;
        }

        body.removeChild(tmp);
        target.appendChild(tmp);
    }

    // TODO can this be removed if we refer to target by
    //  element rather than by id?
    if (1) {
        target.id = mjt.uniqueid('mjt_body');
        target.style.display = 'none';
        body.appendChild(target);
    }

    // strip off any display='none' on <body>
    if (body.style.display == 'none')
        body.style.display = '';

    // run the toplevel element after all prereqs are ready
    prereq_task.enqueue()
        .onready(function (r) {
            mjt.run_element(pkg, target, []);
         });
    return pkg.namespace;
};

/*
 *  compile a template from a dom node, run it, and display the result.
 *
 *  compile the template from the dom to javascript and run it
 *  paste the resulting html back into the dom
 *
 *  @param pkg    TemplatePackage    template package
 *  @param target DomElement         dom node containing the template source
 *  @param targs  Array              arguments passed to the generated template function
 *
 */
mjt.run_element = function (pkg, target, targs) {
    pkg.load_document(target, targs);

    pkg.tcall.subst_id = target.id;
    //mjt.log('mjt.run compiled', target_id);
    pkg.tcall.display();
    
    // set a variable in the containing scope - this
    // will only make a difference if pkg.load_document is
    // called synchronously.
    return pkg.tcall.exports;
};

/**
 *
 * walk the html dom, extracting mjt.* attributes, recording
 *   and compiling templates, queries, and template insertion sites.
 *
 */
mjt.load_element = function (top) {
    //mjt.log('mjt.load', top);

    var topelt = typeof top == 'string' ? document.getElementById(top) : top;

    var pkg = new mjt.TemplatePackage();
    pkg.source = window.location.protocol + '//'
        + window.location.host + window.location.pathname;
    if (typeof top == 'string')
        pkg.source += '#' + top;

    pkg.load_document(topelt, []);

    return pkg;
};

/*
 * compile and load a mjt template from an iframe.
 * 
 * this assumes the IFRAME is already loaded, i.e. it is safe to call
 * mjt.load_from_iframe() inside a body.onload handler iff the iframe is
 * declared in the original HTML.  dynamically generated iframes must wait for
 * the load to complete before calling mjt.load_from_iframe.
 * 
 * top is an iframe element or a string containing the id of
 * an iframe element.
 */
mjt.load_from_iframe = function (top) {
    var pkg = new mjt.TemplatePackage();

    // XXX this should be the src of the iframe instead
    pkg.source = window.location.protocol + '//'
        + window.location.host + window.location.pathname;

    var topelt = top;
    if (typeof top == 'string')
        topelt = document.getElementById(top);

    if (topelt.nodeName != 'IFRAME') {
        mjt.error('called mjt.load_from_iframe on node tag', topelt.nodeName);
        return null;
    }

    var idoc = topelt.contentWindow || topelt.contentDocument;
    if (idoc.document)
        idoc = idoc.document;

    topelt = idoc.getElementsByTagName('body')[0];

    // XXX should this call load_page_metadata() and set up dependencies?

    pkg.load_document(topelt, []);

    return pkg.namespace;
};

/**
 *
 * compile a mjt string.  returns the TemplatePackage.
 *
 */
mjt.load_string = function (mjthtml) {
    // note that the tag is never inserted into the document
    var tag = document.createElement('div');
    tag.innerHTML = mjthtml;
    return mjt.load_element(tag);
};


//////////////////////////////////////////////////////////////////////


/**
 *
 *
 */
mjt.replace_html = function (top, html) {
    var tmpdiv = document.createElement('div');
    var htmltext = mjt.flatten_markup(html);
    tmpdiv.innerHTML = htmltext;

    //mjt.log(htmltext);

    if (top.parentNode === null) {
        mjt.warn('attempt to replace html that has already been replaced?');
        return;
    }

    var newtop = tmpdiv.firstChild;

    if (newtop === null) {
        // should quote the htmltext and insert that?
        mjt.warn('bad html in replace_innerhtml');
        return;
    }

    //mjt.log('replacetop', newtop, top);
    if (newtop.nextSibling) {
        mjt.warn('template output should have a single toplevel node');

        // best effort: this means we must introduce an extra <div> to hold
        // the multiple results from the template...
        newtop = tmpdiv;
    }

    // XXX can we use jquery for this?  needed to avoid IE memory leaks
    // XXX should use jquery: $(top).empty();
    //mjt.teardown_dom_sibs(top, true);

    top.parentNode.replaceChild(newtop, top);

    // this is kind of unusual behavior, but it's hard to figure
    // out where else to do it.
    if (newtop.style && newtop.style.display == 'none')
        newtop.style.display = '';    // to use default or css style
};


})(mjt);
