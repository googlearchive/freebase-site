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

var freebase = acre.require("lib/promise/apis").freebase;

var images = function(id, limit) {
  limit = limit || 10;

  var q = [{
    mid: null,
    name: null,
    "/common/image/rights_holder_text_attribution": null,
    "/type/content/uploaded_by": {
      id: null,
      name: null,
      optional: true
    },
    "/common/licensed_object/license": {
      id: null,
      name: null,
      optional: true
    },
    "creator": {
      id: null,
      name: null
    },
    "/common/image/appears_in_topic_gallery": {
      id: id
    },
    limit: limit
  }];

  return freebase.mqlread(q)
    .then(function(envelope){
      var images = [];

      envelope.result.forEach(function(img){
        var image = {
          id: img.mid,
          name: img.name,
          rights_holder: img["/common/image/rights_holder_text_attribution"],
          license: img["/common/licensed_object/license"]
        };

        if (img["/type/content/uploaded_by"]) {
          image.creator = img["/type/content/uploaded_by"];
        }
        else {
          image.creator = img.creator;
        }
        images.push(image);
      });

      return images;
    });
};

var _link_compare_key = function(link) {
 // proper order should be official, template, topic, uri
 if (link.template && link.category) {
   var cat = link.category.id;

   if (cat === '/common/annotation_category/official_website') {
     return 0;
   } else if (cat === '/common/annotation_category/topic_webpage') {
     return 2;
   } else if (link.template && link.template.ns !== '/uri') {
     return 1;
   }
 }

 return 3;
};

var weblinks = function(id, namespace) {
 var q = {
   "id": id,
   "/common/topic/weblink": [{
     "optional": true,
     "category": {
       "id": null,
       "name": null,
       "optional": true
     },
     "url": null,
     "description": null,
     "template": {
       "id": null,
       "name": null,
       "a:ns": {
         "id": '/wikipedia/en',
         "optional": 'forbidden'
       },
       "ns": null
     },
     "key": null
   }]
 };

 if (namespace) {
   q['/common/topic/weblink'][0]['template']['b:ns'] = {'id': namespace};
 }

 return freebase.mqlread(q, {extended:1})
   .then(function(envelope) {
     if (!envelope.result) {
       return [];
     }

     var links = envelope.result['/common/topic/weblink'] || [];
     //links.sort(key=link_compare_key);
     return links;
   });
};
