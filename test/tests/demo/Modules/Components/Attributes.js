Templar.attribute('isDisabled',{
  onChange : function(self, val){
    if(val == 'true'){
      self._setAttribute('disabled','');
    }else{
      self.removeAttribute('disabled');
    }
  }
});