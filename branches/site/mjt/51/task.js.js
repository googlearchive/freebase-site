
/**
 *  asynchronous task framework
 *
 *  a task works like a callback but with more goodies.
 *  tasks provide:
 *   - a simple state machine: 'init' -> 'wait' -> ( 'ready' or 'error' )
 *   - separate .onready(...) and .onerror(...) callbacks.
 *     callbacks can be specified as functions or as bound methods
 *     using the syntax of mjt.vthunk().
 *   - optional timeout
 *   - optional prerequisites (other tasks that must be ready)
 *   - chaining of the above functions (inspired by jQuery)
 *
 *  uses:
 *    util.js
 *
 */

(function(mjt){

// unique value to signal ok constructor usage.
// this is used to detect if a user tries to create a Task using "new".
var _safe_constructor_token = ['safe_constructor_token'];

/**
 *  this is a clone of jQuery.isFunction()
 */
var isFunction = function (fn)  {
    // This may seem like some crazy code, but trust me when I say that this
    // is the only cross-browser way to do this. --John
    return !!fn && typeof fn != "string" && !fn.nodeName &&
    fn.constructor != Array && /function/i.test( fn + "" );
};

/**
 *  this is a clone of jQuery.makeArray()
 */
var makeArray = function( a ) {
    var r = [];

    // Need to use typeof to fight Safari childNodes crashes
    if ( typeof a != "array" )
	for ( var i = 0, al = a.length; i < al; i++ )
	    r.push( a[i] );
    else
	r = a.slice( 0 );

    return r;
};



/**
 *  create a callback or continuation function that
 *   acts like a "bound method".
 *
 *  @param method  the name of the method to be invoked in obj,
 *                 or a function to be called as a method
 *                 or <i>null</i> if obj should be called as a function.
 *  @param obj     the instance whose method should be invoked,
 *                 or a function to be invoked.
 *  @param ...     additional arguments are also bound.
 *  @returns       a "thunk" function (or "bound method") that
 *                 will call obj[method] with the bound arguments,
 *                 followed by whatever additional arguments
 *                 were passed to the thunk.
 *
 *  the object, method key, and any other arguments
 *   are bound when mjt.thunk(method, obj, ...) is
 *   invoked.
 *
 */
mjt.thunk = function (method, obj) {
    return mjt.vthunk(arguments);
};


/**
 *  create a thunk.
 *
 *  utility for function currying.
 *    similar to .partial()
 *
 *  this is used to implement on* handlers that
 *   thunk or curry their arguments.  rather than
 *   accepting a single callback function argument,
 *   you can accept a bound method with a partial
 *   argument list.
 *
 *  @returns a thunk object in most cases, unless the
 *  argument is a single callback function in which
 *  case it is returned untouched.
 *
 *  a thunk is a function object with the following
 *  additional properties:
 *   thunk.bound_this
 *   thunk.bound_func
 *   thunk.bound_args
 *   thunk.thunk_id
 *
 *  vthunk has several call forms:
 *
 *    vthunk(arguments) or
 *    vthunk([arg0, ...]))
 *      if the first argument is an array, vthunk treats it
 *        as the argument list and then tries one of the
 *        forms below:
 *
 *    vthunk(bound_method_name, bound_this, bound_arg_0, ...)
 *      if the first argument is a string, vthunk treats it
 *        as a method name.  the second argument must be an
 *        object, which will be bound as this.
 *
 *      when thunk(call_arg_0, ...) is executed, this will happen:
 *        bound_this[bound_method_name](bound_arg_0, ..., call_arg_0, ...)
 *
 *    vthunk(bound_function, bound_arg_0, ...)
 *      otherwise the first argument must be a function.
 *      bound_this will be set to null.
 *
 *      when thunk(call_arg_0, ...) is executed, this will happen:
 *        bound_function(bound_arg_0, ..., call_arg_0, ...)
 *      (except this===null inside bound_function, rather than this===window)
 *
 *    vthunk(bound_function)
 *      in this case the thunk doesn't actually do much
 *      except slow down calls, so we return bound_function
 *      as the thunk itself.
 *      no annotation of the function object is done since
 *      it may be shared.
 *      because we're getting out of the way, bound_function
 *      will be called with this===window.
 *
 */
mjt.vthunk = function () {
    var bound_this, bound_func, bound_args;

    var arg0 = arguments[0];
    if (typeof arg0 == 'object' && typeof arg0.length == 'number') {
        bound_args = makeArray(arg0);
    } else {
        bound_args = makeArray(arguments);
    }

    arg0 = bound_args.shift();
    if (typeof arg0 == 'string') {
        bound_this = bound_args.shift();
        bound_func = arg0;

        // it's technically ok if bound_this[bound_func] doesn't exist yet,
        //  but probably an error
        if (!isFunction(bound_this[bound_func])) {
            mjt.warn('mjt.thunk:', bound_func, 'is not a method of', bound_this);
        }
    } else {
        // pass "this" through when the thunk is called
        bound_this = null;
        bound_func = arg0;

        // bound_func really should be a function
        if (!isFunction(bound_func)) {
            mjt.error('mjt.thunk:', bound_func, 'is not a function');
        }
    }

    // these are for debugging recognition only
    var thunk_id = arguments.callee._next_thunk_id || 1;
    arguments.callee._next_thunk_id = thunk_id + 1;

    var thunk = function() {
        //mjt.log('CALL THUNK', thunk_id, obj, method);

        var self = arguments.callee;
        var call_args = self.bound_args.concat(makeArray(arguments));
        var obj = self.bound_this===null ? this : self.bound_this;
        var func = self.bound_func;
        if (typeof func == 'string')
            func = obj[func];

        if (!isFunction(func)) {
            mjt.error('mjt.thunk: bad function', self, self.bound_func, obj);
        }

        return func.apply(obj, call_args);
    };

    // a thunk is a javascript Function, for speed and
    //   for most common usage.
    // but it's nice to treat it like an object in some ways.
    // so instead of just capturing the environment we explicitly
    // save the bits we need.
    thunk.bound_this = bound_this;
    thunk.bound_func = bound_func;
    thunk.bound_args = bound_args;
    thunk.thunk_id = thunk_id;

    //mjt.log('NEW THUNK', thunk_id, thunk);

    return thunk;
}

/**
 *  call a thunk spec immediately, using the same signature
 *   as mjt.vthunk.  useful when you are ready to build
 *   a thunk but can call it immediately instead for
 *   speed.
 *
 *  @param this       this is passed through to the thunk
 *  @param thunkspec  an array describing the thunk
 *  @param ...        extra args are appended to the thunk call
 *  @returns          the result of calling the thunk
 *
 *  @see mjt.vthunk
 */

mjt.vcall = function (thunkspec) {
    // slow for now
    var call_args = makeArray(arguments).slice(1);
    return mjt.vthunk(thunkspec).apply(this, call_args);
};

/**
 *  call a thunk spec immediately.
 *   useful when you are ready to build
 *   a thunk but can call it immediately instead for
 *   speed.
 *
 *  @param this       this is passed through to the thunk
 *  @param thunkspec  an array describing the thunk
 *  @param call_args  an array of extra arguments
 *  @returns          the result of calling the thunk
 *
 *  @see mjt.vthunk
 */
mjt.vapply = function (thunkspec, call_args) {
    // slow for now
    return mjt.vthunk(thunkspec).apply(this, call_args);
};



/**
 *  @class a class representing an asynchronous task
 *
 *  the state machine cycle of a task is
 *    init --> wait --> ( ready | error )
 *
 *  you can request a callback for either or both of
 *    the two final states.  if the callback is another
 *    instance of mjt.Task, it will use a special interface?
 *
 *  @see mjt.Task.onready
 *  @see mjt.Task.onerror
 *  @see mjt.Task.ondone
 *
 *  @constructor this constructor should never be called explicitly.
 *
 */
mjt.Task = function () {
    // nothing should be done in here - this used as a base class
    // use mjt.Task.prototype.init for initializing instance vars

    if (arguments.length !== 1 ||
        arguments[0] !== _safe_constructor_token) {
            mjt.error('new mjt.Task() is illegal');
            throw new Error("don't call mjt.Task()");
   }
};

/**
 *  string pretty-printer
 */
mjt.Task.prototype.toString = function() {
    return '[' + this._task_id + ']';
};

/**
 *  html pretty-printer
 */
mjt.Task.prototype.toMarkup = function () {
    return '<span class="mjt_task">task '
        + this._task_id + ':' + this.state + '</span>';
};


// provide Object.getPrototypeOf implementation according to 
//  http://ejohn.org/blog/objectgetprototypeof/
if ( typeof Object.getPrototypeOf !== "function" ) {
    if ( typeof "test".__proto__ === "object" ) {
        Object.getPrototypeOf = function(object){
            return object.__proto__;
        };
    } else {
        Object.getPrototypeOf = function(object){
            // May break if the constructor has been tampered with
            return object.constructor.prototype;
        };
    }
}

/**
 *  Return a new task factory function.
 *
 *  @param sooper a superclass task type, or undefined/null/false
 *  @param params a list of parameter declarations.
 *  @returns a Task type - this should be called without "new"
 *
 *  @see mjt.Task.prototype.init
 */
mjt.define_task = function(sooper, params) {
    var task_ctor = function () {
        var obj;
        var args = makeArray(arguments);

        // called with new: check that this was was done
        // by the system (passing a secret token) rather than
        // by the user.
        if (this instanceof arguments.callee) {
            if (args.length !== 1 ||
                args[0] !== _safe_constructor_token) {
                throw new Error('Task class should not be invoked with new ()');
            } else {
                // called internally: do nothing
                return undefined;
            }
        } else {
            // called without new
            // recursively invoke ourselves as a constructor
            //  to set obj.__proto__=ctor.
            // we deliberately use "new" here to skip any
            //  instance initialization.
            // when we are reinvoked we will hit the
            // "called internally: do nothing" case above.
            obj = new arguments.callee(_safe_constructor_token);

            // XXX the _factory points to the namespace where the constructor
            // was found, e.g "mjt.freebase".  mostly this is no longer needed,
            // since the service_url is stored in a global now rather than
            // in the mjt.freebase object.  there are a few remaining references
            // to task._factory that need to be removed before this can go away.
            // note that there is also TemplateCall._factory which is more important.
            obj._factory = this;

            //mjt.log('FUNCALL', arguments.callee);
        }

        // invoke the task constructors (the .init() methods) from base to leaf.
        //  this means reversing the inheritance chain first.

        var tmpa = [];
        for (var tmp = arguments.callee;
             tmp !== undefined;
             tmp = tmp.__super) {
            tmpa.push(tmp);
        }
        while (tmpa.length) {
            var ctor = tmpa.pop();
            if (ctor.prototype.hasOwnProperty('init'))
                ctor.prototype.init.apply(obj, args);
        }

        // for backwards compatibility, some acre tasks call .enqueue()
        // automatically when a task is constructed.  this switch enables
        // that behavior.
        if (typeof arguments.callee._auto_enqueue != 'undefined') {
            // enqueue immediately
            obj.enqueue();
        }

        return obj;
    };

    // set up a superclass
    if (!sooper)
        sooper = mjt.Task;

    // the subclass prototype is an instance of the superclass
    task_ctor.prototype = new sooper(_safe_constructor_token);
    task_ctor.prototype.constructor = task_ctor;

    // IE doesn't let you get access to the prototype chain,
    // so we need to explicitly link the subclass with the superclass.
    task_ctor.__super = sooper;
    
    task_ctor.prototype.parameters = params || [];
    return task_ctor;
};



/**
 *  the default timeout for set_timeout, in milliseconds.
 *  this is currently set to 10 seconds.
 *  the value has not been tuned for general use.
 *  the freebase.com service will usually time out a
 *   request after 8 seconds so longer than that.
 *
 *  @type int (milliseconds)
 *  @see mjt.Task.set_timeout
 */
mjt.Task._default_timeout = 10000;

/**
 *  a dict of tasks that are in wait state.
 *
 */
mjt.Task.pending = null;

// waiting callbacks
mjt.Task._on_pending_empty = [];

/**
 *  add a task to the pending list
 *
 */
mjt.Task.add_pending = function (task) {
    if (this.pending == null)
        this.pending = {};
    this.pending[task._task_id] = task;
};

/**
 *  remove a task from the pending list, and notify
 *  if the pending list is empty.
 *
 */
mjt.Task.delete_pending = function (task) {
    if (this.pending === null || !(task._task_id in this.pending))
        return;
    delete this.pending[task._task_id];

    for (var pk in this.pending)
        return;

    this.pending = null;

    while (this.pending == null && this._on_pending_empty.length)
        this._on_pending_empty.shift().ready();
};

/**
 *  set up instance variables from this.parameters and arguments
 *
 *  @param ... arguments are interpreted according to this.parameters
 *  @returns this
 *  this[param.name] is set for each argument
 *
 *  right now parameters only have .name but later
 *  they may have defaults and docstrings.
 *
 */
mjt.Task.prototype.init = function() {
    //mjt.log('TASK INIT', this.parameters, arguments);
    mjt.assert(typeof this.state === 'undefined');
    this.state = 'init';

    this._onready = [];
    this._onerror = [];
    this._timeout = null;
    this._prereqs = {};

    this._task_id = mjt.uniqueid(this._task_class ? this._task_class : 'task');

    mjt.Task.add_pending(this);

    for (var i = 0; i < this.parameters.length; i++) {
        var param = this.parameters[i];
        this[param.name] = typeof arguments[i] != 'undefined'
            ? arguments[i] : param['default'];
    }

    return this;
};


/**
 *  set a failure timeout on a task
 *
 */
mjt.Task.prototype.set_timeout = function (msec) {
    if (typeof msec === 'undefined')
        msec = mjt.Task._default_timeout;

    if (this._timeout !== null)
        mjt.error('timeout already set');

    // rhino never times out
    if (typeof setTimeout != 'undefined')
        this._timeout = setTimeout(mjt.thunk('timeout', this), msec);

    return this;
};

mjt.Task.prototype.clear_timeout = function () {
    // clear any timeout if present
    if (this._timeout !== null)
        clearTimeout(this._timeout);
    this._timeout = null;

    return this;
};



/**
 *  add a task dependency.
 *
 * if you only depend on one task, it's probably simpler
 *  to just use onready and onerror on that task.  if you
 *  have to wait for multiple tasks to succeed before
 *  finishing, use this.
 *
 * @see mjt.Task.enqueue
 * @see mjt.Task.request
 *
 * when .enqueue() is called on the parent task, it will
 * be called on all subtasks.
 * if any prereq tasks go into error state, so does this.
 * when *all* required tasks are ready, this.request() is called.
 * otherwise, wait.
 *
 * @parm task  the task depended upon
 */
mjt.Task.prototype.require = function (prereq) {
    // if we are already ready, adding prereqs is illegal
    if (this.state !== 'init')
        throw new Error('task.enqueue() already called - too late for .require()');

    // avoid dependency bookkeeping if prereq is already ready
    if (prereq.state == 'ready')
        return this;

    // if we are already in error state, we're not going anywhere.
    if (this.state == 'error')
        return this;

    // ok, we're in wait state

    // pass on any immediate errors
    if (prereq.state == 'error')
        return this._prereq_error(prereq);

    // ok, we're both in wait state.  set up the dependency.
    this._prereqs[prereq._task_id] = prereq;
    
    prereq
        .onready('_prereq_ready', this, prereq)
        .onerror('_prereq_error', this, prereq);

    return this;
};

/**
 *  declare that no more prereqs are needed.
 *
 *  you *must* call this if you have called .require(),
 *   or the ready state will never be reached.
 * 
 * in server-side (synchronous) operation you don't need to call .enqueue().
 *
 * @parm task  the task depended upon
 *
 * @see mjt.Task.require
 */
mjt.Task.prototype.enqueue = function () {
    // don't warn about redundant enqueues, they happen too often
    if (this.state != 'init')
        return this;

    this.state = 'wait';

    if (mjt.Task.debug) {
        mjt.openlog(this, '.enqueue()');
    }    
    
    try {
        for (var k in this._prereqs)
            this._prereqs[k].enqueue();
    
        return this._prereqs_check();
    } finally {
        mjt.closelog();
    }
};

mjt.Task.prototype._prereqs_check = function () {
    // _prereqs is initialized as an empty array.
    // it may be set to null here to indicate that 
    // all prereqs have succeeded.
    
    // if prereqs have been cleaned out, we already did this
    if (this._prereqs === null)
        return this;

    // if there are any remaining prereqs, bail
    for (var prereq in this._prereqs)
        return this;

    if (this.state == 'init')
        return this;

    // looks like all prereqs are ready
    //  (since error prereqs cause errors immediately)
    this._prereqs = null;
    this.request();
    return this;
};


/**
 *  called when all prerequisites are ready
 *
 *  "subclasses" may override this method to
 *  do anything once prerequisites are ready.
 *
 *  many of the properties and methods here are
 *  marked hidden with _ prefixing to avoid namespace
 *  conflicts.  subclasses should avoid the _ prefix.
 *
 */
mjt.Task.prototype.request = function() {
    // should be overridden
    return this.ready();
};



// callback when a prerequisite task succeeds
mjt.Task.prototype._prereq_ready = function (prereq) {
    if (this._prereqs === null)
        return this;
    delete this._prereqs[prereq._task_id];
    return this._prereqs_check();
};

// callback when a prerequisite task fails
mjt.Task.prototype._prereq_error = function (prereq) {
    if (this._prereqs === null)
        return this;

    // errors get passed through immediately
    this._prereqs = null;
    var msg = prereq.messages[0];
    return this.error(msg.code, msg.message, msg.text);
};


/**
 *  request a callback if the task reaches 'ready' state
 *
 */
mjt.Task.prototype.onready = function (THUNK_ARGS) {
    if (this.state == 'ready') {
        mjt.vcall(arguments, this.result);
    } else if (this._onready instanceof Array) {
        this._onready.push(mjt.vthunk(arguments));
    }
    return this;
};

/**
 *  request a callback if the task reaches 'error' state
 *
 */
mjt.Task.prototype.onerror = function (THUNK_ARGS) {
    if (this.state == 'error') {
        var code = this.messages[0].code;
        var message = this.messages[0].message;
        var full = this.messages[0].text;

        mjt.vcall(arguments, code, message, full);
    } else if (this._onerror instanceof Array) {
        this._onerror.push(mjt.vthunk(arguments));
    }
    return this;
};

/**
 *  request a callback if the task reaches
 *   either 'ready or 'error' state.
 *
 */
mjt.Task.prototype.ondone = function (THUNK_ARGS) {
    this.onready.apply(this, arguments);
    this.onerror.apply(this, arguments);
    return this;
};

// internal, common to ready() and error()
mjt.Task.prototype._state_notify = function (state, callbacks, args) {

    // mjt.Task.debug is set by mjt.App.init()
    if (!mjt.Task.debug) {
        // fastpath if debug is turned off
        for (var i = 0; i < callbacks.length; i++) {
            var cb = callbacks[i];
            cb.apply(this, args);
        }
        return this;
    }

    for (var i = 0; i < callbacks.length; i++) {
        var cb = callbacks[i];

        if (typeof cb.bound_func !== 'undefined')
            mjt.openlog(this, '.on'+state, ' -> '+cb.bound_this+'.', cb.bound_func, cb.bound_args, cb);
        else
            mjt.openlog(this, '.on'+state, cb);

        try {
            cb.apply(this, args);
        } finally {
            mjt.closelog();
        }
    }

    return this;
};


/**
 *   put the task in ready state, saving the result arg
 *
 */
mjt.Task.prototype.ready = function (result) {
    if (this._prereqs !== null) {
        for (var k in this._prereqs) {
            if (typeof this._prereqs[k] == 'undefined')
                continue;

            mjt.error('task.ready() called with remaining prereqs', this);
            throw new Error('task.ready() called with remaining prereqs');
            break;
        }
    }

    // skipping .enqueue() is allowed if you have no prereqs
    if (this.state == 'init') {
        this._prereqs = null;
        this.state = 'wait';
    }

    if (this.state !== 'wait') {
        throw new Error('task.ready() called in bad state "'+this.state+'", should be "wait"');
    }

    this._onerror = null;
    this.clear_timeout();
    this.state = 'ready';

    var callbacks = this._onready;
    this._onready = null;

    this.result = result;

    mjt.Task.delete_pending(this);

    this._state_notify('ready', callbacks, [result]);

    return this;
};

// internal
mjt.Task.prototype._error = function (messages, error_chain) {
    this._prereqs = null;
    this._onready = null;
    this.clear_timeout();

    var callbacks = this._onerror;
    this._onerror = null;

    //mjt.warn('task error', ''+this, messages);

    // skipping .enqueue() is allowed if you have no prereqs
    if (this.state == 'init') {
        this._prereqs = null;
        this.state = 'wait';
    }
    if (this.state !== 'wait') {
        throw new Error('task.error() called in bad state "'+this.state+'". Error was '+messages[0].message);
    }

    this.state = 'error';

    this.messages = messages;

    // nothing is done with this yet
    //  we only report the first error that caused a failure.
    this._error_chain = error_chain;

    var task_info = this;
    //WILL: TODO: we can find the query that caused the problem by looking at this.url
    // But how can we point the user back to the original task (e.g. MqlRead), the query and the line number were it was called?
    // If the user forgets to add an onerror() handler then this info is really useful.
    
    var args = [messages[0].code, messages[0].message, messages[0].text, task_info]; 

    mjt.Task.delete_pending(this);

    this._state_notify('error', callbacks, args);

    return this;
};


/**
 *   put the task in error state, saving the error args
 *
 */
mjt.Task.prototype.error = function (code, message, full) {
    var messages = [{
        code: code,
        message: message,
        text: (typeof full !== 'undefined') ? full : ''
    }];
    return this._error(messages);
};

/**
 *   put the task in error state, passing the error
 *   through from another failed task.
 *
 */
mjt.Task.prototype.error_nest = function (failed_task) {
    return this._error(failed_task.messages, failed_task);
};



/**
 *   re-entry point if the task has a timeout set.
 *
 */
mjt.Task.prototype.timeout = function () {
    // the timeout has fired - erase the token so
    //  we don't try to cancel it later.
    this._timeout = null;

    return this.error('/user/mjt/messages/task_timeout',
                      'task timed out - possible unreachable server?');
};


/**
 *  this task always succeeds immediately.
 * 
 *  useful as a way to group prereqs, for example.
 */
mjt.Succeed = mjt.define_task(null, [{ name: 'succeed_result', 'default':null }]);

mjt.Succeed.prototype.request = function() {
  return this.ready(this.succeed_result);
};

/**
 *  this task always fails immediately.
 */
mjt.Fail = mjt.define_task(null, [{ name: 'fail_code',    'default': 'mjt_fail' },
                                  { name: 'fail_message', 'default': 'error signaled using mjt.Fail' },
                                  { name: 'fail_full',    'default':'' }]);
                                  
mjt.Fail.prototype.request = function () {
    return this.error(this.fail_code, this.fail_message, this.fail_full);
};


/**
 *  delay for a number of milliseconds, then go 'ready'
 */
mjt.Delay = mjt.define_task(null, [{name: 'delay'}]);

mjt.Delay.prototype.request = function () {
    var task = this;
    setTimeout(function () {
        task.ready(null)
    }, this.delay);
};


/**
 *  return a new mjt.Task that will succeed when
 *   the list of pending tasks becomes empty.
 *  this can be used to detect when a page is
 *   quiescent, though it won't catch i/o
 *   requests that weren't done through mjt.Task.
 *
 */
mjt.NoPendingTasks = mjt.define_task();

mjt.NoPendingTasks.prototype.init = function () {
    // otherwise add ourselves as a callback
    mjt.Task._on_pending_empty.push(this);

    // so the existence of this task doesn't create a problem
    // this will also fire 'this' immediately since we already
    // added ourselves to _on_pending_empty.
    mjt.Task.delete_pending(this);
};

mjt.NoPendingTasks.prototype.request = function () {
};

 
})(mjt);
