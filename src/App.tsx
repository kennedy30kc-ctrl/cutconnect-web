import { useState, useEffect, useRef } from 'react'
import './App.css'

const API = 'https://cutconnect-backend-production.up.railway.app'
const ADMIN_PATH = '/admin'
const DIAS = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']
const DIAS_LABELS: any = { lunes:'Lun', martes:'Mar', miercoles:'Mié', jueves:'Jue', viernes:'Vie', sabado:'Sáb', domingo:'Dom' }

const HERO_SLIDES = [
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1400&q=80',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1400&q=80',
  'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=1400&q=80',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1400&q=80',
]

const IMAGEN_BARBERIA = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80'
const IMAGEN_PELUQUERIA = 'https://images.unsplash.com/photo-1560066984-138daaa0a7a6?w=600&q=80'

const AD_BANNER = {
  title: 'Productos para Barbería',
  subtitle: 'Equipos profesionales con envío a Colombia y Venezuela',
  bg: 'https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=800&q=80',
  cta: 'Ver catálogo'
}

function getInitials(nombre: string) {
  return nombre.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
}

function StarRating({ value, max = 5, onSelect }: { value: number, max?: number, onSelect?: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display:'flex', gap:3 }}>
      {Array.from({ length: max }, (_, i) => i + 1).map(n => (
        <svg key={n} width={onSelect ? 28 : 14} height={onSelect ? 28 : 14} viewBox="0 0 24 24" fill={n <= (hover || value) ? '#C9A84C' : 'none'} stroke={n <= (hover || value) ? '#C9A84C' : '#333'} strokeWidth="2" style={{ cursor: onSelect ? 'pointer' : 'default', transition:'all 0.1s' }}
          onClick={() => onSelect?.(n)} onMouseEnter={() => onSelect && setHover(n)} onMouseLeave={() => onSelect && setHover(0)}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )
}

function BarberiaLogo({ logo, nombre, size = 52 }: { logo?: string, nombre: string, size?: number }) {
  const [err, setErr] = useState(false)
  if (logo && !err) return <img src={logo} alt={nombre} className="barberia-logo-img" style={{ width:size, height:size }} onError={() => setErr(true)} />
  return <div className="barberia-logo-avatar" style={{ width:size, height:size, fontSize:size*0.34 }}>{getInitials(nombre)}</div>
}

function BarberoAvatar({ foto, nombre, size = 52 }: { foto?: string, nombre: string, size?: number }) {
  const [err, setErr] = useState(false)
  if (foto && !err) return <img src={foto} alt={nombre} className="barberia-logo-img" style={{ width:size, height:size, borderRadius:'50%' }} onError={() => setErr(true)} />
  return <div className="barberia-logo-avatar" style={{ width:size, height:size, fontSize:size*0.34, borderRadius:'50%' }}>{getInitials(nombre)}</div>
}

function ImageUploader({ tipo, id, urlActual, onSuccess, label }: { tipo:'logo'|'barbero', id:number, urlActual?:string, onSuccess:(url:string)=>void, label:string }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(urlActual||'')
  const inputRef = useRef<HTMLInputElement>(null)
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 5*1024*1024) { alert('Máximo 5MB'); return }
    const reader = new FileReader(); reader.onload = ev => setPreview(ev.target?.result as string); reader.readAsDataURL(file)
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('imagen', file)
      const res = await fetch(`${API}/api/upload/${tipo==='logo'?'logo':'barbero'}/${id}`, { method:'POST', body:fd })
      const data = await res.json()
      if (data.success) { setPreview(data.url); onSuccess(data.url) } else alert('Error: '+data.error)
    } catch { alert('Error de conexión') } finally { setUploading(false) }
  }
  return (
    <div className="image-uploader">
      <div className="uploader-preview" onClick={() => inputRef.current?.click()} style={{ cursor:'pointer' }}>
        {preview ? <img src={preview} alt="preview" className="uploader-img" style={{ borderRadius: tipo==='barbero'?'50%':12 }} />
          : <div className="uploader-placeholder"><span style={{ fontSize:28, opacity:0.3 }}>+</span><p>{label}</p></div>}
        {uploading && <div className="uploader-overlay">Subiendo...</div>}
      </div>
      <button type="button" className="btn-upload" onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? 'Subiendo...' : preview ? 'Cambiar foto' : 'Subir foto'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={handleFile} />
    </div>
  )
}

function ModalCalificacion({ tipo, id, barberiaId, usuarioId, nombre, onClose, onDone }: any) {
  const [estrellas, setEstrellas] = useState(0)
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const handleEnviar = async () => {
    if (!estrellas) { alert('Selecciona una calificación'); return }
    setLoading(true)
    try {
      const body: any = { usuario_id:usuarioId, barberia_id:barberiaId, estrellas, comentario }
      if (tipo==='barbero') body.barbero_id = id
      const res = await fetch(`${API}/api/calificaciones`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      const data = await res.json()
      if (data.success) { onDone(); onClose() } else alert(data.error)
    } catch { alert('Error de conexión') } finally { setLoading(false) }
  }
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box" style={{ position:'relative' }}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3 style={{ marginTop:0, marginBottom:6, fontSize:20, fontWeight:700 }}>Calificar a {nombre}</h3>
        <p style={{ color:'#777', fontSize:13, marginBottom:20 }}>¿Cómo fue tu experiencia?</p>
        <StarRating value={estrellas} onSelect={setEstrellas} />
        <textarea placeholder="Comentario opcional..." value={comentario} onChange={e => setComentario(e.target.value)}
          style={{ width:'100%', minHeight:80, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'12px 14px', color:'#fff', fontSize:13, resize:'vertical', boxSizing:'border-box', marginTop:16, fontFamily:'Inter,sans-serif', outline:'none' }} />
        <div style={{ display:'flex', gap:10, marginTop:16 }}>
          <button className="btn-primary" onClick={handleEnviar} disabled={loading||!estrellas}>{loading?'Enviando...':'Enviar'}</button>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

function FidelizacionCard({ barberiaId, usuarioId }: { barberiaId:number, usuarioId:number }) {
  const [data, setData] = useState<any>(null)
  useEffect(() => {
    fetch(`${API}/api/fidelizacion/${barberiaId}/${usuarioId}`).then(r=>r.json()).then(d=>{ if(d.success) setData(d.data) }).catch(()=>{})
  }, [barberiaId, usuarioId])
  if (!data) return null
  const pct = Math.min((data.citas_actuales/data.citas_requeridas)*100, 100)
  return (
    <div className="fidelizacion-card">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ fontSize:10, color:'#777', textTransform:'uppercase', letterSpacing:2 }}>Programa de fidelización</p>
          <p style={{ fontSize:15, color:'#fff', fontWeight:700, marginTop:4 }}>{data.citas_actuales} / {data.citas_requeridas} citas</p>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:10, color:'#777', textTransform:'uppercase', letterSpacing:1 }}>Premio</p>
          <p style={{ fontSize:13, color:'#C9A84C', fontWeight:700, marginTop:4 }}>{data.beneficio}</p>
        </div>
      </div>
      <div className="fidelizacion-progress"><div className="fidelizacion-fill" style={{ width:`${pct}%` }}></div></div>
      <div className="fidelizacion-citas">
        {Array.from({length:Math.min(data.citas_requeridas,20)},(_,i)=>(
          <div key={i} className={`fidelizacion-cita-dot ${i<data.citas_actuales?'done':'pending'}`}>{i<data.citas_actuales?'✓':i+1}</div>
        ))}
      </div>
      {data.citas_actuales >= data.citas_requeridas && (
        <div style={{ background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:10, padding:'12px 16px', textAlign:'center' }}>
          <p style={{ color:'#C9A84C', fontWeight:700, fontSize:14 }}>Premio disponible — muestra esta pantalla en tu visita</p>
        </div>
      )}
    </div>
  )
}

function SplashScreen({ onDone }: { onDone:()=>void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [])
  return (
    <div className="splash-screen">
      <div className="splash-logo">
        <div className="splash-title">Cut<span>Connect</span></div>
        <div className="splash-subtitle">Barberías y peluquerías</div>
        <div className="splash-bar"><div className="splash-bar-fill"></div></div>
        <div className="splash-countries">🇨🇴 🇻🇪</div>
      </div>
    </div>
  )
}

// ============================================================
// PUBLIC PAGE — sin registro
// ============================================================
function PublicPage({ onLogin, onRegister }: { onLogin:()=>void, onRegister:()=>void }) {
  const [slideIndex, setSlideIndex] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [searchCiudad, setSearchCiudad] = useState('')
  const [barberias, setBarberias] = useState<any[]>([])
  const [buscando, setBuscando] = useState(false)
  const [tipoFiltro, setTipoFiltro] = useState('todos')
  const [modalCal, setModalCal] = useState<any>(null)
  const [selectedBarberia, setSelectedBarberia] = useState<any>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setSlideIndex(i => (i+1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const buscarPorGPS = () => {
    if (!navigator.geolocation) return
    setBuscando(true)
    navigator.geolocation.getCurrentPosition(
      pos => { setBuscando(false); cargarBarberias(pos.coords.latitude, pos.coords.longitude) },
      () => setBuscando(false)
    )
  }

  const cargarBarberias = async (lat?: number, lon?: number, ciudad?: string, tipo?: string) => {
    try {
      let url = `${API}/api/barberias`
      const params = []
      if (lat && lon) params.push(`lat=${lat}&lon=${lon}`)
      else if (ciudad) params.push(`ciudad=${encodeURIComponent(ciudad)}`)
      if (tipo && tipo !== 'todos') params.push(`tipo=${tipo}`)
      if (params.length) url += '?' + params.join('&')
      const res = await fetch(url); const data = await res.json()
      setBarberias(data.data || [])
    } catch {}
  }

  const buscarPorCiudad = () => { if (searchCiudad.trim()) cargarBarberias(undefined, undefined, searchCiudad, tipoFiltro) }

  return (
    <div className="public-page">
      {modalCal && <ModalCalificacion {...modalCal} onClose={() => setModalCal(null)} onDone={() => {}} />}

      {/* Login prompt modal */}
      {showLoginPrompt && (
        <div className="modal-overlay" onClick={() => setShowLoginPrompt(false)}>
          <div className="modal-box" style={{ position:'relative', textAlign:'center' }}>
            <button className="modal-close" onClick={() => setShowLoginPrompt(false)}>×</button>
            <h3 style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>Agenda tu cita</h3>
            <p style={{ color:'#777', fontSize:14, marginBottom:28, lineHeight:1.6 }}>Crea una cuenta gratuita o inicia sesión para reservar con {selectedBarberia?.nombre}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button className="btn-primary" style={{ width:'100%', padding:14, fontSize:13 }} onClick={onRegister}>Crear cuenta gratis</button>
              <button className="btn-secondary" style={{ width:'100%', padding:14, fontSize:13 }} onClick={onLogin}>Ya tengo cuenta</button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className={`public-nav ${scrolled?'scrolled':''}`}>
        <div className="public-nav-logo">Cut<span>Connect</span></div>
        <div className="public-nav-actions">
          <button className="btn-nav-login" onClick={onLogin}>Iniciar sesión</button>
          <button className="btn-nav-register" onClick={onRegister}>Registrarse</button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-slides">
          {HERO_SLIDES.map((src, i) => (
            <div key={i} className={`hero-slide ${i===slideIndex?'active':''}`}
              style={{ backgroundImage:`url(${src})` }} />
          ))}
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-eyebrow">Colombia · Venezuela</div>
          <h1 className="hero-title">Tu próximo corte,<br/><em>a un clic</em></h1>
          <p className="hero-subtitle">Encuentra las mejores barberías y peluquerías cerca de ti. Reserva en segundos, sin llamadas.</p>
          <div className="hero-search">
            <input type="text" placeholder="Ciudad, barrio o nombre de barbería..." value={searchCiudad} onChange={e => setSearchCiudad(e.target.value)} onKeyDown={e => e.key==='Enter' && buscarPorCiudad()} />
            <button onClick={buscarPorCiudad}>Buscar</button>
          </div>
          <button className="hero-gps" onClick={buscarPorGPS} disabled={buscando}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
            {buscando ? 'Buscando...' : 'Usar mi ubicación'}
          </button>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><div className="hero-stat-number">500+</div><div className="hero-stat-label">Barberías</div></div>
          <div className="hero-stat"><div className="hero-stat-number">2K+</div><div className="hero-stat-label">Clientes</div></div>
          <div className="hero-stat"><div className="hero-stat-number">2</div><div className="hero-stat-label">Países</div></div>
        </div>
      </div>

      {/* SERVICES STRIP */}
      <div className="services-strip">
  {[
    { key:'todos', name:'Todos', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
    { key:'corte', name:'Corte', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg> },
    { key:'barba', name:'Barba', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 7c0 5-3 9-8 9s-8-4-8-9"/><path d="M12 16v6"/><path d="M8 22h8"/></svg> },
    { key:'tinte', name:'Tinte', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2a10 10 0 110 20 10 10 0 010-20z"/><path d="M12 6v6l4 2"/></svg> },
    { key:'secado', name:'Secado', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/></svg> },
    { key:'alisado', name:'Alisado', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg> },
    { key:'tratamiento', name:'Tratamiento', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> },
  ].map((s) => (
    <div key={s.key} className={`service-item ${tipoFiltro===s.key?'active':''}`}
      onClick={() => {
        setTipoFiltro(s.key)
        if (s.key === 'todos') cargarBarberias()
        else cargarBarberias(undefined, undefined, undefined, s.key)
      }}>
      <div className="service-icon" style={{ color: tipoFiltro===s.key ? '#C9A84C' : '#555' }}>{s.icon}</div>
      <div className="service-name" style={{ color: tipoFiltro===s.key ? '#fff' : '#555' }}>{s.name}</div>
    </div>
  ))}
</div>

      {/* BARBERIAS */}
      <div className="public-section">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Disponibles ahora</div>
            <h2 className="section-title">Barberías cerca de ti</h2>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {['todos','barberia','peluqueria'].map(t => (
              <button key={t} className={`tipo-btn ${tipoFiltro===t?'active':''}`}
                onClick={() => { setTipoFiltro(t); cargarBarberias(undefined,undefined,searchCiudad||undefined,t) }}>
                {t==='todos'?'Todos':t==='barberia'?'Barberías':'Peluquerías'}
              </button>
            ))}
          </div>
        </div>

        {barberias.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <p style={{ color:'#333', fontSize:15, marginBottom:16 }}>Busca una ciudad para ver los negocios disponibles</p>
            <button className="btn-primary" onClick={buscarPorGPS}>{buscando?'Buscando...':'Usar mi ubicación'}</button>
          </div>
        )}

        <div className="barberias-grid">
          {barberias.map((b: any, idx: number) => (
            <>
              {idx === 3 && (
                <div key="ad" className="ad-banner">
                  <div className="ad-banner-bg" style={{ backgroundImage:`url(${AD_BANNER.bg})` }} />
                  <div className="ad-banner-content">
                    <div>
                      <div className="ad-banner-label">Publicidad</div>
                      <div className="ad-banner-title">{AD_BANNER.title}</div>
                      <div className="ad-banner-subtitle">{AD_BANNER.subtitle}</div>
                    </div>
                    <button className="ad-banner-btn">{AD_BANNER.cta}</button>
                  </div>
                </div>
              )}
              <div key={b.id} className="barberia-card" onClick={() => { setSelectedBarberia(b); setShowLoginPrompt(true) }}>
                <div className="barberia-card-banner">
                  <img src={b.logo || (b.tipo_negocio==='peluqueria'?IMAGEN_PELUQUERIA:IMAGEN_BARBERIA)} alt={b.nombre}
                    onError={(e:any) => { e.target.src = b.tipo_negocio==='peluqueria'?IMAGEN_PELUQUERIA:IMAGEN_BARBERIA }} />
                  <div className="barberia-card-banner-overlay" />
                  <div className="barberia-card-banner-tipo">{b.tipo_negocio==='peluqueria'?'Peluquería':'Barbería'}</div>
                </div>
                <div className="barberia-card-body">
                  <div className="barberia-nombre">{b.nombre}</div>
                  <div className="barberia-ciudad">{b.ciudad}, {b.pais}</div>
                  {b.distancia !== undefined && <div className="barberia-distancia">{b.distancia.toFixed(1)} km</div>}
                  {b.calificacion_promedio > 0 && (
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <StarRating value={Math.round(b.calificacion_promedio)} />
                      <span style={{ fontSize:12, color:'#777' }}>{Number(b.calificacion_promedio).toFixed(1)}</span>
                    </div>
                  )}
                  {b.descripcion && <p className="barberia-descripcion">{b.descripcion}</p>}
                  <div style={{ display:'flex', gap:8, marginTop:6 }}>
                    <button className="btn-elegir" onClick={e => { e.stopPropagation(); setSelectedBarberia(b); setShowLoginPrompt(true) }}>Reservar</button>
                    <button style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'#555', fontSize:11, padding:'8px 12px', cursor:'pointer', fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}
                      onClick={e => { e.stopPropagation(); setModalCal({ tipo:'barberia', id:b.id, barberiaId:b.id, usuarioId:0, nombre:b.nombre }) }}>
                      Calificar
                    </button>
                  </div>
                </div>
              </div>
            </>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.04)', padding:'40px 48px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
        <div style={{ fontFamily:'Playfair Display,serif', fontSize:20, fontWeight:800 }}>Cut<span style={{ color:'#C9A84C' }}>Connect</span></div>
        <p style={{ color:'#333', fontSize:12 }}>© 2025 CutConnect · Colombia · Venezuela</p>
        <div style={{ display:'flex', gap:16 }}>
          <button className="btn-nav-login" onClick={onLogin}>Iniciar sesión</button>
          <button className="btn-nav-register" onClick={onRegister}>Registrarse</button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// APP
// ============================================================
function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [appMode, setAppMode] = useState<'public'|'login'|'register'|'recovery'|'app'>('public')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('cliente')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [_authMode, setAuthMode] = useState<'public'|'login'|'register'|'recovery'|'app'>('public')
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [userData, setUserData] = useState<any>(null)

  const [barberias, setBarberias] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [citas, setCitas] = useState<any[]>([])
  const [barberosList, setBarberosList] = useState<any[]>([])
  const [rankingBarberos, setRankingBarberos] = useState<any[]>([])
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryPassword, setRecoveryPassword] = useState('')
  const [paisSeleccionado, setPaisSeleccionado] = useState('Colombia')
  const [tipoNegocioFiltro, setTipoNegocioFiltro] = useState('todos')
  const [codigoInvitacion, setCodigoInvitacion] = useState('')
  const [usarCodigo, setUsarCodigo] = useState(false)
  const [ownerData, setOwnerData] = useState({ negocio_nombre:'', pais:'Colombia', estado:'', municipio:'', ciudad:'', negocio_telefono:'', negocio_logo:'', negocio_descripcion:'', direccion:'', latitud:'', longitud:'', tipo_negocio:'barberia' })
  const [editNegocio, setEditNegocio] = useState(false)
  const [editNegocioData, setEditNegocioData] = useState({ nombre:'', descripcion:'', telefono:'', logo:'', tipo_negocio:'barberia', fidelizacion_citas:10, fidelizacion_beneficio:'' })
  const [formData, setFormData] = useState({ barberia_id:'', barbero_id:'', servicio_id:'', fecha:'', hora:'' })
  const [selectedBarberia, setSelectedBarberia] = useState<any>(null)
  const [selectedBarbero, setSelectedBarbero] = useState<any>(null)
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([])
  const [searchCiudad, setSearchCiudad] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [gpsUsado, setGpsUsado] = useState(false)
  const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminNegocios, setAdminNegocios] = useState<any[]>([])
  const [adminStats, setAdminStats] = useState<any>(null)
  const [adminMsg, setAdminMsg] = useState('')
  const [adminPage, setAdminPage] = useState<'pendientes'|'todos'>('pendientes')
  const [misBarberos, setMisBarberos] = useState<any[]>([])
  const [showFormBarbero, setShowFormBarbero] = useState(false)
  const [editandoBarbero, setEditandoBarbero] = useState<any>(null)
  const [formBarbero, setFormBarbero] = useState({ nombre:'', foto:'', especialidad:'', descripcion:'', horario:{ lunes:{activo:true,inicio:'08:00',fin:'18:00'}, martes:{activo:true,inicio:'08:00',fin:'18:00'}, miercoles:{activo:true,inicio:'08:00',fin:'18:00'}, jueves:{activo:true,inicio:'08:00',fin:'18:00'}, viernes:{activo:true,inicio:'08:00',fin:'18:00'}, sabado:{activo:true,inicio:'08:00',fin:'14:00'}, domingo:{activo:false,inicio:'',fin:''} } })
  const [perfilBarbero, setPerfilBarbero] = useState<any>(null)
  const [modalCal, setModalCal] = useState<any>(null)

  const isAdminRoute = window.location.pathname === ADMIN_PATH

  useEffect(() => { if (loggedIn) cargarDatos() }, [loggedIn])
  useEffect(() => { if (formData.barbero_id && formData.fecha) cargarDisponibilidad(formData.barbero_id, formData.fecha); else setHorasDisponibles([]) }, [formData.barbero_id, formData.fecha])
  useEffect(() => { if (loggedIn && userData?.rol==='barbero') cargarPerfilBarbero() }, [loggedIn, userData?.rol])

  const cargarDatos = async (lat?: number, lon?: number, ciudad?: string, tipo?: string) => {
    try {
      let url = `${API}/api/barberias`
      const params = []
      if (lat && lon) params.push(`lat=${lat}&lon=${lon}`)
      else if (ciudad) params.push(`ciudad=${encodeURIComponent(ciudad)}`)
      if (tipo && tipo !== 'todos') params.push(`tipo=${tipo}`)
      if (params.length) url += '?' + params.join('&')
      const [r1,r2,r3] = await Promise.all([
        fetch(url), fetch(`${API}/api/servicios`),
        userData?.rol==='dueño' ? fetch(`${API}/api/citas/barberia/${userData?.barberia_id}`)
        : userData?.rol==='barbero' ? fetch(`${API}/api/citas/barbero/${userData?.barbero_id}`)
        : fetch(`${API}/api/citas/usuario/${userData?.id}`)
      ])
      const d1=await r1.json(); const d2=await r2.json(); const d3=await r3.json()
      setBarberias(d1.data||[]); setServicios(d2.data||[]); setCitas(d3.data||[])
    } catch {}
  }
  const cargarCitasDueno = async () => { try { const r=await fetch(`${API}/api/citas/barberia/${userData?.barberia_id}`); const d=await r.json(); setCitas(d.data||[]) } catch { setCitas([]) } }
  const cargarCitasBarbero = async () => { try { const r=await fetch(`${API}/api/citas/barbero/${userData?.barbero_id}`); const d=await r.json(); setCitas(d.data||[]) } catch { setCitas([]) } }
  const cargarBarberosBarberia = async (id: any) => { try { const r=await fetch(`${API}/api/barberos/${id}`); const d=await r.json(); setBarberosList(d.data||[]) } catch { setBarberosList([]) } }
  const cargarMisBarberos = async () => { try { const r=await fetch(`${API}/api/barberos/${userData?.barberia_id}`); const d=await r.json(); setMisBarberos(d.data||[]) } catch { setMisBarberos([]) } }
  const cargarRanking = async () => { try { const r=await fetch(`${API}/api/stats/barberos/${userData?.barberia_id}`); const d=await r.json(); setRankingBarberos(d.data||[]) } catch { setRankingBarberos([]) } }
  const cargarPerfilBarbero = async () => { try { const r=await fetch(`${API}/api/barbero/perfil/${userData?.id}`); const d=await r.json(); if(d.success) setPerfilBarbero(d.data) } catch {} }
  const cargarDisponibilidad = async (barberoId: any, fecha: string) => { try { const r=await fetch(`${API}/api/disponibilidad/${barberoId}/${fecha}`); const d=await r.json(); setHorasDisponibles(d.data||[]) } catch { setHorasDisponibles([]) } }
  const buscarPorGPS = () => { if (!navigator.geolocation) return; setBuscando(true); navigator.geolocation.getCurrentPosition(pos => { setGpsUsado(true); setBuscando(false); cargarDatos(pos.coords.latitude, pos.coords.longitude, undefined, tipoNegocioFiltro) }, () => setBuscando(false)) }
  const buscarPorCiudad = () => { if (!searchCiudad.trim()) return; setGpsUsado(false); cargarDatos(undefined, undefined, searchCiudad, tipoNegocioFiltro) }

  const handleLogin = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) })
      const data = await res.json()
      if (data.success) { localStorage.setItem('token',data.token); setUserData(data.user); setLoggedIn(true); setCurrentPage('dashboard'); setEmail(''); setPassword(''); setAppMode('app') }
      else setError(data.error||'Error al iniciar sesión')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }
  const handleRegister = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const body: any = { email, password, nombre:email.split('@')[0], telefono:'', rol, pais:paisSeleccionado }
      if (rol==='barbero' && usarCodigo) body.codigo_invitacion = codigoInvitacion
      const res = await fetch(`${API}/api/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      const data = await res.json()
      if (data.success) { localStorage.setItem('token',data.token); setUserData(data.user); setLoggedIn(true); setCurrentPage('dashboard'); setEmail(''); setPassword(''); setAppMode('app') }
      else setError(data.error||'Error al registrarse')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }
  const handleRegisterDueno = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password,nombre:email.split('@')[0],telefono:'',rol:'dueño',...ownerData}) })
      const data = await res.json()
      if (data.success) { localStorage.setItem('token',data.token); setUserData(data.user); setLoggedIn(true); setCurrentPage('dashboard'); setEmail(''); setPassword(''); setAppMode('app') }
      else setError(data.error||'Error al registrarse')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }
  const obtenerUbicacion = () => { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition(pos => setOwnerData({...ownerData, latitud:pos.coords.latitude.toString(), longitud:pos.coords.longitude.toString()}), err => alert('Error: '+err.message)) } }
  const handleRecuperarContrasena = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/auth/recuperar-contrasena`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:recoveryEmail,nueva_contrasena:recoveryPassword}) })
      const data = await res.json()
      if (data.success) { alert('Contraseña actualizada.'); setAuthMode('login') } else setError(data.error||'Error')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }
  const handleAgendar = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/citas/agendar`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...formData, usuario_id:userData.id}) })
      const data = await res.json()
      if (data.success) { alert('Cita agendada exitosamente'); setFormData({barberia_id:'',barbero_id:'',servicio_id:'',fecha:'',hora:''}); setSelectedBarberia(null); setSelectedBarbero(null); setBarberosList([]); await cargarDatos(); setCurrentPage('citas') }
      else setError(data.error||'Error al agendar')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }
  const handleGuardarNegocio = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/barberias/${userData?.barberia_id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(editNegocioData) })
      const data = await res.json()
      if (data.success) { setEditNegocio(false); alert('Negocio actualizado') } else setError(data.error||'Error')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }
  const handleLogout = () => { localStorage.removeItem('token'); setLoggedIn(false); setEmail(''); setPassword(''); setRol('cliente'); setUserData(null); setCurrentPage('dashboard'); setAppMode('public'); setAppMode('public') }
  const resetFormBarbero = () => { setFormBarbero({nombre:'',foto:'',especialidad:'',descripcion:'',horario:{lunes:{activo:true,inicio:'08:00',fin:'18:00'},martes:{activo:true,inicio:'08:00',fin:'18:00'},miercoles:{activo:true,inicio:'08:00',fin:'18:00'},jueves:{activo:true,inicio:'08:00',fin:'18:00'},viernes:{activo:true,inicio:'08:00',fin:'18:00'},sabado:{activo:true,inicio:'08:00',fin:'14:00'},domingo:{activo:false,inicio:'',fin:''}}}); setEditandoBarbero(null); setShowFormBarbero(false) }
  const handleGuardarBarbero = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      let res
      if (editandoBarbero) res = await fetch(`${API}/api/barberos/${editandoBarbero.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(formBarbero) })
      else res = await fetch(`${API}/api/barberos`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...formBarbero, barberia_id:userData?.barberia_id}) })
      const data = await res.json()
      if (data.success) { resetFormBarbero(); cargarMisBarberos() } else setError(data.error||'Error')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }
  const handleEditarBarbero = (b: any) => { setEditandoBarbero(b); setFormBarbero({nombre:b.nombre,foto:b.foto||'',especialidad:b.especialidad,descripcion:b.descripcion||'',horario:b.horario}); setShowFormBarbero(true) }
  const handleEliminarBarbero = async (id: number) => { if (!confirm('¿Desactivar?')) return; await fetch(`${API}/api/barberos/${id}`,{method:'DELETE'}); cargarMisBarberos() }
  const updateHorarioDia = (dia: string, campo: string, valor: any) => { setFormBarbero({...formBarbero,horario:{...formBarbero.horario,[dia]:{...(formBarbero.horario as any)[dia],[campo]:valor}}}) }
  const handleAdminLogin = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/admin/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({password:adminPassword}) })
      const data = await res.json()
      if (data.success) { setAdminLoggedIn(true); cargarAdminData() } else setError('Contraseña incorrecta')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }
  const cargarAdminData = async () => {
    try {
      const [r1,r2] = await Promise.all([fetch(`${API}/api/admin/negocios`,{headers:{'x-admin-token':'admin_token_cutconnect'}}), fetch(`${API}/api/admin/stats`,{headers:{'x-admin-token':'admin_token_cutconnect'}})])
      const d1=await r1.json(); const d2=await r2.json()
      setAdminNegocios(d1.data||[]); setAdminStats(d2.data||null)
    } catch { setAdminMsg('Error cargando datos') }
  }
  const accionAdmin = async (endpoint: string, id: number) => {
    try { const res=await fetch(`${API}/api/admin/${endpoint}/${id}`,{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':'admin_token_cutconnect'}}); const data=await res.json(); setAdminMsg(data.message||data.error); cargarAdminData() } catch { setAdminMsg('Error') }
    setTimeout(()=>setAdminMsg(''),4000)
  }

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />

  // ADMIN
  if (isAdminRoute) {
    if (!adminLoggedIn) return (
      <div className="login-container">
        <div className="login-box">
          <div className="logo-section"><h1>Cut<span>Connect</span></h1><p className="subtitle">Panel Administrador</p></div>
          <form onSubmit={handleAdminLogin} className="auth-form">
            <div className="form-group"><label>Contraseña</label><input type="password" placeholder="••••••••" value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} required /></div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-submit" disabled={loading}>{loading?'Verificando...':'Entrar'}</button>
          </form>
        </div>
      </div>
    )
    const negociosFiltrados = adminPage==='pendientes' ? adminNegocios.filter(n=>n.estado_verificacion==='pendiente') : adminNegocios
    return (
      <div className="admin-container">
        <div className="admin-navbar">
          <div><h1>Cut<span style={{color:'#C9A84C'}}>Connect</span> Admin</h1><p className="admin-subtitle">Panel de control</p></div>
          <div style={{display:'flex',gap:10}}>
            <button className="btn-admin btn-rechazar" onClick={()=>setAdminPage('pendientes')} style={{fontWeight:adminPage==='pendientes'?900:400}}>Pendientes</button>
            <button className="btn-admin btn-rechazar" onClick={()=>setAdminPage('todos')} style={{fontWeight:adminPage==='todos'?900:400}}>Todos</button>
            <button className="btn-admin btn-suspender" onClick={()=>setAdminLoggedIn(false)}>Salir</button>
          </div>
        </div>
        <div className="admin-content">
          {adminStats && (
            <div className="admin-stats">
              <div className="admin-stat"><span className="admin-stat-num gold">{adminStats.total}</span><span className="admin-stat-label">Total</span></div>
              <div className="admin-stat"><span className="admin-stat-num warn">{adminStats.pendientes}</span><span className="admin-stat-label">Pendientes</span></div>
              <div className="admin-stat"><span className="admin-stat-num trial">{adminStats.trial}</span><span className="admin-stat-label">Trial</span></div>
              <div className="admin-stat"><span className="admin-stat-num success">{adminStats.activos}</span><span className="admin-stat-label">Activos</span></div>
              <div className="admin-stat"><span className="admin-stat-num danger">{adminStats.suspendidos}</span><span className="admin-stat-label">Suspendidos</span></div>
              <div className="admin-stat"><span className="admin-stat-num gold">{adminStats.barberias}</span><span className="admin-stat-label">Barberías</span></div>
              <div className="admin-stat"><span className="admin-stat-num gold">{adminStats.peluquerias}</span><span className="admin-stat-label">Peluquerías</span></div>
              <div className="admin-stat"><span className="admin-stat-num gold">{adminStats.total_clientes}</span><span className="admin-stat-label">Clientes</span></div>
            </div>
          )}
          {adminMsg && <p className="success-msg">{adminMsg}</p>}
          <p className="admin-section-title">{adminPage==='pendientes'?'Solicitudes pendientes':'Todos los negocios'}</p>
          {negociosFiltrados.length===0 && <div className="empty-state"><p>No hay registros</p></div>}
          {negociosFiltrados.map(n => (
            <div key={n.id} className="negocio-row">
              {n.logo?<img src={n.logo} alt={n.nombre} className="negocio-logo-img"/>:<div className="negocio-logo-av">{getInitials(n.nombre)}</div>}
              <div className="negocio-info">
                <div className="negocio-nombre">{n.nombre}</div>
                <div className="negocio-meta">{n.ciudad}, {n.estado}, {n.pais} · {n.telefono}</div>
                <div className="negocio-email">{n.email_dueno}</div>
                {n.estado_verificacion==='trial'&&n.diasTrial!==null&&<div style={{color:'#C9A84C',fontSize:12,marginTop:3}}>{n.diasTrial} días restantes</div>}
              </div>
              <span className={`status-badge status-${n.estado_verificacion}`}>
                {n.estado_verificacion==='pendiente'&&'Pendiente'}
                {n.estado_verificacion==='trial'&&'Trial'}
                {n.estado_verificacion==='activo'&&'Activo'}
                {n.estado_verificacion==='suspendido'&&'Suspendido'}
                {n.estado_verificacion==='rechazado'&&'Rechazado'}
              </span>
              <div className="admin-actions">
                {n.estado_verificacion==='pendiente'&&<><button className="btn-admin btn-aprobar" onClick={()=>accionAdmin('aprobar',n.id)}>Aprobar</button><button className="btn-admin btn-rechazar" onClick={()=>accionAdmin('rechazar',n.id)}>Rechazar</button></>}
                {(n.estado_verificacion==='trial'||n.estado_verificacion==='suspendido')&&<button className="btn-admin btn-activar" onClick={()=>accionAdmin('activar',n.id)}>Activar</button>}
                {(n.estado_verificacion==='activo'||n.estado_verificacion==='trial')&&<button className="btn-admin btn-suspender" onClick={()=>accionAdmin('suspender',n.id)}>Suspender</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // PUBLIC PAGE
  if (!loggedIn && appMode==='public') {
    return <PublicPage onLogin={() => setAppMode('login')} onRegister={() => setAppMode('register')} />
  }

  // LOGIN
  if (!loggedIn && appMode==='login') return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-section"><h1>Cut<span>Connect</span></h1></div>
        <p className="form-subtitle">Iniciar Sesión</p>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group"><label>Email</label><input type="email" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Contraseña</label><input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>{loading?'Entrando...':'Iniciar Sesión'}</button>
        </form>
        <div className="auth-links">
          <button className="link-btn" onClick={() => setAppMode('public')}>← Volver</button>
          <button className="link-btn" onClick={() => setAppMode('login')}>¿Olvidaste tu contraseña?</button>
        </div>
        <div style={{textAlign:'center',marginTop:16}}>
          <span style={{color:'#555',fontSize:13}}>¿No tienes cuenta? </span>
          <button className="link-btn" style={{color:'#C9A84C'}} onClick={() => setAppMode('register')}>Regístrate gratis</button>
        </div>
      </div>
    </div>
  )

  // REGISTER
  if (!loggedIn && appMode==='register') {
    if (rol==='dueño') return (
      <div className="login-container">
        <div className="login-box large-box">
          <div className="logo-section"><h1>Cut<span>Connect</span></h1></div>
          <p className="form-subtitle">Registrar mi negocio</p>
          <form onSubmit={handleRegisterDueno} className="owner-form">
            <fieldset className="form-section">
              <legend>País</legend>
              <div className="pais-selector">
                <button type="button" className={`pais-btn ${ownerData.pais==='Colombia'?'active':''}`} onClick={()=>setOwnerData({...ownerData,pais:'Colombia'})}>Colombia</button>
                <button type="button" className={`pais-btn ${ownerData.pais==='Venezuela'?'active':''}`} onClick={()=>setOwnerData({...ownerData,pais:'Venezuela'})}>Venezuela</button>
              </div>
            </fieldset>
            <fieldset className="form-section">
              <legend>Tipo de negocio</legend>
              <div className="category-selector">
                <button type="button" className={`category-btn ${ownerData.tipo_negocio==='barberia'?'active':''}`} onClick={()=>setOwnerData({...ownerData,tipo_negocio:'barberia'})}><span className="cat-icon">✂</span>Barbería</button>
                <button type="button" className={`category-btn ${ownerData.tipo_negocio==='peluqueria'?'active':''}`} onClick={()=>setOwnerData({...ownerData,tipo_negocio:'peluqueria'})}><span className="cat-icon">💇</span>Peluquería</button>
              </div>
            </fieldset>
            <fieldset className="form-section">
              <legend>Acceso</legend>
              <div className="form-group"><label>Email</label><input type="email" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
              <div className="form-group"><label>Contraseña</label><input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
            </fieldset>
            <fieldset className="form-section">
              <legend>Datos del negocio</legend>
              <div className="form-group"><label>Nombre del negocio</label><input type="text" placeholder="Barbería El Rey" value={ownerData.negocio_nombre} onChange={e=>setOwnerData({...ownerData,negocio_nombre:e.target.value})} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Departamento / Estado</label><input type="text" placeholder="Antioquia" value={ownerData.estado} onChange={e=>setOwnerData({...ownerData,estado:e.target.value})} required /></div>
                <div className="form-group"><label>Ciudad</label><input type="text" placeholder="Medellín" value={ownerData.ciudad} onChange={e=>setOwnerData({...ownerData,ciudad:e.target.value})} required /></div>
              </div>
              <div className="form-group"><label>Dirección</label><input type="text" placeholder="Calle 50 #30-15" value={ownerData.direccion} onChange={e=>setOwnerData({...ownerData,direccion:e.target.value})} required /></div>
              <div className="form-group"><label>Teléfono</label><input type="tel" placeholder="+57 300 000 0000" value={ownerData.negocio_telefono} onChange={e=>setOwnerData({...ownerData,negocio_telefono:e.target.value})} required /></div>
              <div className="form-group"><label>Descripción</label><textarea placeholder="Cuéntanos sobre tu negocio..." value={ownerData.negocio_descripcion} onChange={e=>setOwnerData({...ownerData,negocio_descripcion:e.target.value})} /></div>
            </fieldset>
            <fieldset className="form-section">
              <legend>Ubicación GPS</legend>
              <button type="button" onClick={obtenerUbicacion} className="btn-gps">Obtener mi ubicación automáticamente</button>
              <div className="form-row">
                <div className="form-group"><label>Latitud</label><input type="number" placeholder="4.7110" value={ownerData.latitud} onChange={e=>setOwnerData({...ownerData,latitud:e.target.value})} step="0.0001" required /></div>
                <div className="form-group"><label>Longitud</label><input type="number" placeholder="-74.0721" value={ownerData.longitud} onChange={e=>setOwnerData({...ownerData,longitud:e.target.value})} step="0.0001" required /></div>
              </div>
            </fieldset>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-submit" disabled={loading}>{loading?'Registrando...':'Registrar mi negocio'}</button>
          </form>
          <button className="link-btn" onClick={()=>setRol('cliente')}>← Volver</button>
        </div>
      </div>
    )
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="logo-section"><h1>Cut<span>Connect</span></h1></div>
          <p className="form-subtitle">Crear cuenta</p>
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>País</label>
              <div className="pais-selector">
                <button type="button" className={`pais-btn ${paisSeleccionado==='Colombia'?'active':''}`} onClick={()=>setPaisSeleccionado('Colombia')}>Colombia</button>
                <button type="button" className={`pais-btn ${paisSeleccionado==='Venezuela'?'active':''}`} onClick={()=>setPaisSeleccionado('Venezuela')}>Venezuela</button>
              </div>
            </div>
            <div className="form-group"><label>Email</label><input type="email" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
            <div className="form-group"><label>Contraseña</label><input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
            <div className="form-group">
              <label>Soy</label>
              <select value={rol} onChange={e=>setRol(e.target.value)} required>
                <option value="cliente">Cliente — Quiero agendar citas</option>
                <option value="barbero">Barbero / Peluquero</option>
                <option value="dueño">Dueño de negocio</option>
              </select>
            </div>
            {rol==='barbero' && (
              <div className="invite-code-section">
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',marginBottom:10}}>
                  <input type="checkbox" checked={usarCodigo} onChange={e=>setUsarCodigo(e.target.checked)} style={{width:16,height:16,accentColor:'#C9A84C'}} />
                  <span style={{fontSize:14}}>Tengo un código de invitación</span>
                </label>
                {usarCodigo && (
                  <div className="form-group">
                    <label>Código de invitación</label>
                    <input type="text" placeholder="847291" value={codigoInvitacion} onChange={e=>setCodigoInvitacion(e.target.value)} maxLength={6} style={{fontSize:24,letterSpacing:8,textAlign:'center',fontWeight:700}} />
                  </div>
                )}
              </div>
            )}
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-submit" disabled={loading}>{loading?'Registrando...':'Crear cuenta gratis'}</button>
          </form>
          <div className="auth-links">
            <button className="link-btn" onClick={()=>setAppMode('public')}>← Volver</button>
            <button className="link-btn" onClick={()=>setAppMode('login')}>Ya tengo cuenta</button>
          </div>
        </div>
      </div>
    )
  }

  // RECOVERY
  if (!loggedIn && appMode==='recovery') return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-section"><h1>Cut<span>Connect</span></h1></div>
        <p className="form-subtitle">Recuperar contraseña</p>
        <form onSubmit={handleRecuperarContrasena} className="auth-form">
          <div className="form-group"><label>Email registrado</label><input type="email" placeholder="tu@email.com" value={recoveryEmail} onChange={e=>setRecoveryEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Nueva contraseña</label><input type="password" placeholder="••••••••" value={recoveryPassword} onChange={e=>setRecoveryPassword(e.target.value)} required /></div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>{loading?'Procesando...':'Cambiar contraseña'}</button>
        </form>
        <button className="link-btn" onClick={()=>setAppMode('login')}>← Volver</button>
      </div>
    </div>
  )

  // CLIENTE
  if (loggedIn && userData?.rol==='cliente') return (
    <div className="dashboard-container">
      {modalCal && <ModalCalificacion {...modalCal} onClose={()=>setModalCal(null)} onDone={()=>cargarDatos()} />}
      <nav className="navbar">
        <div className="navbar-left"><div className="navbar-brand"><h1>Cut<span>Connect</span></h1></div><span className="role-badge">Cliente</span></div>
        <div className="nav-links">
          <button className={currentPage==='dashboard'?'active':''} onClick={()=>setCurrentPage('dashboard')}>Inicio</button>
          <button className={currentPage==='agendar'?'active':''} onClick={()=>{setCurrentPage('agendar');cargarDatos()}}>Agendar</button>
          <button className={currentPage==='citas'?'active':''} onClick={()=>{setCurrentPage('citas');cargarDatos()}}>Mis citas</button>
          <button className="btn-logout" onClick={handleLogout}>Salir</button>
        </div>
      </nav>
      <div className="dashboard-content">
        {currentPage==='dashboard' && (
          <div className="page">
            <h2>Bienvenido, {userData?.nombre}</h2>
            <div className="welcome-card">
              <p><strong>País:</strong> {userData?.pais}</p>
              <p><strong>Email:</strong> {userData?.email}</p>
              <p><strong>Citas agendadas:</strong> {citas.length}</p>
            </div>
            <div style={{display:'flex',gap:12}}>
              <div style={{flex:1,borderRadius:16,overflow:'hidden',position:'relative',minHeight:140,cursor:'pointer'}} onClick={()=>{setTipoNegocioFiltro('barberia');setCurrentPage('agendar');cargarDatos()}}>
                <img src={IMAGEN_BARBERIA} alt="Barberías" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}} />
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.75)100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',padding:20}}>
                  <span style={{color:'#fff',fontWeight:800,fontSize:16,letterSpacing:1,textTransform:'uppercase'}}>Barberías</span>
                </div>
              </div>
              <div style={{flex:1,borderRadius:16,overflow:'hidden',position:'relative',minHeight:140,cursor:'pointer'}} onClick={()=>{setTipoNegocioFiltro('peluqueria');setCurrentPage('agendar');cargarDatos()}}>
                <img src={IMAGEN_PELUQUERIA} alt="Peluquerías" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}} />
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.75)100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',padding:20}}>
                  <span style={{color:'#fff',fontWeight:800,fontSize:16,letterSpacing:1,textTransform:'uppercase'}}>Peluquerías</span>
                </div>
              </div>
            </div>
            <div className="action-buttons">
              <button onClick={()=>{setCurrentPage('agendar');cargarDatos()}} className="btn-primary">Agendar cita</button>
              <button onClick={()=>{setCurrentPage('citas');cargarDatos()}} className="btn-secondary">Mis citas</button>
            </div>
          </div>
        )}

        {currentPage==='agendar' && (
          <div className="page">
            <h2>Agendar cita</h2>
            <div className="search-section">
              <p className="search-title">Encuentra tu barbería o peluquería</p>
              <div className="tipo-filter">
                {['todos','barberia','peluqueria'].map(t=>(
                  <button key={t} className={`tipo-btn ${tipoNegocioFiltro===t?'active':''}`} onClick={()=>{setTipoNegocioFiltro(t);if(gpsUsado)buscarPorGPS()}}>
                    {t==='todos'?'Todos':t==='barberia'?'Barberías':'Peluquerías'}
                  </button>
                ))}
              </div>
              <button className="btn-gps" onClick={buscarPorGPS} disabled={buscando}>{buscando?'Buscando...':'Usar mi ubicación'}</button>
              <div className="search-divider">o busca por ciudad</div>
              <div className="search-bar">
                <input type="text" placeholder="Medellín, Bogotá, Caracas..." value={searchCiudad} onChange={e=>setSearchCiudad(e.target.value)} onKeyDown={e=>e.key==='Enter'&&buscarPorCiudad()} />
                <button className="btn-search" onClick={buscarPorCiudad}>Buscar</button>
              </div>
            </div>

            {barberias.length > 0 && (
              <>
                <h3>{gpsUsado?'Cerca de ti':'Resultados'} — {barberias.length} negocios</h3>
                <div className="barberias-grid">
                  {barberias.map((b:any,idx:number) => (
                    <>
                      {idx===3 && (
                        <div key="ad" className="ad-banner">
                          <div className="ad-banner-bg" style={{backgroundImage:`url(${AD_BANNER.bg})`}} />
                          <div className="ad-banner-content">
                            <div><div className="ad-banner-label">Publicidad</div><div className="ad-banner-title">{AD_BANNER.title}</div><div className="ad-banner-subtitle">{AD_BANNER.subtitle}</div></div>
                            <button className="ad-banner-btn">{AD_BANNER.cta}</button>
                          </div>
                        </div>
                      )}
                      <div key={b.id} className={`barberia-card ${selectedBarberia?.id===b.id?'selected':''}`}>
                        <div className="barberia-card-banner">
                          <img src={b.logo||(b.tipo_negocio==='peluqueria'?IMAGEN_PELUQUERIA:IMAGEN_BARBERIA)} alt={b.nombre} onError={(e:any)=>{e.target.src=b.tipo_negocio==='peluqueria'?IMAGEN_PELUQUERIA:IMAGEN_BARBERIA}} />
                          <div className="barberia-card-banner-overlay" />
                          <div className="barberia-card-banner-tipo">{b.tipo_negocio==='peluqueria'?'Peluquería':'Barbería'}</div>
                        </div>
                        <div className="barberia-card-body">
                          <div className="barberia-nombre">{b.nombre}</div>
                          <div className="barberia-ciudad">{b.ciudad}</div>
                          {b.distancia!==undefined&&<div className="barberia-distancia">{b.distancia.toFixed(1)} km</div>}
                          {b.calificacion_promedio>0&&<div style={{display:'flex',alignItems:'center',gap:6}}><StarRating value={Math.round(b.calificacion_promedio)}/><span style={{fontSize:12,color:'#777'}}>{Number(b.calificacion_promedio).toFixed(1)}</span></div>}
                          {b.descripcion&&<p className="barberia-descripcion">{b.descripcion}</p>}
                          <div style={{display:'flex',gap:8,marginTop:6}}>
                            <button className={`btn-elegir ${selectedBarberia?.id===b.id?'selected':''}`} onClick={()=>{setSelectedBarberia(b);setSelectedBarbero(null);setBarberosList([]);setFormData({...formData,barberia_id:b.id,barbero_id:'',hora:''});cargarBarberosBarberia(b.id)}}>
                              {selectedBarberia?.id===b.id?'Seleccionada':'Elegir'}
                            </button>
                            <button style={{background:'transparent',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#555',fontSize:11,padding:'8px 12px',cursor:'pointer',fontWeight:700,textTransform:'uppercase',letterSpacing:1}} onClick={()=>setModalCal({tipo:'barberia',id:b.id,barberiaId:b.id,usuarioId:userData.id,nombre:b.nombre})}>
                              Calificar
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ))}
                </div>
              </>
            )}

            {barberias.length===0&&!buscando&&<div className="empty-state"><div className="empty-icon">—</div><p>Usa el GPS o busca por ciudad para ver negocios disponibles</p></div>}

            {selectedBarberia && (
              <>
                <h3>Profesionales en {selectedBarberia.nombre}</h3>
                {barberosList.length===0
                  ? <div className="empty-state"><p>Este negocio aún no tiene profesionales registrados</p></div>
                  : <div className="barberias-grid">
                      {barberosList.map((b:any)=>(
                        <div key={b.id} className={`barberia-card ${selectedBarbero?.id===b.id?'selected':''}`}>
                          <div className="barberia-card-body">
                            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:12}}>
                              <BarberoAvatar foto={b.foto} nombre={b.nombre} size={60} />
                              <div>
                                <div className="barberia-nombre">{b.nombre}</div>
                                <div className="barberia-ciudad">{b.especialidad}</div>
                                {b.calificacion_promedio>0&&<div style={{display:'flex',alignItems:'center',gap:4,marginTop:4}}><StarRating value={Math.round(b.calificacion_promedio)}/><span style={{fontSize:11,color:'#777'}}>{Number(b.calificacion_promedio).toFixed(1)}</span></div>}
                              </div>
                            </div>
                            {b.descripcion&&<p className="barberia-descripcion" style={{marginBottom:10}}>{b.descripcion}</p>}
                            <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:12}}>
                              {DIAS.map(dia=>{const h=b.horario[dia];return h?.activo?<span key={dia} style={{background:'rgba(201,168,76,0.08)',color:'#C9A84C',border:'1px solid rgba(201,168,76,0.2)',borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>{DIAS_LABELS[dia]}</span>:null})}
                            </div>
                            <div style={{display:'flex',gap:8}}>
                              <button className={`btn-elegir ${selectedBarbero?.id===b.id?'selected':''}`} onClick={()=>{setSelectedBarbero(b);setFormData({...formData,barbero_id:b.id,hora:''})}}>
                                {selectedBarbero?.id===b.id?'Seleccionado':'Elegir'}
                              </button>
                              <button style={{background:'transparent',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#555',fontSize:11,padding:'8px 12px',cursor:'pointer',fontWeight:700,textTransform:'uppercase',letterSpacing:1}} onClick={()=>setModalCal({tipo:'barbero',id:b.id,barberiaId:selectedBarberia.id,usuarioId:userData.id,nombre:b.nombre})}>
                                Calificar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                }
              </>
            )}

            {selectedBarbero && (
              <>
                <h3>Reservar con {selectedBarbero.nombre}</h3>
                <form className="form" onSubmit={handleAgendar}>
                  <div className="form-group">
                    <label>Servicio</label>
                    <select value={formData.servicio_id} onChange={e=>setFormData({...formData,servicio_id:e.target.value})} required>
                      <option value="">Selecciona un servicio</option>
                      {servicios.map((s:any)=><option key={s.id} value={s.id}>{s.nombre} — ${s.precio}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fecha</label>
                    <input type="date" value={formData.fecha} onChange={e=>setFormData({...formData,fecha:e.target.value,hora:''})} required min={new Date().toISOString().split('T')[0]} />
                  </div>
                  {formData.fecha && (
                    <div className="form-group">
                      <label>Hora disponible</label>
                      {horasDisponibles.length===0
                        ? <p style={{color:'#FF6B6B',fontSize:14}}>No hay horas disponibles ese día</p>
                        : <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:4}}>
                            {horasDisponibles.map(h=>(
                              <button key={h} type="button" onClick={()=>setFormData({...formData,hora:h})}
                                style={{padding:'10px 16px',borderRadius:8,border:'1px solid',borderColor:formData.hora===h?'#C9A84C':'rgba(255,255,255,0.08)',background:formData.hora===h?'rgba(201,168,76,0.15)':'transparent',color:formData.hora===h?'#C9A84C':'#fff',fontWeight:700,cursor:'pointer',fontSize:14,transition:'all 0.15s'}}>
                                {h}
                              </button>
                            ))}
                          </div>
                      }
                    </div>
                  )}
                  {error && <p className="error">{error}</p>}
                  <button type="submit" className="btn-primary" disabled={loading||!formData.hora}>{loading?'Agendando...':'Confirmar reserva'}</button>
                </form>
              </>
            )}
          </div>
        )}

        {currentPage==='citas' && (
          <div className="page">
            <h2>Mis citas</h2>
            {selectedBarberia && <FidelizacionCard barberiaId={selectedBarberia.id} usuarioId={userData.id} />}
            {citas.length===0
              ? <div className="empty-state"><div className="empty-icon">—</div><p>Aún no tienes citas agendadas</p><button onClick={()=>setCurrentPage('agendar')} className="btn-primary">Agendar mi primera cita</button></div>
              : <div className="citas-grid">
                  {citas.map((c:any)=>(
                    <div key={c.id} className="cita-card">
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                        <BarberiaLogo logo={c.barberia?.logo} nombre={c.barberia?.nombre||'B'} size={36} />
                        <h4>{c.barberia?.nombre}</h4>
                      </div>
                      {c.barbero&&<p><strong>Profesional:</strong> {c.barbero.nombre}</p>}
                      <p><strong>Servicio:</strong> {c.servicio?.nombre}</p>
                      <p><strong>Fecha:</strong> {c.fecha}</p>
                      <p><strong>Hora:</strong> {c.hora}</p>
                      <span className="badge-agendada">Confirmada</span>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}
      </div>
    </div>
  )

  // BARBERO
  if (loggedIn && userData?.rol==='barbero') {
    const citasHoy = citas.filter((c:any)=>c.fecha===new Date().toISOString().split('T')[0])
    return (
      <div className="dashboard-container">
        <nav className="navbar">
          <div className="navbar-left"><div className="navbar-brand"><h1>Cut<span>Connect</span></h1></div><span className="role-badge">Barbero</span></div>
          <div className="nav-links">
            <button className={currentPage==='dashboard'?'active':''} onClick={()=>setCurrentPage('dashboard')}>Inicio</button>
            <button className={currentPage==='citas'?'active':''} onClick={()=>{setCurrentPage('citas');cargarCitasBarbero()}}>Mis citas</button>
            <button className={currentPage==='perfil'?'active':''} onClick={()=>{setCurrentPage('perfil');cargarPerfilBarbero()}}>Mi perfil</button>
            <button className="btn-logout" onClick={handleLogout}>Salir</button>
          </div>
        </nav>
        <div className="dashboard-content">
          {currentPage==='dashboard' && (
            <div className="page">
              <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:8}}>
                <BarberoAvatar foto={perfilBarbero?.foto} nombre={userData?.nombre||'B'} size={64} />
                <div><h2 style={{margin:0}}>Hola, {userData?.nombre}</h2><p style={{color:'#555',fontSize:14,marginTop:4}}>{perfilBarbero?.especialidad||'Profesional'}</p></div>
              </div>
              <div className="stats-grid">
                <div className="stat-card"><h4>Citas totales</h4><p className="stat-number">{citas.length}</p></div>
                <div className="stat-card"><h4>Hoy</h4><p className="stat-number">{citasHoy.length}</p></div>
                {perfilBarbero?.calificacion_promedio>0&&<div className="stat-card"><h4>Calificación</h4><p className="stat-number">{Number(perfilBarbero.calificacion_promedio).toFixed(1)}</p></div>}
              </div>
              <div className="action-buttons">
                <button onClick={()=>{setCurrentPage('citas');cargarCitasBarbero()}} className="btn-primary">Ver mis citas</button>
                <button onClick={()=>{setCurrentPage('perfil');cargarPerfilBarbero()}} className="btn-secondary">Mi perfil</button>
              </div>
            </div>
          )}
          {currentPage==='perfil' && (
            <div className="page">
              <h2>Mi Perfil</h2>
              {!perfilBarbero
                ? <div className="empty-state"><p>No tienes perfil vinculado. Pídele el código al dueño.</p></div>
                : (
                  <div style={{display:'flex',flexDirection:'column',gap:20}}>
                    <div className="welcome-card owner" style={{textAlign:'center',paddingTop:28}}>
                      <BarberoAvatar foto={perfilBarbero.foto} nombre={perfilBarbero.nombre} size={90} />
                      <h3 style={{marginTop:14,fontSize:20,fontWeight:700}}>{perfilBarbero.nombre}</h3>
                      <p style={{color:'#555',marginTop:4}}>{perfilBarbero.especialidad}</p>
                      {perfilBarbero.calificacion_promedio>0&&<div style={{display:'flex',justifyContent:'center',gap:6,marginTop:8,alignItems:'center'}}><StarRating value={Math.round(perfilBarbero.calificacion_promedio)}/><span style={{color:'#555',fontSize:13}}>{Number(perfilBarbero.calificacion_promedio).toFixed(1)}</span></div>}
                    </div>
                    <div>
                      <h3 style={{marginBottom:12}}>Foto de perfil</h3>
                      <p style={{color:'#555',fontSize:13,marginBottom:14}}>Tómate una selfie o elige de tu galería</p>
                      <ImageUploader tipo="barbero" id={perfilBarbero.id} urlActual={perfilBarbero.foto} label="Subir foto" onSuccess={url=>{setPerfilBarbero({...perfilBarbero,foto:url});setUserData({...userData,foto:url})}} />
                    </div>
                    <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.05)',borderLeft:'2px solid #C9A84C',borderRadius:14,padding:24}}>
                      <h3 style={{marginTop:0,marginBottom:20}}>Editar mi información</h3>
                      <div className="form-group" style={{marginBottom:14}}>
                        <label>Especialidad</label>
                        <input type="text" placeholder="Fades, barba clásica..." value={perfilBarbero.especialidad||''} onChange={e=>setPerfilBarbero({...perfilBarbero,especialidad:e.target.value})} />
                      </div>
                      <div className="form-group" style={{marginBottom:14}}>
                        <label>Descripción</label>
                        <textarea placeholder="Cuéntales quién eres..." value={perfilBarbero.descripcion||''} onChange={e=>setPerfilBarbero({...perfilBarbero,descripcion:e.target.value})}
                          style={{width:'100%',minHeight:80,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'12px 14px',color:'#fff',fontSize:13,resize:'vertical',boxSizing:'border-box',fontFamily:'Inter,sans-serif',outline:'none'}} />
                      </div>
                      <div className="form-group" style={{marginBottom:14}}>
                        <label>WhatsApp</label>
                        <input type="tel" placeholder="+57 300 000 0000" value={perfilBarbero.whatsapp||''} onChange={e=>setPerfilBarbero({...perfilBarbero,whatsapp:e.target.value})} />
                        <p style={{fontSize:11,color:'#555',marginTop:6}}>Para recibir notificaciones de nuevas citas</p>
                      </div>
                      <div className="form-group" style={{marginBottom:20}}>
                        <label>API Key de CallMeBot</label>
                        <input type="text" placeholder="123456" value={perfilBarbero.apikey_whatsapp||''} onChange={e=>setPerfilBarbero({...perfilBarbero,apikey_whatsapp:e.target.value})} />
                        <p style={{fontSize:11,color:'#555',marginTop:6}}>Envía "I allow callmebot to send me messages" al +34 644 33 42 61 por WhatsApp para obtener tu clave</p>
                      </div>
                      <p style={{color:'#555',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:2,marginBottom:14}}>Horario de trabajo</p>
                      {DIAS.map(dia=>{
                        const h=perfilBarbero.horario?.[dia]||{activo:false,inicio:'08:00',fin:'18:00'}
                        return (
                          <div key={dia} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10,flexWrap:'wrap'}}>
                            <label style={{display:'flex',alignItems:'center',gap:8,minWidth:100,cursor:'pointer'}}>
                              <input type="checkbox" checked={h.activo} onChange={e=>setPerfilBarbero({...perfilBarbero,horario:{...perfilBarbero.horario,[dia]:{...h,activo:e.target.checked}}})} style={{width:16,height:16,accentColor:'#C9A84C'}} />
                              <span style={{color:'#fff',fontSize:13,fontWeight:600}}>{DIAS_LABELS[dia]}</span>
                            </label>
                            {h.activo&&<>
                              <input type="time" value={h.inicio} onChange={e=>setPerfilBarbero({...perfilBarbero,horario:{...perfilBarbero.horario,[dia]:{...h,inicio:e.target.value}}})} style={{padding:'6px 10px',fontSize:13,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#fff'}} />
                              <span style={{color:'#333'}}>—</span>
                              <input type="time" value={h.fin} onChange={e=>setPerfilBarbero({...perfilBarbero,horario:{...perfilBarbero.horario,[dia]:{...h,fin:e.target.value}}})} style={{padding:'6px 10px',fontSize:13,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#fff'}} />
                            </>}
                            {!h.activo&&<span style={{color:'#333',fontSize:12}}>No disponible</span>}
                          </div>
                        )
                      })}
                      <button className="btn-primary" style={{marginTop:20,width:'100%'}} onClick={async()=>{
                        try { await fetch(`${API}/api/barbero/perfil/${perfilBarbero.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({descripcion:perfilBarbero.descripcion,especialidad:perfilBarbero.especialidad,whatsapp:perfilBarbero.whatsapp,apikey_whatsapp:perfilBarbero.apikey_whatsapp,horario:perfilBarbero.horario})}); alert('Perfil actualizado') } catch { alert('Error de conexión') }
                      }}>Guardar cambios</button>
                    </div>
                    <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.05)',borderRadius:12,padding:20,textAlign:'center'}}>
                      <p style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:2,marginBottom:8}}>Código de invitación</p>
                      <div style={{fontSize:30,fontWeight:900,letterSpacing:10,color:'#C9A84C',padding:'12px 0'}}>{perfilBarbero.codigo_invitacion||'——'}</div>
                      <p style={{fontSize:11,color:'#333'}}>Comparte con colegas para unirse a tu barbería</p>
                    </div>
                  </div>
                )
              }
            </div>
          )}
          {currentPage==='citas' && (
            <div className="page">
              <h2>Mis citas — {citas.length}</h2>
              {citas.length===0
                ? <div className="empty-state"><p>No tienes citas asignadas aún</p></div>
                : <div className="citas-grid">
                    {citas.map((c:any)=>(
                      <div key={c.id} className="cita-card">
                        <h4>{c.cliente?.nombre||'Cliente'}</h4>
                        <p><strong>Servicio:</strong> {c.servicio?.nombre}</p>
                        <p><strong>Fecha:</strong> {c.fecha}</p>
                        <p><strong>Hora:</strong> {c.hora}</p>
                        <p><strong>Tel:</strong> {c.cliente?.telefono||'—'}</p>
                        <span className="badge-agendada">Confirmada</span>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}
        </div>
      </div>
    )
  }

  // DUEÑO PENDIENTE
  if (loggedIn && userData?.rol==='dueño' && userData?.estado_verificacion==='pendiente') return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-left"><div className="navbar-brand"><h1>Cut<span>Connect</span></h1></div><span className="role-badge pending">Pendiente</span></div>
        <div className="nav-links"><button className="btn-logout" onClick={handleLogout}>Salir</button></div>
      </nav>
      <div className="dashboard-content">
        <div className="page">
          <h2>Solicitud en revisión</h2>
          <div className="pending-card">
            <div className="pending-icon">—</div>
            <h3>Estamos revisando tu negocio</h3>
            <p>Recibirás respuesta en 24–48 horas. Una vez aprobado tendrás 30 días gratuitos para explorar la plataforma.</p>
            <div className="pending-info">
              <p><strong>{userData?.negocio_nombre}</strong></p>
              <p>{userData?.ciudad}, {userData?.estado}</p>
              <p>{userData?.negocio_telefono}</p>
              <p>{userData?.email}</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary">Cerrar sesión</button>
          </div>
        </div>
      </div>
    </div>
  )

  // DUEÑO TRIAL VENCIDO
  if (loggedIn && userData?.rol==='dueño' && userData?.estado_verificacion==='trial') {
    const diasRestantes = userData?.fecha_trial_inicio ? Math.max(0,Math.ceil(14-(Date.now()-new Date(userData.fecha_trial_inicio).getTime())/(1000*60*60*24))) : 14
    if (diasRestantes<=0) return (
      <div className="dashboard-container">
        <nav className="navbar">
          <div className="navbar-left"><div className="navbar-brand"><h1>Cut<span>Connect</span></h1></div><span className="role-badge pending">Vencido</span></div>
          <div className="nav-links"><button className="btn-logout" onClick={handleLogout}>Salir</button></div>
        </nav>
        <div className="dashboard-content">
          <div className="page">
            <h2>Tu período de prueba ha vencido</h2>
            <p style={{color:'#555',maxWidth:460,lineHeight:1.7}}>Para continuar usando CutConnect y que tus clientes puedan encontrarte, activa tu suscripción mensual por <strong style={{color:'#C9A84C'}}>$3.99 USD/mes</strong>.</p>
            <div style={{display:'flex',flexDirection:'column',gap:14,maxWidth:480}}>
              <div style={{background:'#141414',border:'1px solid #635BFF',borderRadius:16,padding:24}}>
                <h3 style={{margin:'0 0 6px',color:'#635BFF',fontSize:16}}>Pago con tarjeta</h3>
                <p style={{color:'#555',fontSize:13,margin:'0 0 16px'}}>Visa, Mastercard, débito — procesado por Stripe</p>
                <button className="btn-primary" style={{width:'100%',background:'#635BFF',padding:14,fontSize:13}} onClick={async()=>{try{const res=await fetch(`${API}/api/pagos/stripe/crear`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({barberia_id:userData?.barberia_id,email:userData?.email})});const data=await res.json();if(data.success)window.location.href=data.url;else alert('Error: '+data.error)}catch{alert('Error de conexión')}}}>
                  Pagar $3.99 USD
                </button>
              </div>
              <div style={{background:'#141414',border:'1px solid rgba(201,168,76,0.3)',borderRadius:16,padding:24}}>
                <h3 style={{margin:'0 0 6px',color:'#C9A84C',fontSize:16}}>Pago con Binance Pay</h3>
                <p style={{color:'#555',fontSize:13,margin:'0 0 16px'}}>Envía exactamente <strong style={{color:'#C9A84C'}}>$12 USDT</strong></p>
                <div style={{textAlign:'center',marginBottom:16}}>
                  <img src="https://mypcsegsvarcwyigzodc.supabase.co/storage/v1/object/public/imagenes-cutconnect/QR%20BINANCE.jpeg" alt="QR Binance" style={{width:160,height:160,borderRadius:10,border:'1px solid rgba(201,168,76,0.3)'}} />
                </div>
                <div style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'10px 14px',marginBottom:12}}>
                  <p style={{fontSize:10,color:'#555',marginBottom:4,textTransform:'uppercase',letterSpacing:2}}>Pay ID</p>
                  <p style={{fontSize:22,fontWeight:900,letterSpacing:6,color:'#C9A84C'}}>176779028</p>
                </div>
                <a href="https://wa.me/+32455136804?text=Hola%20Kennedy%2C%20acabo%20de%20pagar%20mi%20suscripci%C3%B3n%20CutConnect%20por%20Binance%20Pay." target="_blank" rel="noreferrer"
                  style={{display:'block',background:'#25D366',color:'#fff',textAlign:'center',padding:'12px',borderRadius:8,fontWeight:700,textDecoration:'none',fontSize:13,textTransform:'uppercase',letterSpacing:1}}>
                  Enviar comprobante por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // DUEÑO ACTIVO
  if (loggedIn && userData?.rol==='dueño' && ['trial','activo','aprobado'].includes(userData?.estado_verificacion)) {
    const diasRestantes = userData?.fecha_trial_inicio ? Math.max(0,Math.ceil(14-(Date.now()-new Date(userData.fecha_trial_inicio).getTime())/(1000*60*60*24))) : 14
    const maxCitas = Math.max(...rankingBarberos.map(b=>b.total_citas),1)
    return (
      <div className="dashboard-container">
        <nav className="navbar">
          <div className="navbar-left">
            <div className="navbar-brand"><h1>Cut<span>Connect</span></h1></div>
            <span className={`role-badge ${userData?.estado_verificacion==='trial'?'trial':''}`}>{userData?.estado_verificacion==='trial'?'Trial':'Dueño'}</span>
          </div>
          <div className="nav-links">
            <button className={currentPage==='dashboard'?'active':''} onClick={()=>setCurrentPage('dashboard')}>Panel</button>
            <button className={currentPage==='equipo'?'active':''} onClick={()=>{setCurrentPage('equipo');cargarMisBarberos()}}>Equipo</button>
            <button className={currentPage==='citas'?'active':''} onClick={()=>{setCurrentPage('citas');cargarCitasDueno()}}>Citas</button>
            <button className={currentPage==='negocio'?'active':''} onClick={()=>setCurrentPage('negocio')}>Mi negocio</button>
            <button className="btn-logout" onClick={handleLogout}>Salir</button>
          </div>
        </nav>
        <div className="dashboard-content">
          {userData?.estado_verificacion==='trial' && diasRestantes<=3 && (
            <div style={{background:'rgba(231,76,60,0.06)',borderBottom:'1px solid rgba(231,76,60,0.12)',padding:'10px 32px',display:'flex',alignItems:'center',gap:10}}>
              <p style={{fontSize:13,color:'#FF6B6B'}}>Tu período de prueba vence en <strong>{diasRestantes} días</strong>. Activa tu cuenta para no perder tu historial.</p>
            </div>
          )}
          {userData?.estado_verificacion==='trial' && diasRestantes>3 && (
            <div className="trial-banner"><p>Período de prueba activo — {diasRestantes} días restantes</p></div>
          )}

          {currentPage==='dashboard' && (
            <div className="page">
              <h2>Panel de Control</h2>
              <div className="welcome-card owner">
                <p><strong>{userData?.negocio_nombre}</strong></p>
                <p>{userData?.ciudad}, {userData?.estado}</p>
                <p>{userData?.email}</p>
              </div>
              <div className="stats-grid">
                <div className="stat-card"><h4>Citas totales</h4><p className="stat-number">{citas.length}</p></div>
                <div className="stat-card"><h4>Profesionales</h4><p className="stat-number">{misBarberos.length}</p></div>
                <div className="stat-card"><h4>Confirmadas</h4><p className="stat-number">{citas.filter((c:any)=>c.estado==='agendada').length}</p></div>
                {userData?.estado_verificacion==='trial'&&<div className="stat-card"><h4>Días trial</h4><p className="stat-number" style={{color:diasRestantes<=3?'#FF6B6B':'#fff'}}>{diasRestantes}</p></div>}
              </div>
              {rankingBarberos.length>0&&(
                <>
                  <h3>Ranking del equipo</h3>
                  <div className="ranking-grid">
                    {rankingBarberos.map((b,i)=>(
                      <div key={b.barbero_id} className="ranking-item">
                        <div className={`ranking-pos ${i===0?'gold':i===1?'silver':i===2?'bronze':''}`}>{i+1}</div>
                        <BarberoAvatar foto={b.foto} nombre={b.nombre} size={36} />
                        <div className="ranking-info"><div className="ranking-nombre">{b.nombre}</div><div className="ranking-especialidad">{b.total_citas} citas</div></div>
                        <div className="ranking-bar-container"><div className="ranking-bar"><div className="ranking-bar-fill" style={{width:`${(b.total_citas/maxCitas)*100}%`}}></div></div><div className="ranking-citas">{Math.round((b.total_citas/citas.length)*100)}%</div></div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="action-buttons">
                <button onClick={()=>{setCurrentPage('equipo');cargarMisBarberos()}} className="btn-primary">Gestionar equipo</button>
                <button onClick={()=>{setCurrentPage('citas');cargarCitasDueno();cargarRanking()}} className="btn-secondary">Ver citas</button>
              </div>
            </div>
          )}

          {currentPage==='negocio' && (
            <div className="page">
              <h2>Mi Negocio</h2>
              <div style={{marginBottom:24}}>
                <h3 style={{marginBottom:12}}>Logo del negocio</h3>
                <p style={{color:'#555',fontSize:13,marginBottom:14}}>Se mostrará a todos los clientes al buscar tu negocio</p>
                <ImageUploader tipo="logo" id={userData?.barberia_id} urlActual={userData?.negocio_logo} label="Subir logo" onSuccess={url=>setUserData({...userData,negocio_logo:url})} />
              </div>
              <div className="welcome-card owner">
                <p><strong>{userData?.negocio_nombre}</strong></p>
                <p>{userData?.tipo_negocio==='peluqueria'?'Peluquería':'Barbería'} · {userData?.ciudad}</p>
                <p>{userData?.negocio_telefono}</p>
              </div>
              {!editNegocio
                ? <button className="btn-primary" style={{marginTop:16}} onClick={()=>{setEditNegocioData({nombre:userData?.negocio_nombre||'',descripcion:'',telefono:userData?.negocio_telefono||'',logo:userData?.negocio_logo||'',tipo_negocio:userData?.tipo_negocio||'barberia',fidelizacion_citas:10,fidelizacion_beneficio:''});setEditNegocio(true)}}>Editar datos</button>
                : (
                  <form onSubmit={handleGuardarNegocio} className="edit-negocio-form" style={{marginTop:16}}>
                    <div className="form-group"><label>Tipo</label>
                      <div className="category-selector">
                        <button type="button" className={`category-btn ${editNegocioData.tipo_negocio==='barberia'?'active':''}`} onClick={()=>setEditNegocioData({...editNegocioData,tipo_negocio:'barberia'})}><span className="cat-icon">✂</span>Barbería</button>
                        <button type="button" className={`category-btn ${editNegocioData.tipo_negocio==='peluqueria'?'active':''}`} onClick={()=>setEditNegocioData({...editNegocioData,tipo_negocio:'peluqueria'})}><span className="cat-icon">💇</span>Peluquería</button>
                      </div>
                    </div>
                    <div className="form-group"><label>Nombre</label><input type="text" value={editNegocioData.nombre} onChange={e=>setEditNegocioData({...editNegocioData,nombre:e.target.value})} /></div>
                    <div className="form-group"><label>Descripción</label><textarea value={editNegocioData.descripcion} onChange={e=>setEditNegocioData({...editNegocioData,descripcion:e.target.value})} /></div>
                    <div className="form-group"><label>Teléfono</label><input type="tel" value={editNegocioData.telefono} onChange={e=>setEditNegocioData({...editNegocioData,telefono:e.target.value})} /></div>
                    <div style={{background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.12)',borderRadius:12,padding:18}}>
                      <h4 style={{color:'#C9A84C',marginBottom:14,fontSize:13,textTransform:'uppercase',letterSpacing:2,fontWeight:700}}>Programa de fidelización</h4>
                      <div className="form-group" style={{marginBottom:12}}>
                        <label>Citas necesarias para el premio</label>
                        <input type="number" min={1} max={50} value={editNegocioData.fidelizacion_citas} onChange={e=>setEditNegocioData({...editNegocioData,fidelizacion_citas:parseInt(e.target.value)})} />
                      </div>
                      <div className="form-group">
                        <label>Premio</label>
                        <input type="text" placeholder="Ej: Corte gratis, 20% descuento..." value={editNegocioData.fidelizacion_beneficio} onChange={e=>setEditNegocioData({...editNegocioData,fidelizacion_beneficio:e.target.value})} />
                      </div>
                    </div>
                    {error&&<p className="error">{error}</p>}
                    <div style={{display:'flex',gap:10}}>
                      <button type="submit" className="btn-primary" disabled={loading}>{loading?'Guardando...':'Guardar cambios'}</button>
                      <button type="button" className="btn-secondary" onClick={()=>setEditNegocio(false)}>Cancelar</button>
                    </div>
                  </form>
                )
              }
            </div>
          )}

          {currentPage==='equipo' && (
            <div className="page">
              <h2>Mi Equipo</h2>
              {!showFormBarbero&&<div style={{marginBottom:20}}><button className="btn-primary" onClick={()=>{resetFormBarbero();setShowFormBarbero(true)}}>Agregar profesional</button></div>}
              {showFormBarbero&&(
                <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.05)',borderLeft:'2px solid #C9A84C',borderRadius:14,padding:24,marginBottom:24}}>
                  <h3 style={{marginTop:0,marginBottom:20}}>{editandoBarbero?'Editar profesional':'Nuevo profesional'}</h3>
                  <form onSubmit={handleGuardarBarbero} className="form">
                    <div className="form-row">
                      <div className="form-group"><label>Nombre</label><input type="text" placeholder="Carlos, Chepe..." value={formBarbero.nombre} onChange={e=>setFormBarbero({...formBarbero,nombre:e.target.value})} required /></div>
                      <div className="form-group"><label>Especialidad</label><input type="text" placeholder="Fades, barba..." value={formBarbero.especialidad} onChange={e=>setFormBarbero({...formBarbero,especialidad:e.target.value})} /></div>
                    </div>
                    <div className="form-group"><label>Descripción</label><textarea placeholder="Años de experiencia, estilo..." value={formBarbero.descripcion} onChange={e=>setFormBarbero({...formBarbero,descripcion:e.target.value})} /></div>
                    <div>
                      <p style={{color:'#555',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:2,marginBottom:14}}>Horario de trabajo</p>
                      {DIAS.map(dia=>{
                        const h=(formBarbero.horario as any)[dia]
                        return (
                          <div key={dia} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10,flexWrap:'wrap'}}>
                            <label style={{display:'flex',alignItems:'center',gap:8,minWidth:100,cursor:'pointer'}}>
                              <input type="checkbox" checked={h.activo} onChange={e=>updateHorarioDia(dia,'activo',e.target.checked)} style={{width:16,height:16,accentColor:'#C9A84C'}} />
                              <span style={{color:'#fff',fontSize:13,fontWeight:600}}>{DIAS_LABELS[dia]}</span>
                            </label>
                            {h.activo&&<>
                              <input type="time" value={h.inicio} onChange={e=>updateHorarioDia(dia,'inicio',e.target.value)} style={{padding:'6px 10px',fontSize:13,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#fff'}} />
                              <span style={{color:'#333'}}>—</span>
                              <input type="time" value={h.fin} onChange={e=>updateHorarioDia(dia,'fin',e.target.value)} style={{padding:'6px 10px',fontSize:13,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#fff'}} />
                            </>}
                            {!h.activo&&<span style={{color:'#333',fontSize:12}}>No trabaja</span>}
                          </div>
                        )
                      })}
                    </div>
                    {error&&<p className="error">{error}</p>}
                    <div style={{display:'flex',gap:10}}>
                      <button type="submit" className="btn-primary" disabled={loading}>{loading?'Guardando...':editandoBarbero?'Actualizar':'Agregar'}</button>
                      <button type="button" className="btn-secondary" onClick={resetFormBarbero}>Cancelar</button>
                    </div>
                  </form>
                </div>
              )}
              {misBarberos.length===0&&!showFormBarbero&&<div className="empty-state"><p>Aún no tienes profesionales en tu equipo</p><button className="btn-primary" onClick={()=>setShowFormBarbero(true)}>Agregar el primero</button></div>}
              <div className="citas-grid">
                {misBarberos.map((b:any)=>(
                  <div key={b.id} className="cita-card">
                    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                      <BarberoAvatar foto={b.foto} nombre={b.nombre} size={48} />
                      <div>
                        <h4 style={{margin:0}}>{b.nombre}</h4>
                        <p style={{margin:'3px 0 0',fontSize:12}}>{b.especialidad}</p>
                        <span style={{fontSize:11,color:b.usuario_id?'#2ECC71':'#555',fontWeight:600,letterSpacing:0.5}}>{b.usuario_id?'Vinculado':'Sin cuenta propia'}</span>
                      </div>
                    </div>
                    <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:8,padding:'10px 14px',marginBottom:12,textAlign:'center'}}>
                      <p style={{fontSize:10,color:'#555',marginBottom:6,textTransform:'uppercase',letterSpacing:2}}>Código de invitación</p>
                      <div style={{fontSize:22,fontWeight:900,letterSpacing:8,color:'#C9A84C'}}>{b.codigo_invitacion}</div>
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:12}}>
                      {DIAS.map(dia=>{const h=b.horario[dia];return h?.activo?<span key={dia} style={{background:'rgba(201,168,76,0.06)',color:'#C9A84C',border:'1px solid rgba(201,168,76,0.15)',borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>{DIAS_LABELS[dia]}</span>:null})}
                    </div>
                    <div className="cita-actions">
                      <button className="btn-confirm" onClick={()=>handleEditarBarbero(b)}>Editar</button>
                      <button className="btn-reject" onClick={()=>handleEliminarBarbero(b.id)}>Quitar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPage==='citas' && (
            <div className="page">
              <h2>Citas del negocio — {citas.length}</h2>
              {citas.length===0?<div className="empty-state"><p>No hay citas aún</p></div>
                :<div className="citas-grid">
                  {citas.map((c:any)=>(
                    <div key={c.id} className="cita-card">
                      <h4>{c.cliente?.nombre||'Cliente'}</h4>
                      {c.barbero&&<p><strong>Profesional:</strong> {c.barbero.nombre}</p>}
                      <p><strong>Servicio:</strong> {c.servicio?.nombre}</p>
                      <p><strong>Fecha:</strong> {c.fecha}</p>
                      <p><strong>Hora:</strong> {c.hora}</p>
                      <p><strong>Tel:</strong> {c.cliente?.telefono||'—'}</p>
                      <span className="badge-agendada">Confirmada</span>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default App