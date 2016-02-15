// at the top of the test spec:
var fs = require('fs');

function screenShot(filename) {
    var stream = fs.createWriteStream(filename);
    browser.takeScreenshot().then(function (png) {
      stream.write(new Buffer(png, 'base64'));
      stream.end();
      fs.rename(filename,'../screen-shots/' + filename + '.png', function(){});
    });
}

function test(folderName){
  browser.get(folderName);
  element.all(by.css('ol.qunit-assert-list li.fail')).then(function(failures) {
    /*I could parse the error nodes for logging errors to file as well*/
    if(failures.length > 0){
      browser.pause();
      browser.debugger();
      expect(false).toEqual(true);
    }else{
      expect(true).toEqual(true);
    }
  });

  
}

describe('Regression Suite', function() {
  beforeEach(function() {
    isAngularSite(false); 
  });

  it('Run Regression Suite', function() {
    test('body-interp');
    test('templar-success');
    test('routing');
    //test('templar-nodeTree'); //See notes in tests.js
    test('templar-interpolation-select');
    test('templar-interpolation-attribute');
    test('templar-interpolation-paging');
    test('templar-interpolation-sort');
    test('templar-interpolation-filter');
    test('templar-interpolation-input');
    test('templar-model-listener');
    test('templar-interpolation-input');
    test('templar-interpolation-input-checkbox');
    test('templar-interpolation-input-radio');
    test('templar-component');
    test('templar-component-control');
  });
});