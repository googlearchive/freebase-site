var mf = acre.require("MANIFEST").MF;
var freebase = mf.require("promise", "apis").freebase;

/**
 * Return a promise to check whether or not user_id is a member of a permission group for topic_id.
 * { 
 *   id: topic_id,
 *   permission: [{
 *     member: [{
 *       id: user_id
 *     }]
 *   }]
 * }
 * 
 * By default, this query will ignore members who belong to a permission group that is part
 * of a domain expert group, unless allow_experts is TRUE.
 * This is a legacy by the freebase client when it tried to distinguish
 * admins vs experts using the same permission model.
 */
function has_permission(topic_id, user_id, allow_experts) {
  var q = {
    id: topic_id,
    permission: {
      optional: true,
      id: null,
      type: "/type/permission",
      permits: [{
        member: [{
          id: user_id
        }]
      }]
    }
  };
  if (!allow_experts) {
    q.permission.permits[0]["!/freebase/domain_profile/expert_group"] = {
      id: null,
      optional: "forbidden"
    };
  }
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || {};
    })
    .then(function(result) {
      return result.permission !== null;
    });
};
