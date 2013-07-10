from fabric.api import env, lcd, local, task
import fabdeploytools.envs
from fabdeploytools import helpers

import deploysettings as settings

env.key_filename = settings.SSH_KEY
fabdeploytools.envs.loadenv(settings.CLUSTER)
ROOT, FIREPLACE = helpers.get_app_dirs(__file__)


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
        local('make includes')


@task
def deploy():
    helpers.deploy(name='fireplace',
                   env=settings.ENV,
                   cluster=settings.CLUSTER,
                   domain=settings.DOMAIN,
                   root=ROOT)
