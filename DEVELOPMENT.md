### Build locally and have project use local build of library
1. `[facets]/packages/facets-core` run `yarn build`
2. `[facets]/packages/facets-plugins` run `yarn build`
3.  `[project]` run `yarn link @uncharted/facets-core @uncharted/facets-plugins`
4. `[project]` run `npm start`
