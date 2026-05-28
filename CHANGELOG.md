# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [6.8.4](https://github.com/kessler/license-report/compare/v6.8.3...v6.8.4) (2026-04-02)

## [6.8.3](https://github.com/kessler/license-report/compare/v6.8.1...v6.8.3) (2026-04-01)

### Bug Fixes

- update packages to fix dependabot security warnings ([90d3967](https://github.com/kessler/license-report/commit/90d39679d5c458c7d59545bb06b61c32a16bf746))
- update packages to fix github dependabot security warnings ([02ab3bc](https://github.com/kessler/license-report/commit/02ab3bcd7baaa7985ed3a3164aef5b66a3c58ad0))

## [6.8.1](https://github.com/kessler/license-report/compare/v6.8.0...v6.8.1) (2025-10-22)

### Bug Fixes

- update packages to fix security warnings ([de28bd7](https://github.com/kessler/license-report/commit/de28bd74a0c98b24b09470fd48ce4324fa3e193b))

## [6.8.0](https://github.com/kessler/license-report/compare/v6.7.2...v6.8.0) (2025-05-23)

### Features

- enable usage of .npmrc file (solves issue [#205](https://github.com/kessler/license-report/issues/205)) ([#208](https://github.com/kessler/license-report/issues/208)) ([9356088](https://github.com/kessler/license-report/commit/935608872386d531226e41bb90a4f1b71148aac5))

## [6.7.2](https://github.com/kessler/license-report/compare/v6.7.1...v6.7.2) (2025-03-01)

### Bug Fixes

- replace path.join for uri with own function ([2f30a8b](https://github.com/kessler/license-report/commit/2f30a8bae9050fc2a75c228f5eea10cf91a88ab5))

## [6.7.1](https://github.com/kessler/license-report/compare/v6.7.0...v6.7.1) (2024-12-10)

## [6.7.0](https://github.com/kessler/license-report/compare/v6.6.1...v6.7.0) (2024-09-13)

### Features

- use properties of object entries as custom field ([#194](https://github.com/kessler/license-report/issues/194)) ([d9519b2](https://github.com/kessler/license-report/commit/d9519b23d4cdf11c8659c28644eb4fe206df1b5a))

## [6.6.1](https://github.com/kessler/license-report/compare/v6.6.0...v6.6.1) (2024-08-02)

## [6.6.0](https://github.com/kessler/license-report/compare/v6.5.1...v6.6.0) (2024-06-23)

### Features

- change the project from 'default' to named exports ([1e526eb](https://github.com/kessler/license-report/commit/1e526eb2ebd4395a45473e588a6d3e774fc9dd0d))

## [6.5.1](https://github.com/ironSource/license-report/compare/v6.5.0...v6.5.1) (2024-04-26)

## [6.5.0](https://github.com/ironSource/license-report/compare/v6.4.0...v6.5.0) (2023-10-09)

### Features

- add the configuration element 'excludeRegex' - issue [#139](https://github.com/ironSource/license-report/issues/139) ([6ce1c13](https://github.com/ironSource/license-report/commit/6ce1c1341a05cf6acd05f13c6f40e22d61bd0c61))

### Bug Fixes

- enable selecting a single field in the output via 'fields' configuration element ([#143](https://github.com/ironSource/license-report/issues/143)) ([7486bbf](https://github.com/ironSource/license-report/commit/7486bbfcd234083da6f88df833546e01904b2dae))
- make node v16 minimal required node version ([34887d0](https://github.com/ironSource/license-report/commit/34887d0f4feb7d45e9b8e077a81554a06a1c9458))

## [6.4.0](https://github.com/ironSource/license-report/compare/v6.3.0...v6.4.0) (2023-03-14)

### Features

- add entries from package.json defined in config.fields to output ([a31ca47](https://github.com/ironSource/license-report/commit/a31ca47f1b8246eb21c7a73c9f67c35f226f6640))

### Bug Fixes

- issue [#126](https://github.com/ironSource/license-report/issues/126) - Error when no dependency is found with markdown output ([#127](https://github.com/ironSource/license-report/issues/127)) ([ca5590c](https://github.com/ironSource/license-report/commit/ca5590cda5a0d54d24677b8ce3dd3662388c5c7b))
- solve security issue with sub-dependency ([9f0aa72](https://github.com/ironSource/license-report/commit/9f0aa720e07648ef96fc43336de16ce621ada8cd))

## [6.3.0](https://github.com/ironSource/license-report/compare/v6.2.0...v6.3.0) (2022-10-19)

### Features

- add Markdown formatter (solves issue [#116](https://github.com/ironSource/license-report/issues/116)) ([72eb9d8](https://github.com/ironSource/license-report/commit/72eb9d8fd74d02c457814972932acfbc0339a69b))

## [6.2.0](https://github.com/ironSource/license-report/compare/v6.1.0...v6.2.0) (2022-10-06)

### Features

- add support for monorepos ([bb1f364](https://github.com/ironSource/license-report/commit/bb1f364925502e9890bab3a143c2523935543114))

### Bug Fixes

- add new fields from v6.1.0 to output of cli help ([6dde8dd](https://github.com/ironSource/license-report/commit/6dde8dd5f362fcd32d43c9e2761a216eb1257c31))

## [6.1.0](https://github.com/ironSource/license-report/compare/v6.0.0...v6.1.0) (2022-07-31)

### Features

- add new optional fields with data from registry ([ead1a55](https://github.com/ironSource/license-report/commit/ead1a550d212a030e657fef71f245d2299c76d08))

### Bug Fixes

- issue [#101](https://github.com/ironSource/license-report/issues/101) (config.registry without trailing slash throws an error) ([76525ed](https://github.com/ironSource/license-report/commit/76525ed1a411fc007e4ea655c17fcef042c789f8))

## [6.0.0](https://github.com/ironSource/license-report/compare/v5.1.0...v6.0.0) (2022-07-07)

### ⚠ BREAKING CHANGES

- update 'got' to v12; this requires switching to esm
  modules and dropping support for node versions prior to Node v14 (which
  are all out of maintenance status by now).
- get the installed version, the author and the
  license type from the node_modules directory instead of from
  the package-lock.json file.

### Bug Fixes

- add default request timeout ([fce9e05](https://github.com/ironSource/license-report/commit/fce9e051170711f680aba53e3f23003a1300af39))
- add missing fieldnames in command line help text ([d29c8a1](https://github.com/ironSource/license-report/commit/d29c8a1ebf0da0c058fb0d70c47ce2f6ab290f0a))
- return 'n/a' when no license property is found in repository data ([1ffe505](https://github.com/ironSource/license-report/commit/1ffe5055086e67646f6f1d0d9f5b9667d3564bd3))

## [5.1.0](https://github.com/ironSource/license-report/compare/v5.0.2...v5.1.0) (2022-06-04)

### Features

- add support for installedFrom field ([207f167](https://github.com/ironSource/license-report/commit/207f167b4492e45f34a8554f026cdb5c97e4888b))

### Bug Fixes

- add error handling for requests to the registry ([cb7123a](https://github.com/ironSource/license-report/commit/cb7123a055238827ed3a4d71cadff9de60e42156)), closes [#85](https://github.com/ironSource/license-report/issues/85)
- fix broken e2e tests due to changed ownership for debug-js ([25d754e](https://github.com/ironSource/license-report/commit/25d754ed342b94af01b5bc96a5692495d8d687ce))
- fix missing variable declaration ([f4a64eb](https://github.com/ironSource/license-report/commit/f4a64eb5db57e42908dacb4148f93c5be7757207))
- remove typo in error message ([2cd5475](https://github.com/ironSource/license-report/commit/2cd547517af40b4f1b72b458c6f7d8be7218c6bf))

### [5.0.2](https://github.com/ironSource/license-report/compare/v5.0.1...v5.0.2) (2022-03-11)

### Bug Fixes

- issue [#72](https://github.com/ironSource/license-report/issues/72) (Cannot read property 'version' of undefined) ([dec72d1](https://github.com/ironSource/license-report/commit/dec72d1c5828f89219dacdd2c2e8c9b808c63142))

## [5.0.1](https://github.com/ironSource/license-report/compare/v5.0.0...v5.0.1) (2022-02-20)

### Features

- automatically create changelog from commit messages ([f9c1030](https://github.com/ironSource/license-report/commit/f9c103053378bb88db61715331ed8f0d208fcc95))

### Bug Fixes

- issue [#68](https://github.com/ironSource/license-report/issues/68) - evaluate string only author field ([4498bb7](https://github.com/ironSource/license-report/commit/4498bb7f9b5f74658118ee2cd96df443e5d95383))

## [5.0.0](https://github.com/ironSource/license-report///compare/v5.0.0...v4.5.0) (2021-09-09)

### ⚠ BREAKING CHANGES

- installed version shows actually installed version, not value from package.json without range character

### Features

- Allow fetching license info from peerDependencies and optionalDependencies too with `--only=prod,dev,opt,peer`
- allow versions like "nightly" and "latest"
- securely access private npm repositories with configuration variable `--npmTokenEnvVar` and authorization header with bearer token; show warning, if `--npmTokenEnvVar` is used as a config option
- add CHANGELOG.md to make changes visible to users

### Bug Fixes

- fixes typos in source code
- fixes sort order for `--output=table` and `--output=html`

## [4.5.0](https://github.com/ironSource/license-report/compare/v5.0.0...v4.5.0) (2022-02-19)

### Bug Fixes

- issue [#68](https://github.com/ironSource/license-report/issues/68) - evaluate string only author field ([4498bb7](https://github.com/ironSource/license-report/commit/4498bb7f9b5f74658118ee2cd96df443e5d95383))
