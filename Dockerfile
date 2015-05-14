# This is designed to be run from fig as part of a
# Marketplace development environment.

# NOTE: this is not provided for production usage.

FROM mozillamarketplace/centos-phantomjs-mkt:0.1

RUN mkdir -p /srv/fireplace

ADD package.json /srv/fireplace/package.json
ADD bower.json /srv/fireplace/bower.json

WORKDIR /srv/fireplace

RUN npm install
RUN make install
