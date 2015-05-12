Templar.component('test',{
  templateURL : 'test.html',
  attributes : {},
  
  makeClickable : function(node){
    var clickables = node.querySelectorAll('.clickable');
    for(var i  = 0; i < clickables.length; i++ ){
      clickables[i].addEventListener('click', function(){
        window.Templar.addClass(this,'selected');
      });
    }
    var tokens = this.dereference(node.getAttribute('data'));
    tokens[0].data['root'] = node;
    
    this.defineSelector(
      tokens[0],
      function(value){
        var clickables = this.data.root.querySelectorAll('.clickable');
        var text = '';
        var currentSelection = null;
        var newSelectionFound = false;
        for(var i  = 0; i < clickables.length; i++ ){

          window.Templar.removeClass(clickables[i],'selected');
          text = clickables[i].textContent || clickables[i].innerText;
          
          if(this.attribute._value_ == text){
            currentSelection = clickables[i];
          }
          
          if(text.trim() == value){
            newSelectionFound = true;
            window.Templar.addClass(clickables[i],'selected');
            this.attribute._value_ = value;
          }
        }
        
        if(newSelectionFound === false){
          window.Templar.addClass(currentSelection,'selected');
        }
      },
      tokens[0].attribute[0]
    );
  },
  
  onCreate : function(node){
    var repeater = node.querySelector('[id=repeat-wrapper]');
    var tokens = this.dereference(node.getAttribute('data'));
    
    repeater.setAttribute('data-apl-repeat', tokens[0].fullToken);
    
  },
  
  onDone : function(e){
    var tokens = this.dereference(e.target.getAttribute('data'));
    var component = this;
    this.makeClickable(e.target);
    tokens[0].model.onRepeatDone(tokens[0].attribName, function(ev){
      component.makeClickable(e.target);
    });
    
  },
  onChange : function(node){
    console.log('Change Fired');
  }
});