export PYTHONUSERBASE=/tmp/python-env
git clone https://github.com/mozilla/marketplace-api-mock /tmp/marketplace-api-mock --branch redo-flask-routing
pushd /tmp/marketplace-api-mock
# Force marketplace-constants==0.5.0 for now.
pip install --user --exists-action=w --download-cache=/tmp/pip-cache marketplace-constants==0.5.0
pip install --user --exists-action=w --download-cache=/tmp/pip-cache -r requirements.txt
python main.py &
popd
mv src/media/js/settings_local_test.js src/media/js/settings_local.js
make build
MKT_COMPILED=1 make serve &
sleep 10
