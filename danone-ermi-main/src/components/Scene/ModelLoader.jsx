import { Suspense, useEffect, useState } from "react";
import Model, { MODEL_PATH } from "./Model";
import PlaceholderModel from "./PlaceholderModel";

// Probes whether the model is reachable before mounting <Model>. If absent
// (HEAD 404), shows the placeholder so dev work continues without the file.
// The path is imported from Model.jsx — if these two ever disagree, the probe
// 404s and the placeholder cube silently ships to production.
export default function ModelLoader() {
  const [hasModel, setHasModel] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(MODEL_PATH, { method: "HEAD" })
      .then((r) => !cancelled && setHasModel(r.ok))
      .catch(() => !cancelled && setHasModel(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (hasModel === null) return null;
  if (!hasModel) return <PlaceholderModel />;

  return (
    <Suspense fallback={null}>
      <Model />
    </Suspense>
  );
}
