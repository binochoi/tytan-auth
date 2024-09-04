#!/bin/bash
cd ./packages/$package && npm version patch && npx pkg-to-dist && cd dist && pnpm publish --no-git-checks