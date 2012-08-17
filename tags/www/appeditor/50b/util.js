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

/*global mjt $ */

// util.js is for utilitiy functions which have no dependancies on App Editor


////////////////////
//                //
//     Assert     //
//                //
////////////////////

var assert = {};

/**
  * assert.critical(cond,message) - if (!cond) show the message and provide a link to report_problem
  *    For situations where continuing is only going to make things worse.
  *    The critical error dialog box is displayed without dependancies on mjt or jQuery
  *    Only one critical error is shown at a time (futher errors sent to mjt.error if possible)
**/
assert.critical = function(cond,message) {
    if (cond) { return; }
    // else

    // https://bugs.webkit.org/show_bug.cgi?id=20141 breaks the following code on Safari
    //   var error_func = ((window.mjt || {}).error)  ||  ((window.console || {}).error)  ||  (function() {});
    // so we have to do it the ugly way:
    if (typeof mjt !== "undefined" && mjt.error) {
        mjt.error('Internal Error: '+message);
    } else {
        if (typeof console !== "undefined" && console.error) {
            console.error('Internal Error: '+message);
        }
    }
    if (document.getElementById('error-dialog')) { return; } // only show one dialog box
    var html = '';
    html += '<div style="font-weight:bold;">Internal Error</div>';
    html += message;
    assert.error_dialog(html);
    //TODO: maybe this is too brutal? perhaps the user can continue?
    //throw 'assert.critical failed: '+message;
    
};

//Make the error box appear in the center of the page
assert.error_dialog = function(message_html) {
    var close_html = '<div id="error-dialog" style="float:right; color: #1170a3; margin: -10px -5px 0 0; cursor: pointer;" onclick="document.body.removeChild(this.parentNode);">x</div>';
    var div = document.createElement('div');
    div.style.cssText = 'position: absolute; top: 30px; left: 50%; width: 350px; margin: 0 0 0 -175px; padding: 15px; background-color: #fce2db; border: 1px solid #f3c5ac; color: #676767; font-size: 12px; z-index: 100;';
    div.innerHTML = close_html + message_html;
    document.body.appendChild(div);
};


////////////////////////
//                    //
//   Unicode output   //
//                    //
////////////////////////

var unicode = {};

unicode.escape_char = function(aChar) {
    var hex = aChar.charCodeAt(0).toString(16).toUpperCase();
    if (hex.length===1) { return "\\u000"+hex; }
    if (hex.length===2) { return "\\u00" +hex; }
    if (hex.length===3) { return "\\u0"  +hex; }
    if (hex.length===4) { return "\\u"   +hex; }
    return null;
};

// Escape everything outside of Basic Latin + the control chars 0 - 1f
// http://www.fileformat.info/info/unicode/block/basic_latin/list.htm
unicode.escape_str = function(str) {
    return str.replace( /[^\u0020-\u007F]/g, unicode.escape_char ); // from SPACE to ~ is OK
};
