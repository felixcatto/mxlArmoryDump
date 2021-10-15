install:
	npm i

build: webpack-bundle
	npx bookmarklet compiled/index.js compiled/bookmarklet.js

webpack-bundle:
	NODE_ENV=production npx webpack

webpack-bundle-analyze:
	NODE_ENV=production ANALYZE=true npx webpack
