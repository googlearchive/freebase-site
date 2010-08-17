
;(function($) {

  if (!$.suggest) {
    alert("$.suggest required");
  }

  var base = {
    _init: $.suggest.suggest.prototype._init,
    status_start: $.suggest.suggest.prototype.status_start,
    status_loading: $.suggest.suggest.prototype.status_loading,
    status_select: $.suggest.suggest.prototype.status_select
  };

  function noop_false() {
    return false;
  };

  $.suggest("suggest_expected_type",
    $.extend(true, {}, $.suggest.suggest.prototype, {

      _init: function() {
        var self = this;
        var o = this.options;
        // call super._init()
        base._init.call(self);

        this.ect = $('<div class="ect-menu-dialog"><span>or choose from the data types below</span></div>');
        this.ect_list = $('<ul class="ect-menu clear">');
        $.each(['text', 'numeric', 'date', 'boolean', 'image', 'weblink', 'address'], function(i,type) {
          self.ect_list.append(self["create_ect_" + type].call(self));
        });
        this.ect.append(this.ect_list);
        this.ect.bind("ect", function(e, data) {
          self.input.val(data.name)
              .data("data.suggest", data)
              .trigger("fb-select", data);
          // hide all menus
          $(".trigger", this).each(function() {
            var tooltip = $(this).data("tooltip");
            if (tooltip) {
              tooltip.hide();
            }
          });
          self.hide_all();
        });
        this.pane.append(this.ect);
      },

      status_start: function(response_data, start, first) {
        base.status_start.apply(this);
        this.ect.show();
      },

      status_loading: function(response_data, start, first) {
        base.status_loading.apply(this);
        this.ect.hide();
      },

      status_select: function() {
        base.status_select.apply(this);
        this.ect.hide();
      },

      create_ect_text: function() {
        var li = this.create_ect_item("Text");
        var tips = [
          {name:"Short Text Input", id:"/type/text"},
          {name:"Machine readable string", id:"/type/rawstring"}
        ];
        $("> a", li).after(this.create_ect_tooltip(tips)).tooltip(this.options.tooltip_options);
        return li;
      },

      create_ect_numeric: function() {
        var li = this.create_ect_item("Numeric");
        var tips = [
          {name:"Integer", id:"/type/int"},
          {name:"Decimal point number", id:"/type/float"},
          {name:"Measurement", id:"/type/float"},
          {name:"Dated Currency", id:"/measurement_unit/dated_money_value"},
          {name:"Dated Integer", id:"/measurement_unit/dated_integer"},
          {name:"Dated Decimal Point Number", id:"/measurement_unit/dated_float"},
          {name:"Integer Range", id:"/measurement_unit/integer_range"},
          {name:"Decimal Point Number Range", id:"/measurement_unit/floating_point_range"}
        ];
        $("> a", li).after(this.create_ect_tooltip(tips)).tooltip(this.options.tooltip_options);
        return li;
      },

      create_ect_date: function() {
        var li = this.create_ect_item("Date/Time", "date");
        var tips = [
          {name:"Date/Time", id:"/type/datetime"},
          {name:"Day of Week", id:"/time/day_of_week"},
          {name:"Date of Year", id:"/time/day_of_year"},
          {name:"Time interval", id:"/measurement_unit/time_interval"}
        ];
        $("> a", li).after(this.create_ect_tooltip(tips)).tooltip(this.options.tooltip_options);
        return li;
      },

      create_ect_boolean: function() {
        var li = this.create_ect_item("Boolean");
        $("> a", li)
          .data("ect", {name:"Boolean", id:"/type/boolean"})
          .click(function() {
            $(this).trigger("ect", $(this).data("ect"));
          });
        return li;
      },

      create_ect_image: function() {
        var li = this.create_ect_item("Image");
        $("> a", li)
          .data("ect", {name:"Image", id:"/common/image"})
          .click(function() {
           $(this).trigger("ect", $(this).data("ect"));
          });
        return li;
      },

      create_ect_weblink: function() {
        var li = this.create_ect_item("Weblink");
        $("> a", li)
          .data("ect", {name:"Weblink", id:"/common/webpage"})
          .click(function() {
            $(this).trigger("ect", $(this).data("ect"));
          });
        return li;
      },

      create_ect_address: function() {
        var li = this.create_ect_item("Address");
        $("> a", li)
          .data("ect", {name:"Address", id:"/location/mailing_address"})
          .click(function() {
            $(this).trigger("ect", $(this).data("ect"));
          });
        return li;
      },

      create_ect_item: function(name, cname) {
        if (!cname) {
          cname = name.toLowerCase();
        }
        var li = $('<li class="ect-menu-item">');
        var trigger = $('<a href="javascript:void(0);" class="ect-icon trigger">');
        trigger.addClass("ect-" + cname);
        li.append(trigger);
        li.append(document.createTextNode(name));
        return li;
      },

      create_ect_tooltip: function(tips) {
        var ul = $('<ul class="row-menu tooltip">');
        $.each(tips, function(i,tip) {
          var li = $('<li class="row-menu-item">');
          var trigger = $('<a href="javascript:void(0);">').attr("title", tip.id)
            .data("ect", tip)
            .click(function() {
              $(this).trigger("ect", $(this).data("ect"));
            });
          trigger.text(tip.name);
          li.append(trigger);
          ul.append(li);
        });
        return ul;
      }

    }));

    $.extend($.suggest.suggest_expected_type, {
        defaults:  $.extend(true, {}, $.suggest.suggest.defaults, {
          tooltip_options: {
            events: {def: "click,mouseout"},
            position: "bottom right",
            offset: [-10, -10],
            effect: "fade",
            delay: 300,
            relative: true
          }
        })
    });

})(jQuery);
