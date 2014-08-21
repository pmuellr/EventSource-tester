/* Licensed under the Apache License. See footer for details. */

var eventSource

$(main)
$(setInterval(checkEventSourceClosed, 5000))

//------------------------------------------------------------------------------
function main() {
  if (eventSource) eventSource.close()

  eventSource = new EventSource("events")

  eventSource.onopen    = onOpen
  eventSource.onerror   = onError
  eventSource.onmessage = onMessage

  eventSource.addEventListener("time", onTimeEvent, false)
}

//------------------------------------------------------------------------------
function checkEventSourceClosed() {
  if (eventSource.readyState != EventSource.CLOSED) return

  log("eventSource: closed")

  main()
}

//------------------------------------------------------------------------------
function onOpen(event) {
  // event origin is `undefined` here!
  // if (!validOrigin(event)) return;

  log("eventSource: open")
}

//------------------------------------------------------------------------------
function onError(event) {
  // event origin is `undefined` here!
  // if (!validOrigin(event)) return;

  var readyState = ReadyStates[event.target.readyState]
  log("eventSource: error:       `" + event.type + "`; readyState: " + readyState)
}

//------------------------------------------------------------------------------
function onMessage(event) {
  if (!validOrigin(event)) return

  log("eventSource: message:     `" + event.data + "`")
}

//------------------------------------------------------------------------------
function onTimeEvent(event) {
  if (!validOrigin(event)) return

  log("eventSource: event: time: `" + event.data + "`")
}

//------------------------------------------------------------------------------
function validOrigin(event) {
  if (document.location.origin == event.origin) return true

  log("invalid origin for event type: " + event.type + ": " + event.origin)
  return false
}

//------------------------------------------------------------------------------
function log(message) {
  var date = new Date().toISOString().replace("T", " ")
  $(".log").append(htmlEscape(date + " - " + message) + "\n")
  window.scrollTo(0,10000000)
}

//------------------------------------------------------------------------------
function htmlEscape(string) {
  return $("<div/>").text(string).html()
}

//------------------------------------------------------------------------------
var ReadyStates = []

ReadyStates[EventSource.CONNECTING] = "CONNECTING"
ReadyStates[EventSource.OPEN]       = "OPEN"
ReadyStates[EventSource.CLOSED]     = "CLOSED"

/*
#-------------------------------------------------------------------------------
# Copyright IBM Corp. 2014
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
//------------------------------------------------------------------------------
*/
