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
var h = acre.require("lib/helper/helpers.sjs");
var i18n = acre.require("lib/i18n/i18n.sjs");

function prop_schema(options, lang) {
  return h.extend({
    id: null,
    name: i18n.mql.text_clause(lang),
    type: "/type/property",
    unique: null,
    unit: {
      optional: true,
      type: "/type/unit",
      "/freebase/unit_profile/abbreviation": null
    },
    master_property: {
      optional: true,
      id: null,
      type: "/type/property"
    },
    reverse_property: {
      optional: true,
      id: null,
      type: "/type/property"
    },
    expected_type: {
      id: null,
      name: i18n.mql.text_clause(lang),
      type: "/type/type",
      "/freebase/type_hints/enumeration": null,
      "/freebase/type_hints/mediator": null,
      "/freebase/type_hints/included_types": [],
      properties: [{
        optional: true,
        id: null,
        name: i18n.mql.text_clause(lang),
        index: null,
        sort: "index",
        unique: null,
        unit: {
          optional: true,
          type: "/type/unit",
          "/freebase/unit_profile/abbreviation": null
        },
        "/freebase/property_hints/disambiguator": true,
        "/freebase/property_hints/display_none": {
          optional: "forbidden",
          value: true
        },
        master_property: {
          optional: true,
          id: null,
          type: "/type/property"
        },
        reverse_property: {
          optional: true,
          id: null,
          type: "/type/property"
        },
        expected_type: {
          id: null,
          name: i18n.mql.text_clause(lang),
          type: "/type/type",
          "/freebase/type_hints/enumeration": null,
          "/freebase/type_hints/mediator": {
            optional: "forbidden",
            value: true
          },
          "/freebase/type_hints/included_types": []
        },
        "forbid:expected_type": {
          optional: "forbidden",
          "id|=": [
            "/common/document", "/common/image",
            "/type/id", "/type/key", "/type/value", "/type/mid"
          ],
          limit: 0
        }
      }]
    }
  }, options);
};




