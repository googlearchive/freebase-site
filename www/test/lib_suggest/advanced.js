$(function() {

  module("advanced", module_options);

  test("advanced parsing", function() {

      var tests = [
        "bob dylan", 
        ["bob dylan", [], {}],

        "bob dylan type", 
        ["bob dylan type", [], {}],

        "bob dylan type:", 
        ["bob dylan type:", [], {}],          

        "type:",
        ["type:", [], {}],

        " type:album",
        ["", ["type:album"], {}],

        "bob dylan type:\"music artist\"", 
        ["bob dylan", ["type:\"music artist\""], {}],

        "Dear... name{full}:Dear... type:/film/film",
        ["Dear...", ["name{full}:Dear...", "type:/film/film"], {}],

        // spaces before/after ':' are ignored as filters
        "Monty Python: Life of Brian",
        ["Monty Python: Life of Brian", [], {}],

        "bob dylan a: b  c: d e",
        ["bob dylan a: b c: d e", [], {}],

        // only pick out valid filters
        "bob a:b c   d e: f g h:", 
        ["bob c d e: f g h:", ["a:b"], {}],

        "bob a:b c : d:e {foo}:\"hello world\" dylan",
        ["bob c : dylan", ["a:b", "d:e", "{foo}:\"hello world\""], {}]
      ];

      for (var i=0,l=tests.length; i<l; i+=2) {
          var v = tests[i];
          var expected = tests[i+1];
          same($.suggest.parse_input(v), expected);
      }

      // SEARCH_PARAM overrides
      tests = [
        'bob dylan lang:de',
        ['bob dylan', [], {lang:'de'}],

        'lang:ko dae han min guk format:"ENTITY"',
         ['dae han min guk', [], {lang:'ko', format:'ENTITY'}],

        'lang:ru Some Russian Name type:"/film/film" Another Name',
        ['Some Russian Name Another Name', ['type:"/film/film"'], {lang:'ru'}]
      ];

      for (var i=0,l=tests.length; i<l; i+=2) {
          var v = tests[i];
          var expected = tests[i+1];
          same($.suggest.parse_input(v), expected);
      }
  });

  test("check_mql_key", function() {
      var valid = [
          "A", "a", "0", "a-b", "0-A-9_", "0-",
          "abc", "1023", "$30DE$30C4$30BF$30B1", "$30DEa-z$30C4_$30BF4$30B1-"
      ];
      var invalid = [
          "a$001",
          "0.ca",
          "$30DE$30C4$30BF$30B"  // incomplete hex
      ];
      $.each(valid, function(i, n) {
          ok($.suggest.check_mql_key(n), n);
      });
      $.each(invalid, function(i, n) {
          ok(!$.suggest.check_mql_key(n), n);
      });
  });

  test("check_mql_id", function() {
      var valid = [
          "/", "/freebase", "/type/type", "/film/film/property", "/0/1/2", 
          "/A/b_-", "/wikipedia/ja/$30DE$30C4$30BF$30B1","/_"
      ];
      var invalid = [
          "/freebase/", "#9202a8c04000641f80000000010c393g",
          "#00000000000000000000000000000000", "foobar", "", "!/freebase", "/A/-"
      ];
      $.each(valid, function(i, n) {
          ok($.suggest.check_mql_id(n), n);
      });
      $.each(invalid, function(i, n) {
          ok(!$.suggest.check_mql_id(n), n);
      });
  });

  test("is_system_type", function() {
      var valid = [
          "/type/domain", "/type/type", "/type/property",
          "/type/user", "/type/namespace", "/type/collection"
      ];
      var invalid = [
          null, "", "/m/03_x5t", "/people/profession", "/en/barack_obama",
          "/type", "/user", "/common/topic", "/common/image"
      ];
      $.each(valid, function(i, n) {
          ok($.suggest.is_system_type(n), n);
      });
      $.each(invalid, function(i, n) {
          ok(!$.suggest.is_system_type(n), n);
      });
  })

});
