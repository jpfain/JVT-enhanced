'use strict';

(function(){
  function log(msg, ok) {
    var out = document.getElementById('test-output');
    var div = document.createElement('div');
    div.textContent = (ok ? 'PASS: ' : 'FAIL: ') + msg;
    div.style.color = ok ? 'green' : 'red';
    out.appendChild(div);
  }

  function assertEqual(name, actual, expected) {
    var ok = JSON.stringify(actual) === JSON.stringify(expected);
    log(name + ' => expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual), ok);
  }

  if (!window.JVTTest) {
    log('JVTTest helpers not found on window. Tests cannot run.', false);
    return;
  }

  // Age calculator tests
  // 41.656 human years = 1 "Jehovah hour" in your formula, so expect 1 hour 0 minutes.
  assertEqual('Age 41.656 years', window.JVTTest.computeJehovahAge(41.656).output, '1 hour 0 minutes');
  assertEqual('Age 0 years', window.JVTTest.computeJehovahAge(0).output, '0 minutes 0 seconds');

  // BCE/CE calculator tests (structure only, years ago / in years)
  var currentYear = new Date().getFullYear();
  var diff1 = window.JVTTest.computeBceCeDiff(2024, 'CE', currentYear);
  assertEqual('2024 CE diff sign', diff1.diff >= 0, currentYear >= 2024);

  var diff2 = window.JVTTest.computeBceCeDiff(1, 'BCE', currentYear);
  assertEqual('1 BCE numeric year', diff2.numericYear, 0);

})();
