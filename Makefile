UUID = "8af8c763-da9b-444d-a911-206f9e225b55"
VERSION = `date "+%Y.%m.%d_%H.%M.%S"`
VERSION_INT = $(shell date "+%Y%m%d%H%M%S")
TMP = _tmp
TEMPLATES = $(wildcard \
	hearth/templates/*.html \
	public/templates/**/*.html \
)
STYL_FILES = $(wildcard \
	hearth/media/css/*.styl \
	public/media/css/**/*.styl \
)
CSS_FILES = $(STYL_FILES:.styl=.styl.css)
COMPILED_TEMPLATES = hearth/templates.js

compile: $(COMPILED_TEMPLATES) $(CSS_FILES)

fastcompile:
	node damper.js --compile

$(COMPILED_TEMPLATES): $(TEMPLATES)
	node damper.js --compile nunjucks

%.styl.css: %.styl
	node damper.js --compile stylus --path $<

l10n: clean fastcompile
	cd locale ; \
	./omg_new_l10n.sh

langpacks:
	mkdir -p hearth/locales
	for po in `find locale -name "*.po"` ; do \
		lang=`basename \`dirname \\\`dirname $$po\\\`\` | tr "_" "-"`; \
		node scripts/generate_langpacks.js $$po $$lang; \
		mv $$po.js hearth/locales/$$lang.js ; \
	done

test: clean fastcompile
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
	@rm -rf TMP \
		$(CSS_FILES) \
		$(COMPILED_TEMPLATES) \
		hearth/locales/* \
		hearth/media/css/include.css \
		hearth/media/js/include.*

raw_includes: clean compile langpacks
	echo "/* $(VERSION) */" > hearth/media/include.css
	echo "/* $(VERSION) */" > hearth/media/include.js
	cat amd/amd.js >> hearth/media/include.js
	python build.py

includes: raw_includes
	cleancss hearth/media/include.css > hearth/media/css/include.css
	rm -f hearth/media/include.css
	mv hearth/media/include.js hearth/media/js/
	uglifyjs hearth/media/js/include.js -o hearth/media/js/include.js -m -c --screw-ie8

lint:
	# You need closure-linter installed for this.
	gjslint --nojsdoc -r hearth/media/js/ -e lib

deploy:
	git fetch && git reset --hard origin/master && npm install && make includes
