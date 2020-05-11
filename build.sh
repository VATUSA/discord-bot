#!/bin/bash

cat /run/secrets/discord-bot.env > /usr/src/app/.env
cat /run/secrets/gcp-auth.json > /usr/src/app/gcp-auth.json

export GOOGLE_APPLICATION_CREDENTIALS="gcp-auth.json"

node app