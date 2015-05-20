/* binds to an attrubute and creates a bootstrap dropdown */

Templar.component('BSDropdown', {
  templateURL : 'BSDropdown.html',
  attributes : {},
 
  bindClickListeners : function(root){
    var tokens = this.dereference(root.getAttribute('data'));
    var items = root.getElementsByTagName('LI');
    var textNode = root.querySelector('[id=sf-btn-text]');
    
    var listener = function(e){
      this.textNode.innerText = e.currentTarget.textContent || e.currentTarget.innerText;
      this.attribute.current_selection = this.textNode.textContent = this.textNode.innerText;
    };

    for(var i  = 0; i < items.length; i++ ){
      items[i].addEventListener('click', listener.bind({textNode : textNode, attribute : tokens[0].attribute}));
    }
    
    tokens[0].data.root = root;
    
    this.defineSelector(
      tokens[0],
      function(value){
        var textNode = this.data.root.querySelector('[id=sf-btn-text]');
        textNode.innerText = value;
        textNode.textContent = value;
        this.attribute._value_ = value;
        this.model.update(this.attribName + '.current_selection');
      });
  },
  
  onDone : function(){
    //this.target = component root node
    //this = component
  },
  
  //don't add prop unless using, existence causes bind to mutation event
  onChange : function(root, e){

  },
  
  onCreate : function(root){
    var itemTemplate = root.getElementsByTagName('LI');
    var tokens = this.dereference(root.getAttribute('data'));
    
    itemTemplate[0].setAttribute('data-apl-repeat', tokens[0].fullToken);
    tokens[0].model.onRepeatDone(tokens[0].attribName, this.bindClickListeners.bind(this, root));

  }
  
});