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
 * jQuery Tools @VERSION History "Back button for AJAX apps"
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/toolbox/history.html
 * 
 * Since: Mar 2010
 * Date: @DATE 
 */
(function($) {
		
	var hash, iframe, links, inited;		
	
	$.tools = $.tools || {version: '@VERSION'};
	
	$.tools.history = {
	
		init: function(els) {
			
			if (inited) { return; }
			
			// IE
			if ($.browser.msie && $.browser.version < '8') {
				
				// create iframe that is constantly checked for hash changes
				if (!iframe) {
					iframe = $("<iframe/>").attr("src", "javascript:false;").hide().get(0);
					$("body").append(iframe);
									
					setInterval(function() {
						var idoc = iframe.contentWindow.document, 
							 h = idoc.location.hash;
					
						if (hash !== h) {						
							$.event.trigger("hash", h);
						}
					}, 100);
					
					setIframeLocation(location.hash || '#');
				}

				
			// other browsers scans for location.hash changes directly without iframe hack
			} else { 
				setInterval(function() {
					var h = location.hash;
					if (h !== hash) {
						$.event.trigger("hash", h);
					}						
				}, 100);
			}

			links = !links ? els : links.add(els);
			
			els.click(function(e) {
				var href = $(this).attr("href");
				if (iframe) { setIframeLocation(href); }
				
				// handle non-anchor links
				if (href.slice(0, 1) != "#") {
					location.href = "#" + href;
					return e.preventDefault();		
				}
				
			}); 
			
			inited = true;
		}	
	};  
	

	function setIframeLocation(h) {
		if (h) {
			var doc = iframe.contentWindow.document;
			doc.open().close();	
			doc.location.hash = h;
		}
	} 
		 
	// global histroy change listener
	$(window).bind("hash", function(e, h)  { 
		if (h) {
			links.filter(function() {
			  var href = $(this).attr("href");
			  return href == h || href == h.replace("#", ""); 
			}).trigger("history", [h]);	
		} else {
			links.eq(0).trigger("history", [h]);	
		}

		hash = h;
    window.location.hash = hash;
	});
		
	
	// jQuery plugin implementation
	$.fn.history = function(fn) {
			
		$.tools.history.init(this);

		// return jQuery
		return this.bind("history", fn);		
	};	
		
})(jQuery); 

