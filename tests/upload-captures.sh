for file in $(find tests/captures -name '*.png')
do
    raw_url=$(cat $file | base64 | gist --raw)
    echo "https://base64service.herokuapp.com/decode?url=$raw_url&filename=$file"
done
