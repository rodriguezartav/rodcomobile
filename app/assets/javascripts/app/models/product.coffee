class Product extends Spine.Model
	@configure "Product", "name","price","discount","inventory" , "maxDiscount","tax"


	@queryToRegex: (query) ->
		str = ""
		words = query.split(" ")
		for word in words
			str += word
			str += "|"
		
		str = str.slice(0, -1)

	@filter: (query) =>
		query = query.toLowerCase()
		@select (product) =>
			myRegExp =new RegExp( @queryToRegex(query),'gi')			
			product.name.search(myRegExp) > -1
	
module.exports = Product
Product.extend(Spine.Model.Local);
