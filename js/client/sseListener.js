"use strict"

define (['jquery'], function($){
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



  //** Device State Listener **********************************************************************/
  var initDeviceStateListener = function initDeviceStateListener() {
    console.log('SSE enabled')
    enableSSE(updateDeviceState, '/?module=sse&stream=deviceState')
  }

  var updateDeviceState = function updateDeviceState(event) {
    console.log(event.data)
    var data = JSON.parse(event.data)
    var $deviceElt = $('[data-role=ghome-state][data-device-id='+ data.deviceId +']')
    
    $deviceElt.html(data.value)

    if ($deviceElt.attr('data-use-style')) {
      $deviceElt.addClass(data.style)
    }
  }

  return {
    'enableSSE'                : enableSSE
    , 'disableSSE'             : disableSSE
    , 'config'                 : config
    , 'initDeviceStateListener': initDeviceStateListener
  }
})

