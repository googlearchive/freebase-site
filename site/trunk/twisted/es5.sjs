/**
* Add es5 features
*/
Object.create = Object.create || function(p) {
  if (arguments.length != 1)
    throw new Error("Can't simulate 2nd arg");
  function f() {}; // Crockford's trick
  f.prototype = p;
  return new f();
};

Object.keys = Object.keys || function(o) {
  var result = [];
  for(var name in o) {
    if (o.hasOwnProperty(name))
      result.push(name);
  }
  return result;
};

Function.prototype.prebind = Function.prototype.prebind || function(scope, var_args) {
  // Binds a function to a scope with any arguments bound to the left
  var func = this;
  var left_args = Array.prototype.slice.call(arguments, 1);
  return function(var_args) {
    var args = left_args.concat(Array.prototype.slice.call(arguments, 0));
    return func.apply(scope, args);
  };
};

Function.prototype.postbind = Function.prototype.postbind || function(scope, var_args) {
  // Binds a function to a scope with any arguments bound to the right
  var func = this;
  var right_args = Array.prototype.slice.call(arguments, 1);
  return function(var_args) {
    var args = Array.prototype.slice.call(arguments, 0).concat(right_args);
    return func.apply(scope, args);
  };
};

Function.prototype.bind = Function.prototype.bind || Function.prototype.prebind;