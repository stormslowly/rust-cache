import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as ghCache from "@actions/cache";
import fs from "fs";
import * as cache from "./cache/cache"

export function reportError(e: any) {
  const { commandFailed } = e;
  if (commandFailed) {
    core.error(`Command failed: ${commandFailed.command}`);
    core.error(commandFailed.stderr);
  } else {
    core.error(`${e.stack}`);
  }
}

export async function getCmdOutput(
  cmd: string,
  args: Array<string> = [],
  options: exec.ExecOptions = {},
): Promise<string> {
  let stdout = "";
  let stderr = "";
  try {
    await exec.exec(cmd, args, {
      silent: true,
      listeners: {
        stdout(data) {
          stdout += data.toString();
        },
        stderr(data) {
          stderr += data.toString();
        },
      },
      ...options,
    });
  } catch (e) {
    (e as any).commandFailed = {
      command: `${cmd} ${args.join(" ")}`,
      stderr,
    };
    throw e;
  }
  return stdout;
}

export interface CacheProvider {
  name: string;
  cache: typeof ghCache;
}

export function getCacheProvider(): CacheProvider {
  return {
    name: "lynx-cache",
    // @ts-ignore
    cache,
  };
}

export async function exists(path: string) {
  try {
    await fs.promises.access(path);
    return true;
  } catch {
    return false;
  }
}
