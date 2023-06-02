import { existsSync, rmSync } from 'fs-extra';

export default function () {
  if (global.nxLocalRegistryProcess) {
    global.nxLocalRegistryProcess.kill();
  }

  if (existsSync(global.nxLocalRegistryStorage)) {
    rmSync(global.nxLocalRegistryStorage);
  }
}
