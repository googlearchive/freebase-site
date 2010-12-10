
(function(mjt){


mjt.Xhr = mjt.define_task(null,
                          [{ name: 'method'},
                           { name: 'url'},
                           { name: 'content_type', 'default':null },
                           { name: 'body', 'default':null },
                           { name: 'headers', 'default':null }]);

/**
 * mjt.Task wrapper around XMLHttpRequest
 *
 *  @param url          the url of the HTTP request
 *  @param cb           a function to be called with the XHR object when done
 *  @param [posttype]   if this is a POST, gives the content-type
 *  @param [postbody]   if this is a POST, gives the body for the request
 *
 *  the following HTTP header will be added:
 *    X-Metaweb-Request: 1
 * 
 *  Inside onready and onerror handlers you can get at the xhr object
 *  using "this.xhr" because "this" is bound to the task object.
 */
mjt.Xhr.prototype.init = function () {
    var xhr;

    if (typeof XMLHttpRequest != "undefined") {
        xhr = new XMLHttpRequest();
    } else if (typeof ActiveXObject != "undefined") {
        xhr = new ActiveXObject("MSXML2.XmlHttp");
    } else {
        return this.error('no XMLHttpRequest found');
    }
    
    if (this.headers === null)
        this.headers = {};

    this.xhr = xhr;
    return this;
};


mjt.Xhr.prototype.request = function () {
    var task = this;
    var xhr = this.xhr;

    xhr.onreadystatechange = function (e) {
        if (xhr.readyState != 4)
            return task;

        xhr.onreadystatechange = function(){};

        if ((''+xhr.status).charAt(0) == '2')
            return task.ready(xhr);
        return task.error('/apiary/http/status/' + xhr.status, xhr.statusText, xhr.responseText);
    };
    
    xhr.open(this.method, this.url, true);

    if (this.content_type !== null)
        xhr.setRequestHeader('Content-Type', this.content_type);

    // this is added by jquery
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    
    for (header in this.headers) {
        xhr.setRequestHeader(header, this.headers[header]);
    }

    if (this.body === null) {
        var r = xhr.send('');
    } else {
        var r = xhr.send(this.body);
        // save memory
        this.body = null;
    }

    return this;

};



/**
 *
 *
 */
mjt.XhrFormPost = function (url, form, headers) {
    // TODO switch to multipart/form-data for efficiency
    var body = mjt.formencode(form);
    return mjt.Xhr('POST', url,
                   'application/x-www-form-urlencoded', body, headers);
};

})(mjt);
