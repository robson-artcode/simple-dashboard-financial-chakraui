import { getStore } from "@netlify/blobs";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const STORE_NAME = "dashboard-assets";
const BLOB_KEY = "assets";

const LOCAL_DATA_DIR = ".data";
const LOCAL_ASSETS_FILE = "assets.json";

function getLocalFilePath(): string {
  return path.join(process.cwd(), LOCAL_DATA_DIR, LOCAL_ASSETS_FILE);
}

async function ensureDataDir(): Promise<void> {
  const dir = path.join(process.cwd(), LOCAL_DATA_DIR);
  await mkdir(dir, { recursive: true });
}

export type AssetsStore = {
  get: (key: string, opts?: { type: "json" }) => Promise<unknown>;
  setJSON: (key: string, value: unknown) => Promise<void>;
};

function useLocalStore(): AssetsStore {
  const filePath = getLocalFilePath();
  return {
    async get(key: string, opts?: { type: "json" }) {
      try {
        const raw = await readFile(filePath, "utf-8");
        const data = JSON.parse(raw);
        return data[key] ?? null;
      } catch {
        return null;
      }
    },
    async setJSON(key: string, value: unknown) {
      await ensureDataDir();
      let data: Record<string, unknown> = {};
      try {
        const raw = await readFile(filePath, "utf-8");
        data = JSON.parse(raw);
      } catch {
        // novo arquivo
      }
      data[key] = value;
      await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    },
  };
}

/**
 * Returns a store for assets: uses Netlify Blobs when available (e.g. on Netlify or `netlify dev`),
 * otherwise falls back to a local JSON file under .data/
 */
export function getAssetsStore(): AssetsStore {
  try {
    const store = getStore({ name: STORE_NAME });
    return {
      async get(key: string, opts?: { type: "json" }) {
        return store.get(key, opts ?? {});
      },
      async setJSON(key: string, value: unknown) {
        await store.setJSON(key, value as object);
      },
    };
  } catch (_err) {
    // MissingBlobsEnvironmentError when not on Netlify / no siteID+token
    return useLocalStore();
  }
}

export { BLOB_KEY };
