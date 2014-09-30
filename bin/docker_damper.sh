# Startup script for running damper under Docker.
#
# Check settings file exists, if not create one.
if [[ ! -a "src/media/js/settings_local.js" ]]; then
  echo "Creating settings file."
  cp "src/media/js/settings_local.js.dist" "src/media/js/settings_local.js"
  sed -i "" -e "s/https/http/g" -e "s/[a-z\-]*\.allizom\.org/zamboni_1/g" "src/media/js/settings_local.js"
fi;

damper
