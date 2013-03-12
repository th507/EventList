/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 : */
/*globals describe, console, beforeEach, afterEach, EventList, it, expect */
describe("utilities", function() {
  var that = this;
  var evt, evt_singleton, evt_dup, obj = {
    selector: "div",
    handler: function() {
      console.log("a");
    }
  },
  obj2 = {
    selector: "div",
    handler: function() {
      console.log("a");
    }
  };

  beforeEach(function() {

  });

  afterEach(function() {
    evt = evt_singleton = evt_dup = null;
    EventList.destorySingleton();
  });

  // FIXME: big problem
  // if we pass the same object to multiple eventType
  // or to the same eventType multiple times
  // then when we later decide to disable it
  // it will disable all object in the same EventList
 it("DelegatesList disable", function() {
    evt = new EventList();
    evt.listen("click", obj, obj);
    evt.click.disable("div");

    evt.listen("dblclick", obj, obj2);

    expect(evt).toBeDefined();
    expect(evt.click.delegates.length).toEqual(2);
    expect(evt.click.delegates[0].disabled).toEqual(true);
    expect(evt.click.delegates[1].disabled).toEqual(true);

    expect(evt.dblclick).toBeDefined();
    expect(evt.dblclick.delegates[0].disabled).toEqual(true);
    expect(evt.dblclick.delegates[1].disabled).toBeUndefined();
  });

  it("DelegatesList enable", function() {
    evt = new EventList();
    evt.listen("click", obj, obj);
    evt.click.disable("div");

    expect(evt).toBeDefined();
    expect(evt.click.delegates.length).toEqual(2);
    expect(evt.click.delegates[0].disabled).toEqual(true);
    expect(evt.click.delegates[1].disabled).toEqual(true);

    evt.click.enable("div");

    expect(evt.click.delegates[0].disabled).toEqual(false);
    expect(evt.click.delegates[1].disabled).toEqual(false);

  });

  it("DelegatesList disableAll", function() {
    evt = new EventList();
    evt.listen("click", obj, obj);
    evt.click.disableAll();

    expect(evt).toBeDefined();
    expect(evt.click).toBeDefined();
    expect(evt.click.disabled).toEqual(true);
  
  });

  it("DelegatesList enableAll", function() {
    evt = new EventList();
    evt.listen("click", obj, obj);
    evt.click.disableAll();

    expect(evt).toBeDefined();
    expect(evt.click).toBeDefined();
    expect(evt.click.disabled).toEqual(true);

    evt.click.enableAll();
    expect(evt.click.disabled).toEqual(false);
  });

  it("DelegatesList disable/enable for singleton", function() {
    var evt_singleton = new EventList("document", "evt_singleton", that);
    evt_singleton.listen("click", obj);
    evt_singleton.click.disable("div");

    expect(evt_singleton).toBeDefined();
    expect(evt_singleton.click).toBeDefined();
    expect(evt_singleton.click.delegates[0].disabled).toEqual(true);

    evt_singleton.click.enable("div");


    evt_dup = new EventList();
    evt_dup.click.disable("div");

    expect(evt_dup.click).toBeDefined();
    expect(evt_dup.click.delegates[0].disabled).toEqual(true);
    expect(evt_singleton.click.delegates[0].disabled).toEqual(true);

    evt_dup.click.enable("div");
    expect(evt_dup.click.delegates[0].disabled).toEqual(false);
    expect(that.evt_singleton.click.delegates[0].disabled).toEqual(false);
  });

  it("DelegatesList disableAll/enableAll for singleton", function() {
    var tmp = new EventList("document", "evt_singleton", that);
    that.evt_singleton.listen("click", obj);
    that.evt_singleton.click.disableAll();

    expect(that.evt_singleton.click.disabled).toEqual(true);


    that.evt_singleton.click.enableAll();

    expect(that.evt_singleton.click.disabled).toEqual(false);
  });


  it("EventList disable", function() {
    evt = new EventList();
    evt.listen("click", obj, obj);
    evt.disable("click");

    expect(evt).toBeDefined();
    expect(evt.click).toBeDefined();
    expect(evt.click.disabled).toEqual(true);
  
  });

  it("EventList enable", function() {
    evt = new EventList();
    evt.listen("click", obj, obj);
    evt.disable("click");

    expect(evt).toBeDefined();
    expect(evt.click).toBeDefined();
    expect(evt.click.disabled).toEqual(true);

    evt.enable("click");
    expect(evt.click.disabled).toEqual(false);
  });

  it("EventList disable/enable for singleton", function() {
    var tmp = new EventList("document", "evt_singleton", that);
    that.evt_singleton.listen("click", obj);
    that.evt_singleton.disable("click");


    expect(that.evt_singleton.click.disabled).toEqual(true);

    that.evt_singleton.enable("click");

    expect(that.evt_singleton.click.disabled).toEqual(false);
    
  });

  it("EventList disableAll/enableAll for singleton", function() {
    var tmp = new EventList("document", "evt_singleton", that);
    that.evt_singleton.listen("click", obj);


    expect(that.evt_singleton).toBeDefined();
    expect(that.evt_singleton.click).toBeDefined();
  });

  it("DelegatesList getRootElement", function() {
    evt = new EventList();
    evt.listen("click", obj);
    evt.disable("click");

    expect(evt.click.getRootElement()).toEqual(document);
  });

  it("EventList getRootElement", function() {
    evt = new EventList();
    evt.listen("click", obj);
    evt.disable("click");

    expect(evt.getRootElement()).toEqual(document);
  });
});
