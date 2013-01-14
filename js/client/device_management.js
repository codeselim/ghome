define(['jquery'], function($){
	var listItemTemplate = '<li><a data-transition="fade" href="#">Template</a></li>'


  var pageInit = function() {
    console.log('device management pageInit')
    $('#test').click(test)
  }

  var test = function() {
		$('#deviceList').append(listItemTemplate)
    $('#deviceList').listview('refresh')
  }

  return {
    'pageInit' : pageInit
    , 'test' : test
  }
})

