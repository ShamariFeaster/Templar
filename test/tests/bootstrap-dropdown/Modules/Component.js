Templar.component('BSDropdown', {
  templateURL : 'BSDropdown.html',
  attributes : {},
  DOM : structureJS.require('DOM'),
  Map : structureJS.require('Map'),
  Interpolate : structureJS.require('Interpolate'),
  State : structureJS.require('State'),
  Compile : structureJS.require('Compile'),
  _ : structureJS.state.context,
  addCurrentSelect : function(textNode, attribute, mdlName, attribName){
    var _this = this;
    (function(textNode, attribute, mdlName, attribName){
      Object.defineProperty(attribute, 'current_selection', {
        configurable : true,
        set : function(value){
          if(value == '')
            return;
          this._value_ = value;
          textNode.innerText = value;
          textNode.textContent = value;
          
          _this.State.dispatchListeners = false;
          _this.Interpolate.interpolate(mdlName, attribName);
          _this.State.dispatchListeners = true;
          
          ddItems = document.getElementsByClassName('bs-dd-item');
          for(var i  = 0; i < ddItems.length; i++ ){
            (function(item, textNode){
              item.addEventListener('click', function(e){
                textNode.innerText = e.currentTarget.textContent || e.currentTarget.innerText;
                attribute.current_selection = textNode.textContent = textNode.innerText;
              });
            })(ddItems[i] ,textNode, attribute)
          }
          
          _this.Interpolate.dispatchListeners(
            _this.Map.getListeners(mdlName, attribName)
            , {
                type : "bootsrap_dd_change"
                , value : value
                , text : value
                , index : -1
                , properties : []
              }
          );
        },
        get : function(){
          return this._value_;
        }
      });
    })(textNode, attribute, mdlName, attribName );
  },
  
  bindClickListeners : function(ddItems, textNode, attribute){
    for(var i  = 0; i < ddItems.length; i++ ){
      (function(item, textNode){
        item.addEventListener('click', function(e){
          textNode.innerText = e.currentTarget.textContent || e.currentTarget.innerText;
          attribute.current_selection = textNode.textContent = textNode.innerText;
        });
      })(ddItems[i] ,textNode, attribute)
    }
  },
  onCreate : function(self){
    var NT = self.getAttribute('data');
    var text = self.getAttribute('text');
    var textNode = self.querySelector('[id=sf-btn-text]');
    var _ = window.structureJS.require('Util');
    var itemTemplate = self.getElementsByTagName('LI');
    var parts = null;
    var Templar = window.Templar;
    var mdl = null;
    var mdlName = '';
    var attribName = '';
    var attribute = null;
    var _this = this;
    
    parts = (!_.isNull(NT)) ? NT.split('.') : [];
    mdlName = parts[0].replace('{{','');
    attribName = parts[1].replace('}}','');
    attribute = Map.getAttribute(mdlName, attribName);
    if(parts.length > 1){
      textNode.innerText = text;
      textNode.textContent = text;
      if(!_.isNull(itemTemplate)){
        itemTemplate = itemTemplate[0];
        itemTemplate.setAttribute('data-apl-repeat', NT);
        _this.DOM.modifyClasses(itemTemplate, 'bs-dd-item','');
        
        Templar.done(function(){
          var ddItems = document.getElementsByClassName('bs-dd-item');
          if(_.isDef(mdl = Templar.getModel(mdlName)) && _.isArray(mdl[attribName])){
            _this.bindClickListeners(ddItems, textNode, attribute);
            _this.addCurrentSelect(textNode, attribute, mdlName, attribName);

            mdl.listen(attribName, function(e){
              if(e.type == _this._.MODEL_EVENT_TYPES.reassignment){
                _this.addCurrentSelect(textNode, attribute, mdlName, attribName);
                var items = e.target.getElementsByTagName('LI');
                var list = e.target.getElementsByTagName('UL')[0];
                for(var i = 0; i < items.length; i++){
                  if(items[i].getAttribute('data-apl-repeat') == null){
                    items[i].parentNode.removeChild(items[i]);
                    i--;
                  }
                }
                Map.getRepeatBaseNodes(mdlName, attribName).length = 0;
                _this.Compile.compile(list,'');
                _this.bindClickListeners(ddItems, textNode, attribute);
                _this.addCurrentSelect(textNode, attribute, mdlName, attribName);
              }
            });
          }
        });
 
      }
    }else{
      _.log('WARNING: BSDropdown "data" attribute has invalid value "' +NT+'"');
    }
  }
  
});