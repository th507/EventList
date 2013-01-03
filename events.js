/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 : */
/*
 * requires config.js
 * */

/*global extract:true, newArray:true, setProperty:true, elementCanBeDescribedAs:true */

(function(root, name) {
  "use strict";
  // in case we decide to change those names later on
  var delegateSelector = "selector",
      delegateFunction = "handler";

  // shorthand or toggle individual state of delegateFunction
  function changeState(delegateArray, item, state) {
    var i, delegateItem;
    for ( i = 0; delegateItem = delegateArray[i]; i++ ) {
      if ( delegateItem[delegateSelector] === item ) {
        delegateItem.disabled = Boolean( state );
        break;
      }
    }
  }

  function getEventTarget(e) {
    e = e || window.event;
    return e.target || e.srcElement;
  }

  function execute(func, scope) {
    func.call( scope );
  }


  // constructor for delegates method object/array
  function DelegatesConstructor(arr) {
    /*jshint validthis:true */
    this.disabled = false;
    this.delegates = newArray( arr );

    // allow overwrite
    setProperty( this, "__unlistened__", 0, true );
  }

  /* create a object simular to array
   * better not subclassing JavaScript Array
   * https://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array
   */
  DelegatesConstructor.prototype.disable = function(item) {
    changeState( this.delegates, item, true );
  };

  DelegatesConstructor.prototype.enable = function(item) {
    changeState( this.delegates, item, false );
  };

  /**
   * @name handleEvent
   * @function
   *
   * @description
   * actual function to attach events
   * we all know that we could bind object in addEventListener
   * http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventListener-handleEvent
   * provided there is a `handleEvent' property in the object
   * but the trick is that we COULD use a function to generate an object with
   * `handleEvent' nicely hidden inside its `prototype'
   *
   * @param evt
   */
  DelegatesConstructor.prototype.handleEvent = function(evt) {
    // master switch
    if ( this.disabled || this.delegates.length === 0 ) {
      return;
    }


    var i, item, _tagName, _className, pos,
        targetElement = getEventTarget(evt),
        delegateArray = this.delegates;


    for ( i = 0; item = delegateArray[i]; i++ ) {
      if ( item.disabled ) {
        continue;
      }

      console.log( item[delegateSelector] );
      console.warn( !!elementCanBeDescribedAs( targetElement, item[delegateSelector] ) );

      if ( elementCanBeDescribedAs( targetElement, item[delegateSelector] ) ) {
        execute( item[delegateFunction], targetElement );
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
  DelegatesConstructor.prototype.listen = function(arr) {
    this.delegates = this.delegates || [];
    // better than [].concat
    // because concat will create a new array
    Array.prototype.push.apply( this.delegates, newArray( arr ) );

    if ( this.__unlistened__ === 1 ) {
      this.getRootElement().addEventListener( this.__event__, this );
      this.__unlistened__ = 0;
    }
  };

  DelegatesConstructor.prototype.unlisten = function() {
    this.getRootElement().removeEventListener( this.__event__, this );
    this.__unlistened__ = 1;
  };
  DelegatesConstructor.prototype.isUnlistened = function() {
      return this.__unlistened__ || 0;
  };


  // constructor for event delegate Center
  function EventsConstructor(element) {
    /* this is only mute jshint warning */
    /*global jQuery:true*/
    // if `element' is a jQuery object
    if ( "jQuery" in window && element instanceof jQuery ) {
      element = element[0];
    }
    
    // if `element' is a string
    // we do not have to use getTypeOf
    // typeof seems to be enough
    if ( typeof element === "string" ) {
      if ( "querySelector" in document ) {
        if ( !( element = document.querySelector( element ) ) ) {
          throw new TypeError( "Unable to parse element: type mismatch or querySelector method not found." );
        }
      }
    }

    setProperty( this, "__root__", element || document );
 
    // for lesser browser
    // always check for `__' prefix in for-in loop
  }

  // focus and blur does NOT bubble up
  EventsConstructor.prototype.listen = function() {
    if ( !arguments.length ) {
      return;
    }
    var _event = arguments[0];

    if ( !Object.prototype.hasOwnProperty.call( document.documentElement, "on" + _event ) ) {
      throw new TypeError( _event + " unavailable." );
    }

    // singleton for every event
    if ( !this.hasOwnProperty( _event ) ) {
      this[_event] = new DelegatesConstructor( extract( arguments, 1 ) );
      // until we have a better solution, we'll have to contaminate all object
      // created by DelegatesConstructor
      setProperty( this[_event], "__root__", this.getRootElement() );
      setProperty( this[_event], "__event__", _event );


      this.getRootElement().addEventListener( _event, this[_event] );
    }
    else {
      this[_event].listen( extract( arguments, 1 ) );

      if ( this[_event].isUnlistened ) {
        this.getRootElement().addEventListener( _event, this[_event] );
        this.__unlistened__ = 0;
      }
    }
    
    return this;
  };

  EventsConstructor.prototype.unlisten = function(_event) {
    this.getRootElement().removeEventListener( _event, this[_event] );
    this[_event].__unlistened__ = 1;
    
    return this;
  };

  // TODO: do we need this iterator?
  EventsConstructor.prototype.loop = function(_callback) {
    // for browser that support `propertyIsEnumberable'
    // we check if prototype
    var key, value;
    if ( Object.prototype.hasOwnProperty.call( this.prototype, "propertyIsEnumerable" ) ) {
      for ( key in this ) {
        if ( this.hasOwnProperty( key ) ) {
          _callback.call( this, key, value );
        }
      }
    }
    else {
      for ( key in this ) {
        if ( key !== "prototype" && ~key.indexOf( "__" ) ) {
            _callback.call( this, key, value );
          }
      }
    }
  };

  EventsConstructor.prototype.getRootElement = function() {
    if ( this.__root__ ) {
      return this.__root__;
    }
    else {
      throw new Error( "Root element not found." );
    }
  };

  EventsConstructor.prototype.isUnlistened = function() {
      return this.__unlistened__ || 0;
  };

  // Events.* has no way of knowing the `__root__'
  // we have to delay this prototype function declaration
  // to dismiss `EventsConstructor' not found error
  DelegatesConstructor.prototype.getRootElement = EventsConstructor.prototype.getRootElement;




  // in case we need multiple instances
  root[name] = EventsConstructor;
}( this, "EventsConstructor" ));
