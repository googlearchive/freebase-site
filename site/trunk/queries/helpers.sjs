var mf = acre.require("MANIFEST").MF;
var extend = mf.require("core", "helpers_util").extend;

function user_clause(id, badges, options) {
  if (!id) {
    id = null;
  }
  var q = {
    "id": id,
    "name": null,
    "type": "/type/user"
  };
  if (badges) {
    extend(q, {
       "badges:/type/user/usergroup":  [{
         "key": {"namespace": "/freebase/badges"},
         "id": null,
         "name": null,
         "type": "/type/usergroup",
         "optional": true
       }]
    });
  }
  if (options) {
    extend(q, options);
  }
  return q;
};

function image_clause(options) {
  var q = {
    "optional": true,
    "id": null,
    "name": null,
    "type": "/common/image",
    "limit": 1,
    "link": {"timestamp": null},
    "index": null,
    "sort": ["index","link.timestamp"]
  };
  if (options) {
    extend(q, options);
  }
  return [q];
};

/**
 Generic clause for getting the "/common/topic/article" (or any /common/document)
 of an object.

 if current is true, the only the most recent article is returned
 **/
function article_clause(current, options) {
  var q = {
    "optional": true,
    "id": null
    //"creator": {"id": null, "name": null, "timestamp": null},
    //"/common/document/source_uri": null,
    //"/common/document/content": content_clause()
  };
  if (current) {
    extend(q, {
      "limit": 1,
      "timestamp": null,
      "sort": "-timestamp"
    });
  }
  if (options) {
    extend(q, options);
  }
  return [q];
};


function content_clause(options) {
  var q = {
    "optional": true,
    "id": null,
    "name": null,
    "limit": 1,
    "/type/content/blob_id": null,
    "/type/content/media_type": null,
    "/type/content/text_encoding": null,
    "/type/content/length": null,
    "/type/content/language": null
  };
  if (options) {
    extend(q, options);
  }
  return q;
};

