var mf = acre.require("MANIFEST").mf;
var freebase = mf.require("promise", "apis").freebase;
var h = mf.require("core", "helpers");
var create_article = mf.require("create_article");

/**
 * Update or create a /common/document and optionally attach to a topic by the /common/topic/article property.
 *
 * @param content (string, required) - The content to upload.
 * @param content_type (string, required) - The MIME type of the content.
 * @param options (obj, optional) - Custom key/value options for the upload service
 *   - article (String, optional) - Id of exisiting article to update.
 *   - use_permission_of (string, optional) - ID for the object whose permission the
 *                                            /common/document object should have.
 *   - topic (string, optional) - ID for the object to which the /common/document object
 *                                should be linked by "/common/topic/article"
 *   - lang (string, optional) - lang ID (i.e., /lang/en)
 *
 */
function update_article(content, content_type, options) {

  options = options || {};

  if (options.article) {
    return freebase.upload(content, content_type, {document:options.article})
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
              return options.article;
            });
        }
        else {
          return options.article;
        }
      });
  }
  else {
    return create_article.create_article(content, content_type, options);
  }
};
