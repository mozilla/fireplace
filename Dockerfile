# This is designed to be run from fig as part of a
# Marketplace development environment.

# NOTE: this is not provided for production usage.

FROM mozillamarketplace/centos-phantomjs-mkt:0.1

RUN mkdir -p /srv/fireplace
ADD src/.commonplace /srv/fireplace/.commonplace

RUN npm install -g commonplace@$(cat /srv/fireplace/.commonplace | python -c 'import sys, json; print json.load(sys.stdin)["version"]')

# Temporarily patch fireplace's polling interval until we are using the updated damper.
RUN sed -i 's/interval: 250/interval: 5000/' /usr/lib/node_modules/commonplace/bin/damper

ADD package.json /srv/fireplace/package.json

WORKDIR /srv/fireplace
RUN npm install
