/* vim: set tabstop=2 softtabstop=2 shiftwidth=2 fdm=marker: */

/*jshint browser:true, node:true, bitwise:false, boss:true, plusplus:false, indent:2 */
/*globals define:true */

// error, focus, blur, ... does not bubble up
// http://www.w3.org/TR/DOM-Level-3-Events/
(function (root, name) {
  "use strict";
  // you could change those key for delegates object
  var selectorMatchesElement = (function (p) {
    try {
      return (p.matchesSelector || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector);
    }
    catch (e) {
      throw new Error("MatchesSelector is not available"); 
    }
  }(HTMLElement.prototype));
	
  // Helper functions {{{ 1
  /**
   * @helper function
   * @name splitArgumentsAtIndex
   * @function
   * {{{ 2
   * @description Split `Arguments` into primary value and additional params.
   * @param {args} Arguments from anther function
   * @param {len} Number where to split. (only 0 & 1 are tested)
   * @return {Object} Object containing primary and params
   */
  function splitArgumentsAtIndex(args, len) {
    var primary, params;
    args = [].slice.call(args);
    if (len) {
      primary = args.shift();
      params = args;
    }
    else {
      primary = null;
      params = args;
    }

    if (params.length === 1) {
      params = [].concat(params[0] || []);
    }

    return {
      primary: primary,
      params: params
    };
  }	
  // 2 }}}

  /**
   * @helper function
   * @name elementHasClass
   * @function
   * {{{ 2
   * @description Check if element has a className.
   * @param {el} Element to check.
   * @param {String} ClassName to look for.
   * @return {Boolean} Boolean true or false.
   */
  function elementHasClass(el, _className) {
    // has to do this check first because if _className is not present
    // and el is absence as well, it should not return true
    if (!_className) {
      return true;
    }
    if (!el || !el.className) {
      return false;
    }
    try {
      return el.classList.contains(_className);
    }
    catch (e) {
      // so that we do not have to make special case for the 1st / last item
      return (new RegExp("\\b" + _className + "\\b").test(el.className));
    }    
  }
  // 2 }}}

  /**
   * @helper function
   * @name elementFitsDescription
   * @function
   * {{{ 2
   * @description Check if element fits given description.
   * improved from FTLabs' dom-delegate `matches'
   * @param {Element} Element to check.
   * @param {String} selector A CSS selector string to check against.
   * @return {Boolean} Boolean true or false.
   */
  function elementFitsDescription(element, selector) {
    return selectorMatchesElement.call(element, selector);
  }
  // 2 }}}

  /**
   * @helper function
   * @name setProperty
   * @function
   * {{{ 2
   * @description Setting an unenumerable value to an object.
   * @param {obj} Original object which to add the key:value to.
   * @param {key} Key for the value.
   * @param {val} Value to be assigned.
   * @param {writableFlag} Writable or not.
   * @return {object} Created object
   */
  function setProperty(obj, key, val, writableFlag) {
    if (Object.hasOwnProperty("defineProperty")) {
      Object.defineProperty(obj, key, { value: val,
                                        writable : writableFlag || false
      });
    }
    else {
      obj[key] = val;
    }
    return obj;
  }
  // 2 }}}

  /**
   * @helper function
   * @name changeState
   * @function
   * {{{ 2
   * @description Shorthand or toggle state of a delegate.
   * @param {delegateArray} delegateList.delegates
   * @param {_event} A string representing the eventType to listen for.
   * @param {state} Boolean state indicating disabled/enabled.
   */
  function changeState(delegateArray, item, state) {
    var i, delegateItem;
    for (i = 0; delegateItem = delegateArray[i]; i++) {
      if (delegateItem[delegateSelector] === item) {
        delegateItem.disabled = !!state;
        break;
      }
    }
  }
  // 2 }}}

  /**
   * @helper function
   * @name getEventTarget
   * @function
   * {{{ 2
   * @description get event target (might not be necessary)
   * @param {String} A string representing the eventType to listen for.
   * @return {Element} event target as element.
   */
  function getEventTarget(_event) {
    _event = _event || window.event;
    return _event.target || _event.srcElement;
  }
  // 2 }}}

  /**
   * @helper function
   * @name preventDefault
   * @function
   * {{{ 2
   * @description call preventDefault if this event is cancelable
   * @param {Event} event.
   */
  function preventDefault(_event) {
    if (_event.cancelable) {
      _event.preventDefault();
    }
  }
  // 2 }}}

  /**
   * @helper function
   * @name execute
   * @function
   * {{{ 2
   * @description execute function with scope
   * @param {func} func Function to be executed.
   * @param {scope} scope Scope where func gets executed in.
   * @param {delegates} DelegateList that holds current delegate.
   */
  function execute(func, scope, delegates) {
    if (func) {
      func.call(scope, delegates);
    }
  }
  // 2 }}}

  /**
   * @helper function
   * @name setEnv
   * @function
   * {{{ 2
   * @description set environment for EventList/DelegateList functions
   * @param {Object} scope Scope to look for singletons
   * @return {Object} Previously created singleton object or self
   */
  function setEnv(scope) {
    var _self, _previousInstance = scope.constructor.__registered__[scope.getRootElementSelector()];
    if (_previousInstance) {
      _self = (_previousInstance.scope)[_previousInstance.variable] || scope;
    }
    else {
      _self = scope;
    }
    _previousInstance = null;
    return _self;
  }
  // 2 }}}

  /**
   * @helper function
   * @name addEventListenerHelper
   * @function
   * {{{ 2
   * @description A simple wrapper for addEventListener with attachEvent fallback
   * @param {element} string String denoting the rootElement.
   * @param {_event} A string representing the eventType to listen for.
   * @param {_obj} Object that receives a notification when specified event occurs.
   *               see addEventListener on MDN for more details
   */
  function addEventListenerHelper(element, _event, _obj) {
    if (element.addEventListener) {
      element.addEventListener(_event, _obj, useCapture);
    }
    else if (element.attachEvent) {
      element.attachEvent("on" + _event, _obj);
    }
  }
  // 2 }}}

  /**
   * @helper function
   * @name removeEventListenerHelper
   * @function
   * {{{ 2
   * @description A simple wrapper for removeEventListener with dettachEvent fallback
   * @param {element} string String denoting the rootElement.
   * @param {_event} A string representing the eventType to listen for.
   * @param {_obj} Object that receives a notification when specified event occurs.
   *               see addEventListener on MDN for more details
   */
  function removeEventListenerHelper(element, _event, _obj) {
    if (element.removeEventListener) {
      element.removeEventListener(_event, _obj);
    }
    else if (element.detachEvent) {
      element.detachEvent("on" + _event, _obj);
    }
  }
  // 2 }}}

  // 1 }}}

  // DelegateList {{{ 1
  /**
   * @DelegateList constructor
   * @name DelegateList
   * @function
   * {{{ 2
   * @description Constructor for delegates method object/array.
   * create a object simular to array
   * better not subclassing JavaScript Array
   * https://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array
   */
  function DelegateList() {
    /*jshint validthis:true */
    this.disabled = false;
    this.unlistened = false;
    this.delegates = [];

    //return this;
  }
  // 2 }}}

  /**
   * @DelegateList function
   * @name DelegateList.getEventType
   * @function
   * {{{ 2
   * @description Get eventType for this DelegateList.
   * @return {string} String denoting eventType for this DelegateList.
   */
  DelegateList.prototype.getEventType = function () {
    return this.__event__ || "undefined";
  };
  // 2 }}}

  /**
   * @DelegateList function
   * @name DelegateList.disable
   * @function
   * {{{ 2
   * @description Disable a certain listener.
   * BE WARNED: (about JavaScript object referencing)
   * this methods suffers the same fortune/misfortune of JavaScript language,
   * Objects are passing around by reference.
   * So if you are to pass the same object to different eventType,
   * DelegateList.disable/enable will disable all those objects
   * We left this quirk here intentionally,
   * because sometimes this is the preferred behavior.
   * If you need to change this behavior, you should clone your object before
   * sending them to the DelegateList.listen/EventList.listen
   * we do not use this.disable to modify the master disable switch
   * because user might accidentally calls this method without giving an argument
   * for that circumstance, we should do nothing
   * instead, we use disableAll to modify the master disable switch
   * @param {String} item String denoting listener object to disable.
   * @return {Object} DelegateList object (this).
   */
  DelegateList.prototype.disable = function (item) {
    if (item) {
      changeState(this.delegates, item, true);
    }
    return this;
  };
  // 2 }}}

  /**
   * @DelegateList function
   * @name DelegateList.enable
   * @function
   * {{{ 2
   * @description Enable a certain listener.
   * BE WARNED: (about JavaScript object referencing)
   * see the explanation above for DelegateList.disable
   * @param {String} item String denoting listener object to enable.
   * @return {Object} DelegateList object (this).
   */
  DelegateList.prototype.enable = function (item) {
    if (item) {
      changeState(this.delegates, item, false);
    }
    return this;
  };
  // 2 }}}

  /**
   * @DelegateList function
   * @name DelegateList.disable
   * @function
   * {{{ 2
   * @description Enable all listeners for this particular eventType.
   * we do not use this.disable to modify the master disable switch
   * because user might accidentally calls this method without giving an argument
   * for that circumstance, we should do nothing
   * instead, we use disableAll to modify the master disable switch
   * @param {String} item String denoting listener object to disable.
   * @return {Object} DelegateList object (this).
   */
  DelegateList.prototype.disableAll = function () {
    this.disabled = true;
    return this;
  };
  // 2 }}}

  /**
   * @DelegateList function
   * @name DelegateList.enable
   * @function
   * {{{ 2
   * @description Disable all listeners for this particular eventType.
   * @param {String} item String denoting listener object to enable.
   * @return {Object} DelegateList object (this).
   */
  DelegateList.prototype.enableAll = function () {
    this.disabled = false;
    return this;
  };
  // 2 }}}

  /**
   * @DelegateList function (internal function)
   * @name DelegateList.handleEvent
   * @function
   * {{{ 2
   * @description Actual function to attach events.
   * we all know that we could bind object in addEventListener
   * http://w3.org/TR/DOM-Level-2-Events/events.html
   * provided there is a `handleEvent' property in the object
   * here is the trick, we COULD use a function to generate an object with
   * `handleEvent' nicely hidden inside its `prototype'
   * @param {_event}  A string representing the event type to listen for.
   */
  DelegateList.prototype.handleEvent = function (_event) {
    // master switch
    if (this.disabled || this.delegates.length === 0) {
      preventDefault(_event);
      return;
    }

    var i, item, targetElement = getEventTarget(_event), _rootElement = this.getRootElement();

    for (i = 0; item = this.delegates[i]; i++) {
      if (item.disabled) {
        preventDefault(_event);
        continue;
      }
      // FIXME: add documentation explaining why we use this instead of querySelector match
      // traverse element's parentNodes to check for a match
      // this is `manual` event bubbling
      while (targetElement !== _rootElement && targetElement !== _d) {
        if (elementFitsDescription(targetElement, item[delegateSelector])) {
          _event.stopPropagation();
          execute(item[delegateFunction], targetElement, _event, this);
          break;
        }
        targetElement = targetElement.parentNode;
      }
    } // end of for loop
    _rootElement = null;
  };
  // 2 }}}

  /**
   * @DelegateList function
   * @name DelegateList.listen
   * @function
   * {{{ 2
   * @description  Bind (extra) listeners to a certain eventType.
   * BE WARNED: (about JavaScript object referencing)
   * see the explanation above for DelegateList.disable
   * @param {Object/Array} Array or or multiple addEventListener objects .
   * @return {Object} DelegateList object (this).
   */
  DelegateList.prototype.listen = function () {
    // make arguments an array
    var args, arr, i, item;
    args = splitArgumentsAtIndex(arguments, 0);
    arr = args.params;

    this.delegates = this.delegates || [];
    for (i = 0; item = arr[i]; i++) {
      if (item.hasOwnProperty(delegateSelector)) {
        this.delegates.push(item);
      }
    }
    
    if (this.unlistened === true) {
      addEventListenerHelper(this.getRootElement(), this.__event__, this);
      this.unlistened = false;
    }
  };
  // 2 }}}

  /**
   * @DelegateList function
   * @name DelegateList.listen
   * @function
   * {{{ 2
   * @description Called removeEventListener to some listeners for current eventType.
   * @param {} item String denoting listener object to enable.
   * @return {Object} DelegateList object (this).
   */
  DelegateList.prototype.unlisten = function () {
    removeEventListenerHelper(this.getRootElement(), this.__event__, this);
    this.unlistened = true;
  };
  // 2 }}}

  /**
   * @DelegateList function
   * @name DelegateList.isUnlistened
   * @function
   * {{{ 2
   * @description Check if a certain eventType is listened to.
   * @return {Object} DelegateList object (this).
   */
  DelegateList.prototype.isUnlistened = function () {
    return this.unlistened || false;
  };
  // 2 }}}

  /**
   * @DelegateList function
   * @name DelegateList.getEventList
   * @function
   * {{{ 2
   * @description Return the EventList object in which the DelegateList lies.
   * @return {Object} EventList object.
   */
  DelegateList.prototype.getEventList = function () {
    return this.constructor.constructor;
  };
  // 2 }}}

  // 1 }}}

  // EventList {{{ 1
  /**
   * @EventList constructor
   * @name EventList
   * @function
   * {{{ 2
   * @description Constructor for event delegate list.
   * create a object simular to array
   * better not subclassing JavaScript Array
   * https://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array
   * @param {element} Element which all event listener registered to.
   * @param {registeredVariable} String of the singleton name.
   * @param {variableScope} Scope where singleton variable is stored.
   * @return {object} Previously created singleton object or self.
   */
  function EventList(element, registeredVariable, variableScope) {
    /*global jQuery:true*/
    var selectorString = null;
    element = element || _d;

    if ("jQuery" in window && element instanceof jQuery) {
      selectorString = element.selector;
      element = element[0];
    }
    else if (typeof element === "string") {
      if (element === "document") {
        selectorString = element;
        element = _d;
      }
      else if ("querySelector" in _d) {
        selectorString = element;
        element = _d.querySelector(selectorString);
        if (!element) {
          throw new TypeError("Unable to parse element: unexpected response from querySelector.");
        }
      }
    }
    else if (element.length) {
      element = element[0];
    }
    
    if (element === _d) {
      selectorString = "document";
    }
    else if (element === _d.body) {
      selectorString = "body";
    }
    else if (!selectorString && element.id) {
      selectorString = "#" + element.id;
    }


    
    if (!element.addEventListener && !element.attachEvent) {
      throw new Error("Unable to find addEventListener and attachEvent on element.");
    }

    // record every instance's variable name (if possible)
    // By the hidden info, we could make each new EventList a singleton
    // if we re-instantiated EventList, it will return proper object
    this.constructor.__registered__ = this.constructor.__registered__ || {};
    
    var _previousInstance = this.constructor.__registered__[selectorString];
    // FIXME compare __root__ for better matching
    if (_previousInstance) {
      if ((_previousInstance.scope)[_previousInstance.variable]) {
        return (_previousInstance.scope)[_previousInstance.variable];
      }
      _previousInstance = null;
    }
    else if (registeredVariable) {
      variableScope = variableScope || root;
      variableScope[registeredVariable] = this;
      // Object key must be string
      // or must have identical value when toString is called
      // http://www.hacksparrow.com/object-as-javascript-objects-key.html
      this.constructor.__registered__[selectorString] =
                                          { "variable"  : registeredVariable,
                                            "scope"     : variableScope
                                          };
      
    }

    setProperty(this, "__root__", element);

    if (selectorString) {
      setProperty(this, "__rootSelector__", selectorString);
    }
  }
  // 2 }}}

  /**
   * @EventList constructor
   * @name EventList.listen
   * @function
   * {{{ 2
   * @description Bind (extra) listeners to a certain eventType.
   * BE WARNED: (about JavaScript object referencing)
   * see the explanation above for DelegateList.disable
   * if the eventType is `Unlistened`, it will be re-attached.
   * focus and blur does NOT bubble up, so they are not supported.
   * @param {arr} arr Array or or multiple addEventListener objects.
   * @return {object} Previously created singleton object or self
   */
  EventList.prototype.listen = function () {
    var args, _event, arr, _self = setEnv(this);
    args = splitArgumentsAtIndex(arguments, 1);
    _event = args.primary;

    if (!_event) {
      return _self;
    }
    
    if (!(("on" + _event) in _d.body)) {
      throw new TypeError(_event + " unavailable.");
    }

    arr = args.params;
    // singleton for every event
    if (!_self.hasOwnProperty(_event)) {
      _self[_event] = new DelegateList();
      _self[_event].constructor.constructor = _self;
      // so when calling listen, it will add eventListener
      _self[_event].unlistened = true;
      // FIXME: until we have a better solution
      // all object created by DelegateList will be contaminated
      setProperty(_self[_event], "__event__", _event);

    }
    _self[_event].listen(arr);
    
    arr = null;

    return _self;
  };
  // 2 }}}

  /**
   * @EventList function
   * @name EventList.unlisten
   * @function
   * {{{ 2
   * @description Called removeEventListener for a certain eventType.
   * only add a flag not to listen and removeEventListener
   * does NOT remove the EventList item
   * @param {String} _event String denoting eventType.
   * @return {Object} Previously created singleton object or self.
   */
  EventList.prototype.unlisten = function (_event) {
    var _self = setEnv(this);

    removeEventListenerHelper(_self.getRootElement(), _event, _self[_event]);
    _self[_event].unlistened = true;
    
    return _self;
  };
  // 2 }}}

  /**
   * @EventList function
   * @name EventList.remove
   * @function
   * {{{ 2
   * @description Safe way to remove EventList item.
   * @param {String} _event String denoting eventType.
   * @return {Object} Previously created singleton object or self.
   */
  EventList.prototype.remove = function (_event) {
    var _self = setEnv(this);
    
    _self.unlisten(_event);
    delete _self[_event];
    
    return _self;
  };
  // 2 }}}

  /**
   * @EventList function
   * @name EventList.disable
   * @function
   * {{{ 2
   * @description Disable all listeners for a certain eventType.
   * @param {String} _event String denoting eventType to disable.
   * @return {Object} Previously created singleton object or self.
   */
  EventList.prototype.disable = function (_event) {
    var _self = setEnv(this);
    
    if (this[_event]) {
      this[_event].disabled = true;
    }
    return _self;
  };
  // 2 }}}

  /**
   * @EventList function
   * @name EventList.enable
   * @function
   * {{{ 2
   * @description Enable all listeners for a certain eventType.
   * @param {String} _event String denoting eventType to enable.
   * @return {Object} Previously created singleton object or self.
   */
  EventList.prototype.enable = function (_event) {
    var _self = setEnv(this);
    
    if (this[_event]) {
      if (this[_event].disabled) {
        this[_event].disabled = false;
      }
    }
    return _self;
  };
  // 2 }}}

  /**
   * @EventList function
   * @name EventList.loop
   * @function
   * {{{ 2
   * @description Browser safe way to loop through the list of eventType.
   * for lesser browser
   * always check for `__' prefix in for-in loop
   * TODO: do we need this iterator?
   * @param {function} _callback Function to execute for each eventType object.
   */
  EventList.prototype.loop = function (_callback) {
    var key, _self = setEnv(this);

    _callback = _callback || function () {};
    
    // for browser that support `propertyIsEnumberable', check prototype
    if ("propertyIsEnumerable" in _self) {
      for (key in _self) {
        if (_self.hasOwnProperty(key) && _self[key].constructor.name === "DelegateList") {
          _callback.call(_self, key, _self[key]);
        }
      }
    }
    else {
      for (key in _self) {
        if (key !== "prototype" && ~key.indexOf("__")) {
          _callback.call(_self, key, _self[key]);
        }
      }
    }
  };
  // 2 }}}

  /**
   * @EventList function
   * @name EventList.getRootElement
   * @function
   * {{{ 2
   * @description Return the element which all event listener registered to.
   * @return {Element} rootElement for current EventList instance
   */
  EventList.prototype.getRootElement = function () {
    // we do not use _self for safety reasons
    if (this.__root__) {
      return this.__root__;
    }
    else {
      throw new Error("Root element not found.");
    }
  };
  // 2 }}}
  
  /**
   * @DelegateList function
   * @name DelegateList.getRootElement
   * @function
   * {{{ 2
   * @description Return the element which all event listener registered to.
   * EventList.* has no way of knowing the `__root__' (rootElement)
   * we have to delay this prototype function declaration
   * to dismiss `EventList' not found error
   * @return {Element} rootElement for current EventList instance
   */
  DelegateList.prototype.getRootElement = function () {
    return this.constructor.constructor.getRootElement();
  };
  // 2 }}}


  /**
   * @EventList function
   * @name EventList.getRootElementSelector
   * @function
   *
   * @description Return the element selector (if possible) which all event listener registered to.
   * @return {String} selector String for current EventList rootElement.
   */
  EventList.prototype.getRootElementSelector = function () {
    // we do not use _self for safety reasons
    if (this.__rootSelector__) {
      return this.__rootSelector__;
    }
    else {
      // cannot throw error
      return null;
    }
  };
  // 2 }}}

  /**
   * @DelegateList function
   * @name DelegateList.getRootElementSelector
   * @function
   * {{{ 2
   * @description Return the element selector (if possible) which all event listener registered to.
   * EventList.* has no way of knowing the `__rootSelector__' (rootElementSelector)
   * we have to delay this prototype function declaration
   * to dismiss `EventList' not found error
   * @return {String} selector String for current EventList instance
   */
  DelegateList.prototype.getRootElementSelector = function () {
    return this.constructor.constructor.getRootElementSelector();
  };
  // 2 }}}

  /**
   * @EventList function
   * @name EventList.isUnlistened
   * @function
   * {{{ 2
   * @description Check if a certain eventType is listened to.
   * @param {String} string String denoting eventType to enable.
   * @return {Boolean} Boolean indicating whether the eventType is listened to.
   */
  EventList.prototype.isUnlistened = function () {
    return setEnv(this).unlistened || false;
  };
  // 2 }}}

  /**
   * @EventList function
   * @name EventList.isUnlistened
   * @function
   * {{{ 2
   * @description Destory one or all previously created singletons.
   * @param {String} string String denoting eventType to enable.
   * @return {Object} this.
   */
  EventList.destorySingleton = EventList.prototype.destorySingleton = function () {
    if (!EventList.__registered__) {
      return this;
    }

    if (arguments.length === 0) {
      EventList.__registered__ = null;
      delete EventList.__registered__;
      return this;
    }
    else {
      // only accept the first arguments at the moment
      for (var i in EventList.__registered__) {
        if (EventList.__registered__.hasOwnProperty(i)) {
          if (arguments[0] === i) {
            EventList.__registered__.i = null;
            delete EventList.__registered__.i;
            return this;
          }
        }
      }
    }
  };
  // 2 }}}
  
  // 1 }}}
  
  // adds name so it's more visible
  // {{{ 1
  EventList.name = "EventList";
  DelegateList.name = "DelegateList";

  if (typeof root.module !== 'undefined' && root.module.exports) {
    root.module.exports = EventList;
  }
  else if (typeof root.define !== 'undefined' && root.define === 'function' && root.define.amd) {
    define(name, EventList);
  }
  else {
    // in case we need multiple instances
    root[name] = EventList;
  }
  // 1 }}}
  
}(this, "EventList"));
