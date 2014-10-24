structureJS.module('Interpolate', function(require){

var _ = this;
var TMP_Node = require('TMP_Node');
var Map = require('Map');
var DOM = require('DOM');
var Process = require('Process');
var System = require('System');
var Circular = structureJS.circular();

return {

  dispatchListeners : function(listeners, data){

    if(_.isDef(listeners)){
      for(var id in listeners){
        if(_.isFunc(listeners[id])){
          listeners[id].call(null, data);
        }
      }
    }
    
    
  },
  
  dispatchSystemListeners : function(type){
    if(!_.isNullOrEmpty(type)){
      var listeners = System.getSystemListeners(type),
          systemId = _.SYSTEM_EVENT_TYPES.system;
      for(var i = 0;i < listeners.length; i++){
        if(_.isFunc(listeners[i])){
          listeners[i].call(null);
        }
      }
    }
    System.removeSystemListeners(type);
  },
  
  updateNodeAttributes : function(tmp_node, modelName, attributeName){
    var updateObject = Object.create(null);
    var node = tmp_node.node;
    if(node.hasAttributes()){
      var regex = /(\{\{(\w+\.\w+)\}\})/g, 
      //result array -> [1] = {{a.b}}, [2] = a.b, 4 = index, 5 = prop
          ntRegex = /(\{\{(\w+\.\w+)(\[(\d+)\])*(?:\.)*(\w+)*?\}\})/g,
          match = null,
          text = '',
          intermediateValue = '',
          uninterpolatedString = '',
          elemAttribName = '',
          currAttribVal = '',
          elemAttributes = node.attributes;
      
      for(var i = 0; i < elemAttributes.length; i++){
        elemAttribName = elemAttributes[i].name;

        uninterpolatedString = (_.isDef(tmp_node.symbolMap[elemAttribName])) ? 
                                  tmp_node.symbolMap[elemAttribName] :
                                  '';
        /*short circuit: is this model attribute's non-terminal in the node attributes string?
          during compilation, any node with a non-terminal is annotated w/ a symbol map*/
        if(_.isDef( uninterpolatedString ) && ntRegex.test(uninterpolatedString)){
          /*get each non-terminal then, using text replacement, we update the node attribute
            value*/
          ntRegex.lastIndex = 0;
          while(  (match = ntRegex.exec(uninterpolatedString)) != null){
            modelNameParts = Process.parseModelAttribName(match[2]);
            currAttribVal = Map.getAttribute(modelNameParts[0], modelNameParts[1], match[4], match[5]);
            intermediateValue = uninterpolatedString.replace(match[1], currAttribVal );
            uninterpolatedString = intermediateValue;
          }
          
          node.setAttribute(elemAttribName, intermediateValue);
          updateObject[elemAttribName] = intermediateValue;
        }
      }
    }

    return updateObject;
  },
  interpolateSpan : function(tmp_node, attributeVal){
    var node = tmp_node.node;
    if(_.isNullOrEmpty(tmp_node.prop) && tmp_node.index == _.UNINDEXED){
      node.innerText =  attributeVal;
    }else if(!_.isNullOrEmpty(tmp_node.prop) && tmp_node.index >= 0){
      if(_.isDef(attributeVal[tmp_node.index]) && tmp_node.index < attributeVal.length)
        node.innerText = attributeVal[tmp_node.index][tmp_node.prop];
    }else if(tmp_node.index >= 0){
      if(_.isDef(attributeVal[tmp_node.index]) && tmp_node.index < attributeVal.length)
        node.innerText = attributeVal[tmp_node.index];
    }
  },
  /*Returns the whole attribute if no limit is defined for this attribute*/
  getPageSlice : function(Model, attributeName, target){
    var start = 0,
        length = target.length,
        limit = 0, 
        page = 0,
        results = target;
    if(_.isDef(Model.limitTable[attributeName])){
      page = Model.limitTable[attributeName].page;
      limit = Model.limitTable[attributeName].limit;
      length = (((limit * page))  <= target.length) ? 
               ((limit * page)) : target.length;
      start = ( ((page * limit) - limit) < length) ?
              (page * limit) - limit : 0;
      results = target.slice(start, length);
    }    
    
            
    return results;
  },
  getPageSliceData : function(Model, attributeName, target){
    var start = 0,
        length = target.length,
        limit = 0, 
        page = 0,
        results = Object.create(null);
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
  interpolate : function(modelName, attributeName, attributeVal){  
    if(!Map.exists(modelName))
      return;
      
    _.log('Interpolating ' + modelName + '.' + attributeName);
    var option = null;
        listeners = Map.getListeners(modelName, attributeName),
        Interpolate = this,
        attribCurrState = Map.getAttribute(modelName, attributeName),
        updateObject = Object.create(null),
        numNodesToAdd = 0,
        numNodesToRemove = 0,
        newNodeStartIndex = 0,
        TMP_repeatBaseNode = null,
        updateObj = Object.create(null);
    
    Map.forEach(modelName, attributeName, function(ctx, tmp_node){
      var node = tmp_node.node;
      if(ctx.hasAttributes == true)
        updateObject = Interpolate.updateNodeAttributes(tmp_node, modelName, attributeName);
        
        
      switch(node.tagName){
        
        case 'SELECT':
          /*Make sure it's an array*/
          if(_.isArray(attributeVal)){
          
            /*New model data, longer than existing data, add extra nodes*/
            if(attributeVal.length > ctx.modelAttribLength){
              /*amount of nodes needed*/
              var newNodeCnt = attributeVal.length - ctx.modelAttribLength,
                  /*where to start the new indexes in the 'indexes' table*/
                  newNodeIndex = attributeVal.length - newNodeCnt;
              
              for(var q = 0; q < newNodeCnt; q++, newNodeIndex++, ctx.modelAttribLength++){
                var tmp_option = new TMP_Node(document.createElement("option"),modelName, attributeName, newNodeIndex);
                tmp_option.node.text = attributeVal[newNodeIndex].text;
                tmp_option.node.value = attributeVal[newNodeIndex].value;
                node.appendChild(tmp_option.node);
                tmp_option.scope = tmp_node.scope;
                Map.pushNodes(tmp_option);
              }
            }
            
          }
          break;
        case 'OPTION':
          if(_.isArray(attributeVal)){
            if(attributeVal.length <= ctx.modelAttribLength && ctx.modelAttribIndex < attributeVal.length){
                node.text = attributeVal[ctx.modelAttribIndex].text;
                node.value = attributeVal[ctx.modelAttribIndex].value;
                node.parentNode.selectedIndex = 
                  (_.isDef(attributeVal[ctx.modelAttribIndex].selected) && attributeVal[ctx.modelAttribIndex].selected == true) ? 
                    ctx.modelAttribIndex : node.selectedIndex;
              
            }
            updateObj.value = node.parentNode.options[node.parentNode.selectedIndex].value;
            updateObj.text = node.parentNode.options[node.parentNode.selectedIndex].text;
            updateObj.type = 'select';
            updateObj.index = node.parentNode.selectedIndex;
            /*New model data, shorter than existing data, kill extra nodes*/
            if(ctx.modelAttribIndex >= attributeVal.length){
              ctx.removeItem(ctx.index); /*from indexes[key] = []*/
              /*this is most likely unecessary*/
              //Map.pruneControlNodesByIndex(tmp_node, modelName, attributeName, ctx.modelAttribIndex);
              node.parentNode.removeChild(node);
            }
            
            
          }
          break;
        
        case 'SPAN':

          Interpolate.interpolateSpan(tmp_node, attributeVal);
          updateObj.text = node.innerText;
          updateObj.type = node.tagName.toLowerCase();
          break;
        case 'INPUT':
          updateObj.text = node.value;
          updateObj.type = node.tagName.toLowerCase();
          break;
        default:
          var TMP_newRepeatNode = null,
              TMP_repeatedNode = null,
              outerCtx = ctx,
              baseNodes = null,
              repeatStart = 0,
              repeatEnd = 0;
         
         
          /*Kill existing repeat tree*/
          Map.forEach(modelName, attributeName, function(ctx, tmp_node){
            /*un-track all nodes*/
            Map.pruneControlNodesByIndex(tmp_node, modelName, attributeName, tmp_node.index);
            ctx.removeItem(ctx.index);
            /*only remove visible elements from DOM, don't remove base node from DOM*/
            if(!_.isNull(tmp_node.node.parentNode) && tmp_node.index > _.UNINDEXED)
              tmp_node.node.parentNode.removeChild(tmp_node.node);
          });
         
          baseNodes = Map.getRepeatBaseNodes(modelName, attributeName);
          for(var z = 0; z < baseNodes.length; z++){
            TMP_repeatBaseNode = baseNodes[z];
            /*If base node has no parent then it is not in the current DOM*/
            if(DOM.isVisible(TMP_repeatBaseNode.node.parentNode)){
              /*rebuild new one*/
              for(var i = 0; i < attributeVal.length; i++){
                Map.pruneEmbeddedNodes(TMP_repeatBaseNode, modelName, attributeName, i);
                TMP_repeatedNode = Process.preProcessRepeatNode(TMP_repeatBaseNode, i);
                TMP_repeatedNode.scope = TMP_repeatBaseNode.scope;
                Map.pushNodes(TMP_repeatedNode);
                if(TMP_repeatedNode.hasNonTerminals == false)
                  TMP_repeatedNode.node.innerHTML = attributeVal[i];
                DOM.appendTo(TMP_repeatedNode.node, TMP_repeatBaseNode.node);
                Circular('Compile').compile(TMP_repeatedNode.node, TMP_repeatBaseNode.scope);
              }
            }
            
          }
            
          /*Stop outter loop. We build the updated repeat nodes in one pass*/
          outerCtx.stop = true;
          

          break;
        }
      
    });

    Interpolate.dispatchListeners(listeners, updateObj);
    
  }
  
};



});