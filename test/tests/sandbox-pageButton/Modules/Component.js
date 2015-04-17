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
    limits : function(self,val){},
    initLimit : function(self,val){},
    data : function(self, val){}
  },
  
  onCreate : function(self){
    var _ = window.structureJS.require('Util'),
        indexes = self.getAttribute('limits') || [5,10,25,50,75,100],
        initLimit = self.getAttribute('initLimit') || 0,
        option;
    indexes = (_.isString(indexes)) ? indexes.split(',') : indexes;
    /* build select */
    for(var i = 0; i < indexes.length ; i++){
      option = document.createElement("option");
      option.text = option.value = indexes[i];
      self.appendChild(option);
    }
    
    self.getData = function(){
      var val = this.getAttribute('data'),
          _ = window.structureJS.require('Util');
      return (!_.isNull(val)) ? val.split('.') : [];
    }
    
    self.setLimit = function(limit){
      var mdlParts = this.getData();
      if(mdlParts.length > 1){
        if(_.isDef(mdl = window.Templar.getModel(mdlParts[0])) 
            && _.isArray(mdl[mdlParts[1]])){
            mdl[mdlParts[1]].limit = limit || this.options[this.selectedIndex].value;
        }
      }
    }
    
    
    self.addEventListener('change', function(e){
      this.setLimit();
     });
     /* if we don't wait until repeat is built we add nodes in the middle of compilation
        which fucks up the nodelist, causing things like reunning back over the basenode
        and other nastyness*/
    window.Templar.done(function(){
      self.setLimit(initLimit);
    });
    
    
  }
});

});