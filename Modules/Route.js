/*Non signature-based*/

function _isDef(a){return (typeof a !== 'undefined');}
function _log(a){console.log(a);}
function _isNull(a){return (a === null);}

var NON_TERMINAL = 0;
var TERMINAL = 1;
var NT_REGEX = /\w\:\w/;

/*must remove trailing slashes, and enforce leading slashes*/
function buildRouteTree(routes){
  var  routeObj = Object.create(null),
       ambiguityTree = Object.create(null),
       normalizedName = null,
       routePartName = '',
       tmp = null,
       tat = null,
       terminalBranchCreated = false,
       nonAmbiguousBranchCreated = false,
       lookahead = null,
       route = '',
       parts = null,
       thisPart = '',
       thisType = null,
       nextPart = null,
       nextType = null;
  

  for(var i = 0; i < routes.length; i++){

    parts = routes[i].route.trim().split('/'); 
    tmp = routeObj;
    tat = ambiguityTree;
    
    for(var x = 0; x < parts.length; x++){
      /*this nullifies no leading / or trailing /*/
      if(parts[x] == '')
        continue;

      routePartName = parts[x].toLowerCase();
      thisType = (NT_REGEX.test(parts[x])) ? NON_TERMINAL : TERMINAL;
      nextPart = (x+1 < parts.length) ? parts[x+1] : null;
      nextType = (!_isNull(nextPart)) ? 
        (NT_REGEX.test(nextPart)) ? NON_TERMINAL : TERMINAL : null;
        
      /*Basically we flatten the tree by normalizing NT names*/
      normalizedName = (NT_REGEX.test(parts[x])) ? 'NT' : routePartName;
      
      if(!_isDef(tmp[routePartName])){
        tmp[routePartName] = Object.create(null);
        tmp[routePartName].endOfChain = false;
        tmp[routePartName].lookaheadVal = (nextType == NON_TERMINAL) ? nextPart : '';
        tmp[routePartName].lookaheadType = nextType;
        terminalBranchCreated = true; 
      }
      /*Make parallel tree with NT names normalized so they don't spawn branches. */
      if(!_isDef(tat[normalizedName])){
        tat[normalizedName] = Object.create(null);
        nonAmbiguousBranchCreated = true;
      }
      
      
      tmp = tmp[routePartName];
      tat = tat[normalizedName];
      
      route = routes[i].route;
                   
    }

    /*we can get away with not creatin a new branch if pattern before us has same pattern but longer*/
    if(!terminalBranchCreated && tmp.endOfChain == true){
      throw 'Error: Duplicate Route "' + routes[i].route + '" Detected';
    }

    if(!nonAmbiguousBranchCreated && tmp.endOfChain == true){
      throw 'Error: Ambiguous Route "' + routes[i].route + '" Detected';
    }
    
    tmp.endOfChain = true;
    tmp.route = route;
    tmp.partial = routes[i].partial;
    terminalBranchCreated = false;
    nonAmbiguousBranchCreated = false;
  }
  _log(routeObj);
  return routeObj;
}

function resolveRoute(route, routeTree){
  var parts = route.trim().split('/'),
      nonTerminalValues = [],
      key = '',
      skipKeyAssignment = false;
  
  routePart = routeTree;
 
  for(var i = 0; i < parts.length; i++){
    
    if(parts[i] == '' || parts[i] == '#')
        continue;
        
    if(_isDef(routePart.lookaheadType) && routePart.lookaheadType == NON_TERMINAL){
      key = routePart.lookaheadVal;
    }else{
      key = parts[i].toLowerCase();
    }
    
    routePart = routePart[key];
    
    if(!_isDef(routePart))
      throw 'Error: Route "' + route + '" not found';

  }
  
  if(routePart.endOfChain == true)
    _log('Route matched: ' + route + ' with ' + routePart.route);
  else
    throw ' > Route "' + route + '" not found';
    
  _log(routePart);
  _log(nonTerminalValues);
}

(function(){
  var routes =    [{route : '/term2/w:e/z/', partial : 'partial.html'}];
  var nonMatch = '/TERM2/z/z';
  var routeTree = buildRouteTree(routes);
  resolveRoute(nonMatch, routeTree);
})();
