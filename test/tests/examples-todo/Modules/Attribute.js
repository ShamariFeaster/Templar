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
      self.style.visibility = '';
    }else{
      self.style.visibility = 'hidden';
    }
  }
});

Templar.attribute('hideIf',{
  onChange : function(self, val){
    if(val === true || val == 'true' || parseInt(val) > 0){
      self.style.visibility = 'hidden';
    }else{
      self.style.visibility = '';
    }
  }
});