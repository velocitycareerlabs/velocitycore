#!/bin/bash

if [[ -f "initialized" ]]; then
    printf "Skipping initialization...\n"
else
    printf "Initializing...\n"

    validators=$(sed "s/,/\",\"/g" <<< $BESU_INITIAL_VALIDATORS)
    printf "[\"$validators\"]" > toEncode.json
    (besu rlp encode --from=toEncode.json --to=rlpEncoded)
    rlpEncoded=$(cat rlpEncoded)
    genesis=$(sed "s/ENCODED_INITIAL_VALIDATORS/$rlpEncoded/g" genesis.tpl)
    genesis=$(sed "s/\"BESU_CHAIN_ID\"/$BESU_CHAIN_ID/g" <<< $genesis)

    printf "$genesis" > genesis.json
    printf "Generated genesis.json file:\n$genesis\n"

    printf "$BESU_PRIVATE_KEY" > key
    printf "$BESU_TLS_BASE64_KEYSTORE" | base64 -d > keystore.pfx
    printf "$BESU_TLS_KEYSTORE_PASSWORD" > password

    touch initialized

    printf "\nInitialization complete!\n"
fi

exec besu "$@"