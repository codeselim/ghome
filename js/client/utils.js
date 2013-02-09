"use strict"

define(function(){
	//* Returns JSON from a "aa=yy&bb=zz" string 
	var queryStringToHash = function queryStringToHash  (query) {
		var query_string = {}
		var vars = query.split("&")
		for (var i=0;i<vars.length;i++) {
			var pair = vars[i].split("=")
			pair[0] = decodeURIComponent(pair[0])
			pair[1] = pair[1].replace(/\+/g,' ')
			pair[1] = decodeURIComponent(pair[1])
				// If first entry with this name
			if (pair[1] != "") {
				console.log(pair[0])
				if (typeof query_string[pair[0]] === "undefined") {
					query_string[pair[0]] = pair[1]
					// If second entry with this name
				} else if (typeof query_string[pair[0]] === "string") {
					var arr = [ query_string[pair[0]], pair[1] ]
					query_string[pair[0]] = arr
					// If third or later entry with this name
				} else {
					query_string[pair[0]].push(pair[1])
				}
			}
		} 
		return query_string
	}



	var initMessages = function() {
		var $msg = $('#messages')
		if ($msg.find('li').length == 0) {
			$msg.hide()
		} else {
			$msg.find('li a').each(function(index, $item) {
				$(this).click(removeMessage)
			})
		}
	}

	var removeMessage = function(){
		console.log('remove!')
		$(this).parent().parent().parent().remove()
		var $msg = $('#messages')
		$msg.listview('refresh')
		if ($msg.find('li').length == 0) {
			$msg.hide()
		}
	}

	var addMessage = function(level, message) {
		var theme
		switch (level) {
			case 'error':
				theme = 'f'
				break
			case 'success':
				theme = 'g'
				break
			default:
				return
		}
		var $msg = $('#messages')
		$msg.append('<li data-theme='+ theme +' data-icon="delete" ><a href="#"><span class="'+ level +'">'+ message +'</span></a></li>');
			
		$msg.find('li:last a').click(removeMessage)
		$msg.listview('refresh')
		$msg.show()
	}

	return {
		  queryStringToHash: queryStringToHash
		, initMessages:initMessages
		, removeMessage:removeMessage
		, addMessage:addMessage
	}
})