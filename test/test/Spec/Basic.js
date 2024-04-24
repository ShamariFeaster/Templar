Templar.done(function(){
  let testModel;
  describe('when song has been paused', function() {
    beforeEach(function() {
      testModel = Templar.getModel('test');
    });
  
    it('should interpolate model attribute', function() {
      let greetingText = $('#greeting').text();
      expect(greetingText).toBe('hello world');
  
    });
  
  });
});
