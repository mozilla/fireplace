(function() {
  var conn = navigator.mozMobileConnection;
  var qs = '';
  if (conn) {
    // `MCC`: Mobile Country Code
    // `MNC`: Mobile Network Code
    // `lastKnownNetwork`: `{MCC}-{MNC}`.
    var network = (conn.lastKnownNetwork || conn.lastKnownHomeNetwork || '').split('-');
    qs = '?mcc=' + (network[0] || '') + '&mnc=' + (network[1] || '');
  }
  var i = document.createElement('iframe');
  i.seamless = true;
  i.src = 'https://marketplace.firefox.com/' + qs;
  document.body.appendChild(i);
})();
