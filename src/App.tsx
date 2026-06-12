import { useState, useEffect, useRef } from 'react'
import './App.css'

const API = 'https://cutconnect-backend-production.up.railway.app'
const ADMIN_PATH = '/admin'
const DIAS = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']
const DIAS_LABELS: any = { lunes:'Lun', martes:'Mar', miercoles:'Mié', jueves:'Jue', viernes:'Vie', sabado:'Sáb', domingo:'Dom' }

const IMAGEN_BARBERIA = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80'
const IMAGEN_PELUQUERIA = 'https://images.unsplash.com/photo-1560066984-138daaa0a7a6?w=400&q=80'

function getInitials(nombre: string) {
  return nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function Estrellas({ valor, max = 5, onSelect }: { valor: number, max?: number, onSelect?: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display:'flex', gap:2 }}>
      {Array.from({ length: max }, (_, i) => i + 1).map(n => (
        <span
          key={n}
          style={{ fontSize: onSelect ? 28 : 14, cursor: onSelect ? 'pointer' : 'default', color: n <= (hover || valor) ? '#F1C40F' : '#555', transition:'color 0.1s' }}
          onClick={() => onSelect?.(n)}
          onMouseEnter={() => onSelect && setHover(n)}
          onMouseLeave={() => onSelect && setHover(0)}
        >★</span>
      ))}
    </div>
  )
}

function BarberiaLogo({ logo, nombre, size = 52 }: { logo?: string, nombre: string, size?: number }) {
  const [imgError, setImgError] = useState(false)
  if (logo && !imgError) {
    return <img src={logo} alt={nombre} className="barberia-logo-img" style={{ width: size, height: size }} onError={() => setImgError(true)} />
  }
  return <div className="barberia-logo-avatar" style={{ width: size, height: size, fontSize: size * 0.34 }}>{getInitials(nombre)}</div>
}

function BarberoAvatar({ foto, nombre, size = 52 }: { foto?: string, nombre: string, size?: number }) {
  const [imgError, setImgError] = useState(false)
  if (foto && !imgError) {
    return <img src={foto} alt={nombre} className="barberia-logo-img" style={{ width: size, height: size, borderRadius: '50%' }} onError={() => setImgError(true)} />
  }
  return <div className="barberia-logo-avatar" style={{ width: size, height: size, fontSize: size * 0.34, borderRadius: '50%' }}>{getInitials(nombre)}</div>
}

function ImageUploader({ tipo, id, urlActual, onSuccess, label }: {
  tipo: 'logo' | 'barbero', id: number, urlActual?: string, onSuccess: (url: string) => void, label: string
}) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(urlActual || '')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('La imagen no puede superar 5MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('imagen', file)
      const endpoint = tipo === 'logo' ? `/api/upload/logo/${id}` : `/api/upload/barbero/${id}`
      const res = await fetch(`${API}${endpoint}`, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) { setPreview(data.url); onSuccess(data.url) }
      else alert('Error al subir imagen: ' + data.error)
    } catch { alert('Error de conexión al subir imagen') }
    finally { setUploading(false) }
  }

  return (
    <div className="image-uploader">
      <div className="uploader-preview" onClick={() => inputRef.current?.click()} style={{ cursor:'pointer' }}>
        {preview
          ? <img src={preview} alt="preview" className="uploader-img" style={{ borderRadius: tipo === 'barbero' ? '50%' : 12 }} />
          : <div className="uploader-placeholder">
              <span style={{ fontSize:32 }}>{tipo === 'logo' ? '🏪' : '📷'}</span>
              <p>{label}</p>
            </div>
        }
        {uploading && <div className="uploader-overlay"><span>⏳ Subiendo...</span></div>}
      </div>
      <button type="button" className="btn-upload" onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? '⏳ Subiendo...' : preview ? '📷 Cambiar foto' : '📷 Subir foto'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={handleFile} />
    </div>
  )
}

function ModalCalificacion({ tipo, id, barberiaId, usuarioId, nombre, onClose, onDone }: {
  tipo: 'barbero' | 'barberia', id: number, barberiaId: number, usuarioId: number, nombre: string, onClose: () => void, onDone: () => void
}) {
  const [estrellas, setEstrellas] = useState(0)
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEnviar = async () => {
    if (estrellas === 0) { alert('Selecciona una calificación'); return }
    setLoading(true)
    try {
      const body: any = { usuario_id: usuarioId, barberia_id: barberiaId, estrellas, comentario }
      if (tipo === 'barbero') body.barbero_id = id
      const res = await fetch(`${API}/api/calificaciones`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
      const data = await res.json()
      if (data.success) { onDone(); onClose() }
      else alert(data.error)
    } catch { alert('Error de conexión') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'var(--dark-2)', border:'1px solid var(--dark-5)', borderRadius:16, padding:28, maxWidth:380, width:'100%' }}>
        <h3 style={{ marginTop:0 }}>⭐ Calificar a {nombre}</h3>
        <p style={{ color:'var(--muted)', fontSize:13 }}>¿Cómo fue tu experiencia?</p>
        <div style={{ marginBottom:16 }}>
          <Estrellas valor={estrellas} onSelect={setEstrellas} />
        </div>
        <textarea
          placeholder="Comentario opcional..."
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          style={{ width:'100%', minHeight:80, background:'var(--dark-3)', border:'1px solid var(--dark-5)', borderRadius:8, padding:10, color:'var(--cream)', fontSize:13, resize:'vertical', boxSizing:'border-box' }}
        />
        <div style={{ display:'flex', gap:10, marginTop:16 }}>
          <button className="btn-primary" onClick={handleEnviar} disabled={loading || estrellas === 0}>{loading ? '⏳...' : '✅ Enviar'}</button>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [])
  return (
    <div className="splash-screen">
      <div className="splash-logo">
        <span className="splash-pole">💈</span>
        <div className="splash-title">Cut<span>Connect</span></div>
        <div className="splash-subtitle">Tu barbería de confianza</div>
        <div className="splash-bar"><div className="splash-bar-fill"></div></div>
        <div className="splash-countries">🇨🇴 🇻🇪</div>
      </div>
    </div>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('cliente')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [authMode, setAuthMode] = useState<'choice'|'login'|'register'|'recovery'>('choice')
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

  const [ownerData, setOwnerData] = useState({
    negocio_nombre:'', pais:'Colombia', estado:'', municipio:'', ciudad:'',
    negocio_telefono:'', negocio_logo:'', negocio_descripcion:'',
    direccion:'', latitud:'', longitud:'', tipo_negocio:'barberia'
  })

  const [editNegocio, setEditNegocio] = useState(false)
  const [editNegocioData, setEditNegocioData] = useState({ nombre:'', descripcion:'', telefono:'', logo:'', tipo_negocio:'barberia' })

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
  const [formBarbero, setFormBarbero] = useState({
    nombre:'', foto:'', especialidad:'', descripcion:'',
    horario: {
      lunes:    { activo:true,  inicio:'08:00', fin:'18:00' },
      martes:   { activo:true,  inicio:'08:00', fin:'18:00' },
      miercoles:{ activo:true,  inicio:'08:00', fin:'18:00' },
      jueves:   { activo:true,  inicio:'08:00', fin:'18:00' },
      viernes:  { activo:true,  inicio:'08:00', fin:'18:00' },
      sabado:   { activo:true,  inicio:'08:00', fin:'14:00' },
      domingo:  { activo:false, inicio:'',      fin:''      }
    }
  })

  const [perfilBarbero, setPerfilBarbero] = useState<any>(null)
  const [descripcionBarbero, setDescripcionBarbero] = useState('')
  const [editandoDesc, setEditandoDesc] = useState(false)

  const [modalCal, setModalCal] = useState<any>(null)

  const isAdminRoute = window.location.pathname === ADMIN_PATH

  useEffect(() => { if (loggedIn) cargarDatos() }, [loggedIn])
  useEffect(() => {
    if (formData.barbero_id && formData.fecha) cargarDisponibilidad(formData.barbero_id, formData.fecha)
    else setHorasDisponibles([])
  }, [formData.barbero_id, formData.fecha])
  useEffect(() => {
    if (loggedIn && userData?.rol === 'barbero') cargarPerfilBarbero()
  }, [loggedIn, userData?.rol])

  const cargarDatos = async (lat?: number, lon?: number, ciudad?: string, tipo?: string) => {
    try {
      let url = `${API}/api/barberias`
      const params = []
      if (lat && lon) params.push(`lat=${lat}&lon=${lon}`)
      else if (ciudad) params.push(`ciudad=${encodeURIComponent(ciudad)}`)
      if (tipo && tipo !== 'todos') params.push(`tipo=${tipo}`)
      if (params.length) url += '?' + params.join('&')
      const [resBarb, resServ, resCitas] = await Promise.all([
        fetch(url), fetch(`${API}/api/servicios`),
        userData?.rol === 'dueño' ? fetch(`${API}/api/citas/barberia/${userData?.barberia_id}`)
        : userData?.rol === 'barbero' ? fetch(`${API}/api/citas/barbero/${userData?.barbero_id}`)
        : fetch(`${API}/api/citas/usuario/${userData?.id}`)
      ])
      const dBarb = await resBarb.json(); const dServ = await resServ.json(); const dCitas = await resCitas.json()
      setBarberias(dBarb.data || []); setServicios(dServ.data || []); setCitas(dCitas.data || [])
    } catch (err) { console.error(err) }
  }

  const cargarCitasDueno = async () => {
    try { const res = await fetch(`${API}/api/citas/barberia/${userData?.barberia_id}`); const d = await res.json(); setCitas(d.data || []) } catch { setCitas([]) }
  }
  const cargarCitasBarbero = async () => {
    try { const res = await fetch(`${API}/api/citas/barbero/${userData?.barbero_id}`); const d = await res.json(); setCitas(d.data || []) } catch { setCitas([]) }
  }
  const cargarBarberosBarberia = async (id: any) => {
    try { const res = await fetch(`${API}/api/barberos/${id}`); const d = await res.json(); setBarberosList(d.data || []) } catch { setBarberosList([]) }
  }
  const cargarMisBarberos = async () => {
    try { const res = await fetch(`${API}/api/barberos/${userData?.barberia_id}`); const d = await res.json(); setMisBarberos(d.data || []) } catch { setMisBarberos([]) }
  }
  const cargarRanking = async () => {
    try { const res = await fetch(`${API}/api/stats/barberos/${userData?.barberia_id}`); const d = await res.json(); setRankingBarberos(d.data || []) } catch { setRankingBarberos([]) }
  }
  const cargarPerfilBarbero = async () => {
    try { const res = await fetch(`${API}/api/barbero/perfil/${userData?.id}`); const d = await res.json(); if (d.success) { setPerfilBarbero(d.data); setDescripcionBarbero(d.data.descripcion || '') } } catch { }
  }
  const cargarDisponibilidad = async (barberoId: any, fecha: string) => {
    try { const res = await fetch(`${API}/api/disponibilidad/${barberoId}/${fecha}`); const d = await res.json(); setHorasDisponibles(d.data || []) } catch { setHorasDisponibles([]) }
  }

  const buscarPorGPS = () => {
    if (!navigator.geolocation) { setError('Tu navegador no soporta geolocalización'); return }
    setBuscando(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGpsUsado(true); setBuscando(false); cargarDatos(pos.coords.latitude, pos.coords.longitude, undefined, tipoNegocioFiltro) },
      () => { setBuscando(false); setError('No se pudo obtener ubicación') }
    )
  }
  const buscarPorCiudad = () => { if (!searchCiudad.trim()) return; setGpsUsado(false); cargarDatos(undefined, undefined, searchCiudad, tipoNegocioFiltro) }

  const handleLogin = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (data.success) { localStorage.setItem('token', data.token); setUserData(data.user); setLoggedIn(true); setCurrentPage('dashboard'); setEmail(''); setPassword('') }
      else setError(data.error || 'Error al iniciar sesión')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }

  const handleRegister = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const body: any = { email, password, nombre: email.split('@')[0], telefono:'', rol, pais: paisSeleccionado }
      if (rol === 'barbero' && usarCodigo) body.codigo_invitacion = codigoInvitacion
      const res = await fetch(`${API}/api/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
      const data = await res.json()
      if (data.success) { localStorage.setItem('token', data.token); setUserData(data.user); setLoggedIn(true); setCurrentPage('dashboard'); setEmail(''); setPassword('') }
      else setError(data.error || 'Error al registrarse')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }

  const handleRegisterDueno = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password, nombre: email.split('@')[0], telefono:'', rol:'dueño', ...ownerData }) })
      const data = await res.json()
      if (data.success) { localStorage.setItem('token', data.token); setUserData(data.user); setLoggedIn(true); setCurrentPage('dashboard'); setEmail(''); setPassword('') }
      else setError(data.error || 'Error al registrarse')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }

  const obtenerUbicacion = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setOwnerData({ ...ownerData, latitud: pos.coords.latitude.toString(), longitud: pos.coords.longitude.toString() }),
        (err) => alert('❌ No se pudo obtener ubicación: ' + err.message)
      )
    } else alert('❌ Tu navegador no soporta geolocalización')
  }

  const handleRecuperarContrasena = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/auth/recuperar-contrasena`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: recoveryEmail, nueva_contrasena: recoveryPassword }) })
      const data = await res.json()
      if (data.success) { alert('✅ Contraseña actualizada.'); setAuthMode('login'); setRecoveryEmail(''); setRecoveryPassword('') }
      else setError(data.error || 'Error')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }

  const handleAgendar = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/citas/agendar`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...formData, usuario_id: userData.id }) })
      const data = await res.json()
      if (data.success) {
        alert('💈 ¡Cita agendada!')
        setFormData({ barberia_id:'', barbero_id:'', servicio_id:'', fecha:'', hora:'' })
        setSelectedBarberia(null); setSelectedBarbero(null); setBarberosList([])
        await cargarDatos(); setCurrentPage('citas')
      } else setError(data.error || 'Error al agendar')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }

  const handleGuardarNegocio = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/barberias/${userData?.barberia_id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(editNegocioData) })
      const data = await res.json()
      if (data.success) { setEditNegocio(false); alert('✅ Negocio actualizado') }
      else setError(data.error || 'Error')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }

  const handleGuardarDescripcion = async () => {
    if (!perfilBarbero) return
    try {
      await fetch(`${API}/api/barbero/perfil/${perfilBarbero.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ descripcion: descripcionBarbero }) })
      setPerfilBarbero({ ...perfilBarbero, descripcion: descripcionBarbero })
      setEditandoDesc(false)
      alert('✅ Descripción guardada')
    } catch { alert('Error de conexión') }
  }

  const handleLogout = () => {
    localStorage.removeItem('token'); setLoggedIn(false); setEmail(''); setPassword('')
    setRol('cliente'); setUserData(null); setCurrentPage('dashboard'); setAuthMode('choice')
  }

  const resetFormBarbero = () => {
    setFormBarbero({ nombre:'', foto:'', especialidad:'', descripcion:'', horario: { lunes:{activo:true,inicio:'08:00',fin:'18:00'}, martes:{activo:true,inicio:'08:00',fin:'18:00'}, miercoles:{activo:true,inicio:'08:00',fin:'18:00'}, jueves:{activo:true,inicio:'08:00',fin:'18:00'}, viernes:{activo:true,inicio:'08:00',fin:'18:00'}, sabado:{activo:true,inicio:'08:00',fin:'14:00'}, domingo:{activo:false,inicio:'',fin:''} } })
    setEditandoBarbero(null); setShowFormBarbero(false)
  }

  const handleGuardarBarbero = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      let res
      if (editandoBarbero) res = await fetch(`${API}/api/barberos/${editandoBarbero.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(formBarbero) })
      else res = await fetch(`${API}/api/barberos`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...formBarbero, barberia_id: userData?.barberia_id }) })
      const data = await res.json()
      if (data.success) { resetFormBarbero(); cargarMisBarberos() }
      else setError(data.error || 'Error al guardar')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }

  const handleEditarBarbero = (b: any) => {
    setEditandoBarbero(b)
    setFormBarbero({ nombre: b.nombre, foto: b.foto || '', especialidad: b.especialidad, descripcion: b.descripcion || '', horario: b.horario })
    setShowFormBarbero(true)
  }

  const handleEliminarBarbero = async (id: number) => {
    if (!confirm('¿Desactivar este barbero?')) return
    await fetch(`${API}/api/barberos/${id}`, { method:'DELETE' })
    cargarMisBarberos()
  }

  const updateHorarioDia = (dia: string, campo: string, valor: any) => {
    setFormBarbero({ ...formBarbero, horario: { ...formBarbero.horario, [dia]: { ...(formBarbero.horario as any)[dia], [campo]: valor } } })
  }

  const handleAdminLogin = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/admin/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password: adminPassword }) })
      const data = await res.json()
      if (data.success) { setAdminLoggedIn(true); cargarAdminData() }
      else setError('Contraseña incorrecta')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }

  const cargarAdminData = async () => {
    try {
      const [resN, resS] = await Promise.all([
        fetch(`${API}/api/admin/negocios`, { headers:{'x-admin-token':'admin_token_cutconnect'} }),
        fetch(`${API}/api/admin/stats`, { headers:{'x-admin-token':'admin_token_cutconnect'} })
      ])
      const dN = await resN.json(); const dS = await resS.json()
      setAdminNegocios(dN.data || []); setAdminStats(dS.data || null)
    } catch { setAdminMsg('Error cargando datos') }
  }

  const accionAdmin = async (endpoint: string, id: number) => {
    try {
      const res = await fetch(`${API}/api/admin/${endpoint}/${id}`, { method:'POST', headers:{'Content-Type':'application/json','x-admin-token':'admin_token_cutconnect'} })
      const data = await res.json()
      setAdminMsg(data.message || data.error); cargarAdminData()
    } catch { setAdminMsg('Error al ejecutar acción') }
    setTimeout(() => setAdminMsg(''), 4000)
  }

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />

  // ============================================================
  // ADMIN
  // ============================================================
  if (isAdminRoute) {
    if (!adminLoggedIn) return (
      <div className="login-container">
        <div className="login-box">
          <div className="logo-section"><span className="logo-emoji">🔐</span><h1>Cut<span>Connect</span></h1><p className="subtitle">Panel Administrador</p></div>
          <form onSubmit={handleAdminLogin} className="auth-form">
            <div className="form-group"><label>Contraseña de administrador</label><input type="password" placeholder="••••••••" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required /></div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-submit" disabled={loading}>{loading ? '⏳ Verificando...' : '🔓 Entrar al Panel'}</button>
          </form>
        </div>
      </div>
    )
    const negociosFiltrados = adminPage === 'pendientes' ? adminNegocios.filter(n => n.estado_verificacion === 'pendiente') : adminNegocios
    return (
      <div className="admin-container">
        <div className="admin-navbar">
          <div><h1>💈 CutConnect — Admin</h1><p className="admin-subtitle">Panel de control exclusivo</p></div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn-admin btn-rechazar" onClick={() => setAdminPage('pendientes')} style={{ fontWeight: adminPage==='pendientes' ? 900 : 400 }}>⏳ Pendientes</button>
            <button className="btn-admin btn-rechazar" onClick={() => setAdminPage('todos')} style={{ fontWeight: adminPage==='todos' ? 900 : 400 }}>📋 Todos</button>
            <button className="btn-admin btn-suspender" onClick={() => setAdminLoggedIn(false)}>Salir</button>
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
              <div className="admin-stat"><span className="admin-stat-num gold">{adminStats.barberias}</span><span className="admin-stat-label">💈 Barberías</span></div>
              <div className="admin-stat"><span className="admin-stat-num gold">{adminStats.peluquerias}</span><span className="admin-stat-label">💇 Peluquerías</span></div>
              <div className="admin-stat"><span className="admin-stat-num gold">{adminStats.total_clientes}</span><span className="admin-stat-label">Clientes</span></div>
            </div>
          )}
          {adminMsg && <p className="success-msg">✅ {adminMsg}</p>}
          <p className="admin-section-title">{adminPage==='pendientes' ? '⏳ Solicitudes pendientes' : '📋 Todos los negocios'}</p>
          {negociosFiltrados.length === 0 && <div className="empty-state"><span className="empty-icon">🎉</span><p>No hay registros</p></div>}
          {negociosFiltrados.map(n => (
            <div key={n.id} className="negocio-row">
              {n.logo ? <img src={n.logo} alt={n.nombre} className="negocio-logo-img" /> : <div className="negocio-logo-av">{getInitials(n.nombre)}</div>}
              <div className="negocio-info">
                <div className="negocio-nombre">{n.tipo_negocio === 'peluqueria' ? '💇' : '💈'} {n.nombre}</div>
                <div className="negocio-meta">📍 {n.ciudad}, {n.estado}, {n.pais} · 📞 {n.telefono}</div>
                <div className="negocio-email">✉️ {n.email_dueno}</div>
                {n.estado_verificacion==='trial' && n.diasTrial!==null && <div style={{ color:'#D7BDE2', fontSize:12, marginTop:3 }}>⏱ {n.diasTrial} días restantes</div>}
              </div>
              <span className={`status-badge status-${n.estado_verificacion}`}>
                {n.estado_verificacion==='pendiente' && '⏳ Pendiente'}
                {n.estado_verificacion==='trial' && '🟣 Trial'}
                {n.estado_verificacion==='activo' && '✅ Activo'}
                {n.estado_verificacion==='suspendido' && '🔴 Suspendido'}
                {n.estado_verificacion==='rechazado' && '❌ Rechazado'}
              </span>
              <div className="admin-actions">
                {n.estado_verificacion==='pendiente' && <><button className="btn-admin btn-aprobar" onClick={() => accionAdmin('aprobar', n.id)}>✅ Aprobar</button><button className="btn-admin btn-rechazar" onClick={() => accionAdmin('rechazar', n.id)}>❌ Rechazar</button></>}
                {(n.estado_verificacion==='trial' || n.estado_verificacion==='suspendido') && <button className="btn-admin btn-activar" onClick={() => accionAdmin('activar', n.id)}>⭐ Activar</button>}
                {(n.estado_verificacion==='activo' || n.estado_verificacion==='trial') && <button className="btn-admin btn-suspender" onClick={() => accionAdmin('suspender', n.id)}>⏸ Suspender</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!loggedIn && authMode==='choice') return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-section"><span className="logo-emoji">💈</span><h1>Cut<span>Connect</span></h1><p className="subtitle">Colombia 🇨🇴 · Venezuela 🇻🇪</p></div>
        <div className="auth-choice">
          <button className="btn-login-choice" onClick={() => setAuthMode('login')}>🔓<br/>INICIAR SESIÓN</button>
          <button className="btn-register-choice" onClick={() => setAuthMode('register')}>✏️<br/>REGISTRARSE</button>
        </div>
      </div>
    </div>
  )

  if (!loggedIn && authMode==='login') return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-section"><span className="logo-emoji">💈</span><h1>Cut<span>Connect</span></h1></div>
        <p className="form-subtitle">Iniciar Sesión</p>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group"><label>Email</label><input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Contraseña</label><input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>{loading ? '⏳ Entrando...' : '🔓 Iniciar Sesión'}</button>
        </form>
        <div className="auth-links">
          <button className="link-btn" onClick={() => setAuthMode('choice')}>← Volver</button>
          <button className="link-btn" onClick={() => setAuthMode('recovery')}>¿Olvidaste tu contraseña?</button>
        </div>
      </div>
    </div>
  )

  if (!loggedIn && authMode==='register' && rol==='dueño') return (
    <div className="login-container">
      <div className="login-box large-box">
        <div className="logo-section"><span className="logo-emoji">💈</span><h1>Cut<span>Connect</span></h1></div>
        <p className="form-subtitle">Registrar mi negocio</p>
        <form onSubmit={handleRegisterDueno} className="owner-form">
          <fieldset className="form-section">
            <legend>🌎 País</legend>
            <div className="pais-selector">
              <button type="button" className={`pais-btn ${ownerData.pais==='Colombia' ? 'active' : ''}`} onClick={() => setOwnerData({...ownerData, pais:'Colombia'})}>🇨🇴 Colombia</button>
              <button type="button" className={`pais-btn ${ownerData.pais==='Venezuela' ? 'active' : ''}`} onClick={() => setOwnerData({...ownerData, pais:'Venezuela'})}>🇻🇪 Venezuela</button>
            </div>
          </fieldset>
          <fieldset className="form-section">
            <legend>💈 Tipo de negocio</legend>
            <div className="category-selector">
              <button type="button" className={`category-btn ${ownerData.tipo_negocio==='barberia' ? 'active' : ''}`} onClick={() => setOwnerData({...ownerData, tipo_negocio:'barberia'})}><span className="cat-icon">💈</span>Barbería</button>
              <button type="button" className={`category-btn ${ownerData.tipo_negocio==='peluqueria' ? 'active' : ''}`} onClick={() => setOwnerData({...ownerData, tipo_negocio:'peluqueria'})}><span className="cat-icon">💇</span>Peluquería</button>
            </div>
          </fieldset>
          <fieldset className="form-section">
            <legend>👤 Acceso</legend>
            <div className="form-group"><label>Email</label><input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div className="form-group"><label>Contraseña</label><input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          </fieldset>
          <fieldset className="form-section">
            <legend>🏪 Datos del negocio</legend>
            <div className="form-group"><label>Nombre</label><input type="text" placeholder="Ej: Barbería El Rey" value={ownerData.negocio_nombre} onChange={e => setOwnerData({...ownerData, negocio_nombre: e.target.value})} required /></div>
            <div className="form-row">
              <div className="form-group"><label>Departamento/Estado</label><input type="text" placeholder="Antioquia" value={ownerData.estado} onChange={e => setOwnerData({...ownerData, estado: e.target.value})} required /></div>
              <div className="form-group"><label>Ciudad</label><input type="text" placeholder="Medellín" value={ownerData.ciudad} onChange={e => setOwnerData({...ownerData, ciudad: e.target.value})} required /></div>
            </div>
            <div className="form-group"><label>Dirección</label><input type="text" placeholder="Calle 50 #30-15" value={ownerData.direccion} onChange={e => setOwnerData({...ownerData, direccion: e.target.value})} required /></div>
            <div className="form-group"><label>Teléfono</label><input type="tel" placeholder="+57 300 000 0000" value={ownerData.negocio_telefono} onChange={e => setOwnerData({...ownerData, negocio_telefono: e.target.value})} required /></div>
            <div className="form-group"><label>Descripción</label><textarea placeholder="Cuéntanos sobre tu negocio..." value={ownerData.negocio_descripcion} onChange={e => setOwnerData({...ownerData, negocio_descripcion: e.target.value})} /></div>
          </fieldset>
          <fieldset className="form-section">
            <legend>📍 Ubicación GPS</legend>
            <button type="button" onClick={obtenerUbicacion} className="btn-gps">📍 Obtener mi ubicación</button>
            <div className="form-row">
              <div className="form-group"><label>Latitud</label><input type="number" placeholder="4.7110" value={ownerData.latitud} onChange={e => setOwnerData({...ownerData, latitud: e.target.value})} step="0.0001" required /></div>
              <div className="form-group"><label>Longitud</label><input type="number" placeholder="-74.0721" value={ownerData.longitud} onChange={e => setOwnerData({...ownerData, longitud: e.target.value})} step="0.0001" required /></div>
            </div>
          </fieldset>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>{loading ? '⏳ Registrando...' : '💈 Registrar mi negocio'}</button>
        </form>
        <button className="link-btn" onClick={() => setAuthMode('choice')}>← Volver</button>
      </div>
    </div>
  )

  if (!loggedIn && authMode==='register' && rol!=='dueño') return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-section"><span className="logo-emoji">💈</span><h1>Cut<span>Connect</span></h1></div>
        <p className="form-subtitle">Crear cuenta</p>
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label>País</label>
            <div className="pais-selector">
              <button type="button" className={`pais-btn ${paisSeleccionado==='Colombia' ? 'active' : ''}`} onClick={() => setPaisSeleccionado('Colombia')}>🇨🇴 Colombia</button>
              <button type="button" className={`pais-btn ${paisSeleccionado==='Venezuela' ? 'active' : ''}`} onClick={() => setPaisSeleccionado('Venezuela')}>🇻🇪 Venezuela</button>
            </div>
          </div>
          <div className="form-group"><label>Email</label><input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Contraseña</label><input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <div className="form-group">
            <label>Soy...</label>
            <select value={rol} onChange={e => setRol(e.target.value)} required>
              <option value="cliente">👤 Cliente — Quiero agendar citas</option>
              <option value="barbero">✂️ Barbero/Peluquero</option>
              <option value="dueño">💈 Dueño de negocio</option>
            </select>
          </div>
          {rol === 'barbero' && (
            <div className="invite-code-section">
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', marginBottom:10 }}>
                <input type="checkbox" checked={usarCodigo} onChange={e => setUsarCodigo(e.target.checked)} style={{ width:16, height:16, accentColor:'var(--red)' }} />
                <span>Tengo un código de invitación</span>
              </label>
              {usarCodigo && (
                <div className="form-group">
                  <label>Código de invitación</label>
                  <input type="text" placeholder="847291" value={codigoInvitacion} onChange={e => setCodigoInvitacion(e.target.value)} maxLength={6} style={{ fontSize:24, letterSpacing:8, textAlign:'center', fontWeight:700 }} />
                  <p style={{ fontSize:12, color:'var(--muted)', marginTop:4 }}>Tu dueño te lo compartió por WhatsApp</p>
                </div>
              )}
            </div>
          )}
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>{loading ? '⏳ Registrando...' : '✏️ Crear cuenta'}</button>
        </form>
        <button className="link-btn" onClick={() => setAuthMode('choice')}>← Volver</button>
      </div>
    </div>
  )

  if (!loggedIn && authMode==='recovery') return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-section"><span className="logo-emoji">💈</span><h1>Cut<span>Connect</span></h1></div>
        <p className="form-subtitle">Recuperar contraseña</p>
        <form onSubmit={handleRecuperarContrasena} className="auth-form">
          <div className="form-group"><label>Email registrado</label><input type="email" placeholder="tu@email.com" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Nueva contraseña</label><input type="password" placeholder="••••••••" value={recoveryPassword} onChange={e => setRecoveryPassword(e.target.value)} required /></div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>{loading ? '⏳ Procesando...' : '🔄 Cambiar contraseña'}</button>
        </form>
        <button className="link-btn" onClick={() => setAuthMode('login')}>← Volver</button>
      </div>
    </div>
  )

  // ============================================================
  // CLIENTE
  // ============================================================
  if (loggedIn && userData?.rol==='cliente') return (
    <div className="dashboard-container">
      {modalCal && <ModalCalificacion {...modalCal} onClose={() => setModalCal(null)} onDone={() => cargarDatos()} />}
      <nav className="navbar">
        <div className="navbar-left"><div className="navbar-brand"><span>💈</span><h1>CutConnect</h1></div><span className="role-badge">👤 Cliente</span></div>
        <div className="nav-links">
          <button className={currentPage==='dashboard' ? 'active' : ''} onClick={() => setCurrentPage('dashboard')}>🏠 Inicio</button>
          <button className={currentPage==='agendar' ? 'active' : ''} onClick={() => { setCurrentPage('agendar'); cargarDatos() }}>📅 Agendar</button>
          <button className={currentPage==='citas' ? 'active' : ''} onClick={() => { setCurrentPage('citas'); cargarDatos() }}>📋 Mis citas</button>
          <button className="btn-logout" onClick={handleLogout}>Salir</button>
        </div>
      </nav>
      <div className="dashboard-content">
        {currentPage==='dashboard' && (
          <div className="page">
            <h2>¡Bienvenido, {userData?.nombre}! 👋</h2>
            <div className="welcome-card">
              <p><strong>País:</strong> {userData?.pais}</p>
              <p><strong>Email:</strong> {userData?.email}</p>
              <p><strong>Citas agendadas:</strong> {citas.length}</p>
            </div>

            {/* Banner tipo de negocio */}
            <div style={{ display:'flex', gap:12, marginTop:24, marginBottom:8 }}>
              <div style={{ flex:1, borderRadius:16, overflow:'hidden', position:'relative', minHeight:120, cursor:'pointer' }} onClick={() => { setTipoNegocioFiltro('barberia'); setCurrentPage('agendar'); cargarDatos() }}>
                <img src={IMAGEN_BARBERIA} alt="Barberías" style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }} />
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:32 }}>💈</span>
                  <span style={{ color:'#fff', fontWeight:900, fontSize:16, marginTop:4 }}>Barberías</span>
                </div>
              </div>
              <div style={{ flex:1, borderRadius:16, overflow:'hidden', position:'relative', minHeight:120, cursor:'pointer' }} onClick={() => { setTipoNegocioFiltro('peluqueria'); setCurrentPage('agendar'); cargarDatos() }}>
                <img src={IMAGEN_PELUQUERIA} alt="Peluquerías" style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }} />
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:32 }}>💇</span>
                  <span style={{ color:'#fff', fontWeight:900, fontSize:16, marginTop:4 }}>Peluquerías</span>
                </div>
              </div>
            </div>
            <p style={{ color:'var(--muted)', fontSize:12, textAlign:'center' }}>Toca para buscar cerca de ti</p>
          </div>
        )}

        {currentPage==='agendar' && (
          <div className="page">
            <h2>💈 Agendar cita</h2>
            <div className="search-section">
              <p className="search-title">🗺️ Encuentra tu barbería o peluquería</p>
              <div className="tipo-filter">
                {['todos','barberia','peluqueria'].map(t => (
                  <button key={t} className={`tipo-btn ${tipoNegocioFiltro===t ? 'active' : ''}`} onClick={() => { setTipoNegocioFiltro(t); if (gpsUsado) buscarPorGPS() }}>
                    {t==='todos' && '🔍 Todos'}{t==='barberia' && '💈 Barberías'}{t==='peluqueria' && '💇 Peluquerías'}
                  </button>
                ))}
              </div>
              <button className="btn-gps" onClick={buscarPorGPS} disabled={buscando}>{buscando ? '⏳ Buscando...' : '📍 Cerca de mí (GPS)'}</button>
              <div className="search-divider">o busca por ciudad</div>
              <div className="search-bar" style={{ marginTop:10 }}>
                <input type="text" placeholder="Ej: Medellín, Bogotá, Caracas..." value={searchCiudad} onChange={e => setSearchCiudad(e.target.value)} onKeyDown={e => e.key==='Enter' && buscarPorCiudad()} />
                <button className="btn-search" onClick={buscarPorCiudad}>🔍 Buscar</button>
              </div>
            </div>

            {barberias.length > 0 && (
              <>
                <h3>{gpsUsado ? '📍 Cerca de ti' : '🏙️ Resultados'} ({barberias.length})</h3>
                <div className="barberias-grid">
                  {barberias.map((b: any) => (
                    <div key={b.id} className={`barberia-card ${selectedBarberia?.id===b.id ? 'selected' : ''}`}>
                      {/* Imagen banner */}
                      <div style={{ width:'100%', height:100, borderRadius:'10px 10px 0 0', overflow:'hidden', position:'relative', marginBottom:8 }}>
                        {b.logo
                          ? <img src={b.logo} alt={b.nombre} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          : <img src={b.tipo_negocio==='peluqueria' ? IMAGEN_PELUQUERIA : IMAGEN_BARBERIA} alt={b.nombre} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        }
                        <span style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.6)', borderRadius:20, padding:'2px 8px', fontSize:18 }}>{b.tipo_negocio==='peluqueria' ? '💇' : '💈'}</span>
                      </div>
                      <div className="barberia-card-header">
                        <div className="barberia-info">
                          <div className="barberia-nombre">{b.nombre}</div>
                          <div className="barberia-ciudad">📍 {b.ciudad}</div>
                          {b.distancia!==undefined && <div className="barberia-distancia">🛣️ {b.distancia.toFixed(1)} km</div>}
                          {b.calificacion_promedio > 0 && <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:2 }}><Estrellas valor={Math.round(b.calificacion_promedio)} /><span style={{ fontSize:12, color:'var(--muted)' }}>{Number(b.calificacion_promedio).toFixed(1)}</span></div>}
                        </div>
                      </div>
                      <div className="barberia-card-body">
                        {b.descripcion && <p className="barberia-descripcion">{b.descripcion}</p>}
                        {b.telefono && <p className="barberia-tel">📞 {b.telefono}</p>}
                        <div style={{ display:'flex', gap:8, marginTop:8 }}>
                          <button className={`btn-elegir ${selectedBarberia?.id===b.id ? 'selected' : ''}`} onClick={() => { setSelectedBarberia(b); setSelectedBarbero(null); setBarberosList([]); setFormData({...formData, barberia_id: b.id, barbero_id:'', hora:''}); cargarBarberosBarberia(b.id) }}>
                            {selectedBarberia?.id===b.id ? '✅ Seleccionada' : 'Elegir'}
                          </button>
                          <button style={{ background:'transparent', border:'1px solid var(--dark-5)', borderRadius:8, color:'var(--cream)', fontSize:12, padding:'6px 10px', cursor:'pointer' }}
                            onClick={() => setModalCal({ tipo:'barberia', id: b.id, barberiaId: b.id, usuarioId: userData.id, nombre: b.nombre })}>
                            ⭐ Calificar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {barberias.length===0 && !buscando && (
              <div className="empty-state" style={{ marginTop:20 }}>
                <span className="empty-icon">💈</span>
                <p>Usa el GPS o busca por ciudad para ver negocios disponibles</p>
              </div>
            )}

            {selectedBarberia && (
              <>
                <h3>✂️ Elige tu profesional en {selectedBarberia.nombre}</h3>
                {barberosList.length === 0
                  ? <div className="empty-state" style={{ padding:'20px 0' }}><span className="empty-icon">✂️</span><p>Este negocio aún no tiene profesionales registrados</p></div>
                  : (
                    <div className="barberias-grid">
                      {barberosList.map((b: any) => (
                        <div key={b.id} className={`barberia-card ${selectedBarbero?.id===b.id ? 'selected' : ''}`}>
                          <div className="barberia-card-header">
                            <BarberoAvatar foto={b.foto} nombre={b.nombre} size={52} />
                            <div className="barberia-info">
                              <div className="barberia-nombre">{b.nombre}</div>
                              <div className="barberia-ciudad">✂️ {b.especialidad}</div>
                              {b.calificacion_promedio > 0 && <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:2 }}><Estrellas valor={Math.round(b.calificacion_promedio)} /><span style={{ fontSize:12, color:'var(--muted)' }}>{Number(b.calificacion_promedio).toFixed(1)}</span></div>}
                              {b.descripcion && <p style={{ fontSize:12, color:'var(--muted)', margin:'4px 0 0 0' }}>{b.descripcion}</p>}
                            </div>
                          </div>
                          <div className="barberia-card-body">
                            <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
                              {DIAS.map(dia => { const h = b.horario[dia]; return h?.activo ? <span key={dia} style={{ background:'rgba(192,57,43,0.15)', color:'#E8D5B7', border:'1px solid rgba(192,57,43,0.3)', borderRadius:4, padding:'2px 6px', fontSize:10, fontWeight:700 }}>{DIAS_LABELS[dia]}</span> : null })}
                            </div>
                            <div style={{ display:'flex', gap:8 }}>
                              <button className={`btn-elegir ${selectedBarbero?.id===b.id ? 'selected' : ''}`} onClick={() => { setSelectedBarbero(b); setFormData({...formData, barbero_id: b.id, hora:''}) }}>
                                {selectedBarbero?.id===b.id ? '✅ Seleccionado' : 'Elegir'}
                              </button>
                              <button style={{ background:'transparent', border:'1px solid var(--dark-5)', borderRadius:8, color:'var(--cream)', fontSize:12, padding:'6px 10px', cursor:'pointer' }}
                                onClick={() => setModalCal({ tipo:'barbero', id: b.id, barberiaId: selectedBarberia.id, usuarioId: userData.id, nombre: b.nombre })}>
                                ⭐ Calificar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </>
            )}

            {selectedBarbero && (
              <>
                <h3>📅 Cita con {selectedBarbero.nombre}</h3>
                <form className="form" onSubmit={handleAgendar}>
                  <div className="form-group">
                    <label>Servicio</label>
                    <select value={formData.servicio_id} onChange={e => setFormData({...formData, servicio_id: e.target.value})} required>
                      <option value="">-- Elige el servicio --</option>
                      {servicios.map((s: any) => <option key={s.id} value={s.id}>{s.emoji} {s.nombre} — ${s.precio}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fecha</label>
                    <input type="date" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value, hora:''})} required min={new Date().toISOString().split('T')[0]} />
                  </div>
                  {formData.fecha && (
                    <div className="form-group">
                      <label>Hora disponible</label>
                      {horasDisponibles.length === 0
                        ? <p style={{ color:'#E74C3C', fontSize:14 }}>❌ No hay horas disponibles ese día</p>
                        : <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:4 }}>
                            {horasDisponibles.map(h => (
                              <button key={h} type="button" onClick={() => setFormData({...formData, hora: h})} style={{ padding:'8px 14px', borderRadius:8, border:'1px solid', borderColor: formData.hora===h ? 'var(--red)' : 'var(--dark-5)', background: formData.hora===h ? 'var(--red)' : 'var(--dark-3)', color:'var(--cream)', fontWeight:700, cursor:'pointer', fontSize:13 }}>{h}</button>
                            ))}
                          </div>
                      }
                    </div>
                  )}
                  {error && <p className="error">{error}</p>}
                  <button type="submit" className="btn-primary" disabled={loading || !formData.hora}>{loading ? '⏳ Agendando...' : '💈 Confirmar cita'}</button>
                </form>
              </>
            )}
          </div>
        )}

        {currentPage==='citas' && (
          <div className="page">
            <h2>📋 Mis citas ({citas.length})</h2>
            {citas.length===0
              ? <div className="empty-state"><span className="empty-icon">📌</span><p>Aún no tienes citas agendadas</p><button onClick={() => setCurrentPage('agendar')} className="btn-primary">💈 Agendar mi primera cita</button></div>
              : <div className="citas-grid">
                  {citas.map((c: any) => (
                    <div key={c.id} className="cita-card">
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                        <BarberiaLogo logo={c.barberia?.logo} nombre={c.barberia?.nombre || 'B'} size={36} />
                        <h4 style={{ margin:0 }}>{c.barberia?.nombre}</h4>
                      </div>
                      {c.barbero && <p><strong>Profesional:</strong> {c.barbero.nombre}</p>}
                      <p><strong>Servicio:</strong> {c.servicio?.nombre}</p>
                      <p><strong>Fecha:</strong> {c.fecha}</p>
                      <p><strong>Hora:</strong> {c.hora}</p>
                      <span className="badge-agendada">✅ Agendada</span>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}
      </div>
    </div>
  )

  // ============================================================
  // BARBERO
  // ============================================================
  if (loggedIn && userData?.rol==='barbero') {
    const citasHoy = citas.filter((c: any) => c.fecha === new Date().toISOString().split('T')[0])
    return (
      <div className="dashboard-container">
        <nav className="navbar">
          <div className="navbar-left"><div className="navbar-brand"><span>💈</span><h1>CutConnect</h1></div><span className="role-badge">✂️ Barbero</span></div>
          <div className="nav-links">
            <button className={currentPage==='dashboard' ? 'active' : ''} onClick={() => setCurrentPage('dashboard')}>🏠 Inicio</button>
            <button className={currentPage==='citas' ? 'active' : ''} onClick={() => { setCurrentPage('citas'); cargarCitasBarbero() }}>📋 Mis citas</button>
            <button className={currentPage==='perfil' ? 'active' : ''} onClick={() => { setCurrentPage('perfil'); cargarPerfilBarbero() }}>👤 Mi perfil</button>
            <button className="btn-logout" onClick={handleLogout}>Salir</button>
          </div>
        </nav>
        <div className="dashboard-content">
          {currentPage==='dashboard' && (
            <div className="page">
              <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
                <BarberoAvatar foto={perfilBarbero?.foto} nombre={userData?.nombre || 'B'} size={64} />
                <div><h2 style={{ margin:0 }}>¡Hola, {userData?.nombre}! ✂️</h2><p style={{ margin:0, color:'var(--muted)', fontSize:14 }}>{perfilBarbero?.especialidad || 'Profesional'}</p></div>
              </div>
              <div className="stats-grid">
                <div className="stat-card"><span className="stat-icon">📅</span><h4>Citas totales</h4><p className="stat-number">{citas.length}</p></div>
                <div className="stat-card"><span className="stat-icon">☀️</span><h4>Citas hoy</h4><p className="stat-number">{citasHoy.length}</p></div>
                {perfilBarbero?.calificacion_promedio > 0 && <div className="stat-card"><span className="stat-icon">⭐</span><h4>Calificación</h4><p className="stat-number">{Number(perfilBarbero.calificacion_promedio).toFixed(1)}</p></div>}
              </div>
              <div className="action-buttons" style={{ marginTop:20 }}>
                <button onClick={() => { setCurrentPage('citas'); cargarCitasBarbero() }} className="btn-primary">📅 Ver mis citas</button>
                <button onClick={() => { setCurrentPage('perfil'); cargarPerfilBarbero() }} className="btn-secondary">👤 Mi perfil y foto</button>
              </div>
            </div>
          )}

          {currentPage==='perfil' && (
  <div className="page">
    <h2>👤 Mi Perfil</h2>
    {!perfilBarbero
      ? <div className="empty-state"><span className="empty-icon">✂️</span><p>No tienes perfil vinculado. Pídele el código de invitación a tu dueño.</p></div>
      : (
        <div>
          <div className="welcome-card owner" style={{ textAlign:'center', paddingTop:24 }}>
            <BarberoAvatar foto={perfilBarbero.foto} nombre={perfilBarbero.nombre} size={90} />
            <h3 style={{ marginTop:12 }}>{perfilBarbero.nombre}</h3>
            <p style={{ color:'var(--muted)' }}>✂️ {perfilBarbero.especialidad}</p>
            {perfilBarbero.calificacion_promedio > 0 && <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:6, marginTop:4 }}><Estrellas valor={Math.round(perfilBarbero.calificacion_promedio)} /><span style={{ color:'var(--muted)', fontSize:13 }}>{Number(perfilBarbero.calificacion_promedio).toFixed(1)}</span></div>}
          </div>

          {/* FOTO */}
          <div style={{ marginTop:24 }}>
            <h3>📷 Mi foto</h3>
            <ImageUploader tipo="barbero" id={perfilBarbero.id} urlActual={perfilBarbero.foto} label="Toca para subir tu foto"
              onSuccess={(url) => { setPerfilBarbero({ ...perfilBarbero, foto: url }); setUserData({ ...userData, foto: url }) }} />
          </div>

          {/* DATOS EDITABLES */}
          <div style={{ marginTop:24, background:'var(--dark-3)', border:'1px solid var(--dark-5)', borderLeft:'3px solid var(--red)', borderRadius:12, padding:24 }}>
            <h3 style={{ marginTop:0 }}>✏️ Editar mi información</h3>
            <div className="form-group" style={{ marginBottom:12 }}>
              <label>Especialidad</label>
              <input type="text" placeholder="Fades, barba clásica..." value={descripcionBarbero} onChange={e => setDescripcionBarbero(e.target.value)}
                defaultValue={perfilBarbero.especialidad} />
            </div>
            <div className="form-group" style={{ marginBottom:12 }}>
              <label>Descripción</label>
              <textarea placeholder="Cuéntales a tus clientes quién eres..." value={perfilBarbero.descripcion || ''}
                onChange={e => setPerfilBarbero({...perfilBarbero, descripcion: e.target.value})}
                style={{ width:'100%', minHeight:80, background:'var(--dark-2)', border:'1px solid var(--dark-5)', borderRadius:8, padding:10, color:'var(--cream)', fontSize:13, resize:'vertical', boxSizing:'border-box' }} />
            </div>
            <div className="form-group" style={{ marginBottom:12 }}>
              <label>📱 Mi WhatsApp</label>
              <input type="tel" placeholder="+57 300 000 0000" value={perfilBarbero.whatsapp || ''}
                onChange={e => setPerfilBarbero({...perfilBarbero, whatsapp: e.target.value})} />
              <p style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>Para recibir notificaciones de nuevas citas</p>
            </div>
<div className="form-group" style={{ marginBottom:12, marginTop:12 }}>
  <label>🔑 API Key de CallMeBot</label>
  <input 
    type="text" 
    placeholder="Ej: 123456" 
    value={perfilBarbero.apikey_whatsapp || ''}
    onChange={e => setPerfilBarbero({...perfilBarbero, apikey_whatsapp: e.target.value})}
  />
  <p style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>
    Envía "I allow callmebot to send me messages" al +34 644 33 42 61 por WhatsApp para obtener tu apikey
  </p>
</div>
            {/* HORARIO */}
            <div style={{ marginTop:16 }}>
              <p style={{ color:'var(--cream-3)', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>📅 Mi horario</p>
              {DIAS.map(dia => {
                const h = perfilBarbero.horario?.[dia] || { activo: false, inicio: '08:00', fin: '18:00' }
                return (
                  <div key={dia} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10, flexWrap:'wrap' }}>
                    <label style={{ display:'flex', alignItems:'center', gap:6, minWidth:100, cursor:'pointer' }}>
                      <input type="checkbox" checked={h.activo} onChange={e => setPerfilBarbero({...perfilBarbero, horario: {...perfilBarbero.horario, [dia]: {...h, activo: e.target.checked}}})}
                        style={{ width:16, height:16, accentColor:'var(--red)' }} />
                      <span style={{ color:'var(--cream)', fontSize:13, fontWeight:700 }}>{DIAS_LABELS[dia]}</span>
                    </label>
                    {h.activo && <>
                      <input type="time" value={h.inicio} onChange={e => setPerfilBarbero({...perfilBarbero, horario: {...perfilBarbero.horario, [dia]: {...h, inicio: e.target.value}}})}
                        style={{ padding:'6px 10px', fontSize:13, background:'var(--dark-2)', border:'1px solid var(--dark-5)', borderRadius:6, color:'var(--cream)' }} />
                      <span style={{ color:'var(--muted)' }}>a</span>
                      <input type="time" value={h.fin} onChange={e => setPerfilBarbero({...perfilBarbero, horario: {...perfilBarbero.horario, [dia]: {...h, fin: e.target.value}}})}
                        style={{ padding:'6px 10px', fontSize:13, background:'var(--dark-2)', border:'1px solid var(--dark-5)', borderRadius:6, color:'var(--cream)' }} />
                    </>}
                    {!h.activo && <span style={{ color:'var(--muted)', fontSize:12 }}>No trabajo este día</span>}
                  </div>
                )
              })}
            </div>

            <button className="btn-primary" style={{ marginTop:16, width:'100%' }} onClick={async () => {
              try {
                await fetch(`${API}/api/barbero/perfil/${perfilBarbero.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    descripcion: perfilBarbero.descripcion,
                    especialidad: perfilBarbero.especialidad,
                    whatsapp: perfilBarbero.whatsapp,
                    horario: perfilBarbero.horario
                  })
                })
                alert('✅ Perfil actualizado')
              } catch { alert('Error de conexión') }
            }}>
              ✅ Guardar cambios
            </button>
          </div>

          {/* CÓDIGO DE INVITACIÓN */}
          <div style={{ marginTop:24, background:'var(--dark-3)', border:'1px solid var(--dark-5)', borderRadius:12, padding:16 }}>
            <p style={{ color:'var(--muted)', fontSize:12, marginBottom:4 }}>🔑 Código de invitación</p>
            <div style={{ fontSize:28, fontWeight:900, letterSpacing:8, color:'var(--gold)', textAlign:'center', padding:'12px 0' }}>{perfilBarbero.codigo_invitacion || '——'}</div>
            <p style={{ color:'var(--muted)', fontSize:11, textAlign:'center' }}>Comparte con colegas para unirse a tu barbería</p>
          </div>
        </div>
      )
    }
  </div>
)}

  // ============================================================
  // DUEÑO PENDIENTE
  // ============================================================
  if (loggedIn && userData?.rol==='dueño' && userData?.estado_verificacion==='pendiente') return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-left"><div className="navbar-brand"><span>💈</span><h1>CutConnect</h1></div><span className="role-badge pending">⏳ Pendiente</span></div>
        <div className="nav-links"><button className="btn-logout" onClick={handleLogout}>Salir</button></div>
      </nav>
      <div className="dashboard-content">
        <div className="page">
          <h2>⏳ Solicitud en revisión</h2>
          <div className="pending-card">
            <span className="pending-icon">📋</span>
            <h3>Estamos revisando tu negocio</h3>
            <p>Recibirás respuesta en 24–48 horas. Una vez aprobado tendrás <strong>14 días gratis</strong>.</p>
            <div className="pending-info">
              <p>{userData?.tipo_negocio==='peluqueria' ? '💇' : '💈'} <strong>{userData?.negocio_nombre}</strong></p>
              <p>📍 {userData?.ciudad}, {userData?.estado}</p>
              <p>📞 {userData?.negocio_telefono}</p>
              <p>✉️ {userData?.email}</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary">Cerrar sesión</button>
          </div>
        </div>
      </div>
    </div>
  )
// ============================================================
  // DUEÑO — TRIAL VENCIDO (PANTALLA DE PAGO)
  // ============================================================
  if (loggedIn && userData?.rol==='dueño' && userData?.estado_verificacion==='trial') {
    const diasRestantes = userData?.fecha_trial_inicio
      ? Math.max(0, Math.ceil(14 - (Date.now() - new Date(userData.fecha_trial_inicio).getTime()) / (1000*60*60*24)))
      : 14

    if (diasRestantes <= 0) {
      return (
        <div className="dashboard-container">
          <nav className="navbar">
            <div className="navbar-left">
              <div className="navbar-brand"><span>💈</span><h1>CutConnect</h1></div>
              <span className="role-badge" style={{ background:'#E74C3C' }}>⛔ Vencido</span>
            </div>
            <div className="nav-links">
              <button className="btn-logout" onClick={handleLogout}>Salir</button>
            </div>
          </nav>
          <div className="dashboard-content">
            <div className="page">
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <span style={{ fontSize:60 }}>⛔</span>
                <h2 style={{ color:'#E74C3C', marginTop:12 }}>Tu período de prueba ha vencido</h2>
                <p style={{ color:'var(--muted)', maxWidth:400, margin:'0 auto 24px' }}>
                  Para seguir usando CutConnect y que tus clientes puedan ver tu negocio, renueva tu suscripción por <strong style={{ color:'var(--gold)' }}>$12 USD/mes</strong>.
                </p>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:500, margin:'0 auto' }}>

                {/* STRIPE */}
                <div style={{ background:'var(--dark-3)', border:'2px solid #635BFF', borderRadius:16, padding:24 }}>
                  <h3 style={{ margin:'0 0 8px 0', color:'#635BFF' }}>💳 Pagar con tarjeta</h3>
                  <p style={{ color:'var(--muted)', fontSize:13, margin:'0 0 16px 0' }}>Visa, Mastercard, débito — pago seguro con Stripe</p>
                  <button
                    className="btn-primary"
                    style={{ width:'100%', background:'#635BFF', borderColor:'#635BFF', fontSize:16, padding:'14px' }}
                    onClick={async () => {
                      try {
                        const res = await fetch(`${API}/api/pagos/stripe/crear`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ barberia_id: userData?.barberia_id, email: userData?.email })
                        })
                        const data = await res.json()
                        if (data.success) window.location.href = data.url
                        else alert('Error: ' + data.error)
                      } catch { alert('Error de conexión') }
                    }}
                  >
                    💳 Pagar $12 USD ahora
                  </button>
                </div>

                {/* BINANCE */}
                <div style={{ background:'var(--dark-3)', border:'2px solid #F0B90B', borderRadius:16, padding:24 }}>
                  <h3 style={{ margin:'0 0 8px 0', color:'#F0B90B' }}>📱 Pagar con Binance Pay</h3>
                  <p style={{ color:'var(--muted)', fontSize:13, margin:'0 0 16px 0' }}>Envía exactamente <strong style={{ color:'#F0B90B' }}>$12 USDT</strong> escaneando el QR</p>
                  <div style={{ textAlign:'center', marginBottom:16 }}>
                    <img
                      src="https://mypcsegsvarcwyigzodc.supabase.co/storage/v1/object/public/imagenes-cutconnect/QR%20BINANCE.jpeg"
                      alt="QR Binance Pay"
                      style={{ width:180, height:180, borderRadius:12, border:'2px solid #F0B90B' }}
                    />
                  </div>
                  <div style={{ background:'var(--dark-2)', borderRadius:8, padding:12, marginBottom:12 }}>
                    <p style={{ fontSize:12, color:'var(--muted)', margin:'0 0 4px 0' }}>Pay ID</p>
                    <p style={{ fontSize:20, fontWeight:900, letterSpacing:4, color:'#F0B90B', margin:0 }}>176779028</p>
                  </div>
                  <p style={{ fontSize:12, color:'var(--muted)', margin:'0 0 12px 0' }}>
                    Después de pagar, envía el comprobante por WhatsApp para activar tu cuenta:
                  </p>
                  
                    href="https://wa.me/+32455136804?text=Hola%20Kennedy%2C%20acabo%20de%20pagar%20mi%20suscripci%C3%B3n%20de%20CutConnect%20por%20Binance%20Pay.%20Adjunto%20el%20comprobante."
                    target="_blank"
                    rel="noreferrer"
                    style={{ display:'block', background:'#25D366', color:'#fff', textAlign:'center', padding:'12px', borderRadius:8, fontWeight:700, textDecoration:'none', fontSize:14 }}
                  >
                    📲 Enviar comprobante por WhatsApp
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>
      )
    }
  }
  // ============================================================
  // DUEÑO ACTIVO
  // ============================================================
  if (loggedIn && userData?.rol==='dueño' && ['trial','activo','aprobado'].includes(userData?.estado_verificacion)) {
    const diasRestantes = userData?.fecha_trial_inicio ? Math.max(0, Math.ceil(14 - (Date.now() - new Date(userData.fecha_trial_inicio).getTime()) / (1000*60*60*24))) : 14
    const maxCitas = Math.max(...rankingBarberos.map(b => b.total_citas), 1)

    return (
      <div className="dashboard-container">
        <nav className="navbar">
          <div className="navbar-left">
            <div className="navbar-brand"><span>💈</span><h1>CutConnect</h1></div>
            <span className={`role-badge ${userData?.estado_verificacion==='trial' ? 'trial' : ''}`}>{userData?.estado_verificacion==='trial' ? '🟣 Trial' : '👔 Dueño'}</span>
          </div>
          <div className="nav-links">
            <button className={currentPage==='dashboard' ? 'active' : ''} onClick={() => setCurrentPage('dashboard')}>🏠 Panel</button>
            <button className={currentPage==='equipo' ? 'active' : ''} onClick={() => { setCurrentPage('equipo'); cargarMisBarberos() }}>✂️ Equipo</button>
            <button className={currentPage==='citas' ? 'active' : ''} onClick={() => { setCurrentPage('citas'); cargarCitasDueno() }}>📋 Citas</button>
            <button className={currentPage==='negocio' ? 'active' : ''} onClick={() => setCurrentPage('negocio')}>🏪 Mi negocio</button>
            <button className="btn-logout" onClick={handleLogout}>Salir</button>
          </div>
        </nav>

        <div className="dashboard-content">
          {userData?.estado_verificacion==='trial' && (
            <div className="trial-banner"><span>🟣</span><p>Período de prueba. Te quedan <strong>{diasRestantes} días</strong>.</p></div>
          )}

          {currentPage==='dashboard' && (
            <div className="page">
              <h2>{userData?.tipo_negocio==='peluqueria' ? '💇' : '💈'} Panel de Control</h2>
              <div className="welcome-card owner">
                <p><strong>🏪</strong> {userData?.negocio_nombre}</p>
                <p><strong>📍</strong> {userData?.ciudad}, {userData?.estado}</p>
                <p><strong>✉️</strong> {userData?.email}</p>
              </div>
              <div className="stats-grid">
                <div className="stat-card"><span className="stat-icon">📅</span><h4>Citas totales</h4><p className="stat-number">{citas.length}</p></div>
                <div className="stat-card"><span className="stat-icon">✂️</span><h4>Profesionales</h4><p className="stat-number">{misBarberos.length}</p></div>
                <div className="stat-card"><span className="stat-icon">✅</span><h4>Agendadas</h4><p className="stat-number">{citas.filter((c:any) => c.estado==='agendada').length}</p></div>
                {userData?.estado_verificacion==='trial' && <div className="stat-card"><span className="stat-icon">⏱️</span><h4>Días trial</h4><p className="stat-number">{diasRestantes}</p></div>}
              </div>
              {rankingBarberos.length > 0 && (
                <>
                  <h3>🏆 Ranking</h3>
                  <div className="ranking-grid">
                    {rankingBarberos.map((b, i) => (
                      <div key={b.barbero_id} className="ranking-item">
                        <div className={`ranking-pos ${i===0?'gold':i===1?'silver':i===2?'bronze':''}`}>{i+1}</div>
                        <BarberoAvatar foto={b.foto} nombre={b.nombre} size={36} />
                        <div className="ranking-info"><div className="ranking-nombre">{b.nombre}</div><div className="ranking-especialidad">{b.total_citas} citas</div></div>
                        <div className="ranking-bar-container">
                          <div className="ranking-bar"><div className="ranking-bar-fill" style={{ width:`${(b.total_citas/maxCitas)*100}%` }}></div></div>
                          <div className="ranking-citas">{Math.round((b.total_citas/citas.length)*100)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="action-buttons" style={{ marginTop:20 }}>
                <button onClick={() => { setCurrentPage('equipo'); cargarMisBarberos() }} className="btn-primary">✂️ Gestionar equipo</button>
                <button onClick={() => { setCurrentPage('citas'); cargarCitasDueno(); cargarRanking() }} className="btn-secondary">📋 Ver citas</button>
              </div>
            </div>
          )}

          {currentPage==='negocio' && (
            <div className="page">
              <h2>🏪 Mi Negocio</h2>
              <div style={{ marginBottom:24 }}>
                <h3>🖼️ Logo del negocio</h3>
                <p style={{ color:'var(--muted)', fontSize:13, marginBottom:12 }}>Se mostrará a todos los clientes al buscar tu negocio</p>
                <ImageUploader tipo="logo" id={userData?.barberia_id} urlActual={userData?.negocio_logo} label="Toca para subir el logo"
                  onSuccess={(url) => setUserData({ ...userData, negocio_logo: url })} />
              </div>

              <div className="welcome-card owner">
                <p><strong>Nombre:</strong> {userData?.negocio_nombre}</p>
                <p><strong>Tipo:</strong> {userData?.tipo_negocio==='peluqueria' ? '💇 Peluquería' : '💈 Barbería'}</p>
                <p><strong>Ciudad:</strong> {userData?.ciudad}</p>
                <p><strong>Teléfono:</strong> {userData?.negocio_telefono}</p>
              </div>

              {!editNegocio
                ? <button className="btn-primary" style={{ marginTop:16 }} onClick={() => { setEditNegocioData({ nombre: userData?.negocio_nombre||'', descripcion:'', telefono: userData?.negocio_telefono||'', logo: userData?.negocio_logo||'', tipo_negocio: userData?.tipo_negocio||'barberia' }); setEditNegocio(true) }}>✏️ Editar datos</button>
                : (
                  <form onSubmit={handleGuardarNegocio} className="edit-negocio-form" style={{ marginTop:16 }}>
                    <h3 style={{ marginTop:0 }}>✏️ Editar negocio</h3>
                    <div className="form-group" style={{ marginBottom:12 }}><label>Tipo</label>
                      <div className="category-selector">
                        <button type="button" className={`category-btn ${editNegocioData.tipo_negocio==='barberia'?'active':''}`} onClick={() => setEditNegocioData({...editNegocioData, tipo_negocio:'barberia'})}><span className="cat-icon">💈</span>Barbería</button>
                        <button type="button" className={`category-btn ${editNegocioData.tipo_negocio==='peluqueria'?'active':''}`} onClick={() => setEditNegocioData({...editNegocioData, tipo_negocio:'peluqueria'})}><span className="cat-icon">💇</span>Peluquería</button>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom:12 }}><label>Nombre</label><input type="text" value={editNegocioData.nombre} onChange={e => setEditNegocioData({...editNegocioData, nombre: e.target.value})} /></div>
                    <div className="form-group" style={{ marginBottom:12 }}><label>Descripción</label><textarea value={editNegocioData.descripcion} onChange={e => setEditNegocioData({...editNegocioData, descripcion: e.target.value})} /></div>
                    <div className="form-group" style={{ marginBottom:12 }}><label>Teléfono</label><input type="tel" value={editNegocioData.telefono} onChange={e => setEditNegocioData({...editNegocioData, telefono: e.target.value})} /></div>
                    {error && <p className="error">{error}</p>}
                    <div style={{ display:'flex', gap:10, marginTop:16 }}>
                      <button type="submit" className="btn-primary" disabled={loading}>{loading ? '⏳...' : '✅ Guardar'}</button>
                      <button type="button" className="btn-secondary" onClick={() => setEditNegocio(false)}>Cancelar</button>
                    </div>
                  </form>
                )
              }
            </div>
          )}

          {currentPage==='equipo' && (
            <div className="page">
              <h2>✂️ Mi Equipo</h2>
              {!showFormBarbero && <div style={{ marginBottom:20 }}><button className="btn-primary" onClick={() => { resetFormBarbero(); setShowFormBarbero(true) }}>➕ Agregar profesional</button></div>}

              {showFormBarbero && (
                <div style={{ background:'var(--dark-3)', border:'1px solid var(--dark-5)', borderLeft:'3px solid var(--red)', borderRadius:12, padding:24, marginBottom:24 }}>
                  <h3 style={{ marginTop:0 }}>{editandoBarbero ? '✏️ Editar' : '➕ Nuevo profesional'}</h3>
                  <form onSubmit={handleGuardarBarbero} className="form">
                    <div className="form-row">
                      <div className="form-group"><label>Nombre</label><input type="text" placeholder="Ej: Carlos" value={formBarbero.nombre} onChange={e => setFormBarbero({...formBarbero, nombre: e.target.value})} required /></div>
                      <div className="form-group"><label>Especialidad</label><input type="text" placeholder="Fades, barba..." value={formBarbero.especialidad} onChange={e => setFormBarbero({...formBarbero, especialidad: e.target.value})} /></div>
                    </div>
                    <div className="form-group"><label>Descripción (opcional)</label><textarea placeholder="Ej: 5 años de experiencia en fades..." value={formBarbero.descripcion} onChange={e => setFormBarbero({...formBarbero, descripcion: e.target.value})} /></div>
                    <div style={{ marginTop:16 }}>
                      <p style={{ color:'var(--cream-3)', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>📅 Horario</p>
                      {DIAS.map(dia => {
                        const h = (formBarbero.horario as any)[dia]
                        return (
                          <div key={dia} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10, flexWrap:'wrap' }}>
                            <label style={{ display:'flex', alignItems:'center', gap:6, minWidth:100, cursor:'pointer' }}>
                              <input type="checkbox" checked={h.activo} onChange={e => updateHorarioDia(dia, 'activo', e.target.checked)} style={{ width:16, height:16, accentColor:'var(--red)' }} />
                              <span style={{ color:'var(--cream)', fontSize:13, fontWeight:700 }}>{DIAS_LABELS[dia]}</span>
                            </label>
                            {h.activo && <>
                              <div className="form-group" style={{ margin:0 }}><input type="time" value={h.inicio} onChange={e => updateHorarioDia(dia, 'inicio', e.target.value)} style={{ padding:'6px 10px', fontSize:13 }} /></div>
                              <span style={{ color:'var(--muted)' }}>a</span>
                              <div className="form-group" style={{ margin:0 }}><input type="time" value={h.fin} onChange={e => updateHorarioDia(dia, 'fin', e.target.value)} style={{ padding:'6px 10px', fontSize:13 }} /></div>
                            </>}
                            {!h.activo && <span style={{ color:'var(--muted)', fontSize:12 }}>No trabaja</span>}
                          </div>
                        )
                      })}
                    </div>
                    {error && <p className="error">{error}</p>}
                    <div style={{ display:'flex', gap:10 }}>
                      <button type="submit" className="btn-primary" disabled={loading}>{loading ? '⏳...' : editandoBarbero ? '✅ Actualizar' : '✅ Agregar'}</button>
                      <button type="button" className="btn-secondary" onClick={resetFormBarbero}>Cancelar</button>
                    </div>
                  </form>
                </div>
              )}

              {misBarberos.length===0 && !showFormBarbero && (
                <div className="empty-state"><span className="empty-icon">✂️</span><p>Aún no tienes profesionales</p><button className="btn-primary" onClick={() => setShowFormBarbero(true)}>➕ Agregar el primero</button></div>
              )}

              <div className="citas-grid">
                {misBarberos.map((b: any) => (
                  <div key={b.id} className="cita-card">
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                      <BarberoAvatar foto={b.foto} nombre={b.nombre} size={48} />
                      <div>
                        <h4 style={{ margin:0 }}>{b.nombre}</h4>
                        <p style={{ margin:0, fontSize:12 }}>✂️ {b.especialidad}</p>
                        <span style={{ fontSize:11, color: b.usuario_id ? '#2ecc71' : '#f39c12', fontWeight:700 }}>{b.usuario_id ? '🔗 Vinculado' : '⏳ Sin cuenta'}</span>
                      </div>
                    </div>
                    <div style={{ background:'var(--dark-2)', border:'1px solid var(--dark-5)', borderRadius:8, padding:'8px 12px', marginBottom:12, textAlign:'center' }}>
                      <p style={{ fontSize:11, color:'var(--muted)', margin:'0 0 4px 0' }}>Código de invitación</p>
                      <div style={{ fontSize:22, fontWeight:900, letterSpacing:6, color:'var(--gold)' }}>{b.codigo_invitacion}</div>
                      <p style={{ fontSize:10, color:'var(--muted)', margin:'4px 0 0 0' }}>Compartir por WhatsApp 💬</p>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:12 }}>
                      {DIAS.map(dia => { const h = b.horario[dia]; return h?.activo ? <span key={dia} style={{ background:'rgba(192,57,43,0.15)', color:'var(--cream-3)', border:'1px solid rgba(192,57,43,0.3)', borderRadius:4, padding:'2px 6px', fontSize:10, fontWeight:700 }}>{DIAS_LABELS[dia]}</span> : null })}
                    </div>
                    <div className="cita-actions">
                      <button className="btn-confirm" onClick={() => handleEditarBarbero(b)}>✏️ Editar</button>
                      <button className="btn-reject" onClick={() => handleEliminarBarbero(b.id)}>🗑️ Quitar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPage==='citas' && (
            <div className="page">
              <h2>📋 Citas ({citas.length})</h2>
              {citas.length===0 ? <div className="empty-state"><span className="empty-icon">📌</span><p>No hay citas aún</p></div>
                : <div className="citas-grid">
                    {citas.map((c: any) => (
                      <div key={c.id} className="cita-card">
                        <h4>{c.cliente?.nombre || 'Cliente'}</h4>
                        {c.barbero && <p><strong>Profesional:</strong> {c.barbero.nombre}</p>}
                        <p><strong>Servicio:</strong> {c.servicio?.nombre}</p>
                        <p><strong>Fecha:</strong> {c.fecha}</p>
                        <p><strong>Hora:</strong> {c.hora}</p>
                        <p><strong>Tel:</strong> {c.cliente?.telefono || 'N/A'}</p>
                        <span className="badge-agendada">✅ Agendada</span>
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