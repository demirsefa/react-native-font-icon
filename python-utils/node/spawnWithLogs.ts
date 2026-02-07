import { spawn } from 'node:child_process';

/**
 * Minimal spawn wrapper that streams stdio to parent.
 */
export function spawnWithLogs(
  command: string,
  args: string[],
  options: Parameters<typeof spawn>[2]
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

