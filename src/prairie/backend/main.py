import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import tornado.websocket
import socket
import numpy as np
import json
import re
import prairie
import sys

import BlockWSHandler
from function_process import execute

PORT = sys.argv[2]
MAIN_SERVER_NETWORK = sys.argv[1]


class MainControllerWSHandler(tornado.websocket.WebSocketHandler):

    def initialize(self):
        self.prairie = prairie.Prairie(self)

    def open(self):
        print('prairie connected')

    def on_message(self, message):
        # print(message)
        action = json.loads(message)
        if action['header'] == 'create_WS':
            # print(action['id'] + ' WS created')
            self.application.add_handlers(r".*",
                                          [(re.escape('/' + action['id']), BlockWSHandler.BlockWSHandler, {
                                              'prairie': self.prairie,
                                              'model': action['model']
                                          })])
            # Prairie.add_block(action['model'])
            self.write_message({'header': 'BlockClientWS_creation', 'id': action['id']})

        elif action['header'] == 'update':
            self.prairie.update_model(action['model'], action['model_connections'])

    def on_close(self):
        tornado.ioloop.IOLoop.instance().stop()
        print('connection closed')

    def check_origin(self, origin):
        return True


MainControllerApplciation = tornado.web.Application([
    (re.escape('/' + str(MAIN_SERVER_NETWORK)), MainControllerWSHandler),
])

if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(MainControllerApplciation)
    http_server.listen(PORT)
    myIP = socket.gethostbyname(socket.gethostname())
    print('WS ' + str(MAIN_SERVER_NETWORK) + ' ready')
    sys.stdout.flush()
    # print('*** Websocket Main Server Started at %s***' % myIP)
    # sys.stdout.flush()
    tornado.ioloop.IOLoop.instance().start()
