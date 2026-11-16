import { useEffect, useState } from "react";

export default function useResource<T>(load: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(undefined);
    load()
      .then((result) => { if (active) setData(result); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Something went wrong."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt, ...dependencies]);

  return { data, error, loading, retry: () => setAttempt((current) => current + 1) };
}
