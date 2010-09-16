var mf = acre.require("MANIFEST").mf;
var h = mf.require("core", "helpers");
var i18n = mf.require("i18n", "i18n");

function isTypeType(id) {
  return id.indexOf('/type/') == 0;
}

function isGlobal(id) {
  return id.indexOf('/user/') == -1 &&
         id.indexOf('/guid/') == -1 &&
         id.indexOf('/base/') == -1;
}

/*
    Returns a query string for provided property
*/
function build_query_url(type_id, prop_id) {
  var q = {
    id: null,
    name: null,
    type: type_id
  };
  q[prop_id || "*"] = [];
  q = [q];
  return h.freebase_url("/app/queryeditor", {autorun: true, q: JSON.stringify(q)});
};



function sort_by_id(a,b) {
  return b.id < a.id;
};


