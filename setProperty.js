/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 : */
/*jshint unused:false, boss:true */
/*global console:true, features:true */

// polyfilling hasOwnProperty
// https://gist.github.com/332357
if (!Object.prototype.hasOwnProperty) {
  Object.prototype.hasOwnProperty = function (prop) {
    var proto = this.prototype || this.constructor.prototype;
    return (prop in this) && (!(prop in proto) || proto[prop] !== this[prop]);
  };
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
function setProperty(obj, key, val, writableFlag) {
  if (Object.hasOwnProperty("defineProperty")) {
    Object.defineProperty(obj, key, { value: val,
                                      writable : writableFlag || false
    });
  }
  else {
    obj[key] = val;
  }
}
