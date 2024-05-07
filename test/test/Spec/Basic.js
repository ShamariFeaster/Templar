//https://jasmine.github.io/tutorials/your_first_suite
Templar.done(function(){
    let testModel = Templar.getModel('test');
    describe('Basic Interpolation', function() {
        beforeEach(function() {
            
        });
        //TODO: go through docs, turning features into
        //it()'s then construct models, html and actual tests
        it('scalar model attribute', function() {
            let greetingText = $('#greeting').text();
            expect(greetingText).toBe(testModel.greeting);

        });

    });

});
