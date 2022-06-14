var Todo;

Templar.dataModel('Todo',{
  items : [],
  mainInput : '',
  itemInput : '',
  activeCount : 0,
  indexBeingEdited : -1,
  currentFilter : 'all',
  filterButtons : [
    {_class : 'selected', label : 'All', by : 'all'},
    {_class : '', label : 'Active', by : 'active'},
    {_class : '', label : 'Completed', by : 'completed'}
    ]
});

function TodoItem(text, index){
  this.text = text;
  this.status = 'active';
  this.index = index;
  this.isVisible = true;
  this.editting = false;
  this.statusCheckbox = [''];
}

function stopEditting(){
  Todo.items = Todo.items.map(function(item){
    item.editting = false;
    return item;
  });
  Todo.indexBeingEdited = -1;
  Todo.itemInput = '';
}

function addItem(e){
  Todo.items.push(new TodoItem(Todo.mainInput, Todo.items.length));
  Todo.update('items');
}

function updateItem(){
  Todo.items[Todo.indexBeingEdited].text = Todo.itemInput;
  Todo.items[Todo.indexBeingEdited].editting = false;
  Todo.indexBeingEdited = -1;
  Todo.update('items');
}

function modifyItems(){
  if(Todo.indexBeingEdited > -1){
    updateItem();
  }else{
    addItem();
  }
}

function deleteItem(e){
  Todo.items.splice(e.currentTarget.getAttribute('index'),1);
  Todo.update('items');
}

function filter(e){
  /*We can explicitly call this or use it as an event handler*/
  var by;
  if(typeof e !== 'undefined'){
    by = Todo.currentFilter = e.currentTarget.getAttribute('by');
  }else{
    by = Todo.currentFilter;
  }

  /*Using selected filter to control item visibility*/
  Todo.items = Todo.items.map(function(item){
    item.isVisible = true;
    if(item.status != by){
      item.isVisible = false || (by == 'all');
    }
    return item;
  });
  
  /*Change which filter is currently selected*/
  Todo.filterButtons = Todo.filterButtons.map(function(filter){
    if(filter.by == by){
      filter._class = 'selected';
    }else{
      filter._class = '';
    }
    return filter;
  });

}

function editOnDblClick(e){
  var index = e.currentTarget.getAttribute('index');
  Todo.items[index].editting = true;
  Todo.indexBeingEdited = index;
  Todo.update('items');
  
  $('.modify-input').focus();
  $('.modify-input').blur(stopEditting);
}

/*Listen for 'enter' key presses to commit new todo item*/
document.onkeydown = function(e) {
  if (e.keyCode == '13') {
    modifyItems();
    filter();
  }
}

$(function(){
  
  Todo = Templar.getModel('Todo');
  
  /*This fires everytime Todo.items is updated either through Todo.update() or re-assignment*/
  Todo.listen('items',function(e){
    var activeCount = 0; 
    
    /*need to rebind b/c these repeated nodes are destroyed on each call to Todo.update()*/
    $('.delete-item').click(deleteItem);
    $('.todoText').dblclick(editOnDblClick);
    
    /*Since we're listening for changes to Todo.items, all data and DOM changes involving this data 
      model attribute, fire the handler. In the case of binding child properties to DOM elements
      , we can inspect {Array} event.properties. Notice in the view we bound a checkbox to the 
      'statusCheckbox' property of each element in Todo.items.*/
    if(e.properties.pop() == 'statusCheckbox'){
      var checkbox = e.target,
        index = e.properties.pop(),
        item = Todo.items[index]; 
      switch(item.status){
        case 'active':
          item.status = 'completed';
          break;
        case 'completed':
          item.status = 'active';
          break;
      }
      Todo.items[index] = item;
      Todo.update('items');
      
      /*re-filter because we've changed the active/completed state of out item list*/
      filter();
    }
    
    /*we could've directly incremented Todo.activeCount, but this would be unecessarily expensive.
      Each increment is treated as a re-assingment and would trigger a re-interpolation. Better to
      compute it using a local variable then perform a single re-assignment*/
    Todo.items.forEach(function(item){
      if(item.status == 'active') activeCount++;
    });
    
    Todo.activeCount = activeCount;
    
  });
  
  /*After Todo.filter's intial build this gets fired. Remember the DOM is not fully constructed until
    all out repeats are build. This also handles a situation where you change the filters at run-time.
    We would need to re-bind DOM listeners b/c the old DOM has been blown up by the repeat rebuilding.*/
  Todo.listen('filterButtons',function(e){
    $('.filter').click(filter);
  });
  
});