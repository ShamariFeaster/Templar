window.structureJS.module('Interpolate', function(require){

'use strict';

var _ = this;
var TMP_Node = require('TMP_Node');
var Map = require('Map');
var DOM = require('DOM');
var Process = require('Process');
var System = require('System');
var State = require('State');
var Circular = window.structureJS.circular();

return {

  dispatchListeners : function(listeners, data){

    if(_.isDef(listeners) && State.dispatchListeners === true){
      for(var id in listeners){
        if(_.isFunc(listeners[id])){
          listeners[id].call(null, data);
        }
      }
    }

  },
  
  dispatchSystemListeners : function(type){
    if(!_.isNullOrEmpty(type)){
      var listeners = System.getSystemListeners(type);
          
      if(_.SYSTEM_EVENT_TYPES.LIST_TYPE == _.QUEUE){
        for(var i = 0;i < listeners.length; i++){
          if(_.isFunc(listeners[i])){
            listeners[i].call(null);
          }
        }
      }else if(_.SYSTEM_EVENT_TYPES.LIST_TYPE == _.STACK){
        for(var x = listeners.length - 1;x >= 0; x--){
          if(_.isFunc(listeners[x])){
            listeners[x].call(null);
          }
        }
      }
      
    }
  },
  
  updateNodeAttributes : function(tmp_node){
    var updateObject = {};
    var node = tmp_node.node;
    var intermediateValue = '';
    var uninterpolatedString = '';
    var elemAttribName = '';
    var currAttribVal = '';
    var elemAttributes = node.attributes;
    var component = null;
    var keys = null;
    var tokens = null;
    
    if(node.hasAttributes() && tmp_node.isComponent === false){
      
      
      for(var i = 0; i < elemAttributes.length; i++){
        if(elemAttributes[i].name == 'data-' + _.IE_MODEL_REPEAT_KEY) continue;
        elemAttribName = elemAttributes[i].name;

        uninterpolatedString = (_.isDef(tmp_node.symbolMap[elemAttribName])) ? 
                                  tmp_node.symbolMap[elemAttribName] :
                                  '';
        /*short circuit: is this model attribute's non-terminal in the node attributes string?
          during compilation, any node with a non-terminal is annotated w/ a symbol map*/
        if(!_.isNullOrEmpty( uninterpolatedString = tmp_node.symbolMap[elemAttribName]  ) ){
          /*get each non-terminal then, using text replacement, we update the node attribute
            value*/
            
          tokens = Circular('Compile').getAllTokens( uninterpolatedString );
          
          for(var x = 0; x < tokens.length; x++ ){
            currAttribVal = Map.dereferenceAttribute(tokens[x]);
            if(_.isArray(currAttribVal)){
              currAttribVal = tokens[x].fullToken;
            }
            intermediateValue = uninterpolatedString.replace(tokens[x].fullToken, currAttribVal );
            uninterpolatedString = intermediateValue;
          }
          
          node.setAttribute(elemAttribName, intermediateValue);
          updateObject[elemAttribName] = intermediateValue;
        }
      }
    }else if(tmp_node.isComponent === true){
      component = window.Templar._components[tmp_node.componentName];
      /*Due to the way Process.preProcessNodeAttribute() works a component's symbolMap
        will have a single key. This key can be used to tell us which update function to
        run. This sinlge key situation is not the case w/ non-component tmp's as they can
        have multiple keys (aka multiple attributes-per-node that need interpolation)*/
      if( (keys = Object.keys(tmp_node.symbolMap)).length > 0 ){
        tokens = Circular('Compile').getTokens( tmp_node.symbolMap[keys[0]] );
        for(var z = 0; z < tokens.length; z++ ){
          node.setAttribute(keys[0], Map.dereferenceAttribute(tokens[z]));
        }
        
      }

    }

    return updateObject;
  },
  interpolateSpan : function(tmp_node){
    var node = tmp_node.node;
    var retVal = Map.dereferenceAttribute(tmp_node) || '';
    var currVal = node.textContent || node.innerText;
    var temp = (!_.isArray(retVal) && !_.isObj(retVal)) ? retVal : currVal;
    
    /* http://stackoverflow.com/questions/1359469/innertext-works-in-ie-but-not-in-firefox */
    if(_.isDef(node.textContent)){ 
      node.textContent = temp;
    }else{
      node.innerText = temp;
    }
  },
  /*Returns the whole attribute if no limit is defined for this attribute*/
  getPageSlice : function(Model, attributeName, target){
    var start = 0;
    var length = target.length;
    var limit = 0;
    var page = 0;
    var results = target;
    
    if(_.isDef(Model.limitTable[attributeName])){
      page = Model.limitTable[attributeName].page;
      limit = Model.limitTable[attributeName].limit;
      length = ((limit * page) <= target.length) ? 
               (limit * page) : target.length;
      start = ( ((page * limit) - limit) < length) ?
              (page * limit) - limit : 0;
      results = target.slice(start, length);
    }    
    
            
    return results;
  },
  getPageSliceData : function(Model, attributeName, target){
    var start = 0;
    var length = target.length;
    var limit = 0;
    var page = 0;
    var results = {};
    
    results.start = -1;
    results.length = 0;
        
    if(_.isDef(Model.limitTable[attributeName])){
      page = Model.limitTable[attributeName].page;
      limit = Model.limitTable[attributeName].limit;
      length = (((limit * page))  <= target.length) ? 
               ((limit * page)) : target.length;
      start = ( ((page * limit) - limit) < length) ?
              (page * limit) - limit : 0;
      results.start = start;
      results.length = length;
    }
    return results;
    
  },
  /*TODO: COMMENT THIS*/
  interpolateEmbeddedRepeats : function(TMP_node, index){
    var baseNodes = null;
    var TMP_repeatBaseNode = null;
    var attributeVal = null;
    var modelName = null;
    var attributeName = null;
    var parts = null;
    var TMP_repeatedNode = null;
        
    for(var modelAttrib in TMP_node.embeddedRepeats){
      if(TMP_node.embeddedRepeats.hasOwnProperty(modelAttrib)){
        
        parts = Process.parseModelAttribName(modelAttrib);
        modelName = parts[0];
        attributeName = parts[1];
        baseNodes = Map.getRepeatBaseNodes(modelName, attributeName);
        Map.pruneBaseNodes(baseNodes);
        /*In interpolate() the call to compile() preceeding  the call to this adds a
          baseNode to this attribs basenode array. The index of which corresponsd to
          the index of the repeated node. The point of doing it this way is to keep the
          baseNodes for embedded repeats intact so changes to those attribs can rebuild
          the embedded repeat(s) in place in their containing repetitions.*/
        if(!_.isNull(TMP_repeatBaseNode = baseNodes[index])){
          
          if(DOM.isVisible(TMP_repeatBaseNode.node.parentNode) && 
            _.isArray(attributeVal = Map.dereferenceAttribute(TMP_repeatBaseNode)))
          {

            /*rebuild new one*/
            for(var i = 0; i < attributeVal.length; i++){
              TMP_repeatedNode = Process.preProcessRepeatNode(TMP_repeatBaseNode, i);
              TMP_repeatedNode.scope = TMP_repeatBaseNode.scope;
              Map.pushNodes(TMP_repeatedNode);
              if(TMP_repeatedNode.hasNonTerminals === false)
                TMP_repeatedNode.node.innerHTML = attributeVal[i];
              TMP_repeatBaseNode.node.parentNode.insertBefore(TMP_repeatedNode.node, TMP_repeatBaseNode.node);
              Circular('Compile').compile(TMP_repeatedNode.node, TMP_repeatBaseNode.scope, i);
            }
          }
          TMP_repeatBaseNode.node.setAttribute('style','display:none;'); 
        }
        
      }
      
    }
  
  },
  
  intializeSelect : function(tmp_node, ifEmbedded, modelAttribLength){
    var isEmbedded = (!_.isNullOrEmpty(tmp_node.repeatModelName) && !_.isNullOrEmpty(tmp_node.repeatAttribName));
    var run = (ifEmbedded) ? (ifEmbedded && isEmbedded) : (!ifEmbedded && !isEmbedded);
    var attributeVal = Map.dereferenceAttribute(tmp_node);
    var newNodeCnt;
    var newNodeIndex;
    var text;
    var value;
    var modelName = tmp_node.modelName;
    var attributeName = tmp_node.attribName;
    var selectedValue = attributeVal._value_;

    if(run && _.isArray(attributeVal)){
      var isShittyIE = (modelAttribLength > 0 && tmp_node.node.children.length === 0);
      /* with IE clearing children on node taken out of DOM, we must repopulate the select */
      if(isShittyIE === true){
        Map.forEach(tmp_node.modelName, tmp_node.attribName, function(ctx, tmp_option){
          if(tmp_option.node.tagName == 'OPTION' && ctx.modelAttribIndex < modelAttribLength){
            tmp_node.node.appendChild(tmp_option.node);
          }
        });
      }
      
      /*New model data, longer than existing data, add extra nodes*/
      if(attributeVal.length > modelAttribLength ){
        /*amount of nodes needed*/
        newNodeCnt = attributeVal.length - modelAttribLength;
        /*where to start the new indexes in the 'indexes' table*/
        newNodeIndex = attributeVal.length - newNodeCnt;

        for(var q = 0; q < newNodeCnt; q++, newNodeIndex++, modelAttribLength++){
          var tmp_option = new TMP_Node(document.createElement("option"),modelName, attributeName, newNodeIndex);
          tmp_option.inheritToken(tmp_node);
          tmp_option.node.text = ( _.isDef(text = attributeVal[newNodeIndex].text) ) ? text : attributeVal[newNodeIndex];
          tmp_option.node.value = ( _.isDef(value = attributeVal[newNodeIndex].value) ) ? value : attributeVal[newNodeIndex];
          tmp_node.node.appendChild(tmp_option.node);
          tmp_option.scope = tmp_node.scope;
          tmp_node.node.selectedIndex = 0;
          tmp_node.node.selectedIndex = 
            (!_.isNullOrEmpty(selectedValue) && tmp_option.node.value == selectedValue) ?
              q : tmp_node.node.selectedIndex;
          Map.pushNodes(tmp_option);
        }
      }
      
    }
    Process.addCurrentSelectionToSelect(tmp_node.node, attributeVal);
  },
  
  interpolate : function(modelName, attributeName, attributeVal, compiledScopes){  
    if(!Map.exists(modelName)) return;

    var listeners = Map.getListeners(modelName, attributeName);
    var Interpolate = this;
    var updateObject = {};
    var TMP_repeatBaseNode = null;
    var updateObj = {};
    var node = null;
    var tagName = '';
    var attributes = null;
    var boundProperties = [];
    var selectNode = null;
    var text = '';
    var value = '';
    /*Note that listeners are only fired for attribs that are in the nodeTree (ie, visible in the UI)*/
    Map.forEach(modelName, attributeName, function(ctx, tmp_node){
             
      /*On Link() only interp nodes belonging to the linked scope*/
      if(_.isDef(compiledScopes) && !Map.isInScopeList(tmp_node.scope, compiledScopes)){
        //_.log('Not Interpolating '  + modelName + '.' + attributeName + ' for scope <' + tmp_node.scope + '> not in <' + compiledScopes +'>');
        return;
      }
        
      node = tmp_node.node;
      tagName = (tmp_node.isComponent === true) ? 'COMPONENT' : node.tagName;
      tagName = (_.isDef(tmp_node.symbolMap['data-' + _.IE_MODEL_REPEAT_KEY])) ? 'REPEAT' : node.tagName;
      if(ctx.hasAttributes === true){
        updateObject = Interpolate.updateNodeAttributes(tmp_node, modelName, attributeName);
      } 
      
      boundProperties = (_.isDef(node.token) && _.isDef(node.token.indexQueue)) ? 
                  node.token.indexQueue.slice(0) : [];  
        
      switch(tagName){
        
        case 'SELECT':
          Interpolate.intializeSelect(tmp_node, false, ctx.modelAttribLength);
          break;
        case 'OPTION':
          if(_.isArray(attributeVal = Map.dereferenceAttribute(tmp_node))){
            
            selectNode = node.parentNode;
            
            if(attributeVal.length <= ctx.modelAttribLength && ctx.modelAttribIndex < attributeVal.length){
                node.text = ( _.isDef(text = attributeVal[ctx.modelAttribIndex].text) ) ? text : attributeVal[ctx.modelAttribIndex];
                node.value = ( _.isDef(value = attributeVal[ctx.modelAttribIndex].value) ) ? value : attributeVal[ctx.modelAttribIndex];
                selectNode.selectedIndex = 
                  (_.isDef(attributeVal[ctx.modelAttribIndex].selected) && attributeVal[ctx.modelAttribIndex].selected === true) ? 
                    ctx.modelAttribIndex : selectNode.selectedIndex;
              
            }
            updateObj.value = selectNode.options[selectNode.selectedIndex].value;
            updateObj.text = selectNode.options[selectNode.selectedIndex].text;
            updateObj.type = _.MODEL_EVENT_TYPES.interp_change;
            updateObj.index = selectNode.selectedIndex;
            updateObj._attrib_ = attributeVal;
            updateObj.properties = boundProperties;
            
            /*This is here & not in preProcess... b/c when attrib is replaced as
            is the case with a cascading select, the preProcessor isn't called again,
            and therefore the setter isn't fired*/
            
            
            /*New model data, shorter than existing data, kill extra nodes*/
            if(ctx.modelAttribIndex >= attributeVal.length){
              ctx.removeItem(ctx.index); /*from indexes[key] = []*/
              selectNode.removeChild(node);
            }

          }
          break;
        
        case 'SPAN':

          Interpolate.interpolateSpan(tmp_node);
          updateObj.text = node.innerText;
          updateObj.value = node.innerText;
          updateObj.type = node.tagName.toLowerCase();
          updateObj.properties = boundProperties;
          break;
        case 'INPUT':
          attributes = DOM.getDOMAnnotations(tmp_node.node);
          /*A mismatch here means this tmp_node is in the cache for attribute processing
            . Such a node shouldn't update the DOM_node value or fire listeners.*/
          
          if(attributes.modelName == tmp_node.modelName && 
            attributes.attribName == tmp_node.attribName){
             
             /*array would mean bound to checkbox*/
            if(!_.isArray(attributeVal = Map.dereferenceAttribute(tmp_node)) && State.ignoreKeyUp === false){
              node.value = attributeVal;
            }
            
            updateObj.text = node.value;
            updateObj.value = node.value;
            updateObj.type = node.tagName.toLowerCase();
            updateObj.target = node;
            updateObj.properties = boundProperties;
           }
          
          break;
        case 'TEXTAREA':
          tmp_node.node.value = attributeVal;
          updateObj.text = node.value;
          updateObj.value = node.value;
          updateObj.type = node.tagName.toLowerCase();
          updateObj.target = node;
          updateObj.properties = boundProperties;
          break;
        case 'REPEAT':
          var TMP_repeatedNode = null;
          var baseNodes = null;
          
          ctx.endingIndex = ctx.target.length;//ctx.target.length;
          
          /*cache and DOM housekeeping*/
          Map.destroyRepeatTree(modelName, attributeName);
          
          baseNodes = Map.getRepeatBaseNodes(modelName, attributeName);
          Map.pruneBaseNodes(baseNodes);

          for(var z = 0; z < baseNodes.length; z++){
            TMP_repeatBaseNode = baseNodes[z];

            if(document.body.contains(TMP_repeatBaseNode.node) && 
              _.isArray(attributeVal = Map.dereferenceAttribute(TMP_repeatBaseNode)) && 
              attributeVal.length > 0)
            {
              
              /*rebuild new one*/
              for(var i = 0; i < attributeVal.length; i++){
                TMP_repeatedNode = Process.preProcessRepeatNode(TMP_repeatBaseNode, i);
                TMP_repeatedNode.scope = TMP_repeatBaseNode.scope;
                Map.pushNodes(TMP_repeatedNode);
                if(TMP_repeatedNode.hasNonTerminals === false)
                  TMP_repeatedNode.node.innerHTML = attributeVal[i];
                TMP_repeatBaseNode.node.parentNode.insertBefore(TMP_repeatedNode.node, TMP_repeatBaseNode.node);
                Circular('Compile').compile(TMP_repeatedNode.node, TMP_repeatBaseNode.scope, i);
                Process.preProcessNodeAttributes(TMP_repeatedNode.node, TMP_repeatBaseNode.scope, i);
                Interpolate.interpolateEmbeddedRepeats(TMP_repeatBaseNode, i);
              }
              Map.pruneDeadEmbeds();
              Interpolate.dispatchSystemListeners(_.SYSTEM_EVENT_TYPES.repeat_built); 
              System.removeSystemListeners(_.SYSTEM_EVENT_TYPES.repeat_built);
              updateObj.type = 'repeat';
              updateObj.value = attributeVal;
              updateObj.properties = boundProperties;
            }
            TMP_repeatBaseNode.node.setAttribute('style','display:none;'); 
            
          }
          
          /*Stop outter loop. We build the updated repeat nodes in one pass*/
          //outerCtx.stop = true;
          
          break;
        default:
          updateObj.text = null;
          updateObj.value = null;
          updateObj.type = _.MODEL_EVENT_TYPES.reassignment;
          updateObj.target = node;
          updateObj.properties = boundProperties;
          Interpolate.dispatchListeners(listeners, updateObj);
          break;
        }
      
    });
    /*only dispatchListeners() for interps which change node values*/
    if(_.isDef(updateObj.type)){
    
      if(updateObj.type == _.MODEL_EVENT_TYPES.interp_change){
        updateObj._attrib_._value_ = updateObj.value;
      }
      
      Interpolate.dispatchListeners(listeners, updateObj);
    }
    
  }
  
};



});