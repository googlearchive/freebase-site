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
var _ = i18n.gettext;

function prop_metadata(prop) {
  var md = {
    p: h.extend({}, prop),   // prop schema/structure
    m: []                   // menu data
  };
  // delete values from schema
  delete md.p.values;
  // prop menu
  var add_item = {
    attrs: {
      href: "#"
    }
  };
  if (prop.unique && prop.values.length) {
    add_item.text = _("Edit value");
    add_item.attrs.onclick = "return freebase.dispatch(event, freebase.topic.prop_edit, null, this);";
    add_item.action = "prop_edit";
  }
  else {
    add_item.text = _("Add new value");
    add_item.attrs.onclick = "return freebase.dispatch(event, freebase.topic.prop_add, null, this);";
    add_item.action = "prop_add";
  }
  md.m.push(add_item);
  md.m.push({
    text: _("Inspect Property"),
    attrs: {
      href: h.fb_url("/inspect", prop.id)
    }
  });
  md.m.push({
    text: _("View schema"),
    attrs: {
      href: h.fb_url("/schema", prop.id)
    }
  });
  return md;
};


function value_metadata(value) {
  var md = {
    v: value.id || value.value,
    m: [{                // menu data
      text: _("Edit"),
      action: "value_edit",
      attrs: {
        href: "#",
        onclick: "return freebase.dispatch(event, freebase.topic.value_edit, null, this);"
      }
    },{
      text: _("Delete"),
      attrs: {
        href: "#",
        onclick: "return freebase.dispatch(event, freebase.topic.value_delete, null, this);"
      }
    }]
  };
  return md;
};
