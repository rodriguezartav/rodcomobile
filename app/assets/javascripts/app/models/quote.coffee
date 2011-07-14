class Quote extends Spine.Model
	@configure "Quote", 
						 "clientId", "clientName",
						 "productId", "productName",
						 "amount", "price", "discount","stage","observation"


	@add_or_create: (product,amount) ->
		quote = @findByAttribute("productId",product.id)
		if quote == null
			Quote.create({ productName: product.name , productId: product.id , price: product.price , discount: parseInt(product.discount) , amount: amount , stage: "cart",observation:"" })
		else
			quote.amount += amount
			quote.save()

	@quote_total = 0

	@get_quotes: ->
		quotes=[]
		quotes = Quote.all()	
		@quote_total = 0
		
		for q in quotes
			@quote_total += q.total()
		
		quotes
	
	total: ->
		@price * @amount

module.exports = Quote
Quote.extend(Spine.Model.Local)