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

(function($, fb) {

  var schema = fb.schema = {
    // trigger for row menus
    init_row_menu: function(context) {
      $(".row-menu-trigger", context).each(function(){
        var trigger = $(this);

        trigger.tooltip({
          events: {def: "click,mouseout"},
          position: "bottom right",
          offset: [-10, -10],
          effect: "fade",
          delay: 300
        });
        //var $menu = $(this).closest(".row-menu");
        //$menu.children().last().hide();

        trigger.parents("tr:first").hover(schema.row_menu_hoverover, schema.row_menu_hoverout);
      });
    },

    row_menu_hoverover: function(e) {
      var row = $(this);
      row.addClass("row-hover");
      $(".row-menu-trigger", row).css('visibility','visible');
    },

    row_menu_hoverout: function(e) {
      var row = $(this);
      $(".row-menu-trigger", row).css('visibility','hidden');
      row.removeClass("row-hover");
    },

    close_message: function(e, selector) {
      var msg = $(this).parents(selector);
      if (msg.is("tr")) {
        msg.hideRow(function() {
          msg.remove();
        });
      }
      else {
        msg.slideUp(function() {
          msg.remove();
        });
      }
      return false;
    }
  };

  function init() {

    /**
     * $.tablesorter defaults
     */
    $.tablesorter.addParser({
      id: "schemaName",
      is: function(s) {
        return false;
      },
      format: function(s) {
        return $(s).text().toLowerCase();
      },
      type: 'text'
    });
    $.tablesorter.addParser({
      // set a unique id
      id: 'commaDigit',
      is: function(s) {
        // return false so this parser is not auto detected
        return false;
      },
      format: function(s) {
        // format your data for normalization
        return parseInt(s.replace(/\,/g, ""));
      },
      // set type, either numeric or text
      type: 'numeric'
    });

    $.tablesorter.defaults.cssAsc = "column-header-asc";
    $.tablesorter.defaults.cssDesc = "column-header-desc";
    $.tablesorter.defaults.cssHeader =  "column-header";

    schema.init_row_menu();

    $(".blurb-trigger").click(function(){
      var $trigger = $(this);
      var $blurb = $trigger.siblings(".blurb");
      var $blob = $trigger.siblings(".blob");
      if ($blob.is(":hidden")) {
        $blob.show();
        $blurb.hide();
        $trigger.text('Less');
      }
      else {
        $blob.hide();
        $blurb.show();
        $trigger.text('More');
      }
    });

    /*
        Breadcrumbs
    */

    // Offset the breadcrumb menu equivalent to the width of the trigger
    var h_width = $(".breadcrumb-sibling-trigger").outerWidth();
    var h_offset = (h_width);

    $(".breadcrumb-sibling-trigger").tooltip({
      events: {def: "click,mouseout"},
      position: "bottom right",
      offset: [-5, -h_offset],
      effect: "fade",
      delay: 300,
      onBeforeShow: function(){
        this.getTrigger().addClass("active");
      },
      onHide: function() {
        this.getTrigger().removeClass("active");
      }
    });


    // language select
    var lang_select = $("#language-select").change(function() {
      var lang = $(this).val();
      $.cookie("lang", lang, {path: "/"});
      window.location.reload(true);
    });
    var en, selected;
    $("option", lang_select).each(function() {
      var $this = $(this);
      if ($this.val() === "/lang/en") {
        en = $this;
      }
      if ($this.val() === fb.acre.lang.mql) {
        selected = $this.attr("selected", "selected");
        return false;
      };
    });
    if (!selected && en) {
      en.attr("selected", "selected");
    }
  };

  $(init);

})(jQuery, window.freebase);
