import fs from 'fs';
``;
export async function guessProjectType(baseDir: string) {
  let root = baseDir;

  // Skip empty dirs
  for (let i = 0; i < 5; i++) {
    const dirInfo = (await fs.promises.readdir(root, { withFileTypes: true }))
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    console.log('di', dirInfo);

    if (dirInfo.length == 0) {
      return {
        type: 'empty',
        root: '',
      };
    }
    if (dirInfo.length == 1) {
      root = root + '/' + dirInfo[0];
    } else {
      break;
    }
  }

  const rootInspection = await inspect(root);

  if (rootInspection.type) return rootInspection;

  for (let dir of (await fs.promises.readdir(root, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)) {
    const rootInspection = await inspect(root + '/' + dir);

    if (rootInspection.type) return rootInspection;
  }

  return {
    type: 'unknown',
    root: '',
  };
}

async function inspect(rootDir: string) {
  console.log('Inspecting', rootDir);

  let dirInfo;
  try {
    dirInfo = await fs.promises.readdir(rootDir);
  } catch {
    return {
      type: undefined,
      root: '',
    };
  }
  console.log('Dii', dirInfo);
  for (let dir of dirInfo) {
    if (/hardhat.config.ts/.test(dir)) {
      return {
        type: 'hardhat',
        root: rootDir,
      };
    }
    if (/Cargo.toml/.test(dir)) {
      return { type: 'near-rust', root: rootDir };
    }
  }
  return {
    type: undefined,
    root: '',
  };
}

('/Users/andrey/projects/RePublic/packages/deployer/temp/e1e970c9-8639-4f87-a049-1dcbd99db8c9/MadL1me-counters-33c79d6');
