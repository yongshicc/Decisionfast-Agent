import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchReviews, safeReviewUrl, type ReviewHistory } from './api';
interface LocalState { inferenceCheckedAt: string | null; setInferenceCheckedAt: (value: string | null) => void; history: ReviewHistory | null; error: string | null; loading: boolean; checked: boolean; refresh: () => Promise<void>; links: Record<string,string>; rememberLink: (id: string, url?: string) => void }
const Context = createContext<LocalState | null>(null);
export function LocalProvider({children}: {children: ReactNode}) {
  const [inferenceCheckedAt,setInferenceCheckedAt] = useState<string|null>(null);
  const [history,setHistory] = useState<ReviewHistory|null>(null); const [error,setError] = useState<string|null>(null);
  const [loading,setLoading] = useState(false); const [checked,setChecked] = useState(false); const [links,setLinks] = useState<Record<string,string>>({});
  async function refresh() { setLoading(true); try { setHistory(await fetchReviews()); setError(null); } catch(e) { setError(e instanceof Error ? e.message : String(e)); setHistory(null); } finally {setLoading(false);setChecked(true);} }
  useEffect(() => { void refresh(); }, []);
  function rememberLink(id: string, value?: string) { const url = safeReviewUrl(value); if (url) setLinks(old => ({...old,[id]:url})); }
  return <Context.Provider value={{inferenceCheckedAt,setInferenceCheckedAt,history,error,loading,checked,refresh,links,rememberLink}}>{children}</Context.Provider>;
}
export function useLocal() { const value = useContext(Context); if (!value) throw new Error('LocalProvider is required'); return value; }
