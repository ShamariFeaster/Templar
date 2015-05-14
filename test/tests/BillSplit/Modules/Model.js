Templar.dataModel('billSetCollection',{
  billSets: [],
  input: "January Bills"
});

function billSet(title, index){
  this.bills = [];
  this.payers = [{"name": "Payer 1", "balance": 0}];
  this.title = title;
  this.index = index;
  this.splitBy = 1;
  this.total = 0;
  this.isVisible = true;
  this.titleInput = "";
  this.amountInput = "";
}

function bill(title, amount, index){
  this.title = title || "";
  this.amount = amount || 0;
  this.index = index;
  this.isVisible = true;
}

function payer(name){
  this.name = name;
  this.balance = 0;
}