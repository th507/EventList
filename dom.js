/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 : */


/**
 * @description
 * shorthand for getElementById
 * @param el
 */
var ___ = function(el) {
  return document.getElementById( el );
};

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
var manipulateClass = function(el, option) {
  if ( !el || !option || typeof option !== "object" ) {
    return;
  }

  if ( ( option.add &&typeof option.add !== "string" ) || ( option.remove && typeof option.remove !== "string" ) ) {
    throw new TypeError( "Parameters malformed." + option + " should be object of string" );
  }
  var _className = el.className;

  if ( !_className ) {
    if ( option.add ) {
      el.className = option.add;
      return;
    }
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
    Array.prototype.push.apply( _classNameArray, classToAdd.diff( _classNameArray, "exclude" ) );
  }
  _className = _classNameArray.join( " " );
  el.className = _className;
  return;
};

/**
 * @name toggleElement
 * @function
 *
 * @description
 * @param el
 * @param state
 */
var toggleElement = function(el, state) {
  if ( !___( el ) ) {
    return;
  }
  return ___( el ).style.display = state ? state : "none";
};
