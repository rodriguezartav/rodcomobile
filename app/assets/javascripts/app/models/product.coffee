class Product extends Spine.Model
	@configure "Product", "name","price","discount","inventory" , "maxDiscount","tax"

	@filter: (query) ->
		@select (product) ->
			product.name.indexOf(query) > -1
	
module.exports = Product
Product.extend(Spine.Model.Local);
