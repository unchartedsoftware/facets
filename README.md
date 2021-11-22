<div align="center">

![Uncharted Facets](assets/logo_320.png)

</div>

---  
The Facets library is split in five packages:
1. `css-options` is a small library used to read CSS variables in modern and legacy browsers
2. `facets-core` contains all the components necessary to start using facets in your project
3. `facets-plugins` is a collection of components that extend facets' behavior, look and feel
4. `facets-docs` documentation and examples live here
5. `facets-builder` tool to create and customize facets (under construction, Facets 4 feature)

The only packages published to the registry are `css-options`, `facets-core` and `facet-plugins` 


## Installation

Use `yarn` to install the desired packages:
```shell script
$ yarn add @uncharted.software/facets-core
$ yarn add @uncharted.software/facets-plugins
```
or `npm`:
```shell script
$ npm install @uncharted.software/facets-core
$ npm install @uncharted.software/facets-plugins
```


## Usage

The documentation is not hosted anywhere at the moment but can be accessed by building the project and running the
`facets-docs` package.

It is recommended to install `lerna` globally:
```shell script
$ yarn global add lerna
```

Check out or download this repo, then, from the repo's root folder run the following commands:
```shell script
$ yarn install
$ lerna bootstrap
$ lerna run build
```

You can now run the documentation:
```shell script
$ cd packages/facets-docs
$ yarn start
```

On your browser navigate to http://localhost:8090/


## Development

Check out or download this repo, then, from the repo's root folder run the following commands:
```shell script
$ yarn install
$ lerna bootstrap
$ lerna run build
```

Start the `watch` script for the packages that you will be working on (usually `factes-core` and `facets-plugins`):
```shell script
$ cd packages/facets-core
$ yarn watch
```

To develop locally, run the `facets-docs` package and use it as a testbed:
```shell script
$ cd packages/facets-docs
$ yarn start
```
On your browser navigate to http://localhost:8090/  
Changes to the code will refresh the browser automatically.
  
To develop in your own app, link ALL the published facets packages to your app, from the root of the Facets repo run: 
```shell script
$ cd packages/css-options
$ yarn link
$ cd ../facets-core
$ yarn link
$ cd ../facets-plugins
$ yarn link
```

Then, from the root of your project run:
```shell script
$ yarn link @uncharted.software/css-options @uncharted.software/facets-core @uncharted.software/facets-plugins
```

Start (or re-start) your project and continue with development.


---

## Publish
- Bump the packages using yarn bump or npm run bump
```shell script
$ yarn bump
```
- One <strong>must</strong> have an npm account that belongs to the uncharted organization and be logged into the npm scope
- Run npm whoami to confirm npm is logged in (if not follow the prompts)
```shell script
$ npm whoami
```
- Log into the uncharted npm scope
```shell script
$ npm login --registry https://npm.uncharted.software --scope @uncharted
```
- Individually publish the following packages: css-tools, facets-core, and facets-plugins
 ```shell script
$ cd css-tools
$ yarn publish
$ cd ../facets-core
$ yarn publish
$ cd ../facets-plugins
$ yarn publish
```
