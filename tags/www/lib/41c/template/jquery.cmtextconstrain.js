/**
 * Plugin: jQuery Text-constrain, jquery.cmtextconstrain.js
 * Copyright: Copyright (c) 2011 CMGdigital
 * Version: 1.0.0
 * Author: David A. Enete
 * Date: 24 February 2011
 * Description: jQuery Text-constrain plugin - A jQuery plugin to allow text elements on a page to be constrained by size.
 */

(function($) {
    
    // public methods
    var methods = {
        init: function(options) {
            return this.each(function() {
                var $this = $(this);
                data = $this.data('cmtextconstrain');
                if(!data){
                    opts = $.extend({}, $.fn.cmtextconstrain.defaults, options);
                    $this.data('cmtextconstrain', opts);
                    if(!($this.attr('id'))){
                        var dateObj = new Date();
                        var dateString = String(dateObj.getTime());
                        $this.attr({id: dateString});
                    }
                    cloneID = $this.attr('id') + '_clone';
                    $this.clone().insertBefore($this).attr({id: cloneID});
                    $this.hide();
                    var $elemClone = $('#' + cloneID);
                    
                    // create constrained string
                    if(opts.restrict['type'] == 'words'){
                        var wordArr = $elemClone.text().split(/\s+/);
                        if(wordArr.length <= opts.restrict['limit']){
                            $this.cmtextconstrain('destroy');
                            return;
                        } else {
                            var shortString = wordArr.slice(0,opts.restrict['limit']).join(' ');
                        }
                    } else if(opts.restrict['type'] == 'chars'){
                        if($this.text().length <= opts.restrict['limit']){
                            $this.cmtextconstrain('destroy');
                            return;
                        } else {
                            var charPointer = opts.restrict['limit'];
                            var shortString = $this.text().substr(0,opts.restrict['limit']);
                            var nextChar = '';
                            while(nextChar != ' '){
                                shortString += nextChar;
                                nextChar = $elemClone.text().charAt(charPointer++);
                            }
                        }
                    }
                    shortString += opts.trailingString;
                    
                    $elemClone.text(shortString);
                    $elemClone.append('&nbsp;<a href="javascript:void(0);" class="cmExpose ' + opts.showControl['addclass'] + '" title="' + opts.showControl['title'] + '">' + opts.showControl['string'] + '</a>');
                    $this.append('&nbsp;<a href="javascript:void(0);" class="cmConstrain ' + opts.hideControl['addclass'] + '" title="' + opts.hideControl['title'] + '">' + opts.hideControl['string'] + '</a>');
                    
                    // need to implement delay if event is hover / mouseover
                    $elemClone.find('.cmExpose').bind(opts.event, function(){
                        _expose($this,$elemClone);
                        opts.onExpose.call(this);
                    });
                    $this.find('.cmConstrain').bind(opts.event, function(){
                        _expose($elemClone,$this);
                        opts.onConstrain.call(this);
                    });
                }
            });
        },
        destroy: function(){
            return this.each(function(){
                var $this = $(this);
                data = $this.data('cmtextconstrain');
                if(data){
                    $('#' + $this.attr('id') + '_clone').remove();
                    $this.show().removeData('cmtextconstrain');
                }
            })
        }
    };

    // private methods
    function _expose($elemIn,$elemOut){
        $elemOut.hide();
        $elemIn.show();
    }

    // passing public method calls
    $.fn.cmtextconstrain = function(method){
        if(methods[method]){
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method){
            return methods.init.apply(this, arguments);
        } else {
            console.log('Method ' +  method + ' does not exist on jQuery.cmtextconstrain');
        }
    };

    // setting defaults for the plugin
    $.fn.cmtextconstrain.defaults = {
        event: 'click',
        onExpose: function(){},
        onConstrain: function(){},
        restrict: {type: 'chars', limit: 121}, // ['chars', 'words']
        showControl: {string: '[&nbsp;+&nbsp;]', title: 'Show More', addclass: 'cmShowHide'},
        hideControl: {string: '[&nbsp;-&nbsp;]', title: 'Show Less', addclass: 'cmShowHide'},
        trailingString: '...'
    };

})(jQuery);
