class Opp extends Spine.Model
	@configure "Opp", 
						 "clientId", "clientName",
						 "productId", "productName",
						 "amount", "price", "discount","stage"

	@filter: (client) ->
		if client == null
			return Opp.all()
		else
			@select (opp) ->
				opp.clientId == client.id

	total: ->
		@price * @amount

	to_apex: ->
		obj = ["type","Oportunidad__c","cliente__c" , @clientId, "producto__c", @productId ,"cantidad__c", @amount , "descuento__c", @discount, "precio__c", @price,"estado__c","nuevo" ]
		JSON.stringify(obj)
		
module.exports = Opp
Opp.extend(Spine.Model.Local)