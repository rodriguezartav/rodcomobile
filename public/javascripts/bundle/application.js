
(function(/*! Stitch !*/) {
  if (!this.require) {
    var modules = {}, cache = {}, require = function(name, root) {
      var module = cache[name], path = expand(root, name), fn;
      if (module) {
        return module;
      } else if (fn = modules[path] || modules[path = expand(path, './index')]) {
        module = {id: name, exports: {}};
        try {
          cache[name] = module.exports;
          fn(module.exports, function(name) {
            return require(name, dirname(path));
          }, module);
          return cache[name] = module.exports;
        } catch (err) {
          delete cache[name];
          throw err;
        }
      } else {
        throw 'module \'' + name + '\' not found';
      }
    }, expand = function(root, name) {
      var results = [], parts, part;
      if (/^\.\.?(\/|$)/.test(name)) {
        parts = [root, name].join('/').split('/');
      } else {
        parts = name.split('/');
      }
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part == '..') {
          results.pop();
        } else if (part != '.' && part != '') {
          results.push(part);
        }
      }
      return results.join('/');
    }, dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };
    this.require = function(name) {
      return require(name, '');
    }
    this.require.define = function(bundle) {
      for (var key in bundle)
        modules[key] = bundle[key];
    };
  }
  return this.require.define;
}).call(this)({
"spine.ajax": function(exports, require, module) {(function() {
  var $, Ajax, Include, Model;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Spine || (Spine = require("spine"));
  $ = Spine.$;
  Model = Spine.Model;
  Ajax = Spine.Ajax = {
    getUrl: function(object) {
      if (!(object && object.url)) {
        return null;
      }
      return (typeof object.url === "function" ? object.url() : void 0) || object.url;
    },
    methodMap: {
      "create": "POST",
      "update": "PUT",
      "destroy": "DELETE",
      "read": "GET"
    },
    send: function(record, method, params) {
      var defaults, success;
      defaults = {
        type: this.methodMap[method],
        contentType: "application/json",
        dataType: "json",
        data: {}
      };
      params = $.extend({}, defaults, params);
      if (method === "create" && record.model) {
        params.url = this.getUrl(record.constructor);
      } else {
        params.url = this.getUrl(record);
      }
      if (!params.url) {
        throw "Invalid URL";
      }
      if (method === "create" || method === "update") {
        params.data = JSON.stringify(record);
        params.processData = false;
        params.success = function(data, status, xhr) {
          var records;
          if (!data) {
            return;
          }
          if (JSON.stringify(record) === JSON.stringify(data)) {
            return;
          }
          if (data.id && record.id !== data.id) {
            records = record.constructor.records;
            records[data.id] = records[record.id];
            delete records[record.id];
            record.id = data.id;
          }
          Ajax.disable(function() {
            return record.updateAttributes(data);
          });
          return record.trigger("ajaxSuccess", record, status, xhr);
        };
      }
      if (method === "read" && !params.success) {
        params.success = function() {
          return (record.refresh || record.load).call(record, data);
        };
      }
      success = params.success;
      params.success = function() {
        if (success) {
          success.apply(Ajax, arguments);
        }
        return Ajax.sendNext();
      };
      params.error = function(xhr, s, e) {
        if (record.trigger("ajaxError", record, xhr, s, e)) {
          return Ajax.sendNext();
        }
      };
      return $.ajax(params);
    },
    enabled: true,
    pending: false,
    requests: [],
    disable: function(callback) {
      this.enabled = false;
      callback();
      return this.enabled = true;
    },
    sendNext: function() {
      var next;
      next = this.requests.shift();
      if (next) {
        return this.send.apply(this, next);
      } else {
        return this.pending = false;
      }
    },
    request: function() {
      if (!this.enabled) {
        return;
      }
      if (this.pending) {
        return this.requests.push(arguments);
      } else {
        this.pending = true;
        return this.send.apply(this, arguments);
      }
    }
  };
  Include = {
    url: function() {
      var base;
      base = Ajax.getUrl(this.constructor);
      if (base.charAt(base.length - 1) !== "/") {
        base += "/";
      }
      base += encodeURIComponent(this.id);
      return base;
    }
  };
  Model.Ajax = {
    extended: function() {
      this.change(function() {
        return Ajax.request.apply(Ajax, arguments);
      });
      this.fetch(__bind(function(params) {
        return Ajax.request(this, "read", params);
      }, this));
      return this.include(Include);
    },
    ajaxPrefix: false,
    url: function() {
      return "/" + (this.className.toLowerCase()) + "s";
    }
  };
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Model.Ajax;
  }
}).call(this);
}, "spine": function(exports, require, module) {(function() {
  var $, Controller, Events, Log, Model, Module, Spine, guid, isArray, makeArray, moduleKeywords;
  var __slice = Array.prototype.slice, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  $ = this.jQuery || this.Zepto || function() {
    return arguments[0];
  };
  Events = {
    bind: function(ev, callback) {
      var calls, evs, name, _i, _len;
      evs = ev.split(" ");
      calls = this.hasOwnProperty("_callbacks") && this._callbacks || (this._callbacks = {});
      for (_i = 0, _len = evs.length; _i < _len; _i++) {
        name = evs[_i];
        calls[name] || (calls[name] = []);
        calls[name].push(callback);
      }
      return this;
    },
    trigger: function() {
      var args, callback, ev, list, _i, _len, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      ev = args.shift();
      list = this.hasOwnProperty("_callbacks") && ((_ref = this._callbacks) != null ? _ref[ev] : void 0);
      if (!list) {
        return false;
      }
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        callback = list[_i];
        if (callback.apply(this, args) === false) {
          break;
        }
      }
      return true;
    },
    unbind: function(ev, callback) {
      var cb, i, list, _len, _ref;
      if (!ev) {
        this._callbacks = {};
        return this;
      }
      list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
      if (!list) {
        return this;
      }
      if (!callback) {
        delete this._callbacks[ev];
        return this;
      }
      for (i = 0, _len = list.length; i < _len; i++) {
        cb = list[i];
        if (cb === callback) {
          list = list.slice();
          list.splice(i, 1);
          this._callbacks[ev] = list;
          break;
        }
      }
      return this;
    }
  };
  Log = {
    trace: true,
    logPrefix: "(App)",
    log: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!this.trace) {
        return;
      }
      if (typeof console === "undefined") {
        return;
      }
      if (this.logPrefix) {
        args.unshift(this.logPrefix);
      }
      console.log.apply(console, args);
      return this;
    }
  };
  moduleKeywords = ["included", "extended"];
  Module = (function() {
    function Module() {}
    Module.include = function(obj) {
      var included, key, value;
      for (key in obj) {
        value = obj[key];
        if (__indexOf.call(moduleKeywords, key) < 0) {
          this.prototype[key] = value;
        }
      }
      included = obj.included;
      if (included) {
        included.apply(this);
      }
      return this;
    };
    Module.extend = function(obj) {
      var extended, key, value;
      for (key in obj) {
        value = obj[key];
        if (__indexOf.call(moduleKeywords, key) < 0) {
          this[key] = value;
        }
      }
      extended = obj.extended;
      if (extended) {
        extended.apply(this);
      }
      return this;
    };
    Module.proxy = function(func) {
      return __bind(function() {
        return func.apply(this, arguments);
      }, this);
    };
    Module.prototype.proxy = function(func) {
      return __bind(function() {
        return func.apply(this, arguments);
      }, this);
    };
    return Module;
  })();
  Model = (function() {
    __extends(Model, Module);
    Model.records = {};
    Model.attributes = [];
    Model.setup = function() {
      var Instance;
      Instance = (function() {
        __extends(Instance, this);
        function Instance() {
          Instance.__super__.constructor.apply(this, arguments);
        }
        return Instance;
      }).call(this);
      Instance.configure.apply(Instance, arguments);
      return Instance;
    };
    Model.configure = function() {
      var attributes, name;
      name = arguments[0], attributes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this.className = name;
      this.records = {};
      if (attributes.length) {
        this.attributes = attributes;
      }
      this.attributes && (this.attributes = makeArray(this.attributes));
      this.attributes || (this.attributes = []);
      this.unbind();
      return this;
    };
    Model.toString = function() {
      return "" + this.className + "(" + (this.attributes.join(", ")) + ")";
    };
    Model.find = function(id) {
      var record;
      record = this.records[id];
      if (!record) {
        throw "Unknown record";
      }
      return record.clone();
    };
    Model.exists = function(id) {
      try {
        return this.find(id);
      } catch (e) {
        return false;
      }
    };
    Model.refresh = function(values, options) {
      var record, _i, _len, _ref;
      if (options == null) {
        options = {};
      }
      if (options.clear) {
        this.records = {};
      }
      _ref = this.fromJSON(values);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        record = _ref[_i];
        record.newRecord = false;
        record.id || (record.id = guid());
        this.records[record.id] = record;
      }
      this.trigger("refresh");
      return this;
    };
    Model.select = function(callback) {
      var id, record, result;
      result = (function() {
        var _ref, _results;
        _ref = this.records;
        _results = [];
        for (id in _ref) {
          record = _ref[id];
          if (callback(record)) {
            _results.push(record);
          }
        }
        return _results;
      }).call(this);
      return this.cloneArray(result);
    };
    Model.findByAttribute = function(name, value) {
      var id, record, _ref;
      _ref = this.records;
      for (id in _ref) {
        record = _ref[id];
        if (record[name] === value) {
          return record.clone();
        }
      }
      return null;
    };
    Model.findAllByAttribute = function(name, value) {
      return this.select(function(item) {
        return item[name] === value;
      });
    };
    Model.each = function(callback) {
      var key, value, _ref, _results;
      _ref = this.records;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(callback(value));
      }
      return _results;
    };
    Model.all = function() {
      return this.cloneArray(this.recordsValues());
    };
    Model.first = function() {
      var record;
      record = this.recordsValues()[0];
      return record != null ? record.clone() : void 0;
    };
    Model.last = function() {
      var record, values;
      values = this.recordsValues();
      record = values[values.length - 1];
      return record != null ? record.clone() : void 0;
    };
    Model.count = function() {
      return this.recordsValues().length;
    };
    Model.deleteAll = function() {
      var key, value, _ref, _results;
      _ref = this.records;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(delete this.records[key]);
      }
      return _results;
    };
    Model.destroyAll = function() {
      var key, value, _ref, _results;
      _ref = this.records;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(this.records[key].destroy());
      }
      return _results;
    };
    Model.update = function(id, atts) {
      return this.find(id).updateAttributes(atts);
    };
    Model.create = function(atts) {
      var record;
      record = new this(atts);
      return record.save();
    };
    Model.destroy = function(id) {
      return this.find(id).destroy();
    };
    Model.change = function(callbackOrParams) {
      if (typeof callbackOrParams === "function") {
        return this.bind("change", callbackOrParams);
      } else {
        return this.trigger("change", callbackOrParams);
      }
    };
    Model.fetch = function(callbackOrParams) {
      if (typeof callbackOrParams === "function") {
        return this.bind("fetch", callbackOrParams);
      } else {
        return this.trigger("fetch", callbackOrParams);
      }
    };
    Model.toJSON = function() {
      return this.recordsValues();
    };
    Model.fromJSON = function(objects) {
      var value, _i, _len, _results;
      if (!objects) {
        return;
      }
      if (typeof objects === "string") {
        objects = JSON.parse(objects);
      }
      if (isArray(objects)) {
        _results = [];
        for (_i = 0, _len = objects.length; _i < _len; _i++) {
          value = objects[_i];
          _results.push(new this(value));
        }
        return _results;
      } else {
        return new this(objects);
      }
    };
    Model.recordsValues = function() {
      var key, result, value, _ref;
      result = [];
      _ref = this.records;
      for (key in _ref) {
        value = _ref[key];
        result.push(value);
      }
      return result;
    };
    Model.cloneArray = function(array) {
      var value, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        value = array[_i];
        _results.push(value.clone());
      }
      return _results;
    };
    Model.prototype.model = true;
    Model.prototype.newRecord = true;
    function Model(atts) {
      Model.__super__.constructor.apply(this, arguments);
      if (atts) {
        this.load(atts);
      }
    }
    Model.prototype.isNew = function() {
      return this.newRecord;
    };
    Model.prototype.isValid = function() {
      return !this.validate();
    };
    Model.prototype.validate = function() {};
    Model.prototype.load = function(atts) {
      var key, value, _results;
      _results = [];
      for (key in atts) {
        value = atts[key];
        _results.push(this[key] = value);
      }
      return _results;
    };
    Model.prototype.attributes = function() {
      var key, result, _i, _len, _ref;
      result = {};
      _ref = this.constructor.attributes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        result[key] = this[key];
      }
      result.id = this.id;
      return result;
    };
    Model.prototype.eql = function(rec) {
      return rec && rec.id === this.id && rec.constructor === this.constructor;
    };
    Model.prototype.save = function() {
      var error;
      error = this.validate();
      if (error) {
        this.trigger("error", this, error);
        return false;
      }
      this.trigger("beforeSave", this);
      if (this.newRecord) {
        this.create();
      } else {
        this.update();
      }
      this.trigger("save", this);
      return this;
    };
    Model.prototype.updateAttribute = function(name, value) {
      this[name] = value;
      return this.save();
    };
    Model.prototype.updateAttributes = function(atts) {
      this.load(atts);
      return this.save();
    };
    Model.prototype.destroy = function() {
      this.trigger("beforeDestroy", this);
      delete this.constructor.records[this.id];
      this.destroyed = true;
      this.trigger("destroy", this);
      return this.trigger("change", this, "destroy");
    };
    Model.prototype.dup = function(newRecord) {
      var result;
      result = new this.constructor(this.attributes());
      if (newRecord === false) {
        result.newRecord = this.newRecord;
      } else {
        delete result.id;
      }
      return result;
    };
    Model.prototype.clone = function() {
      return Object.create(this);
    };
    Model.prototype.reload = function() {
      var original;
      if (this.newRecord) {
        return this;
      }
      original = this.constructor.find(this.id);
      this.load(original.attributes());
      return original;
    };
    Model.prototype.toJSON = function() {
      return this.attributes();
    };
    Model.prototype.toString = function() {
      return "<" + this.constructor.className + " (" + (JSON.stringify(this)) + ")>";
    };
    Model.prototype.exists = function() {
      return this.id && this.id in this.constructor.records;
    };
    Model.prototype.update = function() {
      var clone, records;
      this.trigger("beforeUpdate", this);
      records = this.constructor.records;
      records[this.id].load(this.attributes());
      clone = records[this.id].clone();
      this.trigger("update", clone);
      return this.trigger("change", clone, "update");
    };
    Model.prototype.create = function() {
      var clone, records;
      this.trigger("beforeCreate", this);
      if (!this.id) {
        this.id = guid();
      }
      this.newRecord = false;
      records = this.constructor.records;
      records[this.id] = this.dup(false);
      clone = records[this.id].clone();
      this.trigger("create", clone);
      return this.trigger("change", clone, "create");
    };
    Model.prototype.bind = function(events, callback) {
      return this.constructor.bind(events, __bind(function(record) {
        if (record && this.eql(record)) {
          return callback.apply(this, arguments);
        }
      }, this));
    };
    Model.prototype.trigger = function() {
      var _ref;
      return (_ref = this.constructor).trigger.apply(_ref, arguments);
    };
    return Model;
  })();
  Model.extend(Events);
  Controller = (function() {
    __extends(Controller, Module);
    Controller.prototype.eventSplitter = /^(\w+)\s*(.*)$/;
    Controller.prototype.tag = "div";
    function Controller(options) {
      var key, value, _ref;
      this.options = options;
      _ref = this.options;
      for (key in _ref) {
        value = _ref[key];
        this[key] = value;
      }
      if (!this.el) {
        this.el = document.createElement(this.tag);
      }
      this.el = $(this.el);
      if (!this.events) {
        this.events = this.constructor.events;
      }
      if (!this.elements) {
        this.elements = this.constructor.elements;
      }
      if (this.events) {
        this.delegateEvents();
      }
      if (this.elements) {
        this.refreshElements();
      }
    }
    Controller.prototype.$ = function(selector) {
      return $(selector, this.el);
    };
    Controller.prototype.delegateEvents = function() {
      var eventName, key, match, method, methodName, selector, _results;
      _results = [];
      for (key in this.events) {
        methodName = this.events[key];
        method = this.proxy(this[methodName]);
        match = key.match(this.eventSplitter);
        eventName = match[1];
        selector = match[2];
        _results.push(selector === '' ? this.el.bind(eventName, method) : this.el.delegate(selector, eventName, method));
      }
      return _results;
    };
    Controller.prototype.refreshElements = function() {
      var key, value, _ref, _results;
      _ref = this.elements;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(this[value] = this.$(key));
      }
      return _results;
    };
    Controller.prototype.delay = function(func, timeout) {
      return setTimeout(this.proxy(func), timeout || 0);
    };
    Controller.prototype.html = function(element) {
      return this.el.html(element.el || element);
    };
    Controller.prototype.append = function() {
      var e, elements, _ref;
      elements = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      elements = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = elements.length; _i < _len; _i++) {
          e = elements[_i];
          _results.push(e.el || e);
        }
        return _results;
      })();
      return (_ref = this.el).append.apply(_ref, elements);
    };
    Controller.prototype.appendTo = function(element) {
      return this.el.appendTo(element.el || element);
    };
    return Controller;
  })();
  Controller.include(Events);
  Controller.include(Log);
  if (typeof Object.create !== "function") {
    Object.create = function(o) {
      var Func;
      Func = function() {};
      Func.prototype = o;
      return new Func();
    };
  }
  isArray = function(value) {
    return Object.prototype.toString.call(value) === "[object Array]";
  };
  makeArray = function(args) {
    return Array.prototype.slice.call(args, 0);
  };
  guid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r, v;
      r = Math.random() * 16 | 0;
      v = c === 'x' ? r : r & 3 | 8;
      return v.toString(16);
    }).toUpperCase();
  };
  Spine = this.Spine = {};
  Spine.version = "2.0.0";
  Spine.isArray = isArray;
  Spine.$ = $;
  Spine.Events = Events;
  Spine.Log = Log;
  Spine.Module = Module;
  Spine.Controller = Controller;
  Spine.Model = Model;
  Module.create = Module.sub = Controller.create = Controller.sub = Model.sub = function(instance, static) {
    var result;
    result = (function() {
      __extends(result, this);
      function result() {
        result.__super__.constructor.apply(this, arguments);
      }
      return result;
    }).call(this);
    if (instance) {
      result.include(instance);
    }
    if (static) {
      result.extend(static);
    }
    if (typeof result.unbind === "function") {
      result.unbind();
    }
    return result;
  };
  Module.init = Controller.init = Model.init = function(a1, a2, a3, a4, a5) {
    return new this(a1, a2, a3, a4, a5);
  };
  Spine.Class = Module;
  if (typeof exports !== "undefined" && exports !== null) {
    module.exports = Spine;
  }
}).call(this);
}, "spine.list": function(exports, require, module) {(function() {
  var $;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Spine || (Spine = require("spine"));
  $ = Spine.$;
  Spine.List = (function() {
    __extends(List, Spine.Controller);
    List.prototype.events = {
      "click .item": "click"
    };
    List.prototype.selectFirst = false;
    function List() {
      this.change = __bind(this.change, this);      List.__super__.constructor.apply(this, arguments);
      this.bind("change", this.change);
    }
    List.prototype.template = function() {
      return arguments[0];
    };
    List.prototype.change = function(item) {
      if (!item) {
        return;
      }
      this.current = item;
      this.children().removeClass("active");
      return this.children().forItem(this.current).addClass("active");
    };
    List.prototype.render = function(items) {
      if (items) {
        this.items = items;
      }
      this.html(this.template(this.items));
      this.change(this.current);
      if (this.selectFirst) {
        if (!(this.children(".active").length || this.current)) {
          return this.children(":first").click();
        }
      }
    };
    List.prototype.children = function(sel) {
      return this.el.children(sel);
    };
    List.prototype.click = function(e) {
      var item;
      item = $(e.target).item();
      return this.trigger("change", item);
    };
    return List;
  })();
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.List;
  }
}).call(this);
}, "spine.local": function(exports, require, module) {(function() {
  Spine || (Spine = require("spine"));
  Spine.Model.Local = {
    extended: function() {
      this.change(this.proxy(this.saveLocal));
      return this.fetch(this.proxy(this.loadLocal));
    },
    saveLocal: function() {
      var result;
      result = JSON.stringify(this);
      return localStorage[this.className] = result;
    },
    loadLocal: function() {
      var result;
      result = localStorage[this.className];
      if (!result) {
        return;
      }
      result = JSON.parse(result);
      return this.refresh(result, {
        clear: true
      });
    }
  };
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.Model.Local;
  }
}).call(this);
}, "spine.manager": function(exports, require, module) {(function() {
  var $;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Spine || (Spine = require("spine"));
  $ = Spine.$;
  Spine.Manager = (function() {
    __extends(Manager, Spine.Module);
    function Manager() {
      this.add.apply(this, arguments);
    }
    Manager.prototype.add = function() {
      var cont, controllers, _i, _len, _results;
      controllers = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = controllers.length; _i < _len; _i++) {
        cont = controllers[_i];
        _results.push(this.addOne(cont));
      }
      return _results;
    };
    Manager.prototype.addOne = function(controller) {
      this.bind("change", function(current, args) {
        if (controller === current) {
          return controller.activate.apply(controller, args);
        } else {
          return controller.deactivate.apply(controller, args);
        }
      });
      return controller.active(__bind(function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.trigger("change", controller, args);
      }, this));
    };
    return Manager;
  })();
  Spine.Manager.include(Spine.Events);
  Spine.Controller.include({
    active: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (typeof args[0] === "function") {
        this.bind("active", args[0]);
      } else {
        args.unshift("active");
        this.trigger.apply(this, args);
      }
      return this;
    },
    isActive: function() {
      return this.el.hasClass("active");
    },
    activate: function() {
      this.el.addClass("active");
      return this;
    },
    deactivate: function() {
      this.el.removeClass("active");
      return this;
    }
  });
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.Manager;
  }
}).call(this);
}, "spine.relation": function(exports, require, module) {(function() {
  var Collection, Instance, singularize, underscore;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Collection = (function() {
    function Collection(options) {
      var key, value;
      if (options == null) {
        options = {};
      }
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }
    Collection.prototype.all = function() {
      return this.model.select(__bind(function(rec) {
        return this.associated(rec);
      }, this));
    };
    Collection.prototype.first = function() {
      return this.all()[0];
    };
    Collection.prototype.last = function() {
      var values;
      values = this.all();
      return values[values.length - 1];
    };
    Collection.prototype.find = function(id) {
      var records;
      records = this.model.select(__bind(function(rec) {
        return this.associated(rec) && rec.id === id;
      }, this));
      if (!records[0]) {
        throw "Unknown record";
      }
      return records[0];
    };
    Collection.prototype.select = function(cb) {
      return this.model.select(__bind(function(rec) {
        return this.associated(rec) && cb(rec);
      }, this));
    };
    Collection.prototype.refresh = function(values) {
      var record, records, value, _i, _j, _len, _len2;
      records = this.all();
      for (_i = 0, _len = records.length; _i < _len; _i++) {
        record = records[_i];
        delete this.model.records[record.id];
      }
      values = this.model.fromJSON(values);
      for (_j = 0, _len2 = values.length; _j < _len2; _j++) {
        value = values[_j];
        value.newRecord = false;
        value[this.fkey] = this.record.id;
        this.model.records[value.id] = value;
      }
      return this.model.trigger("refresh");
    };
    Collection.prototype.create = function(record) {
      record[this.fkey] = this.record.id;
      return this.model.create(record);
    };
    Collection.prototype.associated = function(record) {
      return record[this.fkey] === this.record.id;
    };
    return Collection;
  })();
  Instance = (function() {
    function Instance(options) {
      var key, value;
      if (options == null) {
        options = {};
      }
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }
    Instance.prototype.find = function() {
      return this.record[this.fkey] && this.model.find(this.record[this.fkey]);
    };
    Instance.prototype.update = function(value) {
      return this.record[this.fkey] = value && value.id;
    };
    return Instance;
  })();
  singularize = function(str) {
    return str.replace(/s$/, '');
  };
  underscore = function(str) {
    return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/-/g, '_').toLowerCase();
  };
  Spine.Model.extend({
    many: function(name, model, fkey) {
      var association;
            if (fkey != null) {
        fkey;
      } else {
        fkey = "" + (underscore(this.className)) + "_id";
      };
      association = function(record) {
        if (typeof model === "string") {
          model = require(model);
        }
        return new Collection({
          name: name,
          model: model,
          record: record,
          fkey: fkey
        });
      };
      this.prototype.__defineGetter__(name, function() {
        return association(this);
      });
      return this.prototype.__defineSetter__(name, function(value) {
        return association(this).refresh(value);
      });
    },
    belongs: function(name, model, fkey) {
      var association;
            if (fkey != null) {
        fkey;
      } else {
        fkey = "" + (singularize(name)) + "_id";
      };
      association = function(record) {
        if (typeof model === "string") {
          model = require(model);
        }
        return new Instance({
          name: name,
          model: model,
          record: record,
          fkey: fkey
        });
      };
      this.prototype.__defineGetter__(name, function() {
        return association(this).find();
      });
      this.prototype.__defineSetter__(name, function(value) {
        return association(this).update(value);
      });
      return this.attributes.push(fkey);
    }
  });
}).call(this);
}, "spine.route": function(exports, require, module) {(function() {
  var $, escapeRegExp, hashStrip, namedParam, splatParam;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __slice = Array.prototype.slice;
  Spine || (Spine = require("spine"));
  $ = Spine.$;
  hashStrip = /^#*/;
  namedParam = /:([\w\d]+)/g;
  splatParam = /\*([\w\d]+)/g;
  escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;
  Spine.Route = (function() {
    __extends(Route, Spine.Module);
    Route.historySupport = "history" in window;
    Route.routes = [];
    Route.options = {
      trigger: true,
      history: false,
      shim: false
    };
    Route.add = function(path, callback) {
      var key, value, _results;
      if (typeof path === "object") {
        _results = [];
        for (key in path) {
          value = path[key];
          _results.push(this.add(key, value));
        }
        return _results;
      } else {
        return this.routes.push(new this(path, callback));
      }
    };
    Route.setup = function(options) {
      if (options == null) {
        options = {};
      }
      this.options = $.extend({}, this.options, options);
      if (this.options.history) {
        this.history = this.historySupport && this.options.history;
      }
      if (this.options.shim) {
        return;
      }
      if (this.history) {
        $(window).bind("popstate", this.change);
      } else {
        $(window).bind("hashchange", this.change);
      }
      return this.change();
    };
    Route.unbind = function() {
      if (this.history) {
        return $(window).unbind("popstate", this.change);
      } else {
        return $(window).unbind("hashchange", this.change);
      }
    };
    Route.navigate = function() {
      var args, lastArg, options, path;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      options = {};
      lastArg = args[args.length - 1];
      if (typeof lastArg === "object") {
        options = args.pop();
      } else if (typeof lastArg === "boolean") {
        options.trigger = args.pop();
      }
      options = $.extend({}, this.options, options);
      path = args.join("/");
      if (this.path === path) {
        return;
      }
      this.path = path;
      if (options.trigger) {
        this.matchRoute(this.path, options);
      }
      if (options.shim) {
        return;
      }
      if (this.history) {
        return history.pushState({}, document.title, this.getHost() + this.path);
      } else {
        return window.location.hash = this.path;
      }
    };
    Route.getPath = function() {
      return window.location.pathname;
    };
    Route.getHash = function() {
      return window.location.hash;
    };
    Route.getFragment = function() {
      return this.getHash().replace(hashStrip, "");
    };
    Route.getHost = function() {
      return (document.location + "").replace(this.getPath() + this.getHash(), "");
    };
    Route.change = function() {
      var path;
      path = this.history ? this.getPath() : this.getFragment();
      if (path === this.path) {
        return;
      }
      this.path = path;
      return this.matchRoute(this.path);
    };
    Route.matchRoute = function(path, options) {
      var route, _i, _len, _ref;
      _ref = this.routes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        route = _ref[_i];
        if (route.match(path, options)) {
          return route;
        }
      }
    };
    function Route(path, callback) {
      var match;
      this.names = [];
      this.callback = callback;
      if (typeof path === "string") {
        while ((match = namedParam.exec(path)) !== null) {
          this.names.push(match[1]);
        }
        path = path.replace(escapeRegExp, "\\$&").replace(namedParam, "([^\/]*)").replace(splatParam, "(.*?)");
        this.route = new RegExp('^' + path + '$');
      } else {
        this.route = path;
      }
    }
    Route.prototype.match = function(path, options) {
      var i, match, param, params, _len;
      if (options == null) {
        options = {};
      }
      match = this.route.exec(path);
      if (!match) {
        return false;
      }
      options.match = match;
      params = match.slice(1);
      if (this.names.length) {
        for (i = 0, _len = params.length; i < _len; i++) {
          param = params[i];
          options[this.names[i]] = param;
        }
      }
      this.callback.call(null, options);
      return true;
    };
    return Route;
  })();
  Spine.Route.change = Spine.Route.proxy(Spine.Route.change);
  Spine.Controller.include({
    route: function(path, callback) {
      return Spine.Route.add(path, this.proxy(callback));
    },
    routes: function(routes) {
      var key, value, _results;
      _results = [];
      for (key in routes) {
        value = routes[key];
        _results.push(this.route(key, value));
      }
      return _results;
    },
    navigate: function() {
      return Spine.Route.navigate.apply(Spine.Route, arguments);
    }
  });
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.Route;
  }
}).call(this);
}, "spine.tabs": function(exports, require, module) {(function() {
  var $;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Spine || (Spine = require("spine"));
  $ = Spine.$;
  Spine.Tabs = (function() {
    __extends(Tabs, Spine.Controller);
    Tabs.prototype.events = {
      "click [data-name]": "click"
    };
    function Tabs() {
      this.change = __bind(this.change, this);      Tabs.__super__.constructor.apply(this, arguments);
      this.bind("change", this.change);
    }
    Tabs.prototype.change = function(name) {
      if (!name) {
        return;
      }
      this.current = name;
      this.children().removeClass("active");
      return this.children("[data-name='" + this.current + "']").addClass("active");
    };
    Tabs.prototype.render = function() {
      this.change(this.current);
      if (!(this.children(".active").length || this.current)) {
        return this.children(":first").click();
      }
    };
    Tabs.prototype.children = function(sel) {
      return this.el.children(sel);
    };
    Tabs.prototype.click = function(e) {
      var name;
      name = $(e.target).attr("data-name");
      return this.trigger("change", name);
    };
    Tabs.prototype.connect = function(tabName, controller) {
      return this.bind("change", function(name) {
        if (name === tabName) {
          return controller.active();
        }
      });
    };
    return Tabs;
  })();
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.Tabs;
  }
}).call(this);
}, "spine.tmpl": function(exports, require, module) {(function() {
  var $;
  $ = jQuery;
  $.fn.item = function() {
    var item;
    item = $(this).tmplItem().data;
    return typeof item.reload === "function" ? item.reload() : void 0;
  };
  $.fn.forItem = function() {
    return this.filter(function() {
      var compare;
      compare = $(this).item();
      return (typeof item.eql === "function" ? item.eql(compare) : void 0) || item === compare;
    });
  };
}).call(this);
}});
