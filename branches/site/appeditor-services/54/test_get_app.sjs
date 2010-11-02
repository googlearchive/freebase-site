acre.require('/test/lib').enable(this);

test('check get_app',{args:{appid:'//fmdb'}}, function() {
  var result = acre.test.urlfetch();
  equals(result.status,200, 'get_app should be able to load this app');
});

acre.test.report();

