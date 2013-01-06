require.config({ 
    baseUrl: "js"
  , paths: {  
   "jquerymobile": "vendor/jquery.mobile-1.2.0.min"
  }
  , shim : {
    "jquerymobile" : ['jquery']
  }
});


require(["jquery", "sseListener", "jquerymobile"], function($,sseListener) {
    $(function() {
        $('body').css('visibility', 'visible');
        console.log($);
        console.log(sseListener);

        $('#sseToggle').change(function() { sseListener.switchSSE($(this).val() == 'on') });
    });
});