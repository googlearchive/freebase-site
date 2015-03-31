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
;(function($, fb, formlib) {

    fb.schema = fb.schema || {};

    $.extend(fb.schema, {

        /**
         * Create domain flow
         */

        create_domain_begin: function(e) {
            var ajax_options = $.extend(formlib.default_begin_ajax_options(), {
                url: fb.h.ajax_url("lib/schema/create_domain_begin.ajax"),
                data: {lang:fb.lang},
                onsuccess: function(data) {
                    var html = $(data.result.html);
                    var event_prefix = "fb.schema.create_domain.";
                    var form_options = {
                        event_prefix: event_prefix,
                        // callbacks
                        init: fb.schema.create_domain_init,
                        validate: fb.schema.create_domain_validate,
                        submit: fb.schema.create_domain_submit,
                        // submit ajax options
                        ajax: {
                            url: fb.h.ajax_url("lib/schema/create_domain_submit.ajax")
                        },
                        // jQuery objects
                        form: html
                    };
                    formlib.init_modal_form(form_options);
                }
            });
            $.ajax(ajax_options);
        },

        create_domain_init: function(options) {
            fb.schema.init_modal_help(options.form);

            var name = $("input[name=name]", options.form)
                .change(fb.schema.create_domain_validate)
                .focus();
            var key = $("input[name=key]", options.form)
                .change(fb.schema.create_domain_validate);
            
            formlib.init_mqlkey(key, {
                mqlread: fb.mqlread,
                namespace: "/base",
                check_key: true,
                source: name,
                schema: true,
                minlen: 5
            });
            key.bind("valid", fb.schema.create_domain_validate)
                .bind("invalid", fb.schema.create_domain_validate);

            // enter key
            $(":input:not(textarea)", options.form)
                .keypress(function(e) {
                    if (e.keyCode === 13 && !e.isDefaultPrevented()) { // enter
                        options.form.trigger(form.event_prefix + "submit");
                    }
                });
        },

        create_domain_validate: function(options) {
            var name = $.trim($("input[name=name]", options.form).val());
            if (name === "") {
                options.form.trigger(options.event_prefix + "error", "Name is required");
                formlib.disable_submit(options);
                return false;                
            }
            var key = $("input[name=key]", options.form);
            if (formlib.validate_mqlkey(options, key)) {
                formlib.enable_submit(options);
                return true;
            }
            else {
                formlib.disable_submit(options);
                return false;
            }
        },

        create_domain_submit: function(options, ajax_options) {
            var name = $("input[name=name]", options.form);
            var key = $("input[name=key]", options.form);
            var description = $("textarea[name=description]", options.form);
            $.extend(ajax_options.data, {
                name: name.val(),
                key: key.val(),
                description: description.val()
            });
            
            $.ajax($.extend(ajax_options, {
                onsuccess: function(data) {
                    window.location = data.result.location;
                }
            }));
        },


        /**
         * Delete domain flow
         */

        delete_domain_begin: function(id) {
            var ajax_options = $.extend(formlib.default_begin_ajax_options(), {
                url: fb.h.ajax_url("lib/schema/delete_domain_begin.ajax"),
                data: {id:id, lang:fb.lang},
                onsuccess: function(data) {
                    var html = $(data.result.html);
                    var event_prefix = "fb.schema.delete_domain.";
                    var form_options = {
                        event_prefix: event_prefix,
                        // callbacks
                        init: fb.schema.delete_domain_init,
                        validate: fb.schema.delete_domain_validate,
                        submit: fb.schema.delete_domain_submit,
                        // submit ajax options
                        ajax: {
                            url: fb.h.ajax_url("lib/schema/delete_domain_submit.ajax")
                        },
                        // jQuery objects
                        form: html
                    };
                    formlib.init_modal_form(form_options);
                }
            });
            $.ajax(ajax_options);
        },

        delete_domain_init: function(options) {
            var can_delete = $("input[name=force]", options.form);
            if (can_delete.length) {
                formlib.enable_submit(options);
            }
        },

        delete_domain_validate: function(options) {
            var can_delete = $("input[name=force]", options.form);
            return can_delete.length;
        },

        delete_domain_submit: function(options, ajax_options) {
            $.ajax($.extend(ajax_options, {
                onsuccess: function(data) {
                    window.location = data.result.location;
                }
            }));
        },


        /**
         * Delete type flow
         */

        delete_type_begin: function(id) {
            var ajax_options = $.extend(formlib.default_begin_ajax_options(), {
                url: fb.h.ajax_url("lib/schema/delete_type_begin.ajax"),
                data: {id:id, lang:fb.lang},
                onsuccess: function(data) {
                    var html = $(data.result.html);
                    var event_prefix = "fb.schema.delete_type.";
                    var form_options = {
                        event_prefix: event_prefix,
                        // callbacks
                        init: fb.schema.delete_type_init,
                        validate: fb.schema.delete_type_validate,
                        submit: fb.schema.delete_type_submit,
                        // submit ajax options
                        ajax: {
                            url: fb.h.ajax_url("lib/schema/delete_type_submit.ajax")
                        },
                        // jQuery objects
                        form: html
                    };
                    formlib.init_modal_form(form_options);
                }
            });
            $.ajax(ajax_options);
        },

        delete_type_init: function(options) {
            var can_delete = $("input[name=force]", options.form);
            if (can_delete.length) {
                formlib.enable_submit(options);
            }
        },

        delete_type_validate: function(options) {
            var can_delete = $("input[name=force]", options.form);
            return can_delete.length;
        },

        delete_type_submit: function(options, ajax_options) {
            $.ajax($.extend(ajax_options, {
                onsuccess: function(data) {
                    window.location = data.result.location;
                }
            }));
        },

        /**
         * Delete property flow
         */

        delete_property_begin: function(id) {
            var ajax_options = $.extend(formlib.default_begin_ajax_options(), {
                url: fb.h.ajax_url("lib/schema/delete_property_begin.ajax"),
                data: {id:id, lang:fb.lang},
                onsuccess: function(data) {
                    var html = $(data.result.html);
                    var event_prefix = "fb.schema.delete_property.";
                    var form_options = {
                        event_prefix: event_prefix,
                        // callbacks
                        init: fb.schema.delete_property_init,
                        validate: fb.schema.delete_property_validate,
                        submit: fb.schema.delete_property_submit,
                        // submit ajax options
                        ajax: {
                            url: fb.h.ajax_url("lib/schema/delete_property_submit.ajax")
                        },
                        // jQuery objects
                        form: html
                    };
                    formlib.init_modal_form(form_options);
                }
            });
            $.ajax(ajax_options);
        },

        delete_property_init: function(options) {
            var can_delete = $("input[name=force]", options.form);
            if (can_delete.length) {
                formlib.enable_submit(options);
            }
        },

        delete_property_validate: function(options) {
            var can_delete = $("input[name=force]", options.form);
            return can_delete.length;
        },

        delete_property_submit: function(options, ajax_options) {
            $.ajax($.extend(ajax_options, {
                onsuccess: function(data) {
                    window.location = data.result.location;
                }
            }));
        },


        /**
         * modal help dialog initialization
         */
        init_modal_help: function(context) {
            // Show/Hide help menu in schema editing modal dialogs
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

    });

})(jQuery, window.freebase, window.formlib);
