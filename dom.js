/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 : */
/*jshint unused:false, boss:true */
/*global DOMTokenList:true, features:true */

/**
 * @description
 * shorthand for getElementById
 * @param el
 */
function ___(el) {
  return document.getElementById(el);
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
  if (!el) {
    throw new Error("elementHasClass failed becase element is undefined");
  }
  if (!_className) {
    return true;
  }

  if ("classList" in document.body && "DOMTokenList") {
    return el.classList.contains(_className);
  }

  if (!el.className) {
    return false;
  }
  // so that we do not have to make special case for the 1st / last item
  return (new RegExp("\\b" + _className + "\\b").test(el.className));
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
 *    add   : STRING/ARRAY (must be unique)
 *    remove: STRING/ARRAY (must be unique)
 * }
 */
function manipulateClass(el, option) {
  if (!el || !option || typeof option !== "object") {
    return;
  }

  var toAdd = [], toRemove = [];
  if (option.add) {
    if (typeof option.add === "string") {
      toAdd = option.add.split(/\s+/).unique();
    }
    else if (typeof option.add === "array") {
      toAdd = option.add;
    }
  }
  if (option.remove) {
    if (typeof option.remove === "string") {
      toRemove = option.remove.split(/\s+/).unique();
    }
    if (typeof option.remove === "array") {
      toRemove = option.remove;
    }
  }

  // Firefox and Opera has a bug in classList (or should I say feature?)
  // https://bugzilla.mozilla.org/show_bug.cgi?id=826973
  // so we cannot use DOMTokenList.prototype.remove.apply(el.classList, toRemove);
  if ("classList" in document.body && Array.prototype.hasOwnProperty("map")) {
    toRemove.map(function (item) {el.classList.remove(item); });
    toAdd.map(function (item) {el.classList.add(item); });
    return;
  }

  var  _classNameArray, _className = el.className;

  if (!_className) {
    if (option.add) {
      el.className = option.add;
      return;
    }
    // nothing else to do
    return;
  }
  
  // FIXME: use classList as much as possible
  _classNameArray = _className.split(/\s+/).unique();

  if (option.remove) {
    _classNameArray = _classNameArray.diff(toRemove);
  }
  if (option.add) {
    // in case there is duplicate
    var classToAdd = option.add.split(" ");

    // remove duplicates and join two arraries
    [].push.apply(_classNameArray, toAdd.diff(_classNameArray));
  }
  el.className = _classNameArray.join(" ");
  _classNameArray = null;
  _className = null;
  toAdd = null;
  toRemove = null;
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
  if (!___(el)) {
    return;
  }
  return ___(el).style.display = state ? state : "none";
}
