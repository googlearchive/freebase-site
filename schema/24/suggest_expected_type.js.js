/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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
 * - namespace
 */
;(function($, fb) {

  if (!$.suggest) {
    alert("$.suggest required");
    return;
  }

  var base = {
    _init: $.suggest.suggest.prototype._init,
    status_start: $.suggest.suggest.prototype.status_start,
    status_loading: $.suggest.suggest.prototype.status_loading,
    status_select: $.suggest.suggest.prototype.status_select,
    create_item: $.suggest.suggest.prototype.create_item,
    focus: $.suggest.suggest.prototype.focus
  };

  $.suggest("suggest_expected_type",
    $.extend(true, {}, $.suggest.suggest.prototype, {

      _init: function() {
        var self = this;
        var o = this.options;
        // call super._init()
        base._init.call(self);

        this.input.bind("remove", function() {
          self._destroy();
        });

        this.ect_pane = $('<div class="ect-pane fbs-reset">');
        this.ect_menu = $('<div class="ect-menu-dialog"><span class="ect-menu-title">or choose from the data types below</span></div>');
        this.ect_list = $('<ul class="ect-menu clear">');
        $.each(['text', 'numeric', 'date', 'boolean', 'image', 'weblink', 'address', 'enumeration'], function(i,type) {
          self.ect_list.append(self["create_ect_" + type].call(self));
        });

        this.init_unit_dialog();  // this.ect_unit defined in init_unit_dialog

        this.ect_pane.append(this.ect_menu);
        this.ect_pane.append(this.ect_unit);
        this.ect_menu.append(this.ect_list);

        this.init_enumeration_dialog(); // this.ect_enumeration defined in init_enumeration_dialog

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
              self.ect_enumeration.hide();
              self.ect_unit.show();
              self.status.hide();
            }
            else if (data.id === "/type/enumeration") {
              self.ect_menu.hide();
              self.ect_unit.hide();
              self.ect_enumeration.show();
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

      init_unit_dialog: function() {
        var self = this;
        // initialize unit/measurment dialog
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
      },

      init_enumeration_dialog: function() {
        if (!this.options.domain) {
          return;
        }
        var self = this;
        // initialize /type/enumeration dialog
        var html =
          '<div class="ect-enumeration-dialog">' +
            '<h2 class="ect-enumeration-dialog-title">Enumerated Namespace</h2>' +
            '<div class="form-group">' +
              '<div class="ect-enumeration-field" id="new-enumeration-field">' +
                '<label>' +
                  '<input type="radio" name="namespace" class="ect-enumeration-choice" checked="checked">' +
                  'Create new namespace' +
                '</label>' +
                '<input type="text" class="text-input" id="ect-namespace-new-input" placeholder="key"/>' +
                '<span class="ect-namespace-root">' + this.options.domain + '/<span class="ect-namespace-key"></span></span>' +
              '</div>' +
              '<div class="ect-enumeration-field" id="existing-enumeration-field" style="display:none">' +
                '<label>' +
                  '<input type="radio" class="ect-enumeration-choice" name="namespace">' +
                  '<span>Enter a namespace to which you have permisson</span>' +
                '</label>' +
                '<input type="text" placeholder="eg. /authority/netflix" class="text-input"/>' +
              '</div>' +
              '<a href="javascript:void(0);" class="namespace-toggle">or choose existing&hellip;</a>' +
              '<div class="ect-enumeration-submit">' +
                '<button class="button button-primary button-submit">OK</button>' +
                '<button class="button button-cancel">Cancel</button>' +
              '</div>' +
            '</div>' +
          '</div>';
        this.ect_enumeration = $(html).hide();
        $(":text", this.ect_enumeration)
          .placeholder()
          .focus(function() {
            $(this).prev("label").find(":radio").attr("checked", "checked");
          })
          .change(function(e) {
            fb.schema.edit.clear_form_message(self.ect_enumeration);
          });
        // Capture user input into text field and append to namespace path
        // NOTE: no error checking is currently being performed, there should be
        $("#ect-namespace-new-input", this.ect_enumeration).keydown(function(){
          var timeout = null;
          var val = $(this);
          var $output = $(".ect-namespace-key");
          timeout = setTimeout(function(){
            $output.html(val.val());
          }, 500);
        });
        // Show/Hide New vs Existing namespace fields
        $(".namespace-toggle", this.ect_enumeration).click(function(){
          var $toggle = $(this);
          var $new_namespace = $("#new-enumeration-field");
          var $existing_namespace = $("#existing-enumeration-field");
          if ($existing_namespace.is(":hidden")) {
            $new_namespace.hide();
            $existing_namespace.show();
            $toggle.html("cancel");
          }
          else {
            $existing_namespace.hide();
            $new_namespace.show();
            $toggle.html("or choose existing...");
          }
        });
        $(".button-cancel", this.ect_enumeration).click(function(e) {
          self.ect_menu.show();
          self.ect_enumeration.hide();
          self.status.show();
          self.input.focus().removeData("dont_hide");
          e.stopPropagation();
        });
        $(".button-submit", this.ect_enumeration).click(function(e) {
          fb.schema.edit.clear_form_message(self.ect_enumeration);
          var data = {
            name: "Enumeration",
            id: "/type/enumeration"
          };
          var namespace;
          if ($(":radio:first", self.ect_enumeration).is(":checked")) {
            try {
              var input = $(":text:first", self.ect_enumeration);
              var key = fb.schema.edit.check_key(input.val(), "/type/domain");
              namespace = self.options.domain + "/" + key;
            }
            catch(ex) {
              fb.schema.edit.form_error(self.ect_enumeration, ex);
              return;
            }
          }
          else {
            var input = $(":text:eq(1)", self.ect_enumeration);
            namespace = input.val();
          }
          if (namespace) {
            console.log(namespace);
            data.enumeration = namespace;
          }
          else {
            fb.schema.edit.form_error(self.ect_enumeration, "Please select a namespace.");
            return;
          }
          self.input.val(data.name)
            .data("data.suggest", data)
            .trigger("fb-select", data);
          self.input.focus().removeData("dont_hide");
          self.ect_menu.show();
          self.ect_enumeration.hide();
          self.hide_all();
          e.stopPropagation();
        });

        this.ect_pane.append(this.ect_enumeration);
      },

      status_start: function(response_data, start, first) {//console.log("status_start", this.ect_unit.is(":visible"));
        base.status_start.apply(this);
        this.ect_pane.show();
        if (this.ect_unit.is(":visible") || (this.ect_enumeration && this.ect_enumeration.is(":visible"))) {
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

      create_ect_enumeration: function() {
        var li = this.create_ect_item("Namespace");
        $("> a", li)
          .data("ect", {name:"Enumeration", id:"/type/enumeration"})
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
        var trigger = $('<a href="javascript:void(0);" class="ect-icon trigger">&nbsp;</a>');
        trigger.addClass("ect-" + cname);
        li.append(trigger);
        li.append(document.createTextNode(name));
        return li;
      },

      create_ect_tooltip: function(tips) {
        var ul = $('<ul class="row-menu tooltip">');
        $.each(tips, function(i,tip) {
          var li = $('<li class="row-menu-item">');
          var trigger = $('<a href="javascript:void(0);">&nbsp;</a>').attr("title", tip.id)
            .data("ect", tip)
            .click(function() {
              $(this).trigger("ect", $(this).data("ect"));
            });
          trigger.text(tip.name);
          li.append(trigger);
          ul.append(li);
        });
        return ul;
      },

      create_item: function(data, response_data) {
        var li = base.create_item.apply(this, [data, response_data]);
        var domain = data.id.split("/");
        domain.pop();
        domain = domain.join("/");
        $("."+this.options.css.item_type, li).text(domain);
        return li;
      },

      focus: function(e) {
        base.focus.apply(this, [e]);
        this.input.removeData("dont_hide");
      }

    }));

    var sect = $.suggest.suggest_expected_type;
    $.extend(sect, {
        defaults:  $.extend(true, {}, $.suggest.suggest.defaults, {
          category: "expected_type",
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
            jsonpCallback: "jQuery.suggest.suggest_expected_type.load_dimensions_callback"
          });
        },
        load_dimensions_callback: function(data) {
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

})(jQuery, window.freebase);
