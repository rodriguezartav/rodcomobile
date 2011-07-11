class Login extends Spine.Model
	
	@configure "Login", 
						 "password","token"
	
	@auth: (email,password) ->
		ret = null
		Login.each (login) ->
			if login.id == email && login.password == password
				ret= login
		
		return ret
	
	@isLogin = false
	
	
module.exports = Login
Login.extend(Spine.Model.Local);
