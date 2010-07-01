(function(d){d.widget("ui.mouse",{options:{cancel:":input,option",distance:1,delay:0},_mouseInit:function(){var c=this;this.element.bind("mousedown."+this.widgetName,function(k){return c._mouseDown(k)}).bind("click."+this.widgetName,function(k){if(c._preventClickEvent){c._preventClickEvent=false;k.stopImmediatePropagation();return false}});this.started=false},_mouseDestroy:function(){this.element.unbind("."+this.widgetName)},_mouseDown:function(c){c.originalEvent=c.originalEvent||{};if(!c.originalEvent.mouseHandled){this._mouseStarted&&
this._mouseUp(c);this._mouseDownEvent=c;var k=this,m=c.which==1,n=typeof this.options.cancel=="string"?d(c.target).parents().add(c.target).filter(this.options.cancel).length:false;if(!m||n||!this._mouseCapture(c))return true;this.mouseDelayMet=!this.options.delay;if(!this.mouseDelayMet)this._mouseDelayTimer=setTimeout(function(){k.mouseDelayMet=true},this.options.delay);if(this._mouseDistanceMet(c)&&this._mouseDelayMet(c)){this._mouseStarted=this._mouseStart(c)!==false;if(!this._mouseStarted){c.preventDefault();
return true}}this._mouseMoveDelegate=function(a){return k._mouseMove(a)};this._mouseUpDelegate=function(a){return k._mouseUp(a)};d(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate);d.browser.safari||c.preventDefault();return c.originalEvent.mouseHandled=true}},_mouseMove:function(c){if(d.browser.msie&&!c.button)return this._mouseUp(c);if(this._mouseStarted){this._mouseDrag(c);return c.preventDefault()}if(this._mouseDistanceMet(c)&&
this._mouseDelayMet(c))(this._mouseStarted=this._mouseStart(this._mouseDownEvent,c)!==false)?this._mouseDrag(c):this._mouseUp(c);return!this._mouseStarted},_mouseUp:function(c){d(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate);if(this._mouseStarted){this._mouseStarted=false;this._preventClickEvent=c.target==this._mouseDownEvent.target;this._mouseStop(c)}return false},_mouseDistanceMet:function(c){return Math.max(Math.abs(this._mouseDownEvent.pageX-
c.pageX),Math.abs(this._mouseDownEvent.pageY-c.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return true}})})(jQuery);
(function(d){d.ui=d.ui||{};var c=/left|center|right/,k=/top|center|bottom/,m=d.fn.position,n=d.fn.offset;d.fn.position=function(a){if(!a||!a.of)return m.apply(this,arguments);a=d.extend({},a);var b=d(a.of),e=(a.collision||"flip").split(" "),f=a.offset?a.offset.split(" "):[0,0],h,i,j;if(a.of.nodeType===9){h=b.width();i=b.height();j={top:0,left:0}}else if(a.of.scrollTo&&a.of.document){h=b.width();i=b.height();j={top:b.scrollTop(),left:b.scrollLeft()}}else if(a.of.preventDefault){a.at="left top";h=i=
0;j={top:a.of.pageY,left:a.of.pageX}}else{h=b.outerWidth();i=b.outerHeight();j=b.offset()}d.each(["my","at"],function(){var g=(a[this]||"").split(" ");if(g.length===1)g=c.test(g[0])?g.concat(["center"]):k.test(g[0])?["center"].concat(g):["center","center"];g[0]=c.test(g[0])?g[0]:"center";g[1]=k.test(g[1])?g[1]:"center";a[this]=g});if(e.length===1)e[1]=e[0];f[0]=parseInt(f[0],10)||0;if(f.length===1)f[1]=f[0];f[1]=parseInt(f[1],10)||0;if(a.at[0]==="right")j.left+=h;else if(a.at[0]==="center")j.left+=
h/2;if(a.at[1]==="bottom")j.top+=i;else if(a.at[1]==="center")j.top+=i/2;j.left+=f[0];j.top+=f[1];return this.each(function(){var g=d(this),o=g.outerWidth(),p=g.outerHeight(),l=d.extend({},j);if(a.my[0]==="right")l.left-=o;else if(a.my[0]==="center")l.left-=o/2;if(a.my[1]==="bottom")l.top-=p;else if(a.my[1]==="center")l.top-=p/2;l.left=parseInt(l.left);l.top=parseInt(l.top);d.each(["left","top"],function(q,r){d.ui.position[e[q]]&&d.ui.position[e[q]][r](l,{targetWidth:h,targetHeight:i,elemWidth:o,
elemHeight:p,offset:f,my:a.my,at:a.at})});d.fn.bgiframe&&g.bgiframe();g.offset(d.extend(l,{using:a.using}))})};d.ui.position={fit:{left:function(a,b){var e=d(window);e=a.left+b.elemWidth-e.width()-e.scrollLeft();a.left=e>0?a.left-e:Math.max(0,a.left)},top:function(a,b){var e=d(window);e=a.top+b.elemHeight-e.height()-e.scrollTop();a.top=e>0?a.top-e:Math.max(0,a.top)}},flip:{left:function(a,b){if(b.at[0]!=="center"){var e=d(window);e=a.left+b.elemWidth-e.width()-e.scrollLeft();var f=b.my[0]==="left"?
-b.elemWidth:b.my[0]==="right"?b.elemWidth:0,h=-2*b.offset[0];a.left+=a.left<0?f+b.targetWidth+h:e>0?f-b.targetWidth+h:0}},top:function(a,b){if(b.at[1]!=="center"){var e=d(window);e=a.top+b.elemHeight-e.height()-e.scrollTop();var f=b.my[1]==="top"?-b.elemHeight:b.my[1]==="bottom"?b.elemHeight:0,h=b.at[1]==="top"?b.targetHeight:-b.targetHeight,i=-2*b.offset[1];a.top+=a.top<0?f+b.targetHeight+i:e>0?f+h+i:0}}}};if(!d.offset.setOffset){d.offset.setOffset=function(a,b){if(/static/.test(d.curCSS(a,"position")))a.style.position=
"relative";var e=d(a),f=e.offset(),h=parseInt(d.curCSS(a,"top",true),10)||0,i=parseInt(d.curCSS(a,"left",true),10)||0;f={top:b.top-f.top+h,left:b.left-f.left+i};"using"in b?b.using.call(a,f):e.css(f)};d.fn.offset=function(a){var b=this[0];if(!b||!b.ownerDocument)return null;if(a)return this.each(function(){d.offset.setOffset(this,a)});return n.call(this)}}})(jQuery);
