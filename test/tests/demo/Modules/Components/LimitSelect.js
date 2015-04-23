Templar.component('LimitSelect',{
  templateURL : 'Modules/Components/LimitSelect.html',
  attributes : {
    limits : function(self,val){},
    initLimit : function(self,val){},
    max : function(self,val){},
    data : function(self, val){}
  },
  
  onCreate : function(self){
    var _ = window.structureJS.require('Util'),
        max = parseInt(self.getAttribute('max')) || 1000,
        indexes = self.getAttribute('limits') || [5,10,25,50,75,100],
        initLimit = self.getAttribute('initLimit') || 0,
        option;
        
    indexes = (_.isString(indexes)) ? indexes.split(',') : indexes;
    
    /* build select */
    for(var i = 0; i < indexes.length ; i++){
      if(indexes[i] > max)
        break;
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
      var mdlParts = this.getData(),
          mdl;
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

    var mdlParts = self.getData(),
        mdl = (mdlParts.length > 1) ? window.Templar.getModel(mdlParts[0]) : null;
    /* Set inital limit */
    if(mdlParts.length > 1){
      if(_.isDef(mdl = window.Templar.getModel(mdlParts[0])) 
          && _.isArray(mdl[mdlParts[1]])){
          mdl[mdlParts[1]].limit = initLimit;
      }
    }

  }
});