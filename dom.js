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
  // has to do this check first because if _className is not present
  // and el is absence as well, it should not return true
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
  return ( new RegExp( "\\b" + _className + "\\b" ).test( el.className ) );
}


/**
 * @name elementCanBeDescribedAs
 * @function
 *
 * @description
 *
 * support 4 selectors:
 * 1.  #id
 * 2.  .className
 * 3.  tagName
 * 4.  tagName.className
 *
 * @param el
 * @param selector
 */
function elementFitsDescription(el, selector) {
  if ( !selector ) {
    return false;
  }
  if ( !el ) {
    return false;
  }

  var _tagName, _className, pos,
      selectorFirstCharRemoved = selector.charAt( 0 );

  switch ( selectorFirstCharRemoved ) {
    case "#" :
      if ( "#" + el.id === selector ) {
        return el;
      }
      break;
    case "." :
      // so we do not have to consider whether the className is the first or the last
      if ( elementHasClass( el, selectorFirstCharRemoved ) ) {
        return el;
      }
      break;
    default :
      pos = selector.indexOf( "." );
      // tagName.className
      // now we know that "." will not be the leading character
      if ( ~pos ) {
        _tagName = selector;
        _className = _tagName.splice( 0, pos + 1 );
        _tagName = _tagName.slice( 0 , -1 );
        if ( ( el.tagName.toLowerCase() === _tagName ) && elementHasClass( el, _className ) ) {
          return el;
        }
      }
      // tagName
      else {
        // apparently `#' will not be at 0
        if ( selector.indexOf( "#" ) > 0 ) {
          throw new Error( selector + "not supported, use #id instead." );
        }
        else {
          if ( el.tagName.toLowerCase() === selector ) {
            return el;
          }
        }
      }
      // end of default branch
  }
  return null;
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
  var  _classNameArray, _className = el.className;

  if ( !_className ) {
    if ( option.add ) {
      el.className = option.add;
      return;
    }
    // nothing else to do
    return;
  }
  
  if ( Object.prototype.hasOwnProperty.call( document.body, "classList" ) ) {
    // classList is not unique
    _classNameArray = Array.prototype.unique.call( el.classList );
  }
  else {
    _classNameArray = _className.split( " " ).unique();
  }

  if ( option.remove ) {
    var classToRemove = option.remove.split( " " );
    _classNameArray = Array.prototype.diff.call( _classNameArray, classToRemove );
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
