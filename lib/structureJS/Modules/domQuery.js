structureJS.module({name : 'domQuery', 
                    description : 'Wrapper for jQuery-style DOM qeurying. The difference is' + 
                    'Once you get the node you operate directly on the node using Node & ' +
                    'Element inteface functions because they are faster and more efficient.' +
                    'See: https://developer.mozilla.org/en-US/docs/Web/API/element' + 
                         'https://developer.mozilla.org/en-US/docs/Web/API/Node'
                    
                    }, 
function(require){
  var _this = {};
  _this.nodeList = null;
  _this.nodeBuffer = null;

  function _clearNodeList(){
    _this.nodeList.length = 0;
  }
  
  function _getFirstMatch(selector, ctx){
    var node = null;
    if(selector.indexOf('.') > -1){
      /*class query*/
      node = ctx.querySelectorAll(selector);
      node = (node != null) ? node[0] : null;
    }else{
      /*id query*/
      node = ctx.querySelector(selector);
    }
    
    return node;
  }
  
  _this.query = function(idORClass, context){
      
      _this.ctx = context || document;
      _this.selector = idORClass;

      return _this;

    };
  /*Chain this to a query to get the raw Node obj*/
  _this.node = function(){
    var selector = _this.selector;
    var ctx = _this.ctx;
    return _getFirstMatch(selector, ctx);
  };
  
  /*Module Return*/
  return _this.query;
});