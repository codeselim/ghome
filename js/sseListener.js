define (function(){
  var source;
  var outputId = 'sseOutput';
  var sseSource = "/sse.html";

  var listenSSE = function() {
    source = new EventSource(sseSource);
    source.onmessage = function (e) {
      console.log(e);
    }
    source.addEventListener('message', function(e) {
      $('#'+outputId).append("<br />" + e.data);
    }, false);

    source.addEventListener('open', function(e) {
      $('#'+outputId).append("<br /><strong>Opened</strong>");
    }, false);

    source.addEventListener('error', function(e) {
      if (e.readyState == EventSource.CLOSED) {
        $('#'+outputId).append("<br /><strong>Closed</strong>");
      }
    }, false);
  };

  var switchSSE = function(enabled) {
    if (enabled) {
      listenSSE();
    } else {
      if (source) {
        source.close();
        $('#'+outputId).html('');
      }
    }
  };

  return {
    'switchSSE': switchSSE
  };
});

