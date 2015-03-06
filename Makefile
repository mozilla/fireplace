-include node_modules/marketplace-gulp/Makefile

package:
	@node_modules/.bin/gulp package

iframe_package:
	@node_modules/.bin/gulp iframe_package

.PHONY: package

REPO = "fireplace"
UUID = "e6a59937-29e4-456a-b636-b69afa8693b4"
CASPERJS_BIN ?= 'casperjs'

DOMAIN?=marketplace.firefox.com
SERVER?=prod

test:
	make jshint && make unittest && make uitest

uitest: css templates
	PATH=node_modules/.bin:${PATH} LC_ALL=en-US $(CASPERJS_BIN) test tests/ui/

unittest:
	@node_modules/karma/bin/karma start --single-run

unittest-watch:
	@node_modules/karma/bin/karma start

jshint:
	@node_modules/.bin/gulp lint

deploy:
	git fetch && git reset --hard origin/master && npm install && make includes

serve_package:
	@pushd package/builds/_$(SERVER) && \
		python -m SimpleHTTPServer 9676
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

log:
	@echo "This command has been removed. Use 'make iframe_package' instead."
