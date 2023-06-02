import { join } from 'path';
import * as detectPort from 'detect-port';
import { ChildProcess, execSync, spawn } from 'child_process';

export default async function () {
  const port = await detectPort(4872);
  const registry = `http://localhost:${port}`;
  process.env.npm_config_registry = registry;
  process.env.YARN_REGISTRY = registry;

  global.nxLocalRegistryStorage = join(
    process.cwd(),
    'tmp/local-registry/storage',
    process.env.NX_TASK_TARGET_PROJECT ?? ''
  );

  global.nxLocalRegistryProcess = await new Promise<ChildProcess>(
    (resolve, reject) => {
      const childProcess = spawn(
        `nx`,
        `local-registry @nx/nx-source --location none --port ${port} --storage ${global.nxLocalRegistryStorage}`.split(
          ' '
        )
      );

      childProcess.stdout.on('data', (data) => {
        if (data.toString().includes(registry)) {
          console.log('local registry started');
          resolve(childProcess);
        }
      });
      childProcess.stderr.on('data', (data) => {
        process.stdout.write(data);
        reject(data);
      });
      childProcess.on('error', (err) => {
        console.log('local registry error', err);
        reject(err);
      });
      childProcess.on('exit', (code) => {
        console.log('local registry exit', code);
        reject(code);
      });
    }
  );

  execSync('pnpm nx-release major');
}
