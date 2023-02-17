#!/usr/bin/env bash

curl -o mudkip.tgz -L https://github.com/barelyhuman/mudkip/releases/latest/download/linux-amd64.tgz
tar -xvzf mudkip.tgz
install linux-amd64/mudkip /usr/local/bin

mudkip --baseurl='/preact-islands-diy/' --stylesheet="./docs/styles.css"
