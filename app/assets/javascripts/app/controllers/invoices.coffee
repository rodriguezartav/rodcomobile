Invoice = require("models/invoice")
Client = require("models/client")

class Invoices extends Spine.Controller
 
	elements:
		".selectedItems" : "selectedItems"

	events:
		"click .quote>.liButton": "remove_quote"
		"click .panel_header h6": "change_client"

	constructor: ->
		super
		Invoice.bind("refresh change", @render)
		Client.bind("on_select_client", @on_select_client)
		Invoice.bind("load_from_server", @load_from_server)
		
		@selectedItems.html "<li>No hay Productos Seleccionados</li>"
		
	render: =>
		if @isActive() 
		
			list = Invoice.filter(Client.selected)
				
			if list.length > 0
				@selectedItems.html require("views/invoices/list")(list)
			else
				@selectedItems.html "<li>No hay pedidos recientes </li>"
		
			@set_header_name()
		
	
	set_header_name: ->
		if Client.selected
			@el.find(".panel_header span").html(Client.selected.name)
		else
			@el.find(".panel_header span").html("Todos los Clientes")

	on_select_client: =>
		@render()
			
	change_client: ->
		Client.trigger "show",""	
		@render()
	
	load_from_server: (data) ->
		for item in data
			Invoice.create({ clientId: item.Cliente__r.Id, clientName: item.Cliente__r.Name.toLowerCase() , id: item.id , productName: item.Producto__r.Name.toLowerCase() , productId: item.Producto__r.Id , price: item.Precio__c , stage: item.Estado__c, discount: item.Descuento__c, amount: item.Cantidad__c })

	
module.exports = Invoices