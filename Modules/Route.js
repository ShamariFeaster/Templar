function _isDef(a){return (typeof a !== 'undefined');}
function _isNull(a){return (a === null);}
function _log(a){console.log(a);}

function RouteNode(value, type, next){
    if(!(this instanceof RouteNode))
        return new RouteNode(value, next);
    this.value = _isDef(value) ? value : null;
    this.next = _isDef(next) ? next : null;
    this.type = _isDef(type) ? type : null;
    this.signature = '';
    this.partial = '';
    this.length = 0;
    this.route = '';
}


var route = '/term1/non:term1/term2';
var routeParts = route.split('/');
var routeMap = Object.create(null);
var NON_TERMINAL = 1;
var TERMINAL = 0;

function mapPattern(route, terminalSet){
    var ntRegex = /\w\:\w/,
        mappedVal = '',
        parts = route.trim().split('/').slice(1),
        retVal = Object.create(null);
    for(var i = 0; i < parts.length; i++){
        if(parts[i] == '') continue;
        mappedVal += (_isDef(terminalSet[parts[i]])) ? TERMINAL : NON_TERMINAL;
    }
    retVal.map = mappedVal;
    retVal.parts = parts;
    retVal.length = parts.length;
    return retVal;
}

function buildRouteLinkedList(route, partial){
    var next = null,
        ntRegex = /\w\:\w/,
        mappedVal ='',
        parent = new RouteNode(),
        lastNode = parent,
        thisNode = parent,
        partial = (_isDef(partial)) ? partial : '',
        parts = route.trim().split('/').slice(1),
        nonTerminals = [];

    for(var i = 0; i < parts.length; i++){
        mappedVal += (ntRegex.test(parts[i])) ? NON_TERMINAL : TERMINAL;
        thisNode  = new RouteNode(parts[i], mappedVal.charAt(i));
        if(thisNode.type == NON_TERMINAL)
            nonTerminals.push(thisNode.value.split(':'));
        
        lastNode = lastNode.next = thisNode;
    }
    parent = parent.next;
    parent.signature = mappedVal;
    parent.partial = partial;
    parent.length = parts.length;
    parent.route = route;
    parent.nonTerminals = nonTerminals;
   return parent;

}
/*must remove trailing slashes, and enforce leading slashes*/
function buildRouteTree(routes){
    var routeObj = {};
    var tmp = null;
    var routeNode = null;
    var parent = null;
    var branchCreated = false;
    routeObj.terminalSet = Object.create(null);
    for(var i = 0; i < routes.length; i++){
        routeNode = buildRouteLinkedList(routes[i].route, routes[i].partial);
        
        if(!_isDef(routeObj[routeNode.signature])){
            routeObj[routeNode.signature] = Object.create(null);
        }
        
        tmp = routeObj[routeNode.signature];
        parent = routeNode;
        do{
            delete tmp.parent;
            
            if(routeNode.type == TERMINAL){
                
                if(!_isDef(tmp[routeNode.value])){
                    tmp[routeNode.value] = Object.create(null);
                    branchCreated = true;
                }else{
                    tmp[routeNode.value] = tmp[routeNode.value];
                }
                routeObj.terminalSet[routeNode.value] = true;
                tmp = tmp[routeNode.value];
            }
            
            tmp.parent = parent;
            routeNode = routeNode.next;        
        }while(routeNode != null)
            if(!branchCreated){
                throw 'Error: Ambiguous Route "' + routes[i].route + '"';
            }
        branchCreated = false;
    }
    return routeObj;
}

function resolveRoute(route, routeTree){
    var routeObj = mapPattern(route, routeTree.terminalSet),
        routePart = routeTree[routeObj.map],
        nonTerminalValues = [];
    if(!_isDef(routePart))
        throw 'Error: Route "' + route + '" not found';
    
   
    for(var i = 0; i < routeObj.parts.length; i++){
        if(routeObj.map.charAt(i) == NON_TERMINAL){ 
            nonTerminalValues.push(routeObj.parts[i]);
            continue;
        }
        routePart = routePart[routeObj.parts[i]];
        if(!_isDef(routePart))
            throw 'Error: Route "' + route + '" not found';
    }
    _log('Route matched: ' + route);
    _log(routePart);
    _log(nonTerminalValues);
}



/*Non signature-based*/

function _isDef(a){return (typeof a !== 'undefined');}
function _log(a){console.log(a);}

function RouteNode(value, type, next){
    if(!(this instanceof RouteNode))
        return new RouteNode(value, next);
    this.value = _isDef(value) ? value : null;
    this.next = _isDef(next) ? next : null;
    this.type = _isDef(type) ? type : null;
    this.signature = '';
    this.partial = '';
    this.length = 0;
    this.route = '';
}


var route = '/term1/non:term1/term2';
var routeParts = route.split('/');
var routeMap = Object.create(null);
var NON_TERMINAL = 0;
var TERMINAL = 1;

function mapPattern(route, terminalSet){
    var ntRegex = /\w\:\w/,
        mappedVal = '',
        parts = route.trim().split('/').slice(1),
        retVal = Object.create(null);
    for(var i = 0; i < parts.length; i++){
        if(parts[i] == '') continue;
        mappedVal += (_isDef(terminalSet[parts[i]])) ? TERMINAL : NON_TERMINAL;
    }
    retVal.map = mappedVal;
    retVal.parts = parts;
    retVal.length = parts.length;
    return retVal;
}

function buildRouteLinkedList(route, partial){
    var next = null,
        ntRegex = /\w\:\w/,
        mappedVal ='',
        parent = new RouteNode(),
        lastNode = parent,
        thisNode = parent,
        partial = (_isDef(partial)) ? partial : '',
        parts = route.trim().split('/').slice(1),
        nonTerminals = [];

    for(var i = 0; i < parts.length; i++){
        mappedVal += (ntRegex.test(parts[i])) ? NON_TERMINAL : TERMINAL;
        thisNode  = new RouteNode(parts[i], parseInt(mappedVal.charAt(i)));
        if(thisNode.type == NON_TERMINAL)
            nonTerminals.push(thisNode.value.split(':'));
        
        lastNode = lastNode.next = thisNode;
    }
    parent = parent.next;
    parent.signature = mappedVal;
    parent.partial = partial;
    parent.length = parts.length;
    parent.route = route;
    parent.nonTerminals = nonTerminals;
   return parent;

}
/*must remove trailing slashes, and enforce leading slashes*/
function buildRouteTree(routes){
    var routeObj = {};
    var tmp = null;
    var routeNode = null;
    var parent = null;
    var branchCreated = false;
    var lookahead = null;

    for(var i = 0; i < routes.length; i++){
        routeNode = buildRouteLinkedList(routes[i].route, routes[i].partial);
                
        tmp = routeObj;
        parent = routeNode;
        do{
            delete tmp.parent;

                if(!_isDef(tmp[routeNode.value])){
                  tmp[routeNode.value] = Object.create(null);
                  tmp[routeNode.value].lookaheadType = routeNode.type;
                  branchCreated = true;
                }
                
                lookahead = (!_isNull(routeNode.next)) ? routeNode.next.type : tmp[routeNode.value].lookaheadType;
                tmp[routeNode.value].lookaheadType = tmp[routeNode.value].lookaheadType && lookahead; 
                
                if(!_isNull(routeNode.next) 
                  && tmp[routeNode.value].lookaheadType == NON_TERMINAL
                  && routeNode.next.type == NON_TERMINAL)
                  tmp[routeNode.value].lookaheadKey = routeNode.next.value;
                  
                tmp = tmp[routeNode.value];
            
            
            tmp.parent = parent;
            routeNode = routeNode.next;
                       
        }while(routeNode != null)
            if(!branchCreated){
                throw 'Error: Ambiguous Route "' + routes[i].route + '"';
            }
        branchCreated = false;
    }
    _log(routeObj);
    return routeObj;
}

function resolveRoute(route, routeTree){
    var parts = route.trim().split('/').slice(1),
        nonTerminalValues = [],
        key = '',
        skipKeyAssignment = false;
    
    routePart = routeTree;
   
    for(var i = 0; i < parts.length; i++){
    
      if(skipKeyAssignment){
        skipKeyAssignment = !skipKeyAssignment;
      }else{
        key = parts[i];
      }
      
      routePart = routePart[key];
      
      if(!_isDef(routePart))
        throw 'Error: Route "' + route + '" not found';
      /*take non-term paths first, if not there check lookaheads and take that path*/
      if(i + 1 < parts.length && !_isDef(routePart[parts[i+1]]) && routePart.lookaheadType == NON_TERMINAL){
        key = routePart.lookaheadKey;
        nonTerminalValues.push(parts[i+1]);
        skipKeyAssignment = true;
      }


    }
    _log('Route matched: ' + route);
    _log(routePart);
    _log(nonTerminalValues);
}
/*
var routes = [{route : '/term1/non:term1/term2', partial : 'partial1.html'}, 
          {route : '/term1',  partial : 'partial1.html'}, 
           {route : '/term2/non:term1/term3'},
          {route : '/term2/term3/non:term2', partial : 'partial3.html'}];
*/

(function(){
  var routes =    [{route : '/term2/term6'}, {route : '/term2/term6/term5'}];
  var nonMatch = '/term2/term6/term5';
  var routeTree = buildRouteTree(routes);
  resolveRoute(nonMatch, routeTree);
})();
