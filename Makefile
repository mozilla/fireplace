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
