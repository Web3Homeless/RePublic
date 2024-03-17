import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import decompress from 'decompress';
import * as uuid from 'uuid';
import { spawn, exec } from 'child_process';
import { db } from '../db/db.js';
import fs from 'fs';
import { guessProjectType } from '../lib/project_type_guesser.js';
import dotenv from 'dotenv';

export type Deployment = {
  account: string;
  txId: string;
};

export const deployStylusProject = async (argv: {
  projectZip: string;
  taskId?: string;
}) => {
  dotenv.config();

  const uuidTag = uuid.v4();

  const dirName = `temp/${uuidTag}`;

  console.log('Creating account..');

  let deploymentTx: string;
  let contractAddr: string;

  await new Promise(function (resolve, reject) {
    const createAccount = exec(
      `echo ${process.env.PK} >> ~/REPUBLIC_PRIVKEY_FILE`
    );
    createAccount.addListener('message', (m) => console.log('MESSAGE', m));

    createAccount.addListener('error', reject);
    createAccount.addListener('exit', resolve);
  });

  console.log('Deploying', argv.projectZip, dirName);

  try {
    await decompress(argv.projectZip, dirName);

    console.log('Guessing type...');

    const guessedType = await guessProjectType(dirName);

    console.log('Guessed type', guessedType);

    const projectDirName = guessedType.root;
    const params = { cwd: projectDirName };
    console.log(params);

    console.log('Execution', projectDirName);

    const buildTask = spawn(
      `sh`,
      [
        '-c',
        'cargo stylus deploy \
    --private-key-path=/Users/andrey/REPUBLIC_PRIVKEY_FILE',
      ],
      params
    );

    return await new Promise<Deployment>((resolve, reject) => {
      buildTask.stdout.on('data', async (data) => {
        argv.taskId &&
          (await db.deploymentLog.create({
            data: {
              timestamp: new Date(),
              text: `[OUT] ${data}`,
              deploymentId: argv.taskId,
            },
          }));

        console.log(`stdout: ${data}`);

        const confirmedDeploymentMatch = /Confirmed deployment tx (.*)/g.exec(
          data
        );
        if (confirmedDeploymentMatch) {
          console.log('[Found deployment tx]', confirmedDeploymentMatch[1]);
          deploymentTx = confirmedDeploymentMatch[1];
          resolve({
            account: contractAddr.replace(
              /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
              ''
            ),
            txId: deploymentTx.replace(
              /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
              ''
            ),
          });
        }

        const activatingOnAddressMatch =
          /Deploying program to address (.*)/g.exec(data);
        if (activatingOnAddressMatch) {
          console.log('[Found contract addr]', activatingOnAddressMatch[1]);
          contractAddr = activatingOnAddressMatch[1];
        }
      });

      buildTask.stderr.on('data', async (data) => {
        argv.taskId &&
          (await db.deploymentLog.create({
            data: {
              timestamp: new Date(),
              text: `[ERR] ${data}`,
              deploymentId: argv.taskId,
            },
          }));

        console.log(`stderr: ${data}`);

        if (/could not compile/g.exec(data)) {
          reject({
            error: '',
          });
        }
      });

      buildTask.on('exit', (code) => {
        // console.log('Closing.....');
      });
    });
  } finally {
    fs.rmSync(dirName, { recursive: true, force: true });
  }
};
