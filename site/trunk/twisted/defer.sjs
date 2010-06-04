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

/**
*  Convert all errors in deferreds into a standard failure object
*/
var Failure = Object.create({});

Failure.init = function(error) {
    if (error instanceof Error) {
        this.error = error;
        return error;
    }
    
    // Then create something that is an error
    this.error = new Error(""+error);
    return this;
};
    
Failure.trap = function(var_args) {
    for each(var error in arguments) {
        if (this.error instanceof error) {
            return;
        }
    }
    
    throw this.error;
};
    
Failure.toString = function() {
    return this.error.toString();
};

/**
*  A Task that supports callback/errback chaining
*/
var Deferred = acre.task.define(null, []);

//------Deferred Public API------//

Deferred.prototype.addCallback = function(func, var_args) {
    var args = Array.prototype.slice.call(arguments, 1);
    args.unshift(this);
    var bound_func = func.postbind.apply(func, args);
    return this._add_call({callback: bound_func});
};

Deferred.prototype.addErrback = function(func, var_args) {
    var args = Array.prototype.slice.call(arguments, 1);
    args.unshift(this);
    var bound_func = func.postbind.apply(func, args);
    return this._add_call({errback: bound_func});
};

Deferred.prototype.addBoth = function(func, var_args) {
    var args = Array.prototype.slice.call(arguments, 1);
    args.unshift(this);
    var bound_func = func.postbind.apply(func, args);
    return this._add_call({errback: bound_func, callback: bound_func});
};

Deferred.prototype.addCallbacks = function(cb_func, eb_func, var_args) {
    var args = Array.prototype.slice.call(arguments, 2);
    args.unshift(this);
    return this._add_call({
        errback: cb_func.postbind.apply(cb_func, args),
        callback: eb_func.postbind.apply(eb_func, args)
    });
};

Deferred.prototype.callback = function(data) {
    this.result = data;
    return this.enqueue();
};

Deferred.prototype.errback = function(error) {
    this._add_error(error);
    return this.enqueue();
};


//------Helper methods for deferreds------//

Deferred.prototype.request = function() {
    // Any Tasks based on Deferred need this to be the last line in request()
    this._run_callstack();
};

Deferred.prototype._add_error = function(error) {
    if (error instanceof Failure) {
        this.result = error;
    } else {
        var failure = Object.create(Failure);
        failure.init(error);
        this.result = failure;
    }
    console.error(this.result.toString(), this.result);
    return this.result;
}

Deferred.prototype._add_call = function(call_state) {
    if (!this.callstack) {
        this.callstack = [];
    }
    
    this.callstack.push(call_state);
    
    if (this.state === "error" || this.state === "ready") {
        this._run_callstack();
    }
    
    return this;
};

Deferred.prototype._run_call = function(func) {
    try {
        // Run the passed in callback or errback and 
        //  update the current result
        var result = func(this.result);
        
        if (result instanceof Failure) {
            this._add_error(result);
            return this._run_callstack();
        } else if (result instanceof Deferred) {
            // If returned a deferred then add it to the callstack
            var self = this;
            result.addCallback(function(data) {
                self.result = data;
                self._run_callstack();
            });
            result.addErrback(function(failure) {
                self._add_error(failure);
                self._run_callstack();
            });
        } else {
            // Otherwise continue down the callstack
            this.result = result;
            return this._run_callstack();
        }
    } catch(e) {
        this._add_error(e);
        return this._run_callstack();
    }
    return this;
}

Deferred.prototype._run_callstack = function() {
    // Keep on running callbacks until we are finished
    
    if (!this.callstack || !this.callstack.length) {
        // When we are done calling all callbacks we will
        //   trigger the appropriate event
        if (this.state === "wait") {
            if (this.result instanceof Failure) {
                this.error(this.result.error);
            } else {
                this.ready(this.result);
            }
        }
        return this;
    }
    
    // Grab the next callstate off of the callstack and run it
    var callstate = this.callstack.shift();
    
    if (this.result instanceof Failure) {
        if (callstate.errback) {
            // We are currently in an error state, so call the errback
            //  if on exists for this callstate
            return this._run_call(callstate.errback);
        }
    } else if (callstate.callback) {
        // We are currently in an success state, so call the callback
        //  if on exists for this callstate
        return this._run_call(callstate.callback);
    }
    
    // callstate doesn't have the required function for the state we are
    //  in so skip this callstate and run the next one
    return this._run_callstack();
};



/**
*  Internal Only -- Underlying Task used for grouping deferreds
*     NOTE: Most of this is lifted directly from mjt.Task
*/
var DeferredGroup = acre.task.define(Deferred, [
  {name: "dgroup"}, 
  {name: "opts", 'default':{}}
]);

// ready when a prerequisite task succeeds
DeferredGroup.prototype._prereq_ready = function (prereq) {
    if (this.opts.fireOnOneCallback === true) {
        this._prereqs = [];
    } else {
        delete this._prereqs[prereq._task_id];
    }
    
    this._prereqs_check();
    return this;
};

// error when a prerequisite task fails
DeferredGroup.prototype._prereq_error = function (prereq) {
    if (this.opts.fireOnOneErrback === true) {
        this._prereqs = null;
        throw failure;
    } else {
        delete this._prereqs[prereq._task_id];
    }
    return this;
};

DeferredGroup.prototype.summarize = function() {
    return null;
}

DeferredGroup.prototype.request = function (prereq) {
    this.result = this.summarize();
    this._run_callstack();
};

DeferredGroup.prototype.enqueue = function () {
    // don't warn about redundant enqueues, they happen too often
    if (this.state != 'init') {
        return this;
    }
    
    this.state = 'wait';
    return this._prereqs_check();
};


/**
*  Group Deferreds in an array
*/
var DeferredList = acre.task.define(DeferredGroup, [
    {name: "dlist"},
    {name: "opts", 'default':{}}
]);

DeferredList.prototype.init = function() {
    for each(var d in this.dlist) {
        this.require(d);
    }
    this.enqueue();
};

DeferredList.prototype.summarize = function() {
    var result = [];
    
    for each(var d in this.dlist) {
        if (d.state === "ready" || d.state === "error") {
            result.push(d.result);
        } else {
            result.push(undefined);
        }
    }
    
    return result;
};


/**
*  Group Deferreds in an object
*/
var DeferredDict = acre.task.define(DeferredGroup, [
    {name: "ddict"},
    {name: "opts", 'default':{}}
]);

DeferredDict.prototype.init = function() {
    for (var key in this.ddict) {
        var d = this.ddict[key];
        this.require(d);
    }
    this.enqueue();
};

DeferredDict.prototype.summarize = function() {
    var result = {};
    
    for (var key in this.ddict) {
        var d = this.ddict[key];
        if (d.state === "ready" || d.state === "error") {
            result[key] = d.result;
        } else {
            result[key] = undefined;
        }
    }
    
    return result;
};


/**
*  Return a Deferred whether func is already a Deferred or a sync function
*/
var maybeDeferred = function(func, args) {
    var result = func.apply(this, args);
    if (result instanceof Deferred) {
        return result;
    } else {
        var d = Deferred();
        // TODO: needs some kind of setTimeout for addCallbacks to register
        d.callback(result);
        return d;
    }
};



/**
*  Make a Deferred fromm an async function with callback and/or errback args
*    - func = function reference
*    - callback_pos = number or dict with callback postiion in func signature
*      - position = array position in arguments
*      - key = key if argument is an object
*    - errback_pos = same as callback_pos, but for errback
*/
function makeDeferred(func, callback_pos, errback_pos) {
    
    function _normalize_pos(pos) {
        switch (typeof pos) {
            case "undefined" :
                return { position: null, key: null };
            case "number" : 
                return { position: pos, key: null };
            case "object" :
                if (pos.position && typeof pos.position !== "number")
                    throw "Callback 'position' property must be a number";
                return pos;
            default :
                throw "Unrecognized type for callback position -- must be a number or object with 'position' and/or 'key' values";
        }
    }
    
    function _place_callback(args, pos, func) {
        if (!pos.position)
            return args;
                    
        if(!pos.key) {
            args[pos.position] = func;
            return args;
        }
        
        if (typeof args[pos.position] !== "object")
            args[pos.position] = {};
        
        args[pos.position][pos.key] = func;
        return args;
    }
    
    return function() {
        var d = Deferred();
        
        args = Array.prototype.slice.call(arguments);        
        _place_callback(args, _normalize_pos(callback_pos), function(res) {
            d.callback(res);
        });
        _place_callback(args, _normalize_pos(errback_pos), function(e) {
            d.errback(e);
        });
        
        try {
            func.apply(null, args);
        } catch(e) {
            d.errback(e);
        }
        return d;
    }
}
