(function($) {

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
