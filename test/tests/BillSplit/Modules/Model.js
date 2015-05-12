Templar.dataModel('billSetCollection',{
  items: [],
  input: "January Bills"
});

function billSet(title, index){
  this.items = [];
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