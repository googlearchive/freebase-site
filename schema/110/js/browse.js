(function($, fb) {

  $(function() {
    $('#schema-search-input')
        .suggest(
            $.extend(fb.suggest_options.any(
              'type:/type/domain', 'type:/type/type', 'type:/type/property'), {
              scoring: 'schema'
            }))
        .bind('fb-select', function(e, data) {
          window.location.href = fb.h.fb_url(data.id, {
            'schema': '',
            'lang': fb.h.lang_code(fb.lang)
          });
        });
  });

})(jQuery, window.freebase);
