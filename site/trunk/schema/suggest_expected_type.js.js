/**
 * A specialize suggest plugin that displays categorized common expected types:
 *
 * - text
 * - numbers
 * - date/time
 * - boolean
 * - image
 * - weblink
 * - address
 */
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

  // delete placeholder plugin as part of suggest
  $.fn.placeholder = $.noop;

  $.suggest("suggest_expected_type",
    $.extend(true, {}, $.suggest.suggest.prototype, {

      _init: function() {
        var self = this;
        var o = this.options;
        // call super._init()
        base._init.call(self);

        this.ect_pane = $('<div class="ect-pane fbs-reset">');
        this.ect_menu = $('<div class="ect-menu-dialog"><span class="ect-menu-title">or choose from the data types below</span></div>');
        this.ect_list = $('<ul class="ect-menu clear">');
        $.each(['text', 'numeric', 'date', 'boolean', 'image', 'weblink', 'address'], function(i,type) {
          self.ect_list.append(self["create_ect_" + type].call(self));
        });

        var html =
          '<div class="ect-unit-dialog">' +
            '<h2 class="ect-unit-dialog-title">Select measurement type</h2>' +
            '<div class="ect-unit-field">' +
              '<label for="dimension">The kind of thing to measure</label>' +
              '<select name="dimension"></select>' +
            '</div>' +
            '<div class="ect-unit-field">' +
              '<label for="dimension-unit">The unit to measure it in</label>' +
              '<select name="dimension-unit"></select>' +
            '</div>' +
            '<div class="ect-unit-submit">' +
              '<button class="button button-primary button-submit">OK</button>' +
              '<button class="button button-cancel">Cancel</button>' +
            '</div>' +
          '</div>';
        this.ect_unit = $(html).hide();
        this.ect_dimension = $('select:first', this.ect_unit);
        this.ect_dimension_units = $('select:eq(1)', this.ect_unit);

        this.ect_dimension
          .change(function(e) {
            var option = $("[selected]", this);
            var units = option.data("units");
            if (self.ect_dimension_units.data("units") === units) {
              return;
            }
            self.ect_dimension_units.empty();
            $.each(units, function(i,u) {
              var name = u.name;
              if (u["/freebase/unit_profile/abbreviation"]) {
                name += " (" + u["/freebase/unit_profile/abbreviation"] + ")";
              }
              var option = $('<option>').text(name).attr("value", u.id).data("data", u);
              self.ect_dimension_units.append(option);
              if (u.id === "/en/meter") {
                option.attr("selected", "selected");
              }
            });
          });
        $(".button-cancel", this.ect_unit).click(function(e) {
          self.ect_menu.show();
          self.ect_unit.hide();
          self.status.show();
          self.input.focus().removeData("dont_hide");
          e.stopPropagation();
        });
        $(".button-submit", this.ect_unit).click(function(e) {
          var selected_unit = $("[selected]", self.ect_dimension_units);
          var data = {
            name: "Measurment",
            id: "/type/float",
            unit: selected_unit.data("data")
          };
          self.input.val(data.name)
            .data("data.suggest", data)
            .trigger("fb-select", data);
          self.input.focus().removeData("dont_hide");
          self.ect_menu.show();
          self.ect_unit.hide();
          self.hide_all();
          e.stopPropagation();
        });

        this.ect_pane.append(this.ect_menu);
        this.ect_pane.append(this.ect_unit);
        this.ect_menu.append(this.ect_list);

        this.ect_pane
          .bind("ect", function(e, data) {
            // hide all menus
            $(".trigger", this).each(function() {
              var tooltip = $(this).data("tooltip");
              if (tooltip) {
                tooltip.hide();
              }
            });
            if (data.id === "/type/float" && data.name === "Measurement") {
              self.ect_menu.hide();
              self.ect_unit.show();
              self.status.hide();
            }
            else {
              self.input.val(data.name)
                .data("data.suggest", data)
                .trigger("fb-select", data);

              self.hide_all();
            }
          })
          .bind("mouseup", function(e) {
            e.stopPropagation();
          });

        this.pane.append(this.ect_pane);

        $.suggest.suggest_expected_type.load_dimensions();
      },

      status_start: function(response_data, start, first) {//console.log("status_start", this.ect_unit.is(":visible"));
        base.status_start.apply(this);
        this.ect_pane.show();
        if (this.ect_unit.is(":visible")) {
          this.status.hide();
        }
      },

      status_loading: function(response_data, start, first) {//console.log("status_loading");
        base.status_loading.apply(this);
        this.ect_pane.hide();
      },

      status_select: function() {//console.log("status_select");
        base.status_select.apply(this);
        this.ect_pane.hide();
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

    var sect = $.suggest.suggest_expected_type;
    $.extend(sect, {
        defaults:  $.extend(true, {}, $.suggest.suggest.defaults, {
          tooltip_options: {
            events: {def: "click,mouseout"},
            position: "bottom right",
            offset: [-10, -10],
            effect: "fade",
            delay: 300,
            relative: true
          }}),
        set_dimensions: function(dimensions) {
          $(".ect-pane select[name=dimension]").each(function() {
            var select = $(this);
            if (select.data("dimensions") === dimensions) {
              return;
            }
            var selected;
            $.each(dimensions, function(i,d) {
              var option = $('<option>').text(d.name).attr("value", d.id).data("units", d.units);
              select.append(option);
              if (d.id === "/en/length") {
                selected = option;
              }
            });
            select.data("dimensions", dimensions);
            if (selected) {
              selected.attr("selected", "selected");
              select.change();
            }
          });
        },
        load_dimensions: function() {
          if (sect.dimensions) {
            sect.set_dimensions(sect.dimensions);
            return;
          }
          if (sect.load_dimensions.lock) {
            return;
          }
          // lock
          sect.load_dimensions.lock = true;
          var q = [{
            id: null,
            name: null,
            type: "/measurement_unit/dimension",
            units: [{
              id: null,
              name: null,
              type: "/type/unit",
              "/freebase/unit_profile/abbreviation": null
            }]
          }];
          // do as_of_time since units don't change often and better cacheability
          var today = (new Date());
          function pad(n){ return n<10 ? '0'+n : n;};
          var as_of_time = [today.getFullYear(), pad(today.getMonth()+1), pad(today.getDate())].join("-");
          $.ajax({
            url: "http://api.freebase.com/api/service/mqlread",
            data: {query: JSON.stringify({query: q, as_of_time: as_of_time})},
            dataType: "jsonp",
            jsonpCallback: "jQuery.suggest.suggest_expected_type.jsonpCallback"
          });
        },
        jsonpCallback: function(data) {
          //console.log("ajax.success", data);
          if (data.code === "/api/status/ok") {
            sect.dimensions = data.result.sort(sect.sort_by_name);
            $.each(sect.dimensions, function(i,d) {
              d.units.sort(sect.sort_by_name);
            });
            sect.set_dimensions(sect.dimensions);
          }
        },
        sort_by_name: function(a,b) {
          return b.name < a.name;
        }
    });

})(jQuery);
