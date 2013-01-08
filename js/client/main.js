require.config({ 
    baseUrl: "js/client"
  , paths: {  
   "jquerymobile": "../vendor/jquery.mobile-1.2.0.min"
  }
  , shim : {
    "jquerymobile" : ['jquery']
  }
})


require(["jquery", "sseListener", "jquerymobile"], function($,sseListener) {
    $(function() {
        $('body').css('visibility', 'visible')
        console.log($)
        console.log(sseListener)

        var onSSERecieved = function(e) {
          $('#sseOutput').append("<br />" + e.data)
        }

        $('#sseToggle').change(function() { 
          if ($(this).val() == 'on') {
            sseListener.enableSSE(onSSERecieved)
          } else {
            sseListener.disableSSE()
            $('#sseOutput').html('')
          }
        })
    })
})