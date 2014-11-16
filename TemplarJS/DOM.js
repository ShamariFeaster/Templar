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
    if(!_.isNullOrEmpty(xhr.fileName)){
      xhr.open('get',  fileName, true);
      xhr.send();
    }
    
  },
  /*Solution from: http://stackoverflow.com/questions/7378186/ie9-childnodes-not-updated-after-splittext*/
  insertAfter : function(node, precedingNode) {
    var nextNode = precedingNode.nextSibling, parent = precedingNode.parentNode;
    if (nextNode) {
      parent.insertBefore(node, nextNode);
    } else {
      parent.appendChild(node);
    }
    return node;
  },

// Note that we cannot use splitText() because it is bugridden in IE 9.
  splitText : function(node, index) {
    var newNode = node.cloneNode(false);
    newNode.deleteData(0, index);
    node.deleteData(index, node.length - index);
    this.insertAfter(newNode, node);
    return newNode;
  },
  
  getHashValue : function(url){
    return (_.isString(url)) ? url.substring(url.indexOf('#')).replace('#', '') : '';
  },
  
  getDataAttribute : function(DOM_Node, attributeKey){
    var parts = (_.isString(attributeKey)) ? attributeKey.split('-') : [];
    var value = null;
    /*camelcase from the first word on*/
    var camelCaseKey = parts.slice(0,1).concat(parts.slice(1).map(function(part){
      return part.charAt(0).toUpperCase() + part.slice(1);
    })).join('');
    
    if(!_.isNull(DOM_Node)){
      if(_.isDef(DOM_Node.dataset)){
        value = DOM_Node.dataset[camelCaseKey];
      }else{
        value = DOM_Node.getAttribute('data-' + attributeKey);
      }
    }

    return (_.isNull(value)) ? '' : value;
  }
  
}; 


});