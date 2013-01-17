# EventList

EventList is a handy wrapper for event delegation. It is similar to `jQuery.live`, it builds on delegation rather than binding element to target element.

## Basic Usage (aka tl;dr)

### Initialization

	var foo = new EventList("#root-element");
	
or you could pass in a jQuery element 

	var foo = new EventList($("#root-element"))

	
### Adding listener for events

	foo.listen("click", {
		selector: "p",
		function() { this.fadeIn();}
	})

Alternative methods are available. See [here](#add).

### Disabling a delegate/all delegates

Disable a single delegate (does not remove delegate)

	foo.click.disable("p")
	
Re-enable it by

	foo.click.enable("p")


Disable all delegates for an event (still listen for event but do nothing)

	foo.click.disableAll()
	
### Unlistening an event

This is equivalent to `removeEventListener`. This method just merely stops processing delegates, but does not remove actual delegates, `foo.click` still holds all delegates information

	foo.unlisten("click")


or

	foo.click.unlisten()

### Removing all delegates and unlisten

This will call `foo.unlisten("click")`, then remove `foo.click` which holds all delegates information.

	foo.remove("click")

**Please see the following documentation for more details.**

----

# Documentation

## Structure

A typical `EventList` looks like this

	EventList ---
				|- eventType: delegateList
				|- ...
				|- eventType: delegateList
				|
				|- __root__: (not enumerable)
				\- __rootSelector__: (optional, not enumerable)

It's an object containing all eventType you registered with EventList. You could access any eventType using dot syntax (like `foo.click`).	
Delegates for a certain eventType is stored in as the key-value pair.

### [](id:delegateList)DelegateList object

A typical `DelegateList` looks like this

	delegateList ---
				   |- delegates: delegates array
				   |- disabled: (optional)
				   |- unlistened: (optional)
				   |
				   |- __event__: eventType
				   |- __root__: (not enumerable)
				   \- __rootSelector__: (optional, not enumerable)




### [](id:delegateList)DelegateList.delegates array

A typical `DelegateList.delegates` is an array that looks like this
 
 		[
 			{ selector: "a",
 			  handler: function() {…}
 			},
 			{ selector: "#bar",
 			  handler: function([delegates]) {...}
 			}
		]
	
`selector` is a string for element matching. `elementFitsDescription` function is responsible for parsing `selector` string. It supports:

* \#id
* .class
* tag
* tag.class

If you'd like to extend `selector` capability, take a look and overwrite `elementFitsDescription`.

Noted that any delegate passed into `EventList.listen` will be examined, if `selector` property is absent, this object will be ignored. So you could pass malformed object in without raising errors.

`handler` is the function for target element. In it, `this` is pointed to the target element.
	
Most of `EventList` methods are implemented in `delegateList`, such as[^polyfill]

* `listen`
* `disable`
* `enable`

Calling them yields in identical effects as expected. For example (assuming `foo.click` is present), you could write

	foo.click.listen({…})

	foo.click.disable("p")

to add and/or disable delegates.

### handler function


### accessing DelegateList/EventList object in handler

## Initialization

	var foo = new EventList(element[, singletonName, singletonScope])

Accepted types for `element`: 

* String[^string] as `querySelector` argument (Preferred),
* jQuery element (may **NOT** support singleton creation), 
* DOM Element[^element] (does **NOT** support singleton creation)

### [](id:singleton)Initialization as a singleton

Pass in singleton variable name and variable scope when instantiating `EventList` will make a singleton `EventList` for that specific element.

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
	})
	
Then later, you forget you've already set up delegation for `#article`, and write

	var bar = new EventList("#article")

The `bar` is just like a pointer pointed to `foo`. Since it's a **two-way binding** between `foo` and `bar`, if additional delegates are added to `bar.click` by
	
	bar.listen("click", {…})

these delegates will appear in `foo.click`, and vice versa. Same goes for `unlisted`, `remove`, `disable`, `enable` methods.



## [](id:add)Adding listener


	foo.listen(eventType[, delegates])

The eventType is validated on initialisation. If the eventType is not available for the element (for example `touchstart` on desktop browser), `EventListener` will throw an error.

The `delegates` can be omitted

	foo.listen(eventType)

If given, expected types for `delegates` are:

* Mutiple delegate objects

* Array of delegate object

For more detailed information about delegate object, please read the next section: [Delegate object](#delegateList).

add (more) delegates

	foo.listen(eventType[, delegates])
	
or if `foo[eventType]` is present

	foo[eventType].listen(delegates)
	
All delegates for a specific eventType are wrapped as an instance of [`delegateList`](#delegateList). All delegates of that eventType can be accessed at

	foo[eventType].delegates
	
as a simple array. 

In fact, you could simple push new delegates into the array and delegates are automatically registered. 

	foo[eventType].delegates.push({...})

But this is not recommended and does **NOT** play well with [singleton's two way binding](#singleton).




## Disabling/Enabling delegates

Disable a single delegate (does not remove delegate)

	foo.click.disable("p")
	
Re-enable it by

	foo.click.enable("p")


Disable all delegates for an event (still listen for event but do nothing)

	foo.click.disableAll()


## Removing listener

This is a clean sweep. It calls `unlisten` to remove listener, then **deletes** all delegates.

	foo.remove(eventType)
	
After this, `foo[eventType]` is deleted.


[^element]: like `document`, `document.getElementsByTagName("div")[0]`

[^string]: like `"document"`, `"body"`

[^polyfill]: `unlisted` is not available for `delegateList`, because its targeted is a particular eventType, not delegates.
