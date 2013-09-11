REPO = "fireplace"
UUID = "8af8c763-da9b-444d-a911-206f9e225b55"
VERSION = `date "+%Y.%m.%d_%H.%M.%S"`
VERSION_INT = $(shell date "+%Y%m%d%H%M%S")
TMP = _tmp

compile:
	commonplace compile

test: clean compile
	cd smokealarm ; \
	casperjs test tests

package: compile
	cd hearth/ && zip -r ../$(VERSION).zip * && cd ../

# This is what the iframe src points to.
DOMAIN?=marketplace.firefox.com

# This is what the app will be named on the device.
NAME?=Marketplace

log: clean
	@mkdir -p TMP && cp -pR yulelog/* TMP/.
	@# We have to have a temp file to work around a bug in Mac's version of sed :(
	@sed -i'.bak' -e 's/marketplace\.firefox\.com/$(DOMAIN)/g' TMP/main.js
	@sed -i'.bak' -e 's/{version}/$(VERSION_INT)/g' TMP/manifest.webapp
	@sed -i'.bak' -e 's/"Marketplace"/"$(NAME)"/g' TMP/manifest.webapp
	@rm -f TMP/*.bak
	@cd TMP && zip -q -r ../yulelog_$(NAME)_$(VERSION_INT).zip * && cd ../
	@rm -rf TMP
	@echo "Created file: yulelog_$(NAME)_$(VERSION_INT).zip"

clean:
	commonplace clean

deploy:
	git fetch && git reset --hard origin/master && npm install && make includes
