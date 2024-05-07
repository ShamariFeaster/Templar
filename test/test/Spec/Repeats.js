//https://jasmine.github.io/tutorials/your_first_suite
Templar.done(function(){
    let testModel = Templar.getModel('test');
    describe('Repeats', function() {
        beforeEach(function() {
            
        });
        it('scalar, {{}} count correct', function() {
            //count is arr length + 1 b/c "template" markup remains
            // and is hidden
            let visibleCount = $('.repeat-token').length - 1;
            expect( visibleCount ).toBe(3);
        });

        it('scalar, {{}} values correct', function() {
            let result = 1;

            $('.repeat-token').each(function(index, $item){
                //repeat template is last element so avoid making comparisson on that one
                if(index < testModel.scalar_repeats.length){
                    //repeats output values are wrapped in spans
                    $item = $($item).find('span');
                    result &= (testModel.scalar_repeats[index] == $item.text());
                }
                
            })
            
            expect( result ).toBe(1);
        });

    });

});
