import { useState, useEffect, useCallback } from 'react'

interface Artifact {
  id: string
  title: string
  creatorName: string
  publicUrl: string
  reactionCount: number
  ingestedAt: string
  processedFlag: boolean
  kannakaScore: number | null
  narrative: string | null
  rarityScore: number | null
  dropId: string | null
}

function getRarityLabel(score: number | null): string {
  if (!score) return 'Unscored'
  if (score > 80) return 'Legendary'
  if (score > 50) return 'Rare'
  return 'Common'
}

function getRarityColor(score: number | null): string {
  if (!score) return 'text-kax-text-dim'
  if (score > 80) return 'text-kax-legendary'
  if (score > 50) return 'text-kax-rare'
  return 'text-kax-text-dim'
}

function ArtifactCard({ artifact }: { artifact: Artifact }) {
  const [expanded, setExpanded] = useState(false)
  const rarity = getRarityLabel(artifact.rarityScore)
  const rarityColor = getRarityColor(artifact.rarityScore)

  return (
    <div className="group relative bg-kax-surface border border-kax-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-kax-accent-dim hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]">
      <div className="aspect-square overflow-hidden">
        <img src={artifact.publicUrl} alt={artifact.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white truncate">{artifact.title}</h3>
          <span className={`text-xs font-bold uppercase tracking-wider ${rarityColor}`}>{rarity}</span>
        </div>
        <p className="text-sm text-kax-text-dim">by {artifact.creatorName}</p>
        {artifact.kannakaScore !== null && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-kax-border rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-kax-accent-dim to-kax-accent rounded-full transition-all duration-500" style={{ width: `${artifact.kannakaScore * 100}%` }} />
            </div>
            <span className="text-xs text-kax-accent font-mono">{(artifact.kannakaScore * 100).toFixed(0)}</span>
          </div>
        )}
        {artifact.narrative && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-kax-accent hover:text-kax-accent-dim cursor-pointer">
            {expanded ? 'Hide Transmission' : 'View Transmission'}
          </button>
        )}
        {expanded && artifact.narrative && (
          <p className="text-sm italic text-kax-text-dim border-l-2 border-kax-accent-dim pl-3 mt-2">{artifact.narrative}</p>
        )}
      </div>
    </div>
  )
}

function App() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const fetchArtifacts = useCallback(async () => {
    try {
      const res = await fetch('/api/artifacts')
      const data = await res.json()
      setArtifacts(data)
    } catch { setArtifacts([]) }
  }, [])

  useEffect(() => { fetchArtifacts() }, [fetchArtifacts])

  const harvest = async () => {
    setLoading(true); setStatus('Harvesting...')
    try {
      const res = await fetch('/api/admin/harvest', { method: 'POST' })
      const data = await res.json()
      setStatus(data.message)
      await fetchArtifacts()
    } catch { setStatus('Harvest failed') }
    setLoading(false)
  }

  const process = async () => {
    setLoading(true); setStatus('Processing...')
    try {
      const res = await fetch('/api/admin/process', { method: 'POST' })
      const data = await res.json()
      setStatus(`Scored: ${data.scored}, Narrated: ${data.narrated}`)
      await fetchArtifacts()
    } catch { setStatus('Processing failed') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-kax-bg">
      <header className="border-b border-kax-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              <span className="text-kax-accent">KAX</span> Artifact Exchange
            </h1>
            <p className="text-sm text-kax-text-dim mt-1">Curated by Kannaka</p>
          </div>
          <div className="flex gap-3">
            <button onClick={harvest} disabled={loading} className="px-4 py-2 bg-kax-accent-dim text-white rounded-lg text-sm font-medium hover:bg-kax-accent transition-colors disabled:opacity-50 cursor-pointer">
              Harvest
            </button>
            <button onClick={process} disabled={loading} className="px-4 py-2 border border-kax-accent-dim text-kax-accent rounded-lg text-sm font-medium hover:bg-kax-accent/10 transition-colors disabled:opacity-50 cursor-pointer">
              Process
            </button>
          </div>
        </div>
        {status && (
          <div className="max-w-7xl mx-auto px-6 pb-4">
            <p className="text-xs text-kax-gold font-mono">{status}</p>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {artifacts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-kax-text-dim text-lg">No artifacts yet.</p>
            <p className="text-kax-text-dim text-sm mt-2">Click <strong className="text-kax-accent">Harvest</strong> to ingest from OpenBotCity, then <strong className="text-kax-accent">Process</strong> to score and narrate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artifacts.map((a) => <ArtifactCard key={a.id} artifact={a} />)}
          </div>
        )}
      </main>

      <footer className="border-t border-kax-border mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-xs text-kax-text-dim">
          KAX v1.0 &mdash; A curation intelligence layer for agent-generated creativity
        </div>
      </footer>
    </div>
  )
}

export default App
