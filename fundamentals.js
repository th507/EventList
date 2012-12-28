/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 : */
/*global features:true, ActiveXObject:true */


// find unique and not-empty item
// http://www.shamasis.net/2009/09/fast-algorithm-to-find-unique-items-in-javascript-array/#comment-348025468
Array.prototype.unique = function() {
  return this.filter( function(value, key, arr) {
    return value && ( key === arr.lastIndexOf( value ) );
  } );
};

// find array difference
// http://stackoverflow.com/questions/1187518/javascript-array-difference
Array.prototype.diff = function(a) {
  return this.filter( function(i) {
    return ~a.indexOf( i );
  } );
};

/**
 * @name getTypeOf
 * @function
 *
 * @description:
 * Better typeof
 * usually no one modified built-in Object's prototype
 * so Object.prototype is quite safe here
 * Notice this could turn out to be quite unexpected
 * For example, getTypeOf(arguments) is `Arguments'
 *
 * @param obj {Object/Function/whatever}
 */
function getTypeOf(obj) {
  return Object.prototype.toString.call( obj ).slice( 8, -1 );
}

/**
 * @function extract
 *
 * @description
 * Extract Arguments
 * formally known as extractArguments
 * but we always use it like extract(arguments)
 * which makes "Arguments" in function name somewhat redundant
 *
 * only intern usage intended
 *
 *
 * @param _arguments {Arguments/Array}
 * @param position {integer}
 */
function extract(_arguments, position) {
  return [].slice.call( _arguments, position || 0 );
}


/**
 * @name makeArray
 * @function
 *
 * @description
 *
 * @param arr
 */
function makeArray(arr) {
  if ( getTypeOf( arr ) === "Array" ) {
    return arr;
  }
  else {
    return [arr];
  }
  //return [].concat(arr);
}

/**
 * @name newArray
 * @function
 *
 * @description:
 * Creates a one dimensional array with given arguments
 * Receive multiple arguments or a single argument consists of an array
 * Output an array of arguments
 * it's better than directly using arguments
 * EXAMPLE
 * 1            =>    [1]
 * [1]          =>    [1]
 * 1,2,3,4      =>    [1,2,3,4]
 * [1,2,3,4]    =>    [1,2,3,4]
 *
 * CAUTION:
 * DOES NOT check arguments one by one, e.g.
 * [1,2,[3],4]  =>    [1,2,[3],4]
 *
 * @param
 */
function newArray() {
  if ( arguments.length === 0 ) {
    return [];
  }
  if ( arguments.length === 1 ) {
    // if only arguments length is 1, simply makes it an array
    // else reduces Arguments into Array (typeof is different)

    return makeArray( arguments[0] );
  }
  else{
    // if we do not process arguments,
    // typeof will show `arguments` instead of `array`
    return extract( arguments );
  }
}

/**
 * @name appendArray
 * @function
 *
 * @description:
 * more efficient Array concat
 *
 * @param arr
 * @param orginal (optional)
 */
function appendArray(arr, orginal) {
  if ( !orginal ) {
    return arr;
  }

  return [].push.apply( orginal, arr );
}


if( getTypeOf( Date.now ) !== 'Function' ) {
  // lease efficient way to polyfill Date.now
  // but again, we do not put much optimization in legacy browsers
  Date.now = function() { return +new Date(); };
}

// polyfilling hasOwnProperty
function hasProperty(obj, prop) {
  if ( !obj || !prop ) {
    throw new Error( "prop or obj not found" );
  }
  if (  getTypeOf( obj ) !== "Object" &&
        getTypeOf( obj ) !== "Function" &&
        getTypeOf( obj ) !== "HTMLHtmlElement" ) {
    throw new Error( "prop type mismatch: " + obj.toString() + " is " + getTypeOf( obj ) );
  }


  if ( !!Object.hasOwnProperty ) {
    return obj.hasOwnProperty( prop );
  }
  else {
    if ( !obj.prototype ) {
      return ( prop in obj );
    }
    return ( ( prop in obj ) && !( prop.prototype in obj ) );
  }
}

// FIXME:
// 1. better fallback
// 2. assign multiple key/value at once
/**
 * @name setProperty
 * @function
 *
 * @description:
 *
 * @param obj {Object}
 * @param key {String}
 * @param val {String/Object/Function/Array}
 */
function setProperty(obj, key, val) {
  // FIXME: why using  fails
  if ( hasProperty( Object, "defineProperty" ) ) {
    Object.defineProperty( obj, key, { "value": val } );
  }
  else {
    obj[key] = val;
  }
}

/**
 * @name elementHasClass
 * @function
 *
 * @description
 *
 * @param element
 * @param _className
 */
function elementHasClass(el, _className) {
  if ( !el ) {
    throw new Error( "elementHasClass failed becase element is undefined" );
  }
  if ( !_className ) {
    return true;
  }
  if ( !el.className ) {
    return false;
  }

  return ~( " " + el.className + " " ).indexOf( " " + _className + " " );
}

// so we can kill various log in a single stroke
var konsole = 'console' in window ? console : function() {};



/**
 * @name storeInSQL
 *
 * @description
 *
 * @param
 */
var storeInSQL = function() {};
/**
 * @name unifiedStorage
 * @object
 *
 * @description
 *
 * @param
 */
var unifiedStorage = (function(){
  return {
    clear : function() {
      if ( features && features.incognito ) {
        return false;
      }
      konsole.info( "Purging LSStore." );
      localStorage.clear();
      return false;
    },
    read: function() {
      if ( features && features.incognito ) {
        return null;
      }
      var key = ( arguments.length === 1 ) ? arguments[0] : arguments;

      if ( getTypeOf( key ) === "String" ) {
        return localStorage.getItem( key ) || null;
      }
      else {
        if ( key.length === 1 ) {
          key = key[0];
        }
        for ( var LSContent = {}, item, i = 0; item = key[i]; i++ ) {
          LSContent[item] = localStorage.getItem( item ) || null;
        }
        return LSContent;
      }
    },
    store: function(key, value) {
      if ( features && features.incognito ) {
        return;
      }

      if ( key && localStorage.getItem(key) ) {
        localStorage.removeItem(key);
        if (!value) {
          return;
        }
      }
      localStorage.setItem( key, value );
      konsole.info( "LSStore: " + key + "." );
    },
    SQL: function(_callback, FORCE_REFRESH) { // needs to migrate from refresh_cache.js TOFIX
      return storeInSQL( _callback, FORCE_REFRESH );
    }
  };
}());

/**
 * @name ftcXHR
 * @function
 *
 * @description
 *
 *
 * @param src
 * @param _callback
 * @param option
 */
var ftcXHR = function(src, _callback, option) {
  if ( getTypeOf( _callback ) === "Object" ) {
    option = _callback;
    _callback = option.callback;
  }
  option          = option || {};
  option.async    = option.async || true;
  option.context  = option.context || null;
  option.method   = ( option.method || "" ) .toUpperCase() || "GET";

  var xhr;

  if ( "XMLHttpRequest" in window ) {
    xhr = new XMLHttpRequest();
  }
  else if ( "ActiveXObject" in window ) {
    xhr = new ActiveXObject( "Microsoft.XMLHTTP" );
  }
  else {
    throw new Error( "Unable to create HTTPRequest" );
  }

  // passing parameters to XMLHttpRequest’s onreadystatechange function
  // http://whacked.net/2007/11/27/passing-parameters-to-xmlhttprequests-onreadystatechange-function/
  xhr.onreadystatechange = function(context) {
    return function() {
      if ( this.readyState !== 4 ) {
        return;
      }
      // FIXME
      // maybe we should look out for other status code
      if ( this.status === 200 ) {
        _callback.call( context, xhr.responseText );
      }
    };
  }(option.context);

  xhr.open( "GET", src, false );
  xhr.send( null );

  if ( option.error ) {
    xhr.onerror = function() { option.error.call( option.context );};
  }
  if ( option.load ) {
    xhr.onload = function(){ option.load.call( option.context, xhr.responseText ); };
  }

  return;
};
