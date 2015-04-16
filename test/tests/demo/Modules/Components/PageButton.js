structureJS.module('PageButton', function(require){

Templar.component('PageButton',{
  templateURL : 'Modules/Components/PageButton.html',
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


});