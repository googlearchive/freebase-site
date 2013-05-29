/*
 * Copyright 2013, Google Inc.
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
;(function($, suggest, localstore) {

  /**
   * A suggest plugin that displays last recently used (LRU) items from
   * local storage on focus of an empty text input. Otherwise, this behaves much
   * like a regular suggest widget.
   *
   * Usage:
   * <code>
   *   $(myInput)
   *       .suggest_lrulist({
   *         localstore_key: 'your.localstore.key',
   *         max: 10
   *       });
   * </code>
   *
   * You must specify a "localstore_key" which will be used as a key to store
   * the items in local storage.
   *
   * In addition to showing the recently used items on focus,
   * an option to "clear" and "disable" the LRU list will be displayed.
   */

  if (!suggest) {
    console.error('$.suggest is required');
    return;
  }

  if (!localstore) {
    console.error('$.localstore is required');
    return;
  }

  var base = {
    _init: suggest.suggest.prototype._init,
    show_hook: suggest.suggest.prototype.show_hook,
    focus: suggest.suggest.prototype.focus
  };

  suggest('suggest_lrulist', $.extend({}, suggest.suggest.prototype, {

    _init: function() {
      base._init.call(this);
      if (!this.options.localstore_key) {
        console.error('$.suggest_lrulist', 'A localstore key is required.');
        return;
      }
      this.options.disabled_key = this.options.localstore_key + '.disabled';
    },

    focus: function(e) {
      if (this.is_enabled()) {
        var items = this.get_items_();
        if (items.length) {
          if (this.pane.is(':visible')) {
            return;
          }
          this.response({
            lrulist: true,
            prefix: this.input.val(),
            result: items
          });
          return;
        }
      }
      base.focus.call(this, e);
    },

    create_item: function(data) {
      var css = this.options.css;
      var li =  $('<li>').addClass(css.item);
      var label = $('<label>').text(data.id || data.mid);
      var name = $('<div>').addClass(css.item_name)
        .append(label);
      li.append(name);
      return li;
    },

    show_hook: function(response_data) {
      base.show_hook.apply(this, arguments);
      var self = this;
      if (response_data.lrulist) {
        // Show a "clear list" option
        var options = $('<div style="float:right">');
        var clear = $('<a href="#">clear list</a>')
          .bind('click.suggest', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.clear_items();
            self.input.trigger('textchange');
          });
        var track = $('<label ' +
            'title="Uncheck to disable recently used list.">' +
            '<input type="checkbox" checked>on</label>');
        $(':checkbox', track)
          .bind('change.suggest', function(e) {
            self.disable();
            self.input.trigger('textchange');
          });
        options.append(clear).append('&nbsp;').append(track);
        this.status
          .empty()
          .append('Recently used ')
          .append(options)
          .show();
      }
      if (this.is_disabled()) {
        var track = $('<label ' +
            'title="Check to remember recently used items."' +
            'style="float:right;">' +
            '<input type="checkbox">on</label>')
          .bind('change.suggest', function(e) {
              self.enable();
          });
        this.status.append(track);
      }
    },

    get_items_: function() {
      return localstore(this.options.localstore_key) || [];
    },

    clear_items: function() {
      localstore(this.options.localstore_key, null, false);
    },

    disable: function() {
      this.clear_items();
      localstore(this.options.disabled_key, 1, false);
    },

    enable: function() {
      localstore(this.options.disabled_key, null, false);
    },

    is_enabled: function() {
      return !this.is_disabled();
    },

    is_disabled: function() {
      return localstore(this.options.disabled_key) == 1;
    },

    update: function(item) {
      var items = this.get_items_();
      items = $.grep(items, function(data) {
        if (item.mid && item.mid == data.mid) {
          return false;
        } else if (item.id && item.id == data.id) {
          return false;
        }
        return true;
      });
      items.unshift(item);
      items = items.slice(0, this.options.max);
      localstore(this.options.localstore_key, items, false);
    }
  }));

  $.extend(suggest.suggest_lrulist, {
    defaults: $.extend(true, {
      /**
       * The default maximum number of items to store.
       */
      max: 10,

      /**
       * The default key used for local storage.
       */
      localstore_key: '$.suggest_lrulist'
    }, suggest.suggest.defaults)
  });

})(jQuery, jQuery.suggest, jQuery.localstore);
