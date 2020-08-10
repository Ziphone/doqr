#!/usr/bin/env node

const os = require('os');
const program  = require('commander');
const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');

const Registry = require('./image/registry').Registry;
const DockerRegistry = require('./image/registry').DockerRegistry;
const appLayerCreator = require('./image/appLayerCreator');
const fileutil = require('./utils/fileutil');

const logger = require('./utils/logger');

const possibleArgs = {
    '--fromImage <name:tag>'        : 'Required: Image name of base image - [path/]image:tag',
    '--toImage <name:tag>'          : 'Required: Image name of target image - [path/]image:tag',
    '--folder <full path>'          : 'Required: Base folder of node application (contains package.json) - Default: .',
    '--fromRegistry <registry url>' : 'Optional: URL of registry to pull base image from - Default: https://registry-1.docker.io/v2/',
    '--fromToken <token>'           : 'Optional: Authentication token for from registry',
    '--toRegistry <registry url>'   : 'Optional: URL of registry to push base image to - Default: https://registry-1.docker.io/v2/',
    '--toToken <token>'             : 'Optional: Authentication token for target registry',
    '--registry <path>'             : 'Optional: Convenience argument for setting both from and to registry',
    '--token <path>'                : 'Optional: Convenience argument for setting token for both from and to registry',
    '--user <user>'                 : 'Optional: User account to run process in container - default: 1001',
    '--workdir <directory>'         : 'Optional: Workdir where node app will be added and run from - default: /opt/app-root/src',
    '--cmd <command>'               : 'Optional: CMD for docker image - default: \'\'',
    '--entrypoint <entrypoint>'     : 'Optional: Entrypoint when starting container - default: \'\'',
    '--labels <labels>'             : 'Optional: Comma-separated list of key value pairs to use as labels',
    '--setTimeStamp <timestamp>'    : 'Optional: Set a specific ISO 8601 timestamp on all entries (e.g. git commit hash). Default: 1970 in tar files, and now on manifest/config',
    '--verbose'                     : 'Verbose logging',
    '--allowInsecureRegistries'     : 'Allow insecure registries (with self-signed/untrusted cert)',
    '--layerOwner <gid:uid>'        : 'Optional: Set specific gid and uid on files in the added layers',
};

const keys = Object.keys(possibleArgs)
    .map(k => k.split(' ')[0].replace('--', ''));

Object.keys(possibleArgs)
    .reduce((program, k) => program.option(k, possibleArgs[k]), program)
    .parse(process.argv);

let options = {
    folder: '.',
    workdir : '/opt/app-root/src',
    user: '1001'
};

keys.map(k => options[k] = program[k] || options[k]);

function exitWithErrorIf(check, error) {
    if (check) {
        logger.error('ERROR: ' + error);
        program.outputHelp();
        process.exit(1);
    }
}

if (options.verbose) logger.enableDebug();
if (options.allowInsecureRegistries) process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

exitWithErrorIf(options.registry && options.fromRegistry, 'Do not set both --registry and --fromRegistry');
exitWithErrorIf(options.registry && options.toRegistry, 'Do not set both --registry and --toRegistry');
exitWithErrorIf(options.token && options.fromToken, 'Do not set both --token and --fromToken');
exitWithErrorIf(options.token && options.toToken, 'Do not set both --token and --toToken');

if (options.setTimeStamp) {
    try {
        options.setTimeStamp = new Date(options.setTimeStamp);
    } catch(e) {
        exitWithErrorIf(true, 'Failed to parse date: ' + e);
    }
    logger.info('Setting all dates to: ' + options.setTimeStamp);
}
if (options.layerOwner) {
    if (!options.layerOwner.match("^[0-9]+:[0-9]+$")) {
        exitWithErrorIf(true, 'layerOwner should be on format <number>:<number> (e.g. 1000:1000) but was: ' + options.layerOwner);
    }
}
if (options.registry) {
    options.fromRegistry = options.registry;
    options.toRegistry = options.registry;
}
if (options.token) {
    options.fromToken = options.token;
    options.toToken = options.token;
}

exitWithErrorIf(!options.folder, '--folder must be specified');
exitWithErrorIf(!options.fromImage, '--fromImage must be specified');
exitWithErrorIf(!options.toImage, '--toImage must be specified');
exitWithErrorIf(!options.toRegistry && !options.toTar, 'Must specify either --toTar or --toRegistry');
exitWithErrorIf(!options.toRegistry && !options.toToken && !options.toTar, 'A token must be given when uploading to docker hub');

if(options.toRegistry && options.toRegistry.substr(-1) != '/') options.toRegistry += '/';
if(options.fromRegistry && options.fromRegistry.substr(-1) != '/') options.fromRegistry += '/';

if (!options.fromRegistry && !options.fromImage.split(':')[0].includes('/')) {
    options.fromImage = 'library/' + options.fromImage;
}

async function run(options) {
    if (!(await fse.pathExists(options.folder))) throw new Error('No such folder: ' + options.folder);

    const tmpdir = require('fs').mkdtempSync(path.join(os.tmpdir(),'doqr-'));
    logger.debug('Using ' + tmpdir);
    let fromdir = await fileutil.ensureEmptyDir(path.join(tmpdir, 'from'));
    let todir = await fileutil.ensureEmptyDir(path.join(tmpdir, 'to'));

    let fromRegistry = options.fromRegistry ? new Registry(options.fromRegistry, options.fromToken) : new DockerRegistry(options.fromToken);
    let toRegistry = new Registry(options.toRegistry, options.toToken);

    await fromRegistry.download(options.fromImage, fromdir);
    await appLayerCreator.addLayers(tmpdir, fromdir, todir, options);
    await toRegistry.upload(options.toImage, todir);

    logger.debug('Deleting ' + tmpdir + ' ...');
    await fse.remove(tmpdir);
    logger.debug('Done');
}

run(options).then(() => {
    logger.info('Done!');
    process.exit(0);
}).catch(error => {
    logger.error(error);
    process.exit(1);
});