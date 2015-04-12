structureJS.module('JRDBI', function(require){
  var Collection = require('JRDBIQuery'),
      Config = require('Config'),
      _ = this,
      _$ = window.$;
  /* implement execute using jquery ajax */
  Collection.Query.prototype.execute = function(endPoint, success, fail){
    
    if(!_.isString(endPoint)) return;
    
    var query = this,
        url = Config.endpointRoot + endPoint + '.php',
        success = (_.isFunc(success)) ? success : function(){},
        fail = (_.isFunc(fail)) ? fail : 
                function(data){
                  _.log('ERROR: Query Failure.......');
                  _.log(data.error); 
                  _.log(this);
                };
    url = (Config.SERVER_DEBUG == true) ? url + '?XDEBUG_SESSION_START=name' : url;
    _$.ajax({
      url : url,
      method : 'POST',
      datatype : 'json',
      data : query.statement,
      success : function(data){
        if(data.error.length < 1){
          success.call(null, data);
        }else{
          fail.call(query, data);
        }

      },
      error : function(data){_.log(data);}
    });
    
    if(!(this instanceof Collection.SelectAll))
      query.statement.data.length = 0;
    query.statement.conditions.length = 0;
  };
  return { QueryCollection : Collection, Condition : require('JRDBICondition') };
});