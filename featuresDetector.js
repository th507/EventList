/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 : */


var features = {
  // PLATFORM
  android:    !!navigator.userAgent.match(/Android/i),
  blackBerry: !!navigator.userAgent.match(/BlackBerry/i),
  iOS:        !!navigator.userAgent.match(/iP(hone|ad|od)/i),
  ieMobile:   !!navigator.userAgent.match(/IEMobile/i),
  // desktop
  ie:         !!document.all,
  firefox:    !document.layers && !document.all,
  opera:      !!window.opera,

  platform:   ( navigator.appVersion || navigator.userAgent ),

  // if running on file: or about: or chrome:
  // calling localStorage and document.cookie will emit DOM Error 18
  isLocalFile:(location.protocol !== "http:" && location.protocol !== "https:"),

  // FEATURES
  // is retina display, or more generally speaking,
  // What is the device's pixel ratio?
  retina:     ( window.devicePixelRatio || 1 ) - 1,
  // detecting touch capability
  // http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
  touchInput: !!( 'ontouchstart' in window ), // cannot use window.ontouchstart
  // has web SQL
  webSQL:     !!window.openDatabase,
  // has indexDB
  indexDB:    !!window.IDBDatabase
};

features.mobile = features.android || features.ios || features.blackBerry || features.ieMobile || false;

features.webapp = (function() {
  if ( !features.mobile ) {
    return false;
  }
  
  // in iPhone native app, we use index.html?webapp as address
  if ( ~location.search.indexOf( "webapp" ) ) {
    return true;
  }
  
  if ( features.ios ) {
    if ( !~navigator.userAgent.indexOf( "Safari" ) ) {
      return true;
    }
  }
}());

// debug mode
features.debugLevel = features.isLocalFile ? 0 : ( document.cookie.match( /dbg/ ) || 0 );

features.version = (function(){
  var ua = navigator.userAgent;
  if ( features.ios ) {
    return parseFloat( ua.match( /iP(?:hone|ad|od);\ (?:U;\ )?CPU\ (?:(?:iPhone\ )?)OS\ ([0-9_]+)/ )[1].replace( /_/, "." ) );
  }
  if ( features.android ) {
    return parseFloat( ua.slice( ua.indexOf( "ndroid" ) + 7 ) );
  }
}());

// Is this falseage running in incognito/private mode?
features.incognito = (function() {
  if ( features.isLocalFile || !window.localStorage ) {
    return true;
  }
  try {
    // just pick a least likely name
    localStorage.setItem( "ಠ_ಠ", "ಠ_ಠ" );
    return false;
  }
  catch( e ) {
    return true;
  }
}());

window.features = features;
