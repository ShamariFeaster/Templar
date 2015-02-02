structureJS.module('Process', function(require){

var _ = this;
var TMP_Node = require('TMP_Node');
var Map = require('Map');
var DOM = require('DOM');

return {
  CONTROL_REGEX : new RegExp(_.CTRL_ATTRIB_STRING + '=' + '"(\\w+)"', 'g'),
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
  buildControlNonTerminal : function(modelName, modelAtrribName, ctrlName, index){
    index = (_.isDef(index)) ? '.' + index : '';
    return '|' + modelName + '.' +  modelAtrribName + index;
  },
  buildRepeatNonTerminal : function(modelName, modelAtrribName, parentModel, parentAttrib, index){
    var propertyName = (_.isNullOrEmpty(propertyName)) ? '' : propertyName;
    return '{{' + modelName + '.' + modelAtrribName + '[' + index + '].zTMPzDOT' + parentModel +'DOT' + parentAttrib + '}}';
  },
  preProcessNodeAttributes : function(node, scope){
    var attributes = null,
        match = null,
        regex = /\{\{(\w+)\.(\w+)(\[(\d+)\])*(?:\.)*(\w+)*?\}\}/g,
        modelNameParts = null,
        tmp_node = null;
    
    /*Options don't need to be in the node tree due to having NTs in 'value' attribute*/
    if(node.hasAttributes() && node.tagName != 'OPTION'){
      attributes = node.attributes;
      /*search node attributes for non-terminals*/
      for(var i = 0; i < attributes.length; i++){
        /*disallow style and class interpolation*/
        if(attributes[i].name == 'style' || attributes[i].name == 'class'){
          continue;
        }

        while( (match = regex.exec(attributes[i].value)) != null ){
          tmp_node = new TMP_Node(node, match[1], match[2]);         
          tmp_node.symbolMap[attributes[i].name] = attributes[i].value;
          tmp_node.scope = scope;
          hasAttribNonTerminal = true;/*global polution: should be removed*/
          Map.pushNodes(tmp_node);
          /*This is necessary for repeats as their child nodes aren't added to Interpolation array
            Rather they are recompiled using repeated elements as the base. It makes sense since
            we do interpolation during preprocessing with repeats that we do the same with attributes
            in repeats*/
          Interpolate.updateNodeAttributes(tmp_node, tmp_node.modelName, tmp_node.attribName);
          /*annotate node with symbolMap and push it onto modelMap */
        }
        
      }

    }
  },
  preProcessControl : function(tmp_node){
    /*Annotate control names for compiler*/
    /*Indexed nodes get array pointing to embedded controls. This repeat DOM_Node's model, attrib
      index are used to identify the control and delete it when this DOM_Node is removed*/
    var intraCompilation = tmp_node.node.innerHTML,
        ctrlRegexResults = null,
        nonTerminal = '';
    while( ((ctrlRegexResults = new RegExp(_.CTRL_ATTRIB_STRING + '=' + '"(\\w+)"', 'g').exec(tmp_node.node.innerHTML.trim())) != null )
          && !_.isNullOrEmpty(tmp_node.modelName) && !_.isNullOrEmpty(tmp_node.attribName)){

      tmp_node.embeddedControls.push(ctrlRegexResults[1]);
      nonTerminal = _.CTRL_ATTRIB_STRING + '=' + '"' + ctrlRegexResults[1] 
              + this.buildControlNonTerminal(tmp_node.modelName, tmp_node.attribName, ctrlRegexResults[1], tmp_node.index) + '"';
        
        tmp_node.node.innerHTML = intraCompilation =  
          intraCompilation.replace(ctrlRegexResults[0], nonTerminal);
    }

  },
  
  preProcessRepeatNode : function(TMP_baseNode, index){
    var newId = null,
        repeatedProperties = null,
        embeddedInterpolations = null,
        uncompiledTemplate = '',
        uncompiledTemplate = ''
        intraCompilation = '',
        idvRepeatedProperty = null,
        nonTerminal = '',
        newDomNode = document.createElement(TMP_baseNode.node.tagName.toLowerCase()),
        TMP_repeatedNode = new TMP_Node(newDomNode, TMP_baseNode.modelName, TMP_baseNode.attribName, index),
        ctrlRegexResults = null,
        NONTERMINAL_REGEX = /(\{\{((\w+)\.(\w+))\}\})/g,
        ntFound = false,/*nonTerminalFound*/
        Process = this;
    DOM.cloneAttributes(TMP_baseNode.node, TMP_repeatedNode.node);
    TMP_repeatedNode.node.innerHTML = TMP_baseNode.node.innerHTML;
    /*auto enumeration of existing id attribute*/
    newId = TMP_baseNode.node.getAttribute('id');
    newId = ( newId == null) ? '' : TMP_repeatedNode.node.setAttribute('id', newId + '-' + index); 
    
    /*Process embedded NTs belonging to other models*/
    intraCompilation = TMP_repeatedNode.node.innerHTML;
    if( (embeddedInterpolations = NONTERMINAL_REGEX.exec(TMP_repeatedNode.node.innerHTML)) != null){
      TMP_baseNode.embeddedModelAttribs[embeddedInterpolations[3] + '.' + embeddedInterpolations[4]] = true;
      nonTerminal = this.buildRepeatNonTerminal(embeddedInterpolations[3], embeddedInterpolations[4], TMP_baseNode.modelName, TMP_baseNode.attribName , index);
            TMP_repeatedNode.node.innerHTML = intraCompilation =
                    intraCompilation.replace(embeddedInterpolations[0], nonTerminal );
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

    this.preProcessControl(TMP_repeatedNode);
    
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
    
    if(inputType == 'checkbox' || inputType == 'radio'){
      var attrib = Map.getAttribute(DOM_Node.model, DOM_Node.name),
          TMP_checkbox = null,
          parentNode = null,
          value = '',
          description = '';
      if(!_.isNull(attrib) && _.isArray(attrib) 
        && (parentNode = DOM_Node.parentNode) !== null 
        && !_.isNullOrEmpty(scope)){

        for(var i = 0; i < attrib.length; i++){
        
          if(_.isString(attrib[i])){
            value = description = attrib[i];
          } else {
            value = (_.isDef(attrib[i].value)) ? attrib[i].value : value;
            description = (_.isDef(attrib[i].description)) ? attrib[i].description : description;
          }
          
          TMP_checkbox = new TMP_Node(document.createElement('input'),DOM_Node.model, DOM_Node.name, i) ;
          TMP_checkbox.scope = scope;
          TMP_checkbox.node.model = TMP_checkbox.modelName;
          TMP_checkbox.node.name = TMP_checkbox.attribName;
          DOM.cloneAttributes(DOM_Node, TMP_checkbox.node);
          TMP_checkbox.node.setAttribute('value', value);
          
          /*check to see if it's embedded and annotate*/
          if(!_.isNullOrEmpty(propName) && propName.indexOf('zTMPzDOT') != _.UNINDEXED){
            repeatAnnotationParts = propName.split('DOT');
            TMP_checkbox.repeatModelName = repeatAnnotationParts[1];
            TMP_checkbox.repeatAttribName = repeatAnnotationParts[2]; 
            TMP_checkbox.repeatIndex = (_.isDef(partMap['index'])) ? parseInt(partMap['index']) : -1;;
            TMP_checkbox.index = _.UNINDEXED;
            TMP_checkbox.prop = '';
          }
          
          DOM.appendTo(TMP_checkbox.node, parentNode);
          DOM.appendTo(document.createTextNode(description), TMP_checkbox.node);
          TMP_checkbox.node.addEventListener('click',function(e){
            Interpolate.dispatchListeners(
              Map.getListeners(this.model, this.name)
              , {type : _.MODEL_EVENT_TYPES.checkbox_change
              , checked : (e.target.checked === true)
              , value : e.target.value
              }
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
        Interpolate.interpolate(this.model, this.name, e.target.value );
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
        matches = null,
        modelNameParts = null,
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

        if( (matches = regex.exec(DOM_Node.innerHTML)) === null) 
          break;
          
        DOM_Node.innerHTML = '';
        modelNameParts = Process.parseModelAttribName(matches[2]);
        attributeVal = Map.getAttribute(modelNameParts[0],modelNameParts[1]);
        DOM_Node.model = modelNameParts[0];
        DOM_Node.name = modelNameParts[1];
        TMP_select = new TMP_Node(DOM_Node, modelNameParts[0], modelNameParts[1]);
        TMP_select.scope = scope;
        //push select onto 'interpolate' array
        Map.pushNodes(TMP_select);
        if(DOM_Node.children.length < 1){
          
          for(var i = 0; i < attributeVal.length; i++){
            TMP_option = new TMP_Node(document.createElement("option"),modelNameParts[0], modelNameParts[1], i) ;
            TMP_option.scope = scope;
            TMP_option.node.text = Process.buildNonTerminal(modelNameParts[0], modelNameParts[1], 'text', i);
            TMP_option.node.value = Process.buildNonTerminal(modelNameParts[0], modelNameParts[1], 'value', i);
            DOM_Node.appendChild(TMP_option.node);
            DOM_Node.selectedIndex = 
              (_.isDef(attributeVal[i].selected) && attributeVal[i].selected == true) ? 
                i : DOM_Node.selectedIndex;
            Map.pushNodes(TMP_option);
          }
          
        }
        DOM_Node.addEventListener('change', function(e){
          Interpolate.dispatchListeners(
            Map.getListeners(this.model, this.name)
            , {type : _.MODEL_EVENT_TYPES.select_change
            , value : e.target.options[e.target.selectedIndex].value
            , text : e.target.options[e.target.selectedIndex].text
            , index : e.target.selectedIndex
              }
          );                  
        });
        break;
      case 'INPUT':
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
        TMP_unknown = new TMP_Node(DOM_Node, modelName, attribName);
        /*add controls on all non-repeat elements with control directive*/
        this.preProcessControl(TMP_unknown);
        break;
    }
    
    this.preProcessNodeAttributes(DOM_Node, scope);
    return compileMe;
  }
  
};


});