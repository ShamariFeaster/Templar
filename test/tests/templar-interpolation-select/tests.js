/*
QUnit.asyncTest( 'Multiple onloads', function( assert ) {
  expect( 7 );
  var cModel = Templar.getModel('Comments'),
      eModel =  Templar.getModel('Environment');
  Templar.success('partial-login-screen.html', function(){
    assert.ok(true,'multi-partial on same screen loaded 1');
    assert.equal(cModel.selectedComment, $('#selectedComment').text(),'interp 1');
    QUnit.start();
    
  }); 
  
  Templar.success('partial-single-nitework.html', function(){
    assert.ok(true,'multi-partial on same screen loaded 2');
    assert.equal(eModel.time, $('#time').text(),'interp 2');
  }); 
  
  Templar.success('partial-home-screen.html', function(){
    assert.ok(true, 'embedded partial loaded');
    assert.equal(eModel.image_templar, $('#image_templar').text(),'interp 3');
    assert.equal(eModel.host, $('#host').text(),'interp 4');
  });
});
*/


QUnit.frameworkLoaded(function(){
  var cModel, Map, System, DOM, _, 
      _selectedText = null,
      _selectedValue = null,
      _selectedIndex = null;
  QUnit.module('Selects', 
  {
    setup : function(){
      cModel = Templar.getModel('Comments');
      Map = structureJS.require('Map');
      System = structureJS.require('System');
      DOM = structureJS.require('DOM');
      _ = structureJS.config.context;
      
      

    },
    teardown : function(){

    }
  });
  
  /*Helpers*/
  function checkDOMMatchesModel(assert){
    var options = $('#select option'),
        limitContents = '',
        interpedLimitsContent = '',
        selectedInModel = '',
        selectedInterped = '';
    
    for(var i = 0; i < cModel.limits.length; i++){
      limitContents += ' ' + cModel.limits[i].text;
      selectedInModel = (cModel.limits[i].selected) ? cModel.limits[i].text : selectedInModel;
      
    }
    
    options.each(function(){
      interpedLimitsContent += ' ' + this.innerHTML;
    });
    /*FF note: innerText is undefined for options. Also noticed this in Interpolate.interpolateSpan
      . Had to change from setting innerText to innerHTML.*/
    options.filter(':selected').each(function(){
      selectedInterped = this.innerHTML;
    });
    
    assert.equal(limitContents, limitContents, 'interp matches model');
    assert.equal(selectedInModel, selectedInterped, 'selected from model works');
    
  }
  
  function fireOnChange(DOMElement){
    if ("createEvent" in document) {
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("change", false, true);
      DOMElement.dispatchEvent(evt);
    } else {
      DOMElement.fireEvent("onchange");
    }
  }
  /*END Helpers*/
  
  QUnit.test('Select interp',function( assert ){
    checkDOMMatchesModel(assert);
  });
  
  QUnit.test('Select after model change',function( assert ){
    cModel.limits = [{text : 'a', value : 3},
            {text : 'b', value : 5, selected : true},
            {text : 'c', value : 7}];
    checkDOMMatchesModel(assert);
  });
  
  QUnit.asyncTest('Listener on select', function( assert ) {
    cModel.listen('limits', function(e){
      if(e.type == _.MODEL_EVENT_TYPES.select_change){
        assert.equal(e.text, cModel.limits[2].text, 'listener works: text');
        assert.equal(e.value, cModel.limits[2].value, 'listener works: value');
        assert.equal(e.index, 2, 'listener works: index');
        QUnit.start();
      }
      
    });
  
    cModel.limits = [{text : 'a', value : 3},
            {text : 'b', value : 5, selected : true},
            {text : 'c', value : 7}];
    var select = $('#select');
    select[0].selectedIndex = 2;
    fireOnChange(select[0]);
 
  });

  
});






