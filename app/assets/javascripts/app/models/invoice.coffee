class Invoice extends Spine.Model
	@configure "Quote", 
						 "clientId", "clientName",
						 "productId", "productName",
						 "amount", "price", "discount","stage"
	 
	@filter: (client) ->
		if client == null
			return Invoice.all()
		else
			@select (invoice) ->
				invoice.clientId == client.id

	@from_opp: (opp,id)->
		o = opp.attributes()
		o.id = id
		Invoice.create( o )
	

	total: ->
		@price * @amount

module.exports = Invoice
Invoice.extend(Spine.Model.Local)