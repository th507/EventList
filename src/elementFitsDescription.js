/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 : */
/*jshint unused:false, boss:true */


/**
 * @helper function
 * @name elementHasClass
 * @function
 *
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

/**
 * @helper function
 * @name elementFitsDescription
 * @function
 *
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
