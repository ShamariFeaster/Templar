structureJS.module('JRDBIQuery', function(){
    
  function Query(sType){
    if(!(typeof this != Query))
      return new Query();
    this.statement = {
      action : (typeof sType !== 'undefined') ? sType : 'SELECT',
      data : [],
      conditions : []
    };

  }

  Query.prototype = {
    fields : function(oData){
      this.statement.data.push(oData);
      return this;
    },
    condition : function(Condition){
      var Condition = Condition || {};
      if(typeof Condition.prepositions != 'undefined'){
        this.statement.conditions = 
        this.statement.conditions
          .concat(Condition.prepositions)
          .map(function(cond){
            delete cond['__length__'];
            return cond;
          });
      }
      
      return this;
    },
    limit : function(iLimit){
      this.statement.conditions.push({_limit_ : iLimit});
      return this;
    },
    limitOffset : function(iOffset){
      this.statement.conditions.push({_limitOffset_ : iOffset});
      return this;
    },
    execute : function(){}/* @Override */
  };


  function Select(){Query.call(this, 'SELECT');}
  function Delete(){Query.call(this, 'DELETE');}
  function Insert(){Query.call(this, 'INSERT');}
  function Update(){Query.call(this, 'UPDATE');}
  
  function SelectAll(){
    Query.call(this, 'SELECT');
    var obj = {}; obj['*'] = true;
    this.statement.data.push(obj);
  }
  
  function DistinctSelect(){
    Query.call(this, 'SELECT');
    this.statement.conditions.push({_distinct_ : true});
  }
  

  Select.prototype = Object.create(Query.prototype);
  SelectAll.prototype = Object.create(Query.prototype);
  DistinctSelect.prototype = Object.create(Query.prototype);
  Delete.prototype = Object.create(Query.prototype);
  Insert.prototype = Object.create(Query.prototype);
  Update.prototype = Object.create(Query.prototype);

  return {
    Select : Select, SelectAll : SelectAll, DistinctSelect : DistinctSelect,
    Delete : Delete, Insert : Insert, Update : Update, Query : Query
  };
});