# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [3.3.0](https://github.com/waitingsong/node-windows-window-controller/compare/v3.2.1...v3.3.0) (2019-03-14)


### Bug Fixes

* _kill() ([18fc38e](https://github.com/waitingsong/node-windows-window-controller/commit/18fc38e))
* catch test error ([5efe156](https://github.com/waitingsong/node-windows-window-controller/commit/5efe156))
* createDir() path resolve under linux ([c6d1274](https://github.com/waitingsong/node-windows-window-controller/commit/c6d1274))
* deps, peerDeps might empty ([e3ab52b](https://github.com/waitingsong/node-windows-window-controller/commit/e3ab52b))
* error TS1345: An expression of type 'void' cannot be tested for truthiness ([0085713](https://github.com/waitingsong/node-windows-window-controller/commit/0085713))
* options not covered within createFile() ([a2ae4e8](https://github.com/waitingsong/node-windows-window-controller/commit/a2ae4e8))
* path require parse by normalize() within createDir() ([371a313](https://github.com/waitingsong/node-windows-window-controller/commit/371a313))
* revert ts-node to '5.0.1' ([cc83ade](https://github.com/waitingsong/node-windows-window-controller/commit/cc83ade))
* rimraf() got "no such file or directory" if unlink a file ([2680611](https://github.com/waitingsong/node-windows-window-controller/commit/2680611))
* **tslint:** no-unused-variable rule ([d0ce43a](https://github.com/waitingsong/node-windows-window-controller/commit/d0ce43a))
* rimraf() rm folder ([87fe6d5](https://github.com/waitingsong/node-windows-window-controller/commit/87fe6d5))
* wrong variable within createFile() ([49ac701](https://github.com/waitingsong/node-windows-window-controller/commit/49ac701))


### Features

* add assertNever() ([6eb9349](https://github.com/waitingsong/node-windows-window-controller/commit/6eb9349))
* add assertNeverObb() ([91da144](https://github.com/waitingsong/node-windows-window-controller/commit/91da144))
* add isPathAcessible() ([7eb000b](https://github.com/waitingsong/node-windows-window-controller/commit/7eb000b))
* add lib/shared.ts ([6915fb1](https://github.com/waitingsong/node-windows-window-controller/commit/6915fb1))
* add logger() ([5d603c5](https://github.com/waitingsong/node-windows-window-controller/commit/5d603c5))
* add Observable functions ([c9364db](https://github.com/waitingsong/node-windows-window-controller/commit/c9364db))
* change logger() to accept more args ([b5d0ca4](https://github.com/waitingsong/node-windows-window-controller/commit/b5d0ca4))
* compile output bundle file without minify ([0b78ba1](https://github.com/waitingsong/node-windows-window-controller/commit/0b78ba1))
* do isPathAccessible() first within isDirFileExists() ([9ddae98](https://github.com/waitingsong/node-windows-window-controller/commit/9ddae98))
* export basename() from shared ([7e93fd7](https://github.com/waitingsong/node-windows-window-controller/commit/7e93fd7))
* export dirname() ([0db2a50](https://github.com/waitingsong/node-windows-window-controller/commit/0db2a50))
* export native assert() ([683cea8](https://github.com/waitingsong/node-windows-window-controller/commit/683cea8))
* export os.tmpdir() ([1cc1f3e](https://github.com/waitingsong/node-windows-window-controller/commit/1cc1f3e))
* export rmdirAsync() and rimraf() ([4ef519a](https://github.com/waitingsong/node-windows-window-controller/commit/4ef519a))
* export statAsync ([c832590](https://github.com/waitingsong/node-windows-window-controller/commit/c832590))
* output esm.min.js ([f6c729f](https://github.com/waitingsong/node-windows-window-controller/commit/f6c729f))
* parse peerDependencies as external ([dfdd73e](https://github.com/waitingsong/node-windows-window-controller/commit/dfdd73e))
* parseUMDName() ([6e7164f](https://github.com/waitingsong/node-windows-window-controller/commit/6e7164f))
* remove log() and logger() ([27e1e29](https://github.com/waitingsong/node-windows-window-controller/commit/27e1e29))


### Reverts

* wrong tslib remove ([deb2591](https://github.com/waitingsong/node-windows-window-controller/commit/deb2591))
