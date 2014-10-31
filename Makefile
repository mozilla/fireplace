-include bower_components/marketplace-gulp/Makefile

init:
	@npm install
	@node_modules/.bin/bower install
	@node_modules/.bin/gulp update
	@cp src/media/js/settings_local.js.dist src/media/js/settings_local.js

package:
	@node_modules/.bin/gulp package

REPO = "fireplace"
UUID = "e6a59937-29e4-456a-b636-b69afa8693b4"
VERSION = `date "+%Y.%m.%d_%H.%M.%S"`
VERSION_INT = $(shell date "+%Y%m%d%H%M%S")
TMP = _tmp
CASPERJS_BIN ?= 'casperjs'

# This is what Yulelog's iframe src points to.
DOMAIN?=marketplace.firefox.com

# This is what the app will be named on the device.
NAME?=Marketplace

# This is for `package` (choices: prod, stage, dev).
SERVER?=prod

test: css templates
	LC_ALL=en-US $(CASPERJS_BIN) test tests/ui/

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
