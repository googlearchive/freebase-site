var util = acre.require("util");
var host = util.get_doc_host(); //XXX: do I still need this?

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
      "content": host + "/web_service/en/api_status"
    },
    {
      "name": "Version",
      "key": "version",
      "content": host + "/web_service/en/api_version"
    },
    {
      "name": "Touch",
      "key": "touch",
      "content": host + "/web_service/en/api_service_touch"
    },
    {
      "name": "Login",
      "key": "login",
      "content": host + "/web_service/en/api_account_login"
    },
    {
      "name": "Logout",
      "key": "logout",
      "content": host + "/web_service/en/api_account_logout"
    },
    {
      "name": "User Info",
      "key": "user_info",
      "content": host + "/web_service/guid/9202a8c04000641f800000000c36a842"
    },
    {
      "name": "MQL Read",
      "key": "mqlread",
      "content": host + "/web_service/en/api_service_mqlread"
    },
    {
      "name": "MQL Write",
      "key": "mqlwrite",
      "content": host + "/web_service/en/api_service_mqlwrite"
    },
    {
      "name": "Search",
      "key": "search",
      "content": acre.freebase.service_url + "/api/service/search?help"
    },
    {
      "name": "Raw Content",
      "key": "trans_raw",
      "content": host + "/web_service/en/api_trans_raw"
    },
    {
      "name": "Blurb Content",
      "key": "trans_blurb",
      "content": host + "/web_service/en/api_trans_blurb"
    },
    {
      "name": "Image Thumbnailing",
      "key": "image_thumb",
      "content": host + "/web_service/en/api_trans_image_thumb"
    },
    {
      "name": "Upload",
      "key": "upload",
      "content": host + "/web_service/en/api_service_upload"
    },
    {
      "name": "URI Content Upload",
      "key": "uri_submit",
      "content": host + "/web_service/en/api_service_uri_submit"
    },
    {
      "name": "Form Content Upload",
      "key": "form_upload",
      "content": host + "/web_service/en/api_service_form_upload"
    },
    {
      "name": "Form Image Upload",
      "key": "form_upload_image",
      "content": host + "/web_service/en/api_service_form_upload_image"
    },
    {
      "name": "URI Image Upload",
      "key": "uri_submit_image",
      "content": host + "/web_service/en/api_service_uri_submit_image"
    },
    {
      "name": "Create Private Domain",
      "key": "create_private_domain",
      "content": host + "/web_service/en/api_service_create_private_domain"
    },
    {
      "name": "Delete Private Domain",
      "key": "delete_private_domain",
      "content": host + "/web_service/en/api_service_delete_private_domain"
    },
    {
      "name": "Create Group",
      "key": "create_group",
      "content": host + "/web_service/en/api_create_group"
    }
  ],
  "status": "200 OK"
};

if (acre.current_script == acre.request.script) {
  acre.write(JSON.stringify(contents, null, 2));
}
