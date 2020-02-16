## About Eclipse Che Dashboard

This is the first step for implementing a new version of  Eclipse Che Dashboard which is based on  React 16 and Webpack 4.


Che Dashboard

==============

## Requirements

- Node.js `v10.x.x`

## Quick start

Install all modules listed as dependencies in package.json
```sh
$ yarn
```

Start dev-server
```sh
$ yarn start
```

It will launch the server and then the project can be tested on http://localhost:3000



For the easiest development, this dashboard will try to connect to [che.openshift.io](https://che.openshift.io) with own proxy by default.

So, it is better to login previously (I am about [che.openshift.io](https://che.openshift.io)). 


With initial implementation, this dashboard can show a simple list of created workspaces.
