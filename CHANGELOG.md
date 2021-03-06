# Changelog

## [0.4.2] - 2020-08-10

### Modified
- Improved scoping of folder flag

### Removed
- Custom content feature

## [0.4.1] - 2020-08-08

### Modified
- Reverted change of 0.4.0 - must find a more clever way

## [0.4.0] - 2020-08-08

### Modified
- Do not download base-image layers if src and dest registries are the same 

## [0.3.5] - 2020-08-08

### Modified
- Modified app layer creation

## [0.3.4] - 2020-08-08

### Modified
- Attempt to transfer symlinks to app layer content

## [0.3.3] - 2020-08-08

### Modified
- Change file permissions in generated app layer
- Minor cleanup

## [0.3.2] - 2020-08-07

### Modified
- Minor cleanup

## [0.3.1] - 2020-08-07

### Added
- Added vercel/pkg

## [0.3.0] - 2020-08-07

### Added
- Support for setting image CMD

### Modified
- Merged app and dependency layers

## [0.2.0] - 2020-08-05

### Added
- Support for setting the owner of the work folder (gid:uid)

## [0.1.0] - 2020-03-30

### Added
- Support custom layer (drops default entrypoint, user, workdir, node_modules layer and app layer). Only adds the specified files

## [0.0.11] - 2020-03-30

### Modified
- Don't include .git and .gitignore if in same folder

## [0.0.10] - 2020-03-08

### Modified
- Updated the README with improved example and missing option for the timestamp

## [0.0.9] - 2020-03-08

### Removed
- Removed files from npm package and simplified package.json to use defaults

## [0.0.8] - 2020-03-08

### Added
- Ability to set a specific timestamp on all files/tars/configs to support hermetic builds. Typically one would use the git commit time (`--setTimeStamp=$(git show -s --format="%aI" HEAD)`). If omitted, the timestamp is set to epoch 0. [`420e248`](https://github.com/eoftedal/doqr/commit/420e248e4daf5470e91834f11a52633a566f5783)
