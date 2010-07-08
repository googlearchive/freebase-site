var mf = acre.require("MANIFEST").MF;
var extend = mf.require("core", "helpers_util").extend;

function user_clause(id, badges, options) {
  if (!id) {
    id = null;
  }
  var q = {
    "id": id,
    "name": null,
    "type": "/type/user",
    "/common/topic/image": image_clause({limit:1})
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
