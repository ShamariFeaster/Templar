Templar.Route([
	{
		route: '#/home',
		partial: 'partials/home-info.html',
		target: '#target'
	}, {
		route: '#/about',
		partial: 'partials/about-info.html',
		target: '#target'
	}
]);


$(document).ready(function(){

  'use strict';
  
	var billSetCollection = Templar.getModel('billSetCollection');
  var BillSet = window.billSet;
  var Bill = window.bill;
  var Payer = window.payer;
  var $ = window.jQuery;
  
  function splitBill(payer, i, payersArray){
    if(this.billSet.total == 0){
      payer.balance = 0;
    }else{
      payer.balance = this.billSet.total/payersArray.length;
    }
  }
  
  Templar.success('partials/home-info.html', function(){
    $("#add-billset-btn").on("click", function(){
      var input = billSetCollection.input;  
      var newBillSet = null;
      var newPayer = null;
      
      if(input.length < 1){
        return;
      }
        
      newBillSet = new BillSet(input, billSetCollection.billSets.length);
      newPayer = new Payer("Payer " + parseInt(newBillSet.payers.length + 1));

      billSetCollection.billSets.push(new BillSet(input, billSetCollection.billSets.length));
      billSetCollection.update('billSets');
      billSetCollection.input = "";
    });
  });
	

	billSetCollection.listen('billSets', function(e){

    if(e.properties.length == 0 || e.properties.pop() == 'name'){
      $(".add-bill-btn").off('click');
      $(".add-new-payer").off('click');
      
      $(".add-bill-btn").on("click", function(){

        var billSet = billSetCollection.billSets[$(this).attr("index") || 0];
        
        if(billSet.titleInput.length < 1 || billSet.amountInput.length < 1)
          return;

        var newBill = new Bill(billSet.titleInput, billSet.amountInput);
        
        billSet.bills.push(newBill);
        billSet.total += Math.round(billSet.amountInput * 100) / 100;
        
        billSet.payers.forEach(splitBill.bind({billSet : billSet}));
        
        billSet.titleInput = "";
        billSet.amountInput = "";
        billSetCollection.update('billSets');
        
      });
      
      $(".add-new-payer").on("click", function(e){
        var billSet = billSetCollection.billSets[$(this).attr("index") || 0];
        var newPayer = new Payer("Payer " + (billSet.payers.length + 1));
        
        billSet.payers.push(newPayer);
        billSet.payers.forEach(splitBill.bind({billSet : billSet}));
        
        billSetCollection.update('billSets');
      });
    }
		
	});
});