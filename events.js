/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 : */

/*jshint unused:false, boss:true */
/*global extract:true, setProperty:true, elementFitsDescription:true */


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
   * @param arr
   */
  function DelegateList(arr) {
    /*jshint validthis:true */
    this.disabled = false;
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
   * but the trick is that we COULD use a function to generate an object with
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
    this.delegates = this.delegates || [];
    // better than [].concat
    // because concat will create a new array
    [].push.apply(this.delegates, arguments);

    if (this.__unlistened__ === true) {
      this.getRootElement().addEventListener(this.__event__, this);
      this.__unlistened__ = false;
    }
  };

  DelegateList.prototype.unlisten = function () {
    this.getRootElement().removeEventListener(this.__event__, this);
    this.__unlistened__ = true;
  };
  DelegateList.prototype.isUnlistened = function () {
    return this.__unlistened__ || false;
  };


  // constructor for event delegate Center
  function EventList(element, registeredName) {
    var selectorString = null;
    if (!element) {
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
    }

    setProperty(this, "__root__", element);

    // record every instance's variable name (if possible)
    // By the hidden info, we could make each new EventList a singleton
    // if we re-instantiated EventList, it will return proper object
    root[name].__registerElements__ = root[name].__registerElements__ || {};
    
    var _previousElements = root[name].__registerElements__;

    if (_previousElements[selectorString]) {
      if (window[_previousElements[selectorString]]) {
        return window[_previousElements[selectorString]];
      }
    }

    if (registeredName) {
      if (!selectorString) {
        // or maybe we should warn and continue
        throw new Error("Unable to bind to " + registeredName);
      }
      root[name].__registerElements__[selectorString] = registeredName;
    }
  }

  // focus and blur does NOT bubble up
  EventList.prototype.listen = function () {
    if (!arguments.length) {
      return;
    }
    var _event = arguments[0];

    if (!Object.prototype.hasOwnProperty.call(document.documentElement, "on" + _event)) {
      throw new TypeError(_event + " unavailable.");
    }

    // singleton for every event
    if (!this.hasOwnProperty(_event)) {
      this[_event] = new DelegateList(extract(arguments, 1));
      // until we have a better solution, we'll have to contaminate all object
      // created by DelegateList
      setProperty(this[_event], "__root__", this.getRootElement());
      setProperty(this[_event], "__event__", _event);


      this.getRootElement().addEventListener(_event, this[_event]);
    }
    else {
      this[_event].listen(extract(arguments, 1));

      if (this[_event].isUnlistened) {
        this.getRootElement().addEventListener(_event, this[_event]);
        this.__unlistened__ = false;
      }
    }
    
    return this;
  };

  EventList.prototype.unlisten = function (_event) {
    this.getRootElement().removeEventListener(_event, this[_event]);
    this[_event].__unlistened__ = true;
    
    return this;
  };

  EventList.prototype.disable = function (_event) {
    if (this[_event]) {
      this[_event].disabled = true;
    }
  };


  // for lesser browser
  // always check for `__' prefix in for-in loop
  // TODO: do we need this iterator?
  EventList.prototype.loop = function (_callback) {
    // for browser that support `propertyIsEnumberable'
    // we check if prototype
    var key, value;
    if (Object.prototype.hasOwnProperty.call(this.prototype, "propertyIsEnumerable")) {
      for (key in this) {
        if (this.hasOwnProperty(key)) {
          _callback.call(this, key, value);
        }
      }
    }
    else {
      for (key in this) {
        if (key !== "prototype" && ~key.indexOf("__")) {
          _callback.call(this, key, value);
        }
      }
    }
  };

  EventList.prototype.getRootElement = function () {
    if (this.__root__) {
      return this.__root__;
    }
    else {
      throw new Error("Root element not found.");
    }
  };

  EventList.prototype.isUnlistened = function () {
    return this.__unlistened__ || false;
  };

  // Events.* has no way of knowing the `__root__'
  // we have to delay this prototype function declaration
  // to dismiss `EventList' not found error
  DelegateList.prototype.getRootElement = EventList.prototype.getRootElement;

  // in case we need multiple instances
  root[name] = EventList;
}(this, "EventList"));
