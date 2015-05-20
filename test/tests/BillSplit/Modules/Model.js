Templar.dataModel('billSetCollection',{
  billSets: [],
  input: ""
});

function billSet(title, index){
  this.bills = [];
  this.payers = [];
  this.title = title;
  this.index = index;
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