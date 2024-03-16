#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import decompress from 'decompress';
import * as uuid from 'uuid';
import { spawn, exec } from 'child_process';
import { db } from './db/db.js';

const worker = async () => {
  const task = await db.userDeployment.findFirst({
    where: {
      status: 'Created'
    }
  });

  console.log(task)
};

const deploy = async (argv: { projectZip: string }) => {
  const uuidTag = uuid.v4();

  const dirName = `temp/${uuidTag}`;
  const params = { cwd: `${dirName}/contract-rs` };
  const account = `${uuidTag}.testnet`

  console.log('Creating account..');

  await new Promise(function (resolve, reject) {
    const createAccount = exec(
      `near create-account ${account} --useFaucet`
    );

    createAccount.addListener('error', reject);
    createAccount.addListener('exit', resolve);
  });

  console.log('Deploying', argv.projectZip, dirName);

  await decompress(argv.projectZip, dirName);

  console.log('Execution', `${dirName}/contract-rs/test.sh`);

  const buildTask = spawn(`./build.sh`, [], params);

  buildTask.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  buildTask.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  buildTask.on('close', (code) => {
    console.log(`child process exited with code ${code}`);

    const deployTask = spawn(
      `sh`,
      [
        '-c',
        `near deploy ${account} ./target/wasm32-unknown-unknown/release/*.wasm`,
      ],
      params
    );

    deployTask.stdout.on('data', (data) => {
      console.log(`Deploy stdout: ${data}`);
    });

    deployTask.stderr.on('data', (data) => {
      console.log(`Deploy stderr: ${data}`);
    });
  });
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
  .command(
    'deploySolFile [projectZip]',
    'Deploys specified project',
    {
      projectZip: {
        default: 'data/contract-rs.zip',
      },
    },
    deploy
  )
  .command(
    'worker',
    'Runs worker',
    worker
  )

  .help().argv;
