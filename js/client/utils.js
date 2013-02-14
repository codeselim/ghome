"use strict"

define(function(){
	//* Returns JSON from a "aa=yy&bb=zz" string 
	var queryStringToHash = function queryStringToHash  (query) {
		if (!query) {
			return {}
		}
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

	var getFieldsValues = function($nodes) {
		var fields = {}
		$nodes.each(function() {
			var nodeVal = $(this).val()
			var floatVal
			if ( (floatVal = parseFloat(nodeVal)) ) {
				nodeVal = floatVal
			}
			var nodeName = $(this).attr('name')
			if (nodeVal && nodeName) {
				if (typeof fields[nodeName] === "undefined") { // no value
					fields[nodeName] = nodeVal
				} else if (typeof fields[nodeName] === "object") { // array exists
					fields[nodeName].push(nodeVal)
				} else { //* Other value: number or string: create an array
					var tmpArray = [fields[nodeName], nodeVal]
					fields[nodeName] = tmpArray
				}
			}
		})
		return fields
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

	var errorPlacementFix = function(error, element) {
		//* Needed to place the error message out of the select menu.
		if (element.is('select')) {
			error.insertAfter($(element).parent())
		} else {
			error.insertAfter(element)
		}
	}


	return {
		  queryStringToHash: queryStringToHash
		, initMessages:initMessages
		, removeMessage:removeMessage
		, addMessage:addMessage
		, getFieldsValues: getFieldsValues
		, errorPlacementFix: errorPlacementFix
	}
})