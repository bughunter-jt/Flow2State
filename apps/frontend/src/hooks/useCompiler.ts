import { startTransition, useEffect, useRef, useState } from "react";
import {
  compileSource,
  type MachineComputation,
  initialSource,
} from "../lib/compiler";

const COMPILE_DEBOUNCE_MS = 150;

export function useCompiler() {
  const [source, setSource] = useState(initialSource);
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

  return {
    source,
    setSource,
    result,
    isCompiling,
  };
}
