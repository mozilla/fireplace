import os
import re


# JS
blacklist = [
    'require.js',
    'suggestions.js',
    'jquery.cookie.js',
    'stick.js',
    'settings_inferno.js',
    'settings_travis.js'
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

css_files = css_pattern.findall(index_html)
output = []
for css_file in css_pattern.findall(index_html):
    with open('hearth%s' % css_file) as file_:
        output.append(file_.read())

with open('hearth/media/include.css', mode='wa') as inc:
    inc.write('\n'.join(output))
