function commaFormatInteger(SS) {
  if (isNaN(parseInt(SS)) || SS==0) {return "-";}
  var T = "", S = String(SS), L = S.length - 1, C, j;
  for (j = 0; j <= L; j++) {
    T += C = S.charAt(j);
    if (j < L && (L - j) % 3 == 0 && C != "-") {
      T += ",";
    }
  }
  return T;
};

function isTypeType(id) {
  return id.indexOf('/type/') == 0;
}

function isGlobal(id) {
  return id.indexOf('/user/') == -1 && 
         id.indexOf('/guid/') == -1 &&
         id.indexOf('/base/') == -1;
}

function fix_id(o) {
//  if ("key" in o && o.key.length >  0) {
//    var v = o.key[o.key.length - 1];
//    o.id = v.namespace + '/' + v.value;
//  }
  return o;
}

function get_prop_query(p, t) {
  console.log("property is: ", p);
  var q = [{
    "id": null,
    "name": null,
    "type": t,
  }];
  
  q[p] = [];
  
  return "http://www.freebase.com/app/queryeditor?autorun=true&q=" + encodeURIComponent(JSON.stringify(q));
    
}