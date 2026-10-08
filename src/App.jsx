import React, { useState, useEffect, useMemo, useRef } from 'react'
import Lenis from 'lenis'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

const GITHUB_REPO_OWNER = 'bomzinho77888'
const GITHUB_REPO_NAME = 'Value-List'
const GITHUB_BRANCH = 'main'
const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}`
const JSDELIVR_BASE = `https://cdn.jsdelivr.net/gh/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}@${GITHUB_BRANCH}`

// Filtros específicos para a lista exclusiva
const EXCLUSIVE_FILTERS = [
  { id: 'All', label: 'All' },
  { id: 'Regular', label: 'Regular' },
  { id: 'Huge', label: 'Huge' }
]

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
  const [selectedFilter, setSelectedFilter] = useState('All')
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

  // Load collection data directly with cache busting to guarantee immediate updates
  useEffect(() => {
    const timestamp = Date.now()
    const dataSources = [
      `${GITHUB_RAW_BASE}/collection.json?t=${timestamp}`,
      `/collection.json?t=${timestamp}`,
      `${JSDELIVR_BASE}/collection.json?t=${timestamp}`,
      '/api/collection'
    ]

    async function loadData() {
      for (const url of dataSources) {
        try {
          const res = await fetch(url, { cache: 'no-store' })
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data) && data.length > 0) {
              setPets(data)
              setLoading(false)
              return
            }
          }
        } catch (err) {
          console.warn(`[Data Fetch] Attempt at ${url} failed:`, err)
        }
      }
      setLoading(false)
    }

    loadData()
  }, [])

  // ========================================================
  // EXCLUSIVOS ONLY: Filtra exclusivamente pets da raridade Exclusive
  // ========================================================
  const exclusivePets = useMemo(() => {
    return pets.filter(pet => {
      const petName = (pet.name || '').toLowerCase()
      if (pet.id === '183' || pet.id === 183 || petName.includes('blue big maskot')) {
        return false
      }
      const isExclusive = pet.rarity === 'Exclusive' || petName.includes('huge')
      return isExclusive
    })
  }, [pets])

  // Organizar pets exclusivos:
  // - Exclusivo Normal (não Huge): SOMENTE versão Normal (sem Gold, sem Rainbow)
  // - Exclusivo Huge: Versão Normal, Gold e Rainbow
  const organizedList = useMemo(() => {
    const regularPets = []
    const hugePets = []

    exclusivePets.forEach(pet => {
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
    const fullExpanded = []

    sortedPets.forEach(pet => {
      const isHuge = pet.huge === true || pet.name.toLowerCase().includes('huge')

      // 1. Versão Normal (todos os exclusivos possuem)
      fullExpanded.push({
        id: pet.id,
        name: pet.name,
        rarity: 'Exclusive',
        isHuge: isHuge,
        category: isHuge ? 'Huge' : 'Regular',
        variant: 'Normal',
        value: pet.normalValue,
        demand: pet.demand,
        trend: pet.trend,
        image: getGitHubAssetUrl(pet.thumbnail)
      })

      // Se for Exclusivo que NÃO é Huge: para aqui!
      if (!isHuge) {
        return
      }

      // 2. Versão Golden (apenas Huge Pets)
      fullExpanded.push({
        id: pet.id,
        name: pet.name,
        rarity: 'Exclusive',
        isHuge: true,
        category: 'Huge',
        variant: 'Golden',
        value: pet.goldenValue,
        demand: pet.demand,
        trend: pet.trend,
        image: getGitHubAssetUrl(pet.goldenThumbnail) || getGitHubAssetUrl(pet.thumbnail)
      })

      // 3. Versão Rainbow (apenas Huge Pets)
      fullExpanded.push({
        id: pet.id,
        name: pet.name,
        rarity: 'Exclusive',
        isHuge: true,
        category: 'Huge',
        variant: 'Rainbow',
        value: pet.rainbowValue,
        demand: pet.demand,
        trend: pet.trend,
        image: getGitHubAssetUrl(pet.rainbowThumbnail) || getGitHubAssetUrl(pet.thumbnail)
      })
    })

    return fullExpanded
  }, [exclusivePets])

  // Reseta a paginação ao mudar filtro ou busca (carregamento instantâneo)
  useEffect(() => {
    setDisplayCount(28)
  }, [search, selectedFilter])

  // Filtragem por Categoria (Todos, Exclusivos Normais, Huges) e Busca
  const filteredList = useMemo(() => {
    return organizedList.filter(item => {
      const matchSearch = search === '' || 
                          item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.variant.toLowerCase().includes(search.toLowerCase()) ||
                          item.id.toString().includes(search)
      const matchFilter = selectedFilter === 'All' || item.category === selectedFilter
      return matchSearch && matchFilter
    })
  }, [organizedList, search, selectedFilter])

  // Itens visíveis fatiados em lotes progressivos (evita carregar centenas de cards de uma vez)
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
        return { color: '#fbbf24', bg: 'rgba(70, 40, 0, 0.5)' }
      case 'Rainbow':
        return { color: '#e879f9', bg: 'rgba(80, 10, 110, 0.5)' }
      default:
        return { color: '#c084fc', bg: 'rgba(50, 15, 85, 0.45)' }
    }
  }

  // Badges de Raridade
  const getRarityBadge = (item) => {
    if (item.isHuge) {
      return { bg: 'rgba(219, 39, 119, 0.45)', text: '#fbcfe8', label: 'Huge' }
    }
    return { bg: 'rgba(126, 34, 206, 0.45)', text: '#e9d5ff', label: 'Exclusive' }
  }

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
        <div className="header-inner">
          {/* LADO SUPERIOR NO MOBILE / ESQUERDO NO DESKTOP */}
          <div className="header-top-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <img 
                src="https://raw.githubusercontent.com/bomzinho77888/Value-List/main/logo.png"
                onError={(e) => { e.currentTarget.src = '/logo.png' }}
                alt="Logo"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 0 12px rgba(192, 132, 252, 0.45)',
                  border: '1.5px solid rgba(192, 132, 252, 0.4)',
                  flexShrink: 0
                }}
              />
              <h1 style={{ 
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.25rem', 
                fontWeight: 800, 
                letterSpacing: '-0.02em', 
                color: '#ffffff',
                whiteSpace: 'nowrap'
              }}>
                Pet Simulator X Return
              </h1>
            </div>
          </div>

          {/* SEARCHBAR E FILTROS SEGMENTADOS */}
          <div className="integrated-searchbar">
            <Search size={18} color="#c084fc" style={{ flexShrink: 0 }} />
            <input 
              type="text"
              placeholder="Search exclusive pet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                minWidth: '80px',
                background: 'transparent',
                color: '#ffffff',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.86rem',
                fontWeight: 500
              }}
            />

            {/* SEGMENTED GROUP TRANSLÚCIDO COM BLUR */}
            <div className="filter-segmented-group">
              {EXCLUSIVE_FILTERS.map((f, index) => {
                const active = selectedFilter === f.id
                const borderRadius = getFilterBorderRadius(index, EXCLUSIVE_FILTERS.length)

                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id)}
                    style={{
                      position: 'relative',
                      background: 'transparent',
                      color: active ? '#ffffff' : '#d8b4fe',
                      borderRadius: borderRadius,
                      padding: '6px 14px',
                      fontSize: '0.72rem',
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
                    <span style={{ position: 'relative', zIndex: 2 }}>{f.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL (RENDERIZAÇÃO PROGRESSIVA EM LOTES - ZERO LAG) */}
      <main className="main-content-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#c084fc', fontSize: '0.95rem', fontWeight: 600 }}>
            Loading exclusive pets...
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
                    rBadge={getRarityBadge(item)}
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
                Loading more exclusives...
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

// ========================================================
// CARD 3D ULTRA TRANSLÚCIDO COM SUPORTE TOTAL A TOUCH / MOUSE
// ========================================================
const PetCard3D = React.memo(({ item, isVisible, vStyle, rBadge }) => {
  const cardRef = useRef(null)
  const sheenRef = useRef(null)
  const wrapperRef = useRef(null)
  const rafRef = useRef(null)

  // Suporte Mouse Desktop
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

  // Suporte Touch Nativo (Tablets e Celulares)
  const handleTouchStart = (e) => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.15s ease-out'
      cardRef.current.style.transform = 'perspective(900px) scale3d(0.97, 0.97, 0.97)'
    }
    if (sheenRef.current && e.touches[0]) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clientX = e.touches[0].clientX
      const clientY = e.touches[0].clientY
      const sx = (((clientX - rect.left) / rect.width) * 100).toFixed(1)
      const sy = (((clientY - rect.top) / rect.height) * 100).toFixed(1)
      sheenRef.current.style.background = `radial-gradient(circle 180px at ${sx}% ${sy}%, rgba(255, 255, 255, 0.4) 0%, rgba(192, 132, 252, 0.25) 40%, transparent 80%)`
      sheenRef.current.style.opacity = '0.4'
    }
  }

  const handleTouchMove = (e) => {
    if (!e.touches[0] || !cardRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clientX = e.touches[0].clientX
    const clientY = e.touches[0].clientY
    const x = (clientX - rect.left) / rect.width - 0.5
    const y = (clientY - rect.top) / rect.height - 0.5
    const rotX = (-y * 12).toFixed(1)
    const rotY = (x * 12).toFixed(1)
    cardRef.current.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const handleTouchEnd = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'visible'
        }}
      >
        {/* PLACA DE VIDRO ISOLADA (SEM CLIPAR OS ELEMENTOS 3D) */}
        <div className="card-glass-bg" />

        {/* CAMADA HOLOGRÁFICA / GLOSS DE LUZ 3D */}
        <div 
          ref={sheenRef}
          className="card-sheen-overlay"
          style={{
            opacity: 0
          }}
        />

        {/* TOP BADGES COM BLUR & ELEVAÇÃO 3D */}
        <div className="card-badges-row" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          transform: 'translateZ(26px)',
          transition: 'transform 0.25s ease-out'
        }}>
          <span className="badge-pill" style={{ 
            background: rBadge.bg, 
            color: rBadge.text, 
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {rBadge.label}
          </span>

          <span className="badge-pill" style={{ 
            background: vStyle.bg,
            color: vStyle.color,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {item.variant}
          </span>
        </div>

        {/* IMAGEM DO PET COM PARALLAX POP-OUT 3D */}
        <div className="pet-image-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
            <div style={{ color: '#6b21a8', fontSize: '0.8rem' }}>No image</div>
          )}
        </div>

        {/* NOME DO PET COM ELEVAÇÃO 3D */}
        <div style={{ 
          textAlign: 'center', 
          transform: 'translateZ(28px)',
          transition: 'transform 0.15s ease-out'
        }}>
          <h3 className="pet-name-title" style={{ 
            fontWeight: 700, 
            color: '#ffffff',
            fontFamily: "'Space Grotesk', sans-serif"
          }}>
            {item.name}
          </h3>
        </div>

        {/* VALOR EMBUTIDO COM BLUR TRANSLÚCIDO & PROFUNDIDADE 3D */}
        <div className="value-box-blur" style={{
          textAlign: 'center',
          marginTop: 'auto',
          transform: 'translateZ(22px)',
          transition: 'transform 0.15s ease-out'
        }}>
          <div style={{ 
            color: '#c084fc', 
            fontSize: '0.64rem', 
            fontWeight: 700, 
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            Value ({item.variant})
          </div>
          <div className="pet-value-display" style={{ 
            color: '#ffffff', 
            fontWeight: 800, 
            marginTop: '2px',
            fontFamily: "'Space Grotesk', sans-serif"
          }}>
            {(!item.value || item.value === 'N/F') ? 'N/A' : item.value}
          </div>
        </div>

        {/* DEMANDA E TREND */}
        <div className="card-footer-info" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '0.7rem',
          color: '#c084fc',
          fontWeight: 600,
          transform: 'translateZ(18px)',
          transition: 'transform 0.15s ease-out'
        }}>
          <span>Demand: <strong style={{ color: '#e9d5ff' }}>{(!item.demand || item.demand === 'N/F') ? 'N/A' : item.demand}</strong></span>
          <span>Trend: <strong style={{ color: '#e9d5ff' }}>{(!item.trend || item.trend === 'N/F') ? 'N/A' : item.trend}</strong></span>
        </div>
      </div>
    </div>
  )
})
