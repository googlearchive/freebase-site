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
/**
 * A jQuery plugin factory
 *
 * 1. var foo_class = $.factory("foo", { proto_methods... });
 * 2. $("#myelement").foo({options...});
 * 3. var foo_instance = $("#myelement").data("$.foo");  // returns an instance of $.foo class
 *
 * $.factory(name, protoype_dict) will create a $.fn[name] jQuery fn and $[name] class.
 *
 * If either of the two already exists, $.factory will throw an error.
 *
 * The prototype_dict must contain at least init and _destroy methods.
 *
 * The plugin class will have access to this.element and this.options
 */
;(function($) {
  $.factory = function(name, proto) {
    if ($.fn[name]) {
      throw "$.fn." + name + " plugin already exists";
    }
    else if ($[name]) {
      throw "$." + name + " class already exists";
    }
    $.fn[name] = function(options) {
      // You can also invoke a method on the instance
      var method = null;
      var method_args = null;
      if ($.type(options) === 'string') {
        method = options;
        method_args = Array.prototype.slice.call(arguments, 1);
      }
      return this.each(function() {
        var $this = $(this);
        var inst = $this.data("$."+name);

        if (method) {
          if (inst && $.type(inst[method]) === 'function') {
            inst[method].apply(inst, method_args);
          }
          else {
            console.warn(name, "Unable to invoke method", method);
          }
          return;
        }

        if (inst) {
          // destroy existing instance
          inst._destroy();
        }
        inst = new $[name]($this, options);
        $this.data("$."+name, inst);
      });
    };
    $[name] = function(element, options) {
      this.options = $.extend(true, {}, $[name].defaults, options);
      this.element = element;
      this.init();
    };
    $.extend($[name].prototype, {
      init: function() {},
      _destroy: function() {}
    }, proto);
    return $[name];
  };
})(jQuery);
