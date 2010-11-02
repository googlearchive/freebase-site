

//
// this contains browser-specific javascript i/o routines
//
// it provides an implementation of mjt.io as well as a
// few helper routines for direct use if you're coding
// to a browser.
//

(function(mjt){

/**
 * create a dynamic script tag and append it to HEAD
 *
 * @param [tag_id] string  an id= for the SCRIPT tag
 * @param [url]    uri     the src= url
 * @param [text]   string  literal javascript text
 * @returns    domelement  the new SCRIPT node
 *
 */
mjt.dynamic_script = function (tag_id, url, text) {
    var head = document.getElementsByTagName('head')[0];
    var tag = document.createElement('script');
    tag.type = 'text/javascript';
    if (typeof tag_id == 'string')
        tag.id = tag_id;
    if (typeof url !== 'undefined')
        tag.src = url;
    if (typeof text !== 'undefined') {
        // see http://tobielangel.com/2007/2/23/to-eval-or-not-to-eval
        if(/WebKit|Khtml/i.test(navigator.userAgent))
            throw new Error('safari doesnt evaluate dynamic script text');
        tag.text = text;
    }

    head.appendChild(tag);
    return tag;
};


/**
 *  create an IFRAME that loads a particular uri.
 *
 *  @param id  string  the HTML id= attribute for the new IFRAME.
 *  @param url uri     the uri to fetch.
 *  @returns   element the IFRAME dom element
 */
mjt.dynamic_iframe = function (id, url) {
    var iframe = document.createElement('iframe');
    if (typeof id == 'string')
        iframe.id = id;
    iframe.style.display = 'none';
    // the class="mjt_dynamic" tells the compiler to skip it,
    // a useful hack.
    iframe.className = 'mjt_dynamic';
    iframe.setAttribute('src', url);
    //mjt.log('created iframe src=', url, iframe.id);
    return iframe;
};




/**
 * evaluate javascript code from a url, providing a Task
 * object so you can detect errors as well as success.
 *
 * @param url url to fetch the javascript from.
 *
 */
mjt.AsyncScript = mjt.define_task(null,
                                  [{name: 'url'}]);

mjt.AsyncScript.prototype.request = function () {
    var task = this;
    var js = mjt.dynamic_script(null, this.url);

    //
    // hopefully browser-independent code to generate a
    // dynamic <script> tag with completion callback.
    // this is needed when we don't get to send a callback= parameter.
    // i don't think this method reports http errors though.
    //
    // original from:
    //   <a href="http://www.phpied.com/javascript-include-ready-onload/">phpied.com</a>
    // safari iframe hack from:
    //   <a href="http://pnomolos.com/article/5/dynamic-include-of-javascript-in-safari">pnomolos.com</a>
    //
    // nix added completion function and hopeful safari future-proofing
    //

    // Safari doesn't fire onload= on script tags.  This hack
    // loads the script into an iframe too, and assumes that the
    // <script> will finish before the onload= fires on the iframe.
    if(/WebKit|Khtml/i.test(navigator.userAgent)) {
        var iframe = mjt.dynamic_iframe();
        // Fires in Safari
        iframe.onload = function () {
            task.ready(null);
        };
        document.getElementsByTagName('body')[0].appendChild(iframe);
    } else {
        // Fires in IE, also modified the test to cover both states
        js.onreadystatechange = function () {
            if (/complete|loaded/.test(js.readyState))
                task.ready(null);
        };
        // Fires in FF
        // (apparently recent versions of webkit may fire this too - nix)
        js.onload = function () {
            task.ready(null);
        };
    }
};


/**
 *  create a task to fetch an url into a hidden IFRAME.
 *  this is only useful for fetching data from the same origin
 *   as the current page.
 *  only the .onready() of the task will ever be called:
 *  the browser doesn't provide a way to check for
 *   errors in iframes.
 *
 *  @param url url     the url to fetch.
 */
mjt.AsyncIframe = mjt.define_task(null,
                                  [{name: 'url'}]);

mjt.AsyncIframe.prototype.request = function () {
    this.domid = mjt.uniqueid('mjt_iframe');
    this.iframe = mjt.dynamic_iframe(this.domid, this.url);

    var task = this;
    var iframe = this.iframe;
    function inner_document() {
        var idoc = (iframe.contentWindow
                    || iframe.contentDocument);
        if (idoc.document)
            return idoc.document;
        return idoc;
    }

    iframe.onload = function () {
        // works on firefox and hopefully safari
        task.ready(inner_document(iframe));
    };
    iframe.onreadystatechange = function () {
        // works on ie6
        if (iframe.readyState == 'complete') {
            task.ready(inner_document(iframe));
        }
    };
    document.getElementsByTagName('body')[0].appendChild(iframe);
};
})(mjt);
