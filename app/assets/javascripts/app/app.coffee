require("spine")
require("spine.route")
require("spine.tmpl")
require("spine.manager")
require("spine.local")

Client  = require("models/client")
Clients = require("controllers/clients")

Quote  = require("models/quote")
Quotes = require("controllers/quotes")

Invoice  = require("models/invoice")
Invoices = require("controllers/invoices")

Opp  = require("models/opp")
Opps = require("controllers/opps")

Product  = require("models/product")
Products = require("controllers/products")

Login  = require("models/login")
Logins = require("controllers/logins")

class App extends Spine.Controller
	elements:
		"#client": "clientsEl",
		"#product": "productsEl",
		"#quotes": "quotesEl",
		"#opps" : "oppsEl",
		"#invoices": "invoicesEl"
		"#login": "loginEl"
	
	set_button: (id) -> 
		$("#header .buttons li").removeClass("active")
		$("#" + id).addClass("active")

		
	constructor: ->
		super
	
		@clients = new Clients(el: @clientsEl)

		@products = new Products(el: @productsEl)

		@login = new Logins(el: @loginEl)
		
		@quotes = new Quotes(el: @quotesEl)
		
		@opps = new Opps(el: @oppsEl)
		
		@invoices = new Invoices(el: @invoicesEl)
		
		new Spine.Manager(@clients, @products)
		
		new Spine.Manager(@login,@quotes, @invoices ,@opps)
						
		$("#header img").hide()
		
						
		@routes		
			"/login/": ->
				@set_button("no_btn")
				@login.activate()
				item.deactivate() for item in [@clients, @products,@quotes, @invoices ,@opps]
				
			"/view/cart/": () -> 
				@set_button("btn_cart")
				@quotes.active()
				@quotes.render()
				if Client.selected != null
					Product.trigger "show",""
				else
					@clients.active()
					
			"/view/history/": () ->
				@set_button("btn_history")

				@invoices.active()
				@clients.active()
				@invoices.render()
					
			"/view/pending/": () ->
				@set_button("btn_pending")
				
				@opps.active()
				@clients.active()
				@opps.render()
				
		Spine.Route.setup()
		
		@navigate("/login","")

module.exports = App