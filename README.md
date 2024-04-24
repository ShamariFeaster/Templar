TemplarJS
=========

TemplarJS is a state-of-the-art, on-demand HTML compiler and single page 
application (SPA)/Model-View-Whatever (MV*) framework.

TemplarJs really shines as a rapid prototyping framework. It allows for almost total
separation between the presentation layer and application layer. In practice this means 
that once your prototype is finished, you can migrate to another front-end framework 
with very little pain. Most of the TemplarJS-specific code in your HTML are 
in `data` attributes (that can be left in as they will be ignored) 
and handlebar template variables that are easy to search/remove. After that, you're left with clean 
markup that you can plug into any other framework you wish.

And because you application code just looks like regular JavaScript code, you don't have to 
throw that away either once protyping is complete. TemplarJS is really unique among SPA 
frameworks in this respect. It was designed very intentionally to be this way.

Getting a complex UI up-and-running is exceptionally fast with TemplarJS, as there is very 
little to learn: no crazy custom attributes, classes, programming paradigms. Just put 
your handlebar variables in your markup where you want things to be dynamic, operate 
on your models using plain old Javascript and TemplarJS will make your UI react.

I can pretty much guarantee you won't find a similar framework with a smaller learning curve. 
This does not mean that TemplarJS is not powerful. 

Main Features:
 - Tiny API
 - 2-way data binding
 - Routing
 - Route authorization/permissions
 - UI states
 - Create custom HTML tags
 - Create custom HTML attributes
 - Bind onload functions to loading of partial HTML files
 - Pure ECMAScript5, compatible back to IE9
 - Bult-in support of paging, sorting, and filtering

Installation
=========

1. Download the repo [here](https://github.com/ShamariFeaster/Templar/archive/master.zip)
2. Include `build/TemplarJS-0.11.min.js` as a script in an HTML file.

[Docs & Examples](https://shamari.crabdance.com/templar/demo/Basics/)

First Use
=========
TemplarJS is designed create SPA applications by bringing HTML templates to life using plain Javascript.

Create a file called `Model.js` and put the following in it.

```javascript
Templar.dataModel('Example',{
    banner : 'Hello World',
    items : [1,2,3]
});
```
Then create an HTML template and use that model to make the template 
dynamic

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <script src="TemplarJS-0.11.min.js"></script>
    <script src="Model.js"></script>
</head>
<body>
    <h1>{{Example.banner}}</h1>
    
    <br/>
    
    Which Number Do You Like?
    <select>{{Example.items}}</select>
    
    <br/>
    
    You Picked
    {{Example.items.current_selection}}
</body>
</html>
```
Change your model using plain javascript and the template will
react

```javascript
let exampleModel = Templar.getModel('Example');
exampleModel.banner = 'New Banner';
```

See more examples [here](https://shamari.crabdance.com/templar/demo/Basics/)

Inspiration:
=========
After looking at the sometimes overwhelming complexity of the APIs of other MV*/SPA frameworks, I decided that someone should
build a framework that was just as powerful, but that wouldn't take a computer science degree to learn.

I also didn't like how other frameworks baked in design patterns like controllers,
factories and services. I personally don't like being forced to use abstractions
that may not make sense for my application. 

TemplarJS was designed to give users all the power of the big name, modern MVW
frameworks, with a much flatter learning curve and more flexibility. There is no
"Templar" way. It's only your way.


Clean DOM
=========
Templar's compiler does not inject unecessary junk into your DOM. In fact the only 
element Templar injects into your DOM that wasn't there before are spans that wrap
variables bound to your data model.

No Expressions In Your View
=========
Templar view variables are only data. It is my belief that logic in
views is fundamentally antithetical to the separation of concerns that is the
basics for MV* architectures. Logic belongs in code, and markup is not code - it's
structured data. 

Write It Once, Templar Will Repeat It
=========
Templar will repeat a list item template once for every element in a list . You never have to use jQuery or any other library to 
construct DOM on the fly. You DOM will never be represented in JavaScript strings
again.

To bind a data model attribute to a repeat template (a div for example), simply add a `data-apl-repeat` 
attribute like so:

`<div data-apl-repeat="{{modelName.list}}"></div>`



Model Recognition Instead Of Directives
=========
Templar is smart enough to decipher what it *should* do just by where you placed the
data model attribute.

For example, use a proper `<select>` tag and put the
data model attribute as the `innerHTML`: 

`<sleect>{{modelName.attributeName}}</select>`

If `{{modelName.attributeName}}` is a list Templar will build the select using the elements of the list.

The advantage to this is two-fold:
- 1. It keeps your DOM clean of any Templar-specific markup
- 2. It's less to learn and rememeber

The principle of model recognition is used throughout Templar on other HTMLElement's that
typically serve as hosts for repeated data such as radio buttons and checkboxes.

2-Way Data binding
=========

Re-assigning your model attribute data will automatically update your view. Changes in your
view, like user input, are instantly reflected in your data model. Re-assinging a list that
is bound to your view will rebuild that list to reflect the new list items. Templar
takes care of all the DOM manipulation.

From the user's perspective, Templar makes both application data and the DOM the same thing;
so rather than listening to changes in the DOM, you use the Templar API to listen for changes to
a data model attribute.

For example, if you are listening to a data model attribute named 'Animals' that is bound to a 
`<select>` tag, to print out a end-user's selection do this:

```javascript
DataModelName.listen('Animals', function(e){
  console.log('The user selected: ' + e.value);
});
```

To programmatically change the currently selected option of a `<select>` tag bound to 'Animals' do
this:

`DataModelName.Animals.current_selection = 'Dog';`

As long as 'Dog' is in the 'Animals' list, the DOM will be updated to show 'Dog' as the selected 
option.

Page your data with a simple '++'
=========

All data model list attributes are annotated with a `page` and `limit` properties that you 
can use to implement instant pagination. 

For example, if you have a data model attribute `MyModel.myList` and it has 30 elements in it;
if you wanted to only show 5 at a time this is what you'd do:

`MyModel.myList.limit = 5;`

Now your view would immediately update to show only the first 5 elements. If you wanted to let
the user go through the pages, you could bind the following to a button press:

- `MyModel.myList.page++` to go to the next page
- `MyModel.myList.page--` to go to the previous page
- `MyModel.myList.page = 4` to go to the 4th page

Use Routes and UI States 
=========
To support SPAs, Templar allows you to use anchor links as routes. When a user navigates to a 
anchor link that is a recognized route Templar will compile and load that route's partial HTML files 
into the specified `<div>`s.

```javascript
Templar.Route([
/*This will compile/load into the defualt content div*/
{
    route : '#/route1',
    partial : 'partials/route1.html'
},
/*This will comile/load partial into specific div*/
{
    route : '#/route2',
    partial : 'partials/route2.html',
    target : '#some-div-id'
}];
```

A route can also be used to set model attribute data. This effectively functions as GET query parameters.

```javascript
Templar.Route([
/*This will compile/load route1.html */
/*then assigns whatever value is after "#/route1/"*/
/*to modelName.attribName*/
{
    route : '#/route1/modelName:attribName',
    partial : 'partials/route1.html'
}];
```

A route can also be composed of other routes (although there are some best practices to keep in
mind when doing this). 

UI states allow you to decompose a UI into loosely coupled, re-usable
components.

***Here's an example UI state:***

```javascript
Templar.Route([
{
  route : '#/main-layout',
  partial : 'partials/three-column-layout.html'
},
{
  route : '#/ad-search',
  partial : ['#/main-layout', 
    {
      partial : 'partials/Ad-Search/ad-list.html',
      target : '#layout-center-col'
    },
    {
      partial : 'partials/Ad-Search/ad-options-bar.html',
      target : '#layout-right-col'
    },        
    {
      partial : 'partials/main/sidebar.html',
      target : '#layout-left-col'
  }]
}];
```

This means that the various parts of you application's UI like the sidebar, navigation, and
main content area can be stored as separate partial HTML files. This makes for easier
maintenence and re-use of view components. 

For example if you are displaying the same list in multiple places, you can specify it as a 
component of multiple UI states as opposed to copying and pasting the list template mutliple places.

Also you can swap out different UI parts in a static grid depending on user context. For example, 
if a user is logged in you can show a profile pane in the top left of the page. When they log out, 
that same section can display a different partial HTML file (perhaps a login form). Once you configure 
your Route object (shown above) that complex UI action is automatic, depending on where/what 
your user clicks. A route, very easily, represents and present a specific combination of UI components 
to your users using nothing but a simple JavaScipt object and hash links.

Onload events
=========
You can specify and bind onload functions to the loading of routes or partial HTML files (which make 
up the components of routes), giving you a granular level of control. The handlers will not fire 
until all of a route or partial HTML file's content has been loaded, compiled, and, in the case of
repeated elements, built.

***Using the above UI state example:***

```javascript
Templar.success('partials/Ad-Search/ad-options-bar.html', function(){
//do stuff after options bar is compiled/loaded
});

```

Suppose I want to do stuff after ALL components are loaded. Then I bind to the success of the route itself (as opposed to it's individual components). Simply change the first argument to the above function to `'#/ad-search'` Templar guarantees all of `'#/ad-search'`s components are compiled/loaded before firing any onload bound to the route.

Authorization
=========
Before a UI state is shown, an assignable route authorization function is executed. This allows you
to restrict certain UI's (and hence certain data) to a desired subset of users. The authorization 
function is private and once initally set, it cannot be reset at run-time.

Custom HTML Tags
=========

Templar has the easiest API for creating custom HTML tags that the compiler will recognize and 
transform into whatever standard HTML you specify. 

**A Simple Example:**

Suppose you want to create a tag called `<row>` that will stack on top of each other like a table's
rows, but only using css.

***Here's the JavaScript:***

```javascript
Templar.component('row',{
  templateURL : 'path/to/the/template.html'
});
``` 

***Here's the template:***

```html
<style>
.row{
  /*css stuff......*/
}
</style>

<div class="row"> 
  <content></content>
</div>
```

Each custom tag (or component as they're called in Templar) template can have a single `<style>` tag
that Templar will inject. Be sure to use collision-resistant class names for your components as 
this is not implemented as the yet-to-be-standard Shadow DOM.

It should be noted that `<content>` tag of a template will be replaced with the `innerHTML` of a 
component during compilation.

**A More Complex Example: **

For a tag that has more complex behavior, Templar has a simple component lifecycle. 
`onCreate` and `onChange` functions for component attributes. This example is a stub of a component called an `OverlayButton`. This
component allows a user to specify a transparent image that will be overlayed on
top of a main image. The use case is an image that tells the user they can delete it by clicking 
it. It conveys this by overlaying a big red "X" on top of an image. 

***In use, the markup looks like:***

```html
<OverlayButton 
  overlay="image/icon/big-red-x.png"
  src="path-to-some-image.jpg">
</OverlayButton>
```

***Here's the component template markup:***

```html
<div class="container">
  <a>
  
    <div class="transcluded-text">
      <content></content>
    </div>
    
    <img src="" id="main-image"/>
    <img src="" id="overlay-image"/>
    
  </a>
<div>
```

Our template has two `<img>` tags: one for the main image and another for the overlay. We make the 
image clickable by wrapping both images in an `<a>` tag. 

In the component's JavaScript definition we can define its custom attributes and also the 
functions that control what happens when those attributes are changed at run-time.

```javascript
Templar.component('OverlayButton', {
  templateURL : 'path/to/the/template.html'
  attributes : {
  
    overlay : function(self, val){
      var overlay;
      if((overlay = self.querySelector('[id=overlay-image]')) != null){
        overlay.setAttribute('src', val);
      }
    },
    
    src : function(self, val){
      var main;
      if((main = self.querySelector('[id=main-image]') )!= null){
        main.setAttribute('src', val);
      }
    }
  },
  onCreate : function(self){
    /*Call both attribute's onChange functions*/
  }
});
```

So if you were to use jQuery.attr() or plain JavaScript's setAttribute() to set the `overlay` 
attribute to a different source, the function called `overlay` that is defined above would be called
and it would update the `src` attribute of the component's image tag.

I designed this process to be as close to native JavaScript as possible. there are no other options 
or complicated scoping or transclusion rules to remember. There may come a time when the limits of 
this simple approach are reached, but for now it's KISS all day.

Custom HTML Attributes
=========

You may want to add custom attributes to the HTMLElement's on your page, or even to your custom 
tags (components). This process is even more simple than creating a custom component. 

***Use Case***  
You want to create an attribute that controls anHTMLElement's visibility.

***The code:***

```javascript
Templar.attribute('showIf',{
  onChange : function(self, val){
    if(val === false || val == 'false' || parseInt(val) > 0){
      self.style.visibility = 'hidden';
    }else{
      self.style.visibility = '';
    }
  }
});
```

Now I can bind a data model attribute to the value of the `showIf` attribute on some element like so:

`<div showIf="{{DataModelName.isSignedIn}}">Welcome User</div>`

Now I can contorl the visibilty of this element by programmatically setting the value of 
`DataModelName.isSignedIn`. Using this attribute I've managed to keep logic out of my view and put 
it in code where it belongs. I've also built myself a re-usable tool for all of my projects.

As a side-note, notice that the `onChange` handler for `showIf` checks for a numerical value. I wrote
this in so I can bind to a list length and the element will only show if the list presently contains
elements like so:

```html
<h1 showIf="{{DataModelName.someList.length}}">
  Header That Should Be Invisble When No Elements In List
</h1>
```

Tiny API
=========

If you've made it this far, you've learned about 60% of Templar's API. I wasn't lying when I said it
was tiny. But don't mistake this smallness for weakness. Before I released it, I used Templar to 
construct a real live working site that can be seen [here](http://templar.bigfeastsoftware.com/).

With Templar, you will be able to be up anbd running at a professional level in a matter of hours or
days - not weeks or months. 

Plain Old JavaScript
=========

Even though ECMAScript 6 has finally been standarized, it will be a long time before the majority of 
end-user's browsers will fully support it. Because of this I constructed Templar in ECMAScript 5 with no external 
libraries, insuring it will work with old shitty browsers for years to come.

It has also been written and tested to work with Mozilla Firefox and, of course, Google Chrome. It has not been
tested in Safari, but I suspect it should work fine there.

State of the Project 
=========

I've reached a point where I need people to use and tell where they find bugs (AKA beta testing). Please submit 
any bug reports [here](https://github.com/ShamariFeaster/Templar/issues). 

Contributing
=========

This is my first major project; so I'm not all too sure how to build a community. Any help in that 
area would be appreciated.

I have a suite of regression tests written, but they are outdated as I have since re-wrote much of the compiler 
and caching logic. Refectoring those tests are the first thing on my list.

Next up on the testing front are performance and security testing. I could use help i those areas too.
If Templar is slower, I want to know it and we'll make it faster. If it uses more memory, we'll make it smarter
and more efficient.

Where Templar is (hopefully) Going
=========

I designed Templar to be useful as both a teaching tool and a serious, efficient application building
toolset. I hope that it can lower the barrier to entry for learning about thick client architectures.

My goal is to have a stable version by early 2016.

Thanks 
=========

Right now there's nobody but me, but I really hope that will change. 

**Developing and Building Project**

**To execute project and test any changes you make**

Put project in root of a local server
Start server
Navigate to <you server url and port>/Templar/demo/Dev/

This will execute the entire framework so you can open your browser dev console and
see debug out put and/or set breakpoints

**To build project into a compressed single file**

Put project in root of a local server
Start server
Navigate to <you server url and port>/Templar/lib/structureJS/pmi/structure-pm.html

use Templar\lib\structureJS\pmi\default-project-settings.js to fill in the form at top of page
click "Save Project"
Notice drop down next to "Load project" now shows "templar"
Click "Go" next to load project drop down
Click checkbox next to "Download Output:"
Click "Export Compressed Project"

**Uglify 3 Settings**

Located at Templar/lib/structureJS/Modules/options.js