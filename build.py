import os

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
