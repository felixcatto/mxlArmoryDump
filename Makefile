install:
	npm i

webpack-bundle:
	NODE_ENV=production npx webpack

webpack-bundle-analyze:
	NODE_ENV=production ANALYZE=true npx webpack
