import os
import re
import time


blacklist = [
    'jquery.cookie.js',
    'require.js',
    'settings_inferno.js',
    'settings_local.js',
    'settings_travis.js',
    'stick.js',
    'suggestions.js',

    'splash.styl.css',
]

output = []

for root, _, files in os.walk('hearth/media/js'):
    for f in files:
        if not f.endswith('.js'):
            continue
        if f in blacklist:
            continue
        with open(os.path.join(root, f)) as file_:
            output.append(file_.read())

with open('hearth/templates.js') as file_:
    output.append(file_.read())

with open('hearth/media/include.js') as inc:
    inc_data = inc.read()

with open('hearth/media/include.js', mode='w') as inc:
    inc.write(inc_data.replace("'replace me'", '\n'.join(output)))


# CSS
css_pattern = re.compile(r'href="(\/media\/css\/.+\.styl\.css)"', re.I)
with open('hearth/index.html') as file_:
    index_html = file_.read()

timestamp = int(time.time())

css_files = css_pattern.findall(index_html)
output = []
for css_file in css_pattern.findall(index_html):
    if css_file.split('/')[-1] in blacklist:
        continue
    with open('hearth%s' % css_file) as file_:
        output.append(file_.read())

with open('hearth/media/include.css', mode='wa') as inc:
    rewritten_output = '\n'.join(output)

    def bust(img):
        url = img.group(1).strip('"\'')
        if url.startswith('data:') or url.startswith('http'):
            return "url(%s)" % url

        if '#' in url:
            url, hash = url.split('#', 1)
            return "url(%s?%d#%s)" % (url, timestamp, hash)
        else:
            return "url(%s?%d)" % (url, timestamp)

    rewritten_output = re.sub('url\(([^)]*?)\)', bust, rewritten_output)

    inc.write(rewritten_output)
