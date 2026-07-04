import { startTransition, useEffect, useRef, useState } from "react";
import {
  compileSource,
  type MachineComputation,
  initialSource,
  SOURCE_STORAGE_KEY,
} from "../lib/compiler";

const COMPILE_DEBOUNCE_MS = 150;

export function useCompiler() {
  const [source, setSource] = useState(() => {
    try {
      const savedSource = window.localStorage.getItem(SOURCE_STORAGE_KEY);
      return savedSource ?? initialSource;
    } catch {
      return initialSource;
    }
  });
  const [result, setResult] = useState<MachineComputation>(() =>
    compileSource(initialSource),
  );
  const [isCompiling, setIsCompiling] = useState(false);
  const lastCompiledSource = useRef(initialSource);

  useEffect(() => {
    if (source === lastCompiledSource.current) {
      return;
    }

    setIsCompiling(true);

    const timer = window.setTimeout(() => {
      const nextResult = compileSource(source);
      lastCompiledSource.current = source;

      startTransition(() => {
        setResult(nextResult);
        setIsCompiling(false);
      });
    }, COMPILE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [source]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SOURCE_STORAGE_KEY, source);
    } catch {
      // Ignore storage write errors (private mode, quota, etc.)
    }
  }, [source]);

  return {
    source,
    setSource,
    result,
    isCompiling,
  };
}
