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

function name_sort_asc(a,b) {
  if (a.name) {
    return a.name.localeCompare(b.name);
  } else {
    return 0;
  }
} 

function name_sort_desc(a,b) {  
  if (b.name) {
    return b.name.localeCompare(a.name);
  } else {
    return 0;
  }
} 

function id_sort_asc(a,b) {  
  return a.id.localeCompare(b.id);
} 

function id_sort_desc(a,b) {  
  return b.id.localeCompare(a.id);
} 

function types_sort_asc(a,b) {  
  return a.type_count - b.type_count;
}

function types_sort_desc(a,b) {  
  return b.type_count - a.type_count;
}

function properties_sort_asc(a,b) {  
  return a.properties.length - b.properties.length;
}

function properties_sort_desc(a,b) {  
  return b.properties.length - a.properties.length;
} 

function instances_sort_asc(a,b) {  
  return a.instance_count - b.instance_count;
}

function instances_sort_desc(a,b) {  
  return b.instance_count - a.instance_count;
}  

function creation_sort_asc(a,b) {  
  return datejs.Date.compare(a.date,b.date);
}

function creation_sort_desc(a,b) {  
  return datejs.Date.compare(b.date,a.date);
}