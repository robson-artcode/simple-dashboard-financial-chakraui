"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Asset } from "./types";
import { defaultAssetColor, normalizeHexColor } from "./color";

const STORAGE_KEY = "dashboard-financeiro-assets";
const API_PATH = "/api/assets";
const SAVE_DEBOUNCE_MS = 500;

function normalizeAssets(arr: unknown): Asset[] {
  const list = Array.isArray(arr) ? arr : [];
  return list.map((a: Asset) => {
    const normalized = normalizeHexColor((a as Asset).color ?? "");
    return {
      ...a,
      color: normalized ?? defaultAssetColor(a.id),
    };
  });
}

function loadFromLocalStorage(): Asset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalizeAssets(parsed);
  } catch {
    return [];
  }
}

function saveToLocalStorage(assets: Asset[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  } catch {
    // ignore
  }
}

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [mounted, setMounted] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API_PATH);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (cancelled) return;
        setAssets(normalizeAssets(data));
      } catch {
        if (!cancelled) setAssets(loadFromLocalStorage());
      } finally {
        if (!cancelled) setMounted(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistToApi = useCallback((nextAssets: Asset[]) => {
    saveToLocalStorage(nextAssets);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      fetch(API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextAssets),
      }).catch(() => {
        // fallback: already saved to localStorage
      });
    }, SAVE_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    persistToApi(assets);
  }, [assets, mounted, persistToApi]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const add = useCallback((name: string, value: number) => {
    const id = crypto.randomUUID();
    setAssets((prev) => [
      ...prev,
      { id, name: name.trim(), value, color: defaultAssetColor(id) },
    ]);
  }, []);

  const update = useCallback((id: string, name: string, value: number) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, name: name.trim(), value } : a))
    );
  }, []);

  const updateColor = useCallback((id: string, color: string) => {
    const normalized = normalizeHexColor(color);
    if (!normalized) return;
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, color: normalized } : a))
    );
  }, []);

  const remove = useCallback((id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { assets, add, update, updateColor, remove, mounted };
}
