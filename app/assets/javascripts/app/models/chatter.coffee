class Chatter extends Spine.Model
	@configure "Chatter", "temp_val"

	@to_apex: ( title , body ) ->
		obj = ["type","CollaborationGroupFeed", "ParentId", "0F9A0000000PEvA", "Type", "TextPost", "Body", body , "Title", title ]
		JSON.stringify(obj)
		
module.exports = Chatter
