$(document).ready(function(){
	var billSetCollection = Templar.getModel('billSetCollection');

	jQuery("#add-bill-set-btn").on("click", function(){
		var input = billSetCollection.input;
		if(input.length < 1)
			return;
		billSetCollection.items.push(new billSet(input, billSetCollection.items.length));
		billSetCollection.update('items');
		billSetCollection.input = "";
	});

	billSetCollection.listen('items', function(e){
		jQuery("#add-bill-btn").on("click", function(){
			var billSet = billSetCollection.items[$(this).attr("index") || 0];
			if(billSet.titleInput.length < 1 || billSet.amountInput.length < 1)
				return;
			billSet.items.push(new bill(billSet.titleInput, billSet.amountInput));
			billSetCollection.update('items');
			billSet.titleInput = "";
			billSet.amountInput = "";
		});
	});
});