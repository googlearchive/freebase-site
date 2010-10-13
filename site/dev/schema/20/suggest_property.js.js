/**
 * A specialize suggest plugin for properties.
 */
;(function($) {

  if (!$.suggest) {
    alert("$.suggest required");
  }

  var base = {
    create_item: $.suggest.suggest.prototype.create_item
  };

  $.suggest("suggest_property",
    $.extend(true, {}, $.suggest.suggest.prototype, {
      create_item: function(data, response_data) {
        var li = base.create_item.apply(this, [data, response_data]);
        var type = data.id.split("/");
        type.pop();
        type = type.join("/");
        $("."+this.options.css.item_type, li).text(type);
        return li;
      }
    }));

    $.extend($.suggest.suggest_property, {
      defaults: $.extend(true, {}, $.suggest.suggest.defaults, {
        type: "/type/property",
        type_strict: "any"
      })
    });

})(jQuery);
