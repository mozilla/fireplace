import json
from itertools import imap

import requests
from jinja2 import nodes
from jinja2.ext import Extension


class FakeNone(object):

    def __eq__(self, other):
        return other is None

    def __iter__(self):
        return iter([])

    def __getattr__(self, name):
        if not name.startswith('__'):
            return FakeNone()
        return super(FakeNone, self).__getattr__(name)

    def __getitem__(self, key):
        return FakeNone()

    def __html__(self):
        return ''

    def __int__(self):
        return 0

    def __float__(self):
        return 0.


class DictWrapper(object):

    def __init__(self, data):
        self.data = data

    def __contains__(self, name):
        return name in self.data

    def _wrap(self, item):
        if isinstance(item, (list, dict, tuple, set)):
            return DictWrapper(item)
        else:
            return item

    def __getattr__(self, name):
        if name != 'data' and name in self.data:
            return self._wrap(self.data.get(name, FakeNone()))
        else:
            return super(DictWrapper, self).__getattr__(name)

    def __getitem__(self, key):
        try:
            return self._wrap(self.data.get(key) or self.data.__getitem__(key))
        except Exception as e:
            return FakeNone()

    def __repr__(self):
        return json.dumps(self.data)

    def __iter__(self):
        return imap(self._wrap, self.data)


class Defer(Extension):
    tags = set(['defer'])

    def parse(self, parser):
        lineno = parser.stream.next().lineno

        args = parser.parse_call(None)
        # parser.stream.expect('lparen')
        # args = {}
        # while parser.stream.current.type != 'rparen':
        #     if args:
        #         parser.stream.expect('comma')
        #     name = parser.parse_assign_target(name_only=True)
        #     parser.stream.expect('assign')
        #     args[name] = parser.parse_expression()
        # parser.stream.expect('rparen')

        body = parser.parse_statements(
            ['name:placeholder', 'name:empty', 'name:except', 'name:end'])

        empty = None
        except_ = None

        # Ignore placeholder blocks, we're on the internet.
        if parser.stream.current[2] == 'placeholder':
            parser.stream.expect('name')
            #parser.stream.expect('block_end')
            parser.parse_statements(
                ['name:empty', 'name:except', 'name:end'])

        # Save empty and except blocks.
        if parser.stream.current[2] == 'empty':
            parser.stream.expect('name')
            empty = parser.parse_statements(['name:except', 'name:end'])
        if parser.stream.current[2] == 'except':
            parser.stream.expect('name')
            except_ = parser.parse_statements(['name:end'])

        parser.stream.expect('name')

        return nodes.CallBlock(
            self.call_method('_run', *args),
            [nodes.Name('this', 'store'), nodes.Name('response', 'store')], [], body,
            lineno=lineno)

    def _run(self, *args, **kwargs):
        """Helper callback."""
        
        url = kwargs.get('url')
        caller = kwargs.get('caller')

        print 'GETing %s' % url
        response = requests.get(url)
        print 'GOT %s' % url
        output = DictWrapper(response.json())
        print 'Starting render...'

        this = output
        if 'pluck' in kwargs:
            this = this[kwargs['pluck']]

        output = caller(this, output)

        return output
