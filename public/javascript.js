
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
"app": function(exports, require, module) {(function() {
  var App, Client, Clients, Invoice, Invoices, Login, Logins, Opp, Opps, Product, Products, Quote, Quotes;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  require("spine");
  require("spine.route");
  require("spine.tmpl");
  require("spine.manager");
  require("spine.local");
  Client = require("models/client");
  Clients = require("controllers/clients");
  Quote = require("models/quote");
  Quotes = require("controllers/quotes");
  Invoice = require("models/invoice");
  Invoices = require("controllers/invoices");
  Opp = require("models/opp");
  Opps = require("controllers/opps");
  Product = require("models/product");
  Products = require("controllers/products");
  Login = require("models/login");
  Logins = require("controllers/logins");
  App = (function() {
    __extends(App, Spine.Controller);
    App.prototype.elements = {
      "#client": "clientsEl",
      "#product": "productsEl",
      "#quotes": "quotesEl",
      "#opps": "oppsEl",
      "#invoices": "invoicesEl",
      "#login": "loginEl"
    };
    App.prototype.set_button = function(id) {
      $("#header .buttons li").removeClass("active");
      return $("#" + id).addClass("active");
    };
    function App() {
      App.__super__.constructor.apply(this, arguments);
      this.clients = new Clients({
        el: this.clientsEl
      });
      this.products = new Products({
        el: this.productsEl
      });
      this.login = new Logins({
        el: this.loginEl
      });
      this.quotes = new Quotes({
        el: this.quotesEl
      });
      this.opps = new Opps({
        el: this.oppsEl
      });
      this.invoices = new Invoices({
        el: this.invoicesEl
      });
      new Spine.Manager(this.clients, this.products);
      new Spine.Manager(this.login, this.quotes, this.invoices, this.opps);
      $("#header img").hide();
      this.routes({
        "/login/": function() {
          var item, _i, _len, _ref, _results;
          this.set_button("no_btn");
          this.login.activate();
          _ref = [this.clients, this.products, this.quotes, this.invoices, this.opps];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            _results.push(item.deactivate());
          }
          return _results;
        },
        "/view/cart/": function() {
          this.set_button("btn_cart");
          this.quotes.active();
          this.quotes.render();
          if (Client.selected !== null) {
            return Product.trigger("show", "");
          } else {
            return this.clients.active();
          }
        },
        "/view/history/": function() {
          this.set_button("btn_history");
          this.invoices.active();
          this.clients.active();
          return this.invoices.render();
        },
        "/view/pending/": function() {
          this.set_button("btn_pending");
          this.opps.active();
          this.clients.active();
          return this.opps.render();
        }
      });
      Spine.Route.setup();
      this.navigate("/login", "");
    }
    return App;
  })();
  module.exports = App;
}).call(this);
}, "controllers/clients": function(exports, require, module) {(function() {
  var Client, Clients;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Client = require("models/client");
  Clients = (function() {
    __extends(Clients, Spine.Controller);
    Clients.prototype.events = {
      "click ul": "select_client",
      "change input": "render"
    };
    function Clients() {
      this.show = __bind(this.show, this);
      this.render = __bind(this.render, this);      Clients.__super__.constructor.apply(this, arguments);
      Client.bind("refresh change", this.render);
      Client.bind("show", this.show);
      Client.bind("load_from_server", this.load_from_server);
    }
    Clients.prototype.render = function() {
      var clients, frag;
      frag = this.el.find('input').val();
      clients = Client.all();
      return this.el.find('.search_items').html(require("views/clients/list")(clients));
    };
    Clients.prototype.change = function() {
      return alert("test");
    };
    Clients.prototype.select_client = function(event) {
      var element;
      element = $(event.target);
      Client.selected = element.item();
      return Client.trigger("on_select_client");
    };
    Clients.prototype.show = function() {
      Client.selected = null;
      return this.active();
    };
    Clients.prototype.load_from_server = function(data) {
      var item, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        item = data[_i];
        _results.push(Client.create({
          name: item.Name.toLowerCase(),
          id: item.Id
        }));
      }
      return _results;
    };
    return Clients;
  })();
  module.exports = Clients;
}).call(this);
}, "controllers/invoices": function(exports, require, module) {(function() {
  var Client, Invoice, Invoices;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Invoice = require("models/invoice");
  Client = require("models/client");
  Invoices = (function() {
    __extends(Invoices, Spine.Controller);
    Invoices.prototype.elements = {
      ".selectedItems": "selectedItems"
    };
    Invoices.prototype.events = {
      "click .quote>.liButton": "remove_quote",
      "click .panel_header h6": "change_client"
    };
    function Invoices() {
      this.on_select_client = __bind(this.on_select_client, this);
      this.render = __bind(this.render, this);      Invoices.__super__.constructor.apply(this, arguments);
      Invoice.bind("refresh change", this.render);
      Client.bind("on_select_client", this.on_select_client);
      Invoice.bind("load_from_server", this.load_from_server);
      this.selectedItems.html("<li>No hay Productos Seleccionados</li>");
    }
    Invoices.prototype.render = function() {
      var list;
      if (this.isActive()) {
        list = Invoice.filter(Client.selected);
        if (list.length > 0) {
          this.selectedItems.html(require("views/invoices/list")(list));
        } else {
          this.selectedItems.html("<li>No hay pedidos recientes </li>");
        }
        return this.set_header_name();
      }
    };
    Invoices.prototype.set_header_name = function() {
      if (Client.selected) {
        return this.el.find(".panel_header span").html(Client.selected.name);
      } else {
        return this.el.find(".panel_header span").html("Todos los Clientes");
      }
    };
    Invoices.prototype.on_select_client = function() {
      return this.render();
    };
    Invoices.prototype.change_client = function() {
      Client.trigger("show", "");
      return this.render();
    };
    Invoices.prototype.load_from_server = function(data) {
      var item, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        item = data[_i];
        _results.push(Invoice.create({
          clientId: item.Cliente__r.Id,
          clientName: item.Cliente__r.Name.toLowerCase(),
          id: item.id,
          productName: item.Producto__r.Name.toLowerCase(),
          productId: item.Producto__r.Id,
          price: item.Precio__c,
          stage: item.Estado__c,
          discount: item.Descuento__c,
          amount: item.Cantidad__c
        }));
      }
      return _results;
    };
    return Invoices;
  })();
  module.exports = Invoices;
}).call(this);
}, "controllers/logins": function(exports, require, module) {(function() {
  var Client, Invoice, Login, Logins, Product;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Login = require("models/login");
  Client = require("models/client");
  Product = require("models/product");
  Invoice = require("models/invoice");
  Logins = (function() {
    __extends(Logins, Spine.Controller);
    Logins.prototype.elements = {
      "#txt_user_email": "email",
      "#txt_user_password": "password",
      "#txt_user_token": "token"
    };
    Logins.prototype.events = {
      "click .panel_footer .button": "login"
    };
    function Logins() {
      this.on_login_error = __bind(this.on_login_error, this);
      this.render = __bind(this.render, this);      var last;
      Logins.__super__.constructor.apply(this, arguments);
      Login.fetch();
      Login.bind("refresh change", this.render);
      last = Login.last();
      if (last) {
        this.email.val(last.id);
        this.password.val(last.password);
        this.token.val(last.token);
      }
    }
    Logins.prototype.render = function() {};
    Logins.prototype.login_offline = function() {
      var login;
      login = Login.auth(this.email.val(), this.password.val());
      if (login !== false) {
        Client.fetch();
        Product.fetch();
        Invoice.fetch();
        return this.navigate("/view/cart", "");
      }
    };
    Logins.prototype.login = function() {
      var query;
      query = 'email=' + this.email.val() + '&password=' + this.password.val() + '&token=' + this.token.val() + '&test=true';
      $("#header img").show();
      return $.ajax({
        url: "http://rodcopedidos.heroku.com/login_and_load",
        timeout: 10000,
        type: "GET",
        data: query,
        context: "documento.body",
        success: __bind(function(data) {
          return this.on_login_sucess(data);
        }, this),
        error: __bind(function(jqXHR, textStatus, errorThrown) {
          return this.on_login_error(jqXHR, textStatus, errorThrown);
        }, this)
      });
    };
    Logins.prototype.on_login_sucess = function(data) {
      var clients, invoices, item, products, _i, _len;
      $("#header img").hide();
      Login.create({
        id: this.email.val(),
        password: this.password.val(),
        token: this.token.val()
      });
      data = JSON.parse(data);
      products = [];
      clients = [];
      invoices = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        item = data[_i];
        if (item.type === "Producto__c") {
          products.push(item);
        } else if (item.type === "Cliente__c") {
          clients.push(item);
        } else if (item.type === "Oportunidad__c") {
          invoices.push(item);
        }
      }
      Client.trigger("load_from_server", clients);
      Product.trigger("load_from_server", products);
      Invoice.trigger("load_from_server", invoices);
      return this.navigate("/view/cart", "");
    };
    Logins.prototype.on_login_error = function(jqXHR, textStatus, errorThrown) {
      $("#header img").hide();
      if (jqXHR.status === 403) {
        return alert("error ingresando al sistema por usuario y clave equivocado");
      } else if (textStatus === "timeout") {
        return alert("error ingresando al sistema o al servidor por problemas de internet");
      } else {
        return this.login_offline();
      }
    };
    return Logins;
  })();
  module.exports = Logins;
}).call(this);
}, "controllers/opps": function(exports, require, module) {(function() {
  var Client, Invoice, Login, Opp, Opps, Product;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Opp = require("models/opp");
  Product = require("models/product");
  Client = require("models/client");
  Login = require("models/login");
  Invoice = require("models/invoice");
  Opps = (function() {
    __extends(Opps, Spine.Controller);
    Opps.prototype.elements = {
      ".selectedItems": "selectedItems",
      ".panel_header span": "panel_header",
      ".panel_footer .value": "total_placeholder"
    };
    Opps.prototype.events = {
      "click .panel_header h6": "change_client",
      "click .selectedItems": "opp_action",
      "click .panel_footer .button": "send_all"
    };
    function Opps() {
      this.on_send_success = __bind(this.on_send_success, this);
      this.send_all = __bind(this.send_all, this);
      this.on_select_client = __bind(this.on_select_client, this);
      this.render = __bind(this.render, this);      Opps.__super__.constructor.apply(this, arguments);
      Opp.fetch();
      Opp.bind("refresh change", this.render);
      Client.bind("on_select_client", this.on_select_client);
      this.selectedItems.html("<li>No hay Pedidos Pendientes</li>");
      this.render();
    }
    Opps.prototype.render = function() {
      var opps, res;
      if (this.isActive()) {
        opps = Opp.filter(Client.selected);
        res = "<li>No hay opportunidades pendientes</li>";
        if (opps.length > 0) {
          res = require("views/opps/list")(opps);
        }
        this.selectedItems.html(res);
        return this.set_header_name();
      }
    };
    Opps.prototype.set_header_name = function() {
      if (Client.selected) {
        return this.panel_header.html(Client.selected.name);
      } else {
        return this.panel_header.html("Todos los Clientes");
      }
    };
    Opps.prototype.change_client = function() {
      Client.trigger("show", "");
      return this.render();
    };
    Opps.prototype.on_select_client = function() {
      if (this.isActive()) {
        return this.render();
      }
    };
    Opps.prototype.opp_action = function(event) {
      var element, opp, opps;
      element = $(event.target);
      opp = element.item();
      if ((element.hasClass("liButton")) && (element.attr("data-action") === "remove")) {
        return opp.destroy();
      } else if ((element.hasClass("liButton")) && (element.attr("data-action") === "send")) {
        opps = [];
        opps.push(opp);
        return this.send_opps(opps);
      }
    };
    Opps.prototype.send_all = function(event) {
      return this.send_opps(Opp.filter(Client.selected));
    };
    Opps.prototype.send_opps = function(opps) {
      var opp, oppArr, query, user, _i, _len;
      $("#header img").show();
      user = Login.last();
      oppArr = [];
      for (_i = 0, _len = opps.length; _i < _len; _i++) {
        opp = opps[_i];
        oppArr.push(opp.to_apex());
      }
      query = 'test=true' + '&email=' + user.id + '&password=' + user.password + '&token=' + user.token + '&oportunidades=' + JSON.stringify(oppArr);
      return $.ajax({
        url: "http://rodcopedidos.heroku.com/saveOpportunities",
        timeout: 10000,
        type: "POST",
        data: query,
        context: "document.body",
        success: __bind(function(data) {
          return this.on_send_success(data, opps);
        }, this),
        error: __bind(function(jqXHR, textStatus, errorThrown) {
          return this.on_send_srror(jqXHR, textStatus, errorThrown);
        }, this)
      });
    };
    Opps.prototype.on_send_success = function(data, originalItems) {
      var index, opp, result, results, _i, _len, _results;
      $("#header img").hide();
      results = JSON.parse(data).createResponse.result;
      if (results.success === "true") {
        opp = originalItems[0];
        return this.opp_to_invoice(opp, results.id);
      } else {
        index = 0;
        _results = [];
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          result = results[_i];
          opp = originalItems[index];
          this.opp_to_invoice(opp, result.id);
          _results.push(index++);
        }
        return _results;
      }
    };
    Opps.prototype.on_send_error = function(jqXHR, textStatus, errorThrown) {
      $("#header img").hide();
      return alert.show("Error enviando el pedido al servidor " + errorThrown + " " + textStatus);
    };
    Opps.prototype.opp_to_invoice = function(opp, id) {
      Invoice.from_opp(opp, id);
      return opp.destroy();
    };
    return Opps;
  })();
  module.exports = Opps;
}).call(this);
}, "controllers/products": function(exports, require, module) {(function() {
  var Client, Product, Products;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Product = require("models/product");
  Client = require("models/client");
  Products = (function() {
    __extends(Products, Spine.Controller);
    Products.prototype.events = {
      "click li": "select_product",
      "change #txt_search_product": "render"
    };
    function Products() {
      this.show = __bind(this.show, this);
      this.render = __bind(this.render, this);      Products.__super__.constructor.apply(this, arguments);
      Product.bind("refresh change", this.render);
      Product.bind("show", this.show);
      Product.bind("load_from_server", this.load_from_server);
    }
    Products.prototype.render = function() {
      var list, query;
      query = this.el.find('input').val();
      list = Product.all();
      return this.el.find('.search_items').html(require("views/products/list")(list));
    };
    Products.prototype.select_product = function(event) {
      var element;
      element = $(event.target);
      return Product.trigger("on_select_product", element.item());
    };
    Products.prototype.show = function() {
      return this.active();
    };
    Products.prototype.load_from_server = function(data) {
      var item, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        item = data[_i];
        _results.push(Product.create({
          name: item.Name.toLowerCase(),
          id: item.Id,
          discount: item.DescuentoMinimo__c,
          price: item.PrecioMinimo__c,
          tax: item.Impuesto__c,
          inventory: item.InventarioActual__c,
          maxDiscount: item.DescuentoMaximo__c
        }));
      }
      return _results;
    };
    return Products;
  })();
  module.exports = Products;
}).call(this);
}, "controllers/quotes": function(exports, require, module) {(function() {
  var Client, Opp, Product, Quote, Quotes;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Quote = require("models/quote");
  Opp = require("models/opp");
  Product = require("models/product");
  Client = require("models/client");
  Quotes = (function() {
    __extends(Quotes, Spine.Controller);
    Quotes.prototype.elements = {
      ".selectedItems": "selectedItems",
      ".panel_header span": "panel_header",
      ".panel_footer .value": "total_placeholder",
      "input": "txt_observation"
    };
    Quotes.prototype.events = {
      "change #txt_amount": "change_amount",
      "change #txt_discount": "change_discount",
      "click .selectedItems": "remove_quote",
      "click .panel_header h6": "change_client",
      "click .panel_footer .button": "save_quotes"
    };
    function Quotes() {
      this.on_select_product = __bind(this.on_select_product, this);
      this.on_select_client = __bind(this.on_select_client, this);
      this.render = __bind(this.render, this);      Quotes.__super__.constructor.apply(this, arguments);
      Quote.bind("refresh change", this.render);
      Client.bind("on_select_client", this.on_select_client);
      Product.bind("on_select_product", this.on_select_product);
      this.render();
    }
    Quotes.prototype.render = function() {
      var quotes, res;
      if (this.isActive()) {
        quotes = Quote.get_quotes(Client.selected);
        res = "<li>No hay productos seleccionados</li>";
        if (quotes.length > 0) {
          res = require("views/quotes/list")(quotes);
        }
        this.selectedItems.html(res);
        this.total_placeholder.html(Quote.quote_total);
        return this.set_header_name();
      }
    };
    Quotes.prototype.set_header_name = function() {
      if (Client.selected) {
        return this.panel_header.html(Client.selected.name);
      } else {
        return this.panel_header.html("Escoja un cliente");
      }
    };
    Quotes.prototype.change_client = function() {
      Client.trigger("show", "");
      return this.render();
    };
    Quotes.prototype.on_select_client = function() {
      if (this.isActive()) {
        Product.trigger("show", "");
        return this.render();
      }
    };
    Quotes.prototype.on_select_product = function(product) {
      if (this.isActive()) {
        return Quote.add_or_create(product, 1);
      }
    };
    Quotes.prototype.change_amount = function(event) {
      var element, quote, tempVal;
      element = $(event.target);
      quote = element.item();
      if (quote) {
        tempVal = parseInt(element.val());
        if (tempVal !== NaN) {
          quote.amount = tempVal;
          return quote.save();
        } else {
          return element.val(quote.amount);
        }
      }
    };
    Quotes.prototype.change_discount = function(event) {
      var element, quote, tempVal;
      element = $(event.target);
      if (quote) {
        quote = element.item();
        tempVal = parseInt(element.val());
        if (tempVal !== NaN) {
          quote.discount = tempVal;
          return quote.save();
        } else {
          return element.val(quote.amount);
        }
      }
    };
    Quotes.prototype.remove_quote = function(event) {
      var element, quote;
      element = $(event.target);
      quote = element.item();
      if (element.hasClass("liButton")) {
        return quote.destroy();
      } else if (element.hasClass("liInput") === false && quote.amount > 1) {
        quote.amount -= 1;
        return quote.save();
      }
    };
    Quotes.prototype.save_quotes = function(event) {
      var client, item, _i, _len, _ref, _results;
      client = Client.selected;
      if (client) {
        _ref = Quote.all();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          Opp.create({
            observation: this.txt_observation,
            clientId: client.id,
            clientName: client.name,
            productName: item.productName,
            productId: item.productId,
            price: item.price,
            discount: item.discount,
            amount: item.amount
          });
          _results.push(item.destroy());
        }
        return _results;
      }
    };
    return Quotes;
  })();
  module.exports = Quotes;
}).call(this);
}, "models/client": function(exports, require, module) {(function() {
  var Client;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Client = (function() {
    __extends(Client, Spine.Model);
    function Client() {
      Client.__super__.constructor.apply(this, arguments);
    }
    Client.configure("Client", "name");
    Client.selected = null;
    Client.filter = function(query) {
      return this.select(function(client) {
        return client.name.indexOf(query) > -1;
      });
    };
    return Client;
  })();
  module.exports = Client;
  Client.extend(Spine.Model.Local);
}).call(this);
}, "models/invoice": function(exports, require, module) {(function() {
  var Invoice;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Invoice = (function() {
    __extends(Invoice, Spine.Model);
    function Invoice() {
      Invoice.__super__.constructor.apply(this, arguments);
    }
    Invoice.configure("Quote", "clientId", "clientName", "productId", "productName", "amount", "price", "discount", "stage");
    Invoice.filter = function(client) {
      if (client === null) {
        return Invoice.all();
      } else {
        return this.select(function(invoice) {
          return invoice.clientId === client.id;
        });
      }
    };
    Invoice.from_opp = function(opp, id) {
      var o;
      o = opp.attributes();
      o.id = id;
      return Invoice.create(o);
    };
    Invoice.prototype.total = function() {
      return this.price * this.amount;
    };
    return Invoice;
  })();
  module.exports = Invoice;
  Invoice.extend(Spine.Model.Local);
}).call(this);
}, "models/login": function(exports, require, module) {(function() {
  var Login;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Login = (function() {
    __extends(Login, Spine.Model);
    function Login() {
      Login.__super__.constructor.apply(this, arguments);
    }
    Login.configure("Login", "password", "token");
    Login.auth = function(email, password) {
      var ret;
      ret = null;
      Login.each(function(login) {
        if (login.id === email && login.password === password) {
          return ret = login;
        }
      });
      return ret;
    };
    Login.isLogin = false;
    return Login;
  })();
  module.exports = Login;
  Login.extend(Spine.Model.Local);
}).call(this);
}, "models/opp": function(exports, require, module) {(function() {
  var Opp;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Opp = (function() {
    __extends(Opp, Spine.Model);
    function Opp() {
      Opp.__super__.constructor.apply(this, arguments);
    }
    Opp.configure("Opp", "clientId", "clientName", "productId", "productName", "amount", "price", "discount", "stage");
    Opp.filter = function(client) {
      if (client === null) {
        return Opp.all();
      } else {
        return this.select(function(opp) {
          return opp.clientId === client.id;
        });
      }
    };
    Opp.prototype.total = function() {
      return this.price * this.amount;
    };
    Opp.prototype.to_apex = function() {
      var obj;
      obj = ["type", "Oportunidad__c", "cliente__c", this.clientId, "producto__c", this.productId, "cantidad__c", this.amount, "descuento__c", this.discount, "precio__c", this.price, "estado__c", "nuevo"];
      return JSON.stringify(obj);
    };
    return Opp;
  })();
  module.exports = Opp;
  Opp.extend(Spine.Model.Local);
}).call(this);
}, "models/product": function(exports, require, module) {(function() {
  var Product;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Product = (function() {
    __extends(Product, Spine.Model);
    function Product() {
      Product.__super__.constructor.apply(this, arguments);
    }
    Product.configure("Product", "name", "price", "discount", "inventory", "maxDiscount", "tax");
    Product.filter = function(query) {
      return this.select(function(product) {
        return product.name.indexOf(query) > -1;
      });
    };
    return Product;
  })();
  module.exports = Product;
  Product.extend(Spine.Model.Local);
}).call(this);
}, "models/quote": function(exports, require, module) {(function() {
  var Quote;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Quote = (function() {
    __extends(Quote, Spine.Model);
    function Quote() {
      Quote.__super__.constructor.apply(this, arguments);
    }
    Quote.configure("Quote", "clientId", "clientName", "productId", "productName", "amount", "price", "discount", "stage", "observation");
    Quote.add_or_create = function(product, amount) {
      var quote;
      quote = this.findByAttribute("productId", product.id);
      if (quote === null) {
        return Quote.create({
          productName: product.name,
          productId: product.id,
          price: product.price,
          discount: product.discount,
          amount: amount,
          stage: "cart"
        });
      } else {
        quote.amount += amount;
        return quote.save();
      }
    };
    Quote.quote_total = 0;
    Quote.get_quotes = function() {
      var q, quotes, _i, _len;
      quotes = [];
      quotes = Quote.all();
      this.quote_total = 0;
      for (_i = 0, _len = quotes.length; _i < _len; _i++) {
        q = quotes[_i];
        this.quote_total += q.total();
      }
      return quotes;
    };
    Quote.prototype.total = function() {
      return this.price * this.amount;
    };
    return Quote;
  })();
  module.exports = Quote;
  Quote.extend(Spine.Model.Local);
}).call(this);
}, "views/clients/list": function(exports, require, module) {var template = jQuery.template("<li data-id=\"${id}\" class=\"client\">${name}</li>");
      module.exports = (function(data){ return jQuery.tmpl(template, data); });}, "views/invoices/list": function(exports, require, module) {var template = jQuery.template("<li data-id=\"${productId}\" class=\"invoice\">\n\t\n\t<div class=\"name\">\n\t\t<span class=\"liItem lineSmall\">${clientName}</span>\n\t\t<span class=\"liItem l\">${productName}</span>\t\n\t</div>\n\t\n\t<div class=\"info\">\n\t\t<span class=\"liItem s\">c/<br/>${price}</span>\n\t\t<span class=\"liItem s\">#<br/>${amount}</span>\n\t\t<span class=\"liItem s\">%<br/>${discount}</span>\n\t</div> \t\n\t\n\t \n\t\n</li>");
      module.exports = (function(data){ return jQuery.tmpl(template, data); });}, "views/opps/list": function(exports, require, module) {var template = jQuery.template("<li data-id=\"${productId}\" class=\"opps\">\n\t\n\t<div class=\"name\">\n\t\t<span class=\"liItem lineSmall\">${clientName}</span>\n\t\t<span class=\"liItem l\">${productName}</span>\t\n\t</div>\n\t\n\t<div class=\"info\">\n\t\t<span class=\"liItem s\">c/<br/>${price}</span>\n\t\t<span class=\"liItem s\">#<br/>${amount}</span>\n\t\t<span class=\"liItem s\">%<br/>${discount}</span>\n\t</div> \t\n\t\n\t<div class=\"buttons\">\n\t\t<span data-action=\"send\" class=\"liButton\"> Enviar </span>\n\t\t<span  data-action=\"remove\"  class=\"liButton\"> Borrar </span>\t\n\t</div>\n\t\n</li> ");
      module.exports = (function(data){ return jQuery.tmpl(template, data); });}, "views/products/list": function(exports, require, module) {var template = jQuery.template("<li data-id=\"${id}\" class=\"product\">\n\t<div class=\"name\">\n\t<span>${name}</span>\n\t</div>\n\t<div class=\"info\">\n\t<span  class=\" m\"># ${inventory}</span>\n\t<span  class=\" m\">c/ ${price}</span>\n\t<span  class=\" s\">-% ${discount}</span>\n\t<span  class=\" s\">+% ${maxDiscount}</span>\n\t\n\t</div>\n\t\n</li>");
      module.exports = (function(data){ return jQuery.tmpl(template, data); });}, "views/quotes/list": function(exports, require, module) {var template = jQuery.template("<li data-id=\"${productId}\" class=\"quote\">\n\t<div class=\"name\">\n\t\n\t<span class=\"liItem lineBig\">${productName}</span>\t\n\t</div>\n\t<div class=\"info\">\n\t\n\t<input type=\"text\"  value=\"${amount}\" class=\"liInput\" id=\"txt_amount\"/>\n\t<input type=\"text\"  value=\"${discount}\" class=\"liInput small\" id=\"txt_discount\"/>\n\t<span class=\"liItem\">${price}</span>\n\t\n\t</div>\n\t\n\t<div class=\"buttons\">\n\t\n\t<span class=\"liButton\"> borrar </span>\n\t\n\t</div>\n\t</li>");
      module.exports = (function(data){ return jQuery.tmpl(template, data); });}, "spine.ajax": function(exports, require, module) {(function() {
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
