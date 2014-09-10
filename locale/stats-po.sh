#! /usr/bin/env bash

# syntax:
# stats-po.sh

echo "Printing number of untranslated strings found in locales:"

for lang in `find $1 -type f -name "messages.po" | sort`; do
    dir=`dirname $lang`
    stem=`basename $lang .po`
    count=$(msgattrib $lang --untranslated --no-obsolete --no-fuzzy | grep -c 'msgid ')
    if [ $count -gt 0 ]; then
        count=$(($count-1))
    fi
    echo -e "$(dirname $dir)\t$count"
done
