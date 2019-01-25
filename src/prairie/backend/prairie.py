from function_process import execute, run_global
import numpy as np
import time

class Prairie:
    def __init__(self, ws):
        self._blocks = {}
        self.ws = ws

    def add_block(self, model, ws_handler):
        self._blocks[model['id']] = Block(model, self, ws_handler)

    def block(self, _id):
        return self._blocks[_id]

    def run_block(self, id):
        self.block(id).run()
        # self.describe()

    def describe(self):
        for block in self._blocks.keys():
            self._blocks[block].describe()

    def update_model(self, model, model_connections):
        for block_id in self._blocks.keys():
            if block_id in list(model.keys()):
                self.block(block_id).update_model(model[block_id])
                connections = [model_connections[connection_id] for
                               connection_id in [connections for
                               nodes_out in model[block_id]['nodes']['out'] for
                               connections in nodes_out['connections']]]

                self.block(block_id).update_connections(connections)
        self.ws.write_message({
            'header': 'update_done_run_model'
        })
        print('message sent')


class Block:
    def __init__(self, model, prairie, ws):

        self.name = model['name']
        self.script = model['script']
        self.id = model['id']
        self.prairie = prairie
        self._ready = False
        self.connected_in = False
        self.type = model['type']

        self.nodes_ids = {
            'in': [node['id'] for node in model['nodes']['in']],
            'out': [node['id'] for node in model['nodes']['out']]
        }

        self.nodes = {
            'in': {node_id: {
                'value': None,
                'ready': False,
                'name': model['nodes']['in'][i]['name']
            } for i,node_id in enumerate(self.nodes_ids['in'])},

            'out': {node_id: {
                'value': None,
                'ready': False,
                'name': model['nodes']['out'][i]['name']
            } for i,node_id in enumerate(self.nodes_ids['out'])}
        }

        self.connections = None
        self.value = model['value']
        self.ws = ws

        self.update_model(model)
        # self.describe()

    def update_connections(self, connections):
        self.connections = connections

    def update_model(self, model):
        if model['type'] in ['input', 'variable', 'code', 'static_code']:
            self.value = model['value']
            if len(self.nodes['in'].keys()) > 0 :
                self.set_nodes_values([list(self.nodes['in'].keys())[0]], [self.value], 'in')
        self.update_nodes_from_JSModel(model['nodes'])

    def update_connections_and_model(self, connections, model):
        self.update_connections(connections)
        self.update_model(model)

    def update_value(self, value):
        self.value = value
        self.get_nodes_values('in')[0] = self.value

    def run(self):
        if self.type != 'static_code':
            output = execute(
                self.script,
                self.name,
                args=self.get_nodes_values('in'))

            if output == 'Python_SPECIFIC_ERROR_CODE_001':
                self.return_execution_error()
            else:
                self.set_nodes_values(self.nodes_ids['out'], output, 'out')
                self.transfer_values()
                self.run_done()
                print(self.name + ' run ' + str(time.time()))
                # print([connection['block_in'] for connection in self.connections])
                for block_ids in [connection['block_in'] for connection in self.connections]:

                    block = self.prairie.block(block_ids)
                    # print(block.id, 'can run?: ', block.ready())
                    if block.ready():
                        # print(block.id, ' run')
                        block.run()
        else:
            output = run_global(self.get_nodes_values('in')[0])
            if output == 'Python_SPECIFIC_ERROR_CODE_001':
                self.return_execution_error()
            else:
                print(self.name + ' run ' + str(time.time()))


    def get_nodes_values(self, node_type):
        nodes = self.nodes[node_type]
        in_ids = self.nodes_ids[node_type]
        if self.type == 'code':
            out_ids = self.nodes_ids[node_type]
            nodes_values = [
                self.value,
                {nodes[_id]['name']: nodes[_id]['value'] for _id in in_ids}
                ]
            return nodes_values
        else:
            return [nodes[_id]['value'] for _id in in_ids]

    def set_nodes_values(self, ids, values, node_type):
        nodes = self.nodes[node_type]
        if node_type == 'out' and self.type == "code":
            for node_id in nodes.keys():
                if nodes[node_id]['name'] in values[0].keys():
                    nodes[node_id]['value'] = values[0][nodes[node_id]['name']]

        else:
            if len(ids) == len(values):
                for id, value in zip(ids, values):
                    nodes[id]['value'] = value
                    nodes[id]['ready'] = True
                    self._ready = all([node['ready'] for node in nodes.values()])

    def update_nodes_from_JSModel(self, nodes):
        print(self.name + ' updated from JS ' + str(time.time()))
        for node_type in ['in', 'out']:
            for node in nodes[node_type]:
                self.nodes[node_type][node['id']]['ready'] = node['ready']
        self._ready = all([node['ready'] for node in self.nodes['in'].values()])
        self.connected_in = all([node['connected'] for node in nodes['in']])

    def run_done(self):
        if self.type == 'output':
            value = self.get_nodes_values('out')[0]
            if isinstance(value, str):
                value = value
            else:
                value = str(value)
        elif self.type == 'plot':
            x = np.nan_to_num(self.get_nodes_values('out')[1])
            y = np.nan_to_num(self.get_nodes_values('out')[0])
            value = {
                'x': list(map(float, x)),
                'y': list(map(float, y))
            }
        elif self.type == 'image':
            d = self.get_nodes_values('out')[0]
            value = {
                'd': np.ndarray.tolist(d),
            }
        else:
            value = ""

        self.ws.write_message({
            'header': 'run_done',
            'value': value,
            'id': self.id
        })
        self.reset_nodes()

    def return_execution_error(self):
        self.ws.write_message({
            'header': 'run_error',
            # 'value':
            'id': self.id
        })


    def transfer_values(self):
        for connection in self.connections:
            if connection['block_out'] == self.id:
                block_in = self.prairie.block(connection['block_in'])
                block_in.set_nodes_values(
                    [connection['node_in']],
                    [self.nodes['out'][connection['node_out']]['value']],
                    'in')
                # print(self.id, ' transfer to ', block_in.id)

    def ready(self):
        return self._ready #and self.connected_in

    def reset_nodes(self):
        for node in self.nodes['in'].values():
            node['ready'] = False
            self._ready = all([node['ready'] for node in self.nodes['in'].values()])


    def describe(self):
        description = 'Block ---- ' + self.name + ' ----' + self.id + '\n'
        for id in self.nodes['in'].keys():
            if isinstance(self.nodes['in'][id]['value'], str):
                value = "'" + self.nodes['in'][id]['value'] + "'"
            else:
                value = str(self.nodes['in'][id]['value'])

            if len(value) > 60:
                value = value[0:50] + "......"

            description += ' |\t-> Node in  ' + \
                           id + \
                           '\t' + str(self.nodes['in'][id]['ready']) + \
                           '\t' + value + '\n'

        description += ' |\t------------------------------------------------------------------------------\n'

        for id in self.nodes['out'].keys():
            if isinstance(self.nodes['out'][id]['value'], str):
                value = "'" + self.nodes['out'][id]['value'] + "'"
            else:
                value = str(self.nodes['out'][id]['value'])

            if len(value) > 60:
                value = value[0:50] + "......"

            description += ' |\t<- Node out  ' + \
                           id + \
                           '\t' + str(self.nodes['out'][id]['ready']) + \
                           '\t' + value + '\n'

        print(description)
