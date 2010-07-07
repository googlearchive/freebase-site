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


function sort(list, kind, dir) {
  var kinds = {
    "id" : {
      "key" : "id",
      "sort" : "text",
    },
    "types" : {
      "key" : "type_count",
      "sort" : "number"
    },
    "properties" : {
      "key" : "properties",
      "sort" : "length"
    },
    "instances" : {
      "key" : "instance_count",
      "sort" : "number"
    },
    "creation" : {
      "key" : "date",
      "sort" : "date"
    },
    "name" : {
      "key" : "name",
      "sort" : "text"
    }
  };
  
  function compare(a, b, kind) {
    var k = kinds[kind];
    
    switch (k.sort) {
      case "number" :
        return  a[k.key] - b[k.key];
      case "date" :
        return datejs.Date.compare(a[k.key],b[k.key]);
      case "length" :
        return a[k.key].length - b[k.key].length;
      case "text" :
      default :
        return a[k.key].localeCompare([k.key]);
    }
  };
  
  return list.sort(function(a, b) {
    if (dir === "asc") {
      return compare(a, b, kind);
    } else {
      return compare(b, a, kind);
    }
  });
};