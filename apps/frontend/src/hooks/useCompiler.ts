import { startTransition, useDeferredValue, useEffect, useState } from "react";
import {
  compileSource,
  type MachineComputation,
  initialSource,
} from "../lib/compiler";

export function useCompiler() {
  const [source, setSource] = useState(initialSource);
  const deferredSource = useDeferredValue(source);
  const isCompiling = source !== deferredSource;
  const [result, setResult] = useState<MachineComputation>(() =>
    compileSource(initialSource),
  );

  useEffect(() => {
    const nextResult = compileSource(deferredSource);

    startTransition(() => {
      setResult(nextResult);
    });
  }, [deferredSource]);

  return {
    source,
    setSource,
    result,
    isCompiling,
  };
}
