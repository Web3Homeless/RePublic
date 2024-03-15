#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import decompress from 'decompress';
import * as uuid from 'uuid';

const deploy = async (argv: { projectZip: string }) => {
  console.log('Deploying', argv.projectZip, uuid.v4());

  await decompress(argv.projectZip, `temp/${uuid.v4()}`);
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
