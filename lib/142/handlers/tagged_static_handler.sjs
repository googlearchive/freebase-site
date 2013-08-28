/*
* Copyright 2012, Google Inc.
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
var hh = acre.require("handlers/helpers.sjs");

var generateLastModifiedDate = function (d) {
    function padz(n) {
        return n > 10 ? n : '0' + n;
    }

    var MONTH_NAMES = [
        "January", "February", "March",
        "April", "May", "June",
        "July", "August", "September",
        "October", "November", "December"
    ];

    var WEEKDAY_NAMES = [
        "Sunday", "Monday", "Tuesday",
        "Wednesday", "Thursday", "Friday",
        "Saturday"
    ];

    var dayname = WEEKDAY_NAMES[d.getUTCDay()].slice(0,3);
    var day = padz(d.getUTCDate());
    var monthname = MONTH_NAMES[d.getUTCMonth()].slice(0,3);
    var year = d.getUTCFullYear();
    var hour = padz(d.getUTCHours());
    var minutes = padz(d.getUTCMinutes());
    var seconds = padz(d.getUTCSeconds());

    return dayname+', '+day+' '+monthname+' '+year+' '+hour+':'+ minutes +':'+ seconds+' GMT';
};


var handler = function() {
  return {
    'to_js': function(script) {
      return "var res = ("+JSON.stringify(script.get_content())+");";
    },
    'to_module' : function(compiled_js, script) {
      return compiled_js.res;
    },
    'to_http_response': function(module, script) {
      d = new Date((new Date()).getFullYear(), 0, 1, 0, 0, 0, 0);
      var max_age = 31536000;
      var expires = new Date((new Date()).getTime() + max_age * 1000);
      var headers = {
        expires: expires.toUTCString(),
        "cache-control": "public, max-age=" + max_age,
        "content-type": script.media_type || "text/plain",
        "last-modified" : generateLastModifiedDate(d)
      };
      return hh.to_http_response_result(module.body, headers);
    }
  };
};
