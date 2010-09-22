var exports = {
  "tag": tag
};

/**
 * Convenient html markup generator since you cannot use markup tags inside ${..}
 *
 * For example:
 *
 * ${h.bless_sprintf("Hello %s", h.tag("span", "World", "class", "foo"))}
 *
 * outputs:
 *
 * Hello <span class="foo">World</span>
 */
function tag(tagname, content/**, attr_name1, attr_value1, attr_name2, attr_name2, ... **/) {
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
