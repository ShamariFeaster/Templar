window.structureJS.module('Process', function(require){

'use strict';

var _ = this;
var TMP_Node = require('TMP_Node');
var Map = require('Map');
var DOM = require('DOM');
var State = require('State');
var Attribute = require('Attribute')();
var Circular = window.structureJS.circular();


return {

  parseModelAttribName : function(qualifiedAttribName){
   return ( _.isDef(qualifiedAttribName)) ? qualifiedAttribName.split('.') : ['',''];
  },

  buildNT : function(Token){
    var NT = Token.modelName + '.' + Token.attribName,
      prop,
      queue = (_.isArray(Token.indexQueue)) ? Token.indexQueue.slice(0) : [],
      unfoldedIndexes = '';
        
    while( _.isNotNull(prop = queue.shift(queue)) ){
      unfoldedIndexes += '[' + prop + ']';
    }
    return '{{' + NT + unfoldedIndexes + '}}';
  },
  
  buildItemNT : function(tmp_node, index){
    return tmp_node.modelName + '.' + tmp_node.attribName + '[' + index + ']';
  },
  
  checkForCustomAttribute : function(node, attribName){
    var customAttribute;
    if(_.isNotNull(customAttribute = Attribute.getAttribute(attribName))){
          
      if(!_.isDef(node.__customAttributes__)){
        node._setAttribute = node.setAttribute;
        node.__customAttributes__ = {};
        node.setAttribute = function(name, val){
          var normalizedName = name.toLowerCase();
          /*If we don't check, we end up with onChange being called on every call to the
          overriden setAttribute(). The side effects are that the user's cust attrib handler
          will have unexpected behavior.*/
          for(var caName in this.__customAttributes__){
            
            if(this.__customAttributes__[caName].name == normalizedName){
              this.__customAttributes__[caName].onChange.call(this.__customAttributes__[caName], this, val);
            }
            
          }
          this._setAttribute.call(this, name, val);
        };
      }
      node.__customAttributes__[customAttribute.name] = customAttribute;
      
      /*This is called after the _setAttribute assignment b/c onCreate calls onChange
        implicitly which may make use of it.*/
      customAttribute.onCreate.call(customAttribute, node);
    }
  },
  
  preProcessNodeAttributes : function(node, scope, repeatIndex){
    var attributes = null;

    var tmp_node = null;
    var preProcessedTMPNodes = [];
    var origValue;
    var origName;
    var Interpolate = Circular('Interpolate');
    var tokens;
    
    repeatIndex = (_.isInt(repeatIndex)) ? parseInt(repeatIndex) : -1;
    /*Options don't need to be in the node tree due to having NTs in 'value' attribute*/
    if(node.hasAttributes() && node.tagName != 'OPTION'){
      attributes = node.attributes;
      /*search node attributes for non-terminals*/
      for(var i = 0; i < attributes.length; i++){
        /* for IE9 attributes is a live list, attribute onCreates/Change may modify it so we cache 
            it*/
        origValue = attributes[i].value;
        origName = attributes[i].name;
        if(origName === 'x-nt'){
          continue;
        }
        this.checkForCustomAttribute(node, origName);
        
        tokens = Circular('Compile').getAllTokens(origValue);
        /* possible issue: data-apl-repeat attribs getting pushed to cache */
        for(var x = 0 ; x < tokens.length; x++){
          if(tmp_node === null || (tmp_node !== null && !tokens[x].equals(tmp_node))){
            
            tmp_node = new TMP_Node(node, tokens[x].modelName, tokens[x].attribName, repeatIndex);
            tmp_node.inheritToken(tokens[x]);
            Map.pushNodes(tmp_node);
          }

          tmp_node.symbolMap[origName] = origValue;
          tmp_node.scope = scope;
          
          /*This is necessary for repeats as their child nodes aren't added to Interpolation array
            Rather they are recompiled using repeated elements as the base. It makes sense since
            we do interpolation during preprocessing with repeats that we do the same with attributes
            in repeats*/
          Interpolate.updateNodeAttributes(tmp_node, tmp_node.modelName, tmp_node.attribName);
          preProcessedTMPNodes.push(tmp_node);
        }
       
      }

    }
    
    return preProcessedTMPNodes;
  },
  _preProcessRepeatAttributes : function(DOM_Node, TMP_baseNode, index){
    var attributes;
    var idvRepeatedProperty = null;
    var preProcessedOutput;
    var symbol;
    var hasNonTerminals = false;
    
    if(DOM_Node.hasAttributes()){
      attributes = DOM_Node.attributes;

      for(var i = 0; i < attributes.length; i++){
        preProcessedOutput = attributes[i].value;
          
        _.RX_RPT_SPC_SYM.lastIndex = 0;
        while( _.isNotNull(idvRepeatedProperty = _.RX_RPT_SPC_SYM.exec(preProcessedOutput))){
          hasNonTerminals = true;
          symbol = idvRepeatedProperty[0];
          if(symbol == '{{}}'){
            TMP_baseNode.indexQueue.push(index);
            preProcessedOutput = preProcessedOutput.replace(symbol, this.buildNT(TMP_baseNode) );
            TMP_baseNode.indexQueue.pop();
           } 
          
          if(symbol == '{{$index}}'){
            preProcessedOutput = preProcessedOutput.replace(symbol, index);
          }
          
          if(symbol == '{{$item}}'){
            preProcessedOutput = preProcessedOutput.replace(symbol, this.buildItemNT(TMP_baseNode, index));
          }

          if(symbol != '{{}}' && symbol != '{{$index}}'){
            TMP_baseNode.indexQueue.push(index);
            TMP_baseNode.indexQueue.push(idvRepeatedProperty[1]);
            preProcessedOutput = preProcessedOutput.replace(symbol, this.buildNT(TMP_baseNode) );
            TMP_baseNode.indexQueue.pop();
            TMP_baseNode.indexQueue.pop();
          }

        }
        DOM_Node.setAttribute(attributes[i].name, preProcessedOutput);
      }

    }
    return hasNonTerminals;
  },
  
  _preprocessInPlace : function(TMP_node, index){

  
  
    var idvRepeatedProperty = null;
    var preProcessedOutput = null;

    var match = null;
    var templateText = TMP_node.node.nodeValue;
    var annotatedNT = '';
    var symbol = '';
    
    TMP_node.hasNonTerminals = true;
    preProcessedOutput = TMP_node.node.nodeValue;
    
    _.RX_RPT_SPC_SYM.lastIndex = 0;
    while( _.isNotNull(idvRepeatedProperty = _.RX_RPT_SPC_SYM.exec(TMP_node.node.nodeValue) )){
      /*w/ this symbol our token already has instructions to build our NT.
        we use the index of the repeated node to index the attrib our NT
        refers to*/
      symbol = idvRepeatedProperty[0];
      if(symbol == '{{}}'){
        TMP_node.indexQueue.push(index);
        preProcessedOutput = preProcessedOutput.replace(symbol, this.buildNT(TMP_node) );
        TMP_node.indexQueue.pop();
       } 
      
      if(symbol == '{{$index}}'){
        preProcessedOutput = preProcessedOutput.replace(symbol, index);
      }
      
      if(symbol == '{{$item}}'){
        preProcessedOutput = preProcessedOutput.replace(symbol, this.buildItemNT(TMP_node, index));
      }
      /*simple property access*/
      if(symbol != '{{}}' && symbol != '{{$index}}'){
        TMP_node.indexQueue.push(index);
        TMP_node.indexQueue.push(idvRepeatedProperty[1]);
        preProcessedOutput = preProcessedOutput.replace(symbol, this.buildNT(TMP_node) );
        TMP_node.indexQueue.pop();
        TMP_node.indexQueue.pop();
      }
      
    }
    TMP_node.node.nodeValue = preProcessedOutput;
    
    _.RX_M_ATTR_TOK.lastIndex = 0;
    /*test if already been annotated as embed, we don't wantv to double that*/
    while(_.isNotNull(match = _.RX_M_ATTR_TOK.exec(templateText)) && !/%(\w+)%/.test(templateText)){
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
    
    /*if no NTs found, repeatNode innerHTML must be empty to be clobbered over by model attrib value*/
    TMP_node.hasNonTerminals = (TMP_node.hasNonTerminals === false) ? 
                                  !_.isNullOrEmpty(TMP_node.node.nodeValue.trim()) :
                                  TMP_node.hasNonTerminals;

   
    return TMP_node.hasNonTerminals;
  },
  
  _cloneBaseNode : function(TMP_baseNode, index){
    var newId = null;
    var newDomNode = document.createElement(TMP_baseNode.node.tagName.toLowerCase());
    var TMP_repeatedNode = new TMP_Node(newDomNode, TMP_baseNode.modelName, TMP_baseNode.attribName, index);

    DOM.cloneAttributes(TMP_baseNode.node, TMP_repeatedNode.node);

    /*auto enumeration of existing id attribute*/
    newId = TMP_baseNode.node.getAttribute('id');
    newId = ( newId === null) ? '' : TMP_repeatedNode.node.setAttribute('id', newId + '-' + index); 
    TMP_repeatedNode.hasNonTerminals = TMP_baseNode.hasNonTerminals;
    TMP_repeatedNode.node.innerHTML = TMP_baseNode.node.innerHTML;
    return TMP_repeatedNode;
  },
  
  _traverseRepeatNode : function(nodes, index, TMP_baseNode){
    var TMP_textNode = null;

    var repeatKey = '';
    var tokens = null;
    var hasNonTerminals = false;
    
    for(var i = 0; i < nodes.length; i++){
      
      if(nodes[i].nodeType == _.ELEMENT_NODE){

        hasNonTerminals = hasNonTerminals | 
                        this._preProcessRepeatAttributes(nodes[i], TMP_baseNode, index);
        /*traverse node attributes looking for repeat-specific symbols and replacing them w/ NTs.
            This function would need to take the base node to build the NTs just like _preprocessInPlace()
            preProcessNodeAttributes() needs to be modified to understand complex references*/
        repeatKey = DOM.getDataAttribute(nodes[i], _.IE_MODEL_REPEAT_KEY);
        if((tokens = Circular('Compile').getRepeatToken(repeatKey)).length > 0){
          nodes[i].token = tokens[0];
        }
        if(!_.isNullOrEmpty(repeatKey)){
          nodes[i].setAttribute('data-' + _.IE_MODEL_REPEAT_KEY, repeatKey);
          
          if(tokens[0].modelName != TMP_baseNode.modelName || 
            tokens[0].attribName != TMP_baseNode.attribName){
             
            TMP_baseNode.embeddedRepeats[tokens[0].modelName + '.' + tokens[0].attribName] = true;
          /*I need to signal to the interpolater to build this nested repeat b/c
            the interpolator might already have iterated past this attrib and it 
            won't be built. Maybe I can annotate Base node?*/  
          }
          continue;
        }
        
        if(nodes[i].hasChildNodes()){
          hasNonTerminals = hasNonTerminals | 
                          this._traverseRepeatNode(nodes[i].childNodes, index, TMP_baseNode);
        }else{
          continue;
        }
      }
      
      if(nodes[i].nodeType == _.TEXT_NODE){
        TMP_textNode = new TMP_Node(nodes[i], TMP_baseNode.modelName, TMP_baseNode.attribName, index);
        TMP_textNode.inheritToken(TMP_baseNode);
        hasNonTerminals = hasNonTerminals | this._preprocessInPlace(TMP_textNode, index);
        _.mixin(TMP_textNode.embeddedModelAttribs, TMP_baseNode.embeddedModelAttribs);
      }
    }
    
    return hasNonTerminals;
  },
  
  preProcessRepeatNode : function(TMP_baseNode, index){
    var PreProcessedNode = this._cloneBaseNode(TMP_baseNode, index);
    var Component = TMP_baseNode.node.tmp_component;
    var isComponent = _.isDef(Component);
    
    PreProcessedNode.hasNonTerminals = this._traverseRepeatNode([PreProcessedNode.node], index, TMP_baseNode);
    /* For nodes with no children the compiler will not call preProcessNodeAttributes() so
        we should check for that and call it ourselves*/
    if(!PreProcessedNode.node.hasChildNodes() || isComponent){
      this.preProcessNode(PreProcessedNode.node, PreProcessedNode.scope);
      this.preProcessNodeAttributes(PreProcessedNode.node, PreProcessedNode.scope, index);
      
      if(isComponent){
        Component.onCreate.call(Component, PreProcessedNode.node);
      }
    }
    return PreProcessedNode;
  },
  
  preProcessTextInput : function(DOM_Node, eventType){
    eventType = (_.isDef(eventType)) ? eventType : 'input';
    /*Note use of keyup. keydown misses backspace on IE and some other browsers*/
    DOM_Node.addEventListener(eventType, function(e){
      var annotations = DOM.getDOMAnnotations(this);
      var Interpolate = Circular('Interpolate'); 
      Map.setAttributeWithToken(this.token, e.target.value);
      //Map.setAttribute(annotations.modelName, annotations.attribName, e.target.value);
      /*a change to an input that is interpolated will redraw the input value pushing the cursor 
        to the end. This prevents that.*/
      State.ignoreKeyUp = true; 
      Interpolate.interpolate(annotations.modelName, annotations.attribName, e.target.value, void(0), this.token );
      State.ignoreKeyUp = false;
    });
  },
  
  addCurrentSelectionToCheckbox : function(DOM_Node, attrib){
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
  },
  
  addCurrentSelectionToSelect : function(DOM_Node, attrib){
    
    //Component has defined current_selection, don't override
    if(attrib.noClobber === true){ 
      return;
    }
    
    // init to first value
    if(!_.isDef(attrib.current_selection) && attrib.length > 0){
      attrib._value_ = attrib[0].value || attrib[0];
    }
    
    (function(select){
      
      Object.defineProperty(attrib, 'current_selection', {
        configurable : true,
        set : function(value){
          
          if(value === ''){
            return;
          }
          
          this._value_ = value;
          var annotations = DOM.getDOMAnnotations(select);
          var boundProperties = (_.isDef(select.token.indexQueue)) ? 
                                select.token.indexQueue.slice(0) : [];
          var Interpolate = Circular('Interpolate');         
          for(var s = 0; s < select.children.length; s++){
            if(select.children[s].value == value || select.children[s].text == value){
              select.selectedIndex = s;
              /*We want to reinterpolate the select on change of current_selection. we don't
                want to fire listeners on this interp due to the fact user is likely setting
                current_selection from a listener and we want to prevent infinite looping.*/

              State.dispatchListeners = false;
              Interpolate.interpolate(annotations.modelName, annotations.attribName);
              State.dispatchListeners = true;
              
              
              Interpolate.dispatchListeners(
                Map.getListeners(annotations.modelName, annotations.attribName),
                  {
                    type : _.MODEL_EVENT_TYPES.select_change, 
                    value : select.children[s].value, 
                    text : select.children[s].text, 
                    index : select.selectedIndex, 
                    properties : boundProperties
                  }
              );
              
            }
          }
        },
        get : function(){
          return this._value_;
        }
      });
      
      
    })(DOM_Node);

    

  },
  /* properties event object property is experimental. The alternative is let users listen to
    sub properties, but this would require some shorthand for unknown indexes like:
    items[x].property, where x is a substitute for any index in a repeat. I hate special syntaxes
    so I may end up sticking with a programmatic solution, but I would need to standardize the
    event object interface.*/
  bindCheckboxListener : function(node){
  
    node.addEventListener('click',function(e){
      
      var attrib = Map.dereferenceAttribute(this.token);
      var boundProperties = (_.isDef(this.token.indexQueue)) ? 
                            this.token.indexQueue.slice(0) : [];
      var cbObj = 
        {
          type : _.MODEL_EVENT_TYPES.checkbox_change, 
          checked : (e.target.checked === true), 
          value : e.target.value, 
          target : e.target, 
          properties : boundProperties
        };
      var annotations = DOM.getDOMAnnotations(this);
      var listeners = Map.getListeners(annotations.modelName, annotations.attribName);
      var Interpolate = Circular('Interpolate'); 
      /*for checkboxes we should not set current_selection to value if it was unchecked*/
      attrib._value_ = (cbObj.checked === true) ? e.target.value : false;
      attrib.checked[this.getAttribute('id')] = cbObj.checked;
      
      State.dispatchListeners = false;
      Interpolate.interpolate(annotations.modelName, annotations.attribName);
      State.dispatchListeners = true;
      
      Interpolate.dispatchListeners( listeners, cbObj); 
    });
  },
 
  preProcessInputNode : function(DOM_Node, scope){

    var inputType = DOM_Node.getAttribute('type') || '';
    var tokens = Circular('Compile').getTokens(DOM_Node.getAttribute('value'));
    var token;

    var __COMPILER_FLG__ = _.COMPILE_ME;
        
    if( tokens.length < 1 ){
      return;
    }
    
    token = tokens[0];
    
    DOM.annotateDOMNode(DOM_Node, token.modelName, token.attribName, token);
    
    inputType = inputType.toLowerCase();
    switch(inputType){
      case 'checkbox':
      case 'radio':
        var attrib = null;
        var TMP_checkbox = null;
        var value = '';
        var description = '';
        var checked = false;
        var checkedStateId = '';

        attrib = Map.dereferenceAttribute(token);
        if(_.isArray(attrib)){
          attrib._value_ = '';
          
          if(!_.isDef(attrib.checked)){
            attrib.checked = {};
          }
          
          for(var i = 0; i < attrib.length; i++, checked = false){
          
            if(!_.isDef(attrib[i].description) && !_.isDef(attrib[i].value)){
              value = description = attrib[i];
            } else {
              value = (_.isDef(attrib[i].value)) ? attrib[i].value : value;
              description = (_.isDef(attrib[i].description)) ? attrib[i].description : description;
              checked = (_.isDef(attrib[i].checked)) ? attrib[i].checked : checked;
            }
            
            checkedStateId = (_.isDef(attrib[i].id)) ? attrib[i].id : i;
            TMP_checkbox = new TMP_Node(document.createElement('input'),token.model, token.attrib, i) ;
            TMP_checkbox.scope = scope;
            TMP_checkbox.inheritToken(token);
            TMP_checkbox.node.setAttribute('name', token.attribName);
            TMP_checkbox.node.setAttribute('id', checkedStateId);
            DOM.annotateDOMNode(TMP_checkbox.node, token.modelName, token.attribName, token);
            
            /*reinstate CB state.if user (inexplicably) changes 'id' @ runtime, this breaks*/
            if(_.isDef(attrib.checked[checkedStateId])){
              checked = attrib.checked[checkedStateId];
            }
            
            attrib.checked[checkedStateId] = checked; 
            if(checked === true){
              attrib._value_ = value;
              TMP_checkbox.node.setAttribute('checked', checked);
            }
            
            DOM.cloneAttributes(DOM_Node, TMP_checkbox.node);
            TMP_checkbox.node.setAttribute('value', value);

            this.addCurrentSelectionToCheckbox(DOM_Node, attrib);
            
            /*Build Description*/
            DOM_Node.parentNode.insertBefore(TMP_checkbox.node, DOM_Node);
            DOM_Node.parentNode.insertBefore(document.createTextNode(description), DOM_Node);
            
            this.bindCheckboxListener(TMP_checkbox.node);
            
            Map.pushNodes(TMP_checkbox);
            
          }
        }
        
        DOM_Node.parentNode.removeChild(DOM_Node);
        __COMPILER_FLG__ = _.RECOMPILE_ME;
        break;
      case 'range':
        this.preProcessTextInput(DOM_Node, 'change');
        break;
      case 'date':
        this.preProcessTextInput(DOM_Node);
        this.preProcessTextInput(DOM_Node, 'blur');
        break;
      default:
        this.preProcessTextInput(DOM_Node);
        break;
    }

    return __COMPILER_FLG__;
  },
  
  preProcessNode : function(DOM_Node, scope, repeatIndex){
    
    if(!_.isDef(DOM_Node) || DOM_Node === null ){ 
      return;
    }
    
    repeatIndex = (_.isInt(repeatIndex)) ? parseInt(repeatIndex) : -1;
    
    var repeatValue = DOM.getDataAttribute(DOM_Node, _.IE_MODEL_REPEAT_KEY);
    var type = (!_.isNullOrEmpty(repeatValue)) ? 'REPEAT' : DOM_Node.tagName;
    var tokens = [];

    var TMP_RepeatBase = null;
    var TMP_select = null;
    var __COMPILER_FLG__ = _.COMPILE_ME;
    var Interpolate = Circular('Interpolate'); 
    switch(type){
    
      case 'SELECT':

        var token = null;
        
        _.RX_M_ATTR.lastIndex = 0;
        
        if( (tokens = Circular('Compile').getTokens(DOM_Node.innerHTML)).length < 1){ 
          break;
        }
        
        token = tokens[0];  
        DOM_Node.innerHTML = '';

        DOM.annotateDOMNode(DOM_Node, token.modelName, token.attribName, token);
        TMP_select = new TMP_Node(DOM_Node, token.modelName, token.attribName);
        TMP_select.inheritToken(token);
        TMP_select.scope = scope;
        Interpolate.intializeSelect(TMP_select, true, 0);
        //push select onto 'interpolate' array
        Map.pushNodes(TMP_select);
        
        DOM_Node.addEventListener('change', function(e){
          var attrib = Map.dereferenceAttribute(this.token);
          var boundProperties = (_.isDef(this.token.indexQueue)) ? 
                                this.token.indexQueue.slice(0) : [];
          var selectObj = 
                {
                  type : _.MODEL_EVENT_TYPES.select_change, 
                  value : e.target.options[e.target.selectedIndex].value, 
                  text : e.target.options[e.target.selectedIndex].text, 
                  index : e.target.selectedIndex, 
                  target : e.target, 
                  properties : boundProperties
                };
          var annotations = DOM.getDOMAnnotations(this);
          var listeners = Map.getListeners(annotations.modelName, annotations.attribName);
          
          attrib.current_selection = selectObj.value;
          Interpolate.dispatchListeners(listeners, selectObj);                  
        });
        break;
      case 'INPUT':
        __COMPILER_FLG__ = this.preProcessInputNode(DOM_Node, scope);
        break;
      case 'TEXTAREA':
        this.preProcessInputNode(DOM_Node, scope);
        break;
      case 'REPEAT':
        /*push source repeat DOM_Node onto 'interpolate' array*/
        var attributes = DOM.getDOMAnnotations(DOM_Node);
        TMP_RepeatBase = new TMP_Node(DOM_Node, attributes.modelName, attributes.attribName);
        TMP_RepeatBase.inheritToken(DOM_Node.token);
        TMP_RepeatBase.scope = scope;
        Map.addRepeatBaseNode(TMP_RepeatBase); 
        //Map.pushNodes(TMP_RepeatBase); 
        __COMPILER_FLG__ = _.NO_COMPILE_ME;
        break;

      default: 
        break;
    }
    
    /*Don't process and cached removed nodes*/
    if(document.body.contains(DOM_Node)){
      this.preProcessNodeAttributes(DOM_Node, scope, repeatIndex);
    }
    
    return __COMPILER_FLG__;
  }
  
};

});