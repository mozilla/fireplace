#!/bin/bash

# syntax:
# stats-po.sh

echo "Printing number of untranslated strings found in locales:"

for lang in `find $1 -type f -name "messages.po" | sort`; do
    dir=`dirname $lang`
    stem=`basename $lang .po`
    count=$(msgattrib --untranslated $lang | grep -c "msgid")
    echo -e "$(dirname $dir)\t$count"
done
