#! /bin/bash

# This script will do the following:
#   - Update your /locales/
#   - Extract all new strings
#   - Compile all .po files
#   - Commit all your changes
#   - Email the localizers that you've extracted
#
# This script makes a lot of assumptions and has no error checking, so read it
# over before you run it.
#
# Questions?  Talk to clouserw.

LOCALIZERS="dev-l10n-web@lists.mozilla.org"
CLEAN_FLAGS="--no-obsolete --width=200"
MERGE_FLAGS="--update --no-fuzzy-matching --width=200 --backup=none"

function confirm {
    PROMPT=$1
    read -p "$PROMPT [y/n]: " YESNO
    if [[ $YESNO == 'y' ]]
    then
        return 0
    else
        return 1
    fi
}

if [ ! -d "locale" ]; then
    echo "Sorry, please run from the root of the project, eg.  ./locale/omg_new_l10n.sh"
    exit 1
fi

echo "Alright, here we go..."

if confirm "Update to the latest code?"; then
    git co master
    git pull
fi

if confirm "Extract new strings?"; then
    echo "[ALERT] I don't actually know how to extract strings!  Not extracting."
fi

if confirm "Merge new strings to .po files?"; then
    pushd locale > /dev/null

    echo "Merging any new keys..."
    for i in `find . -name "messages.po" | grep -v "en_US"`; do
        msgmerge $MERGE_FLAGS "$i" "templates/LC_MESSAGES/messages.pot"
    done
    msgen templates/LC_MESSAGES/messages.pot | msgmerge $MERGE_FLAGS en_US/LC_MESSAGES/messages.po -

    echo "Cleaning out obsolete messages.  See bug 623634 for details."
    for i in `find . -name "messages.po"`; do
        msgattrib $CLEAN_FLAGS --output-file=$i $i
    done

    popd > /dev/null
fi

if confirm "Process your debug language?"; then
    podebug --rewrite=unicode locale/templates/LC_MESSAGES/messages.pot locale/dbg/LC_MESSAGES/messages.po
fi

if confirm "Commit your changes?"; then
    git commit locale -m "L10n Extract/compile script."
    git push mozilla master
fi

echo "Calculating changes...."
pushd locale > /dev/null
SUBJECT="[Mkt Frontend] .po files updated"
CHANGES=$(cat <<MAIL
From: "Marketplace Developers" <marketplace-devs@mozilla.org>
To: "Awesome Localizers" <$LOCALIZERS>
Subject: $SUBJECT

Hi,

I am an automated script letting you know the Marketplace Frontend  .po files
have just been updated.  Unless something unusual is happening, we do weekly
pushes on Thursdays so any strings committed by then will go live.  To give you
an idea of the number of new strings I will calculate untranslated strings.

`./stats-po.sh`

If you have any questions please reply to the list.

Thanks so much for all your help!


MAIL)
popd > /dev/null

echo "-----------------------------------------------"
echo "$CHANGES"
echo "-----------------------------------------------"

# Uses sendmail so we can set a real From address
#if confirm "Do you want to send that to $LOCALIZERS?"; then
    #echo "$CHANGES" | /usr/lib/sendmail -t
#fi

#if confirm "Do you want to email Milos? :D"; then
    #echo "Please update AMO in Verbatim. Thanks." | mail -s "Verbatim update" milos@mozilla.com
#fi

echo "done."
