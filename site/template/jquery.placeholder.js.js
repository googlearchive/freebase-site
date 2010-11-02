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
;(function($) {

   var f = document.createElement( 'input' );

   if ("placeholder" in f) {
     $.fn.placeholder = function() {
       return this;
     };
     return;
   }

   var base_val = $.fn.val;
   $.fn.val = function(value) {
     if (value === undefined) {
       if (this.hasClass("placeholder")) {
         return "";
       }
     }
     return base_val.apply(this, [value]);
   };

   function placeholder(input, options) {
     this.options = $.extend(true, {}, options);
     this.input = $(input);
     this.placeholder = this.input.attr("placeholder") || "";
     this.init();
   };
   placeholder.prototype = {
     init: function() {
       var self = this;
       var val = this.input.val();
       if (val === "" || val === this.placeholder) {
         this.input.val(this.placeholder).addClass("placeholder");
       }
       this.input
         .bind("focus.placeholder", function(e) {
           return self.focus(e);
         })
         .bind("blur.placeholder", function(e) {
           return self.blur(e);
         });
       if (this.input[0].form) {
         $(this.input[0].form).bind("submit", function(e) {
           return self.submit(e);
         });
       }
     },
     destroy: function() {
       this.input.unbind(".placeholder");
       if (this.input[0].form) {
         $(this.input[0].form).unbind(".placeholder");
       }
     },

     focus: function(e) {
       if (this.input.hasClass("placeholder")) {
         this.input.val("").removeClass("placeholder");
       }
     },

     blur: function(e) {
       if (this.input.val() === "") {
         this.input.val(this.input.attr("placeholder")).addClass("placeholder");
       }
     },

     submit: function(e) {
       if (this.input.hasClass("placeholder")) {
         this.input.val("");
       }
     }
   };

   /**
    */
   $.fn.placeholder = function (options) {
     return this.each(function() {
       var $this = $(this);
       // rm fb suggest placeholder
       $this.unbind(".placeholder");
       if (!$this.is(":text") && !$this.is("textarea")) {
         return;
       }
       var ph = $this.attr('placeholder');
       if (!ph) {
         return;
       }
       var instance = $.data(this, "placeholder");
       if (instance) {
         instance.destroy();
       }
       $.data(this, "placeholder", (new placeholder(this, options)));
     });

   };


 })(jQuery);
