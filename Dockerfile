# This is designed to be run from fig as part of a
# Marketplace development environment.

# NOTE: this is not provided for production usage.

FROM mozillamarketplace/centos-phantomjs-mkt:0.1

RUN mkdir -p /srv/fireplace
ADD src/.commonplace /srv/fireplace/.commonplace

RUN npm install -g commonplace@$(cat /srv/fireplace/.commonplace | python -c 'import sys, json; print json.load(sys.stdin)["version"]')

ADD package.json /srv/fireplace/package.json

WORKDIR /srv/fireplace
RUN npm install
