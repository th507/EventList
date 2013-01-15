/* ex: set tabstop=2 softtabstop=2 shiftwidth=2 : */

describe("initilization", function() {
  var evt, evt_j, evt_s, evt_s2, evt_d, evt_db, evt_gebi, evt_singleton, evt_singleton_dup, evt_singleton_noscope, evt_singleton2;

  var that = this;

  beforeEach(function() {});

  afterEach(function() {
    evt = null;
    evt_j = null;
    evt_s = null;
    evt_s2 = null;
    evt_d = null;
    evt_gebi = null;
    that.evt_singleton_i = null;
    that.evt_singleton_noscope = null;
    evt_singleton_dup = null;
    evt_singleton_noscope = null;
    evt_singleton2 = null;
    EventList.destorySingleton();
  });

  it("calling without argument", function() {
    evt = new EventList();

    expect(evt).toBeDefined();
    expect(evt.getRootElement()).toEqual(document);
  });


  it("jQuery as element", function() {
    evt_j = new EventList($("#test-field"));
    
    expect(evt_j).toBeDefined();
    expect(evt_j.getRootElement()).toEqual(document.getElementById("test-field"));
  });

  it("String('document') as element", function() {
    evt_s = new EventList("document");
    
    expect(evt_s).toBeDefined();
    expect(evt_s.getRootElement()).toEqual(document);
  });

  it("Strin('#id') as element", function() {
    evt_s2 = new EventList("#test-field");
    
    expect(evt_s2).toBeDefined();
    expect(evt_s2.getRootElement()).toEqual(document.getElementById("test-field"));
  });

  it("document as element", function() {
    evt_d = new EventList(document);
    
    expect(evt_d).toBeDefined();
    expect(evt_d.getRootElement()).toEqual(document);
  });
  
  it("document.body as element", function() {
    evt_db = new EventList(document.body);
    
    expect(evt_db).toBeDefined();
    expect(evt_db.getRootElement()).toEqual(document.body);
  });

  it("getElementsByTagName as element", function() {
    evt_gebi = new EventList(document.getElementsByTagName("div"));
    
    expect(evt_gebi).toBeDefined();
    expect(evt_gebi.getRootElement()).toEqual(document.getElementById("test-field"));
  });

  it("singleton creation", function() {
    that.evt_singleton_i = new EventList(document, "evt_singleton_i", that);
    that.evt_singleton_i.x = "x";

    expect(that.evt_singleton_i).toBeDefined();

    expect(that).not.toEqual(window);
    expect(window.evt_singleton_i).toBeUndefined();

    expect(EventList.__registered__["document"]).toBeDefined();


  });

  it("singleton duplicate recognized when initializated", function() {
    that.evt_singleton_i = new EventList(document, "evt_singleton_i", that);
    that.evt_singleton_i.x = "x";

    evt_singleton_dup = new EventList(document);

    expect(evt_singleton_dup).toBeDefined();
    expect(evt_singleton_dup.x).toBeDefined();
  });

  it("singleton without scope", function() {
    evt_singleton_noscope = new EventList(document, "evt_singleton_noscope");

    expect(that.evt_singleton_noscope).toBeDefined();
    expect(EventList.__registered__["document"]).toBeDefined();
  });

 it("duplicated singleton with different scope", function() {
    this.evt_singleton2 = new EventList(document, "evt_singleton2", this);
   
    expect(this.evt_singleton2).toBeDefined();
    expect(EventList.__registered__["document"]).toBeDefined();
  });

  
});
