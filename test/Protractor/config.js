exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['spec.js'],
  baseUrl: 'http://localhost/Templar/test/tests/',
  onPrepare: function() {
    global.isAngularSite = function(flag){
            browser.ignoreSynchronization = !flag;
        };
  }
}

