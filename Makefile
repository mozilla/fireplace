VERSION = `date "+%Y.%m.%d_%H.%M.%S"`


compile:
	node damper.js --compile

test: compile
	echo "lol"

package: compile
	cd hearth/ && zip -r ../$(VERSION).zip * && cd ../

log:
	cd yulelog && zip -r ../yulelog_$(VERSION).zip * && cd ../
