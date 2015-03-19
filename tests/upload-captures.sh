# Don't upload more than 3 images.
for file in $(find tests/captures -name '*.png' | head -n3)
do
    raw_url=$(cat $file | base64 | gist --raw)
    echo "https://base64service.herokuapp.com/decode?url=$raw_url&filename=$file"
done
