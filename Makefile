VERSION = ` date "+%Y.%m%d%" `


compile:
	node damper.js --compile

test: compile
	echo "lol"

package: compile
	zip -r $(VERSION).zip hearth
