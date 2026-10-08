import React, { useState, useEffect, useMemo, useRef } from 'react'
import Lenis from 'lenis'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

const RARITY_ORDER = ['Basic', 'Rare', 'Epic', 'Legendary', 'Mythical', 'Exclusive']

const GITHUB_REPO_OWNER = 'bomzinho77888'
const GITHUB_REPO_NAME = 'Value-List'
const GITHUB_BRANCH = 'main'
const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}`
const JSDELIVR_BASE = `https://cdn.jsdelivr.net/gh/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}@${GITHUB_BRANCH}`

// Gera a URL do asset hospedado no GitHub com encode correto dos caminhos
function getGitHubAssetUrl(relPath) {
  if (!relPath) return null
  if (relPath.startsWith('http://') || relPath.startsWith('https://')) return relPath
  const clean = relPath.replace(/^\/+/, '')
  const encoded = clean.split('/').map(segment => encodeURIComponent(segment)).join('/')
  return `${GITHUB_RAW_BASE}/${encoded}`
}

export default function App() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRarity, setSelectedRarity] = useState('All')
  const [displayCount, setDisplayCount] = useState(28)
  const sentinelRef = useRef(null)

  // Destruição em tempo real de qualquer /html/body/iframe (anúncios de hosting gratuito / scripts injetados)
  useEffect(() => {
    const purgeIframes = () => {
      const iframes = document.querySelectorAll('body > iframe, iframe')
      iframes.forEach(el => {
        try {
          el.remove()
        } catch {
          if (el.parentNode) el.parentNode.removeChild(el)
        }
      })
    }

    purgeIframes()
    const observer = new MutationObserver(purgeIframes)
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true })
    }
    const timer = setInterval(purgeIframes, 200)

    return () => {
      observer.disconnect()
      clearInterval(timer)
    }
  }, [])

  // Inicializar o motor Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  // Carregar dados da coleção direto do GitHub (com fallback para CDN e local)
  useEffect(() => {
    const dataSources = [
      `${GITHUB_RAW_BASE}/collection.json`,
      `${JSDELIVR_BASE}/collection.json`,
      '/collection.json',
      '/api/collection'
    ]

    async function loadData() {
      for (const url of dataSources) {
        try {
          const res = await fetch(url)
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data) && data.length > 0) {
              setPets(data)
              setLoading(false)
              return
            }
          }
        } catch (err) {
          console.warn(`[Data Fetch] Tentativa em ${url} falhou:`, err)
        }
      }
      setLoading(false)
    }

    loadData()
  }, [])

  // Organizar pets por Raridade (Basic -> Rare -> Epic -> Legendary -> Mythical -> Exclusive)
  // REGRA OFICIAL DE EXCLUSIVOS:
  // - Exclusivo Normal (não Huge): SOMENTE versão Normal (sem Gold, sem Rainbow, sem Dark Matter)
  // - Exclusivo Huge: SOMENTE Normal, Gold e Rainbow (sem Dark Matter)
  // - Pets normais (Basic, Rare, Epic, Legendary, Mythical): Normal, Gold, Rainbow e Dark Matter (se houver)
  const organizedList = useMemo(() => {
    const byRarity = {}
    RARITY_ORDER.forEach(r => { byRarity[r] = [] })

    pets.forEach(pet => {
      const r = pet.rarity || 'Basic'
      if (!byRarity[r]) byRarity[r] = []
      byRarity[r].push(pet)
    })

    Object.keys(byRarity).forEach(r => {
      byRarity[r].sort((a, b) => (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0))
    })

    const fullExpanded = []

    RARITY_ORDER.forEach(rarityName => {
      const petGroup = byRarity[rarityName] || []
      
      const regularPets = []
      const hugePets = []

      petGroup.forEach(pet => {
        const isHuge = pet.huge === true || pet.name.toLowerCase().includes('huge')
        if (isHuge) {
          hugePets.push(pet)
        } else {
          regularPets.push(pet)
        }
      })

      regularPets.sort((a, b) => (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0))
      hugePets.sort((a, b) => (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0))

      const sortedPets = [...regularPets, ...hugePets]
      
      sortedPets.forEach(pet => {
        const isExclusive = pet.rarity === 'Exclusive'
        const isHuge = pet.huge === true || pet.name.toLowerCase().includes('huge')

        // 1. Versão Normal (todos os pets têm)
        fullExpanded.push({
          id: pet.id,
          name: pet.name,
          rarity: pet.rarity,
          variant: 'Normal',
          value: pet.normalValue,
          demand: pet.demand,
          trend: pet.trend,
          image: getGitHubAssetUrl(pet.thumbnail)
        })

        // Se for Exclusivo que NÃO é Huge: para aqui! Apenas a versão Normal existe.
        if (isExclusive && !isHuge) {
          return
        }

        // 2. Versão Golden (Pets normais E Huge Pets)
        fullExpanded.push({
          id: pet.id,
          name: pet.name,
          rarity: pet.rarity,
          variant: 'Golden',
          value: pet.goldenValue,
          demand: pet.demand,
          trend: pet.trend,
          image: getGitHubAssetUrl(pet.goldenThumbnail) || getGitHubAssetUrl(pet.thumbnail)
        })

        // 3. Versão Rainbow (Pets normais E Huge Pets)
        fullExpanded.push({
          id: pet.id,
          name: pet.name,
          rarity: pet.rarity,
          variant: 'Rainbow',
          value: pet.rainbowValue,
          demand: pet.demand,
          trend: pet.trend,
          image: getGitHubAssetUrl(pet.rainbowThumbnail) || getGitHubAssetUrl(pet.thumbnail)
        })

        // 4. Versão Dark Matter (Apenas pets que NÃO são exclusivos e possuem Dark Matter)
        if (!isExclusive && pet.darkMatterThumbnail) {
          fullExpanded.push({
            id: pet.id,
            name: pet.name,
            rarity: pet.rarity,
            variant: 'Dark Matter',
            value: pet.darkMatterValue,
            demand: pet.demand,
            trend: pet.trend,
            image: getGitHubAssetUrl(pet.darkMatterThumbnail)
          })
        }
      })
    })

    return fullExpanded
  }, [pets])

  // Reseta a paginação ao mudar filtro ou busca (carregamento instantâneo)
  useEffect(() => {
    setDisplayCount(28)
  }, [search, selectedRarity])

  // Filtragem exclusivamente por Raridade e Busca
  const filteredList = useMemo(() => {
    return organizedList.filter(item => {
      const matchSearch = search === '' || 
                          item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.variant.toLowerCase().includes(search.toLowerCase()) ||
                          item.id.toString().includes(search)
      const matchRarity = selectedRarity === 'All' || item.rarity === selectedRarity
      return matchSearch && matchRarity
    })
  }, [organizedList, search, selectedRarity])

  // Itens visíveis fatiados em lotes progressivos (evita carregar 400 cards de uma vez)
  const visibleItems = useMemo(() => {
    return filteredList.slice(0, displayCount)
  }, [filteredList, displayCount])

  // Carregamento progressivo infinito conforme o scroll desce
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setDisplayCount(prev => Math.min(prev + 24, filteredList.length))
      }
    }, { rootMargin: '450px' })

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [filteredList.length, displayCount])

  // Cores de variantes
  const getVariantStyle = (variant) => {
    switch (variant) {
      case 'Golden':
        return { color: '#fbbf24', bg: 'rgba(70, 40, 0, 0.45)' }
      case 'Rainbow':
        return { color: '#e879f9', bg: 'rgba(80, 10, 110, 0.45)' }
      case 'Dark Matter':
        return { color: '#f472b6', bg: 'rgba(90, 15, 95, 0.45)' }
      default:
        return { color: '#c084fc', bg: 'rgba(50, 15, 85, 0.4)' }
    }
  }

  // Badges de Raridade
  const getRarityBadge = (rarity) => {
    switch (rarity) {
      case 'Exclusive':
        return { bg: 'rgba(126, 34, 206, 0.45)', text: '#e9d5ff' }
      case 'Mythical':
        return { bg: 'rgba(157, 23, 77, 0.45)', text: '#f5d0fe' }
      case 'Legendary':
        return { bg: 'rgba(180, 83, 9, 0.45)', text: '#fde68a' }
      case 'Epic':
        return { bg: 'rgba(30, 64, 175, 0.45)', text: '#bfdbfe' }
      case 'Rare':
        return { bg: 'rgba(21, 128, 61, 0.45)', text: '#bbf7d0' }
      default:
        return { bg: 'rgba(50, 15, 85, 0.4)', text: '#d8b4fe' }
    }
  }

  const allFilterOptions = ['All', ...RARITY_ORDER]

  const getFilterBorderRadius = (index, total) => {
    const isFirst = index === 0
    const isLast = index === total - 1
    if (isFirst && isLast) return '999px'
    if (isFirst) return '999px 0 0 999px'
    if (isLast) return '0 999px 999px 0'
    return '0'
  }

  return (
    <div>
      {/* LUZES AMBIENTAIS DE FUNDO QUE REVELAM O BLUR ÓPTICO DOS COMPONENTES TRANSLÚCIDOS */}
      <div className="ambient-glow-top" />
      <div className="ambient-glow-bottom" />

      {/* HEADER FIXO ULTRA TRANSLÚCIDO COM BLUR FORTE (30px) */}
      <header className="fixed-header">
        <div style={{ 
          maxWidth: '1440px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          {/* LOGO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <h1 style={{ 
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.35rem', 
              fontWeight: 800, 
              letterSpacing: '-0.02em', 
              color: '#ffffff',
              whiteSpace: 'nowrap'
            }}>
              Pet Simulator X
            </h1>
          </div>

          {/* SEARCHBAR ULTRA TRANSLÚCIDA COM BLUR */}
          <div className="integrated-searchbar">
            <Search size={18} color="#c084fc" style={{ flexShrink: 0 }} />
            <input 
              type="text"
              placeholder="Buscar pet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                minWidth: '120px',
                background: 'transparent',
                color: '#ffffff',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.88rem',
                fontWeight: 500
              }}
            />

            {/* SEGMENTED GROUP TRANSLÚCIDO COM BLUR */}
            <div className="filter-segmented-group">
              {allFilterOptions.map((r, index) => {
                const active = selectedRarity === r
                const borderRadius = getFilterBorderRadius(index, allFilterOptions.length)

                return (
                  <button
                    key={r}
                    onClick={() => setSelectedRarity(r)}
                    style={{
                      position: 'relative',
                      background: 'transparent',
                      color: active ? '#ffffff' : '#d8b4fe',
                      borderRadius: borderRadius,
                      padding: '7px 15px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      zIndex: 1
                    }}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeFilterPill"
                        className="selected-pill-blur"
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 35,
                          mass: 0.6
                        }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: -1
                        }}
                      />
                    )}
                    <span style={{ position: 'relative', zIndex: 2 }}>{r}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* CONTADOR COM BLUR */}
          <div className="counter-box-blur" style={{ 
            padding: '8px 16px', 
            fontSize: '0.78rem', 
            fontWeight: 700,
            color: '#c084fc',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            Cards: <span style={{ color: '#ffffff' }}>{filteredList.length}</span>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL (RENDERIZAÇÃO PROGRESSIVA EM LOTES - ZERO LAG) */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px', position: 'relative', zIndex: 1 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#c084fc', fontSize: '0.95rem', fontWeight: 600 }}>
            Carregando pets...
          </div>
        ) : (
          <>
            <div className="grid-container">
              {visibleItems.map((item) => {
                const stableKey = `${item.id}-${item.variant}`

                return (
                  <PetCard3D
                    key={stableKey}
                    item={item}
                    isVisible={true}
                    vStyle={getVariantStyle(item.variant)}
                    rBadge={getRarityBadge(item.rarity)}
                  />
                )
              })}
            </div>

            {/* SENTINELA PARA CARREGAMENTO PROGRESSIVO SILENCIOSO */}
            {displayCount < filteredList.length && (
              <div 
                ref={sentinelRef} 
                style={{ 
                  height: '60px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'rgba(192, 132, 252, 0.4)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginTop: '20px'
                }}
              >
                Carregando mais pets...
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

// COMPONENTE DE CARD 3D COM ROTAÇÃO AO PASSAR O MOUSE & PARALLAX EM CAMADAS
const PetCard3D = React.memo(function PetCard3D({ item, isVisible, vStyle, rBadge }) {
  const cardRef = useRef(null)
  const sheenRef = useRef(null)
  const wrapperRef = useRef(null)
  const rafRef = useRef(null)

  const handleMouseEnter = () => {
    if (wrapperRef.current) {
      wrapperRef.current.classList.add('card-active-hover')
    }
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.45s cubic-bezier(0.075, 0.82, 0.165, 1), box-shadow 0.45s ease'
    }
  }

  const handleMouseMove = (e) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const currentTarget = e.currentTarget
    const clientX = e.clientX
    const clientY = e.clientY

    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return
      const rect = currentTarget.getBoundingClientRect()
      const x = (clientX - rect.left) / rect.width - 0.5
      const y = (clientY - rect.top) / rect.height - 0.5
      const rotX = (-y * 18).toFixed(2)
      const rotY = (x * 18).toFixed(2)

      cardRef.current.style.transform = `perspective(1100px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.05, 1.05, 1.05)`
      if (sheenRef.current) {
        const sx = (((clientX - rect.left) / rect.width) * 100).toFixed(1)
        const sy = (((clientY - rect.top) / rect.height) * 100).toFixed(1)
        sheenRef.current.style.background = `radial-gradient(circle 240px at ${sx}% ${sy}%, rgba(255, 255, 255, 0.45) 0%, rgba(192, 132, 252, 0.22) 35%, transparent 75%)`
        sheenRef.current.style.opacity = '0.35'
      }
    })
  }

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (wrapperRef.current) {
      wrapperRef.current.classList.remove('card-active-hover')
    }
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.75s cubic-bezier(0.075, 0.82, 0.165, 1), box-shadow 0.6s ease'
      cardRef.current.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    }
    if (sheenRef.current) {
      sheenRef.current.style.opacity = '0'
    }
  }

  return (
    <div 
      ref={wrapperRef}
      className={`virtual-card-wrapper ${isVisible ? 'is-visible' : 'is-hidden'}`} 
      style={{ overflow: 'visible' }}
    >
      <div 
        ref={cardRef}
        className="curved-card-3d"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          height: '340px',
          overflow: 'visible'
        }}
      >
        {/* PLACA DE VIDRO ISOLADA (SEM CLIPAR OS ELEMENTOS 3D) */}
        <div className="card-glass-bg" />

        {/* CAMADA HOLOGRÁFICA / GLOSS DE LUZ 3D QUE SEGUE O MOUSE */}
        <div 
          ref={sheenRef}
          className="card-sheen-overlay"
          style={{
            opacity: 0,
            borderRadius: '26px'
          }}
        />

        {/* TOP BADGES COM BLUR & ELEVAÇÃO 3D */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '10px',
          transform: 'translateZ(26px)',
          transition: 'transform 0.25s ease-out'
        }}>
          <span style={{ 
            background: rBadge.bg, 
            color: rBadge.text, 
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '4px 12px', 
            borderRadius: '999px', 
            fontSize: '0.68rem', 
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {item.rarity}
          </span>

          <span style={{ 
            background: vStyle.bg,
            color: vStyle.color,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '4px 12px', 
            borderRadius: '999px', 
            fontSize: '0.7rem', 
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {item.variant}
          </span>
        </div>

        {/* IMAGEM DO PET COM PARALLAX POP-OUT 3D (SEM CLIP DESCENDANTS & SEM DRAG) */}
        <div style={{
          height: '130px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '10px 0',
          position: 'relative',
          transform: 'translateZ(46px)',
          transition: 'transform 0.25s ease-out',
          overflow: 'visible'
        }}>
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name}
              loading="lazy"
              decoding="async"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitUserDrag: 'none',
                pointerEvents: 'none',
                filter: 'drop-shadow(0 14px 22px rgba(0, 0, 0, 0.5))'
              }}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : (
            <div style={{ color: '#6b21a8', fontSize: '0.8rem' }}>Sem foto</div>
          )}
        </div>

        {/* NOME DO PET COM ELEVAÇÃO 3D */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '14px',
          transform: 'translateZ(28px)',
          transition: 'transform 0.15s ease-out'
        }}>
          <h3 style={{ 
            fontSize: '1.02rem', 
            fontWeight: 700, 
            color: '#ffffff',
            fontFamily: "'Space Grotesk', sans-serif"
          }}>
            {item.name}
          </h3>
        </div>

        {/* VALOR EMBUTIDO COM BLUR TRANSLÚCIDO & PROFUNDIDADE 3D */}
        <div className="value-box-blur" style={{
          padding: '12px',
          textAlign: 'center',
          marginTop: 'auto',
          transform: 'translateZ(22px)',
          transition: 'transform 0.15s ease-out'
        }}>
          <div style={{ 
            color: '#c084fc', 
            fontSize: '0.66rem', 
            fontWeight: 700, 
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            Valor ({item.variant})
          </div>
          <div style={{ 
            color: '#ffffff', 
            fontSize: '1.08rem', 
            fontWeight: 800, 
            marginTop: '2px',
            fontFamily: "'Space Grotesk', sans-serif"
          }}>
            {item.value}
          </div>
        </div>

        {/* DEMANDA E TREND */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '10px',
          padding: '0 6px',
          fontSize: '0.7rem',
          color: '#c084fc',
          fontWeight: 600,
          transform: 'translateZ(18px)',
          transition: 'transform 0.15s ease-out'
        }}>
          <span>Demanda: <strong style={{ color: '#e9d5ff' }}>{item.demand}</strong></span>
          <span>Trend: <strong style={{ color: '#e9d5ff' }}>{item.trend}</strong></span>
        </div>
      </div>
    </div>
  )
})
