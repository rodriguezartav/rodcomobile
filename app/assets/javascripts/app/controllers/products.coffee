Product = require("models/product")
Client = require("models/client")

class Products extends Spine.Controller

	events:
		"click li": "select_product"
		"change #txt_search_product": "render"

	constructor: ->
		super
		Product.bind("show", @show)
		Product.bind("load_from_server", @load_from_server)

	render: =>
		query = @el.find('input').val()
		#in_inventory = @in_inventory.val()
		#alert in_inventory
		if query.length > 0
			list = Product.filter query
			@el.find('.search_items').html require("views/products/list")(list)

	select_product: (event) ->
		element = $(event.target)
		Product.trigger "on_select_product" , element.item()

	show: =>
		@active()

	load_from_server: (data) ->
		for item in data
			Product.create({name: item.Name.toLowerCase() , id: item.Id , discount: item.DescuentoMinimo__c , price: item.PrecioMinimo__c , tax: item.Impuesto__c , inventory: item.InventarioActual__c ,  maxDiscount: item.DescuentoMaximo__c  })

module.exports = Products



