/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 : */
/*globals describe, console, beforeEach, afterEach, EventList, it, expect */

describe("binding", function() {
  var obj =  {
    selector: "div",
    handler: function() {
      console.log("a");
    }
  };
  var evt, evt2, evt_mal, evt_del, evt_del_mal, evt_singleton, evt_dup, vitual;
  

  //beforeEach(function() {});

  afterEach(function() {
    evt = evt2 = evt_mal = evt_del = evt_del_mal = evt_singleton = evt_dup = vitual = null;
    EventList.destorySingleton();
  });

  it("EventList.listen without delegates", function() {
    evt = new EventList();
    evt.listen("click");

    expect(evt.click).toBeDefined();
    expect(evt.click.constructor.name).toEqual("DelegateList");
  });

  it("EventList.listen with proper delegates", function() {
    evt2 = new EventList();
    evt2.listen("click", obj);
    evt2.listen("click", obj, obj);
    evt2.listen("click", [obj]);
    evt2.listen("click", [obj,obj]);

    expect(evt2.click).toBeDefined();
    expect(evt2.click.delegates.length).toEqual(6);
    expect(evt2.click.delegates[0].selector).toEqual("div");
  });

  it("EventList.listen with mal-formed delegates", function() {
    evt_mal = new EventList();
    evt_mal.listen("click", null);
    evt_mal.listen("click");
    evt_mal.listen("click", []);
    evt_mal.listen("click", [{},{},"aaa"]);
    evt_mal.listen("click", {},{},"aaa");


    expect(evt_mal).toBeDefined();
    expect(evt_mal.click).toBeDefined();
    expect(evt_mal.click.delegates.length).toEqual(0);
  });

  it("DelegateList.listen with proper delegates", function() {
    evt_del = new EventList();
    evt_del.listen("click");
    evt_del.click.listen(null);
    evt_del.click.listen("aaa");
    evt_del.click.listen(null, "aaa");
    evt_del.click.listen(obj);
    evt_del.click.listen(obj,obj);
    evt_del.click.listen([obj,obj]);
    evt_del.click.listen([obj]);

    expect(evt_del).toBeDefined();
    expect(evt_del.click).toBeDefined();
    expect(evt_del.click.delegates.length).toEqual(6);
    expect(evt_del.click.delegates[0].selector).toEqual(obj.selector);
    expect(evt_del.click.delegates[0].handler).toEqual(obj.handler);
  });

  it("DelegateList.listen with mal-formed delegates", function() {
    evt_del_mal = new EventList();
    evt_del_mal.listen("click", []);
    evt_del_mal.listen("click", {},{},"aaa");

    expect(evt_del_mal).toBeDefined();
    expect(evt_del_mal.click).toBeDefined();
    expect(evt_del_mal.click.delegates.length).toEqual(0);
  });

  it("Singleton two-way binding with listen/unlisten", function() {
    vitual = {};
    evt_singleton = new EventList("body", "evt_singleton", vitual);
    evt_singleton.listen("click", obj);
    evt_singleton.listen("click", obj, obj);
    evt_singleton.listen("click", [obj, obj]);
    evt_singleton.listen("dblclick");
    evt_singleton.dblclick.listen(obj);
    evt_singleton.dblclick.disable("div");

    evt_dup = new EventList("body");
    evt_dup.dblclick.disableAll();


    expect(evt_singleton).toBeDefined();
    expect(evt_singleton.click).toBeDefined();
    expect(evt_singleton.click.delegates.length).toEqual(5);
    expect(evt_singleton.click.delegates[0].selector).toEqual(obj.selector);
    expect(evt_singleton.click.delegates[0].handler).toEqual(obj.handler);
    // not safe
    // we could add .disabled flag
    expect(evt_singleton.dblclick.delegates.length).toEqual(1);
    expect(evt_singleton.dblclick.delegates[0]).toEqual(obj);

    expect(evt_dup).toBeDefined();
    expect(evt_dup.click).toBeDefined();
    expect(evt_dup.dblclick.delegates.length).toEqual(1);
    expect(evt_dup.dblclick.delegates[0].selector).toEqual("div");
    expect(evt_dup.dblclick.delegates[0].disabled).toEqual(true);

    expect(evt_dup.dblclick.disabled).toEqual(true);
    expect(evt_singleton.dblclick.disabled).toEqual(true);
  });
});
