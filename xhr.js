/*jshint unused:false */
/*global ActiveXObject:true */
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
function ftcXHR(src, _callback, option) {
  if (typeof _callback === "object") {
    option    = _callback;
    _callback = option.callback;
  }
  option          = option || {};
  option.async    = option.async || true;
  option.context  = option.context || null;
  option.method   = (option.method || "").toUpperCase() || "GET";

  var xhr;

  if ("XMLHttpRequest" in window) {
    xhr = new XMLHttpRequest();
  }
  else if ("ActiveXObject" in window) {
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }
  else {
    throw new Error("Unable to create HTTPRequest");
  }

  // passing parameters to XMLHttpRequest’s onreadystatechange function
  // http://whacked.net/2007/11/27/passing-parameters-to-xmlhttprequests-onreadystatechange-function/
  xhr.onreadystatechange = (function (context) {
    return function () {
      if (this.readyState !== 4) {
        return;
      }
      // FIXME
      // maybe we should look out for other status code
      if (this.status === 200) {
        _callback.call(context, xhr.responseText);
      }
    };
  }(option.context));

  xhr.open("GET", src, false);
  xhr.send(null);

  if (option.error) {
    xhr.onerror = function () { option.error.call(option.context); };
  }
  if (option.load) {
    xhr.onload = function () { option.load.call(option.context, xhr.responseText); };
  }

  return;
}
