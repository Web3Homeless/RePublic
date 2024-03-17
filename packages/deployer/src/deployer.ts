#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import decompress from 'decompress';
import * as uuid from 'uuid';
import { spawn, exec } from 'child_process';
import { db } from './db/db.js';
import fs from 'fs';
import { guessProjectType } from './lib/project_type_guesser.js';
import { deployNearRustProject } from './deployers/near_rust_deployer.js';
import { deployStylusProject } from './deployers/stylus_deployer.js';

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

  try {
    let deployment;
    if (task.chainId == '0') {
      deployment = await deployNearRustProject({
        projectZip: archName,
        taskId: task.id,
      });
    } else if (task.chainId == '23011913') {
      deployment = await deployStylusProject({
        projectZip: archName,
        taskId: task.id,
      });
    } else {
      throw Error('');
    }

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
  } catch (e) {
    console.log(e);
    await db.userDeployment.update({
      data: {
        status: 'Failed',
      },
      where: {
        id: task?.id,
      },
    });
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
      await deployNearRustProject(argv);
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
