export PYTHONUSERBASE=/tmp/python-env
git clone https://github.com/mozilla/marketplace-api-mock /tmp/marketplace-api-mock
pushd /tmp/marketplace-api-mock
pip install --user --exists-action=w --download-cache=/tmp/pip-cache -r requirements.txt
python main.py &
popd
mv src/media/js/settings_local_test.js src/media/js/settings_local.js
make build
MKT_COMPILED=1 make serve &
sleep 10

# Make sure flue is ready.
curl http://localhost:5000/api/v2/services/config/site/
