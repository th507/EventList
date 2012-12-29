/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 : */
/*
 * requires config.js
 * */
/*global features:true, getTypeOf:true, extract:true, makeArray:true, newArray:true, appendArray:true, setProperty:true, elementHasClass:true */

/*
 * entree begins
 * */
(function(root, name) {
  // shorthand or toggle individual state of delegateFunction
  function changeState(item, prop, arr, state) {
    var i, len = arr.length;
    for ( i = 0; i < len; i++ ) {
      if ( arr[i][prop] === item ) {
        arr[i].disabled = state;
        break;
      }
    }
  }

  // constructor for delegates method object/array
  function delegatesConstructor(arr) {
    this.disabled = false;

    this.delegates = appendArray( newArray( arr ) );

  }

  /* create a object simular to array
   * better not subclassing JavaScript Array
   * https://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array
   */
  delegatesConstructor.prototype.disable = function(item) {
    changeState( item, "selector", this.delegates, true );
  };

  delegatesConstructor.prototype.enable = function(item) {
    changeState( item, "selector", this.delegates, false );
  };

  // actual function to attach events
  // we all know that we could bind object in addEventListener
  // http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventListener-handleEvent
  // provided there is a `handleEvent' property in the object
  // but the trick is that we COULD use a function to generate an object with
  // `handleEvent' nicely hidden inside its `prototype'
  delegatesConstructor.prototype.handleEvent = function(evt) {
    // master switch
    if ( this.disabled ) {
      return;
    }

    function getEventTarget(e) {
      e = e || window.event;
      return e.target || e.srcElement;
    }

    var delegateElement, i, item, _tagName, _className, pos,
        targetElement = getEventTarget(evt),
        delegateArray = this.delegates;

    function execute(func) {
      func.call( targetElement );
    }


    for ( i = 0; item = delegateArray[i]; i++ ) {
      if ( item.disabled ) {
        continue;
      }

      delegateElement = item.selector;

      /*
       * support 4 selectors:
       * 1.  #id
       * 2.  .className
       * 3.  tagName
       * 4.  tagName.className
       */
      switch ( delegateElement.charAt( 0 ) ) {
        // #id
        case "#" :
          if ( "#" + targetElement.id === delegateElement ) {
            execute( item.delegateFunction );
            continue;
          }
          break;
          // .className
        case "." :
          // so we do not have to consider whether the className is the first or the last
          if ( elementHasClass( targetElement, delegateElement.slice( 0 ) ) ) {
            execute( item.delegateFunction );
            continue;
          }
          break;
          // tagName and/or tagName.className
        default :
          pos = delegateElement.indexOf( "." );
          // tagName.className
          // now we know that "." will not be the leading character
          if ( ~pos ) {
            _tagName = delegateElement;
            _className = _tagName.splice(0, pos + 1);
            _tagName.pop();
            if ( ( targetElement.tagName.toLowerCase() === _tagName ) && elementHasClass( targetElement, _className ) ) {
              execute( item.delegateFunction );
              continue;
            }
          }
          // tagName
          else {
            if ( /#/.test( delegateElement ) ) {
              throw new Error ( delegateElement + "not supported, use #id instead." );
            }
            else {
              if ( targetElement.tagName.toLowerCase() === delegateElement ) {
                execute( item.delegateFunction );
                continue;
              }
            }
          }
          // end of default branch
      } // end of switch
    }
  };

  delegatesConstructor.prototype.listen = function(arr) {
    // better than [].concat
    // because concat will create a new array
    arr = makeArray( arr );
    this.delegates = appendArray( arr, this.delegates );
  };

  delegatesConstructor.prototype.unlisten = function() {
    this.getRootElement().removeEventListener( this.__event__, this );
  };


  // constructor for event delegate Center
  var EventsConstructor = function(element) {
    setProperty( this, "__root__", element || document );
 
    // for lesser browser
    // always check for `__' prefix in for-in loop
  };

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
      this[_event] = new delegatesConstructor( extract( arguments, 1 ) );
      // until we have a better solution, we'll have to contaminate all object
      // created by delegatesConstructor
      setProperty( this[_event], "__root__", this.getRootElement() );
      setProperty( this[_event], "__event__", _event );

      this.getRootElement().addEventListener( _event, this[_event] );
    }
    else {
      console.log( "asdf" );
      this[_event].listen( extract( arguments, 1 ) );
    }
  };

  EventsConstructor.prototype.unlisten = function(_event) {
    this.getRootElement().removeEventListener( _event, this[_event] );
  };

  // FIXME/TODO: do we need this iterator?
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

  // FIXME
  // Events.* has no way of knowing the `__root__'
  // has to delay this prototype function declaration
  // to dismiss `EventsConstructor' not found error
  delegatesConstructor.prototype.getRootElement = EventsConstructor.prototype.getRootElement;


  

  // in case we need multiple instances
  root[name] = EventsConstructor;
}( this, "EventsConstructor" ));