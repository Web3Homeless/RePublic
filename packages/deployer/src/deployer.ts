#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import decompress from 'decompress';
import * as uuid from 'uuid';
import { spawn } from 'child_process';

const deploy = async (argv: { projectZip: string }) => {
  const dirName = `temp/${uuid.v4()}`;

  console.log('Deploying', argv.projectZip, dirName);

  await decompress(argv.projectZip, dirName);

  console.log('Execution', `${dirName}/contract-rs/test.sh`);

  const buildTask = spawn(`./build.sh`, [], { cwd: `${dirName}/contract-rs` });

  buildTask.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  buildTask.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  buildTask.on('close', (code) => {
    console.log(`child process exited with code ${code}`);

    const deployTask = spawn(`near contract deploy republic.testnet use-file ./target/wasm32-unknown-unknown/release/*.wasm without-init-call network-config testnet sign-with-keychain send`, [], { cwd: `${dirName}/contract-rs` });
  });

  // await test;
};

// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/no-floating-promises
yargs(hideBin(process.argv))
  .command(
    'deploy [projectZip]',
    'Deploys specified project',
    {
      projectZip: {
        default: 'data/contract-rs.zip',
      },
    },
    deploy
  )
  .help().argv;