structureJS.module('JRDBICondition', function(){
    
  function Condition(sColumn, sValue, oCompOp){
    if(!(this instanceof Condition))
      return new Condition(sColumn, sValue, oCompOp);
    this.oPreposition = { _op_ : oCompOp, _prep_ : 'AND', __length__ : 1};
    this.oPreposition[sColumn] = sValue;
    this.prepositions = [this.oPreposition];

  }

  Condition.prototype = {
    toString : function(){
      return this.prepositions;
    },
    extend : function(oFrom, oTo){
      var added = 0;
      for(var k in oFrom){
        if(oFrom.hasOwnProperty(k) && typeof oTo[k] == 'undefined'){
          oTo[k] = oFrom[k];
          added++;
        }
      }
      return added;
    },
    addPrep : function(oPreposition, sPrep){
      var oLastPrep, keys;
      oLastPrep = this.prepositions.pop();
      if(oLastPrep == null) return;

      /*detects a binary preposition and allows for setting and/or*/
      if(oLastPrep.__length__ == 1 && oPreposition.__length__ == 1 
        && oLastPrep._op_ == oPreposition._op_){    
        oLastPrep.__length__ += this.extend(oPreposition, oLastPrep);
        oLastPrep._prep_ = sPrep;
        this.prepositions.push(oLastPrep);
      }else /*extends current proposition*/
      if(oLastPrep._prep_ == sPrep && oLastPrep._op_ == oPreposition._op_){
        oLastPrep.__length__ += this.extend(oPreposition, oLastPrep);
        this.prepositions.push(oLastPrep);
      }else /*pushes new proposition, set interprop logic*/
      if(oLastPrep._prep_ != sPrep || oLastPrep._op_ != oPreposition._op_){
        oLastPrep._interPrep_ = sPrep;
        this.prepositions.push(oLastPrep);
        this.prepositions.push(oPreposition);
      }

    },
    
    build : function(Condition, sPrep){
      /*check if compound condition. if so, we only mutate the link between 'this' prep and the 1st
          in the chain. The rest chain has already been resolved so we just add it to 'this' chain*/
      for(var i = 0; i < Condition.prepositions.length; i++){
        if(i == 0)
          this.addPrep(Condition.prepositions[i], sPrep);
        else
          this.prepositions.push(Condition.prepositions[i]);
      }
      
    },
    
    and : function(Condition){
      this.build(Condition, 'AND');
      return this;
    },
    
    or : function(Condition){
      this.build(Condition, 'OR');
      return this;
    }
  }

  function EQ(){};function GTE(){};function GT(){};function LT(){};
  function LTE(){};function NE(){};function LIKE(){};

  EQ.prototype = Object.create(Condition.prototype);
  GTE.prototype = Object.create(Condition.prototype);
  GT.prototype = Object.create(Condition.prototype);
  LT.prototype = Object.create(Condition.prototype);
  LTE.prototype = Object.create(Condition.prototype);
  NE.prototype = Object.create(Condition.prototype);
  LIKE.prototype = Object.create(Condition.prototype);

  function EQ(sColumn, sValue){return Condition.call(this, sColumn, sValue, 'EQ' );}
  function GTE(sColumn, sValue){return Condition.call(this, sColumn, sValue, 'GTE' );}
  function GT(sColumn, sValue){return Condition.call(this, sColumn, sValue, 'GT' );}
  function LT(sColumn, sValue){return Condition.call(this, sColumn, sValue, 'LT' );}
  function LTE(sColumn, sValue){return Condition.call(this, sColumn, sValue, 'LTE' );}
  function NE(sColumn, sValue){return Condition.call(this, sColumn, sValue, 'NE' );}
  function LIKE(sColumn, sValue){return Condition.call(this, sColumn, sValue, 'LIKE' );}  

  return { 
    EQ : EQ, GTE : GTE, GT : GT, LT : LT, 
    LTE : LTE, NE : NE, LIKE : LIKE
    };

}); 