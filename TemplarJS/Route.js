structureJS.module('Route', function(require){

var _ = this,
    _routeTree = Object.create(null),
    State = require('State');

return {
  routeTree : Object.create(null),
  buildRouteTree : function(routes){
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
         nextType = null,
         target = '',
         partial = '';
  

    for(var i = 0; i < routes.length; i++){

      parts = routes[i].route.trim().split('/'); 
      target = routes[i].target;
      partial = routes[i].partial;
      tmp = routeObj;
      tat = ambiguityTree;
      
      for(var x = 0; x < parts.length; x++){
        /*this nullifies no leading / or trailing /*/
        if(parts[x] == '' || parts[x] == '#')
          continue;

        
        thisType = (_.NT_REGEX.test(parts[x])) ? _.NON_TERMINAL : _.TERMINAL;
        nextPart = (x+1 < parts.length) ? parts[x+1] : null;
        nextType = (!_.isNull(nextPart)) ? 
          (_.NT_REGEX.test(nextPart)) ? _.NON_TERMINAL : _.TERMINAL : null;
          
        routePartName = (thisType == _.NON_TERMINAL) ? parts[x] : parts[x].toLowerCase();  
        /*Basically we flatten the tree by normalizing NT names*/
        normalizedName = (_.NT_REGEX.test(parts[x])) ? 'NT' : routePartName;
        
        if(!_.isDef(tmp[routePartName])){
          tmp[routePartName] = Object.create(null);
          tmp[routePartName].endOfChain = false;
          tmp[routePartName].lookaheadVal = (nextType == _.NON_TERMINAL) ? nextPart : '';
          tmp[routePartName].lookaheadType = nextType;
          terminalBranchCreated = true; 
        }
        /*Make parallel tree with NT names normalized so they don't spawn branches. */
        if(!_.isDef(tat[normalizedName])){
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
      tmp.partial = (_.isDef(partial)) ? partial : '' ;
      tmp.target = (_.isDef(target)) ? target : '';
      terminalBranchCreated = false;
      nonAmbiguousBranchCreated = false;
    }
    
    this.routeTree = _routeTree = routeObj;
    State.hasDeclaredRoutes = true;
  
  },
  
  resolveRoute : function(route){
    var parts = route.trim().split('/'),
      nonTerminalValues = [],
      key = '',
      skipKeyAssignment = false;
  
    routePart = _routeTree;
   
    for(var i = 0; i < parts.length; i++){
      
      if(parts[i] == '' || parts[i] == '#')
          continue;
          
      if(_.isDef(routePart.lookaheadType) && routePart.lookaheadType == _.NON_TERMINAL){
        key = routePart.lookaheadVal;
        /*push NT key/value*/
        nonTerminalValues.push([key, parts[i]]);
      }else{
        key = parts[i].toLowerCase();
      }
      
      routePart = routePart[key];
      
      if(!_.isDef(routePart))
        throw 'Error: Route "' + route + '" not found';
    }
    
    if(routePart.endOfChain == true)
      _.log('Route matched: ' + route + ' with ' + routePart.route);
    else
      throw 'Route "' + route + '" was only a partial match of declared routes.';
    
    routePart.nonTerminalValues = nonTerminalValues;
    return routePart;
  }
  
};


});