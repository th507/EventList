/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 : */
// find unique and not-empty item
// http://www.shamasis.net/2009/09/fast-algorithm-to-find-unique-items-in-javascript-array/#comment-348025468
Array.prototype.unique = function(){
  return this.filter(function(value, key, arr){
    return value && ( key === arr.lastIndexOf( value ) );
  });
};

// find array difference
// http://stackoverflow.com/questions/1187518/javascript-array-difference
Array.prototype.diff = function(a) {
  return this.filter(function(i) { return ~a.indexOf( i );});
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
  if ( getTypeOf( obj ) !== "Object" && getTypeOf( obj ) !== "Function" && getTypeOf( obj ) !== "HTMLHtmlElement" ) {
    throw new Error( "prop type mismatch: " + obj.toString() + " is " + getTypeOf( obj ) );
  }


  if ( !!Object.hasOwnProperty ) {
    return obj.hasOwnProperty( prop );
  }
  else {
    if ( !obj.prototype ) {
      throw new Error( "Unable to call" + obj.toString() + "'s prototype.");
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
    Object.defineProperty( obj, key, {"value": val} );
  }
  else {
    obj[key] = val;
  }
}

/**
 * @name elementHasClass
 * @function
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

