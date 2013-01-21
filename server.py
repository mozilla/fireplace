#!/usr/bin/env python
import os
import re
import SocketServer
import sys
import time
from SimpleHTTPServer import SimpleHTTPRequestHandler


towatch = set()
includes = {}


def say(s):
    print '[%s] %s' % (time.strftime('%X'), s)


def render_list(files):
    if not files:
        return
    for file_ in files:
        command = 'lessc %s %s.css' % (file_, file_)
        print command
        os.system(command)
        if file_ in includes:
            say('re-compiling %d dependencies' % len(includes[file_]))
            render_list(includes[file_])
    say('re-compiled %d files' % len(files))


def watch():
    say('watching %d files...' % len(towatch))
    before = set([(f, os.stat(f).st_mtime) for f in towatch])
    while 1:
        for deleted in (x for x in towatch if not os.path.exists(x)):
            towatch.remove(deleted)
        after = set([(f, os.stat(f).st_mtime) for f in towatch])
        render_list([f for f, d in before.difference(after)])
        before = after
        time.sleep(0.5)


class Handler(SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        SimpleHTTPRequestHandler.__init__(self, *args, **kwargs)
        self.extensions_map['.webapp'] = 'application/x-web-app-manifest+json'


if not os.fork():
    # Less file watcher

    for root, dirs, files in os.walk('./hearth/media'):
        less = set('%s/%s' % (root, f) for f in files if f.endswith('.less'))
        for file_ in less:
            with open(file_, 'r') as fd:
                body = post_file = fd.read()
            imp = re.search('@import \'([a-zA-Z0-9_-]+)\';', body)
            if imp:
                imp_file = '%s/%s.less' % (root, imp.group(1))
                includes.setdefault(imp_file, []).append(file_)

        if '.git' in dirs:
            dirs.remove('.git')
        towatch |= less

    render_list([x for x in towatch if not os.path.exists(x + '.css')])
    watch()
else:
    # HTTP server

    if len(sys.argv) < 3:
        print "Host and port not specified. :("
    else:
        os.chdir('./hearth')
        host, port = sys.argv[1:3]
        port = int(port)
        httpd = SocketServer.TCPServer((host, port), Handler)
        print "Starting server on port %d" % port
        httpd.serve_forever()
