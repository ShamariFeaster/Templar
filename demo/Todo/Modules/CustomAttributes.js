Templar.attribute('isDisabled',{
  onChange : function(self, val){
    if(val == 'true'){
      self._setAttribute('disabled','');
    }else{
      self.removeAttribute('disabled');
    }
  }
});

Templar.attribute('showIf',{
  onChange : function(self, val){
    if(val === true || val == 'true' || parseInt(val) > 0){
      self.style.display = '';
    }else{
      self.style.display = 'none';
    }
  }
});

Templar.attribute('hideIf',{
  onChange : function(self, val){
    if(val === true || val == 'true' || parseInt(val) > 0){
      self.style.display = 'none';
    }else{
      self.style.display = '';
    }
  }
});