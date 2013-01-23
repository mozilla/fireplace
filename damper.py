#!/usr/bin/env python
import os
import re
import SocketServer
import sys
import time
from SimpleHTTPServer import SimpleHTTPRequestHandler


towatch = set()
includes = {}
touched_files = lambda: set((f, os.stat(f).st_mtime) for f in towatch)


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
    before = touched_files()
    while 1:
        for file_ in towatch:
            if not os.path.exists(file_):
                # File was deleted!
                towatch.remove(file_)
        after = touched_files()
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
                body = fd.read()
            imp = re.search('@import (.+);', body)
            if imp:
                imp_file = imp.group(1).strip('"').strip("'").strip()
                if not imp_file.endswith('.less'):
                    imp_file += '.less'
                imp_file = root + '/' + imp_file
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
