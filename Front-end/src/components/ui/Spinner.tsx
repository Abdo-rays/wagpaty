export default function Spinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
      {text && <p className="text-fg3 text-sm">{text}</p>}
    </div>
  )
}

export function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
        <p className="text-fg3 text-sm">Loading...</p>
      </div>
    </div>
  )
}
