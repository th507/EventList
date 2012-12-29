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

  // FIXME: better detection through uastring
  webapp: /webapp/.test( location.search ),

  // FEATURES
  // is retina display, or more generally speaking,
  // What is the device's pixel ratio?
  retina:     ( window.devicePixelRatio || 1 ) - 1,
  // detecting touch capability
  // http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
  touchInput:   !!( 'ontouchstart' in window ), // cannot use window.ontouchstart
  /* has localStorage and sessionStorage
  localStorage: !!( localStorage && sessionStorage ),*/
  // has web SQL
  webSQL:       !!window.openDatabase,
  // has indexDB
  indexDB:      !!window.IDBDatabase/*,
  // debug mode
  debugLevel:   document.cookie.match( /dbg/ ) || 0*/
};

features = features || {};
features.mobile = features.android || features.ios || features.blackBerry || features.ieMobile || false;
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
  if ( !features.localStorage ) {
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
