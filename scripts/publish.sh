#!/bin/bash
cd ./packages/$package && pnpm build && npm version patch && npx pkg-to-dist && cd dist && pnpm publish --no-git-checks