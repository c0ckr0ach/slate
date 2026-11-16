import { LoaderCircle, RotateCw } from "lucide-react";

export function LoadingState({ label = "Loading your classroom..." }: { label?: string }) {
  return <div className="request-state" role="status"><LoaderCircle size={20} className="loading-spinner" /><span>{label}</span></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="request-error" role="alert"><div><strong>We couldn't load this just now.</strong><p>{message}</p></div><button className="button button-outline" onClick={onRetry}><RotateCw size={14} />Try again</button></div>;
}
