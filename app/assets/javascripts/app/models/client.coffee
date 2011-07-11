class Client extends Spine.Model
	@configure "Client", "name" 
	
	@selected = null
	
	@filter: (query) ->
		@select (client) ->
			client.name.indexOf(query) > -1
	
module.exports = Client
Client.extend(Spine.Model.Local);
