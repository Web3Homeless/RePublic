#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import decompress from 'decompress';
import * as uuid from 'uuid';
import { spawn, exec } from 'child_process';
import { db } from './db/db.js';
import fs from 'fs';

const worker = async () => {
  const task = await db.userDeployment.findFirst({
    where: {
      status: 'Created',
    },
  });

  if (!task) {
    console.log('No tasks');
    return;
  }

  await db.userDeployment.update({
    data: {
      status: 'Building',
    },
    where: {
      id: task?.id,
    },
  });

  console.log(task);

  const uuidTag = uuid.v4();

  await fs.promises.mkdir('arch', { recursive: true });

  const archName = `arch/${uuidTag}.zip`;

  await fs.promises.writeFile(archName, task?.zipArchive!);

  const deployment = await deployNearProject({
    projectZip: archName,
  });

  await db.deploymentOutbox.create({
    data: {
      deploymentId: task.id,
    },
  });

  await db.userDeployment.update({
    data: {
      deployedAddress: deployment.account,
      deploymenttransaction: deployment.txId,
      status: 'Success',
    },
    where: {
      id: task?.id,
    },
  });

};

type Deployment = {
  account: string;
  txId: string;
};

const deployNearProject = async (argv: { projectZip: string }) => {
  const uuidTag = uuid.v4();

  const dirName = `temp/${uuidTag}`;

  const account = `${uuidTag}.testnet`;

  console.log('Creating account..');

  await new Promise(function (resolve, reject) {
    const createAccount = exec(`near create-account ${account} --useFaucet`);

    createAccount.addListener('error', reject);
    createAccount.addListener('exit', resolve);
  });

  console.log('Deploying', argv.projectZip, dirName);

  try {
    await decompress(argv.projectZip, dirName);

    const projectDirName = (await fs.promises.readdir(dirName))[0];
    const params = { cwd: `${dirName}/${projectDirName}/contract-rs` };
    console.log(params);

    console.log('Execution', `${projectDirName}/contract-rs/test.sh`);

    const buildTask = spawn(`./build.sh`, [], params);

    return await new Promise<Deployment>((resolve, reject) => {
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
          const re = /Transaction Id (.*)/g;
          const r = re.exec(data);
          if (r) {
            console.log('[Tx id]', r[1]);
            resolve({
              account,
              txId: r[1],
            });
          }
        });

        deployTask.stderr.on('data', (data) => {
          console.log(`Deploy stderr: ${data}`);
        });
        deployTask.on('close', (code) => {
          reject(null);
        });
      });
    });
  } finally {
    fs.rmSync(dirName, { recursive: true, force: true });
  }
};

const deployHardhatProject = async () => {};

// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/no-floating-promises
yargs(hideBin(process.argv))
  .command(
    'deploy [projectZip]',
    'Deploys specified near project',
    {
      projectZip: {
        default: 'data/contract-rs.zip',
      },
    },
    async (argv: { projectZip: string }) => {
      await deployNearProject(argv);
    }
  )
  .command(
    'deployHardhatFile [projectZip]',
    'Deploys specified hardhat project',
    {
      projectZip: {
        default: 'data/test-solidity.zip',
      },
    },
    deployHardhatProject
  )
  .command('worker', 'Runs worker', worker)

  .help().argv;
