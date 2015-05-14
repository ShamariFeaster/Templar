Templar.component('DblClickEditor', {
  templateURL : 'DblClickEditor.html',
  attributes : {},

  onCreate : function(root){
    var dataTokens = this.dereference(root.getAttribute('x-nt') || '');
    var toggleTokens = this.dereference(root.getAttribute('takeInput') || '');
    var input = root.querySelector('[id=text-input]');
    var text = root.querySelector('[id=text]');
    
    function toggle(){
      var isEditting = input.getAttribute('showIf');
      isEditting = (isEditting === 'false' || isEditting === false) ? false : true;
      input.setAttribute('showIf', !isEditting );
      text.setAttribute('hideIf', !isEditting );
    }
    
    if(dataTokens.length > 0){
      input.setAttribute('value', dataTokens[0].fullToken );
      text.innerHTML = dataTokens[0].fullToken;
    }
    
    input.setAttribute('showIf', false );
    text.setAttribute('hideIf', false );
    
    if(toggleTokens.length > 0){
      input.setAttribute('showIf', toggleTokens[0].fullToken );
      text.setAttribute('hideIf', toggleTokens[0].fullToken );
    }
    
    text.addEventListener('dblclick', function(){
      toggle();
    });
    
    var context = {ignoreBlur : false};
    var blurHandler = function(){
      if(this.ignoreBlur === false){
        toggle();
      }else{
        this.ignoreBlur = false;
      }
      
    };
    
    var keyupHandler = function(e){
      if(e.keyCode === 13){
        this.ignoreBlur = true;
        toggle();
      }
    };
    
    input.addEventListener('blur', blurHandler.bind(context));
    
    input.addEventListener('keyup', keyupHandler.bind(context));
  }
});