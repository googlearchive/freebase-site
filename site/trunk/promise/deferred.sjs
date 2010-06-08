// ----Deferreds for Acre----

// Deferreds encapsulate asynchronous operations by notifying users of
// the result of operations, and providing pipelined chaining of callbacks.

// Based on the CommonJS spec for promises:
// http://wiki.commonjs.org/wiki/Promises

// Inspired by implementations for node and dojo:
// http://github.com/kriszyp/node-promise
// http://bugs.dojotoolkit.org/browser/tags/release-1.5.0rc1/dojo/_base/Deferred.js

// Written by Bryan Culbertson
// BSD Licensed - http://creativecommons.org/licenses/BSD/

acre.require("es5");

// Exports
var Deferred;
var unresolved, resolved, rejected;
var when, whenPromise;
var all, first, seq;
var RequestCanceled, RequestTimeout;

(function() {
  
  // --- Possible Errors for Deferreds ---
  RequestCanceled = function() {}
  RequestCanceled.prototype = Error;
  
  RequestTimeout = function() {}
  RequestTimeout.prototype = Error;
  
  // --- Deferred Implementation ---
  Deferred = function() {
    var result, finished;
    var waiting = [];
    var promise = this.promise = {};
    
    function complete(value) {
      if (finished) {
        throw new Error("This deferred has already been resolved");
      }
      result = value;
      finished = true;
      waiting.forEach(function(listener) {
        notify(listener);
      });
    }
    
    function notify(listener) {
      var func = (result instanceof Error ? listener.error : listener.resolved);
      if (func) {
          try {
            var new_result = func(result);
            when(new_result, listener.deferred.resolve, listener.deferred.reject);
          } catch(e) {
            listener.deferred.reject(e);
          }
      
      } else {
        if (result instanceof Error) {
          listener.deferred.reject(result);
        } else {
          listener.deferred.resolve(result);
        }
      }
    }
    
    // calling resolve will resolve the deferred
    var resolve = this.resolve = function(value) {
      complete(value);
      return promise;
    };
    
    // calling error will indicate that the deferred failed
    var reject = this.reject = function(error) {
      if (!(error instanceof Error)) {
          // Turn it into an error
          error = new Error(""+error);
      }
      complete(error);
      console.warn(""+error, error);
      return promise;
    };
    
    var then = this.then = promise.then = function(callback, errback) {
      var return_deferred = new Deferred();
      var listener = {
        resolved: callback,
        error: errback,
        deferred: return_deferred
      }; 
      
      if (finished) {
        notify(listener);
      } else {
        waiting.push(listener);
      }
      return return_deferred.promise;
    };
    
    var cancel = this.cancel = promise.cancel = function(reason) {
      // Cancels the asynchronous operation
      if (!finished){
        reject(new CanceledRequest(reason));
      }
    }
    
  }
  
  unresolved = function() {
    return new Deferred();
  }
  
  resolved = function(value) {
    return unresolved().resolve(value);
  }
  
  rejected = function(error) {
    return unresolved().reject(error);
  }
  
  function is_promise(value) {
    return value && typeof value.then === "function";
  }
  
  // Call either the async or sync function depending on
  //  whether value is a promise or not, returns a 
  //  promise for when its fulfilled
  function perform(value, async, sync){
    try {
      if (is_promise(value)) {
        value = async(value);
      } else {
        value = sync(value);
      }
      
      if (is_promise(value)) {
        return value;
      }
      
      return resolved(value).promise;
    } catch(e) {
      return rejected(e).promise;
    }
  }
  
  /**
   * Returns a promise with callback and errback already
   *   set on the promise
   */
  whenPromise = function(value, callback, errback) {
    return perform(value, 
      function(value) {
        return value.then(callback, errback);
      },
      function(value) {
        return callback(value);
      }
    );
  };
  
  /**
   * Takes any value and calls either the callback 
   *   or the errback depending on value
   */
  when = function(value, callback, errback) {
    if (is_promise(value)){
      return whenPromise(value, callback, errback);
    }
    
    if (value instanceof Error) {
      return errback(value);
    } else {
      return callback(value);
    }
  };
  
  /**
   * Takes an array or dict of promises and returns a promise that 
   * is fulfilled when all of those promises have been fulfilled
   */
  all = function(promises) {
    var deferred = unresolved();
    
    var fulfilled = 0;
    var length = promises.length;
    var results = [];
    
    if (length === 0) {
      deferred.resolve(results)
    } else {
      array.forEach(function(promise, index){
        when(promise, each, each);
        function each(value){
          results[index] = value;
          fulfilled++;
          if(fulfilled === length){
            deferred.resolve(results);
          }
        }
      });
    }
    return deferred.promise;
  };

  /**
   * Takes an array or dict of promises and returns a promise that 
   * is fulfilled when the first of those promises have been fulfilled
   */
  any = function(promises){
    var deferred = unresolved();
    var fulfilled;
    array.forEach(function(promise, index){
      when(promise, function(value){
        if (!fulfilled) {
          fulfilled = true;
          deferred.resolve(value);
        }  
      },
      function(error){
        if (!fulfilled) {
          fulfilled = true;
          deferred.resolve(error);
        }  
      });
    });
    return deferred.promise;
  };

  
})();