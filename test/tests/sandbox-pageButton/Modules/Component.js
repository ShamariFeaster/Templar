structureJS.module('PageButton', function(require){

Templar.component('PageButton',{
  templateURL : 'PageButton.html',
  attributes : {
    type : function(self, val){},
    data : function(self, val){}
  },
  
  onCreate : function(self){
    
    self.addEventListener('click', function(e){
      var val = this.getAttribute('data'),
          _ = window.structureJS.require('Util');
      val = (!_.isNull(val)) ? val.split('.') : [];
      if(val.length > 1){
        
        if(_.isDef(mdl = window.Templar.getModel(val[0])) 
            && _.isArray(mdl[val[1]])){
              
          var type = this.getAttribute('type');
          if(type == 'up'){
            mdl[val[1]].page++;
          }else if(type == 'down'){
            mdl[val[1]].page--;
          }
          
        }
      }
  
       
    });
    
  }
});

Templar.component('LimitSelect',{
  templateURL : 'LimitSelect.html',
  attributes : {
    max : function(){self,val},
    data : function(self, val){}
  },
  
  onCreate : function(self){
    var max = parseInt(self.getAttribute('max')) || 10,
        indexes = [2,5,10,25,50,75,100],
        option;
    
    for(var i = 0; i < indexes.length ; i++){
      if(indexes[i] > max)
        break;
      option = document.createElement("option");
      option.text = option.value = indexes[i];
      self.appendChild(option);
    }
    
    self.addEventListener('change', function(e){
      var val = this.getAttribute('data'),
          _ = window.structureJS.require('Util');
      val = (!_.isNull(val)) ? val.split('.') : [];
      if(val.length > 1){
        var select = e.target;
        if(_.isDef(mdl = window.Templar.getModel(val[0])) 
            && _.isArray(mdl[val[1]])){
            mdl[val[1]].limit = select.options[select.selectedIndex].value;
        }
      }
  
       
    });
    
  }
});

});