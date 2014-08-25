#1/bin/bash

SRC="$1"
DST='./app/assets/img/'

find "$SRC" -type f | while read file; do
    width=$(gm identify "$file" -format '%w')
    toFname=$(basename "$file")
    toFname="${DST}/${toFname%.*}.jpg"
    echo "$toFname"
    if [[ "$width" -gt 1024 ]]; then
        gm convert "$file" -resize 1024x "$toFname"
    else
        gm convert "$file" "$toFname"
    fi
done
   
