acre.require('/test/lib').enable(this);

var h = acre.require("lib/helper/helpers.sjs");
var q = acre.require("queries.sjs");

acre.require("lib/test/mock").playback(this, "test/playback_test_queries.json");

test("app", function() {
  var type = "/freebase/apps/acre_app";
  var groups;
  q.object_usergroups("/user/jdouglas/acre", type)
    .then(function(r) {
      groups = r;
    });
  acre.async.wait_on_results();
  ok(h.isArray(groups) && groups.length, "Got usergroups");
  var users = h.map_array(groups[0]["users"], "id");
  var user = users["/user/jdouglas"];
  ok(user, "Got user jdouglas");
  ok(user.groups[0].type == type, "Got correct type");
});

test("domain", function() {
  var type = "/freebase/domain_profile";
  var groups;
  q.object_usergroups("/film", type)
    .then(function(r) {
      groups = r;
    });
  acre.async.wait_on_results();
  ok(h.isArray(groups) && groups.length, "Got usergroups");
  var users = h.map_array(groups[0]["users"], "id");
  var user = users["/user/jon"];
  ok(user, "Got user jon");
  ok(user.groups[0].type == type, "Got correct type");
});

test("usergroup", function() {
  var groups;
  q.object_usergroups("/boot/schema_group", "/type/usergroup")
    .then(function(r) {
      groups = r;
    });
  acre.async.wait_on_results();
  ok(h.isArray(groups) && groups.length, "Got usergroups");
  var users = h.map_array(groups[0]["users"], "id");
  var user = users["/user/superalecf"];
  ok(user, "Got user superalecf");
});

acre.test.report();
