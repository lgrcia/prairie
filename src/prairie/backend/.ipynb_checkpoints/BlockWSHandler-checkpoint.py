from function_process import execute
import tornado.websocket
import json
from util import clean_prairie_id


class BlockWSHandler(tornado.websocket.WebSocketHandler):

    def initialize(self, prairie, model):
        self.prairie = prairie
        self.prairie.add_block(model, self)

    def data_received(self, chunk):
        pass

    def open(self):
        # print('connected')
        pass

    def on_message(self, message):
        process_dict = json.loads(message)
        if process_dict['header'] == 'run':
            self.write_message({
                'header': 'run_started',
                'id': process_dict['id']
            })

            self.prairie.run_block(process_dict['id'])
            # self.on_run_done(process_dict['id'])

        # elif process_dict['header'] == 'update':
        #     self.prairie.block(process_dict['id']).update_connections_and_model(
        #         process_dict['connections'],
        #         process_dict['model']
        #     )

    def on_run_done(self, id):
        self.write_message({
            'header': 'run_done',
            'id': id,
        })

    def on_close(self):
        # print('connection closed')
        pass

    def check_origin(self, origin):
        return True
