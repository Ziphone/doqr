# doqr
doqr allows you to build node.js docker images without docker, allowing you to build a node.js docker image *from within a docker container*. This means you can build the container image on Kubernetes or Openshift - or locally in a docker container for more hermetic builds.

It will pull an image you specify from a given registry, add the node.js application from a given folder, and push the result to a(nother) given registry.

## How to install
```
npm install -g doqr
```

## How to make a Doqr binary
```
npm install; pkg cli.js
```

## How to use

This will pull the `node:13-slim` image from Docker hub, build the image by adding the application in `src/`, and push the result to the given registry, and set time timestamp of files in the created layers and configs to the current timestamp of the latest git commit.

```
doqr --fromImage node:13-slim --folder src/ --toImage myapp:latest --toRegistry https://registry.example.com/v2/ --setTimeStamp=$(git show -s --format="%aI" HEAD)
```

### Command line options 
```
Usage: doqr [options]

Options:
  --fromRegistry <registry url>  Optional: URL of registry to pull base image from - Default: https://registry-1.docker.io/v2/
  --fromImage <name:tag>         Required: Image name of base image - [path/]image:tag
  --fromToken <token>            Optional: Authentication token for from registry
  --toRegistry <registry url>    Optional: URL of registry to push base image to - Default: https://registry-1.docker.io/v2/
  --toImage <name:tag>           Required: Image name of target image - [path/]image:tag
  --toToken <token>              Optional: Authentication token for target registry
  --toTar <path>                 Optional: Export to tar file
  --registry <path>              Optional: Convenience argument for setting both from and to registry
  --token <path>                 Optional: Convenience argument for setting token for both from and to registry
  --folder <full path>           Required: Base folder of node application (contains package.json) - Default: .
  --user <user>                  Optional: User account to run process in container - default: 1001
  --workdir <directory>          Optional: Workdir where node app will be added and run from - default: /opt/app-root/src
  --entrypoint <entrypoint>      Optional: Entrypoint when starting container
  --cmd <command>                Optional: CMD for docker image
  --setTimeStamp <timestamp>     Optional: Set a specific ISO 8601 timestamp on all entries (e.g. git commit hash). Default: 1970 in tar files, and now on manifest/config
  --verbose                      Verbose logging
  --allowInsecureRegistries      Allow insecure registries (with self-signed/untrusted cert)
  --layerOwner   <gid:uid>       Optional: Set specific gid and uid on files in the added layers
  -h, --help                     output usage information
```