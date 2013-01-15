/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 : */

/*jshint unused:false, boss:true */
/*global setProperty:true, elementFitsDescription:true */

// you should polyfill hasOwnProperty if you are running on a lesser browser
(function (root, name) {
  "use strict";
  // in case we decide to change those names later on
  var delegateSelector = "selector",
      delegateFunction = "handler";

  // shorthand or toggle individual state of delegateFunction
  function changeState(delegateArray, item, state) {
    var i, delegateItem;
    for (i = 0; delegateItem = delegateArray[i]; i++) {
      if (delegateItem[delegateSelector] === item) {
        delegateItem.disabled = Boolean(state);
        break;
      }
    }
  }

  function getEventTarget(e) {
    e = e || window.event;
    return e.target || e.srcElement;
  }

  function execute(func, scope) {
    if (func) {
      func.call(scope);
    }
  }

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

  function addEventListenerHelper(element, _event, _obj) {
    if (element.addEventListener) {
      element.addEventListener(_event, _obj, false);
    }
    else if (element.attachEvent) {
      element.attachEvent("on" + _event, _obj);
    }
  }

  function removeEventListenerHelper(element, _event, _obj) {
    if (element.removeEventListener) {
      element.removeEventListener(_event, _obj);
    }
    else if (element.detachEvent) {
      element.detachEvent("on" + _event, _obj);
    }
  }

  /**
   * @name DelegateList
   * @function
   *
   * @description
   * constructor for delegates method object/array
   * create a object simular to array
   * better not subclassing JavaScript Array
   * https://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array
   *
   * @param arr ARRAY
   */
  function DelegateList(arr) {
    /*jshint validthis:true */
    this.disabled = false;
    if (arr) {
      arr = arr.filter(function(i) {
        if (i.hasOwnProperty(delegateSelector)) {
          return true;
        }
      });
    }
    this.delegates = arr || [];

    // allow overwrite
    setProperty(this, "__unlistened__", false, true);
  }

  /*
   * we do not use this.disable to modify the master disable switch
   * because user might accidentally calls this method without giving an argument
   * for that circumstance, we should do nothing
   * instead, we use disableAll to modify the master disable switch
   */
  DelegateList.prototype.disable = function (item) {
    
    if (item) {
      changeState(this.delegates, item, true);
    }
    return this;
  };

  DelegateList.prototype.enable = function (item) {
    if (item) {
      changeState(this.delegates, item, false);
    }
    return this;
  };

  DelegateList.prototype.disableAll = function () {
    this.disabled = true;
    return this;
  };

  DelegateList.prototype.enableAll = function () {
    this.disabled = false;
    return this;
  };

  /**
   * @name handleEvent
   * @function
   *
   * @description
   * actual function to attach events
   * we all know that we could bind object in addEventListener
   * http://w3.org/TR/DOM-Level-2-Events/events.html
   * provided there is a `handleEvent' property in the object
   * here is the trick, we COULD use a function to generate an object with
   * `handleEvent' nicely hidden inside its `prototype'
   *
   * @param evt
   */
  DelegateList.prototype.handleEvent = function (evt) {
    // master switch
    if (this.disabled || this.delegates.length === 0) {
      return;
    }

    var i, item, targetElement = getEventTarget(evt);

    for (i = 0; item = this.delegates[i]; i++) {
      if (item.disabled) {
        continue;
      }
      // FIXME: add documentation explaining why we use this instead of querySelector match
      if (elementFitsDescription(targetElement, item[delegateSelector])) {
        execute(item[delegateFunction], targetElement);
      }
    } // end of for loop
  };

  /**
   * @name listen
   * @function
   *
   * @description
   *
   * @param arr
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

  DelegateList.prototype.unlisten = function () {
    removeEventListenerHelper(this.getRootElement(), this.__event__, this);
    this.__unlistened__ = true;
  };
  DelegateList.prototype.isUnlistened = function () {
    return this.__unlistened__ || false;
  };


  // constructor for event delegate Center
  function EventList(element, registeredVariable, variableScope) {
    var selectorString = null;
    if (!element || element === document || element === "document") {
      element = document;
      selectorString = "document";
    }
    else {
      /* this is only mute jshint warning */
      /*global jQuery:true*/
      // if `element' is a jQuery object
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
      else if (element.length) {
        element = element[0];
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

  // focus and blur does NOT bubble up
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

  // only add a flag not to listen and removeEventListener
  // does NOT remove the EventList item
  EventList.prototype.unlisten = function (_event) {
    var _self = setEnv(this);

    removeEventListenerHelper(_self.getRootElement(), _event, _self[_event]);
    _self[_event].__unlistened__ = true;
    
    return _self;
  };

  // only safe way to remove EventList item
  EventList.prototype.remove = function (_event) {
    var _self = setEnv(this);
    
    _self.unlisten(_event);
    delete _self[_event];
    
    return _self;
  };

  EventList.prototype.disable = function (_event) {
    var _self = setEnv(this);
    
    if (this[_event]) {
      this[_event].disabled = true;
    }
    return _self;
  };

  EventList.prototype.enable = function (_event) {
    var _self = setEnv(this);
    
    if (this[_event]) {
      if (this[_event].disabled) {
        this[_event].disabled = false;
      }
    }
    return _self;
  };



  // for lesser browser
  // always check for `__' prefix in for-in loop
  // TODO: do we need this iterator?
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

  EventList.prototype.getRootElement = function () {
    // we do not use _self for safety reasons
    if (this.__root__) {
      return this.__root__;
    }
    else {
      throw new Error("Root element not found.");
    }
  };

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

  EventList.prototype.isUnlistened = function () {
    var _self = setEnv(this);
    
    return _self.__unlistened__ || false;
  };

  // Events.* has no way of knowing the `__root__'
  // we have to delay this prototype function declaration
  // to dismiss `EventList' not found error
  DelegateList.prototype.getRootElement = EventList.prototype.getRootElement;

  // destory one or all singletons
  EventList.destorySingleton = EventList.prototype.destorySingleton = function() {
    if (!EventList.__registered__) {
      return this;
    }

    if (arguments.length === 0) {
      delete EventList.__registered__;
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

  // in case we need multiple instances
  root[name] = EventList;
}(this, "EventList"));
