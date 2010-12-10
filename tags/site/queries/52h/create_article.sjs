var mf = acre.require("MANIFEST").mf;
var freebase = mf.require("promise", "apis").freebase;
var h = mf.require("core", "helpers");

/**
 * Create a /common/document and optionally attach to a topic by the /common/topic/article property.
 *
 * @param content (string, required) - The content to upload.
 * @param content_type (string, required) - The MIME type of the content.
 * @param options (obj, optional) - Custom key/value options for the upload service
 *   - use_permission_of (string, optional) - ID for the object whose permission the
 *                                            /common/document object should have.
 *   - topic (string, optional) - ID for the object to which the /common/document object
 *                                should be linked by "/common/topic/article"
 *   - lang (string, optional) - lang ID (i.e., /lang/en)
 */
function create_article(content, content_type, options) {
  options = options || {};
  var q = {
    id: null,
    type: "/common/document",
    create: "unconditional"
  };
  return freebase.mqlwrite(q, options)
    .then(function(env) {
      return env.result;
    })
    .then(function(doc) {
      return upload(content, content_type, h.extend({}, options, {document:doc.id}))
        .then(function(uploaded) {
          h.extend(doc, {"/common/document/content": uploaded});
          return doc;
        });
    })
    .then(function(doc) {
      if (options.topic) {
        q = {
          id: options.topic,
          "/common/topic/article": {
            id: doc.id,
            connect: "insert"
          }
        };
        return freebase.mqlwrite(q)
          .then(function() {
            return doc;
          });
      }
      return doc;
    });
};

/**
 * Upload new content.
 * If options.lang is specified, this will set /type/content/language on the uploaded content.
 */
function upload(content, content_type, options) {
  options = options || {};
  return freebase.upload(content, content_type, options)
    .then(function(env) {
      return env.result;
    })
    .then(function(uploaded) {
      if (options.lang) {
        // upload service does not accept content-language parameter
        var q = {
          id: uploaded.id,
          "/type/content/language": {id:options.lang, connect:"update"}
        };
        return freebase.mqlwrite(q)
          .then(function() {
            uploaded["/type/content/language"] = options.lang;
            return uploaded;
          });
      }
      else {
        return uploaded;
      }
    });
};
