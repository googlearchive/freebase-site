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


(function (mjt, fb) {

/*
 * from the client code.
 *
 * returns the value of a cookie given the cookie name.
 *
 */
fb.readCookie = function (name){
  if (typeof acre != 'undefined') {
      if (typeof acre.environ.cookies[name] == 'undefined')
          return '';

      var cookie = acre.environ.cookies[name];
      return cookie.value;
  }

  if (typeof document == 'undefined') return '';

  var cookieValue = "";
  name += "=";
  if(document.cookie.length > 0){
    var offset = document.cookie.indexOf(name);
    if(offset != -1){
      offset += name.length;
      var end = document.cookie.indexOf(";", offset);
      if(end == -1) end = document.cookie.length;
      cookieValue = document.cookie.substring(offset, end);
    }
  }
  return cookieValue;
};

/*
 * parse the metaweb-user-info cookie
 * based on code from tim k and alee.
 */
fb.parse_metaweb_cookies = function () {
    function _cookieItem(c, i) {
        var s = c.indexOf('|'+i+'_');
        if (s != -1) {
            s = s + 2 + i.length;
            var e = c.indexOf('|',s);
            if (e != -1)
                return decodeURIComponent(c.substr(s,e-s));
        }
        return null;
    }

    mjt.freebase.freebase_user = null;

    // get user info from cookie:
    var cookieInfo = fb.readCookie("metaweb-user-info");
    if (cookieInfo.indexOf('A|') == 0) {
        // Using new cookie format (which is extensible and Unicode-safe)
        // 'g' = User GUID, 'u' = user account name, 'p' = path name of user obj
        // mimic the /type/user schema
        var user = { type: '/type/user' };
        user.id = _cookieItem(cookieInfo, 'p');
        user.guid = _cookieItem(cookieInfo, 'g');
        user.name = _cookieItem(cookieInfo, 'u');
        if (!user.id)
            user.id = user.guid;

        mjt.freebase.freebase_user = user;
    }
};

// run at startup
fb.parse_metaweb_cookies();

fb.FreebaseXhrTask = mjt.define_task(null);

fb.FreebaseXhrTask.prototype.init = function () {
};

fb.FreebaseXhrTask.prototype.xhr_request = function (method, url, content_type, body) {
    url = fb.service_url + url;
    this.xhr = mjt.Xhr(method, url, content_type, body).enqueue();
    this.xhr
        .onready('xhr_ready', this)
        .onerror('xhr_error', this, this.xhr.xhr);
    return this;
};

fb.FreebaseXhrTask.prototype.xhr_form_post = function (url, form) {
    url = fb.service_url + url;
    this.xhr = mjt.XhrFormPost(url, form).enqueue();
    this.xhr
        .onready('xhr_ready', this)
        .onerror('xhr_error', this, this.xhr.xhr);
    return this;
};

fb.FreebaseXhrTask.prototype.request = function () {
};

/**
 * handle responses from XHR requests to the metaweb service.
 * this handles the response envelope.
 */
fb.FreebaseXhrTask.prototype.xhr_ready = function (xhr) {
    // try to parse a json body regardless of status
    var prect = xhr.getResponseHeader('content-type');

    var ct = prect ? prect.replace(/;.*$/, '') : '';
    if (!ct.match(/^(application\/json|text\/javascript|text\/plain)$/))
        return this.error('/user/mjt/messages/json_response_expected',
                          'status: ' + xhr.status + ', content-type: ' + ct,
                          xhr.responseText);

    var o = JSON.parse(xhr.responseText);

    this.envelope = o;

    if (o.code !== '/api/status/ok')
        return this.error(o.code,
                          o.messages[0].message,
                          o.messages[0]);

    return this.ready(o.result);
};

fb.FreebaseXhrTask.prototype.xhr_error = function (xhr, code, msg, info) {
    // try to parse xhr body as JSON
    var errjson = null;
    try {
        errjson = JSON.parse(info);
        var errmsg = errjson.messages[0];
        return this.error(errmsg.code, errmsg.message, errmsg);
    } catch (e) {
        return this.error(code, msg, info);
    }
};


//////////////////////////////////////////////////////////////////////

/**
*  Task for /api/trans/unsafe
*  that is an xhr rather than jsonp task
*
*  @param id  str     the freebase id of the /common/document
*/

fb.TransUnsafe = mjt.define_task(null, [{ name:'id' }]);
                            

fb.TransUnsafe.prototype.xhr_request = function (method, url, content_type, body) {
    url = fb.service_url + url;
    this.xhr = mjt.Xhr(method, url, content_type, body).enqueue();
    this.xhr
        .onready('xhr_ready', this)
        .onerror('xhr_error', this, this.xhr.xhr);
    return this;
};

fb.TransUnsafe.prototype.xhr_ready = function (xhr) {
    var prect = xhr.getResponseHeader('content-type');
    var ct = prect ? prect.replace(/;.*$/, '') : '';
    this.content_type = ct;
    this.responseText = xhr.responseText
    
    return this.ready();
};

fb.TransUnsafe.prototype.xhr_error = function (xhr, code, msg, info) {
    return this.error(code, msg, info);
};

fb.TransUnsafe.prototype.request = function() {
    var path = '/api/trans/unsafe' + this.id;

    return this.xhr_request('GET', path);
};


//////////////////////////////////////////////////////////////////////

fb.MqlWrite = mjt.define_task(fb.FreebaseXhrTask,
                              [{ name: 'query' },
                               { name: 'qenv' , 'default': {}}]);

fb.MqlWrite.prototype.request = function() {
    var qenv = { query: this.query };
    for (var k in this.qenv)
        qenv[k] = this.qenv[k];
    var qstr = JSON.stringify(qenv);

    return this.xhr_form_post('/api/service/mqlwrite',
                              { query: qstr });
};

//////////////////////////////////////////////////////////////////////

/**
 *  mjt.task wrapper for freebase /api/service/touch
 */
// XXX is this still used?  there is a GET version in mjt.freebase.Touch
fb.FlushCache = mjt.define_task(fb.FreebaseXhrTask);

fb.FlushCache.prototype.request = function() {
    return this.xhr_request('POST', '/api/service/touch');
};

fb.FlushCache.prototype.xhr_ready = function (xhr) {
    return this.ready(null);
};


//////////////////////////////////////////////////////////////////////

/**
 *  mjt.task wrapper for freebase file upload service
 */
fb.Upload = mjt.define_task(fb.FreebaseXhrTask,
                          [{ name: 'content_type' },
                           { name: 'body' },
                           { name: 'values' }]);



fb.Upload.prototype.request = function() {
    var path = '/api/service/upload';
    var qargs = mjt.formencode(this.values);
    if (qargs)
        path += '?' + qargs;

    return this.xhr_request('POST', path, this.content_type, this.body);
};


//////////////////////////////////////////////////////////////////////

/**
 *  mjt.task wrapper for freebase signin service
 */

fb.Signin = mjt.define_task(fb.FreebaseXhrTask,
                                  [{ name: 'username' },
                                   { name: 'password' },
                                   { name: 'domain', 'default': null },
                                   { name: 'options', 'default': {} }]);

fb.Signin.prototype.request = function() {
    if (typeof this.username == 'undefined')
        return this.xhr_form_post('/api/account/logout', {});

    var form = { username: this.username,
                 password: this.password };
    if (this.domain !== null)
        form.domain = this.domain;
    for (var k in this.options)
        form[k] = this.options[k];

    return this.xhr_form_post('/api/account/login', form)
        .ondone('clear_password', this);
};

fb.Signin.prototype.clear_password = function() {
    delete this.password;
    return this;
};

//////////////////////////////////////////////////////////////////////


})(mjt, mjt.freebase);
