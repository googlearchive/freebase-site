var exports = {
  "tag": tag
};

function tag(tagname, content) {
  var markup = ["<"+tagname];
  if (arguments.length > 2) {
    var attrs = [""];
    for (var i=2,l=arguments.length; i<l; i+=2) {
      attrs.push(arguments[i] + "=\"" + arguments[i+1] + "\"");
    }
    markup.push(attrs.join(" "));
  }
  markup.push(">");
  markup.push(content);
  markup.push("</"+tagname+">");
  return markup.join("");
};
