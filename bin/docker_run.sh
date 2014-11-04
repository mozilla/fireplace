# Startup script for running webserver under Docker.
#
# Check settings file exists, if not create one.
if [[ ! -a "src/media/js/settings_local.js" ]]; then
  echo "Creating settings file."
  cp "src/media/js/settings_local.js.dist" "src/media/js/settings_local.js"
  sed -i "" -e "s/https/http/g" -e "s/[a-z\-]*\.allizom\.org/mp.dev/g" "src/media/js/settings_local.js"
fi;

../node_modules/.bin/gulp docker
