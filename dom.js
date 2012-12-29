/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 : */


/**
 * @description
 * shorthand for getElementById
 * @param el
 */
function ___(el) {
  return document.getElementById( el );
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

  // so that we do not have to make special case for the 1st / last item
  return ~( " " + el.className + " " ).indexOf( " " + _className + " " );
}

/**
 * @name manipulateClass
 * @function
 *
 * @description
 * order of execution:
 * remove then add
 *
 * @param el
 * @param option
 * parameters:
 * {
 *    add   : STRING (must be unique)
 *    remove: STRING (must be unique)
 * }
 */
function manipulateClass(el, option) {
  if ( !el || !option || typeof option !== "object" ) {
    return;
  }

  if ( ( option.add && typeof option.add !== "string" ) ||
       ( option.remove && typeof option.remove !== "string" ) ) {
    throw new TypeError( "Parameters malformed." + option.toString() +
                         " should be object of string" );
  }
  var _className = el.className;

  if ( !_className ) {
    if ( option.add ) {
      el.className = option.add;
      return;
    }
    // nothing else to do
    return;
  }

  var _classNameArray = _className.split( " " ).unique();

  if ( option.remove ) {
    var classToRemove = option.remove.split( " " );
    _classNameArray = _classNameArray.diff( classToRemove );
  }
  if ( option.add ) {
    // in case there is duplicate
    var classToAdd = option.add.split( " " );

    // remove duplicates and join two arraries
    // `classToAdd.diff' remove what is already in original array
    // `push.apply' equals to a.concat(b)
    // only `push' does not create new array
    // so in theory, push might be slightly faster
    // and we do not want a new array anyway
    Array.prototype.push.apply( _classNameArray, classToAdd.diff( _classNameArray, "exclude" ) );
  }
  _className = _classNameArray.join( " " );
  el.className = _className;
  return;
}

/**
 * @name toggleElement
 * @function
 *
 * @description
 * @param el
 * @param state
 */
function toggleElement(el, state) {
  if ( !___( el ) ) {
    return;
  }
  return ___( el ).style.display = state ? state : "none";
}
