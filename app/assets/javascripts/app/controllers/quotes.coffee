Quote = require("models/quote")
Opp = require("models/opp")

Product = require("models/product")
Client = require("models/client")

class Quotes extends Spine.Controller

	elements:
		".selectedItems" : "selectedItems",
		".panel_header span" : "panel_header",
		".panel_footer .value": "total_placeholder",
		"input": "txt_observation"

	events:
		"change #txt_amount": "change_amount"
		"change #txt_discount": "change_discount"
		"click .selectedItems": "remove_quote"
		"click .panel_header h6": "change_client"
		"click .panel_footer .button": "save_quotes"
		
	constructor: ->
		super
		Quote.bind("refresh change", @render)
		Client.bind("on_select_client",@on_select_client)
		Product.bind("on_select_product",@on_select_product)
		@render()
		
	render: =>
		if @isActive() 
			quotes  = Quote.get_quotes(Client.selected)
			res = "<li>No hay productos seleccionados</li>"
			if quotes.length > 0
				res = require("views/quotes/list")(quotes)
			@selectedItems.html res
			@total_placeholder.html Quote.quote_total
			@set_header_name()

	set_header_name: ->
		if Client.selected
			@panel_header.html(Client.selected.name)
		else
			@panel_header.html("Escoja un cliente")
		
	change_client: ->
		Client.trigger "show",""	
		@render()

	on_select_client: =>
		if @isActive() 
			Product.trigger "show",""
			@render()
	
	on_select_product: (product) =>
		if @isActive() 
			Quote.add_or_create(product,1)
	
	change_amount: (event) ->
		element = $(event.target)
		quote = element.item()
		if quote
			tempVal = parseInt(element.val())
			if tempVal != NaN 
				quote.amount = tempVal
				quote.save()
			else
				element.val(quote.amount)
			
	change_discount: (event) ->
		element = $(event.target)
		if quote
			quote = element.item()
			tempVal = parseInt(element.val())
			if tempVal != NaN 
				quote.discount = tempVal
				quote.save()
			else
				element.val(quote.amount)
			
	remove_quote: (event) ->
		element = $(event.target)
		quote = element.item()
		if element.hasClass "liButton"
			quote.destroy()
		else if element.hasClass("liInput") is false and quote.amount > 1
			quote.amount -= 1
			quote.save()
			
	save_quotes: (event) ->
		client =  Client.selected
		if client
			for item in Quote.all()
				Opp.create({ observation: @txt_observation.val() , clientId: client.id, clientName: client.name , productName: item.productName , productId: item.productId , price: item.price , discount: item.discount, amount: item.amount })
				item.destroy()
			@txt_observation.val("")
module.exports = Quotes