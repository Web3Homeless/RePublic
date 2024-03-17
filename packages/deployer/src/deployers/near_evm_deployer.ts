import decompress from 'decompress';
import * as uuid from 'uuid';
import { spawn, exec } from 'child_process';
import { db } from '../db/db.js';
import fs from 'fs';
import { guessProjectType } from '../lib/project_type_guesser.js';
import { Ethereum } from '../lib/near-ethereum.js';
import {
  deriveChildPublicKey,
  najPublicKeyStrToUncompressedHexPoint,
  uncompressedHexPointToEvmAddress,
} from '../lib/kdf.js';
import { providers } from 'near-api-js';
import * as nearAPI from 'near-api-js';
import { bytesToHex } from '@ethereumjs/util';

const THIRTY_TGAS = '30000000000000';
const NO_DEPOSIT = '0';
const TGAS = 1000000000000;

const { connect } = nearAPI;

const { keyStores, KeyPair } = nearAPI;
const myKeyStore = new keyStores.InMemoryKeyStore();
const PRIVATE_KEY =
  'by8kdJoJHu7uUkKfoaLd2J2Dp1q1TigeWMG123pHdu9UREqPcshCM223kWadm';
// creates a public / private key pair using the provided private key
const keyPair = KeyPair.fromString(PRIVATE_KEY);
// adds the keyPair you created to keyStore
await myKeyStore.setKey('testnet', 'republic-deploy.testnet', keyPair);

const connectionConfig = {
  networkId: 'testnet',
  keyStore: myKeyStore, // first create a key store
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://testnet.mynearwallet.com/',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://testnet.nearblocks.io',
};
const nearConnection = await connect(connectionConfig);

// Make a read-only call to retrieve information from the network
async function viewMethod({
  contractId,
  method,
  args = {},
}: {
  contractId: string;
  method: string;
  args: object;
}) {
  const provider = new providers.JsonRpcProvider({
    url: 'https://rpc.testnet.near.org',
  });

  let res = await provider.query({
    request_type: 'call_function',
    account_id: contractId,
    method_name: method,
    args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
    finality: 'optimistic',
  });
  return JSON.parse(Buffer.from((res as any).result).toString());
}

async function callMethod({
  contractId,
  method,
  args = {},
  gas = THIRTY_TGAS,
  deposit = NO_DEPOSIT,
}: {
  contractId: string;
  method: string;
  args: object;
  gas: string;
  deposit?: string;
}) {
  // Sign a transaction with the "FunctionCall" action
  const account = await nearConnection.account('example-account.testnet');
  return await account.signAndSendTransaction({
    receiverId: contractId,
    actions: [
      {
        enum: 'FunctionCall',
        functionCall: {
          methodName: method,
          args: args as any,
          gas,
          deposit,
        },
      },
    ],
  });
}

export type Deployment = {
  account: string;
  txId: string;
};
const MPC_CONTRACT = 'multichain-testnet-2.testnet';

async function deriveEthAddress(accountId: string, derivation_path: string) {
  const rootPublicKey = await viewMethod({
    contractId: MPC_CONTRACT,
    method: 'public_key',
    args: {},
  });
  console.log('Root public key', rootPublicKey);
  const publicKey = await deriveChildPublicKey(
    najPublicKeyStrToUncompressedHexPoint(rootPublicKey),
    accountId,
    derivation_path
  );
  return uncompressedHexPointToEvmAddress(publicKey);
}

async function getTransactionResult(txhash: string) {
  const provider = new providers.JsonRpcProvider({
    url: 'https://rpc.testnet.near.org',
  });

  const transaction = await provider.txStatus(txhash, 'unnused');
  return providers.getTransactionLastResult(transaction);
}

export const deployNearEvmProject = async (argv: {
  projectZip: string;
  taskId?: string;
}) => {
  console.log('Deploying');

  const uuidTag = uuid.v4();

  const dirName = `temp/${uuidTag}`;

  const account = `${uuidTag}.testnet`;

  console.log('Creating account..');

  const derivation = 'testacc';

  // deriveEthAddress;

  const Sepolia = 11155111;
  const Eth = new Ethereum('https://rpc2.sepolia.org', Sepolia);

  const eth_sender = await deriveEthAddress(derivation, 'republic.testnet');

  const projectTypeInfo = await guessProjectType(argv.projectZip);

  if (projectTypeInfo.type != 'hardhat') {
    throw Error('Invalid project type');
  }

  const artifactsDir = `${projectTypeInfo.root}/artifacts`;
  console.log('Artifacts dir', artifactsDir);

  const artifacts = await fs.promises.readdir(artifactsDir);
  const artifactDir = artifactsDir + '/' + artifacts[0];
  const artifactFile =
    artifactDir + '/' + (await fs.promises.readdir(artifactDir));

  console.log('Artifacts file', artifactFile);

  const bytecode = JSON.parse(
    (await fs.promises.readFile(artifactFile)).toString()
  ).bytecode;

  console.log('Read bytecode', bytecode.substring(0, 20));

  const { transaction, payload } = await Eth.createDeploymentPayload(
    eth_sender,
    bytecode
  );

  const request = await callMethod({
    contractId: MPC_CONTRACT,
    method: 'sign',
    args: { payload, path: derivation },
    gas: `${300 * TGAS}`,
  });

  const [big_r, big_s] = await getTransactionResult(request.transaction.hash);

  const r = Buffer.from(big_r.substring(2), 'hex');
  const s = Buffer.from(big_s, 'hex');

  const candidates = [0n, 1n].map((v) => transaction.addSignature(v, r, s));
  const signedTransaction = candidates.find(
    (c) =>
      c.getSenderAddress().toString().toLowerCase() === eth_sender.toLowerCase()
  );

  if (!signedTransaction) {
    throw new Error('Signature is not valid');
  }

  const txHash = Eth.relayTransaction(signedTransaction);

  return {
    account,
    txId: txHash,
  };
};
