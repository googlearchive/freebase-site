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



var prop_structures = {

  /**
   * A dictionary of static prop_structures using in objectbox
   */

  name: {
    id: "/type/object/name",
    text: "Name",
    lang: "/lang/en",
    expected_type: {
      id: "/type/text",
      text: "Text",
      lang: "/lang/en"
    }
  },

  alias: {
    id: "/common/topic/alias",
    text: "Also known as",
    lang: "/lang/en",
    expected_type: {
      id: "/type/text",
      text: "Text",
      lang: "/lang/en"
    }
  },

  image: {
    id: "/common/topic/image",
    text: "image",
    lang: "/lang/en",
    expected_type: {
      id: "/common/image",
      text: "Image",
      lang: "/lang/en"
    },
    properties: [{
      id: "/type/content/uploaded_by",
      expected_type: {
        id: "/type/user",
        text: "User",
        lang: "/lang/en"
      },
      text: "Uploaded By User",
      lang: "/lang/en"
    }, {
      id: "/common/image/rights_holder_text_attribution",
      expected_type: {
        id: "/type/text",
        text: "Text",
        lang: "/lang/en"
      },
      unique: true,
      text: "Rights holder (text attribution)",
      lang: "/lang/en"
    }, {
      id: "/common/licensed_object/license",
      expected_type: {
        id: "/common/license",
        text: "License",
        lang: "/lang/en"
      },
      text: "License",
      lang: "/lang/en"
    }]
  },

  type: {
    id: "/type/object/type",
    text: "Type",
    lang: "/lang/en",
    expected_type: {
      id: "/type/type",
      text: "Type",
      lang: "/lang/en"
    }
  }




};
