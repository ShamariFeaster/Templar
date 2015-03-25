structureJS.module('Process', function(require){

var _ = this;
var TMP_Node = require('TMP_Node');
var Map = require('Map');
var DOM = require('DOM');
var Attribute = require('Attribute')();
var Circular = structureJS.circular();
return {

  parseModelAttribName : function(qualifiedAttribName){
    var modelNameParts = ['',''];
    if( _.isDef(qualifiedAttribName) && ((modelNameParts = qualifiedAttribName.split('.')).length > 1)  ){
        ;//noop
    }
    return modelNameParts;
  },
  
  buildNonTerminal : function(modelName, modelAtrribName, propertyName, index){
    var propertyName = (_.isNullOrEmpty(propertyName)) ? '' : '.' + propertyName;
    return '{{' + modelName + '.' + modelAtrribName + '[' + index + ']' + propertyName + '}}';
  },

  buildRepeatNonTerminal : function(modelName, modelAtrribName, parentModel, parentAttrib, index){
    var propertyName = (_.isNullOrEmpty(propertyName)) ? '' : propertyName;
    return '{{' + modelName + '.' + modelAtrribName + '[' + index + '].zTMPzDOT' + parentModel +'DOT' + parentAttrib + '}}';
  },
  preProcessNodeAttributes : function(node, scope){
    var attributes = null,
        match = null,
        tmp_node = null,
        preProcessedTMPNodes = [],
        customAttribute,
        origValue;
    
    /*Options don't need to be in the node tree due to having NTs in 'value' attribute*/
    if(node.hasAttributes() && node.tagName != 'OPTION'){
      attributes = node.attributes;
      /*search node attributes for non-terminals*/
      for(var i = 0; i < attributes.length; i++){
        origValue = attributes[i].value;
        if((customAttribute = Attribute.getAttribute(attributes[i].name)) != null){
          
          node._setAttribute = node.setAttribute;
          node.__customAttribute__ = customAttribute;
          node.setAttribute = function(name, val){
            this.__customAttribute__.onChange.call(this.__customAttribute__, this, val);
            this._setAttribute.call(this, name, val);
          };
          /*This is called after the _setAttribute assignment b/c onCreate calls onChange
            implicitly which may make use of it.*/
          customAttribute.onCreate.call(customAttribute, node);
        }
        
        _.RX_M_ATTR.lastIndex = 0;
        while( (match = _.RX_M_ATTR.exec(origValue)) != null ){
          tmp_node = new TMP_Node(node, match[1], match[2]);         
          tmp_node.symbolMap[attributes[i].name] = origValue;
          tmp_node.scope = scope;

          Map.pushNodes(tmp_node);
          /*This is necessary for repeats as their child nodes aren't added to Interpolation array
            Rather they are recompiled using repeated elements as the base. It makes sense since
            we do interpolation during preprocessing with repeats that we do the same with attributes
            in repeats*/
          Interpolate.updateNodeAttributes(tmp_node, tmp_node.modelName, tmp_node.attribName);
          /*annotate node with symbolMap and push it onto modelMap */
          preProcessedTMPNodes.push(tmp_node);
        }
        
      }

    }
    
    return preProcessedTMPNodes;
  },
  
  preProcessRepeatNode : function(TMP_baseNode, index){
    var newId = null,
        repeatedProperties = null,
        uncompiledTemplate = '',
        intraCompilation = '',
        idvRepeatedProperty = null,
        nonTerminal = '',
        newDomNode = document.createElement(TMP_baseNode.node.tagName.toLowerCase()),
        TMP_repeatedNode = new TMP_Node(newDomNode, TMP_baseNode.modelName, TMP_baseNode.attribName, index),
        match = null,
        templateText = TMP_baseNode.node.innerHTML;
        
    DOM.cloneAttributes(TMP_baseNode.node, TMP_repeatedNode.node);
    TMP_repeatedNode.node.innerHTML = templateText;
    /*auto enumeration of existing id attribute*/
    newId = TMP_baseNode.node.getAttribute('id');
    newId = ( newId == null) ? '' : TMP_repeatedNode.node.setAttribute('id', newId + '-' + index); 
    
    _.RX_M_ATTR.lastIndex = 0;
    while((match = _.RX_M_ATTR.exec(templateText))){
      if(match[1] != TMP_baseNode.modelName || match[2] != TMP_baseNode.attribName){
        TMP_baseNode.embeddedModelAttribs[match[1] + '.' + match[2]] = true;
      }
    }
    
    /*repeat template is original TMP_baseNode with repeat directive on it. The non terminals here
      do not have index or property info. intraCompilation is progressively compiled 
      using text replacement. the comiled non-terminals now have prop and index info.
      
      For the next iteration through the repeat we reset intraCompilation to the un-compiled
      version we stored in uncompiledTemplate
      */
    if( (repeatedProperties = TMP_repeatedNode.node.innerHTML.match(/\{\{(\$*\w+)*\}\}/g)) != null){
      TMP_repeatedNode.hasNonTerminals = true;
      
      uncompiledTemplate = intraCompilation = TMP_repeatedNode.node.innerHTML;
      /*Cycle through them*/
      for(var z = 0; z < repeatedProperties.length; z++){
        
        if( (idvRepeatedProperty = /\{\{(\$*\w+)*\}\}/.exec(repeatedProperties[z]) ) ){
          
          if(idvRepeatedProperty[0] == '{{}}'){
            nonTerminal = this.buildNonTerminal(TMP_baseNode.modelName, TMP_baseNode.attribName, null, index);
            TMP_repeatedNode.node.innerHTML = intraCompilation = 
                    intraCompilation.replace(idvRepeatedProperty[0], nonTerminal );
           } 
          
          if(idvRepeatedProperty[0] == '{{$index}}'){
            TMP_repeatedNode.node.innerHTML = intraCompilation =
                    intraCompilation.replace(idvRepeatedProperty[0], index);
          }
          
          if(idvRepeatedProperty[0] != '{{}}' && idvRepeatedProperty[0] != '{{$index}}'){
            nonTerminal = this.buildNonTerminal(TMP_baseNode.modelName, TMP_baseNode.attribName, idvRepeatedProperty[1], index);
            TMP_repeatedNode.node.innerHTML = intraCompilation =
                    intraCompilation.replace(idvRepeatedProperty[0], nonTerminal );
          }
          
        }

      }
      intraCompilation = uncompiledTemplate;
    }
    
    /*if no NTs found, repeatNode innerHTML must be empty to be clobbered over by model attrib value*/
    TMP_repeatedNode.hasNonTerminals = (TMP_repeatedNode.hasNonTerminals == false) ? 
                                        !_.isNullOrEmpty(TMP_repeatedNode.node.innerHTML) :
                                        TMP_repeatedNode.hasNonTerminals;

   
    return TMP_repeatedNode;
  },
  preProcessInputNode : function(DOM_Node, scope){
    var NONTERMINAL_REGEX = /(\{\{(\w+\.\w+)(\[(\d+)\])*(?:\.)*(\w+)*?\}\})/g,
        regex = /(\{\{(\w+\.\w+)\}\})/g,
        match = null,
        modelNameParts = null,
        partMap = {},
        propName = '',
        index = 0,
        tmp_node = null,
        inputType = DOM_Node.getAttribute('type') || '';
    inputType = inputType.toLowerCase();
    
    /*id embedded node*/
    if(  (match = NONTERMINAL_REGEX.exec(DOM_Node.getAttribute('value'))) != null){
      /*IF the NT has an index, this signals NT is repeat property and NOT embedded. 
        Short circuit input preprocessing.*/
      if(_.isDef(match[3]) && _.isDef(propName = match[5]) 
          && propName.indexOf('zTMPzDOT') == _.UNINDEXED)
        return;
      modelNameParts = this.parseModelAttribName(match[2]);
      DOM_Node.model = modelNameParts[0];
      DOM_Node.name = modelNameParts[1];
    
    /*block below most likely redundant*/  
    }else if( (match = regex.exec(DOM_Node.getAttribute('value'))) !== null){
      modelNameParts = Process.parseModelAttribName(matches[2]);
      DOM_Node.model = modelNameParts[0];
      DOM_Node.name = modelNameParts[1];
    }
    
    if(inputType == 'checkbox' || inputType == 'radio' && match != null){
      var attrib = Map.getAttribute(DOM_Node.model, DOM_Node.name),
          TMP_checkbox = null,
          parentNode = null,
          value = '',
          description = '',
          checked = false;
      if(!_.isNull(attrib) && _.isArray(attrib) 
        && (parentNode = DOM_Node.parentNode) !== null 
        && !_.isNullOrEmpty(scope)){

        for(var i = 0; i < attrib.length; i++, checked = false){
        
          if(_.isString(attrib[i])){
            value = description = attrib[i];
          } else {
            value = (_.isDef(attrib[i].value)) ? attrib[i].value : value;
            description = (_.isDef(attrib[i].description)) ? attrib[i].description : description;
            checked = (_.isDef(attrib[i].checked)) ? attrib[i].checked : checked;
          }
          
          TMP_checkbox = new TMP_Node(document.createElement('input'),DOM_Node.model, DOM_Node.name, i) ;
          TMP_checkbox.scope = scope;
          TMP_checkbox.node.model = TMP_checkbox.modelName;
          TMP_checkbox.node.name = TMP_checkbox.attribName;
          TMP_checkbox.node.checked = checked;
          DOM.cloneAttributes(DOM_Node, TMP_checkbox.node);
          TMP_checkbox.node.setAttribute('value', value);
          
          /*Make current_selection assignment update the DOM*/
          if(!_.isDef(attrib.current_selection)){
            (function(name){
              
              Object.defineProperty(attrib, 'current_selection', {
                configurable : true,
                set : function(value){
                  this._value_ = value;
                  var checkboxes = document.querySelectorAll('input[name='+name+']');
                  for(var w = 0; w < checkboxes.length; w++){
                    if(checkboxes[w].value == value){
                      checkboxes[w].checked = true;
                    }
                  }
                },
                get : function(){
                  return this._value_;
                }
              });
            })(DOM_Node.name);
          }
          /*check to see if it's embedded and annotate*/
          if(!_.isNullOrEmpty(propName) && propName.indexOf('zTMPzDOT') != _.UNINDEXED){
            repeatAnnotationParts = propName.split('DOT');
            TMP_checkbox.repeatModelName = repeatAnnotationParts[1];
            TMP_checkbox.repeatAttribName = repeatAnnotationParts[2]; 
            TMP_checkbox.repeatIndex = (_.isDef(partMap['index'])) ? parseInt(partMap['index']) : -1;;
            TMP_checkbox.index = _.UNINDEXED;
            TMP_checkbox.prop = '';
          }
          parentNode.insertBefore(TMP_checkbox.node, DOM_Node);
          parentNode.insertBefore(document.createTextNode(description), DOM_Node);
          /*sets current_selection w/o firing setter.*/
          if(checked == true){
            attrib._value_ = value;
          }
          
          TMP_checkbox.node.addEventListener('click',function(e){
            var attrib = Map.getAttribute(this.model, this.name),
                selectObj = 
                  {
                    type : _.MODEL_EVENT_TYPES.checkbox_change
                    , checked : (e.target.checked === true)
                    , value : e.target.value
                  };
          
            attrib._value_ = e.target.value;
            Interpolate.dispatchListeners(
              Map.getListeners(this.model, this.name)
              , selectObj
            ); 
          });
          Map.pushNodes(TMP_checkbox);
          
        }
        
        parentNode.removeChild(DOM_Node);
      }
    }else{
      /*Note use of keyup. keydown misses backspace on IE and some other browsers*/
      DOM_Node.addEventListener('keyup', function(e){
        Map.setAttribute(this.model, this.name, e.target.value);
        /*a change to an input that is interpolated will redraw the input value pushing the cursor 
          to the end. This prevents that.*/
        State.ignoreKeyUp = true; 
        Interpolate.interpolate(this.model, this.name, e.target.value );
        State.ignoreKeyUp = false;
      });
    }

  },
  preProcessNode : function(DOM_Node, modelName, attribName, scope){
    if(!_.isDef(DOM_Node) || DOM_Node === null )
      return;
    var repeatValue = DOM.getDataAttribute(DOM_Node, _.IE_MODEL_REPEAT_KEY);
    var type = (!_.isNullOrEmpty(repeatValue)) 
                  ? 'REPEAT' :
                    DOM_Node.tagName;
    var attributeVal = null,
        regex = /(\{\{(\w+\.\w+)\}\})/g,
        indexRegex = /\{\{(\$*\w+)*\}\}/g,
        tokens = [],
        intermediateValue = '',
        uninterpolatedString = '',
        baseRepeatNode = null,
        TMP_RepeatBase = null,
        TMP_select = null,
        TMP_option = null,
        TMP_input = null,
        TMP_unknown = null,
        compileMe = true,
        Process = this;
    
    switch(type){
    
      case 'SELECT':
        var modelName, attribName;
        _.RX_M_ATTR.lastIndex = 0;
        if( (tokens = Circular('Compile').getTokens(DOM_Node.innerHTML)).length < 1) 
          break;
          
        DOM_Node.innerHTML = '';
        modelName = tokens[0].modelName;
        attribName = tokens[0].attribName;
        DOM_Node.token = tokens[0];
        DOM_Node.model = modelName;
        DOM_Node.name = attribName;
        TMP_select = new TMP_Node(DOM_Node, modelName, attribName);
        TMP_select.scope = scope;
        TMP_select.token = tokens[0];
        attributeVal = Map.dereferenceAttribute(TMP_select.token);
        //push select onto 'interpolate' array
        Map.pushNodes(TMP_select);
        if(DOM_Node.children.length < 1 && _.isArray(attributeVal)){
          
          for(var i = 0; i < attributeVal.length; i++){
            TMP_option = new TMP_Node(document.createElement("option"),modelName, attribName, i) ;
            TMP_option.token = TMP_select.token;
            TMP_option.scope = scope;
            TMP_option.node.text = (_.isDef(attributeVal[i].text)) ? attributeVal[i].text : attributeVal[i];
            TMP_option.node.value = (_.isDef(attributeVal[i].value)) ? attributeVal[i].value : attributeVal[i];
            DOM_Node.appendChild(TMP_option.node);
            DOM_Node.selectedIndex = 
              (_.isDef(attributeVal[i].selected) && attributeVal[i].selected == true) ? 
                i : DOM_Node.selectedIndex;
            Map.pushNodes(TMP_option);
          }
          
        }
        DOM_Node.addEventListener('change', function(e){
          var attrib = Map.dereferenceAttribute(this.token),
              selectObj = 
                {
                  type : _.MODEL_EVENT_TYPES.select_change
                  , value : e.target.options[e.target.selectedIndex].value
                  , text : e.target.options[e.target.selectedIndex].text
                  , index : e.target.selectedIndex
                };
          
          attrib.current_selection = selectObj.value;
          Interpolate.dispatchListeners(
            Map.getListeners(this.model, this.name)
            , selectObj
          );                  
        });
        break;
      case 'INPUT':
        this.preProcessInputNode(DOM_Node, scope);
        /*tmp_node is pushed during preProcessNodeAttributes()*/
        
        /*we don't push DOM_Node here because we can only bind to input using the value attribute
          which is a guarantee that DOM_Node will be pushed during preProcessNodeAttributes() */
        break;
      case 'TEXTAREA':
        this.preProcessInputNode(DOM_Node, scope);
        /*tmp_node is pushed during preProcessNodeAttributes()*/
        
        /*we don't push DOM_Node here because we can only bind to input using the value attribute
          which is a guarantee that DOM_Node will be pushed during preProcessNodeAttributes() */
        break;
      case 'REPEAT':
        attributeVal = Map.getAttribute(modelName, attribName);
        DOM_Node.model = modelName;
        DOM_Node.name = attribName;
        /*push source repeat DOM_Node onto 'interpolate' array*/
        TMP_RepeatBase = new TMP_Node(DOM_Node, modelName, attribName);
        TMP_RepeatBase.scope = scope;
        Map.addRepeatBaseNode(TMP_RepeatBase); 
        Map.pushNodes(TMP_RepeatBase); 
        //TMP_RepeatBase.node.setAttribute('style','display:none;'); 

        /*notice lack of preProcessControl(). This is so we don't add control declared in repeatBase.
          we do call it during preProcessRepeatNode() on each of the repeated nodes*/
        compileMe = false;
        break;

      default: 
        break;
    }
    
    this.preProcessNodeAttributes(DOM_Node, scope);
    return compileMe;
  }
  
};


});