let setupDone = false;

export function setupWAMPCompatTransport() {
  if (setupDone) return;
  setupDone = true;

  let autobahn: any;
  try {
    autobahn = require("autobahn");
  } catch (e) {
    console.warn("autobahn not available, WAMP compat transport not set up");
    return;
  }

  class WAMPCompatWebsocketFactory {
    type = "websocket";
    _options: any;

    constructor(options: any) {
      options.protocols = ["wamp.json"];

      if (!options.serializers) {
        const { JSONSerializer } = autobahn.serializer;
        options.serializers = [new JSONSerializer()];
      }

      this._options = options;
    }

    create() {
      const self = this;
      const log = require("autobahn/lib/log.js");

      const transport: any = {};

      transport.protocol = undefined;
      transport.serializer = undefined;
      transport.send = undefined;
      transport.close = undefined;

      transport.onmessage = function () { };
      transport.onopen = function () { };
      transport.onclose = function () { };

      transport.info = {
        type: "websocket",
        url: self._options.url,
        protocol: null,
      };

      (() => {
        let websocket: any;

        const wsOptions: any = {};
        if (self._options.protocols) {
          wsOptions.protocols = self._options.protocols;
        }
        if (self._options.headers) {
          wsOptions.headers = self._options.headers;
        }

        websocket = new WebSocket(self._options.url, wsOptions);

        websocket.binaryType = "arraybuffer";

        websocket.onmessage = function (evt: any) {
          log.debug("WebSocket transport receive", evt.data);
          transport.onmessage(transport.serializer.unserialize(evt.data));
        };

        websocket.onopen = function () {
          // We only ever register a single JSONSerializer, use it directly.
          transport.serializer = self._options.serializers[0];
          transport.info.protocol = websocket.protocol;
          transport.onopen();
        };

        websocket.onclose = function (evt: any) {
          const details = {
            code: evt.code,
            reason: evt.reason,
            wasClean: evt.wasClean,
          };
          transport.onclose(details);
        };

        transport.send = function (msg: any) {
          const payload = transport.serializer.serialize(msg);
          log.debug("WebSocket transport send", payload);
          websocket.send(payload);
        };

        transport.close = function (code?: number, reason?: string) {
          websocket.close(code, reason);
        };
      })();

      return transport;
    }
  }

  autobahn.transports.register("websocket", WAMPCompatWebsocketFactory);
}
