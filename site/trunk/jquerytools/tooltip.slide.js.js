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
 * @license 
 * jQuery Tools @VERSION / Tooltip Slide Effect
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/tooltip/slide.html
 *
 * Since: September 2009
 * Date: @DATE 
 */
(function($) { 

	// version number
	var t = $.tools.tooltip;
		
	// extend global configuragion with effect specific defaults
	$.extend(t.conf, { 
		direction: 'up', // down, left, right 
		bounce: false,
		slideOffset: 10,
		slideInSpeed: 200,
		slideOutSpeed: 200, 
		slideFade: !$.browser.msie
	});			
	
	// directions for slide effect
	var dirs = {
		up: ['-', 'top'],
		down: ['+', 'top'],
		left: ['-', 'left'],
		right: ['+', 'left']
	};
	
	/* default effect: "slide"  */
	t.addEffect("slide", 
		
		// show effect
		function(done) { 

			// variables
			var conf = this.getConf(), 
				 tip = this.getTip(),
				 params = conf.slideFade ? {opacity: conf.opacity} : {}, 
				 dir = dirs[conf.direction] || dirs.up;

			// direction			
			params[dir[1]] = dir[0] +'='+ conf.slideOffset;
			
			// perform animation
			if (conf.slideFade) { tip.css({opacity:0}); }
			tip.show().animate(params, conf.slideInSpeed, done); 
		}, 
		
		// hide effect
		function(done) {
			
			// variables
			var conf = this.getConf(), 
				 offset = conf.slideOffset,
				 params = conf.slideFade ? {opacity: 0} : {}, 
				 dir = dirs[conf.direction] || dirs.up;
			
			// direction
			var sign = "" + dir[0];
			if (conf.bounce) { sign = sign == '+' ? '-' : '+'; }			
			params[dir[1]] = sign +'='+ offset;			
			
			// perform animation
			this.getTip().animate(params, conf.slideOutSpeed, function()  {
				$(this).hide();
				done.call();		
			});
		}
	);  
	
})(jQuery);	
		
