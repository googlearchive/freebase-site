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

(function($, fb, formlib) {

    var incomingContent = {};
    var loadedContent = {};
    var loadedFlags = [];
    var flagSearchParams = {};
    var loadedFlagsCursor = null;
    var preloadDirection = 1;
    var currentDiv = null;
    var currentFlag = 0;
    var divCounter = 0;
    var waitingOnContent = true;
    var waitingOnFlags = false;
    var hotList = [];

    function IncomingContent(flag) {
        this.flag = flag;
    }
    function LoadedContent(flag, html, loc) {
        this.flag = flag;
        this.html = html;
        this.location = loc;
    }
    function flagsReceived(response) {
        loadedFlagsCursor = response.cursor;
        loadedFlags = loadedFlags.concat(response.flags);
        var duplicateCheck = loadedFlags.slice().sort();
        for (var i = 0, l = duplicateCheck.length - 1; i < l; i++) {
            if (duplicateCheck[i] === duplicateCheck[i + 1]) {
                loadedFlags.splice(loadedFlags.indexOf(duplicateCheck[i]), 1);
            }
        }
        if (response.cursor === false) {
            loadedFlags.push(-1);
        }
        if (waitingOnFlags) {
            removeButtonListeners();
            attachButtonListeners();
            waitingOnFlags = !waitingOnFlags;
            loadNextAvailable();
        }
    }
    function contentReceived(flag, html) {
        if (html === 'invalid' || html === 'notaflag') {
            incomingContent[flag] = null;
            loadedFlags.splice(loadedFlags.indexOf(flag), 1);
            return loadNextAvailable();
        }

        var incoming = incomingContent[flag];
        incomingContent[flag] = null;

        var newDiv = $(document.createElement('div'));
        var newId = 'content' + divCounter++;
        newDiv.hide();
        newDiv.attr('id', newId);
        newDiv.appendTo('#storage');
        newDiv.html(html);

        var loaded = new LoadedContent(flag, html, newId);
        loadedContent[flag] = loaded;

        if (waitingOnContent && loadedFlags[currentFlag] === flag) {
            waitingOnContent = false;
            transitionToFlag(flag);
            loadNextAvailable();
        }
    }
    function loadNextAvailable() {
        var flagOfInterest = waitingOnContent ? currentFlag : currentFlag + preloadDirection;
        if (flagOfInterest < 0) {
            return;
        }
        if (flagOfInterest >= loadedFlags.length) {
            if (!waitingOnFlags) {
                waitingOnFlags = true;
                loadFlags();
            }
        } else {
            var mid = loadedFlags[flagOfInterest];
            if (mid === -1) {
                if (waitingOnContent) {
                    waitingOnContent = false;
                    removeButtonListeners();
                    transitionToComplete();
                }
            } else {
                if (loadedContent[mid]) {
                    if (loadedContent[mid].location === null) {
                        var newDiv = $(document.createElement('div'));
                        var newId = 'content' + flagOfInterest;
                        newDiv.hide();
                        newDiv.attr('id', newId);
                        newDiv.appendTo('#storage');
                        newDiv.html(loadedContent[mid].html);
                        loadedContent[mid].location = newId;
                    }
                    if (waitingOnContent) {
                        waitingOnContent = false;
                        transitionToFlag(mid);
                        loadNextAvailable();
                    }
                } else if (!incomingContent[mid]) {
                    loadContent(mid);
                }
            }
        }
    }
    function loadFlags() {

        flagSearchParams.limit = 5;
        if (loadedFlagsCursor) {
            flagSearchParams.cursor = loadedFlagsCursor;
        }

        $.ajax($.extend(formlib._default_ajax_options('GET'), {
            url: fb.h.ajax_url('flagsearch.ajax'),
            data: flagSearchParams,
            dataType: 'JSON',
            onsuccess: function(data) {
                flagsReceived(data.result);
            },
            onerror: function(error) {
               transitionToError(error);
            }
        }));
    }
    function loadContent(mid) {

        var newIncoming = new IncomingContent(mid);
        incomingContent[mid] = newIncoming;

        $.ajax($.extend(formlib._default_ajax_options('GET'), {
            dataType: 'JSON',
            url: fb.h.ajax_url('flagcontent.ajax'),
            data: { 'flag': mid },
            onsuccess: function(data) {
                contentReceived(mid, data.result.html);
            },
            onerror: function(error) {
                transitionToError(error);
            }
        }));
    }

    function transitionToError(msg) {
        $('#errormsg').html($('#errormsg').html() + JSON.stringify(msg));
        transitionToDiv('errormsg');
        removeButtonListeners();
    }
    function transitionToComplete() {
        transitionToDiv('complete');
    }
    function transitionToFlag(mid) {
        transitionToDiv(loadedContent[mid].location);
    }
    function transitionToDiv(div) {

        var inDiv = $('#' + div);
        var outDiv = (currentDiv) ? $(currentDiv) : null;
    
        if (!inDiv) {
            return;
        }

        var width = $(window).width();
        var finalPosition = (preloadDirection === 1) ? width : -width;

        var animationsCompleted = 0;

        function transitionComplete() {

            currentDiv = inDiv;
            inDiv.removeAttr('style');

            if (outDiv) {
                outDiv.hide();
                outDiv.css({
                    'left': '',
                    'width': '',
                    'position': ''
                });
            }

            if (currentFlag + 5 < loadedFlags.length) {
                var highFlag = loadedFlags[currentFlag + 5];
                if (highFlag !== -1) {
                    if (loadedContent[highFlag]) {
                        $('#' + loadedContent[highFlag].location).remove();
                        loadedContent[highFlag].location = null;
                    }
                }
            }
            if (currentFlag >= 5) {
                var lowFlag = loadedFlags[currentFlag - 5];
                if (loadedContent[lowFlag]) {
                    $('#' + loadedContent[lowFlag].location).remove();
                    loadedContent[lowFlag].location = null;
                }
            }

            attachButtonListeners();
        }

        removeButtonListeners();

        inDiv.css({
            'position': 'absolute',
            'left': finalPosition,
            'width': width
        });
        inDiv.show();

        inDiv.animate({left: 0},{
            duration: 'normal',
            complete: function() {
                animationsCompleted++;
                if (animationsCompleted === 2) {
                    transitionComplete();
                }
            }
        });

        if (outDiv) {
            outDiv.css('position', 'absolute');
            outDiv.css('left', 0);
            outDiv.css('width', width);

            outDiv.animate({left: -finalPosition}, {
                duration: 'normal',
                complete: function() {
                    animationsCompleted++;
                    if (animationsCompleted === 2) {
                        transitionComplete();
                    }
                }
            });
        } else {
            animationsCompleted++;
        }
    }
    function modalForm(obj) {
        var form_options = {
            'form': obj,
            'init': $.noop,
            'validate': function() {
                return true;
            },
            'submit': $.noop
        };
        formlib.init_modal_form(form_options);
    }
    function attachButtonListeners() {

        if (currentDiv == null) {
            return;
        }
        currentDiv.find('.toggle-share').find('button').click(function() {
            currentDiv.find('.sharing-options').toggle();
            return false;
        });
        currentDiv.find('#link-to-flag').click(function() {
            $('#queue-link-to-flag').find('#link-text')
                .val(fb.h.legacy_fb_url('/review', '?flags=') + loadedFlags[currentFlag]);
            modalForm($('#queue-link-to-flag'));
            return false;
        });
        currentDiv.find('#add-link-to-list').click(function() {
            if (hotList.indexOf(loadedFlags[currentFlag]) === -1) {
                hotList.push(loadedFlags[currentFlag]);
            }
            $(this).text('Added');
            $(this).off('click');
            return false;
        });
        currentDiv.find('#get-link-list').click(function() {
            if (hotList.length === 0) {
                hotList.push(loadedFlags[currentFlag]);
            }
            $('#queue-link-to-flag').find('#link-text')
                .val(fb.h.legacy_fb_url('/review', '?flags=') + hotList.join(','));
            modalForm($('#queue-link-to-flag'));
            return false;
        });
        currentDiv.find('.toggle-discuss').find('button').click(function() {
            var id = $(this).parent(".toggle-discuss").attr("data-id");
            fb.discuss.toggle_discuss(id);
            return false;
        });
        currentDiv.find('.vote-form').find('button').click(function() {
            voteSubmit($(this).parent('.vote-form'));
            forwardProgress();
            return false;
        });
        currentDiv.find(':submit').removeAttr('disabled');

        if (currentFlag > 0) {
            $('.queue-back-button').click(backwardProgress);
            $('.queue-back-button').removeAttr('disabled');
            $('.queue-back-button').show();
        } else {
            $('.queue-back-button').off('click');
            $('.queue-back-button').attr('disabled', true);
            $('.queue-back-button').hide();
        }
        if (loadedFlags.length - 1 > currentFlag) {
            $('.queue-forward-button').click(forwardProgress);
            $('.queue-forward-button').removeAttr('disabled');
            $('.queue-forward-button').show();
        } else {
            $('.queue-forward-button').off('click');
            $('.queue-forward-button').attr('disabled', true);
            $('.queue-forward-button').hide();
        }

        $(document).keypress(function(e) {
            if (e.keyCode === 106) { // j --> back
                if (currentFlag > 0) {
                    $('.queue-back-button').click();
                }
            } else if (e.keyCode === 107) { // k --> forward
                if (loadedFlags.length - 1 > currentFlag) {
                    $('.queue-forward-button').click();
                }
            } else if (e.keyCode === 97) { // a --> first voting option
                currentDiv.find('.vote-form:eq(0)').find('button').click();
            } else if (e.keyCode === 115) { // s --> second voting option
                currentDiv.find('.vote-form:eq(1)').find('button').click();
            } else if (e.keyCode === 100) { // d --> third voting option
                currentDiv.find('.vote-form:eq(2)').find('button').click();
            } else if (e.keyCode === 102) { // f --> fourth voting option
                currentDiv.find('.vote-form:eq(3)').find('button').click();
            } else if (e.keyCode === 104) { // h --> hot list flag
                currentDiv.find('#add-link-to-list').click();
            } else if (e.keyCode === 108) { // l --> link to hot list
                currentDiv.find('#get-link-list').click();
            } else if (e.keyCode === 116) { // t --> open discuss
                currentDiv.find('.toggle-discuss').click();
            } else if (e.keyCode === 113) { // q --> help panel
                modalForm($('#show-shortcuts'));
            }
        });
    }
    function removeButtonListeners() {
        if (currentDiv == null) {
            return;
        }
        currentDiv.find(':submit').attr('disabled', true);
        currentDiv.find('.vote-form').find('button').off('click');

        currentDiv.find('#link-to-flag').off('click');
        currentDiv.find('#add-link-to-list').off('click');
        currentDiv.find('#get-link-list').off('click');

        currentDiv.find('.toggle-discuss').find('button').off('click');
        currentDiv.find('.toggle-discuss').find('button').attr('disabled', true);
        currentDiv.find('.toggle-share').find('button').off('click');
        currentDiv.find('.toggle-share').find('button').attr('disabled', true);

        $('.queue-back-button').off('click');
        $('.queue-back-button').attr('disabled', true);
        $('.queue-forward-button').off('click');
        $('.queue-forward-button').attr('disabled', true);

        $(document).off('keypress');
    }
    function forwardProgress() {
        progress(1);
    }
    function backwardProgress() {
        progress(-1);
    }
    function progress(direction) {
        removeButtonListeners();
        preloadDirection = direction;
        currentFlag += direction;
        waitingOnContent = true;
        loadNextAvailable();
    }
    function voteSubmit(voteForm) {
        $.ajax($.extend(formlib.default_submit_ajax_options({ 'form': voteForm }), {
            url: fb.h.ajax_url('vote.ajax'),
            onsuccess: function(data) {
                fb.status.info(data.result.result);
                $(voteForm).find('button').addClass('cancel');
                $(voteForm).find('button').removeClass('save');
                $(voteForm).siblings('.vote-form').find('button').addClass('save');
                $(voteForm).siblings('.vote-form').find('button').removeClass('cancel');
            },
            onerror: function(data) {
                fb.status.info(data.result);
            }
        }));
    }
    function rebuildSearchParameters(params) {
        if (params.kind) {
            if (params.kind === 'merge' || params.kind === 'split' || 
                    params.kind === 'delete' || params.kind === 'offensive') {
                flagSearchParams.kind = params.kind;
            }
        }
        if (params.domain) {
           flagSearchParams.domain = params.domain;
        }

        // Default to not show flags we've created
        if (!params.created) {
            params.created = 'notcreated';
        }
        if (params.created === 'created') {
            flagSearchParams.created = params.created;
        } else if (params.created === 'both') {
            flagSearchParams.created = null;
        }
        else {
            flagSearchParams.created = 'notcreated';
        }

        // Default to not show flags we've voted on
        if (!params.voted) {
            params.voted = 'notvotedon';
        }
        if (params.voted === 'votedon') {
            flagSearchParams.voted = params.voted;
        } else if (params.voted === 'both') {
            flagSearchParams.voted = null;
        }
        else {
            flagSearchParams.voted = 'notvotedon';
        }

        // Default to not show admin flags
        if (!params.admin) {
            params.admin = 'nonadmin';
        }
        if (params.admin === 'adminonly') {
            flagSearchParams.admin = params.admin;
        } else if (params.admin === 'both') {
            flagSearchParams.admin = params.admin;
        } else {
            flagSearchParams.admin = 'nonadmin';
        }
    }

    $(function() {
        var params = fb.c.params;
        if (params.flags.length > 0) {
            loadedFlags = params.flags.slice(0);
        } else {
            rebuildSearchParameters(params);
        }
        loadNextAvailable();        
    });


})(jQuery, window.freebase, window.formlib);
