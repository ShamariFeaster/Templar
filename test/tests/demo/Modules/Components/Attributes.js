Templar.attribute('isDisabled',{
  onChange : function(self, val){
    if(val == 'true'){
      self._setAttribute('disabled','');
    }else{
      self.removeAttribute('disabled');
    }
  }
});

Templar.attribute('isVisible',{
  onChange : function(self, val){
    if(val == 'false'){
      self.style.display = 'none';
    }else{
      self.style.display = '';
    }
  }
});