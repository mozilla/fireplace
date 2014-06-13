import os

import fabdeploytools.envs
from fabric.api import env, lcd, local, task
from fabdeploytools import helpers

import deploysettings as settings

env.key_filename = settings.SSH_KEY
fabdeploytools.envs.loadenv(settings.CLUSTER)
ROOT, FIREPLACE = helpers.get_app_dirs(__file__)

COMMONPLACE = '%s/node_modules/commonplace/bin' % FIREPLACE
GRUNT = '%s/node_modules/grunt-cli/bin' % FIREPLACE

if settings.ZAMBONI_DIR:
    ZAMBONI = '%s/zamboni' % settings.ZAMBONI_DIR
    ZAMBONI_PYTHON = '%s/venv/bin/python' % settings.ZAMBONI_DIR
    FIREPLACE_PACKAGE = '%s/package/archives/latest_%s.zip' % (FIREPLACE,
                                                               settings.ENV)

os.environ["PATH"] += os.pathsep + os.pathsep.join([COMMONPLACE, GRUNT])


@task
def pre_update(ref):
    with lcd(FIREPLACE):
        local('git fetch')
        local('git fetch -t')
        local('git reset --hard %s' % ref)


@task
def update():
    with lcd(FIREPLACE):
        local('npm install')
        local('npm install --force commonplace@0.3.2')

        if settings.ZAMBONI_DIR:
            build_package()

        local('commonplace includes')
        local('commonplace langpacks')


@task
def deploy():
    if settings.ZAMBONI_DIR:
        upload_package()

    helpers.deploy(name=settings.PROJECT_NAME,
                   app_dir='fireplace',
                   env=settings.ENV,
                   cluster=settings.CLUSTER,
                   domain=settings.DOMAIN,
                   root=ROOT)


@task
def pre_update_latest_tag():
    current_tag_file = os.path.join(FIREPLACE, '.tag')
    latest_tag = helpers.git_latest_tag(FIREPLACE)
    with open(current_tag_file, 'r+') as f:
        if f.read() == latest_tag:
            print 'Environment is at %s' % latest_tag
        else:
            pre_update(latest_tag)
            f.seek(0)
            f.write(latest_tag)
            f.truncate()


@task
def build_package():
    with lcd(FIREPLACE):
        local('make package_%s' % settings.ENV)


@task
def upload_package():
    with lcd(ZAMBONI):
        local('%s manage.py --settings=settings_local_mkt '
              'upload_new_marketplace_package %s %s '
              % (ZAMBONI_PYTHON, 'marketplace', FIREPLACE_PACKAGE))
