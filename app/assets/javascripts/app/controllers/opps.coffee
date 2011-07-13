Opp = require("models/opp")
Product = require("models/product")
Client = require("models/client")
Login = require("models/login")
Invoice = require("models/invoice")


class Opps extends Spine.Controller

	elements:
		".selectedItems" : "selectedItems",
		".panel_header span" : "panel_header",
		".panel_footer .value": "total_placeholder"

	events:
		"click .panel_header h6": "change_client"
		"click .selectedItems" : "opp_action",
		"click .panel_footer .button": "send_all"

	constructor: ->
		super
		Opp.fetch()
		Opp.bind("refresh change", @render)
		Client.bind("on_select_client",@on_select_client)
		@selectedItems.html "<li>No hay Pedidos Pendientes</li>"
		@render()

	render: =>
		if @isActive() 
		
			opps = Opp.filter(Client.selected)
			res = "<li>No hay opportunidades pendientes</li>"
			if opps.length > 0
				res = require("views/opps/list")(opps)
			@selectedItems.html res
	
			@set_header_name()

	set_header_name: ->
		if Client.selected
			@panel_header.html(Client.selected.name)
		else
			@panel_header.html("Todos los Clientes")

	change_client: ->
		Client.trigger "show",""
		@render()

	on_select_client: =>
		if @isActive()
			@render()

	opp_action: (event) ->
		element = $(event.target)
		opp = element.item()
		if (element.hasClass "liButton") && (element.attr("data-action") == "remove")
			opp.destroy()
		else if (element.hasClass "liButton") && (element.attr("data-action") == "send")
			opps = []
			opps.push opp
			@send_opps(opps)

	send_all: (event) =>
		@send_opps(Opp.filter(Client.selected))

	send_opps: (opps) ->
		$("#header img").show()
		
		user = Login.last()	
		oppArr = []
		for opp in opps
			oppArr.push opp.to_apex()

		query = 'email=' + user.id + '&password=' + user.password + '&token=' + user.token + '&oportunidades=' + JSON.stringify(oppArr)
		
		$.ajax({
			url: "http://rodcopedidos.heroku.com/saveOpportunities",
			timeout:10000,
			type:"POST",
			data: query ,
			context: "document.body",
			success: (data) => @on_send_success(data,opps),
			error: (jqXHR, textStatus, errorThrown) => @on_send_error(jqXHR, textStatus, errorThrown)
		})

	on_send_success: (data , originalItems) =>
		$("#header img").hide()
		
		results = JSON.parse(data).createResponse.result
		if results.success == "true"
			opp = originalItems[0]
			@opp_to_invoice(opp,results.id)
		else
			index=0
			for result in results
				opp = originalItems[index]
				@opp_to_invoice(opp,result.id)
				index++

	on_send_error: (jqXHR, textStatus, errorThrown) ->
		$("#header img").hide()
		alert.show("Error enviando el pedido al servidor " + errorThrown + " " + textStatus)
		
	opp_to_invoice: (opp,id) ->
		Invoice.from_opp(opp , id)
		opp.destroy()
		


module.exports = Opps