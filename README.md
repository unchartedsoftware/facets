<div align="center">

![Uncharted Facets](assets/logo_320.png)  
  
![Pipeline](https://gitlab.uncharted.software/Widgets/Facets/badges/master/pipeline.svg?style=flat-square) ![Coverage](https://gitlab.uncharted.software/Widgets/Facets/badges/master/coverage.svg?style=flat-square)

</div>

---  
The Facets library is split in five packages:
1. `CSSOptions` is a small library used to read CSS variables in modern and legacy browsers
2. `facets-core` contains all the components necessary to start using facets in your project
3. `facets-plugins` are a collection of components that extend facets' look and behavior
4. `facets-examples` documentation and examples live here
5. `facets-builder` tool to allow designers to create and customize facets (under construction, Facets 4 feature)

TThe only packages published to the registry are `CSSOptions`, `facets-core` and `facet-plugins` 


## Installation

Use `yarn` or `npm` to install the desired package:
```shell script
$ yarn add @uncharted/facets-core
$ yarn add @uncharted/facets-plugins
```
or
```shell script
$ npm install @uncharted/facets-core
$ npm install @uncharted/facets-plugins
```


## Usage

The documentation is not hosted anywhere at the moment but can be accessed by building the project and running the
documentation.

It is recommended to install `lerna` globally:
```shell script
$ yarn global add lerna
```

Check out or download this repo, then, from the repo's root folder run the following commands:
```shell script
$ yarn install
$ lerna bootstrap
$ lern run build
```

You can now run the examples:
```shell script
$ cd packages/facets-examples
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

To develop locally, run the `facets-examples` package and use it as a testbed:
```shell script
$ cd packages/facets-examples
$ yarn start
```
On your browser navigate to http://localhost:8090/  
Changes to the code will refresh the browser automatically.
  
To develop in your own app, link ALL the packages in your app, from the root of the Facets repo run: 
```shell script
$ cd packages/CSSOptions
$ yarn link
$ cd ../facets-core
$ yarn link
$ cd ../facets-plugins
$ yarn link
```

Then, from the root of your project run:
```shell script
$ yarn link @uncharted/css-options @uncharted/facets-core @uncharted/facets-plugins
```

Start (or re-start) your project and continue development.


---
