define (function(){
  var sources = []
  var config = {
    'defaultSource' : '/sse'
  }

  /**
   * Starts listening to SSE from the given source
   *
   * @param {function} outputFunction Will be executed when an event is recieved. Takes the event
   *  as parameter
   * @param {string} sourceUrl defaults to <code>config.defaultSource</code>
   */
  var enableSSE = function(outputFunction, sourceUrl) {
    if (typeof(outputFunction) != 'function') {
      console.error('No output function')
      return
    }
    sourceUrl = sourceUrl? sourceUrl : config.defaultSource
    sources[sourceUrl] = new EventSource(sourceUrl)

    sources[sourceUrl].addEventListener('message', function(e) {
      outputFunction(e)
    }, false)

    // sources[sourceUrl].addEventListener('open', function(e) {
    //   console.log("Opened SSE source " + sourceUrl)
    // }, false)

    // sources[sourceUrl].addEventListener('error', function(e) {
    //   if (e.readyState == EventSource.CLOSED) {
    //     $('#'+outputId).append("<br /><strong>Closed</strong>")
    //   }
    // }, false)
  }

  /**
   * Closes the given event source 
   *
   * @param {string} sourceUrl defaults to <code>config.defaultSource</code>
   */
  var disableSSE = function(sourceUrl) {
    sourceUrl = sourceUrl? sourceUrl : config.defaultSource
    if (sources[sourceUrl]) {
      sources[sourceUrl].close()
    }
  }

  return {
    'enableSSE'   : enableSSE
    , 'disableSSE': disableSSE
    , 'config'    : config
  }
})

