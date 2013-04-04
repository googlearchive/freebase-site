/**
 * A simple container for maintaining last recently used (LRU) items.
 * This uses localstore with the key specified by options.key.
 * It maintains an Array of strings with maximum length specified
 * by options.max.
 *
 * Usage:
 *   $(yourcontainer).lrulist({
 *     key: 'your.localstore.key',
 *     max: 5,
 *     separator: '<span class="sep">|</span>',
 *     template: function(item) {
 *       return $('<a>').text(item).click(function(e) {
 *         console.log("You clicked my item");
 *       });
 *     }
 *   })
 *
 *   // To add a new item
 *   $(yourcontainer).lrulist('update', 'new_filter_string');
 *
 *   // To clear
 *   $(yourcontainer).lrulist('clear');
 *
 */
;(function($) {

  $.factory("lrulist", {

    init: function() {
      if (!this.options.key) {
        console.error('$.lrulist', 'A localstore key is required.');
        return;
      }
      this.update();
    },

    update: function(new_item) {
      var o = this.options;
      var items = $.localstore(o.key);
      if (items == null) {
        items = [];
      }
      if (new_item != null) {
        // Add new_item to the recent items list
        var index = items.indexOf(new_item);
        if (index !== -1) {
          items.splice(index, 1);
        }
        items.unshift(new_item);
      }
      items = items.slice(0, o.max);
      if (items.length) {
        $.localstore(o.key, items, false);
        var container = this.element.empty();
        var len = items.length;
        var templ = o.template;
        var templ_type = $.type(templ);
        $.each(items, function(i, item) {
          var elt = null;
          if (templ_type === 'function') {
            elt = templ(item);
          }
          else if (templ_type === 'string') {
            elt = $(templ).text(item);
          }
          else {
            elt = document.createTextNode(item);
          }
          if (elt != null) {
            if (o.separator && i > 0) {
              container.append(o.separator);
            }
            container.append(elt);
          }
        });
      }
    },

    clear: function() {
      $.localstore(this.options.key, null, false);
      this.element.empty();
    }

  });

  /**
   * Default options.
   */
  $.extend(true, $.lrulist, {
    defaults: {
      max: 10,
      key: null,  // You MUST specify a localstore key
      separator: ', ',
      onclick: $.noop
    }
  });

})(jQuery);
