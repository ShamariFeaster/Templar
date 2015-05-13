window.structureJS.module('Route', function(require){
'use strict';

var _ = this;
var _routeTree = {};
var _routeObjArray = [];
var _authorizationSet = false;
var _authorizationFunc = function(){ return true;};
var _authenticatorSet = false;
var _authenticatorFunc = function(){ return true;};
var _deAuthenticatorSet = false;
var _deAuthenticatorFunc = function(){ return true;};
var _clientCookie = (_.isDef(window.Storage)) ? sessionStorage : {};
var State = require('State');
var DOM = require('DOM');
var Map = require('Map');
var Interpolate = require('Interpolate');
var Bootstrap = require('Bootstrap');

return {
  routeTree : {},
  buildRouteTree : function(routes){
    var routeObj = {};
    var ambiguityTree = {};
    var normalizedName = null;
    var routePartName = '';
    var tmp = null;
    var tat = null;
    var terminalBranchCreated = false;
    var nonAmbiguousBranchCreated = false;

    var route = null;
    var parts = null;

    var thisType = null;
    var nextPart = null;
    var nextType = null;
    var target = '';
    var partial = '';
    var fallback = '';
  

    for(var i = 0; i < routes.length; i++){
      _routeObjArray.push(routes[i]);
      parts = routes[i].route.trim().split('/'); 
      target = routes[i].target;
      partial = routes[i].partial;
      fallback = routes[i].fallback;
      tmp = routeObj;
      tat = ambiguityTree;
      
      for(var x = 0; x < parts.length; x++){
        
        /*this nullifies no leading / or trailing /*/
        if(parts[x] === '' || parts[x] == '#'){
          continue;
        }

        
        thisType = (_.NT_REGEX.test(parts[x])) ? _.NON_TERMINAL : _.TERMINAL;
        nextPart = (x+1 < parts.length) ? parts[x+1] : null;
        nextType = (!_.isNull(nextPart)) ? 
          (_.NT_REGEX.test(nextPart)) ? _.NON_TERMINAL : _.TERMINAL : null;
        /*To keep resolution effient we constrain routes with 2 subsequent NTs. The
          alternative is depth-first traversal w/ backtracking until we find a match.
          This would defeat the purpose of the algo*/
        if(thisType == _.NON_TERMINAL && nextType == _.NON_TERMINAL){
          throw 'ERROR: Route Contains two consecutive variables.';
        }  
        routePartName = (thisType == _.NON_TERMINAL) ? parts[x] : parts[x].toLowerCase();  
        /*Basically we flatten the tree by normalizing NT names*/
        normalizedName = (_.NT_REGEX.test(parts[x])) ? 'NT' : routePartName;
        
        if(!_.isDef(tmp[routePartName])){
          tmp[routePartName] = {};
          tmp[routePartName].endOfChain = false;
          tmp[routePartName].thisVal = routePartName;
          tmp[routePartName].thisType = thisType;
          terminalBranchCreated = true; 
        }
        /*New, longer routes may add lookaheads, by taking this out of the above block,
          we allow for this.*/
        tmp[routePartName].lookaheadVal = (nextType == _.NON_TERMINAL) ? nextPart : '';
        tmp[routePartName].lookaheadType = nextType;
        
        /*Make parallel tree with NT names normalized so they don't spawn branches. */
        if(!_.isDef(tat[normalizedName])){
          tat[normalizedName] = {};
          nonAmbiguousBranchCreated = true;
        }
        
        tmp = tmp[routePartName];
                
        tat = tat[normalizedName];

        route = routes[i].route;
                     
      }

      /*we can get away with not creatin a new branch if pattern before us has same pattern but longer*/
      if(!terminalBranchCreated && tmp.endOfChain === true){
        throw 'Error: Duplicate Route "' + routes[i].route + '" Detected';
      }

      if(!nonAmbiguousBranchCreated){
        throw 'Error: Ambiguous Route "' + routes[i].route + '" Detected';
      }
      
      tmp.endOfChain = true;
      tmp.route = route;
      tmp.partial = (_.isDef(partial)) ? partial : '' ;
      tmp.target = (_.isDef(target)) ? target : '';
      tmp.fallback = (_.isDef(fallback)) ? fallback : '';
      terminalBranchCreated = false;
      nonAmbiguousBranchCreated = false;
    }
    
    this.routeTree = _routeTree = routeObj;
    State.hasDeclaredRoutes = true;
  
  },
  addRoute : function(routeObj){
    _routeObjArray.push(routeObj);
    this.buildRouteTree(_routeObjArray);
  },
  resolveRoute : function(route){
    var parts = route.trim().split('/');
    var nonTerminalValues = [];
    var key = '';

    var routePart = _routeTree;
   
    for(var i = 0; i < parts.length; i++){
      
      if(parts[i] === '' || parts[i] == '#'){
        continue;
      }
          
      if(_.isDef(routePart.lookaheadType) && routePart.lookaheadType == _.NON_TERMINAL){
        key = routePart.lookaheadVal;
        /*push NT key/value*/
        nonTerminalValues.push([key, parts[i]]);
      }else{
        key = parts[i].toLowerCase();
      }
      
      routePart = routePart[key];
      
      if(!_.isDef(routePart)){
        throw 'Error: Route "' + route + '" not found';
      }
      
    }
    
    if(routePart.endOfChain === true){
      _.log('Route matched: ' + route + ' with ' + routePart.route);
    }else{
      throw 'Route "' + route + '" was only a partial match of declared routes.';
    }
    
    routePart.nonTerminalValues = nonTerminalValues;
    return routePart;
  },
  setAuthenticator : function(func){
    if(_authenticatorSet === false){
      if(_.isFunc(func)){
        _authenticatorFunc = func;
      }
      _authenticatorSet = true;
    }else{
      _.log('ERROR: Authenticator already set');
    }
  },
  
  setDeAuthenticator : function(func){
    if(_deAuthenticatorSet === false){
      if(_.isFunc(func)){
        _deAuthenticatorFunc = func;
      }
      _authenticatorSet = true;
    }else{
      _.log('ERROR: DeAuthenticator already set');
    }
  },
  
  setAuthorizer : function(func){
    if(_authorizationSet === false){
      if(_.isFunc(func)){
        _authorizationFunc = func;
      }
      _authorizationSet = true;
    }else{
      _.log('ERROR: Authenticator already set');
    }
  },
  /*Authorizer function has access to object which acts as a cookie w/ session
    persistence. It should not be readible/writable to any other context and should
    not be stealible - it remeains to be seen whether or not this is true.
    
    authorize() is public and is used to set authorization and check it (on route switch)
    */
  authorize : function(data){
    return _authorizationFunc.call(_clientCookie, data);
  },
  
  authenticate : function(data){
    return _authenticatorFunc.call(_clientCookie, data);
  },
  
  logout : function(data){
    return _deAuthenticatorFunc.call(_clientCookie, data);
  },
  
  /*need de-authenticator function too*/
  handleRoute : function(url){
    var href = DOM.getHashValue(url);
    var resolvedRouteObject = null;
    var NTDirectives = null;
    var modelParts = null;
    var Route = this;
    if(State.hasDeclaredRoutes === true){
      try{
        if(this.authorize.call(_clientCookie, {route : href}) === true){
          resolvedRouteObject = Route.resolveRoute(href);
          resolvedRouteObject.target = (!_.isNullOrEmpty(resolvedRouteObject.target)) ? 
                            resolvedRouteObject.target : _.MAIN_CONTENT_ID;
          NTDirectives = resolvedRouteObject.nonTerminalValues;
          /*TODO: support advanced derefencing to support a.b.current_selection and the like. Would 
            require an upgraded setAttribute.
            I can accomplish this by:
            1. Calling Compile.getTokens(NTDirectives[i][0].replace(':','.'), true)
            2. passing token to Map.setAttributeWithToken(tokens[0], NTDirectives[i][1])
            */
          for(var i = 0; i < NTDirectives.length; i++){
            modelParts = NTDirectives[i][0].split(':');
            Map.setAttribute(modelParts[0], modelParts[1], NTDirectives[i][1]);
            Interpolate.interpolate(modelParts[0], modelParts[1], NTDirectives[i][1] );
          }
        }else{
          resolvedRouteObject = _.RESTRICTED;
          throw 'User not authorized for url: ' + url;
        }
        
        
      }catch(e){
        _.log(e);
      }
    }    
    
    
    return resolvedRouteObject;
  },
  /* Opens route */
  open : function(routeId){
    var resolvedRouteObj = null;
    if(_.isNotNull(resolvedRouteObj = this.handleRoute(routeId)) && resolvedRouteObj !== _.RESTRICTED){

      DOM.asynFetchRoutes(resolvedRouteObj, function(){
        State.ignoreHashChange = true;
        var endIndex, href = window.location.href;
        /*look for existing route anchors and remove them*/
        if( (endIndex = href.indexOf('#')) > -1 ){
          href = window.location.href.slice(0, endIndex);
        }

        window.location.href = href + resolvedRouteObj.route;
      });
     
    }

  },
  
  openPartial : function(partialUri, targetId){
    targetId = (_.isDef(targetId)) ? targetId : _.MAIN_CONTENT_ID;
    if(!_.isNullOrEmpty(partialUri)){
      DOM.asynGetPartial(partialUri, Bootstrap.loadPartialIntoTemplate, targetId);
    }
  },
  
  isRoute : function(url){
      
    var isRoute = false;
    for(var i = 0 ; i < _routeObjArray.length; i++){
      if(_routeObjArray[i].route == url){
        isRoute = true;
      }
    }
    return isRoute;
  },
  
  getRouteObj : function(url){
    var obj = null;
    for(var i = 0 ; i < _routeObjArray.length; i++){
      if(_routeObjArray[i].route == url){
        obj = _routeObjArray[i];
      }
    }
    return obj;
  },
  
  deferenceNestedRoutes : function(inArr, outArr){
    var routeName = null;
    var routeObj = '';
    var isRoute;
    var isString;
    
    /*by value b/c we need the partial array for subsequent calls to 
      DOM.asynFetchRoutes(). We can't consume it so we use the value.*/
    inArr = inArr.slice(0);
    
    while(_.isNotNull(routeName = inArr.shift())){
    
      if((isString = _.isString(routeName)) && (isRoute = this.isRoute(routeName))){
        routeObj = this.getRouteObj(routeName);
        if(_.isArray(routeObj.partial)){
          this.deferenceNestedRoutes(routeObj.partial, outArr);
        }else{
          outArr.push(routeObj);
        }
      /* in-line route obj */
      }else if(!isString){
        outArr.push(routeName);
      /* partial w/ implicit target */
      }else{
        outArr.push({partial : routeName, target : _.MAIN_CONTENT_ID});
      }
      
    }
    
  }
  
};


});