/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 : */
/*jshint unused:false, boss:true */
/*global newArray:true */

var ftcCookie = (function () {
  function getCookiesName() {
    return document.cookie.match(/\w+(?==)/g);
  }

  function deleteCookieByName(arr) {
    var cookieNames = newArray(arr),
    cookieName, i,
    _epoch = new Date(0).toGMTString();

    for (i = 0; cookieName = cookieNames[i]; i++) {
      document.cookie = cookieName + "=;expires=" + _epoch;
    }
  }

  return {
    // {json}, 30 days, host, path
    set: function (obj, _days, _host, _path) {
      _days = _days || 30;
      _host = _host || location.host;
      _path = "/";

      var c = new Date(), prop;
      // 24*3600000 = 86400,000
      c.setTime(c.getTime() + (_days * 86400000));

      var _expiry_time = "; expires=" + c.toGMTString();



      for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          document.cookie = prop + "=" + obj[prop] +
            _expiry_time +
            "; domain=" + _host +
            "; path=" + _path;
        }
      }
    },
    get: function (prop) {
      var prop_equals = prop + "=",
          item = document.cookie.split(";"),
          i, g;
      for (i = 0; g = item[i]; i++) {
        while (g.charAt(0) === " ") {
          g = g.substring(1, g.length);
        }
        if (g.indexOf(prop_equals) === 0) {
          return g.substring(prop_equals.length, g.length).replace(/\"/g, "");
        }
      }
      return null;
    },
    remove: deleteCookieByName,
    clear: function () {
      deleteCookieByName(getCookiesName());
    }
  };
}());

