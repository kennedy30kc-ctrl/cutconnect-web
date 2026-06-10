import { useState, useEffect } from 'react'
import './App.css'

const API = 'https://cutconnect-backend-production.up.railway.app'
const ADMIN_PATH = '/admin'
const DIAS = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']
const DIAS_LABELS: any = { lunes:'Lun', martes:'Mar', miercoles:'Mié', jueves:'Jue', viernes:'Vie', sabado:'Sáb', domingo:'Dom' }

function getInitials(nombre: string) {
  return nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
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

// SPLASH SCREEN
function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3000)
    return () => clearTimeout(timer)
  }, [])

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
    nombre:'', foto:'', especialidad:'',
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

  const isAdminRoute = window.location.pathname === ADMIN_PATH

  useEffect(() => { if (loggedIn) cargarDatos() }, [loggedIn])

  useEffect(() => {
    if (formData.barbero_id && formData.fecha) cargarDisponibilidad(formData.barbero_id, formData.fecha)
    else setHorasDisponibles([])
  }, [formData.barbero_id, formData.fecha])

  // ============================================================
  // DATOS
  // ============================================================
  const cargarDatos = async (lat?: number, lon?: number, ciudad?: string, tipo?: string) => {
    try {
      let url = `${API}/api/barberias`
      const params = []
      if (lat && lon) params.push(`lat=${lat}&lon=${lon}`)
      else if (ciudad) params.push(`ciudad=${encodeURIComponent(ciudad)}`)
      if (tipo && tipo !== 'todos') params.push(`tipo=${tipo}`)
      if (params.length) url += '?' + params.join('&')

      const [resBarb, resServ, resCitas] = await Promise.all([
        fetch(url),
        fetch(`${API}/api/servicios`),
        userData?.rol === 'dueño'
          ? fetch(`${API}/api/citas/barberia/${userData?.barberia_id || userData?.id}`)
          : fetch(`${API}/api/citas/usuario/${userData?.id}`)
      ])
      const dBarb = await resBarb.json()
      const dServ = await resServ.json()
      const dCitas = await resCitas.json()
      setBarberias(dBarb.data || [])
      setServicios(dServ.data || [])
      setCitas(dCitas.data || [])
    } catch (err) { console.error('Error:', err) }
  }

  const cargarCitasDueno = async () => {
    try {
      const res = await fetch(`${API}/api/citas/barberia/${userData?.barberia_id || userData?.id}`)
      const data = await res.json()
      setCitas(data.data || [])
    } catch { setCitas([]) }
  }

  const cargarBarberosBarberia = async (barberiaId: any) => {
    try {
      const res = await fetch(`${API}/api/barberos/${barberiaId}`)
      const data = await res.json()
      setBarberosList(data.data || [])
    } catch { setBarberosList([]) }
  }

  const cargarMisBarberos = async () => {
    try {
      const id = userData?.barberia_id || userData?.id
      const res = await fetch(`${API}/api/barberos/${id}`)
      const data = await res.json()
      setMisBarberos(data.data || [])
    } catch { setMisBarberos([]) }
  }

  const cargarRanking = async () => {
    try {
      const id = userData?.barberia_id || userData?.id
      const res = await fetch(`${API}/api/stats/barberos/${id}`)
      const data = await res.json()
      setRankingBarberos(data.data || [])
    } catch { setRankingBarberos([]) }
  }

  const cargarDisponibilidad = async (barberoId: any, fecha: string) => {
    try {
      const res = await fetch(`${API}/api/disponibilidad/${barberoId}/${fecha}`)
      const data = await res.json()
      setHorasDisponibles(data.data || [])
    } catch { setHorasDisponibles([]) }
  }

  const buscarPorGPS = () => {
    if (!navigator.geolocation) { setError('Tu navegador no soporta geolocalización'); return }
    setBuscando(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGpsUsado(true); setBuscando(false); cargarDatos(pos.coords.latitude, pos.coords.longitude, undefined, tipoNegocioFiltro) },
      () => { setBuscando(false); setError('No se pudo obtener ubicación. Busca por ciudad.') }
    )
  }

  const buscarPorCiudad = () => {
    if (!searchCiudad.trim()) return
    setGpsUsado(false)
    cargarDatos(undefined, undefined, searchCiudad, tipoNegocioFiltro)
  }

  // ============================================================
  // AUTH
  // ============================================================
  const handleLogin = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (data.success) { localStorage.setItem('token', data.token); setUserData(data.user); setLoggedIn(true); setCurrentPage('dashboard'); setEmail(''); setPassword('') }
      else setError(data.error || 'Error al iniciar sesión')
    } catch (err: any) { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  const handleRegister = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password, nombre: email.split('@')[0], telefono:'', rol, pais: paisSeleccionado }) })
      const data = await res.json()
      if (data.success) { localStorage.setItem('token', data.token); setUserData(data.user); setLoggedIn(true); setCurrentPage('dashboard'); setEmail(''); setPassword('') }
      else setError(data.error || 'Error al registrarse')
    } catch (err: any) { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  const handleRegisterDueno = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password, nombre: email.split('@')[0], telefono:'', rol:'dueño', ...ownerData }) })
      const data = await res.json()
      if (data.success) { localStorage.setItem('token', data.token); setUserData(data.user); setLoggedIn(true); setCurrentPage('dashboard'); setEmail(''); setPassword('') }
      else setError(data.error || 'Error al registrarse')
    } catch (err: any) { setError('Error de conexión') }
    finally { setLoading(false) }
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
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
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
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  const handleGuardarNegocio = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const id = userData?.barberia_id || userData?.id
      const res = await fetch(`${API}/api/barberias/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(editNegocioData) })
      const data = await res.json()
      if (data.success) { setEditNegocio(false); alert('✅ Negocio actualizado') }
      else setError(data.error || 'Error')
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem('token'); setLoggedIn(false); setEmail(''); setPassword('')
    setRol('cliente'); setUserData(null); setCurrentPage('dashboard'); setAuthMode('choice')
  }

  // ============================================================
  // BARBEROS
  // ============================================================
  const resetFormBarbero = () => {
    setFormBarbero({ nombre:'', foto:'', especialidad:'', horario: { lunes:{activo:true,inicio:'08:00',fin:'18:00'}, martes:{activo:true,inicio:'08:00',fin:'18:00'}, miercoles:{activo:true,inicio:'08:00',fin:'18:00'}, jueves:{activo:true,inicio:'08:00',fin:'18:00'}, viernes:{activo:true,inicio:'08:00',fin:'18:00'}, sabado:{activo:true,inicio:'08:00',fin:'14:00'}, domingo:{activo:false,inicio:'',fin:''} } })
    setEditandoBarbero(null); setShowFormBarbero(false)
  }

  const handleGuardarBarbero = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const id = userData?.barberia_id || userData?.id
      let res
      if (editandoBarbero) {
        res = await fetch(`${API}/api/barberos/${editandoBarbero.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(formBarbero) })
      } else {
        res = await fetch(`${API}/api/barberos`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...formBarbero, barberia_id: id }) })
      }
      const data = await res.json()
      if (data.success) { resetFormBarbero(); cargarMisBarberos() }
      else setError(data.error || 'Error al guardar')
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  const handleEditarBarbero = (b: any) => {
    setEditandoBarbero(b)
    setFormBarbero({ nombre: b.nombre, foto: b.foto || '', especialidad: b.especialidad, horario: b.horario })
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

  // ============================================================
  // ADMIN
  // ============================================================
  const handleAdminLogin = async (e: any) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/admin/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password: adminPassword }) })
      const data = await res.json()
      if (data.success) { setAdminLoggedIn(true); cargarAdminData() }
      else setError('Contraseña incorrecta')
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
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

  const accionAdmin = async (endpoint: string, id: number, body?: any) => {
    try {
      const res = await fetch(`${API}/api/admin/${endpoint}/${id}`, { method:'POST', headers:{'Content-Type':'application/json','x-admin-token':'admin_token_cutconnect'}, body: body ? JSON.stringify(body) : undefined })
      const data = await res.json()
      setAdminMsg(data.message || data.error)
      cargarAdminData()
    } catch { setAdminMsg('Error al ejecutar acción') }
    setTimeout(() => setAdminMsg(''), 4000)
  }

  // ============================================================
  // SPLASH
  // ============================================================
  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />

  // ============================================================
  // ADMIN
  // ============================================================
  if (isAdminRoute) {
    if (!adminLoggedIn) {
      return (
        <div className="login-container">
          <div className="login-box">
            <div className="logo-section">
              <span className="logo-emoji">🔐</span>
              <h1>Cut<span>Connect</span></h1>
              <p className="subtitle">Panel Administrador</p>
            </div>
            <form onSubmit={handleAdminLogin} className="auth-form">
              <div className="form-group">
                <label>Contraseña de administrador</label>
                <input type="password" placeholder="••••••••" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required />
              </div>
              {error && <p className="error">{error}</p>}
              <button type="submit" className="btn-submit" disabled={loading}>{loading ? '⏳ Verificando...' : '🔓 Entrar al Panel'}</button>
            </form>
          </div>
        </div>
      )
    }

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
                {n.estado_verificacion==='pendiente' && <>
                  <button className="btn-admin btn-aprobar" onClick={() => accionAdmin('aprobar', n.id)}>✅ Aprobar</button>
                  <button className="btn-admin btn-rechazar" onClick={() => accionAdmin('rechazar', n.id)}>❌ Rechazar</button>
                </>}
                {(n.estado_verificacion==='trial' || n.estado_verificacion==='suspendido') && <button className="btn-admin btn-activar" onClick={() => accionAdmin('activar', n.id)}>⭐ Activar</button>}
                {(n.estado_verificacion==='activo' || n.estado_verificacion==='trial') && <button className="btn-admin btn-suspender" onClick={() => accionAdmin('suspender', n.id)}>⏸ Suspender</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ============================================================
  // CHOICE
  // ============================================================
  if (!loggedIn && authMode==='choice') {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="logo-section">
            <span className="logo-emoji">💈</span>
            <h1>Cut<span>Connect</span></h1>
            <p className="subtitle">Colombia 🇨🇴 · Venezuela 🇻🇪</p>
          </div>
          <div className="auth-choice">
            <button className="btn-login-choice" onClick={() => setAuthMode('login')}>🔓<br/>INICIAR SESIÓN</button>
            <button className="btn-register-choice" onClick={() => setAuthMode('register')}>✏️<br/>REGISTRARSE</button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // LOGIN
  // ============================================================
  if (!loggedIn && authMode==='login') {
    return (
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
  }

  // ============================================================
  // REGISTRO DUEÑO
  // ============================================================
  if (!loggedIn && authMode==='register' && rol==='dueño') {
    return (
      <div className="login-container">
        <div className="login-box large-box">
          <div className="logo-section"><span className="logo-emoji">💈</span><h1>Cut<span>Connect</span></h1></div>
          <p className="form-subtitle">Registrar mi negocio</p>
          <form onSubmit={handleRegisterDueno} className="owner-form">

            <fieldset className="form-section">
              <legend>🌎 ¿En qué país está tu negocio?</legend>
              <div className="pais-selector">
                <button type="button" className={`pais-btn ${ownerData.pais==='Colombia' ? 'active' : ''}`} onClick={() => setOwnerData({...ownerData, pais:'Colombia'})}>🇨🇴 Colombia</button>
                <button type="button" className={`pais-btn ${ownerData.pais==='Venezuela' ? 'active' : ''}`} onClick={() => setOwnerData({...ownerData, pais:'Venezuela'})}>🇻🇪 Venezuela</button>
              </div>
            </fieldset>

            <fieldset className="form-section">
              <legend>💈 ¿Qué tipo de negocio tienes?</legend>
              <div className="category-selector">
                <button type="button" className={`category-btn ${ownerData.tipo_negocio==='barberia' ? 'active' : ''}`} onClick={() => setOwnerData({...ownerData, tipo_negocio:'barberia'})}>
                  <span className="cat-icon">💈</span>Barbería
                </button>
                <button type="button" className={`category-btn ${ownerData.tipo_negocio==='peluqueria' ? 'active' : ''}`} onClick={() => setOwnerData({...ownerData, tipo_negocio:'peluqueria'})}>
                  <span className="cat-icon">💇</span>Peluquería
                </button>
              </div>
            </fieldset>

            <fieldset className="form-section">
              <legend>👤 Acceso</legend>
              <div className="form-group"><label>Email</label><input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
              <div className="form-group"><label>Contraseña</label><input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            </fieldset>

            <fieldset className="form-section">
              <legend>🏪 Datos del negocio</legend>
              <div className="form-group"><label>Nombre del negocio</label><input type="text" placeholder="Ej: Barbería El Rey" value={ownerData.negocio_nombre} onChange={e => setOwnerData({...ownerData, negocio_nombre: e.target.value})} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Departamento / Estado</label><input type="text" placeholder="Antioquia" value={ownerData.estado} onChange={e => setOwnerData({...ownerData, estado: e.target.value})} required /></div>
                <div className="form-group"><label>Ciudad</label><input type="text" placeholder="Medellín" value={ownerData.ciudad} onChange={e => setOwnerData({...ownerData, ciudad: e.target.value})} required /></div>
              </div>
              <div className="form-group"><label>Dirección completa</label><input type="text" placeholder="Calle 50 #30-15" value={ownerData.direccion} onChange={e => setOwnerData({...ownerData, direccion: e.target.value})} required /></div>
              <div className="form-group"><label>Teléfono</label><input type="tel" placeholder="+57 300 000 0000" value={ownerData.negocio_telefono} onChange={e => setOwnerData({...ownerData, negocio_telefono: e.target.value})} required /></div>
              <div className="form-group"><label>Descripción</label><textarea placeholder="Cuéntanos sobre tu negocio..." value={ownerData.negocio_descripcion} onChange={e => setOwnerData({...ownerData, negocio_descripcion: e.target.value})} /></div>
              <div className="form-group"><label>URL del logo (opcional)</label><input type="url" placeholder="https://..." value={ownerData.negocio_logo} onChange={e => setOwnerData({...ownerData, negocio_logo: e.target.value})} /></div>
            </fieldset>

            <fieldset className="form-section">
              <legend>📍 Ubicación GPS</legend>
              <button type="button" onClick={obtenerUbicacion} className="btn-gps">📍 Obtener mi ubicación GPS</button>
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
  }

  // ============================================================
  // REGISTRO CLIENTE / BARBERO
  // ============================================================
  if (!loggedIn && authMode==='register' && rol!=='dueño') {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="logo-section"><span className="logo-emoji">💈</span><h1>Cut<span>Connect</span></h1></div>
          <p className="form-subtitle">Crear cuenta</p>
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>¿En qué país estás?</label>
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
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-submit" disabled={loading}>{loading ? '⏳ Registrando...' : '✏️ Crear cuenta'}</button>
          </form>
          <button className="link-btn" onClick={() => setAuthMode('choice')}>← Volver</button>
        </div>
      </div>
    )
  }

  // ============================================================
  // RECOVERY
  // ============================================================
  if (!loggedIn && authMode==='recovery') {
    return (
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
  }

  // ============================================================
  // DASHBOARD CLIENTE
  // ============================================================
  if (loggedIn && userData?.rol==='cliente') {
    return (
      <div className="dashboard-container">
        <nav className="navbar">
          <div className="navbar-left">
            <div className="navbar-brand"><span>💈</span><h1>CutConnect</h1></div>
            <span className="role-badge">👤 Cliente</span>
          </div>
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
                <p><strong>País:</strong> {userData?.pais || 'No especificado'}</p>
                <p><strong>Email:</strong> {userData?.email}</p>
                <p><strong>Citas agendadas:</strong> {citas.length}</p>
              </div>
              <h3>¿Qué quieres hacer?</h3>
              <div className="action-buttons">
                <button onClick={() => { setCurrentPage('agendar'); cargarDatos() }} className="btn-primary">💈 Agendar cita</button>
                <button onClick={() => { setCurrentPage('citas'); cargarDatos() }} className="btn-secondary">📋 Ver mis citas</button>
              </div>
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
                      {t==='todos' && '🔍 Todos'}
                      {t==='barberia' && '💈 Barberías'}
                      {t==='peluqueria' && '💇 Peluquerías'}
                    </button>
                  ))}
                </div>
                <button className="btn-gps" onClick={buscarPorGPS} disabled={buscando}>
                  {buscando ? '⏳ Buscando...' : '📍 Cerca de mí (GPS)'}
                </button>
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
                        <div className="barberia-card-header">
                          <BarberiaLogo logo={b.logo} nombre={b.nombre} size={52} />
                          <div className="barberia-info">
                            <div className="barberia-nombre">{b.nombre}</div>
                            <div className="barberia-ciudad">📍 {b.ciudad}</div>
                            {b.distancia!==undefined && <div className="barberia-distancia">🛣️ {b.distancia.toFixed(1)} km</div>}
                          </div>
                          <span className="tipo-badge">{b.tipo_negocio==='peluqueria' ? '💇' : '💈'}</span>
                        </div>
                        <div className="barberia-card-body">
                          {b.descripcion && <p className="barberia-descripcion">{b.descripcion}</p>}
                          {b.telefono && <p className="barberia-tel">📞 {b.telefono}</p>}
                          <button className={`btn-elegir ${selectedBarberia?.id===b.id ? 'selected' : ''}`} onClick={() => { setSelectedBarberia(b); setSelectedBarbero(null); setBarberosList([]); setFormData({...formData, barberia_id: b.id, barbero_id:'', hora:''}); cargarBarberosBarberia(b.id) }}>
                            {selectedBarberia?.id===b.id ? '✅ Seleccionada' : 'Elegir'}
                          </button>
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
                  {barberosList.length === 0 ? (
                    <div className="empty-state" style={{ padding:'20px 0' }}>
                      <span className="empty-icon">✂️</span>
                      <p>Este negocio aún no tiene profesionales registrados</p>
                    </div>
                  ) : (
                    <div className="barberias-grid">
                      {barberosList.map((b: any) => (
                        <div key={b.id} className={`barberia-card ${selectedBarbero?.id===b.id ? 'selected' : ''}`}>
                          <div className="barberia-card-header">
                            <BarberoAvatar foto={b.foto} nombre={b.nombre} size={52} />
                            <div className="barberia-info">
                              <div className="barberia-nombre">{b.nombre}</div>
                              <div className="barberia-ciudad">✂️ {b.especialidad}</div>
                            </div>
                          </div>
                          <div className="barberia-card-body">
                            <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
                              {DIAS.map(dia => { const h = b.horario[dia]; return h?.activo ? <span key={dia} style={{ background:'rgba(192,57,43,0.15)', color:'#E8D5B7', border:'1px solid rgba(192,57,43,0.3)', borderRadius:4, padding:'2px 6px', fontSize:10, fontWeight:700 }}>{DIAS_LABELS[dia]}</span> : null })}
                            </div>
                            <button className={`btn-elegir ${selectedBarbero?.id===b.id ? 'selected' : ''}`} onClick={() => { setSelectedBarbero(b); setFormData({...formData, barbero_id: b.id, hora:''}) }}>
                              {selectedBarbero?.id===b.id ? '✅ Seleccionado' : 'Elegir'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {selectedBarbero && (
                <>
                  <h3>📅 Detalles de tu cita con {selectedBarbero.nombre}</h3>
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
                        {horasDisponibles.length === 0 ? (
                          <p style={{ color:'#E74C3C', fontSize:14 }}>❌ No hay horas disponibles ese día</p>
                        ) : (
                          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:4 }}>
                            {horasDisponibles.map(h => (
                              <button key={h} type="button" onClick={() => setFormData({...formData, hora: h})} style={{ padding:'8px 14px', borderRadius:8, border:'1px solid', borderColor: formData.hora===h ? 'var(--red)' : 'var(--dark-5)', background: formData.hora===h ? 'var(--red)' : 'var(--dark-3)', color:'var(--cream)', fontWeight:700, cursor:'pointer', fontSize:13 }}>{h}</button>
                            ))}
                          </div>
                        )}
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
              {citas.length===0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📌</span>
                  <p>Aún no tienes citas agendadas</p>
                  <button onClick={() => setCurrentPage('agendar')} className="btn-primary">💈 Agendar mi primera cita</button>
                </div>
              ) : (
                <div className="citas-grid">
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
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================
  // DASHBOARD BARBERO
  // ============================================================
  if (loggedIn && userData?.rol==='barbero') {
    return (
      <div className="dashboard-container">
        <nav className="navbar">
          <div className="navbar-left">
            <div className="navbar-brand"><span>💈</span><h1>CutConnect</h1></div>
            <span className="role-badge">✂️ Barbero</span>
          </div>
          <div className="nav-links">
            <button className={currentPage==='dashboard' ? 'active' : ''} onClick={() => setCurrentPage('dashboard')}>🏠 Inicio</button>
            <button className={currentPage==='citas' ? 'active' : ''} onClick={() => { setCurrentPage('citas'); cargarDatos() }}>📋 Mis citas</button>
            <button className="btn-logout" onClick={handleLogout}>Salir</button>
          </div>
        </nav>
        <div className="dashboard-content">
          {currentPage==='dashboard' && (
            <div className="page">
              <h2>¡Hola, {userData?.nombre}! ✂️</h2>
              <div className="welcome-card">
                <p><strong>Email:</strong> {userData?.email}</p>
                <p><strong>Citas de hoy:</strong> {citas.filter((c: any) => c.fecha===new Date().toISOString().split('T')[0]).length}</p>
              </div>
              <div className="action-buttons">
                <button onClick={() => { setCurrentPage('citas'); cargarDatos() }} className="btn-primary">📅 Ver mis citas</button>
              </div>
            </div>
          )}
          {currentPage==='citas' && (
            <div className="page">
              <h2>Citas asignadas ({citas.length})</h2>
              {citas.length===0 ? <div className="empty-state"><span className="empty-icon">📌</span><p>No hay citas</p></div> : (
                <div className="citas-grid">
                  {citas.map((c: any) => (
                    <div key={c.id} className="cita-card">
                      <h4>Cita #{c.id}</h4>
                      <p><strong>Servicio:</strong> {c.servicio?.nombre}</p>
                      <p><strong>Fecha:</strong> {c.fecha}</p>
                      <p><strong>Hora:</strong> {c.hora}</p>
                      <div className="cita-actions">
                        <button className="btn-confirm">✅ Confirmar</button>
                        <button className="btn-reject">❌ Rechazar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================
  // DUEÑO — PENDIENTE
  // ============================================================
  if (loggedIn && userData?.rol==='dueño' && userData?.estado_verificacion==='pendiente') {
    return (
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
                <h4>Datos registrados</h4>
                <p>{userData?.tipo_negocio==='peluqueria' ? '💇' : '💈'} <strong>Negocio:</strong> {userData?.negocio_nombre}</p>
                <p>📍 <strong>Ubicación:</strong> {userData?.ciudad}, {userData?.estado}</p>
                <p>📞 <strong>Teléfono:</strong> {userData?.negocio_telefono}</p>
                <p>✉️ <strong>Email:</strong> {userData?.email}</p>
              </div>
              <button onClick={handleLogout} className="btn-secondary">Cerrar sesión</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // DUEÑO — ACTIVO / TRIAL
  // ============================================================
  if (loggedIn && userData?.rol==='dueño' && ['trial','activo','aprobado'].includes(userData?.estado_verificacion)) {
    const diasRestantes = userData?.fecha_trial_inicio
      ? Math.max(0, Math.ceil(14 - (Date.now() - new Date(userData.fecha_trial_inicio).getTime()) / (1000*60*60*24)))
      : 14
    const maxCitas = Math.max(...rankingBarberos.map(b => b.total_citas), 1)

    return (
      <div className="dashboard-container">
        <nav className="navbar">
          <div className="navbar-left">
            <div className="navbar-brand"><span>💈</span><h1>CutConnect</h1></div>
            <span className={`role-badge ${userData?.estado_verificacion==='trial' ? 'trial' : ''}`}>
              {userData?.estado_verificacion==='trial' ? '🟣 Trial' : '👔 Dueño'}
            </span>
          </div>
          <div className="nav-links">
            <button className={currentPage==='dashboard' ? 'active' : ''} onClick={() => setCurrentPage('dashboard')}>🏠 Panel</button>
            <button className={currentPage==='equipo' ? 'active' : ''} onClick={() => { setCurrentPage('equipo'); cargarMisBarberos() }}>✂️ Equipo</button>
            <button className={currentPage==='citas' ? 'active' : ''} onClick={() => { setCurrentPage('citas'); cargarCitasDueno() }}>📋 Citas</button>
            <button className={currentPage==='negocio' ? 'active' : ''} onClick={() => { setCurrentPage('negocio') }}>🏪 Mi negocio</button>
            <button className="btn-logout" onClick={handleLogout}>Salir</button>
          </div>
        </nav>

        <div className="dashboard-content">
          {userData?.estado_verificacion==='trial' && (
            <div className="trial-banner">
              <span>🟣</span>
              <p>Período de prueba. Te quedan <strong>{diasRestantes} días</strong>. Contáctanos para activar tu suscripción.</p>
            </div>
          )}

          {currentPage==='dashboard' && (
            <div className="page">
              <h2>{userData?.tipo_negocio==='peluqueria' ? '💇' : '💈'} Panel de Control</h2>
              <div className="welcome-card owner">
                <p><strong>🏪 Negocio:</strong> {userData?.negocio_nombre}</p>
                <p><strong>📍 Ubicación:</strong> {userData?.ciudad}, {userData?.estado}</p>
                <p><strong>✉️ Email:</strong> {userData?.email}</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card"><span className="stat-icon">📅</span><h4>Citas totales</h4><p className="stat-number">{citas.length}</p></div>
                <div className="stat-card"><span className="stat-icon">✂️</span><h4>Profesionales</h4><p className="stat-number">{misBarberos.length}</p></div>
                <div className="stat-card"><span className="stat-icon">✅</span><h4>Confirmadas</h4><p className="stat-number">{citas.filter((c:any) => c.estado==='agendada').length}</p></div>
                {userData?.estado_verificacion==='trial' && <div className="stat-card"><span className="stat-icon">⏱️</span><h4>Días trial</h4><p className="stat-number">{diasRestantes}</p></div>}
              </div>

              {rankingBarberos.length > 0 && (
                <>
                  <h3>🏆 Ranking de profesionales</h3>
                  <div className="ranking-grid">
                    {rankingBarberos.map((b, i) => (
                      <div key={b.barbero_id} className="ranking-item">
                        <div className={`ranking-pos ${i===0 ? 'gold' : i===1 ? 'silver' : i===2 ? 'bronze' : ''}`}>{i+1}</div>
                        <BarberoAvatar foto={b.foto} nombre={b.nombre} size={36} />
                        <div className="ranking-info">
                          <div className="ranking-nombre">{b.nombre}</div>
                          <div className="ranking-especialidad">{b.total_citas} citas</div>
                        </div>
                        <div className="ranking-bar-container">
                          <div className="ranking-bar"><div className="ranking-bar-fill" style={{ width: `${(b.total_citas / maxCitas) * 100}%` }}></div></div>
                          <div className="ranking-citas">{Math.round((b.total_citas / citas.length) * 100)}%</div>
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
              <div className="welcome-card owner">
                <p><strong>Nombre:</strong> {userData?.negocio_nombre}</p>
                <p><strong>Tipo:</strong> {userData?.tipo_negocio==='peluqueria' ? '💇 Peluquería' : '💈 Barbería'}</p>
                <p><strong>Ciudad:</strong> {userData?.ciudad}</p>
                <p><strong>Teléfono:</strong> {userData?.negocio_telefono}</p>
              </div>

              {!editNegocio ? (
                <button className="btn-primary" style={{ marginTop:16 }} onClick={() => { setEditNegocioData({ nombre: userData?.negocio_nombre || '', descripcion:'', telefono: userData?.negocio_telefono || '', logo: userData?.negocio_logo || '', tipo_negocio: userData?.tipo_negocio || 'barberia' }); setEditNegocio(true) }}>
                  ✏️ Editar datos del negocio
                </button>
              ) : (
                <form onSubmit={handleGuardarNegocio} className="edit-negocio-form">
                  <h3 style={{ marginTop:0 }}>✏️ Editar negocio</h3>
                  <div className="form-group" style={{ marginBottom:12 }}><label>Tipo de negocio</label>
                    <div className="category-selector">
                      <button type="button" className={`category-btn ${editNegocioData.tipo_negocio==='barberia' ? 'active' : ''}`} onClick={() => setEditNegocioData({...editNegocioData, tipo_negocio:'barberia'})}><span className="cat-icon">💈</span>Barbería</button>
                      <button type="button" className={`category-btn ${editNegocioData.tipo_negocio==='peluqueria' ? 'active' : ''}`} onClick={() => setEditNegocioData({...editNegocioData, tipo_negocio:'peluqueria'})}><span className="cat-icon">💇</span>Peluquería</button>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom:12 }}><label>Nombre</label><input type="text" value={editNegocioData.nombre} onChange={e => setEditNegocioData({...editNegocioData, nombre: e.target.value})} /></div>
                  <div className="form-group" style={{ marginBottom:12 }}><label>Descripción</label><textarea value={editNegocioData.descripcion} onChange={e => setEditNegocioData({...editNegocioData, descripcion: e.target.value})} /></div>
                  <div className="form-group" style={{ marginBottom:12 }}><label>Teléfono</label><input type="tel" value={editNegocioData.telefono} onChange={e => setEditNegocioData({...editNegocioData, telefono: e.target.value})} /></div>
                  <div className="form-group" style={{ marginBottom:12 }}><label>URL del logo</label><input type="url" placeholder="https://..." value={editNegocioData.logo} onChange={e => setEditNegocioData({...editNegocioData, logo: e.target.value})} /></div>
                  {error && <p className="error">{error}</p>}
                  <div style={{ display:'flex', gap:10, marginTop:16 }}>
                    <button type="submit" className="btn-primary" disabled={loading}>{loading ? '⏳...' : '✅ Guardar cambios'}</button>
                    <button type="button" className="btn-secondary" onClick={() => setEditNegocio(false)}>Cancelar</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {currentPage==='equipo' && (
            <div className="page">
              <h2>✂️ Mi Equipo</h2>
              {!showFormBarbero && <div style={{ marginBottom:20 }}><button className="btn-primary" onClick={() => { resetFormBarbero(); setShowFormBarbero(true) }}>➕ Agregar profesional</button></div>}

              {showFormBarbero && (
                <div style={{ background:'var(--dark-3)', border:'1px solid var(--dark-5)', borderLeft:'3px solid var(--red)', borderRadius:12, padding:24, marginBottom:24 }}>
                  <h3 style={{ marginTop:0 }}>{editandoBarbero ? '✏️ Editar profesional' : '➕ Nuevo profesional'}</h3>
                  <form onSubmit={handleGuardarBarbero} className="form">
                    <div className="form-row">
                      <div className="form-group"><label>Nombre visible</label><input type="text" placeholder="Ej: Chepe, Carlos" value={formBarbero.nombre} onChange={e => setFormBarbero({...formBarbero, nombre: e.target.value})} required /></div>
                      <div className="form-group"><label>Especialidad</label><input type="text" placeholder="Fades, barba clásica..." value={formBarbero.especialidad} onChange={e => setFormBarbero({...formBarbero, especialidad: e.target.value})} /></div>
                    </div>
                    <div className="form-group"><label>Foto URL (opcional)</label><input type="url" placeholder="https://..." value={formBarbero.foto} onChange={e => setFormBarbero({...formBarbero, foto: e.target.value})} /></div>
                    <div style={{ marginTop:16 }}>
                      <p style={{ color:'var(--cream-3)', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>📅 Horario de trabajo</p>
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
                <div className="empty-state">
                  <span className="empty-icon">✂️</span>
                  <p>Aún no tienes profesionales en tu equipo</p>
                  <button className="btn-primary" onClick={() => setShowFormBarbero(true)}>➕ Agregar el primero</button>
                </div>
              )}

              <div className="citas-grid">
                {misBarberos.map((b: any) => (
                  <div key={b.id} className="cita-card">
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                      <BarberoAvatar foto={b.foto} nombre={b.nombre} size={48} />
                      <div><h4 style={{ margin:0 }}>{b.nombre}</h4><p style={{ margin:0, fontSize:12 }}>✂️ {b.especialidad}</p></div>
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
              <h2>📋 Citas del negocio ({citas.length})</h2>
              {citas.length===0 ? <div className="empty-state"><span className="empty-icon">📌</span><p>No hay citas aún</p></div> : (
                <div className="citas-grid">
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
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default App