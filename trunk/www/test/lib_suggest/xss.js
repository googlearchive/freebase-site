$(function() {

  var base = {
    teardown: module_options.teardown,
    response: $.suggest.suggest.prototype.response
  };

  module("xss", $.extend({}, module_options, {
    teardown: function() {
      base.teardown.apply();
      $.suggest.suggest.prototype.response = base.response;
    }
  }));

  test("script_injection", function() {
    test_input1.suggest(default_options);
    var inst = get_instance();
    var xss = '<script>$(document.body).append(\'<div id="xss">XSS</div>\')</script>';
    $.suggest.suggest.prototype.response = function(data) {
      var result = data.result;
      if (result && result.length) {
        result[0].name = xss;
      }
      return base.response.apply(this, arguments);
    };
    stop(TIMEOUT_DELAY);
    test_input1
      .bind("fb-select", function(e, data) {
              ok(data);
              equals(data.name, xss);
              var injected = $("#xss");
              ok(!injected.length, "script injection!"); // make sure <script> was not invoked
              start();
            })
      .bind("fb-pane-show", function() {
              if ($(">li", inst.list).length) {
                var first = $("li:first", inst.list).simulate("mouseover");
                simulate_keypress(test_input1, $.simulate.VK_ENTER);
              }
            })
      .focus()
      .val("bob dylan")
      .trigger("textchange");
  });

  test("script_injection strongified", function() {
    test_input1.suggest(default_options);
    var inst = get_instance();
    // bob dylan is a substring therefore will be strongified (split with different markup)
    var xss = 'bob dylan<script>$(document.body).append(\'<div id="xss">XSS</div>\')</script>';
    $.suggest.suggest.prototype.response = function(data) {
      var result = data.result;
      if (result && result.length) {
        result[0].name = xss;
      }
      return base.response.apply(this, arguments);
    };
    stop(TIMEOUT_DELAY);
    test_input1
      .bind("fb-select", function(e, data) {
              ok(data);
              equals(data.name, xss);
              var injected = $("#xss");
              ok(!injected.length, "script injection!"); // make sure <script> was not invoked
              start();
            })
      .bind("fb-pane-show", function() {
              if ($(">li", inst.list).length) {
                var first = $("li:first", inst.list).simulate("mouseover");
                simulate_keypress(test_input1, $.simulate.VK_ENTER);
              }
            })
      .focus()
      .val("bob dylan")
      .trigger("textchange");
  });


  test("link_injection", function() {
    test_input1.suggest(default_options);
    var inst = get_instance();
    var xss = '<a href="javascript:alert(\"XSS\");">click me</a>';
    $.suggest.suggest.prototype.response = function(data) {
      var result = data.result;
      if (result && result.length) {
        result[0].name = xss;
      }
      return base.response.apply(this, arguments);
    };
    stop(TIMEOUT_DELAY);
    test_input1
      .bind("fb-select", function(e, data) {
              ok(data);
              equals(data.name, xss);
              var first = $("li:first", inst.list);
              var injected = $("a", first);
              ok(!injected.length, "link injection!");  // make sure there are no <a> in the item
              start();
            })
      .bind("fb-pane-show", function() {
              if ($(">li", inst.list).length) {
                var first = $("li:first", inst.list).simulate("mouseover");
                simulate_keypress(test_input1, $.simulate.VK_ENTER);
              }
            })
      .focus()
      .val("bob dylan")
      .trigger("textchange");
  });

  test("link_injection strongified", function() {
    test_input1.suggest(default_options);
    var inst = get_instance();
    var xss = '<a href="javascript:alert(\"XSS\");">click me</a>bob dylan';
    $.suggest.suggest.prototype.response = function(data) {
      var result = data.result;
      if (result && result.length) {
        result[0].name = xss;
      }
      return base.response.apply(this, arguments);
    };
    stop(TIMEOUT_DELAY);
    test_input1
      .bind("fb-select", function(e, data) {
              ok(data);
              equals(data.name, xss);
              var first = $("li:first", inst.list);
              var injected = $("a", first);
              ok(!injected.length, "link injection!");  // make sure there are no <a> in the item
              start();
            })
      .bind("fb-pane-show", function() {
              if ($(">li", inst.list).length) {
                var first = $("li:first", inst.list).simulate("mouseover");
                simulate_keypress(test_input1, $.simulate.VK_ENTER);
              }
            })
      .focus()
      .val("bob dylan")
      .trigger("textchange");
  });

  test("script_injection spell", function() {
    test_input1.suggest(default_options);
    var inst = get_instance();
    $.suggest.suggest.prototype.response = function(data) {
      data.correction = ['<a href="#" onclick="prompt(0)">'];
      return base.response.apply(this, arguments);
    };
    stop(TIMEOUT_DELAY);
    test_input1
      .bind('fb-select', function() {
        var spell = $('.fbs-spell-link', inst.pane);
        ok(spell.length, "Got spell link");
        var injected = $('a', spell);
        //  make sure there are no <a> tag
        ok(!injected.length, "xss injection!");
        start();
      })
      .bind("fb-pane-show", function() {
          if ($(">li", inst.list).length) {
            var first = $("li:first", inst.list).simulate("mouseover");
            simulate_keypress(test_input1, $.simulate.VK_ENTER);
          }
      })
      .focus()
      .val("bob dylan")
      .trigger("textchange");
  });
});
