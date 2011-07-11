Client = require("models/client")

class Clients extends Spine.Controller
	events:
		"click ul": "select_client"
		"change input": "render"
	
	constructor: ->
		super
		Client.bind("refresh change", @render)
		Client.bind("show", @show)
		Client.bind("load_from_server", @load_from_server)
		
	render: =>
		frag = @el.find('input').val()
		clients = Client.all()
		@el.find('.search_items').html require("views/clients/list")(clients)
	
	change: ->
		alert("test")
	
	select_client: (event) ->
		element = $(event.target)
		Client.selected = element.item()
		Client.trigger "on_select_client" 

	show: =>
		Client.selected = null
		@active()

	load_from_server: (data) ->
		for item in data
			Client.create({name: item.Name.toLowerCase(),id: item.Id}) 

module.exports = Clients