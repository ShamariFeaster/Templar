$(document).ready(function(){
	var billSetCollection = Templar.getModel('billSetCollection');

	jQuery("#add-bill-set-btn").on("click", function(){
		var input = billSetCollection.input;
		if(input.length < 1)
			return;
		/*

		why can't i do this?

		var billSet = new billSet(input, billSetCollection.billSets.length);
		var payer = new payer("Payer " + billSet.payers.length+1);
		billSet.payers.push(payer);*/
		
		billSetCollection.billSets.push(new billSet(input, billSetCollection.billSets.length));
		billSetCollection.update('billSets');
		billSetCollection.input = "";
	});

	billSetCollection.listen('billSets', function(e){
    /*
      Problem : multiple onclick bindings
      
      Solution: 'if(e.properties.length == 0){...'
      
      Explaination:
      Prevents unwanted re-binding of the click listener. This 'billSet' listener will fire
      everytime a billSet or any bound sub-properties (such as 'billSetCollection.billSets[x].titleInput') 
      is modified. In this case you bound 'billSetCollection.billSets[x].titleInput' to an input. 
      Everytime a user types in that input box, all listeners bound to the model attribute for which
      'titleInput' is a sub-property (in this case 'billSets') will fire. Basically the precision of
      a model attribute listener is at the attribute level. Any increased granularity is up to the 
      user to filter out using the array 'e.properties'.

      We only want to bind click listeners when the 'billSet' array itself has been modified.
      In this case, the 'e.properties' array will be empty. In the case of the titleInput sub-prop
      changing 'e.properties' would equal ['0', 'titleInput']. The '0' is the index of the billSet 
      whose titleInput is being changed, so valid values are [0-9]+  */
      
    if(e.properties.length == 0){
      
      jQuery(".add-bill-btn").on("click", function(){

        var billSet = billSetCollection.billSets[$(this).attr("index") || 0];
        if(billSet.titleInput.length < 1 || billSet.amountInput.length < 1)
          return;
        /*the call to the bill() was failing b/c the bill constructor is bound to the global window
          object. Normally if 'bill' wasn't found in the current context, the interpreter will clinb up
          the scope chain looking for it. The root of the scope chain is the window object. There are 
          several ways you could fail to get access to an implicit global reference (ie. a reference
          not made explicitly on 'window' like 'window.bill'):
          
          1. if the surrounding context is in 'strict mode' then the scope chain stops with the current
          block, denying access to the global window object. 
          
          2. if the variable has been aliased in the current scope but is not what you're expecting.
          This is what's happening here. You've redeclared 'bill' locally. At the time of the constructor
          call, bill is an undefined local variable. 
          */
          
        //Broken code: 
        //var bill = new bill(billSet.titleInput, billSet.amountInput);
        
        //fixed code
        var newBill = new bill(billSet.titleInput, billSet.amountInput);
        billSet.bills.push(newBill);
        billSet.total += Math.round(billSet.amountInput * 100) / 100;
        billSet.titleInput = "";
        billSet.amountInput = "";
        billSetCollection.update('billSets');
      });
      
      jQuery(".add-new-payer").on("click", function(e){
        billSetCollection.billSets[$(this).attr("index") || 0].payers.push(new payer("Payer"));
        billSetCollection.update('billSets');
      });
    }
		
	});
});