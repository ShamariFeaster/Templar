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
  _buildNonTerminal : function(Token, i){
  
    var NT = Token.modelName + '.' + Token.attribName,
        prop,
        queue = (_.isArray(Token.indexQueue)) ? Token.indexQueue : [],
        index = (_.isDef(i)) ? '[' + i + ']' : '' ;
        
    while( (prop = queue.shift(queue)) != null ){
      index += '[' + prop + ']';
    }
    return '{{' + NT + index + '}}';
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
        templateText = TMP_baseNode.node.innerHTML,
        annotatedNT = '',
        repeatedTags = null;
        
    DOM.cloneAttributes(TMP_baseNode.node, TMP_repeatedNode.node);
    TMP_repeatedNode.node.innerHTML = templateText;
    /*auto enumeration of existing id attribute*/
    newId = TMP_baseNode.node.getAttribute('id');
    newId = ( newId == null) ? '' : TMP_repeatedNode.node.setAttribute('id', newId + '-' + index); 
    
    _.RX_M_ATTR_TOK.lastIndex = 0;
    while((match = _.RX_M_ATTR_TOK.exec(templateText))){
      if(match[1] != TMP_baseNode.modelName || match[2] != TMP_baseNode.attribName){
        TMP_baseNode.embeddedModelAttribs[match[1] + '.' + match[2]] = true;
        annotatedNT = 
        match[0].replace('}}','') + 
        '%mdl%' + TMP_baseNode.modelName + '%/mdl%' + 
        '%att%' + TMP_baseNode.attribName + '%/att%' + 
        '%i%' + index + '%/i%' + 
        '}}';
        TMP_repeatedNode.node.innerHTML = 
          TMP_repeatedNode.node.innerHTML.replace(match[0], annotatedNT);
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
          
          if(idvRepeatedProperty[0] == '{{$item}}'){
            TMP_repeatedNode.node.innerHTML = intraCompilation =
                    intraCompilation.replace(idvRepeatedProperty[0], 
                    TMP_baseNode.modelName + '.' + TMP_baseNode.attribName + '[' + index + ']');
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
                                        !_.isNullOrEmpty(TMP_repeatedNode.node.innerHTML.trim()) :
                                        TMP_repeatedNode.hasNonTerminals;

   
    return TMP_repeatedNode;
  },
  
  _preprocessInPlace : function(TMP_node, index){
    var repeatedProperties = null,
        uncompiledTemplate = '',
        intraCompilation = '',
        idvRepeatedProperty = null,
        nonTerminal = '',
        match = null,
        templateText = TMP_node.node.wholeText,
        annotatedNT = '',
        repeatedTags = null;
    
    _.RX_M_ATTR_TOK.lastIndex = 0;
    while((match = _.RX_M_ATTR_TOK.exec(templateText))){
      if(match[1] != TMP_node.modelName || match[2] != TMP_node.attribName){
        TMP_node.embeddedModelAttribs[match[1] + '.' + match[2]] = true;
        annotatedNT = 
        match[0].replace('}}','') + 
        '%mdl%' + TMP_node.modelName + '%/mdl%' + 
        '%att%' + TMP_node.attribName + '%/att%' + 
        '%i%' + index + '%/i%' + 
        '}}';
        TMP_node.node.nodeValue = 
          TMP_node.node.nodeValue.replace(match[0], annotatedNT);
      }
    }

    if( (repeatedProperties = TMP_node.node.nodeValue.match(/\{\{(\$*\w+)*\}\}/g)) != null){
      TMP_node.hasNonTerminals = true;
      
      uncompiledTemplate = intraCompilation = TMP_node.node.nodeValue;
      
      /*Cycle through them*/
      for(var z = 0; z < repeatedProperties.length; z++){
        
        if( (idvRepeatedProperty = /\{\{(\$*\w+)*\}\}/.exec(repeatedProperties[z]) ) ){
          
          if(idvRepeatedProperty[0] == '{{}}'){

            TMP_node.node.nodeValue = intraCompilation = 
                    intraCompilation.replace(idvRepeatedProperty[0], this._buildNonTerminal(TMP_node.token, index) );
           } 
          
          if(idvRepeatedProperty[0] == '{{$index}}'){
            TMP_node.node.nodeValue = intraCompilation =
                    intraCompilation.replace(idvRepeatedProperty[0], index);
          }
          
          if(idvRepeatedProperty[0] == '{{$item}}'){
            TMP_node.node.nodeValue = intraCompilation =
                    intraCompilation.replace(idvRepeatedProperty[0], 
                    this._buildNonTerminal(TMP_node.token, index));
          }
          
          if(idvRepeatedProperty[0] != '{{}}' && idvRepeatedProperty[0] != '{{$index}}'){
            TMP_node.token.indexQueue.push(idvRepeatedProperty[1]);
            TMP_node.node.nodeValue = intraCompilation =
                    intraCompilation.replace(idvRepeatedProperty[0], this._buildNonTerminal(TMP_node.token, index) );
          }
          
        }

      }
      intraCompilation = uncompiledTemplate;
    }
    
    /*if no NTs found, repeatNode innerHTML must be empty to be clobbered over by model attrib value*/
    TMP_node.hasNonTerminals = (TMP_node.hasNonTerminals == false) ? 
                                  !_.isNullOrEmpty(TMP_node.node.nodeValue.trim()) :
                                  TMP_node.hasNonTerminals;

   
    return TMP_node.hasNonTerminals;
  },
  
  _cloneBaseNode : function(TMP_baseNode, index){
    var newId = null,
        newDomNode = document.createElement(TMP_baseNode.node.tagName.toLowerCase()),
        TMP_repeatedNode = new TMP_Node(newDomNode, TMP_baseNode.modelName, TMP_baseNode.attribName, index);

    DOM.cloneAttributes(TMP_baseNode.node, TMP_repeatedNode.node);

    /*auto enumeration of existing id attribute*/
    newId = TMP_baseNode.node.getAttribute('id');
    newId = ( newId == null) ? '' : TMP_repeatedNode.node.setAttribute('id', newId + '-' + index); 
    TMP_repeatedNode.hasNonTerminals = TMP_baseNode.hasNonTerminals;
    TMP_repeatedNode.node.innerHTML = TMP_baseNode.node.innerHTML;
    return TMP_repeatedNode;
  },
  
  _traverseRepeatNode : function(node, index, TMP_baseNode){
    var nodes = node.childNodes,
        TMP_repeatNode = null,
        processedNode = null,
        repeatKey = '',
        tokens = null,
        hasNonTerminals = false;
    for(var i = 0; i < nodes.length; i++){
      
      if(nodes[i].nodeType == _.ELEMENT_NODE){
        /*ignore nested repeat nodes*/
        repeatKey = DOM.getDataAttribute(nodes[i], _.IE_MODEL_REPEAT_KEY);
        repeatKey = repeatKey.replace('{{$item}}', TMP_baseNode.modelName + '.' + TMP_baseNode.attribName + '[' + index + ']');
        
        if((tokens = Circular('Compile').getRepeatToken(repeatKey)).length > 0){
          nodes[i].token = tokens[0];
        }
        if(!_.isNullOrEmpty(repeatKey)){
          nodes[i].setAttribute('data-' + _.IE_MODEL_REPEAT_KEY, repeatKey);
          continue;
        }
        
        if(nodes[i].hasChildNodes())
          hasNonTerminals |= this._traverseRepeatNode(nodes[i], index, TMP_baseNode);
        else
          continue;
      }

      TMP_repeatNode = new TMP_Node(nodes[i], TMP_baseNode.modelName, TMP_baseNode.attribName, index);
      this.inheritToken(TMP_repeatNode, TMP_baseNode);
      hasNonTerminals |= this._preprocessInPlace(TMP_repeatNode, index);
      
      
    }
    
    return hasNonTerminals;
  },
  
  newPreProcessRepeatNode : function(TMP_baseNode, index){  
    TMP_baseNode.hasNonTerminals = this._traverseRepeatNode(TMP_baseNode.node, index, TMP_baseNode);
    return this._cloneBaseNode(TMP_baseNode, index);
  },
  
  inheritToken : function(TMP_node, Token){
    TMP_node.modelName = Token.modelName;
    TMP_node.attribName = Token.attribName;
    TMP_node.repeatModelName = Token.repeatModelName ;
    TMP_node.repeatAttribName = Token.repeatAttribName ;
    TMP_node.repeatIndex = Token.repeatIndex;
    TMP_node.token = Token;
  },
  
  preProcessInputNode : function(DOM_Node, scope){
    var match = null,
        inputType = DOM_Node.getAttribute('type') || '',
        tokens = Circular('Compile').getTokens(DOM_Node.getAttribute('value')),
        token,
        __COMPILER_FLG__ = _.COMPILE_ME;
        
    if( tokens.length < 1 )
      return;
    
    token = tokens[0];
    
    DOM_Node.model = token.modelName;
    DOM_Node.attrib = token.attribName
    DOM_Node.token = token;
    
    inputType = inputType.toLowerCase();

    if(inputType == 'checkbox' || inputType == 'radio'){
      var attrib,
          TMP_checkbox = null,
          value = '',
          description = '',
          checked = false;

      attrib = Map.dereferenceAttribute(token);
      if(_.isArray(attrib)){
        for(var i = 0; i < attrib.length; i++, checked = false){
        
          if(!_.isDef(attrib[i].description) && !_.isDef(attrib[i].value)){
            value = description = attrib[i];
          } else {
            value = (_.isDef(attrib[i].value)) ? attrib[i].value : value;
            description = (_.isDef(attrib[i].description)) ? attrib[i].description : description;
            checked = (_.isDef(attrib[i].checked)) ? attrib[i].checked : checked;
          }
          
          TMP_checkbox = new TMP_Node(document.createElement('input'),DOM_Node.model, DOM_Node.name, i) ;
          TMP_checkbox.scope = scope;
          this.inheritToken(TMP_checkbox, token);
          
          TMP_checkbox.node.token = TMP_checkbox.token = token;
          TMP_checkbox.node.model = TMP_checkbox.modelName;
          TMP_checkbox.node.attrib = TMP_checkbox.attribName;
          TMP_checkbox.node.name = TMP_checkbox.attribName;
          TMP_checkbox.node.checked = checked;
          DOM.cloneAttributes(DOM_Node, TMP_checkbox.node);
          TMP_checkbox.node.setAttribute('value', value);
          
          /*check to see if it's embedded and annotate*/

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
            })(DOM_Node.attrib);
          }
          
          DOM_Node.parentNode.insertBefore(TMP_checkbox.node, DOM_Node);
          DOM_Node.parentNode.insertBefore(document.createTextNode(description), DOM_Node);
          /*sets current_selection w/o firing setter.*/
          if(checked == true){
            attrib._value_ = value;
          }
          
          TMP_checkbox.node.addEventListener('click',function(e){
            var attrib = Map.dereferenceAttribute(this.token),
                selectObj = 
                  {
                    type : _.MODEL_EVENT_TYPES.checkbox_change
                    , checked : (e.target.checked === true)
                    , value : e.target.value
                  };
          
            attrib._value_ = e.target.value;
            Interpolate.dispatchListeners(
              Map.getListeners(this.model, this.attrib)
              , selectObj
            ); 
          });
          Map.pushNodes(TMP_checkbox);
          
        }
      }
      
      DOM_Node.parentNode.removeChild(DOM_Node);
      __COMPILER_FLG__ = _.RECOMPILE_ME;
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
    return __COMPILER_FLG__;
  },
  preProcessNode : function(DOM_Node, modelName, attribName, scope){
    if(!_.isDef(DOM_Node) || DOM_Node === null )
      return;
      
    var repeatValue = DOM.getDataAttribute(DOM_Node, _.IE_MODEL_REPEAT_KEY);
    var type = (!_.isNullOrEmpty(repeatValue)) 
                  ? 'REPEAT' :
                    DOM_Node.tagName;
    var tokens = [],
        uninterpolatedString = '',
        TMP_RepeatBase = null,
        TMP_select = null,
        __COMPILER_FLG__ = _.COMPILE_ME;
    
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
        DOM_Node.attrib = attribName;
        TMP_select = new TMP_Node(DOM_Node, modelName, attribName);
        this.inheritToken(TMP_select, tokens[0]);
        TMP_select.scope = scope;

        //push select onto 'interpolate' array
        Map.pushNodes(TMP_select);

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
            Map.getListeners(this.model, this.attrib)
            , selectObj
          );                  
        });
        break;
      case 'INPUT':
        __COMPILER_FLG__ = this.preProcessInputNode(DOM_Node, scope);
        break;
      case 'TEXTAREA':
        this.preProcessInputNode(DOM_Node, scope);
        break;
      case 'REPEAT':
        DOM_Node.model = modelName;
        DOM_Node.name = attribName;
        /*push source repeat DOM_Node onto 'interpolate' array*/
        TMP_RepeatBase = new TMP_Node(DOM_Node, modelName, attribName);
        this.inheritToken(TMP_RepeatBase, DOM_Node.token);
        TMP_RepeatBase.scope = scope;
        Map.addRepeatBaseNode(TMP_RepeatBase); 
        Map.pushNodes(TMP_RepeatBase); 
        __COMPILER_FLG__ = _.NO_COMPILE_ME;
        break;

      default: 
        break;
    }
    /*Don't process and cached removed nodes*/
    if(DOM_Node.parentNode != null)
      this.preProcessNodeAttributes(DOM_Node, scope);
    return __COMPILER_FLG__;
  }
  
};


});