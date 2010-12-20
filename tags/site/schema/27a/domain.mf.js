
/** schema.mf.js **/

/** template, jquery.showrow.js **/
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
;(function ($) {

  /**
   * jQuery animation (slideUp/Down, fadeIn/Out) does not work on table rows
   * because the animations set "display:block" which break table layout (especially firefox)
   *
   * showRow and hideRow is a workaround by wrapping the contents of each table cell (td)
   * and animating the wrappers, which almost achieves the same effect.
   */

  /**
   * show row animation
   *
   * @param callback - callback once animation is finished
   * @param animation - "slideDown" or "fadeIn", default is "slideDown"
   * @param speed - speed of animation, "slow", "fast", or milliseconds
   */
  $.fn.showRow = function(callback, animation, speed) {
    animation = animation === "fadeIn" ? "fadeIn" : "slideDown";
    var thisArg = this;
    return this.each(function() {
      var row = $(this).hide();
      var td = $("> td, > th", row).wrapInner('<div class="wrapInner" style="display: block;">');
      var wrapInner = $(".wrapInner", td).hide();
      row.show();
      wrapInner[animation](speed, function() {
        $(this).each(function() {
          $(this).replaceWith($(this).contents());
        });
        if (callback) {
          callback.call(thisArg);
        }
      });
    });
  };

  /**
   * hide row animation
   *
   * @param callback - callback once animation is finished
   * @param animation - "slideDown" or "fadeIn", default is "slideDown"
   * @param speed - speed of animation, "slow", "fast", or milliseconds
   */
  $.fn.hideRow = function(callback, animation, speed) {
    animation = animation === "fadeOut" ? "fadeOut" : "slideUp";
    var thisArg = this;
    return this.each(function() {
      var row = $(this).show();
      var td = $("> td, > th", row).wrapInner('<div class="wrapInner" style="display: block;">');
      var wrapInner = $(".wrapInner", td);
      wrapInner[animation](speed, function() {
        $(this).each(function() {
          $(this).replaceWith($(this).contents());
        });
        row.hide();
        if (callback) {
          callback.call(thisArg);
        }
      });
    });
   };

})(jQuery);

/** jquerytools, tabs.js **/
/**
 * @license 
 * jQuery Tools @VERSION Tabs- The basics of UI design.
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/tabs/
 *
 * Since: November 2008
 * Date: @DATE 
 */  
(function($) {
		
	// static constructs
	$.tools = $.tools || {version: '@VERSION'};
	
	$.tools.tabs = {
		
		conf: {
			tabs: 'a',
			current: 'current',
			onBeforeClick: null,
			onClick: null, 
			effect: 'default',
			initialIndex: 0,			
			event: 'click',
			rotate: false,
			
			// 1.2
			history: false
		},
		
		addEffect: function(name, fn) {
			effects[name] = fn;
		}
		
	};
	
	var effects = {
		
		// simple "toggle" effect
		'default': function(i, done) { 
			this.getPanes().hide().eq(i).show();
			done.call();
		}, 
		
		/*
			configuration:
				- fadeOutSpeed (positive value does "crossfading")
				- fadeInSpeed
		*/
		fade: function(i, done) {		
			
			var conf = this.getConf(),            
				 speed = conf.fadeOutSpeed,
				 panes = this.getPanes();
			
			if (speed) {
				panes.fadeOut(speed);	
			} else {
				panes.hide();	
			}

			panes.eq(i).fadeIn(conf.fadeInSpeed, done);	
		},
		
		// for basic accordions
		slide: function(i, done) {
			this.getPanes().slideUp(200);
			this.getPanes().eq(i).slideDown(400, done);			 
		}, 

		/**
		 * AJAX effect
		 */
		ajax: function(i, done)  {			
			this.getPanes().eq(0).load(this.getTabs().eq(i).attr("href"), done);	
		}		
	};   	
	
	var w;
	
	/**
	 * Horizontal accordion
	 * 
	 * @deprecated will be replaced with a more robust implementation
	 */
	$.tools.tabs.addEffect("horizontal", function(i, done) {
	
		// store original width of a pane into memory
		if (!w) { w = this.getPanes().eq(0).width(); }
		
		// set current pane's width to zero
		this.getCurrentPane().animate({width: 0}, function() { $(this).hide(); });
		
		// grow opened pane to it's original width
		this.getPanes().eq(i).animate({width: w}, function() { 
			$(this).show();
			done.call();
		});
		
	});	

	
	function Tabs(root, paneSelector, conf) {
		
		var self = this, 
			 trigger = root.add(this),
			 tabs = root.find(conf.tabs),
			 panes = paneSelector.jquery ? paneSelector : root.children(paneSelector),			 
			 current;
			 
		
		// make sure tabs and panes are found
		if (!tabs.length)  { tabs = root.children(); }
		if (!panes.length) { panes = root.parent().find(paneSelector); }
		if (!panes.length) { panes = $(paneSelector); }
		
		
		// public methods
		$.extend(this, {				
			click: function(i, e) {
				
				var tab = tabs.eq(i);												 
				
				if (typeof i == 'string' && i.replace("#", "")) {
					tab = tabs.filter("[href*=" + i.replace("#", "") + "]");
					i = Math.max(tabs.index(tab), 0);
				}
								
				if (conf.rotate) {
					var last = tabs.length -1; 
					if (i < 0) { return self.click(last, e); }
					if (i > last) { return self.click(0, e); }						
				}
				
				if (!tab.length) {
					if (current >= 0) { return self; }
					i = conf.initialIndex;
					tab = tabs.eq(i);
				}				
				
				// current tab is being clicked
				if (i === current) { return self; }
				
				// possibility to cancel click action				
				e = e || $.Event();
				e.type = "onBeforeClick";
				trigger.trigger(e, [i]);				
				if (e.isDefaultPrevented()) { return; }

				// call the effect
				effects[conf.effect].call(self, i, function() {

					// onClick callback
					e.type = "onClick";
					trigger.trigger(e, [i]);					
				});			
				
				// default behaviour
				current = i;
				tabs.removeClass(conf.current);	
				tab.addClass(conf.current);				
				
				return self;
			},
			
			getConf: function() {
				return conf;	
			},

			getTabs: function() {
				return tabs;	
			},
			
			getPanes: function() {
				return panes;	
			},
			
			getCurrentPane: function() {
				return panes.eq(current);	
			},
			
			getCurrentTab: function() {
				return tabs.eq(current);	
			},
			
			getIndex: function() {
				return current;	
			}, 
			
			next: function() {
				return self.click(current + 1);
			},
			
			prev: function() {
				return self.click(current - 1);	
			},
			
			destroy: function() {
				tabs.unbind(conf.event).removeClass(conf.current);
				panes.find("a[href^=#]").unbind("click.T"); 
				return self;
			}
		
		});

		// callbacks	
		$.each("onBeforeClick,onClick".split(","), function(i, name) {
				
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
	
		
		if (conf.history && $.fn.history) {
			$.tools.history.init(tabs);
			conf.event = 'history';
		}	
		
		// setup click actions for each tab
		tabs.each(function(i) { 				
			$(this).bind(conf.event, function(e) {
				self.click(i, e);
				return e.preventDefault();
			});			
		});
		
		// cross tab anchor link
		panes.find("a[href^=#]").bind("click.T", function(e) {
			self.click($(this).attr("href"), e);		
		}); 
		
		// open initial tab
		if (location.hash) {
			self.click(location.hash);
		} else {
			if (conf.initialIndex === 0 || conf.initialIndex > 0) {
				self.click(conf.initialIndex);
			}
		}				
		
	}
	
	
	// jQuery plugin implementation
	$.fn.tabs = function(paneSelector, conf) {
		
		// return existing instance
		var el = this.data("tabs");
		if (el) { 
			el.destroy();	
			this.removeData("tabs");
		}

		if ($.isFunction(conf)) {
			conf = {onBeforeClick: conf};
		}
		
		// setup conf
		conf = $.extend({}, $.tools.tabs.conf, conf);		
		
		this.each(function() {				
			el = new Tabs($(this), paneSelector, conf);
			$(this).data("tabs", el); 
		});		
		
		return conf.api ? el: this;		
	};		
		
}) (jQuery); 



/** jquerytools, tooltip.js **/
/**
 * @license 
 * jQuery Tools @VERSION Tooltip - UI essentials
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/tooltip/
 *
 * Since: November 2008
 * Date: @DATE 
 */
(function($) { 

	/* 
		removed: oneInstance, lazy, 
		tip must next to the trigger 
		isShown(fully), layout, tipClass, layout
	*/
	
	// static constructs
	$.tools = $.tools || {version: '@VERSION'};
	
	$.tools.tooltip = {
		
		conf: { 
			
			// default effect variables
			effect: 'toggle',			
			fadeOutSpeed: "fast",
			predelay: 0,
			delay: 30,
			opacity: 1,			
			tip: 0,
			
			// 'top', 'bottom', 'right', 'left', 'center'
			position: ['top', 'center'], 
			offset: [0, 0],
			relative: false,
			cancelDefault: true,
			
			// type to event mapping 
			events: {
				def: 			"mouseenter,mouseleave",
				input: 		"focus,blur",
				widget:		"focus mouseenter,blur mouseleave",
				tooltip:		"mouseenter,mouseleave"
			},
			
			// 1.2
			layout: '<div/>',
			tipClass: 'tooltip'
		},
		
		addEffect: function(name, loadFn, hideFn) {
			effects[name] = [loadFn, hideFn];	
		} 
	};
	
	
	var effects = { 
		toggle: [ 
			function(done) { 
				var conf = this.getConf(), tip = this.getTip(), o = conf.opacity;
				if (o < 1) { tip.css({opacity: o}); }
				tip.show();
				done.call();
			},
			
			function(done) { 
				this.getTip().hide();
				done.call();
			} 
		],
		
		fade: [
			function(done) { 
				var conf = this.getConf();
				this.getTip().fadeTo(conf.fadeInSpeed, conf.opacity, done); 
			},  
			function(done) { 
				this.getTip().fadeOut(this.getConf().fadeOutSpeed, done); 
			} 
		]		
	};   

		
	/* calculate tip position relative to the trigger */  	
	function getPosition(trigger, tip, conf) {	

		
		// get origin top/left position 
		var top = conf.relative ? trigger.position().top : trigger.offset().top, 
			 left = conf.relative ? trigger.position().left : trigger.offset().left,
			 pos = conf.position[0];

		top  -= tip.outerHeight() - conf.offset[0];
		left += trigger.outerWidth() + conf.offset[1];
		
		// adjust Y		
		var height = tip.outerHeight() + trigger.outerHeight();
		if (pos == 'center') 	{ top += height / 2; }
		if (pos == 'bottom') 	{ top += height; }
		
		// adjust X
		pos = conf.position[1]; 	
		var width = tip.outerWidth() + trigger.outerWidth();
		if (pos == 'center') 	{ left -= width / 2; }
		if (pos == 'left')   	{ left -= width; }	 
		
		return {top: top, left: left};
	}		

	
	
	function Tooltip(trigger, conf) {

		var self = this, 
			 fire = trigger.add(self),
			 tip,
			 timer = 0,
			 pretimer = 0, 
			 title = trigger.attr("title"),
			 effect = effects[conf.effect],
			 shown,
				 
			 // get show/hide configuration
			 isInput = trigger.is(":input"), 
			 isWidget = isInput && trigger.is(":checkbox, :radio, select, :button, :submit"),			
			 type = trigger.attr("type"),
			 evt = conf.events[type] || conf.events[isInput ? (isWidget ? 'widget' : 'input') : 'def']; 
		
		
		// check that configuration is sane
		if (!effect) { throw "Nonexistent effect \"" + conf.effect + "\""; }					
		
		evt = evt.split(/,\s*/); 
		if (evt.length != 2) { throw "Tooltip: bad events configuration for " + type; } 
		
		
		// trigger --> show  
		trigger.bind(evt[0], function(e) {
			clearTimeout(timer);
			if (conf.predelay) {
				pretimer = setTimeout(function() { self.show(e); }, conf.predelay);	
				
			} else {
				self.show(e);	
			}
			
		// trigger --> hide
		}).bind(evt[1], function(e)  {
			clearTimeout(pretimer);
			if (conf.delay)  {
				timer = setTimeout(function() { self.hide(e); }, conf.delay);	
				
			} else {
				self.hide(e);		
			}
			
		}); 
		
		
		// remove default title
		if (title && conf.cancelDefault) { 
			trigger.removeAttr("title");
			trigger.data("title", title);			
		}		
		
		$.extend(self, {
				
			show: function(e) { 

				// tip not initialized yet
				if (!tip) {
					
					// autogenerated tooltip
					if (title) { 
						tip = $(conf.layout).addClass(conf.tipClass).appendTo(document.body)
							.hide().append(title);
						
					// single tip element for all
					} else if (conf.tip) { 
						tip = $(conf.tip).eq(0);
						
					// manual tooltip
					} else {	
						tip = trigger.next();  
						if (!tip.length) { tip = trigger.parent().next(); } 	 
					}
					
					if (!tip.length) { throw "Cannot find tooltip for " + trigger;	}
				} 
			 	
			 	if (self.isShown()) { return self; }  
				
			 	// stop previous animation
			 	tip.stop(true, true); 			 	
			 	
				// get position
				var pos = getPosition(trigger, tip, conf);			
		
				
				// onBeforeShow
				e = e || $.Event();
				e.type = "onBeforeShow";
				fire.trigger(e, [pos]);				
				if (e.isDefaultPrevented()) { return self; }
		
				
				// onBeforeShow may have altered the configuration
				pos = getPosition(trigger, tip, conf);
				
				// set position
				tip.css({position:'absolute', top: pos.top, left: pos.left});					
				
				shown = true;
				
				// invoke effect 
				effect[0].call(self, function() {
					e.type = "onShow";
					shown = 'full';
					fire.trigger(e);		 
				});					

	 	
				// tooltip events       
				var event = conf.events.tooltip.split(/,\s*/);

				tip.bind(event[0], function() { 
					clearTimeout(timer);
					clearTimeout(pretimer);
				});
				
				if (event[1] && !trigger.is("input:not(:checkbox, :radio), textarea")) { 					
					tip.bind(event[1], function(e) {

						// being moved to the trigger element
						if (e.relatedTarget != trigger[0]) {
							trigger.trigger(evt[1].split(" ")[0]);
						}
					}); 
				} 
				
				return self;
			},
			
			hide: function(e) {

				if (!tip || !self.isShown()) { return self; }
			
				// onBeforeHide
				e = e || $.Event();
				e.type = "onBeforeHide";
				fire.trigger(e);				
				if (e.isDefaultPrevented()) { return; }
	
				shown = false;
				
				effects[conf.effect][1].call(self, function() {
					e.type = "onHide";
					shown = false;
					fire.trigger(e);		 
				});
				
				return self;
			},
			
			isShown: function(fully) {
				return fully ? shown == 'full' : shown;	
			},
				
			getConf: function() {
				return conf;	
			},
				
			getTip: function() {
				return tip;	
			},
			
			getTrigger: function() {
				return trigger;	
			}		

		});		

		// callbacks	
		$.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","), function(i, name) {
				
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
		
	}
		
	
	// jQuery plugin implementation
	$.fn.tooltip = function(conf) {
		
		// return existing instance
		var api = this.data("tooltip");
		if (api) { return api; }

		conf = $.extend(true, {}, $.tools.tooltip.conf, conf);
		
		// position can also be given as string
		if (typeof conf.position == 'string') {
			conf.position = conf.position.split(/,?\s/);	
		}
		
		// install tooltip for each entry in jQuery object
		this.each(function() {
			api = new Tooltip($(this), conf); 
			$(this).data("tooltip", api); 
		});
		
		return conf.api ? api: this;		 
	};
		
}) (jQuery);

		


/** schema.js **/
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
    },

    init_modal_help: function(context) {
      // Show/Hide help menu in domain creation dialog
      $(".modal-help-toggle", context).click(function() {
        var $link = $(this);
        var $help_pane = $link.parents().find(".modal-help");
        var $container = $link.parents().find(".modal-content");
        if ($help_pane.is(":hidden")) {
          $help_pane.height(($container.height() - 5)).slideDown();
          $link.html("[ - ] Hide Help");
        } else {
          $help_pane.slideUp();
          $link.html("[ + ] Show Help");
        };
      });
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

/** domain.js **/
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

  var d = fb.schema.domain = {
    init: function() {
      d.init_tablesorter();
      d.init_toggle_help_messages();
    },

    init_tablesorter: function() {
      $(".table-sortable").each(function() {
        var table = $(this);
        if ($("> tbody > tr", table).length) {
          table.tablesorter();
          $("thead th:nth-child(2)", table)[0].count = 1;
          $("thead th:nth-child(3)", table)[0].count = 1;
          $("thead th:nth-child(4)", table)[0].count = 1;
        }
      });
    },

    init_toggle_help_messages: function() {

      $(".table-empty-trigger").click(function() {
        var $trigger = $(this);
        var $container = $trigger.parents(".table-empty-msg");
        var $help_text = $container.find(".table-empty-text");

        if ($help_text.is(":hidden")) {
          $container.addClass("active");
          $help_text.slideDown();
        }

        else {
          $container.removeClass("active");
          $help_text.slideUp();
        }
      });
    },

    init_edit: function() {
      // show all edit controls
      $(".edit").show();

      // Show the help text for Entity Types if user has admin rights
      var $type_tables = $("table.table");
      $type_tables.first().find(".table-empty-msg").addClass("active").find(".table-empty-text").slideDown();

      // If none of the type tables have rows, hide help links
      // outside of tables to accomodate for help links inside table
      if ($type_tables.find("tbody > tr").length === 0) {
        $(".table-title > .help-link").hide();
      }
      else {
        $(".table-empty-msg").hide();
      }
    },

    domain_settings: function(e, domain_id) {
      var trigger = $(this);
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/domain-edit.mf.js", function() {
        d.edit.domain_settings_begin(trigger, domain_id);
      });
      return false;
    },

    add_type: function(e, domain_id, mediator) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/domain-edit.mf.js", function() {
        d.edit.add_type_begin(trigger, domain_id, mediator);
      });
      return false;
    },

    delete_type: function(e, type_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      // hide tooltip
      trigger.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/domain-edit.mf.js", function() {
        d.edit.delete_type_begin(trigger, type_id);
      });
      return false;
    },

    undo_delete_type: function(e) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      var type_info = trigger.metadata();
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/domain-edit.mf.js", function() {
        d.edit.undo_delete_type_begin(trigger, type_info);
      });
      return false;
    },

    edit_type: function(e, type_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      // hide tooltip
      trigger.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/domain-edit.mf.js", function() {
        d.edit.edit_type_begin(trigger, type_id);
      });
      return false;
    }
  };

  $(window).bind("fb.permission.has_permission", function(e, has_permission) {
    if (has_permission) {
      d.init_edit();
    }
  });

  $(d.init);

})(jQuery, window.freebase);
