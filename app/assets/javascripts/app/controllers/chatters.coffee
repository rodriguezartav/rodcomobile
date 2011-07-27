Login = require("models/login")
Chatter = require("models/chatter")

class Chatters extends Spine.Controller

	elements:
		"#chatter_post" : "body",

	events:
		"click .button" : "send"

	constructor: ->
		super

	send: ->
		$("#header img").show()
		user = Login.last()	
		body = @body.val()
		chatterArr =   ["type","FeedItem", "ParentId", "0F9A0000000PEvA", "Type", "TextPost", "Body", body  ] 
		js = JSON.stringify(chatterArr)
		
		query = 'email=' + user.id + '&password=' + user.password + '&token=' + user.token + '&oportunidades=' + JSON.stringify( [js] )
		
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
		@body.val("")
		alert "Ok enviado" + data
	
	on_send_error: (jqXHR, textStatus, errorThrown) ->
		$("#header img").hide()
		error = "Error enviando el pedido al servidor " + errorThrown + " " + textStatus 
		alert(error);
		window.sendError(error);

module.exports = Chatters