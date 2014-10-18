structureJS.module('DOM', function(require){

return {
  modifyClasses : function(node, add, remove){
    var nodeClassList = '',
        removeAsArray = remove.split(_.CLASS_SEPARATOR);
    
    if(!_.isNull(node)){
      /*getAttribute may return '' or null so we check below*/
      nodeClassList = node.getAttribute('class');
      nodeClassList = (_.isNull(nodeClassList)) ? '' : nodeClassList.trim();
      for(var i = 0; i < removeAsArray.length; i++ ){
        nodeClassList = nodeClassList.replace(removeAsArray[i], '', 'g');
      }
      node.setAttribute('class', nodeClassList + ' ' + add);
    }
  },
  hideByIdList : function(commaSeparatedIdList){
    var nodeToHide = null,
        idListAsArray = null;
        
    if(commaSeparatedIdList != null && commaSeparatedIdList != ''){
      idListAsArray = commaSeparatedIdList.split(_.CLASS_SEPARATOR);
      for(var i = 0; i < idListAsArray.length; i++){
        nodeToHide = document.getElementById(idListAsArray[i]);
        this.modifyClasses(nodeToHide,'apl-hide','apl-show,apl-hide');
        
      }
    }
  },
  appendTo : function(child, parent){  
    if(!_.isDef(parent) || !_.isDef(child) || _.isNull(parent.parentNode))
      return;
    parent.parentNode.insertBefore(child, child.nextSibling);
  },
  
  cloneAttributes : function(fromNode, toNode){
    if(fromNode.hasAttributes()){
      attributes = fromNode.attributes;
      /*search node attributes for non-terminals*/
      for(var i = 0; i < attributes.length; i++){
        if(attributes[i].name == 'data-apl-repeat' || attributes[i].name == 'style')
          continue;
        
        toNode.setAttribute(attributes[i].name, attributes[i].value);
      }

    }
  },
  
  isVisible : function(DOM_node){
    if(_.isNull(DOM_node))
      return false;
    
    return (DOM_node.offsetWidth > 0 && DOM_node.offsetHeight > 0);
  },
  
  asynGetPartial : function(fileName, callback, targetId, node){
    var xhr = new XMLHttpRequest();
    xhr.onload = callback;
    xhr.fileName = fileName;
    xhr.targetId = targetId;
    xhr.targetNode = node;
    xhr.onreadystatechange = function() {
    if (xhr.readyState === 4){   //if complete
        if(xhr.status !== 200){  //check if "OK" (200)
          //throw error
        }
      } 
    }

    xhr.open('get',  fileName, true);
    xhr.send();
  }
}; 


});