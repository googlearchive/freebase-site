
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

/** jquery.mqlkey.test.js **/
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

  function run_tests() {
    var key;
    var source;

    QUnit.testStart = function(name) {
      key = $("#key");
      source = $("#source");
    };

    test("init", function() {
      var inst = key.mqlkey().data("mqlkey");
      ok(inst, "mqlkey initialized");
    });

    var key_test = {
      valid: [
        "a",
        "abcd",
        "e_f",
        "h_4",
        "i_1_j",
        "e345",
        "l_m_o_p_3r4"
      ],
      invalid: [
        "",
        "1",
        "-",
        "_",
        "-_-",
        "a__b",
        "c--d",
        "a!@#$%^&*()",
        "1abc",
        "_abc",
        "-abc",
        "abc_",
        "abc-"
      ]
    };

    test("valid keys check_key=true", key_test.valid.length, function() {
      key.mqlkey({check_key:true});
      var tests = key_test.valid;
      var current = 0;
      key
        .bind("valid", function(e, val) {
          ok(true, "valid: " + val);
          if (current < tests.length) {
            key.val(tests[current++]).trigger("keyup");
          }
          else {
            start();
          }
        })
        .bind("invalid", function(e, msg) {
          ok(false, "valid expected: " + msg);
          start();
        });
      stop(5000);
      key.val(tests[current++]).trigger("keyup");
    });

    test("valid keys check_key=false", key_test.valid.length, function() {
      key.mqlkey({check_key:false});
      var tests = key_test.valid;
      var current = 0;
      key
        .bind("valid", function(e, val) {
          ok(true, "valid: " + val);
          if (current < tests.length) {
            key.val(tests[current++]).trigger("keyup");
          }
          else {
            start();
          }
        })
        .bind("invalid", function(e, msg) {
          ok(false, "valid expected: " + msg);
          start();
        });
      stop(5000);
      key.val(tests[current++]).trigger("keyup");
    });

    test("invalid keys check_key=true", key_test.invalid.length, function() {
      key.mqlkey({check_key:true});
      var tests = key_test.invalid;
      var current = 0;
      key
        .bind("valid", function(e, val) {
          ok(false, "invalid expected: " + val);
          start();
        })
        .bind("invalid", function(e, msg) {
          ok(true, "invalid: " + msg);
          if (current < tests.length) {
            key.val(tests[current++]).trigger("keyup");
          }
          else {
            start();
          }
        });
      stop(5000);
      key.val(tests[current++]).trigger("keyup");
    });

    test("invalid keys check_key=false", key_test.invalid.length, function() {
      key.mqlkey({check_key:false});
      var tests = key_test.invalid;
      var current = 0;
      key
        .bind("valid", function(e, val) {
          ok(false, "invalid expected: " + val);
          start();
        })
        .bind("invalid", function(e, msg) {
          ok(true, "invalid: " + msg);
          if (current < tests.length) {
            key.val(tests[current++]).trigger("keyup");
          }
          else {
            start();
          }
        });
      stop(5000);
      key.val(tests[current++]).trigger("keyup");
    });

    test("valid minlen", 1, function() {
      key.mqlkey({minlen:5, check_key: false});
      key
        .bind("valid", function(e, val) {
          ok(true, "valid: " + val);
          start();
        });
      stop(5000);
      key.val("abcde").trigger("keyup");
    });

    test("invalid minlen", 1, function() {
      key.mqlkey({minlen:5, check_key: false});
      key
        .bind("invalid", function(e, msg) {
          ok(true, "invalid: " + msg);
          start();
        });
      stop(5000);
      key.val("abcd").trigger("keyup");
    });

    test("valid check_key", 1, function() {
      key.mqlkey({check_key: true, namespace: "/"});
      key
        .bind("valid", function(e, val) {
          ok(true, "valid: " + val);
          start();
        });
      stop(5000);
      key.val("foobar").trigger("keyup");
    });

    test("invalid check_key", 1, function() {
      key.mqlkey({check_key: true, namespace: "/"});
      key
        .bind("invalid", function(e, msg) {
          ok(true, "invalid: " + msg);
          start();
        });
      stop(5000);
      key.val("film").trigger("keyup");
    });

    test("valid source", 2, function() {
      key.mqlkey({check_key: true, namespace: "/", source:"#source"});
      key.bind("valid", function(e, val) {
        equal(val, "foo_bar", "valid");
        equal(key.val(), "foo_bar", "valid");
        start();
      });
      stop(5000);
      source.val("1Foo-Bar-").trigger("change");
    });

    test("invalid source", 1, function() {
      key.mqlkey({check_key: true, namespace: "/", source:source});
      key.bind("invalid", function(e, msg) {
        ok(true, "invalid:" + msg);
        start();
      });
      stop(5000);
      source.val("Film").trigger("change");
    });

  };

  $(run_tests);

})(jQuery);
