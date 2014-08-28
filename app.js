// Licensed under the Apache License. See footer for details.

hapi  = require("hapi")
cfenv = require("cfenv")

//------------------------------------------------------------------------------
appEnv = cfenv.getAppEnv()

Listeners = {}

if (require.main === module) { main() }

//------------------------------------------------------------------------------
function main() {
  var server = hapi.createServer(appEnv.bind, appEnv.port, {})

  // events
  server.route({
    method:  "GET",
    path:    "/events",
    handler: onEventsRequest
  })

  // static files
  server.route({
    method:  "GET",
    path:    "/{param*}",
    handler: { directory: { path: "www", index: true } }
  })

  server.start(onServerStarted)

  setInterval(onInterval, 5000)
}

//------------------------------------------------------------------------------
function onServerStarted() {
  log("server running at " + appEnv.url)
}

//------------------------------------------------------------------------------
function onEventsRequest(request, reply) {
  var id       = request.id
  var response = request.raw.res  // http's response object
  var listener = {request: request, response: response}

  if (!initEventResponse(request, response, reply)) return

  logi("request for " + request.path)

  Listeners[id] = listener

  response.on("error", onError)
  response.on("close", onClose)

  //-----------------------------------
  function onError(err) {
    delete Listeners[id]

    logi("error: " + err)
  }

  //-----------------------------------
  function onClose() {
    delete Listeners[id]

    logi("close")
  }

  //-----------------------------------
  function logi(message) {
    log("listener: " + id + ": " + message)
  }
}

//------------------------------------------------------------------------------
function initEventResponse(request, response, reply) {
  var message = "expecting an Accept header of `text/event-stream`"

  if (request.headers.accept != 'text/event-stream') {
    message += " was: `" + request.headers.accept + "`"

    console.log(message)

    reply(message)
      .code(500)
      .type("text/plain")

    return false
  }

  response.writeHead(200, {
    "Content-Type":  "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection":    "keep-alive"
  })

  return true
}

//------------------------------------------------------------------------------
function onInterval() {
  var listener
  var message

  for (var id in Listeners) {
    listener = Listeners[id]

    message = {time: new Date}
    message = "data: " + JSON.stringify(message) + "\n\n"
    listener.response.write(message)

    message = {curr: new Date}
    message = "event: time\ndata: " + JSON.stringify(message) + "\n\n"
    listener.response.write(message)
  }
}

//------------------------------------------------------------------------------
function log(message) {
  var date = new Date().toISOString().replace("T", " ")
  console.log(date + " - " + message)
}
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
#-------------------------------------------------------------------------------
*/
