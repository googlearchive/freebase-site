
/** schema-edit.mf.js **/

/** jquerytools, toolbox.expose.js **/
/**
 * @license 
 * jQuery Tools @VERSION / Expose - Dim the lights
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/toolbox/expose.html
 *
 * Since: Mar 2010
 * Date: @DATE 
 */
(function($) { 	

	// static constructs
	$.tools = $.tools || {version: '@VERSION'};
	
	var tool;
	
	tool = $.tools.expose = {
		
		conf: {	
			maskId: 'exposeMask',
			loadSpeed: 'slow',
			closeSpeed: 'fast',
			closeOnClick: true,
			closeOnEsc: true,
			
			// css settings
			zIndex: 9998,
			opacity: 0.8,
			startOpacity: 0,
			color: '#fff',
			
			// callbacks
			onLoad: null,
			onClose: null
		}
	};

	/* one of the greatest headaches in the tool. finally made it */
	function viewport() {
				
		// the horror case
		if ($.browser.msie) {
			
			// if there are no scrollbars then use window.height
			var d = $(document).height(), w = $(window).height();
			
			return [
				window.innerWidth || 							// ie7+
				document.documentElement.clientWidth || 	// ie6  
				document.body.clientWidth, 					// ie6 quirks mode
				d - w < 20 ? w : d
			];
		} 
		
		// other well behaving browsers
		return [$(document).width(), $(document).height()]; 
	} 
	
	function call(fn) {
		if (fn) { return fn.call($.mask); }
	}
	
	var mask, exposed, loaded, config, overlayIndex;		
	
	
	$.mask = {
		
		load: function(conf, els) {
			
			// already loaded ?
			if (loaded) { return this; }			
			
			// configuration
			if (typeof conf == 'string') {
				conf = {color: conf};	
			}
			
			// use latest config
			conf = conf || config;
			
			config = conf = $.extend($.extend({}, tool.conf), conf);

			// get the mask
			mask = $("#" + conf.maskId);
				
			// or create it
			if (!mask.length) {
				mask = $('<div/>').attr("id", conf.maskId);
				$("body").append(mask);
			}
			
			// set position and dimensions 			
			var size = viewport();
				
			mask.css({				
				position:'absolute', 
				top: 0, 
				left: 0,
				width: size[0],
				height: size[1],
				display: 'none',
				opacity: conf.startOpacity,					 		
				zIndex: conf.zIndex 
			});
			
			if (conf.color) {
				mask.css("backgroundColor", conf.color);	
			}			
			
			// onBeforeLoad
			if (call(conf.onBeforeLoad) === false) {
				return this;
			}
			
			// esc button
			if (conf.closeOnEsc) {						
				$(document).bind("keydown.mask", function(e) {							
					if (e.keyCode == 27) {
						$.mask.close(e);	
					}		
				});			
			}
			
			// mask click closes
			if (conf.closeOnClick) {
				mask.bind("click.mask", function(e)  {
					$.mask.close(e);		
				});					
			}			
			
			// resize mask when window is resized
			$(window).bind("resize.mask", function() {
				$.mask.fit();
			});
			
			// exposed elements
			if (els && els.length) {
				
				overlayIndex = els.eq(0).css("zIndex");

				// make sure element is positioned absolutely or relatively
				$.each(els, function() {
					var el = $(this);
					if (!/relative|absolute|fixed/i.test(el.css("position"))) {
						el.css("position", "relative");		
					}					
				});
			 
				// make elements sit on top of the mask
				exposed = els.css({ zIndex: Math.max(conf.zIndex + 1, overlayIndex == 'auto' ? 0 : overlayIndex)});			
			}	
			
			// reveal mask
			mask.css({display: 'block'}).fadeTo(conf.loadSpeed, conf.opacity, function() {
				$.mask.fit(); 
				call(conf.onLoad);
			});
			
			loaded = true;			
			return this;				
		},
		
		close: function() {
			if (loaded) {
				
				// onBeforeClose
				if (call(config.onBeforeClose) === false) { return this; }
					
				mask.fadeOut(config.closeSpeed, function()  {					
					call(config.onClose);					
					if (exposed) {
						exposed.css({zIndex: overlayIndex});
					}				
				});				
				
				// unbind various event listeners
				$(document).unbind("keydown.mask");
				mask.unbind("click.mask");
				$(window).unbind("resize.mask");
	
				loaded = false;
			}
			
			return this; 
		},
		
		fit: function() {
			if (loaded) {
				var size = viewport();				
				mask.css({width: size[0], height: size[1]});
			}				
		},
		
		getMask: function() {
			return mask;	
		},
		
		isLoaded: function() {
			return loaded;	
		}, 
		
		getConf: function() {
			return config;	
		},
		
		getExposed: function() {
			return exposed;	
		}		
	};
	
	$.fn.mask = function(conf) {
		$.mask.load(conf);
		return this;		
	};			
	
	$.fn.expose = function(conf) {
		$.mask.load(conf, this);
		return this;			
	};


})(jQuery);

/** jquerytools, overlay.js **/
/**
 * @license 
 * jQuery Tools @VERSION Overlay - Overlay base. Extend it.
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/overlay/
 *
 * Since: March 2008
 * Date: @DATE 
 */
(function($) { 

	// static constructs
	$.tools = $.tools || {version: '@VERSION'};
	
	$.tools.overlay = {
		
		addEffect: function(name, loadFn, closeFn) {
			effects[name] = [loadFn, closeFn];	
		},
	
		conf: {  
			close: null,	
			closeOnClick: true,
			closeOnEsc: true,			
			closeSpeed: 'fast',
			effect: 'default',
			
			// since 1.2. fixed positioning not supported by IE6
			fixed: !$.browser.msie || $.browser.version > 6, 
			
			left: 'center',		
			load: false, // 1.2
			mask: null,  
			oneInstance: true,
			speed: 'normal',
			target: null, // target element to be overlayed. by default taken from [rel]  
			top: '10%'
		}
	};

	
	var instances = [], effects = {};
		
	// the default effect. nice and easy!
	$.tools.overlay.addEffect('default', 
		
		/* 
			onLoad/onClose functions must be called otherwise none of the 
			user supplied callback methods won't be called
		*/
		function(pos, onLoad) {
			
			var conf = this.getConf(),
				 w = $(window);				 
				
			if (!conf.fixed)  {
				pos.top += w.scrollTop();
				pos.left += w.scrollLeft();
			} 
				
			pos.position = conf.fixed ? 'fixed' : 'absolute';
			this.getOverlay().css(pos).fadeIn(conf.speed, onLoad); 
			
		}, function(onClose) {
			this.getOverlay().fadeOut(this.getConf().closeSpeed, onClose); 			
		}		
	);		

	
	function Overlay(trigger, conf) {		
		
		// private variables
		var self = this,
			 fire = trigger.add(self),
			 w = $(window), 
			 closers,            
			 overlay,
			 opened,
			 maskConf = $.tools.expose && (conf.mask || conf.expose),
			 uid = Math.random().toString().slice(10);		
		
			 
		// mask configuration
		if (maskConf) {			
			if (typeof maskConf == 'string') { maskConf = {color: maskConf}; }
			maskConf.closeOnClick = maskConf.closeOnEsc = false;
		}			 
		 
		// get overlay and triggerr
		var jq = conf.target || trigger.attr("rel");
		overlay = jq ? $(jq) : null || trigger;	
		
		// overlay not found. cannot continue
		if (!overlay.length) { throw "Could not find Overlay: " + jq; }
		
		// trigger's click event
		if (trigger && trigger.index(overlay) == -1) {
			trigger.click(function(e) {				
				self.load(e);
				return e.preventDefault();
			});
		}   			
		
		// API methods  
		$.extend(self, {

			load: function(e) {
				
				// can be opened only once
				if (self.isOpened()) { return self; }
				
				// find the effect
		 		var eff = effects[conf.effect];
		 		if (!eff) { throw "Overlay: cannot find effect : \"" + conf.effect + "\""; }
				
				// close other instances?
				if (conf.oneInstance) {
					$.each(instances, function() {
						this.close(e);
					});
				}
				
				// onBeforeLoad
				e = e || $.Event();
				e.type = "onBeforeLoad";
				fire.trigger(e);				
				if (e.isDefaultPrevented()) { return self; }				

				// opened
				opened = true;
				
				// possible mask effect
				if (maskConf) { $(overlay).expose(maskConf); }				
				
				// position & dimensions 
				var top = conf.top,					
					 left = conf.left,
					 oWidth = overlay.outerWidth({margin:true}),
					 oHeight = overlay.outerHeight({margin:true}); 
				
				if (typeof top == 'string')  {
					top = top == 'center' ? Math.max((w.height() - oHeight) / 2, 0) : 
						parseInt(top, 10) / 100 * w.height();			
				}				
				
				if (left == 'center') { left = Math.max((w.width() - oWidth) / 2, 0); }

				
		 		// load effect  		 		
				eff[0].call(self, {top: top, left: left}, function() {					
					if (opened) {
						e.type = "onLoad";
						fire.trigger(e);
					}
				}); 				

				// mask.click closes overlay
				if (maskConf && conf.closeOnClick) {
					$.mask.getMask().one("click", self.close); 
				}
				
				// when window is clicked outside overlay, we close
				if (conf.closeOnClick) {
					$(document).bind("click." + uid, function(e) { 
						if (!$(e.target).parents(overlay).length) { 
							self.close(e); 
						}
					});						
				}						
			
				// keyboard::escape
				if (conf.closeOnEsc) { 

					// one callback is enough if multiple instances are loaded simultaneously
					$(document).bind("keydown." + uid, function(e) {
						if (e.keyCode == 27) { 
							self.close(e);	 
						}
					});			
				}

				
				return self; 
			}, 
			
			close: function(e) {

				if (!self.isOpened()) { return self; }
				
				e = e || $.Event();
				e.type = "onBeforeClose";
				fire.trigger(e);				
				if (e.isDefaultPrevented()) { return; }				
				
				opened = false;
				
				// close effect
				effects[conf.effect][1].call(self, function() {
					e.type = "onClose";
					fire.trigger(e); 
				});
				
				// unbind the keyboard / clicking actions
				$(document).unbind("click." + uid).unbind("keydown." + uid);		  
				
				if (maskConf) {
					$.mask.close();		
				}
				 
				return self;
			}, 
			
			getOverlay: function() {
				return overlay;	
			},
			
			getTrigger: function() {
				return trigger;	
			},
			
			getClosers: function() {
				return closers;	
			},			

			isOpened: function()  {
				return opened;
			},
			
			// manipulate start, finish and speeds
			getConf: function() {
				return conf;	
			}			
			
		});
		
		// callbacks	
		$.each("onBeforeLoad,onStart,onLoad,onBeforeClose,onClose".split(","), function(i, name) {
				
			// configuration
			if ($.isFunction(conf[name])) { 
				$(self).bind(name, conf[name]); 
			}

			// API
			self[name] = function(fn) {
				$(self).bind(name, fn);
				return self;
			};
		});
		
		// close button
		closers = overlay.find(conf.close || ".close");		
		
		if (!closers.length && !conf.close) {
			closers = $('<a class="close"></a>');
			overlay.prepend(closers);	
		}		
		
		closers.click(function(e) { 
			self.close(e);  
		});	
		
		// autoload
		if (conf.load) { self.load(); }
		
	}
	
	// jQuery plugin initialization
	$.fn.overlay = function(conf) {   
		
		// already constructed --> return API
		var el = this.data("overlay");
		if (el) { return el; }	  		 
		
		if ($.isFunction(conf)) {
			conf = {onBeforeLoad: conf};	
		}

		conf = $.extend(true, {}, $.tools.overlay.conf, conf);
		
		this.each(function() {		
			el = new Overlay($(this), conf);
			instances.push(el);
			$(this).data("overlay", el);	
		});
		
		return conf.api ? el: this;		
	}; 
	
})(jQuery);


/** jquery.mqlkey.js **/
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

  /**
   * Validate key input on text change. If options.check_key is TRUE (default),
   * the key value will be checked against options.namespace ("/" default) of whether
   * or not the key already exists using the mqlread service specified by
   * options.mqlread_url (http://www.freebase.com/api/service/mqlread default).
   */
  $.fn.mqlkey = function (options) {
    return this.each(function() {
      var $this = $(this);
      if (!$this.is(":text")) {
        return;
      }
      var inst = $this.data("mqlkey");
      if (inst) {
        inst._destroy();
      }
      inst = new mqlkey(this, options);
      $this.data("mqlkey", inst);
    });
  };

  // property and type names have more restrictive rules that match the rules for javascript identifiers.
  var __high_ident_str = "[a-z](?:_?[a-z0-9])*";

  // this is the validity checker for property and type names
  var valid_high_idname = new RegExp("^(?:/|/" + __high_ident_str + "(?:/" + __high_ident_str + ")*)$");

  // a high_idname with an optional prefix and optional leading ! for reversal.
  var valid_mql_key =  new RegExp("^(\\!)?(?:(" + __high_ident_str + ")\\:)?(/|/?" + __high_ident_str + "(?:/" + __high_ident_str + ")*)$");

  function mqlkey(input, options) {
    this.options = $.extend(true, {}, mqlkey.defaults, options);
    this.options.jsonp = mqlkey.use_jsonp(this.options.mqlread_url);
    this.input = $(input);
    this.original = this.input.val();
    this.init();
  };
  mqlkey.prototype = {
    init: function() {
      var self = this;
      this.input
        .bind("keyup.mqlkey", function(e) {
          self.textchange(e);
        })
        .bind($.browser.msie ? "paste.mqlkey" : "input.mqlkey", function(e) {
          self.textchange(e);
        });

      if (this.options.source) {
        this.source = $(this.options.source);
        this.source_generate = true;
        this.input.bind("change.mqlkey", function() {
          self.source_generate = false;
        });
        this.source.bind("change.mqlkey", function() {
          if (self.source_generate) {
            var key = mqlkey.from(self.source.val());
            self.input.val(key).trigger("keyup");
          }
        });
      }
    },
    _destroy: function() {
      this.input.unbind(".mqlkey");
      if (this.source) {
        this.source.unbind("change.mqlkey");
      }
    },
    textchange: function(e) {
      clearTimeout(this.textchange_timeout);
      var self = this;
      this.textchange_timeout = setTimeout(function() {
        self.textchange_delay(e);
      }, 0);
    },
    textchange_delay: function(e) {
      this.input.trigger("textchange");
      var val = $.trim(this.input.val());
      if (val === this.original && val !== "") {
        return this.valid(val);
      }
      else if (!valid_mql_key.test(val)) {
        return this.invalid(val);
      }
      else if (val.length < this.options.minlen) {
        return this.invalid(val);
      }
      else if (this.options.check_key) {
        return this.check_key(val);
      }
      else {
        return this.valid(val);
      }
    },

    check_key: function(val) {
      var self = this;
      if (this.xhr) {
        this.xhr.abort();
        this.xhr = null;
      }
      var q = {
        query: '{"query": {"id": null, "key": {"namespace": "'+ this.options.namespace + '", "value": "' + val + '"}}}'
      };
      // delayed query
      clearTimeout(this.check_key.timeout);

      var ajax_options = {
        url: this.options.mqlread_url,
        data: q,
        success: function(data) {
          if (data.code === "/api/status/ok") {
            if (data.result) {
              return self.invalid(val, "Key already exists");
            }
            else {
              return self.valid(val);
            }
          }
        },
        error: function(xhr) {
          if (xhr) {
            return self.invalid(xhr.responseText());
          }
        },
        dataType: self.options.jsonp ? "jsonp" : "json"
      };

      this.check_key.timeout = setTimeout(function() {
        self.ac_xhr = $.ajax(ajax_options);
      }, 200);
    },

    valid: function(val) {
      this.input.trigger("valid", val);
    },

    invalid: function(val, msg) {
      if (!msg) {
        if (this.options.minlen > 1) {
          msg = "Key must be " + this.options.minlen + " or more alphanumeric characters";
        }
        else {
          msg = "Key must be alphanumeric";
        }
        msg += ", lowercase, begin with a letter and not end with a non-alphanumeric character. Underscores are allowed but not consecutively.";
      }

      this.input.trigger("invalid", msg);
    }
  };

  $.extend(mqlkey, {
    defaults: {
      minlen: 1,
      check_key: true,  // If TRUE, check if key already exists in namespace. namespace and mqlread_url must be specified. Otherwise, just apply valid_mql_key regular expression
      namespace: "/",
      mqlread_url: "http://www.freebase.com/api/service/mqlread",
      source: null // jQuery selector to auto generate key from
    },
    use_jsonp: function(service_url) {
      /*
       * if we're on the same host,
       * then we don't need to use jsonp.
       * This greatly increases our cachability
       */
      if (!service_url) {
        return false; // no host == same host == no jsonp
      }
      var pathname_len = window.location.pathname.length;
      var hostname = window.location.href;
      hostname = hostname.substr(0, hostname.length -
                                 pathname_len);
      //console.log("Hostname = ", hostname);
      if (hostname === service_url) {
        return false;
      }
      return true;
    },
    from: function(val) {
      var key = val.toLowerCase();
      key = key.replace(/[^a-z0-9]/g, '_');    // remove all non-alphanumeric
      key = key.replace(/\_\_+/g, '_');        // replace __+ with _
      key = key.replace(/[^a-z0-9]+$/, '');    // strip ending non-alphanumeric
      key = key.replace(/^[^a-z]+/, '');       // strip beginning non-alpha
      return key;
    }
  });

})(jQuery);

/** schema-edit.js **/
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
  $(window).ajaxSend(function(event, xhr, options) {
    if (options.type === "POST") {
      xhr.setRequestHeader("x-acre-cache-control", "max-age: 3600");
    }
  });

  var se = fb.schema.edit = {

    /**
     * This is an attempt at separating out the common logic
     * when adding/editing a row in a schema table.
     * This logic is currently shared by the domain and type schema page:
     * 1. Adding a type on the domain page.
     * 2. Editing a type on the domain page.
     * 3. Adding a property on the type page.
     * 4. Editing a property on the type page
     *
     * @param form:Object (required) - A set of key/value pairs specifying form options:
     * - mode:String (required) - Mode to specify the actual edit mode (add|edit)
     * - event_prefix:String (required) - This is the prefix of all events that will be
     *                                    triggered in the course of the form editing.
     *                                    (event_prefix[submit|cancel|error|success])
     * - init_form:Function (required) - A hook to initialize the form row.
     * - validate_form:Function (required) - A hook to validating the form row.
     * - submit_form:Function (required)
     *
     * - table:jQuery (required)
     * - trigger:jQuery (required)
     * - trigger_row:jQuery (required)
     * - row:jQuery (required)
     * - submit_row:jQuery (required)
     */
    init_edit_form: function(form) {
      if (form.mode === "add") {
        $("tbody", form.table).append(form.row);
      }
      else if (form.mode === "edit") {
        form.trigger_row.before(form.row);
      }
      else {
        throw "Unknown edit type mode: " + form.mode;
      }
      form.trigger_row.before(form.submit_row);

      var event_prefix = form.event_prefix || "fb.schema.edit.";
      form.row
        .bind(event_prefix + "submit", function() {
          // console.log(event_prefix + "submit");
          se.submit_edit_form(form);
        })
        .bind(event_prefix + "cancel", function() {
          // console.log(event_prefix + "cancel");
          se.cancel_edit_form(form);
        })
        .bind(event_prefix + "error", function(e, row, error) {
          // console.log(event_prefix + "error", row, error);
          se.row_error(row, error);
          form.row.removeClass("loading");
        })
        .bind(event_prefix + "success", function() {
          // console.log(event_prefix + "success");
          form.row.removeClass("loading");
        });

      // submit handler
      $(".button-submit", form.submit_row).click(function() {
        form.row.trigger(event_prefix + "submit");
      });
      // cancel handler
      $(".button-cancel", form.submit_row).click(function() {
        form.row.trigger(event_prefix + "cancel");
      });

      form.row.showRow(function() {
        // init edit-row
        if (typeof form.init_form === "function") {
          form.init_form(form);
        }
      });
      form.trigger_row.hide();
      form.submit_row.show();

      $("[placeholder]", form.row).placeholder();
      $(window).bind("fb.lang.select", function(e, lang) {
        se.toggle_lang(form.row, lang);
      });
    },

    cancel_edit_form: function(form) {
      form.row.hideRow(function() {
        $(this).remove();
      });
      se.clear_row_message(form.row);
      form.submit_row.remove();
      form.trigger_row.show();
      form.trigger.removeClass("editing");
    },

    submit_edit_form: function(form) {
      // are we already submitting?
      if (form.row.is(".loading")) {
        return;
      }

      // remove focus from activeElement
      if (document.activeElement) {
        $(document.activeElement).blur();
      }

      // clear messages
      se.clear_row_message(form.row);

     // validate edit-row
      if (typeof form.validate_form === "function") {
        form.validate_form(form);
      }

      // any pre-submit errors?
      if (se.has_row_message(form.row, "error")) {
        return;
      }

      // add a loading class to flag we are submitting the form
      form.row.addClass("loading");

      // submit edit-row
      if (typeof form.submit_form === "function") {
        form.submit_form(form);
      }
    },

    ajax_error_handler: function(xhr, row, form) {
      var msg;
      try {
        msg = JSON.parse(xhr.responseText);
        msg = msg.messages[0].message; // display the first message
      }
      catch(e) {
        msg = xhr.responseText;
      }
      // TODO: make error expandable to see whole error message
      if (row) {
        se.row_error(row, msg);
        row.removeClass("loading");
      }
      else if (form) {
        se.form_error(form, msg);
        form.removeClass("loading");
      }
    },

    row_error: function(row, msg) {
      return se.row_message(row, msg, "error");
    },

    row_message: function(row, msg, type) {
      var close = $('<a class="close-msg" href="#">Close</a>').click(function(e) {
        return fb.schema.close_message.apply(this, [e, '.row-msg:first']);
      });
      var span = $("<span>").text(msg);
      var td = $('<td colspan="5">').append(close).append(span);
      var row_msg = $('<tr class="row-msg">').append(td);
      if (type) {
        row_msg.addClass("row-msg-" + type);
      }

      // prepend row_msg to row
      row.before(row_msg);
      row_msg.hide().showRow();

      var msg_data = row.data("row-msg");
      if (!msg_data) {
        msg_data = {};
        row.data("row-msg", msg_data);
      }
      if (!msg_data[type]) {
        msg_data[type] = [row_msg];
      }
      else {
        msg_data[type].push(row_msg);
      }
      return row_msg;
    },

    clear_row_message: function(row) {
      var msg_data = row.data("row-msg");
      if (msg_data) {
        $.each(msg_data, function(type,msgs) {
          $.each(msgs, function(i,msg) {
            msg.remove();
          });
        });
        row.removeData("row-msg");
      }
    },

    has_row_message: function(row, type) {
      var msg_data = row.data("row-msg");
      if (type) {
        return msg_data && msg_data[type] && msg_data[type].length;
      }
      return msg_data != null;
    },

    init_modal_form: function(form) {

      $(document.body).append(form.form.hide());

      var event_prefix = form.event_prefix || "fb.schema.edit.modal.";
      form.form
       .bind(event_prefix + "submit", function() {
          // console.log(event_prefix + "submit");
          se.submit_modal_form(form);
        })
        .bind(event_prefix + "error", function(e, error) {
          // console.log(event_prefix + "error", error);
          se.form_error(form.form, error);
        })
        .bind(event_prefix + "success", function() {
          // console.log(event_prefix + "success");
          form.form.removeClass("loading");
        });

     // submit handler
      $(".modal-buttons .button-submit", form.form).click(function() {
        form.form.trigger(event_prefix + "submit");
      });

      form.form.overlay({
          close: ".modal-buttons .button-cancel",
          closeOnClick: false,
          load: true,
          mask: {
            color: '#000',
	    loadSpeed: 200,
	    opacity: 0.5
	  },
          onLoad: function() {
            // init form
            if (typeof form.init_form === "function") {
              form.init_form(form);
            }
          }
        });

      $("[placeholder]", form.form).placeholder();
      fb.schema.init_modal_help(form.form);

      $(window).bind("fb.lang.select", function(e, lang) {
        se.toggle_lang(form.form, lang);
      });
    },

    submit_modal_form: function(form) {
      // are we already submitting?
      if (form.form.is(".loading")) {
        return;
      }

      // remove focus from activeElement
      if (document.activeElement) {
        $(document.activeElement).blur();
      }

      // clear messages
      se.clear_form_message(form.form);

      // validate edit-row
      if (typeof form.validate_form === "function") {
        form.validate_form(form);
      }

      // any pre-submit errors?
      if (se.has_form_message(form.form, "error")) {
        return;
      }

      // add a loading class to flag we are submitting the form
      form.form.addClass("loading");

      // submit edit-row
      if (typeof form.submit_form === "function") {
        form.submit_form(form);
      }
    },

    form_error: function(form, msg) {
      return se.form_message(form, msg, "error");
    },

    form_message: function(form, msg, type) {
      var form_msg = $("<div class='form-msg'>").text(msg).hide();

      $(".form-group", form).prepend(form_msg);
      form_msg.slideDown();

      var msg_data = form.data("form-msg");
      if (!msg_data) {
        msg_data = {};
        form.data("form-msg", msg_data);
      }
      if (!msg_data[type]) {
        msg_data[type] = [form_msg];
      }
      else {
        msg_data[type].push(form_msg);
      }
      return form_msg;
    },

    clear_form_message: function(form) {
      var msg_data = form.data("form-msg");
      if (msg_data) {
        $.each(msg_data, function(type,msgs) {
          $.each(msgs, function(i,msg) {
            msg.remove();
          });
        });
        form.removeData("form-msg");
      }
    },

    has_form_message: function(form, type) {
      var msg_data = form.data("form-msg");
      if (type) {
        return msg_data && msg_data[type] && msg_data[type].length;
      }
      return msg_data != null;
    },

    toggle_lang: function(context, lang) {
      var elts = $("[lang]", context).each(function() {
        var elt = $(this);
        var elt_lang = $(this).attr("lang");
        if (elt_lang === lang) {
          elt.show().focus().blur();
        }
        else {
          elt.hide();
        }
      });
    },

    init_mqlkey: function(input, mqlkey_options) {
      input
        .mqlkey(mqlkey_options)
        .bind("valid", function(e, val) {
          $(this).next(".key-status")
            .removeClass("invalid")
            .removeClass("loading")
            .addClass("valid")
            .text("valid")
            .attr("title", "Key is available");
        })
        .bind("invalid", function(e, msg) {
          $(this).next(".key-status")
            .removeClass("valid")
            .removeClass("loading")
            .addClass("invalid")
            .text("invalid")
            .attr("title", msg);
        })
        .bind("textchange", function(e) {
          $(this).next(".key-status")
            .removeClass("invalid")
            .removeClass("valid")
            .addClass("loading");
        });
    },

    validate_mqlkey: function(form, input) {
      var form_elt = form.form || form.row;
      var key_status = input.next(".key-status");
      var keyval = input.val();
      if (keyval === "") {
        //console.log("VALIDATE MQLKEY", "EMPTY");
        form_elt.trigger(form.event_prefix + "error", "Key is required");
        return false;
      }
      if (keyval === input.data("mqlkey").original) {
        //console.log("VALIDATE MQLKEY", "ORIGINAL");
        return true;
      }
      if (key_status.is(".invalid")) {
        //console.log("VALIDATE MQLKEY", "INVALID");
        form_elt.trigger(form.event_prefix + "error", key_status.attr("title"));
        return false;
      }
      else if (key_status.is(".loading")) {
        //console.log("VALIDATE MQLKEY", "LOADING");
        return false;
      }
      //console.log("VALIDATE MQLKEY", "VALID");
      return true;
    },


    /**
     * If you change this, please change key generation methods in //schema.freebase.site.dev/helpers
     */
    auto_key: function(input, output, type) {
      var original_key = output.val();
      if (original_key) {
        // output already contains value, we do not want to overwrite
        output.data("original", original_key);
      }
      else {
        output.data("autogen", true);
        output.change(function() {
          output.data("autogen", false);
        });
        input.change(function() {
          if (output.data("autogen")) {
            var key = $.trim(input.val()).toLowerCase();
            key = key.replace(/[^a-z0-9]/g, '_');    // remove all non-alphanumeric
            key = key.replace(/\_\_+/g, '_');        // replace __+ with _
            key = key.replace(/[^a-z0-9]+$/, '');    // strip ending non-alphanumeric
            key = key.replace(/^[^a-z]+/, '');       // strip beginning non-alpha
            try {
              se.check_key(key, type);
            }
            catch (ex) {
              return;
            }
            output.val(key);
          }
        });
      }
    },

    check_key: function(key, type) {
      if (type === "/type/domain") {
        return se.check_key_domain(key);
      }
      else if (type === "/type/type") {
        return se.check_key_type(key);
      }
      else if (type === "/type/property") {
        return se.check_key_property(key);
      }
      else {
        return se.check_key_default(key);
      }
    },

    check_key_domain: function(key) {
      return se.check_key_default(key, 5);
    },

    check_key_type: function(key) {
      return se.check_key_default(key);
    },

    check_key_property: function(key) {
      return se.check_key_default(key);
    },

    check_key_default: function(key, minlen) {
      if (!minlen) {
        minlen = 1;
      }
      if (minlen === 1 && key.length === 1) {
        if (/^[a-z]$/.test(key)) {
          return key;
        }
      }
      else {
        var pattern = "^[a-z][a-z0-9_]";
        if (minlen > 1) {
          pattern += "{" + (minlen - 1) + ",}$";
        }
        else {
          pattern += "+$";
        }
        var re = RegExp(pattern);
        if (re.test(key)) {
          if (! (key.match(/__+/) ||
                 key.match(/[^a-z0-9]+$/))) {
            return key;
          }
        }
      }
      var msg;
      if (minlen > 1) {
        msg = "Key must be " + minlen + " or more alphanumeric characters";
      }
      else {
        msg = "Key must be alphanumeric";
      }
      msg += ", lowercase, begin with a letter and not end with a non-alphanumeric character. Underscores are allowed but not consecutively.";
      throw(msg);
    }
  };
})(jQuery, window.freebase);

/** jqueryui, jquery.ui.core.mf.js **/

/** jquery.ui.core.js **/
/*! @license
 * jQuery UI 1.8.4
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI
 */
(function( $, undefined ) {

// prevent duplicate loading
// this is only a problem because we proxy existing functions
// and we don't want to double proxy them
$.ui = $.ui || {};
if ( $.ui.version ) {
	return;
}

//Helper functions and ui object
$.extend( $.ui, {
	version: "1.8.4",

	// $.ui.plugin is deprecated.  Use the proxy pattern instead.
	plugin: {
		add: function( module, option, set ) {
			var proto = $.ui[ module ].prototype;
			for ( var i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args ) {
			var set = instance.plugins[ name ];
			if ( !set || !instance.element[ 0 ].parentNode ) {
				return;
			}

			for ( var i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	},

	contains: function( a, b ) {
		return document.compareDocumentPosition ?
			a.compareDocumentPosition( b ) & 16 :
			a !== b && a.contains( b );
	},

	hasScroll: function( el, a ) {

		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ( $( el ).css( "overflow" ) === "hidden") {
			return false;
		}

		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;

		if ( el[ scroll ] > 0 ) {
			return true;
		}

		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	},

	isOverAxis: function( x, reference, size ) {
		//Determines when x coordinate is over "b" element axis
		return ( x > reference ) && ( x < ( reference + size ) );
	},

	isOver: function( y, x, top, left, height, width ) {
		//Determines when x, y coordinates is over "b" element
		return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width );
	},

	keyCode: {
		ALT: 18,
		BACKSPACE: 8,
		CAPS_LOCK: 20,
		COMMA: 188,
		COMMAND: 91,
		COMMAND_LEFT: 91, // COMMAND
		COMMAND_RIGHT: 93,
		CONTROL: 17,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		INSERT: 45,
		LEFT: 37,
		MENU: 93, // COMMAND_RIGHT
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SHIFT: 16,
		SPACE: 32,
		TAB: 9,
		UP: 38,
		WINDOWS: 91 // COMMAND
	}
});

//jQuery plugins
$.fn.extend({
	_focus: $.fn.focus,
	focus: function( delay, fn ) {
		return typeof delay === "number" ?
			this.each(function() {
				var elem = this;
				setTimeout(function() {
					$( elem ).focus();
					if ( fn ) {
						fn.call( elem );
					}
				}, delay );
			}) :
			this._focus.apply( this, arguments );
	},

	enableSelection: function() {
		return this
			.attr( "unselectable", "off" )
			.css( "MozUserSelect", "" );
	},

	disableSelection: function() {
		return this
			.attr( "unselectable", "on" )
			.css( "MozUserSelect", "none" );
	},

	scrollParent: function() {
		var scrollParent;
		if (($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.curCSS(this,'position',1)) && (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		}

		return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ) );
					if ( !isNaN( value ) && value != 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	}
});

$.each( [ "Width", "Height" ], function( i, name ) {
	var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
		type = name.toLowerCase(),
		orig = {
			innerWidth: $.fn.innerWidth,
			innerHeight: $.fn.innerHeight,
			outerWidth: $.fn.outerWidth,
			outerHeight: $.fn.outerHeight
		};

	function reduce( elem, size, border, margin ) {
		$.each( side, function() {
			size -= parseFloat( $.curCSS( elem, "padding" + this, true) ) || 0;
			if ( border ) {
				size -= parseFloat( $.curCSS( elem, "border" + this + "Width", true) ) || 0;
			}
			if ( margin ) {
				size -= parseFloat( $.curCSS( elem, "margin" + this, true) ) || 0;
			}
		});
		return size;
	}

	$.fn[ "inner" + name ] = function( size ) {
		if ( size === undefined ) {
			return orig[ "inner" + name ].call( this );
		}

		return this.each(function() {
			$.style( this, type, reduce( this, size ) + "px" );
		});
	};

	$.fn[ "outer" + name] = function( size, margin ) {
		if ( typeof size !== "number" ) {
			return orig[ "outer" + name ].call( this, size );
		}

		return this.each(function() {
			$.style( this, type, reduce( this, size, true, margin ) + "px" );
		});
	};
});

//Additional selectors
function visible( element ) {
	return !$( element ).parents().andSelf().filter(function() {
		return $.curCSS( this, "visibility" ) === "hidden" ||
			$.expr.filters.hidden( this );
	}).length;
}

$.extend( $.expr[ ":" ], {
	data: function( elem, i, match ) {
		return !!$.data( elem, match[ 3 ] );
	},

	focusable: function( element ) {
		var nodeName = element.nodeName.toLowerCase(),
			tabIndex = $.attr( element, "tabindex" );
		if ( "area" === nodeName ) {
			var map = element.parentNode,
				mapName = map.name,
				img;
			if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
				return false;
			}
			img = $( "img[usemap=#" + mapName + "]" )[0];
			return !!img && visible( img );
		}
		return ( /input|select|textarea|button|object/.test( nodeName )
			? !element.disabled
			: "a" == nodeName
				? element.href || !isNaN( tabIndex )
				: !isNaN( tabIndex ))
			// the element and all of its ancestors must be visible
			&& visible( element );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" );
		return ( isNaN( tabIndex ) || tabIndex >= 0 ) && $( element ).is( ":focusable" );
	}
});

})( jQuery );

/** jquery.ui.widget.js **/
/*!
 * jQuery UI Widget 1.8.4
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
(function( $, undefined ) {

var _remove = $.fn.remove;

$.fn.remove = function( selector, keepData ) {
	return this.each(function() {
		if ( !keepData ) {
			if ( !selector || $.filter( selector, [ this ] ).length ) {
				$( "*", this ).add( [ this ] ).each(function() {
					$( this ).triggerHandler( "remove" );
				});
			}
		}
		return _remove.call( $(this), selector, keepData );
	});
};

$.widget = function( name, base, prototype ) {
	var namespace = name.split( "." )[ 0 ],
		fullName;
	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName ] = function( elem ) {
		return !!$.data( elem, name );
	};

	$[ namespace ] = $[ namespace ] || {};
	$[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without initializing for simple inheritance
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	var basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
//	$.each( basePrototype, function( key, val ) {
//		if ( $.isPlainObject(val) ) {
//			basePrototype[ key ] = $.extend( {}, val );
//		}
//	});
	basePrototype.options = $.extend( true, {}, basePrototype.options );
	$[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
		namespace: namespace,
		widgetName: name,
		widgetEventPrefix: $[ namespace ][ name ].prototype.widgetEventPrefix || name,
		widgetBaseClass: fullName
	}, prototype );

	$.widget.bridge( name, $[ namespace ][ name ] );
};

$.widget.bridge = function( name, object ) {
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = Array.prototype.slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.extend.apply( null, [ true, options ].concat(args) ) :
			options;

		// prevent calls to internal methods
		if ( isMethodCall && options.substring( 0, 1 ) === "_" ) {
			return returnValue;
		}

		if ( isMethodCall ) {
			this.each(function() {
				var instance = $.data( this, name ),
					methodValue = instance && $.isFunction( instance[options] ) ?
						instance[ options ].apply( instance, args ) :
						instance;
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, name );
				if ( instance ) {
					if ( options ) {
						instance.option( options );
					}
					instance._init();
				} else {
					$.data( this, name, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( options, element ) {
	// allow instantiation without initializing for simple inheritance
	if ( arguments.length ) {
		this._createWidget( options, element );
	}
};

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	options: {
		disabled: false
	},
	_createWidget: function( options, element ) {
		// $.widget.bridge stores the plugin instance, but we do it anyway
		// so that it's stored even before the _create function runs
		$.data( element, this.widgetName, this );
		this.element = $( element );
		this.options = $.extend( true, {},
			this.options,
			$.metadata && $.metadata.get( element )[ this.widgetName ],
			options );

		var self = this;
		this.element.bind( "remove." + this.widgetName, function() {
			self.destroy();
		});

		this._create();
		this._init();
	},
	_create: function() {},
	_init: function() {},

	destroy: function() {
		this.element
			.unbind( "." + this.widgetName )
			.removeData( this.widgetName );
		this.widget()
			.unbind( "." + this.widgetName )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetBaseClass + "-disabled " +
				"ui-state-disabled" );
	},

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			self = this;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.extend( {}, self.options );
		}

		if  (typeof key === "string" ) {
			if ( value === undefined ) {
				return this.options[ key ];
			}
			options = {};
			options[ key ] = value;
		}

		$.each( options, function( key, value ) {
			self._setOption( key, value );
		});

		return self;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				[ value ? "addClass" : "removeClass"](
					this.widgetBaseClass + "-disabled" + " " +
					"ui-state-disabled" )
				.attr( "aria-disabled", value );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_trigger: function( type, event, data ) {
		var callback = this.options[ type ];

		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		data = data || {};

		// copy original event properties over to the new event
		// this would happen if we could call $.event.fix instead of $.Event
		// but we don't have a way to force an event to be fixed multiple times
		if ( event.originalEvent ) {
			for ( var i = $.event.props.length, prop; i; ) {
				prop = $.event.props[ --i ];
				event[ prop ] = event.originalEvent[ prop ];
			}
		}

		this.element.trigger( event, data );

		return !( $.isFunction(callback) &&
			callback.call( this.element[0], event, data ) === false ||
			event.isDefaultPrevented() );
	}
};

})( jQuery );

/** jquery.ui.mouse.js **/
/*!
 * jQuery UI Mouse 1.8.4
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget("ui.mouse", {
	options: {
		cancel: ':input,option',
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var self = this;

		this.element
			.bind('mousedown.'+this.widgetName, function(event) {
				return self._mouseDown(event);
			})
			.bind('click.'+this.widgetName, function(event) {
				if(self._preventClickEvent) {
					self._preventClickEvent = false;
					event.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind('.'+this.widgetName);
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		// TODO: figure out why we have to use originalEvent
		event.originalEvent = event.originalEvent || {};
		if (event.originalEvent.mouseHandled) { return; }

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var self = this,
			btnIsLeft = (event.which == 1),
			elIsCancel = (typeof this.options.cancel == "string" ? $(event.target).parents().add(event.target).filter(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				self.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return self._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return self._mouseUp(event);
		};
		$(document)
			.bind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.bind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		// preventDefault() is used to prevent the selection of text here -
		// however, in Safari, this causes select boxes not to be selectable
		// anymore, so this fix is needed
		($.browser.safari || event.preventDefault());

		event.originalEvent.mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.browser.msie && !event.button) {
			return this._mouseUp(event);
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		$(document)
			.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		if (this._mouseStarted) {
			this._mouseStarted = false;
			this._preventClickEvent = (event.target == this._mouseDownEvent.target);
			this._mouseStop(event);
		}

		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(event) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(event) {},
	_mouseDrag: function(event) {},
	_mouseStop: function(event) {},
	_mouseCapture: function(event) { return true; }
});

})(jQuery);

/** jquery.ui.position.js **/
/*
 * jQuery UI Position 1.8.4
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Position
 */
(function( $, undefined ) {

$.ui = $.ui || {};

var horizontalPositions = /left|center|right/,
	horizontalDefault = "center",
	verticalPositions = /top|center|bottom/,
	verticalDefault = "center",
	_position = $.fn.position,
	_offset = $.fn.offset;

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var target = $( options.of ),
		collision = ( options.collision || "flip" ).split( " " ),
		offset = options.offset ? options.offset.split( " " ) : [ 0, 0 ],
		targetWidth,
		targetHeight,
		basePosition;

	if ( options.of.nodeType === 9 ) {
		targetWidth = target.width();
		targetHeight = target.height();
		basePosition = { top: 0, left: 0 };
	} else if ( options.of.scrollTo && options.of.document ) {
		targetWidth = target.width();
		targetHeight = target.height();
		basePosition = { top: target.scrollTop(), left: target.scrollLeft() };
	} else if ( options.of.preventDefault ) {
		// force left top to allow flipping
		options.at = "left top";
		targetWidth = targetHeight = 0;
		basePosition = { top: options.of.pageY, left: options.of.pageX };
	} else {
		targetWidth = target.outerWidth();
		targetHeight = target.outerHeight();
		basePosition = target.offset();
	}

	// force my and at to have valid horizontal and veritcal positions
	// if a value is missing or invalid, it will be converted to center 
	$.each( [ "my", "at" ], function() {
		var pos = ( options[this] || "" ).split( " " );
		if ( pos.length === 1) {
			pos = horizontalPositions.test( pos[0] ) ?
				pos.concat( [verticalDefault] ) :
				verticalPositions.test( pos[0] ) ?
					[ horizontalDefault ].concat( pos ) :
					[ horizontalDefault, verticalDefault ];
		}
		pos[ 0 ] = horizontalPositions.test( pos[0] ) ? pos[ 0 ] : horizontalDefault;
		pos[ 1 ] = verticalPositions.test( pos[1] ) ? pos[ 1 ] : verticalDefault;
		options[ this ] = pos;
	});

	// normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	// normalize offset option
	offset[ 0 ] = parseInt( offset[0], 10 ) || 0;
	if ( offset.length === 1 ) {
		offset[ 1 ] = offset[ 0 ];
	}
	offset[ 1 ] = parseInt( offset[1], 10 ) || 0;

	if ( options.at[0] === "right" ) {
		basePosition.left += targetWidth;
	} else if (options.at[0] === horizontalDefault ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[1] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[1] === verticalDefault ) {
		basePosition.top += targetHeight / 2;
	}

	basePosition.left += offset[ 0 ];
	basePosition.top += offset[ 1 ];

	return this.each(function() {
		var elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			position = $.extend( {}, basePosition );

		if ( options.my[0] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[0] === horizontalDefault ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[1] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[1] === verticalDefault ) {
			position.top -= elemHeight / 2;
		}

		// prevent fractions (see #5280)
		position.left = parseInt( position.left );
		position.top = parseInt( position.top );

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[i] ] ) {
				$.ui.position[ collision[i] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					offset: offset,
					my: options.my,
					at: options.at
				});
			}
		});

		if ( $.fn.bgiframe ) {
			elem.bgiframe();
		}
		elem.offset( $.extend( position, { using: options.using } ) );
	});
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var win = $( window ),
				over = position.left + data.elemWidth - win.width() - win.scrollLeft();
			position.left = over > 0 ? position.left - over : Math.max( 0, position.left );
		},
		top: function( position, data ) {
			var win = $( window ),
				over = position.top + data.elemHeight - win.height() - win.scrollTop();
			position.top = over > 0 ? position.top - over : Math.max( 0, position.top );
		}
	},

	flip: {
		left: function( position, data ) {
			if ( data.at[0] === "center" ) {
				return;
			}
			var win = $( window ),
				over = position.left + data.elemWidth - win.width() - win.scrollLeft(),
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				offset = -2 * data.offset[ 0 ];
			position.left += position.left < 0 ?
				myOffset + data.targetWidth + offset :
				over > 0 ?
					myOffset - data.targetWidth + offset :
					0;
		},
		top: function( position, data ) {
			if ( data.at[1] === "center" ) {
				return;
			}
			var win = $( window ),
				over = position.top + data.elemHeight - win.height() - win.scrollTop(),
				myOffset = data.my[ 1 ] === "top" ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					-data.targetHeight,
				offset = -2 * data.offset[ 1 ];
			position.top += position.top < 0 ?
				myOffset + data.targetHeight + offset :
				over > 0 ?
					myOffset + atOffset + offset :
					0;
		}
	}
};

// offset setter from jQuery 1.4
if ( !$.offset.setOffset ) {
	$.offset.setOffset = function( elem, options ) {
		// set position first, in-case top/left are set even on static elem
		if ( /static/.test( $.curCSS( elem, "position" ) ) ) {
			elem.style.position = "relative";
		}
		var curElem   = $( elem ),
			curOffset = curElem.offset(),
			curTop    = parseInt( $.curCSS( elem, "top",  true ), 10 ) || 0,
			curLeft   = parseInt( $.curCSS( elem, "left", true ), 10)  || 0,
			props     = {
				top:  (options.top  - curOffset.top)  + curTop,
				left: (options.left - curOffset.left) + curLeft
			};
		
		if ( 'using' in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	};

	$.fn.offset = function( options ) {
		var elem = this[ 0 ];
		if ( !elem || !elem.ownerDocument ) { return null; }
		if ( options ) { 
			return this.each(function() {
				$.offset.setOffset( this, options );
			});
		}
		return _offset.call( this );
	};
}

}( jQuery ));

/** jqueryui, jquery.ui.sortable.js **/
/*
 * jQuery UI Sortable 1.8.4
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Sortables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget("ui.sortable", $.ui.mouse, {
	widgetEventPrefix: "sort",
	options: {
		appendTo: "parent",
		axis: false,
		connectWith: false,
		containment: false,
		cursor: 'auto',
		cursorAt: false,
		dropOnEmpty: true,
		forcePlaceholderSize: false,
		forceHelperSize: false,
		grid: false,
		handle: false,
		helper: "original",
		items: '> *',
		opacity: false,
		placeholder: false,
		revert: false,
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		scope: "default",
		tolerance: "intersect",
		zIndex: 1000
	},
	_create: function() {

		var o = this.options;
		this.containerCache = {};
		this.element.addClass("ui-sortable");

		//Get the items
		this.refresh();

		//Let's determine if the items are floating
		this.floating = this.items.length ? (/left|right/).test(this.items[0].item.css('float')) : false;

		//Let's determine the parent's offset
		this.offset = this.element.offset();

		//Initialize mouse events for interaction
		this._mouseInit();

	},

	destroy: function() {
		this.element
			.removeClass("ui-sortable ui-sortable-disabled")
			.removeData("sortable")
			.unbind(".sortable");
		this._mouseDestroy();

		for ( var i = this.items.length - 1; i >= 0; i-- )
			this.items[i].item.removeData("sortable-item");

		return this;
	},

	_setOption: function(key, value){
		if ( key === "disabled" ) {
			this.options[ key ] = value;
	
			this.widget()
				[ value ? "addClass" : "removeClass"]( "ui-sortable-disabled" );
		} else {
			// Don't call widget base _setOption for disable as it adds ui-state-disabled class
			$.Widget.prototype._setOption.apply(this, arguments);
		}
	},

	_mouseCapture: function(event, overrideHandle) {

		if (this.reverting) {
			return false;
		}

		if(this.options.disabled || this.options.type == 'static') return false;

		//We have to refresh the items data once first
		this._refreshItems(event);

		//Find out if the clicked node (or one of its parents) is a actual item in this.items
		var currentItem = null, self = this, nodes = $(event.target).parents().each(function() {
			if($.data(this, 'sortable-item') == self) {
				currentItem = $(this);
				return false;
			}
		});
		if($.data(event.target, 'sortable-item') == self) currentItem = $(event.target);

		if(!currentItem) return false;
		if(this.options.handle && !overrideHandle) {
			var validHandle = false;

			$(this.options.handle, currentItem).find("*").andSelf().each(function() { if(this == event.target) validHandle = true; });
			if(!validHandle) return false;
		}

		this.currentItem = currentItem;
		this._removeCurrentsFromItems();
		return true;

	},

	_mouseStart: function(event, overrideHandle, noActivation) {

		var o = this.options, self = this;
		this.currentContainer = this;

		//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
		this.refreshPositions();

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Get the next scrolling parent
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.currentItem.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		// Only after we got the offset, we can change the helper's position to absolute
		// TODO: Still need to figure out a way to make relative sorting possible
		this.helper.css("position", "absolute");
		this.cssPosition = this.helper.css("position");

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		//Generate the original position
		this.originalPosition = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Cache the former DOM position
		this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };

		//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
		if(this.helper[0] != this.currentItem[0]) {
			this.currentItem.hide();
		}

		//Create the placeholder
		this._createPlaceholder();

		//Set a containment if given in the options
		if(o.containment)
			this._setContainment();

		if(o.cursor) { // cursor option
			if ($('body').css("cursor")) this._storedCursor = $('body').css("cursor");
			$('body').css("cursor", o.cursor);
		}

		if(o.opacity) { // opacity option
			if (this.helper.css("opacity")) this._storedOpacity = this.helper.css("opacity");
			this.helper.css("opacity", o.opacity);
		}

		if(o.zIndex) { // zIndex option
			if (this.helper.css("zIndex")) this._storedZIndex = this.helper.css("zIndex");
			this.helper.css("zIndex", o.zIndex);
		}

		//Prepare scrolling
		if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML')
			this.overflowOffset = this.scrollParent.offset();

		//Call callbacks
		this._trigger("start", event, this._uiHash());

		//Recache the helper size
		if(!this._preserveHelperProportions)
			this._cacheHelperProportions();


		//Post 'activate' events to possible containers
		if(!noActivation) {
			 for (var i = this.containers.length - 1; i >= 0; i--) { this.containers[i]._trigger("activate", event, self._uiHash(this)); }
		}

		//Prepare possible droppables
		if($.ui.ddmanager)
			$.ui.ddmanager.current = this;

		if ($.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(this, event);

		this.dragging = true;

		this.helper.addClass("ui-sortable-helper");
		this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;

	},

	_mouseDrag: function(event) {

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		if (!this.lastPositionAbs) {
			this.lastPositionAbs = this.positionAbs;
		}

		//Do scrolling
		if(this.options.scroll) {
			var o = this.options, scrolled = false;
			if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML') {

				if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
				else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity)
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;

				if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
				else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity)
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;

			} else {

				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);

				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);

			}

			if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
				$.ui.ddmanager.prepareOffsets(this, event);
		}

		//Regenerate the absolute position used for position checks
		this.positionAbs = this._convertPositionTo("absolute");

		//Set the helper position
		if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
		if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';

		//Rearrange
		for (var i = this.items.length - 1; i >= 0; i--) {

			//Cache variables and intersection, continue if no intersection
			var item = this.items[i], itemElement = item.item[0], intersection = this._intersectsWithPointer(item);
			if (!intersection) continue;

			if(itemElement != this.currentItem[0] //cannot intersect with itself
				&&	this.placeholder[intersection == 1 ? "next" : "prev"]()[0] != itemElement //no useless actions that have been done before
				&&	!$.ui.contains(this.placeholder[0], itemElement) //no action if the item moved is the parent of the item checked
				&& (this.options.type == 'semi-dynamic' ? !$.ui.contains(this.element[0], itemElement) : true)
				//&& itemElement.parentNode == this.placeholder[0].parentNode // only rearrange items within the same container
			) {

				this.direction = intersection == 1 ? "down" : "up";

				if (this.options.tolerance == "pointer" || this._intersectsWithSides(item)) {
					this._rearrange(event, item);
				} else {
					break;
				}

				this._trigger("change", event, this._uiHash());
				break;
			}
		}

		//Post events to containers
		this._contactContainers(event);

		//Interconnect with droppables
		if($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

		//Call callbacks
		this._trigger('sort', event, this._uiHash());

		this.lastPositionAbs = this.positionAbs;
		return false;

	},

	_mouseStop: function(event, noPropagation) {

		if(!event) return;

		//If we are using droppables, inform the manager about the drop
		if ($.ui.ddmanager && !this.options.dropBehaviour)
			$.ui.ddmanager.drop(this, event);

		if(this.options.revert) {
			var self = this;
			var cur = self.placeholder.offset();

			self.reverting = true;

			$(this.helper).animate({
				left: cur.left - this.offset.parent.left - self.margins.left + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollLeft),
				top: cur.top - this.offset.parent.top - self.margins.top + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollTop)
			}, parseInt(this.options.revert, 10) || 500, function() {
				self._clear(event);
			});
		} else {
			this._clear(event, noPropagation);
		}

		return false;

	},

	cancel: function() {

		var self = this;

		if(this.dragging) {

			this._mouseUp();

			if(this.options.helper == "original")
				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
			else
				this.currentItem.show();

			//Post deactivating events to containers
			for (var i = this.containers.length - 1; i >= 0; i--){
				this.containers[i]._trigger("deactivate", null, self._uiHash(this));
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", null, self._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
		if(this.placeholder[0].parentNode) this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
		if(this.options.helper != "original" && this.helper && this.helper[0].parentNode) this.helper.remove();

		$.extend(this, {
			helper: null,
			dragging: false,
			reverting: false,
			_noFinalSort: null
		});

		if(this.domPosition.prev) {
			$(this.domPosition.prev).after(this.currentItem);
		} else {
			$(this.domPosition.parent).prepend(this.currentItem);
		}

		return this;

	},

	serialize: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected);
		var str = []; o = o || {};

		$(items).each(function() {
			var res = ($(o.item || this).attr(o.attribute || 'id') || '').match(o.expression || (/(.+)[-=_](.+)/));
			if(res) str.push((o.key || res[1]+'[]')+'='+(o.key && o.expression ? res[1] : res[2]));
		});

		if(!str.length && o.key) {
			str.push(o.key + '=');
		}

		return str.join('&');

	},

	toArray: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected);
		var ret = []; o = o || {};

		items.each(function() { ret.push($(o.item || this).attr(o.attribute || 'id') || ''); });
		return ret;

	},

	/* Be careful with the following core functions */
	_intersectsWith: function(item) {

		var x1 = this.positionAbs.left,
			x2 = x1 + this.helperProportions.width,
			y1 = this.positionAbs.top,
			y2 = y1 + this.helperProportions.height;

		var l = item.left,
			r = l + item.width,
			t = item.top,
			b = t + item.height;

		var dyClick = this.offset.click.top,
			dxClick = this.offset.click.left;

		var isOverElement = (y1 + dyClick) > t && (y1 + dyClick) < b && (x1 + dxClick) > l && (x1 + dxClick) < r;

		if(	   this.options.tolerance == "pointer"
			|| this.options.forcePointerForContainers
			|| (this.options.tolerance != "pointer" && this.helperProportions[this.floating ? 'width' : 'height'] > item[this.floating ? 'width' : 'height'])
		) {
			return isOverElement;
		} else {

			return (l < x1 + (this.helperProportions.width / 2) // Right Half
				&& x2 - (this.helperProportions.width / 2) < r // Left Half
				&& t < y1 + (this.helperProportions.height / 2) // Bottom Half
				&& y2 - (this.helperProportions.height / 2) < b ); // Top Half

		}
	},

	_intersectsWithPointer: function(item) {

		var isOverElementHeight = $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
			isOverElementWidth = $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
			isOverElement = isOverElementHeight && isOverElementWidth,
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (!isOverElement)
			return false;

		return this.floating ?
			( ((horizontalDirection && horizontalDirection == "right") || verticalDirection == "down") ? 2 : 1 )
			: ( verticalDirection && (verticalDirection == "down" ? 2 : 1) );

	},

	_intersectsWithSides: function(item) {

		var isOverBottomHalf = $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
			isOverRightHalf = $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (this.floating && horizontalDirection) {
			return ((horizontalDirection == "right" && isOverRightHalf) || (horizontalDirection == "left" && !isOverRightHalf));
		} else {
			return verticalDirection && ((verticalDirection == "down" && isOverBottomHalf) || (verticalDirection == "up" && !isOverBottomHalf));
		}

	},

	_getDragVerticalDirection: function() {
		var delta = this.positionAbs.top - this.lastPositionAbs.top;
		return delta != 0 && (delta > 0 ? "down" : "up");
	},

	_getDragHorizontalDirection: function() {
		var delta = this.positionAbs.left - this.lastPositionAbs.left;
		return delta != 0 && (delta > 0 ? "right" : "left");
	},

	refresh: function(event) {
		this._refreshItems(event);
		this.refreshPositions();
		return this;
	},

	_connectWith: function() {
		var options = this.options;
		return options.connectWith.constructor == String
			? [options.connectWith]
			: options.connectWith;
	},
	
	_getItemsAsjQuery: function(connected) {

		var self = this;
		var items = [];
		var queries = [];
		var connectWith = this._connectWith();

		if(connectWith && connected) {
			for (var i = connectWith.length - 1; i >= 0; i--){
				var cur = $(connectWith[i]);
				for (var j = cur.length - 1; j >= 0; j--){
					var inst = $.data(cur[j], 'sortable');
					if(inst && inst != this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), inst]);
					}
				};
			};
		}

		queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), this]);

		for (var i = queries.length - 1; i >= 0; i--){
			queries[i][0].each(function() {
				items.push(this);
			});
		};

		return $(items);

	},

	_removeCurrentsFromItems: function() {

		var list = this.currentItem.find(":data(sortable-item)");

		for (var i=0; i < this.items.length; i++) {

			for (var j=0; j < list.length; j++) {
				if(list[j] == this.items[i].item[0])
					this.items.splice(i,1);
			};

		};

	},

	_refreshItems: function(event) {

		this.items = [];
		this.containers = [this];
		var items = this.items;
		var self = this;
		var queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]];
		var connectWith = this._connectWith();

		if(connectWith) {
			for (var i = connectWith.length - 1; i >= 0; i--){
				var cur = $(connectWith[i]);
				for (var j = cur.length - 1; j >= 0; j--){
					var inst = $.data(cur[j], 'sortable');
					if(inst && inst != this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
						this.containers.push(inst);
					}
				};
			};
		}

		for (var i = queries.length - 1; i >= 0; i--) {
			var targetData = queries[i][1];
			var _queries = queries[i][0];

			for (var j=0, queriesLength = _queries.length; j < queriesLength; j++) {
				var item = $(_queries[j]);

				item.data('sortable-item', targetData); // Data for target checking (mouse manager)

				items.push({
					item: item,
					instance: targetData,
					width: 0, height: 0,
					left: 0, top: 0
				});
			};
		};

	},

	refreshPositions: function(fast) {

		//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
		if(this.offsetParent && this.helper) {
			this.offset.parent = this._getParentOffset();
		}

		for (var i = this.items.length - 1; i >= 0; i--){
			var item = this.items[i];

			var t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;

			if (!fast) {
				item.width = t.outerWidth();
				item.height = t.outerHeight();
			}

			var p = t.offset();
			item.left = p.left;
			item.top = p.top;
		};

		if(this.options.custom && this.options.custom.refreshContainers) {
			this.options.custom.refreshContainers.call(this);
		} else {
			for (var i = this.containers.length - 1; i >= 0; i--){
				var p = this.containers[i].element.offset();
				this.containers[i].containerCache.left = p.left;
				this.containers[i].containerCache.top = p.top;
				this.containers[i].containerCache.width	= this.containers[i].element.outerWidth();
				this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
			};
		}

		return this;
	},

	_createPlaceholder: function(that) {

		var self = that || this, o = self.options;

		if(!o.placeholder || o.placeholder.constructor == String) {
			var className = o.placeholder;
			o.placeholder = {
				element: function() {

					var el = $(document.createElement(self.currentItem[0].nodeName))
						.addClass(className || self.currentItem[0].className+" ui-sortable-placeholder")
						.removeClass("ui-sortable-helper")[0];

					if(!className)
						el.style.visibility = "hidden";

					return el;
				},
				update: function(container, p) {

					// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
					// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
					if(className && !o.forcePlaceholderSize) return;

					//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
					if(!p.height()) { p.height(self.currentItem.innerHeight() - parseInt(self.currentItem.css('paddingTop')||0, 10) - parseInt(self.currentItem.css('paddingBottom')||0, 10)); };
					if(!p.width()) { p.width(self.currentItem.innerWidth() - parseInt(self.currentItem.css('paddingLeft')||0, 10) - parseInt(self.currentItem.css('paddingRight')||0, 10)); };
				}
			};
		}

		//Create the placeholder
		self.placeholder = $(o.placeholder.element.call(self.element, self.currentItem));

		//Append it after the actual current item
		self.currentItem.after(self.placeholder);

		//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
		o.placeholder.update(self, self.placeholder);

	},

	_contactContainers: function(event) {
		
		// get innermost container that intersects with item 
		var innermostContainer = null, innermostIndex = null;		
		
		
		for (var i = this.containers.length - 1; i >= 0; i--){

			// never consider a container that's located within the item itself 
			if($.ui.contains(this.currentItem[0], this.containers[i].element[0]))
				continue;

			if(this._intersectsWith(this.containers[i].containerCache)) {

				// if we've already found a container and it's more "inner" than this, then continue 
				if(innermostContainer && $.ui.contains(this.containers[i].element[0], innermostContainer.element[0]))
					continue;

				innermostContainer = this.containers[i]; 
				innermostIndex = i;
					
			} else {
				// container doesn't intersect. trigger "out" event if necessary 
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", event, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}
		
		// if no intersecting containers found, return 
		if(!innermostContainer) return; 

		// move the item into the container if it's not there already
		if(this.containers.length === 1) {
			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
			this.containers[innermostIndex].containerCache.over = 1;
		} else if(this.currentContainer != this.containers[innermostIndex]) { 

			//When entering a new container, we will find the item with the least distance and append our item near it 
			var dist = 10000; var itemWithLeastDistance = null; var base = this.positionAbs[this.containers[innermostIndex].floating ? 'left' : 'top']; 
			for (var j = this.items.length - 1; j >= 0; j--) { 
				if(!$.ui.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) continue; 
				var cur = this.items[j][this.containers[innermostIndex].floating ? 'left' : 'top']; 
				if(Math.abs(cur - base) < dist) { 
					dist = Math.abs(cur - base); itemWithLeastDistance = this.items[j]; 
				} 
			} 

			if(!itemWithLeastDistance && !this.options.dropOnEmpty) //Check if dropOnEmpty is enabled 
				return; 

			this.currentContainer = this.containers[innermostIndex]; 
			itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true); 
			this._trigger("change", event, this._uiHash()); 
			this.containers[innermostIndex]._trigger("change", event, this._uiHash(this)); 

			//Update the placeholder 
			this.options.placeholder.update(this.currentContainer, this.placeholder); 
		
			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this)); 
			this.containers[innermostIndex].containerCache.over = 1;
		} 
	
		
	},

	_createHelper: function(event) {

		var o = this.options;
		var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper == 'clone' ? this.currentItem.clone() : this.currentItem);

		if(!helper.parents('body').length) //Add the helper to the DOM if that didn't happen already
			$(o.appendTo != 'parent' ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);

		if(helper[0] == this.currentItem[0])
			this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };

		if(helper[0].style.width == '' || o.forceHelperSize) helper.width(this.currentItem.width());
		if(helper[0].style.height == '' || o.forceHelperSize) helper.height(this.currentItem.height());

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj == 'string') {
			obj = obj.split(' ');
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ('left' in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ('right' in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ('top' in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ('bottom' in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {


		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
		|| (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.browser.msie)) //Ugly IE fix
			po = { top: 0, left: 0 };

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition == "relative") {
			var p = this.currentItem.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
			top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var o = this.options;
		if(o.containment == 'parent') o.containment = this.helper[0].parentNode;
		if(o.containment == 'document' || o.containment == 'window') this.containment = [
			0 - this.offset.relative.left - this.offset.parent.left,
			0 - this.offset.relative.top - this.offset.parent.top,
			$(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
			($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
		];

		if(!(/^(document|window|parent)$/).test(o.containment)) {
			var ce = $(o.containment)[0];
			var co = $(o.containment).offset();
			var over = ($(ce).css("overflow") != 'hidden');

			this.containment = [
				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
			];
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) pos = this.position;
		var mod = d == "absolute" ? 1 : -1;
		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top																	// The absolute mouse position
				+ this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left																// The absolute mouse position
				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		// This is another very weird special case that only happens for relative elements:
		// 1. If the css position is relative
		// 2. and the scroll parent is the document or similar to the offset parent
		// we have to refresh the relative offset during the scroll so there are no jumps
		if(this.cssPosition == 'relative' && !(this.scrollParent[0] != document && this.scrollParent[0] != this.offsetParent[0])) {
			this.offset.relative = this._getRelativeOffset();
		}

		var pageX = event.pageX;
		var pageY = event.pageY;

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options

			if(this.containment) {
				if(event.pageX - this.offset.click.left < this.containment[0]) pageX = this.containment[0] + this.offset.click.left;
				if(event.pageY - this.offset.click.top < this.containment[1]) pageY = this.containment[1] + this.offset.click.top;
				if(event.pageX - this.offset.click.left > this.containment[2]) pageX = this.containment[2] + this.offset.click.left;
				if(event.pageY - this.offset.click.top > this.containment[3]) pageY = this.containment[3] + this.offset.click.top;
			}

			if(o.grid) {
				var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
				pageY = this.containment ? (!(top - this.offset.click.top < this.containment[1] || top - this.offset.click.top > this.containment[3]) ? top : (!(top - this.offset.click.top < this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
				pageX = this.containment ? (!(left - this.offset.click.left < this.containment[0] || left - this.offset.click.left > this.containment[2]) ? left : (!(left - this.offset.click.left < this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY																// The absolute mouse position
				- this.offset.click.top													// Click offset (relative to the element)
				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX																// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_rearrange: function(event, i, a, hardRefresh) {

		a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction == 'down' ? i.item[0] : i.item[0].nextSibling));

		//Various things done here to improve the performance:
		// 1. we create a setTimeout, that calls refreshPositions
		// 2. on the instance, we have a counter variable, that get's higher after every append
		// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
		// 4. this lets only the last addition to the timeout stack through
		this.counter = this.counter ? ++this.counter : 1;
		var self = this, counter = this.counter;

		window.setTimeout(function() {
			if(counter == self.counter) self.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
		},0);

	},

	_clear: function(event, noPropagation) {

		this.reverting = false;
		// We delay all events that have to be triggered to after the point where the placeholder has been removed and
		// everything else normalized again
		var delayedTriggers = [], self = this;

		// We first have to update the dom position of the actual currentItem
		// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
		if(!this._noFinalSort && this.currentItem[0].parentNode) this.placeholder.before(this.currentItem);
		this._noFinalSort = null;

		if(this.helper[0] == this.currentItem[0]) {
			for(var i in this._storedCSS) {
				if(this._storedCSS[i] == 'auto' || this._storedCSS[i] == 'static') this._storedCSS[i] = '';
			}
			this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
		} else {
			this.currentItem.show();
		}

		if(this.fromOutside && !noPropagation) delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
		if((this.fromOutside || this.domPosition.prev != this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent != this.currentItem.parent()[0]) && !noPropagation) delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed
		if(!$.ui.contains(this.element[0], this.currentItem[0])) { //Node was moved out of the current element
			if(!noPropagation) delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
			for (var i = this.containers.length - 1; i >= 0; i--){
				if($.ui.contains(this.containers[i].element[0], this.currentItem[0]) && !noPropagation) {
					delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
					delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.containers[i]));
				}
			};
		};

		//Post events to containers
		for (var i = this.containers.length - 1; i >= 0; i--){
			if(!noPropagation) delayedTriggers.push((function(c) { return function(event) { c._trigger("deactivate", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
			if(this.containers[i].containerCache.over) {
				delayedTriggers.push((function(c) { return function(event) { c._trigger("out", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
				this.containers[i].containerCache.over = 0;
			}
		}

		//Do what was originally in plugins
		if(this._storedCursor) $('body').css("cursor", this._storedCursor); //Reset cursor
		if(this._storedOpacity) this.helper.css("opacity", this._storedOpacity); //Reset opacity
		if(this._storedZIndex) this.helper.css("zIndex", this._storedZIndex == 'auto' ? '' : this._storedZIndex); //Reset z-index

		this.dragging = false;
		if(this.cancelHelperRemoval) {
			if(!noPropagation) {
				this._trigger("beforeStop", event, this._uiHash());
				for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
				this._trigger("stop", event, this._uiHash());
			}
			return false;
		}

		if(!noPropagation) this._trigger("beforeStop", event, this._uiHash());

		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
		this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

		if(this.helper[0] != this.currentItem[0]) this.helper.remove(); this.helper = null;

		if(!noPropagation) {
			for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
			this._trigger("stop", event, this._uiHash());
		}

		this.fromOutside = false;
		return true;

	},

	_trigger: function() {
		if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
			this.cancel();
		}
	},

	_uiHash: function(inst) {
		var self = inst || this;
		return {
			helper: self.helper,
			placeholder: self.placeholder || $([]),
			position: self.position,
			originalPosition: self.originalPosition,
			offset: self.positionAbs,
			item: self.currentItem,
			sender: inst ? inst.element : null
		};
	}

});

$.extend($.ui.sortable, {
	version: "1.8.4"
});

})(jQuery);

/** suggest_expected_type.js **/
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
          css: {
            status: "fbs-status fbs-ect-status"
          },
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

/** suggest_property.js **/
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
 * A specialize suggest plugin for properties.
 */
;(function($) {

  if (!$.suggest) {
    alert("$.suggest required");
  }

  var base = {
    create_item: $.suggest.suggest.prototype.create_item
  };

  $.suggest("suggest_property",
    $.extend(true, {}, $.suggest.suggest.prototype, {
      create_item: function(data, response_data) {
        var li = base.create_item.apply(this, [data, response_data]);
        var type = data.id.split("/");
        type.pop();
        type = type.join("/");
        $("."+this.options.css.item_type, li).text(type);
        return li;
      }
    }));

    $.extend($.suggest.suggest_property, {
      defaults: $.extend(true, {}, $.suggest.suggest.defaults, {
        type: "/type/property",
        type_strict: "any",
        css: {
          status: "fbs-status fbs-ect-status"
        }
      })
    });

})(jQuery);

/** type-edit.js **/
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

  var se = fb.schema.edit;   // required;

  var te = fb.schema.type.edit = {

    /**
     * type settings form
     */
    type_settings_begin: function(trigger, type_id) {
      $.ajax({
        url: fb.acre.request.app_url + "/schema/type/type_settings_begin",
        data: {id:type_id},
        dataType: "json",
        success: function(data, status, xhr) {
          var html = $(data.result.html);
          var form = {
            event_prefix: "fb.schema.type.settings.",
            ajax: {
              url: fb.acre.request.app_url + "/schema/type/type_settings_submit",
              data: {id: type_id}
            },

            init_form: te.init_type_settings_form,
            validate_form: te.validate_type_settings_form,
            submit_form: te.submit_type_settings_form,

            form: html
          };

          se.init_modal_form(form);

          form.form
            .bind(form.event_prefix + "success", function(e, data) {
              window.location = data.location;
            });
        }
      });
    },

    init_type_settings_form: function(form) {
      var name = $("input[name=name]:visible", form.form);
      var key = $("input[name=key]", form.form);
      se.auto_key(name, key);

      // enter key
      $(":input:not(textarea)", form.form)
        .keypress(function(e) {
          if (e.keyCode === 13 && !e.isDefaultPrevented()) { // enter
            form.form.trigger(form.event_prefix + "submit");
          }
        });

      //Confirm dialog for deleting a type
      $(".button-delete", form.form).click(function() {
        var container = $(this).parent().siblings().find(".modal-content");
        var button_row = $(".modal-buttons", form.form).animate({opacity:0}, 500);
        var confirm_dialog = $(".modal-help", container).height(container.height()).slideDown();
        var cancel_button = $(".button-cancel", container).click(function(e) {
          button_row.animate({opacity:1}, 500);
          confirm_dialog.slideUp();
        });
        var delete_button = $(".button-submit", container).click(function(e) {
          if (form.form.is(".loading")) {
            return;
          }
          form.form.addClass("loading");
          var data = {
            id : form.ajax.data.id,
            user: fb.user.id
          };
          $.ajax({
            url: fb.acre.request.app_url + "/schema/type/delete_type_submit",
            type: "POST",
            dataType: "json",
            data: data,
            success: function(data, status, xhr) {
              if (data.code === "/api/status/error") {
                return se.ajax_error_handler(xhr, null, form.form);
              }
              form.form.trigger(form.event_prefix + "success", data.result);
            },
            error: function(xhr) {
              se.ajax_error_handler(xhr, null, form.form);
              cancel_button.click();
            }
          });
        });
      });

    },

    validate_type_settings_form: function(form) {
      var name = $.trim($("input[name=name]:visible", form.form).val());
      var key =  $("input[name=key]", form.form);
      var keyval = key.val();
      if (name === "" || keyval === "") {
        form.form.trigger(form.event_prefix + "error", "Name and Key are required");
      }
      else if (key.data("original") !== keyval) {
        try {
          se.check_key_type(keyval);
        }
        catch (e) {
          form.form.trigger(form.event_prefix + "error", e);
        }
      }
    },

    submit_type_settings_form: function(form) {
      var key =  $("input[name=key]", form.form);
      var data = {
        name: $.trim($("input[name=name]:visible", form.form).val()),
        key: key.val(),
        domain: $("input[name=namespace]", form.form).val(),
        description: $.trim($("textarea[name=description]:visible", form.form).val()),
        lang: $("select[name=lang]", form.form).val()
      };

      var kind = $("input[name=kind]:checked", form.form).val();
      if (kind === "regular") {
        data.enumeration = data.mediator = 0;
      }
      else if (kind === "enumeration") {
        data.enumeration = 1;
        data.mediator = 0;
      }
      else if (kind === "mediator") {
        data.enumeration = 0;
        data.mediator = 1;
      }

      $.ajax({
        url: form.ajax.url,
        type: "POST",
        dataType: "json",
        data: $.extend(data, form.ajax.data),
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, null, form.form);
          }
          form.form.trigger(form.event_prefix + "success", data.result);
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, null, form.form);
        }
      });
    },

    init_delegate_property: function(form) {
      $(".nav-toggle", form.row).click(function(e) {
        te.toggle_delegate_property($(this), form);
        return false;
      });
    },

    toggle_delegate_property: function(trigger, form) {
      if (trigger.is(".current")) {
        return false;
      }
      var nav = trigger.parents(".nav:first");
      $(".nav-toggle", nav).removeClass("current");
      trigger.addClass("current");

      // clear all input values under expected type field
      var ect_field = $(".fb-property-expected-type", form.row);
      $("input", ect_field).val("");
      // reset unique checkbox
      var unique = $("input[name=unique]", form.row).removeAttr("checked");
      // remove any form messages
      $(".form-msg", form.row).remove();

      if (trigger.is(".nav-delegate")) {
        // show delegate message
        $(".nav-delegate-msg", nav).show();
        // hide ect input and update label
        $("input[name=expected_type_input]", form.row).hide()
          .prev(".form-label").text("Property to use");
        // show property input
        var delegated = $("input[name=delegated]", form.row).show();
        // update Master checkbox and disable unique
        $("label[for=master]", form.row).find("span").text("Delegated");
        unique.attr("disabled", "disabled");
        var inst = delegated.data("suggest_property");
        if (!inst) {
          // init suggest
          delegated
            .unbind()
            .suggest_property({
              service_url: fb.acre.freebase.site_host
            })
            .bind("fb-select", function(e, data) {
              $(this).val(data.id);
              setTimeout(function() {
                te.delegate_property_begin(form, data.id);
              }, 0);
            })
            .keypress(function(e) {
              if (e.keyCode === 13 && !e.isDefaultPrevented()) { // enter
                form.row.trigger(form.event_prefix + "submit");
              }
            })
            .keyup(function(e) {
              if (e.keyCode === 27) { // escape
                form.row.trigger(form.event_prefix + "cancel");
              }
            });
        }
      }
      else {
        // hide delegate message
        $(".nav-delegate-msg", nav).hide();
        // hide property input
        $("input[name=delegated]", form.row).hide();
        // show ect input
        $("input[name=expected_type_input]", form.row).show()
          .prev(".form-label").text("Expected Type");
        // update Master checkbox and re-enable unique
        $("label[for=master]", form.row).find("span").text("Master");
        unique.removeAttr("disabled");
      }
      $("input[name=name]", form.row).focus();
    },

    delegate_property_begin: function(form, prop_id) {
      form.row.addClass("loading");
      $.ajax({
        url: fb.acre.request.app_url + "/schema/type/delegate_property_begin",
        data: {id: prop_id},
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, form.row);
          }
          var result = data.result;

          // set and disable expected_type and unique
          var ect_data = {
            id : result.expected_type,
            unit: result.unit
          };
          $("input[name=expected_type_input]", form.row).trigger("fb-select", ect_data);
          if (result.unique) {
            $("input[name=unique]", form.row).attr("checked", "checked");
          }
          // show delegated message
          $(".form-msg", form.row).remove();
          var field = $(".form-field:first", form.row);
          var message = $(result.message);
          field.before(message);
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, form.row);
        },
        complete: function() {
          form.row.removeClass("loading");
        }
      });
    },

    /**
     * retrieve add_property form (ajax).
     */
    add_property_begin: function(trigger, type_id) {
      var trigger_row = trigger.parents("tr:first");
      $.ajax({
        url: fb.acre.request.app_url + "/schema/type/add_property_begin",
        data: {id: type_id},
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, trigger_row);
          }
          // add edit-form after the edit button
          var html = $(data.result.html);

          var form = {
            mode: "add",
            event_prefix: "fb.schema.type.add.property.",
            ajax: {
              url: fb.acre.request.app_url + "/schema/type/add_property_submit"
            },

            init_form: te.init_property_form,
            validate_form: te.validate_property_form,
            submit_form: te.submit_property_form,

            table: trigger.parents("table:first"),
            trigger: trigger,
            trigger_row: trigger_row,
            row: $(".edit-row", html).hide(),
            submit_row: $(".edit-row-submit", html).hide()
          };
          se.init_edit_form(form);

          // delegate property dialog
          te.init_delegate_property(form);

          /**
           * after submit success, re-init form for additional adds
           */
          form.row.bind("fb.schema.type.add.property.success", function() {
            // show headers if showing the empty message
            var empty_msg = $("tbody:first .table-empty-column", form.table);
            if (empty_msg.length) {
              empty_msg.parents("tr:first").hide().prev("tr").show();
            }
            // show reorder link if props > 1
            te.toggle_reorder_link(form.table);
            // change submit text to 'Done'
            $(".button-cancel", form.submit_row).text("Done");
            te.init_property_form(form);
          });
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, trigger_row);
        }
      });
    },


    edit_property_begin: function(trigger, prop_id) {
      var trigger_row = trigger.parents("tr:first");
      $.ajax({
        url: fb.acre.request.app_url + "/schema/type/edit_property_begin",
        data: {id: prop_id},
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, trigger_row);
          }
          // add edit-form after the edit button
          var html = $(data.result.html);
          var form = {
            mode: "edit",
            event_prefix: "fb.schema.type.edit.property.",
            ajax: {
              url: fb.acre.request.app_url + "/schema/type/edit_property_submit",
              data: {id: prop_id}
            },

            init_form: te.init_property_form,
            validate_form: te.validate_property_form,
            submit_form: te.submit_property_form,

            table: trigger.parents("table:first"),
            trigger: trigger,
            trigger_row: trigger_row,
            row: $(".edit-row", html).hide(),
            submit_row: $(".edit-row-submit", html).hide()
          };

          se.init_edit_form(form);

         /**
           * after submit success, we're done editing, remove form and old row
           */
          form.row.bind("fb.schema.type.edit.property.success", function() {
            form.trigger_row.remove(); // old row
            form.row.remove();
            form.submit_row.remove();
          });
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, trigger_row);
        }
      });
    },

    /**
     * init property form
     */
    init_property_form: function(form) {
      var name = $("input[name=name]", form.row);
      var key =  $("input[name=key]", form.row);
      var expected_type_input = $("input[name=expected_type_input]", form.row);
      var expected_type = $("input[name=expected_type]", form.row);
      var expected_type_new = $("input[name=expected_type_new]", form.row);
      var unit = $("input[name=unit]", form.row);
      // this is /type/property/enumeration (namespace)
      var enumeration = $("input[name=enumeration]", form.row);
      var description = $("textarea[name=description]", form.row);
      var disambiguator = $("input[name=disambiguator]", form.row);
      var unique = $("input[name=unique]", form.row);
      var hidden = $("input[name=hidden]", form.row);
      var type = $("input[name=type]", form.row);

      if (form.mode === "add") {
        $(".nav-toggle:first", form.row).click(); // reset delegate property form
        name.val("");
        key.val("");
        expected_type_input.val("");
        expected_type.val("");
        expected_type_new.val("");
        unit.val("");
        description.val("");
        $.each([disambiguator, unique, hidden], function(i, checkbox) {
          if (!checkbox.is(":disabled")) {
            checkbox.removeAttr("checked");
          }
        });
      }

      if (!form.row.data("initialized")) {
        se.auto_key(name, key, "/type/property");
        //
        // suggest expected_type
        //
        // this is a hacky way to get the domain id of the current context of the property form
        var domain = type.val().split("/");
        domain.pop();
        domain = domain.join("/");
        expected_type_input.suggest_expected_type({
          service_url: fb.acre.freebase.site_host,
          suggest_new: "Create new type",
          domain: domain
        })
        .bind("fb-select", function(e, data) {
          if (data.unit) {
            expected_type_input.val(data.id + " (" + data.unit.name + ")");
            expected_type.val(data.id);
            expected_type_new.val("");
            unit.val(data.unit.id);
          }
          else if (data.enumeration) { // /type/property/enumeration (namespace)
            expected_type_input.val(data.id + " (" + data.enumeration + ")");
            expected_type.val(data.id);
            expected_type_new.val("");
            enumeration.val(data.enumeration);
          }
          else {
            expected_type_input.val(data.id);
            expected_type.val(data.id);
            expected_type_new.val("");
            unit.val("");
            if (data.id === "/type/boolean") {
              // auto-check unique on /type/boolean
              $("input[name=unique]", form.row).attr("checked", "checked");
            }
          }
        })
        .bind("fb-textchange", function() {
          expected_type.val("");
          expected_type_new.val("");
          unit.val("");
        })
        .bind("fb-select-new", function(e, val) {
          expected_type_new.val($.trim(val));
          expected_type.val("");
          unit.val("");
        });

        // enter/escape key handler
        $(":input:not(textarea)", form.row)
          .keypress(function(e) {
            if (e.keyCode === 13 && !e.isDefaultPrevented()) { // enter
              form.row.trigger(form.event_prefix + "submit");
            }
          })
          .keyup(function(e) {
            if (e.keyCode === 27) { // escape
              form.row.trigger(form.event_prefix + "cancel");
            }
          });

        form.row.data("initialized", true);
      }
      name.focus();
    },

    /**
     * validate rows, if no errors submit
     */
    submit_property_form: function(form) {
      var key =  $(":input[name=key]", form.row);
      var data = {
        type:  $(":input[name=type]", form.row).val(),
        name: $.trim($("input[name=name]:visible", form.row).val()),
        key: key.val(),
        expected_type: $(":input[name=expected_type]", form.row).val(),
        expected_type_new: $(":input[name=expected_type_new]", form.row).val(),
        unit: $(":input[name=unit]", form.row).val(),
        // this is /type/prperty/enumeration (namespace)
        enumeration: $("input[name=enumeration]", form.row).val(),
        description: $.trim($("textarea[name=description]:visible", form.row).val()),
        disambiguator: $(":input[name=disambiguator]", form.row).is(":checked") ? 1 : 0,
        unique: $(":input[name=unique]", form.row).is(":checked") ? 1 : 0,
        hidden: $(":input[name=hidden]", form.row).is(":checked") ? 1 : 0,
        lang: $("select[name=lang]", form.submit_row).val()
      };

      // special delgate property logic
      // we want to be careful submitting the "delegated" paramter
      if (form.mode === "add") {
        if ($(".nav-delegate", form.row).is(".current")) {
          // sanity check we are actually in the delegate tab
          data.delegated = $(":input[name=delegated]", form.row).val();
        }
      }

      var ajax_options = {
        url: form.ajax.url,
        type: "POST",
        dataType: "json",
        data: $.extend(data, form.ajax.data)
      };

      ajax_options.success = form.ajax.success || function(data, status, xhr) {
        if (data.code === "/api/status/error") {
          return se.ajax_error_handler(xhr, form.row);
        }
        var new_row = $(data.result.html).addClass("new-row");
        form.row.before(new_row);
        new_row.hide();
        new_row.showRow(function() {
          // init row menu
          fb.schema.init_row_menu(new_row);
          // show edit controls in tooltip
          $(".edit", new_row).show();
        }, null, "slow");
        form.row.trigger(form.event_prefix + "success");
      };

      ajax_options.error = form.ajax.error || function(xhr) {
        se.ajax_error_handler(xhr, form.row);
      };

      $.ajax(ajax_options);
    },

    /**
     * validate row
     */
    validate_property_form: function(form) {
      var name = $.trim($("input[name=name]:visible", form.row).val());
      var key =  $("input[name=key]", form.row);
      var keyval = key.val();
      var ect = $(":input[name=expected_type]", form.row).val();
      var ect_new = $(":input[name=expected_type_new]", form.row).val();
      if (name === "" || keyval === "" || (ect === "" && ect_new === "")) {
        form.row.trigger(form.event_prefix + "error", [form.row, "Name, Key and Expected Type are required"]);
      }
      else if (key.data("original") !== keyval) {
        try {
          se.check_key_property(keyval);
        }
        catch (e) {
          form.row.trigger(form.event_prefix + "error", [form.row, e]);
        }
      }
    },


    /**
     * delete property
     */
    delete_property_begin: function(trigger, prop_id) {
      var row = trigger.parents("tr:first");
      var table = row.parents("table:first");
      $.ajax({
        url: fb.acre.request.app_url + "/schema/type/delete_property_submit",
        data: {id: prop_id, user: fb.user.id},
        type: "POST",
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, row);
          }
          var new_row = $(data.result.html).addClass("new-row");
          row.before(new_row);
          new_row.hide();
          row.remove();
          new_row.showRow();
          te.toggle_reorder_link(table);
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, row);
        }
      });
    },

    /**
     * undo delete type
     */
    undo_delete_property_begin: function(trigger, prop_info) {
      var row = trigger.parents("tr:first");
      var table = row.parents("table:first");
      $.ajax({
        url: fb.acre.request.app_url + "/schema/type/undo_delete_property_submit",
        data: {prop_info: JSON.stringify(prop_info)},
        type: "POST",
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, row);
          }
          var new_row = $(data.result.html).addClass("new-row");
          row.before(new_row);
          new_row.hide();
          row.remove();
          new_row.showRow(function() {
            fb.schema.init_row_menu(new_row);
            // show edit controls in tooltip
            $(".edit", new_row).show();
            te.toggle_reorder_link(table);
          }, null, "slow");
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, row);
        }
      });
    },

    /**
     * add included_type
     */
    add_included_type_begin: function(trigger, type_id) {
      var trigger_row = trigger.parents("tr:first");
      $.ajax({
        url: fb.acre.request.app_url + "/schema/type/add_included_type_begin",
        data: {id: type_id},
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, trigger_row);
          }

          // add edit-form after the edit button
          var html = $(data.result.html);
          var form = {
            mode: "edit",
            event_prefix: "fb.schema.type.add.included_type.",
            ajax: {
              url: fb.acre.request.app_url + "/schema/type/add_included_type_submit"
            },

            init_form: te.init_included_type_form,
            validate_form: te.validate_included_type_form,
            submit_form: te.submit_included_type_form,

            table: trigger.parents("table:first"),
            trigger: trigger,
            trigger_row: trigger_row,
            row: $(".edit-row", html).hide(),
            submit_row: $(".edit-row-submit", html).hide()
          };

          se.init_edit_form(form);

          /**
           * after submit success, we're done editing, remove form and old row
           */
          form.row.bind("fb.schema.type.add.included_type.success", function() {
            $(".button-cancel", form.submit_row).text("Done");
            te.init_included_type_form(form);
          });
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, trigger_row);
        }
      });
    },

    init_included_type_form: function(form) {
      var included_type_input = $("input[name=included_type_input]", form.row).val("");
      var included_type = $("input[name=included_type]", form.row).val("");
      var included_type_new = $("input[name=included_type_new]", form.row).val("");

      if (!form.row.data("initialized")) {
        included_type_input.suggest({
          service_url: fb.acre.freebase.site_host,
          category: "cotype",
          suggest_new: "Create new type"
        })
        .bind("fb-select", function(e, data) {
          included_type_input.val(data.id);
          included_type.val(data.id);
        })
        .bind("fb-textchange", function() {
          included_type.val("");
        })
        .bind("fb-select-new", function(e, val) {
          included_type_new.val($.trim(val));
          included_type.val("");
        });

        // enter/escape key handler
        $(":input:not(textarea)", form.row)
          .keypress(function(e) {
            if (e.keyCode === 13 && !e.isDefaultPrevented()) { // enter
              form.row.trigger(form.event_prefix + "submit");
            }
          })
          .keyup(function(e) {
            if (e.keyCode === 27) { // escape
              form.row.trigger(form.event_prefix + "cancel");
            }
          });
        form.row.data("initialized", true);
      }
      included_type_input.focus();
    },

    validate_included_type_form: function(form) {
      var included_type = $.trim($(":input[name=included_type]", form.row).val());
      var included_type_new = $(":input[name=included_type_new]", form.row).val();
      if (included_type === "" && included_type_new === "") {
        form.row.trigger(form.event_prefix + "error", [form.row, "Please choose a type to include"]);
      }
    },

    submit_included_type_form: function(form) {
      var data = {
        id: $(":input[name=id]", form.row).val(),
        included_type: $.trim($(":input[name=included_type]", form.row).val()),
        included_type_new: $(":input[name=included_type_new]", form.row).val()
      };
      $.ajax({
        url: form.ajax.url,
        type: "POST",
        dataType: "json",
        data: $.extend(data, form.ajax.data),
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, form.row);
          }

          var container = $("<table>");
          container.html(data.result.html);
          var theads = $(">thead", container);
          form.table.append(theads);
          var rows = $("tr:first", theads).hide();
          rows.showRow(function() {
            // init expand/collapse
            $(".tbody-header", theads).each(function() {
              $(this).data("ajax", true).click(fb.schema.type.toggle);
              $(".edit", this).show();
            });
            form.row.trigger(form.event_prefix + "success");
          }, null, "slow");
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, form.row);
        }
      });
    },

    delete_included_type_begin: function(trigger, type_id, included_type_id) {
      var row = trigger.parents("tr:first");
      var table = row.parents("table:first");
      $.ajax({
        url: fb.acre.request.app_url + "/schema/type/delete_included_type_submit",
        data: {id: type_id, included_type: included_type_id},
        type: "POST",
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, row);
          }
          var new_row = $(data.result.html).addClass("new-row");
          row.before(new_row);
          new_row.hide();
          row.parent("thead").next("tbody:first").remove();
          row.remove();
          new_row.showRow();
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, row);
        }
      });
    },

    undo_delete_included_type_begin: function(trigger, type_id, included_type_id) {
      var row = trigger.parents("tr:first");
      var table = row.parents("table:first");
      $.ajax({
        url: fb.acre.request.app_url + "/schema/type/undo_delete_included_type_submit",
        data: {id: type_id, included_type: included_type_id},
        type: "POST",
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, row);
          }
          var new_thead = $(data.result.html);
          var new_row = $(">tr", new_thead).addClass("new-row");
          var old_thead = row.parents("thead:first");

          old_thead.before(new_thead);
          new_row.hide();
          old_thead.remove();
          new_row.showRow(function() {
            $(".tbody-header", new_row).each(function() {
              $(this).data("ajax", true).click(fb.schema.type.toggle);
              $(".edit", this).show();
            });
          }, null, "slow");
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, row);
        }
      });
    },

    reverse_property_begin: function(trigger, type_id, master_id) {
      var trigger_row = trigger.parents("tr:first");
      $.ajax({
        url: fb.acre.request.app_url + "/schema/type/reverse_property_begin",
        data: {id: type_id, master: master_id},
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, trigger_row);
          }
          var html = $(data.result.html);
          var form = {
            mode: "edit",
            event_prefix: "fb.schema.type.reverse.property.",
            ajax: {
              url: fb.acre.request.app_url + "/schema/type/add_property_submit",
              data: {master_property: master_id},
              success: function(data, status, xhr) {
                if (data.code === "/api/status/error") {
                  return se.ajax_error_handler(xhr, form.row);
                }
                te.reverse_property_success(form, data);
              }
            },

            init_form: te.init_property_form,
            validate_form: te.validate_property_form,
            submit_form: te.submit_property_form,

            table: trigger.parents("table:first"),
            trigger: trigger,
            trigger_row: trigger_row,
            row: $(".edit-row", html).hide(),
            submit_row: $(".edit-row-submit", html).hide()
          };

          se.init_edit_form(form);
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, trigger_row);
        }
      });
    },

    reverse_property_success: function(form, data) {
      var new_row = $(data.result.html).addClass("new-row");
      var prop_table = $("#type-table table:first");
      var prop_body = $("> tbody", prop_table);
      prop_body.append(new_row);
      new_row.hide();
      new_row.showRow(function() {
        // init row menu
        fb.schema.init_row_menu(new_row);
        fb.schema.type.init_tooltips(new_row);
        // show edit controls in tooltip
        $(".edit", new_row).show();
      }, null, "slow");

      // show headers if showing the empty message
      var empty_msg = $(".table-empty-column", prop_body);
      if (empty_msg.length) {
        empty_msg.parents("tr:first").hide().prev("tr").show();
      }

      form.trigger_row.remove(); // old row
      form.row.remove();
      form.submit_row.remove();

      te.toggle_reorder_link(prop_table);
    },

    /**
     * Add a topic to an enumerated type.
     */
    add_instance_begin: function(trigger, type_id) {
      var trigger_row = trigger.parents("tr:first");
      $.ajax({
        url: fb.acre.request.app_url + "/schema/type/add_instance_begin",
        data: {id: type_id},
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, trigger_row);
          }
          var html = $(data.result.html);

          var form = {
            mode: "add",
            event_prefix: "fb.schema.type.add.instance.",
            ajax: {
              url: fb.acre.request.app_url + "/schema/type/add_instance_submit",
              data: {type:type_id}
            },

            init_form: te.init_instance_form,
            validate_form: te.validate_instance_form,
            submit_form: te.submit_instance_form,

            table: trigger.parents("table:first"),
            trigger: trigger,
            trigger_row: trigger_row,
            row: $(".edit-row", html).hide(),
            submit_row: $(".edit-row-submit", html).hide()
          };

          se.init_edit_form(form);

          /**
           * after submit success, re-init form for additional adds
           */
          form.row.bind(form.event_prefix +"success", function() {
            // show headers if showing the empty message
            var empty_msg = $("tbody:first .table-empty-column", form.table);
            if (empty_msg.length) {
              empty_msg.parents("tr:first").hide().prev("tr").show();
            }
            $(".button-cancel", form.submit_row).text("Done");
            te.init_instance_form(form);
          });
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, trigger_row);
        }
      });
    },

    init_instance_form: function(form) {
      var name = $("input[name=name]", form.row);
      var id =  $("input[name=id]", form.row);
      name.val("");
      id.val("");

      var suggest = name.data("suggest");
      if (!suggest) {
        name.suggest({
          service_url: fb.acre.freebase.site_host,
          suggest_new: "Create new",
          category: "instance"
        })
        .bind("fb-select", function(e, data) {
          id.val(data.id);
        })
        .bind("fb-select-new", function() {
          id.val("");
        })
        .bind("fb-textchange", function() {
          id.val("");
        });

        // enter/escape key handler
        name
          .keypress(function(e) {
            if (e.keyCode === 13 && !e.isDefaultPrevented()) { // enter
              form.row.trigger(form.event_prefix + "submit");
            }
          })
          .keyup(function(e) {
            if (e.keyCode === 27) { // escape
              form.row.trigger(form.event_prefix + "cancel");
            }
          });
      }
      name.focus();
    },

    validate_instance_form: function(form) {
      var name = $.trim($(":input[name=name]", form.row).val());
      var id = $(":input[name=id]", form.row).val();
      if (name === "" && id === "") {
        form.row.trigger(form.event_prefix + "error", [form.row, "Please select or create a new topic"]);
      }
    },

    submit_instance_form: function(form) {
      var name = $(":input[name=name]", form.row);

      var data = {
        name: $.trim(name.val()),
        id: $(":input[name=id]", form.row).val()
      };

      var ajax_options = {
        url: form.ajax.url,
        type: "POST",
        dataType: "json",
        data: $.extend(data, form.ajax.data),
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, form.row);
          }
          var new_row = $(data.result.html).addClass("new-row");
          form.row.before(new_row);
          new_row.hide();
          new_row.showRow(function() {
            // init row menu
            fb.schema.init_row_menu(new_row);
            // show edit controls in tooltip
            $(".edit", new_row).show();
            name.focus();
          }, null, "slow");
          form.row.trigger(form.event_prefix + "success");
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, form.row);
        }
      };

      $.ajax(ajax_options);
    },

    /**
     * Remove a topic from an enumerated type.
     */
    delete_instance_begin: function(trigger, topic_id, type_id) {
      var row = trigger.parents("tr:first");
      var table = row.parents("table:first");
      $.ajax({
        url: fb.acre.request.app_url + "/schema/type/delete_instance_submit",
        data: {id: topic_id, type: type_id},
        type: "POST",
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, row);
          }
          var new_row = $(data.result.html).addClass("new-row");
          row.before(new_row);
          new_row.hide();
          row.remove();
          new_row.showRow();
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, row);
        }
      });
    },

    /**
     * undo delete_instance
     */
    undo_delete_instance_begin: function(trigger, topic_id, type_id) {
      var row = trigger.parents("tr:first");
      var table = row.parents("table:first");
      $.ajax({
        url: fb.acre.request.app_url + "/schema/type/undo_delete_instance_submit",
        data: {id: topic_id, type: type_id},
        type: "POST",
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, row);
          }
          var new_row = $(data.result.html).addClass("new-row");
          row.before(new_row);
          new_row.hide();
          row.remove();
          new_row.showRow(function() {
            fb.schema.init_row_menu(new_row);
            // show edit controls in tooltip
            $(".edit", new_row).show();
          }, null, "slow");
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, row);
        }
      });
    },


    reorder_property_begin: function(trigger, type_id) {
      $.ajax({
        url: fb.acre.request.app_url + "/schema/type/reorder_property_begin",
        data: {id:type_id},
        dataType: "json",
        success: function(data, status, xhr) {
          var html = $(data.result.html);
          var form = {
            event_prefix: "fb.schema.type.reorder.property",
            ajax: {
              url: fb.acre.request.app_url + "/schema/type/reorder_property_submit",
              data: {id: type_id}
            },

            init_form: te.init_reorder_property_form,
            submit_form: te.submit_reorder_property_form,

            form: html
          };

          se.init_modal_form(form);

          form.form
            .bind(form.event_prefix + "success", function(e, data) {
              window.location = data.location;
            });
        }
      });
    },

    init_reorder_property_form: function(form) {
      var list = $(".reorderable", form.form).sortable();
      $(".btn-mv-top", form.form).click(function(e) {
        var row = $(this).parent(".reorderable-item");
        list.prepend(row);
      });
    },

    submit_reorder_property_form: function(form) {
      var properties = [];
      $("input[name=properties]", form.form).each(function() {
        properties.push($(this).val());
      });
      var data = {
        id: $("input[name=type]", form.form).val(),
        properties: properties
      };
      $.ajax({
        url: form.ajax.url,
        type: "POST",
        dataType: "json",
        data: $.extend(data, form.ajax.data),
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, null, form.form);
          }
          form.form.trigger(form.event_prefix + "success", data.result);
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, null, form.form);
        }
      });
    },

    toggle_reorder_link: function(table) {
      var reorder_link = $(".reorder-link", table);
      if ($("> tbody > tr.hoverable", table).length > 1) {
        reorder_link.show();
      }
      else {
        reorder_link.hide();
      }
    }

  };


})(jQuery, window.freebase);
