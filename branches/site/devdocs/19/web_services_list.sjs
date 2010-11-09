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

var util = acre.require("util");
var docs_base = acre.request.app_url + "/docs";

var contents = {
  "contents": [
    {
      "name": "Common API",
      "key": "common",
      "content": acre.freebase.service_url + "/api/trans/raw/guid/9202a8c04000641f8000000008cb1a36"
    },
    {
      "name": "Status",
      "key": "status",
      "content": docs_base + "/web_service/en/api_status"
    },
    {
      "name": "Version",
      "key": "version",
      "content": docs_base + "/web_service/en/api_version"
    },
    {
      "name": "Touch",
      "key": "touch",
      "content": docs_base + "/web_service/en/api_service_touch"
    },
    {
      "name": "Login",
      "key": "login",
      "content": docs_base + "/web_service/en/api_account_login"
    },
    {
      "name": "Logout",
      "key": "logout",
      "content": docs_base + "/web_service/en/api_account_logout"
    },
    {
      "name": "User Info",
      "key": "user_info",
      "content": docs_base + "/web_service/guid/9202a8c04000641f800000000c36a842"
    },
    {
      "name": "MQL Read",
      "key": "mqlread",
      "content": docs_base + "/web_service/en/api_service_mqlread"
    },
    {
      "name": "MQL Write",
      "key": "mqlwrite",
      "content": docs_base + "/web_service/en/api_service_mqlwrite"
    },
    {
      "name": "Search",
      "key": "search",
      "content": acre.freebase.service_url + "/api/service/search?help"
    },
    {
      "name": "Geosearch",
      "key": "geosearch",
      "content": acre.freebase.service_url + "/api/service/geosearch?help"
    },
    {
      "name": "Raw Content",
      "key": "trans_raw",
      "content": docs_base + "/web_service/en/api_trans_raw"
    },
    {
      "name": "Blurb Content",
      "key": "trans_blurb",
      "content": docs_base + "/web_service/en/api_trans_blurb"
    },
    {
      "name": "Image Thumbnailing",
      "key": "image_thumb",
      "content": docs_base + "/web_service/en/api_trans_image_thumb"
    },
    {
      "name": "Upload",
      "key": "upload",
      "content": docs_base + "/web_service/en/api_service_upload"
    },
    {
      "name": "URI Content Upload",
      "key": "uri_submit",
      "content": docs_base + "/web_service/en/api_service_uri_submit"
    },
    {
      "name": "Form Content Upload",
      "key": "form_upload",
      "content": docs_base + "/web_service/en/api_service_form_upload"
    },
    {
      "name": "Form Image Upload",
      "key": "form_upload_image",
      "content": docs_base + "/web_service/en/api_service_form_upload_image"
    },
    {
      "name": "URI Image Upload",
      "key": "uri_submit_image",
      "content": docs_base + "/web_service/en/api_service_uri_submit_image"
    },
    {
      "name": "Create Private Domain",
      "key": "create_private_domain",
      "content": docs_base + "/web_service/en/api_service_create_private_domain"
    },
    {
      "name": "Delete Private Domain",
      "key": "delete_private_domain",
      "content": docs_base + "/web_service/en/api_service_delete_private_domain"
    },
    {
      "name": "Create Group",
      "key": "create_group",
      "content": docs_base + "/web_service/en/api_create_group"
    }
  ],
  "status": "200 OK"
};

if (acre.current_script == acre.request.script) {
  acre.write(JSON.stringify(contents, null, 2));
}
