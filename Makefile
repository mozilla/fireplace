VERSION = ` date "+%Y.%m%d%" `

test:
	echo "lol"

package:
	zip -r $(VERSION).zip hearth
