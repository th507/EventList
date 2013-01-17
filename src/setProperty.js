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
// maybe assign multiple key/value at once?
/**
 * @helper function
 * @name setProperty
 * @function
 * {{{ 2
 * @description Setting an unenumerable value to an object.
 * @param {obj} Original object which to add the key:value to.
 * @param {key} Key for the value.
 * @param {val} Value to be assigned.
 * @param {writableFlag} Writable or not.
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
