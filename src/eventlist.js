/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 fdm=marker: */

/*jshint unused:false, boss:true */
/*global setProperty:true, elementFitsDescription:true */

// polyfilling hasOwnProperty for lesser browser
// https://gist.github.com/332357
if (!Object.prototype.hasOwnProperty) {
  Object.prototype.hasOwnProperty = function (prop) {
    var proto = this.prototype || this.constructor.prototype;
    return (prop in this) && (!(prop in proto) || proto[prop] !== this[prop]);
  };
}

(function (root, name) {
  "use strict";
  // in case we decide to change those names later on
  var delegateSelector = "selector",
      delegateFunction = "handler";

  // Helper functions {{{ 1
  /**
   * @helper function
   * @name elementHasClass
   * @function
   * {{{ 2
   * @description Check if element has a className.
   * @param {el} Element to check.
   * @param {className} ClassName to look for.
   * @return {boolean} Boolean true or false.
   */
  function elementHasClass(el, _className) {
    // has to do this check first because if _className is not present
    // and el is absence as well, it should not return true
    if (!el) {
      throw new Error("Element Undefined");
    }
    if (!_className) {
      return true;
    }

    if ("classList" in document.body) {
      return el.classList.contains(_className);
    }

    if (!el.className) {
      return false;
    }
    // so that we do not have to make special case for the 1st / last item
    return (new RegExp("\\b" + _className + "\\b").test(el.className));
  }
  // 2 }}}

  /**
   * @helper function
   * @name elementFitsDescription
   * @function
   * {{{ 2
   * @description Check if element fits given description.
   * support 4 selectors:
   * 1.  #id
   * 2.  .className
   * 3.  tagName
   * 4.  tagName.className
   * @param {el} Element to check.
   * @param {selector} selector to check against.
   * @return {boolean} Boolean true or false.
   */
  function elementFitsDescription(el, selector) {
    if (!selector) {
      return false;
    }
    if (!el) {
      return false;
    }

    var _tagName, _className, pos;

    switch (selector.charAt(0)) {
    case "#" :
      if ("#" + el.id === selector) {
        return el;
      }
      break;
    case "." :
      // so we do not have to consider whether the className is the first or the last
      if (elementHasClass(el, selector.substring(1))) {
        return el;
      }
      break;
    default :
      pos = selector.indexOf(".");
      // tagName.className
      // now we know that "." will not be the leading character
      if (~pos) {
        _tagName = selector;
        _className = _tagName.splice(0, pos).substring(1);
        if ((el.tagName.toLowerCase() === _tagName) && elementHasClass(el, _className)) {
          return el;
        }
      }
      // tagName
      else {
        // apparently `#' will not be at 0
        if (selector.indexOf("#") > 0) {
          throw new Error(selector + "not supported, use #id instead.");
        }
        else {
          if (el.tagName.toLowerCase() === selector) {
            return el;
          }
        }
      }
      // end of default branch
    }
    return null;
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
   * @param {_event} A string representing the eventType to listen for.
   * @returns {Element} event target as element.
   */
  function getEventTarget(_event) {
    _event = _event || window.event;
    return _event.target || _event.srcElement;
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
   * @param {scope} scope Scope to look for singletons
   * @returns {_sef} Previously created singleton object or self
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
   * @param {_evnt} A string representing the eventType to listen for.
   * @param {_obj} Object that receives a notification when specified event occurs.
   *               see addEventListener on MDN for more details
   */
  function addEventListenerHelper(element, _event, _obj) {
    if (element.addEventListener) {
      element.addEventListener(_event, _obj, false);
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
   * @param {arr} arr Array of proper addEventListener objects.
   */
  function DelegateList(arr) {
    /*jshint validthis:true */
    this.disabled = false;
    if (arr) {
      arr = arr.filter(function (i) {
        if (i.hasOwnProperty(delegateSelector)) {
          return true;
        }
      });
    }
    this.delegates = arr || [];

    // allow overwrite
    setProperty(this, "__unlistened__", false, true);

    //return this;
  }
  // 2 }}}

  /**
   * @DelegateList function
   * @name DelegateList.getEventType
   * @function
   * {{{ 2
   * @description Get eventType for this DelegateList.
   * @returns {string} String denoting eventType for this DelegateList.
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
   * @param {item} item String denoting listener object to disable.
   * @returns {obj} DelegateList object (this).
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
   * @param {item} item String denoting listener object to enable.
   * @returns {obj} DelegateList object (this).
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
   * @param {item} item String denoting listener object to disable.
   * @returns {obj} DelegateList object (this).
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
   * @param {item} item String denoting listener object to enable.
   * @returns {obj} DelegateList object (this).
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
      _event.preventDefault();
      return;
    }

    var i, item, targetElement = getEventTarget(_event);

    for (i = 0; item = this.delegates[i]; i++) {
      if (item.disabled) {
        _event.preventDefault();
        continue;
      }
      // FIXME: add documentation explaining why we use this instead of querySelector match
      if (elementFitsDescription(targetElement, item[delegateSelector])) {
        execute(item[delegateFunction], targetElement, this);
      }
    } // end of for loop
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
   * @param {} Array or or multiple addEventListener objects .
   * @returns {obj} DelegateList object (this).
   */
  DelegateList.prototype.listen = function () {
    // make arguments an array
    var arr, i, item;
    switch (arguments.length) {
    case 0:
      arr = [];
      break;
    case 1:
      arr = arguments[0];
      arr = (arr instanceof Array) ? arr : [arr];
      break;
    default:
      arr = [].slice.call(arguments);
    }

    this.delegates = this.delegates || [];
    for (i = 0; item = arr[i]; i++) {
      if (item.hasOwnProperty(delegateSelector)) {
        this.delegates.push(item);
      }
    }
    
    if (this.__unlistened__ === true) {
      addEventListenerHelper(this.getRootElement(), this.__event__, this);
      this.__unlistened__ = false;
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
   * @returns {obj} DelegateList object (this).
   */
  DelegateList.prototype.unlisten = function () {
    removeEventListenerHelper(this.getRootElement(), this.__event__, this);
    this.__unlistened__ = true;
  };
  // 2 }}}

  /**
   * @DelegateList function
   * @name DelegateList.isUnlistened
   * @function
   * {{{ 2
   * @description Check if a certain eventType is listened to.
   * @returns {obj} DelegateList object (this).
   */
  DelegateList.prototype.isUnlistened = function () {
    return this.__unlistened__ || false;
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
   * @param {arr} arr Array or or multiple addEventListener objects .
   */
  function EventList(element, registeredVariable, variableScope) {
    /*global jQuery:true*/

    var selectorString = null;

    if (!element || element === document || element === "document") {
      element = document;
      selectorString = "document";
    }
    else {
      if ("jQuery" in window && element instanceof jQuery) {
        selectorString = element.selector;
        element = element[0];

        // jQuery.selector return "" for $(document), $(document.body)
        // so we have to do some extra check
        if (element === document) {
          selectorString = "document";
        }
        else if (element === document.body) {
          selectorString = "body";
        }
      }
      
      // if `element' is a string
      // we do not have to use getTypeOf
      // typeof seems to be enough
      else if (typeof element === "string") {
        if ("querySelector" in document) {
          selectorString = element;
          if (!(element = document.querySelector(selectorString))) {
            throw new TypeError("Unable to parse element: unexpected response from querySelector.");
          }
        }
      }
      // might be Element/HTML*Element
      else {
        if (element.length) {
          element = element[0];
        }
        if (element.id) {
          selectorString = "#" + element.id;
        }
      }
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
   * @name EventList
   * @function
   * {{{ 2
   * @description Bind (extra) listeners to a certain eventType.
   * BE WARNED: (about JavaScript object referencing)
   * see the explanation above for DelegateList.disable
   * if the eventType is `Unlistened`, it will be re-attached.
   * focus and blur does NOT bubble up, so they are not supported.
   * @param {arr} arr Array or or multiple addEventListener objects.
   * @return {} Previously created singleton object or self
   */
  EventList.prototype.listen = function () {
    var _self = setEnv(this);

    if (!arguments.length) {
      return _self;
    }
    var _event = arguments[0];

    if (!(("on" + _event) in document.body)) {
      throw new TypeError(_event + " unavailable.");
    }

    var arr = [].slice.call(arguments, 1);

    if (arr.length === 1) {
      if (!arr[0]) {
        arr = [];
      }
      else {
        arr = (arr[0] instanceof Array) ? arr[0] : arr;
      }
    }
    // singleton for every event
    if (!_self.hasOwnProperty(_event)) {
      _self[_event] = new DelegateList(arr);
      _self[_event].constructor.constructor = _self;
      // until we have a better solution, we'll have to contaminate all object
      // created by DelegateList
      setProperty(_self[_event], "__root__", _self.getRootElement());
      setProperty(_self[_event], "__event__", _event);

      addEventListenerHelper(_self.getRootElement(), _event, _self[_event]);
    }
    else {
      _self[_event].listen(arr);

      if (_self[_event].isUnlistened) {
        //_self.getRootElement().addEventListener(_event, _self[_event]);
        addEventListenerHelper(_self.getRootElement(), _event, _self[_event]);
        _self.__unlistened__ = false;
      }
    }
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
   * @param {string} string String denoting eventType.
   * @returns {} Previously created singleton object or self.
   */
  EventList.prototype.unlisten = function (_event) {
    var _self = setEnv(this);

    removeEventListenerHelper(_self.getRootElement(), _event, _self[_event]);
    _self[_event].__unlistened__ = true;
    
    return _self;
  };
  // 2 }}}

  /**
   * @EventList function
   * @name EventList.remove
   * @function
   * {{{ 2
   * @description Safe way to remove EventList item.
   * @param {string} string String denoting eventType.
   * @returns {} Previously created singleton object or self.
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
   * @param {string} string String denoting eventType to disable.
   * @returns {} Previously created singleton object or self.
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
   * @param {string} string String denoting eventType to enable.
   * @returns {} Previously created singleton object or self.
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
   * @param {_callback} _callback Function to execute for each eventType object.
   */
  EventList.prototype.loop = function (_callback) {
    var _self = setEnv(this);

    _callback = _callback || function (key) {};
    
    // for browser that support `propertyIsEnumberable'
    // we check if prototype
    var key, value;
    if ("propertyIsEnumerable" in _self) {
      for (key in _self) {
        if (_self.hasOwnProperty(key) && _self[key].constructor.name === "DelegateList") {
          _callback.call(_self, key, value);
        }
      }
    }
    else {
      for (key in _self) {
        if (key !== "prototype" && ~key.indexOf("__")) {
          _callback.call(_self, key, value);
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
   * @description return the element which all event listener registered to.
   * @returns {} rootElement for current EventList instance
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

  /**
   * @EventList function
   * @name EventList.getRootElementSelector
   * @function
   *
   * @description return the element selector (if possible) which all event listener registered to.
   * @returns {selector} selector String for current EventList rootElement.
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
   * @EventList function
   * @name EventList.isUnlistened
   * @function
   * {{{ 2
   * @description Check if a certain eventType is listened to.
   * @param {string} string String denoting eventType to enable.
   * @returns {} Boolean indicating whether the eventType is listened to.
   */
  EventList.prototype.isUnlistened = function () {
    return setEnv(this).__unlistened__ || false;
  };
  // 2 }}}

  /**
   * @DelegateList function
   * @name DelegateList.getRootElement
   * @function
   * {{{ 2
   * @description return the element which all event listener registered to.
   * EventList.* has no way of knowing the `__root__' (rootElement)
   * we have to delay this prototype function declaration
   * to dismiss `EventList' not found error
   * @returns {} rootElement for current EventList instance
   */
  DelegateList.prototype.getRootElement = EventList.prototype.getRootElement;
  // 2 }}}

  /**
   * @EventList function
   * @name EventList.isUnlistened
   * @function
   * {{{ 2
   * @description Destory one or all previously created singletons.
   * @param {string} string String denoting eventType to enable.
   * @returns {} this.
   */
  EventList.destorySingleton = EventList.prototype.destorySingleton = function () {
    if (!EventList.__registered__) {
      return this;
    }

    if (arguments.length === 0) {
      delete EventList.__registered__;
      return this;
    }
    else {
      // only accept the first arguments at the moment
      for (var i in EventList.__registered__) {
        if (EventList.__registered__.hasOwnProperty(i)) {
          if (arguments[0] === i) {
            delete EventList.__registered__.i;
            return this;
          }
        }
      }
    }
  };
  // 2 }}}
  
  // 1 }}}

  // in case we need multiple instances
  root[name] = EventList;
}(this, "EventList"));
