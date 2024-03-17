import decompress from 'decompress';
import * as uuid from 'uuid';
import { spawn, exec } from 'child_process';
import { db } from '../db/db.js';
import fs from 'fs';
import { guessProjectType } from '../lib/project_type_guesser.js';

export type Deployment = {
  account: string;
  txId: string;
};

export const deployNearRustProject = async (argv: {
  projectZip: string;
  taskId?: string;
}) => {
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

    console.log('Guessing type...');

    const guessedType = await guessProjectType(dirName);
  
    console.log('Guessed type', guessedType);  

    const projectDirName = guessedType.root;
    const params = { cwd: projectDirName };
    console.log(params);

    console.log('Execution', projectDirName);

    const buildTask = spawn(`./build.sh`, [], params);

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

        const re = /could not compile (.*)/g;
        const r = re.exec(data);
        if (r) {
          console.log('[Error]', r[1]);
          reject({
            error: r[1],
          });
        }
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

        deployTask.stdout.on('data', async (data) => {
          argv.taskId &&
            (await db.deploymentLog.create({
              data: {
                timestamp: new Date(),
                text: `[dOUT] ${data}`,
                deploymentId: argv.taskId,
              },
            }));

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

        deployTask.stderr.on('data', async (data) => {
          argv.taskId &&
            (await db.deploymentLog.create({
              data: {
                timestamp: new Date(),
                text: `[dERR] ${data}`,
                deploymentId: argv.taskId,
              },
            }));

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