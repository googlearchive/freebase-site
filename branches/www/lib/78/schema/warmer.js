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
;(function($, fb) {


    function init() {
        // warm one domain at a time
        warm_next();
    };


    function warm_next(current) {
        var next = null;
        if (current) {
            next = current.next(".warmer");
        }
        else {
            next = $(".warmer:first");
        }
        if (next.length) {
            warm(next);
        }
    };

    function warm(row) {

        var domain_id = row.attr("data-id");

        var status = $("<span>&nbsp;loading...</span>");

        $.ajax({
            url: "/_schema_warmer",
            data: {
                id: domain_id,
                lang: fb.lang
            },
            dataType: "jsonp",
            beforeSend: function() {
                row.addClass("warmer-loading");
                row.append(status);
            },
            success: function(data) {
                var types = loaded_types(data.types || []).hide();
                row.append(types);
                types.slideDown(function() {
                    status.html("<span>&nbsp;loaded</span>");
                    row.addClass("warmer-success");
                });                
            },
            error: function() {
                status.html("<span>&nbsp;error</span>");
                row.addClass("warmer-error");
            },
            complete: function() {
                row.removeClass("warmer-loading");
                warm_next(row);
            }
        });
    };

    function loaded_types(types) {
        var ul = $("<ul>");
        $.each(types, function(i, t) {
            var li = $("<li>");
            li.append("<span>" + t + "</span>");
            ul.append(li);
        });
        return ul;
    };


    $(init);


})(jQuery, window.freebase);
