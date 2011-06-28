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
acre.require('/test/lib').enable(this);

var o = acre.require("queries/object.sjs");

test("text_lang_sort", function() {

  var texts = [{
    lang: "/lang/zh"  // Chinese
  },{
    lang: "/lang/en"  // English
  },{
    lang: "/lang/ko"  // Korean
  }];


  same(texts.sort(function(a, b) { return o.text_lang_sort(a, b, "/lang/en"); }),
       [{lang:"/lang/en"}, {lang:"/lang/ko"}, {lang:"/lang/zh"}]);
  same(texts.sort(function(a, b) { return o.text_lang_sort(a, b, "/lang/zh"); }),
       [{lang:"/lang/zh"}, {lang:"/lang/en"}, {lang:"/lang/ko"}]);
  same(texts.sort(function(a, b) { return o.text_lang_sort(a, b, "/lang/ko"); }),
       [{lang:"/lang/ko"}, {lang:"/lang/en"}, {lang:"/lang/zh"}]);

  same(texts.sort(function(a, b) { return o.text_lang_sort(a, b, "/lang/en", true); }),
       [{lang:"/lang/en"}, {lang:"/lang/zh"}, {lang:"/lang/ko"}]);
  same(texts.sort(function(a, b) { return o.text_lang_sort(a, b, "/lang/zh", true); }),
       [{lang:"/lang/zh"}, {lang:"/lang/en"}, {lang:"/lang/ko"}]);
  same(texts.sort(function(a, b) { return o.text_lang_sort(a, b, "/lang/ko", true); }),
       [{lang:"/lang/ko"}, {lang:"/lang/en"}, {lang:"/lang/zh"}]);

  texts = [{
      lang: "/lang/en",
      value: "d"
    },{
      lang: "/lang/en",
      value: "b"
    },{
      lang: "/lang/zh",
      value: "a"
    },{
      lang: "/lang/ko",
      value: "c"
    },{
      lang: "/lang/ko",
      value: "z"
    },{
      lang: "/lang/ko",
      value: "y"
    }, {
      lang: "/lang/et",
      value: "w"
    }];

  same(texts.sort(function(a, b) { return o.text_lang_sort(a, b, "/lang/en"); }),
       [{lang:"/lang/en", value:"b"}, {lang:"/lang/en", value:"d"},
        {lang:"/lang/et", value:"w"},
        {lang:"/lang/ko", value:"c"}, {lang:"/lang/ko", value:"y"}, {lang:"/lang/ko", value:"z"},
        {lang:"/lang/zh", value:"a"}]);

  same(texts.sort(function(a, b) { return o.text_lang_sort(a, b, "/lang/ko"); }),
       [{lang:"/lang/ko", value:"c"}, {lang:"/lang/ko", value:"y"}, {lang:"/lang/ko", value:"z"},
        {lang:"/lang/en", value:"b"}, {lang:"/lang/en", value:"d"},
        {lang:"/lang/et", value:"w"},
        {lang:"/lang/zh", value:"a"}]);

  same(texts.sort(function(a, b) { return o.text_lang_sort(a, b, "/lang/en", true); }),
       [{lang:"/lang/en", value:"b"}, {lang:"/lang/en", value:"d"},
        {lang:"/lang/et", value:"w"},
        {lang:"/lang/zh", value:"a"},
        {lang:"/lang/ko", value:"c"}, {lang:"/lang/ko", value:"y"}, {lang:"/lang/ko", value:"z"}]);

  same(texts.sort(function(a, b) { return o.text_lang_sort(a, b, "/lang/zh", true); }),
       [{lang:"/lang/zh", value:"a"},
        {lang:"/lang/en", value:"b"}, {lang:"/lang/en", value:"d"},
        {lang:"/lang/et", value:"w"},
        {lang:"/lang/ko", value:"c"}, {lang:"/lang/ko", value:"y"}, {lang:"/lang/ko", value:"z"}]);
});

acre.test.report();
