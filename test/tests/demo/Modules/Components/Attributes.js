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
    if(val == false){
      self.style.visibility = 'hidden';
    }else{
      self.style.visibility = '';
    }
  }
});

Templar.attribute('hideIf',{
  onChange : function(self, val){
    if(val == true){
      self.style.visibility = 'hidden';
    }else{
      self.style.visibility = '';
    }
  }
});