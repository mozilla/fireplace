VERSION = `date "+%Y.%m.%d_%H.%M.%S"`


compile:
	node damper.js --compile

l10n: compile
	cd locale ; \
	./omg_new_l10n.sh

langpacks:
	for po in `find locale -name "*.po"` ; do \
		node scripts/generate_langpacks.js $$po ; \
		mv $$po.js hearth/locales/`basename \`dirname \\\`dirname $$po\\\`\` | tr "_" "-"`.js ; \
	done

test: compile
	cd smokealarm ; \
	casperjs test tests

package: compile
	cd hearth/ && zip -r ../$(VERSION).zip * && cd ../

log:
	cd yulelog && zip -r ../yulelog_$(VERSION).zip * && cd ../


clean:
	rm -f hearth/media/css/*.styl.css
	rm -f hearth/media/css/include.css
	rm -f hearth/media/include.*

includes: clean css-include js-include

css-include: compile
	echo "/* $(VERSION) */" > hearth/media/include.css
	cat hearth/media/css/*.css | cleancss >> hearth/media/include.css
	mv hearth/media/include.css hearth/media/css/

js-include: compile
	echo "/* $(VERSION) */" > hearth/media/include.js
	cat yulelog/amd.js >> hearth/media/include.js
	python build.py
	uglifyjs hearth/media/include.js -o hearth/media/include.js -m

lint:
	# You need closure-linter installed for this.
	gjslint --nojsdoc -r hearth/media/js/ -e lib
