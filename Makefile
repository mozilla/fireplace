gulp:
	@node_modules/.bin/gulp

init:
	@npm install
	@node_modules/.bin/bower install
	@node_modules/.bin/gulp update
	@cp src/media/js/settings_local.js.dist src/media/js/settings_local.js

update:
	@node_modules/.bin/gulp update

build:
	@node_modules/.bin/gulp build

css:
	@node_modules/.bin/gulp css_compile

templates:
	@node_modules/.bin/gulp templates_build

clean:
	@node_modules/.bin/gulp clean

serve:
	@node_modules/.bin/gulp

REPO = "fireplace"
UUID = "e6a59937-29e4-456a-b636-b69afa8693b4"
VERSION = `date "+%Y.%m.%d_%H.%M.%S"`
VERSION_INT = $(shell date "+%Y%m%d%H%M%S")
TMP = _tmp
SHELL = /bin/bash
CASPERJS_BIN ?= 'casperjs'

# This is what Yulelog's iframe src points to.
DOMAIN?=marketplace.firefox.com

# This is what the app will be named on the device.
NAME?=Marketplace

# This is for `package` (choices: prod, stage, dev).
SERVER?=prod

# This is the origin of the package.
ORIGIN?=app:\/\/packaged.marketplace.firefox.com

test: css templates
	LC_ALL=en-US $(CASPERJS_BIN) test tests/ui/

# Fireplace (real packaged app)
package: clean build
	@rm -rf TMP
	@rm -rf src/downloads/icons/*
	@rm -rf src/downloads/screenshots/*
	@rm -rf src/downloads/thumbnails/*
	@mkdir -p TMP
	@commonplace langpacks
	@cp -r src TMP/src

	@mv TMP/src/media/js/settings_package_$(SERVER).js TMP/src/media/js/settings_local_package.js
	@rm -rf TMP/src/media/js/{settings_local_hosted.js,settings_package_*.js}

	@# We have to have a temp file to work around a bug in Mac's version of sed :(
	@sed -i'.bak' -e 's/"Marketplace"/"$(NAME)"/g' TMP/src/manifest.webapp
	@sed -i'.bak' -e 's/marketplace\.firefox\.com/$(DOMAIN)/g' TMP/src/manifest.webapp
	@sed -i'.bak' -e 's/{launch_path}/app.html/g' TMP/src/manifest.webapp
	@sed -i'.bak' -e 's/{fireplace_origin}/$(ORIGIN)/g' TMP/src/manifest.webapp
	@sed -i'.bak' -e 's/{fireplace_package_version}/$(VERSION_INT)/g' TMP/src/{manifest.webapp,media/js/include.js,app.html}

	@rm -rf package/archives/latest_$(SERVER)
	@mkdir -p package/archives/latest_$(SERVER)
	@rm -f package/archives/latest_$(SERVER).zip

	@pushd TMP/src && \
		cat ../../package/files.txt | sed '/^#/ d' | zip -9 -r ../../package/archives/$(NAME)_$(SERVER)_$(VERSION_INT).zip -@ && \
		popd
	@echo "Created package: package/archives/$(NAME)_$(SERVER)_$(VERSION_INT).zip"
	@cp package/archives/$(NAME)_$(SERVER)_$(VERSION_INT).zip package/archives/latest_$(SERVER).zip
	@echo "Created package: package/archives/latest_$(SERVER).zip"

	@pushd package/archives/latest_$(SERVER) && \
		unzip ../latest_$(SERVER).zip && \
		popd
	@echo "Unzipped latest package: package/archives/latest_$(SERVER)/"

	@rm -rf TMP
package_prod:
	make package
package_stage:
	SERVER='stage' NAME='Stage' DOMAIN='marketplace.allizom.org' \
    ORIGIN='app:\/\/packaged.marketplace.allizom.org' make package
package_dev:
	SERVER='dev' NAME='Dev' DOMAIN='marketplace-dev.allizom.org' \
    ORIGIN='app:\/\/packaged.marketplace-dev.allizom.org' make package
package_altdev:
	SERVER='altdev' NAME='AltDev' DOMAIN='marketplace-altdev.allizom.org' make package
package_paymentsalt:
	SERVER='paymentsalt' NAME='PaymentAlt' DOMAIN='payments-alt.allizom.org' \
    ORIGIN='app:\/\/packaged.payments-alt.allizom.org' make package


serve_package:
	@open 'http://localhost:8676/app.html'
	@pushd package/archives/latest_$(SERVER) && \
		python -m SimpleHTTPServer 8676
serve_package_prod:
	make serve_package
serve_package_stage:
	SERVER='stage' make serve_package
serve_package_dev:
	SERVER='dev' make serve_package


submit_package:
	@open 'https://'$(DOMAIN)'/developers/app/marketplace/status#upload-new-version'
submit_package_prod:
	make submit_package
submit_package_stage:
	DOMAIN='marketplace.allizom.org' make submit_package
submit_package_dev:
	DOMAIN='marketplace-dev.allizom.org' make submit_package


approve_package:
	@open 'https://'$(DOMAIN)'/reviewers/apps/review/marketplace#review-actions'
approve_package_prod:
	make approve_package
approve_package_stage:
	DOMAIN='marketplace.allizom.org' make approve_package
approve_package_dev:
	DOMAIN='marketplace-dev.allizom.org' make approve_package


# Yulelog (iframe'd packaged app)
log: clean
	@mkdir -p TMP && cp -pR yulelog/* TMP/.
	@# We have to have a temp file to work around a bug in Mac's version of sed :(
	@sed -i'.bak' -e 's/marketplace\.firefox\.com/$(DOMAIN)/g' TMP/main.js
	@sed -i'.bak' -e 's/{origin}/$(ORIGIN)/g' TMP/manifest.webapp
	@sed -i'.bak' -e 's/{version}/$(VERSION_INT)/g' TMP/manifest.webapp
	@rm -f TMP/README.md
	@rm -f TMP/*.bak
	@cd TMP && zip -q -r ../yulelog_$(NAME)_$(VERSION_INT).zip * && cd ../
	@rm -rf TMP
	@echo "Created file: yulelog_$(NAME)_$(VERSION_INT).zip"
log_prod:
	ORIGIN='marketplace.firefox.com' make log
log_stage:
	SERVER='stage' NAME='Stage' DOMAIN='marketplace.allizom.org' \
	ORIGIN='packaged.marketplace.allizom.org' make log
log_dev:
	SERVER='dev' NAME='Dev' DOMAIN='marketplace-dev.allizom.org' \
	ORIGIN='packaged.marketplace-dev.allizom.org' make log
log_payments_alt:
	SERVER='paymentsalt' NAME='PaymentsAlt' DOMAIN='payments-alt.allizom.org' \
	ORIGIN='payments-alt.allizom.org' make log


submit_log:
	@open 'https://'$(DOMAIN)'/developers/app/marketplace/status#upload-new-version'
submit_log_prod:
	make submit_log
submit_log_stage:
	DOMAIN='marketplace.allizom.org' make submit_log
submit_log_dev:
	DOMAIN='marketplace-dev.allizom.org' make submit_log


approve_log:
	@open 'https://'$(DOMAIN)'/reviewers/apps/review/marketplace#review-actions'
approve_log_prod:
	make approve_log
approve_log_stage:
	DOMAIN='marketplace.allizom.org' make approve_log
approve_log_dev:
	DOMAIN='marketplace-dev.allizom.org' make approve_log

deploy:
	git fetch && git reset --hard origin/master && npm install && make includes
