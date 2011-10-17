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


(function () {

// jQuery-style api for leaving the global namespace undisturbed.
//  note json2.js is not so well behaved.
var _mjt = window.mjt;
var mjt = window.mjt = {};
mjt.noConflict = function () {
    window.mjt = _mjt;
    return mjt;
};

// old:
//if (typeof mjt == 'undefined')
// mjt = {};

mjt.NAME = 'mjt';
mjt.VERSION = '0.9.3';
mjt.LICENSE =
"========================================================================\n"+
"Copyright (c) 2007-2009, Metaweb Technologies, Inc.\n"+
"All rights reserved.\n"+
"\n"+
"Redistribution and use in source and binary forms, with or without\n"+
"modification, are permitted provided that the following conditions\n"+
"are met:\n"+
"    * Redistributions of source code must retain the above copyright\n"+
"      notice, this list of conditions and the following disclaimer.\n"+
"    * Redistributions in binary form must reproduce the above\n"+
"      copyright notice, this list of conditions and the following\n"+
"      disclaimer in the documentation and/or other materials provided\n"+
"      with the distribution.\n"+
"\n"+
"THIS SOFTWARE IS PROVIDED BY METAWEB TECHNOLOGIES ``AS IS'' AND ANY\n"+
"EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\n"+
"IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR\n"+
"PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL METAWEB TECHNOLOGIES BE\n"+
"LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR\n"+
"CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF\n"+
"SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR\n"+
"BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,\n"+
"WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE\n"+
"OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN\n"+
"IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n"+
"========================================================================\n";

})();
