Login = require("models/login")
Client = require("models/client")
Product = require("models/product")
Invoice = require("models/invoice")

class Logins extends Spine.Controller

	elements:
		"#txt_user_email" : "email",
		"#txt_user_password" : "password",
		"#txt_user_token": "token"

	events:
		"click .panel_footer .button": "login"
	

	constructor: ->
		super
		Login.fetch()
		Login.bind("refresh change", @render)
		last = Login.last()
		if last
			@email.val(last.id)
			@password.val(last.password)
			@token.val(last.token)
		
	render: =>
	
	login_offline: ->
		login = Login.auth( @email.val() , @password.val() )
		if login != false
			Client.fetch()
			Product.fetch()
			Invoice.fetch()
			@navigate("/view/cart","")

	login: ->
		query = 'email=' + @email.val() + '&password=' + @password.val() + '&token=' + @token.val() #+ '&test=true'
		
		$("#header img").show()
		
		$.ajax {
			url: "http://rodcopedidos.heroku.com/login_and_load",
			timeout:10000,
			type:"GET",
			data: query ,
			context: "documento.body",
			success: (data) => @on_login_sucess(data),
			error: (jqXHR, textStatus, errorThrown) => @on_login_error(jqXHR, textStatus, errorThrown)
		}
		
	on_login_sucess: (data) ->
		$("#header img").hide()
		
		Login.create({id: @email.val(), password: @password.val() , token: @token.val() })
		data = JSON.parse(data)
		products = []
		clients = []
		invoices = []
		
		for item in data
			if item
				if item.type == "Producto__c"
					products.push item
				else if item.type == "Cliente__c"
					clients.push item
				else if item.type == "Oportunidad__c"
					invoices.push item
			
		Client.trigger "load_from_server", clients
		Product.trigger "load_from_server", products
		Invoice.trigger "load_from_server", invoices

			
		@navigate("/view/cart","")
		
	on_login_error: (jqXHR, textStatus, errorThrown) =>
		
		$("#header img").hide()
		
		if jqXHR.status == 403
			alert "error ingresando al sistema por usuario y clave equivocado"
		else if textStatus == "timeout"
			alert "error ingresando al sistema o al servidor por problemas de internet"
		
		else
			@login_offline()
		

module.exports = Logins