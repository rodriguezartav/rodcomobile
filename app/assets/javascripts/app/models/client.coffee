class Client extends Spine.Model
	@configure "Client", "name" 
	
	@selected = null
	
	@queryToRegex: (query) ->
		str = ""
		words = query.split(" ")
		for word in words
			str += word
			str += "|"
		
		str = str.slice(0, -1)
		
	@filter: (query) =>
		query = query.toLowerCase()
		@select (client) =>
			myRegExp =new RegExp( @queryToRegex(query),'gi')			
			client.name.search(myRegExp) > -1
	
module.exports = Client
Client.extend(Spine.Model.Local);
