
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



/** jqueryui, jquery.ui.draggable.js **/
/*
 * jQuery UI Draggable 1.8.4
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Draggables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget("ui.draggable", $.ui.mouse, {
	widgetEventPrefix: "drag",
	options: {
		addClasses: true,
		appendTo: "parent",
		axis: false,
		connectToSortable: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		grid: false,
		handle: false,
		helper: "original",
		iframeFix: false,
		opacity: false,
		refreshPositions: false,
		revert: false,
		revertDuration: 500,
		scope: "default",
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		snap: false,
		snapMode: "both",
		snapTolerance: 20,
		stack: false,
		zIndex: false
	},
	_create: function() {

		if (this.options.helper == 'original' && !(/^(?:r|a|f)/).test(this.element.css("position")))
			this.element[0].style.position = 'relative';

		(this.options.addClasses && this.element.addClass("ui-draggable"));
		(this.options.disabled && this.element.addClass("ui-draggable-disabled"));

		this._mouseInit();

	},

	destroy: function() {
		if(!this.element.data('draggable')) return;
		this.element
			.removeData("draggable")
			.unbind(".draggable")
			.removeClass("ui-draggable"
				+ " ui-draggable-dragging"
				+ " ui-draggable-disabled");
		this._mouseDestroy();

		return this;
	},

	_mouseCapture: function(event) {

		var o = this.options;

		// among others, prevent a drag on a resizable-handle
		if (this.helper || o.disabled || $(event.target).is('.ui-resizable-handle'))
			return false;

		//Quit if we're not on a valid handle
		this.handle = this._getHandle(event);
		if (!this.handle)
			return false;

		return true;

	},

	_mouseStart: function(event) {

		var o = this.options;

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		//If ddmanager is used for droppables, set the global draggable
		if($.ui.ddmanager)
			$.ui.ddmanager.current = this;

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Store the helper's css position
		this.cssPosition = this.helper.css("position");
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.positionAbs = this.element.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		//Generate the original position
		this.originalPosition = this.position = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Set a containment if given in the options
		if(o.containment)
			this._setContainment();

		//Trigger event + callbacks
		if(this._trigger("start", event) === false) {
			this._clear();
			return false;
		}

		//Recache the helper size
		this._cacheHelperProportions();

		//Prepare the droppable offsets
		if ($.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(this, event);

		this.helper.addClass("ui-draggable-dragging");
		this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;
	},

	_mouseDrag: function(event, noPropagation) {

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		//Call plugins and callbacks and use the resulting position if something is returned
		if (!noPropagation) {
			var ui = this._uiHash();
			if(this._trigger('drag', event, ui) === false) {
				this._mouseUp({});
				return false;
			}
			this.position = ui.position;
		}

		if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
		if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';
		if($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

		return false;
	},

	_mouseStop: function(event) {

		//If we are using droppables, inform the manager about the drop
		var dropped = false;
		if ($.ui.ddmanager && !this.options.dropBehaviour)
			dropped = $.ui.ddmanager.drop(this, event);

		//if a drop comes from outside (a sortable)
		if(this.dropped) {
			dropped = this.dropped;
			this.dropped = false;
		}
		
		//if the original element is removed, don't bother to continue
		if(!this.element[0] || !this.element[0].parentNode)
			return false;

		if((this.options.revert == "invalid" && !dropped) || (this.options.revert == "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
			var self = this;
			$(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
				if(self._trigger("stop", event) !== false) {
					self._clear();
				}
			});
		} else {
			if(this._trigger("stop", event) !== false) {
				this._clear();
			}
		}

		return false;
	},
	
	cancel: function() {
		
		if(this.helper.is(".ui-draggable-dragging")) {
			this._mouseUp({});
		} else {
			this._clear();
		}
		
		return this;
		
	},

	_getHandle: function(event) {

		var handle = !this.options.handle || !$(this.options.handle, this.element).length ? true : false;
		$(this.options.handle, this.element)
			.find("*")
			.andSelf()
			.each(function() {
				if(this == event.target) handle = true;
			});

		return handle;

	},

	_createHelper: function(event) {

		var o = this.options;
		var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event])) : (o.helper == 'clone' ? this.element.clone() : this.element);

		if(!helper.parents('body').length)
			helper.appendTo((o.appendTo == 'parent' ? this.element[0].parentNode : o.appendTo));

		if(helper[0] != this.element[0] && !(/(fixed|absolute)/).test(helper.css("position")))
			helper.css("position", "absolute");

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
			var p = this.element.position();
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
			left: (parseInt(this.element.css("marginLeft"),10) || 0),
			top: (parseInt(this.element.css("marginTop"),10) || 0)
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

		if(!(/^(document|window|parent)$/).test(o.containment) && o.containment.constructor != Array) {
			var ce = $(o.containment)[0]; if(!ce) return;
			var co = $(o.containment).offset();
			var over = ($(ce).css("overflow") != 'hidden');

			this.containment = [
				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
			];
		} else if(o.containment.constructor == Array) {
			this.containment = o.containment;
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
				- ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left																// The absolute mouse position
				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
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
				+ ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX																// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_clear: function() {
		this.helper.removeClass("ui-draggable-dragging");
		if(this.helper[0] != this.element[0] && !this.cancelHelperRemoval) this.helper.remove();
		//if($.ui.ddmanager) $.ui.ddmanager.current = null;
		this.helper = null;
		this.cancelHelperRemoval = false;
	},

	// From now on bulk stuff - mainly helpers

	_trigger: function(type, event, ui) {
		ui = ui || this._uiHash();
		$.ui.plugin.call(this, type, [event, ui]);
		if(type == "drag") this.positionAbs = this._convertPositionTo("absolute"); //The absolute position has to be recalculated after plugins
		return $.Widget.prototype._trigger.call(this, type, event, ui);
	},

	plugins: {},

	_uiHash: function(event) {
		return {
			helper: this.helper,
			position: this.position,
			originalPosition: this.originalPosition,
			offset: this.positionAbs
		};
	}

});

$.extend($.ui.draggable, {
	version: "1.8.4"
});

$.ui.plugin.add("draggable", "connectToSortable", {
	start: function(event, ui) {

		var inst = $(this).data("draggable"), o = inst.options,
			uiSortable = $.extend({}, ui, { item: inst.element });
		inst.sortables = [];
		$(o.connectToSortable).each(function() {
			var sortable = $.data(this, 'sortable');
			if (sortable && !sortable.options.disabled) {
				inst.sortables.push({
					instance: sortable,
					shouldRevert: sortable.options.revert
				});
				sortable._refreshItems();	//Do a one-time refresh at start to refresh the containerCache
				sortable._trigger("activate", event, uiSortable);
			}
		});

	},
	stop: function(event, ui) {

		//If we are still over the sortable, we fake the stop event of the sortable, but also remove helper
		var inst = $(this).data("draggable"),
			uiSortable = $.extend({}, ui, { item: inst.element });

		$.each(inst.sortables, function() {
			if(this.instance.isOver) {

				this.instance.isOver = 0;

				inst.cancelHelperRemoval = true; //Don't remove the helper in the draggable instance
				this.instance.cancelHelperRemoval = false; //Remove it in the sortable instance (so sortable plugins like revert still work)

				//The sortable revert is supported, and we have to set a temporary dropped variable on the draggable to support revert: 'valid/invalid'
				if(this.shouldRevert) this.instance.options.revert = true;

				//Trigger the stop of the sortable
				this.instance._mouseStop(event);

				this.instance.options.helper = this.instance.options._helper;

				//If the helper has been the original item, restore properties in the sortable
				if(inst.options.helper == 'original')
					this.instance.currentItem.css({ top: 'auto', left: 'auto' });

			} else {
				this.instance.cancelHelperRemoval = false; //Remove the helper in the sortable instance
				this.instance._trigger("deactivate", event, uiSortable);
			}

		});

	},
	drag: function(event, ui) {

		var inst = $(this).data("draggable"), self = this;

		var checkPos = function(o) {
			var dyClick = this.offset.click.top, dxClick = this.offset.click.left;
			var helperTop = this.positionAbs.top, helperLeft = this.positionAbs.left;
			var itemHeight = o.height, itemWidth = o.width;
			var itemTop = o.top, itemLeft = o.left;

			return $.ui.isOver(helperTop + dyClick, helperLeft + dxClick, itemTop, itemLeft, itemHeight, itemWidth);
		};

		$.each(inst.sortables, function(i) {
			
			//Copy over some variables to allow calling the sortable's native _intersectsWith
			this.instance.positionAbs = inst.positionAbs;
			this.instance.helperProportions = inst.helperProportions;
			this.instance.offset.click = inst.offset.click;
			
			if(this.instance._intersectsWith(this.instance.containerCache)) {

				//If it intersects, we use a little isOver variable and set it once, so our move-in stuff gets fired only once
				if(!this.instance.isOver) {

					this.instance.isOver = 1;
					//Now we fake the start of dragging for the sortable instance,
					//by cloning the list group item, appending it to the sortable and using it as inst.currentItem
					//We can then fire the start event of the sortable with our passed browser event, and our own helper (so it doesn't create a new one)
					this.instance.currentItem = $(self).clone().appendTo(this.instance.element).data("sortable-item", true);
					this.instance.options._helper = this.instance.options.helper; //Store helper option to later restore it
					this.instance.options.helper = function() { return ui.helper[0]; };

					event.target = this.instance.currentItem[0];
					this.instance._mouseCapture(event, true);
					this.instance._mouseStart(event, true, true);

					//Because the browser event is way off the new appended portlet, we modify a couple of variables to reflect the changes
					this.instance.offset.click.top = inst.offset.click.top;
					this.instance.offset.click.left = inst.offset.click.left;
					this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
					this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;

					inst._trigger("toSortable", event);
					inst.dropped = this.instance.element; //draggable revert needs that
					//hack so receive/update callbacks work (mostly)
					inst.currentItem = inst.element;
					this.instance.fromOutside = inst;

				}

				//Provided we did all the previous steps, we can fire the drag event of the sortable on every draggable drag, when it intersects with the sortable
				if(this.instance.currentItem) this.instance._mouseDrag(event);

			} else {

				//If it doesn't intersect with the sortable, and it intersected before,
				//we fake the drag stop of the sortable, but make sure it doesn't remove the helper by using cancelHelperRemoval
				if(this.instance.isOver) {

					this.instance.isOver = 0;
					this.instance.cancelHelperRemoval = true;
					
					//Prevent reverting on this forced stop
					this.instance.options.revert = false;
					
					// The out event needs to be triggered independently
					this.instance._trigger('out', event, this.instance._uiHash(this.instance));
					
					this.instance._mouseStop(event, true);
					this.instance.options.helper = this.instance.options._helper;

					//Now we remove our currentItem, the list group clone again, and the placeholder, and animate the helper back to it's original size
					this.instance.currentItem.remove();
					if(this.instance.placeholder) this.instance.placeholder.remove();

					inst._trigger("fromSortable", event);
					inst.dropped = false; //draggable revert needs that
				}

			};

		});

	}
});

$.ui.plugin.add("draggable", "cursor", {
	start: function(event, ui) {
		var t = $('body'), o = $(this).data('draggable').options;
		if (t.css("cursor")) o._cursor = t.css("cursor");
		t.css("cursor", o.cursor);
	},
	stop: function(event, ui) {
		var o = $(this).data('draggable').options;
		if (o._cursor) $('body').css("cursor", o._cursor);
	}
});

$.ui.plugin.add("draggable", "iframeFix", {
	start: function(event, ui) {
		var o = $(this).data('draggable').options;
		$(o.iframeFix === true ? "iframe" : o.iframeFix).each(function() {
			$('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>')
			.css({
				width: this.offsetWidth+"px", height: this.offsetHeight+"px",
				position: "absolute", opacity: "0.001", zIndex: 1000
			})
			.css($(this).offset())
			.appendTo("body");
		});
	},
	stop: function(event, ui) {
		$("div.ui-draggable-iframeFix").each(function() { this.parentNode.removeChild(this); }); //Remove frame helpers
	}
});

$.ui.plugin.add("draggable", "opacity", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data('draggable').options;
		if(t.css("opacity")) o._opacity = t.css("opacity");
		t.css('opacity', o.opacity);
	},
	stop: function(event, ui) {
		var o = $(this).data('draggable').options;
		if(o._opacity) $(ui.helper).css('opacity', o._opacity);
	}
});

$.ui.plugin.add("draggable", "scroll", {
	start: function(event, ui) {
		var i = $(this).data("draggable");
		if(i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') i.overflowOffset = i.scrollParent.offset();
	},
	drag: function(event, ui) {

		var i = $(this).data("draggable"), o = i.options, scrolled = false;

		if(i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') {

			if(!o.axis || o.axis != 'x') {
				if((i.overflowOffset.top + i.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop + o.scrollSpeed;
				else if(event.pageY - i.overflowOffset.top < o.scrollSensitivity)
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop - o.scrollSpeed;
			}

			if(!o.axis || o.axis != 'y') {
				if((i.overflowOffset.left + i.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft + o.scrollSpeed;
				else if(event.pageX - i.overflowOffset.left < o.scrollSensitivity)
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft - o.scrollSpeed;
			}

		} else {

			if(!o.axis || o.axis != 'x') {
				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
			}

			if(!o.axis || o.axis != 'y') {
				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
			}

		}

		if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(i, event);

	}
});

$.ui.plugin.add("draggable", "snap", {
	start: function(event, ui) {

		var i = $(this).data("draggable"), o = i.options;
		i.snapElements = [];

		$(o.snap.constructor != String ? ( o.snap.items || ':data(draggable)' ) : o.snap).each(function() {
			var $t = $(this); var $o = $t.offset();
			if(this != i.element[0]) i.snapElements.push({
				item: this,
				width: $t.outerWidth(), height: $t.outerHeight(),
				top: $o.top, left: $o.left
			});
		});

	},
	drag: function(event, ui) {

		var inst = $(this).data("draggable"), o = inst.options;
		var d = o.snapTolerance;

		var x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width,
			y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;

		for (var i = inst.snapElements.length - 1; i >= 0; i--){

			var l = inst.snapElements[i].left, r = l + inst.snapElements[i].width,
				t = inst.snapElements[i].top, b = t + inst.snapElements[i].height;

			//Yes, I know, this is insane ;)
			if(!((l-d < x1 && x1 < r+d && t-d < y1 && y1 < b+d) || (l-d < x1 && x1 < r+d && t-d < y2 && y2 < b+d) || (l-d < x2 && x2 < r+d && t-d < y1 && y1 < b+d) || (l-d < x2 && x2 < r+d && t-d < y2 && y2 < b+d))) {
				if(inst.snapElements[i].snapping) (inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
				inst.snapElements[i].snapping = false;
				continue;
			}

			if(o.snapMode != 'inner') {
				var ts = Math.abs(t - y2) <= d;
				var bs = Math.abs(b - y1) <= d;
				var ls = Math.abs(l - x2) <= d;
				var rs = Math.abs(r - x1) <= d;
				if(ts) ui.position.top = inst._convertPositionTo("relative", { top: t - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				if(bs) ui.position.top = inst._convertPositionTo("relative", { top: b, left: 0 }).top - inst.margins.top;
				if(ls) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l - inst.helperProportions.width }).left - inst.margins.left;
				if(rs) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r }).left - inst.margins.left;
			}

			var first = (ts || bs || ls || rs);

			if(o.snapMode != 'outer') {
				var ts = Math.abs(t - y1) <= d;
				var bs = Math.abs(b - y2) <= d;
				var ls = Math.abs(l - x1) <= d;
				var rs = Math.abs(r - x2) <= d;
				if(ts) ui.position.top = inst._convertPositionTo("relative", { top: t, left: 0 }).top - inst.margins.top;
				if(bs) ui.position.top = inst._convertPositionTo("relative", { top: b - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				if(ls) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l }).left - inst.margins.left;
				if(rs) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r - inst.helperProportions.width }).left - inst.margins.left;
			}

			if(!inst.snapElements[i].snapping && (ts || bs || ls || rs || first))
				(inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
			inst.snapElements[i].snapping = (ts || bs || ls || rs || first);

		};

	}
});

$.ui.plugin.add("draggable", "stack", {
	start: function(event, ui) {

		var o = $(this).data("draggable").options;

		var group = $.makeArray($(o.stack)).sort(function(a,b) {
			return (parseInt($(a).css("zIndex"),10) || 0) - (parseInt($(b).css("zIndex"),10) || 0);
		});
		if (!group.length) { return; }
		
		var min = parseInt(group[0].style.zIndex) || 0;
		$(group).each(function(i) {
			this.style.zIndex = min + i;
		});

		this[0].style.zIndex = min + group.length;

	}
});

$.ui.plugin.add("draggable", "zIndex", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data("draggable").options;
		if(t.css("zIndex")) o._zIndex = t.css("zIndex");
		t.css('zIndex', o.zIndex);
	},
	stop: function(event, ui) {
		var o = $(this).data("draggable").options;
		if(o._zIndex) $(ui.helper).css('zIndex', o._zIndex);
	}
});

})(jQuery);

/** jquery.shortcut.js **/
/**
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Version : 2.01.A
 * By Binny V A
 * License : BSD
 */
shortcut = {
	'all_shortcuts':{},//All the shortcuts are stored in this array
	'add': function(shortcut_combination,callback,opt) {
		//Provide a set of default options
		var default_options = {
			'type':'keydown',
			'propagate':false,
			'disable_in_input':false,
			'target':document,
			'keycode':false
		}
		if(!opt) opt = default_options;
		else {
			for(var dfo in default_options) {
				if(typeof opt[dfo] == 'undefined') opt[dfo] = default_options[dfo];
			}
		}

		var ele = opt.target
		if(typeof opt.target == 'string') ele = document.getElementById(opt.target);
		var ths = this;
		shortcut_combination = shortcut_combination.toLowerCase();

		//The function to be called at keypress
		var func = function(e) {
			e = e || window.event;
			
			if(opt['disable_in_input']) { //Don't enable shortcut keys in Input, Textarea fields
				var element;
				if(e.target) element=e.target;
				else if(e.srcElement) element=e.srcElement;
				if(element.nodeType==3) element=element.parentNode;

				if(element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') return;
			}
	
			//Find Which key is pressed
			if (e.keyCode) code = e.keyCode;
			else if (e.which) code = e.which;
			var character = String.fromCharCode(code).toLowerCase();
			
			if(code == 188) character=","; //If the user presses , when the type is onkeydown
			if(code == 190) character="."; //If the user presses , when the type is onkeydown
	
			var keys = shortcut_combination.split("-");
			//Key Pressed - counts the number of valid keypresses - if it is same as the number of keys, the shortcut function is invoked
			var kp = 0;
			
			//Work around for stupid Shift key bug created by using lowercase - as a result the shift+num combination was broken
			var shift_nums = {
				"`":"~",
				"1":"!",
				"2":"@",
				"3":"#",
				"4":"$",
				"5":"%",
				"6":"^",
				"7":"&",
				"8":"*",
				"9":"(",
				"0":")",
				"-":"_",
				"=":"+",
				";":":",
				"'":"\"",
				",":"<",
				".":">",
				"/":"?",
				"\\":"|"
			}
			//Special Keys - and their codes
			var special_keys = {
				'esc':27,
				'escape':27,
				'tab':9,
				'space':32,
				'return':13,
				'enter':13,
				'backspace':8,
	
				'scrolllock':145,
				'scroll_lock':145,
				'scroll':145,
				'capslock':20,
				'caps_lock':20,
				'caps':20,
				'numlock':144,
				'num_lock':144,
				'num':144,
				
				'pause':19,
				'break':19,
				
				'insert':45,
				'home':36,
				'delete':46,
				'end':35,
				
				'pageup':33,
				'page_up':33,
				'pu':33,
	
				'pagedown':34,
				'page_down':34,
				'pd':34,
	
				'left':37,
				'up':38,
				'right':39,
				'down':40,
	
				'f1':112,
				'f2':113,
				'f3':114,
				'f4':115,
				'f5':116,
				'f6':117,
				'f7':118,
				'f8':119,
				'f9':120,
				'f10':121,
				'f11':122,
				'f12':123
			}
	
			var modifiers = { 
				shift: { wanted:false, pressed:false},
				ctrl : { wanted:false, pressed:false},
				alt  : { wanted:false, pressed:false},
				meta : { wanted:false, pressed:false}	//Meta is Mac specific
			};
                        
			if(e.ctrlKey)	modifiers.ctrl.pressed = true;
			if(e.shiftKey)	modifiers.shift.pressed = true;
			if(e.altKey)	modifiers.alt.pressed = true;
			if(e.metaKey)   modifiers.meta.pressed = true;
                        
			for(var i=0; k=keys[i],i<keys.length; i++) {
				//Modifiers
				if(k == 'ctrl' || k == 'control') {
					kp++;
					modifiers.ctrl.wanted = true;

				} else if(k == 'shift') {
					kp++;
					modifiers.shift.wanted = true;

				} else if(k == 'alt') {
					kp++;
					modifiers.alt.wanted = true;
				} else if(k == 'meta') {
					kp++;
					modifiers.meta.wanted = true;
				} else if(k.length > 1) { //If it is a special key
					if(special_keys[k] == code) kp++;
					
				} else if(opt['keycode']) {
					if(opt['keycode'] == code) kp++;

				} else { //The special keys did not match
					if(character == k) kp++;
					else {
						if(shift_nums[character] && e.shiftKey) { //Stupid Shift key bug created by using lowercase
							character = shift_nums[character]; 
							if(character == k) kp++;
						}
					}
				}
			}

			if(kp == keys.length && 
						modifiers.ctrl.pressed == modifiers.ctrl.wanted &&
						modifiers.shift.pressed == modifiers.shift.wanted &&
						modifiers.alt.pressed == modifiers.alt.wanted &&
						modifiers.meta.pressed == modifiers.meta.wanted) {
				callback(e);
	
				if(!opt['propagate']) { //Stop the event
					//e.cancelBubble is supported by IE - this will kill the bubbling process.
					e.cancelBubble = true;
					e.returnValue = false;
	
					//e.stopPropagation works in Firefox.
					if (e.stopPropagation) {
						e.stopPropagation();
						e.preventDefault();
					}
					return false;
				}
			}
		}
		this.all_shortcuts[shortcut_combination] = {
			'callback':func, 
			'target':ele, 
			'event': opt['type']
		};
		//Attach the function with the event
		if(ele.addEventListener) ele.addEventListener(opt['type'], func, false);
		else if(ele.attachEvent) ele.attachEvent('on'+opt['type'], func);
		else ele['on'+opt['type']] = func;
	},

	//Remove the shortcut - just specify the shortcut and I will remove the binding
	'remove':function(shortcut_combination) {
		shortcut_combination = shortcut_combination.toLowerCase();
		var binding = this.all_shortcuts[shortcut_combination];
		delete(this.all_shortcuts[shortcut_combination])
		if(!binding) return;
		var type = binding['event'];
		var ele = binding['target'];
		var callback = binding['callback'];

		if(ele.detachEvent) ele.detachEvent('on'+type, callback);
		else if(ele.removeEventListener) ele.removeEventListener(type, callback, false);
		else ele['on'+type] = false;
	}
};

/** util.js **/
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

/*global mjt $ */

// util.js is for utilitiy functions which have no dependancies on App Editor


////////////////////
//                //
//     Assert     //
//                //
////////////////////

var assert = {};

/**
  * assert.critical(cond,message) - if (!cond) show the message and provide a link to report_problem
  *    For situations where continuing is only going to make things worse.
  *    The critical error dialog box is displayed without dependancies on mjt or jQuery
  *    Only one critical error is shown at a time (futher errors sent to mjt.error if possible)
**/
assert.critical = function(cond,message) {
    if (cond) { return; }
    // else

    // https://bugs.webkit.org/show_bug.cgi?id=20141 breaks the following code on Safari
    //   var error_func = ((window.mjt || {}).error)  ||  ((window.console || {}).error)  ||  (function() {});
    // so we have to do it the ugly way:
    if (typeof mjt !== "undefined" && mjt.error) {
        mjt.error('Internal Error: '+message);
    } else {
        if (typeof console !== "undefined" && console.error) {
            console.error('Internal Error: '+message);
        }
    }
    if (document.getElementById('error-dialog')) { return; } // only show one dialog box
    var html = '';
    html += '<div style="font-weight:bold;">Internal Error</div>';
    html += message;
    assert.error_dialog(html);
    //TODO: maybe this is too brutal? perhaps the user can continue?
    //throw 'assert.critical failed: '+message;
    
};

//Make the error box appear in the center of the page
assert.error_dialog = function(message_html) {
    var close_html = '<div id="error-dialog" style="float:right; color: #1170a3; margin: -10px -5px 0 0; cursor: pointer;" onclick="document.body.removeChild(this.parentNode);">x</div>';
    var div = document.createElement('div');
    div.style.cssText = 'position: absolute; top: 30px; left: 50%; width: 350px; margin: 0 0 0 -175px; padding: 15px; background-color: #fce2db; border: 1px solid #f3c5ac; color: #676767; font-size: 12px; z-index: 100;';
    div.innerHTML = close_html + message_html;
    document.body.appendChild(div);
};


////////////////////////
//                    //
//   Unicode output   //
//                    //
////////////////////////

var unicode = {};

unicode.escape_char = function(aChar) {
    var hex = aChar.charCodeAt(0).toString(16).toUpperCase();
    if (hex.length===1) { return "\\u000"+hex; }
    if (hex.length===2) { return "\\u00" +hex; }
    if (hex.length===3) { return "\\u0"  +hex; }
    if (hex.length===4) { return "\\u"   +hex; }
    return null;
};

// Escape everything outside of Basic Latin + the control chars 0 - 1f
// http://www.fileformat.info/info/unicode/block/basic_latin/list.htm
unicode.escape_str = function(str) {
    return str.replace( /[^\u0020-\u007F]/g, unicode.escape_char ); // from SPACE to ~ is OK
};



////////////////////////
//                    //
//  Local Storage     //
//                    //
////////////////////////


/**
* Generic local storage
* uses cookies or window.globalStorage, depending on the
* capabilities of your browser. Why? To avoid sending cookie values
* back and forth in the HTTP request
*
* The nice thing about using $.localStore is that you can set and get
* native values and dictionaries:
*
* $.localStore("mydict", {x:1,y:2});
* $.localStore("mybool", true);
* $.localStore("mynum", 123);
* var o = $.localStore("mydict");
* alert(o.x); // prints 1
*/

(function() {

    var COOKIE_OPTS = {
        expires: 30                             // App Editor preferences are stored in cookies for 30 days
    };

    var _localStore_cache = {};  

    $.extend({   
       localStore: function(key, val, use_cookie) {

           var hostname = document.location.hostname;

           // http: or https: - make sure to keep the keys bucketed
           // differently, because firefox flags keys written from an
           // https: page as secure, inaccessible by http:
           var prefix = document.location.protocol;
           if (typeof val !== "undefined") {
               //
               // set key val
               //
               var valstr = JSON.stringify(val);
               if (!use_cookie && window.globalStorage) {
                   if (val === null) {
                       delete window.globalStorage[hostname][prefix+key];
                   } else {
                       window.globalStorage[hostname][prefix+key] = valstr;                       
                   }
               } else if (!use_cookie && window.localStorage && window.localStorage.setItem) {
                   if (val === null) {
                       window.localStorage.removeItem(prefix+key);
                   } else {
                       window.localStorage.setItem(prefix+key, valstr);                       
                   }
               } else if (use_cookie !== false){
                   if (val === null) {
                       $.cookie(key, null, COOKIE_OPTS);
                   } else {
                       $.cookie(key, valstr, COOKIE_OPTS);
                   }
               } else {
                   if (val === null) {
                       delete _localStore_cache[key];
                   } else {
                       _localStore_cache[key] = valstr;
                   }
               }
               return val;
           }
           else {
               //
               // get key value
               //
               if (!use_cookie && window.globalStorage) {
                   if (window.globalStorage[hostname][prefix+key]) {
                       val = window.globalStorage[hostname][prefix+key].value;
                   }
               } else if (!use_cookie && window.localStorage) {
                   val = window.localStorage.getItem(prefix+key);
               } else if(use_cookie !== false) {
                   val = $.cookie(key);
               } else {
                   val = _localStore_cache[key];
               }
               if (val != "" && val !== null && val !== undefined) {
                   return JSON.parse(val, null);
              }
           }
           return null;
       }
    });

})();

/** zencoding.js **/
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

// A simple implementation of http://code.google.com/p/zen-coding/ in JavaScript

var zen = (function() {
  var error=''; // last error during parse
  
  var tagRE = /^[\w:]+/,
      idRE  = /^\#[:\w\$]+/,
      cnRE  = /^(\.[\w\$]+)+/,
      attrRE = /^\[.+\]/,
      multRE = /^\*\d+/;

  var tagger = (function() {
    var indent    = function(level) { return new Array(level+1).join('  '); };
    var t;
    return {
      newTag :   function()  { t = {tagName:'div'}; return t;},

      tag :      function(m) { t.tagName=m;                               return ''; }, 
      id:        function(m) { t.id=m.slice(1);                           return ''; }, // #foo --> 'foo'
      className: function(m) { t.className=m.slice(1).replace(/\./g,' '); return ''; }, // .class1.class2 --> 'class1 class2'
      attr:      function(m) { t.attrs=m.slice(1,-1);                     return ''; }, // [foo=bar] --> foo=bar
      mult:      function(m) { t.multiplier=parseInt(m.slice(1),10);      return ''; }, // *3 --> '3'

      html:      function(innerHTML,level) {
        var out = '<'+t.tagName
        + (t.id?' id="'+t.id+'"':'')
        + (t.className?' class="'+t.className+'"':'')
        + (t.attrs?' '+t.attrs:'')
        + '>'
        + (innerHTML ? '\n'+innerHTML+'\n'+indent(level) : '')
        + '</'+t.tagName+'>';
        var m = [];
        for (var i=0,len=t.multiplier||1;i<len;i++) {
          m[i]=out.replace(/\$/g,i+1); // expand foo$ as foo1,foo2,foo3
        } 
        return indent(level) + m.join('\n'+indent(level));
      }
    };
  })();

  function parseSel(sel,level,innerHTML) {
    var t = tagger.newTag();
    var leftover = sel
      .replace(tagRE,  tagger.tag)
      .replace(idRE,   tagger.id)
      .replace(cnRE,   tagger.className)
      .replace(attrRE, tagger.attr)
      .replace(multRE, tagger.mult);
    if (leftover.length && !error.length) { error=leftover; }
    return tagger.html(innerHTML,level);
  }

  function zexp(selectors,level) {
    if (!selectors || !selectors.length) { return ''; }
    var siblings  = selectors.shift().split('+'),
        max       = siblings.length-1,
        innerHTML = zexp(selectors,level+1);
    return siblings.map(function(sibling,i) {
      return parseSel( sibling, level, i===max?innerHTML:'' );
    }).join('\n');
  }

  function convert(expression,startlevel) {
    error=''; // global to zen module
    var r = expression.split('|'),      // div>span|e
            selectors=r[0].split('>'),  // div,span                  
            filter=r[1],                // |e (html escape)
            out=zexp(selectors,startlevel||0); // eval zen expression
    if (filter) {
      if (filter==='e') {
        out = out.replace(/</g,'&lt;').replace(/>/g,'&gt;');
      } else {
        error ='Unknown filter '+filter;
      }
    }
    //console.warn('\n\nIN=\n'+expression,'\n\nOUT=\n'+out);
    if (/^[\.\#\[\*]$/.test(error)) { error=''; } // ignore partial selectors
    return {out:out,error:error};
  }
  
  return { convert:convert };
})();


/** freebase_store.js **/
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

 /////////////////////////
 //                     //
 //   Freebase store    //
 //                     //
 /////////////////////////

 function FreebaseStore(service_url, acre_server) {
     this._url = service_url || fb.acre.freebase.service_url;
     this._site_url = fb.acre.freebase.site_host;
     this._acre_server = acre_server || (fb.acre.host.name + (fb.acre.host.port===80 ? "" : ":" + fb.acre.host.port));
     
     this._handlers = [];
     
     this._user = null;

     return this;
 }


(function() {
    
    var APP_EDITOR_SERVICE_PATH = fb.acre.appeditor.service_path;
    
    
    //    App Editor JSONP
    var AppEditorJsonp = mjt.define_task(mjt.freebase.FreebaseJsonPTask,  [{name: 'service'},
                                                                           {name: 'args'}]);

    AppEditorJsonp.prototype.request = function () {
        return this.service_request(APP_EDITOR_SERVICE_PATH + this.service, this.args);
    };

    AppEditorJsonp.prototype.response = function(o) {
        return this.ready(o.result);
    };
    
    
    //    App Editor XHR - GET
    var AppEditorXhrGet = mjt.define_task(mjt.freebase.FreebaseXhrTask, [{name: 'service'},
                                                                         {name: 'args'}]);

    AppEditorXhrGet.prototype.request = function () {
        var url = APP_EDITOR_SERVICE_PATH + this.service;
        if (this.args) { url += "?" + mjt.formencode(this.args); }
        return this.xhr_request("GET", url);
    };
    
    
    //    App Editor XHR - POST
    var AppEditorXhrPost = mjt.define_task(mjt.freebase.FreebaseXhrTask, [{name: 'service'},
                                                                          {name: 'args'}]);

    AppEditorXhrPost.prototype.request = function () {
        return this.xhr_form_post(APP_EDITOR_SERVICE_PATH + this.service, this.args);
    };
    
        
    //   AppEditor File Upload
    var AppEditorFileUpload = mjt.define_task(null, [{name: 'service'},
                                                     {name: 'form'}, 
                                                     {name: 'args'}]);

    AppEditorFileUpload.prototype.dynamic_iframe = function (id) {
        var iframe = document.createElement('iframe');
        if (typeof id === 'string') {
            iframe.id = id;
            iframe.name = id;
        }
        iframe.style.display = 'none';
        // the class='mjt_dynamic' tells the compiler to skip it, a useful hack.
        iframe.className = 'mjt_dynamic';
        return iframe;
    };


    AppEditorFileUpload.prototype.request = function () {
        this.domid = mjt.uniqueid('mjt_iframe');
        var iframe = this.dynamic_iframe(this.domid);
        $('body').append(iframe);
        var form = this.form;

        // works on firefox and hopefully safari
        function inner_document() {        
            var idoc = (iframe.contentWindow || iframe.contentDocument);
            if (idoc.document) { return idoc.document; }
            return idoc;
        }

        var task = this;
        
        function _on_timeout() {
            task.error('timeout', 'Upload timed out - no response from server.');
            _cleanup();
        }
        
        function _cleanup() {
            window.setTimeout(function(){ $(iframe).remove(); },1);
        }
        
        // set a timeout of 30s... same as Acre timeout
        var timeout = window.setTimeout(_on_timeout, 30000);
        iframe.onload = function () {
            window.clearTimeout(timeout);
            
            var response_text = $(inner_document(iframe).body).text();
            var o = JSON.parse(response_text);

            if (o.code === '/api/status/ok') {
                task.result = o.result;
                task.ready(task.result);
            } else {
                task.error(o.code, o.messages[0].message);             
            }

            _cleanup();
        };
        
        form.attr({
            target: this.domid,
            action: mjt.form_url(APP_EDITOR_SERVICE_PATH + this.service, this.args),
            method: 'POST',
            enctype: 'multipart/form-data'
        }).submit();
    };
    
    
    //   Touch for Acre Apps
    var AppTouch = mjt.define_task(mjt.freebase.FreebaseJsonPTask, [{name:'service_url', 'default':null}]);

    AppTouch.prototype.request = function () {
        // Touch should never be cached
        this.jsonp.cache_controller = {
            is_fresh : function(task) {
                return false;
            }
        };

        return this.service_request("/acre/touch?_=" + (+new Date()));
    };

    AppTouch.prototype.response = function(o) {
        // no response expected for now but whatever
        return this.ready(null);
    };
    
        
    FreebaseStore.prototype.Jsonp       = AppEditorJsonp;
    FreebaseStore.prototype.XhrGet      = AppEditorXhrGet;
    FreebaseStore.prototype.XhrPost     = AppEditorXhrPost;
    FreebaseStore.prototype.FileUpload  = AppEditorFileUpload;
    FreebaseStore.prototype.AppTouch    = AppTouch;
    
    
    FreebaseStore.prototype.set_user = function(user) {
        var store = this;
                  
        if (user) {
            store._user = new AcreUser(store, user);
            if (user.apps) { store._user_apps = user.apps; }

            mjt.freebase.freebase_user   = {
                name : user.name,
                id   : '/user/' + user.name
            };
        } else {
            store._user                = null;
            store._user_apps           = null;
            mjt.freebase.freebase_user = null;
        }
    };
    
    FreebaseStore.prototype.t_init = function(){
        var store = this;

        mjt.app = new mjt.App();
        mjt.freebase.service_url = window.location.protocol + '//' + window.location.host;
        mjt.freebase.xhr_ok = true;                             // Set current server as an xhr proxy for freebase apis
		
        var inittask = this.XhrGet('init_store')
            .onready(function(r) {
                store._acre_server          = r.host.name + (r.host.port === 80 ? "" : ":" + r.host.port);
                store._handlers             = r.acre_handlers;
                store._version              = r.version;                
                store.set_user(r.user);
            });

        return inittask.enqueue();
    };
    
    FreebaseStore.prototype.destroy = function() {
        var store = this;
        store = null;
    };

    

    var TestCookies = mjt.define_task(null, [{name: 'store'}]);
    
    TestCookies.prototype.request = function() {
        this.url = window.location.protocol + '//appeditor-services.site.freebase.dev.' + this.store.get_acre_host() + '/check_thirdparty_cookies';
        
        var task = this;
        this.jsonp = mjt.JsonP();
        this.jsonp.set_timeout()
            .jsonp_request_form(this.url, null, 'callback')
            .onready(function(r) {
                if (r.result === 'success') {
                    task.ready();
                } else {
                    task.error();
                }
            })
            .onerror('error', task);
    };
    
    FreebaseStore.prototype.TestCookies = TestCookies;
    
    FreebaseStore.prototype.get_acre_version = function() {
        return this._version;
    };
    
    FreebaseStore.prototype.get_user = function() {
        return this._user;
    };
    
    FreebaseStore.prototype.get_user_apps = function(appid) {
        if (appid) {
            for (var i=0;i < this._user_apps.length; i++) {
                if (this._user_apps[i].appid == appid) {
                    return this._user_apps[i].appid;
                }
            }    
            return null;
        } else {
            return this._user_apps;
        }
    };
    
    FreebaseStore.prototype.set_user_apps = function(user_apps) {
        this._user_apps = user_apps;
    };
    
    FreebaseStore.prototype.t_refresh_user_apps = function() {
        var store = this;
        store.XhrGet('list_user_apps')
            .enqueue()
            .onready(function(user_apps) {
                store._user_apps = user_apps;
            });
    };
    
    FreebaseStore.prototype.get_url = function() {
        return this._url;
    };
    
    FreebaseStore.prototype.get_service_path = function() {
        return APP_EDITOR_SERVICE_PATH;
    };
            
    FreebaseStore.prototype.get_name = function() {
        var name = this._name ? this._name : '???';
        if (name === 'OTG') { name = ''; }
        return name;
    };
      
    FreebaseStore.prototype.get_acre_handlers = function(){
        return this._handlers;
    };
      
    FreebaseStore.prototype.get_supported_mime_types = function(acre_handler){
        assert.critical(acre_handler, 'Can\'t list supported mimetype');
        return this._handlers[acre_handler].supported_mime_types;
    };
    
    FreebaseStore.prototype.get_acre_host = function() {
        return this._acre_server;
    };

    FreebaseStore.prototype.get_freebase_url = function() {
        return this._site_url;
    };
      
    FreebaseStore.prototype.get_user_new_app_path = function(user, path) {
        return "//" + path + "." + user.get_name() + ".user.dev";
    };
    
    FreebaseStore.prototype.get_user_default_app_host = function(user) {
        return user.get_name() + ".user.dev." + this.get_acre_host();
    };  

    FreebaseStore.prototype.get_user_view_url = function(user) {
        return this.get_freebase_url() + '/view/user/' + user.get_name();
    };

    FreebaseStore.prototype.get_user_image_url = function(user) {
        return this.get_url() + '/api/trans/image_thumb/user/' + user.get_name() + "?maxwidth=30&maxheight=30&mode=fillcrop";
    };

    FreebaseStore.prototype.validate_filename = function(name) {
        // TODO - this check is duplicated in acre.js / AcreDoc
        var RESERVED_KEYS = {'acre':true, 'status':'', 'api':true};

        if (!(/^[A-Za-z][\-_0-9A-Za-z\.]+$/).test(name)) { return false; }

        if (name in RESERVED_KEYS) { return false; }

        return true;
    };
    
    mjt.label_package('FreebaseStore');
    
})();

/** acre_doc.js **/
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

/*global document assert $ EDITORS */
var AcreDoc;

(function(){
    
    var DEFAULT_ACRE_HANDLER_KEY = 'mjt';
    var DEFAULT_MEDIA_TYPE = 'text/plain';
    var CLASSNAME = 'file';
    
    AcreDoc = function(app, name, properties, initial_state) {
        assert.critical(app, 'Must specify app when creating a file');
        this._app = app;
        
        if (name && this._app.get_store().validate_filename(name)) {
            this._name = name;
        } else {
            this._name = this._app.get_untitled_file_name();
        }
        
        this._acre_handler   = properties.acre_handler  || DEFAULT_ACRE_HANDLER_KEY;
        this._mime_type      = properties.content_type  || DEFAULT_MEDIA_TYPE;
        this._revision       = properties.revision      || null;
        this._based_on       = properties.based_on      || null;
        this._has_been_saved = properties.has_been_saved || false;

        this._dom_element = document.createElement('div');
        this._dom_element.className = CLASSNAME;
        
        this._event_handlers = {};

        this._initial_state = initial_state || null;
        
        var dirty = !this.has_been_saved();
        this._dirty_state = {
            name        : dirty,
            content     : dirty,
            metadata    : dirty,
            to_delete   : false,
            revision    : false,
            editor      : false
        };

        this._loaded_editors = {};
        this._current_editor = null;
        
        this._app.register_file(this);
        return this;
    };
    
    AcreDoc.prototype.t_get_history = function(limit) {
        var file = this;
        var args = { 
            fileid: file.get_fileid()
        };
        
        var task = file.get_store().XhrGet('get_file_history', args);
        
        return task.enqueue();
    };
    
    AcreDoc.prototype.t_get_revision = function(revision) {        
        var args = {
            fileid : this.get_fileid()
        };
        
        if (this.get_app().get_repository_capability("versioned")) {
            args.revision = revision || this.get_revision();
            return args.revision ? this.get_store().XhrGet('get_file_revision', args) : mjt.Succeed({text:""});    
        } else {
            return this.get_store().XhrGet('get_file_revision', args);
        }
    };
    
    AcreDoc.prototype.hide   = function() {
        if (this._current_editor) { this._current_editor.hide(); }
        $(this._dom_element).hide();
    };
    
    AcreDoc.prototype.destroy = function() {
        var file = this;
        
        for (var key in this._loaded_editors) {
            var ed = this._loaded_editors[key];
            if (ed.destroy) { ed.destroy(); }
        }
        
        $(file._dom_element).remove();
        file = null;
    };
    
    AcreDoc.prototype.is_writable = function() {
        return this.get_app().is_writable();
    };

    AcreDoc.prototype.has_been_saved = function() {
        return !!this._has_been_saved;
    };
    
    AcreDoc.prototype.is_dirty = function(kind) {
        // kind is one of 'content' or 'metadata' and is optional
        if (kind) {
            return this._dirty_state[kind];
        } else {
            for (var k in this._dirty_state) {
                if (this._dirty_state[k] === true) { return true; }
            }
        }
        return false;
    };
    
    
    
    /* Getters */
    
    AcreDoc.prototype.get_element = function() {
        return this._dom_element;
    };

    AcreDoc.prototype.get_store = function() {
        return this.get_app().get_store();
    };

    AcreDoc.prototype.get_app = function() {
        return this._app;
    };

    AcreDoc.prototype.get_name = function() {
        return this._name;
    };
    
    AcreDoc.prototype.get_fileid = function() {
        var name = this._old_name || this._name;
        return this.get_app().get_path() + '/' + name;
    };

    AcreDoc.prototype.get_relative_path = function() {
        //var app = this.get_app();
        //var path = app.is_library() ? app.get_library_path() + '/' + this.get_name() : this.get_name();
        return this.get_name();
    };
    
    AcreDoc.prototype.get_revision = function() {
        return this._revision;
    };

    AcreDoc.prototype.get_acre_handler = function() {
        return this._acre_handler;
    };
    
    AcreDoc.prototype.get_mime_type = function() {
        return this._mime_type;
    };
    
    AcreDoc.prototype.is_library = function() {
        return this._library;
    };
    
    AcreDoc.prototype.get_based_on = function(key) {
        return this._based_on;
    };
    
    AcreDoc.prototype.get_acre_url = function(preview) {
        return this.get_app().get_base_url() + '/' + this.get_name() + (preview ? '?acre.console=1' : '');
    };


    
    /* Setters */
    // Metadata setters are not tasks... committed on t_save()
    AcreDoc.prototype.set_name = function(new_name) {
        var file = this;
        if (new_name === file.get_name()) { return; }
        
        if (!/^[\-_0-9A-Za-z\.]+$/.test(new_name)) { 
            throw "File names can only contain alphanumeric characters, ., - and _";
        }
        
        if (!/^[A-Za-z]/.test(new_name)) { 
            throw "File names must be begin with a letter";
        }

        if (!/[0-9A-Za-z]$/.test(new_name)) { 
            throw "File names cannot end with a special character";
        }

        file._old_name = file.get_name();
        file.get_app().unregister_file(file._old_name);

        file._name = new_name;
        file.get_app().register_file(file);
        file.set_dirty('name');
    };
    
    AcreDoc.prototype.set_acre_handler = function(acre_handler) {
        if (acre_handler === this._acre_handler) { return; }
                
        this._acre_handler = acre_handler;
        this.set_dirty("metadata");
        // force rebuilding of editor (new parser)
        this.set_dirty("editor");     

    };
    
    AcreDoc.prototype.set_mime_type = function(mime_type) {
        if (mime_type === this._mime_type) { return; }
        
        this._mime_type = mime_type;
        /* 
            weird freebase-specific hack... metadata stored with content (Uplaod) rather than metadata (graph object) 
            maybe we should store dirty state as a stack of modified internals ?
        */
        this.set_dirty("content");
        // force rebuilding of editor (new parser)
        this.set_dirty("editor");     
    };
    
    AcreDoc.prototype.set_revision = function(revision) {
        if (this.is_dirty("content") || (revision !== this._revision)) { 
            this._revision = revision;
            this.set_dirty("revision");
            this.set_dirty("editor");
        }
        this.set_dirty("content", false);
        this.set_dirty("to_delete", false);            
    };
    
    AcreDoc.prototype.set_dirty = function(kind, value){
        var k = kind || "content";
        var v = (typeof value == 'undefined') ? true : value;
        if (k==="all") {
            for (var key in this._dirty_state) {
                this._dirty_state[key] = v;
            }
        } else {
            this._dirty_state[k] = v;
        }
    };
    
    
    // but the rest are
    AcreDoc.prototype.t_save = function(force_save) {
        var file = this;
        
        if (file.is_dirty("to_delete")) {
            return file.t_delete();
        }
        
        var args = {
            fileid: file.get_fileid()
        };
        var save_task = file.get_store().XhrPost("save_text_file", args);
            
        if (!file.has_been_saved() && file.get_based_on()) {
            args.based_on = file.get_based_on().id;
        }
        
        if (file.is_dirty('name')) {
            args.name = file.get_name();
        }

        if (file.is_dirty('metadata') || !file.has_been_saved()) {
            args.acre_handler = file.get_acre_handler();
        }
        
        if (!force_save && file.get_revision() && !(file.is_dirty("content") && file.is_dirty("revision"))) {
            args.revision = file.get_revision();
        }

        if (file.is_dirty("content")) {
            var state = file.get_editor_state();
            if (state.form) {
                save_task = file.get_store().FileUpload("save_binary_file", state.form, args);
            } else {
                args.text = state.text;
                args.content_type = file.get_mime_type();
            }
        } else if (file.is_dirty("revision")) {
            save_task = file.get_store().XhrPost("set_file_revision", args);
        }
        
        save_task
            .onready(function (r) {
                if (r.revision) { file._revision = r.revision; }
                if (r.content_type) { file._mime_type = r.content_type; }
                
                delete file._old_name;
                file._has_been_saved = true;
                file.set_dirty("all", false);
                
                if (file._current_editor && (typeof file._current_editor.refresh === 'function')) {
                    file._current_editor.refresh();
                }
            })
            .onerror(function (code, message, info) {
                if (code === "/api/status/error/file_format/unsupported_mime_type") {
                    delete file._old_name;
                    file._has_been_saved = true;
                    file.set_dirty("all", false);
                } else {
                    mjt.warn('Save of', file.get_name(), 'failed: ', code, ' - ', message, info);                    
                }
            });

        // Need to flush the server-side app cache on file edits
        var flush_task = this.get_app().t_flush_cache().require(save_task);
        return flush_task.enqueue();
    };
            
    AcreDoc.prototype.t_delete = function() {
        var file = this;
        var args = {
            appid   : file.get_app().get_path(),
            name    : file.get_name()
        };
        
        function _clean_up_file() {
            file.get_app().unregister_file(file.get_name());
            file.destroy();
        }
        
        if (!file.has_been_saved()) {
            return mjt.Succeed()
                .enqueue()
                .onready(_clean_up_file);
        }
        
        var deltask = file.get_store().XhrPost('delete_app_file', args)
            .onready(_clean_up_file)
            .onerror(function (code, message, info) {
                mjt.warn('Delete of', file.get_name(), 'failed: ', code, ' - ', message, info);
            });
        
        // Need to flush the server-side app cache on file edits
        var flush_task = this.get_app().t_flush_cache().require(deltask);
        return flush_task.enqueue();
    };
    
    AcreDoc.prototype.t_revert_to_saved = function() {
        var file = this;
        
        var args = {
            fileid : file.get_fileid()
        };
        
        var task = file.get_store().XhrGet('get_file', args)
            .onready(function(r) {
               file.set_name(r.name);
               file.set_acre_handler(r.acre_handler);
               file.set_mime_type(r.content_type);
               file.set_revision(r.revision);
               file.set_dirty("all", false);
               file.clear_editors();
            })
            .onerror(function (code, message, info) {
                mjt.warn('Rever of', file.get_name(), 'failed: ', code, ' - ', message, info);
            });
            
        return task.enqueue();
    };
        
    /* General editor stuff */
    AcreDoc.prototype.is_editor_loaded = function(editor_name) {
        var loaded = false;
        
        if (editor_name) {
            loaded = this._loaded_editors[editor_name] ? true : false;
        } else {
            for (var ed in this._loaded_editors) {
                loaded = true;
                break;
            }
        }
        return loaded;
    };
    
    AcreDoc.prototype.clear_editors = function(key) {
        var file = this;
        
        function _destroy_editor(key) {
            var ed = file._loaded_editors[key];
            if (ed.destroy) { ed.destroy(); }
            delete file._loaded_editors[key];            
        }
        
        if (key) {
            if (file.get_edtior_name() === key) {
                file._current_editor = null;
            }
            _destroy_editor(key);
        } else {
            file._current_editor = null;            
            for (var edkey in file._loaded_editors) {
                _destroy_editor(edkey);
            }
        }
    };
    
    AcreDoc.prototype.get_editor_name = function() {
        for (var key in EDITORS) {
            if (this._current_editor && this._current_editor instanceof EDITORS[key].editor_class) {
                return key;
            }
        }
        return false;
    };
        
    AcreDoc.prototype.t_editor_show = function(editor_name, prefs, state) {
        var file = this;
        if (file._showing_editor) { return mjt.Succeed().enqueue(); }
        file._showing_editor = true;

        var old_editor_state = null;
        if (state) {                                                            // use sepecified state...
            old_editor_state = state;
            file.set_dirty("content");
        } else if (file.is_dirty("revision")) {                                 // ... or force load from graph if asked...
            old_editor_state = null;
        } else if (file._current_editor) {                                      // ...otherwise grab the old contents...
            old_editor_state = file.get_editor_state();
        } else if (file._initial_state) {                                       // ... except new files
            old_editor_state = file._initial_state;
            file._initial_state = null;
        }
        
        if (file.is_dirty("editor")) {                                          // if editor marked dirty, destroy all
            file.clear_editors();
            file.set_dirty("editor", false);
        }

        var EditorClass = EDITORS[editor_name].editor_class;                    // if changing editors, hide old
        if (file._current_editor && !(file._current_editor instanceof EditorClass)) {  
            file._current_editor.hide();
        }
        
        if (typeof file._loaded_editors[editor_name] !== 'undefined') {         // we have the right editor around, just refresh
            file._current_editor = file._loaded_editors[editor_name];
            if (file.is_dirty("content") && old_editor_state) { 
                file.set_editor_state(old_editor_state); 
            }
            file._current_editor.show(prefs);
            file._showing_editor = false;
            return mjt.Succeed().enqueue();          
        }

        /* CREATE NEW EDITOR */
        var inittask = EditorClass.t_load(file, old_editor_state)
            .onready(function(new_editor){
                file._loaded_editors[editor_name] = new_editor;
                file._current_editor = file._loaded_editors[editor_name];
                file._current_editor.show(prefs);
                file._showing_editor = false;
            })
            .onerror(function (code, message, info) {
                mjt.warn('Loading of', file.get_name(), 'failed: ', code, ' - ', message, info);
            });
        
        return inittask.enqueue();
    };
    
    AcreDoc.prototype.get_editor_state = function() {
        var state = null;
        if (this._current_editor) { 
            state = this._current_editor.get_state(); 
        } else if (this._initial_state) {
            state = this._initial_state;
        }
        
        return state;
    };
    
    AcreDoc.prototype.set_editor_state = function(state) {
        assert.critical(state, 'Trying to set undefined editor state');
        if (this._current_editor) { this._current_editor.set_state(state); }
        
        return;
    };
        
    
    /* Editor features */
    AcreDoc.prototype.get_editor_supported_features = function(feature) {
        if (!this.get_editor_name()) { return false; }
        
        var supports = EDITORS[this.get_editor_name()].supports;
        if (feature) {
            return !!supports[feature];
        } else {
            return supports;
        }
    };

    AcreDoc.prototype.register_editor_event_handlers = function(event_handlers) {
        for (var event_name in event_handlers) {
            this._event_handlers[event_name] = event_handlers[event_name];
        }
    };
    
    AcreDoc.prototype.trigger_editor_event = function(event_name, args) {
        if (event_name === 'change') {
            var undos = args[0];
            if (undos > 0) {
                this.set_dirty("content");
                // we'd flagged to update the revision of the doc in the background...
                // but now the user has clearly loaded and modified that revision, so don't
                this.set_dirty("revision", false);                
            } else {
                this.set_dirty("content", false);
            }
        }
        
        if (this._event_handlers[event_name]) { 
            this._event_handlers[event_name].apply(this, args); 
        }
    };
    
    AcreDoc.prototype.editor_undo = function() {
        if (!this._current_editor || !this._current_editor.undo)  { return; }
        
        this._current_editor.undo();
    };
    
    AcreDoc.prototype.editor_redo = function() {
        if (!this._current_editor || !this._current_editor.redo) { return; }
        
        this._current_editor.redo();
    };
    
    AcreDoc.prototype.editor_indent = function() {
        if (!this._current_editor || !this._current_editor.reindentSelection) { return; }
        
        this._current_editor.reindentSelection();
    };
        
    AcreDoc.prototype.editor_goto_line = function(linenum) {
        if (!this._current_editor || !this._current_editor.goto_line) { return; }
        
        this._current_editor.goto_line(Number(linenum));
    };
})();

/** acre_app.js **/
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

var AcreApp;

(function(){
    
    var DEFAULT_FILENAME = 'index';
    
    AcreApp = function(store, path) {
        this._store             = store;
        this._acre_host         = store.get_acre_host();
        this._service_url       = store.get_url();
        
        this._path              = path;
        this._version           = null;
        this._name              = "Untitled";

        this._oauth_enabled     = null;
        this._write_user        = null;

        this._listed            = null;
        this._release           = null;
        this._hosts             = [];
        this._versions          = [];

        this._authors           = {};
        this._files             = {};
                
        this._untitled_label    = 'untitled_';
        this._untitled_counter  = 1;
        
        return this;
    };
    
    AcreApp.prototype.t_load = function() {
        var app = this;
        
        var loadtask = app._store.XhrGet('get_app', {appid: app._path})
            .onready(function(r) {
                app._acre_host          = r.acre_host;
                app._remote_app         = r.acre_host !== app.get_store().get_acre_host();
                app._repository         = r.repository || {
                  versioned : true
                };
                
                app._path               = r.path;
                app._appid				= r.appid;
                app._version            = r.version;
                app._name               = r.name || 'Untitled';

                app._oauth_enabled      = r.oauth_enabled;
                app._write_user         = r.write_user;
                app._parent             = r.parent;
                app._children           = r.children;

                app._listed             = r.listed;
                app._release            = r.release;
                app._hosts              = r.hosts;
                app._versions           = r.versions;
                app._last_edit          = null;
                
                app._initial_file       = r.current_file;
                                
                // Create and attach AcreUser objects for authors
                for (var akey in r.authors) {
                    var user = r.authors[akey];
                    app._authors[user.name] = new AcreUser(app.get_store(), user);
                }

                // Create and attach AcreDoc objects for files
                for (var fkey in r.files) {
                    r.files[fkey].has_been_saved = true;
                    new AcreDoc(app, r.files[fkey].name, r.files[fkey]);
                }
                
                // Enable OAuth by default
                if (app.is_writable()) {
                    if (!app._write_user && app._oauth_enabled === null) { app.t_set_oauth(true); }
                }
            });

        return loadtask.enqueue();
    };
    

    AcreApp.prototype.t_flush_cache = function(all_hosts) {
        var app = this;
        
        // touch the dev host synchronously...
        var touch = app.get_store().AppTouch(app.get_base_url());
            
        if (all_hosts) {
            // touch all of the other hosts asynchronously
            // on url or verison changes
            var hosts = this.get_hosts();
            for (var i=0; i < hosts.length; i++) {
                app.get_store().AppTouch('http://' + hosts[i].host).enqueue();
            }
        }
        
        return touch;
    };

        
    AcreApp.prototype.destroy = function() {
        var app = this;
        
        for (var f in app._files) {
            app._files[f].destroy();
        }
        
        for (var u in this._authors) {
            app._authors[u].destroy();
        }
        
        app = null;
    };
        
    AcreApp.prototype.register_file = function(file){
        var re = new RegExp(this._untitled_label + '(\\d+)');
        var r = re.exec(file.get_name()); // We need to explicitly call .exec or this will throw an exception in Google Chrome
        if (r && r.length) {
            var counter = parseInt(r[1], 10);
            if (this._untitled_counter <= counter) {
                this._untitled_counter = counter + 1;
            }
        }
        
        this._files[file.get_name()] = file;
    };
    
    AcreApp.prototype.unregister_file = function(filename) {
        delete this._files[filename];
    };


    /* getters */
    AcreApp.prototype.is_dirty = function() {
        var files = this.get_files();
        for (var f in files) {
            if (files[f].is_dirty()) { return true; }
        }
        return false;
    };

    AcreApp.prototype.get_store = function() {
        return this._store;
    };

    AcreApp.prototype.get_repository_capability = function(kind) {
        return !!this._repository[kind];
    };

    AcreApp.prototype.get_path = function() {
        return (this.get_acre_host() === this.get_store().get_acre_host()) ? this._path : this._path + "." + this._acre_host + ".";
    };

    AcreApp.prototype.get_versioned_path = function() {
        var path = this.get_path();
        
        if (this.is_version()) {
            path = path.replace("//", "//" + this._version + ".");
        }

        return path;
    };

    AcreApp.prototype.get_name = function() {
        var path_segments = this._path.split('//')[1].split(".");
        var name = path_segments.shift();
        return name;
    };

    AcreApp.prototype.get_display_name = function() {
        return this._name;
    };
    
    AcreApp.prototype.get_parent = function() {
        return this._parent;
    };

    AcreApp.prototype.get_children = function() {
        return this._children;
    };
    
    AcreApp.prototype.get_released_version = function() {
        return this._release;
    };
    
    AcreApp.prototype.get_versions = function() {
        return this._versions;
    };
    
    AcreApp.prototype.get_patches = function() {
        return this._patches;
    };

    AcreApp.prototype.get_hosts = function() {
        return this._hosts;
    };
    
    AcreApp.prototype.get_files = function() {
        return this._files;
    };

    AcreApp.prototype.get_file = function(name) {
        
        if (name) { 
            var segs = name.split('/');
            if (segs.length > 1) {
                var lib =  this.get_library(segs[0]);
                return lib.get_file(segs[1]);
            } else {
                return this._files[name];   
            }
        }
        
        if (this._initial_file && this._files[this._initial_file]) {
            var file = this._files[this._initial_file];
            this._initial_file = null;
            return file;
        } else if (this._files[DEFAULT_FILENAME]) { 
            return this._files[DEFAULT_FILENAME]; 
        } else {
            var file;
            var files = this.get_files();
            for (var f in files) {
                file = files[f];
                if (file) { return file; }
            }            
        }
        
        return null;
    };

    AcreApp.prototype.get_untitled_file_name = function(){
        var name = this._untitled_label + this._untitled_counter;
        return name;
    };

    AcreApp.prototype.get_acre_host = function() {
        return this._acre_host;
    };
    
    AcreApp.prototype.get_base_url = function() {
        return "http:" + this.get_versioned_path() + "." + this.get_acre_host();
    };
        
    AcreApp.prototype.get_view_url = function() {
        return this._repository.url + '/apps' + this._appid;
    };
        
    AcreApp.prototype.get_edit_url = function() {
        return this._repository.url + '/apps/admin' + this._appid;
    };

    AcreApp.prototype.is_version = function() {
        return !!this._version;
    };
    
    AcreApp.prototype.get_version_label = function() {
        return this._version;
    };

    AcreApp.prototype.get_version_timestamp = function(version) {
        var ver = version ? version : this._version;
        
        for (var i=0; i < this._versions.length; i++){
            var v = this._versions[i];
            if (v.name == ver) {
                return v.as_of_time;
            }
        }
        return null;
    };


    /* setter tasks */
    AcreApp.prototype.t_save_all = function() {
        var task = mjt.Succeed();

        // TODO: show status for this
        for (var id in this._files) {
            var file = this._files[id];
            if (file.is_dirty()) {
                task.require(file.t_save());
            }
        }
        
        // Need to flush the server-side app cache on file edits
        var flush_task = this.t_flush_cache().require(task);
        return flush_task.enqueue();
    };
    
    AcreApp.prototype.t_get_history = function(limit) {
        var app = this;
        var args = { 
            appid: app.get_path()
        };
        if (limit) { args.limit = limit; }
        
        var task = app.get_store().XhrGet('get_app_history', args);
        
        return task.enqueue();
    };
    
    AcreApp.prototype.get_last_change = function() {
        return this._last_edit;
    };
    
    AcreApp.prototype.set_last_change = function(change) {
        this._last_edit = change;
    };
    
    AcreApp.prototype.t_set_listing = function(name, description, listed) {
        var app = this;
        var args = { appid: app.get_path() };
        if (name) { args.name = name; }
        if (name) { args.description = description; }
        if (name) { args.listed = listed; }
        
        var update =  app.get_store().XhrPost('set_app_properties', args)
            .onready(function() {
                if (name) { app._display_name = name; }
            })
            .onerror(function (code, message, info) {
                mjt.warn('Changing app listing of', app.get_name(), 'failed: ', code, ' - ', message, info);
            });

        return update.enqueue();
    };
    
    AcreApp.prototype.t_move = function(new_path) {
        var app = this;
        var args = { 
            appid: app.get_path(),
            to_appid: new_path
        };
        
        var movetask =  app.get_store().XhrPost('move_app', args)
            .onready(function(){
                app._path = new_path;
                // Need to flush the server-side app cache on url or version changes
                app.t_flush_cache().enqueue();
            })
            .onerror(function (code, message, info) {
                mjt.warn('Move of', app.get_display_name(), 'failed: ', code, ' - ', message, info);
            });
        
        return movetask.enqueue();
    };
        
    AcreApp.prototype.t_delete = function() {        
        var app = this;
        var args = {
            appid: app.get_path()
        };
        
        var deletetask = this.get_store().XhrPost('delete_app', args)
            .enqueue()
            .onready(function() {
                app.destroy();
            })
            .onerror(function (code, message, detail) {
                mjt.warn('Failed to delete app: ' + code + ', ' + message + ', ' + detail);
            });

        return deletetask;
    };    

    AcreApp.prototype.t_set_host = function(host) {
        var app = this;
        var args = {
            appid: app.get_path(), 
            host: host
        };
        
        var pubtask =  app.get_store().XhrPost('set_app_host', args)
            .onready(function(o) {
                app._hosts = o.hosts;
                if (o.listed) { app._listed = true; }
                // Need to flush the server-side app cache on url or version changes
                app.t_flush_cache(true).enqueue();
            })
            .onerror(function (code, message, info) {
                mjt.warn('Setting release URL of', app.get_display_name(), 'failed: ', code, ' - ', message, info);
            });

        return pubtask.enqueue();
    };
    
    AcreApp.prototype.t_set_release = function(version) {
        var app = this;
        var args = {
            appid: app.get_path(), 
            version: version
        };
        
        var pubtask =  app.get_store().XhrPost('set_app_release', args)
            .onready(function(o) {
                app._hosts = o.hosts;
                app._versions = o.versions;
                app._release = o.release;
                // Need to flush the server-side app cache on url or version changes
                app.t_flush_cache(true).enqueue();
            })
            .onerror(function (code, message, info) {
                mjt.warn('Setting release of', app.get_display_name(), 'failed: ', code, ' - ', message, info);
            });

        return pubtask.enqueue();
    };

    AcreApp.prototype.t_add_version = function(version, timestamp, service_url) {
        var app = this;
        var args = {
            appid: app.get_path(), 
            version: version
        };
        if (timestamp) { args.timestamp = timestamp; }
        if (typeof service_url !== 'undefined') { args.service_url = service_url; }
        
        var addversiontask = this.get_store().XhrPost('create_app_version', args)
            .onready(function(r) {
                app._versions = r.versions;
            })
            .onerror(function (code, message, detail) {
                mjt.warn('Failed to add version: ' + code + ', ' + message + ', ' + detail);
            });
            
        return addversiontask.enqueue();
    };
    
    AcreApp.prototype.t_remove_version = function(version) {
        var app = this;
        var args = {
            appid: app.get_path(), 
            version: version
        };
        
        var removeversiontask = this.get_store().XhrPost('delete_app_version', args)
            .onready(function(r) {
                app._versions = r.versions;
            })
            .onerror(function (code, message, detail) {
                mjt.warn('Failed to remove version: ' + code + ', ' + message + ', ' + detail);
            });
            
        return removeversiontask.enqueue();
    };
        
    
    /* permissions stuff */
    AcreApp.prototype.is_remote = function() {
        return this._remote_app;
    };

    AcreApp.prototype.is_writable = function() {
        return this.is_author() && !this.is_version() && !this.is_remote();
    };
    
    AcreApp.prototype.is_author = function() {
        return this.get_store().get_user() ? (this.get_store().get_user().get_name() in this.get_authors()) : false; 
    };
    
    AcreApp.prototype.is_oauth_enabled = function() {
        return !!this._oauth_enabled;
    };
    
    AcreApp.prototype.get_authors = function() {
        return this._authors;
    };
    
    AcreApp.prototype.get_write_user = function() {
        return this._authors[this._write_user];
    };
    
    AcreApp.prototype.t_add_author = function(username) {
        var app = this;
        var args = {
            appid: app.get_path(),
            username: username
        };

        var addtask = this.get_store().XhrPost('add_app_author', args)
            .onready(function(r) {
                var new_author = new AcreUser(app._store, r.authors[username]);
                app._authors[username] = new_author;
            })
            .onerror(function (code, message, detail) {
                mjt.warn('Failed to add author: ' + code + ', ' + message + ', ' + detail);
            });

        return addtask.enqueue();
    };
    
    AcreApp.prototype.t_remove_author = function(username) {
        var app = this;
        var args = {
            appid: app.get_path(),
            username: username
        };

        var removetask = this.get_store().XhrPost('remove_app_author', args)
            .onready(function() {
                delete app._authors[username];
            })
            .onerror(function (code, message, detail) {
                mjt.warn('Failed to add author: ' + code + ', ' + message + ', ' + detail);
            });

        return removetask.enqueue();
    };
    
    AcreApp.prototype.t_get_apikeys = function() {
        var app = this;
        var args = { 
            appid: app.get_path() 
        };
        
        var getapikeytask = this.get_store().XhrPost('list_app_apikeys', args)
            .onerror(function (code, message, detail) {
                mjt.warn('Failed to get API Keys: ' + code + ', ' + message + ', ' + detail);
            });
            
        return getapikeytask.enqueue();
    };
    
    AcreApp.prototype.t_add_apikey = function(name, key, secret) {
        var app = this;
        var args = {
            appid: app.get_path(),
            name: name, 
            token: key,
            secret: secret
        };
        
        var addkeytask = this.get_store().XhrPost('create_app_apikey', args)
            .onerror(function (code, message, detail) {
                mjt.warn('Failed to add api key: ' + code + ', ' + message + ', ' + detail);
            });
            
        return addkeytask.enqueue();
    };
    
    AcreApp.prototype.t_remove_apikey = function(name) {
        var app = this;
        var args = {
            appid: app.get_path(),
            name: name
        };
        
        var removekeytask = this.get_store().XhrPost('delete_app_apikey', args)
            .onerror(function (code, message, detail) {
                mjt.warn('Failed to add api key: ' + code + ', ' + message + ', ' + detail);
            });
            
        return removekeytask.enqueue();
    };
    
    AcreApp.prototype.t_set_oauth = function(enabled) {
        var app = this;
        
        if (app.is_oauth_enabled() == enabled) { return mjt.Succeed().enqueue(); }
        if (!(enabled === true || enabled === false)) { return mjt.Fail(500, 'Must set oauth_enabled to true or false').enqueue(); }
        
        var args = {
            appid: app.get_path(),
            enable: enabled
        };
        
        var oauthtask = app.get_store().XhrPost('set_app_oauth_enabled', args)
            .onready(function() {
                app._oauth_enabled = enabled;
            })
            .onerror(function (code, message, info) {
                mjt.warn('Setting OAuth enabled for ', app.get_name(), 'failed: ', code, ' - ', message, info);
            });
            
        return oauthtask.enqueue();
    };
    
    AcreApp.prototype.t_set_writeuser = function(enabled) {
        var app = this;
        
        if ((!!app.get_write_user()) === enabled) { return mjt.Succeed().enqueue(); }
        if (!(enabled === true || enabled === false)) { return mjt.Fail(500, 'Must set write_user to true or false (current user)').enqueue(); }
        
        var args = {
            appid: app.get_path(),
            enable: enabled
        };
        
        var writeusertask = app.get_store().XhrPost('set_app_writeuser', args)
            .onready(function(r) {
                if (enabled) { app._write_user = r.write_user; }
                else { app._write_user = null; }
            })
            .onerror(function (code, message, info) {
                mjt.warn('Setting write user for ', app.get_name(), 'failed: ', code, ' - ', message, info);
            });
            
        return writeusertask.enqueue();
    };
    
})();

/** acre_user.js **/
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

var AcreUser;

(function(){
    
    AcreUser = function(store, properties) {
        this._store     = store;
        this._name      = properties.name      || null;
        this._full_name = properties.full_name || null;
        this._is_admin  = properties.admin;

        return this;
    };
    
    AcreUser.prototype.destroy = function() {
        var self = this;
        self = null;
    };
    
    AcreUser.prototype.get_name = function() {
        return this._name;
    };
    
    AcreUser.prototype.get_full_name = function() {
        return this._full_name;
    };
    
    AcreUser.prototype.is_admin = function() {
        return !!this._is_admin;
    };
    
    AcreUser.prototype.get_image_url = function() {
        return this._store.get_user_image_url(this);
    };
    
    AcreUser.prototype.get_view_url = function() {
        return this._store.get_user_view_url(this);
    };
    
    AcreUser.prototype.get_new_app_host = function() {
        return this._store.get_user_default_app_host(this);
    };
    
    AcreUser.prototype.get_new_app_path = function(path) {
        return this._store.get_user_new_app_path(this, path);   
    };
    

})();

/** editors.js **/
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

// EDITORS is a registry of the constructor, default configuration 
// and supported features for each editor

var EDITORS = {};

/*
    FEATURES    :
        * hotswap               - ability to switch editors on the fly (pure text editors only)
        * mimetype_change       - ability to switch mime-types on the fly
        * margin                - show margin with linenumbers, etc.
        * linenumbers           - show linenumber, go to line
        * softwrap              - able to switch between hard and soft-wrap
        * undo                  - supports undoing and redoing
        * indent                - support re-indenting selection
        * inline_preview        - previews within editor... disable View and View with Console (query only)

    EVENTS      :
        * change(undos, redos)  - on any text change
        * linechange(num)       - whenever the linenumber changes
        * newframe(element)     - hack for dealing with attaching new handlers for frames
*/

/** editor_image.js **/
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

var ImageEditor;

(function(){
    
    ImageEditor = function(options) {
        var self  = this;
        
        this.supports_mime_type_change = false;
        
        this.ui_element = document.createElement('div');
        if (options.cssClassName) { self.ui_element.className = options.cssClassName; }
        
        this.file       = options.file;
        this.readOnly   = options.readOnly;
        
        if (options.onChange) {
            this.on_change   = options.onChange;
        }
    };
    
    ImageEditor.t_load = function(file, state) {
        
        var editor_config               = EDITORS.ImageEditor.config;
        editor_config.readOnly          = !file.is_writable();        
        editor_config.onChange          = function(undos, redos) {
          file.trigger_editor_event('change', [undos, redos]);
        };
        
        var editor = new ImageEditor(editor_config);
        editor.file = file;
        
        $(file.get_element()).append(editor.ui_element);
        if (state) { editor.set_state(state); }
        
        return mjt.Succeed(editor);
    };
    
    ImageEditor.prototype.destroy = function() {
        var editor = this;
        $(editor.ui_element).remove();
        editor = null;
    };
    
    ImageEditor.prototype.show = function(prefs) {
        var self = this;
        var uploadprompt = 'Upload an image';
        self._prefs = prefs;
        
        $(self.ui_element).empty();
        this.file.set_dirty("content", false);

        if (self.file.has_been_saved()) {
          uploadprompt = 'Replace this image';
        }

        if (!self.readOnly) {
            self.form_element = $('<form class="image-upload"><label for="image-browse">' + uploadprompt + ':</label> <input id="image-browse" type="file" name="file" size="40"></form>');
            $(self.form_element).change(self.on_change);
            $(self.ui_element).append(self.form_element);
        }

        var filename = self.file.get_name();
        var app = self.file.get_app();
        var host = app.get_base_url();
        if (self.file.has_been_saved()) {
            if (self.file.get_mime_type().substr(0,6) === 'image/') {
                /*
                 * HACK - get around mwlwt third-party cookie issue by calling api directly (same host)
                 * means previews may still be stale... but all previews will be
                 */
                var img = $('<div class="image-preview"><p>' + filename + ':</p><img src=\"' + this.file.get_acre_url() + '\"/></div>');
                img.appendTo(self.ui_element);
            } else if (this.file.get_revision()) {
                $('<a href="' + host + '/' + filename + '">download file</a>').appendTo(this.ui_element);
            }
        }
        
            $(self.ui_element).append('<div class="image-attribution"><img src="img/freebase-cc-by-61x23.png" alt="Freebase CC-BY" width="61" height="23" /><p>All images included in Acre apps are released under <a href="http://creativecommons.org/licenses/by/3.0/">CC-BY</a>.</p></div>');
        
        
        
        $(this.ui_element).show();
    };
    
    ImageEditor.prototype.refresh = ImageEditor.prototype.show;
    
    ImageEditor.prototype.hide = function() {
        $(this.ui_element).hide();
    };
    
    ImageEditor.prototype.get_state = function() {
        return {form: this.form_element};
    };
    
    ImageEditor.prototype.set_state = function(obj) {
        if (obj.revision) {
            this.file.set_revision(obj.revision);
            this.file.set_dirty("content");
        }
        this.show();
        return;
    };

    
})();

EDITORS.ImageEditor = {
    editor_class        : ImageEditor,
    supports            : {},
    config              : {
        cssClassName        : 'Editor-view'
    }
};

/** editor_textarea.js **/
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

////////////////////////////
//                        //
//   Editor Margin        //
//                        //
////////////////////////////

/* Line numbers for text area */

function EditorMargin(container, options) {
    this._container = container;
    this._container.innerHTML = '<div style=\'position: relative; left: 0; top: 0; width: 100%; height: 100%\'></div>';
    
    var lines = [];
    for (var i = 0; i < 100; i++) {
        lines.push('<div>0</div>');
    }
    
    this._lineMetricDiv = this._createLayer();
    this._lineMetricDiv.style.visibility = 'hidden';
    this._lineMetricDiv.innerHTML = lines.join('');
    
    this._fontMetricDiv = this._createLayer();
    this._fontMetricDiv.style.visibility = 'hidden';
    this._fontMetricDiv.style.height = '100em';
    
    this._lineNumberDiv = this._createLayer();
    this._lineNumberDiv.className = 'editor-margin-line-numbers';
    
    this._firstRenderedLine = 0;
    this._renderedLineCount = 0;
    this._currentLine = -1;
}

(function(){

    EditorMargin.get_layout_metrics = function(win, elmt) {
        var style;
        if (win.getComputedStyle) {
            style = win.getComputedStyle(elmt, null);
            return {
                paddingTop: style.getPropertyValue('padding-top'),
                marginTop:  style.getPropertyValue('margin-top')
            };
        } else {
            style = elmt.currentStyle;
            return {
                paddingTop: style.paddingTop,
                marginTop:  style.marginTop
            };
        }
    };
    
    EditorMargin.prototype = {
        dispose: function() {
        },
        redraw: function(layoutMetrics, scrollInfo) {
            var lineHeight = this._lineMetricDiv.offsetHeight / 100;
            var fontHeight = this._fontMetricDiv.offsetHeight / 100;
            var lineToFontHeightRatio = lineHeight / fontHeight;
        
            var maxLineCount = null;
            if (scrollInfo.contentHeight !== null) {
                maxLineCount = Math.floor(scrollInfo.contentHeight / lineHeight);
            }
        
            var newFirstVisibleLine = Math.floor(scrollInfo.scrollY / lineHeight);
                /*  [david]: If the user changes the font size on the fly (with Ctrl-+ and Ctrl--)
                    then the line numbers get mis-aligned, until they are redrawn again. To fix that,
                    we'd need to set newFirstVisibleLine to 0 and force drawing from the
                    beginning no matter what.
                */
            
            var newLastVisibleLine = Math.ceil((scrollInfo.scrollY + scrollInfo.visibleHeight) / lineHeight) - 1;
            if (maxLineCount !== null) {
                newLastVisibleLine = Math.min(newLastVisibleLine, maxLineCount - 1);
            }
        
            var renderedLastLine = this._firstRenderedLine + this._renderedLineCount;
            if (newFirstVisibleLine < this._firstRenderedLine || 
                newFirstVisibleLine >= renderedLastLine ||
                newLastVisibleLine >= renderedLastLine ||
                (maxLineCount !== null && maxLineCount < newLastVisibleLine)) {
            
                var newVisibleLineCount = newLastVisibleLine - newFirstVisibleLine + 1;
                var newFirstRenderedLine = Math.max(0, newFirstVisibleLine - newVisibleLineCount); // back one page's worth of lines
                var newLastRenderedLine = newLastVisibleLine + newVisibleLineCount; // forward one page's worth of lines
            
                if (maxLineCount !== null) {
                    newLastRenderedLine = Math.min(newLastRenderedLine, maxLineCount - 1);
                }
            
                this._lineNumberDiv.style.paddingTop = (lineToFontHeightRatio * newFirstRenderedLine) + 'em';
            
                var html = [];
                for (var i = newFirstRenderedLine; i <= newLastRenderedLine; i++) {
                    html.push('<div>' + (i + 1) + '</div>');
                }
                this._lineNumberDiv.innerHTML = html.join('');
            
                this._firstRenderedLine = newFirstRenderedLine;
                this._renderedLineCount = newLastRenderedLine - newFirstRenderedLine + 1;
            
                this._highlightCurrentLine();
            }
            
            var parseIntoPixels = function(s) {
                try {
                    if (s.indexOf("px") > 0) {
                        return parseInt(s.replace(/px$/g, ''), 10);
                    } else if (s.indexOf("em") > 0) {
                        return Math.round(parseFloat(s.replace(/em$/g, ''), 10) * fontHeight);
                    }
                } catch (e) {
                }
                return 0;
            };
        
            this._lineNumberDiv.style.top = 
                (-scrollInfo.scrollY + 
                    parseIntoPixels(layoutMetrics.paddingTop) + 
                    parseIntoPixels(layoutMetrics.marginTop)) + 'px';
        },
        _createLayer: function() {
            var layerDiv = document.createElement('div');
            layerDiv.style.position = 'absolute';
        
            this._container.firstChild.appendChild(layerDiv);
        
            return layerDiv;
        },
        setCurrentLine: function(line) {
            if (line !== this._currentLine) {
                this._unhighlightCurrentLine();
                this._currentLine = line;
                this._highlightCurrentLine();
            }
        },
        _unhighlightCurrentLine: function() {
            if (this._currentLine !== -1) {
                var childNodes = this._lineNumberDiv.childNodes;
                var index = this._currentLine - this._firstRenderedLine;
                if (index >= 0 && index < childNodes.length) {
                    childNodes[index].className = '';
                }
            }
        },
        _highlightCurrentLine: function() {
            if (this._currentLine !== -1) {
                var childNodes = this._lineNumberDiv.childNodes;
                var index = this._currentLine - this._firstRenderedLine;
                if (index >= 0 && index < childNodes.length) {
                    childNodes[index].className = 'edit-margin-current-line-number';
                }
            }
        }
    };

})();



///////////////////////////
//                       //
//    Textarea Editor    //
//                       //
///////////////////////////

var TextareaEditor;
(function(){
    
    TextareaEditor = function(options) {
        var self     = this;
                
        self._edit_element    = document.createElement('textarea');
        if (options.cssClassName) { self._edit_element.className = options.cssClassName; }
        
        if (options.readOnly) {
            $(self._edit_element).attr('readonly','yes').addClass('readonly');
            $(self._top_element).append("<div class='readonly-warning'>READ ONLY</div></div>");
        }

        if (options.on_change) {
            self.timeout_id=null;
            var handler = function(e) {
                if (self.timeout_id) { window.clearTimeout(self.timeout_id); }
                self.timeout_id = window.setTimeout(options.on_change,300);
            };
            
            var events = [
                'input',  // this should be enough, but only FF supports it. https://bugs.webkit.org/show_bug.cgi?id=15189
                'drop'    // FF does not fire 'input' when you drop text into a textarea :-(
            ]; 
            if (!$.browser.mozilla) {
                events.push('paste','keypress');
            }
            
            for (var i=0;i<events.length;i++) {
                $(self._edit_element).bind(events[i],handler);
            }
        }
    };
    
    TextareaEditor.t_load = function(file, state) {
        /* CREATE EDITOR CONFIG */
        var editor_config               = EDITORS.TextareaEditor.config;
        editor_config.readOnly          = !file.is_writable();
        
        editor_config.on_change         = function(e) {
          file.trigger_editor_event('change', []);
        };
        
        var editor = new TextareaEditor(editor_config);
        editor._top_element = document.createElement('div');
        $(editor._top_element).css({height: '100%', width: '100%'});
        $(file.get_element()).append(editor._top_element);
        $(editor._top_element).append(editor._edit_element);    

        /* set up editor margin (whether showing or not) */
        editor._margin_width                = editor_config.marginWidth;
        editor._margin_element              = document.createElement('div');
        editor._margin_element.className    = 'edit-margin';
        $(editor._top_element).append(editor._margin_element);
                
        var task = mjt.Succeed(editor);

        if (state) {
            editor.set_state(state);
        } else if (file.has_been_saved()) {
            var loadtask = file.t_get_revision().onready(function(r){
                editor.set_state({text: r.text});
            });
            task.require(loadtask);
        }
        
        return task;
    };
    
    TextareaEditor.prototype.destroy = function() {
        var editor = this;
        $(editor._top_element).remove();
        editor = null;
    };
    
    TextareaEditor.prototype.show = function(prefs) {
        var editor = this;
        editor._prefs = prefs;
        
        if (prefs.margin) {
            if (!editor.editorMargin) { editor.editorMargin = new EditorMargin(editor._margin_element, {}); }
            editor._scroll_callback = function() { editor._redraw_editor_margin(); };
            
            if ($.browser.msie) {
                editor._edit_element.onscroll = editor._scroll_callback;
            } else {
                $(editor._edit_element).bind('scroll', editor._scroll_callback);
            }
        }
        
        editor._resize_callback = function() { editor._on_resize(); };
        $(window).bind('resize', editor._resize_callback);

        editor._on_resize();
        
        $(editor._top_element).show();
    };
    
    TextareaEditor.prototype.hide = function() {
        var editor = this;
        
        $(editor._top_element).hide();
        $(editor._edit_element).unbind('scroll', editor._scroll_callback);
        $(window).unbind('resize', this._resize_callback);
    };
    
    TextareaEditor.prototype.get_state = function() {
        return { text: this._edit_element.value };
    };
    
    TextareaEditor.prototype.set_state = function(obj) {
        this._edit_element.value = obj.text;
    };
    
    TextareaEditor.prototype._on_resize = function() {
        if (this._prefs.margin) {
            $(this._edit_element).css('left', this._margin_width);
            $(this._edit_element).width($(this._top_element).width() - this._margin_width);
            $(this._margin_element).width(this._margin_width);
            $(this._margin_element).show();
            this._redraw_editor_margin();
        } else {
            $(this._edit_element).css('left', 0).width($(this._top_element).width());
            $(this._margin_element).hide();
        }
    };
    
    TextareaEditor.prototype._redraw_editor_margin = function() {
        if (this._prefs.margin) {
            try {
                var scrollInfo = this._get_scroll_info();
                var layoutMetrics = this._get_layout_metrics();
                this.editorMargin.redraw(layoutMetrics, scrollInfo);
            } catch(e) {}
        }
    };
    
    TextareaEditor.prototype._get_scroll_info = function() {
        return {
            scrollY:        $(this._edit_element).scrollTop(),
            visibleHeight:  $(this._edit_element).innerHeight(),
            contentHeight:  null // we don't know
        };
    };
    
    TextareaEditor.prototype._get_layout_metrics = function() {
        return EditorMargin.get_layout_metrics(window, this._edit_element);
    };
    
})();


EDITORS.TextareaEditor = {
    name                : "TextArea",
    editor_class        : TextareaEditor,
    supports            : {
        hotswap             : true,
        mimetype_change     : true,
        margin              : true
    },
    config              : {
        cssClassName        : 'Editor-view',
        marginWidth         : 45
    }
};
/** editor_cuecard.js **/
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

var QueryEditor = function(parent, editor_config, task) {
   var cuecardComposition;
    parent.innerHTML =
        '<div style="position: relative">' +
            '<div style="position: absolute;"></div>' +
            '<div style="position: absolute;"></div>' +
        '</div>';
        
    var queryEditorDiv = parent.firstChild.childNodes[0];
    var outputPaneDiv = parent.firstChild.childNodes[1];
    var self = this;
    
    var resize = function() {
        var margin = 10;
        var spacing = 10;
        
        var width = Math.max(100, parent.offsetWidth);
        var halfWidth = Math.round((width - 2 * margin - spacing) / 2) + "px";
        var height = Math.max(100, parent.offsetHeight);
        
        parent.firstChild.style.width = "100%";
        parent.firstChild.style.height = height + "px";
            
        var innerHeight = height - 2 * margin;
        var queryEditorHeight = innerHeight;
        $(queryEditorDiv).css("top", margin + "px").css("height", queryEditorHeight + "px");
        $(queryEditorDiv).css("left", margin + "px").css("width", halfWidth);
        $(outputPaneDiv).css("right", margin + "px").css("width", halfWidth).css("top", margin + "px").css("height", innerHeight + "px");
        
        cuecardComposition.queryEditor.layout();
        cuecardComposition.outputPane.layout();
    };

    editor_config.focusOnReady = true;
    editor_config.onReady = function() {
        task.ready(self);
    };
    
    
    cuecardComposition = CueCard.createComposition({
        queryEditorElement: queryEditorDiv,
        queryEditorOptions: editor_config,
        outputPaneElement: outputPaneDiv,
        outputPaneOptions: { verticalPadding: 2, horizontalPadding: 2 }
    });
    this.composition = cuecardComposition;
    
    cuecardComposition.queryEditor._onRun = function(forceCleanUp) {
        this.run(true); // always clean up, even when invoked with keyboard shortcut
    };
    
    this.get_state = function() {
        return { text: cuecardComposition.queryEditor.content() };
    };
    
    this.set_state = function(obj) {
        cuecardComposition.queryEditor.content(obj.text);
    };
        
    this.destroy = function() {
        // TODO: do proper disposing in cuecard
        $(parent).hide();
        $(parent).remove();
    };
    
    this.show = function(prefs) {
        var self = this;
        // TODO: temp hack until I can do this better with David's help
        self._prefs = prefs;
        if (prefs.emql) {          
            this.composition.queryEditor._getQueryEnvelope = function() {
                return { extended : 1 };
            };
        }
        
        var editor = cuecardComposition.queryEditor._editor;
        setTimeout(function() {
          editor.setLineNumbers(prefs.margin);
          editor.setTextWrapping(prefs.softwrap);
          self._file.trigger_editor_event('linechange',[editor.currentLine()]);
          
          // Firefox BUG: selection not preserved when iframe is hidden
          if (editor._last_selection) {
            var start = editor._last_selection.start;
            var end   = editor._last_selection.end;
            editor.selectLines(start.line, start.character, end.line, end.character);
            delete editor._last_selection;
          }
          
        },1);
        
        $(window).bind('resize', resize);
        
        $('.cuecard-queryEditor-controls-bottom').acre(fb.acre.apps.appeditor + "/templates", "query_button_bar");
        $(self._file.get_element()).show();
        $(parent).show();
        
        resize();
    };
    this.hide = function() {
        $(parent).hide();
        
        $(window).unbind('resize', resize);
    };
    
    this.undo = function() {
        cuecardComposition.queryEditor._editor.editor.history.undo();
    };
    
    this.redo = function() {
        cuecardComposition.queryEditor._editor.editor.history.redo();
    };
    
    this.reindentSelection = function() {
        cuecardComposition.queryEditor._editor.editor.reindentSelection();
    };
    
    this.query_assist = function() {
        cuecardComposition.queryEditor.startAssistAtCursor();
    };
    
    this.query_run = function() {
        cuecardComposition.queryEditor.run(this._file.is_writable());
    };
    
    this.query_redangle = function() {
        var self = this;
        var qe = cuecardComposition.queryEditor;
        
        var m = qe.getQueryModelAndContext();
        var q = m.model;
        q.toInsideOutQueryJson(m.context, CueCard.UI.createBlockingContinuations(function(cont, q2) {
            qe.content(CueCard.jsonize(q2, qe.getJsonizingSettings()));
        }));
    };
    
    this.generate_template = function() {
        var self = this;
        
        var name = ui.get_app().get_untitled_file_name();
        var metadata = { acre_handler: 'mjt' };
        
        var m = cuecardComposition.queryEditor.getQueryModelAndContext();
        var q = m.model.toQueryJson();
        
        CueCard.CodeGeneration.serializers["acre-template"].generateQueryCall = function(context, writer, utils, queryJSON, variables, qVar, oVar) {
            writer.appendIndent(); writer.append("<acre:script>"); writer.appendLineBreak();
            writer.indent();

            writer.appendIndent(); writer.append('var ' + qVar + ' = acre.require("' + self._file.get_name() + '").query');
            writer.append(";"); writer.appendLineBreak();
            if (self._prefs.emql) {
                writer.appendIndent(); writer.append('var ' + oVar + ' = acre.freebase.mqlread(' + qVar +', {extended:1});'); writer.appendLineBreak();
            } else {
                writer.appendIndent(); writer.append('var ' + oVar + ' = acre.freebase.mqlread(' + qVar +');'); writer.appendLineBreak();
            }

            writer.unindent();
            writer.appendIndent(); writer.append("</acre:script>"); writer.appendLineBreak();

            return oVar + ".result";
        };
        
        var text = CueCard.CodeGeneration.generate(q, CueCard.CodeGeneration.serializers["acre-template"],{indentLevel: 1});
        text =
            '<html>\r' +
            '<head>\r\r' +
            '  <title>Query-Generated Template</title>\r\r' +
            '  <style type="text/css" media="screen">\r' +
            '    * { vertical-align: baseline; font-weight: inherit; font-family: inherit; \r' +
            '        font-style: inherit; font-size: inherit; border: 0 none; outline: 0; padding: 0; margin: 0; }\r' +
            '    body { margin: 15px; }\r' +
            '    ul { list-style: none; }\r' +
            '    li { padding: 3px; }\r' +
            '    table { border-collapse: collapse; border-spacing: 0; width: 100%; }\r' +
            '    th, td { border: 1px solid #ddd; vertical-align: top; padding: 6px; }\r' +
            '    th { width: 20%; text-align: right; font-size: 11px; font-weight: bold; padding: 6px; color: #666; background: #f5f5f5; }\r' +
            '    td { width: 80%; font-size: 12px; }\r' +
            '    img { padding: 1px; border: 1px solid #ccc;}\r' +
            '    ins { color: #aaa; text-decoration: none;}\r' +
            '  </style>\r\r' +
            '</head>\r\r' +
            '' +
            '<body>\r' + 
            text + 
            '  \r' +
            '  <!-- Freebase attribution template -->\r' +
            '  ${acre.require("/freebase/apps/attribution/templates").blanket()}\r' +
            '</body>\r' +
            '</html>\r';

        ui.do_file_create_new(name, metadata, {text: text});
    };
    
    CodeMirror.prototype.highlight_line = function() {
        var editor = this;
        var file =  editor._file;
        
        var linenum = editor.currentLine();
        var $lineNumbers = $(editor.lineNumbers);
        $lineNumbers.find('.Codemirror-current-line').removeClass('Codemirror-current-line');
        $lineNumbers
            .find('div')
            .eq(linenum)
            .addClass('Codemirror-current-line');
        file.trigger_editor_event('linechange',[linenum]); 
    };
    
    this.goto_line = function(linenum) {
        var cm = cuecardComposition.queryEditor._editor.editor;
        try {
            cm.jumpToLine(linenum);            
        } catch(e) {
            // catch out-of-range line number
            cm.selectLines(cm.prevLine(cm.lastLine()), 0);
        }
    };
};

(function(){
    
    /* 
     *   A task for creating a new instance of QueryEditor
     */
    var CreateQueryEditor = mjt.define_task(null, [{name: 'parent'},{name: 'editor_config'}]);
    CreateQueryEditor.prototype._task_class = 'CreateQueryEditor';
    CreateQueryEditor.prototype.request = function() {
        return new QueryEditor(this.parent, this.editor_config, this);
    };
    
    QueryEditor.t_load = function(file, state) {
        
        // Make sure CueCard is correctly initialized
		CueCard.helper = fb.acre.freebase.site_host + "/cuecard/";
		CueCard.freebaseServiceUrl = fb.acre.freebase.service_url + "/";
		CueCard.urlPrefix = "/cuecard/";
		CueCard.apiProxy.base = fb.acre.freebase.site_host + "/cuecard/";
        
        /* CREATE EDITOR CONFIG */
        // make a deep copy of the default config object so that each file can have different settings
        var editor_config = $.extend(true,{},EDITORS.QueryEditor.config);
        editor_config.readOnly = !file.is_writable();
                
        var top_element = document.createElement('div');
        $(top_element).css({height: '100%', width: '100%'});
        $(file.get_element()).hide().append(top_element);
        editor_config.codeMirror.onChange = function() {
            try {
                var editor = file._loaded_editors["QueryEditor"].composition.queryEditor._editor;
                var history = editor.historySize();
                file.trigger_editor_event('change', [ history.undo, history.redo ]);        
            } catch(e) {}
        };
        editor_config.codeMirror.cursorActivity = function() { 
            var editor = file._loaded_editors["QueryEditor"].composition.queryEditor._editor;
            editor.highlight_line();
        };
        
        var loadtask;
        var task = CreateQueryEditor(top_element, editor_config)
            .onready(function(editor) {
                editor.composition.queryEditor._editor.setParser('JSParser');     
                if (state) { editor.set_state(state); }
                else if (loadtask) { editor.set_state({text: loadtask.result.text}); }
                editor._file = editor.composition.queryEditor._editor._file = file;
                editor._top_element = top_element;
                $('>div',top_element).css('height','100%');
                $('.cuecard-queryEditor-controls-top').hide();
                if (editor_config.readOnly) { 
                    $(file.get_element()).addClass('readonly');
                    $('.cuecard-queryEditor-inner', file.get_element()).append("<div class='readonly-warning'>READ ONLY</div>");
                }
                $('<a class="cuecard-permalink" href="javascript:{}">Open in Query Editor</a>')
                    .click(function(evt) {
                        var url = "http://www.freebase.com/app/queryeditor?q=" + 
                            encodeURIComponent(editor.composition.queryEditor.getUnresolvedQuery());
                        window.open(url, "_blank");
                    })
                    .appendTo($(top_element).find('.cuecard-outputPane')[0]);
                
                file.trigger_editor_event('newframe', [editor.composition.queryEditor._editor.frame]);
            });

        if (!state && file.has_been_saved()) {
            loadtask = file.t_get_revision();
            task.require(loadtask);
        }
    
        return task;
    };
})();

EDITORS.QueryEditor = {
    editor_class        : QueryEditor,
    supports            : {
        margin              : true,
        linenumbers         : true,
        softwrap            : true,        
        undo                : true,
        indent              : true,
        inline_preview      : true,
        emql                : true
    },
    config              : {
        codeMirror: {
            parserConfig: {json: true},  //TODO: remove once cuecard version is greater than 1.3.4
            lineNumbers: false
        }
      /* HACK: David - are any of these options actually respected by cuecard/api/scripts/query-editor.js?
        height              : '100%',
        marginWidth         : 45,      // is actually used by QueryEditor?
        autoMatchParens     : true,
        passDelay           : 100,     // gap between highlighting runs (each run lasts 50ms - see passTime in codemirror.js)
        undoDelay           : 250,     // min time between onChange notifications (and undo history commit)
        // These options must match settings in build.sh
        path                : 'codemirror/js/',
        parserfile          : ['parsexml.js', 'parsecss.js', 'tokenizejavascript.js', 'parsejavascript.js', 'parsehtmlmixed.js', 'parsedummy.js'],
        stylesheet          : ['codemirror/css/xmlcolors_acrid.css', 'codemirror/css/jscolors_acrid.css', 'codemirror/css/csscolors_acrid.css'],
        lineNumbers         : true,
        tabMode             : "shift",
        emql                : false
        */
    }
};

/** editor_codemirror.js **/
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

(function(){
    
    /* 
     *   A task for creating a new instance of CodeMirror
     *   NOTE: CodeMirror itself is defined in codemirror/
     */
    var CreateCodeMirror = mjt.define_task(null, [{name: 'parent'},{name: 'editor_config'}]);
    CreateCodeMirror.prototype._task_class = 'CreateCodeMirror';
    CreateCodeMirror.prototype.request = function() {
        var task = this;
        var editor = new CodeMirror(this.parent, this.editor_config);
        this.editor_config.initCallback = function(mirror) {
            task.ready(editor);
        };        
        editor.get_state = function() {
          return { text: this.editor.getCode() };
        };
        
        editor.set_state = function(obj) {
          this.editor.importCode(obj.text);
        };
    };
    

    function determine_parser(file) {
        var parser = 'DummyParser'; // default
        
        var CODEMIRROR_DOCTYPE_MAP = {
            'mqlquery': 'JSParser',
            'acre_script': 'JSParser',
            'mjt': 'HTMLMixedParser'
            // 'passthrough' : see CODEMIRROR_MEDIATYPE_MAP
        };

        var CODEMIRROR_MEDIATYPE_MAP = {
            'text/html'  : 'HTMLMixedParser',
            'text/css'   : 'CSSParser',
            'text/javascript'  : 'JSParser',
            'application/json' : 'JSParser'
            // otherwise use default 'DummyParser'
        };
        
        var acre_handler = file.get_acre_handler();
        var mime_type = file.get_mime_type();
        if (mime_type !== 'text/plain' ) {
            if (mime_type in CODEMIRROR_MEDIATYPE_MAP) {
                parser = CODEMIRROR_MEDIATYPE_MAP[mime_type];
            }
        } else if (acre_handler in CODEMIRROR_DOCTYPE_MAP) {
            parser = CODEMIRROR_DOCTYPE_MAP[acre_handler];
        }

        return parser;
    }
    
    CodeMirror.t_load = function(file, state) {
        /* CREATE EDITOR CONFIG */
        // make a deep copy of the default config object so that each file can have different settings
        var editor_config = $.extend(true,{},EDITORS.CodeMirror.config);
        
        editor_config.readOnly = !file.is_writable();
        if (editor_config.readOnly) { 
            $(file.get_element()).addClass('readonly').append("<div class='readonly-warning'>READ ONLY</div>");
        }
        
        editor_config.onChange = function() {
          if (!file._loaded_editors["CodeMirror"]) { return; } // we haven't initalized our wrapper yet
          var history = file._loaded_editors["CodeMirror"].historySize();
          file.trigger_editor_event('change', [history.undo, history.redo]);
        };
        
        var top_element = document.createElement('div');
        $(top_element).css({height: '100%', width: '100%'});
        $(file.get_element()).append(top_element);
        
        var loadtask;
        var task = CreateCodeMirror(top_element, editor_config)
            .onready(function(editor) {
                editor.setParser(determine_parser(file));
                if (state) { editor.set_state(state); }
                else if (loadtask) { editor.set_state({text: loadtask.result.text}); }
                editor._file = file;
                editor._top_element = top_element;
                file.trigger_editor_event('newframe', [editor.frame]);
                editor_config.cursorActivity = function() { editor.highlight_line(); };
            });

        if (!state && file.has_been_saved()) {
            loadtask = file.t_get_revision();
            task.require(loadtask);
        }
    
        return task;
    };
    
    CodeMirror.prototype.destroy = function() {
        var editor = this;
        
        if ("_codeAssist" in editor) { 
            editor._codeAssist.dispose();
            editor._codeAssist = null;
        }
        
        $(editor._top_element).remove();
        editor = null;
    };
    
    CodeMirror.prototype.show = function(prefs) {
        var editor = this;
        var file = editor._file;
        editor._prefs = prefs;
        
        setTimeout(function() {
          editor.setLineNumbers(prefs.margin);
          editor.setTextWrapping(prefs.softwrap);
          editor.highlight_line();

          $(editor._top_element).show();
          $('iframe',editor._top_element).focus();
          
          // Firefox BUG: selection not preserved when iframe is hidden
          if (editor._last_selection) {
            var start = editor._last_selection.start;
            var end   = editor._last_selection.end;
            editor.selectLines(start.line, start.character, end.line, end.character);
            delete editor._last_selection;
          }

					// Lazy-load CodeAssist if it's turned on
          if (prefs.dotTrigger && file.is_writable()) {
            fb.get_script(fb.acre.libs["codeassist"], function(){
            	if (!editor._codeAssist) {
		          	editor._codeAssist = new CodeAssist(editor.frame, editor, {
									isMjt: file.get_acre_handler() == 'mjt'
								});
            	}
							editor._codeAssist.putSetting("dotTrigger", prefs.dotTrigger);
						});
         	}
          
        },1);
    };
    
    CodeMirror.prototype.hide = function() {
        var editor = this;

        // Firefox BUG: selection not preserved when iframe is hidden
        var start = editor.cursorPosition();
        var end   = editor.cursorPosition(false);
        editor._last_selection = {start:start,end:end};

        $(editor._top_element).hide();
    };
    
    CodeMirror.prototype.highlight_line = function() {
        var editor = this;
        var file =  editor._file;
        
        var linenum = editor.currentLine();
        var $lineNumbers = $(editor.lineNumbers);
        $lineNumbers.find('.Codemirror-current-line').removeClass('Codemirror-current-line');
        $lineNumbers
            .find('div')
            .eq(linenum)
            .addClass('Codemirror-current-line');
        file.trigger_editor_event('linechange',[linenum]); 
    };
    
    CodeMirror.prototype.goto_line = function(linenum) {
        try {
            this.jumpToLine(linenum);            
        } catch(e) {
            // catch out-of-range line number
            this.selectLines(this.prevLine(this.lastLine()), 0);
        }
    };

    var ACRETAG = 'xml-tagname-acre'; //TODO: better name in CSS
    var special_class = { 'acre:doc':ACRETAG, 'acre:block':ACRETAG, 'acre:script':ACRETAG };

    CodeMirror.style_token = function(span,token) {
        var t = token.content.toLowerCase();
  	if (token.style == "xml-tagname") {
  	    if (special_class[t]) {
    	        span.className += " " + special_class[t];
     	    }
    	}
    };

})();

EDITORS.CodeMirror = {
    name                : "CodeMirror",
    editor_class        : CodeMirror,
    supports            : {
        hotswap             : true,
        mimetype_change     : true,
        margin              : true,
        linenumbers         : true,
        softwrap            : true,
        undo                : true,
        indent              : true,
        codeassist          : true
    },
    config              : {
        parserConfig        : { triggers:{"acre:script":"JSParser", "script":"JSParser", "style":"CSSParser"} },
        activeTokens        : CodeMirror.style_token,
        height              : '100%',
        marginWidth         : 45,      // is actually used by CodeMirror?
        autoMatchParens     : true,
        passDelay           : 100,     // gap between highlighting runs (each run lasts 50ms - see passTime in codemirror.js)
        undoDelay           : 250,     // min time between onChange notifications (and undo history commit)
        basefiles           : [],
        parserfile          : [fb.acre.libs.codemirror],     // see index.sjs
        stylesheet          : [fb.acre.libs.codemirror_css], // see index.sjs
        lineNumbers         : true,
        highlightActiveLine : true,
        tabMode             : "shift",
        dotTrigger          : false
    }
};

/** ui.js **/
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

// TODO: Put in Metaweb info / license

var ui = {};

(function() {


    ///////////////////
    //               //
    //    Drawing    //
    //               //
    ///////////////////
    
    ui.init = function() {
        $('#body').acre(fb.acre.apps.appeditor + "/templates", "body");
        
        // initialize apps menu button
        $("#button-apps").click(function(){ ui.do_show_menu('apps'); }).attr("title", ui.shortcut.get_keys('Open App'));
        
        ui.shortcut.register_keys(document);
        window.onbeforeunload = ui.warn_user_about_unsaved_files;

        // cancel browser-back if backspace pressed on an element without editable text
        $(document).keydown(function(e) {
          return !(e.which === 8 && e.target.nodeName !== 'INPUT' && e.target.nodeName !== 'TEXTAREA');
        });
        
        $('.exit').live('click', ui.do_hide_overlays);
                        
        $('.app-link').live('click', function(e){
          if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
            /* default browser behaviour = open link in new tab */
          } else {
            /* if files have been edited, make sure user still wants to switch */
            var new_app = $(this).attr("apppath");

            ui.do_hide_overlays();
            if (ui.get_app() && ui.get_app().is_dirty()) {                
              ui.do_show_dialog('files_dirty', [new_app]);
            } else {
              ui.do_choose_app(new_app);
            }
            return false;
          }
        });
        
        // load initial state and continue to check for changes due to back/forward button
        ui.check_browser_hash();
        setInterval(ui.check_browser_hash, 250);
    };

    ui.refresh_app_templates               = function(state) {
        var app = ui.get_app();
        
        $('#header-apptitle').acre(fb.acre.apps.appeditor + "/templates", "header", [state]);
        
        if (app) {
            $('#list-column').acre(fb.acre.apps.appeditor + "/templates", "list_column");
            if (app.is_writable()) {
                $('#about-bar').hide();
            } else {
                $('#about-bar').acre(fb.acre.apps.appeditor + "/templates", "about_bar").show();
            }
        }
    };
    
    ui.refresh_file_templates             = function() {
        $('#file-list').acre(fb.acre.apps.appeditor + "/templates", "file_list");
        $('#button-bar').acre(fb.acre.apps.appeditor + "/templates", "button_bar");
        ui.finish_drawing();
    };
    
    ui.finish_drawing           = function() {
        $('.refresh').show();
        ui.set_state();
        $(window).trigger('resize');
    };

    ui.do_show_dialog           = function(dialogname, args, keep_menu) {
        ui.do_hide_overlays();
        
        function _hide_dialogs() {
            ui.do_hide_dialog_overlays();
            $(document).unbind('keydown', _key_handler);
        }
        
        function _key_handler(e) {
            if (e.keyCode == 27) { _hide_dialogs(); }
        }

        if (dialogname == 'welcome') {
            ui.dialog = $("<div id='" + dialogname + "'></div>")
                .acre(fb.acre.apps.appeditor + "/dialogs", dialogname, args)
                .prependTo(document.body);
        } else {
            $("<div id='dialog-overlay'></div>").prependTo(document.body);
            $(document).bind('keydown', _key_handler);
            ui.dialog = $("<div id='dialog-" + dialogname + "' class='dialog'></div>")
                .acre(fb.acre.apps.appeditor + "/dialogs", dialogname, args)
                .prepend("<div class='dialog-close' onclick='ui.do_hide_overlays()'></div>")
                .prependTo(document.body);
        }
        
        ui.dialog.show();
        ui.dialog.css('left', ($(window).width() - ui.dialog.outerWidth())/2);
        return false; // cancel click
    };
    
    ui.do_show_menu             = function(menuname, args) {
        function _hide_menus() {
            ui.do_hide_menu_overlays();
            $(document).unbind('keydown', _key_handler);
        }
        
        function _key_handler(e) {
            if (e.keyCode == 27) { _hide_menus(); }
        }

        $("<div id='menu-overlay'></div>").prependTo(document.body).click(_hide_menus);
        $(document).bind('keydown', _key_handler);

        $('#button-' + menuname).addClass('button-open');
        var offset = $('#button-' + menuname).offset();
        var button_height = $('#button-' + menuname).height();

        $("<div id='menu-" + menuname + "' class='menu'></div>")
            .css({top: offset.top + button_height + 10, left: offset.left})
            .prependTo(document.body)
            .acre(fb.acre.apps.appeditor + "/menus", menuname, args);
        return false; // cancel click
    };
    
    ui.do_setup_submenu         = function(menu_item_id, submenuname, args) {
        var mouseenter_timer;
        var mouseleave_timer;
        var menu_drawn = false;
        
        var menu_item = $('#'+menu_item_id);
        var parent_menu = menu_item.closest('.menu');
        var submenu =  $("<div id='menu-" + submenuname + "' class='menu submenu'></div>");

        menu_item.mouseenter(function(e){
          mouseenter_timer = setTimeout(function(){
            if (!menu_drawn) {
                
              submenu
                .css({
                    top  : menu_item.offset().top,
                    left : parent_menu.offset().left + parent_menu.width()
                })
                .prependTo(document.body)
                .acre(fb.acre.apps.appeditor + "/menus", submenuname, args)
                .mouseenter(function(e){  
                    clearTimeout(mouseleave_timer);
                })
                .mouseleave(function(e){
                    clearTimeout(mouseenter_timer);
                    mouseleave_timer = setTimeout(function(){
                        submenu.css('visibility','hidden');
                    }, 100);
                });

                menu_drawn = true;           
            } else {  
               submenu.css('visibility','visible');
            }
          }, 250);
        })
        .mouseleave(function(e){
          clearTimeout(mouseenter_timer);
          mouseleave_timer = setTimeout(function(){
             submenu.css('visibility','hidden');
          }, 100);
        });
    };
    
    ui.do_hide_dialog_overlays  = function() {
        delete ui.dialog;
        $('#dialog-overlay, .dialog').remove();
        $('.fbs-pane, .fbs-flyout-pane').hide();
    };
    
    ui.do_hide_menu_overlays    = function() {
        $('#menu-overlay, .menu').remove();
        $('.button-open').removeClass('button-open');
        $('.fbs-pane, .fbs-flyout-pane').hide();
    };
    
    ui.do_hide_overlays         = function() {
        ui.do_hide_dialog_overlays();
        ui.do_hide_menu_overlays();
    };

    ui.do_hide_welcome  = function() {
        $('#welcome').remove();
    };



    ///////////////////
    //               //
    //    State      //
    //               //
    ///////////////////
    
        
    // State globals    
    var _first_time = true;
    var _current_store;
    var _current_user;
    var _current_app;
    var _current_file;
    var _current_line;
    var _current_file_is_dirty = false;         // cache the value so we know to refresh the UI when it changes
    var _changing_state = false;                // don't check the url hash while in the process of switching apps or files
    var _last_status_check = + new Date();
    
    var NUM_RECENTS_TO_STORE = 16;
    

    ui.check_browser_hash       = function() {
        if (_changing_state) { return; }
        var new_hash = ui._get_browser_hash();
        
        if (new_hash == '0') {
            ui.set_state();
            return;
        }
        
        if (_first_time || ui._ui_state_to_browser_hash() !== new_hash) {
            _first_time = false;
            var args = mjt.app.decode_uristate(new_hash);
            
            // load old-style graph ID syntax...
            var no_xss =  /[\<\>]/;     //don't allow tags (XSS)
            var app = args.path || args.app;
            app = !no_xss.test(app) ? app : null;
            var file = !no_xss.test(args.file) ? args.file : null;
            
            ui.do_choose_app(app, file, args.line, args.create);
        }
    };

        // ''         --> ''        (no hash)
        // '#!path=x' --> 'path=x'  (new style)
        // '#path=x'  --> 'path=x'  (old style)
        ui._get_browser_hash        = function() {
            return window.location.hash.replace(/#!?/,'');
        };

        ui._ui_state_to_browser_hash = function() {
            if (typeof ui.get_app() == 'undefined') { return null; }

            var state = {};
            if (ui.get_app()) { state.path = ui.get_app().get_versioned_path(); }
            if (ui.get_file()) { state.path += "/" + ui.get_file().get_relative_path(); }

            return mjt.app.encode_uristate(state);
        };

    ui.set_state                = function() {          // called when done with a state transition
        var app = ui.get_app();
        var file = ui.get_file();
        
        _current_file_is_dirty = file ? file.is_dirty() : null;
        
        var title = "";
        if (app) { title += (app.get_display_name() || app.get_path()) + " - "; }
        if (file) { title += file.get_name() + " - "; }
        title += "Freebase App Editor";
        document.title = title;
        
        var hash = ui._ui_state_to_browser_hash();
        if (hash !== ui._get_browser_hash()) {
            window.location.hash = '!'+hash;
        }
            
        _changing_state = false;    
    };

    ui.clear_state              = function() {
        _current_app = null;
        _current_file = null;
        _current_line = null;
        _current_file_is_dirty = null;
    };

    ui.get_store                = function() {
        return _current_store;
    };
    
    ui.set_store                = function(obj) {
        _current_store = obj;
    };
    
    ui.set_user                 = function(user) {
        var store = ui.get_store();  
        if (user !== store.get_user()) {
            store.set_user(user);
        }
        _current_user = store.get_user();
    };
      
    ui.get_app                  = function(){
        if (!_current_app) { return null; }
        return _current_app;
    };
    
    ui.get_file                 = function() {
        if (!_current_file) { return null; }
        return _current_file;
    };
    
    ui.get_line                 = function() {
        return _current_line;
    };
    
    ui.get_user                 = function() {
        return _current_user;
    };

    ui.get_recents              = function(kind, keep_first) {
        var recent = $.localStore('recent_'+kind, undefined, false);
        if (recent === null) { recent = []; }
        if (!keep_first && recent && recent.length > 0) { recent.shift(); }
        return recent;
    };

    ui.add_recent               = function(kind, value, replace) {
        var recent = $.localStore('recent_'+ kind, undefined, false);
        if (!recent || !jQuery.isArray(recent)) { recent = []; }

        var val = JSON.stringify(value);
        for (var i = 0; i < recent.length; i++) {
            var ival = JSON.stringify(recent[i]);
            if (ival == val || (kind == 'apps' && ((value && ((recent[i].path == value.path) || (ui.id_to_path(recent[i].path) == value.path))) || (recent[i].path == replace)))) {
                recent.splice(i,1);
            }
        }
        
        if (value) {
            recent.unshift(value);
            if (recent && recent.length > NUM_RECENTS_TO_STORE) { 
                var removed = recent.splice(NUM_RECENTS_TO_STORE); 
                if (kind == 'apps') {
                    for (var j=0; j < removed.length; j++) {
                        ui.clear_recents(removed[j]);
                    }
                }
            }            
        }

        $.localStore('recent_'+ kind, recent, false);
    };
    
    ui.clear_recents            = function(kind) {
        $.localStore('recent_'+ kind, null, false);
    };



    ///////////////////
    //               //
    //    Actions    //
    //               //
    ///////////////////
        

    // App editor actions
    ui.do_choose_app            = function(appid, filename, linenum, create) {
        _changing_state = true;
        
        function _no_app() {
            ui.clear_state();
            ui.set_state();
            ui.refresh_app_templates('open');
            var recent_apps = ui.get_recents('apps', true);
            if (create == 'app') {
                if (!ui.get_user()) {
                   location.href = ui.get_store().get_user_account_url("signin") + 'create=app';
                }
                ui.do_show_dialog('new_app');
            } else if (recent_apps.length > 0) {
                var last_app = recent_apps.shift();
                $.localStore('recent_apps', recent_apps, false);
                ui.do_choose_app(last_app.path);
            } else if (ui.get_user()){
                ui.do_show_dialog('welcome',[true]);
            } else {
                ui.do_show_dialog('welcome');
            }
        }
        
        function _select_file() {
            if (create == 'file') {
                ui.set_state();
                ui.do_show_dialog('add_file');                
            } else {                
                ui.do_choose_file(filename, linenum);
            }
        }
        
        var current_app = ui.get_app();
        var current_app_path = current_app ? current_app.get_versioned_path() : null;
        
        if (appid && current_app && appid == current_app_path) {
            ui.refresh_app_templates();
            _select_file();
            return;
        }

        // We're changing apps, clean up until we're done
        ui.do_hide_overlays();
        ui.do_hide_welcome();
        $('.refresh').hide();
        
        // no app
        if (!appid) { 
            _no_app(); 
            return;
        }

        if (current_app) { current_app.destroy(); }
        ui.refresh_app_templates('loading');
        
        var new_app = new AcreApp(ui.get_store(), appid);
        new_app.t_load()
            .onready(function(){
                _current_app = new_app;        
                ui.add_recent('apps', { path: new_app.get_path(), name: new_app.get_display_name() });
                _current_file = null;

                ui.refresh_app_templates();
                _select_file();
                ui.do_status_check();
            })
            .onerror(function(code, message, info) {
                if (code == "/api/status/error/input/no_app") {                 
                    ui.MessagePanel.error(message ? message : 'Error loading app: ' + appid + '. ' + message || '');
                    // Remove bad entry in the Recent Apps menu
                    ui.add_recent('apps', null, appid);
                    _no_app();
                } else {
                    // catastrophic failure
                    assert.critical(false, "Error connecting to Freebase<br/>" + message);
                    mjt.error(code, message, info);
                    
                    ui.clear_state();
                    ui.set_state();
                    ui.refresh_app_templates('open');
                }
            });
    };
           
    ui.do_choose_file           = function(filename, linenum) {
        _changing_state = true;
        
        function _show_file() {
            var file = ui.get_file();
            if (!file) { return ui.refresh_file_templates(); }

            var editor_name = ui._get_desired_editor_classname();
            return file.t_editor_show(editor_name, ui.get_editor_prefs())
                .onready(function() {
                    if (linenum) {
                        setTimeout(function(){ file.editor_goto_line(linenum); }, 0);
                    }
                    ui.refresh_file_templates();
                    ui.set_state();
                });
        }
        
        var app = ui.get_app();

        var old_file = ui.get_file();
        
        var file = app.get_file(filename);          // grab the file they asked for or the default file
        if (!file) { file = app.get_file(); }
        if (!file || file == old_file) {            // no files or same file?  let's bail     
            _show_file(linenum);
            return;
        }

       _current_file = file;
       _current_file_is_dirty = file.is_dirty();
       //ui.add_recent(ui.get_app().get_path(), file.get_relative_path());
       
        if ($('#file-area').has(file.get_element()).length === 0) {
            $('#file-area').append(file.get_element());
            ui._register_editor_event_handlers(file); 
        }
        
        if (old_file) { old_file.hide(); }
        $(file.get_element()).show();
        
        return _show_file(linenum);
    };
    
    ui.do_refresh_file          = function() {
        var file = ui.get_file();
        if (!file) { return; }
        
        file.set_dirty("editor");
        var editor_name = ui._get_desired_editor_classname();
        file.t_editor_show(editor_name, ui.get_editor_prefs())
            .onready(function() {
                ui.refresh_file_templates();
                setTimeout(function(){ file.editor_goto_line(ui.get_line()); }, 0);
            });
    };
    
    ui.do_run_view              = function(args, preview) {
        var file = ui.get_file();
        
        // HACK
        if (file.get_acre_handler() == "mqlquery") {
            file._current_editor.query_run();
            return;
        }
        
        var preview_url = ui.get_file().get_acre_url(preview);
        
        var PreviewWindow = window.open('about:blank', ui.get_app().get_path().replace(/[\/-]/g, '_'));
        if (!PreviewWindow) { 
            ui.MessagePanel.error("A window couldn't be opened.  Tell your web browser to allow this site to open pop up windows and try again to continue."); 
            return false;
        }

        ui.do_app_save_all(function() {
            PreviewWindow.location = preview_url;
            PreviewWindow.focus();
        });
    };

    ui.do_acre_home_link          = function(path) {
        location.href = ui.get_store().get_freebase_url() + "/apps";
        return false; // cancel click
    };

    ui.do_status_check         = function() {
        var args = {};
        if (ui.get_app()) { args.appid = ui.get_app().get_path(); }
        
        ui.get_store().XhrGet("store_status_check", args)
            .enqueue()
            .onready(function(r) {
                ui.get_app().set_last_change(r.change);
                
                if (!!r.user !== !!ui.get_user()) {
                    ui.set_user(r.user);
                    if (!r.user) {
                        ui.MessagePanel.error('You are no longer signed in.  Sign back in in another window to not lose any changes.');
                    		$(window).trigger("fb.user.signedout");
										}
										$(window).trigger("fb.user.signedin");
                }
                $('#app-edits-shim').acre(fb.acre.apps.appeditor + "/templates", "app_edits");
                ui.refresh_file_templates();
            });
    };


    // AcreApp actions
    ui.do_app_create_new        = function(appid, display_name, clone_id) {
        var args =        { appid  : appid };
        if (display_name) { args.name = display_name; }
        if (clone_id)     { args.clone = clone_id; }
        
        if (ui.get_store().get_user_apps(appid)) {
            ui.MessagePanel.error('App with that URL already exists');
            return;
        }
        
        ui.MessagePanel.doing('Creating: ' + display_name + '...'); 
        
        ui.get_store().XhrPost("create_app", args)
            .enqueue()
            .onready(function(user_apps) {
                ui.MessagePanel.info('Created: ' + display_name);
                ui.do_choose_app(appid);
                ui.get_store().set_user_apps(user_apps);
             })
             .onerror(function(code, message, info) {
                ui.MessagePanel.error(message ? message : 'Error creating: ' + appid + '. ' + message || '');
            });
    };

    ui.do_app_move              = function(new_path) {
        var app = ui.get_app();
        var old_path = app.get_path();

        // don't want to think this is a back button event and reload app
        _changing_state = true;
        ui.MessagePanel.doing("Moving app...");
        app.t_move(new_path)
            .onready(function(r) {
                // Update the hash with the new app path
                ui.set_state();
                // Replace old entry in the Recent Apps menu
                ui.add_recent('apps', { path: app.get_path(), name: app.get_display_name() }, old_path);
                // Update user app list
                ui.get_store().t_refresh_user_apps();
                
                ui.MessagePanel.info("App moved to " + new_path);
            })
            .onerror(function(code, message, info) {
                ui.MessagePanel.error(message ? message : 'Error moving: ' + app.get_display_name());
            });
    };
    
    ui.do_app_set_host          = function(host) {
        var app = ui.get_app();
        
        ui.MessagePanel.doing("Updating release URL for " +  app.get_display_name() + "...");
        app.t_set_host(host)
            .onready(function() {
                ui.MessagePanel.info("Release URL updated");
                $('#app-hosts-list').acre(fb.acre.apps.appeditor + "/menus", "app_hosts_list");
            })
            .onerror(function(code, message, info) {
                ui.MessagePanel.error(message ? message : 'Error updating release URL for: ' + app.get_display_name());
            });        
    };
    
    ui.do_app_set_release       = function(version) {
        var app = ui.get_app();
        
        ui.MessagePanel.doing("Updating release of " +  app.get_display_name() + "...");
        app.t_set_release(version)
            .onready(function() {
                ui.MessagePanel.info("Release updated to " + version);
                $('#app-versions-add').acre(fb.acre.apps.appeditor + "/menus", "app_versions_list");
                $('#app-hosts-list').acre(fb.acre.apps.appeditor + "/menus", "app_hosts_list");
            })
            .onerror(function(code, message, info) {
                ui.MessagePanel.error(message ? message : 'Error releasing: ' + app.get_display_name());
            });
    };
    
    ui.do_app_add_version       = function(key, timestamp, service_url) {
        var app = ui.get_app();
        
        ui.MessagePanel.doing("Creating version " + key);
        app.t_add_version(key, timestamp, service_url)
            .onready(function() {
                ui.MessagePanel.info("Created version " + key);
                $('#app-versions-add').acre(fb.acre.apps.appeditor + "/menus", "app_versions_list");
            })
            .onerror(function(code,msg,full,task) {
                ui.MessagePanel.error('Failed to add version. '+msg);
            });
    };
    
    ui.do_app_remove_version    = function(key) {
        var app = ui.get_app();
        
        ui.MessagePanel.doing("Removing version " + key);
        app.t_remove_version(key)
            .onready(function(r) {
                ui.MessagePanel.info("Removed version " + key);
                $('#app-versions-add').acre(fb.acre.apps.appeditor + "/menus", "app_versions_list", [r]);
            });
    };
    
    ui.do_app_set_listing       = function(new_name, new_description, listed) {
        var app = ui.get_app();

        ui.MessagePanel.doing("Updating app name...");
        app.t_set_listing(new_name, new_description, listed)
            .onready(function() {
                if (new_name) {
                    // Replace old entry in the Recent Apps menu
                    ui.add_recent('apps', { path: app.get_path(), name: app.get_display_name() }, app.get_path());
                }
                ui.MessagePanel.info("Updated app name");
                ui.refresh_app_templates();
            })
            .onerror(function(code, message, info) {
                ui.MessagePanel.error(message ? message : 'Error changing app name');
            });
    };
        
    ui.do_app_add_author        = function(username) {
        var app = ui.get_app();

        app.t_add_author(username)
            .onready(function() {
                var authors = ui.get_app().get_authors();
                $('#app-authors-list').acre(fb.acre.apps.appeditor + "/menus", "app_authors_list", [authors]);
            });
    };
    
    ui.do_app_remove_author     = function(username) {
        var app = ui.get_app();

        app.t_remove_author(username)
            .onready(function() {
                var authors = ui.get_app().get_authors();
                $('#app-authors-list').acre(fb.acre.apps.appeditor + "/menus", "app_authors_list", [authors]);
            });
    };
    
    ui.do_app_set_oauth         = function (state) {
        var app = ui.get_app();
        
        ui.MessagePanel.doing('Setting OAuth state...');
        app.t_set_oauth(state)
            .onready(function(r) {
                ui.MessagePanel.info('OAuth ' + (state ? "enabled" : "disabled"));
            })
            .onerror(function(code,msg,full,task) {
                ui.MessagePanel.error('Failed to update OAuth state: ' + msg);
            });
    };
    
    ui.do_app_set_writeuser     = function (state) {
        var app = ui.get_app();
        
        ui.MessagePanel.doing('Setting write user...');
        app.t_set_writeuser(state)
            .onready(function(r) {
                ui.MessagePanel.info('Write user ' + (state ? "enabled" : "disabled"));
            })
            .onerror(function(code,msg,full,task) {
                ui.MessagePanel.error('Failed to update writeuser state: ' + msg);
            });
    };
    
    ui.do_app_add_apikey        = function(name, key, secret) {
        var app = ui.get_app();
        
        ui.MessagePanel.doing("Adding API key for " + name + "...");
        app.t_add_apikey(name, key, secret)
            .onready(function(r) {
                ui.MessagePanel.info(name + " API key added.");
                $('#app-apikeys-add').acre(fb.acre.apps.appeditor + "/menus", "app_apikeys_list", [r.keys]);
            })
            .onerror(function(code,msg,full,task) {
                ui.MessagePanel.error('Failed to add API key: ' + msg);
            });
    };
    
    ui.do_app_remove_apikey     = function(name) {
        var app = ui.get_app();
        
        ui.MessagePanel.doing("Deleting API key for " + name + "...");
        app.t_remove_apikey(name)
            .onready(function(r) {
                ui.MessagePanel.info(name + " API key deleted.");
                $('#app-apikeys-add').acre(fb.acre.apps.appeditor + "/menus", "app_apikeys_list", [r.keys]);
            })
            .onerror(function(code,msg,full,task) {
                ui.MessagePanel.error('Failed to delete API key: ' + msg);
            });
    };
    
    ui.do_app_save_all          = function(callback) {
        var app = ui.get_app();
        
        if (!app.is_dirty() && (typeof callback === "function")) { 
            callback();
            return;
        }
        
        ui.MessagePanel.doing("Saving all files...");
        app.t_save_all()
            .onready(function() {
                ui.MessagePanel.info("All files saved.");
                ui.refresh_file_templates();
                if (typeof callback === "function") {
                    setTimeout(callback, 500);                    
                }
            })
            .onerror(function(code,msg,full,task) {
                ui.MessagePanel.error('Failed to save all files: ' + msg);
            });
    };
    
    ui.do_app_delete            = function() {
        var app = ui.get_app();

        ui.MessagePanel.doing('Deleting: ' + app.get_display_name() + '...');
        app.t_delete()
            .onready(function(user_apps) {
                ui.get_store().set_user_apps(user_apps);
                ui.MessagePanel.info('Deleted app');
                _current_app = null;
                
                // remove app from recents list
                ui.add_recent('apps', null, app.get_path());
                
                ui.do_choose_app();
            })
            .onerror(function(code, message, info) {
                ui.MessagePanel.error(message ? message : 'Error deleting: ' + app.get_display_name());
            });
    };
        
    ui.do_app_apply_changes     = function(changes, files, save_all) {
        for (var i=0; i < files.length; i++) {
            var filename = files[i];
            var change = changes.files[filename];
            ui.do_file_apply_change(change);
        }
        ui.refresh_file_templates();
        if (save_all) { ui.do_app_save_all(); }
    };


    // AcreDoc actions
    ui.do_file_create_new       = function(name, metadata, state) {
        if (ui.get_app().get_file(name)) { 
            ui.MessagePanel.error('File with that name already exists');
            return;
        }
        
        var file = new AcreDoc(ui.get_app(), name, metadata, state);
        
        ui.do_choose_file(file.get_name());
    };

    ui.do_file_set_acre_handler = function(acre_handler) {
        var file = ui.get_file();
        if (acre_handler === file.get_acre_handler()) { return; }
        file.set_acre_handler(acre_handler);
        ui.do_refresh_file();
    };
    
    ui.do_file_set_mime_type    = function(mime_type) {
        var file = ui.get_file();
        if (mime_type === file.get_mime_type()) { return; }
        file.set_mime_type(mime_type);
        ui.do_refresh_file();
    };
    
    ui.do_file_save             = function(force) {
        var file = ui.get_file();
        
        if (!file.is_dirty()) { return; }

        ui.MessagePanel.doing('Saving file: ' + file.get_name() + '...');
        file.t_save(force).enqueue()
            .onready(function(r) {
                ui.refresh_file_templates();
                ui.MessagePanel.info('File saved: '+ file.get_name());
            })
            .onerror(function(code, message, info) {
                if (code === "/api/status/error/upload/content_mismatch") {
                    ui.MessagePanel.clear();
                    ui.do_show_dialog("diff_patch", ["save_conflict", info.info]);
                } else if (code === "/api/status/error/auth") {
                    ui.MessagePanel.error('You are not currently signed in.  To not lose your changes, sign in in a new tab or window and then try again.');
                } else if (code === "/api/status/error/file_format/unsupported_mime_type") {
                    ui.MessagePanel.error(message);
                } else {
                    ui.MessagePanel.error(message || 'Error saving: '+ file.get_name());                    
                }
                ui.refresh_file_templates();
            });
    };

    ui.do_file_save_as          = function(app_path, new_name) {
        var old_file = ui.get_file();
        
        var new_app = (app_path == old_file.get_app().get_path()) ? old_file.get_app() : new AcreApp(ui.get_store(), app_path);
        var new_file_props = {
            acre_handler   : old_file.get_acre_handler(),
            content_type   : old_file.get_mime_type(),
            based_on       : old_file.get_app().get_path() + '/' + mjt.freebase.mqlkey_quote(old_file.get_name())
        };
        var new_file = new AcreDoc(new_app, new_name, new_file_props, old_file.get_editor_state());
        
        ui.MessagePanel.doing('Saving file as: ' + new_name + '...');
        new_file.t_save().enqueue()
            .onready(function(r) {
                if (new_app == ui.get_app()) {
                    ui.do_choose_file(new_file.get_name());
                } else {
                    new_app.destroy();
                }
                ui.MessagePanel.info('File created: '+ new_name);
            })
            .onerror(function(code, message, info) {
                if (info && info.code == "/api/status/error/auth") {
                    ui.MessagePanel.error('You are not currently signed in.  To not lose your changes, sign in in a new tab or window and then try again.');
                } else {
                    ui.MessagePanel.error(message || 'Error creating: '+ new_name);               
                }
            });
    };

    ui.do_file_revert_to_saved  = function() {
        var file = ui.get_file();
        file.t_revert_to_saved().onready(function() {
            ui.do_refresh_file();
        });
    };
        
    ui.do_file_move             = function(new_name, status_el) {
        var file = ui.get_file();
        var old_name = file.get_name();
        if (new_name == old_name) { return; }
        
        if (ui.get_app().get_file(new_name)) { 
            ui.MessagePanel.error('The name "' + new_name + '" is already taken. Please choose a different name.', status_el);
            return;
        }
        
        try {
            file.set_name(new_name);
        } catch(e) {
            ui.MessagePanel.error(e, status_el);
            return;
        }
        ui.do_choose_file(file.get_name());
    };

    ui.do_file_delete           = function(filename) {
        var file = filename ? ui.get_app().get_file(filename) : ui.get_file();
        
        ui.MessagePanel.doing('Deleting file:' + file.get_name() + '...');
        file.t_delete()
            .onready(function(r){
                ui.MessagePanel.info('File deleted: ' + file.get_name());
                _current_file = null;
                ui.do_choose_file();
            })
            .onerror(function(code, message, info) {
                ui.MessagePanel.error(message ? message : 'Error deleting: ' + file.get_name());
            });
    };

    ui.do_file_apply_change      = function(change, save) {
        var sfile                 = change.file1,
            tfile                 = change.file2,
            file;
        
        if (!sfile) {
            file              = ui.get_app().get_file(tfile.name);
            file.set_dirty("to_delete");
        } else if (!tfile) {
            var metadata          = {
                acre_handler : sfile.acre_handler,
                content_type : sfile.content_type,
                based_on     : sfile.fileid
            };
            file              = new AcreDoc(ui.get_app(), sfile.name, metadata, {text : sfile.text});
            file.hide();
        } else {
            file              = ui.get_app().get_file(tfile.name);
            file.set_name(sfile.name);
            file.set_acre_handler(sfile.acre_handler);
            file.set_mime_type(sfile.content_type);
            if (change.patch) {
                var text          = change.patch.text;
                
                if (file.is_editor_loaded()) {
                    file.set_editor_state({text:text});
                } else {
                    $('#file-area').append(file.get_element());
                    file.t_editor_show("TextareaEditor", { margin : false}, {text:text});
                    file.hide();
                }           
            } else if (sfile.revision && (sfile.revision !== tfile.revision)) {
                file.set_revision(sfile.revision);
            }
        }
        if (tfile && (tfile.name === ui.get_file().get_name())) {
            ui.do_refresh_file();
        }
        if (save) { ui.do_file_save(); }
    };

    

    // Editor actions
    ui.do_file_editor_undo      = function() {
        var file = ui.get_file();
        file.editor_undo();
    };
    
    ui.do_file_editor_redo      = function() {
        var file = ui.get_file();
        file.editor_redo();
    };

    ui.do_file_editor_goto_line = function(linenum) {
        var file = ui.get_file();
        file.editor_goto_line(linenum);
    };

    ui.do_file_editor_indent = function() {
        var file = ui.get_file();
        file.editor_indent();
    };
    
    // strip out html that Crockford doesn't like
    function decrock_html(text) {
        text = text.replace(/<\?xml[^>]+>/g,'');
        text = text.replace(/<style[^>]+>/g,'<style>');
        text = text.replace(/type=['"]text\/(css|javascript)['"]/g,'');
        return text;
    }
    
    // strip out stuff from acre templates that won't go through JSLint
    function decrock_acretag(tag) {
      var newtag = tag.replace(/acre:/g,'');
      return newtag;
    }
    function decrock_acre(text) {
        text = text.replace(/<acre:script>/g,'<script>').replace(/<\/acre:script>/g,'</script>');
        text = text.replace(/<\/?acre:(block|doc)[^>]*>/g,'');
        text = text.replace(/<[^>]+>/g,decrock_acretag); // <h1 acre:if="xx"> --> <h1>
        text = decrock_html(text);
        return text;
    }
    
    // fix CSS for JSLint
    // JSLint assumes every CSS file starts with: @charset "UTF-8";
    function decrock_css(text) {
        if (!(/^\s*@charset\s+"UTF-8";/.test(text))) {
            text = '@charset "UTF-8"; '+text;            
        }
        return text;
    }
    
    // Used by UI to decide if current file is supported by JSLint
    // Used by do_file_check() to get JSLint options for current file
    // (This function may belong somewhere else - ask Jason)
    ui.get_file_check_options = function() {
      // see http://www.jslint.com/lint.html
      var options = {
        bitwise:true, // bitwise operators should not be allowed
        eqeqeq: true, // === should be required
        forin: true, // unfiltered for in  statements should be allowed
        sub:    true, // subscript notation may be used for expressions better expressed in dot notation
        undef:  true, // undefined global variables are errors
        useful: 1     // App Editor extension - is JSLint useful for this file?  1 = yes, 0 = maybe, -1 = no
      };
  
      var acre_predef = ['acre','JSON','XMLHttpRequest','console'];
      // setup file-specific options
      switch (ui.get_file().get_acre_handler()) {
        case 'mqlquery':
          //TODO: special settings for query checking
          break;
        case 'acre_script':
          options.predef = acre_predef;
          options.es5    = true; // allow ES5 JS (like trailing commas)
          break;
        case 'mjt':
          options.es5    = true; // allow ES5 JS (like trailing commas)
          options.useful = 0; // disable the Check button (keyboard shortcut will still work)
          options.predef = acre_predef;
          options.before_check = decrock_acre;
          break;
        case 'passthrough':
          options.browser = true; // standard browser globals should be predefined
          switch (ui.get_file().get_mime_type()) {
            case 'application/json': break;
            case 'text/javascript' : break;
            case 'text/html'       : options.before_check = decrock_html; break;
            case 'text/css'        : options.before_check = decrock_css;  break;
            case 'text/plain'      : options.useful = 0;  break; // disable Check button
            default                : options.useful = -1; break; // completely disable Check button - unknown mime-type
          }
          break;
        default:
          options.useful = -1; // completely disable Check button - uknown acre_handler
          break;
      }
      return options;
    };

    
    function _display_jslint_error(err_div, extra) {
        var msg = err_div.attr('title');
        ui.MessagePanel.clear();
        var text = msg + (extra||'');
        var html = text.replace(/\&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); // HTML enocde TODO: move into MessagePanel
        ui.MessagePanel.error(html);
        var linenum = err_div.text();
        ui.get_file().editor_goto_line(linenum);
    }
    
    ui.do_click_error = function(e) {
        var target = $(e.target);
        if (target.hasClass('jslint-error')) {
            _display_jslint_error(target);
        }
    };
    
    ui.do_file_check = function() {
        ui.do_hide_overlays();
        
        // remove previous warnings:
        var linenumber_container = $('.CodeMirror-line-numbers,.editor-margin-line-numbers', ui.get_file().get_element());
        $('>div.jslint-error',linenumber_container).attr('title','').removeClass('jslint-error');

        ui.MessagePanel.clear();

        var jslint_options = ui.get_file_check_options();
        assert.critical(jslint_options, 'missing jslint_options');
        var source_code = ui.get_file().get_editor_state().text;
        if (jslint_options.before_check) {
            source_code = jslint_options.before_check(source_code);
        }
        
        fb.get_script(fb.acre.libs["fulljslint"], function(){
	        var ok = JSLINT(source_code, jslint_options);
	        if (ok) {
	            ui.MessagePanel.info('No syntax errors found');
	        } else {
	            var errors = JSLINT.errors;
	            var popup_text = 'Found '+errors.length +' errors.  Click any of the red line numbers below to see corresponding error details.';
	            var linenumbers = $('>div', linenumber_container);
	            if (!linenumbers.length) {
	              // no linenumber control available (example: queryeditor)
	              errors = errors.slice(0,3); // first 3 errors 
	              popup_text = $.map(errors,function(e) { if (e) { return 'Line: '+e.line+' '+e.reason; } });
	            } else {
	              for (var i=0;i<errors.length;i++) {
	                var e=errors[i];
	                if (e) {
	                  var line = linenumbers.eq(e.line-1);
	                  line.addClass('jslint-error');
	                  line.attr('title', line.attr('title') + ' ' + e.reason);
	                }
	              }
	            }
	            ui.MessagePanel.error(popup_text);
	            // scroll to the first error
	            ui.get_file().editor_goto_line( errors[0].line );
	        }
        });
    };

    ui.do_zen_coding = function() {
      if (ui.get_file().get_editor_name() !== 'CodeMirror') { return; }
      var about  = '<a target="_blank" href="http://code.google.com/p/zen-coding/wiki/ZenHTMLSelectorsEn">ZenCoding</a>',
          cm     = ui.get_file()._current_editor.editor,  // current CodeMirror
          pos    = cm.cursorPosition(),                   // current cursor position
          tab    = cm.options.indentUnit,                 // spaces per tab
          text   = cm.lineContent(pos.line),              // text on line
          r      = /(\s*)(.*)/.exec(text),
          level  = Math.floor(r[1].length/tab),           // number of leading tabs
          zexpr   = r[2],                                 // zencoding expression
          result;

      if (zexpr) {
        result = zen.convert(zexpr,level);
        if (result.error) {
          ui.MessagePanel.error('Zen Coding syntax error in "'+mjt.htmlencode(result.error)+'".<br> See '+about+' for help');
        } else {
          ui.MessagePanel.info('Expanded '+about+' expression');
          cm.setLineContent(pos.line,result.out);
        }
      }
    };
    
    ////////////////////////    
    //                    //
    //    Editor Prefs    //
    //                    //
    ////////////////////////
    
    var DEFAULT_PREFS    = { 
        texteditor     : "CodeMirror",
        syntax          : (navigator.userAgent.indexOf("iPad") === -1) ? true : false,
        margin          : true,
        softwrap        : false,
        dotTrigger      : false,
        flw             : 200,
        t_mjt           : true,
        t_acre_script   : true,
        t_mqlquery      : true,
        t_passthrough   : true,
        t_binary        : true,
        t_test          : true,
        emql            : false
    };

    ui.get_editor_prefs         = function(key) {
        
        function _get_pref(key) {
            var setting = $.localStore(key);
            if (setting === null) { return DEFAULT_PREFS[key]; }
            else if (setting == '1') { return true; }
            else if (setting == '0') { return false; }
            else { return setting; }
        }

        if (key) {
            return _get_pref(key);
        } else {
            var prefs = {};
            for (var k in DEFAULT_PREFS) {
                prefs[k] = _get_pref(k);
            }

            return prefs;            
        }
    };

    ui.set_editor_prefs         = function(arg1, arg2) {
        var prefs;
        
        // takes either a single key, value pair
        // or a dictionary of prefs
        if (arguments.length == 1) {
            prefs = arg1;
        } else if (arguments.length == 2) {
            prefs = {};
            prefs[arg1] = arg2;
        }
        
        for (var key in prefs) {
            var value;
            if (prefs[key] === true) { value = '1'; }
            else if (prefs[key] === false) { value = '0'; }
            else { value = prefs[key]; }
            
            $.localStore(key, value);
        }
    };
    
    
    ui._get_desired_editor_classname = function(file) {
        file = file || this.get_file();
        
        // TODO: make this capabilities-based?
        var acre_handler = file.get_acre_handler();
        if (acre_handler == 'binary') {
            return "ImageEditor";
        } else if (acre_handler == 'mqlquery') {
            return "QueryEditor";
        } else {
            var pref = ui.get_editor_prefs("texteditor");
            return EDITORS[pref] ? pref : DEFAULT_PREFS.texteditor;
        }
    };




    //////////////////////////////////
    //                              //
    //     Editor Event Handlers    //
    //                              //
    //////////////////////////////////
    
    ui._register_editor_event_handlers = function(file) {
        file.register_editor_event_handlers({
            change          : ui.editor_change_handler,
            linechange      : ui.editor_linechange_handler,
            newframe        : ui.editor_newframe_handler
        });
    };
    
    ui.editor_change_handler        = function(undos, redos) {
        // this check is here because it seems like the best and
        // simplest approximation of being "active" in appeditor
        if (+ new Date() - _last_status_check > 60000) {
            _last_status_check = + new Date();
            ui.do_status_check();
        }
        
        if ((_current_file_is_dirty != ui.get_file().is_dirty()) || (undos === 0)) {        
            ui.refresh_file_templates();
        }
        
        if (undos > 0) {
            if (!ui._has_undos) { $('#button-undo').removeAttr('disabled'); }
            ui._has_undos = true;
        } else {
            if (ui._has_undos) { $('#button-undo').attr('disabled', 'disabled'); }
            ui._has_undos = false;
        }
        
        if (redos > 0) {
            if (!ui._has_redos) { $('#button-redo').removeAttr('disabled'); }
            ui._has_redos = true;
        } else {
            if (ui._has_redos) { $('#button-redo').attr('disabled', 'disabled'); }
            ui._has_redos = false;
        }
    };
        
    ui.editor_linechange_handler    = function(linenum) {
        _current_line = linenum;
        $('#linenumber').val(linenum);
    };
    
    ui.editor_newframe_handler      = function(frame) {
        var fdoc = frame.contentWindow ? frame.contentWindow.document : frame.contentDocument;
        ui.shortcut.register_keys(fdoc);
    };
    
    ui.warn_user_about_unsaved_files = function() {
        if (ui && ui.get_app() && ui.get_app().is_dirty()) {
            return "You have unsaved files! The changes you made to these files will be lost if you leave this page.";
        } else {
            return undefined;
        }
    };
    
    
    
    ////////////////////
    //                //
    //     Helpers    //
    //                //
    ////////////////////
    
    ui.url_for                  = function(filename) {
        var base_path = fb.acre.request.base_path;
        return base_path + "/" + filename;
    };
    
    ui.get_app_url              = function(host) {
        return 'http://' + host + ui.get_store().get_acre_host();
    };

    ui.get_appeditor_url        = function(obj, filename) {
        var app_path;
        if (typeof obj == 'string') {
            app_path = obj;
        } else if (obj instanceof AcreDoc) {
            app_path = obj.get_app().get_versioned_path();
            filename = obj.get_relative_path();
        } else if (obj instanceof AcreApp) {
            app_path = obj.get_versioned_path();
        }

        var url = window.location.protocol + '//' + window.location.host + window.location.pathname;
        if (app_path) { url += '#!path=' + app_path; }
        if (filename) { url += '/' + filename; }
        return url;
    };
    
    ui.id_to_path               = function(appid) {
        return "//" + appid.split("/").reverse().join(".") + "dev";
    };
    
    ui.get_human_timestamp      = function(timestamp) {
        var t = mjt.freebase.date_from_iso(timestamp);
        return t.toLocaleString();
    };
    
    ui.get_relative_timestamp   = function(timestamp) {
        var c = new Date();
        var t = mjt.freebase.date_from_iso(timestamp);

        var d = c.getTime() - t.getTime();
        var dY = Math.floor(d / (365 * 30 * 24 * 60 * 60 * 1000));
        var dM = Math.floor(d / (30 * 24 * 60 * 60 * 1000));
        var dD = Math.floor(d / (24 * 60 * 60 * 1000));
        var dH = Math.floor(d / (60 * 60 * 1000));
        var dN = Math.floor(d / (60 * 1000));

        if (dY > 0)   { return dY === 1? "1 year ago"   : dY + " years ago"; }
        if (dM > 0)   { return dM === 1? "1 month ago"  : dM + " months ago"; }
        if (dD > 0)   { return dD === 1? "1 day ago"    : dD + " days ago"; }
        if (dH > 0)   { return dH === 1? "1 hour ago"   : dH + " hours ago"; }
        if (dN > 0)   { return dN === 1? "1 minute ago" : dN + " minutes ago"; }
        if (dN === 0)  { return "less than a minute ago"; }
        if (dN < 0)   { return "in the future???"; }
    };

    ui.order_section_files      = function(app) {
        var ordered_filenames = {};
        var files = app.get_files();
        for (var f in files) {
            var file = files[f];
            var name = file.get_name();
            var handler = file.get_acre_handler(); 
            
            var section = ((handler == 'acre_script') && (name.substr(0,5) == "test_")) ? "test" : handler;
            if (typeof ordered_filenames[section] == 'undefined') {
                ordered_filenames[section] = [];
            }
            ordered_filenames[section].push(name);
        }
        for (var s in ordered_filenames) {
            ordered_filenames[s].sort(function(a, b) {
                return a.localeCompare(b);
            });
        }
        return ordered_filenames;
    };
    
    ui.order_lib_files          = function(lib) {
        var filenames = [];
        var files = lib.get_files();
        for (var f in files) {
            filenames.push(files[f].get_name());
        }
        filenames.sort(function(a, b) {
           return a.localeCompare(b); 
        });
        return filenames;
    };
    
    ui.watch_inputs             = function(button_name, options) {
        
        function _compare_inputs() {
            var any_result = false;
            var all_result = options.inputs.length;
            var result = {};

            jQuery.each(options.inputs, function(input, test){
                var new_value;
                var el = $('#' +input)[0];
                if (typeof el == 'undefined') { el = $("input[name='" + input + "']")[0]; }
                if (typeof el == 'undefined') { return; }
                
                if (el.tagName == 'TEXTAREA') { 
                    new_value = jQuery.trim($('#'+input).val()); 
                } else if (el.tagName == 'INPUT') {
                    var type = $(el).attr('type');
                    if (type == 'text') { new_value = jQuery.trim($('#'+input).val()); }
                    else if (type == 'radio') { new_value = $("input[name='" + input + "']:checked").val(); }
                    else if (type == 'checkbox') { new_value = $('#'+input).attr('checked'); }
                } else if (el.tagName == 'SELECT') {
                    new_value = $('#'+input + ' :selected').val();
                }
                 
                if (new_value != options.inputs[input]) {
                    any_result = true;
                    all_result -= 1;
                    result[input] = new_value;
                }
            });
            
            var ret;
            if (options.activate_on == "all") {
                ret = (all_result === 0) ? result : false;
            } else {
                ret = any_result ? result : false;
            }
            
            return ret;
        }
        
        function _update_inputs() {
            var res = _compare_inputs();
            
            if (res && options.change) { 
                var change_res = options.change.apply(this, [res]);
                if (typeof change_res !== 'undefined') res = change_res;
            }
            
            if (res) {
                $('#button-' + button_name).removeAttr('disabled').addClass('button-primary');
            } else {
              $('#button-' + button_name).attr('disabled', 'disabled').removeClass('button-primary');
            }
        }
        
        function _watch_input(input) {
            $('#'+input).bind('change', function(e) {
                _update_inputs();
            });
        }
        
        function _watch_text_input(input) {
            var timer;
            $('#'+input).bind('keyup', function(e){
                clearTimeout(timer);
                timer = setTimeout(_update_inputs, options.text_delay || 300);
            });
        }
        
        function _watch_radio_input(input) {
            $("input[name='" + input + "']").bind('click', function(){
                _update_inputs();
            });
        }

        jQuery.each(options.inputs, function(input, test){
            var el = $('#' +input)[0];
            if (typeof el == 'undefined') { el = $("input[name='" + input + "']")[0]; }
            if (typeof el == 'undefined') { return; }
            
            if (el.tagName == 'TEXTAREA') { 
                _watch_text_input(input, test); 
            } else if (el.tagName == 'INPUT') {
                var type = $(el).attr('type');
                if (type == 'text') { _watch_text_input(input); }
                else if (type == 'radio' ) { _watch_radio_input(input); }
                else {  _watch_input(input); }
            } else if (el.tagName == 'SELECT') {
                _watch_input(input);
            }
        });
        
        $('#button-' + button_name).unbind('click').click(function(){
            var final_changes = _compare_inputs();
            options.submit.apply(this, [final_changes]);
            
            if (options.update_on_submit) {
                jQuery.extend(options.inputs, final_changes);
                _update_inputs();                
            }
        });
    };
    
    ui.populate_diff            = function(el, data, method) {
        var header  = $('<div class="diff-header-container"></div>'),
            f1_head = $('<div class="diff-header"></div>'),
            f1_line = $('<div class="diff-line-container"></div>'),
            f1_code = $('<div class="diff-code-container"></div>'),
            f2_head = $('<div class="diff-header"></div>'),
            f2_line = $('<div class="diff-line-container"></div>'),
            f2_code = $('<div class="diff-code-container"></div>'),
            lines = {
                left : 1,
                right : 1
            };
            
        function resize() {
            var code_height = el.parent().height() - header.height();
            f1_line.height(code_height);
            f1_code.height(code_height);
            f2_line.height(code_height);
            f2_code.height(code_height);
        }
        
        function scroll() {
            var pos;
            if (data.file1 || (typeof data.file1 === 'undefined')) {
                pos = f1_code.scrollTop();
                f1_line.scrollTop(pos);
            } else {
                pos = f2_code.scrollTop();
            }
            
            if (data.file2 || (typeof data.file2 === 'undefined')) {
                f2_line.scrollTop(pos);
                f2_code.scrollTop(pos);                
            }
        }
        
        function create_line(line_container, code_container, line, side) {

            var classname;            
            if (line.length > 1) { 
                classname =  "replace"; 
            } else if ((line[0][0] == -1) && (side === "left")) {
                classname = "delete";
            } else if ((line[0][0] == 1) && (side === "right")) {
                classname = "insert";
            } else {
                classname = "eq";
            }
            
            var ln = $('<div class="line"></div>');
            var dir = (side === "left") ? 1 : -1;

            if (!(line.length == 1 && line[0][0] == dir)) {
                ln.append($('<pre></pre>').text(lines[side]));
                if (!(line.length === 1 && (line[0][0] === dir))) { lines[side]+=1; }
            } else {
                ln.append('<pre> </pre>');
            }
            line_container.append(ln);
            
            var code_wrapper = $('<div class="code"></div>').addClass(classname);
            var cd = $('<pre></pre>');
            var ins = false;
            for (var j=0; j < line.length; j++) {
                var change = line[j];
                var text = change[1] === "" ? " " : change[1];
                switch (change[0]) {
                    case 0 :
                        ins = true;
                        var eq = $('<span class="text-eq"></span>').text(text);
                        cd.append(eq);
                        break;
                    case 1 :
                        if (side === "right") {
                            ins = true;
                            var add = $('<span class="text-add"></span>').text(text);
                            cd.append(add);                            
                        }
                        break;
                    case -1 :
                        if (side === "left") {
                            ins = true;
                            var del = $('<span class="text-delete"></span>').text(text);
                            cd.append(del);
                        }
                        break;
                }
            }
            if (!ins) { cd.text(" "); }
            
            code_wrapper.append(cd);
            code_container.append(code_wrapper);
        }
        
        function has_change(line, side) {
          for (var i=0; i < line.length; i++) {
            if (line[i][0] == side) {
              return true;
            }
          }
          return false;
        }
        
        function md_change(file1,file2) {
          if (file1 && file2) {
            return (file1.acre_handler !== file2.acre_handler) || (file1.content_type !== file2.content_type);
          } else { return false; }
        }
        
        function name_change(file1,file2) {
          if (file1 && file2) {
            return (file1.name !== file2.name);
          } else { return false; }
        }
        
        function appid(file) {
          var file_segs = file.fileid.split('/');
          file_segs.pop();
          return file_segs.join("/");
        }
        
        if (data.labels && data.labels.length) {
            if (data.labels[0]) {
                var label1 = $('<h3></h3>');
                label1.text(data.labels[0]);
                f2_head.append(label1);
                header.append(f2_head);
            }
            if (data.labels[1]) {
                var label2 = $('<h3></h3>');
                label2.text(data.labels[1]);
                f1_head.append(label2);
                header.append(f1_head);
            }
        } else {
            if (data.file2) {
                var f2_name = $('<h3></h3>');
                if (!data.file1) { 
                    f2_head.addClass("full");
                    f2_code.addClass("full");
                    f2_name.append("Delete: "); 
                }

                if (name_change(data.file1, data.file2)) { f2_name.addClass("change"); }
                f2_name.append(data.file2.name);
                if (appid(data.file2) !== ui.get_app().get_path()) { f2_name.append("in " + appid(data.file2)); }

                var f2_md = $('<h3></h3>');
                if (md_change(data.file1, data.file2)) { f2_md.addClass("change"); }
                f2_md.append(ui.get_store().get_acre_handlers()[data.file2.acre_handler].name);
                if (data.file2.content_type) { f2_md.append(" (" + data.file2.content_type + ")"); }
                f2_head.append(f2_name).append(f2_md);

                if (method === 'get_file_diff') {
                    var f2_lm = $('<h3></h3>');
                    if (data.file2.last_modified) { f2_lm.append("Last Mod: " + ui.get_human_timestamp(data.file2.last_modified)); }
                    f2_head.append(f2_lm);
                }
                header.append(f2_head);
            }

            if (data.file1) {
                var f1_name = $('<h3></h3>');
                if (!data.file2) { 
                    f1_head.addClass("full");
                    f1_code.addClass("full");
                    f1_name.append("Create: "); 
                }
                else if (method == "get_file_merge") { f1_name.append("After Merge: "); }
                f1_name.append(data.file1.name);
                if (method == "get_file_diff" && appid(data.file1) !== ui.get_app().get_path()) { f1_name.append("in " + appid(data.file1)); }

                var f1_md = $('<h3></h3>');
                f1_md.append(ui.get_store().get_acre_handlers()[data.file1.acre_handler].name);
                if (data.file1.content_type) { f1_md.append(" (" + data.file1.content_type + ")"); }
                f1_head.append(f1_name).append(f1_md);

                if (method === 'get_file_diff') {
                    var f1_lm = $('<h3></h3>');
                    if (data.file1.last_modified) { f1_lm.append("Last Mod: " + ui.get_human_timestamp(data.file1.last_modified)); }
                    f1_head.append(f1_lm);
                }
                header.append(f1_head);
            }
        }
        el.append(header);
        
        
        if (data.message) {
            el.append($('<div class="message"></div>').text(data.message));
        } else if (data.file1 && data.file2 && data.file1.revision === data.file2.revision) {
            el.append('<div class="message">No change in content</div>');
        } else if ((data.file2 && data.file2.binary) || (data.file1 && data.file1.binary)) {
            if(data.file2 && data.file2.binary) {
                f2_line.append('<pre> </pre>'); 
                f2_code.append('<div class="image"><div class="image-preview"><img src="' + data.file2.binary + '" /></div></div>');
                el.append(f2_line).append(f2_code);
            }
            if(data.file1 && data.file1.binary) {
                f1_line.append('<pre> </pre>'); 
                f1_code.append('<div class="image"><div class="image-preview"><img src="' + data.file1.binary + '" /></div></div>');
                el.append(f1_line).append(f1_code);
            }
        } else if (data.diff) {
            for (var i=0; i < data.diff.length; i++) {
                var line = data.diff[i];
                
                if (data.file2 || (typeof data.file2 === 'undefined')) {
                    create_line(f2_line, f2_code, line, "left");
                }
                
                if (data.file1 || (typeof data.file1 === 'undefined')) {
                    create_line(f1_line, f1_code, line, "right");
                }
            }
            
            if (data.file2 || (typeof data.file2 === 'undefined')) { 
                f2_line.append('<div class="line"><pre> </pre></div>'); 
                el.append(f2_line).append(f2_code);
                f2_code.scroll(scroll);
            }
            if (data.file1 || (typeof data.file1 === 'undefined')) { 
                f1_line.append('<div class="line"><pre> </pre></div>');
                el.append(f1_line).append(f1_code);
                f1_code.scroll(scroll);
            }
            
            if ((data.file1 || (typeof data.file1 === 'undefined')) && (data.file2 || (typeof data.file2 === 'undefined'))) {
                f2_code.css("overflow-y", "hidden");
            }
        }
        
        resize();
        $(window).resize(resize);
    };
    
    
    
    ///////////////////////
    //                   //
    //   Message Panel   //
    //                   //
    ///////////////////////

    /**
     *   depends on CSS classes: message-info message-error
     */
    ui.MessagePanel = (function(){
        var SECONDS = 1000;

        var timer;
        var hide_func;
        var last_level;
        
        function _show(log_type,str,duration) {
            var el = '#message-panel';
            if (last_level && last_level === 'error') {
                // If we already displaying an error then don't display any more messages
                // (The previous error should have terminated all tasks, so we shouldn't get here)
                mjt.error('MessagePanel: Already displaying error. Ignoring: '+log_type+': '+str);
            } else {
                // TODO - figure out how to get the tid
                var tid = null;
                $(el).hide().acre(fb.acre.apps.appeditor + "/templates", "message_panel", [log_type, str, tid]);
                last_level = log_type;
                window.clearTimeout(timer);
                hide_func = function(){
                    $(el).empty();
                    hide_func = null;
                    last_level = null;
                };
                
                /*
                if (log_type !== 'error') {
                    timer = window.setTimeout(hide_func, duration);                    
                }
                */
                timer = window.setTimeout(hide_func, duration);

                $(el).slideDown(300);             
            }
        }

        function _clear() {
            window.clearTimeout(timer);
            if (hide_func) { hide_func(); }
        }
        // return '' so we can be called inside a mjt.def
        // doing() is for tasks that take time - the message MUST be cancelled with info() or error()
        return {
            doing : function(str, tid) {  _show('doing',str, 2000 * SECONDS, tid); return ''; },
            info  : function(str, tid) {  _show('info', str,    4 * SECONDS, tid); return ''; },
            error : function(str, tid) {  _show('error',str,    6 * SECONDS, tid); return ''; },
            clear : _clear
        };
    })();



    //////////////////
    //              //
    //   Shortcuts  //
    //              //
    //////////////////
    
    /* Exposes only two public functions. Depends only on DOM .shortcut-* and global user object */

    ui.shortcut = {};
    
    (function() {

        var shortcut_config = [
            {op:'Code Assist' },
            {op:'Open App',           key:'O',        action: function() { ui.do_show_menu('apps', [true]); } },
            {op:'Save File',          key:'S',        action: function() { ui.do_file_save(); } },
            {op:'View',               key:'Shift-P',  action: function() { ui.do_run_view(null, false); } },            
            {op:'View with Console',  key:'P',        action: function() { ui.do_run_view(null, true); } },
            {op:'Undo',               key:'Z',        action: function() { ui.do_file_editor_undo(); } },
            {op:'Redo',               key:'Shift-Z',  action: function() { ui.do_file_editor_redo(); } },
            {op:'Redo',               key:'Y',        action: function() { ui.do_file_editor_redo(); } },
            {op:'Check Syntax',       key:'Shift-C',  action: function() { ui.do_file_check();         } },
            {op:'Expand Expression',  key:'E',        action: function() { ui.do_zen_coding();         } },
            {op:'Indent Selection',   key:'Shift-I',  action: function() { ui.do_file_editor_indent(); } },
            {op:'Jump to Line',       key:'J',        action: function() { $('#linenumber').focus().select(); } }
        ];

        var _isMac = (navigator.platform.indexOf('Mac') === 0); // Cmd/Meta key for Macs
        var modifier = _isMac ? 'Meta' : 'Ctrl';             // Ctrl for windows, linux and unknown

        // This should only be called once per target (window/iframe)
        ui.shortcut.register_keys = function(target) {
            $.each(shortcut_config, function(i,config) {
                var keys = modifier + '-' + config.key;
                var func = config.action;
                shortcut.add(keys, func, {target:target});
            });
        };
        
        ui.shortcut.get_shortcuts   = function() {
            return shortcut_config;
        };
        
        ui.shortcut.get_keys = function(op) {
            var key;
            
            if (op == 'Code Assist') {
                key = (navigator.platform.indexOf('Mac')===0 ? 'Alt-' : 'Ctrl-') + 'Space';
            } else {
                $.each(shortcut_config, function(i, config) {
                     if (config.op == op)  {
                         key = (navigator.platform.indexOf('Mac')===0 ? '&#8984;-' : 'Ctrl-') + config.key;
                     }
                });
            }
            
            return key;
        };
    })();
    
})();


$(document).ready(function(){
    if($.browser.msie && $.browser.version < "8.0") {
        assert.critical(false, "Internet Explorer 6 and 7 are not supported.  IE8+, Firefox 3+ and Safari 3+ are." + 
        "Another option is to install <a href='http://www.google.com/chromeframe'>Google Chrome Frame</a>");
        return;
    }

    ui.set_store(new FreebaseStore());
    var store = ui.get_store();
    store.t_init()
        .onready(function() {
            ui.set_user(store.get_user());
            ui.init();
            
            // warn if third-party cookies are disabled
            store.TestCookies(store)
                .enqueue()
                .onerror(function(code, message, info) {
                    ui.MessagePanel.error("Your browser configuration may not always let you see your latest " + 
                    "changes when clicking <b>View</b> (third-party cookies).<br/><br/>" +
                    "Hold down the <b>Shift</b> key when clicking the browser <b>Refresh</b> button to ensure " +
                    "you're seeing the latest.");                    
                });
        })
        .onerror(function(code, message, info) {
            assert.critical(false, "Error connecting to Freebase<br/>" + message);
            mjt.error(code, message, info);
        });
});

/** templates **/
if (jQuery) {
jQuery(window).trigger('acre.template.register', {pkgid: '//5b.appeditor.site.tags.svn.freebase-site.googlecode.dev/templates', source: {def: (function () {// mjt.def=rawmain()
var rawmain = function () {
var __pkg = this.tpackage;
var exports = this.exports;
var __ts=__pkg._template_fragments;
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[0];                               // 
                                                  // 
                                                  // <!-- called by ui.init -->
// mjt.def=body()
var body = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[1];                               // 
                                                  //   <div id="message-panel"></div>
                                                  //   <div id="about-bar"></div>
                                                  //   <div id="columns">
                                                  //     <div class="refresh column" id="list-column"></div>
                                                  //     <div class="refresh column" id="file-margin"></div>
                                                  //     <div class="column row" id="file-column">
                                                  //       <div class="refresh" id="button-bar"></div>
                                                  //       <div class="refresh" id="file-area"></div>
                                                  //     </div>
                                                  //   </div>
__pkg.runtime.ondomready(function () {

    var flw = parseInt(ui.get_editor_prefs('flw'));
    
    $(window).resize(function(){
      $('#list-column').width(flw);
      $('#file-margin').css('left', flw);
      $('#file-column').css('left', flw + $('#file-margin').width());
      
      var fixer = $('#fixer');
      var fixerOffset = fixer.offset();
      var filecolumn_offset = $('#file-column').offset();
      var filecolumn_height = 
          Math.max(fixerOffset.top + fixer[0].offsetHeight, $(window).height()) - 
          Math.max(filecolumn_offset.top, $('#header').height()+1);
      var filecolumn_width  = 
          Math.max(fixerOffset.left + fixer[0].offsetWidth, $(window).width()) - 
          filecolumn_offset.left;
      var filearea_offset = $('#file-area').offset();
      var filearea_height = 
          Math.max(fixerOffset.top + fixer[0].offsetHeight, $(window).height()) - 
          filearea_offset.top;
          
      $('.row').width( filecolumn_width );
      $('.column').height( filecolumn_height - 1 );
      $('#file-area').height( filearea_height - 1 );
      $('#file-list').height( filearea_height - $('#app-search').height() - $('#app-edits').height() );
      $('.refresh-right').show();
      if (ui.dialog) {
        ui.dialog.css('left', ($(window).width() - ui.dialog.outerWidth())/2);
      }
    });
    
    $('#file-margin').draggable({ 
      axis: 'x',
      iframeFix: true,
      containment: [125,,400],
      drag : function(event, jqui) {
        flw = $('#file-margin').offset().left;
        $(window).trigger('resize');            
      },
      stop : function(event, jqui) {
        flw = $('#file-margin').offset().left;
        ui.set_editor_prefs({flw: flw});
        $(window).trigger('resize');            
      }
    });
    
    $('#file-area').click(ui.do_click_error);
  
}, this);
__m[__n++]=__ts[2];                               // 
return __m;
};
body = __pkg.runtime.tfunc_factory("body()", body, __pkg, undefined, false);
exports.body = body;
body.source_microdata = null;
__m[__n++]=__ts[3];                               // 
                                                  // 
                                                  // <!-- called by ui.refresh_app_templates -->    
// mjt.def=header(state)
var header = function (state) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[4];                               // 

  	var store = ui.get_store();
	  var user = ui.get_user();
	  var app = ui.get_app();
  
__m[__n++]=__ts[5];                               // 
if (state == 'open') {
__m[__n++]=__ts[6];                               // 
                                                  //   <p>
                                                  //     <span class="app-name">Acre App Editor</span>
                                                  //   </p>
}
else if (state == 'loading') {
__m[__n++]=__ts[7];                               // 
                                                  //   <p><span class="app-name">Loading...</span></p>
}
else {
var onclick_cb_1 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_1] = function (event) {
ui.do_show_menu('appsettings')}
__m[__n++]=__ts[8];                               // 
                                                  //   <div class="app-name" id="button-appsettings" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_1);
__m[__n++]=__ts[9];                               // .apply(this, [event])">
                                                  //     <p><span class="button-menu">
__m[__n++]=(app.get_display_name());
__m[__n++]=__ts[10];                              // </span></p>
                                                  //   </div>
}
__m[__n++]=__ts[11];                              // 
return __m;
};
header = __pkg.runtime.tfunc_factory("header(state)", header, __pkg, undefined, false);
exports.header = header;
header.source_microdata = null;
__m[__n++]=__ts[12];                              // 
                                                  // 
                                                  // <!-- called by ui.refresh_app_templates -->
// mjt.def=about_bar()
var about_bar = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[13];                              // 

    var app       = ui.get_app();
    var is_author = app.is_author();
    var is_remote = app.is_remote();
    var user      = ui.get_user();
    var versions  = app.get_versions();
    var release   = app.get_released_version();
    var version   = app.get_version_label();

    var path      = app.get_path();
    var vpath     = app.get_versioned_path(); 
    var ppath     = release ? path.replace("//", "//release.") : null;
    var num       = versions.length;
    if (ppath && ppath != vpath) { num -= 1; }
  
__m[__n++]=__ts[14];                              // 
                                                  //   <div class="column left" id="about-bar-left">
if (version) {
__m[__n++]=__ts[15];                              // 
                                                  //       <span>
                                                  //         Version 
__m[__n++]=version;
__m[__n++]=__ts[16];                              // 
                                                  //       </span>
}
else {
__m[__n++]=__ts[17];                              // 
                                                  //       <span>
version = "Current";
__m[__n++]=__ts[18];                              // 
                                                  //         Current 
                                                  //       </span>
}
__m[__n++]=__ts[19];                              // 
                                                  //   </div>
                                                  //   <div class="column margin" id="about-bar-margin"> </div>
                                                  //   <div class="column row" id="about-bar-middle">
if (is_remote) {
__m[__n++]=__ts[20];                              // 
                                                  //     <div>
                                                  //       <h2><em>This app is hosted on 
__m[__n++]=(app.get_acre_host());
__m[__n++]=__ts[21];                              // </em></h2>
                                                  //     </div>
}
else if (is_author) {
__m[__n++]=__ts[22];                              // 
                                                  //     <div>
var onclick_cb_2 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_2] = function (event) {
ui.do_choose_app(ui.get_app().get_path())}
__m[__n++]=__ts[23];                              // 
                                                  //       <button class="button-primary" id="button-trunk" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_2);
__m[__n++]=__ts[24];                              // .apply(this, [event])">
                                                  //         Edit Current</button>
                                                  //       or
var onclick_cb_3 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_3] = function (event) {
ui.do_show_dialog('new_app', [true])}
__m[__n++]=__ts[25];                              // 
                                                  //       <button id="button-clone" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_3);
__m[__n++]=__ts[26];                              // .apply(this, [event])">
                                                  //         Clone this App</button>      
                                                  //     </div>
}
else {
__m[__n++]=__ts[27];                              // 
                                                  //     <div>
var onclick_cb_4 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_4] = function (event) {
ui.do_show_dialog('new_app', [true])}
__m[__n++]=__ts[28];                              // 
                                                  //       <button
var dattrs_1 = (user?{}:{'disabled':'disabled'});
var sattrs_1 = {};
if (!("class" in dattrs_1)) {__m[__n++]=__ts[29];                              //  class="button-primary"
 }
if (!("id" in dattrs_1)) {__m[__n++]=__ts[30];                              //  id="button-clone"
 }
if (!("onclick" in dattrs_1)) {__m[__n++]=__ts[31];                              //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_4);
__m[__n++]=__ts[32];                              // .apply(this, [event])"
 }
for (var di_1 in dattrs_1) {
__m[__n++]=' ' + di_1;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_1[di_1]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[33];                              // >
                                                  //         Clone this App</button> 
if (!user) {
__m[__n++]=__ts[34];                              // 
                                                  //         <span>
                                                  //           <a href="
__m[__n++]=__pkg.runtime.make_attr_safe($('#nav-signin').attr('href'));
__m[__n++]=__ts[35];                              // " title="Sign in to your Freebase account">Sign in</a>
                                                  //         </span>
}
__m[__n++]=__ts[36];                              //  
                                                  //         to make an app based on this one!
                                                  //     </div>
}
__m[__n++]=__ts[37];                              // 
                                                  //     <div class="refresh-right" id="about-bar-right">
if (versions.length) {
__m[__n++]=__ts[38];                              // 
                                                  //       <span><b>
                                                  //         Versions:
if (ppath && ppath != vpath) {
__m[__n++]=__ts[39];                              // 
                                                  //         <a apppath="
__m[__n++]=__pkg.runtime.make_attr_safe(ppath);
__m[__n++]=__ts[40];                              // " class="app-link" href="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_appeditor_url(ppath));
__m[__n++]=__ts[41];                              // ">Release</a>
}
__m[__n++]=__ts[42];                              // 
if (version && version != 'Current') {
__m[__n++]=__ts[43];                              // 
                                                  //         <a apppath="
__m[__n++]=__pkg.runtime.make_attr_safe(path);
__m[__n++]=__ts[44];                              // " class="app-link" href="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_appeditor_url(path));
__m[__n++]=__ts[45];                              // ">Current</a>
}
__m[__n++]=__ts[46];                              // 
if (num > 0) {
var onclick_cb_5 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_5] = function (event) {
return ui.do_show_menu('appsettings',['general'])}
__m[__n++]=__ts[47];                              // 
                                                  //         <a href="#0" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_5);
__m[__n++]=__ts[48];                              // .apply(this, [event])">more...</a>
}
__m[__n++]=__ts[49];                              // 
                                                  //       </b></span>
}
__m[__n++]=__ts[50];                              // 
                                                  //     </div>
                                                  //   </div>
return __m;
};
about_bar = __pkg.runtime.tfunc_factory("about_bar()", about_bar, __pkg, undefined, false);
exports.about_bar = about_bar;
about_bar.source_microdata = null;
__m[__n++]=__ts[51];                              // 
// mjt.def=list_column()
var list_column = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[52];                              // 
if (ui.get_app().is_writable()) {
var onclick_cb_6 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_6] = function (event) {
ui.do_show_dialog('add_file')}
__m[__n++]=__ts[53];                              // 
                                                  //   <button id="button-new-file" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_6);
__m[__n++]=__ts[54];                              // .apply(this, [event])">
                                                  //     New File</button>
}
__m[__n++]=__ts[55];                              // 
                                                  //   <h1>Files</h1>
                                                  //   
                                                  //   <div id="file-list"></div>
                                                  //   <div id="app-edits-shim">
                                                  //     
__m[__n++]=(app_edits());
__m[__n++]=__ts[56];                              // 
                                                  //   </div>
                                                  //   
                                                  //   <div id="app-search">
                                                  //     <form action="http://codesearch.
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_app().get_acre_host());
__m[__n++]=__ts[57];                              // /" id="codesearch-form" target="_blank">
                                                  //       <div class="file-list-section-title">Find code in app:</div>
                                                  //       <input id="codesearch-app" name="app" type="hidden" value="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_app().get_path());
__m[__n++]=__ts[58];                              // ">
                                                  //       <input name="q" type="text" value="">
                                                  //     </form>
                                                  //   </div>
return __m;
};
list_column = __pkg.runtime.tfunc_factory("list_column()", list_column, __pkg, undefined, false);
exports.list_column = list_column;
list_column.source_microdata = null;
__m[__n++]=__ts[59];                              // 
// mjt.def=app_edits()
var app_edits = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[60];                              // 

      var recent = false;
      var change = ui.get_app().get_last_change();
      if (change) {
        var delta = + new Date() - mjt.freebase.date_from_iso(change.timestamp);
        if (delta < 3600000) { recent = true; }
      }
    
__m[__n++]=__ts[61];                              // 
if (recent) {
__m[__n++]=__ts[62];                              // 
                                                  //     <div id="app-edits">
                                                  //       <div class="content">
                                                  //         <span class="file-list-section-title">Active Author: </span>
                                                  //         <span class="change">
                                                  //           
__m[__n++]=change.attribution.name;
__m[__n++]=__ts[63];                              //  edited '
__m[__n++]=(mjt.freebase.mqlkey_unquote(change.file));
__m[__n++]=__ts[64];                              // ' 
__m[__n++]=(ui.get_relative_timestamp(change.timestamp));
__m[__n++]=__ts[65];                              // 
                                                  //         </span>
                                                  //       </div>
                                                  //     </div>
}
__m[__n++]=__ts[66];                              // 
return __m;
};
app_edits = __pkg.runtime.tfunc_factory("app_edits()", app_edits, __pkg, undefined, false);
exports.app_edits = app_edits;
app_edits.source_microdata = null;
__m[__n++]=__ts[67];                              // 
                                                  // 
                                                  // <!-- called by ui.refresh_file_templates -->  
// mjt.def=file_list()
var file_list = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[68];                              // 
// mjt.def=filelist_section(section_key, section_name, app, filenames, link)
var filelist_section = function (section_key, section_name, app, filenames, link) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[69];                              // 
                                                  //     <ul section="
__m[__n++]=__pkg.runtime.make_attr_safe(section_key);
__m[__n++]=__ts[70];                              // ">
if (filenames) {
__m[__n++]=__ts[71];                              // 
                                                  //       <li class="file-list-section-header">
if (ui.get_editor_prefs('t_'+section_key)) {
__m[__n++]=__ts[72];                              // 
                                                  //         <span class="file-list-section-toggle" section="
__m[__n++]=__pkg.runtime.make_attr_safe(section_key);
__m[__n++]=__ts[73];                              // ">▼</span>
}
else {
__m[__n++]=__ts[74];                              // 
                                                  //         <span class="file-list-section-toggle" section="
__m[__n++]=__pkg.runtime.make_attr_safe(section_key);
__m[__n++]=__ts[75];                              // ">►</span>
}
__m[__n++]=__ts[76];                              // 
if (link) {
__m[__n++]=__ts[77];                              // 
                                                  //         <a apppath="
__m[__n++]=__pkg.runtime.make_attr_safe(app.get_path());
__m[__n++]=__ts[78];                              // " class="file-list-section-title app-link" href="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_appeditor_url(app.get_path()));
__m[__n++]=__ts[79];                              // ">
__m[__n++]=section_name;
__m[__n++]=__ts[80];                              // </a>
}
else {
__m[__n++]=__ts[81];                              // 
                                                  //         <span class="file-list-section-title">
__m[__n++]=section_name;
__m[__n++]=__ts[82];                              // </span>
}
__m[__n++]=__ts[83];                              // 
                                                  //       </li>
}
__m[__n++]=__ts[84];                              // 
__pkg.runtime.foreach(this, (filenames), function (filename_index_1, filename) {
var once_1 = 1;
while (once_1) {
if (filenames) {
__m[__n++]=__ts[85];                              // 
                                                  //       <li
var dattrs_2 = ({'class': make_file_classes(app.get_file(filename), section_key), 'fname' : app.get_file(filename).get_relative_path()});
var sattrs_2 = {};
for (var di_2 in dattrs_2) {
__m[__n++]=' ' + di_2;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_2[di_2]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[86];                              // >
var onclick_cb_7 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_7] = function (event) {
ui.do_show_dialog('delete_file', [filename])}
__m[__n++]=__ts[87];                              // 
                                                  //           <div
var dattrs_3 = (app.is_writable() ? {'class':'file-delete'} : {'class':'file-nodelete'});
var sattrs_3 = {};
if (!("class" in dattrs_3)) {__m[__n++]=__ts[88];                              //  class="file-delete"
 }
if (!("onclick" in dattrs_3)) {__m[__n++]=__ts[89];                              //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_7);
__m[__n++]=__ts[90];                              // .apply(this, [event])"
 }
for (var di_3 in dattrs_3) {
__m[__n++]=' ' + di_3;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_3[di_3]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[91];                              // ></div>
                                                  //           <a href="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_appeditor_url(app.get_file(filename)));
__m[__n++]=__ts[92];                              // ">
__m[__n++]=filename;
__m[__n++]=__ts[93];                              // </a>
                                                  //       </li>
}
once_1--;
} /* while once */
return once_1 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[94];                              // 
                                                  //     </ul>
return __m;
};
filelist_section = __pkg.runtime.tfunc_factory("filelist_section(section_key, section_name, app, filenames, link)", filelist_section, __pkg, undefined, false);
filelist_section.source_microdata = null;
__m[__n++]=__ts[95];                              // 

    var app = ui.get_app();
    var ordered_filenames = ui.order_section_files(app);
    
    function make_file_classes(file, section) {
      var classes = 'file-list-item';
      var current_filepath =  ui.get_file() ? ui.get_file().get_relative_path() : null;
      if (file.get_relative_path() == current_filepath) { classes += ' selected-file'; }
      if (file.is_dirty("to_delete"))                   { classes += ' deleted-file'; }
      if (file.is_dirty())                              { classes += ' edited-file'; }
      if (!ui.get_editor_prefs("t_" + section)) { classes += ' hidden-file'; }
      return classes;
    }
  
__m[__n++]=__ts[96];                              // 
__pkg.runtime.foreach(this, (ui.get_store().get_acre_handlers()), function (handler_key, handler) {
var once_2 = 1;
while (once_2) {
__m[__n++]=__ts[97];                              // 
                                                  // 
                                                  //   <div>
                                                  //     
__m[__n++]=(filelist_section( handler_key, handler.plural_name, app, ordered_filenames[handler_key]));
__m[__n++]=__ts[98];                              // 
                                                  //   </div>
once_2--;
} /* while once */
return once_2 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[99];                              // 
if (ordered_filenames['test'] && ordered_filenames['test'].length) {
__m[__n++]=__ts[100];                             // 
                                                  //   <div>
                                                  //     
__m[__n++]=(filelist_section("test", "Tests", app, ordered_filenames["test"]));
__m[__n++]=__ts[101];                             // 
                                                  //   </div>
}
__m[__n++]=__ts[102];                             // 
__pkg.runtime.ondomready(function () {
            
    $('.file-list-section-toggle').click(function(e){
      var section = $(this).attr("section");
      if ($(this).text() == "▼") {
        $(this).text("►");
        ui.set_editor_prefs("t_"+section, false);
        $("ul[section='"+section+"'] .file-list-item").addClass('hidden-file');
      } else {
        $(this).text("▼");
        ui.set_editor_prefs("t_"+section, true);
        $("ul[section='"+section+"'] .file-list-item").removeClass('hidden-file');
      }
    });
    
    $('#file-list .file-list-item').click(function(e){
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        /* default browser behaviour = open link in new tab */
      } else {
        var new_name = $(this).attr("fname");
        ui.do_choose_file(new_name);
        return false;
      }
    });
  
}, this);
__m[__n++]=__ts[103];                             // 
return __m;
};
file_list = __pkg.runtime.tfunc_factory("file_list()", file_list, __pkg, undefined, false);
exports.file_list = file_list;
file_list.source_microdata = null;
__m[__n++]=__ts[104];                             // 
                                                  // 
                                                  // <!-- called by ui.refresh_file_templates -->  
// mjt.def=button_bar()
var button_bar = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[105];                             // 

    var app = ui.get_app();
    var file = ui.get_file();
    var writable = app ? app.is_writable() : false;
    
    var opts = file ? file.get_editor_supported_features() : false;
    var show_opts = opts.margin || opts.softwrap || opts.hotswap || opts.emql;
    
    var fileactions_open = $('#button-fileactions').hasClass('button-open');
    var editoroptions_open = $('#button-editoroptions').hasClass('button-open');
  
__m[__n++]=__ts[106];                             // 
                                                  //     <div id="file-buttons">
if (file) {
__m[__n++]=__ts[107];                             // 
                                                  //       <div>
                                                  //       <div class="refresh-right" id="file-buttons-right">
var onclick_cb_8 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_8] = function (event) {
ui.do_run_view(null, false);}
__m[__n++]=__ts[108];                             // 
                                                  //         <button
var dattrs_4 = (file.get_editor_supported_features('inline_preview')?{'disabled':'disabled'}:{});
var sattrs_4 = {};
if (!("id" in dattrs_4)) {__m[__n++]=__ts[109];                             //  id="button-view"
 }
if (!("title" in dattrs_4)) {__m[__n++]=__ts[110];                             //  title="
__m[__n++]=__pkg.runtime.make_attr_safe(mjt.bless(ui.shortcut.get_keys('View')));
__m[__n++]=__ts[111];                             // "
 }
if (!("onclick" in dattrs_4)) {__m[__n++]=__ts[112];                             //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_8);
__m[__n++]=__ts[113];                             // .apply(this, [event])"
 }
for (var di_4 in dattrs_4) {
__m[__n++]=' ' + di_4;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_4[di_4]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[114];                             // >
                                                  //           View</button>
var onclick_cb_9 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_9] = function (event) {
ui.do_run_view(null, true);}
__m[__n++]=__ts[115];                             // 
                                                  //         <button
var dattrs_5 = (file.get_editor_supported_features('inline_preview')?{'disabled':'disabled'}:{});
var sattrs_5 = {};
if (!("class" in dattrs_5)) {__m[__n++]=__ts[116];                             //  class="button-primary"
 }
if (!("id" in dattrs_5)) {__m[__n++]=__ts[117];                             //  id="button-preview"
 }
if (!("title" in dattrs_5)) {__m[__n++]=__ts[118];                             //  title="
__m[__n++]=__pkg.runtime.make_attr_safe(mjt.bless(ui.shortcut.get_keys('View with Console')));
__m[__n++]=__ts[119];                             // "
 }
if (!("onclick" in dattrs_5)) {__m[__n++]=__ts[120];                             //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_9);
__m[__n++]=__ts[121];                             // .apply(this, [event])"
 }
for (var di_5 in dattrs_5) {
__m[__n++]=' ' + di_5;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_5[di_5]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[122];                             // >
                                                  //           View with Console</button>
                                                  //       </div>
                                                  //       <span class="buttonset">
var onclick_cb_10 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_10] = function (event) {
ui.do_file_save()}
__m[__n++]=__ts[123];                             // 
                                                  //         <button
var dattrs_6 = (file.is_dirty()?{}:{'disabled':'disabled'});
var sattrs_6 = {};
if (!("class" in dattrs_6)) {__m[__n++]=__ts[124];                             //  class="button-left button-primary"
 }
if (!("id" in dattrs_6)) {__m[__n++]=__ts[125];                             //  id="button-save"
 }
if (!("title" in dattrs_6)) {__m[__n++]=__ts[126];                             //  title="
__m[__n++]=__pkg.runtime.make_attr_safe(mjt.bless(ui.shortcut.get_keys('Save File')));
__m[__n++]=__ts[127];                             // "
 }
if (!("onclick" in dattrs_6)) {__m[__n++]=__ts[128];                             //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_10);
__m[__n++]=__ts[129];                             // .apply(this, [event])"
 }
for (var di_6 in dattrs_6) {
__m[__n++]=' ' + di_6;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_6[di_6]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[130];                             // >
                                                  //           Save
                                                  //         </button>
var onclick_cb_11 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_11] = function (event) {
 ui.do_app_save_all()}
__m[__n++]=__ts[131];                             // <button
var dattrs_7 = (app.is_dirty()?{}:{'disabled':'disabled'});
var sattrs_7 = {};
if (!("class" in dattrs_7)) {__m[__n++]=__ts[132];                             //  class="button-middle"
 }
if (!("id" in dattrs_7)) {__m[__n++]=__ts[133];                             //  id="button-saveall"
 }
if (!("onclick" in dattrs_7)) {__m[__n++]=__ts[134];                             //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_11);
__m[__n++]=__ts[135];                             // .apply(this, [event])"
 }
for (var di_7 in dattrs_7) {
__m[__n++]=' ' + di_7;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_7[di_7]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[136];                             // >
                                                  //           Save All
                                                  //         </button>
var onclick_cb_12 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_12] = function (event) {
ui.do_show_dialog('save_file_as')}
__m[__n++]=__ts[137];                             // <button
var dattrs_8 = (!ui.get_user()||file.get_acre_handler()=='binary'?{'disabled':'disabled'}:{});
var sattrs_8 = {};
if (!("class" in dattrs_8)) {__m[__n++]=__ts[138];                             //  class="button-right"
 }
if (!("id" in dattrs_8)) {__m[__n++]=__ts[139];                             //  id="button-save"
 }
if (!("onclick" in dattrs_8)) {__m[__n++]=__ts[140];                             //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_12);
__m[__n++]=__ts[141];                             // .apply(this, [event])"
 }
for (var di_8 in dattrs_8) {
__m[__n++]=' ' + di_8;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_8[di_8]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[142];                             // >
                                                  //           Save As</button>
var onclick_cb_13 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_13] = function (event) {
ui.do_file_editor_undo()}
__m[__n++]=__ts[143];                             // 
                                                  //         <button
var dattrs_9 = (ui._has_undos?{}:{'disabled':'disabled'});
var sattrs_9 = {};
if (!("class" in dattrs_9)) {__m[__n++]=__ts[144];                             //  class="button-left"
 }
if (!("id" in dattrs_9)) {__m[__n++]=__ts[145];                             //  id="button-undo"
 }
if (!("title" in dattrs_9)) {__m[__n++]=__ts[146];                             //  title="
__m[__n++]=__pkg.runtime.make_attr_safe(mjt.bless(ui.shortcut.get_keys('Undo')));
__m[__n++]=__ts[147];                             // "
 }
if (!("onclick" in dattrs_9)) {__m[__n++]=__ts[148];                             //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_13);
__m[__n++]=__ts[149];                             // .apply(this, [event])"
 }
for (var di_9 in dattrs_9) {
__m[__n++]=' ' + di_9;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_9[di_9]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[150];                             // >
                                                  //           Undo
                                                  //         </button>
var onclick_cb_14 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_14] = function (event) {
ui.do_file_editor_redo()}
__m[__n++]=__ts[151];                             // <button
var dattrs_10 = (ui._has_redos?{}:{'disabled':'disabled'});
var sattrs_10 = {};
if (!("class" in dattrs_10)) {__m[__n++]=__ts[152];                             //  class="button-right"
 }
if (!("id" in dattrs_10)) {__m[__n++]=__ts[153];                             //  id="button-redo"
 }
if (!("title" in dattrs_10)) {__m[__n++]=__ts[154];                             //  title="
__m[__n++]=__pkg.runtime.make_attr_safe(mjt.bless(ui.shortcut.get_keys('Redo')));
__m[__n++]=__ts[155];                             // "
 }
if (!("onclick" in dattrs_10)) {__m[__n++]=__ts[156];                             //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_14);
__m[__n++]=__ts[157];                             // .apply(this, [event])"
 }
for (var di_10 in dattrs_10) {
__m[__n++]=' ' + di_10;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_10[di_10]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[158];                             // >
                                                  //           Redo</button>
var onclick_cb_15 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_15] = function (event) {
ui.do_file_editor_indent()}
__m[__n++]=__ts[159];                             // 
                                                  //         <button
var dattrs_11 = (file.get_editor_supported_features('indent')&&writable?{}:{'disabled':'disabled'});
var sattrs_11 = {};
if (!("id" in dattrs_11)) {__m[__n++]=__ts[160];                             //  id="button-indent"
 }
if (!("title" in dattrs_11)) {__m[__n++]=__ts[161];                             //  title="
__m[__n++]=__pkg.runtime.make_attr_safe(mjt.bless(ui.shortcut.get_keys('Indent Selection')));
__m[__n++]=__ts[162];                             // "
 }
if (!("onclick" in dattrs_11)) {__m[__n++]=__ts[163];                             //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_15);
__m[__n++]=__ts[164];                             // .apply(this, [event])"
 }
for (var di_11 in dattrs_11) {
__m[__n++]=' ' + di_11;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_11[di_11]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[165];                             // >
                                                  //           Indent
                                                  //         </button>
                                                  //       </span>
                                                  //       <span class="buttonset">
var onclick_cb_16 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_16] = function (event) {
ui.do_show_menu('fileactions');}
__m[__n++]=__ts[166];                             // 
                                                  //        <button
var dattrs_12 = (fileactions_open ? {'class':'button-open'} : {});
var sattrs_12 = {};
if (!("class" in dattrs_12)) {__m[__n++]=__ts[167];                             //  class="button-left"
 }
if (!("id" in dattrs_12)) {__m[__n++]=__ts[168];                             //  id="button-fileactions"
 }
if (!("onclick" in dattrs_12)) {__m[__n++]=__ts[169];                             //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_16);
__m[__n++]=__ts[170];                             // .apply(this, [event])"
 }
for (var di_12 in dattrs_12) {
__m[__n++]=' ' + di_12;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_12[di_12]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[171];                             // >    
                                                  //           <span class="button-menu">File</span></button>
var onclick_cb_17 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_17] = function (event) {
ui.do_show_menu('editoroptions');}
__m[__n++]=__ts[172];                             // <button
var dattrs_13 = (editoroptions_open?{'class':'button-open'}:(show_opts?{}:{'disabled':'disabled'}));
var sattrs_13 = {};
if (!("class" in dattrs_13)) {__m[__n++]=__ts[173];                             //  class="button-middle"
 }
if (!("id" in dattrs_13)) {__m[__n++]=__ts[174];                             //  id="button-editoroptions"
 }
if (!("onclick" in dattrs_13)) {__m[__n++]=__ts[175];                             //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_17);
__m[__n++]=__ts[176];                             // .apply(this, [event])"
 }
for (var di_13 in dattrs_13) {
__m[__n++]=' ' + di_13;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_13[di_13]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[177];                             // >
                                                  //           <span class="button-menu">Editor</span></button>
var onclick_cb_18 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_18] = function (event) {
ui.do_show_menu('help');}
__m[__n++]=__ts[178];                             // <button class="button-right" id="button-help" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_18);
__m[__n++]=__ts[179];                             // .apply(this, [event])">
                                                  //           <span class="button-menu">Help</span></button>
                                                  //       </span>
                                                  //       <span class="buttoncount">
if (file.get_editor_supported_features('linenumbers')) {
__m[__n++]=__ts[180];                             // 
                                                  //         <span class=" buttonset linecount">
                                                  //           Line <input class="form-textbox" id="linenumber" title="
__m[__n++]=__pkg.runtime.make_attr_safe(mjt.bless(ui.shortcut.get_keys('Jump to Line')));
__m[__n++]=__ts[181];                             // " type="text" value="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_line()||'');
__m[__n++]=__ts[182];                             // ">
                                                  //         </span>
}
__m[__n++]=__ts[183];                             // 
                                                  //       </span>
                                                  //     </div>
}
__m[__n++]=__ts[184];                             // 
__pkg.runtime.ondomready(function () {

      $('#linenumber').keypress(function(e){
        if (e.which == 13) {
          var line = parseInt($('#linenumber').val(),10);
          ui.do_file_editor_goto_line(line);
        }
      });
    
}, this);
__m[__n++]=__ts[185];                             // 
                                                  //   </div>
return __m;
};
button_bar = __pkg.runtime.tfunc_factory("button_bar()", button_bar, __pkg, undefined, false);
exports.button_bar = button_bar;
button_bar.source_microdata = null;
__m[__n++]=__ts[186];                             // 
// mjt.def=query_button_bar()
var query_button_bar = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[187];                             // <div id="query-editor-buttons">

    var writable = ui.get_app().is_writable();
  
__m[__n++]=__ts[188];                             // 
var onclick_cb_19 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_19] = function (event) {
ui.get_file()._current_editor.query_run()}
__m[__n++]=__ts[189];                             // 
                                                  //   <button class="button-primary" title="
__m[__n++]=__pkg.runtime.make_attr_safe(mjt.bless(ui.shortcut.get_keys('View')));
__m[__n++]=__ts[190];                             // " onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_19);
__m[__n++]=__ts[191];                             // .apply(this, [event])">
                                                  //     Run</button>
var onclick_cb_20 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_20] = function (event) {
ui.get_file()._current_editor.query_assist()}
__m[__n++]=__ts[192];                             // 
                                                  //   <button
var dattrs_14 = (writable?{}:{'disabled':'disabled'});
var sattrs_14 = {};
if (!("title" in dattrs_14)) {__m[__n++]=__ts[193];                             //  title="Tab"
 }
if (!("onclick" in dattrs_14)) {__m[__n++]=__ts[194];                             //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_20);
__m[__n++]=__ts[195];                             // .apply(this, [event])"
 }
for (var di_14 in dattrs_14) {
__m[__n++]=' ' + di_14;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_14[di_14]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[196];                             // >Query Assist</button>
var onclick_cb_21 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_21] = function (event) {
ui.get_file()._current_editor.generate_template()}
__m[__n++]=__ts[197];                             // 
                                                  //   <button
var dattrs_15 = (writable?{}:{'disabled':'disabled'});
var sattrs_15 = {};
if (!("onclick" in dattrs_15)) {__m[__n++]=__ts[198];                             //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_21);
__m[__n++]=__ts[199];                             // .apply(this, [event])"
 }
for (var di_15 in dattrs_15) {
__m[__n++]=' ' + di_15;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_15[di_15]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[200];                             // >Create Template</button>
                                                  // </div>
return __m;
};
query_button_bar = __pkg.runtime.tfunc_factory("query_button_bar()", query_button_bar, __pkg, undefined, false);
exports.query_button_bar = query_button_bar;
query_button_bar.source_microdata = null;
__m[__n++]=__ts[201];                             // 
                                                  // 
                                                  // <!-- utilities -->  
// mjt.def=message_panel(type, msg, tid)
var message_panel = function (type, msg, tid) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[202];                             // <div class="message-
__m[__n++]=__pkg.runtime.make_attr_safe(type);
__m[__n++]=__ts[203];                             // "
if (this.subst_id) { __m[__n++]=__pkg.runtime.bless(' id="' + this.subst_id + '"'); }
__m[__n++]=__ts[204];                             // >
                                                  //   <!--<span id="message-panel-close">x</span>-->
                                                  //   <div class="message-icon 
__m[__n++]=__pkg.runtime.make_attr_safe(type);
__m[__n++]=__ts[205];                             // "></div> 
__m[__n++]=(mjt.bless(msg));
__m[__n++]=__ts[206];                             //  
                                                  //   <span class="message-tid">
__m[__n++]=(tid||"");
__m[__n++]=__ts[207];                             // </span>
__pkg.runtime.ondomready(function () {

    $('#message-panel-close').click(function(){
      ui.MessagePanel.clear();
    })
  
}, this);
__m[__n++]=__ts[208];                             // 
                                                  // </div>
return __m;
};
message_panel = __pkg.runtime.tfunc_factory("message_panel(type, msg, tid)", message_panel, __pkg, undefined, false);
exports.message_panel = message_panel;
message_panel.source_microdata = null;
return __m;
};
rawmain.source_microdata = null;
; return rawmain;})(),
info:{"file":"//5b.appeditor.site.tags.svn.freebase-site.googlecode.dev/templates","stringtable":["\n\n<!-- called by ui.init -->","\n  <div id=\"message-panel\"></div>\n  <div id=\"about-bar\"></div>\n  <div id=\"columns\">\n    <div class=\"refresh column\" id=\"list-column\"></div>\n    <div class=\"refresh column\" id=\"file-margin\"></div>\n    <div class=\"column row\" id=\"file-column\">\n      <div class=\"refresh\" id=\"button-bar\"></div>\n      <div class=\"refresh\" id=\"file-area\"></div>\n    </div>\n  </div>","","\n\n<!-- called by ui.refresh_app_templates -->    ","","","\n  <p>\n    <span class=\"app-name\">Acre App Editor</span>\n  </p>","\n  <p><span class=\"app-name\">Loading...</span></p>","\n  <div class=\"app-name\" id=\"button-appsettings\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n    <p><span class=\"button-menu\">","</span></p>\n  </div>","","\n\n<!-- called by ui.refresh_app_templates -->","","\n  <div class=\"column left\" id=\"about-bar-left\">","\n      <span>\n        Version ","\n      </span>","\n      <span>","\n        Current \n      </span>","\n  </div>\n  <div class=\"column margin\" id=\"about-bar-margin\"> </div>\n  <div class=\"column row\" id=\"about-bar-middle\">","\n    <div>\n      <h2><em>This app is hosted on ","</em></h2>\n    </div>","\n    <div>","\n      <button class=\"button-primary\" id=\"button-trunk\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n        Edit Current</button>\n      or","\n      <button id=\"button-clone\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n        Clone this App</button>      \n    </div>","\n    <div>","\n      <button"," class=\"button-primary\""," id=\"button-clone\""," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">\n        Clone this App</button> ","\n        <span>\n          <a href=\"","\" title=\"Sign in to your Freebase account\">Sign in</a>\n        </span>"," \n        to make an app based on this one!\n    </div>","\n    <div class=\"refresh-right\" id=\"about-bar-right\">","\n      <span><b>\n        Versions:","\n        <a apppath=\"","\" class=\"app-link\" href=\"","\">Release</a>","","\n        <a apppath=\"","\" class=\"app-link\" href=\"","\">Current</a>","","\n        <a href=\"#0\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">more...</a>","\n      </b></span>","\n    </div>\n  </div>","","","\n  <button id=\"button-new-file\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n    New File</button>","\n  <h1>Files</h1>\n  \n  <div id=\"file-list\"></div>\n  <div id=\"app-edits-shim\">\n    ","\n  </div>\n  \n  <div id=\"app-search\">\n    <form action=\"http://codesearch.","/\" id=\"codesearch-form\" target=\"_blank\">\n      <div class=\"file-list-section-title\">Find code in app:</div>\n      <input id=\"codesearch-app\" name=\"app\" type=\"hidden\" value=\"","\">\n      <input name=\"q\" type=\"text\" value=\"\">\n    </form>\n  </div>","","","","\n    <div id=\"app-edits\">\n      <div class=\"content\">\n        <span class=\"file-list-section-title\">Active Author: </span>\n        <span class=\"change\">\n          "," edited '","' ","\n        </span>\n      </div>\n    </div>","","\n\n<!-- called by ui.refresh_file_templates -->  ","","\n    <ul section=\"","\">","\n      <li class=\"file-list-section-header\">","\n        <span class=\"file-list-section-toggle\" section=\"","\">▼</span>","\n        <span class=\"file-list-section-toggle\" section=\"","\">►</span>","","\n        <a apppath=\"","\" class=\"file-list-section-title app-link\" href=\"","\">","</a>","\n        <span class=\"file-list-section-title\">","</span>","\n      </li>","","\n      <li",">","\n          <div"," class=\"file-delete\""," onclick=\"return mjt._eventcb.",".apply(this, [event])\"","></div>\n          <a href=\"","\">","</a>\n      </li>","\n    </ul>","","","\n\n  <div>\n    ","\n  </div>","","\n  <div>\n    ","\n  </div>","","","\n\n<!-- called by ui.refresh_file_templates -->  ","","\n    <div id=\"file-buttons\">","\n      <div>\n      <div class=\"refresh-right\" id=\"file-buttons-right\">","\n        <button"," id=\"button-view\""," title=\"","\""," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">\n          View</button>","\n        <button"," class=\"button-primary\""," id=\"button-preview\""," title=\"","\""," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">\n          View with Console</button>\n      </div>\n      <span class=\"buttonset\">","\n        <button"," class=\"button-left button-primary\""," id=\"button-save\""," title=\"","\""," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">\n          Save\n        </button>","<button"," class=\"button-middle\""," id=\"button-saveall\""," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">\n          Save All\n        </button>","<button"," class=\"button-right\""," id=\"button-save\""," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">\n          Save As</button>","\n        <button"," class=\"button-left\""," id=\"button-undo\""," title=\"","\""," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">\n          Undo\n        </button>","<button"," class=\"button-right\""," id=\"button-redo\""," title=\"","\""," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">\n          Redo</button>","\n        <button"," id=\"button-indent\""," title=\"","\""," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">\n          Indent\n        </button>\n      </span>\n      <span class=\"buttonset\">","\n       <button"," class=\"button-left\""," id=\"button-fileactions\""," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">    \n          <span class=\"button-menu\">File</span></button>","<button"," class=\"button-middle\""," id=\"button-editoroptions\""," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">\n          <span class=\"button-menu\">Editor</span></button>","<button class=\"button-right\" id=\"button-help\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n          <span class=\"button-menu\">Help</span></button>\n      </span>\n      <span class=\"buttoncount\">","\n        <span class=\" buttonset linecount\">\n          Line <input class=\"form-textbox\" id=\"linenumber\" title=\"","\" type=\"text\" value=\"","\">\n        </span>","\n      </span>\n    </div>","","\n  </div>","","<div id=\"query-editor-buttons\">","","\n  <button class=\"button-primary\" title=\"","\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n    Run</button>","\n  <button"," title=\"Tab\""," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">Query Assist</button>","\n  <button"," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">Create Template</button>\n</div>","\n\n<!-- utilities -->  ","<div class=\"message-","\"",">\n  <!--<span id=\"message-panel-close\">x</span>-->\n  <div class=\"message-icon ","\"></div> "," \n  <span class=\"message-tid\">","</span>","\n</div>"],"debug_locs":[1,1,1,1,1,1,7,7,7,7,7,7,18,18,18,18,18,18,18,18,18,18,18,18,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,68,68,68,68,68,70,70,70,70,70,70,71,71,72,73,74,75,76,76,78,78,78,78,78,79,79,79,79,80,80,80,80,80,80,80,81,81,81,82,82,82,83,83,83,83,83,83,86,86,86,86,86,86,87,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,103,103,103,104,104,104,104,105,105,105,106,107,107,107,110,110,110,110,113,113,113,113,113,114,114,114,114,115,115,115,116,117,117,117,117,117,117,117,117,120,120,120,120,120,120,120,120,120,122,122,122,122,123,124,124,124,124,124,124,124,124,124,124,124,124,124,124,124,124,124,124,124,124,124,124,124,126,126,126,127,127,127,127,128,128,128,130,130,130,130,132,132,132,134,134,134,134,134,134,134,134,134,134,134,135,135,135,135,135,135,135,135,135,136,136,136,136,136,136,136,136,136,136,137,137,137,140,140,140,140,140,140,140,140,142,142,142,142,143,143,143,143,143,143,143,143,144,144,144,149,149,149,149,149,149,149,153,153,153,153,153,153,155,155,155,155,159,159,159,159,159,159,159,159,159,161,161,161,161,162,162,163,164,165,166,167,168,169,170,170,174,174,174,174,174,174,174,174,174,174,174,177,177,177,177,177,178,178,178,178,178,178,181,181,181,181,181,181,183,183,183,183,184,184,184,185,185,186,186,186,186,186,186,186,186,187,187,187,187,187,187,189,189,189,189,189,189,189,189,189,189,189,190,190,190,190,190,190,191,191,191,193,193,193,193,193,193,193,193,193,193,193,193,193,193,193,194,194,194,194,194,194,194,194,194,194,194,194,194,194,194,194,194,194,194,194,195,195,195,195,195,196,196,196,196,196,196,196,198,198,198,198,198,198,200,200,201,202,203,204,205,206,207,208,209,210,211,212,213,215,215,215,215,216,216,216,216,216,217,217,217,217,217,217,218,218,219,219,219,219,220,220,220,222,222,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,247,247,247,247,247,249,249,249,249,249,249,250,250,251,252,253,254,255,256,257,258,259,260,262,262,262,265,265,265,265,265,265,265,265,265,265,265,265,265,265,265,265,265,265,265,265,265,265,265,265,265,265,268,268,268,268,268,268,268,268,268,268,268,268,268,268,268,268,268,268,268,268,268,268,268,268,268,268,268,273,273,273,273,273,273,273,273,273,273,273,273,273,273,273,273,273,273,273,273,273,273,273,273,273,273,273,273,273,276,276,276,276,276,276,276,276,276,276,276,276,276,276,276,276,276,276,276,276,276,276,276,279,279,279,279,279,279,279,279,279,279,279,279,279,279,279,279,279,279,279,279,279,279,279,282,282,282,282,282,282,282,282,282,282,282,282,282,282,282,282,282,282,282,282,282,282,282,282,282,282,282,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,288,288,288,288,288,288,288,288,288,288,288,288,288,288,288,288,288,288,288,288,288,288,288,288,288,294,294,294,294,294,294,294,294,294,294,294,294,294,294,294,294,294,294,294,294,294,294,294,294,294,294,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,297,297,297,297,297,297,297,301,301,301,301,301,302,302,302,302,302,302,303,303,303,305,305,305,305,306,306,306,307,308,309,310,311,312,313,314,316,316,316,316,316,316,316,317,317,317,317,318,318,319,320,321,321,321,321,321,321,321,321,321,324,324,324,324,324,324,324,324,324,324,324,324,324,324,324,324,324,324,324,324,324,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,327,327,327,327,327,327,327,330,330,330,330,330,330,330,330,330,330,332,332,332,332,332,332,333,333,333,334,334,334,335,336,337,338,339,340,340,340,340,340,340,340,340,340,340],"output_mode":"html"}}
});
}

/** dialogs **/
if (jQuery) {
jQuery(window).trigger('acre.template.register', {pkgid: '//5b.appeditor.site.tags.svn.freebase-site.googlecode.dev/dialogs', source: {def: (function () {// mjt.def=rawmain()
var rawmain = function () {
var __pkg = this.tpackage;
var exports = this.exports;
var __ts=__pkg._template_fragments;
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[0];                               // 
                                                  // 
                                                  // <!-- Dirty files dialog -->
// mjt.def=files_dirty(new_app)
var files_dirty = function (new_app) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[1];                               // 
                                                  //   <h3 class="dialog-title">Abandon Changes?</h3>
                                                  //   <div class="dialog-content">
                                                  //     <div class="dialog-inset">
                                                  //       <p>You haven't saved all the changes you made to the app you currently have open. <b>Abandon these changes?</b></p>
                                                  //     </div>
                                                  //   </div>
                                                  //   <div class="button-bar">
                                                  //     <button class="button-primary exit">No</button>
var onclick_cb_1 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_1] = function (event) {
ui.do_choose_app(new_app)}
__m[__n++]=__ts[2];                               // 
                                                  //     <button class="exit" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_1);
__m[__n++]=__ts[3];                               // .apply(this, [event])">
                                                  //       Yes, abandon changes and switch apps</button>
                                                  //   </div>
return __m;
};
files_dirty = __pkg.runtime.tfunc_factory("files_dirty(new_app)", files_dirty, __pkg, undefined, false);
exports.files_dirty = files_dirty;
files_dirty.source_microdata = null;
__m[__n++]=__ts[4];                               // 
                                                  // 
                                                  // 
                                                  // <!-- New user dialog -->
// mjt.def=welcome(is_user)
var welcome = function (is_user) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[5];                               // 
                                                  //   <div id="welcome-panel">
                                                  //     <div class="acre-logo">
                                                  //       <img alt="Acre: Open Code for Open Data" border="0" height="47" width="211" src="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.url_for('logo-acre.png'));
__m[__n++]=__ts[6];                               // ">
                                                  //     </div>
                                                  //     <div>
if (is_user) {
__m[__n++]=__ts[7];                               // 
                                                  //       <ul>
                                                  //         <li><em>See what you can build!</em><br>
                                                  //           <small>Check out <a class="exit" href="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_store().get_freebase_url());
__m[__n++]=__ts[8];                               // /apps" target="_new">the App Directory</a> or <a class="exit" href="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_store().get_freebase_url());
__m[__n++]=__ts[9];                               // /docs/acre" target="_new">the documentation</a>.</small>
                                                  //         </li>
                                                  //         <li><em>Ready to go?</em><br>
                                                  //           <small></small>
var onclick_cb_2 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_2] = function (event) {
ui.do_show('new_app');}
__m[__n++]=__ts[10];                              // <button id="button-newapp" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_2);
__m[__n++]=__ts[11];                              // .apply(this, [event])"><small>Create a New App</small></button> 
var onclick_cb_3 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_3] = function (event) {
ui.do_show_menu('yourapps');}
__m[__n++]=__ts[12];                              // <button id="button-yourapps" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_3);
__m[__n++]=__ts[13];                              // .apply(this, [event])">
                                                  //             <span class="button-menu">Choose from Your Apps</span></button>
                                                  //         </li>
                                                  //       </ul>
}
else {
__m[__n++]=__ts[14];                              // 
                                                  //       <ul>  
                                                  //         <li><em>Create your own Acre app</em><br>
                                                  //           <small><a href="
__m[__n++]=__pkg.runtime.make_attr_safe($('#nav-signin').attr('href'));
__m[__n++]=__ts[15];                              // " title="Sign in to your Freebase account">Sign in or Sign Up</a>
                                                  //           for Freebase to get started.</small>
                                                  //         </li>
                                                  //         <li><em>See what you can build!</em><br>
                                                  //           <small>Check out <a class="exit" href="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_store().get_freebase_url());
__m[__n++]=__ts[16];                              // /apps" target="_new">the App Directory</a> or <a class="exit" href="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_store().get_freebase_url());
__m[__n++]=__ts[17];                              // /docs/acre" target="_new">the documentation</a>.</small>
                                                  //         </li>
                                                  //       </ul>
}
__m[__n++]=__ts[18];                              // 
                                                  //     </div>
                                                  //   </div>
return __m;
};
welcome = __pkg.runtime.tfunc_factory("welcome(is_user)", welcome, __pkg, undefined, false);
exports.welcome = welcome;
welcome.source_microdata = null;
__m[__n++]=__ts[19];                              // 
                                                  // 
                                                  // 
                                                  // <!-- App action dialogs -->
// mjt.def=new_app(clone)
var new_app = function (clone) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[20];                              // 

    var app_name = clone ? ui.get_app().get_display_name() + " copy" : "";
    var app_key = clone ? ui.get_app().get_name() + "-copy" : "";
  
__m[__n++]=__ts[21];                              // 
                                                  //   <h3 class="dialog-title">Create New App</h3>
                                                  //   <div class="dialog-content">
                                                  //     <fieldset>
                                                  //       <div class="dialog-inset">
                                                  //         <div class="dialog-inset-header">
                                                  //           <input
var dattrs_1 = (clone?{}:{'checked':'checked'});
var sattrs_1 = {};
if (!("id" in dattrs_1)) {__m[__n++]=__ts[22];                              //  id="new-app-create"
 }
if (!("name" in dattrs_1)) {__m[__n++]=__ts[23];                              //  name="new-app"
 }
if (!("type" in dattrs_1)) {__m[__n++]=__ts[24];                              //  type="radio"
 }
if (!("value" in dattrs_1)) {__m[__n++]=__ts[25];                              //  value="create"
 }
for (var di_1 in dattrs_1) {
__m[__n++]=' ' + di_1;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_1[di_1]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[26];                              // >
                                                  //           <label for="new-app-create">Create a new app</label>
                                                  //           <input
var dattrs_2 = (clone?{'checked':'checked'}:{});
var sattrs_2 = {};
if (!("id" in dattrs_2)) {__m[__n++]=__ts[27];                              //  id="new-app-clone"
 }
if (!("name" in dattrs_2)) {__m[__n++]=__ts[28];                              //  name="new-app"
 }
if (!("type" in dattrs_2)) {__m[__n++]=__ts[29];                              //  type="radio"
 }
if (!("value" in dattrs_2)) {__m[__n++]=__ts[30];                              //  value="clone"
 }
for (var di_2 in dattrs_2) {
__m[__n++]=' ' + di_2;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_2[di_2]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[31];                              // >
                                                  //           <label for="new-app-clone">Clone an existing app</label>
                                                  //           <span
var dattrs_3 = (clone?{}:{'style':'display:none'});
var sattrs_3 = {};
if (!("id" in dattrs_3)) {__m[__n++]=__ts[32];                              //  id="new-app-clone-field"
 }
for (var di_3 in dattrs_3) {
__m[__n++]=' ' + di_3;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_3[di_3]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[33];                              // >: 
                                                  //             <input class="longfield" id="new-app-clone-id" type="text" value="
__m[__n++]=__pkg.runtime.make_attr_safe(clone ? ui.get_app().get_versioned_path() : '' );
__m[__n++]=__ts[34];                              // ">
                                                  //           </span>
                                                  //         </div>
                                                  //         <div class="form-row">
                                                  //           <label for="new-app-dialog-name">Name your App: </label>
                                                  //           <input id="new-app-dialog-name" maxlength="50" type="text" value="
__m[__n++]=__pkg.runtime.make_attr_safe(app_name);
__m[__n++]=__ts[35];                              // ">
                                                  //         </div>
                                                  //         <div class="form-row wide">
                                                  //           <label for="new-app-dialog-key">Choose a URL: </label>      
                                                  //           <span class="url">http://<input class="shortfield" id="new-app-dialog-key" maxlength="20" minlength="5" size="15" type="text" value="
__m[__n++]=__pkg.runtime.make_attr_safe(app_key);
__m[__n++]=__ts[36];                              // ">.
__m[__n++]=(ui.get_user().get_new_app_host());
__m[__n++]=__ts[37];                              // </span>
                                                  //         </div>
                                                  //         <div class="form-tip">      
                                                  //           This URL points to the development version of your code.
                                                  //           Later you can choose a shorter Release URL to share with others.
                                                  //         </div>
                                                  //       </div>
                                                  //     </fieldset>
                                                  // 
                                                  //     <div class="cc-callout">
                                                  //       <a class="cc-logo" href="http://creativecommons.org/licenses/BSD/"><img alt="CC-BSD" src="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.url_for('cc-bsd.png'));
__m[__n++]=__ts[38];                              // "></a>
                                                  //       <div class="cc-about">
                                                  //         All Acre apps are published on Freebase under the
                                                  //         <a href="http://creativecommons.org/licenses/BSD/">BSD license</a>
                                                  //         so everyone can "view source", clone code, and learn from each other.
                                                  //       </div>
                                                  //     </div>
                                                  //   </div>
                                                  // 
                                                  //   <div class="button-bar">
                                                  //     <button class="button-primary exit" id="button-new-app">Create</button>
                                                  //     <button class="exit">Cancel</button>
                                                  //   </div>
__pkg.runtime.ondomready(function () {

    $('#new-app-dialog-name').focus().select();
  
    $("#dialog-new_app input[name='new-app']").change(function(){
      $('#new-app-clone-field').toggle();
    });
  
    $("#new-app-clone-id")
        .suggest({ type: '/freebase/apps/acre_app' })
        .bind("fb-select", function(e, data) {
            $(this).val(ui.id_to_path(data.id));
        });
  
    $('#button-new-app').click(function(){
      var args  = [
        ui.get_user().get_new_app_path($.trim($('#new-app-dialog-key').val())),
        $.trim($('#new-app-dialog-name').val())
      ];
      var radio = $("#dialog-new_app input[name='new-app']:checked").val();
      var clone_id = $('#new-app-clone-id').val();
      if (radio == 'clone' && clone_id !== '') {
        args.push(clone_id);
      }
      ui.do_app_create_new.apply(this, args);
    })
  
}, this);
__m[__n++]=__ts[39];                              // 
return __m;
};
new_app = __pkg.runtime.tfunc_factory("new_app(clone)", new_app, __pkg, undefined, false);
exports.new_app = new_app;
new_app.source_microdata = null;
__m[__n++]=__ts[40];                              // 
// mjt.def=delete_app()
var delete_app = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[41];                              // 
                                                  //   <h3 class="dialog-title">Delete app “
__m[__n++]=(ui.get_app().get_display_name());
__m[__n++]=__ts[42];                              // ”?</h3>
                                                  //   <div class="dialog-content">
                                                  //     <div class="dialog-inset">
                                                  //       <p>
                                                  //         Are you sure you want to <b>delete this entire app</b>?
                                                  //       </p>
                                                  //       <p>
                                                  //         This can't be undone!
                                                  //       </p>
                                                  //     </div>
                                                  //   </div>
                                                  //   <div class="button-bar">
var onclick_cb_4 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_4] = function (event) {
ui.do_app_delete()}
__m[__n++]=__ts[43];                              // 
                                                  //     <button class="button-primary exit" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_4);
__m[__n++]=__ts[44];                              // .apply(this, [event])">Delete App</button>
                                                  //     <button class="exit">Cancel</button>
                                                  //   </div>
return __m;
};
delete_app = __pkg.runtime.tfunc_factory("delete_app()", delete_app, __pkg, undefined, false);
exports.delete_app = delete_app;
delete_app.source_microdata = null;
__m[__n++]=__ts[45];                              //   
                                                  // 
                                                  // 
                                                  // <!-- File action dialogs -->
// mjt.def=save_file_as()
var save_file_as = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[46];                              // 
                                                  //   <h3 class="dialog-title">Save File As</h3>
                                                  //   <div class="dialog-content" id="applist">
                                                  //     <span class="loader-square"></span>
                                                  //   </div>
// mjt.def=save_file_applist(applist)
var save_file_applist = function (applist) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[47];                              // 

      ui.app_keys = {};
      $.each(applist, function(){
        ui.app_keys[this.appid] = this.files;
      });
    
__m[__n++]=__ts[48];                              // 
                                                  //     <div class="dialog-inset">
                                                  //       <fieldset>
                                                  //         <div class="form-row">
                                                  //           <label for="clone-filename">New file name: </label>
                                                  //           <input id="clone-filename" type="text" value="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_file().get_name());
__m[__n++]=__ts[49];                              // ">
                                                  //         </div>
                                                  //         <div class="form-row">
                                                  //           <label for="clone-file-app">In app: </label>
                                                  //           <select id="clone-file-app">
__pkg.runtime.foreach(this, (applist), function (app_index_1, app) {
var once_1 = 1;
while (once_1) {
__m[__n++]=__ts[50];                              // 
                                                  //             <option
var dattrs_4 = ((ui.get_app().get_path() == app.path)?{'selected':true}:{});
var sattrs_4 = {};
if (!("value" in dattrs_4)) {__m[__n++]=__ts[51];                              //  value="
__m[__n++]=__pkg.runtime.make_attr_safe(app.path);
__m[__n++]=__ts[52];                              // "
 }
for (var di_4 in dattrs_4) {
__m[__n++]=' ' + di_4;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_4[di_4]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[53];                              // >
                                                  //               
__m[__n++]=app.name;
__m[__n++]=__ts[54];                              // 
                                                  //             </option>
once_1--;
} /* while once */
return once_1 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[55];                              // 
                                                  //           </select>
                                                  //         </div>
                                                  //       </fieldset>
                                                  //     </div>
                                                  //     <div class="button-bar">
                                                  //       <button class="button-primary" id="button-clone">Save</button>
                                                  //       <button class="exit">Cancel</button>
                                                  //     </div>
__pkg.runtime.ondomready(function () {

      $('#clone-filename').focus().select();

      $('#button-clone').click(function(e){
        var new_name = $.trim($('#clone-filename').val());
        var app_path = $.trim($('#clone-file-app :selected').val());
        var key_conflict = $.inArray(new_name, ui.app_keys[app_path]);
        if (key_conflict == -1) {
          ui.do_file_save_as(app_path, new_name);
          ui.do_hide_overlays();
        } else {
          ui.MessagePanel.error("File exists!  Try a different file name.");
        } 
      });
    
}, this);
__m[__n++]=__ts[56];                              // 
return __m;
};
save_file_applist = __pkg.runtime.tfunc_factory("save_file_applist(applist)", save_file_applist, __pkg, undefined, false);
save_file_applist.source_microdata = null;
__m[__n++]=__ts[57];                              // 
__pkg.runtime.ondomready(function () {

    ui.get_store().XhrGet('list_user_apps', {'include_filenames': true})
      .enqueue()
      .onready(function(data){
        
        $("#applist").acre(save_file_applist(data));
      });
  
}, this);
__m[__n++]=__ts[58];                              // 
return __m;
};
save_file_as = __pkg.runtime.tfunc_factory("save_file_as()", save_file_as, __pkg, undefined, false);
exports.save_file_as = save_file_as;
save_file_as.source_microdata = null;
__m[__n++]=__ts[59];                              // 
// mjt.def=add_file()
var add_file = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[60];                              // 

    var file = ui.get_app().get_untitled_file_name();
  
__m[__n++]=__ts[61];                              // 
                                                  //   <h3 class="dialog-title">Create a New...</h3>
// mjt.def=show_handler(handler)
var show_handler = function (handler) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[62];                              // 

      var sup_mime_types = ui.get_store().get_supported_mime_types(handler);
    
__m[__n++]=__ts[63];                              // 
                                                  //   
                                                  //     <div class="form-row">
                                                  //       <label for="add-file-name">New file name:</label>
                                                  //       <input id="add-file-name" type="text" value="
__m[__n++]=__pkg.runtime.make_attr_safe(file);
__m[__n++]=__ts[64];                              // ">
                                                  //     </div>
if (sup_mime_types.length > 1 && handler != 'binary') {
__m[__n++]=__ts[65];                              // 
                                                  //   
                                                  //     <div>
                                                  //       <div class="form-row">
                                                  //         <label for="add-file-mimetype">MIME type: </label>
                                                  //         <select id="add-file-mimetype">
__pkg.runtime.foreach(this, (sup_mime_types), function (sup_mime_type_index_1, sup_mime_type) {
var once_2 = 1;
while (once_2) {
__m[__n++]=__ts[66];                              // 
                                                  //           <option
var dattrs_5 = ((sup_mime_type == 'text/plain')?{'selected':''}:{});
var sattrs_5 = {};
if (!("value" in dattrs_5)) {__m[__n++]=__ts[67];                              //  value="
__m[__n++]=__pkg.runtime.make_attr_safe(sup_mime_type);
__m[__n++]=__ts[68];                              // "
 }
for (var di_5 in dattrs_5) {
__m[__n++]=' ' + di_5;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_5[di_5]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[69];                              // >
                                                  //             
__m[__n++]=sup_mime_type;
__m[__n++]=__ts[70];                              // </option>
once_2--;
} /* while once */
return once_2 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[71];                              // 
                                                  //         </select>
                                                  //       </div>
                                                  //     </div>
}
__m[__n++]=__ts[72];                              // 
__pkg.runtime.ondomready(function () {

      $('#add-file-name')
        .select()
        .keydown(function(e){
          if (e.which == 13) { $('#button-add-file').click(); }
        });
      
      ui.watch_inputs(null, {
        inputs : {
          'add-file-name' : null
        },
        change : function(inputs){
          file = inputs['add-file-name']
        }
      });
    
}, this);
__m[__n++]=__ts[73];                              // 
return __m;
};
show_handler = __pkg.runtime.tfunc_factory("show_handler(handler)", show_handler, __pkg, undefined, false);
show_handler.source_microdata = null;
__m[__n++]=__ts[74];                              // 
                                                  //   
                                                  //   <div class="dialog-content">
                                                  //     <div class="dialog-inset">
                                                  //       <fieldset>
                                                  //         <ul>
__pkg.runtime.foreach(this, (ui.get_store().get_acre_handlers()), function (handler_index_1, handler) {
var once_3 = 1;
while (once_3) {
__m[__n++]=__ts[75];                              // 
                                                  //           <li class="handler-section" id="handler-
__m[__n++]=__pkg.runtime.make_attr_safe(handler.key);
__m[__n++]=__ts[76];                              // ">
                                                  //             <h4><input name="new-file-handler" type="radio" value="
__m[__n++]=__pkg.runtime.make_attr_safe(handler.key);
__m[__n++]=__ts[77];                              // "> 
__m[__n++]=handler.name;
__m[__n++]=__ts[78];                              // </h4>
                                                  //             <p>
__m[__n++]=handler.description;
__m[__n++]=__ts[79];                              // </p>
                                                  //             <div class="handler-new"></div>
                                                  //           </li>
once_3--;
} /* while once */
return once_3 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[80];                              // 
                                                  //         </ul>
                                                  //       </fieldset>
                                                  //     </div>
                                                  //   </div>
                                                  //   <div class="button-bar">
                                                  //     <button class="button-primary" id="button-add-file">Create New File</button>
                                                  //     <button class="exit">Cancel</button>
                                                  //   </div>
__pkg.runtime.ondomready(function () {
 
    ui.watch_inputs('add-file', {
      inputs : {
        'new-file-handler' : null
      },
      change : function(inputs){
        var handler = inputs['new-file-handler'];
        $('.handler-new').empty();
        $('#handler-'+handler + ' .handler-new').acre(show_handler(handler));
        $('.handler-section-active').removeClass('handler-section-active');
        $('#handler-'+handler).addClass('handler-section-active');
      },
      submit : function(inputs){
        var filename = $.trim($('#add-file-name').val());
        if (ui.get_store().validate_filename(filename)) {
          var metadata = { acre_handler: inputs['new-file-handler'] };
          if ($('#add-file-mimetype :selected').val()) { 
            metadata['content_type'] = $('#add-file-mimetype :selected').val();
          }
          ui.do_file_create_new(filename, metadata);
          ui.do_hide_overlays();         
        } else {
          ui.MessagePanel.error("Invalid filename.  Only alphanumeric characters, '-', '_' and '.' are allowed.");
        }
      }
    });
  
    $("input[name='new-file-handler'][value='mjt']")
      .attr('checked','checked')
      .trigger('click');
  
}, this);
__m[__n++]=__ts[81];                              // 
return __m;
};
add_file = __pkg.runtime.tfunc_factory("add_file()", add_file, __pkg, undefined, false);
exports.add_file = add_file;
add_file.source_microdata = null;
__m[__n++]=__ts[82];                              // 
// mjt.def=delete_file(filename)
var delete_file = function (filename) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[83];                              // 
                                                  //   <h3 class="dialog-title">Delete file “
__m[__n++]=filename;
__m[__n++]=__ts[84];                              // ”?</h3>
                                                  //   <div class="dialog-content">
                                                  //   <div class="dialog-inset">
                                                  //     <p>
                                                  //       Are you sure you want to delete the file “<b>
__m[__n++]=filename;
__m[__n++]=__ts[85];                              // </b>”?
                                                  //     </p>
                                                  //     <p>
                                                  //       This can't be undone!
                                                  //     </p>
                                                  //   </div>
                                                  //   </div>
                                                  //   <div class="button-bar">
var onclick_cb_5 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_5] = function (event) {
ui.do_file_delete(filename)}
__m[__n++]=__ts[86];                              // 
                                                  //     <button class="button-primary exit" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_5);
__m[__n++]=__ts[87];                              // .apply(this, [event])">Delete File</button>
                                                  //     <button class="exit">Cancel</button>
                                                  //   </div>
return __m;
};
delete_file = __pkg.runtime.tfunc_factory("delete_file(filename)", delete_file, __pkg, undefined, false);
exports.delete_file = delete_file;
delete_file.source_microdata = null;
__m[__n++]=__ts[88];                              //   
                                                  //   
                                                  // 
                                                  // <!-- Diff/Patch dialogs -->
// mjt.def=diff_patch(mode, opts)
var diff_patch = function (mode, opts) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[89];                              // 
// mjt.def=revision_list(history, id)
var revision_list = function (history, id) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[90];                              // <div
if (this.subst_id) { __m[__n++]=__pkg.runtime.bless(' id="' + this.subst_id + '"'); }
__m[__n++]=__ts[91];                              // >
                                                  //     <div class="revision-list">

        var test = history[0] || {};
        var av = false; var ah = false; var fh = false;
        if (test.revision) {
          if (test.file) { ah = true; } 
          else { fh = true; }
        } else { av = true; }
        var based_on = ui.get_file().get_based_on();
      
__m[__n++]=__ts[92];                              // 
if (fh && based_on) {
__m[__n++]=__ts[93];                              // 
                                                  //       <p>
                                                  //         <b>
__m[__n++]=(ui.get_file().get_name());
__m[__n++]=__ts[94];                              // </b> is based on:
                                                  //         <a class="external-link" href="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_store().get_url());
__m[__n++]=__ts[95];                              // /view
__m[__n++]=__pkg.runtime.make_attr_safe(based_on.id);
__m[__n++]=__ts[96];                              // " target="_blank">
__m[__n++]=based_on.id;
__m[__n++]=__ts[97];                              // </a>
                                                  //       </p>
}
__m[__n++]=__ts[98];                              //               
                                                  //       <table class="item-list">
                                                  //         <thead>
                                                  //           <tr>
                                                  //             <th>Compare</th>
if (av) {
__m[__n++]=__ts[99];                              // 
                                                  //             <th class="left">Version</th>
}
__m[__n++]=__ts[100];                             // 
if (ah) {
__m[__n++]=__ts[101];                             // 
                                                  //             <th class="left">File</th>
}
__m[__n++]=__ts[102];                             // 
                                                  //             <th class="left">Date</th>
if (fh) {
__m[__n++]=__ts[103];                             // 
                                                  //             <th>Length</th>
}
__m[__n++]=__ts[104];                             // 
if (ah || fh) {
__m[__n++]=__ts[105];                             // 
                                                  //             <th class="left">By</th>
}
__m[__n++]=__ts[106];                             // 
                                                  //           </tr>
                                                  //         </thead>
                                                  //         <tbody>
                                                  //           <tr>
                                                  //             <td class="center">
                                                  //               <span>
                                                  //                 <input checked="checked" name="diff-from" type="radio" value=""> |
                                                  //                 <input checked="checked" name="diff-to" type="radio" value="">
                                                  //               </span>
                                                  //             </td>
                                                  //             <td><b><i>Current</i></b></td>
if (av) {
__m[__n++]=__ts[107];                             // 
                                                  //             <td></td>
}
__m[__n++]=__ts[108];                             // 
if (ah) {
__m[__n++]=__ts[109];                             // 
                                                  //             <td></td>
}
__m[__n++]=__ts[110];                             // 
if (fh) {
__m[__n++]=__ts[111];                             // 
                                                  //             <td></td>
}
__m[__n++]=__ts[112];                             // 
if (ah || fh) {
__m[__n++]=__ts[113];                             // 
                                                  //             <td></td>
}
__m[__n++]=__ts[114];                             // 
                                                  //           </tr>
__pkg.runtime.foreach(this, (history), function (i, chg) {
var once_4 = 1;
while (once_4) {
__m[__n++]=__ts[115];                             // 
                                                  //           <tr>
                                                  //             <td class="center">
                                                  //               <span>

                  var val;
                  if (av) { val = chg.as_of_time; }
                  if (ah || fh) { val = chg.timestamp; }
                
__m[__n++]=__ts[116];                             // 
                                                  //                 <input name="diff-from" type="radio" value="
__m[__n++]=__pkg.runtime.make_attr_safe(val);
__m[__n++]=__ts[117];                             // "> |
                                                  //                 <input name="diff-to" type="radio" value="
__m[__n++]=__pkg.runtime.make_attr_safe(val);
__m[__n++]=__ts[118];                             // ">
                                                  //               </span>
                                                  //             </td>
if (av) {
__m[__n++]=__ts[119];                             // 
                                                  //             <td>
__m[__n++]=(chg.name);
__m[__n++]=__ts[120];                             // </td>
}
__m[__n++]=__ts[121];                             // 
if (ah) {
__m[__n++]=__ts[122];                             // 
                                                  //             <td>
__m[__n++]=(mjt.freebase.mqlkey_unquote(chg.file));
__m[__n++]=__ts[123];                             // </td>
}
__m[__n++]=__ts[124];                             // 
                                                  //             <td>
                                                  //               <span class="last_mod">
                                                  //                 
__m[__n++]=(mjt.freebase.date_from_iso(chg.as_of_time||chg.timestamp).toLocaleString());
__m[__n++]=__ts[125];                             // 
                                                  //               </span>
                                                  //             </td>
if (fh) {
__m[__n++]=__ts[126];                             // 
                                                  //             <td class="center">
__m[__n++]=(chg.length);
__m[__n++]=__ts[127];                             // </td>
}
__m[__n++]=__ts[128];                             // 
if (ah || fh) {
__m[__n++]=__ts[129];                             // 
                                                  //             <td>
__m[__n++]=(chg.attribution.name);
__m[__n++]=__ts[130];                             // </td>
}
__m[__n++]=__ts[131];                             // 
                                                  //           </tr>
once_4--;
} /* while once */
return once_4 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[132];                             // 
                                                  //         </tbody>
                                                  //       </table>
                                                  //     </div>
__pkg.runtime.ondomready(function () {

      $('#dialog-diff_patch input, .show-revision, .revert-revision, .diff-button').unbind("click");
              
      function disable_radios(){
        $("input[name='diff-from'], input[name='diff-to']").removeAttr("disabled");
        var fi = $("input[name='diff-to']").index($("input[name='diff-to']:checked")[0]);
        var ti = $("input[name='diff-from']").index($("input[name='diff-from']:checked")[0]);
        $("input[name='diff-to']").slice(0, ti+1).attr('disabled','disabled');
        $("input[name='diff-from']").slice(fi).attr('disabled','disabled');
      }
      disable_radios();

      $("input[name='diff-from'], input[name='diff-to']").click(function(e){
        $('.button-patch').attr('disabled','disabled');
        
        var args = {
          timestamp1 : $("input[name='diff-to']:checked").val(),
          timestamp2 : $("input[name='diff-from']:checked").val()
        };
        
        if(av || ah) {
          $('#diff-filelist-shim').acre(filelist(true));
          $('#diff-view-shim').acre(diff_view());
        
          args.appid1 = id;
          args.appid2 = id;
          
          ui.get_store().XhrGet('get_app_diff', args).enqueue()
            .onready(function(data){
              $('#diff-filelist-shim').acre(filelist(data));
            });
        }
        
        if(fh) {
          args.fileid1 = id;
          args.fileid2 = id;

          ui.get_store().XhrGet('get_file_diff', args).enqueue().onready(function(data){
            $('#diff-view-shim').acre(diff_view(data, "get_file_diff"));
            $('#button-file-revert, #button-file-revert-save').removeAttr('disabled').unbind('click');
            $('#button-file-revert').click(function(){
                ui.do_file_apply_change(data);
            });
            $('#button-file-revert-save').click(function(){
                ui.do_file_apply_change(data, true);
            });
          });
        }

        disable_radios();
      });
    
}, this);
__m[__n++]=__ts[133];                             // 
                                                  //   </div>
return __m;
};
revision_list = __pkg.runtime.tfunc_factory("revision_list(history, id)", revision_list, __pkg, undefined, false);
revision_list.source_microdata = null;
__m[__n++]=__ts[134];                             // 
                                                  //       
                                                  //   <!-- Used when the filelist needs to be dynamically updated -->
// mjt.def=filelist_shim(patch)
var filelist_shim = function (patch) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[135];                             // <div id="diff-filelist-shim">
                                                  //     
__m[__n++]=(filelist(patch));
__m[__n++]=__ts[136];                             // 
                                                  //   </div>
return __m;
};
filelist_shim = __pkg.runtime.tfunc_factory("filelist_shim(patch)", filelist_shim, __pkg, undefined, false);
filelist_shim.source_microdata = null;
__m[__n++]=__ts[137];                             // 
// mjt.def=filelist(patch)
var filelist = function (patch) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[138];                             // <div id="diff-filelist">
if (patch && patch.files) {
__m[__n++]=__ts[139];                             // 

        var appid = ui.get_app().get_path();
        var ordered_filenames = [];
        if ($.isArray(patch.files)) {
          ordered_filenames = patch.files;
        } else {
          for (key in patch.files) {
            ordered_filenames.push(key)
          }            
        }
        ordered_filenames.sort(function(a, b) {
            return a.localeCompare(b);
        });
      
__m[__n++]=__ts[140];                             // 
// mjt.def=diff_file(fn, status)
var diff_file = function (fn, status) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[141];                             // 
if (status) {
__m[__n++]=__ts[142];                             // 
                                                  //         <span>
if (mode !== 'app_diff') {
__m[__n++]=__ts[143];                             // 
                                                  //           <input
var dattrs_6 = (status==='update'?{'checked':'checked'}:{});
var sattrs_6 = {};
if (!("type" in dattrs_6)) {__m[__n++]=__ts[144];                             //  type="checkbox"
 }
for (var di_6 in dattrs_6) {
__m[__n++]=' ' + di_6;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_6[di_6]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[145];                             // >
}
__m[__n++]=__ts[146];                             // 
                                                  //           <a
var dattrs_7 = ((mode === 'app_diff')?{'class':'diff-filelist-stub'}:{});
var sattrs_7 = {};
if (!("href" in dattrs_7)) {__m[__n++]=__ts[147];                             //  href="#0"
 }
for (var di_7 in dattrs_7) {
__m[__n++]=' ' + di_7;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_7[di_7]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[148];                             // >
                                                  //             
__m[__n++]=(mjt.freebase.mqlkey_unquote(fn));
__m[__n++]=__ts[149];                             // </a>
                                                  //         </span>
}
else {
__m[__n++]=__ts[150];                             // 
                                                  //         <span class="diff-filelist-stub">
                                                  //           <i>
__m[__n++]=(mjt.freebase.mqlkey_unquote(fn));
__m[__n++]=__ts[151];                             // </i>
                                                  //         </span>
}
__m[__n++]=__ts[152];                             // 
switch (status) {
case "add":
__m[__n++]=__ts[153];                             // <span class="file-merge-status">+</span>
break;
case "delete":
__m[__n++]=__ts[154];                             // <span class="file-merge-status">-</span>
break;
case "conflict":
__m[__n++]=__ts[155];                             // <span class="file-merge-status error-alert">!</span>
break;
case "update":
__m[__n++]=__ts[156];                             // <span class="file-merge-status"></span>
break;
};
__m[__n++]=__ts[157];                             // 
return __m;
};
diff_file = __pkg.runtime.tfunc_factory("diff_file(fn, status)", diff_file, __pkg, undefined, false);
diff_file.source_microdata = null;
__m[__n++]=__ts[158];                             // 
                                                  //       <p>
                                                  //         Select: 
var onclick_cb_6 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_6] = function (event) {
$('#diff-filelist input').attr('checked','checked')}
__m[__n++]=__ts[159];                             // <a href="#0" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_6);
__m[__n++]=__ts[160];                             // .apply(this, [event])">All</a> | 
var onclick_cb_7 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_7] = function (event) {
$('#diff-filelist input').removeAttr('checked')}
__m[__n++]=__ts[161];                             // 
                                                  //         <a href="#0" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_7);
__m[__n++]=__ts[162];                             // .apply(this, [event])">None</a>
                                                  //       </p>
                                                  //       <ul>
__pkg.runtime.foreach(this, (ordered_filenames), function (fn_index_1, fn) {
var once_5 = 1;
while (once_5) {
__m[__n++]=__ts[163];                             // 
                                                  //         <li class="file-list-item" data-fn="
__m[__n++]=__pkg.runtime.make_attr_safe(fn);
__m[__n++]=__ts[164];                             // ">
                                                  //           <span class="diff-filelist-stub">
__m[__n++]=(mjt.freebase.mqlkey_unquote(fn));
__m[__n++]=__ts[165];                             // </span>
                                                  //         </li>
once_5--;
} /* while once */
return once_5 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[166];                             // 
                                                  //       </ul>
__pkg.runtime.ondomready(function () {

        var num_files = $('#diff-filelist .file-list-item').length;
        
        $('#diff-filelist .file-list-item').each(function(index){
          var li = $(this);
          var file = $(li).attr("data-fn");

          var method;
          var args = {};
          switch (mode) {
            case "app_history"  :
            case "app_diff" :
              method = "get_file_diff";
              args = {
                fileid1    : patch.files[file].file1 ? patch.files[file].file1.fileid    : undefined,
                fileid2    : patch.files[file].file2 ? patch.files[file].file2.fileid    : undefined,
                timestamp1 : patch.app1 ? patch.app1.timestamp : undefined,
                timestamp2 : patch.app2 ? patch.app2.timestamp : undefined
              };
              break;
            case "merge_changes" :
              method = "get_file_merge";
              args = {
                fileid1    : patch.files[file].file1 ? patch.files[file].file1.fileid    : undefined,
                fileid2    : patch.files[file].file2 ? patch.files[file].file2.fileid    : undefined
              };
              break;
          }
          
          function update_filelist_item(status, template, args) {
            $(li).acre(diff_file(file, status)).click(function(){
              $('#diff-filelist .file-list-item').removeClass('selected-file');
              $(li).addClass('selected-file');
              $('#diff-view-shim').acre(template.apply(this, args));
            });
            
            num_files -= 1;
            if (num_files === 0) {
              $('.button-patch').removeAttr('disabled');
              $('#diff-filelist .file-list-item input').click(function(e){
                e.stopPropagation();
              })
            }
          }

          ui.get_store().XhrGet(method, args).enqueue()
            .onready(function(r){
              patch.files[file] = r;
              if (!r.file1) { status = "delete"; }
              else if (!r.file2) { status = "add"; }
              else if (r.patch && r.patch.conflict == true) {
                status = "conflict";
              } else {
                status = "update"
              }
              update_filelist_item(status, diff_view, [patch.files[file], method]);
            })
            .onerror(function(code, message, info){
              update_filelist_item(false, merge_error, [message, info]);
            });
        });
      
}, this);
__m[__n++]=__ts[167];                             // 
}
else if (patch) {
__m[__n++]=__ts[168];                             // 
                                                  //     <span class="loader-square"></span>
}
else {
__m[__n++]=__ts[169];                             // 
                                                  //     <p>Pick revisions above to see changed files</p>
}
__m[__n++]=__ts[170];                             // 
__pkg.runtime.ondomready(function () {

      $('.patch-apply, .patch-apply-save').unbind('click');
      $('.patch-apply, .patch-apply-save').click(function(){
        var files = [];
        $('#diff-filelist input:checked').each(function(){
          var fn = $(this).closest('.file-list-item').attr('data-fn');
          files.push(fn);
        });
        ui.do_app_apply_changes(patch, files, $(this).hasClass('patch-apply-save'));
      });
    
}, this);
__m[__n++]=__ts[171];                             // 
                                                  //   </div>
return __m;
};
filelist = __pkg.runtime.tfunc_factory("filelist(patch)", filelist, __pkg, undefined, false);
filelist.source_microdata = null;
__m[__n++]=__ts[172];                             // 
                                                  // 
                                                  //   <!-- Used when the diff view needs to be dynamically updated -->
// mjt.def=diff_view_shim(diff)
var diff_view_shim = function (diff) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[173];                             // <div id="diff-view-shim">
                                                  //     
__m[__n++]=(diff_view(diff));
__m[__n++]=__ts[174];                             // 
                                                  //   </div>
return __m;
};
diff_view_shim = __pkg.runtime.tfunc_factory("diff_view_shim(diff)", diff_view_shim, __pkg, undefined, false);
diff_view_shim.source_microdata = null;
__m[__n++]=__ts[175];                             // 
// mjt.def=diff_view(data, method)
var diff_view = function (data, method) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[176];                             // <div class="diff" id="diff-view">
if (data) {
__m[__n++]=__ts[177];                             // 
__pkg.runtime.ondomready(function () {

        ui.populate_diff($("#diff-view"), data, method);
      
}, this);
__m[__n++]=__ts[178];                             // 
}
else {
__m[__n++]=__ts[179];                             // 
                                                  //     <p>Click on a file or revision to see the changes.</p>
}
__m[__n++]=__ts[180];                             // 
                                                  //   </div>
return __m;
};
diff_view = __pkg.runtime.tfunc_factory("diff_view(data, method)", diff_view, __pkg, undefined, false);
diff_view.source_microdata = null;
__m[__n++]=__ts[181];                             // 
// mjt.def=merge_error(msg, info)
var merge_error = function (msg, info) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[182];                             // <div id="diff-error-view">
                                                  //     <div class="message">
__m[__n++]=msg;
__m[__n++]=__ts[183];                             // </div>
                                                  //   </div>
return __m;
};
merge_error = __pkg.runtime.tfunc_factory("merge_error(msg, info)", merge_error, __pkg, undefined, false);
merge_error.source_microdata = null;
__m[__n++]=__ts[184];                             // 
                                                  //       
                                                  //   <!-- Main content for each mode -->    
// mjt.def=app_history(t)
var app_history = function (t) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[185];                             // 
                                                  //     <div class="dialog-content">
                                                  //       <fieldset id="apphistory-mode">
                                                  //         <div class="radiogroup">
                                                  //           <h5>
                                                  //             <input checked="checked" name="app-history" type="radio" value="versions">
                                                  //             Versions
                                                  //           </h5>
                                                  //         </div>
                                                  //         <div class="radiogroup">
                                                  //           <h5>
                                                  //             <input name="app-history" type="radio" value="all-changes">
                                                  //             Edits
                                                  //           </h5>
                                                  //         </div>
                                                  //       </fieldset>
                                                  //       <div class="diff-top">
                                                  //         <div id="revision-list-shim"></div>
                                                  //       </div>
                                                  //       <div class="diff-bottom-short" id="history-diff"></div>
// mjt.def=history_diff()
var history_diff = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[186];                             // 
                                                  //         
__m[__n++]=(filelist_shim());
__m[__n++]=__ts[187];                             // 
                                                  //         <div class="diff-area-files">
__m[__n++]=(diff_view_shim());
__m[__n++]=__ts[188];                             // </div>
return __m;
};
history_diff = __pkg.runtime.tfunc_factory("history_diff()", history_diff, __pkg, undefined, false);
history_diff.source_microdata = null;
__m[__n++]=__ts[189];                             // 
                                                  //     </div>
                                                  //     <div class="button-bar">
if (writable) {
__m[__n++]=__ts[190];                             // 
                                                  //       <button class="button-patch patch-apply button-primary exit" disabled="disabled">Revert to Right</button>
}
__m[__n++]=__ts[191];                             //         
if (writable) {
__m[__n++]=__ts[192];                             // 
                                                  //       <button class="button-patch patch-apply-save exit" disabled="disabled">Revert &amp; Save</button>
}
__m[__n++]=__ts[193];                             // 
                                                  //       <button class="exit">Done</button>
                                                  //     </div>
__pkg.runtime.ondomready(function () {

      function update_revlist(mode) {
        $('#revision-list-shim').empty().addClass("loader-square");
        var task = (mode == "versions") ? mjt.Succeed(ui.get_app().get_versions()) : ui.get_app().t_get_history();
        task.enqueue().onready(function(r){ 
          $('#revision-list-shim')
            .removeClass("loader-square")
            .acre(revision_list(r.history || r, ui.get_app().get_path()));
          $('#history-diff').acre(history_diff());
          $('.button-patch').attr('disabled','disabled');
        });
      }
      
      $('input[name="app-history"]').change(function(){
        update_revlist($(this).val());
      });
      
      update_revlist("versions");
    
}, this);
__m[__n++]=__ts[194];                             // 
return __m;
};
app_history = __pkg.runtime.tfunc_factory("app_history(t)", app_history, __pkg, undefined, false);
app_history.source_microdata = null;
__m[__n++]=__ts[195];                             // 
// mjt.def=app_diff(diff)
var app_diff = function (diff) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[196];                             // 
                                                  //     <div class="dialog-content">
                                                  //       <div class="diff-bottom-tall">
                                                  //         
__m[__n++]=(filelist_shim(diff));
__m[__n++]=__ts[197];                             // 
                                                  //         <div class="diff-area-files">
__m[__n++]=(diff_view_shim());
__m[__n++]=__ts[198];                             // </div>
                                                  //       </div>
                                                  //     </div>
                                                  //     <div class="button-bar">
                                                  //       <button class="exit">Done</button>
                                                  //     </div>
return __m;
};
app_diff = __pkg.runtime.tfunc_factory("app_diff(diff)", app_diff, __pkg, undefined, false);
app_diff.source_microdata = null;
__m[__n++]=__ts[199];                             // 
// mjt.def=file_history(t)
var file_history = function (t) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[200];                             // 
                                                  //     <div class="dialog-content">
                                                  //       <div class="diff-top">
                                                  //         
__m[__n++]=(revision_list(t.history, t.fileid));
__m[__n++]=__ts[201];                             // 
                                                  //       </div>
                                                  //       <div class="diff-bottom-short">
                                                  //         <div class="diff-area-full diff-area-short">
__m[__n++]=(diff_view_shim());
__m[__n++]=__ts[202];                             // </div>
                                                  //       </div>
                                                  //     </div>
                                                  //     <div class="button-bar">
if (writable) {
__m[__n++]=__ts[203];                             // 
                                                  //       <button class="button-primary exit" disabled="disabled" id="button-file-revert">Revert to Right</button>
}
__m[__n++]=__ts[204];                             // 
if (writable) {
__m[__n++]=__ts[205];                             // 
                                                  //       <button class="exit" disabled="disabled" id="button-file-revert-save">Revert &amp; Save</button>
}
__m[__n++]=__ts[206];                             //         <button class="exit">Done</button>
                                                  //     </div>
return __m;
};
file_history = __pkg.runtime.tfunc_factory("file_history(t)", file_history, __pkg, undefined, false);
file_history.source_microdata = null;
__m[__n++]=__ts[207];                             // 
// mjt.def=merge_changes(patch)
var merge_changes = function (patch) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[208];                             // 
                                                  //     <div class="dialog-content">
                                                  //       <div class="diff-bottom-tall">
                                                  //         
__m[__n++]=(filelist_shim(patch));
__m[__n++]=__ts[209];                             // 
                                                  //         <div class="diff-area-files">
__m[__n++]=(diff_view_shim());
__m[__n++]=__ts[210];                             // </div>
                                                  //       </div>
                                                  //     </div>
                                                  //     <div class="button-bar">
if (writable) {
__m[__n++]=__ts[211];                             // 
                                                  //       <button class="button-patch patch-apply button-primary exit" disabled="disabled">Apply Selected Changes</button>
}
__m[__n++]=__ts[212];                             // 
if (writable) {
__m[__n++]=__ts[213];                             // 
                                                  //       <button class="button-patch patch-apply-save exit" disabled="disabled">Apply &amp; Save</button>
}
__m[__n++]=__ts[214];                             // 
                                                  //       <button class="exit">Done</button>
                                                  //     </div>
return __m;
};
merge_changes = __pkg.runtime.tfunc_factory("merge_changes(patch)", merge_changes, __pkg, undefined, false);
merge_changes.source_microdata = null;
__m[__n++]=__ts[215];                             // 
// mjt.def=save_conflict(diff)
var save_conflict = function (diff) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[216];                             // 

      diff.labels = ["Saved Copy", "Your Local Version"];
    
__m[__n++]=__ts[217];                             // 
                                                  //     <div class="dialog-content">
                                                  //       <div class="diff-top">
                                                  //         <p>
                                                  //           The saved version of this file has changed since it was loaded, likely because 
                                                  //           it was edited by another user or by you in another browser or tab.  
                                                  //         </p>
                                                  //         <p>
                                                  //           Decide how to proceed or view the details of the conflict.
                                                  //         </p>
                                                  //       </div>
                                                  //       <div class="diff-bottom-short">
                                                  //         <div class="diff-area-full">
__m[__n++]=(diff_view(diff, "get_file_diff"));
__m[__n++]=__ts[218];                             // </div>
                                                  //       </div>
                                                  //     </div>
                                                  //     <div class="button-bar">
var onclick_cb_8 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_8] = function (event) {
ui.do_file_save(true)}
__m[__n++]=__ts[219];                             // 
                                                  //       <button class="button exit" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_8);
__m[__n++]=__ts[220];                             // .apply(this, [event])">Save Anyway</button>
                                                  //       <button class="button-primary exit">Cancel</button>
                                                  //     </div>
return __m;
};
save_conflict = __pkg.runtime.tfunc_factory("save_conflict(diff)", save_conflict, __pkg, undefined, false);
save_conflict.source_microdata = null;
__m[__n++]=__ts[221];                             // 
                                                  //    
                                                  //   <!-- Setup the dialog for all modes -->

    var writable = ui.get_app().is_writable();
    var title; var task; var template;
    switch (mode) {
      case "app_history" :
        title = "App History";
        task = mjt.Succeed(ui.get_app().get_versions());
        template = app_history;
        break;
      case "app_diff" : 
        var ver = ui.get_app().get_versions()[0];
        title = "View changes since version " + ver.name;
        task = ui.get_store().XhrGet("get_app_diff", { appid1 : ui.get_app().get_path(), appid2 : ui.get_app().get_path(), timestamp2: ver.as_of_time});
        template = app_diff;
        break;
      case "file_history" :
        title = "File History";
        task = ui.get_file().t_get_history();
        template = file_history;
        break;
      case "merge_changes" : 
        title = "View changes from " + opts.appid;
        task = ui.get_store().XhrGet("get_app_diff", { appid1 : opts.appid, appid2 : ui.get_app().get_path() });
        template = merge_changes;
        break;
      case "save_conflict":
        title = "File Save Conflict";
        task = mjt.Succeed(opts);
        template = save_conflict;
        break;
    }
  
__m[__n++]=__ts[222];                             // 
                                                  //   
                                                  //   <h3 class="dialog-title">
__m[__n++]=title;
__m[__n++]=__ts[223];                             // </h3>
                                                  //   <div id="diff-dialog">
                                                  //     <span class="loader-square"></span>
                                                  //   </div>
__pkg.runtime.ondomready(function () {

    task.enqueue().onready(function(r){ 
      $('#diff-dialog').acre(template(r));
    });
  
}, this);
__m[__n++]=__ts[224];                             // 
return __m;
};
diff_patch = __pkg.runtime.tfunc_factory("diff_patch(mode, opts)", diff_patch, __pkg, undefined, false);
exports.diff_patch = diff_patch;
diff_patch.source_microdata = null;
__m[__n++]=__ts[225];                             // 
                                                  // 
                                                  // 
                                                  // <!-- Help dialogs -->
// mjt.def=keyboard_shortcuts()
var keyboard_shortcuts = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[226];                             // 
                                                  //   <h3 class="dialog-title">App Editor Keyboard Shortcuts</h3>
                                                  //   <div class="dialog-content">
                                                  //     <div class="dialog-inset">
                                                  //       <table>
__pkg.runtime.foreach(this, (ui.shortcut.get_shortcuts()), function (shortcut_index_1, shortcut) {
var once_6 = 1;
while (once_6) {
__m[__n++]=__ts[227];                             // 
                                                  //         <tr>
                                                  //           <th>
__m[__n++]=(mjt.bless(ui.shortcut.get_keys(shortcut.op)));
__m[__n++]=__ts[228];                             // </th>
                                                  //           <td>
__m[__n++]=shortcut.op;
__m[__n++]=__ts[229];                             // </td>
                                                  //         </tr>
once_6--;
} /* while once */
return once_6 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[230];                             // 
                                                  //       </table>
                                                  //     </div>
                                                  //   </div>
return __m;
};
keyboard_shortcuts = __pkg.runtime.tfunc_factory("keyboard_shortcuts()", keyboard_shortcuts, __pkg, undefined, false);
exports.keyboard_shortcuts = keyboard_shortcuts;
keyboard_shortcuts.source_microdata = null;
__m[__n++]=__ts[231];                             // 
// mjt.def=about_appeditor()
var about_appeditor = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[232];                             // 
                                                  //   <h3 class="dialog-title">About App Editor</h3>
                                                  //   <iframe class="dialog-content" id="dialog-aboutappeditor" src="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.url_for('license.html'));
__m[__n++]=__ts[233];                             // "></iframe>
                                                  //   <div class="button-bar">
                                                  //     <b>Version: </b>
                                                  //     <span>
__m[__n++]=fb.acre.appeditor.version;
__m[__n++]=__ts[234];                             // </span>
                                                  //     <span>- 
__m[__n++]=(ui.get_store().get_acre_version());
__m[__n++]=__ts[235];                             // </span>
                                                  //   </div>
return __m;
};
about_appeditor = __pkg.runtime.tfunc_factory("about_appeditor()", about_appeditor, __pkg, undefined, false);
exports.about_appeditor = about_appeditor;
about_appeditor.source_microdata = null;
__m[__n++]=__ts[236];                             // 
// mjt.def=documentation(url)
var documentation = function (url) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[237];                             // 
var onclick_cb_9 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_9] = function (event) {
ui.do_hide_overlays()}
__m[__n++]=__ts[238];                             // 
                                                  //   <a class="doc-view-link" href="
__m[__n++]=__pkg.runtime.make_attr_safe(url);
__m[__n++]=__ts[239];                             // " target="_blank" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_9);
__m[__n++]=__ts[240];                             // .apply(this, [event])">Open in a new window</a>
                                                  //   <iframe class="dialog-content" src="
__m[__n++]=__pkg.runtime.make_attr_safe(url);
__m[__n++]=__ts[241];                             // "></iframe>
return __m;
};
documentation = __pkg.runtime.tfunc_factory("documentation(url)", documentation, __pkg, undefined, false);
exports.documentation = documentation;
documentation.source_microdata = null;
__m[__n++]=__ts[242];                             // 
return __m;
};
rawmain.source_microdata = null;
; return rawmain;})(),
info:{"file":"//5b.appeditor.site.tags.svn.freebase-site.googlecode.dev/dialogs","stringtable":["\n\n<!-- Dirty files dialog -->","\n  <h3 class=\"dialog-title\">Abandon Changes?</h3>\n  <div class=\"dialog-content\">\n    <div class=\"dialog-inset\">\n      <p>You haven't saved all the changes you made to the app you currently have open. <b>Abandon these changes?</b></p>\n    </div>\n  </div>\n  <div class=\"button-bar\">\n    <button class=\"button-primary exit\">No</button>","\n    <button class=\"exit\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n      Yes, abandon changes and switch apps</button>\n  </div>","\n\n\n<!-- New user dialog -->","\n  <div id=\"welcome-panel\">\n    <div class=\"acre-logo\">\n      <img alt=\"Acre: Open Code for Open Data\" border=\"0\" height=\"47\" width=\"211\" src=\"","\">\n    </div>\n    <div>","\n      <ul>\n        <li><em>See what you can build!</em><br>\n          <small>Check out <a class=\"exit\" href=\"","/apps\" target=\"_new\">the App Directory</a> or <a class=\"exit\" href=\"","/docs/acre\" target=\"_new\">the documentation</a>.</small>\n        </li>\n        <li><em>Ready to go?</em><br>\n          <small></small>","<button id=\"button-newapp\" onclick=\"return mjt._eventcb.",".apply(this, [event])\"><small>Create a New App</small></button> ","<button id=\"button-yourapps\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n            <span class=\"button-menu\">Choose from Your Apps</span></button>\n        </li>\n      </ul>","\n      <ul>  \n        <li><em>Create your own Acre app</em><br>\n          <small><a href=\"","\" title=\"Sign in to your Freebase account\">Sign in or Sign Up</a>\n          for Freebase to get started.</small>\n        </li>\n        <li><em>See what you can build!</em><br>\n          <small>Check out <a class=\"exit\" href=\"","/apps\" target=\"_new\">the App Directory</a> or <a class=\"exit\" href=\"","/docs/acre\" target=\"_new\">the documentation</a>.</small>\n        </li>\n      </ul>","\n    </div>\n  </div>","\n\n\n<!-- App action dialogs -->","","\n  <h3 class=\"dialog-title\">Create New App</h3>\n  <div class=\"dialog-content\">\n    <fieldset>\n      <div class=\"dialog-inset\">\n        <div class=\"dialog-inset-header\">\n          <input"," id=\"new-app-create\""," name=\"new-app\""," type=\"radio\""," value=\"create\"",">\n          <label for=\"new-app-create\">Create a new app</label>\n          <input"," id=\"new-app-clone\""," name=\"new-app\""," type=\"radio\""," value=\"clone\"",">\n          <label for=\"new-app-clone\">Clone an existing app</label>\n          <span"," id=\"new-app-clone-field\"",">: \n            <input class=\"longfield\" id=\"new-app-clone-id\" type=\"text\" value=\"","\">\n          </span>\n        </div>\n        <div class=\"form-row\">\n          <label for=\"new-app-dialog-name\">Name your App: </label>\n          <input id=\"new-app-dialog-name\" maxlength=\"50\" type=\"text\" value=\"","\">\n        </div>\n        <div class=\"form-row wide\">\n          <label for=\"new-app-dialog-key\">Choose a URL: </label>      \n          <span class=\"url\">http://<input class=\"shortfield\" id=\"new-app-dialog-key\" maxlength=\"20\" minlength=\"5\" size=\"15\" type=\"text\" value=\"","\">.","</span>\n        </div>\n        <div class=\"form-tip\">      \n          This URL points to the development version of your code.\n          Later you can choose a shorter Release URL to share with others.\n        </div>\n      </div>\n    </fieldset>\n\n    <div class=\"cc-callout\">\n      <a class=\"cc-logo\" href=\"http://creativecommons.org/licenses/BSD/\"><img alt=\"CC-BSD\" src=\"","\"></a>\n      <div class=\"cc-about\">\n        All Acre apps are published on Freebase under the\n        <a href=\"http://creativecommons.org/licenses/BSD/\">BSD license</a>\n        so everyone can \"view source\", clone code, and learn from each other.\n      </div>\n    </div>\n  </div>\n\n  <div class=\"button-bar\">\n    <button class=\"button-primary exit\" id=\"button-new-app\">Create</button>\n    <button class=\"exit\">Cancel</button>\n  </div>","","","\n  <h3 class=\"dialog-title\">Delete app “","”?</h3>\n  <div class=\"dialog-content\">\n    <div class=\"dialog-inset\">\n      <p>\n        Are you sure you want to <b>delete this entire app</b>?\n      </p>\n      <p>\n        This can't be undone!\n      </p>\n    </div>\n  </div>\n  <div class=\"button-bar\">","\n    <button class=\"button-primary exit\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">Delete App</button>\n    <button class=\"exit\">Cancel</button>\n  </div>","  \n\n\n<!-- File action dialogs -->","\n  <h3 class=\"dialog-title\">Save File As</h3>\n  <div class=\"dialog-content\" id=\"applist\">\n    <span class=\"loader-square\"></span>\n  </div>","","\n    <div class=\"dialog-inset\">\n      <fieldset>\n        <div class=\"form-row\">\n          <label for=\"clone-filename\">New file name: </label>\n          <input id=\"clone-filename\" type=\"text\" value=\"","\">\n        </div>\n        <div class=\"form-row\">\n          <label for=\"clone-file-app\">In app: </label>\n          <select id=\"clone-file-app\">","\n            <option"," value=\"","\"",">\n              ","\n            </option>","\n          </select>\n        </div>\n      </fieldset>\n    </div>\n    <div class=\"button-bar\">\n      <button class=\"button-primary\" id=\"button-clone\">Save</button>\n      <button class=\"exit\">Cancel</button>\n    </div>","","","","","","\n  <h3 class=\"dialog-title\">Create a New...</h3>","","\n  \n    <div class=\"form-row\">\n      <label for=\"add-file-name\">New file name:</label>\n      <input id=\"add-file-name\" type=\"text\" value=\"","\">\n    </div>","\n  \n    <div>\n      <div class=\"form-row\">\n        <label for=\"add-file-mimetype\">MIME type: </label>\n        <select id=\"add-file-mimetype\">","\n          <option"," value=\"","\"",">\n            ","</option>","\n        </select>\n      </div>\n    </div>","","","\n  \n  <div class=\"dialog-content\">\n    <div class=\"dialog-inset\">\n      <fieldset>\n        <ul>","\n          <li class=\"handler-section\" id=\"handler-","\">\n            <h4><input name=\"new-file-handler\" type=\"radio\" value=\"","\"> ","</h4>\n            <p>","</p>\n            <div class=\"handler-new\"></div>\n          </li>","\n        </ul>\n      </fieldset>\n    </div>\n  </div>\n  <div class=\"button-bar\">\n    <button class=\"button-primary\" id=\"button-add-file\">Create New File</button>\n    <button class=\"exit\">Cancel</button>\n  </div>","","","\n  <h3 class=\"dialog-title\">Delete file “","”?</h3>\n  <div class=\"dialog-content\">\n  <div class=\"dialog-inset\">\n    <p>\n      Are you sure you want to delete the file “<b>","</b>”?\n    </p>\n    <p>\n      This can't be undone!\n    </p>\n  </div>\n  </div>\n  <div class=\"button-bar\">","\n    <button class=\"button-primary exit\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">Delete File</button>\n    <button class=\"exit\">Cancel</button>\n  </div>","  \n  \n\n<!-- Diff/Patch dialogs -->","","<div",">\n    <div class=\"revision-list\">","","\n      <p>\n        <b>","</b> is based on:\n        <a class=\"external-link\" href=\"","/view","\" target=\"_blank\">","</a>\n      </p>","              \n      <table class=\"item-list\">\n        <thead>\n          <tr>\n            <th>Compare</th>","\n            <th class=\"left\">Version</th>","","\n            <th class=\"left\">File</th>","\n            <th class=\"left\">Date</th>","\n            <th>Length</th>","","\n            <th class=\"left\">By</th>","\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td class=\"center\">\n              <span>\n                <input checked=\"checked\" name=\"diff-from\" type=\"radio\" value=\"\"> |\n                <input checked=\"checked\" name=\"diff-to\" type=\"radio\" value=\"\">\n              </span>\n            </td>\n            <td><b><i>Current</i></b></td>","\n            <td></td>","","\n            <td></td>","","\n            <td></td>","","\n            <td></td>","\n          </tr>","\n          <tr>\n            <td class=\"center\">\n              <span>","\n                <input name=\"diff-from\" type=\"radio\" value=\"","\"> |\n                <input name=\"diff-to\" type=\"radio\" value=\"","\">\n              </span>\n            </td>","\n            <td>","</td>","","\n            <td>","</td>","\n            <td>\n              <span class=\"last_mod\">\n                ","\n              </span>\n            </td>","\n            <td class=\"center\">","</td>","","\n            <td>","</td>","\n          </tr>","\n        </tbody>\n      </table>\n    </div>","\n  </div>","\n      \n  <!-- Used when the filelist needs to be dynamically updated -->","<div id=\"diff-filelist-shim\">\n    ","\n  </div>","","<div id=\"diff-filelist\">","","","","\n        <span>","\n          <input"," type=\"checkbox\"",">","\n          <a"," href=\"#0\"",">\n            ","</a>\n        </span>","\n        <span class=\"diff-filelist-stub\">\n          <i>","</i>\n        </span>","","<span class=\"file-merge-status\">+</span>","<span class=\"file-merge-status\">-</span>","<span class=\"file-merge-status error-alert\">!</span>","<span class=\"file-merge-status\"></span>","","\n      <p>\n        Select: ","<a href=\"#0\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">All</a> | ","\n        <a href=\"#0\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">None</a>\n      </p>\n      <ul>","\n        <li class=\"file-list-item\" data-fn=\"","\">\n          <span class=\"diff-filelist-stub\">","</span>\n        </li>","\n      </ul>","","\n    <span class=\"loader-square\"></span>","\n    <p>Pick revisions above to see changed files</p>","","\n  </div>","\n\n  <!-- Used when the diff view needs to be dynamically updated -->","<div id=\"diff-view-shim\">\n    ","\n  </div>","","<div class=\"diff\" id=\"diff-view\">","","","\n    <p>Click on a file or revision to see the changes.</p>","\n  </div>","","<div id=\"diff-error-view\">\n    <div class=\"message\">","</div>\n  </div>","\n      \n  <!-- Main content for each mode -->    ","\n    <div class=\"dialog-content\">\n      <fieldset id=\"apphistory-mode\">\n        <div class=\"radiogroup\">\n          <h5>\n            <input checked=\"checked\" name=\"app-history\" type=\"radio\" value=\"versions\">\n            Versions\n          </h5>\n        </div>\n        <div class=\"radiogroup\">\n          <h5>\n            <input name=\"app-history\" type=\"radio\" value=\"all-changes\">\n            Edits\n          </h5>\n        </div>\n      </fieldset>\n      <div class=\"diff-top\">\n        <div id=\"revision-list-shim\"></div>\n      </div>\n      <div class=\"diff-bottom-short\" id=\"history-diff\"></div>","\n        ","\n        <div class=\"diff-area-files\">","</div>","\n    </div>\n    <div class=\"button-bar\">","\n      <button class=\"button-patch patch-apply button-primary exit\" disabled=\"disabled\">Revert to Right</button>","        ","\n      <button class=\"button-patch patch-apply-save exit\" disabled=\"disabled\">Revert &amp; Save</button>","\n      <button class=\"exit\">Done</button>\n    </div>","","","\n    <div class=\"dialog-content\">\n      <div class=\"diff-bottom-tall\">\n        ","\n        <div class=\"diff-area-files\">","</div>\n      </div>\n    </div>\n    <div class=\"button-bar\">\n      <button class=\"exit\">Done</button>\n    </div>","","\n    <div class=\"dialog-content\">\n      <div class=\"diff-top\">\n        ","\n      </div>\n      <div class=\"diff-bottom-short\">\n        <div class=\"diff-area-full diff-area-short\">","</div>\n      </div>\n    </div>\n    <div class=\"button-bar\">","\n      <button class=\"button-primary exit\" disabled=\"disabled\" id=\"button-file-revert\">Revert to Right</button>","","\n      <button class=\"exit\" disabled=\"disabled\" id=\"button-file-revert-save\">Revert &amp; Save</button>","        <button class=\"exit\">Done</button>\n    </div>","","\n    <div class=\"dialog-content\">\n      <div class=\"diff-bottom-tall\">\n        ","\n        <div class=\"diff-area-files\">","</div>\n      </div>\n    </div>\n    <div class=\"button-bar\">","\n      <button class=\"button-patch patch-apply button-primary exit\" disabled=\"disabled\">Apply Selected Changes</button>","","\n      <button class=\"button-patch patch-apply-save exit\" disabled=\"disabled\">Apply &amp; Save</button>","\n      <button class=\"exit\">Done</button>\n    </div>","","","\n    <div class=\"dialog-content\">\n      <div class=\"diff-top\">\n        <p>\n          The saved version of this file has changed since it was loaded, likely because \n          it was edited by another user or by you in another browser or tab.  \n        </p>\n        <p>\n          Decide how to proceed or view the details of the conflict.\n        </p>\n      </div>\n      <div class=\"diff-bottom-short\">\n        <div class=\"diff-area-full\">","</div>\n      </div>\n    </div>\n    <div class=\"button-bar\">","\n      <button class=\"button exit\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">Save Anyway</button>\n      <button class=\"button-primary exit\">Cancel</button>\n    </div>","\n   \n  <!-- Setup the dialog for all modes -->","\n  \n  <h3 class=\"dialog-title\">","</h3>\n  <div id=\"diff-dialog\">\n    <span class=\"loader-square\"></span>\n  </div>","","\n\n\n<!-- Help dialogs -->","\n  <h3 class=\"dialog-title\">App Editor Keyboard Shortcuts</h3>\n  <div class=\"dialog-content\">\n    <div class=\"dialog-inset\">\n      <table>","\n        <tr>\n          <th>","</th>\n          <td>","</td>\n        </tr>","\n      </table>\n    </div>\n  </div>","","\n  <h3 class=\"dialog-title\">About App Editor</h3>\n  <iframe class=\"dialog-content\" id=\"dialog-aboutappeditor\" src=\"","\"></iframe>\n  <div class=\"button-bar\">\n    <b>Version: </b>\n    <span>","</span>\n    <span>- ","</span>\n  </div>","","","\n  <a class=\"doc-view-link\" href=\"","\" target=\"_blank\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">Open in a new window</a>\n  <iframe class=\"dialog-content\" src=\"","\"></iframe>",""],"debug_locs":[1,1,1,1,1,1,7,7,7,7,7,7,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,19,19,19,19,19,19,19,19,23,23,23,23,23,23,23,26,26,26,26,26,29,29,29,29,31,31,31,31,31,31,31,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,37,37,37,37,37,38,40,40,40,40,40,44,44,44,44,44,44,44,44,46,46,46,46,49,49,49,49,49,49,49,49,53,53,53,53,53,53,53,54,54,55,56,57,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,65,65,65,65,65,65,65,65,65,65,65,65,65,65,65,65,65,65,65,67,67,67,67,67,67,67,67,67,67,67,67,67,68,68,68,73,73,73,73,73,73,73,77,77,77,77,77,77,77,77,87,87,87,87,87,87,87,87,87,87,87,87,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,127,127,127,127,127,128,128,128,128,129,129,129,141,141,141,141,141,141,141,141,141,141,141,141,141,141,141,141,141,141,144,144,144,144,144,144,144,144,148,148,148,148,148,148,148,154,154,154,154,154,154,154,154,155,155,156,157,158,159,160,165,165,165,165,165,165,165,171,171,171,171,171,171,171,171,171,171,171,171,171,171,171,171,171,171,171,171,171,171,172,172,172,173,173,173,173,173,173,182,182,182,182,182,182,182,182,182,182,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,198,198,198,198,199,199,199,200,201,202,203,204,205,206,207,208,208,208,208,208,208,209,209,209,209,210,210,211,212,215,215,215,215,215,216,216,217,218,222,222,222,222,222,222,225,225,225,230,230,230,230,230,230,230,230,230,230,230,230,230,230,230,230,230,230,230,230,230,230,230,231,231,231,231,231,231,231,231,234,234,234,234,234,236,236,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,253,253,253,253,258,258,258,258,258,258,258,258,258,258,258,258,259,259,259,259,259,260,260,260,262,262,262,262,262,262,262,272,272,272,272,272,272,272,272,272,272,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,304,304,304,304,304,305,305,305,305,306,306,306,310,310,310,310,310,310,318,318,318,318,318,318,318,318,318,318,318,318,318,318,321,321,321,321,321,321,321,321,326,326,326,326,326,326,326,328,328,328,328,328,328,330,330,330,331,332,333,334,335,336,337,338,339,339,340,340,340,340,341,341,341,341,341,341,341,342,342,342,347,347,347,347,347,347,347,347,347,348,348,348,348,348,350,350,350,350,350,350,351,351,351,351,351,363,363,363,363,363,363,363,363,363,363,363,363,363,363,363,363,364,364,364,364,364,365,365,365,365,365,366,366,366,366,366,368,368,368,368,368,371,371,371,371,371,372,373,374,375,376,376,376,377,377,377,380,380,380,380,380,380,380,380,380,381,381,381,381,381,381,381,384,384,384,384,384,387,387,387,387,387,387,387,387,387,388,388,388,388,388,388,388,389,389,389,389,389,389,393,393,393,393,393,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,446,446,446,446,446,448,448,448,448,448,448,449,449,449,450,450,450,450,450,450,452,452,452,452,453,453,454,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,468,468,468,469,469,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,471,471,471,471,471,471,471,471,471,471,471,471,472,472,472,473,473,473,474,475,475,475,475,476,476,476,477,477,477,478,478,478,479,479,479,480,480,480,481,481,481,482,482,482,482,482,485,485,485,485,485,485,485,485,486,486,486,486,486,486,486,489,489,489,489,489,489,489,489,489,490,490,490,491,491,491,491,491,491,493,493,493,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,516,517,518,519,520,521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536,537,538,539,540,541,542,543,544,545,546,547,548,549,550,551,552,553,554,555,556,556,556,556,556,556,557,557,557,557,558,558,558,559,560,561,562,563,564,565,566,567,568,569,570,570,570,570,570,570,572,572,572,572,572,572,573,573,573,574,574,574,574,574,574,576,576,576,576,577,577,578,578,578,579,580,581,582,582,582,582,582,582,583,583,583,583,583,583,585,585,585,585,586,586,586,587,587,587,587,587,587,590,590,590,590,590,590,610,610,610,610,610,610,610,610,610,610,610,610,610,610,610,610,610,610,610,610,610,610,610,611,611,611,612,612,612,613,613,613,613,613,616,616,616,616,616,616,616,617,617,617,617,617,620,620,620,620,620,621,622,623,624,625,626,627,628,629,630,631,632,633,634,635,636,637,638,639,640,640,640,640,640,641,641,641,641,644,644,644,644,644,645,645,645,651,651,651,651,651,651,651,651,651,651,653,653,653,653,656,656,656,656,656,659,659,659,659,659,663,663,663,663,663,663,663,663,664,664,664,664,664,666,666,666,666,666,666,668,668,668,668,671,671,671,671,671,672,672,672,676,676,676,676,676,676,676,676,677,677,677,677,677,680,680,680,680,680,680,680,682,682,682,682,683,683,684,685,697,697,697,697,697,697,697,697,697,697,697,697,697,697,701,701,701,701,701,701,701,701,701,701,704,704,704,704,704,704,704,707,707,707,707,708,709,710,711,712,713,714,715,716,717,718,719,720,721,722,723,724,725,726,727,728,729,730,731,732,733,734,735,736,737,738,740,740,740,740,744,744,744,744,744,744,745,746,747,748,749,751,751,751,751,751,751,754,754,754,754,754,754,754,759,759,759,759,759,759,759,759,760,760,760,760,761,761,761,762,762,762,762,762,762,766,766,766,766,766,766,766,766,766,768,768,768,768,770,770,770,770,773,773,773,773,773,774,774,774,776,776,776,776,776,776,776,778,778,778,778,779,779,779,779,779,779,779,779,779,780,780,780,781,781,781,781,781,781,782,782,782,782],"output_mode":"html"}}
});
}

/** menus **/
if (jQuery) {
jQuery(window).trigger('acre.template.register', {pkgid: '//5b.appeditor.site.tags.svn.freebase-site.googlecode.dev/menus', source: {def: (function () {// mjt.def=rawmain()
var rawmain = function () {
var __pkg = this.tpackage;
var exports = this.exports;
var __ts=__pkg._template_fragments;
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[0];                               // 
                                                  // 
                                                  // <!-- Your Apps Menu -->
// mjt.def=apps(auto_open)
var apps = function (auto_open) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[1];                               // 

    var user = ui.get_user();
    var apps = ui.get_recents('apps');
    var num_apps = Math.min(apps.length, 10);
  
__m[__n++]=__ts[2];                               // 
if (user) {
var onclick_cb_1 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_1] = function (event) {
ui.do_show_dialog('new_app')}
__m[__n++]=__ts[3];                               // 
                                                  //   <div class="section selectable" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_1);
__m[__n++]=__ts[4];                               // .apply(this, [event])">
                                                  //     New App...
                                                  //   </div>
}
__m[__n++]=__ts[5];                               // 
var onclick_cb_2 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_2] = function (event) {
ui.do_acre_home_link('/apps')}
__m[__n++]=__ts[6];                               // 
                                                  //   <div class="section selectable" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_2);
__m[__n++]=__ts[7];                               // .apply(this, [event])">      
                                                  //     App Directory...     
                                                  //   </div>
if (ui.get_user()) {
__m[__n++]=__ts[8];                               // 
                                                  //   <div class="section selectable" id="your-apps-menu-item">      
                                                  //     <div id="your-apps-opener"><img id="your-apps-loader" style="display:none;" src="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.url_for('loader-tinyorange.gif'));
__m[__n++]=__ts[9];                               // "></div>
                                                  //     Your Apps 
                                                  //   </div>
}
else {
__m[__n++]=__ts[10];                              // 
                                                  //   <div class="section">
                                                  //     <h3>Your Apps</h3>
                                                  //     <a href="
__m[__n++]=__pkg.runtime.make_attr_safe($('#nav-signin').attr('href'));
__m[__n++]=__ts[11];                              // " title="Sign in to your Freebase account">Sign in</a> to show your apps here.
                                                  //   </div>
}
__m[__n++]=__ts[12];                              // 
                                                  // 
                                                  //   <div class="section last"> 
                                                  //     <h3>Recent Apps</h3>
if ((num_apps > 0)) {
__m[__n++]=__ts[13];                              // 
                                                  //     <ul>
for (var i=0; i < num_apps; i++) {
__m[__n++]=__ts[14];                              // 
                                                  //       <li>

          var app = apps[i];
          var match = app.path.match(/\.dev\.([a-z0-9\.\-]*)\.$/);
          var graph = match ? match[1] : null;
        
__m[__n++]=__ts[15];                              // 
                                                  //         <a apppath="
__m[__n++]=__pkg.runtime.make_attr_safe(app.path);
__m[__n++]=__ts[16];                              // " class="app-link" href="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_appeditor_url(app.path));
__m[__n++]=__ts[17];                              // " title="
__m[__n++]=__pkg.runtime.make_attr_safe(app.path);
__m[__n++]=__ts[18];                              // ">
__m[__n++]=app.name;
__m[__n++]=__ts[19];                              // </a>
if (graph) {
__m[__n++]=__ts[20];                              // 
                                                  //         <em>on 
__m[__n++]=graph;
__m[__n++]=__ts[21];                              // </em>
}
__m[__n++]=__ts[22];                              // 
                                                  //       </li>
}
__m[__n++]=__ts[23];                              // 
                                                  //     </ul>
}
else {
__m[__n++]=__ts[24];                              // 
                                                  //     <div>If you work on multiple apps, recently opened ones will appear here.</div>
}
__m[__n++]=__ts[25];                              // 
                                                  //   </div>
__pkg.runtime.ondomready(function () {

    ui.do_setup_submenu('your-apps-menu-item', 'yourapps');
    if (auto_open) {
      $('#your-apps-menu-item').trigger('mouseenter'); 
    }
  
}, this);
__m[__n++]=__ts[26];                              // 
return __m;
};
apps = __pkg.runtime.tfunc_factory("apps(auto_open)", apps, __pkg, undefined, false);
exports.apps = apps;
apps.source_microdata = null;
__m[__n++]=__ts[27];                              // 
// mjt.def=yourapps()
var yourapps = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[28];                              // 

      var user_apps = ui.get_store().get_user_apps();
      /* refresh list in the background */
      ui.get_store().t_refresh_user_apps();
    
__m[__n++]=__ts[29];                              // 
if (user_apps.length === 0) {
__m[__n++]=__ts[30];                              // 
                                                  //     <p class="menu-message">Apps you create or clone will appear here.</p>
}
else {
__m[__n++]=__ts[31];                              // 
                                                  //     <ul>
__pkg.runtime.foreach(this, (user_apps), function (app_index_1, app) {
var once_1 = 1;
while (once_1) {
__m[__n++]=__ts[32];                              // 
                                                  //       <li>
                                                  //         <a apppath="
__m[__n++]=__pkg.runtime.make_attr_safe(app.path);
__m[__n++]=__ts[33];                              // " class="app-link" href="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_appeditor_url(app.path));
__m[__n++]=__ts[34];                              // " title="
__m[__n++]=__pkg.runtime.make_attr_safe(app.path);
__m[__n++]=__ts[35];                              // ">
                                                  //           
__m[__n++]=app.name;
__m[__n++]=__ts[36];                              // 
                                                  //         </a>
                                                  //       </li>
once_1--;
} /* while once */
return once_1 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[37];                              // 
                                                  //     </ul>
}
__m[__n++]=__ts[38];                              // 
__pkg.runtime.ondomready(function () {

      var submenu = $('#menu-yourapps');
      var submenu_height = Math.min(submenu.height(), $(window).height() - submenu.offset().top - 25);
      submenu.height(submenu_height).css('visibility', 'visible');
      
      $('#your-apps-loader').hide();
    
}, this);
__m[__n++]=__ts[39];                              // 
return __m;
};
yourapps = __pkg.runtime.tfunc_factory("yourapps()", yourapps, __pkg, undefined, false);
exports.yourapps = yourapps;
yourapps.source_microdata = null;
__m[__n++]=__ts[40];                              // 
                                                  // 
                                                  // 
                                                  // <!-- File Menu -->
// mjt.def=fileactions()
var fileactions = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[41];                              // 

    var app = ui.get_app();
    var file = ui.get_file();
    var user = ui.get_user();
    var writable = app ? app.is_writable() : false;
  
__m[__n++]=__ts[42];                              // 
if (writable) {
__m[__n++]=__ts[43];                              // 
                                                  //   <div class="section">
                                                  //     <h3>Name</h3>
                                                  //     <fieldset class="center">
                                                  //       <label for="file-name">File name </label>
                                                  //       <input class="form-textbox" id="file-name" type="text" value="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_file().get_name());
__m[__n++]=__ts[44];                              // ">
if (writable) {
__m[__n++]=__ts[45];                              // 
                                                  //       <button class="exit" disabled="disabled" id="button-name">Rename</button>
}
__m[__n++]=__ts[46];                              // 
                                                  //     </fieldset>
                                                  //   </div>
}
__m[__n++]=__ts[47];                              // 
if (writable) {
__m[__n++]=__ts[48];                              // 
                                                  //   <div class="section">
                                                  //     <h3>Type</h3>
                                                  //     <fieldset id="fieldset-metadata">
// mjt.def=metadata_section()
var metadata_section = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[49];                              // <div
if (this.subst_id) { __m[__n++]=__pkg.runtime.bless(' id="' + this.subst_id + '"'); }
__m[__n++]=__ts[50];                              // >

          var acre_handlers = ui.get_store().get_acre_handlers();

          var sup_acre_handlers = [];
          for (var key in acre_handlers) {
            if ($.inArray(file.get_mime_type(), ui.get_store().get_supported_mime_types(key)) != -1) {
              sup_acre_handlers.push(acre_handlers[key]);
            }
          }
          var sup_mime_types = ui.get_store().get_supported_mime_types(file.get_acre_handler());
        
__m[__n++]=__ts[51];                              // 
                                                  //         <div class="form-row">
                                                  //           <label for="file-handler">Acre type </label>
                                                  //           <select
var dattrs_1 = (sup_acre_handlers.length > 1 ? {} : {'disabled':'disabled'});
var sattrs_1 = {};
if (!("id" in dattrs_1)) {__m[__n++]=__ts[52];                              //  id="file-handler"
 }
for (var di_1 in dattrs_1) {
__m[__n++]=' ' + di_1;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_1[di_1]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[53];                              // >
__pkg.runtime.foreach(this, (sup_acre_handlers), function (handler_index_1, handler) {
var once_2 = 1;
while (once_2) {
__m[__n++]=__ts[54];                              // 
                                                  //             <option
var dattrs_2 = ((handler.key === file.get_acre_handler())?{'selected':''}:{});
var sattrs_2 = {};
if (!("value" in dattrs_2)) {__m[__n++]=__ts[55];                              //  value="
__m[__n++]=__pkg.runtime.make_attr_safe(handler.key);
__m[__n++]=__ts[56];                              // "
 }
for (var di_2 in dattrs_2) {
__m[__n++]=' ' + di_2;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_2[di_2]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[57];                              // >
                                                  //                 
__m[__n++]=handler.name;
__m[__n++]=__ts[58];                              // 
                                                  //             </option>
once_2--;
} /* while once */
return once_2 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[59];                              // 
                                                  //           </select>
                                                  //         </div>
                                                  //         <div class="form-row">
                                                  //           <label for="file-mimetype">MIME type </label>
                                                  //           <select
var dattrs_3 = (!file.get_editor_supported_features('mimetype_change') || (sup_mime_types.length < 2) ? {}:{});
var sattrs_3 = {};
if (!("id" in dattrs_3)) {__m[__n++]=__ts[60];                              //  id="file-mimetype"
 }
for (var di_3 in dattrs_3) {
__m[__n++]=' ' + di_3;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_3[di_3]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[61];                              // >
__pkg.runtime.foreach(this, (sup_mime_types), function (sup_mime_type_index_1, sup_mime_type) {
var once_3 = 1;
while (once_3) {
__m[__n++]=__ts[62];                              // 
                                                  //             <option
var dattrs_4 = ((sup_mime_type === file.get_mime_type())?{'selected':''}:{});
var sattrs_4 = {};
if (!("value" in dattrs_4)) {__m[__n++]=__ts[63];                              //  value="
__m[__n++]=__pkg.runtime.make_attr_safe(sup_mime_type);
__m[__n++]=__ts[64];                              // "
 }
for (var di_4 in dattrs_4) {
__m[__n++]=' ' + di_4;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_4[di_4]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[65];                              // >
                                                  //               
__m[__n++]=sup_mime_type;
__m[__n++]=__ts[66];                              // 
                                                  //             </option>
once_3--;
} /* while once */
return once_3 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[67];                              // 
                                                  //           </select>
                                                  //         </div>
__pkg.runtime.ondomready(function () {

          $('#file-handler').change(function(){
            ui.do_file_set_acre_handler($(':selected',this).val());
            $('#metadata-section').acre(metadata_section());
          });

          $('#file-mimetype').change(function(){
            ui.do_file_set_mime_type($(':selected',this).val());
            $('#metadata-section').acre(metadata_section());
          });
        
}, this);
__m[__n++]=__ts[68];                              // 
                                                  //       </div>
return __m;
};
metadata_section = __pkg.runtime.tfunc_factory("metadata_section()", metadata_section, __pkg, undefined, false);
metadata_section.source_microdata = null;
__m[__n++]=__ts[69];                              // 
                                                  //       <div id="metadata-section">
__m[__n++]=(metadata_section());
__m[__n++]=__ts[70];                              // </div>
                                                  //     </fieldset>
                                                  //   </div>
}
else {
__m[__n++]=__ts[71];                              // 
                                                  //   <div class="section">
                                                  //     <h3>Type</h3>
                                                  //     <fieldset id="fieldset-metadata">
                                                  //       <div class="form-row">
                                                  //         <label for="file-handler">Acre type:</label>
                                                  //         <span class="form-static">
__m[__n++]=(file.get_acre_handler());
__m[__n++]=__ts[72];                              // </span>
                                                  //       </div>            
                                                  //       <div class="form-row">            
                                                  //         <label for="file-mimetype">MIME type: </label>
                                                  //         <span class="form-static">
__m[__n++]=(file.get_mime_type());
__m[__n++]=__ts[73];                              // </span>
                                                  //       </div>              
                                                  //     </fieldset>
                                                  //   </div>
}
__m[__n++]=__ts[74];                              // 
                                                  //   <div class="section">
                                                  //     <h3>Validate</h3>
var onclick_cb_3 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_3] = function (event) {
ui.do_file_check()}
__m[__n++]=__ts[75];                              // 
                                                  //     <button
var dattrs_5 = (ui.get_file_check_options().useful===1?{}:{'disabled':'disabled'});
var sattrs_5 = {};
if (!("title" in dattrs_5)) {__m[__n++]=__ts[76];                              //  title="
__m[__n++]=__pkg.runtime.make_attr_safe(mjt.bless(ui.shortcut.get_keys('Check Syntax')));
__m[__n++]=__ts[77];                              // "
 }
if (!("onclick" in dattrs_5)) {__m[__n++]=__ts[78];                              //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_3);
__m[__n++]=__ts[79];                              // .apply(this, [event])"
 }
for (var di_5 in dattrs_5) {
__m[__n++]=' ' + di_5;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_5[di_5]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[80];                              // >
                                                  //       Check Syntax</button>
                                                  //   </div>
                                                  //   <div class="section">
                                                  //     <h3>History</h3>
                                                  //     <fieldset>
if (writable) {
var onclick_cb_4 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_4] = function (event) {
ui.do_file_revert_to_saved()}
__m[__n++]=__ts[81];                              // 
                                                  //       <button
var dattrs_6 = (!file.is_dirty()?{'disabled':'disabled'}:{});
var sattrs_6 = {};
if (!("class" in dattrs_6)) {__m[__n++]=__ts[82];                              //  class="exit"
 }
if (!("onclick" in dattrs_6)) {__m[__n++]=__ts[83];                              //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_4);
__m[__n++]=__ts[84];                              // .apply(this, [event])"
 }
for (var di_6 in dattrs_6) {
__m[__n++]=' ' + di_6;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_6[di_6]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[85];                              // >
                                                  //         Revert to Saved</button>
}
__m[__n++]=__ts[86];                              //  
var onclick_cb_5 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_5] = function (event) {
ui.do_show_dialog('diff_patch',['file_history', ui.get_file().get_name()]);}
__m[__n++]=__ts[87];                              // 
                                                  //       <button onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_5);
__m[__n++]=__ts[88];                              // .apply(this, [event])">
                                                  //         Review Older Versions</button>
                                                  //     </fieldset>
                                                  //   </div>
                                                  //   <div class="section last">
                                                  //     <h3>Actions</h3>
var onclick_cb_6 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_6] = function (event) {
ui.do_show_dialog('save_file_as')}
__m[__n++]=__ts[89];                              // 
                                                  //     <button
var dattrs_7 = (ui.get_user()?{}:{'disabled':'disabled'});
var sattrs_7 = {};
if (!("onclick" in dattrs_7)) {__m[__n++]=__ts[90];                              //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_6);
__m[__n++]=__ts[91];                              // .apply(this, [event])"
 }
for (var di_7 in dattrs_7) {
__m[__n++]=' ' + di_7;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_7[di_7]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[92];                              // >
                                                  //       Clone this File</button>
var onclick_cb_7 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_7] = function (event) {
ui.do_show_dialog('delete_file',[ui.get_file().get_name()]);}
__m[__n++]=__ts[93];                              // 
                                                  //     <button
var dattrs_8 = (writable?{}:{'disabled':'disabled'});
var sattrs_8 = {};
if (!("onclick" in dattrs_8)) {__m[__n++]=__ts[94];                              //  onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_7);
__m[__n++]=__ts[95];                              // .apply(this, [event])"
 }
for (var di_8 in dattrs_8) {
__m[__n++]=' ' + di_8;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_8[di_8]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[96];                              // >
                                                  //       Delete this File</button>
                                                  //   </div>
__pkg.runtime.ondomready(function () {
      
    ui.watch_inputs('name', {
      inputs: {
        'file-name' : ui.get_file().get_name()
      },
      change: function(fields){
        return ((fields['file-name'] !== "") ? fields : false);
      },
      submit: function(inputs) { 
        ui.do_file_move(inputs['file-name']);
      }
    });
  
}, this);
__m[__n++]=__ts[97];                              // 
return __m;
};
fileactions = __pkg.runtime.tfunc_factory("fileactions()", fileactions, __pkg, undefined, false);
exports.fileactions = fileactions;
fileactions.source_microdata = null;
__m[__n++]=__ts[98];                              // 
                                                  // 
                                                  // 
                                                  // <!-- Editor Menu -->
// mjt.def=editoroptions()
var editoroptions = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[99];                              // 

    var has_options = false;
    var store = ui.get_store();
    var app = ui.get_app();
    var file = ui.get_file();
    var is_user = ui.get_user();

    var writable = is_user && app.is_writable();
  
__m[__n++]=__ts[100];                             // 
if (file.get_editor_supported_features('hotswap')) {
__m[__n++]=__ts[101];                             // 
                                                  //   <div class="section">
var has_options = true;
__m[__n++]=__ts[102];                             // 
                                                  //     <h3>Text Editor</h3>
                                                  //     <fieldset>
__pkg.runtime.foreach(this, (EDITORS), function (ed_class, ed) {
var once_4 = 1;
while (once_4) {
if (ed.supports.hotswap) {
__m[__n++]=__ts[103];                             // 
                                                  //       <div class="line">
                                                  //         <input
var dattrs_9 = (ui.get_editor_prefs('texteditor') ===  ed_class ? {'checked':'checked'} : {});
var sattrs_9 = {};
if (!("id" in dattrs_9)) {__m[__n++]=__ts[104];                             //  id="edopt-texteditor-
__m[__n++]=__pkg.runtime.make_attr_safe(ed_class);
__m[__n++]=__ts[105];                             // "
 }
if (!("name" in dattrs_9)) {__m[__n++]=__ts[106];                             //  name="edopt-texteditor"
 }
if (!("type" in dattrs_9)) {__m[__n++]=__ts[107];                             //  type="radio"
 }
if (!("value" in dattrs_9)) {__m[__n++]=__ts[108];                             //  value="
__m[__n++]=__pkg.runtime.make_attr_safe(ed_class);
__m[__n++]=__ts[109];                             // "
 }
for (var di_9 in dattrs_9) {
__m[__n++]=' ' + di_9;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_9[di_9]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[110];                             // >
                                                  //         <label for="edopt-texteditor-
__m[__n++]=__pkg.runtime.make_attr_safe(ed_class);
__m[__n++]=__ts[111];                             // ">
__m[__n++]=ed.name;
__m[__n++]=__ts[112];                             // </label><br>
                                                  //       </div>
}
once_4--;
} /* while once */
return once_4 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[113];                             // 
                                                  //     </fieldset>
                                                  //   </div>
}
__m[__n++]=__ts[114];                             // 
if (file.get_editor_supported_features('margin')) {
__m[__n++]=__ts[115];                             // 
                                                  //   <div class="section">
var has_options = true;
__m[__n++]=__ts[116];                             //  
                                                  //     <h3>Line Numbers</h3>
                                                  //     <fieldset>
                                                  //       <input
var dattrs_10 = (ui.get_editor_prefs('margin') ? {'checked':'checked'} : {});
var sattrs_10 = {};
if (!("id" in dattrs_10)) {__m[__n++]=__ts[117];                             //  id="edopt-margin-y"
 }
if (!("name" in dattrs_10)) {__m[__n++]=__ts[118];                             //  name="edopt-margin"
 }
if (!("type" in dattrs_10)) {__m[__n++]=__ts[119];                             //  type="radio"
 }
if (!("value" in dattrs_10)) {__m[__n++]=__ts[120];                             //  value="1"
 }
for (var di_10 in dattrs_10) {
__m[__n++]=' ' + di_10;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_10[di_10]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[121];                             // > <label for="edopt-margin-y">yes</label>
                                                  //       <input
var dattrs_11 = (ui.get_editor_prefs('margin') ? {} : {'checked':'checked'});
var sattrs_11 = {};
if (!("id" in dattrs_11)) {__m[__n++]=__ts[122];                             //  id="edopt-margin-n"
 }
if (!("name" in dattrs_11)) {__m[__n++]=__ts[123];                             //  name="edopt-margin"
 }
if (!("type" in dattrs_11)) {__m[__n++]=__ts[124];                             //  type="radio"
 }
if (!("value" in dattrs_11)) {__m[__n++]=__ts[125];                             //  value="0"
 }
for (var di_11 in dattrs_11) {
__m[__n++]=' ' + di_11;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_11[di_11]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[126];                             // > <label for="edopt-margin-y">no</label>
                                                  //     </fieldset>
                                                  //   </div>
}
__m[__n++]=__ts[127];                             // 
if (file.get_editor_supported_features('softwrap')) {
__m[__n++]=__ts[128];                             // 
                                                  //   <div class="section">
var has_options = true;
__m[__n++]=__ts[129];                             // 
                                                  //     <h3>Soft Wrap</h3>
                                                  //     <fieldset>
                                                  //       <input
var dattrs_12 = (ui.get_editor_prefs('softwrap') ? {'checked':'checked'} : {});
var sattrs_12 = {};
if (!("id" in dattrs_12)) {__m[__n++]=__ts[130];                             //  id="edopt-softwrap-y"
 }
if (!("name" in dattrs_12)) {__m[__n++]=__ts[131];                             //  name="edopt-softwrap"
 }
if (!("type" in dattrs_12)) {__m[__n++]=__ts[132];                             //  type="radio"
 }
if (!("value" in dattrs_12)) {__m[__n++]=__ts[133];                             //  value="1"
 }
for (var di_12 in dattrs_12) {
__m[__n++]=' ' + di_12;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_12[di_12]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[134];                             // > <label for="edopt-softwrap-y">yes</label>
                                                  //       <input
var dattrs_13 = (ui.get_editor_prefs('softwrap') ? {} : {'checked':'checked'});
var sattrs_13 = {};
if (!("id" in dattrs_13)) {__m[__n++]=__ts[135];                             //  id="edopt-softwrap-n"
 }
if (!("name" in dattrs_13)) {__m[__n++]=__ts[136];                             //  name="edopt-softwrap"
 }
if (!("type" in dattrs_13)) {__m[__n++]=__ts[137];                             //  type="radio"
 }
if (!("value" in dattrs_13)) {__m[__n++]=__ts[138];                             //  value="0"
 }
for (var di_13 in dattrs_13) {
__m[__n++]=' ' + di_13;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_13[di_13]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[139];                             // > <label for="edopt-softwrap-n">no</label>
                                                  //     </fieldset>
                                                  //   </div>
}
__m[__n++]=__ts[140];                             // 
if (file.get_editor_supported_features('codeassist')) {
__m[__n++]=__ts[141];                             // 
                                                  //   <div class="section last">
var has_options = true;
__m[__n++]=__ts[142];                             // 
                                                  //     <h3>Automatic Code Assist</h3>
                                                  //     <fieldset>
                                                  //       <input
var dattrs_14 = (ui.get_editor_prefs('dotTrigger') ? {'checked':'checked'} : {});
var sattrs_14 = {};
if (!("id" in dattrs_14)) {__m[__n++]=__ts[143];                             //  id="edopt-dotTrigger-y"
 }
if (!("name" in dattrs_14)) {__m[__n++]=__ts[144];                             //  name="edopt-dotTrigger"
 }
if (!("type" in dattrs_14)) {__m[__n++]=__ts[145];                             //  type="radio"
 }
if (!("value" in dattrs_14)) {__m[__n++]=__ts[146];                             //  value="1"
 }
for (var di_14 in dattrs_14) {
__m[__n++]=' ' + di_14;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_14[di_14]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[147];                             // > <label for="edopt-dotTrigger-y">yes</label>
                                                  //       <input
var dattrs_15 = (ui.get_editor_prefs('dotTrigger') ? {} : {'checked':'checked'});
var sattrs_15 = {};
if (!("id" in dattrs_15)) {__m[__n++]=__ts[148];                             //  id="edopt-dotTrigger-n"
 }
if (!("name" in dattrs_15)) {__m[__n++]=__ts[149];                             //  name="edopt-dotTrigger"
 }
if (!("type" in dattrs_15)) {__m[__n++]=__ts[150];                             //  type="radio"
 }
if (!("value" in dattrs_15)) {__m[__n++]=__ts[151];                             //  value="0"
 }
for (var di_15 in dattrs_15) {
__m[__n++]=' ' + di_15;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_15[di_15]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[152];                             // > <label for="edopt-dotTrigger-n">no</label>
                                                  //     </fieldset>
                                                  //   </div>
}
__m[__n++]=__ts[153];                             // 
if (file.get_editor_supported_features('emql')) {
__m[__n++]=__ts[154];                             // 
                                                  //   <div class="section last">
var has_options = true;
__m[__n++]=__ts[155];                             // 
                                                  //     <h3>Enable MQL Extensions (experimental)</h3>
                                                  //     <fieldset>
                                                  //       <input
var dattrs_16 = (ui.get_editor_prefs('emql') ? {'checked':'checked'} : {});
var sattrs_16 = {};
if (!("id" in dattrs_16)) {__m[__n++]=__ts[156];                             //  id="edopt-emql-y"
 }
if (!("name" in dattrs_16)) {__m[__n++]=__ts[157];                             //  name="edopt-emql"
 }
if (!("type" in dattrs_16)) {__m[__n++]=__ts[158];                             //  type="radio"
 }
if (!("value" in dattrs_16)) {__m[__n++]=__ts[159];                             //  value="1"
 }
for (var di_16 in dattrs_16) {
__m[__n++]=' ' + di_16;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_16[di_16]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[160];                             // > <label for="edopt-emql-y">yes</label>
                                                  //       <input
var dattrs_17 = (ui.get_editor_prefs('emql') ? {} : {'checked':'checked'});
var sattrs_17 = {};
if (!("id" in dattrs_17)) {__m[__n++]=__ts[161];                             //  id="edopt-emql-n"
 }
if (!("name" in dattrs_17)) {__m[__n++]=__ts[162];                             //  name="edopt-emql"
 }
if (!("type" in dattrs_17)) {__m[__n++]=__ts[163];                             //  type="radio"
 }
if (!("value" in dattrs_17)) {__m[__n++]=__ts[164];                             //  value="0"
 }
for (var di_17 in dattrs_17) {
__m[__n++]=' ' + di_17;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_17[di_17]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[165];                             // > <label for="edopt-emql-n">no</label>
                                                  //     </fieldset>
                                                  //   </div>
}
__m[__n++]=__ts[166];                             // 
if (!has_options) {
__m[__n++]=__ts[167];                             // 
                                                  //   <div>
                                                  //     <p style="margin:10px">
                                                  //       No configuration options for this file type. 
                                                  //     </p>
                                                  //   </div>
}
__m[__n++]=__ts[168];                             // 
__pkg.runtime.ondomready(function () {

    $("#menu-editoroptions input[type='radio']").click(function(){
      var name = $(this).attr('name').split('edopt-')[1];
      var pref = {};
      pref[name] = $(this).val();
      ui.set_editor_prefs(pref);
      ui.do_refresh_file();
      ui.do_hide_overlays();
    });
  
}, this);
__m[__n++]=__ts[169];                             // 
return __m;
};
editoroptions = __pkg.runtime.tfunc_factory("editoroptions()", editoroptions, __pkg, undefined, false);
exports.editoroptions = editoroptions;
editoroptions.source_microdata = null;
__m[__n++]=__ts[170];                             // 
                                                  // 
                                                  // 
                                                  // <!-- Help Menu -->
// mjt.def=help()
var help = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[171];                             // 
                                                  //   <div id="help-menu-content">
                                                  //   <div class="section">
                                                  //     <h3>Documentation</h3>
                                                  //     <ul>
                                                  //       <li>
var onclick_cb_8 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_8] = function (event) {
return ui.do_show_dialog('keyboard_shortcuts')}
__m[__n++]=__ts[172];                             // <a href="#0" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_8);
__m[__n++]=__ts[173];                             // .apply(this, [event])">
                                                  //         Keyboard Shortcuts</a></li>
                                                  //       <li>
var onclick_cb_9 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_9] = function (event) {
return ui.do_show_dialog('documentation', [ui.get_store().get_freebase_url() + '/docs/iframe/acre_api'])}
__m[__n++]=__ts[174];                             // <a href="#0" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_9);
__m[__n++]=__ts[175];                             // .apply(this, [event])">
                                                  //         Acre API Reference</a></li>
                                                  //       <li>
var onclick_cb_10 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_10] = function (event) {
return ui.do_show_dialog('documentation', [ui.get_store().get_freebase_url() + '/docs/iframe/acre_templates'])}
__m[__n++]=__ts[176];                             // <a href="#0" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_10);
__m[__n++]=__ts[177];                             // .apply(this, [event])">
                                                  //         Acre Template Tag Reference</a></li>
                                                  //       <li>
var onclick_cb_11 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_11] = function (event) {
return ui.do_show_dialog('documentation', [ui.get_store().get_freebase_url() + '/docs/iframe/js_reference'])}
__m[__n++]=__ts[178];                             // <a href="#0" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_11);
__m[__n++]=__ts[179];                             // .apply(this, [event])">
                                                  //         Javascript Reference</a></li>
                                                  //       <li>
var onclick_cb_12 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_12] = function (event) {
return ui.do_show_dialog('documentation', [ui.get_store().get_freebase_url() + '/docs/iframe/mql'])}
__m[__n++]=__ts[180];                             // <a href="#0" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_12);
__m[__n++]=__ts[181];                             // .apply(this, [event])">
                                                  //         MQL Reference Guide</a></li>
                                                  //       <li><a href="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_store().get_freebase_url());
__m[__n++]=__ts[182];                             // /docs/" target="_new">
                                                  //         Freebase Documentation Hub</a></li>
                                                  //     </ul>
                                                  //   </div>
                                                  //   <div class="section">
                                                  //     <h3>Code Search</h3>
                                                  //     <p>
                                                  //       Not sure how to use a particular method or template tag?  See how someone else did!
                                                  //     </p>
                                                  //     <form action="http://codesearch.
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_store().get_acre_host());
__m[__n++]=__ts[183];                             // /" id="codesearch-form" target="_blank">
                                                  //       <fieldset>
                                                  //           <input id="code-search" name="q" type="text">
                                                  //           <button id="button-codesearch">Find Code</button>
                                                  //       </fieldset>
                                                  //     </form>
                                                  //   </div>
                                                  //   <div class="section last">
var onclick_cb_13 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_13] = function (event) {
return ui.do_show_dialog('about_appeditor')}
__m[__n++]=__ts[184];                             // 
                                                  //     <a href="#0" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_13);
__m[__n++]=__ts[185];                             // .apply(this, [event])">About App Editor</a>
                                                  //   </div>
                                                  //   </div>
__pkg.runtime.ondomready(function () {
      
    $("#help-menu-content a").click(function(){
      ui.do_hide_overlays();
    });
  
}, this);
__m[__n++]=__ts[186];                             // 
return __m;
};
help = __pkg.runtime.tfunc_factory("help()", help, __pkg, undefined, false);
exports.help = help;
help.source_microdata = null;
__m[__n++]=__ts[187];                             // 
                                                  // 
                                                  // 
                                                  // <!-- App  menu -->
// mjt.def=appsettings()
var appsettings = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[188];                             // 

    var writable = ui.get_app().is_writable();
  
__m[__n++]=__ts[189];                             // 
var onclick_cb_14 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_14] = function (event) {
ui.do_hide_overlays()}
__m[__n++]=__ts[190];                             // 
                                                  //   <div class="dialog-close" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_14);
__m[__n++]=__ts[191];                             // .apply(this, [event])"></div>
                                                  //   <div class="clear" id="app-settings-section">
                                                  //     <div id="settings-tabs">
                                                  //       <ul id="settings-tabs-bar">
                                                  //         <li class="tab"><a class="settings-tab-link" href="#app_general">Versions</a></li>
                                                  //         <li class="tab"><a class="settings-tab-link" href="#app_changes">Changes</a></li>
                                                  //         <li class="tab"><a class="settings-tab-link" href="#app_authors">Authors</a></li>
if (writable) {
__m[__n++]=__ts[192];                             // 
                                                  //         <li class="tab"><a class="settings-tab-link" href="#app_services">Web Services</a></li>
}
__m[__n++]=__ts[193];                             // 
                                                  //       </ul>
                                                  //       <div class="tabbed-content" id="settings-tab-content">
                                                  //         <div id="app_general"></div>
                                                  //         <div id="app_changes"></div>
                                                  //         <div id="app_authors"></div>
                                                  //         <div id="app_services"></div>
                                                  //       </div>
                                                  //     </div>
                                                  //   </div>
                                                  //   <div class="button-bar">
if (!ui.get_app().is_remote()) {
__m[__n++]=__ts[194];                             // 
                                                  //     <fieldset id="app-clonedelete">
if (ui.get_app().is_author()) {
__m[__n++]=__ts[195];                             // 
                                                  //       <button class="button-primary" id="app-general-listing">
                                                  //         Edit Name &amp; Directory Listing</button>
}
__m[__n++]=__ts[196];                             // 
if (ui.get_user()) {
var onclick_cb_15 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_15] = function (event) {
ui.do_show_dialog('new_app',[true])}
__m[__n++]=__ts[197];                             // 
                                                  //       <button id="app-general-clone" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_15);
__m[__n++]=__ts[198];                             // .apply(this, [event])">
                                                  //         Clone this App</button>
}
__m[__n++]=__ts[199];                             // 
if (writable) {
var onclick_cb_16 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_16] = function (event) {
ui.do_show_dialog('delete_app')}
__m[__n++]=__ts[200];                             // 
                                                  //       <button id="app-general-delete" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_16);
__m[__n++]=__ts[201];                             // .apply(this, [event])">
                                                  //         Delete this App</button>
}
__m[__n++]=__ts[202];                             // 
                                                  //     </fieldset>
}
else {
__m[__n++]=__ts[203];                             // 
                                                  //     <fieldset id="app-clonedelete">
if (ui.get_user()) {
var onclick_cb_17 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_17] = function (event) {
ui.do_show_dialog('new_app',[true])}
__m[__n++]=__ts[204];                             // 
                                                  //       <button id="app-general-clone" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_17);
__m[__n++]=__ts[205];                             // .apply(this, [event])">
                                                  //         Clone this App</button>
}
__m[__n++]=__ts[206];                             // 
                                                  //     </fieldset>
}
__m[__n++]=__ts[207];                             // 
var onclick_cb_18 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_18] = function (event) {
ui.do_hide_overlays()}
__m[__n++]=__ts[208];                             // 
                                                  //     <button onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_18);
__m[__n++]=__ts[209];                             // .apply(this, [event])">Done</button>
                                                  //   </div>
__pkg.runtime.ondomready(function () {

    $('#button-appsettings').addClass('button-open');

    $("#settings-tabs").tabs("#settings-tab-content > div", {
      api: true,
      initialIndex: 0,
      onBeforeClick: function(e, index) {
        var tab_id = $(this.getPanes()[index]).attr("id");
        setTimeout(function(){ $('#'+tab_id).acre(fb.acre.apps.appeditor + "/menus", tab_id); }, 0);
      }
    });
    
    $('#app-general-listing').click(function(){
      window.open(ui.get_app().get_edit_url());
      return false;
    })
  
}, this);
__m[__n++]=__ts[210];                             // 
return __m;
};
appsettings = __pkg.runtime.tfunc_factory("appsettings()", appsettings, __pkg, undefined, false);
exports.appsettings = appsettings;
appsettings.source_microdata = null;
__m[__n++]=__ts[211];                             // 
// mjt.def=app_general()
var app_general = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[212];                             // <div class="tab-body"
if (this.subst_id) { __m[__n++]=__pkg.runtime.bless(' id="' + this.subst_id + '"'); }
__m[__n++]=__ts[213];                             // >

      var writable = ui.get_app().is_writable();
    
__m[__n++]=__ts[214];                             // 
                                                  //         
                                                  //     <div class="tab-section">
                                                  //       <h3>Versions</h3>
                                                  //       <div class="sidebar">
                                                  //         <p>
                                                  //           App authors can create and release new versions of their app any time.
                                                  //         </p>
                                                  //         <p>
                                                  //           <em>Current</em> is always the latest version; all edits are made to Current.  Other versions are read only.
                                                  //         </p>
                                                  //         <p>
                                                  //           <em>Release</em> is the version the app author wants people to use.  Any version can be released, but it's good practice to create and release a version other than Current to prevent development from impacting users. 
                                                  //         </p>
                                                  //       </div>
if (writable) {
__m[__n++]=__ts[215];                             // 
                                                  //       <fieldset id="add-version">
                                                  //         <label for="add-version-key">Create a new version: </label>
                                                  //         <input id="add-version-key" maxlength="10" type="text">
var onclick_cb_19 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_19] = function (event) {
ui.do_app_add_version($('#add-version-key').val())}
__m[__n++]=__ts[216];                             // 
                                                  //         <button id="button-version" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_19);
__m[__n++]=__ts[217];                             // .apply(this, [event])">
                                                  //           Add Version</button>
if (ui.get_app().get_versions().length) {
var onclick_cb_20 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_20] = function (event) {
ui.do_show_dialog('diff_patch',['app_diff']);}
__m[__n++]=__ts[218];                             // 
                                                  //         <button onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_20);
__m[__n++]=__ts[219];                             // .apply(this, [event])">
                                                  //           View Changes</button>
}
__m[__n++]=__ts[220];                             // 
                                                  //       </fieldset>
}
__m[__n++]=__ts[221];                             // 
                                                  //       <div id="app-versions-add">
__m[__n++]=(app_versions_list());
__m[__n++]=__ts[222];                             // </div>
                                                  //     </div>
                                                  // 
                                                  //     <div class="tab-section">

        var app = ui.get_app();
        var name = app.get_name();
        var app_root = app.get_base_url().replace("http://" + name,"").replace("." + app.get_store().get_acre_host(),"");
      
__m[__n++]=__ts[223];                             // 
if (writable) {
__m[__n++]=__ts[224];                             // 
                                                  //       <div class="app-url">
                                                  //         <p>
                                                  //           Your <strong>Dev URL</strong> points to <em>Current:</em>
                                                  //         </p>
                                                  //         <fieldset>
                                                  //             http://<input class="shortfield" id="devurl" maxlength="20" minlength="5" type="text" value="
__m[__n++]=__pkg.runtime.make_attr_safe(name);
__m[__n++]=__ts[225];                             // ">
__m[__n++]=(app_root);
__m[__n++]=__ts[226];                             // .
__m[__n++]=(app.get_acre_host());
__m[__n++]=__ts[227];                             // 
                                                  //           <button disabled="disabled" id="button-devurl">Change URL</button>
                                                  //         </fieldset>
                                                  //       </div>
}
else {
__m[__n++]=__ts[228];                             // 
                                                  //       <div class="app-url">
                                                  //         <p>URL to <em>Current</em> version:</p>
                                                  //         <p><a href="
__m[__n++]=__pkg.runtime.make_attr_safe(app.get_base_url());
__m[__n++]=__ts[229];                             // " target="current">
__m[__n++]=(app.get_base_url());
__m[__n++]=__ts[230];                             // </a></p>
                                                  //       </div>
}
__m[__n++]=__ts[231];                             // 
if (writable) {
__pkg.runtime.ondomready(function () {

        ui.watch_inputs('devurl', {
          inputs: {
            devurl: app.get_name()
          },   
          update_on_submit : true,
          submit: function(inputs){
            ui.do_app_move("//" + inputs['devurl'] + app_root);
          }
        });
      
}, this);
}
__m[__n++]=__ts[232];                             // 
                                                  //     </div>
                                                  //     <div class="tab-section last">
                                                  //       <div class="app-url">
                                                  //         
__m[__n++]=(app_hosts_list());
__m[__n++]=__ts[233];                             // 
                                                  //       </div>
                                                  //     </div>
                                                  //   </div>
return __m;
};
app_general = __pkg.runtime.tfunc_factory("app_general()", app_general, __pkg, undefined, false);
exports.app_general = app_general;
app_general.source_microdata = null;
__m[__n++]=__ts[234];                             // 
// mjt.def=app_hosts_list()
var app_hosts_list = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[235];                             // 

        var app = ui.get_app();
        var writable = app.is_writable();
        var hosts = app.get_hosts();
        var release = app.get_released_version() || 'current';

        var published_regex = /([^.]*)\.freebaseapps\.com$/;
        var pub = null;
        for (var i=0; i < hosts.length; i++) {
          var host = hosts[i];
          if (host.version == release) {
              var re = published_regex.exec(host.host);
              if (re) { 
                pub = re[1];
                break; 
              }
          }
        }
      
__m[__n++]=__ts[236];                             // 
if (writable) {
__m[__n++]=__ts[237];                             // 
                                                  //       <div>
                                                  //         <p>Your <strong>Release URL</strong> points to <em>Release:</em></p>
                                                  //         <fieldset>
                                                  //           http://<input id="puburl" maxlength="20" minlength="5" type="text" value="
__m[__n++]=__pkg.runtime.make_attr_safe(pub || '');
__m[__n++]=__ts[238];                             // ">.
__m[__n++]=(app.get_acre_host());
__m[__n++]=__ts[239];                             //  
                                                  //           <button disabled="disabled" id="button-puburl">
if (pub) {
__m[__n++]=__ts[240];                             // 
                                                  //             <span>Change URL</span>
}
else {
__m[__n++]=__ts[241];                             // 
                                                  //             <span>Choose URL</span>
}
__m[__n++]=__ts[242];                             // 
                                                  //           </button>
                                                  //           <span id="puburl-status"></span>
                                                  //         </fieldset>
if (pub ? hosts.length > 1 : hosts.length > 0) {
__m[__n++]=__ts[243];                             // 
                                                  //         <div>
                                                  //           <h4 class="list-title">Other URLs:</h4>
                                                  //           <table class="edit-list">
__pkg.runtime.foreach(this, (hosts), function (host_index_1, host) {
var once_5 = 1;
while (once_5) {
if (host.host !== pub + '.freebaseapps.com') {
__m[__n++]=__ts[244];                             // 
                                                  //             <tr>
                                                  //               <td><a href="http://
__m[__n++]=__pkg.runtime.make_attr_safe(host.host);
__m[__n++]=__ts[245];                             // " target="_blank">
__m[__n++]=host.host;
__m[__n++]=__ts[246];                             // </a></td>
                                                  //               <td>
if (host.version != release) {
__m[__n++]=__ts[247];                             // <span class="version-bad">
__m[__n++]=host.version;
__m[__n++]=__ts[248];                             // </span>
}
__m[__n++]=__ts[249];                             // </td>
                                                  //             </tr>
}
once_5--;
} /* while once */
return once_5 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[250];                             // 
                                                  //           </table>
                                                  //         </div>
}
__m[__n++]=__ts[251];                             // 
__pkg.runtime.ondomready(function () {
            
          ui.watch_inputs('puburl', {
            inputs : {
              puburl: $('#puburl').val()
            },
            text_delay : 1000,
            update_on_submit : true,
            change : function(inputs) {
              $('#button-puburl').attr('disabled', 'disabled');
              $('#puburl-status').removeClass().html('').addClass('puburl-wait');
              ui.get_store().XhrGet('check_host_availability', { host: inputs['puburl']})
                .enqueue()
                .onready(function(r){
                    $('#button-puburl').removeAttr('disabled');
                    $('#puburl-status').removeClass().addClass('puburl-success').html(r.message); 
                })
                .onerror(function(code, message, info){
                  $('#puburl-status').removeClass().addClass('puburl-fail').html(message);
                });
            },
            submit : function(inputs){
              $('#puburl-status').removeClass().empty();
              ui.do_app_set_host(inputs['puburl']);
            }
          });
        
}, this);
__m[__n++]=__ts[252];                             // 
                                                  //       </div>
}
else {
__m[__n++]=__ts[253];                             // 
                                                  //       <div>
if (pub) {
__m[__n++]=__ts[254];                             // 
                                                  //         <div>
                                                  //           <p>URL to <em>Release</em> version:</p>
if (pub) {
__m[__n++]=__ts[255];                             // 
                                                  //           <p><a href="http://
__m[__n++]=__pkg.runtime.make_attr_safe(pub + '.' + ui.get_app().get_acre_host());
__m[__n++]=__ts[256];                             // " target="release">http://
__m[__n++]=(pub);
__m[__n++]=__ts[257];                             // .
__m[__n++]=(ui.get_app().get_acre_host());
__m[__n++]=__ts[258];                             // </a>
                                                  //           </p>
}
__m[__n++]=__ts[259];                             // 
                                                  //         </div>
}
__m[__n++]=__ts[260];                             // 
                                                  //       </div>
}
__m[__n++]=__ts[261];                             // 
return __m;
};
app_hosts_list = __pkg.runtime.tfunc_factory("app_hosts_list()", app_hosts_list, __pkg, undefined, false);
exports.app_hosts_list = app_hosts_list;
app_hosts_list.source_microdata = null;
__m[__n++]=__ts[262];                             // 
// mjt.def=app_versions_list()
var app_versions_list = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[263];                             // 

        var app = ui.get_app();
        var app_path = app.get_path();
        var writable = app.is_writable();
        var release = app.get_released_version();
        var released_path = release ? app_path.replace("//", "//" + release + ".") : app_path;
        var versions = app.get_versions();
    
        var re = new RegExp('(\\d+)');
        var counter = 1;
        for (var i=0; i< versions.length; i++) { 
          var r = re.exec(versions[i].name);
          if (r && r.length) {
              var cnt = parseInt(r[1], 10);
              if (counter <= cnt) { counter = cnt + 1; }
          }
        }
        
        var first_number = true;
      
__m[__n++]=__ts[264];                             // 
                                                  // 
                                                  //       <div id="app-versions-list">
                                                  //         <table class="edit-list">
                                                  //           <thead>
                                                  //             <tr>
if (release || writable) {
__m[__n++]=__ts[265];                             // 
                                                  //               <th class="center">release</th>
}
__m[__n++]=__ts[266];                             // 
                                                  //               <th class="left">version</th>
                                                  //               <th class="left">snapshot time</th>
if (writable) {
__m[__n++]=__ts[267];                             // 
                                                  //               <th class="center">run on<br>sandbox</th>
}
__m[__n++]=__ts[268];                             // 
                                                  //               <th></th>
if (writable) {
__m[__n++]=__ts[269];                             // 
                                                  //               <th></th>
}
__m[__n++]=__ts[270];                             // 
                                                  //             </tr>
                                                  //           </thead>
                                                  //           <tbody>
                                                  //             <tr class="version-listitem">
if (release || writable) {
__m[__n++]=__ts[271];                             // 
                                                  //               <td class="center">
if (writable) {
__m[__n++]=__ts[272];                             // 
                                                  //                 <input
var dattrs_18 = (released_path == app_path ? {'checked' :'checked'} : {});
var sattrs_18 = {};
if (!("name" in dattrs_18)) {__m[__n++]=__ts[273];                             //  name="version-release"
 }
if (!("type" in dattrs_18)) {__m[__n++]=__ts[274];                             //  type="radio"
 }
if (!("value" in dattrs_18)) {__m[__n++]=__ts[275];                             //  value="current"
 }
for (var di_18 in dattrs_18) {
__m[__n++]=' ' + di_18;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_18[di_18]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[276];                             // >
}
else {
__m[__n++]=__ts[277];                             // 
                                                  //                 <span>
if (released_path == app_path) {
__m[__n++]=__ts[278];                             // <em>✓</em>
}
__m[__n++]=__ts[279];                             // </span>
}
__m[__n++]=__ts[280];                             // 
                                                  //               </td>
}
__m[__n++]=__ts[281];                             // 
                                                  //               <td>
                                                  //                 <a apppath="
__m[__n++]=__pkg.runtime.make_attr_safe(app_path);
__m[__n++]=__ts[282];                             // " class="app-link" href="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_appeditor_url(app_path));
__m[__n++]=__ts[283];                             // ">Current</a>
                                                  //               </td>
                                                  //               <td></td>
if (writable) {
__m[__n++]=__ts[284];                             // 
                                                  //               <td></td>
}
__m[__n++]=__ts[285];                             // 
                                                  //               <td><a href="
__m[__n++]=__pkg.runtime.make_attr_safe(app.get_base_url());
__m[__n++]=__ts[286];                             // " target="_blank">view</a></td>
if (writable) {
__m[__n++]=__ts[287];                             // 
                                                  //               <td></td>
}
__m[__n++]=__ts[288];                             // 
                                                  //             </tr>
__pkg.runtime.foreach(this, (versions), function (i, version) {
var once_6 = 1;
while (once_6) {
__m[__n++]=__ts[289];                             // 
                                                  //             <tr class="version-listitem">

                var path = app_path.replace("//", "//" + version.name + ".");
                var view_url = app.get_base_url().replace("//", "//" + version.name + ".");
                
                var show_update = false;                    
                if (/\d+/.test(version.name)) {
                  if (first_number) {
                    show_update = true;
                    first_number = false;
                  }
                } else {
                  show_update = true;       
                }
              
__m[__n++]=__ts[290];                             // 
if (release || writable) {
__m[__n++]=__ts[291];                             // 
                                                  //               <td class="center">
if (writable) {
__m[__n++]=__ts[292];                             // 
                                                  //                 <input
var dattrs_19 = (released_path != path ? {} : {'checked':'checked'});
var sattrs_19 = {};
if (!("name" in dattrs_19)) {__m[__n++]=__ts[293];                             //  name="version-release"
 }
if (!("type" in dattrs_19)) {__m[__n++]=__ts[294];                             //  type="radio"
 }
if (!("value" in dattrs_19)) {__m[__n++]=__ts[295];                             //  value="
__m[__n++]=__pkg.runtime.make_attr_safe(version.name);
__m[__n++]=__ts[296];                             // "
 }
for (var di_19 in dattrs_19) {
__m[__n++]=' ' + di_19;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_19[di_19]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[297];                             // >
}
else {
__m[__n++]=__ts[298];                             // 
                                                  //                 <span>
if (released_path == path) {
__m[__n++]=__ts[299];                             // <em>✓</em>
}
__m[__n++]=__ts[300];                             // </span>
}
__m[__n++]=__ts[301];                             // 
                                                  //               </td>
}
__m[__n++]=__ts[302];                             // 
                                                  //               <td>
                                                  //                 <a apppath="
__m[__n++]=__pkg.runtime.make_attr_safe(path);
__m[__n++]=__ts[303];                             // " class="app-link" href="
__m[__n++]=__pkg.runtime.make_attr_safe(ui.get_appeditor_url(path));
__m[__n++]=__ts[304];                             // ">
__m[__n++]=version.name;
__m[__n++]=__ts[305];                             // </a>
                                                  //               </td>     
                                                  //               <td>
if (version.as_of_time) {
__m[__n++]=__ts[306];                             // 
                                                  //                 <span>
                                                  //                   
__m[__n++]=(ui.get_relative_timestamp(version.as_of_time));
__m[__n++]=__ts[307];                             // 
if (writable && show_update) {
__m[__n++]=__ts[308];                             // 
                                                  //                   <span>
                                                  //                     [
var onclick_cb_21 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_21] = function (event) {
ui.do_app_add_version(version.name, '__now__')}
__m[__n++]=__ts[309];                             // <a href="#0" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_21);
__m[__n++]=__ts[310];                             // .apply(this, [event])">set to now</a>]
                                                  //                   </span>
}
__m[__n++]=__ts[311];                             // 
                                                  //                 </span>
}
__m[__n++]=__ts[312];                             // 
                                                  //               </td>
if (writable) {
__m[__n++]=__ts[313];                             // 
                                                  //               <td class="center">
                                                  //                 <input
var dattrs_20 = (version.service_url == 'http://www.sandbox-freebase.com' ? {'checked':'checked'} : {});
var sattrs_20 = {};
if (!("class" in dattrs_20)) {__m[__n++]=__ts[314];                             //  class="version-service-url"
 }
if (!("key" in dattrs_20)) {__m[__n++]=__ts[315];                             //  key="
__m[__n++]=__pkg.runtime.make_attr_safe(version.name);
__m[__n++]=__ts[316];                             // "
 }
if (!("type" in dattrs_20)) {__m[__n++]=__ts[317];                             //  type="checkbox"
 }
for (var di_20 in dattrs_20) {
__m[__n++]=' ' + di_20;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_20[di_20]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[318];                             // >
                                                  //               </td>
}
__m[__n++]=__ts[319];                             // 
                                                  //               <td><a href="
__m[__n++]=__pkg.runtime.make_attr_safe(view_url);
__m[__n++]=__ts[320];                             // " target="_blank">view</a></td>
if (writable) {
__m[__n++]=__ts[321];                             // 
                                                  //               <td class="remove">
if (released_path != path) {
__m[__n++]=__ts[322];                             // 
                                                  //                 <a class="remove-version-button" href="#0" key="
__m[__n++]=__pkg.runtime.make_attr_safe(version.name);
__m[__n++]=__ts[323];                             // ">x</a>
}
__m[__n++]=__ts[324];                             // 
                                                  //               </td>
}
__m[__n++]=__ts[325];                             // 
                                                  //             </tr>
once_6--;
} /* while once */
return once_6 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[326];                             // 
                                                  //           </tbody>
                                                  //         </table>
                                                  //       </div>
if (writable) {
__pkg.runtime.ondomready(function () {

        $('#add-version-key').val(counter);
          
        $('.remove-version-button').click(function() {
          $(this).parents('tr').fadeOut('slow');
          ui.do_app_remove_version($(this).attr('key'));
          return false;
        });
    
        $("input[name='version-release']").click(function() {
          var ver = $(this).val();
          ui.do_app_set_release(ver);
          return false;
        });
        
        $(".version-service-url").click(function() {
          service_url = $(this).attr('checked') ? 'http://www.sandbox-freebase.com' : false;
          ui.do_app_add_version($(this).attr('key'), null, service_url);
        });
      
}, this);
}
__m[__n++]=__ts[327];                             // 
return __m;
};
app_versions_list = __pkg.runtime.tfunc_factory("app_versions_list()", app_versions_list, __pkg, undefined, false);
exports.app_versions_list = app_versions_list;
app_versions_list.source_microdata = null;
__m[__n++]=__ts[328];                             // 
// mjt.def=app_changes()
var app_changes = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[329];                             // <div class="tab-body"
if (this.subst_id) { __m[__n++]=__pkg.runtime.bless(' id="' + this.subst_id + '"'); }
__m[__n++]=__ts[330];                             // >

      var app = ui.get_app();
      var writable = app.is_writable();
      var seed_path = ui.id_to_path("/freebase/apps/seed");
    
__m[__n++]=__ts[331];                             // 
                                                  //     <div class="tab-section">
                                                  //       <div class="sidebar">
                                                  //         <p>
                                                  //           View the changes between versions or even individual edits.
                                                  //         </p>
                                                  //         <p>
                                                  //           If you're an author, you can also <em>revert</em> the changes.
                                                  //         </p>
                                                  //       </div>
                                                  //       <h3>App History</h3>
var onclick_cb_22 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_22] = function (event) {
ui.do_show_dialog('diff_patch', ['app_history'])}
__m[__n++]=__ts[332];                             // 
                                                  //       <button id="button-app-history" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_22);
__m[__n++]=__ts[333];                             // .apply(this, [event])">
                                                  //         Diff Versions &amp; Edits</button>
                                                  //     </div>
                                                  //     <div class="tab-section">
                                                  //       <div class="sidebar">
                                                  //         <p>
                                                  //           View the changes between this app and it's parents or children.
                                                  //         </p>
                                                  //         <p>
                                                  //           If you're an author, you can also <em>merge</em> the changes.
                                                  //         </p>
                                                  //         
                                                  //       </div>
                                                  //       <h3>View Changes from Clones</h3>
                                                  //       <div id="clone-list">
if ((!app.get_parent() && !app.get_children().length) || (app.get_parent() && app.get_parent().path === seed_path)) {
__m[__n++]=__ts[334];                             // 
                                                  //         <p>
                                                  //           <i>
                                                  //             This app does not have either parent or children apps.  <br>
                                                  //             Choose any app to view changes from below.
                                                  //           </i>
                                                  //         </p>
}
__m[__n++]=__ts[335];                             // 
if (app.get_parent() && app.get_parent().path !== seed_path) {
__m[__n++]=__ts[336];                             // 
                                                  //         <table class="edit-list">
                                                  //           <thead>
                                                  //             <tr colspan="2"><th class="left">Parent:</th></tr>
                                                  //           </thead>
                                                  //           <tbody>
                                                  //             <tr>
                                                  //               <td class="left">
                                                  //                 <a apppath="
__m[__n++]=__pkg.runtime.make_attr_safe(app.get_parent().path);
__m[__n++]=__ts[337];                             // " class="app-link" href="#0">
__m[__n++]=(app.get_parent().path);
__m[__n++]=__ts[338];                             // </a>
                                                  //               </td>
                                                  //               <td class="right">
                                                  //                 <button class="button-get-changes" value="
__m[__n++]=__pkg.runtime.make_attr_safe(app.get_parent().path);
__m[__n++]=__ts[339];                             // ">View Changes</button>
                                                  //               </td>
                                                  //             </tr>
                                                  //           </tbody>
                                                  //         </table>
}
__m[__n++]=__ts[340];                             // 
if (app.get_children().length) {
__m[__n++]=__ts[341];                             // 
                                                  //         <table class="edit-list">
                                                  //           <thead>
                                                  //             <tr colspan="2"><th class="left">Children:</th></tr>
                                                  //           </thead>
                                                  //           <tbody>
__pkg.runtime.foreach(this, (app.get_children()), function (a_index_1, a) {
var once_7 = 1;
while (once_7) {
__m[__n++]=__ts[342];                             // 
                                                  //             <tr>
                                                  //               <td class="left">
                                                  //                 <a apppath="
__m[__n++]=__pkg.runtime.make_attr_safe(a.path);
__m[__n++]=__ts[343];                             // " class="app-link" href="#0">
__m[__n++]=a.path;
__m[__n++]=__ts[344];                             // </a>
                                                  //               </td>
                                                  //               <td class="right">
                                                  //                 <button class="button-get-changes" value="
__m[__n++]=__pkg.runtime.make_attr_safe(a.path);
__m[__n++]=__ts[345];                             // ">View Changes</button>
                                                  //               </td>
                                                  //             </tr>
once_7--;
} /* while once */
return once_7 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[346];                             // 
                                                  //           </tbody>
                                                  //         </table>
}
__m[__n++]=__ts[347];                             // 
                                                  //       </div>
                                                  //     </div>
                                                  //     <div class="tab-section last">
                                                  //       <div class="sidebar">
                                                  //         <p>
                                                  //           Select any app you'd like to view changes from.
                                                  //         </p>
                                                  //       </div>
                                                  //       <h3>View Changes from any App</h3>
                                                  //       <fieldset id="add-patch">
                                                  //         <label for="merge-app">Choose app: </label>
                                                  //         <input id="merge-app" maxlength="60" type="text">
                                                  //         <button class="button-get-changes" disabled="disabled" id="button-merge">
                                                  //           View Changes</button>
                                                  //       </fieldset>
                                                  //     </div>
__pkg.runtime.ondomready(function () {

      $("#merge-app")
          .suggest({type: '/freebase/apps/acre_app'})
          .bind("fb-select", function(e, data) {
              var path = ui.id_to_path(data.id);
              $(this).val(path);
              $('#button-merge').removeAttr("disabled").val(path);
          });
          
      $('.button-get-changes').click(function(){
        ui.do_show_dialog('diff_patch',['merge_changes',{ appid : $(this).val() }]);
      });
    
}, this);
__m[__n++]=__ts[348];                             // 
                                                  //   </div>
return __m;
};
app_changes = __pkg.runtime.tfunc_factory("app_changes()", app_changes, __pkg, undefined, false);
exports.app_changes = app_changes;
app_changes.source_microdata = null;
__m[__n++]=__ts[349];                             // 
// mjt.def=app_authors()
var app_authors = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[350];                             // <div class="tab-body"
if (this.subst_id) { __m[__n++]=__pkg.runtime.bless(' id="' + this.subst_id + '"'); }
__m[__n++]=__ts[351];                             // >
                                                  //     <div class="tab-section last">
if (ui.get_app().is_writable()) {
__m[__n++]=__ts[352];                             // 
                                                  //       <div>
                                                  //         <div class="sidebar">
                                                  //           <p>
                                                  //             You can add other Freebase users as <em>Authors</em>
                                                  //             to your app.  Choose authors carefully! They can edit code, release versions, 
                                                  //             and delete files.
                                                  //           </p>
                                                  //         </div>
                                                  //         <h3>Add an Author</h3>
                                                  //         <fieldset class="form-indent">
                                                  //           <label for="add-author-input">Find a user to add</label>
                                                  //           <input id="add-author-input" type="text">
                                                  //         </fieldset>
                                                  //     
                                                  //         <div id="app-authors-list">
                                                  //           
__m[__n++]=(app_authors_list(ui.get_app().get_authors()));
__m[__n++]=__ts[353];                             // 
                                                  //         </div>
__pkg.runtime.ondomready(function () {

          $("#add-author-input")
              .suggest({type: '/type/user'})
              .bind("fb-select", function(e, data) {
                  $(this).val('');
                  ui.do_app_add_author(data.name);
              }).focus();
        
}, this);
__m[__n++]=__ts[354];                             // 
                                                  //       </div>
}
else {
__m[__n++]=__ts[355];                             // 
                                                  //       <div>
                                                  //         <h3>Authors</h3>
                                                  //         <div id="app-authors-list">
                                                  //           
__m[__n++]=(app_authors_list(ui.get_app().get_authors()));
__m[__n++]=__ts[356];                             // 
                                                  //         </div>
                                                  //       </div>
}
__m[__n++]=__ts[357];                             // 
                                                  //     </div>
                                                  //   </div>
return __m;
};
app_authors = __pkg.runtime.tfunc_factory("app_authors()", app_authors, __pkg, undefined, false);
exports.app_authors = app_authors;
app_authors.source_microdata = null;
__m[__n++]=__ts[358];                             // 
// mjt.def=app_authors_list(user_dict)
var app_authors_list = function (user_dict) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[359];                             // 

        var one_user = (function() { var r=0; for (var p in user_dict) { r++; }; return r == 1;})();
      
__m[__n++]=__ts[360];                             // 
                                                  //     
                                                  //       <h4 class="list-title">These authors can edit this app:</h4>
                                                  //   
                                                  //       <table class="edit-list">
__pkg.runtime.foreach(this, (user_dict), function (user_index_1, user) {
var once_8 = 1;
while (once_8) {
__m[__n++]=__ts[361];                             // 
                                                  //         <tr class="user-listitem">
                                                  //           <td class="user-image-cell">
                                                  //             <div class="user-image">
                                                  //               <a href="
__m[__n++]=__pkg.runtime.make_attr_safe(user.get_view_url());
__m[__n++]=__ts[362];                             // " target="user" title="View profile for 
__m[__n++]=__pkg.runtime.make_attr_safe(user.get_full_name() || user.get_name());
__m[__n++]=__ts[363];                             // ">
                                                  //                 <!-- dummy but valid img src -->
                                                  //                 <img alt="mugshot" src="
__m[__n++]=__pkg.runtime.make_attr_safe(user.get_image_url());
__m[__n++]=__ts[364];                             // ">
                                                  //               </a>
                                                  //             </div>
                                                  //           </td>
                                                  //           <td>
                                                  //             <a class="user-name" href="
__m[__n++]=__pkg.runtime.make_attr_safe(user.get_view_url());
__m[__n++]=__ts[365];                             // " target="user" title="View profile for 
__m[__n++]=__pkg.runtime.make_attr_safe(user.get_full_name() || user.get_name());
__m[__n++]=__ts[366];                             // ">
__m[__n++]=(user.get_name());
__m[__n++]=__ts[367];                             // </a>
                                                  //           </td>
                                                  //           <td class="remove">
if (!one_user && ui.get_app().is_writable() && user.is_admin()) {
__m[__n++]=__ts[368];                             // 
                                                  //             <a class="remove-user-button" href="#0" user="
__m[__n++]=__pkg.runtime.make_attr_safe(user.get_name());
__m[__n++]=__ts[369];                             // ">x</a>
}
__m[__n++]=__ts[370];                             // 
                                                  //           </td>
                                                  //         </tr>
once_8--;
} /* while once */
return once_8 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[371];                             // 
                                                  //       </table>
__pkg.runtime.ondomready(function () {

        $("#add-author-input").focus();
        $('.remove-user-button').click(function() {
          $(this).parents('tr').fadeOut('slow');
          ui.do_app_remove_author($(this).attr('user'));
          return false;
        });
      
}, this);
__m[__n++]=__ts[372];                             // 
return __m;
};
app_authors_list = __pkg.runtime.tfunc_factory("app_authors_list(user_dict)", app_authors_list, __pkg, undefined, false);
exports.app_authors_list = app_authors_list;
app_authors_list.source_microdata = null;
__m[__n++]=__ts[373];                             // 
// mjt.def=app_services()
var app_services = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[374];                             // <div class="tab-body"
if (this.subst_id) { __m[__n++]=__pkg.runtime.bless(' id="' + this.subst_id + '"'); }
__m[__n++]=__ts[375];                             // >

      var write_user = ui.get_app().get_write_user();
      var is_write_user = write_user && write_user.get_name() == ui.get_user().get_name() ? true : false;
      var oauth_enabled = ui.get_app().is_oauth_enabled();

      var writeuser_attr = {};
      var oauth_attr = {};
      if (write_user) {
        writeuser_attr.checked = 'checked';
        if (!is_write_user) { 
          writeuser_attr.disabled = 'disabled';
        };
      }
      if (oauth_enabled) {
        oauth_attr.checked = 'checked';
      }
    
__m[__n++]=__ts[376];                             // 
                                                  //     <div class="tab-section">
                                                  //       <fieldset id="permissions-settings">
                                                  //         <h3>Writing to Freebase</h3>
                                                  //         <div class="radiogroup">
                                                  //           <h5>
                                                  //             <input
var dattrs_21 = (oauth_attr);
var sattrs_21 = {};
if (!("id" in dattrs_21)) {__m[__n++]=__ts[377];                             //  id="permission-oauth"
 }
if (!("type" in dattrs_21)) {__m[__n++]=__ts[378];                             //  type="checkbox"
 }
for (var di_21 in dattrs_21) {
__m[__n++]=' ' + di_21;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_21[di_21]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[379];                             // >
                                                  //             Allow your users to write as themselves
                                                  //           </h5>
                                                  //           <p>
                                                  //             <small>Writes will be attributed to the user making them. Users will be asked to allow your app 
                                                  //             to use their Freebase account. <strong>This is usually is the best choice</strong>.</small>
                                                  //           </p>
                                                  //         </div>
                                                  //         <div class="radiogroup">
                                                  //           <h5>
                                                  //             <input
var dattrs_22 = (writeuser_attr);
var sattrs_22 = {};
if (!("id" in dattrs_22)) {__m[__n++]=__ts[380];                             //  id="permission-writeuser"
 }
if (!("type" in dattrs_22)) {__m[__n++]=__ts[381];                             //  type="checkbox"
 }
for (var di_22 in dattrs_22) {
__m[__n++]=' ' + di_22;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_22[di_22]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[382];                             // >
                                                  //             Allow <strong>
__m[__n++]=(write_user ? write_user.get_name() : ui.get_user().get_name());
__m[__n++]=__ts[383];                             // </strong> to write on behalf of any user
                                                  //           </h5>
                                                  //           <p>
                                                  //             <small>
                                                  //               Writes will all be attributed to this user. Be careful, however, as you may quickly exceed 
                                                  //               Freebase's daily single-user write limit if you have a lot of users!<br>
                                                  //               <strong>
                                                  //                 NOTE: If you've also enabled your users to write, you will need to set the <em>http_sign</em>
                                                  //                 option to <em>false</em> for any Freebase call you want written by this user
                                                  //               </strong>
                                                  //             </small>
                                                  //           </p>
                                                  //         </div>
                                                  //       </fieldset>
                                                  //     </div>
                                                  //     <div class="tab-section last">
                                                  //       <div class="sidebar">
                                                  //         <p>
                                                  //           <em>API keys</em> authorize information exchange with other web applications or services. Register your app with the <strong>service domain</strong> you want to use.  Each service handles this differently, so follow their instructions.  Once registered, enter the <strong>API key</strong> and <strong>secret</strong> (if required) provided by the service here.
                                                  //         </p>
                                                  //       </div>
                                                  //       <h3>Add an API Key</h3>
if (window.location.protocol == 'https:') {
__m[__n++]=__ts[384];                             // 
                                                  //       <div>
var apikeys = this.tasks && this.tasks.apikeys;
if (!apikeys) { apikeys = this.mktask("apikeys", (

          ui.get_app().t_get_apikeys()
        )); }
__m[__n++]=__ts[385];                             // 
__m[__n++]=__ts[386];                             // 
                                                  //         <div>
switch (apikeys.state) {
case "ready":
__m[__n++]=__ts[387];                             // <div>

              var keys = apikeys.result.keys;
            
__m[__n++]=__ts[388];                             // 
                                                  //             <div id="app-apikeys-add">
__m[__n++]=(app_apikeys_list(keys));
__m[__n++]=__ts[389];                             // </div>
                                                  //           </div>
break;
case "wait":
__m[__n++]=__ts[390];                             // <p><span class="loader-square hidden" id="version-loader"></span></p>
break;
case "error":
__m[__n++]=__ts[391];                             // <p>Error loading API keys.</p>
break;
};
__m[__n++]=__ts[392];                             // </div>
                                                  //       </div>
}
else {
__m[__n++]=__ts[393];                             // 
                                                  //       <div>
                                                  //         <p>
                                                  //           For your security, please <a href="https://
__m[__n++]=__pkg.runtime.make_attr_safe(window.location.host + window.location.pathname + window.location.hash);
__m[__n++]=__ts[394];                             // ">switch to App Editor over SSL</a> to add or edit your API keys.
                                                  //         </p>
                                                  //       </div>
}
__m[__n++]=__ts[395];                             // 
                                                  //     </div>
__pkg.runtime.ondomready(function () {

      $('#permission-oauth').change(function(){
        ui.do_app_set_oauth(!!$(this).attr('checked'));
      });
      $('#permission-writeuser').change(function(){
        ui.do_app_set_writeuser(!!$(this).attr('checked'));
      });
    
}, this);
__m[__n++]=__ts[396];                             // 
                                                  //   </div>
return __m;
};
app_services = __pkg.runtime.tfunc_factory("app_services()", app_services, __pkg, true, false);
exports.app_services = app_services;
app_services.source_microdata = null;
__m[__n++]=__ts[397];                             // 
// mjt.def=app_apikeys_list(keys)
var app_apikeys_list = function (keys) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[398];                             // 
                                                  //       <fieldset>
                                                  //         <div class="form-row">
                                                  //           <label for="apikey-name">Service domain:</label>
                                                  //           <input id="apikey-name" type="text">
                                                  //         </div>
                                                  //         <div class="form-row">          
                                                  //           <label for="apikey-token">Key:</label>
                                                  //           <input id="apikey-token" type="text">
                                                  //         </div>
                                                  //         <div class="form-row">
                                                  //           <label for="apikey-secret">Secret:</label>
                                                  //           <input id="apikey-secret" type="text"><br>
                                                  //         </div>
                                                  //         <div class="form-row">
                                                  //           <button disabled="disabled" id="button-apikey-add">Add API Key</button>
                                                  //         </div>
                                                  //       </fieldset>
if (keys.length) {
__m[__n++]=__ts[399];                             // 
                                                  //       <div id="api-key-list">
                                                  //       <h3>API Keys</h3>
                                                  //         <table class="edit-list">
                                                  //           <thead>
                                                  //             <tr class="key-listitem">
                                                  //               <th>Service Domain</th>
                                                  //               <th>Key</th>
                                                  //               <th>Secret</th>
                                                  //               <th></th>
                                                  //             </tr>
                                                  //           </thead>
                                                  //           <tbody>
__pkg.runtime.foreach(this, (keys), function (key_index_1, key) {
var once_9 = 1;
while (once_9) {
__m[__n++]=__ts[400];                             // 
                                                  //             <tr class="key-listitem">
                                                  //               <td>
__m[__n++]=key.key_id;
__m[__n++]=__ts[401];                             // </td>
                                                  //               <td>
__m[__n++]=key.token;
__m[__n++]=__ts[402];                             // </td>
                                                  //               <td>
__m[__n++]=key.secret;
__m[__n++]=__ts[403];                             // </td>
                                                  //               <td class="remove">
if (key.key_id !== 'freebase.com') {
__m[__n++]=__ts[404];                             // 
                                                  //                 <a class="remove-key-button" href="#0" key="
__m[__n++]=__pkg.runtime.make_attr_safe(key.key_id);
__m[__n++]=__ts[405];                             // ">x</a>
}
__m[__n++]=__ts[406];                             // 
                                                  //               </td>
                                                  //             </tr>
once_9--;
} /* while once */
return once_9 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[407];                             // 
                                                  //           </tbody>
                                                  //         </table>
                                                  //       </div>
}
else {
__m[__n++]=__ts[408];                             // 
                                                  //       <h4 class="list-title">You haven't added any API keys.</h4>
}
__m[__n++]=__ts[409];                             // 
__pkg.runtime.ondomready(function () {

        ui.watch_inputs('apikey-add',{
          inputs : {
            'apikey-name' : null,
            'apikey-token' : null,
            'apikey-secret' : null
          },  
          submit : function(inputs) {
            ui.do_app_add_apikey(inputs['apikey-name'], inputs['apikey-token'], inputs['apikey-secret']);
          }
        });
      
        $('.remove-key-button').click(function() {
          $(this).parents('tr').fadeOut('slow');
          ui.do_app_remove_apikey($(this).attr('key'));
          return false;
        });
      
}, this);
__m[__n++]=__ts[410];                             // 
return __m;
};
app_apikeys_list = __pkg.runtime.tfunc_factory("app_apikeys_list(keys)", app_apikeys_list, __pkg, undefined, false);
exports.app_apikeys_list = app_apikeys_list;
app_apikeys_list.source_microdata = null;
return __m;
};
rawmain.source_microdata = null;
; return rawmain;})(),
info:{"file":"//5b.appeditor.site.tags.svn.freebase-site.googlecode.dev/menus","stringtable":["\n\n<!-- Your Apps Menu -->","","","\n  <div class=\"section selectable\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n    New App...\n  </div>","","\n  <div class=\"section selectable\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">      \n    App Directory...     \n  </div>","\n  <div class=\"section selectable\" id=\"your-apps-menu-item\">      \n    <div id=\"your-apps-opener\"><img id=\"your-apps-loader\" style=\"display:none;\" src=\"","\"></div>\n    Your Apps \n  </div>","\n  <div class=\"section\">\n    <h3>Your Apps</h3>\n    <a href=\"","\" title=\"Sign in to your Freebase account\">Sign in</a> to show your apps here.\n  </div>","\n\n  <div class=\"section last\"> \n    <h3>Recent Apps</h3>","\n    <ul>","\n      <li>","\n        <a apppath=\"","\" class=\"app-link\" href=\"","\" title=\"","\">","</a>","\n        <em>on ","</em>","\n      </li>","\n    </ul>","\n    <div>If you work on multiple apps, recently opened ones will appear here.</div>","\n  </div>","","","","","\n    <p class=\"menu-message\">Apps you create or clone will appear here.</p>","\n    <ul>","\n      <li>\n        <a apppath=\"","\" class=\"app-link\" href=\"","\" title=\"","\">\n          ","\n        </a>\n      </li>","\n    </ul>","","","\n\n\n<!-- File Menu -->","","","\n  <div class=\"section\">\n    <h3>Name</h3>\n    <fieldset class=\"center\">\n      <label for=\"file-name\">File name </label>\n      <input class=\"form-textbox\" id=\"file-name\" type=\"text\" value=\"","\">","\n      <button class=\"exit\" disabled=\"disabled\" id=\"button-name\">Rename</button>","\n    </fieldset>\n  </div>","","\n  <div class=\"section\">\n    <h3>Type</h3>\n    <fieldset id=\"fieldset-metadata\">","<div",">","\n        <div class=\"form-row\">\n          <label for=\"file-handler\">Acre type </label>\n          <select"," id=\"file-handler\"",">","\n            <option"," value=\"","\"",">\n                ","\n            </option>","\n          </select>\n        </div>\n        <div class=\"form-row\">\n          <label for=\"file-mimetype\">MIME type </label>\n          <select"," id=\"file-mimetype\"",">","\n            <option"," value=\"","\"",">\n              ","\n            </option>","\n          </select>\n        </div>","\n      </div>","\n      <div id=\"metadata-section\">","</div>\n    </fieldset>\n  </div>","\n  <div class=\"section\">\n    <h3>Type</h3>\n    <fieldset id=\"fieldset-metadata\">\n      <div class=\"form-row\">\n        <label for=\"file-handler\">Acre type:</label>\n        <span class=\"form-static\">","</span>\n      </div>            \n      <div class=\"form-row\">            \n        <label for=\"file-mimetype\">MIME type: </label>\n        <span class=\"form-static\">","</span>\n      </div>              \n    </fieldset>\n  </div>","\n  <div class=\"section\">\n    <h3>Validate</h3>","\n    <button"," title=\"","\""," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">\n      Check Syntax</button>\n  </div>\n  <div class=\"section\">\n    <h3>History</h3>\n    <fieldset>","\n      <button"," class=\"exit\""," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">\n        Revert to Saved</button>"," ","\n      <button onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n        Review Older Versions</button>\n    </fieldset>\n  </div>\n  <div class=\"section last\">\n    <h3>Actions</h3>","\n    <button"," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">\n      Clone this File</button>","\n    <button"," onclick=\"return mjt._eventcb.",".apply(this, [event])\"",">\n      Delete this File</button>\n  </div>","","\n\n\n<!-- Editor Menu -->","","","\n  <div class=\"section\">","\n    <h3>Text Editor</h3>\n    <fieldset>","\n      <div class=\"line\">\n        <input"," id=\"edopt-texteditor-","\""," name=\"edopt-texteditor\""," type=\"radio\""," value=\"","\"",">\n        <label for=\"edopt-texteditor-","\">","</label><br>\n      </div>","\n    </fieldset>\n  </div>","","\n  <div class=\"section\">"," \n    <h3>Line Numbers</h3>\n    <fieldset>\n      <input"," id=\"edopt-margin-y\""," name=\"edopt-margin\""," type=\"radio\""," value=\"1\"","> <label for=\"edopt-margin-y\">yes</label>\n      <input"," id=\"edopt-margin-n\""," name=\"edopt-margin\""," type=\"radio\""," value=\"0\"","> <label for=\"edopt-margin-y\">no</label>\n    </fieldset>\n  </div>","","\n  <div class=\"section\">","\n    <h3>Soft Wrap</h3>\n    <fieldset>\n      <input"," id=\"edopt-softwrap-y\""," name=\"edopt-softwrap\""," type=\"radio\""," value=\"1\"","> <label for=\"edopt-softwrap-y\">yes</label>\n      <input"," id=\"edopt-softwrap-n\""," name=\"edopt-softwrap\""," type=\"radio\""," value=\"0\"","> <label for=\"edopt-softwrap-n\">no</label>\n    </fieldset>\n  </div>","","\n  <div class=\"section last\">","\n    <h3>Automatic Code Assist</h3>\n    <fieldset>\n      <input"," id=\"edopt-dotTrigger-y\""," name=\"edopt-dotTrigger\""," type=\"radio\""," value=\"1\"","> <label for=\"edopt-dotTrigger-y\">yes</label>\n      <input"," id=\"edopt-dotTrigger-n\""," name=\"edopt-dotTrigger\""," type=\"radio\""," value=\"0\"","> <label for=\"edopt-dotTrigger-n\">no</label>\n    </fieldset>\n  </div>","","\n  <div class=\"section last\">","\n    <h3>Enable MQL Extensions (experimental)</h3>\n    <fieldset>\n      <input"," id=\"edopt-emql-y\""," name=\"edopt-emql\""," type=\"radio\""," value=\"1\"","> <label for=\"edopt-emql-y\">yes</label>\n      <input"," id=\"edopt-emql-n\""," name=\"edopt-emql\""," type=\"radio\""," value=\"0\"","> <label for=\"edopt-emql-n\">no</label>\n    </fieldset>\n  </div>","","\n  <div>\n    <p style=\"margin:10px\">\n      No configuration options for this file type. \n    </p>\n  </div>","","","\n\n\n<!-- Help Menu -->","\n  <div id=\"help-menu-content\">\n  <div class=\"section\">\n    <h3>Documentation</h3>\n    <ul>\n      <li>","<a href=\"#0\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n        Keyboard Shortcuts</a></li>\n      <li>","<a href=\"#0\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n        Acre API Reference</a></li>\n      <li>","<a href=\"#0\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n        Acre Template Tag Reference</a></li>\n      <li>","<a href=\"#0\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n        Javascript Reference</a></li>\n      <li>","<a href=\"#0\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n        MQL Reference Guide</a></li>\n      <li><a href=\"","/docs/\" target=\"_new\">\n        Freebase Documentation Hub</a></li>\n    </ul>\n  </div>\n  <div class=\"section\">\n    <h3>Code Search</h3>\n    <p>\n      Not sure how to use a particular method or template tag?  See how someone else did!\n    </p>\n    <form action=\"http://codesearch.","/\" id=\"codesearch-form\" target=\"_blank\">\n      <fieldset>\n          <input id=\"code-search\" name=\"q\" type=\"text\">\n          <button id=\"button-codesearch\">Find Code</button>\n      </fieldset>\n    </form>\n  </div>\n  <div class=\"section last\">","\n    <a href=\"#0\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">About App Editor</a>\n  </div>\n  </div>","","\n\n\n<!-- App  menu -->","","","\n  <div class=\"dialog-close\" onclick=\"return mjt._eventcb.",".apply(this, [event])\"></div>\n  <div class=\"clear\" id=\"app-settings-section\">\n    <div id=\"settings-tabs\">\n      <ul id=\"settings-tabs-bar\">\n        <li class=\"tab\"><a class=\"settings-tab-link\" href=\"#app_general\">Versions</a></li>\n        <li class=\"tab\"><a class=\"settings-tab-link\" href=\"#app_changes\">Changes</a></li>\n        <li class=\"tab\"><a class=\"settings-tab-link\" href=\"#app_authors\">Authors</a></li>","\n        <li class=\"tab\"><a class=\"settings-tab-link\" href=\"#app_services\">Web Services</a></li>","\n      </ul>\n      <div class=\"tabbed-content\" id=\"settings-tab-content\">\n        <div id=\"app_general\"></div>\n        <div id=\"app_changes\"></div>\n        <div id=\"app_authors\"></div>\n        <div id=\"app_services\"></div>\n      </div>\n    </div>\n  </div>\n  <div class=\"button-bar\">","\n    <fieldset id=\"app-clonedelete\">","\n      <button class=\"button-primary\" id=\"app-general-listing\">\n        Edit Name &amp; Directory Listing</button>","","\n      <button id=\"app-general-clone\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n        Clone this App</button>","","\n      <button id=\"app-general-delete\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n        Delete this App</button>","\n    </fieldset>","\n    <fieldset id=\"app-clonedelete\">","\n      <button id=\"app-general-clone\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n        Clone this App</button>","\n    </fieldset>","","\n    <button onclick=\"return mjt._eventcb.",".apply(this, [event])\">Done</button>\n  </div>","","","<div class=\"tab-body\"",">","\n        \n    <div class=\"tab-section\">\n      <h3>Versions</h3>\n      <div class=\"sidebar\">\n        <p>\n          App authors can create and release new versions of their app any time.\n        </p>\n        <p>\n          <em>Current</em> is always the latest version; all edits are made to Current.  Other versions are read only.\n        </p>\n        <p>\n          <em>Release</em> is the version the app author wants people to use.  Any version can be released, but it's good practice to create and release a version other than Current to prevent development from impacting users. \n        </p>\n      </div>","\n      <fieldset id=\"add-version\">\n        <label for=\"add-version-key\">Create a new version: </label>\n        <input id=\"add-version-key\" maxlength=\"10\" type=\"text\">","\n        <button id=\"button-version\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n          Add Version</button>","\n        <button onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n          View Changes</button>","\n      </fieldset>","\n      <div id=\"app-versions-add\">","</div>\n    </div>\n\n    <div class=\"tab-section\">","","\n      <div class=\"app-url\">\n        <p>\n          Your <strong>Dev URL</strong> points to <em>Current:</em>\n        </p>\n        <fieldset>\n            http://<input class=\"shortfield\" id=\"devurl\" maxlength=\"20\" minlength=\"5\" type=\"text\" value=\"","\">",".","\n          <button disabled=\"disabled\" id=\"button-devurl\">Change URL</button>\n        </fieldset>\n      </div>","\n      <div class=\"app-url\">\n        <p>URL to <em>Current</em> version:</p>\n        <p><a href=\"","\" target=\"current\">","</a></p>\n      </div>","","\n    </div>\n    <div class=\"tab-section last\">\n      <div class=\"app-url\">\n        ","\n      </div>\n    </div>\n  </div>","","","","\n      <div>\n        <p>Your <strong>Release URL</strong> points to <em>Release:</em></p>\n        <fieldset>\n          http://<input id=\"puburl\" maxlength=\"20\" minlength=\"5\" type=\"text\" value=\"","\">."," \n          <button disabled=\"disabled\" id=\"button-puburl\">","\n            <span>Change URL</span>","\n            <span>Choose URL</span>","\n          </button>\n          <span id=\"puburl-status\"></span>\n        </fieldset>","\n        <div>\n          <h4 class=\"list-title\">Other URLs:</h4>\n          <table class=\"edit-list\">","\n            <tr>\n              <td><a href=\"http://","\" target=\"_blank\">","</a></td>\n              <td>","<span class=\"version-bad\">","</span>","</td>\n            </tr>","\n          </table>\n        </div>","","\n      </div>","\n      <div>","\n        <div>\n          <p>URL to <em>Release</em> version:</p>","\n          <p><a href=\"http://","\" target=\"release\">http://",".","</a>\n          </p>","\n        </div>","\n      </div>","","","","\n\n      <div id=\"app-versions-list\">\n        <table class=\"edit-list\">\n          <thead>\n            <tr>","\n              <th class=\"center\">release</th>","\n              <th class=\"left\">version</th>\n              <th class=\"left\">snapshot time</th>","\n              <th class=\"center\">run on<br>sandbox</th>","\n              <th></th>","\n              <th></th>","\n            </tr>\n          </thead>\n          <tbody>\n            <tr class=\"version-listitem\">","\n              <td class=\"center\">","\n                <input"," name=\"version-release\""," type=\"radio\""," value=\"current\"",">","\n                <span>","<em>✓</em>","</span>","\n              </td>","\n              <td>\n                <a apppath=\"","\" class=\"app-link\" href=\"","\">Current</a>\n              </td>\n              <td></td>","\n              <td></td>","\n              <td><a href=\"","\" target=\"_blank\">view</a></td>","\n              <td></td>","\n            </tr>","\n            <tr class=\"version-listitem\">","","\n              <td class=\"center\">","\n                <input"," name=\"version-release\""," type=\"radio\""," value=\"","\"",">","\n                <span>","<em>✓</em>","</span>","\n              </td>","\n              <td>\n                <a apppath=\"","\" class=\"app-link\" href=\"","\">","</a>\n              </td>     \n              <td>","\n                <span>\n                  ","","\n                  <span>\n                    [","<a href=\"#0\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">set to now</a>]\n                  </span>","\n                </span>","\n              </td>","\n              <td class=\"center\">\n                <input"," class=\"version-service-url\""," key=\"","\""," type=\"checkbox\"",">\n              </td>","\n              <td><a href=\"","\" target=\"_blank\">view</a></td>","\n              <td class=\"remove\">","\n                <a class=\"remove-version-button\" href=\"#0\" key=\"","\">x</a>","\n              </td>","\n            </tr>","\n          </tbody>\n        </table>\n      </div>","","","<div class=\"tab-body\"",">","\n    <div class=\"tab-section\">\n      <div class=\"sidebar\">\n        <p>\n          View the changes between versions or even individual edits.\n        </p>\n        <p>\n          If you're an author, you can also <em>revert</em> the changes.\n        </p>\n      </div>\n      <h3>App History</h3>","\n      <button id=\"button-app-history\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n        Diff Versions &amp; Edits</button>\n    </div>\n    <div class=\"tab-section\">\n      <div class=\"sidebar\">\n        <p>\n          View the changes between this app and it's parents or children.\n        </p>\n        <p>\n          If you're an author, you can also <em>merge</em> the changes.\n        </p>\n        \n      </div>\n      <h3>View Changes from Clones</h3>\n      <div id=\"clone-list\">","\n        <p>\n          <i>\n            This app does not have either parent or children apps.  <br>\n            Choose any app to view changes from below.\n          </i>\n        </p>","","\n        <table class=\"edit-list\">\n          <thead>\n            <tr colspan=\"2\"><th class=\"left\">Parent:</th></tr>\n          </thead>\n          <tbody>\n            <tr>\n              <td class=\"left\">\n                <a apppath=\"","\" class=\"app-link\" href=\"#0\">","</a>\n              </td>\n              <td class=\"right\">\n                <button class=\"button-get-changes\" value=\"","\">View Changes</button>\n              </td>\n            </tr>\n          </tbody>\n        </table>","","\n        <table class=\"edit-list\">\n          <thead>\n            <tr colspan=\"2\"><th class=\"left\">Children:</th></tr>\n          </thead>\n          <tbody>","\n            <tr>\n              <td class=\"left\">\n                <a apppath=\"","\" class=\"app-link\" href=\"#0\">","</a>\n              </td>\n              <td class=\"right\">\n                <button class=\"button-get-changes\" value=\"","\">View Changes</button>\n              </td>\n            </tr>","\n          </tbody>\n        </table>","\n      </div>\n    </div>\n    <div class=\"tab-section last\">\n      <div class=\"sidebar\">\n        <p>\n          Select any app you'd like to view changes from.\n        </p>\n      </div>\n      <h3>View Changes from any App</h3>\n      <fieldset id=\"add-patch\">\n        <label for=\"merge-app\">Choose app: </label>\n        <input id=\"merge-app\" maxlength=\"60\" type=\"text\">\n        <button class=\"button-get-changes\" disabled=\"disabled\" id=\"button-merge\">\n          View Changes</button>\n      </fieldset>\n    </div>","\n  </div>","","<div class=\"tab-body\"",">\n    <div class=\"tab-section last\">","\n      <div>\n        <div class=\"sidebar\">\n          <p>\n            You can add other Freebase users as <em>Authors</em>\n            to your app.  Choose authors carefully! They can edit code, release versions, \n            and delete files.\n          </p>\n        </div>\n        <h3>Add an Author</h3>\n        <fieldset class=\"form-indent\">\n          <label for=\"add-author-input\">Find a user to add</label>\n          <input id=\"add-author-input\" type=\"text\">\n        </fieldset>\n    \n        <div id=\"app-authors-list\">\n          ","\n        </div>","\n      </div>","\n      <div>\n        <h3>Authors</h3>\n        <div id=\"app-authors-list\">\n          ","\n        </div>\n      </div>","\n    </div>\n  </div>","","","\n    \n      <h4 class=\"list-title\">These authors can edit this app:</h4>\n  \n      <table class=\"edit-list\">","\n        <tr class=\"user-listitem\">\n          <td class=\"user-image-cell\">\n            <div class=\"user-image\">\n              <a href=\"","\" target=\"user\" title=\"View profile for ","\">\n                <!-- dummy but valid img src -->\n                <img alt=\"mugshot\" src=\"","\">\n              </a>\n            </div>\n          </td>\n          <td>\n            <a class=\"user-name\" href=\"","\" target=\"user\" title=\"View profile for ","\">","</a>\n          </td>\n          <td class=\"remove\">","\n            <a class=\"remove-user-button\" href=\"#0\" user=\"","\">x</a>","\n          </td>\n        </tr>","\n      </table>","","","<div class=\"tab-body\"",">","\n    <div class=\"tab-section\">\n      <fieldset id=\"permissions-settings\">\n        <h3>Writing to Freebase</h3>\n        <div class=\"radiogroup\">\n          <h5>\n            <input"," id=\"permission-oauth\""," type=\"checkbox\"",">\n            Allow your users to write as themselves\n          </h5>\n          <p>\n            <small>Writes will be attributed to the user making them. Users will be asked to allow your app \n            to use their Freebase account. <strong>This is usually is the best choice</strong>.</small>\n          </p>\n        </div>\n        <div class=\"radiogroup\">\n          <h5>\n            <input"," id=\"permission-writeuser\""," type=\"checkbox\"",">\n            Allow <strong>","</strong> to write on behalf of any user\n          </h5>\n          <p>\n            <small>\n              Writes will all be attributed to this user. Be careful, however, as you may quickly exceed \n              Freebase's daily single-user write limit if you have a lot of users!<br>\n              <strong>\n                NOTE: If you've also enabled your users to write, you will need to set the <em>http_sign</em>\n                option to <em>false</em> for any Freebase call you want written by this user\n              </strong>\n            </small>\n          </p>\n        </div>\n      </fieldset>\n    </div>\n    <div class=\"tab-section last\">\n      <div class=\"sidebar\">\n        <p>\n          <em>API keys</em> authorize information exchange with other web applications or services. Register your app with the <strong>service domain</strong> you want to use.  Each service handles this differently, so follow their instructions.  Once registered, enter the <strong>API key</strong> and <strong>secret</strong> (if required) provided by the service here.\n        </p>\n      </div>\n      <h3>Add an API Key</h3>","\n      <div>","","\n        <div>","<div>","\n            <div id=\"app-apikeys-add\">","</div>\n          </div>","<p><span class=\"loader-square hidden\" id=\"version-loader\"></span></p>","<p>Error loading API keys.</p>","</div>\n      </div>","\n      <div>\n        <p>\n          For your security, please <a href=\"https://","\">switch to App Editor over SSL</a> to add or edit your API keys.\n        </p>\n      </div>","\n    </div>","\n  </div>","","\n      <fieldset>\n        <div class=\"form-row\">\n          <label for=\"apikey-name\">Service domain:</label>\n          <input id=\"apikey-name\" type=\"text\">\n        </div>\n        <div class=\"form-row\">          \n          <label for=\"apikey-token\">Key:</label>\n          <input id=\"apikey-token\" type=\"text\">\n        </div>\n        <div class=\"form-row\">\n          <label for=\"apikey-secret\">Secret:</label>\n          <input id=\"apikey-secret\" type=\"text\"><br>\n        </div>\n        <div class=\"form-row\">\n          <button disabled=\"disabled\" id=\"button-apikey-add\">Add API Key</button>\n        </div>\n      </fieldset>","\n      <div id=\"api-key-list\">\n      <h3>API Keys</h3>\n        <table class=\"edit-list\">\n          <thead>\n            <tr class=\"key-listitem\">\n              <th>Service Domain</th>\n              <th>Key</th>\n              <th>Secret</th>\n              <th></th>\n            </tr>\n          </thead>\n          <tbody>","\n            <tr class=\"key-listitem\">\n              <td>","</td>\n              <td>","</td>\n              <td>","</td>\n              <td class=\"remove\">","\n                <a class=\"remove-key-button\" href=\"#0\" key=\"","\">x</a>","\n              </td>\n            </tr>","\n          </tbody>\n        </table>\n      </div>","\n      <h4 class=\"list-title\">You haven't added any API keys.</h4>","",""],"debug_locs":[1,1,1,1,1,1,7,7,7,7,7,7,8,8,9,10,11,12,13,13,13,13,13,13,13,13,15,15,15,15,16,16,16,16,16,16,16,19,19,19,19,20,20,20,20,22,22,22,22,23,25,25,25,25,25,26,26,26,30,30,30,30,30,31,31,31,32,32,32,33,34,35,36,37,37,37,37,37,37,37,37,37,38,38,38,38,38,38,38,39,39,39,40,40,40,41,41,41,41,43,43,43,43,44,45,46,47,48,49,50,50,50,50,50,50,51,51,51,51,52,52,53,54,55,56,57,57,57,57,57,58,59,59,59,59,59,60,60,60,60,60,60,60,60,61,61,61,63,63,63,63,63,63,63,64,64,64,65,65,65,66,67,68,69,70,71,72,73,73,73,73,73,73,76,76,76,76,76,76,76,77,77,78,79,80,81,82,83,83,87,87,87,87,87,87,87,88,88,88,88,88,90,90,90,90,91,91,94,94,94,94,94,94,94,94,94,95,95,96,97,98,99,100,101,102,103,104,105,108,108,108,108,108,108,108,108,108,108,108,108,108,108,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,111,111,111,112,112,112,112,112,112,118,118,118,118,118,118,118,118,118,118,118,118,118,118,118,118,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,121,121,121,122,122,122,122,122,122,125,125,125,125,125,126,127,128,129,130,131,132,133,134,135,136,137,137,137,137,137,137,137,137,137,139,139,139,139,140,145,145,145,145,145,145,145,145,149,149,149,149,149,149,152,152,152,152,152,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,163,163,163,163,163,163,163,163,163,163,163,163,163,163,163,163,163,163,163,163,163,163,163,163,163,163,164,164,164,165,165,165,165,165,165,165,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,175,175,175,175,175,175,175,175,175,175,175,175,175,175,175,175,175,175,175,178,178,178,178,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,192,192,192,192,192,195,195,195,195,195,195,195,196,196,197,198,199,200,201,202,203,204,205,205,206,206,206,209,209,209,209,209,209,209,210,210,210,210,210,210,210,210,210,210,210,210,210,210,210,210,210,210,210,210,210,210,210,211,211,211,211,211,212,212,212,212,212,212,212,214,214,214,214,215,215,216,216,216,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,222,222,222,222,223,223,224,224,224,227,227,227,227,227,227,227,227,227,227,227,227,227,227,227,227,227,227,227,227,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,230,230,230,230,231,231,232,232,232,235,235,235,235,235,235,235,235,235,235,235,235,235,235,235,235,235,235,235,235,236,236,236,236,236,236,236,236,236,236,236,236,236,236,236,236,236,236,238,238,238,238,239,239,240,240,240,243,243,243,243,243,243,243,243,243,243,243,243,243,243,243,243,243,243,243,243,244,244,244,244,244,244,244,244,244,244,244,244,244,244,244,244,244,244,246,246,246,246,247,247,251,251,251,251,251,251,251,252,252,252,253,254,255,256,257,258,259,260,261,262,263,263,263,263,263,263,266,266,266,266,266,266,266,271,271,271,271,271,271,271,271,271,271,271,273,273,273,273,273,273,273,273,275,275,275,275,275,275,275,275,277,277,277,277,277,277,277,277,279,279,279,279,279,279,279,279,281,281,281,281,290,290,290,290,290,290,290,290,290,290,290,298,298,298,298,298,298,298,298,298,298,298,298,298,298,301,301,301,301,301,302,303,304,305,306,307,307,307,307,307,307,310,310,310,310,310,310,310,311,311,312,313,314,314,314,314,314,314,314,321,321,321,321,321,321,321,321,321,321,321,332,332,332,332,332,332,332,332,332,332,332,332,333,333,333,334,334,334,334,335,335,335,335,335,335,335,335,336,336,336,337,337,337,337,337,337,337,337,338,338,338,339,339,339,340,341,341,341,341,341,341,341,341,341,342,342,342,343,343,343,344,344,344,344,344,344,344,346,346,346,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,364,364,364,364,364,365,365,365,365,365,365,366,366,367,368,383,383,383,383,383,383,383,383,383,383,383,383,383,383,383,383,386,386,386,386,386,386,386,386,386,386,389,389,389,389,389,389,389,389,389,390,390,390,391,391,391,392,392,392,396,396,396,396,396,397,398,399,400,401,401,406,406,406,406,406,406,406,406,406,406,406,406,409,409,409,409,409,410,412,412,412,412,412,412,412,413,413,413,414,414,414,414,415,416,417,418,419,420,421,422,423,424,425,425,428,428,428,428,428,428,431,431,431,431,431,431,431,431,431,433,433,433,433,434,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,453,456,456,456,456,456,456,456,456,458,458,458,458,458,458,459,459,459,459,463,463,463,463,463,466,466,466,466,466,466,466,466,467,467,467,467,467,467,468,468,468,468,468,468,468,469,469,469,469,469,469,469,471,471,471,471,472,472,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,499,499,499,500,500,500,502,502,502,502,502,502,502,502,502,502,502,503,503,503,504,504,504,505,505,505,506,506,506,506,506,506,508,508,508,508,509,509,510,511,512,513,514,515,516,517,518,519,520,521,522,523,524,525,526,527,528,534,534,534,534,534,534,534,534,534,534,537,537,537,537,537,537,537,539,539,539,539,539,539,544,544,544,544,544,544,545,545,545,545,545,545,545,545,545,545,545,545,545,545,545,545,545,545,545,545,545,546,546,546,546,546,546,546,546,547,547,547,549,549,549,549,549,549,552,552,552,552,552,552,552,553,553,553,554,554,554,554,554,556,556,556,556,556,557,557,557,558,559,560,561,562,563,564,565,566,567,568,569,570,571,571,573,573,573,573,573,573,573,573,573,573,573,573,573,573,573,573,573,573,573,573,573,573,573,574,574,574,574,574,574,574,574,575,575,575,577,577,577,577,577,577,577,577,580,580,580,580,581,581,581,581,582,582,583,583,583,583,583,583,583,583,584,584,584,585,585,585,587,587,587,589,589,589,589,589,589,589,589,589,589,589,589,589,589,589,589,589,589,589,590,590,590,591,591,591,592,592,593,593,593,593,593,593,593,593,594,594,594,595,595,595,595,595,595,599,599,599,599,599,599,599,600,601,602,603,604,605,606,607,608,609,610,611,612,613,614,615,616,617,618,619,619,620,620,620,620,620,620,622,622,622,622,622,622,623,623,624,625,626,627,638,638,638,638,638,638,638,638,638,638,638,638,638,638,638,638,638,653,653,653,653,653,653,653,653,653,653,653,653,653,653,653,653,658,658,658,658,658,658,658,658,659,659,666,666,666,666,666,666,666,666,666,666,666,666,669,669,669,669,669,673,673,673,673,673,673,674,674,679,679,679,679,679,679,679,679,679,681,681,681,681,681,681,681,684,684,684,684,684,686,686,686,686,686,686,686,688,688,688,688,705,705,705,705,705,705,705,705,705,705,705,705,705,705,705,705,705,705,705,706,707,708,709,710,711,712,713,714,715,716,717,718,719,719,719,719,719,719,719,720,720,720,720,720,720,722,722,722,737,737,737,737,737,737,737,737,737,737,737,737,737,737,737,737,737,737,739,739,739,739,740,741,742,743,744,745,746,747,748,748,748,748,751,751,751,751,751,751,753,753,753,753,755,755,755,755,755,755,755,755,757,757,757,757,758,758,759,760,765,765,765,765,765,765,765,765,768,768,768,768,768,768,768,768,770,770,770,770,775,775,775,775,775,775,775,775,775,775,775,778,778,778,778,778,778,778,778,778,780,780,780,780,780,780,780,782,782,782,782,783,784,785,786,787,788,789,790,791,791,791,791,791,791,792,792,792,792,792,792,793,793,794,795,796,797,798,799,800,801,802,803,804,805,806,807,808,809,815,815,815,815,815,815,815,815,815,815,815,815,815,815,815,815,815,815,815,825,825,825,825,825,825,825,825,825,825,825,825,825,825,825,825,825,825,825,825,825,825,825,826,826,826,848,848,848,848,848,848,848,848,848,848,848,848,848,848,848,848,848,848,848,848,848,848,848,849,849,849,849,849,849,849,852,852,852,852,852,854,854,855,856,857,857,857,858,858,858,858,859,859,859,860,860,860,861,861,861,863,865,865,865,865,865,867,867,867,867,869,869,869,869,870,871,872,873,874,875,876,877,878,878,878,878,878,878,878,879,879,879,879,897,897,897,897,897,897,897,897,897,897,897,897,897,897,897,897,897,897,897,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,910,910,910,910,911,911,911,912,912,912,914,914,914,914,914,914,914,914,916,916,916,916,916,916,916,919,919,919,919,919,920,920,920,920,921,921,921,922,923,924,925,926,927,928,929,930,931,932,933,934,935,936,937,938,939,940,940,940,940,940,940,940,940,940],"output_mode":"html"}}
});
}
