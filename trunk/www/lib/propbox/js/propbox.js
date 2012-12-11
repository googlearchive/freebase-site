/*
 * Copyright 2012, Google Inc.
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
;(function($, kbs) {

  var propbox = window.propbox = {

    init: function(context, options) {
      options = $.extend({lang:"/lang/en"}, options);
      if (!options.base_ajax_url) {
        throw new Error("base_ajax_url required in propbox options");
      }
      if (!options.base_static_url) {
        throw new Error("base_static_url required in propbox options");
      }
      if (!options.id) {
        throw new Error("topic id required in propbox options");
      }
      if (!options.lang) {
        throw new Error("lang required in propbox options");
      }
      propbox.options = options;

      propbox.kbs = new kbs(context);

      // set current kbs element to the first visible kbs class
      propbox.kbs.set_next(propbox.kbs.get_current(),
        $(".kbs:visible:first", context, true));

      $(".kbs", context)
        .live("click", function() {
           // set current on click
           var current = propbox.kbs.get_current();
           propbox.kbs.set_next(current, $(this), true);
        })
        .live("edit", function() {
          var submenu = $(this).find(".headmenu:first").data("submenu");
          if (submenu) {
            $("li:first a:first", submenu).click();
          }
        });

      propbox.init_menus(context);
    },

    init_menus: function(context, nicemenu) {
      context = $(context || document);
      if (nicemenu) {
        $(".nicemenu", context).nicemenu();
      }
      var row;
      if (context && context.is(".hover-row")) {
        row = context;
      }
      else {
        row = $(".hover-row", context);
      }
      row.hover(propbox.row_menu_hoverover, propbox.row_menu_hoverout);
      row.dblclick(function() {
        var action = $(".nicemenu .default-action", this);
        if (!action.length) {
          action = $(".nicemenu:first .submenu:first a:first", this);
        }
        var href = action.attr("href");
        if (href=="#" || href.indexOf("javascript:void(0)")==0) {
          $(action).click();
        }
      });
      $(".nicemenu .headmenu", context)
        .add($(".nicemenu .default-action", context))
        .click("click", function() {
          if (propbox.kbs) {
            var current = propbox.kbs.get_current();
            if (current) {
              propbox.kbs.set_next(current,
                $(this).parents(".kbs:first"), true);
            }
          }
          return false;
        });
    },

    // show row menu button on hover
    row_menu_hoverover: function(e) {
      var row = $(this);
      row.addClass("row-hover");
    },

    // hide row menu button on mouseout
    row_menu_hoverout: function(e) {
      var row = $(this);
      row.removeClass("row-hover");
    },

    /**
     * simple dynamic javascript loader which caches the script_url,
     * so that it does not do multiple gets and executions.
     */
    get_script: function(script_url, callback) {
      var cache = propbox.get_script.cache;
      if (!cache) {
        cache = propbox.get_script.cache = {};
      }
      // check_cache
      var cached = cache[script_url];
      if (cached) {
        if (cached.state === 1) {  // requesting
          // add to the list of callbacks
          cached.callbacks.push(callback);
        }
        else if (cached.state === 4) { // already loaded
          // immediately callback
          callback();
        }
      }
      else {
        // not yet requested
        cached = cache[script_url] = {
          state: 0, // initialized
          callbacks: [callback]
        };
        $.ajax({
          url: propbox.options.base_static_url + script_url,
          dataType: 'script',
          beforeSend: function() {
            cached.state = 1;
          },
          success: function() {
            cached.state = 4;
            $.each(cached.callbacks, function(i,callback) {
              callback();
            });
          },
          error: function() {
            // TODO: handle error
            cached.state = -1;
          }
        });
      }
    },

    prop_edit: function(context, unique) {
      var prop_section = $(context).parents(".property-section");
      if (!prop_section.length) {
        prop_section = $(context).parents(".submenu")
          .data("headmenu").parents(".property-section");
      }
      var value_menu = prop_section.find(".data-section .data-row:first:visible " +
        ".nicemenu:first .headmenu:first a");
      if (value_menu.length) {
        value_menu.click();
      }
      else {
        propbox.prop_add(context, unique);
      }
      return false;
    },

    prop_add: function(context, unique) {
      var prop_section = $(context).parents(".property-section");
      if (!prop_section.length) {
        prop_section = $(context).parents(".submenu")
          .data("headmenu").parents(".property-section");
      }
      propbox.get_script("/propbox-edit.mf.js", function() {
        propbox.edit.prop_add_begin(prop_section, unique);
      });
      return false;
    },

    value_edit: function(context) {
      var prop_row = $(context).parents(".submenu")
        .data("headmenu").parents(".data-row:first");
      var prop_section = prop_row.parents(".property-section");
      propbox.get_script("/propbox-edit.mf.js", function() {
        propbox.edit.value_edit_begin(prop_section, prop_row);
      });
      return false;
    },

    value_delete: function(context) {
      var prop_row = $(context).parents(".submenu")
        .data("headmenu").parents(".data-row:first");
      var prop_section = prop_row.parents(".property-section");
      propbox.get_script("/propbox-edit.mf.js", function() {
        propbox.edit.value_delete_begin(prop_section, prop_row);
      });
      return false;
    },

    remove_type: function(context, type_id) {
      context = $(context);
      var type_section = context.parents('.type-section');
      propbox.get_script('/propbox-edit.mf.js', function() {
        propbox.edit.remove_type_submit(context, type_section);
      });
      return false;
    },

    add_type: function(context, type_id, included_types) {
      context = $(context);
      var type_section = context.parents(".type-section");
      // Do we have lib/incompatible_types/incompatible_types.js
      var incompatible_types = propbox.options.incompatible_types;
      if (incompatible_types) {
        var id = propbox.options.id;
        incompatible_types.search(
            id, type_id, included_types, {
              compatible: function() {
                propbox.add_type_submit(context, type_section);
              },
              incompatible:
                  incompatible_types.overlay_incompatible_callback({
                        onConfirm: function() {
                          propbox.add_type_submit(context, type_section);
                        }
                      })
            });
      }
      else {
        propbox.add_type_submit(context, type_section);
      }
      return false;
    },

    add_type_submit: function(context, type_section) {
      propbox.get_script("/propbox-edit.mf.js", function() {
        propbox.edit.add_type_submit(context, type_section);
      });
    },

    /**
     * Add HAS_NO_VALUE flag on property
     */
    add_has_no_value : function (context) {
      var prop_section = $(context).parents(".submenu")
        .data("headmenu").parents(".property-section");
      propbox.get_script("/propbox-edit.mf.js", function() {
        propbox.edit.add_has_no_value(prop_section);
      });
      return false;
    },

    /**
     * Add HAS_VALUE flag on property
     */
    add_has_value : function (context) {
      var prop_section = $(context).parents(".submenu")
        .data("headmenu").parents(".property-section");
      propbox.get_script("/propbox-edit.mf.js", function() {
        propbox.edit.add_has_value(prop_section);
      });
      return false;
    },

    /**
     * Remove HAS_NO_VALUE flag from property
     */
    remove_has_no_value : function (context) {
      var prop_section = $(context).parents(".property-section");
      propbox.get_script("/propbox-edit.mf.js", function() {
        propbox.edit.remove_has_no_value(prop_section);
      });
      return false;
    },

    /**
     * Remove HAS_VALUE flag from property
     */
    remove_has_value : function (context) {
       var prop_section = $(context).parents(".property-section");
       propbox.get_script("/propbox-edit.mf.js", function() {
        propbox.edit.remove_has_value(prop_section);
      });
      return false;
    },

    /**
     * AJAX and inline all the values of the topic property.
     * @param {string} topic_id The topic id.
     * @param {string} prop_id The property id.
     */
    more: function(context, topic_id, prop_id) {
      var prop_section = $(context).parents('.property-section');
      // We need formlib
      propbox.get_script('/propbox-edit.mf.js', function() {
        propbox.edit.more(prop_section, topic_id, prop_id);
      });
    }

  };

})(jQuery, window.kbs);
