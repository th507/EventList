# EventList

EventList is a handy wrapper for event delegation. It is similar to `jQuery.live`, it builds on delegation rather than binding element to target element. EventList only works for event that **bubbles up** the DOM tree.


## Basic Usage (aka tl;dr)

### Initialization

	var foo = new EventList("#root-element");
	
or you could pass in a jQuery element 

	var foo = new EventList($("#root-element"));

or an element by selector
	
	var foo = new EventList(document.getElementById("root-element"));

	
### Adding listener for events

	foo.listen("click", {
		selector: "p",
		function() { this.fadeIn();}
	});

### Adding more listeners

	foo.listen("click", {
		selector: "div",
		function() { this.fadeIn();}
	});
	
or

	foo.click.listen("click", {
		selector: "p",
		function() { this.fadeIn();}
	});

### Disabling a delegate/all delegates

Disable a single delegate (still keeps delegate function)

	foo.click.disable("p");
	
Re-enable it by

	foo.click.enable("p");


Disable all delegates for an event (still listen for event but do nothing)

	foo.click.disableAll();
	
### Unlistening an event

This is equivalent to `removeEventListener`. This method just merely stops processing delegates, but does not remove actual delegates, `foo.click` still holds all delegates information.

	foo.unlisten("click");

or

	foo.click.unlisten()

### Removing all delegates and unlisten

This will call `foo.unlisten("click")`, then remove `foo.click` which holds all delegates information.

	foo.remove("click");

**Please see the following documentation for more details.**

----

# Documentation

The EventList needs to be instantiated for each root element you listen to. You could use multiple instances of EventList on a single page, or even on a single element (but doing this somewhat defeat the purpose of the event delegation).

Before going any further, we will need to understand a little bit about how the delegates are constructed and stored.


## Structure

The basic hiearchy of EventList is 

[EventList](#EventListObject) ▸ [DelegateList](#DelegateList) ▸ [delegates](#delegatesArray) ▸ [handler](#handler)

* The EventList object contains all the root element's `DelegateList` object, one for each eventType.
* The DelegateList object holds one `delegates` array and some additional information about this eventType.
* The delegates array contains multiple `handler`, one for each `selector`.
* The handler function handles the action of the target element defined by `selector`.
							

### [](id:EventListObject)EventList object

When instantiated, it returns an object containing all eventType you registered with EventList. 
A typical EventList instance looks like this

	EventList ---
				|- eventType: DelegateList object
				|- ...
				|- eventType: DelegateList object
				|
				|- __root__: (not enumerable)
				\- __rootSelector__: (optional, not enumerable)

Following JavaScript convention, all key begin with "__" is not enumerable, so if the browser supports enumerability, those "hidden" properties will not show up in for-in loop. They are used to store additional information (root element and selector string for the root element) about current instance of EventList. All hidden properties are intended for internal usage only. If you want to find out the rootElement or its selector, you should use these [public methods](#rootElement).

You could access the delegates of an eventType using dot syntax (like `foo.click`). Delegates for that eventType is stored in as the key-value pair.

### [](id:DelegateList)DelegateList object

A typical DelegateList object looks like this

	DelegateList ---
				   |- delegates: delegates array
				   |- disabled: (optional)
				   |- unlistened: (optional)
				   |
				   \- __event__: eventType

Like EventList object, it has some properties that are not enumerable.
If you want to find out the rootElement or its selector, you could those [public methods](#rootElement), they are identical to EventList's counterparts.

### [](id:delegatesArray)Delegates array

A typical delegates array looks like this
 
 		[
 			{ selector: "p",
 			  handler: function() {…}
 			},
 			{ selector: "#bar",
 			  handler: function([delegateList]) {…},
 			  disabled: false
 			}
		]
	
`selector` is a string for element matching. `elementFitsDescription` function is responsible for parsing `selector` string. It supports:

* \#id
* .class
* tag
* tag.class

If you'd like to extend `selector` capability, take a look and overwrite `elementFitsDescription`. You can overwrite 

Any delegate that goes into `EventList.listen` will be examined, if `selector` property is absent, this delegate will be ignored. So you could pass malformed delegate (like `null`, `{}`) in without raising errors.

`handler` is the delegate function for target element, in which `this` is pointed to the target element.

If `disabled` is set to true, `preventDefault()` is called on target element when eventType triggers.

Most of `EventList` methods are implemented in `delegateList`, such as[^polyfill]

* `listen`
* `disable`
* `enable`
* `getRootElement`
* `getRootElementSelector`

Calling them yields in identical effects as expected. For example (assuming `foo.click` is present), you could write

	foo.click.listen({…})

	foo.click.disable("p")

to add and/or disable delegates. 

### [](id:handler)Handler function

You could access the delegateList object in the handler, like

	{ 
	    selector: "#bar",
 	    handler : function([delegateList]) {
 	  	    // do something here
 	  }
 	}
 	
In the handler function, `this` is the DOM element that initiated the event. This is the same as  inline event registration model.
 	
### Accessing DelegateList and EventList object in handler function

If you are building complex event interactions, you might needs to switch other handler functions on and off. You could use `delegateList` in handler function to access the DelegateList object.
And using `delegateList.getEventList()` will return the EventList object in which the DelegateList object lies.

	{
	    selector: "#bar",
 	    handler : function(delegateList) {
 	    	// this is the DOM element that initiated the event
 	    	console.log(this);
 	    	
 	  	    // delegateList is referenced to its DelegateList object
 	  	    console.log(delegateList);
 	  	    
 	  	    // DelegateList.prototype.getEventList() returns 
 	  	    // the EventList object
 	  	    console.log(delegateList.getEventList());
 	  }
 	}


## Initialization

	var foo = new EventList(element[, singletonName, singletonScope])

Accepted types for `element`: 

* String[^string] as `querySelector` argument (Preferred),
* jQuery element (support singleton creation when `$(element).selector` is a string), 
* DOM Element[^element] (does **NOT** support singleton creation)

### [](id:singleton)Initialization as a singleton

Passing in singleton variable name and variable scope when instantiating `EventList` will make a singleton `EventList` for that particular root element.

	var singletonName = new EventList(element, singletonName, singletonScope);
	
`element` **MUST** be a string or a jQuery element for singleton to work.
	
`singletonName` should be the variable name at the left side of the `=`.

`singletonScope` is the scope of your variable. 

By default, it is set to the same scope as `EventList`. You really should specify `singletonScope`. Because when creating the singleton instance, it might not use the same scope as the `EventList`.

For example, if initialize `EventList` like this:
	
	var foo = new EventList("#article", "foo", this);
	
We'll create a singleton delegate for element `#article`. As usual, you could listen for click event using
	
	foo.listen("click", { 
		selector: "p"
		handler : function() { … }
	});
	
Then later, you forget you've already set up delegation for `#article`, and write

	var bar = new EventList("#article");

The `bar` is just like a pointer pointed to `foo`. Since it's a **two-way binding** between `foo` and `bar`, if additional delegates are added to `bar.click` by
	
	bar.listen("click", {…});

these delegates will appear in `foo.click`, and vice versa. Same goes for `unlisted`, `remove`, `disable`, `enable` methods.

When you are done with singletons, you should [destroy those singletons](#destroy).


## [](id:add)Adding listeners

	foo.listen(eventType[, delegates])

The eventType is validated on initialisation. If the eventType is not available for the element (for example `touchstart` on desktop browser), `EventListener` will throw an error.

The `delegates` can be omitted

	foo.listen(eventType);

If given, expected types for `delegates` are:

* Mutiple objects of delegates

* Array of delegates

For more detailed information about delegate object, please read about [Delegate array](#delegatesArray).

add (more) delegates

	foo.listen(eventType[, delegates]);
	
or if `foo[eventType]` is present

	foo[eventType].listen(delegates);
	
All delegates for a specific eventType are wrapped as an instance of `DelegateList`. All delegates of that eventType can be accessed at

	foo[eventType].delegates
	
as a simple array. 

In fact, you could simple push new delegates into the array and delegates are automatically registered. 

	foo[eventType].delegates.push({…});

But this is not recommended and does **NOT** play well with [singleton's two way binding](#singleton).


## Disabling/Enabling delegates

Disable a single delegate (does not remove delegate)

	foo.click.disable("p");
	
Re-enable it by

	foo.click.enable("p");
	
Calling `foo.click.disable("p")` sets `disabled: true` to object with selector that equals "p".

Since JavaScript passes object by reference, objects inside delegates array are, in fact, mere references of objects you passed in. If you listen to the same object for multiple eventTypes 

	var obj =  { 	
		selector: "p",
 		handler: function() {…}
	};
	
 	foo.listen("click", obj);
 	foo.listen("dblclick",obj);
 	
Afterwards, you disable this handler for foo.click with `foo.click.disable("p")`. Now, the same handler for double-click is also disabled. Sometimes it is the desirable behavior, sometimes it is not. If you do not like this behavior, you should [clone](http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-a-javascript-object) the object before listening.



Disable all delegates for an event (still listen for event but do nothing)

	foo.click.disableAll();


## Removing listeners

This is a clean sweep. It calls `unlisten` to remove listener, then **deletes** all delegates.

	foo.remove(eventType);
	
After this, `foo[eventType]` is deleted.


## [](id:destroy)Destroying singletons

You can destroy a singleton by
	
	EventList.destroySingleton(rootElementSelector);
	
or

	foo.destroySingleton(rootElementSelector);
	
If you want to destroy all previous singletons, you can use
	
	EventList.destroySingleton();


## [](id:rootElement)Get root element and its selector

You could get the root element by

	foo.getRootElement();

	
If `rootElementSelector` is available, you could get its selector with

	foo.getRootElementSelector();
	
These method are also implemented in DelegateList object, so you could use these

	foo.click.getRootElement();

and

	foo.click.getRootElementSelector();




[^element]: like `document`, `document.getElementsByTagName("div")[0]`

[^string]: like `"document"`, `"body"`

[^polyfill]: `unlisted` is not available for `DelegateList`, because its targeted is a particular eventType, not delegates.
