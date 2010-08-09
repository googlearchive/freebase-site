acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var freebase = mf.require("promise", "apis").freebase;
var create_type = acre.require("create_type").create_type;
var delete_type = acre.require("delete_type").delete_type;

// this test requires user to be logged in
var user = acre.freebase.get_user_info();

test("login required", function() {
  ok(user, "login required");
});

if (!user) {
  acre.test.report();
  acre.exit();
}

var counter = 0;
function get_name() {
  return  [user.username, user.transaction_id, counter++].join("_");
};

test("delete_type", function() {

  var type;
  var name = get_name();
  create_type({
    domain: user.id + "/default_domain",
    name: name,
    key: name,
    mqlkey_quote: true
  })
  .then(function(r) {
    type = r;
  });
  acre.async.wait_on_results();
  ok(type.id, type.id);

  var info, result;
  delete_type(type.id, user.id)
    .then(function([type_info, delete_result]) {
      info = type_info;
      result = delete_result;
    });
  acre.async.wait_on_results();
  ok(result);

  ok(result.type.id === "/type/type" &&
     result.type.connect === "deleted", "type link deleted: " + type.id);

  ok(result.key[0].value === type.key.value &&
     result.key[0].namespace === type.key.namespace &&
     result.key[0].connect === "deleted", "key deleted: " + type.key.value);

  ok(result.domain.id === type.domain.id &&
     result.domain.connect === "deleted", "domain link deleted: " + type.domain.id);
});

acre.test.report();
