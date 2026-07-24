// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import './App.css'

const API = 'https://cutconnect-backend-production.up.railway.app'
const SB_URL = 'https://mypcsegsvarcwyigzodc.supabase.co'
const SB_KEY = 'sb_publishable_su1RyR6QAGMUNqU_OG5Anw__xkiIM7p'
const sbH = { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' }
const ADMIN_PATH = '/admin'
const PUBLICIDAD_PATH = '/publicidad'
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

const AD_BANNER_DEFAULT = [{
  titulo: 'Publícate aquí',
  subtitulo: 'Llega a miles de clientes en tu ciudad - $3.99/mes',
  imagen_url: 'https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=800&q=80',
  boton_texto: 'Publicitar mi negocio',
  boton_url: '/publicidad',
  es_default: true
}]

function getInitials(nombre: string) {
  return nombre.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
}

const TIPO_INFO: Record<string,{label:string,emoji:string}> = {
  barberia:{label:'Barbería',emoji:'✂️'},
  peluqueria:{label:'Peluquería',emoji:'💇'},
  spa:{label:'Spa',emoji:'🧖'},
  gimnasio:{label:'Gimnasio',emoji:'🏋️'},
  manicurista:{label:'Manicure & Pedicure',emoji:'💅'},
  estetica:{label:'Estética',emoji:'💄'},
  masajes:{label:'Masajes',emoji:'💆'},
  tatuajes:{label:'Tatuajes & Piercing',emoji:'🎨'},
  cejas:{label:'Cejas & Depilación',emoji:'👁️'},
  veterinaria:{label:'Peluquería Canina',emoji:'🐾'},
}
const getTipoLabel = (t:string) => TIPO_INFO[t]?.label || t
const getTipoEmoji = (t:string) => TIPO_INFO[t]?.emoji || '🏪'

function PasswordInput({ value, onChange, placeholder, required, className }: any) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position:'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder || '••••••••'}
        required={required}
        className={className}
        style={{ paddingRight:44 }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18, lineHeight:1, color:'#555', padding:4 }}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  )
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
          <p style={{ color:'#C9A84C', fontWeight:700, fontSize:14 }}>Premio disponible - muestra esta pantalla en tu visita</p>
        </div>
      )}
    </div>
  )
}

function AdBanner({ banners }: { banners: any[] }) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => setIndex(i => (i+1) % banners.length), 3000)
    return () => clearInterval(interval)
  }, [banners.length])
  if (!banners.length) return null
  const banner = banners[index]
  const handleClick = () => {
    if (banner.es_default) { window.location.href = PUBLICIDAD_PATH; return }
    if (banner.boton_url && banner.boton_url !== '#') window.open(banner.boton_url, '_blank')
  }
  return (
    <div style={{ position:'relative', borderRadius:16, overflow:'hidden', cursor:'pointer', marginTop:8 }} onClick={handleClick}>
      <div style={{ position:'absolute', inset:0, backgroundImage:`url(${banner.imagen_url})`, backgroundSize:'cover', backgroundPosition:'center', transition:'transform 0.4s ease', transform:'scale(1.02)' }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.6) 100%)' }} />
      <div style={{ position:'relative', padding:'22px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, minHeight:110 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:9, color:'#C9A84C', textTransform:'uppercase', letterSpacing:3, fontWeight:700, marginBottom:6 }}>{banner.es_default ? '📢 Espacio publicitario disponible' : '⭐ Publicidad'}</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff', marginBottom:4, lineHeight:1.3, textShadow:'0 2px 8px rgba(0,0,0,0.5)' }}>{banner.titulo}</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)', lineHeight:1.4 }}>{banner.subtitulo}</div>
        </div>
        <button style={{ flexShrink:0, background:'#C9A84C', color:'#000', border:'none', borderRadius:10, padding:'10px 18px', fontSize:12, fontWeight:800, cursor:'pointer', textTransform:'uppercase', letterSpacing:1, whiteSpace:'nowrap', boxShadow:'0 4px 15px rgba(201,168,76,0.4)' }} onClick={e=>{e.stopPropagation();handleClick()}}>{banner.boton_texto}</button>
      </div>
      {banners.length > 1 && (
        <div style={{ position:'absolute', bottom:10, right:14, display:'flex', gap:5 }}>
          {banners.map((_,i) => (
            <div key={i} onClick={e=>{e.stopPropagation();setIndex(i)}} style={{ width:7, height:7, borderRadius:'50%', background: i===index ? '#C9A84C' : 'rgba(255,255,255,0.4)', cursor:'pointer', transition:'background 0.3s', boxShadow: i===index?'0 0 6px rgba(201,168,76,0.8)':'' }} />
          ))}
        </div>
      )}
    </div>
  )
}

function AnimatedNumber({ value, prefix = '', decimals = 0 }: { value: number, prefix?: string, decimals?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!value) return
    let start = 0
    const duration = 1200; const step = 16
    const increment = value / (duration / step)
    const timer = setInterval(() => {
      start += increment
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(start)
    }, step)
    return () => clearInterval(timer)
  }, [value])
  return <span>{prefix}{decimals > 0 ? display.toFixed(decimals) : Math.floor(display).toLocaleString()}</span>
}

function BarChart({ data, colorKey }: { data: any[], colorKey: string }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])
  const max = Math.max(...data.map(d => d[colorKey]), 1)
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:80, marginTop:8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <div style={{ width:'100%', background:'rgba(255,255,255,0.04)', borderRadius:6, height:64, display:'flex', alignItems:'flex-end', overflow:'hidden' }}>
            <div style={{ width:'100%', background: colorKey==='ingresos' ? 'linear-gradient(to top,#C9A84C,#FFD700)' : 'linear-gradient(to top,#00D4FF,#0099CC)', borderRadius:6, height: visible ? `${(d[colorKey]/max)*100}%` : '0%', transition:`height ${0.4 + i*0.07}s cubic-bezier(0.34,1.56,0.64,1)`, boxShadow: colorKey==='ingresos' ? '0 0 8px rgba(201,168,76,0.5)' : '0 0 8px rgba(0,212,255,0.5)' }} />
          </div>
          <p style={{ fontSize:9, color:'#555', textTransform:'uppercase', letterSpacing:0.5 }}>{d.dia||d.semana}</p>
        </div>
      ))}
    </div>
  )
}

function LineChart({ data }: { data: any[] }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let p = 0
    const timer = setInterval(() => { p += 2; setProgress(Math.min(p, 100)); if (p >= 100) clearInterval(timer) }, 16)
    return () => clearInterval(timer)
  }, [])
  const max = Math.max(...data.map(d => d.citas), 1)
  const w = 280; const h = 60; const pad = 10
  const points = data.map((d, i) => ({ x: pad + (i / Math.max(data.length-1,1)) * (w - pad*2), y: h - pad - ((d.citas/max) * (h - pad*2)) }))
  const pathD = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '')
  const totalLength = 400
  return (
    <div style={{ marginTop:8, overflowX:'auto' }}>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow:'visible' }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2ECC71"/>
            <stop offset="100%" stopColor="#00FF88"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path d={pathD} fill="none" stroke="rgba(46,204,113,0.15)" strokeWidth="1"/>
        <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" filter="url(#glow)"
          strokeDasharray={totalLength} strokeDashoffset={totalLength * (1 - progress/100)}
          style={{ transition:'stroke-dashoffset 0.05s linear' }} />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#2ECC71" filter="url(#glow)"
            style={{ opacity: progress > (i/points.length)*100 ? 1 : 0, transition:'opacity 0.3s' }} />
        ))}
      </svg>
    </div>
  )
}


function PublicidadPage() {
  const [form, setForm] = useState({ titulo:'', subtitulo:'', boton_texto:'Ver más', boton_url:'', anunciante_nombre:'', anunciante_email:'', anunciante_telefono:'', ciudad:'', pais:'Colombia', imagen_url:'', latitud:'', longitud:'' })
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const imgRef = useRef<HTMLInputElement>(null)

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      setForm(f => ({...f, latitud: pos.coords.latitude.toString(), longitud: pos.coords.longitude.toString()}))
    }, () => alert('No se pudo obtener ubicación'))
  }

  const handleUploadImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 5*1024*1024) { alert('Máximo 5MB'); return }
    setUploadingImg(true)
    try {
      const fd = new FormData(); fd.append('imagen', file)
      const res = await fetch(`${API}/api/upload/anuncio/0`, { method:'POST', body:fd })
      const data = await res.json()
      if (data.success) setForm(f => ({...f, imagen_url: data.url}))
      else alert('Error subiendo imagen')
    } catch { alert('Error de conexión') } finally { setUploadingImg(false) }
  }

  const handleEnviar = async () => {
    if (!form.titulo || !form.anunciante_nombre || !form.anunciante_email || !form.ciudad || !form.imagen_url) {
      alert('Completa todos los campos requeridos y sube una imagen'); return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/anuncios/solicitud`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form, activo:false, estado:'pendiente'}) })
      const data = await res.json()
      if (data.success) setEnviado(true)
      else alert('Error: ' + data.error)
    } catch { alert('Error de conexión') } finally { setLoading(false) }
  }

  if (enviado) return (
    <div style={{minHeight:'100vh',background:'#080808',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{background:'#141414',border:'1px solid rgba(201,168,76,0.2)',borderRadius:20,padding:44,maxWidth:480,textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:16}}>✓</div>
        <h2 style={{color:'#C9A84C',marginBottom:12,fontSize:24,fontWeight:800}}>Solicitud enviada</h2>
        <p style={{color:'#777',fontSize:14,lineHeight:1.7,marginBottom:24}}>Recibimos tu solicitud. En las próximas 24 horas te contactamos para confirmar el pago y activar tu anuncio.</p>
        <div style={{background:'rgba(201,168,76,0.05)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:12,padding:20,marginBottom:24}}>
          <p style={{fontSize:9,color:'#444',textTransform:'uppercase',letterSpacing:3,marginBottom:4}}>AutomatizaPro · Good Connection · CutConnect</p>
          <p style={{fontSize:10,color:'#777',textTransform:'uppercase',letterSpacing:2,marginBottom:8}}>Pago con Binance Pay</p>
          <p style={{fontSize:13,color:'#fff',marginBottom:12}}>Envía <strong style={{color:'#C9A84C'}}>$3.99 USDT</strong> al Pay ID:</p>
          <p style={{fontSize:28,fontWeight:900,letterSpacing:6,color:'#C9A84C',marginBottom:12}}>176779028</p>
          <img src="data:image/jpeg;base64,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" alt="QR CutConnect" style={{width:140,height:140,borderRadius:8,border:'1px solid rgba(201,168,76,0.3)'}} />
        </div>
        <a href={`https://wa.me/+32455136804?text=Hola%20CutConnect%2C%20quiero%20publicitar%20mi%20negocio.%20Mi%20empresa%3A%20${encodeURIComponent(form.anunciante_nombre)}%20en%20${encodeURIComponent(form.ciudad)}.%20Acabo%20de%20enviar%20el%20pago%20por%20Binance.`} target="_blank" rel="noreferrer"
          style={{display:'block',background:'#25D366',color:'#fff',padding:14,borderRadius:10,fontWeight:700,textDecoration:'none',fontSize:13,textTransform:'uppercase',letterSpacing:1,marginBottom:16}}>
          Enviar comprobante por WhatsApp
        </a>
        <button onClick={() => window.location.href = '/'} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.1)',color:'#777',borderRadius:8,padding:'10px 20px',cursor:'pointer',fontSize:13}}>Volver al inicio</button>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#080808',padding:'0 0 60px'}}>
      <div style={{background:'rgba(8,8,8,0.95)',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'20px 32px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:20,fontWeight:800,color:'#fff'}}>Cut<span style={{color:'#C9A84C'}}>Connect</span></div>
        <button onClick={() => window.location.href = '/'} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.1)',color:'#777',borderRadius:8,padding:'8px 16px',cursor:'pointer',fontSize:13}}>← Volver</button>
      </div>
      <div style={{maxWidth:600,margin:'0 auto',padding:'40px 24px'}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <p style={{fontSize:11,color:'#C9A84C',textTransform:'uppercase',letterSpacing:4,marginBottom:12}}>Publicidad</p>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:36,fontWeight:800,color:'#fff',marginBottom:12}}>Llega a más clientes</h1>
          <p style={{color:'#555',fontSize:15,lineHeight:1.7}}>Publica tu negocio en CutConnect por solo <strong style={{color:'#C9A84C'}}>$3.99 USD/mes</strong></p>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.06)',borderRadius:16,padding:24}}>
            <p style={{fontSize:10,color:'#C9A84C',textTransform:'uppercase',letterSpacing:2,marginBottom:16,fontWeight:700}}>Datos del anunciante</p>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div className="form-group"><label>Nombre de tu empresa *</label><input type="text" placeholder="Lavandería Express" value={form.anunciante_nombre} onChange={e=>setForm({...form,anunciante_nombre:e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label>Email *</label><input type="email" placeholder="tu@empresa.com" value={form.anunciante_email} onChange={e=>setForm({...form,anunciante_email:e.target.value})} /></div>
                <div className="form-group"><label>Teléfono</label><input type="tel" placeholder="+57 300 000 0000" value={form.anunciante_telefono} onChange={e=>setForm({...form,anunciante_telefono:e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>País</label>
                  <select value={form.pais} onChange={e=>setForm({...form,pais:e.target.value})}
                    style={{width:'100%',background:'#1a1a1a',color:'#fff',border:'1px solid rgba(201,168,76,0.3)',borderRadius:10,padding:'10px 14px',fontSize:14,appearance:'none',cursor:'pointer'}}>
                  <option value="Argentina">Argentina</option>
                  <option value="Bolivia">Bolivia</option>
                  <option value="Chile">Chile</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Costa Rica">Costa Rica</option>
                  <option value="Cuba">Cuba</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="El Salvador">El Salvador</option>
                  <option value="Guatemala">Guatemala</option>
                  <option value="Honduras">Honduras</option>
                  <option value="México">México</option>
                  <option value="Nicaragua">Nicaragua</option>
                  <option value="Panamá">Panamá</option>
                  <option value="Paraguay">Paraguay</option>
                  <option value="Perú">Perú</option>
                  <option value="Puerto Rico">Puerto Rico</option>
                  <option value="República Dominicana">República Dominicana</option>
                  <option value="Uruguay">Uruguay</option>
                  <option value="Venezuela">Venezuela</option>
                  </select>
                </div>
                <div className="form-group"><label>Ciudad *</label><input type="text" placeholder="Medellín" value={form.ciudad} onChange={e=>setForm({...form,ciudad:e.target.value})} /></div>
              </div>
              <button type="button" className="btn-gps" onClick={obtenerUbicacion}>{form.latitud ? 'Ubicación capturada ✓' : 'Capturar mi ubicación GPS'}</button>
            </div>
          </div>
          <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.06)',borderRadius:16,padding:24}}>
            <p style={{fontSize:10,color:'#C9A84C',textTransform:'uppercase',letterSpacing:2,marginBottom:16,fontWeight:700}}>Contenido del anuncio</p>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div className="form-group"><label>Título *</label><input type="text" placeholder="Ej: Lavandería a domicilio" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} /></div>
              <div className="form-group"><label>Subtítulo</label><input type="text" placeholder="Recogemos y entregamos en tu puerta" value={form.subtitulo} onChange={e=>setForm({...form,subtitulo:e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label>Texto del botón</label><input type="text" placeholder="Ver más" value={form.boton_texto} onChange={e=>setForm({...form,boton_texto:e.target.value})} /></div>
                <div className="form-group"><label>URL del botón</label><input type="url" placeholder="https://..." value={form.boton_url} onChange={e=>setForm({...form,boton_url:e.target.value})} /></div>
              </div>
              <div className="form-group">
                <label>Imagen del banner * <span style={{color:'#555',fontWeight:400}}>(1200×300px recomendado)</span></label>
                <div style={{background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:8,padding:'10px 14px',marginBottom:10,fontSize:11,color:'#888',lineHeight:1.7}}>
                  📐 <strong style={{color:'#C9A84C'}}>Tamaño ideal: 1200 × 300 px</strong> (proporción 4:1)<br/>
                  📁 Formatos: JPG, PNG, WebP - Máximo 5 MB<br/>
                  💡 Tip: crea el banner gratis en <strong style={{color:'#C9A84C'}}>Canva.com</strong> con ese tamaño exacto
                </div>
                {form.imagen_url && <img src={form.imagen_url} alt="preview" style={{width:'100%',height:100,objectFit:'cover',borderRadius:8,marginBottom:8}} />}
                <input type="file" accept="image/*" style={{display:'none'}} ref={imgRef} onChange={handleUploadImg} />
                <button type="button" className="btn-upload" style={{width:'100%'}} onClick={()=>imgRef.current?.click()} disabled={uploadingImg}>
                  {uploadingImg ? 'Subiendo...' : form.imagen_url ? 'Cambiar imagen' : 'Subir imagen del banner'}
                </button>
              </div>
            </div>
          </div>
          <div style={{background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:16,padding:24,textAlign:'center'}}>
            <p style={{fontSize:10,color:'#C9A84C',textTransform:'uppercase',letterSpacing:2,marginBottom:8}}>Precio</p>
            <p style={{fontSize:32,fontWeight:900,color:'#C9A84C',marginBottom:4}}>$3.99 <span style={{fontSize:16,fontWeight:400}}>USD/mes</span></p>
            <p style={{fontSize:13,color:'#555'}}>Tu anuncio aparece en {form.ciudad||'tu ciudad'}</p>
          </div>
          <button className="btn-primary" style={{padding:16,fontSize:14,width:'100%'}} onClick={handleEnviar} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar solicitud de publicidad'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SplashScreen({ onDone }: { onDone:()=>void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [])
  return (
    <div className="splash-screen">
      <div className="splash-logo">
        <div className="splash-title">Cut<span>Connect</span></div>
        <div className="splash-subtitle">Belleza · Bienestar · Latinoamérica</div>
        <div className="splash-bar"><div className="splash-bar-fill"></div></div>
        <div className="splash-countries" style={{fontSize:22,letterSpacing:6}}>🌎</div>
      </div>
    </div>
  )
}

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
  const [adBanners, setAdBanners] = useState<any[]>(AD_BANNER_DEFAULT)
  const [ciudadActiva, setCiudadActiva] = useState('')

  useEffect(() => {
    fetch(`${API}/api/anuncios`).then(r=>r.json()).then(d=>{ if(d.success && d.data?.length) setAdBanners(d.data.filter((a:any) => a.activo)) }).catch(()=>{})
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setSlideIndex(i => (i+1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const getBannersParaCiudad = (ciudad: string) => {
    if (!ciudad) return AD_BANNER_DEFAULT
    const filtrados = adBanners.filter((a:any) => !a.ciudad || a.ciudad.toLowerCase().includes(ciudad.toLowerCase()) || ciudad.toLowerCase().includes(a.ciudad.toLowerCase()))
    return filtrados.length > 0 ? filtrados : AD_BANNER_DEFAULT
  }

  const buscarPorGPS = () => {
    if (!navigator.geolocation) return
    setBuscando(true)
    navigator.geolocation.getCurrentPosition(pos => { setBuscando(false); cargarBarberias(pos.coords.latitude, pos.coords.longitude) }, () => setBuscando(false))
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
      if (ciudad) setCiudadActiva(ciudad)
    } catch {}
  }

  const buscarPorCiudad = () => { if (searchCiudad.trim()) { setCiudadActiva(searchCiudad); cargarBarberias(undefined, undefined, searchCiudad, tipoFiltro) } }
  const bannersActivos = getBannersParaCiudad(ciudadActiva)

  return (
    <div className="public-page">
      {modalCal && <ModalCalificacion {...modalCal} onClose={() => setModalCal(null)} onDone={() => {}} />}
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
      <nav className={`public-nav ${scrolled?'scrolled':''}`}>
        <div className="public-nav-logo">Cut<span>Connect</span></div>
        <div className="public-nav-actions">
          <button className="btn-nav-login" onClick={onLogin}>Iniciar sesión</button>
          <button className="btn-nav-register" onClick={onRegister}>Registrarse</button>
        </div>
      </nav>
      <div className="hero">
        <div className="hero-slides">
          {HERO_SLIDES.map((src, i) => (<div key={i} className={`hero-slide ${i===slideIndex?'active':''}`} style={{ backgroundImage:`url(${src})` }} />))}
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-eyebrow">🌎 Toda Latinoamérica</div>
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
          <div className="hero-stat"><div className="hero-stat-number">500+</div><div className="hero-stat-label">Negocios</div></div>
          <div className="hero-stat"><div className="hero-stat-number">2K+</div><div className="hero-stat-label">Clientes</div></div>
          <div className="hero-stat"><div className="hero-stat-number">2</div><div className="hero-stat-label">Países</div></div>
        </div>
      </div>
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
            onClick={() => { setTipoFiltro(s.key); if (s.key==='todos') cargarBarberias(); else cargarBarberias(undefined,undefined,undefined,s.key) }}>
            <div className="service-icon" style={{ color: tipoFiltro===s.key ? '#C9A84C' : '#555' }}>{s.icon}</div>
            <div className="service-name" style={{ color: tipoFiltro===s.key ? '#fff' : '#555' }}>{s.name}</div>
          </div>
        ))}
      </div>
      <div className="public-section">
        <div className="section-header">
          <div><div className="section-eyebrow">Disponibles ahora</div><h2 className="section-title">Negocios cerca de ti</h2></div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:8 }}>
              <button key='todos' className={`tipo-btn ${tipoFiltro==='todos'?'active':''}`} onClick={()=>{setTipoFiltro('todos');cargarBarberias(undefined,undefined,searchCiudad||undefined,'todos')}}>Todos</button>
              <button key='barberia' className={`tipo-btn ${tipoFiltro==='barberia'?'active':''}`} onClick={()=>{setTipoFiltro('barberia');cargarBarberias(undefined,undefined,searchCiudad||undefined,'barberia')}}>✂️ Barberías</button>
              <button key='peluqueria' className={`tipo-btn ${tipoFiltro==='peluqueria'?'active':''}`} onClick={()=>{setTipoFiltro('peluqueria');cargarBarberias(undefined,undefined,searchCiudad||undefined,'peluqueria')}}>💇 Peluquerías</button>
              <button key='spa' className={`tipo-btn ${tipoFiltro==='spa'?'active':''}`} onClick={()=>{setTipoFiltro('spa');cargarBarberias(undefined,undefined,searchCiudad||undefined,'spa')}}>🧖 Spa</button>
              <button key='gimnasio' className={`tipo-btn ${tipoFiltro==='gimnasio'?'active':''}`} onClick={()=>{setTipoFiltro('gimnasio');cargarBarberias(undefined,undefined,searchCiudad||undefined,'gimnasio')}}>🏋️ Gimnasio</button>
              <button key='manicurista' className={`tipo-btn ${tipoFiltro==='manicurista'?'active':''}`} onClick={()=>{setTipoFiltro('manicurista');cargarBarberias(undefined,undefined,searchCiudad||undefined,'manicurista')}}>💅 Manicure</button>
              <button key='estetica' className={`tipo-btn ${tipoFiltro==='estetica'?'active':''}`} onClick={()=>{setTipoFiltro('estetica');cargarBarberias(undefined,undefined,searchCiudad||undefined,'estetica')}}>💄 Estética</button>
              <button key='masajes' className={`tipo-btn ${tipoFiltro==='masajes'?'active':''}`} onClick={()=>{setTipoFiltro('masajes');cargarBarberias(undefined,undefined,searchCiudad||undefined,'masajes')}}>💆 Masajes</button>
              <button key='tatuajes' className={`tipo-btn ${tipoFiltro==='tatuajes'?'active':''}`} onClick={()=>{setTipoFiltro('tatuajes');cargarBarberias(undefined,undefined,searchCiudad||undefined,'tatuajes')}}>🎨 Tatuajes</button>
              <button key='cejas' className={`tipo-btn ${tipoFiltro==='cejas'?'active':''}`} onClick={()=>{setTipoFiltro('cejas');cargarBarberias(undefined,undefined,searchCiudad||undefined,'cejas')}}>👁️ Cejas</button>
              <button key='veterinaria' className={`tipo-btn ${tipoFiltro==='veterinaria'?'active':''}`} onClick={()=>{setTipoFiltro('veterinaria');cargarBarberias(undefined,undefined,searchCiudad||undefined,'veterinaria')}}>🐾 Pet</button>
          </div>
        </div>
        {barberias.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <p style={{ color:'#333', fontSize:15, marginBottom:16 }}>Busca una ciudad para ver los negocios disponibles</p>
            <button className="btn-primary" onClick={buscarPorGPS}>{buscando?'Buscando...':'Usar mi ubicación'}</button>
          </div>
        )}
        <div className="barberias-grid">
          {barberias.map((b: any) => (
            <div key={b.id} className="barberia-card" onClick={() => { setSelectedBarberia(b); setShowLoginPrompt(true) }}>
              <div className="barberia-card-banner">
                <img src={b.logo || (b.tipo_negocio==='peluqueria'?IMAGEN_PELUQUERIA:IMAGEN_BARBERIA)} alt={b.nombre} onError={(e:any)=>{ e.target.src=b.tipo_negocio==='peluqueria'?IMAGEN_PELUQUERIA:IMAGEN_BARBERIA }} />
                <div className="barberia-card-banner-overlay" />
                <div className="barberia-card-banner-tipo">{getTipoEmoji(b.tipo_negocio)} {getTipoLabel(b.tipo_negocio)}</div>
              </div>
              <div className="barberia-card-body">
                <div className="barberia-nombre">{b.nombre}</div>
                <div className="barberia-ciudad">{b.ciudad}, {b.pais}</div>
                {b.distancia !== undefined && <div className="barberia-distancia">{b.distancia.toFixed(1)} km</div>}
                {b.calificacion_promedio > 0 && <div style={{ display:'flex', alignItems:'center', gap:6 }}><StarRating value={Math.round(b.calificacion_promedio)} /><span style={{ fontSize:12, color:'#777' }}>{Number(b.calificacion_promedio).toFixed(1)}</span></div>}
                {b.descripcion && <p className="barberia-descripcion">{b.descripcion}</p>}
                <div style={{ display:'flex', gap:8, marginTop:6 }}>
                  <button className="btn-elegir" onClick={e => { e.stopPropagation(); setSelectedBarberia(b); setShowLoginPrompt(true) }}>Reservar</button>
                  <button style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'#555', fontSize:11, padding:'8px 12px', cursor:'pointer', fontWeight:600, textTransform:'uppercase', letterSpacing:1 }} onClick={e => { e.stopPropagation(); setModalCal({ tipo:'barberia', id:b.id, barberiaId:b.id, usuarioId:0, nombre:b.nombre }) }}>Calificar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:40 }}><AdBanner banners={bannersActivos} /></div>
      </div>
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.04)', padding:'40px 48px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
        <div style={{ fontFamily:'Playfair Display,serif', fontSize:20, fontWeight:800 }}>Cut<span style={{ color:'#C9A84C' }}>Connect</span></div>
        <p style={{ color:'#333', fontSize:12 }}>© 2025 CutConnect · Toda Latinoamérica</p>
        <div style={{ display:'flex', gap:16 }}>
          <button className="btn-nav-login" onClick={onLogin}>Iniciar sesión</button>
          <button className="btn-nav-register" onClick={onRegister}>Registrarse</button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [appMode, setAppMode] = useState<'public'|'login'|'register'|'recovery'|'app'>('public')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('cliente')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
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
  const [ownerData, setOwnerData] = useState({ negocio_nombre:'', pais:'Colombia', estado:'', municipio:'', ciudad:'', negocio_telefono:'', negocio_logo:'', negocio_descripcion:'', direccion:'', latitud:'', longitud:'', tipo_negocio:'barberia', instagram:'', facebook:'', web:'' })
  const [editNegocio, setEditNegocio] = useState(false)
  const [editNegocioData, setEditNegocioData] = useState({ nombre:'', descripcion:'', telefono:'', logo:'', tipo_negocio:'barberia', fidelizacion_citas:10, fidelizacion_beneficio:'', instagram:'', facebook:'', web:'' })
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
  const [adminPage, setAdminPage] = useState<'pendientes'|'vip'|'publicidad'|'negados'|'ingresos'>('pendientes')
  const [adminSearch, setAdminSearch] = useState('')
  const [adminFiltroPais, setAdminFiltroPais] = useState('')
  const [adminFiltroTipo, setAdminFiltroTipo] = useState('')
  const [adminDetalle, setAdminDetalle] = useState<any>(null)
  const [adminClientes, setAdminClientes] = useState<any[]>([])
  const [anuncios, setAnuncios] = useState<any[]>([])
  const [solicitudesPublicidad, setSolicitudesPublicidad] = useState<any[]>([])
  const [formAnuncio, setFormAnuncio] = useState({ titulo:'', subtitulo:'', imagen_url:'', boton_texto:'Ver más', boton_url:'', ciudad:'', pais:'', activo:true })
  const [editAnuncio, setEditAnuncio] = useState<any>(null)
  const [misBarberos, setMisBarberos] = useState<any[]>([])
  const [showFormBarbero, setShowFormBarbero] = useState(false)
  const [editandoBarbero, setEditandoBarbero] = useState<any>(null)
  const [formBarbero, setFormBarbero] = useState({ nombre:'', foto:'', especialidad:'', descripcion:'', horario:{ lunes:{activo:true,inicio:'08:00',fin:'18:00'}, martes:{activo:true,inicio:'08:00',fin:'18:00'}, miercoles:{activo:true,inicio:'08:00',fin:'18:00'}, jueves:{activo:true,inicio:'08:00',fin:'18:00'}, viernes:{activo:true,inicio:'08:00',fin:'18:00'}, sabado:{activo:true,inicio:'08:00',fin:'14:00'}, domingo:{activo:false,inicio:'',fin:''} } })
  const [perfilBarbero, setPerfilBarbero] = useState<any>(null)
  const [modalCal, setModalCal] = useState<any>(null)
  const [modalBarberoFull, setModalBarberoFull] = useState<any>(null)
  const [perfilDuenoBarbero, setPerfilDuenoBarbero] = useState<any>(null)
  const [citasPropias, setCitasPropias] = useState<any[]>([])
  const [showFormActivar, setShowFormActivar] = useState(false)
  const [formDuenoBarbero, setFormDuenoBarbero] = useState({ nombre:'', especialidad:'', descripcion:'', horario:{ lunes:{activo:true,inicio:'08:00',fin:'18:00'}, martes:{activo:true,inicio:'08:00',fin:'18:00'}, miercoles:{activo:true,inicio:'08:00',fin:'18:00'}, jueves:{activo:true,inicio:'08:00',fin:'18:00'}, viernes:{activo:true,inicio:'08:00',fin:'18:00'}, sabado:{activo:true,inicio:'08:00',fin:'14:00'}, domingo:{activo:false,inicio:'',fin:''} } })
  const [adBanners, setAdBanners] = useState<any[]>(AD_BANNER_DEFAULT)
  const [gastosD, setGastosD] = useState<any[]>([])
  const [gastosFormD, setGastosFormD] = useState({descripcion:'',monto:'',categoria:'Suministros'})
  const [proActD, setProActD] = useState(false)
  const [proPendD, setProPendD] = useState(false)
  const [proActB, setProActB] = useState(false)
  const [proPendB, setProPendB] = useState(false)
  const [rangoB, setRangoB] = useState(()=>{const t=new Date().toISOString().split('T')[0];return{desde:t,hasta:t}})
  const [rangoD, setRangoD] = useState(()=>{const t=new Date().toISOString().split('T')[0];return{desde:t,hasta:t}})

  const isAdminRoute = window.location.pathname === ADMIN_PATH
  const isPublicidadRoute = window.location.pathname === PUBLICIDAD_PATH

  useEffect(() => { if (loggedIn) cargarDatos() }, [loggedIn])
  useEffect(() => { if (formData.barbero_id && formData.fecha) cargarDisponibilidad(formData.barbero_id, formData.fecha); else setHorasDisponibles([]) }, [formData.barbero_id, formData.fecha])
  useEffect(() => { if (loggedIn && userData?.rol==='barbero') cargarPerfilBarbero() }, [loggedIn, userData?.rol])
  useEffect(() => { if (loggedIn && userData?.rol==='dueño') { cargarPerfilDuenoBarbero(); if(userData?.barberia_id) cargarRanking() } }, [loggedIn, userData?.rol])
  useEffect(() => {
    fetch(`${API}/api/anuncios`).then(r=>r.json()).then(d=>{ if(d.success && d.data?.length) setAdBanners(d.data.filter((a:any) => a.activo)) }).catch(()=>{})
  }, [])
  useEffect(() => { if (userData?.id && userData?.rol==='dueño') cargarGastosD(String(userData.id)) }, [userData?.id])
  useEffect(() => {
    if (!userData?.id) return
    const uid = String(userData.id)
    if (userData.rol === 'dueño') {
      const act = localStorage.getItem('pro_activo_d_'+uid)==='true'
      const pend = localStorage.getItem('pro_d_'+uid)==='true' && !act
      setProActD(act); setProPendD(pend)
    } else if (userData.rol === 'barbero') {
      const act = localStorage.getItem('pro_activo_b_'+uid)==='true'
      const pend = localStorage.getItem('pro_b_'+uid)==='true' && !act
      setProActB(act); setProPendB(pend)
    }
  }, [userData?.id])
  useEffect(() => {
    if (!userData?.id) return
    const uid = String(userData.id)
    if (userData.is_pro) {
      if (userData.rol === 'barbero') {
        localStorage.setItem('pro_activo_b_'+uid, 'true')
        localStorage.setItem('pro_b_'+uid, 'true')
        setProActB(true); setProPendB(false)
      } else if (userData.rol === 'dueño') {
        localStorage.setItem('pro_activo_d_'+uid, 'true')
        localStorage.setItem('pro_d_'+uid, 'true')
        setProActD(true); setProPendD(false)
      }
    }
  }, [userData?.id])

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
      setBarberias(d1.data||[]); setServicios(d2.data||[]); setCitas((prev:any[])=>{const nd=d3.data||[];const nids=new Set(nd.map((c:any)=>c.id));const keep=prev.filter((c:any)=>c.estado==='completada'&&!nids.has(c.id));return[...nd,...keep]})
    } catch {}
  }

  const cargarCitasDueno = async () => { try { const r=await fetch(`${API}/api/citas/barberia/${userData?.barberia_id}`); const d=await r.json(); setCitas((prev:any[])=>{const nd=d.data||[];const nids=new Set(nd.map((c:any)=>c.id));const keep=prev.filter((c:any)=>c.estado==='completada'&&!nids.has(c.id));return[...nd,...keep]}) } catch {} }
  const cargarCitasBarbero = async () => { try { const r=await fetch(`${API}/api/citas/barbero/${userData?.barbero_id}`); const d=await r.json(); setCitas((prev:any[])=>{const nd=d.data||[];const nids=new Set(nd.map((c:any)=>c.id));const keep=prev.filter((c:any)=>c.estado==='completada'&&!nids.has(c.id));return[...nd,...keep]}) } catch {} }
  const cargarBarberosBarberia = async (id: any) => { try { const r=await fetch(`${API}/api/barberos/${id}`); const d=await r.json(); setBarberosList(d.data||[]) } catch { setBarberosList([]) } }
  const cargarMisBarberos = async () => { try { const r=await fetch(`${API}/api/barberos/${userData?.barberia_id}`); const d=await r.json(); setMisBarberos(d.data||[]) } catch { setMisBarberos([]) } }
  // @ts-ignore
  const cargarGastosD = async (uid: string) => { try { const r=await fetch(`${SB_URL}/rest/v1/gastos?usuario_id=eq.${uid}&order=created_at.asc`,{headers:sbH}); const d=await r.json(); if(Array.isArray(d)) setGastosD(d) } catch {} }
  const cargarRanking = async () => { try { const r=await fetch(`${API}/api/stats/barberos/${userData?.barberia_id}`); const d=await r.json(); setRankingBarberos(d.data||[]) } catch { setRankingBarberos([]) } }
  const cargarPerfilBarbero = async () => { try { const r=await fetch(`${API}/api/barbero/perfil/${userData?.id}`); const d=await r.json(); if(d.success) setPerfilBarbero(d.data) } catch {} }
  const cargarPerfilDuenoBarbero = async () => { try { const r=await fetch(`${API}/api/barbero/perfil/${userData?.id}`); const d=await r.json(); if(d.success && d.data) { setPerfilDuenoBarbero(d.data); const rc=await fetch(`${API}/api/citas/barbero/${d.data.id}`); const dc=await rc.json(); setCitasPropias(dc.data||[]) } else { setPerfilDuenoBarbero(null) } } catch {} }
  const handleGuardarDuenoBarbero = async (e: any) => { e.preventDefault(); setLoading(true); setError(''); try { let res; if (perfilDuenoBarbero) { res=await fetch(`${API}/api/barbero/perfil/${perfilDuenoBarbero.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({descripcion:formDuenoBarbero.descripcion,especialidad:formDuenoBarbero.especialidad,horario:formDuenoBarbero.horario})}) } else { res=await fetch(`${API}/api/barberos`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nombre:formDuenoBarbero.nombre||userData?.nombre||'',especialidad:formDuenoBarbero.especialidad,descripcion:formDuenoBarbero.descripcion,horario:formDuenoBarbero.horario,barberia_id:userData?.barberia_id,usuario_id:userData?.id})}) } const data=await res.json(); if(data.success){setShowFormActivar(false);await cargarPerfilDuenoBarbero();cargarMisBarberos();alert('¡Perfil activado! Ya apareces como profesional disponible.')}else setError(data.error||'Error') } catch { setError('Error de conexión') } finally { setLoading(false) } }
  const updateHorarioDueno = (dia: string, campo: string, valor: any) => { setFormDuenoBarbero({...formDuenoBarbero,horario:{...formDuenoBarbero.horario,[dia]:{...(formDuenoBarbero.horario as any)[dia],[campo]:valor}}}) }
  const cargarDisponibilidad = async (barberoId: any, fecha: string) => { try { const r=await fetch(`${API}/api/disponibilidad/${barberoId}/${fecha}`); const d=await r.json(); setHorasDisponibles(d.data||[]) } catch { setHorasDisponibles([]) } }
  const buscarPorGPS = () => { if (!navigator.geolocation) return; setBuscando(true); navigator.geolocation.getCurrentPosition(pos => { setGpsUsado(true); setBuscando(false); cargarDatos(pos.coords.latitude, pos.coords.longitude, undefined, tipoNegocioFiltro) }, () => setBuscando(false)) }
  const buscarPorCiudad = () => { if (!searchCiudad.trim()) return; setGpsUsado(false); cargarDatos(undefined, undefined, searchCiudad, tipoNegocioFiltro) }

  const completarCita = async (id: number) => {
    try { await fetch(`${API}/api/citas/completar/${id}`, { method:'POST' }); setCitas((prev:any)=>prev.map((cc:any)=>cc.id===id?{...cc,estado:'completada'}:cc)) } catch {}
  }
  const cancelarCita = async (id: number) => {
    if (!confirm('¿Cancelar esta cita?')) return
    try { await fetch(`${API}/api/citas/cancelar/${id}`, { method:'POST' }); cargarCitasDueno(); cargarCitasBarbero() } catch {}
  }

  const esCitaVigente = (c: any) => {
    try {
      const [h, m] = (c.hora || '00:00').split(':').map(Number)
      const dt = new Date(`${c.fecha}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`)
      return Date.now() - dt.getTime() < 2 * 60 * 60 * 1000
    } catch { return true }
  }

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
      if (data.success) { alert('Contraseña actualizada.'); setAppMode('login') } else setError(data.error||'Error')
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
      const res = await fetch(`${API}/api/barberias/${userData?.barberia_id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...editNegocioData}) })
      const data = await res.json()
      if (data.success) { setEditNegocio(false); alert('Negocio actualizado') } else setError(data.error||'Error')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }
  const handleLogout = () => { localStorage.removeItem('token'); setLoggedIn(false); setEmail(''); setPassword(''); setRol('cliente'); setUserData(null); setCurrentPage('dashboard'); setAppMode('public') }
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
      const [r1,r2,r3,r4,r5] = await Promise.all([
        fetch(`${API}/api/admin/negocios`,{headers:{'x-admin-token':'admin_token_cutconnect'}}),
        fetch(`${API}/api/admin/stats`,{headers:{'x-admin-token':'admin_token_cutconnect'}}),
        fetch(`${API}/api/admin/anuncios`,{headers:{'x-admin-token':'admin_token_cutconnect'}}),
        fetch(`${API}/api/admin/solicitudes-publicidad`,{headers:{'x-admin-token':'admin_token_cutconnect'}}),
        fetch(`${API}/api/admin/usuarios`,{headers:{'x-admin-token':'admin_token_cutconnect'}}).catch(()=>null)
      ])
      const d1=await r1.json(); const d2=await r2.json(); const d3=await r3.json(); const d4=await r4.json()
      setAdminNegocios(d1.data||[]); setAdminStats(d2.data||null); setAnuncios(d3.data||[]); setSolicitudesPublicidad(d4.data||[])
      if (r5) { try { const d5=await r5.json(); setAdminClientes((d5.data||[]).filter((u:any)=>u.rol==='cliente')) } catch {} }
    } catch { setAdminMsg('Error cargando datos') }
  }
  const accionAdmin = async (endpoint: string, id: number) => {
    try { const res=await fetch(`${API}/api/admin/${endpoint}/${id}`,{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':'admin_token_cutconnect'}}); const data=await res.json(); setAdminMsg(data.message||data.error); cargarAdminData() } catch { setAdminMsg('Error') }
    setTimeout(()=>setAdminMsg(''),4000)
  }
  const guardarAnuncio = async () => {
    try {
      if (editAnuncio) await fetch(`${API}/api/admin/anuncios/${editAnuncio.id}`, { method:'PUT', headers:{'Content-Type':'application/json','x-admin-token':'admin_token_cutconnect'}, body:JSON.stringify(formAnuncio) })
      else await fetch(`${API}/api/admin/anuncios`, { method:'POST', headers:{'Content-Type':'application/json','x-admin-token':'admin_token_cutconnect'}, body:JSON.stringify(formAnuncio) })
      setFormAnuncio({titulo:'',subtitulo:'',imagen_url:'',boton_texto:'Ver más',boton_url:'',ciudad:'',pais:'',activo:true})
      setEditAnuncio(null); cargarAdminData()
      setAdminMsg('Anuncio guardado'); setTimeout(()=>setAdminMsg(''),3000)
    } catch { setAdminMsg('Error al guardar') }
  }

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />
  if (isPublicidadRoute) return <PublicidadPage />

  if (isAdminRoute) {
    if (!adminLoggedIn) return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#050508,#0d0d1a)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
        <div style={{width:'100%',maxWidth:380,background:'rgba(14,14,26,0.95)',border:'1px solid rgba(201,168,76,0.2)',borderRadius:24,padding:'44px 36px',backdropFilter:'blur(20px)',boxShadow:'0 20px 60px rgba(0,0,0,0.6)'}}>
          <div style={{textAlign:'center',marginBottom:36}}>
            <div style={{fontSize:36,fontWeight:900,letterSpacing:-1,marginBottom:6}}>Cut<span style={{color:'#C9A84C'}}>Connect</span></div>
            <div style={{fontSize:11,color:'#555',textTransform:'uppercase',letterSpacing:4,fontWeight:700}}>Panel Administrador</div>
          </div>
          <form onSubmit={handleAdminLogin}>
            <div className="form-group" style={{marginBottom:20}}><label style={{fontSize:11,color:'#555',textTransform:'uppercase',letterSpacing:2,fontWeight:700}}>Contraseña</label><PasswordInput value={adminPassword} onChange={(e:any)=>setAdminPassword(e.target.value)} required /></div>
            {error && <p className="error">{error}</p>}
            <button type="submit" style={{width:'100%',background:'linear-gradient(135deg,#C9A84C,#B8972A)',color:'#000',border:'none',borderRadius:12,padding:'14px',fontSize:14,fontWeight:800,cursor:'pointer',letterSpacing:1,textTransform:'uppercase',boxShadow:'0 8px 25px rgba(201,168,76,0.3)'}} disabled={loading}>{loading?'Verificando...':'Entrar'}</button>
          </form>
        </div>
      </div>
    )
    const negociosFiltrados = adminNegocios.filter(n => {
      const q = adminSearch.toLowerCase()
      const matchSearch = !adminSearch || n.nombre?.toLowerCase().includes(q) || n.email_dueno?.toLowerCase().includes(q) || n.ciudad?.toLowerCase().includes(q)
      const matchEstado = adminSearch ? true : adminPage==='pendientes' ? n.estado_verificacion==='pendiente' : adminPage==='negados' ? n.estado_verificacion==='rechazado' : false
      const matchPais = !adminFiltroPais || n.pais===adminFiltroPais
      const matchTipo = !adminFiltroTipo || n.tipo_negocio===adminFiltroTipo
      return matchSearch && matchEstado && matchPais && matchTipo
    })
    const solPendientes = solicitudesPublicidad.filter((s:any) => s.estado==='pendiente')
    const trialUrgente = adminNegocios.filter(n => n.estado_verificacion==='trial' && n.diasTrial!==null && n.diasTrial<=3)
    const paisesUnicos = [...new Set(adminNegocios.map(n=>n.pais).filter(Boolean))] as string[]
    const clientesFiltrados = adminClientes.filter(c => {
      const q = adminSearch.toLowerCase()
      return !adminSearch || c.nombre?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    })
    return (
      <div style={{minHeight:'100vh',background:'#050508',display:'flex',flexDirection:'column'}}>
        {/* HEADER */}
        <div style={{background:'linear-gradient(135deg,rgba(13,13,26,0.98),rgba(17,17,39,0.98))',borderBottom:'1px solid rgba(201,168,76,0.12)',padding:'14px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100,backdropFilter:'blur(20px)'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:22,fontWeight:900}}>Cut<span style={{color:'#C9A84C'}}>Connect</span></span>
            <span style={{background:'rgba(201,168,76,0.12)',border:'1px solid rgba(201,168,76,0.25)',color:'#C9A84C',padding:'3px 10px',borderRadius:20,fontSize:10,fontWeight:800,letterSpacing:2}}>ADMIN</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:24}}>
            {adminStats && (
              <div style={{display:'flex',gap:20}}>
                {[
                  {v:adminStats.activos,l:'Activos',c:'#4ade80'},
                  {v:adminStats.pendientes,l:'Pendientes',c:'#FFA500'},
                  {v:adminStats.trial,l:'Trial',c:'#BB8FCE'},
                  {v:adminStats.total_clientes,l:'Clientes',c:'#00D4FF'},
                ].map((s,i)=>(
                  <div key={i} style={{textAlign:'center'}}>
                    <div style={{fontSize:18,fontWeight:800,color:s.c,lineHeight:1}}>{s.v}</div>
                    <div style={{fontSize:9,color:'#444',textTransform:'uppercase',letterSpacing:1,marginTop:2}}>{s.l}</div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={()=>setAdminLoggedIn(false)} style={{background:'rgba(255,107,107,0.08)',color:'#FF6B6B',border:'1px solid rgba(255,107,107,0.2)',borderRadius:10,padding:'8px 16px',fontSize:12,fontWeight:700,cursor:'pointer'}}>Salir</button>
          </div>
        </div>

        {/* ALERTA TRIAL URGENTE */}
        {trialUrgente.length>0 && (
          <div style={{background:'linear-gradient(90deg,rgba(255,107,107,0.08),transparent)',borderBottom:'1px solid rgba(255,107,107,0.15)',padding:'10px 28px',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <span>⚠️</span>
            <span style={{color:'#FF6B6B',fontSize:13,fontWeight:700}}>{trialUrgente.length} negocio(s) con trial a punto de vencer (≤3 días):</span>
            <span style={{color:'#FF9090',fontSize:12}}>{trialUrgente.map((n:any)=>n.nombre).join(' · ')}</span>
          </div>
        )}

        {/* STAT CARDS */}
        {adminStats && adminPage!=='anuncios' && adminPage!=='publicidad' && adminPage!=='clientes' && (
          <div style={{padding:'20px 28px 0'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:10}}>
              {[
                {label:'Total negocios',value:adminStats.total,color:'#C9A84C',glow:'rgba(201,168,76,0.15)',icon:'🏪'},
                {label:'Pendientes',value:adminStats.pendientes,color:'#FFA500',glow:'rgba(255,165,0,0.15)',icon:'⏳'},
                {label:'Activos',value:adminStats.activos,color:'#4ade80',glow:'rgba(74,222,128,0.15)',icon:'✅'},
                {label:'Suspendidos',value:adminStats.suspendidos,color:'#FF6B6B',glow:'rgba(255,107,107,0.15)',icon:'🚫'},
                {label:'En trial',value:adminStats.trial,color:'#BB8FCE',glow:'rgba(187,143,206,0.15)',icon:'⏰'},
                {label:'Clientes',value:adminStats.total_clientes,color:'#00D4FF',glow:'rgba(0,212,255,0.15)',icon:'👥'},
              ].map((s,i)=>(
                <div key={i} style={{background:'linear-gradient(135deg,rgba(18,18,32,0.95),rgba(10,10,20,0.95))',border:`1px solid ${s.glow}`,borderRadius:14,padding:'16px 12px',textAlign:'center',boxShadow:`0 4px 20px ${s.glow}`}}>
                  <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
                  <div style={{fontSize:28,fontWeight:900,color:s.color,lineHeight:1,textShadow:`0 0 20px ${s.glow}`}}>{s.value}</div>
                  <div style={{fontSize:9,color:'#555',marginTop:5,textTransform:'uppercase',letterSpacing:1}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TABS */}
        <div style={{padding:'16px 28px 0',display:'flex',gap:4,flexWrap:'wrap',borderBottom:'1px solid rgba(255,255,255,0.04)',marginTop:8}}>
          {[
            {key:'pendientes',label:'Pendientes',icon:'📋',badge:adminNegocios.filter(n=>n.estado_verificacion==='pendiente').length+solPendientes.length},
            {key:'vip',label:'Plan VIP',icon:'💎',badge:solicitudesPublicidad.filter((s:any)=>s.estado==='activo'&&((s.titulo||'').includes('PRO')||(s.titulo||'').includes('VIP'))).length},
            {key:'publicidad',label:'Publicidad',icon:'📢',badge:solicitudesPublicidad.filter((s:any)=>s.estado==='activo'&&!(s.titulo||'').includes('PRO')&&!(s.titulo||'').includes('VIP')).length},
            {key:'negados',label:'Negados',icon:'🚫',badge:0},
            {key:'ingresos',label:'Ingresos',icon:'💰',badge:0},
          ].map(tab=>(
            <button key={tab.key} onClick={()=>{setAdminPage(tab.key as any);setAdminSearch('');setAdminFiltroPais('');setAdminFiltroTipo('')}} style={{background:adminPage===tab.key?'rgba(201,168,76,0.08)':'transparent',color:adminPage===tab.key?'#C9A84C':'#555',border:'none',borderBottom:adminPage===tab.key?'2px solid #C9A84C':'2px solid transparent',padding:'10px 18px',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6,letterSpacing:0.5,transition:'all 0.2s',borderRadius:'6px 6px 0 0'}}>
              {tab.icon} {tab.label}
              {tab.badge>0&&<span style={{background:'#FF6B6B',color:'#fff',borderRadius:10,padding:'1px 6px',fontSize:10,fontWeight:800,lineHeight:1.4}}>{tab.badge}</span>}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div style={{flex:1,padding:'24px 28px',maxWidth:1200,width:'100%',margin:'0 auto',boxSizing:'border-box' as any}}>
          {adminMsg && <div style={{background:'rgba(74,222,128,0.08)',border:'1px solid rgba(74,222,128,0.25)',borderRadius:10,padding:'12px 16px',marginBottom:16,color:'#4ade80',fontSize:13,fontWeight:600}}>{adminMsg}</div>}

          {/* NEGOCIOS: pendientes + todos */}
          {(adminPage==='pendientes'||adminPage==='negados') && (
            <div>
              <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
                <input type="text" placeholder="🔍  Buscar por nombre, email o ciudad..." value={adminSearch} onChange={e=>setAdminSearch(e.target.value)}
                  style={{flex:1,minWidth:200,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'10px 16px',color:'#fff',fontSize:13,outline:'none'}} />
                <select value={adminFiltroPais} onChange={e=>setAdminFiltroPais(e.target.value)}
                  style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'10px 14px',color:adminFiltroPais?'#C9A84C':'#555',fontSize:13,cursor:'pointer',minWidth:120,outline:'none'}}>
                  <option value="">🌎 País</option>
                  {paisesUnicos.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
                <select value={adminFiltroTipo} onChange={e=>setAdminFiltroTipo(e.target.value)}
                  style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'10px 14px',color:adminFiltroTipo?'#C9A84C':'#555',fontSize:13,cursor:'pointer',minWidth:130,outline:'none'}}>
                  <option value="">🏪 Tipo</option>
                  {Object.entries(TIPO_INFO).map(([k,v])=><option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
                {(adminSearch||adminFiltroPais||adminFiltroTipo)&&(
                  <button onClick={()=>{setAdminSearch('');setAdminFiltroPais('');setAdminFiltroTipo('')}} style={{background:'rgba(255,107,107,0.08)',border:'1px solid rgba(255,107,107,0.2)',color:'#FF6B6B',borderRadius:10,padding:'10px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>✕ Limpiar</button>
                )}
                <span style={{color:'#444',fontSize:12,marginLeft:'auto'}}>{negociosFiltrados.length} resultado(s)</span>
              </div>

              {negociosFiltrados.length===0 && (
                <div style={{textAlign:'center',padding:'60px 20px'}}>
                  <div style={{fontSize:48,marginBottom:12,opacity:0.3}}>🔍</div>
                  <p style={{color:'#444',fontSize:15}}>No hay negocios con ese filtro</p>
                </div>
              )}

              {negociosFiltrados.map((n:any) => {
                const esUrgente = n.estado_verificacion==='trial' && n.diasTrial!==null && n.diasTrial<=3
                const isExpanded = adminDetalle?.id===n.id
                const estadoColor = n.estado_verificacion==='activo'?'#4ade80':n.estado_verificacion==='pendiente'?'#FFA500':n.estado_verificacion==='trial'?'#BB8FCE':'#FF6B6B'
                const estadoGlow = n.estado_verificacion==='activo'?'rgba(74,222,128,0.15)':n.estado_verificacion==='pendiente'?'rgba(255,165,0,0.15)':n.estado_verificacion==='trial'?'rgba(187,143,206,0.15)':'rgba(255,107,107,0.15)'
                const estadoLabel = n.estado_verificacion==='pendiente'?'Pendiente':n.estado_verificacion==='trial'?'Trial':n.estado_verificacion==='activo'?'Activo':n.estado_verificacion==='suspendido'?'Suspendido':'Rechazado'
                return (
                  <div key={n.id} style={{background:esUrgente?'linear-gradient(135deg,rgba(255,107,107,0.04),rgba(14,14,26,0.95))':'rgba(12,12,22,0.9)',border:`1px solid ${esUrgente?'rgba(255,107,107,0.25)':isExpanded?'rgba(201,168,76,0.3)':'rgba(255,255,255,0.05)'}`,borderRadius:16,marginBottom:8,overflow:'hidden',transition:'border-color 0.2s',boxShadow:isExpanded?'0 4px 30px rgba(201,168,76,0.08)':'none'}}>
                    <div style={{display:'flex',alignItems:'center',gap:14,padding:'14px 18px',cursor:'pointer'}} onClick={()=>setAdminDetalle(isExpanded?null:n)}>
                      {n.logo
                        ?<img src={n.logo} alt={n.nombre} style={{width:46,height:46,borderRadius:10,objectFit:'cover',flexShrink:0,border:'1px solid rgba(255,255,255,0.06)'}}/>
                        :<div style={{width:46,height:46,borderRadius:10,background:'linear-gradient(135deg,#1a1a35,#0d0d20)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:'#C9A84C',border:'1px solid rgba(201,168,76,0.12)',flexShrink:0}}>{getInitials(n.nombre)}</div>
                      }
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:15,fontWeight:700,color:'#fff',marginBottom:2}}>{getTipoEmoji(n.tipo_negocio)} {n.nombre}</div>
                        <div style={{fontSize:12,color:'#555'}}>{n.ciudad}, {n.estado}, {n.pais}</div>
                        <div style={{fontSize:11,color:'#3a3a4a'}}>{n.email_dueno} · {n.telefono}</div>
                        {esUrgente&&<div style={{fontSize:11,color:'#FF6B6B',fontWeight:700,marginTop:2}}>🔴 Solo {n.diasTrial} día(s) de trial</div>}
                        {n.estado_verificacion==='trial'&&!esUrgente&&n.diasTrial!==null&&<div style={{fontSize:11,color:'#C9A84C',fontWeight:600,marginTop:2}}>⏰ {n.diasTrial} días de trial</div>}
                      </div>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8,flexShrink:0}}>
                        <span style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:estadoGlow,color:estadoColor,border:`1px solid ${estadoGlow}`}}>{estadoLabel}</span>
                        <div style={{display:'flex',gap:5,flexWrap:'wrap',justifyContent:'flex-end'}}>
                          {n.estado_verificacion==='pendiente'&&<><button className="btn-admin btn-aprobar" onClick={e=>{e.stopPropagation();accionAdmin('aprobar',n.id)}}>✓ Aprobar</button><button className="btn-admin btn-rechazar" onClick={e=>{e.stopPropagation();accionAdmin('rechazar',n.id)}}>✗ Rechazar</button></>}
                          {(n.estado_verificacion==='trial'||n.estado_verificacion==='suspendido'||n.estado_verificacion==='rechazado')&&<button className="btn-admin btn-activar" onClick={e=>{e.stopPropagation();accionAdmin('activar',n.id)}}>Activar</button>}
                          {(n.estado_verificacion==='activo'||n.estado_verificacion==='trial')&&<button className="btn-admin btn-suspender" onClick={e=>{e.stopPropagation();accionAdmin('suspender',n.id)}}>Suspender</button>}
                        </div>
                        <span style={{fontSize:10,color:'#333'}}>{isExpanded?'▲ cerrar':'▼ detalle'}</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',padding:'20px 18px',background:'rgba(0,0,0,0.25)',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:20}}>
                        <div>
                          <p style={{fontSize:9,color:'#C9A84C',textTransform:'uppercase',letterSpacing:2,fontWeight:800,marginBottom:10}}>Info del negocio</p>
                          <div style={{display:'flex',flexDirection:'column',gap:6}}>
                            <span style={{fontSize:12,color:'#666'}}>📋 Tipo: <span style={{color:'#ccc'}}>{getTipoLabel(n.tipo_negocio)}</span></span>
                            <span style={{fontSize:12,color:'#666'}}>📍 Ubicación: <span style={{color:'#ccc'}}>{n.ciudad}, {n.estado}</span></span>
                            <span style={{fontSize:12,color:'#666'}}>📞 Tel: <span style={{color:'#ccc'}}>{n.telefono||'-'}</span></span>
                            {n.instagram&&<span style={{fontSize:12,color:'#666'}}>📸 IG: <a href={`https://instagram.com/${n.instagram}`} target="_blank" rel="noreferrer" style={{color:'#C9A84C'}}>@{n.instagram}</a></span>}
                            {n.facebook&&<span style={{fontSize:12,color:'#666'}}>📘 FB: <span style={{color:'#ccc'}}>{n.facebook}</span></span>}
                            <span style={{fontSize:11,color:'#444'}}>ID: <span style={{fontFamily:'monospace',color:'#555'}}>{n.id}</span></span>
                          </div>
                        </div>
                        <div>
                          <p style={{fontSize:9,color:'#C9A84C',textTransform:'uppercase',letterSpacing:2,fontWeight:800,marginBottom:10}}>💳 Pago manual</p>
                          <p style={{fontSize:12,color:'#555',lineHeight:1.6,marginBottom:10}}>Marcar que pagó y activar como Premium</p>
                          <button onClick={async(e)=>{e.stopPropagation();await accionAdmin('activar',n.id);setAdminMsg(`💰 ${n.nombre} activado como pagado`);setTimeout(()=>setAdminMsg(''),4000)}}
                            style={{width:'100%',background:'linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))',border:'1px solid rgba(201,168,76,0.3)',color:'#C9A84C',borderRadius:8,padding:'9px 14px',fontSize:12,fontWeight:700,cursor:'pointer',marginBottom:8,letterSpacing:0.5}}>
                            💰 Marcar como pagado
                          </button>
                          {n.telefono&&(
                            <a href={`https://wa.me/${n.telefono.replace(/\D/g,'')}?text=Hola%20${encodeURIComponent(n.nombre)}%2C%20te%20contactamos%20desde%20CutConnect.`} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                              style={{display:'block',background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.25)',color:'#25D366',borderRadius:8,padding:'9px 14px',fontSize:12,fontWeight:700,textDecoration:'none',textAlign:'center',letterSpacing:0.5}}>
                              📲 Contactar por WhatsApp
                            </a>
                          )}
                        </div>
                        <div>
                          <p style={{fontSize:9,color:'#C9A84C',textTransform:'uppercase',letterSpacing:2,fontWeight:800,marginBottom:10}}>Cuenta dueño</p>
                          <div style={{display:'flex',flexDirection:'column',gap:6}}>
                            <span style={{fontSize:12,color:'#666'}}>Email: <span style={{color:'#ccc'}}>{n.email_dueno}</span></span>
                            {n.fecha_registro&&<span style={{fontSize:12,color:'#666'}}>Registro: <span style={{color:'#ccc'}}>{new Date(n.fecha_registro).toLocaleDateString()}</span></span>}
                            <span style={{fontSize:12,color:'#666'}}>Estado: <span style={{color:estadoColor,fontWeight:700}}>{estadoLabel}</span></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

              {adminPage==='pendientes' && solPendientes.length>0 && (
                <div style={{marginTop:24}}>
                  <p style={{fontSize:10,color:'#C9A84C',textTransform:'uppercase',letterSpacing:2,fontWeight:700,marginBottom:12}}>💎 Solicitudes VIP y Publicidad pendientes</p>
                  {solPendientes.map((s:any)=>(
                    <div key={s.id} style={{background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:12,padding:'14px 18px',marginBottom:8,display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
                      <div style={{flex:1,minWidth:160}}>
                        <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{s.titulo}</div>
                        <div style={{fontSize:12,color:'#777'}}>{s.anunciante_nombre} · {s.anunciante_email}</div>
                        <div style={{fontSize:11,color:'#555'}}>{s.ciudad}, {s.pais} · {s.anunciante_telefono}</div>
                      </div>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        <button className="btn-admin btn-aprobar" onClick={async()=>{const fechaVenc=new Date();fechaVenc.setDate(fechaVenc.getDate()+30);await fetch(`${API}/api/admin/anuncios/${s.id}`,{method:'PUT',headers:{'Content-Type':'application/json','x-admin-token':'admin_token_cutconnect'},body:JSON.stringify({...s,activo:true,estado:'activo',fecha_vencimiento:fechaVenc.toISOString()})});if((s.titulo||'').includes('PRO')||(s.titulo||'').includes('VIP')){const uR=await fetch(`${SB_URL}/rest/v1/usuarios?email=eq.${encodeURIComponent(s.anunciante_email)}&select=id`,{headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`}}).then(r=>r.json()).catch(()=>[]);if(Array.isArray(uR)&&uR.length>0)await fetch(`${API}/api/admin/pro/${uR[0].id}`,{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':'admin_token_cutconnect'},body:JSON.stringify({activo:true})}).catch(()=>{})}setAdminMsg('Aprobado ✅');cargarAdminData();setTimeout(()=>setAdminMsg(''),3000)}}>✓ Aprobar</button>
                        <button className="btn-admin btn-rechazar" onClick={async()=>{await fetch(`${API}/api/admin/anuncios/${s.id}`,{method:'PUT',headers:{'Content-Type':'application/json','x-admin-token':'admin_token_cutconnect'},body:JSON.stringify({...s,activo:false,estado:'inactivo'})});cargarAdminData()}}>✗ Rechazar</button>
                        {s.anunciante_telefono&&<a href={`https://wa.me/${s.anunciante_telefono.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:4,background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.2)',color:'#25D366',borderRadius:6,padding:'4px 10px',fontSize:11,fontWeight:700,textDecoration:'none'}}>WhatsApp</a>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

          {/* NEGADOS */}
          {adminPage==='negados' && (
            <div>
              <p style={{fontSize:10,color:'#FF6B6B',textTransform:'uppercase',letterSpacing:2,fontWeight:700,marginBottom:16}}>Negocios rechazados</p>
              {negociosFiltrados.length===0&&<div style={{textAlign:'center',padding:'30px',color:'#444'}}>No hay negocios rechazados</div>}
              {negociosFiltrados.map((n:any)=>(
                <div key={n.id} style={{background:'rgba(255,107,107,0.04)',border:'1px solid rgba(255,107,107,0.12)',borderRadius:12,padding:'14px 18px',marginBottom:8,display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
                  <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{n.nombre}</div><div style={{fontSize:12,color:'#777'}}>{n.email_dueno} · {n.ciudad}</div></div>
                  <button className="btn-admin btn-activar" onClick={e=>{e.stopPropagation();accionAdmin('activar',n.id)}}>Reactivar</button>
                </div>
              ))}
              <p style={{fontSize:10,color:'#FF6B6B',textTransform:'uppercase',letterSpacing:2,fontWeight:700,marginBottom:16,marginTop:24}}>Solicitudes rechazadas / inactivas</p>
              {solicitudesPublicidad.filter((s:any)=>s.estado==='inactivo').length===0&&<div style={{textAlign:'center',padding:'30px',color:'#444'}}>No hay solicitudes rechazadas</div>}
              {solicitudesPublicidad.filter((s:any)=>s.estado==='inactivo').map((s:any)=>(
                <div key={s.id} style={{background:'rgba(255,107,107,0.04)',border:'1px solid rgba(255,107,107,0.12)',borderRadius:12,padding:'14px 18px',marginBottom:8,display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
                  <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{s.titulo}</div><div style={{fontSize:12,color:'#777'}}>{s.anunciante_nombre} · {s.anunciante_email}</div></div>
                  <span style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:'rgba(255,107,107,0.12)',color:'#FF6B6B',border:'1px solid rgba(255,107,107,0.2)'}}>Rechazado</span>
                </div>
              ))}
            </div>
          )}

          {/* VIP */}
          {adminPage==='vip' && (
            <div>
              <p style={{fontSize:10,color:'#C9A84C',textTransform:'uppercase',letterSpacing:2,fontWeight:700,marginBottom:16}}>Usuarios con Plan VIP activo</p>
              {solicitudesPublicidad.filter((s:any)=>s.estado==='activo'&&((s.titulo||'').includes('PRO')||(s.titulo||'').includes('VIP'))).length===0&&<div style={{textAlign:'center',padding:'40px',color:'#444'}}>No hay usuarios VIP activos aún</div>}
              {solicitudesPublicidad.filter((s:any)=>s.estado==='activo'&&((s.titulo||'').includes('PRO')||(s.titulo||'').includes('VIP'))).map((s:any)=>(
                <div key={s.id} style={{background:'rgba(201,168,76,0.05)',border:'1px solid rgba(201,168,76,0.2)',borderRadius:14,padding:'16px 18px',marginBottom:8,display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
                  <div style={{fontSize:28}}>💎</div>
                  <div style={{flex:1,minWidth:160}}>
                    <div style={{fontSize:15,fontWeight:700,color:'#fff'}}>{s.anunciante_nombre}</div>
                    <div style={{fontSize:12,color:'#777'}}>{s.anunciante_email}</div>
                    <div style={{fontSize:11,color:'#555'}}>{s.titulo}</div>
                    {s.fecha_vencimiento&&<div style={{fontSize:11,color:new Date(s.fecha_vencimiento)<new Date(Date.now()+3*24*60*60*1000)?'#FF6B6B':'#C9A84C',fontWeight:600,marginTop:4}}>Vence: {new Date(s.fecha_vencimiento).toLocaleDateString()}</div>}
                  </div>
                  <span style={{padding:'4px 12px',borderRadius:20,fontSize:11,fontWeight:700,background:'rgba(201,168,76,0.12)',color:'#C9A84C',border:'1px solid rgba(201,168,76,0.3)'}}>VIP Activo</span>
                  <button className="btn-admin btn-suspender" onClick={async()=>{await fetch(`${API}/api/admin/anuncios/${s.id}`,{method:'PUT',headers:{'Content-Type':'application/json','x-admin-token':'admin_token_cutconnect'},body:JSON.stringify({...s,activo:false,estado:'inactivo'})});const uR=await fetch(`${SB_URL}/rest/v1/usuarios?email=eq.${encodeURIComponent(s.anunciante_email)}&select=id`,{headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`}}).then(r=>r.json()).catch(()=>[]);if(Array.isArray(uR)&&uR.length>0)await fetch(`${API}/api/admin/pro/${uR[0].id}`,{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':'admin_token_cutconnect'},body:JSON.stringify({activo:false})}).catch(()=>{});cargarAdminData()}}>Desactivar</button>
                  {s.anunciante_telefono&&<a href={`https://wa.me/${s.anunciante_telefono.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:4,background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.2)',color:'#25D366',borderRadius:6,padding:'4px 10px',fontSize:11,fontWeight:700,textDecoration:'none'}}>WhatsApp</a>}
                </div>
              ))}
            </div>
          )}

          {/* PUBLICIDAD */}
          {adminPage==='publicidad' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:10,marginBottom:24}}>
                {[
                  {label:'Total activos',value:solicitudesPublicidad.filter((s:any)=>s.estado==='activo'&&!(s.titulo||'').includes('PRO')&&!(s.titulo||'').includes('VIP')).length,color:'#4ade80'},
                  {label:'Pendientes',value:solPendientes.filter((s:any)=>!(s.titulo||'').includes('PRO')&&!(s.titulo||'').includes('VIP')).length,color:'#FFA500'},
                  {label:'Ciudades',value:[...new Set(solicitudesPublicidad.filter((s:any)=>s.estado==='activo'&&!(s.titulo||'').includes('PRO')&&!(s.titulo||'').includes('VIP')).map((s:any)=>s.ciudad))].length,color:'#BB8FCE'},
                ].map((s,i)=>(
                  <div key={i} style={{background:'rgba(12,12,22,0.9)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:12,padding:'16px 12px',textAlign:'center'}}>
                    <div style={{fontSize:28,fontWeight:900,color:s.color,lineHeight:1}}>{s.value}</div>
                    <div style={{fontSize:9,color:'#555',marginTop:5,textTransform:'uppercase',letterSpacing:1}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <p style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:2,fontWeight:700,marginBottom:16}}>Anuncios de publicidad activos</p>
              {solicitudesPublicidad.filter((s:any)=>s.estado==='activo'&&!(s.titulo||'').includes('PRO')&&!(s.titulo||'').includes('VIP')).length===0&&<div style={{textAlign:'center',padding:'40px',color:'#333'}}><p>No hay publicidad activa aún</p></div>}
              {solicitudesPublicidad.filter((s:any)=>s.estado==='activo'&&!(s.titulo||'').includes('PRO')&&!(s.titulo||'').includes('VIP')).map((s:any)=>(
                <div key={s.id} style={{background:'rgba(12,12,22,0.9)',border:'1px solid rgba(74,222,128,0.12)',borderRadius:14,padding:'16px 18px',marginBottom:8,display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
                  {s.imagen_url&&<img src={s.imagen_url} alt={s.titulo} style={{width:90,height:56,borderRadius:10,objectFit:'cover',flexShrink:0}}/>}
                  <div style={{flex:1,minWidth:160}}>
                    <div style={{fontSize:15,fontWeight:700,color:'#fff',marginBottom:3}}>{s.titulo}</div>
                    <div style={{fontSize:12,color:'#555'}}>{s.anunciante_nombre} · {s.ciudad}, {s.pais}</div>
                    <div style={{fontSize:11,color:'#3a3a4a'}}>{s.anunciante_email}</div>
                    {s.fecha_vencimiento&&<div style={{fontSize:11,color:new Date(s.fecha_vencimiento)<new Date(Date.now()+3*24*60*60*1000)?'#FF6B6B':'#C9A84C',marginTop:4,fontWeight:600}}>Vence: {new Date(s.fecha_vencimiento).toLocaleDateString()}</div>}
                  </div>
                  <span style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:'rgba(74,222,128,0.12)',color:'#4ade80',border:'1px solid rgba(74,222,128,0.2)'}}>Activo</span>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    <button className="btn-admin btn-suspender" onClick={async()=>{await fetch(`${API}/api/admin/anuncios/${s.id}`,{method:'PUT',headers:{'Content-Type':'application/json','x-admin-token':'admin_token_cutconnect'},body:JSON.stringify({...s,activo:false,estado:'inactivo'})});cargarAdminData()}}>Desactivar</button>
                    {s.anunciante_telefono&&<a href={`https://wa.me/${s.anunciante_telefono.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:4,background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.2)',color:'#25D366',borderRadius:6,padding:'4px 10px',fontSize:11,fontWeight:700,textDecoration:'none'}}>WhatsApp</a>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* INGRESOS */}
          {adminPage==='ingresos' && (
            <div>
              <p style={{fontSize:10,color:'#C9A84C',textTransform:'uppercase',letterSpacing:2,fontWeight:700,marginBottom:20}}>Dashboard de ingresos</p>
              {(()=>{
                const vipActivos=solicitudesPublicidad.filter((s:any)=>s.estado==='activo'&&((s.titulo||'').includes('PRO')||(s.titulo||'').includes('VIP')))
                const pubActivos=solicitudesPublicidad.filter((s:any)=>s.estado==='activo'&&!(s.titulo||'').includes('PRO')&&!(s.titulo||'').includes('VIP'))
                const ingVIP=vipActivos.length*3.99
                const ingPub=pubActivos.length*9.99
                const total=ingVIP+ingPub
                return (
                  <div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12,marginBottom:28}}>
                      {[
                        {label:'Usuarios VIP activos',value:vipActivos.length,color:'#C9A84C',icon:'💎'},
                        {label:'Publicidad activa',value:pubActivos.length,color:'#00D4FF',icon:'📢'},
                        {label:'Ingresos VIP/mes',value:'$'+ingVIP.toFixed(2),color:'#2ECC71',icon:'💰'},
                        {label:'Ingresos Pub/mes',value:'$'+ingPub.toFixed(2),color:'#BB8FCE',icon:'📊'},
                        {label:'Total mensual est.',value:'$'+total.toFixed(2),color:'#fff',icon:'🏆'},
                        {label:'Pendientes',value:adminNegocios.filter(n=>n.estado_verificacion==='pendiente').length+solPendientes.length,color:'#FFA500',icon:'⏳'},
                      ].map((s,i)=>(
                        <div key={i} style={{background:'rgba(12,12,22,0.9)',border:`1px solid ${s.color}22`,borderRadius:14,padding:'20px 16px',textAlign:'center'}}>
                          <div style={{fontSize:24,marginBottom:6}}>{s.icon}</div>
                          <div style={{fontSize:22,fontWeight:900,color:s.color,lineHeight:1}}>{s.value}</div>
                          <div style={{fontSize:9,color:'#555',marginTop:6,textTransform:'uppercase',letterSpacing:1}}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <p style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:2,fontWeight:700,marginBottom:12}}>Usuarios VIP activos</p>
                    {vipActivos.map((s:any)=>(
                      <div key={s.id} style={{background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.1)',borderRadius:10,padding:'10px 16px',marginBottom:6,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div><span style={{fontSize:13,color:'#fff',fontWeight:600}}>{s.anunciante_nombre}</span><span style={{fontSize:11,color:'#555',marginLeft:8}}>{s.anunciante_email}</span></div>
                        <span style={{fontSize:13,fontWeight:700,color:'#C9A84C'}}>$3.99/mes</span>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!loggedIn && appMode==='public') return <PublicPage onLogin={() => setAppMode('login')} onRegister={() => setAppMode('register')} />

  if (!loggedIn && appMode==='login') return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-section"><h1>Cut<span>Connect</span></h1></div>
        <p className="form-subtitle">Iniciar Sesión</p>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group"><label>Email</label><input type="email" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Contraseña</label><PasswordInput value={password} onChange={(e:any)=>setPassword(e.target.value)} required /></div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>{loading?'Entrando...':'Iniciar Sesión'}</button>
        </form>
        <div className="auth-links">
          <button className="link-btn" onClick={() => setAppMode('public')}>← Volver</button>
          <button className="link-btn" onClick={() => setAppMode('recovery')}>¿Olvidaste tu contraseña?</button>
        </div>
        <div style={{textAlign:'center',marginTop:16}}>
          <span style={{color:'#555',fontSize:13}}>¿No tienes cuenta? </span>
          <button className="link-btn" style={{color:'#C9A84C'}} onClick={() => setAppMode('register')}>Regístrate gratis</button>
        </div>
      </div>
    </div>
  )

  if (!loggedIn && appMode==='register') {
    if (rol==='dueño') return (
      <div className="login-container">
        <div className="login-box large-box">
          <div className="logo-section"><h1>Cut<span>Connect</span></h1></div>
          <p className="form-subtitle">Registrar mi negocio</p>
          <form onSubmit={handleRegisterDueno} className="owner-form">
            <fieldset className="form-section"><legend>País</legend>
              <select value={ownerData.pais} onChange={e=>setOwnerData({...ownerData,pais:e.target.value})}
                style={{width:'100%',background:'#1a1a1a',color:'#fff',border:'1px solid rgba(201,168,76,0.3)',borderRadius:10,padding:'10px 14px',fontSize:14,appearance:'none',cursor:'pointer'}}>
                  <option value="Argentina">Argentina</option>
                  <option value="Bolivia">Bolivia</option>
                  <option value="Chile">Chile</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Costa Rica">Costa Rica</option>
                  <option value="Cuba">Cuba</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="El Salvador">El Salvador</option>
                  <option value="Guatemala">Guatemala</option>
                  <option value="Honduras">Honduras</option>
                  <option value="México">México</option>
                  <option value="Nicaragua">Nicaragua</option>
                  <option value="Panamá">Panamá</option>
                  <option value="Paraguay">Paraguay</option>
                  <option value="Perú">Perú</option>
                  <option value="Puerto Rico">Puerto Rico</option>
                  <option value="República Dominicana">República Dominicana</option>
                  <option value="Uruguay">Uruguay</option>
                  <option value="Venezuela">Venezuela</option>
              </select>
            </fieldset>
            <fieldset className="form-section"><legend>Tipo de negocio</legend>
              <div className="category-selector" style={{gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
                <button type="button" className={`category-btn ${ownerData.tipo_negocio==='barberia'?'active':''}`} onClick={()=>setOwnerData({...ownerData,tipo_negocio:'barberia'})}><span className="cat-icon">✂️</span>Barbería</button>
                <button type="button" className={`category-btn ${ownerData.tipo_negocio==='peluqueria'?'active':''}`} onClick={()=>setOwnerData({...ownerData,tipo_negocio:'peluqueria'})}><span className="cat-icon">💇</span>Peluquería</button>
                <button type="button" className={`category-btn ${ownerData.tipo_negocio==='spa'?'active':''}`} onClick={()=>setOwnerData({...ownerData,tipo_negocio:'spa'})}><span className="cat-icon">🧖</span>Spa</button>
                <button type="button" className={`category-btn ${ownerData.tipo_negocio==='gimnasio'?'active':''}`} onClick={()=>setOwnerData({...ownerData,tipo_negocio:'gimnasio'})}><span className="cat-icon">🏋️</span>Gimnasio</button>
                <button type="button" className={`category-btn ${ownerData.tipo_negocio==='manicurista'?'active':''}`} onClick={()=>setOwnerData({...ownerData,tipo_negocio:'manicurista'})}><span className="cat-icon">💅</span>Manicure & Pedicure</button>
                <button type="button" className={`category-btn ${ownerData.tipo_negocio==='estetica'?'active':''}`} onClick={()=>setOwnerData({...ownerData,tipo_negocio:'estetica'})}><span className="cat-icon">💄</span>Estética</button>
                <button type="button" className={`category-btn ${ownerData.tipo_negocio==='masajes'?'active':''}`} onClick={()=>setOwnerData({...ownerData,tipo_negocio:'masajes'})}><span className="cat-icon">💆</span>Masajes</button>
                <button type="button" className={`category-btn ${ownerData.tipo_negocio==='tatuajes'?'active':''}`} onClick={()=>setOwnerData({...ownerData,tipo_negocio:'tatuajes'})}><span className="cat-icon">🎨</span>Tatuajes & Piercing</button>
                <button type="button" className={`category-btn ${ownerData.tipo_negocio==='cejas'?'active':''}`} onClick={()=>setOwnerData({...ownerData,tipo_negocio:'cejas'})}><span className="cat-icon">👁️</span>Cejas & Depilación</button>
                <button type="button" className={`category-btn ${ownerData.tipo_negocio==='veterinaria'?'active':''}`} onClick={()=>setOwnerData({...ownerData,tipo_negocio:'veterinaria'})}><span className="cat-icon">🐾</span>Peluquería Canina</button>
              </div>
            </fieldset>
            <fieldset className="form-section"><legend>Acceso</legend>
              <div className="form-group"><label>Email</label><input type="email" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
              <div className="form-group"><label>Contraseña</label><PasswordInput value={password} onChange={(e:any)=>setPassword(e.target.value)} required /></div>
            </fieldset>
            <fieldset className="form-section"><legend>Datos del negocio</legend>
              <div className="form-group"><label>Nombre del negocio</label><input type="text" placeholder="Barbería El Rey" value={ownerData.negocio_nombre} onChange={e=>setOwnerData({...ownerData,negocio_nombre:e.target.value})} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Departamento / Estado</label><input type="text" placeholder="Antioquia" value={ownerData.estado} onChange={e=>setOwnerData({...ownerData,estado:e.target.value})} required /></div>
                <div className="form-group"><label>Ciudad</label><input type="text" placeholder="Medellín" value={ownerData.ciudad} onChange={e=>setOwnerData({...ownerData,ciudad:e.target.value})} required /></div>
              </div>
              <div className="form-group"><label>Dirección</label><input type="text" placeholder="Calle 50 #30-15" value={ownerData.direccion} onChange={e=>setOwnerData({...ownerData,direccion:e.target.value})} required /></div>
              <div className="form-group"><label>Teléfono</label><input type="tel" placeholder="+57 300 000 0000" value={ownerData.negocio_telefono} onChange={e=>setOwnerData({...ownerData,negocio_telefono:e.target.value})} required /></div>
              <div className="form-group"><label>Descripción</label><textarea placeholder="Cuéntanos sobre tu negocio..." value={ownerData.negocio_descripcion} onChange={e=>setOwnerData({...ownerData,negocio_descripcion:e.target.value})} /></div>
            </fieldset>
            <fieldset className="form-section"><legend>Ubicación GPS</legend>
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
            <div className="form-group"><label>País</label>
              <select value={paisSeleccionado} onChange={e=>setPaisSeleccionado(e.target.value)}
                style={{width:'100%',background:'#1a1a1a',color:'#fff',border:'1px solid rgba(201,168,76,0.3)',borderRadius:10,padding:'10px 14px',fontSize:14,appearance:'none',cursor:'pointer'}}>
                  <option value="Argentina">Argentina</option>
                  <option value="Bolivia">Bolivia</option>
                  <option value="Chile">Chile</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Costa Rica">Costa Rica</option>
                  <option value="Cuba">Cuba</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="El Salvador">El Salvador</option>
                  <option value="Guatemala">Guatemala</option>
                  <option value="Honduras">Honduras</option>
                  <option value="México">México</option>
                  <option value="Nicaragua">Nicaragua</option>
                  <option value="Panamá">Panamá</option>
                  <option value="Paraguay">Paraguay</option>
                  <option value="Perú">Perú</option>
                  <option value="Puerto Rico">Puerto Rico</option>
                  <option value="República Dominicana">República Dominicana</option>
                  <option value="Uruguay">Uruguay</option>
                  <option value="Venezuela">Venezuela</option>
              </select>
            </div>
            <div className="form-group"><label>Email</label><input type="email" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
            <div className="form-group"><label>Contraseña</label><PasswordInput value={password} onChange={(e:any)=>setPassword(e.target.value)} required /></div>
            <div className="form-group"><label>Soy</label>
              <select value={rol} onChange={e=>setRol(e.target.value)} required>
                <option value="cliente">Cliente - Quiero agendar citas</option>
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

  if (!loggedIn && appMode==='recovery') return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-section"><h1>Cut<span>Connect</span></h1></div>
        <p className="form-subtitle">Recuperar contraseña</p>
        <form onSubmit={handleRecuperarContrasena} className="auth-form">
          <div className="form-group"><label>Email registrado</label><input type="email" placeholder="tu@email.com" value={recoveryEmail} onChange={e=>setRecoveryEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Nueva contraseña</label><PasswordInput value={recoveryPassword} onChange={(e:any)=>setRecoveryPassword(e.target.value)} required /></div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>{loading?'Procesando...':'Cambiar contraseña'}</button>
        </form>
        <button className="link-btn" onClick={()=>setAppMode('login')}>← Volver</button>
      </div>
    </div>
  )

  if (loggedIn && userData?.rol==='cliente') return (
    <div className="dashboard-container">
      {modalCal && <ModalCalificacion {...modalCal} onClose={()=>setModalCal(null)} onDone={()=>cargarDatos()} />}
      {modalBarberoFull&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setModalBarberoFull(null)}>
          <div style={{background:'#111',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,padding:28,maxWidth:400,width:'100%',maxHeight:'85vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:'center',marginBottom:20}}>
              {modalBarberoFull.foto?<img src={modalBarberoFull.foto} alt="" style={{width:90,height:90,borderRadius:'50%',objectFit:'cover',border:'3px solid #C9A84C',marginBottom:12}} />:<div style={{width:90,height:90,borderRadius:'50%',background:'linear-gradient(135deg,#C9A84C,#8B6914)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,fontWeight:700,color:'#fff',margin:'0 auto 12px'}}>{(modalBarberoFull.nombre||'B')[0].toUpperCase()}</div>}
              <h3 style={{fontSize:20,fontWeight:800,color:'#fff',margin:0}}>{modalBarberoFull.nombre}</h3>
              {modalBarberoFull.especialidad&&<p style={{color:'#C9A84C',fontSize:13,marginTop:4,fontWeight:600}}>{modalBarberoFull.especialidad}</p>}
              {modalBarberoFull.calificacion_promedio>0&&<p style={{color:'#F1C40F',fontSize:13,marginTop:4}}>{'★'.repeat(Math.round(modalBarberoFull.calificacion_promedio))} {Number(modalBarberoFull.calificacion_promedio).toFixed(1)}</p>}
            </div>
            {modalBarberoFull.descripcion&&<p style={{color:'#aaa',fontSize:13,lineHeight:1.6,marginBottom:16,textAlign:'center'}}>{modalBarberoFull.descripcion}</p>}
            {(modalBarberoFull.instagram||modalBarberoFull.facebook||modalBarberoFull.web)&&(
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
                <p style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:2,fontWeight:700,marginBottom:4}}>Redes sociales</p>
                {modalBarberoFull.instagram&&<a href={`https://instagram.com/${modalBarberoFull.instagram}`} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:10,background:'linear-gradient(135deg,rgba(131,58,180,0.15),rgba(253,29,29,0.1))',border:'1px solid rgba(253,29,29,0.25)',borderRadius:12,padding:'10px 16px',textDecoration:'none'}}>
                  <span style={{fontSize:20}}>📸</span><span style={{color:'#fd1d1d',fontWeight:700,fontSize:13}}>@{modalBarberoFull.instagram}</span>
                </a>}
                {modalBarberoFull.facebook&&<a href={modalBarberoFull.facebook.startsWith('http')?modalBarberoFull.facebook:`https://facebook.com/${modalBarberoFull.facebook}`} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:10,background:'rgba(24,119,242,0.1)',border:'1px solid rgba(24,119,242,0.25)',borderRadius:12,padding:'10px 16px',textDecoration:'none'}}>
                  <span style={{fontSize:20}}>📘</span><span style={{color:'#1877F2',fontWeight:700,fontSize:13}}>Facebook</span>
                </a>}
                {modalBarberoFull.web&&<a href={modalBarberoFull.web.startsWith('http')?modalBarberoFull.web:`https://${modalBarberoFull.web}`} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:10,background:'rgba(201,168,76,0.08)',border:'1px solid rgba(201,168,76,0.25)',borderRadius:12,padding:'10px 16px',textDecoration:'none'}}>
                  <span style={{fontSize:20}}>🌐</span><span style={{color:'#C9A84C',fontWeight:700,fontSize:13}}>Sitio web</span>
                </a>}
              </div>
            )}
            {modalBarberoFull.whatsapp&&<a href={`https://wa.me/${modalBarberoFull.whatsapp}`} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'rgba(37,211,102,0.1)',border:'1px solid rgba(37,211,102,0.3)',borderRadius:12,padding:'12px',textDecoration:'none',marginBottom:16}}>
              <span style={{fontSize:18}}>💬</span><span style={{color:'#25D166',fontWeight:700,fontSize:13}}>Escribir por WhatsApp</span>
            </a>}
            <button onClick={()=>setModalBarberoFull(null)} style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'12px',color:'#555',fontWeight:700,cursor:'pointer',fontSize:13}}>Cerrar</button>
          </div>
        </div>
      )}
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
              <p><strong>Citas pendientes:</strong> {citas.length}</p>
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
            <AdBanner banners={adBanners} />
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
                {['todos','barberia','peluqueria','spa','gimnasio','manicurista','estetica','masajes','tatuajes','cejas','veterinaria'].map(t=>(
                  <button key={t} className={`tipo-btn ${tipoNegocioFiltro===t?'active':''}`} onClick={()=>{setTipoNegocioFiltro(t);if(gpsUsado)buscarPorGPS()}}>
                    {t==='todos'?'Todos':getTipoLabel(t)}
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
                <h3>{gpsUsado?'Cerca de ti':'Resultados'} - {barberias.length} negocios</h3>
                <div className="barberias-grid">
                  {barberias.map((b:any) => (
                    <div key={b.id} className={`barberia-card ${selectedBarberia?.id===b.id?'selected':''}`}>
                      <div className="barberia-card-banner">
                        <img src={b.logo||(b.tipo_negocio==='peluqueria'?IMAGEN_PELUQUERIA:IMAGEN_BARBERIA)} alt={b.nombre} onError={(e:any)=>{e.target.src=b.tipo_negocio==='peluqueria'?IMAGEN_PELUQUERIA:IMAGEN_BARBERIA}} />
                        <div className="barberia-card-banner-overlay" />
                        <div className="barberia-card-banner-tipo">{getTipoEmoji(b.tipo_negocio)} {getTipoLabel(b.tipo_negocio)}</div>
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
                          <button style={{background:'transparent',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#555',fontSize:11,padding:'8px 12px',cursor:'pointer',fontWeight:700,textTransform:'uppercase',letterSpacing:1}} onClick={()=>setModalCal({tipo:'barberia',id:b.id,barberiaId:b.id,usuarioId:userData.id,nombre:b.nombre})}>Calificar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {barberias.length===0&&!buscando&&<div className="empty-state"><div className="empty-icon">-</div><p>Usa el GPS o busca por ciudad para ver negocios disponibles</p></div>}
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
                            {(b.instagram||b.facebook||b.web)&&(
                              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
                                {b.instagram&&<a href={`https://instagram.com/${b.instagram}`} target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:4,background:'linear-gradient(135deg,rgba(131,58,180,0.15),rgba(253,29,29,0.1))',border:'1px solid rgba(253,29,29,0.2)',color:'#fd1d1d',borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:700,textDecoration:'none'}}>📸 @{b.instagram}</a>}
                                {b.facebook&&<a href={b.facebook.startsWith('http')?b.facebook:`https://facebook.com/${b.facebook}`} target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:4,background:'rgba(24,119,242,0.1)',border:'1px solid rgba(24,119,242,0.2)',color:'#1877F2',borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:700,textDecoration:'none'}}>📘 Facebook</a>}
                                {b.web&&<a href={b.web.startsWith('http')?b.web:`https://${b.web}`} target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:4,background:'rgba(201,168,76,0.08)',border:'1px solid rgba(201,168,76,0.2)',color:'#C9A84C',borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:700,textDecoration:'none'}}>🌐 Sitio web</a>}
                              </div>
                            )}
                            <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:12}}>
                              {DIAS.map(dia=>{const h=b.horario[dia];return h?.activo?<span key={dia} style={{background:'rgba(201,168,76,0.08)',color:'#C9A84C',border:'1px solid rgba(201,168,76,0.2)',borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>{DIAS_LABELS[dia]}</span>:null})}
                            </div>
                            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                              <button className={`btn-elegir ${selectedBarbero?.id===b.id?'selected':''}`} onClick={()=>{setSelectedBarbero(b);setFormData({...formData,barbero_id:b.id,hora:''})}}>
                                {selectedBarbero?.id===b.id?'Seleccionado':'Elegir'}
                              </button>
                              <button style={{background:'rgba(201,168,76,0.06)',border:'1px solid rgba(201,168,76,0.2)',borderRadius:8,color:'#C9A84C',fontSize:11,padding:'8px 12px',cursor:'pointer',fontWeight:700,textTransform:'uppercase',letterSpacing:1}} onClick={async()=>{try{const r=await fetch(`${API}/api/barbero/perfil/${b.usuario_id}`);const d=await r.json();if(d.success&&d.data)setModalBarberoFull(d.data);else setModalBarberoFull({...b,nombre:b.nombre})}catch{setModalBarberoFull({...b,nombre:b.nombre})}}}>👤 Ver perfil</button>
                              <button style={{background:'transparent',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#555',fontSize:11,padding:'8px 12px',cursor:'pointer',fontWeight:700,textTransform:'uppercase',letterSpacing:1}} onClick={()=>setModalCal({tipo:'barbero',id:b.id,barberiaId:selectedBarberia.id,usuarioId:userData.id,nombre:b.nombre})}>Calificar</button>
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
                  <div className="form-group"><label>Servicio</label>
                    <select value={formData.servicio_id} onChange={e=>setFormData({...formData,servicio_id:e.target.value})} required>
                      <option value="">Selecciona un servicio</option>
                      {servicios.map((s:any)=><option key={s.id} value={s.id}>{s.nombre} - ${s.precio}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Fecha</label>
                    <input type="date" value={formData.fecha} onChange={e=>setFormData({...formData,fecha:e.target.value,hora:''})} required min={new Date().toISOString().split('T')[0]} />
                  </div>
                  {formData.fecha && (
                    <div className="form-group"><label>Hora disponible</label>
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
            <h2>Mis citas pendientes</h2>
            {selectedBarberia && <FidelizacionCard barberiaId={selectedBarberia.id} usuarioId={userData.id} />}
            {citas.length===0
              ? <div className="empty-state"><div className="empty-icon">-</div><p>No tienes citas pendientes</p><button onClick={()=>setCurrentPage('agendar')} className="btn-primary">Agendar una cita</button></div>
              : <div className="citas-grid">
                  {citas.filter(esCitaVigente).map((c:any)=>(
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

  if (loggedIn && userData?.rol==='barbero') {
    const hoy = new Date().toISOString().split('T')[0]
    const citasHoy = citas.filter((c:any) => c.fecha === hoy)
    const citasProximas = citas.filter((c:any) => c.fecha > hoy).slice(0, 3)
    const isProB = proActB
    const isPendingB = proPendB && !proActB
    const nowB = new Date()
    const citasComp = citas.filter((c:any)=>c.estado==='completada')
    const ingrHoyB = citasComp.filter((c:any)=>c.fecha===nowB.toISOString().split('T')[0]).reduce((a:any,c:any)=>a+(c.servicio?.precio||0),0)
    const ingrSemB = citasComp.filter((c:any)=>{const d=new Date(c.fecha);return d>=new Date(nowB.getFullYear(),nowB.getMonth(),nowB.getDate()-nowB.getDay())}).reduce((a:any,c:any)=>a+(c.servicio?.precio||0),0)
    const ingrMesB = citasComp.filter((c:any)=>c.fecha?.startsWith(nowB.toISOString().slice(0,7))).reduce((a:any,c:any)=>a+(c.servicio?.precio||0),0)
    return (
      <div className="dashboard-container">
        <nav className="navbar">
          <div className="navbar-left"><div className="navbar-brand"><h1>Cut<span>Connect</span></h1></div><span className="role-badge">Barbero</span></div>
          <div className="nav-links">
            <button className={currentPage==='dashboard'?'active':''} onClick={()=>setCurrentPage('dashboard')}>Inicio</button>
            <button className={currentPage==='citas'?'active':''} onClick={()=>{setCurrentPage('citas');cargarCitasBarbero()}}>
              Citas {citas.length>0&&<span style={{background:'#C9A84C',color:'#000',borderRadius:10,padding:'1px 6px',fontSize:10,fontWeight:900,marginLeft:4}}>{citas.length}</span>}
            </button>
            <button className={currentPage==='perfil'?'active':''} onClick={()=>{setCurrentPage('perfil');cargarPerfilBarbero()}}>Mi perfil</button>
            <button className={currentPage==='pro'?'active':''} onClick={()=>{if(isProB){setCurrentPage('pro')}else{setCurrentPage('pro')}}} style={{color:isProB?'#2ECC71':'#C9A84C',fontWeight:700}}>💎 VIP{isProB&&<span style={{marginLeft:4,fontSize:8,verticalAlign:'middle',color:'#2ECC71'}}>●</span>}</button>
            <button className="btn-logout" onClick={handleLogout}>Salir</button>
          </div>
        </nav>
        <div className="dashboard-content">
          {currentPage==='dashboard' && (
            <div className="page">
              <div style={{background:'linear-gradient(135deg,#141414,#1a1a1a)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:20,padding:28,marginBottom:20,display:'flex',alignItems:'center',gap:20}}>
                <div style={{position:'relative'}}>
                  <BarberoAvatar foto={perfilBarbero?.foto} nombre={userData?.nombre||'B'} size={80} />
                  <div style={{position:'absolute',bottom:2,right:2,width:14,height:14,borderRadius:'50%',background:'#2ECC71',border:'2px solid #141414'}}></div>
                </div>
                <div style={{flex:1}}>
                  <p style={{fontSize:11,color:'#555',textTransform:'uppercase',letterSpacing:2,marginBottom:4}}>Bienvenido de vuelta</p>
                  <h2 style={{margin:0,fontSize:22,fontWeight:800}}>{userData?.nombre}</h2>
                  <p style={{color:'#C9A84C',fontSize:13,marginTop:4,fontWeight:600}}>{perfilBarbero?.especialidad||'Profesional'}</p>
                  {perfilBarbero?.calificacion_promedio>0&&(<div style={{display:'flex',alignItems:'center',gap:6,marginTop:6}}><StarRating value={Math.round(perfilBarbero.calificacion_promedio)} /><span style={{color:'#777',fontSize:12}}>{Number(perfilBarbero.calificacion_promedio).toFixed(1)}</span></div>)}
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:20}}>
                <div style={{background:'linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))',border:'1px solid rgba(201,168,76,0.2)',borderRadius:14,padding:'18px 14px',textAlign:'center'}}>
                  <p style={{fontSize:32,fontWeight:900,color:'#C9A84C',margin:0}}>{citasHoy.length}</p>
                  <p style={{fontSize:10,color:'#777',textTransform:'uppercase',letterSpacing:1,marginTop:4}}>Hoy</p>
                </div>
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,padding:'18px 14px',textAlign:'center'}}>
                  <p style={{fontSize:32,fontWeight:900,color:'#fff',margin:0}}>{citas.length}</p>
                  <p style={{fontSize:10,color:'#777',textTransform:'uppercase',letterSpacing:1,marginTop:4}}>Pendientes</p>
                </div>
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,padding:'18px 14px',textAlign:'center'}}>
                  <p style={{fontSize:32,fontWeight:900,color:'#2ECC71',margin:0}}>{perfilBarbero?.calificacion_promedio>0?Number(perfilBarbero.calificacion_promedio).toFixed(1):'-'}</p>
                  <p style={{fontSize:10,color:'#777',textTransform:'uppercase',letterSpacing:1,marginTop:4}}>Rating</p>
                </div>
              </div>
              {citasHoy.length > 0 && (
                <div style={{marginBottom:20}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:'#C9A84C'}}></div>
                    <p style={{fontSize:11,color:'#C9A84C',textTransform:'uppercase',letterSpacing:2,fontWeight:700}}>Citas de hoy</p>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {citasHoy.map((c:any)=>(
                      <div key={c.id} style={{background:'linear-gradient(135deg,rgba(201,168,76,0.08),rgba(201,168,76,0.02))',border:'1px solid rgba(201,168,76,0.2)',borderRadius:14,padding:16}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                          <div>
                            <p style={{fontWeight:700,fontSize:15,color:'#fff',marginBottom:2}}>{c.cliente?.nombre||'Cliente'}</p>
                            <p style={{fontSize:12,color:'#777'}}>{c.servicio?.nombre}</p>
                          </div>
                          <div style={{background:'rgba(201,168,76,0.15)',borderRadius:8,padding:'6px 12px',textAlign:'center'}}>
                            <p style={{fontSize:16,fontWeight:900,color:'#C9A84C'}}>{c.hora}</p>
                          </div>
                        </div>
                        {c.cliente?.telefono&&<p style={{fontSize:11,color:'#555',marginBottom:12}}>📞 {c.cliente.telefono}</p>}
                        <div style={{display:'flex',gap:8}}>
                          <button onClick={()=>completarCita(c.id)} style={{flex:1,background:'rgba(46,204,113,0.12)',border:'1px solid rgba(46,204,113,0.3)',borderRadius:10,color:'#2ECC71',padding:'11px',fontSize:13,fontWeight:700,cursor:'pointer'}}>✓ Servicio realizado</button>
                          <button onClick={()=>cancelarCita(c.id)} style={{background:'rgba(231,76,60,0.08)',border:'1px solid rgba(231,76,60,0.2)',borderRadius:10,color:'#FF6B6B',padding:'11px 16px',fontSize:13,fontWeight:700,cursor:'pointer'}}>✗</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {citasHoy.length === 0 && (
                <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:14,padding:24,textAlign:'center',marginBottom:20}}>
                  <p style={{fontSize:28,marginBottom:8}}>✂️</p>
                  <p style={{color:'#555',fontSize:14}}>Sin citas para hoy</p>
                </div>
              )}
              {citasProximas.length > 0 && (
                <div style={{marginBottom:20}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:'#555'}}></div>
                    <p style={{fontSize:11,color:'#777',textTransform:'uppercase',letterSpacing:2,fontWeight:700}}>Próximas citas</p>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {citasProximas.map((c:any)=>(
                      <div key={c.id} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:12,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div>
                          <p style={{fontWeight:600,fontSize:14,color:'#fff',marginBottom:2}}>{c.cliente?.nombre||'Cliente'}</p>
                          <p style={{fontSize:12,color:'#555'}}>{c.servicio?.nombre}</p>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <p style={{fontSize:13,fontWeight:700,color:'#777'}}>{c.fecha}</p>
                          <p style={{fontSize:12,color:'#555'}}>{c.hora}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={()=>{setCurrentPage('citas');cargarCitasBarbero()}} className="btn-primary" style={{width:'100%',padding:14}}>Ver todas las citas</button>
            </div>
          )}
          {currentPage==='citas' && (
            <div className="page">
              <h2>Mis citas - {citas.length}</h2>
              {citas.filter(esCitaVigente).length===0
                ? <div className="empty-state"><p style={{fontSize:32,marginBottom:8}}>✂️</p><p>No tienes citas pendientes</p></div>
                : <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {citas.filter(esCitaVigente).map((c:any)=>(
                      <div key={c.id} style={{background:c.fecha===hoy?'linear-gradient(135deg,rgba(201,168,76,0.08),rgba(201,168,76,0.02))':'rgba(255,255,255,0.02)',border:c.fecha===hoy?'1px solid rgba(201,168,76,0.2)':'1px solid rgba(255,255,255,0.05)',borderRadius:14,padding:18}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                          <div>
                            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                              <p style={{fontWeight:700,fontSize:15,color:'#fff'}}>{c.cliente?.nombre||'Cliente'}</p>
                              {c.fecha===hoy&&<span style={{background:'rgba(201,168,76,0.2)',color:'#C9A84C',fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:6,textTransform:'uppercase',letterSpacing:1}}>Hoy</span>}
                            </div>
                            <p style={{fontSize:13,color:'#777'}}>{c.servicio?.nombre}</p>
                            {c.cliente?.telefono&&<p style={{fontSize:12,color:'#555',marginTop:4}}>📞 {c.cliente.telefono}</p>}
                          </div>
                          <div style={{background:'rgba(255,255,255,0.05)',borderRadius:10,padding:'8px 14px',textAlign:'center'}}>
                            <p style={{fontSize:15,fontWeight:900,color:c.fecha===hoy?'#C9A84C':'#fff'}}>{c.hora}</p>
                            <p style={{fontSize:10,color:'#555',marginTop:2}}>{c.fecha}</p>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:8}}>
                          <button onClick={()=>completarCita(c.id)} style={{flex:1,background:'rgba(46,204,113,0.1)',border:'1px solid rgba(46,204,113,0.25)',borderRadius:10,color:'#2ECC71',padding:'11px',fontSize:13,fontWeight:700,cursor:'pointer'}}>✓ Servicio realizado</button>
                          <button onClick={()=>cancelarCita(c.id)} style={{background:'rgba(231,76,60,0.08)',border:'1px solid rgba(231,76,60,0.2)',borderRadius:10,color:'#FF6B6B',padding:'11px 16px',fontSize:13,fontWeight:700,cursor:'pointer'}}>✗ Cancelar</button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
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
                      {perfilBarbero.instagram&&<a href={`https://instagram.com/${perfilBarbero.instagram}`} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:10,background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',color:'#fff',borderRadius:20,padding:'6px 16px',fontSize:12,fontWeight:700,textDecoration:'none'}}>📸 @{perfilBarbero.instagram}</a>}
                    </div>
                    <div>
                      <h3 style={{marginBottom:12}}>Foto de perfil</h3>
                      <p style={{color:'#555',fontSize:13,marginBottom:14}}>Tómate una selfie o elige de tu galería</p>
                      <ImageUploader tipo="barbero" id={perfilBarbero.id} urlActual={perfilBarbero.foto} label="Subir foto" onSuccess={url=>{setPerfilBarbero({...perfilBarbero,foto:url});setUserData({...userData,foto:url})}} />
                    </div>
                    <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.05)',borderLeft:'2px solid #C9A84C',borderRadius:14,padding:24}}>
                      <h3 style={{marginTop:0,marginBottom:20}}>Editar mi información</h3>
                      <div className="form-group" style={{marginBottom:14}}><label>Especialidad</label><input type="text" placeholder="Fades, barba clásica..." value={perfilBarbero.especialidad||''} onChange={e=>setPerfilBarbero({...perfilBarbero,especialidad:e.target.value})} /></div>
                      <div className="form-group" style={{marginBottom:14}}><label>Descripción</label>
                        <textarea placeholder="Cuéntales quién eres..." value={perfilBarbero.descripcion||''} onChange={e=>setPerfilBarbero({...perfilBarbero,descripcion:e.target.value})}
                          style={{width:'100%',minHeight:80,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'12px 14px',color:'#fff',fontSize:13,resize:'vertical',boxSizing:'border-box',fontFamily:'Inter,sans-serif',outline:'none'}} />
                      </div>
                      <div className="form-group" style={{marginBottom:14}}><label>WhatsApp</label>
                        <input type="tel" placeholder="573001234567 (sin +)" value={perfilBarbero.whatsapp||''} onChange={e=>setPerfilBarbero({...perfilBarbero,whatsapp:e.target.value})} />
                        <p style={{fontSize:11,color:'#555',marginTop:6}}>Número con código de país, sin + ni espacios. Ej: 573001234567</p>
                      </div>
                      <div className="form-group" style={{marginBottom:20}}><label>📸 Instagram (usuario sin @, opcional)</label>
                        <input type="text" placeholder="tunombre" value={perfilBarbero.instagram||''} onChange={e=>setPerfilBarbero({...perfilBarbero,instagram:e.target.value})} />
                        <p style={{fontSize:11,color:'#555',marginTop:6}}>Los clientes podrán seguirte desde tu perfil en la app</p>
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
                              <span style={{color:'#333'}}>-</span>
                              <input type="time" value={h.fin} onChange={e=>setPerfilBarbero({...perfilBarbero,horario:{...perfilBarbero.horario,[dia]:{...h,fin:e.target.value}}})} style={{padding:'6px 10px',fontSize:13,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#fff'}} />
                            </>}
                            {!h.activo&&<span style={{color:'#333',fontSize:12}}>No disponible</span>}
                          </div>
                        )
                      })}
                      <button className="btn-primary" style={{marginTop:20,width:'100%'}} onClick={async()=>{
                        try { await fetch(`${API}/api/barbero/perfil/${perfilBarbero.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({descripcion:perfilBarbero.descripcion,especialidad:perfilBarbero.especialidad,whatsapp:perfilBarbero.whatsapp,apikey_whatsapp:perfilBarbero.apikey_whatsapp,horario:perfilBarbero.horario,instagram:perfilBarbero.instagram})}); alert('Perfil actualizado') } catch { alert('Error de conexión') }
                      }}>Guardar cambios</button>
                    </div>
                    <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.05)',borderRadius:12,padding:20,textAlign:'center'}}>
                      <p style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:2,marginBottom:8}}>Código de invitación</p>
                      <div style={{fontSize:30,fontWeight:900,letterSpacing:10,color:'#C9A84C',padding:'12px 0'}}>{perfilBarbero.codigo_invitacion||'--'}</div>
                      <p style={{fontSize:11,color:'#333'}}>Comparte con colegas para unirse a tu barbería</p>
                    </div>
                  </div>
                )
              }
            </div>
          )}
          {currentPage==='pro' && (
            <div className="page" style={{background:'linear-gradient(180deg,rgba(201,168,76,0.04) 0%,transparent 300px)'}}>
              {isProB ? (
                <div>
                  <div style={{textAlign:'center',marginBottom:20}}>
                    <div style={{fontSize:40,marginBottom:6}}>💎</div>
                    <h2 style={{fontSize:20,fontWeight:900,marginBottom:4}}>Dashboard VIP Barbero</h2>
                    <p style={{color:'#888',fontSize:12}}>Tus ingresos en tiempo real</p>
                  </div>
                  <div style={{marginBottom:16}}>
                    <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:12}}>
                      <div style={{flex:1,minWidth:130}}>
                        <label style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:4}}>Desde</label>
                        <input type="date" value={rangoB.desde} onChange={e=>setRangoB({...rangoB,desde:e.target.value})} style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'8px 10px',color:'#fff',fontSize:12}} />
                      </div>
                      <div style={{flex:1,minWidth:130}}>
                        <label style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:4}}>Hasta</label>
                        <input type="date" value={rangoB.hasta} onChange={e=>setRangoB({...rangoB,hasta:e.target.value})} style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'8px 10px',color:'#fff',fontSize:12}} />
                      </div>
                      {(()=>{const t=new Date().toISOString().split('T')[0];return(rangoB.desde!==t||rangoB.hasta!==t)&&<button onClick={()=>setRangoB({desde:t,hasta:t})} style={{background:'rgba(255,107,107,0.08)',border:'1px solid rgba(255,107,107,0.2)',color:'#FF6B6B',borderRadius:8,padding:'8px 12px',fontSize:11,cursor:'pointer',fontWeight:700,alignSelf:'flex-end'}}>↩ Volver a hoy</button>})()}
                    </div>
                    {(()=>{
                      const todayStr=new Date().toISOString().split('T')[0]
                      const desde=new Date(rangoB.desde+'T00:00:00')
                      const hasta=new Date(rangoB.hasta+'T23:59:59')
                      const filtradas=citasComp.filter((c:any)=>{
                        const f=new Date(c.fecha+'T12:00:00')
                        return f>=desde&&f<=hasta
                      })
                      const totalRango=filtradas.reduce((a:any,cc:any)=>a+(cc.servicio?.precio||0),0)
                      const esHoy=rangoB.desde===todayStr&&rangoB.hasta===todayStr
                      const label=esHoy?'Hoy':`${rangoB.desde} → ${rangoB.hasta}`
                      return (
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                          {[{l:label,v:'$'+totalRango,c:'#C9A84C'},{l:'Semana actual',v:'$'+ingrSemB,c:'#00D4FF'},{l:'Mes actual',v:'$'+ingrMesB,c:'#2ECC71'},{l:'Citas en rango',v:filtradas.length,c:'#BB8FCE'}].map(s=>(
                            <div key={s.l} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,padding:'18px 14px',textAlign:'center'}}>
                              <p style={{fontSize:26,fontWeight:900,color:s.c,margin:0}}>{s.v}</p>
                              <p style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:1,marginTop:4}}>{s.l}</p>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                  <h4 style={{marginBottom:10,color:'#999',fontSize:12,textTransform:'uppercase',letterSpacing:2}}>Citas recientes completadas</h4>
                  {citasComp.slice(0,5).length===0
                    ? <p style={{color:'#444',fontSize:13,textAlign:'center',padding:20}}>A\u00fan no tienes citas completadas</p>
                    : citasComp.slice(0,5).map((c:any)=>(
                      <div key={c.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:10,padding:'12px 14px',marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div>
                          <p style={{fontSize:13,fontWeight:600,color:'#fff',margin:0}}>{c.cliente_nombre||'Cliente'}</p>
                          <p style={{fontSize:11,color:'#555',margin:0}}>{c.fecha} · {c.servicio?.nombre||'Servicio'}</p>
                        </div>
                        <p style={{fontSize:15,fontWeight:800,color:'#2ECC71',margin:0}}>${c.servicio?.precio||0}</p>
                      </div>
                    ))
                  }
                </div>
              ) : isPendingB ? (
                <div style={{textAlign:'center',padding:40}}>
                  <div style={{fontSize:44,marginBottom:12}}>⏳</div>
                  <h2 style={{fontSize:20,fontWeight:900,marginBottom:8}}>Pago en verificaci\u00f3n</h2>
                  <p style={{color:'#888',fontSize:13,lineHeight:1.6,marginBottom:24}}>Estamos verificando tu pago. En 24\u201348 horas tu plan quedar\u00e1 activo.</p>
                  <button onClick={async()=>{const uid=String(userData?.id);const em=String(userData?.email||'').toLowerCase();const r=await fetch(`${API}/api/anuncios`).then(d=>d.json()).catch(()=>({data:[]}));const found=r.data?.find((a:any)=>a.activo&&a.estado==='activo'&&(a.anunciante_email||'').toLowerCase()===em&&(a.titulo||'').includes('PRO'));if(found){localStorage.setItem('pro_activo_b_'+uid,'true');localStorage.setItem('pro_b_'+uid,'true');setProActB(true);setProPendB(false);setCurrentPage('pro')}else{alert('A\u00fan en verificaci\u00f3n. Te avisaremos pronto.')}}} style={{background:'rgba(201,168,76,0.1)',border:'1px solid #C9A84C',borderRadius:10,padding:'12px 24px',color:'#C9A84C',fontWeight:700,cursor:'pointer',fontSize:13}}>🔄 Verificar activaci\u00f3n</button>
                  <p style={{marginTop:16,fontSize:11,color:'#444',cursor:'pointer',textDecoration:'underline'}} onClick={()=>{localStorage.removeItem('pro_b_'+userData?.id);alert('Solicitud reiniciada.')}}>Reiniciar solicitud</p>
                  <div style={{marginTop:24,paddingTop:20,borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                    <p style={{fontSize:12,color:'#666',marginBottom:10}}>¿Ya enviaste el pago y no recibiste confirmación?</p>
                    <a href={`https://wa.me/+32455136804?text=Hola%20CutConnect%2C%20soy%20${encodeURIComponent(userData?.nombre||'barbero')}%20y%20acabo%20de%20pagar%20el%20Plan%20VIP%20Barbero%20por%20Binance%20Pay.`} style={{display:'block',background:'#25D366',color:'#fff',textAlign:'center',padding:'12px',borderRadius:10,fontWeight:700,textDecoration:'none',fontSize:13,textTransform:'uppercase',letterSpacing:0.5}}>📱 Enviar comprobante por WhatsApp</a>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{textAlign:'center',marginBottom:28}}>
                    <div style={{fontSize:44,marginBottom:8}}>💎</div>
                    <p style={{fontSize:11,color:'#C9A84C',textTransform:'uppercase',letterSpacing:4,marginBottom:8}}>Plan VIP Barbero</p>
                    <h2 style={{fontSize:24,fontWeight:900,marginBottom:8}}>Eleva tu carrera al siguiente nivel</h2>
                    <p style={{color:'#666',fontSize:13,lineHeight:1.7}}>Todo lo que necesitas para destacar, crecer y ganar m\u00e1s</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:24}}>
                    {[{icon:'📊',t:'Ingresos en tiempo real',d:'Hoy, semana y mes'},{icon:'🌟',t:'Perfil destacado',d:'Apareces primero en b\u00fasquedas'},{icon:'⭐',t:'Tus rese\u00f1as',d:'Ve y gestiona todas tus calificaciones'},{icon:'📋',t:'Exportar en PDF',d:'Historial de citas listo para imprimir'},{icon:'🔔',t:'Recordatorios autom\u00e1ticos',d:'Aviso a clientes 24h antes'},{icon:'🎖️',t:'Badge VIP',d:'Sello visible en tu perfil p\u00fablico'}].map(f=>(
                      <div key={f.t} style={{background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.1)',borderRadius:12,padding:'14px 12px',textAlign:'center'}}>
                        <div style={{fontSize:24,marginBottom:6}}>{f.icon}</div>
                        <p style={{fontSize:12,fontWeight:700,color:'#fff',marginBottom:3,lineHeight:1.3}}>{f.t}</p>
                        <p style={{fontSize:10,color:'#555',lineHeight:1.4}}>{f.d}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{background:'rgba(201,168,76,0.03)',border:'1px solid rgba(201,168,76,0.25)',borderRadius:16,padding:24,marginBottom:16}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20,opacity:0.15,filter:'blur(4px)',pointerEvents:'none',userSelect:'none'}}>
                      {[{l:'Hoy',v:'$0',c:'#C9A84C'},{l:'Semana',v:'$0',c:'#00D4FF'},{l:'Mes',v:'$0',c:'#2ECC71'},{l:'Citas',v:'0',c:'#BB8FCE'}].map(s=>(
                        <div key={s.l} style={{background:'rgba(255,255,255,0.04)',borderRadius:12,padding:'18px 14px',textAlign:'center'}}>
                          <p style={{fontSize:26,fontWeight:900,color:s.c,margin:0}}>{s.v}</p>
                          <p style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:1,marginTop:4}}>{s.l}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{textAlign:'center',marginBottom:20}}>
                      <p style={{fontSize:36,fontWeight:900,color:'#C9A84C',marginBottom:2}}>$3.99<span style={{fontSize:14,fontWeight:400,color:'#666'}}> USD/mes</span></p>
                      <p style={{fontSize:12,color:'#555'}}>Pago mensual · Cancela cuando quieras</p>
                    </div>
                    <div style={{background:'rgba(0,0,0,0.3)',borderRadius:12,padding:'16px',marginBottom:16,textAlign:'center'}}>
                      <p style={{fontSize:9,color:'#444',textTransform:'uppercase',letterSpacing:3,marginBottom:4}}>AutomatizaPro · Good Connection · CutConnect</p>
                      <p style={{fontSize:10,color:'#555',marginBottom:6,textTransform:'uppercase',letterSpacing:2,fontWeight:700}}>Escanea con Binance Pay</p>
                  <img src="data:image/jpeg;base64,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" alt="QR Binance Pay" style={{width:160,height:160,borderRadius:10,border:'1px solid rgba(201,168,76,0.3)',display:'block',margin:'0 auto 12px'}} />
                    </div>
                    <p style={{fontSize:11,color:'#555',textAlign:'center',marginBottom:16}}>O ingresa el <strong style={{color:'#C9A84C'}}>Pay ID</strong>: <span style={{fontSize:18,fontWeight:900,letterSpacing:4,color:'#C9A84C'}}>176779028</span></p>
                    <button onClick={async()=>{const ciudad=userData?.ciudad||perfilBarbero?.ciudad||userData?.pais||'N/A';const payload={titulo:'\ud83d\udcb8 PLAN PRO BARBERO - '+userData?.nombre,descripcion:'Solicitud Pro de barbero '+userData?.id,ciudad,pais:userData?.pais||'N/A',imagen_url:'https://cutconnect.app/pro-badge.png',tipo:'banner',precio_dia:3.99,anunciante_nombre:userData?.nombre||'barbero',anunciante_email:userData?.email||'',anunciante_telefono:(perfilBarbero?.whatsapp||userData?.telefono||'').replace(/\D/g,'')};const res=await fetch(`${API}/api/anuncios/solicitud`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await res.json().catch(()=>({}));if(res.ok||data.success||data.id||data.message){localStorage.setItem('pro_b_'+userData?.id,'true');alert('\u00a1Solicitud enviada! Te avisaremos cuando se active.');}else{alert('Error al enviar solicitud. Intenta de nuevo.')}}} style={{width:'100%',background:'linear-gradient(135deg,#C9A84C,#B8972A)',color:'#000',border:'none',borderRadius:12,padding:'16px',fontSize:14,fontWeight:900,cursor:'pointer',letterSpacing:0.5,marginBottom:12}}>✅ Ya pagué – Solicitar activación</button>
                     <a href={`https://wa.me/+32455136804?text=Hola%20CutConnect%2C%20soy%20${encodeURIComponent(userData?.nombre||'barbero')}%20y%20acabo%20de%20pagar%20el%20Plan%20VIP%20Barbero%20por%20Binance%20Pay.`} style={{display:'block',background:'#25D366',color:'#fff',textAlign:'center',padding:'14px',borderRadius:10,fontWeight:700,textDecoration:'none',fontSize:13,textTransform:'uppercase',letterSpacing:1}}>📱 Enviar comprobante por WhatsApp</a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

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
            <div className="pending-icon">-</div>
            <h3>Estamos revisando tu negocio</h3>
            <p>Recibirás respuesta en 24–48 horas. Una vez aprobado tendrás 30 días gratuitos.</p>
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

  if (loggedIn && userData?.rol==='dueño' && userData?.estado_verificacion==='trial') {
    const diasRestantes = userData?.fecha_trial_inicio ? Math.max(0,Math.ceil(14-(Date.now()-new Date(userData.fecha_trial_inicio).getTime())/(1000*60*60*24))) : 14
    if (diasRestantes<=0) return (
      <div className="dashboard-container">
        <nav className="navbar">
          <div className="navbar-left"><div className="navbar-brand"><h1>Cut<span>Connect</span></h1></div><span className="role-badge pending">Trial vencido</span></div>
          <div className="nav-links"><button className="btn-logout" onClick={handleLogout}>Salir</button></div>
        </nav>
        <div className="dashboard-content">
          <div style={{background:'linear-gradient(135deg,rgba(201,168,76,0.08),rgba(201,168,76,0.02))',borderBottom:'1px solid rgba(201,168,76,0.2)',padding:'16px 32px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
            <div>
              <p style={{fontSize:13,color:'#C9A84C',fontWeight:700,marginBottom:2}}>⏰ Tu período de prueba ha vencido</p>
              <p style={{fontSize:12,color:'#555'}}>Activa el plan por <strong style={{color:'#C9A84C'}}>$3.99 USD/mes</strong> para recuperar el acceso completo</p>
            </div>
            <a href="https://wa.me/+32455136804?text=Hola%20CutConnect%2C%20quiero%20activar%20mi%20plan%20mensual." style={{background:'#25D366',color:'#fff',borderRadius:10,padding:'10px 18px',fontWeight:700,textDecoration:'none',fontSize:12,whiteSpace:'nowrap'}}>💬 Activar ahora</a>
          </div>
          <div className="page">
            <div className="welcome-card owner" style={{opacity:0.7}}>
              <p><strong>{userData?.negocio_nombre}</strong></p>
              <p>{userData?.ciudad}, {userData?.estado}</p>
              <p style={{fontSize:11,color:'#C9A84C',marginTop:6}}>Vista de solo lectura - activa tu plan para editar</p>
            </div>
            <div className="stats-grid" style={{opacity:0.6,pointerEvents:'none'}}>
              <div className="stat-card"><h4>Citas</h4><p className="stat-number">{citas.length}</p></div>
              <div className="stat-card"><h4>Equipo</h4><p className="stat-number">{misBarberos.length}</p></div>
              <div className="stat-card"><h4>Canceladas</h4><p className="stat-number">{citas.filter((c:any)=>c.estado==='cancelada'||c.estado==='cancelado').length}</p></div>
            </div>
            <div style={{background:'#141414',border:'1px solid rgba(201,168,76,0.3)',borderRadius:16,padding:24,maxWidth:480}}>
              <div style={{textAlign:'center',marginBottom:10}}>
                <p style={{fontSize:9,color:'#444',textTransform:'uppercase',letterSpacing:3,margin:0}}>AutomatizaPro · Good Connection · CutConnect</p>
              </div>
              <h3 style={{margin:'0 0 6px',color:'#C9A84C',fontSize:16}}>Binance Pay - $3.99 USDT/mes</h3>
              <p style={{color:'#555',fontSize:13,margin:'0 0 16px'}}>Envía exactamente <strong style={{color:'#C9A84C'}}>$3.99 USDT</strong> y manda el comprobante</p>
              <div style={{textAlign:'center',marginBottom:16}}>
                <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAExASADASIAAhEBAxEB/8QAHgABAAICAwEBAQAAAAAAAAAAAAcIBgkBBAUDAgr/xABhEAAABQQBAgMEAwcMDAgOAwABAgMEBQAGBxEIEiEJEzEUIkFRFTJhFhkjN3GBsxcYJFZ0dZGVobK00TM1ODlCUlNicnOU0iUpVVdmdpOWNDZDREZHVGNlhYaSoqSxweH/xAAbAQEAAQUBAAAAAAAAAAAAAAAABgECAwUHBP/EACgRAQACAQMDAwQDAQAAAAAAAAABAgMEBREGIUExUWESExQyBxYi4f/aAAwDAQACEQMRAD8A2p0pSgUpSgUpSgUpSgUpSgUpSgUpSgUpSgUpSgUpSgUpSgUpSgUpSgUpSgUpSgUpSgUpSgUpSgUpSgUqjty5KhHOaclwuQs95HtkkNLpNoxhb6BTNyICiBh2Psynfq+Y1NieeAiJRhYFmW9MXiuyiWr9w9ePWzRdVFUPcMBVhTFVQQ7iBS/Z69qCdqVEFy51lWt2OLLsPGU3dspFM0Xsym1XQQIwKqXqIkJljlA6oh36C7GvxkTPUvYpWxm+N5B8Jo/6RcpqyLRqomQC9R0ykVUAyihQAdgUBDt60ExUqEnnJMJGVhoLHuPJq6X87b5LialQWQbpkQMcSdKh1TlApgEB7fH4V8W/KWElLTtiVgLUkntwXUo4QaQRlkUVUVG46cCsqc4JkIQe3V1aHYa3QTnSofi+QKMlaU9Lfcg/TnbadkZSUKd42AyShg6iH88TgkKYlEDAfq1r7e1ejiLNKOUHs3BPbfXhJmBMiLlsZyi5TURVJ1JqJqomMQxRD7dgPwoJPpURXNnOWbXhKWZj7GU3eTm3yJnmlma6CCbQyheoqRTLHL5ivSIG6C79Qrq3DyAmEbif2xYuK5+63sC0RdToNlm6AMRUJ1lQ2qcvmLdI76C7+FBM9KhBxydj5Re0mGPrHmroe3lFLyjFJAyKAIlRMBTlXMqcoJiAjrv8QrNcRZNRypah7hCDeQzto9cRr6PdmIZRs5QOJFCCYgiUwbDsICICFBnVKrxY2Zrnh8bylwSjFzcjz7rZaMQ8x43akRRTcnKmB1FTEKBQAAKHx/LUj4fyu1ytCP3wRDiJkIiQVjJFiuoRUW7hMe4AdMRIcogICBiiICA0EgUqEsg8kDY9uNyykrFeqwsa5QbvpEki1BRMqpypgsVsKnmmTAxygI9O/joa/M7yMmELguqDs7EVxXOWzjImk3LVZukQUzoFW2kChyiocCm+oAb7faFBN9KhBzyXQl3tuxWN7DmbreXPABcLIEFUUEyIeYJBKqdUxQIbYD2H41muJspR2V7dXmG0U9iH8c9XjZOMegUF2bpE3SdM3SIlHv6CAiAgICFBnVKqxmTktdT7GF8zuNbGuEIaG85g3utFRuCftSaxUznIiY3mGTA2y9fQIfm71nMpyEcx0mralq2Y/uyRg45q6m1EXjZsVuZVIFCplFY5PMVEogbpLv6wfOgm6lYWwvyNvfFh79tJ2f2Z/EKvGqhg0YhvKEQAwfAxRDuHzCqOWfmOXWx/Zly2xn3IMjkSXdxyakTKtE/oddRVYoLpHUM3IBE+gT6MCm9gABvdBsXpUBS2d2mP5C+n8i3uSdVjLiiYUI5IqJipru0EBKVsAaESbUAR6xEdiOu1ZBbGdZOUmrota58bzEBOW5GJTKbFVy3WF80UFQCGTOmcSAbqSMUSmENCFBLtKgiD5RNnC86zuWy3UW4irdd3M1BGRavCPWjYB80pToqGKRQogACUwh9YB9K7Fp8kXU9cNpMJ3GM5b0RfDZVeEk3qzcwKmTRBUxFEyHE6QiTZgEwAAgA0E30qHLJz3NZAkmb+28Uz69mSDpRq1uQVkCpqlLsPP8gT+aCJhKIAfp79h9Brx0uVsWsQt0IWXInsU0gEYFx+1t+kTCsCJV/Z+vzvIFQQDr6fQQHWu9BPdKwfK+T2OKLNC8nkS+lUjPWTFNsxKBllTuVyIk6QEQAfeUAaxm288SDu7X1i3rjeatecJEqzka3XWQXLJNEx6T+UdI5igoURIBiGEBDqKPoNBL1KhCzuSadwXeS0bgsp1DLP415JRixZFq8I4K2EgLJGFBQ3lqFBQg9JvgPYew1+7c5FyFz4vDKzLF801i3ibZSLK9dtUDOiKl2KgiZTSaZR7dRxDewENhqgmylRtiDMKOUwnI51ALwkzbrtNo+ZqOEnBBBRIiyaqaqRjEOQxDgICA7AdgOhCpICg5pSlBXscU8hbRyFe1zYzuqxixd3yKciKMw2cnXROVMCdO0/d12r95YwrknJ7RNrJpY8dLrMCNzSDhkuR7GOP8NZoqQBMYN+8UoiTQh3EasDXGgH4UEEFw1lWxrldXLiq8YRZScjmbOYTn0VTeY5bpAkV2QyWxEwlD3iDoB+YV0bt4+XlO3bO3L7ZaMwe6oJKKfHl2BxOxVIkJPMalAD6IYR6hKIlHffY1YauNB8qCGcV4Lk8dz9vS7qcbOiQtoo20oRMhi+YoRYynmhv0Lo2tetYQ64iPCQFuHbPrfk562ZGRcpJyzQyrB03dqCYyRwAOohg7aOADod9hqztNBQV1kuNc1LY/TiRZ2NEziM83mxaxsYdOMdgiAgVu5376oaH6wlDQgHu1lmI8PTVjX7dt+S/wBANjXQgyTCPhm5k0W5kU+kRARAvVv130hUvaD5U0HyoIVlcW5Utq/7iu/ENzW83bXgKK8ozm26x/IdJpgmC6Ip/W2UA2Q2g2HrXXk8U5gt27Z26sX3hbiJ7tQbjMJyzVXpReppAl7Sh0b3soB+DMIdw+tU5aD5BXNBCdgceC4/ueyphhPFct7WgnsW48wglUdLuFCqGVDWwKHUA9t/GswxRj91jxjPtXb9J2MxPv5kgplEOgq6onAg79RDeqzvQfKmg+VBXJ3xnuNu3hHkdKQMm8hLllpwrCWQOZg5TenE3SfQCJVUw+qbpH1N86znBmJZHFSV1jIOYtQ1yTq0wVCNQFJBsBwAPKAo69BD4AFSpoPlTQfKgrBdvFa55tredvNnlprMLqnCzqcu+aHPKNje0JrCj1AUQEpegSlMBuxdB018IS1c3KZJy4zxzMQMc3fvmLU60u1WMJP+DkSCuiJOygh390dBsPWrTaD5UAAD0Cgqg1xffuN8tWdauJ30eoa37AFiZxMoKC2dG9qMI9R09iQ29mAAAfXX21NGFMYSWNoKVPck0hLXDckq4mpd22SFJAzhUdiVIo9wIUNFDfcQDvUj00FBWSZ44ZYCxbpw3at7W4hZU85cOWijtqsZ+zIst5p24gX3DFA2wA+9gGvdrtXZxgk/u0kr0tFhZMspPs2iL9vcrI6oN3CCRUgWQOQBEQMUpdpiAdw3vvVkdB8q5oMTh7MRh8eBZLRtGsx+jjs+mPa+ztinOQSmMmkG+kux3rvVfo7jfyAeYtisFXPf9lo2awTaNlnDCPcGkFG7dUqhSlE4gQhxEhff+HfQVa2uKCB57jpJSkhcTtC4myaczdcHcCRTkMJiJsE0CGTMPxMbyR0P213sp4Bf5ImbykUrmLHJXRazSBTAqZhMkog5VX6j6EOohusCiG9iXqCpq0HypoPkFBW8nGy6pOUeTUqazoRVzY0lZ/kQbQ5EzHcgUCLmESF2Aa+rrYfMazRfCrtcmK0VpZuZLH4KEdFEpv2WB2Zm+i9u3rvv8Klymg+VBCGM8XZhxmjGWBHXbbTqw4hUxGxl2iwyQsu/Q2EAEE9l2AeZv0L9WsQtXic+sx61t2NhcdSdrNZEXKb2UiDKyhWvmCp5AgAeWc5RHQKCYOwAPSIhVnhAB9QpoPlQQryui5eRxSzj7e2m9+6aAFA5UPMBISyKI9YkAe5SgGxD5ANeFK4CyRkyWm5zKl5xLV0tar61oZOASVKDQjzpFZyoZTRhObykwAoaAAAe473Vh9B8qaD5BQV1tnjtdDW7bWueWTsuK+5qCkoQUYJodP2v2kiBSKmESl1ryRHp762Pca7stx2nF8M43sFnMRTqRx6uxdAlIJHNHSZkEDoimsQAEwF/CdZR6R0YpR1U+6CmgD0AKCKMO4jlcfXTe11yhoNI13umbkrGIbmSQaii2IiJQ2Ab2JN70Hr6VK4egd6aD01XNApSlApSlApSlApSlApSlApSlApSlArzbhn4q14R9cU47I1j4xA7p0uf6qaRA2Yw/YAAI16VRnyU3+oDkPXfdtv/ANCag5tPkPiS+LlRtO2ruRcyLpIV2qZkzEK6IGhMZE5gAqmgEN9Ijqv205A4qf3ejY7e5w+lHThRo2EyChUF1yAPUmmqIdBjhoewDvsNQ/CsMh5ReYjYkxc7tthY5kpV1Mu1URSNpmKZEW3lmExwOJwE3YA0UPjWMo4vy7NBaLe4bduxzckPebeTnH7mQTNGLNyCt+EbpgOgKAGLopAAQ3726Cebh5N4Utaak4Cavdug5hhEsgoBDmRbKAG/LOoAdIH/AM3e67t55/xbYDhFtc1xGQE7dN0c6bdRUiCB/qqKmKAgmUfmbXaqz5CPdWMsF5VxcvZjWWaO3si6Qn05Jt5SwOXHWBVkxN5vtBTGAvSBR2IBodVlN92LlCfWuqPeQd1yrOXtRJnawxD1NFm3MLHoUTckMIAJxVEe5wEOkQAuqCfJfNeNYS4Y21H10IfS0uig4ZNUwE510ljCUhygUO5dlHY/DVZ0HcAGoCxDjO7bbyRFXFOwoIotMexkIZcximMR0mssZVMBAd9gMUR+A1PoelBzSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBXRl4uOnY51DSzNJ2yepGQcIKl2RVMwCAlMHyEK71cUHyaNW7FqizaIlSQQIVNNMoaApQDQAAfLVfXQfKuaUGBP8ABmI5O6DXm+sGKXmDOAdHXOmIgdYPRUxN9BjgIb6hKI7+NZ2UAAA0UA7fKua5oONB66rmlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBUNZ+5YYb40qxSOVpxywNNAczTyWp1uoCdh30gOqmWtUvjakA8tjMoh2FJ0A9/84KCzAeK1w6+N6yP8Vrf7tc/fWuHX7dZH+K1v92o1gfDu4PRGKrbvnI53cQSUYNlVnTqZBFIyyiYCIAIl0Gx32ro/rN/C4/5w4//ALzk/qoJY++tcOv26yP8Vrf7tSjgXmNg/klMyMDiufdP3cWgVw5Kq0Oj0kMIgAh1AG+4VXJl4dHA+77Qmrjx6s6m041qubz2U2CxCKlTEwAIgX19B1UBeDQ2SZZuyU0RASpoR5Eyb7+6C5wD/wDig28hUHZF5kYOxdlZjhi7p503ueSO3I3bkaKHIYVhAE/fANBvdVZxTzOzldfiASuAZeVjjWg0knzZNArTSoESDZNn33/gqceU/FbEdyLzvJOUj35r1taKM/jlyOdIkWakE6QmT13ABKGw33oJBz1yyw5xtUiEsqTbmPPOFOZmCTY6vWBdAO+kO3rXpZR5I4tw/jaPyve0uu2t6UMiVsuRuY5jCqXqJ7oBsNgFaOcpZb5Qc212S0vbjm5/uX600hh4w2kesd+/079dV7nIPM3Ma58PxmPs1Wg9i7Qi1kCNVF4czfSiZBKmUVB9R1ug3VxvI/F8thFXkEylnB7OSbGdmdC3MCnllN0iPRrfrXywtyYxVn60ZW9cby7h9Fwyh0nairY6QkMUnWPY3ce3yrRPF80c4xGDVOPTOUji2eq1OzMgLTavlmP1j7+/Xf2Vdjwt8rY1sXjjkKFvK94aGevHrk6Dd46KmoqAtQABKUR2PftQXrwby/wpyIuGWtfGM86fP4RPzHZFWh0gKUTCXsJg79wGpsD07jX83uGuTeTuNl6XDceKZBkg5mDHbrHcN/OKZMFDGLoNh86v5xO5qcuLtybASWeUm8TjN63VWcTC8WLVr3JtIfOEdAAjrXzoNmN0XHGWjbsndE0qZJhEtVXjk5SiYSpkKJjCAB3HsA1VQfFY4eFESmvSR2HYf+C1v6qzzNGf8KXXiO8ratvKVtyUtKQbxozZtn5DquFzpGKRMhQHYiYRAAD7a188APD+trLCF4LcjMe3JGHYrIBGeaJ2nWUwG6xDZfe+FBcr76zw5/brI/xWt/VVkMVZTtHM9jR2RbFeqO4SVKYzZY6YpmECmEo7KPcO4DVN7e8Pfw8btnl7XtmWPJyzYDCsyaz4KLJ9I6NsoF2Gh7DU55LiWnEPiFcjfDJTMyWdFKLRXtg+eJDiqH1vTq+sNBPr18hHsl5B0Igg2SOsoYA3ohQERH+AKqW48VLh81cKtlr0kQOicSGD6MW9QHQ/4NeDwF5IZP5K4Bvy6MpP2bp9HrumaBmzfygBL2YDaENjsdmGqGeHZxpxbyXyzflvZTjnbpnEtgctgbOPJEpzLHAREdDvsAUGw3761w6/brI/xWt/u0++tcOv26yP8Vrf7tRnL8IPDOt+Ucw03eTZi+ZKCi4bL3GQqiZwHuUwCHYa+bDhT4Y0o/bxkbe7Ry7dKFRQRTuQhjqHMOgKUNdxGgk/76xw8Ee16yI//LFg/wD6q2cDNMLkhGFwRagqM5Fum6QOJRKJkzlAxR0PcOw1pP8AE34p4g4yPLHRxVHPmpJxJ2Z37S687qEgk6ddg12MNbi8Lfiisz94mX6EtBmlKUoFKUoFKUoFKUoFKUoFKUoFapfG2/tvjAP/AHbr+cFbWq1S+Nt/bjGH+rdfzgoM58R7+9/WH/rIr9BWnit7vI7jnevJzh1Y+PrFeMG8gkhGvRO9OJUxIVHQhsPj3qjX3mrkv+2G0v8Aazf1UFhPCM/uW8lfu11/RajXwchH9XjJ/f8A8zD+kHq1vCfi7fvFfA192jfz2Ncu5IXT1IzFQTkAns4l0Ij8e1VS8HL8fOUP3GH9IPQeRgf++3Tn78yn80as3zA5oSlqZpHiSlZbdw0vNo3jFJYXQgo3B4HQJwT1oekDb1vvqqSFzVbHH3xIruyjeDZ2vFxk3IEVI0IBlR6+waAasG9w1c/PTPttcv8AEjloxtCOfskVUJQ4puxM0OXzNFDYd9DrvQfCXVd+EaKbS02Z8hhkMPPWM4KLb2QUewAHT1dQDv7K6UXyMc+KS7HjldEG3sJq1D6b+k0V/aDidL3QT6DAUO/WPffwraHNWnbFxppBcVuRkoZAolT9saJrdG/XXUA6/NWpa5fCg5Qjf87dllXhAQyMi+XWbi1fqNzlROcRAvua0GtdqCus/wAQ2cRzFbcZW1zu3EcvIpsvpkrXYgUyYn6ukB19nrVxJrwWLWjIZ/KEzTIqCzaquCk+jSe90EE2vrfHVWnxbZMdxJ4vtrnzXEx87cFltFHclKN0CuHau1OwlWOHWI6MAdxrOeM/KHH/ACttSTuqxmEggxj3YsV036QFMY/SBuwAI7DQ0H86MtFOYp85aqoqkKisdIDHIJerpEQ3/JW3jOaiTjwmIFogqRRcYWJAEiGAx/rF+Ad68bxmLStW3sWWM6gLai41ZaYcAoo0ZpomOHllHQiUAEfz1RDiVyFYYiy9BXHlJ5MTdnxqKya0SKhnCI7JogAicRIOh7h27UE38RuGEPcmHi8qnt7LspOznjiUShBbl05FkbrKTqEeoOvo1sA+NbBOEPNKU5VtbpPcNlt7X+506CaQe1CbzwOA7+sAenT/AC1rKz5y2sq+eTcHkfG6UxCWGxVYGeQyX7GSWKkICsAoEECG6gAQHYd996snfzVfxGBZOuHZwsVOzSilNAoP0b7UZbumP4DXXrpH1+dBVLFXJGS4vcq71yPD2qS4VlHUixBsZUUwADr76tlAf8X+WtulpzZ+bvD1Ve4EAtMb7jlW6wEHzfZQKrrYdWt/UD+Gq08JfDgyfgzM7m/cvqWxPRTiNXbCkIg6MKxzFEDiByiHwHv9tWr5lIo2nxFyMS10iw4NIUwtwYB7P5I+YT6nRrp9fhQY5xj4qxHE/DV5WhDXmpcZJT2p+Zc6JUxIPs/T06KI/wCLVJPBq/Hvk797if0g9S74T9wz9xcZckOZ+bfSSqcg6IRR45OsYpfZC9gEwiIBUReDX+PbJ4//AA4n9IPQU65o/wB1Tk7/AKxvP0g1jHHb8fWPP+s0d/SCVfjkJ4VWf8p5qvLIkBOW0lHT8u4fNiLuTFUAhziIAYNdh714+KvCU5D2Tky1LwlZ61zs4SYaP3BE3JhOZNJUpzAXt3HQDQZL42//AIdiv9zPv5ydbLMLfiisz94mX6Eta0/G6ASvsWlH1Bs+D/8AJOtlmFvxRWZ+8TL9CWgzSlKUClKUClKUClKUClKUClKUCtdXivcecyZykLDWxVZD6fCLTcg6FsUB8oTCAl3utitcaCg01RDbxdoOLaQ0UwutBmyRIggmDZHRCFDRQ9PgAV3PavGF/wAhdv8AsyP9VbAucGd8ice8Ro3xjK20pqVPJJNDN1UDqgCZgHZuknf4VlXFTKd4ZlwbbuRL8hk4qalEzmctU0zJlT0YQD3Tdw7UGs12Pi+vmizF01uw6LhMyKhRbI6MUwaEPT5DUueFjxwzlhfJt6T+WbDkIJvKxyREVnRQAFVfMMJgDX5azrxAeeeVOK+SoKzbEgIaQbSsZ7Ycz0hjH6+sS6DQ/ZVaJTxduVUIkm4mcXQbFJYdJncMlkym/IJvWgy6E4O35fHPe4boytiZ28xvKyz5yZytsqCpTBtM2wHfrXR5D5gn+GnKyAw5iK5DWdjJJaPfP41EAMiBVTFFcwmMAm7hv415LXxZOXj5sm7ZYeil26wdSaqcc4MUwfMBDsNSNYvH+wfEJjU85ci59xaF5ulRjPolmqRuApJD0piCavv7EP4aDyufXiGOE3VoF4s5nTOQU1vpf2ApT+9sOjq6g9fWrRckJrktMcV7SnOPq0i5vZ6DBd0ozIQyh0jIiKhhAQ166qLi+DJx6DRiXpdfYd/2RP8Aqq8UU3t/HNqRkK6l0WjCMbJMUV3ixSdXQXRdiOg2IBQUSmc4Pbv4lS3G3Kd1e157mY47BWAXACvVnIqAYhOkA6diQN/krF+Dd0x/C/FdzY35ByBbGu+feKPYVg/7KuAMkBEzED4/hA1+WozvKHlpnxYY654eMdPYg88gcr9uiZRuIA3EBEFADpHv9tex4sVt3BLcmMdPo2DfO26DBt5qyLc5yE06ER2IBoNB3oJP43YVz9yBuydjec1oyU7aTNIHdukkyAmmVYxxATFFPQjsnT61EeOvDzn/ANerJJ3bhZ0GIQfvfZxUEQb+RofJ0ID1a3qrY8wuW95YGxvZ8phaOirpkXxwbPm5duRRTKkXRhBMREvfYd/lVPJDxaeWsS1O9lMSRDRuQQA6y7BchCiPpsR7UHqci/DznCcr7fTxFhZyOMhWjfpAW4mMgBOovtGxEd+m69vnu4X4HObRa8Vz/cIS6k11JgrT8J7SZISgmJvM3rQGH0+deDizxc89Xvkm17NkbQthNrNSzVgsdJM/UUiigFEQ7+uhq7/LzijhzkwpbjnK96uIE8KmqDQqTpNEFevQm+v6618KCOOcGdcp4x4aWhkax7rcRtxSK0cVy9IQomUBRAxj7AQ13EN1DLvm3jy//D4mrRyPldpIZLlYZVBdqr2XVV88BKGgAA+qFVU5U81b+yjaC3HaSiYYtuWtJFRZO24GFZUjbqTIIjvQ7KO6kO1eBmL5vgk55POp+aJcSMUs+BqUxfZhOVboANa3rVBYjwfmy73jRkZo1TFRZeVcJpkD1MYWhAAPziNVVxzxy8Q7CN0TU/iawbihHEqYyS6yKKZhUS6xMUPe322NeLww5hZs4+wi9mY4sZrLxEvMJrvHSrVVQUjGAhDdy9g0UAHvWx3nNzcm+OuPrSubGS1uzchMujIvEFlgVBIoJlNvRB2HcRDvQVE9q8YX/IXb/syP9Vce1eMJ/kLt/wBmR/qr5LeLpysbRgTK+LYROPOUDA6OyXBIQH0Hq9O/5a+kZ4tvLKbag8iMUQz1uIiHmt2K6hNh6hsvagjfMHHzxH88njlMr2Jck6aJKcrQVkUy+UB9dWunXroK3V4si38JjW14eUbmQeMohqgukb1IoVIoGAfyCFVZ4NcysgZ4bXSrnKJibQUilG5WBVCma+eBgMJxDzddWtB6fOrmIqpLpEWRUKdM5QMUxR2BgH0EBoP3SlKBSlKBSlKBSlKBSlKBSlKBXzUN0FMf16Q3qvpUM8geV+G+NasWjlWYcsRminFr5LU6vUBPrb6fSgqFevjHWJbV0S9qP8NSrs0S9VaGUFyl0nEhhL1AA/krIMIeLFZWXsn25i2MxNKRik+7BqmuZwkJEhEBHYgHw7V5j3lr4WUk8XkJCzYldy4OZVVU9vHExziOxER16iNVPz5x8vmfuCd5hcaodtC4zbFLIxT1ksVsqgQmiGMVL6xR6hGgvTzg4NzvIvIcJluOvZhFNrSjwMq0XQOY64JHFUQKIBoNgGu9QJO3BH+Ka1Rw5ZcYWxXePB9qXevSgqR2H9i6Sgn3DuQR7/OqLRPLHkCMsyCYzLdK0cLlP2tM74xinR6g6yiHxAS7rcpw+y/xHyPLSDHj/BMmU81j0VJZZGNFuZQBH4mH63vbGg9i6J6J4P8AE2Mk7ihkrnNZrFrHrA2IUguDCPT1AJg7fnqrlm4VlOfuSre5jWjPJ2fDxsi2QPBuCmMqcWhw6hASe772qkbmLm+wOTFsXTw/xTILP8kLPCoFYrImSRE6BtqB5pvd7BUd4HyMw4jYOf8AEjI8ovC5Ymfavohu0KKhAWd7BsILF90oiIh3+FBZXmLzeg+H69tNJmy308NwEVMQWyxSeV5YgA76vXe6iDxU7pNc3DC3rsYlVaBLSjB2UgH0YhTpHN0iIflrXLy1xfymx08t4vJKbeyJ35VRi/aJAHQkKAh1a16fCtksNzZ4e3Jia2bEyVDyk0hHMGpFWrq3l1kgWImBdh7uh1370FY+MHii2bgXDNu40mMVyMy/hiHKo/TXTDzBEwiGurv6DUpuvGKsC8Cjbn6i0mReWKMemsq4RN5Yq+4BvnoBNuoMzDwXyXyMyDK5d412Gwb49nDFPEpHUKyECFACm/BH0JfeAfWpY4yY7xHxBjVbE5gY3aObumZFN7EKpRppDoQHpIX8IQBAnvgPYfy0FheEfBm4OOF43Bfdx3uyuJtczJMEWpUT7QETCfv19vQ2u3yqNc7Z9t/lzftzcDrftIbdl15BRuWeX6DIALU3WI9Jfe761WSeK7f2SLKxVYr/ABPPTcSq6kVSqGiuspxS8oglKbp7671iuVLSbW14fcVnK14AWGUXMZHuV7gbICWTOsqYAVMY4B1bMAjugjZp4UV24JdI5nf5RiZJvY5wn1maTVQp3BGw+aKZRENAJgKIBuq/c6ebUbyydWqa3rYkrc+51NdNUFnIG84TiGhDoH4arw8QZp5M3TlW0rbu29r0kISUmmbSQaOzKiiu3OqUpyHAQ0JRKIgO/hW6tPifxsOkUw4UtTqEAHYsC+tBrVtLwa72vC14m6kswQ6JJdmk9BM7RUTE8woG0I67j3q3GQ8MvuP3hs3ZieSl0ZRxBwKyZ3SJBKRQTLlN2Ae/xrP+a2N82XbhBlanGt4tFTjSRbiQGjsGvQ0IQwCUDD8Pq9vsrXtP8OfE9uiHd29cNzyMjGvk/KcNXE+Qyapd70YBHuFBH3DfnVanGPFdzY/m8fOpxzPOlXCTlI6ZQRAyIJgHvd+whuqgysq6k3rhwq4WMRVY6hSnOJunqHdbmeC/BZhirGFxk5M4st59KFkDu26q5SOjEalSKI6EPTuBu1VA8QLLPD6/rTt+I45W6wjZiPk1xkjt4wWwil0gUAER+t7wDQeVf/PG0rx4cx/GZtjt01kmTBk0NLCdPoMZAQETaD3u+v5az/w+ud1o4dtO2+P8rjlzLPpi4PKLIlOmBE/aVQANgbv26qkTM+GMUxXheQmQI2wIZtcisPEqqSabYAcGOcxQMYT+vf41FXDrJ/FqN4/rY6uWEZqZglHTtCAdmjxOqm6WHpaCVf0KIHEuh+GqCSPGsN9Hv8XjG/sQFW74TAj7m/eT1vXrWyzDBjGxHZpjCIiMGyERH4/gS1p5vzw//EIyedqpfxzzwMuoGgvppNTyQN3EC7H46CtymNIV9bmPLbgJNME3cdFtmq5QHYFUImUpg38e4UGS0pSgUpSgUpSgUpSgUpSgUpSgVW3lthzitlRzAm5HXA2jVWRVCxoKyYNesDD72t+verJVqm8bQBGXxj8fwbr+cFA5seHfiWxsJs7t45WXOy825foFJ7O4M6A7YwCImAoB3D071F3H+6OU0dCQHHbL1myMJhhwcWk44dxhm/kMzCJjGM4H6nvAHfVXwzHyjV4t8TbJyFDwjKecnax7EWp3PRoDpdzbDY9tV5GR80O+Qfhw3XlZ9DJxS01BqnM1TUE5U+lUodhH1oI3Dh/4W/7f44P/AKkL/VWGZKg7Q4usWtw+HQ6JclyyygtZ1For9KGTaFDZBEga6PeEe9V+4P8Ah9QfLWwZi8pTIDuBPFyHsIJItSqlMHQBuoREQ161O8zZEb4SqZMkWjMp5AWvMwxSrV0INwblT98DgJNiPc2tUFd+GuR3zLno1v8AzdItoGSXXfKyyr0AbERcGJ3AwD9Xv8K2MZGtXgTlPLLDNN25Pg1rmjTt1G6yU4UiYCgICnsvx9AqkHJjiTDXbg+T5tJ3msEvdpkZlS3k0inKiZwbuQDgPUPT+Sutw88NGG5N4gSyXM5CkYFwo9Xai0IyA4ACZtAOzCHrQX7uyBw9yc5K2DLtnUTekFZsO+dK+Qcrhsk7E5ASBX4b11CAD61ZxK0bTTTKRO2IkhShoClZJAAB8vSqjcReNTPhjlJzjCJuJxcLe9YtSWUdroAkLYzYwEAgAGwHqA+/zVc8u+kNhqg+bZo1ZIlbs2ySCRfqppEApQ/IAdq+DuGh5BUq7+KZuVCfVOsgU5i/kEQ7V2Tdu4DWK33fTGz2ImOYFHigCCKID3EfmP2V4dw3HTbXprarVWitKxzMyy4MGTU5IxYo5mWRPIyLkiFRkI9q6ImOylWSKcC/kAQ7VyeMjVWYR6ke2O1AAAEDJFFMAD093Wqr3buUZ2MnlJKSXO5buzbWS32KG/UvyEKn2ImGM0xSkY9wVVFQvUBgH0+wajnS/W23dVVv+LPFqz+s+vHiY+Hv3HadRtsx9yOYny/KdsW0koVVK3owhyDspitEwEB+YDqvEyzMSlvYwu6fgnQNZCKhHr1qqJOsCKpImOURD49y+lZaHpWEZwDeGL+D52xKB/8AqqVMWreFhXPGP8oW/CNI2/oSXuNaMSdPWjRwUyhT9IdYiQPTQjWvPlxzw5V485S3HhzE7xm4bNnCSEcxLHAuscTJAYQDvsR3sa+URhlr4bdjQ/LqBmVLvez7VGOPEukwQTTByTzBMBw2I66Nenxr1ksYtr6gzeKetJKNpdkUZ4LWKUDIGMl+ABPzvraEPe3qgjl7yy8UKRZOI9zYEkZF0kdFQAtw2xKYogPx+Q1URzxl5GOnKrlbDd19apzKGEI44dxHY/Ct1vDXmBK8pMVXRkSStBtCqW86VblbpLioCoERBTYiIdvXVU9kPGuuxk+cMy4YjDAgqdPYyB++jCG/q/ZQWOsGS433hxDtHAWdb7iIxRtDMm0vFOJErZ03cIgA9BwHuUQMHcK115mtHA+Iua1lMcLT7VezGclDu1HvtoLppm80gqiKnpoPjUl8m+ILC7cEynOULpdEk7wFvNngU24GTQF2cNkBT1Hp6vXVdHh54acJyZw6nk6ayG/t9cz5w1M1BmUwFKmbQG2YQ9aCxviA+IDcOKl7OS44ZFt6RI+RcDKeSUjroMUSgTff3fU1X9xrNv7kx7bdwShymeSMW2dLmKXQCodMpjaD4dxrW995fx6H/r6c/IP2Kl/vVstsy30rUtKHtlByLlOKYosyrCGvMBMgFA359UHs0pSgUpSgUpSgUpSgUpSgUpSgVqj8bvYSONBD1BF3/OCtrla7PFb475hzpJWEpi6yXs+nFkcFeez60n1GDW9j8aDUFI3fdcuwTi5W5ZV4zS15bdw7UUTLoO2iiIgGq27Y7/vQMh+8Dj9OFRhz24nYewvxJtu7bcx41hLtO5YtpBwUxhUE5kx8wo7HX1gqQuInJviVH8Orfw1me/olEVGqreTjHImDZRU30m1+agrxwB5rY2494suPF90xswtL3PIGBks0IAkTFVIEi7Hew0Yd7r3J/wAKjlpfZvpGSyREv2bk5nbZF7JrKgmVT3g7G2ADoQ9KhTm+Tjknla2P1pQx4xvsiYq/R4mEPbfN9z63x+rU2MFPF59hbAzJdfs4pF8nSaOujQdOu3y1QZBYvFnL3B6VaZzz9cra48e22QUHcM2dndFMKgdKfSgp7g6H7KmiJ8XzirANfYIOxLgj2wCJgRbMUkibH1HpLoN1g3LXk7ZdxcI3OH74v1u4yw3QZozUWoGnBXaZ/wAKBgANbCtfeMeJPILMVslvDHGOJCaiDqnQK6QAvT1lHRg7j86Dc/xr56YY5S5CXtGxrdlm0sxjzvBcvm5C6RAwAYoGDuGxEO1Wm322NazvCz4+3Lgy+LnSzDZisBd0myAYYHI/hFWZRDzunQ60BhLutkMms/Rj11I9AFXJSCKRDDoBN8A3WPLkjFSbz34iZ+eytY+q0V93Esu8RYOVIxIqzpMgimmY2gMb4BVcyRd03zdCiDkigvBUHzjH7FRKHzD4AHwrJrIn77XvhVNRNVYyqmnqSm+lMv2fLXw+dS7IIGYtHz6FYoHkDk6gDsUVDgHYBGuSa3T4f5Gw11V5vjw4bTFqTH78e3ykuHJfYLzjiK2taI4n2590c3JhlmSBTGCOJn7Un4TY/wBm+I/kH5Vj+J390R9xjEM2yh2wm/ZaR+xUv877BrtWDPXy4vVZJUiq4Kqfs1NXYFSD5h8hD0APjUtyaZ2Me/dwLFA8gYgm6QAC9Z9dtj8a1+0bDt275qb7tdb6b7EzFqxH7RX2+Z8s2q1mo0mOdDqZjJ9XeJ9uXsEOAh6hsPhv0rHskQDu7MfXPazA5CupiHeMEDHHRQUVROQux+WzBUX44nr3cXesiqCq6apx9tIrsCpd/UPkP2VKOQTTwWFcY2r1hNfRLz6NFP63tXkm8rW/j19NdM6a6hx9SaWdTTHanEzHFo49PZodw0NtvyRitaJ7c9lbeW3Fa/c6cXbbw1ashGoTMQsyUWVcnEqJgSSMQ2hD7RCqiZE5HWZxs4rXDwUvVi/c3zFxp45V0zIBmQqKqAqAgYe+ukauTynPyhDjVbx8IFkhyD5rP6Q9lKUVujyzedvfb62q0jZ/NlwcqzX6uXtf3adZPpL2oABXq6Q6d9Pb6uqkbwtm3hDf3MGS/wB8nX9ELWpCc/t3IfupX+cNbe/BtFj+t5vv6TEvsf02r7R1dg8r2YnVv826kLGWCPDXzlPSkRji1renpOODz3ySCivUmBjCHUOx+YDQZJjzKti4W4AWNkLJEIaWgWFvxpHDUrcqwnE4FKX3Tdh0I1EK3iaceciW49w1jO0pqClbvRUhowyTQjdFF05AUyKD0a6dHMAiId6ovy9znlOHvW9+NsbdjhHHUFLKRsfCFKXykG6Cn4IgDrq0XQfH4VcDw1ePnHye43t85ZIs9ivMW9LPHoyyxjgKBGx+op9AOvdAu/T4UFOOUmDeR3FJeBJf2UX7r7oSrKNQYzDg3SCYl6gNs3b6wVvVw4ss4xPZ67hU6qikIzMc5zCJjCKRdiIj6jWo7xX8/wCIc5vrAPiq82c8SIReEd+ziP4ITmJ0gO/9Ea234X/FHZv7xsv0JaDM6UpQKUpQKUpQKUpQKUpQKUpQKpL4ifNLI/Ex3aSNhw8S9LPEXOv7cQxunoHQa1V2qqDzw4QTXL51a68RerOBC3yLFODhAynmicQENdPyoNX3JPxDMs8n7ATx7e0BBs2Cbwj0FGZDAfrKAgAd/wAtVtStW51Yv6bTt6SPHgXqF0DU4ogX03161/LWyD7yTev/ADzw/wDsalWayNgseP8A4cl14wkXzSVeQkGqUz1JHpA4mVKOw33+NBSbgJwlxzyFxdcWUrnlpdCVteRMLNBoYvlqGSTBUoGAe47MABWRTviu8p7HN9HP8aQ7Jo1OZq3VdsVk/MKmPSHc2gEdAFYDwc8QO3+JWP5mzpewX06pKyPtoLILkIBC9AF6RAfyVO07ecb4tSKeNrLhy2CvZphllnTwCrA4Kp7gEACdwEBLvvQVQw1jxXlrycGbzKyf2/B3eu5kXsggmKCCZxL1B0qHDpABH7a3R8XcJY+wHjBOwsZ3EpMw5Hazgrk65FR6zm2YOovb1quPNHGxsO+HKrYZnSDh9bzVgyO9QT6BUEp9CYB9Q3XreEYus44mNlF1TqG+mXgbOYTD/ZPtoLXv7Bi5DIcZkdRdcJCLjV4xJMoh5YpqmKYwj9uyhWUAAdIV+tB8q5qkwPJkkFGjV48h2SJn5yCJdgAdZgDsAjUCxOQbnty53D2VOqqZVTpdN1Nhr/RD4a+FWNNqsByRjltc6B5COIVKSSLsBAOyoB8B+2udddbHueqxY9ds+Sa5MUzaKR2i3/W82fWafFe2HV1ia37c+YdeeyZbcTDhKwpUVX0gXqKQoAA71rZ/yVhmM7gvGQus6iJ1HSLk3U88wfcIHzD5DWLW/Zc1PTIwxGp0Tom0uY5eyQb+NWIta14+1o5OPYJAGg2ooP1jm+YjUP6c/sHWW449dqucGHDPpEcfVbz2+Z9W03D8HacFsGL/AHe/me/EeHpItGyCiiqLZIh1R2cxS6Ew/MfnXjZAmpC2rHuO4YluDh9FxLt42SEomBRVNExyF0HcdiABqsjAA1XhXvPpWnZ09dThsLlKGjXUgdEvqoVFIxxL+fp1+eu50pXHHFIiI+EQmZlWTkry3u/GfHuByFjFrET13PlWhHkWQfPMkVRMTKD5ZNmDpMAB3DtVP8ncfbD5FYEuDltfc25j8sSzAzw9uNlClDz0zgmQhUB/CdyBvWqsbw+4Sz2OsuuORkpezSUjbsYLOEokUTiZv7SYqhQETe6PSHbtVJ+VeT0MMeJHK3+6YLPo63pVu6PHon6AVKDcAEoAPu+o7q9RafwnoKageMuSG83EvI9U790YpHKBkjGD2QvcAMADr4fmqFPCDnoOBzhktecl2UempHkAh3S5UimEHBxEAEwhupJDxjrGuFI9rMMMyTQ0wAsCnB0kAEMqHR1CAeuuqqn8wuD1y8VbZhb/AHl/N5RO6niiZEWqZ0jJe6CncR9frUFoPEP4O4ltzG98co4K45R5NSUgk+BMFinaiK6wAbpEPUPeHVZ/4ZjmxZvhHIWFdd1x8aSbeSrFcijxNJUqSoiURADD8h2FQjizkaw5i4WtrgVGQLqDlnMa3bjPulQVRAWgdZhEge97wF1VQ+U/H6e4p5RUxY9u0JVRNmi99oa9aRBBUu9aGglDn9xdw5xteWknie8lZ4JxNyd6KjpNbyhIYoF10D23sfWt22FvxRWZ+8TL9CWv5kVnbpyIe0OVVen06zibX8Nf034X/FHZv7xsv0JaDM6UpQKUpQKUpQKUpQKUpQKUpQK1o+L7ljJGNJPHhbCvWWgSO03IuQYuBSBXRg11a9e1bLqrVy8xHxWycrBqcj59rGqsU1gjAWkfZROA/W1/jd6CMLC8U/ixF2TBR9x3lLKyraPQSeGMwOYTLAQAOIj8e++9Wisa9ccckcXt7mh25Jm1bhSMUEniGirEAdCUxB+0K0wcKeO2Is58q7jxtdDVZ/azJF6syBs5EgmKRQATHrD1DQ1tvsq7eM/Ga3WuGY/IsJBIwACQrF9IB5yXUPV72+/xoNY/ioY/xxi7kBYzS1bTjYWJPHIuXqDJuBCKFBwPUIgHqPSAhVqcac8/D0xegm5s1knCP12qSLtZlCmTOp0lDYGEPUN7rNc92rwA5I3EyujKGToN4/j2vsiJkJsEignvfcA+0axOyeAPh3ZGdrMLEkQnXDUgKLJMpsVTJlEdAI6D0oPG5E8pcS838VSnHbAkq6k7znzpKMWzpsZukYqRuo+1Ddg0FUfsVlyQ4rchbJwbc13SUGitNMF14xk/6m501lSiOwL2HqAe9YReVzSvEjlddDzDahGCtrSjplGi6L53QkPu6Hfr2q3WOLqwjn3E0hyez3esUTM8ERwrFF9sBuHW1ARbfgP8LuAfloNorvIFtxl6RGPX74U5qZYrPmiRg7KJpCAH7/MOoO1ZQHpWszgjd9z847glL+zXOOTTuN1kgt93EH9kMiCoCJwMBd9YDoOw1meB+VHJBnnmeheSibe2scs/akY+UkI/2QiipVABIPOEe4iXY/bQX/H41+RL3DuHf1rWTdXiMXw05roYyiL+tscWqSSSB35UCGAEBSETD52/8b41feMyHat6WlM3Ljy/Gc4lGt1hFVmqVVMipExMBR1+aqcDOk2jZJQ6qSJCnVHZzFAAEw/bX20O61s8HvEOu/JGRrvg+Qt923FQ8aiAxx1EitepQFTFEOoR97sAV0sd+IzesxzSkcb3PfdtI4vRfvUkHvklIUUSAPlD52++x13+NW1pWkcVjiCZme8tmoBoKwDPrxrH4QyA6eOCIpEtmT6jmHQAItjgH8ogFdCO5MYBl3zeLjMuWy5eOlSooIpviidQ5h0BQD4iI1Rzxl8p3za8BZtg2/cThjB3Im4PKIIjr2oCGL0lMProN+nxq8RR4UWZMpXjyLWtW579mZSFa2+5FBk4cidEglOmBdFH00A1nXJDile0fzHluUeQrZj3eJY16jISx1VSqGO1KiBDbR9Te8IdqlrijZ3A/BScLkq2MjwsfdLyFTQfe0TIGABUKQygdA+g9QVYq58mca87wD3ETzJ0BLI3Qn7Cdk0kC+cuAj1dJdd9+7QRfimM4V8gsfXFfGIMYQKqUKRdEXCkSCJ0nBUusol38tgO60oZMy7k3IDhSGva95eZYxzpUWiDxwKhER30+6A+nYAD81bAeUV3yfh6X7B4Y47OU4e0rvakfTCb8vtJzHUUFI5gOOukPLKFYJy/4tYFXs63ZDiK2Xu65XTk6s43jHgvTopGIUQMYgfVATiagmHi7zA4EYkxxZastEIML5iYlJB/IN4cTLAv0dKg+YHrvv3qxl8vONvKvjzfOdbZtKNnFkIKRbt5R6w6XJFEET611dw6RDtUAcduD/CC+bKtSAvRwb9UdzHJmlogJcSOk3QE2qQUtbKJRAdh8Ku/jjjVi7FmJpDC1pRzpC2ZQjlNwio4E6gguAgpo3w2AjQa4vCExNjTJbPJBr9siInhYuGQNhfNwU8oDAp1AXfp6BW21iyaRzJCPYNyINm6ZUkkiBopCAGgAA+QBWq7l07V8M51b7TisIQ6d7lWWl/b/wBlioZAQBPp6tdPY5q2Z41m39yY9tu4JQ5TvJGLbOlzFDQCodMpjCAfDuNBktKUoFKUoFKUoFKUoFKUoFKUoFVY5p8K7d5bObcWnr+WtwYAqpUwTSIbzusd/wCEPwq09U35+8Vs28kXVqq4ivVKBLDEWK7A71RDzBMPYfcHv+egrvJ4Ai/C9b/rhrKuVS/3zkfoUYtchUygRXuKnUTY9ukK/bDhNbfPZqTlJdV/rWfJXl+FWh0kyHK26Pd0AnEB7633qQeGvA3OOHMqrXTm67Y26oA0eq3KyXdHdlBYRDpP0KbDYaHvWM8m/Dx5I5LzPP3liu/2Fv20/OQzOPSfqtyogBQAQBMggUNj8goPNDwXMdCH4+nn+zI/115s3ZUZ4SqSeSbOmiZAXvIRilWrsSog3Kn74HASbERHq1qsR+9Z81fhmhr/ABy5/rrz5fwk+W9wJpoT2TYiRTSETEK6kVlQKI/EAMI6oKQZZvx7l/J9xZDPFg1cXC/UfGaoiJwTEw70A+ohWInbOUlPKWbqkUHQAQxRA32dquVwYxYpYvPxhi282zCTVhVnzJ0UyYKoKHIQQ2AGDuG6ujyI8PW9MncrYHMNmFtmPtWOVjzuGBiAmJwREBU9wA6R3ofy0Ef+CW1ctY7JYOG6qXUsz11kEu/dH51dflrxoYcqcZp45krjXhUk36b4HCKQKGESAYOnQ/PqqWYK2LdtwhiwUDHx3mgHm+yNiJdYh8+kA3UdclORtncYbDTyFezF+7YKPE2QEZkAx+s4CID3+HYaDSTc/E6Ht7mWhxdG7nBmKsimxNKmSKU5SmTE4m6fT4arbdxt4xW1xLw5eVmRN9BPFlSOnoqrdCZim8gS9IAUfsrUnli5lOYnMxaXxI6cQ695P00o1Z2YUjonBL1MJe4fVH0rnkLjDOvErIVv27knI7+RM7IlJCDKUWOQyJVdGKYBN330jQV8uVo7bzcgo4aqpFM7W0JyCAD74/OpL4oYLY8jc2w2KH84tEoyqaxxdJJgcxOgnV6DV4ciPLI8TG34nHHHC2WdszVnAEhKOZFom3KumcoEAAMQNiPUUw9/nUL8BbAlsV+IVG48nFkVX8ArIMXCiI7IY5ExARL9lBYl94Vlm4JTPl5plx5IvbJKM8iwVapk9pO3DzCpjodh1CUA2HzqoHMnl3dXLx1bZ5XHn0D9zZFkieQKinneYIdx2Hb0rY7yR4dZzyxyog8t2rejZpZ7E8f7ZGqvVCgsRIQ80opgPSIGABDuHes65R8heOXExWAbX/i1o8PPJqGbixiUDdPliAD1bL9tBrc5LeHzE4K47wGa4u9ZCXeTKjMh2BmgFBPzkxOPcO/bWqnDw/OBNryMXjrk8/yMu0kmzg740QdIhS9RROQCiYR2Hz3UoSHi8cU5ZiSLlMdzrtmloSILsUjpl16aKPYNVXTkBhjK+Z7YubmdiK7jW7jV229vaQ5HijZZFJMQTMUEiCBCj1AI9vnQc+NA4bus42go3XTVKFugAiQwG/8ALqfKu94Krls1yzfpnK6aRRhG+hOYAAfwpvnUFceOFucOZdtv72gbxZqpRDv6OMMu7UOoA9IH90R320b0qZ4fwiOVtvKqLQORIONUVL0qGaPlUhMX5CJdboJ8zfx/h+JuRLm54W5dJrmmEZBVyW3jFKVMwuzdBg6yiJvd6t+lT9gbl9I5d4xz2eZe12kRIQ6MioSLFwOlfZimMHc2h97X8taocR5OkuLXKhWPzzMyl0xNpunkfJMwcHdIrKgUSAIEUESmADaENhU95vxXevMuHnuT/H6ZLamO2EWqi4hlFjNTHM1THzx8pPRB6tD8O9BXTmfzSl+X7u21ZWzWsCNtkcJEBBcyvm+YYo7Hfprpre1hf8UVmfvGy/Qlr+Yw4CQxiiPcBEBr+nLC34orM/eJl+hLQZpSlKBSlKBSlKBSlKBSlKBSlKBWuzxW+ROY8Fv7ESxVejuCCUTcC6BuBfwolEADewrYnWqXxtv7b4x/1br+cFBgkVK+LnORbSZil7qXZvkSroKlBHRyGDYCH5Qrtf8AHA/9LP4EauDyK5G3lxi4e2PkKyWDB2/UQjmYkeFEUwIZHYj2+PaqP/fmeR37VbV/7A39dB7bp14vbFqs9dKXWmg3SMqocQR0UpQERH+AKl7ws+Smc805MvOByvfL2bQio5JRFBcC/glfMMUw9g+zVTVwr5SX1yqwPfV333HRzN3Gi6ZJFZEEpBJ7OJtjv496qj4Of4+Mn/uMP6QeggHIf6sv6/i9/wBQL2v7s/p597F7J0+Zrfv66u3pXr3nyb8RPH1/NMX3bfdwR9zPjIkQYKAn1nFUdJ+ga77Ctoto8EMW2fyId8k46ZmD3C7dOHR26ihfZwMqGjAAeuqobzwH/jLLJ/dMH/PLQcEHxfxMUTDdYgOv8j6Vs3lMQ21mnE8Bamc7bTmzEbtnL1u62H7LKT3jDofUBEarr4hvNDJPE9zZjewomKeln0ljuBepibp6BAA6dflrJ+WfKy/MGcX7azRa8bGuJiZUZFWSckEUS+ckJjaD8oUESZjsDhpi9/M2TgaIiIrOseQC240adftSb4QAS9G/d30Cb1qluY+NHiE5kfJ3Xlqxp6ZcxbQyZXDgUwFJAuzCHYfyjVh2MLjy8MaH8ReYutmjlloiaXTgyu0wai4TN5RS+UI9ehKO9VgCfitcsrzhnrWJxlEv2zhJRsqqzjllQL1lEBDZQEAHQ0FceKDflS2uudQ4wFkyzabcpJQrLo6gSA4gUDdXw6t1iknkfN2J84y17yM49iciM3q5X7owF84jg2wU38Njus1wFyJzRw+ueZvaFsryF7kT9nV+l2SpE+xxP7mwDv71XltfhNxi5L29H55yRlA0Xc98IFmZRm3lEE00XCvvGKUph2AAPwGgo/8AfD+YPp+rNK//AGk/qr9lR5gc7BByJJa/Atb3BN7gezeb318PXX8lXlvnwouNzDGFy3rZF5T8w4iox06aA3dEXTVWTTMYpPc3vuABoK+Pgw2zcFuMclknoKQjvNcMvL9rbHS6wApvTqAN0Fi7C8PHi2ayoIbowvG/S/0eh7d1ifq8/oDr3ofXe69HlTj60cW8Hcg2TY0QlFwsdBnK2apbEqYCqUR1v7RGrBR93WrLPlIuLuSMePEgN1t0HZDqFAB0OygOw0PrWq7xBOcWYW2RMgcVoa3Yx5CPE048hk0DHdnKchTjrXqO6CSPB0B5+tzv8Izq9s+mVhb9Pr5vspOjX271UjcFR5rfqiXaPJn6YGBFqX6J9t6OnzPNNvp6f83Va8+MPKTk3xVtOStCw8UrvGsm99uVM9iVzGA/SUug0X00UKlWZ8WrltbySa89jOHjk1R6SHdxyyQGN66ATAGxoKq80O3KnJwf9I3n6QanDhdC8zLktyCt7HjWXc4ikpr2WaQR6PZ1EFFAK6KbffQlE29VHuAbUYc2OX/sOS1VGBLzcvZJ6McPQJFOgx9E38NhW5PH2G4bh1x1uO3cXHeygwrOQmGhXv4Q6rjoMcCCBfUBEADQUFIef3h5uBc2ebi1hj3PKcjMixN269l8vq6h/wBL0rZliuKfweNbXhpRuZB4xiGrddI3qRQqRQMH5hCtSc34uHLC2zkLPY5hI7zhHyva49VHrAPXXVrdbdMeT7u6rFgLlfkIRzKRzd2qUge6BzpgYQD7NjQZDSlKBSlKBSlKBSlKBSlKBSlKBWqXxtv7cYw/1br+cFbWq1S+NoYCy+MxN8EnQj+TqCgznxHv739Yf+siv0FaeK3PQ3iEcHpzFNtWHkk68wSMYNU1mruJFVIqyaYAIhse+h33rzv13HhZB/6Axn/d3/8A2g83wjP7lvJf7tdf0Wo28HL8fGTxH/2IP6Qep7j/ABDeB1mWdN25jsqsIlJNVwFBnECkQ6pkxKAiAD+TvUAeDU4Se5vyU7QERSXjyKk2HqUy5xD+SgnDL3i52rifJdx44dYnknytvPlGJ3JHhClVEg66gAfTdUdyFyOj+UXNmxcnRturQyKkrEtPZVlAOb8GoUBHYfOtnXNjiDAZcw/cjfGGOYEb7lXCSyb8yZUlTiB9nEVPmIVrrsfw5+TeIbyhMp3lbsYhA2m/RmJJVJ+U5yN0DAooYpQDuIFKOgoNg3OjhBM8vV7ScxN6NYELeSVIcF0DKeb16Htr01qsj5NcRpXPfHS3sIMbrbxjiFO0MZ6qiY5FARTEo+6Hfvus34/8qMSclWksfFkq7eBB+WR4LhsKQlMYB1rfr6VQzgJmDKN4c4r0tW6L8mZOIapSQosnLkTpE6VwAogUfTQUFOZ7ivPwPKtHika9iKrrv02P0gBDgjsyfX1dG/QNelbeOHXFJfh7i25oSfnWNynWcqypVE23RopUg9z3v9Ef4aorkL+/AMP+sDf+jjW4xwii4RUbrpgomqUSHIb0MUQ0ID9lBq1um7I3xXXCmJ7OiCWC4sVc8is7dAVYrkpxFMCgBAAQ0JN9/nVM7F4tXLeHKd7xda30DV0weOmYSOj+UPkAIiIEAdhvVblcmXzxh4UNG15TVsMbZ+6JUzQHEXH7UXMX3hA3T8Pe3WnN2tfXIHmTcUrxtl3LeXuOVevYh0C3synlDswj1f4Pu/CguTE8nWXhiMv1sV3W86vp6gJpY0mguCKZiuPfAnSfY9t1ajhdzKt3ls3uZeBsRW3AgDokUBRQh/O8wBEPqh8NVV/H+QMF8d4AMfc9olGeygmodyq7ds/pE/shx2iXzfjovw+FW14jZZ4vZPQuA/G2BbRqTE6ISfkx3svWYwD0b/xuwDQR1xn4GXTgnkRPZqk8jIS7SYTeEJHkSOUU/OUA4DsR121qqe5HImr4wDFNQgHINwttgYNgP7Fq4nir31eGP+Nbacsm5H8K/GebIi4ZrCmoJBIoIl2Hw7B/BUT2ZAw0t4brvP8AJxrdzkdKGXdkudQm5AqxXHSU4K+vUBe2/lQbHPoqL/5Na/8AYl/qqs3OPhy65ZWjb1tQVwsLcUhX6rs6p23UCpTkAuvd16aqKfCbyjeV64OvG4siXZJTasdMqCC71UVTpolQIYQAR+HqOq8DkPnW5ObMYxsfhNeMqlcdsu1Hc3tUzABbmACE94fre8U3agoHi670eDHLx1ITTQ1yhZLx7GqFbD5XtA9Jk+ovV6d+9bjcI8uIjNnHGb5AtrRcMGcOk/OpHqqlOZQGxRMIdQdve1/LWn/PPBjlFjG2ZjMWWWTVVoRcp370ZAFllFFDaAw9tiIiNbIfCXjWUvw3LFSbVNy0eS8iiuioGyqEMcQEoh8QEKDXdzq5k2/y1d2srA2Itbn3OkcpqgoqQ3nCoYogIdIfDpH+Gt4mFvxRWZr/AJDZfoS1XfkE94JcZlohHKmLoFmecKqdoCEMCvUBBDq3r09Qq0tpPoaTtiKkbdTBOLcs0lWZQJ0AVExAEgdPw7a7UHr0pSgUpSgUpSgUpSgUpSgUpSgVDPIHiZhzkutErZUiHT40MBytfIcmR6QOOx3r1qZqUFOg8KPh6If+KMt/GZ6feouHv7UZb+Mz1cWlBTr71Fw9/ajLfxmepSwHw4wjxrm5GexZCvGTuUQK3cmXdGVAxCiIgAb9O41OdKDivJum24y8LekrVmkjKMJZqozckKbpEyZyiUwAPw7DXr0oIcwFxVxDxqSl0sVxLpkWcMQzsF3JleoS+mt+nrXm4s4a4Pw7kuRyzZMK8bXBKlWK5WVdGOQwKmAx9FHsGxAKnSuaCCZPhng6YzenyEeQjw14pOSuyuAdmBPzCk6QHo9PSp1CuaUEU59414t5Jw0bA5Si3L1pFLncNioOBREpzAADsQ9ewBWBYh4AccsI32xyNYNuP2k1HlUIgoq+OoQAOGjbKP2VZOlBXjNvBXj7yBvU9/5HgHzuXUbpthUReGSL0EDRewfZWS8f+K2IeMyUsjiqJdMizZkzu/PcmW6hIAgXW/T1GphpQRznHA+PeRFnEsXJbBd3FEdEdgmiuKRvMKAgA7D7DDXRjON+MIjCCvHplHOS2aq1OzM2FcRU8sx+sQ6/X61SrXFBE2E+MuKuP9oy1j43i3TSKmlTrOyLOTKmMYxAIOjD6e6FeTgvh/hTjpcctdOMoZ2zfzaQIuzrOjKgYoGE3YB9O4jU36D5UoMJy/iOzc4WI9xzf7RV1CSB0zrpJKiQxhIYDF7h9oV08I4NsDj7ZJLAxuwXZw5HCjoE1lhVN5hx2YeoakKuaCGOQHEzDnJhWIWypEO3p4QqhWnkOjI9IHEOrevX6oVK8BCsLbg2FvxaZiM45um1QKYdiCZCgUoCPx7BXoUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoFKUoP//Z" alt="QR Binance" style={{width:160,height:160,borderRadius:10,border:'1px solid rgba(201,168,76,0.3)'}} />
              </div>
              <div style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'10px 14px',marginBottom:12,textAlign:'center'}}>
                <p style={{fontSize:10,color:'#555',marginBottom:4,textTransform:'uppercase',letterSpacing:2}}>Pay ID</p>
                <p style={{fontSize:22,fontWeight:900,letterSpacing:6,color:'#C9A84C'}}>176779028</p>
              </div>
              <a href="https://wa.me/+32455136804?text=Hola%20CutConnect%2C%20acabo%20de%20pagar%20mi%20suscripci%C3%B3n%20por%20Binance%20Pay." style={{display:'block',background:'#25D366',color:'#fff',textAlign:'center',padding:'12px',borderRadius:8,fontWeight:700,textDecoration:'none',fontSize:13,textTransform:'uppercase',letterSpacing:1}}>
                📱 Enviar comprobante por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loggedIn && userData?.rol==='dueño' && ['trial','activo','aprobado'].includes(userData?.estado_verificacion)) {
    const diasRestantes = userData?.fecha_trial_inicio ? Math.max(0,Math.ceil(14-(Date.now()-new Date(userData.fecha_trial_inicio).getTime())/(1000*60*60*24))) : 14
    // @ts-ignore
    const maxCitas = Math.max(...rankingBarberos.map(b=>b.total_citas),1)
    const isProD = proActD
    const isPendingD = proPendD && !proActD
    const nowD = new Date()
    const citasCompD = citas.filter((c:any)=>c.estado==='completada')
    const ingrHoyD = citasCompD.filter((c:any)=>c.fecha===nowD.toISOString().split('T')[0]).reduce((a:any,c:any)=>a+(c.servicio?.precio||0),0)
    const ingrSemD = citasCompD.filter((c:any)=>{const d=new Date(c.fecha);return d>=new Date(nowD.getFullYear(),nowD.getMonth(),nowD.getDate()-nowD.getDay())}).reduce((a:any,c:any)=>a+(c.servicio?.precio||0),0)
    const ingrMesD = citasCompD.filter((c:any)=>c.fecha?.startsWith(nowD.toISOString().slice(0,7))).reduce((a:any,c:any)=>a+(c.servicio?.precio||0),0)
    const gastosMesD = gastosD.filter((g:any)=>g.fecha?.startsWith(nowD.toISOString().slice(0,7))).reduce((a:any,g:any)=>a+g.monto,0)
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
            <button className={currentPage==='yo-barbero'?'active':''} onClick={()=>{setCurrentPage('yo-barbero');cargarPerfilDuenoBarbero()}} style={{color: perfilDuenoBarbero ? '#2ECC71' : '#C9A84C', fontWeight:700}}>✂️ Yo corto</button>
            <button className={(currentPage==='pro-dueno'||(currentPage==='dashboard'&&isProD))?'active':''} onClick={()=>{if(isProD){setCurrentPage('dashboard');cargarMisBarberos();cargarRanking()}else setCurrentPage('pro-dueno')}} style={{color:'#C9A84C',fontWeight:700}}>💎 VIP{isProD&&<span style={{marginLeft:4,fontSize:8,verticalAlign:'middle',color:'#2ECC71'}}>●</span>}</button>
            <button className="btn-logout" onClick={handleLogout}>Salir</button>
          </div>
        </nav>
        <div className="dashboard-content">
          {userData?.estado_verificacion==='trial' && diasRestantes<=3 && (
            <div style={{background:'rgba(231,76,60,0.06)',borderBottom:'1px solid rgba(231,76,60,0.12)',padding:'10px 32px',display:'flex',alignItems:'center',gap:10}}>
              <p style={{fontSize:13,color:'#FF6B6B'}}>Tu período de prueba vence en <strong>{diasRestantes} días</strong>.</p>
            </div>
          )}
          {userData?.estado_verificacion==='trial' && diasRestantes>3 && (
            <div className="trial-banner"><p>Período de prueba activo - {diasRestantes} días restantes</p></div>
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
                <div className="stat-card"><h4>Citas pendientes</h4><p className="stat-number">{citas.length}</p></div>
                <div className="stat-card"><h4>Profesionales</h4><p className="stat-number">{misBarberos.length}</p></div>
                <div className="stat-card"><h4>Canceladas</h4><p className="stat-number">{citas.filter((c:any)=>c.estado==='cancelada'||c.estado==='cancelado').length}</p></div>
                {userData?.estado_verificacion==='trial'&&<div className="stat-card"><h4>Días trial</h4><p className="stat-number" style={{color:diasRestantes<=3?'#FF6B6B':'#fff'}}>{diasRestantes}</p></div>}
              </div>
              {isProD ? (
                <div style={{background:'linear-gradient(135deg,rgba(201,168,76,0.08),rgba(201,168,76,0.02))',border:'1px solid rgba(201,168,76,0.2)',borderRadius:16,padding:24}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
                    <div>
                      <p style={{fontSize:10,color:'#C9A84C',textTransform:'uppercase',letterSpacing:3,fontWeight:700,marginBottom:4}}>💎 VIP - Finanzas en tiempo real</p>
                      <h3 style={{margin:0,fontSize:16,fontWeight:800}}>Ingresos del negocio</h3>
                    </div>
                    <button onClick={()=>{const csv='Fecha,Cliente,Servicio,Monto\n'+citasCompD.map((c:any)=>c.fecha+','+c.cliente_nombre+','+c.servicio?.nombre+','+c.servicio?.precio).join('\n');const b=new Blob([csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='ingresos.csv';a.click()}} style={{background:'rgba(201,168,76,0.1)',border:'1px solid #C9A84C',borderRadius:8,padding:'8px 14px',color:'#C9A84C',fontWeight:700,cursor:'pointer',fontSize:11}}>📥 Exportar CSV</button>
                  </div>
                  <div style={{marginBottom:16}}>
                    <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:12}}>
                      <div style={{flex:1,minWidth:130}}>
                        <label style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:4}}>Desde</label>
                        <input type="date" value={rangoD.desde} onChange={e=>setRangoD({...rangoD,desde:e.target.value})} style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'8px 10px',color:'#fff',fontSize:12}} />
                      </div>
                      <div style={{flex:1,minWidth:130}}>
                        <label style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:4}}>Hasta</label>
                        <input type="date" value={rangoD.hasta} onChange={e=>setRangoD({...rangoD,hasta:e.target.value})} style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'8px 10px',color:'#fff',fontSize:12}} />
                      </div>
                      {(()=>{const t=new Date().toISOString().split('T')[0];return(rangoD.desde!==t||rangoD.hasta!==t)&&<button onClick={()=>setRangoD({desde:t,hasta:t})} style={{background:'rgba(255,107,107,0.08)',border:'1px solid rgba(255,107,107,0.2)',color:'#FF6B6B',borderRadius:8,padding:'8px 12px',fontSize:11,cursor:'pointer',fontWeight:700,alignSelf:'flex-end'}}>↩ Volver a hoy</button>})()}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    {(()=>{
                      const todayStrD=new Date().toISOString().split('T')[0]
                      const desdeD=new Date(rangoD.desde+'T00:00:00')
                      const hastaD=new Date(rangoD.hasta+'T23:59:59')
                      const filtradas=citasCompD.filter((cc:any)=>{
                        const f=new Date(cc.fecha+'T12:00:00')
                        return f>=desdeD&&f<=hastaD
                      })
                      const totalRango=filtradas.reduce((a:any,cc:any)=>a+(cc.servicio?.precio||0),0)
                      const esHoyD=rangoD.desde===todayStrD&&rangoD.hasta===todayStrD
                      const labelD=esHoyD?'Hoy':`${rangoD.desde} → ${rangoD.hasta}`
                      return [{l:labelD,v:'$'+totalRango,c:'#C9A84C'},{l:'Semana',v:'$'+ingrSemD,c:'#00D4FF'},{l:'Mes',v:'$'+ingrMesD,c:'#2ECC71'},{l:'Gastos mes',v:'-$'+gastosMesD,c:'#E74C3C'}].map(s=>(
                        <div key={s.l} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,padding:'18px 14px',textAlign:'center'}}>
                          <p style={{fontSize:24,fontWeight:900,color:s.c,margin:0}}>{s.v}</p>
                          <p style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:1,marginTop:4}}>{s.l}</p>
                        </div>
                      ))
                    })()}
                    </div>
                  </div>
                  <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:12,padding:16,marginBottom:16}}>
                    <p style={{fontSize:11,color:'#888',textTransform:'uppercase',letterSpacing:2,marginBottom:12}}>💰 Registrar gasto</p>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                      <input placeholder="Descripción" value={gastosFormD.descripcion} onChange={e=>setGastosFormD({...gastosFormD,descripcion:e.target.value})} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'8px 10px',color:'#fff',fontSize:12}} />
                      <input placeholder="Monto $" type="number" value={gastosFormD.monto} onChange={e=>setGastosFormD({...gastosFormD,monto:e.target.value})} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'8px 10px',color:'#fff',fontSize:12}} />
                    </div>
                    <select value={gastosFormD.categoria} onChange={e=>setGastosFormD({...gastosFormD,categoria:e.target.value})} style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'8px 10px',color:'#fff',fontSize:12,marginBottom:8}}>
                      {['Suministros','Renta','Servicios','Nomina','Marketing','Otros'].map(c=><option key={c} value={c} style={{background:'#111'}}>{c}</option>)}
                    </select>
                    <button onClick={async()=>{if(!gastosFormD.descripcion||!gastosFormD.monto)return;const uid=String(userData?.id);const body={usuario_id:uid,descripcion:gastosFormD.descripcion,monto:Number(gastosFormD.monto),categoria:gastosFormD.categoria,fecha:new Date().toISOString().split('T')[0]};try{await fetch(`${SB_URL}/rest/v1/gastos`,{method:'POST',headers:{...sbH,'Prefer':'return=minimal'},body:JSON.stringify(body)});await cargarGastosD(uid)}catch{}setGastosFormD({descripcion:'',monto:'',categoria:'Suministros'})}} style={{width:'100%',background:'rgba(201,168,76,0.15)',border:'1px solid #C9A84C',borderRadius:8,padding:'9px',color:'#C9A84C',fontWeight:700,cursor:'pointer',fontSize:12}}>+ Agregar gasto</button>
                  </div>
                  {gastosD.length>0&&(
                    <div style={{marginBottom:16}}>
                      <p style={{fontSize:11,color:'#888',textTransform:'uppercase',letterSpacing:2,marginBottom:8}}>Gastos recientes</p>
                      {gastosD.slice(-5).reverse().map((g:any)=>(
                        <div key={g.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                          <div>
                            <p style={{fontSize:12,color:'#ccc',margin:0}}>{g.descripcion}</p>
                            <p style={{fontSize:10,color:'#555',margin:0}}>{g.categoria} · {g.fecha}</p>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <p style={{fontSize:13,fontWeight:700,color:'#E74C3C',margin:0}}>-${g.monto}</p>
                            <button onClick={async()=>{try{await fetch(`${SB_URL}/rest/v1/gastos?id=eq.${g.id}`,{method:'DELETE',headers:sbH});await cargarGastosD(String(userData?.id))}catch{}}} style={{background:'none',border:'none',color:'#555',cursor:'pointer',fontSize:14,padding:0,lineHeight:1}}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,padding:16}}>
                    <p style={{fontSize:11,color:'#888',textTransform:'uppercase',letterSpacing:2,marginBottom:10}}>🏆 Ranking del equipo</p>
                    {rankingBarberos.length===0
                      ? <p style={{color:'#444',fontSize:12,textAlign:'center'}}>Sin datos de ranking aún</p>
                      : rankingBarberos.slice(0,5).map((b:any,i:number)=>(
                        <div key={b.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                          <span style={{fontSize:14,width:20,textAlign:'center'}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</span>
                          <div style={{flex:1}}>
                            <p style={{fontSize:12,fontWeight:600,color:'#fff',margin:0}}>{b.nombre||b.name||'Barbero'}</p>
                            <div style={{background:'rgba(255,255,255,0.06)',borderRadius:4,height:4,marginTop:4}}>
                              <div style={{background:'#C9A84C',borderRadius:4,height:4,width:Math.round((b.total_citas/maxCitas)*100)+'%'}} />
                            </div>
                          </div>
                          <p style={{fontSize:12,fontWeight:700,color:'#C9A84C',margin:0}}>{b.total_citas} citas</p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              ) : (
                <div style={{background:'linear-gradient(135deg,rgba(201,168,76,0.06),rgba(201,168,76,0.01))',border:'1px solid rgba(201,168,76,0.15)',borderRadius:16,padding:24,position:'relative',overflow:'hidden'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
                    <div>
                      <p style={{fontSize:10,color:'#C9A84C',textTransform:'uppercase',letterSpacing:3,fontWeight:700,marginBottom:4}}>💎 VIP - Finanzas avanzadas</p>
                      <h3 style={{margin:0,fontSize:16,fontWeight:800}}>Ingresos y estadísticas del negocio</h3>
                    </div>
                    <button onClick={()=>setCurrentPage('pro-dueno')} style={{background:'linear-gradient(135deg,#C9A84C,#B8972A)',color:'#000',border:'none',borderRadius:10,padding:'10px 18px',fontSize:12,fontWeight:800,cursor:'pointer',letterSpacing:0.5,whiteSpace:'nowrap'}}>Ver planes</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,opacity:0.18,filter:'blur(4px)',pointerEvents:'none',userSelect:'none'}}>
                    {[{l:'Hoy',v:'$0',c:'#C9A84C'},{l:'Semana',v:'$0',c:'#00D4FF'},{l:'Mes',v:'$0',c:'#2ECC71'},{l:'Citas',v:'0',c:'#BB8FCE'}].map(s=>(
                      <div key={s.l} style={{background:'rgba(255,255,255,0.04)',borderRadius:12,padding:'18px 14px',textAlign:'center'}}>
                        <p style={{fontSize:26,fontWeight:900,color:s.c,margin:0}}>{s.v}</p>
                        <p style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:1,marginTop:4}}>{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{textAlign:'center',marginTop:16}}>
                    <p style={{color:'#888',fontSize:13}}>Activa <strong style={{color:'#C9A84C'}}>💎 VIP</strong> para ver tus ingresos en tiempo real</p>
                  </div>
                </div>
              )}
              <div className="action-buttons">
                <button onClick={()=>{setCurrentPage('equipo');cargarMisBarberos()}} className="btn-primary">Gestionar equipo</button>
                <button onClick={()=>{setCurrentPage('citas');cargarCitasDueno()}} className="btn-secondary">Ver citas</button>
              </div>
            </div>
          )}
          {currentPage==='negocio' && (
            <div className="page">
              <h2>Mi Negocio</h2>
              <div style={{marginBottom:24}}>
                <h3 style={{marginBottom:12}}>Logo del negocio</h3>
                <p style={{color:'#555',fontSize:13,marginBottom:14}}>Se mostrará a todos los clientes</p>
                <ImageUploader tipo="logo" id={userData?.barberia_id} urlActual={userData?.negocio_logo} label="Subir logo" onSuccess={url=>setUserData({...userData,negocio_logo:url})} />
              </div>
              <div className="welcome-card owner">
                <p><strong>{userData?.negocio_nombre}</strong></p>
                <p>{userData?.tipo_negocio==='peluqueria'?'Peluquería':'Barbería'} · {userData?.ciudad}</p>
                <p>{userData?.negocio_telefono}</p>
              </div>
              {!editNegocio
                ? <button className="btn-primary" style={{marginTop:16}} onClick={()=>{setEditNegocioData({nombre:userData?.negocio_nombre||'',descripcion:'',telefono:userData?.negocio_telefono||'',logo:userData?.negocio_logo||'',tipo_negocio:userData?.tipo_negocio||'barberia',fidelizacion_citas:10,fidelizacion_beneficio:'',instagram:'',facebook:'',web:''});setEditNegocio(true)}}>Editar datos</button>
                : (
                  <form onSubmit={handleGuardarNegocio} className="edit-negocio-form" style={{marginTop:16}}>
                    <div className="form-group"><label>Tipo</label>
                      <div className="category-selector" style={{gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
                        <button type="button" className={`category-btn ${editNegocioData.tipo_negocio==='barberia'?'active':''}`} onClick={()=>setEditNegocioData({...editNegocioData,tipo_negocio:'barberia'})}><span className="cat-icon">✂️</span>Barbería</button>
                        <button type="button" className={`category-btn ${editNegocioData.tipo_negocio==='peluqueria'?'active':''}`} onClick={()=>setEditNegocioData({...editNegocioData,tipo_negocio:'peluqueria'})}><span className="cat-icon">💇</span>Peluquería</button>
                        <button type="button" className={`category-btn ${editNegocioData.tipo_negocio==='spa'?'active':''}`} onClick={()=>setEditNegocioData({...editNegocioData,tipo_negocio:'spa'})}><span className="cat-icon">🧖</span>Spa</button>
                        <button type="button" className={`category-btn ${editNegocioData.tipo_negocio==='gimnasio'?'active':''}`} onClick={()=>setEditNegocioData({...editNegocioData,tipo_negocio:'gimnasio'})}><span className="cat-icon">🏋️</span>Gimnasio</button>
                        <button type="button" className={`category-btn ${editNegocioData.tipo_negocio==='manicurista'?'active':''}`} onClick={()=>setEditNegocioData({...editNegocioData,tipo_negocio:'manicurista'})}><span className="cat-icon">💅</span>Manicure</button>
                        <button type="button" className={`category-btn ${editNegocioData.tipo_negocio==='estetica'?'active':''}`} onClick={()=>setEditNegocioData({...editNegocioData,tipo_negocio:'estetica'})}><span className="cat-icon">💄</span>Estética</button>
                        <button type="button" className={`category-btn ${editNegocioData.tipo_negocio==='masajes'?'active':''}`} onClick={()=>setEditNegocioData({...editNegocioData,tipo_negocio:'masajes'})}><span className="cat-icon">💆</span>Masajes</button>
                        <button type="button" className={`category-btn ${editNegocioData.tipo_negocio==='tatuajes'?'active':''}`} onClick={()=>setEditNegocioData({...editNegocioData,tipo_negocio:'tatuajes'})}><span className="cat-icon">🎨</span>Tatuajes</button>
                        <button type="button" className={`category-btn ${editNegocioData.tipo_negocio==='cejas'?'active':''}`} onClick={()=>setEditNegocioData({...editNegocioData,tipo_negocio:'cejas'})}><span className="cat-icon">👁️</span>Cejas</button>
                        <button type="button" className={`category-btn ${editNegocioData.tipo_negocio==='veterinaria'?'active':''}`} onClick={()=>setEditNegocioData({...editNegocioData,tipo_negocio:'veterinaria'})}><span className="cat-icon">🐾</span>Pet Grooming</button>
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
                    <div style={{background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.12)',borderRadius:12,padding:18,marginTop:4}}>
                      <h4 style={{color:'#C9A84C',marginBottom:14,fontSize:13,textTransform:'uppercase',letterSpacing:2,fontWeight:700}}>📱 Redes sociales</h4>
                      <div className="form-group" style={{marginBottom:12}}>
                        <label>📸 Instagram (usuario sin @)</label>
                        <input type="text" placeholder="tunegocio" value={editNegocioData.instagram||''} onChange={e=>setEditNegocioData({...editNegocioData,instagram:e.target.value})} />
                      </div>
                      <div className="form-group" style={{marginBottom:12}}>
                        <label>📘 Facebook (usuario o URL)</label>
                        <input type="text" placeholder="tunegocio o https://facebook.com/..." value={editNegocioData.facebook||''} onChange={e=>setEditNegocioData({...editNegocioData,facebook:e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>🌐 Página web</label>
                        <input type="url" placeholder="https://tunegocio.com" value={editNegocioData.web||''} onChange={e=>setEditNegocioData({...editNegocioData,web:e.target.value})} />
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
                              <span style={{color:'#333'}}>-</span>
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
                        <span style={{fontSize:11,color:b.usuario_id?'#2ECC71':'#555',fontWeight:600}}>{b.usuario_id?'Vinculado':'Sin cuenta propia'}</span>
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
              <h2>Citas pendientes - {citas.length}</h2>
              {citas.length===0
                ? <div className="empty-state"><p>No hay citas pendientes</p></div>
                : <div className="citas-grid">
                    {citas.map((c:any)=>(
                      <div key={c.id} className="cita-card">
                        <h4>{c.cliente?.nombre||'Cliente'}</h4>
                        {c.barbero&&<p><strong>Profesional:</strong> {c.barbero.nombre}</p>}
                        <p><strong>Servicio:</strong> {c.servicio?.nombre}</p>
                        <p><strong>Fecha:</strong> {c.fecha}</p>
                        <p><strong>Hora:</strong> {c.hora}</p>
                        <p><strong>Tel:</strong> {c.cliente?.telefono||'-'}</p>
                        <span className="badge-agendada">Confirmada</span>
                        <div className="cita-actions" style={{marginTop:10}}>
                          <button className="btn-confirm" onClick={()=>completarCita(c.id)}>✓ Completar</button>
                          <button className="btn-reject" onClick={()=>cancelarCita(c.id)}>✗ Cancelar</button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}
          {currentPage==='pro-dueno' && (
            <div className="page" style={{background:'linear-gradient(180deg,rgba(201,168,76,0.06) 0%,transparent 320px)'}}>
              {isProD ? (
                <div style={{textAlign:'center',padding:'40px 24px'}}>
                  <div style={{fontSize:52,marginBottom:12}}>👑</div>
                  <h2 style={{fontSize:22,fontWeight:900,marginBottom:8}}>¡Ya eres VIP!</h2>
                  <p style={{color:'#888',fontSize:13,lineHeight:1.6,marginBottom:24}}>Tu plan VIP está activo. Accede al Dashboard para ver tus ingresos y ranking.</p>
                  <button onClick={()=>{setCurrentPage('dashboard');cargarMisBarberos();cargarRanking()}} style={{background:'linear-gradient(135deg,#C9A84C,#B8972A)',color:'#000',border:'none',borderRadius:12,padding:'14px 28px',fontSize:14,fontWeight:900,cursor:'pointer',letterSpacing:0.5}}>📊 Ir al Dashboard VIP</button>
                </div>
              ) : isPendingD ? (
                <div style={{textAlign:'center',padding:'40px 24px'}}>
                  <div style={{fontSize:44,marginBottom:12}}>⏳</div>
                  <h2 style={{fontSize:20,fontWeight:900,marginBottom:8}}>Pago en verificación</h2>
                  <p style={{color:'#888',fontSize:13,lineHeight:1.6,marginBottom:24}}>Estamos verificando tu pago. En 24–48 horas tu plan quedará activo.</p>
                  <button onClick={async()=>{const uid=String(userData?.id);const em=String(userData?.email||'').toLowerCase();const r=await fetch(`${API}/api/anuncios`).then(d=>d.json()).catch(()=>({data:[]}));const found=r.data?.find((a:any)=>a.activo&&a.estado==='activo'&&(a.anunciante_email||'').toLowerCase()===em&&(a.titulo||'').includes('PRO'));if(found){localStorage.setItem('pro_activo_d_'+uid,'true');localStorage.setItem('pro_d_'+uid,'true');setProActD(true);setProPendD(false);setCurrentPage('dashboard');}else{alert('A\u00fan en verificaci\u00f3n. Te avisaremos pronto.')}}} style={{background:'rgba(201,168,76,0.1)',border:'1px solid #C9A84C',borderRadius:10,padding:'12px 24px',color:'#C9A84C',fontWeight:700,cursor:'pointer',fontSize:13,marginBottom:16}}>🔄 Verificar activación</button>
                  <p style={{marginTop:8,fontSize:11,color:'#444',cursor:'pointer',textDecoration:'underline'}} onClick={()=>{localStorage.removeItem('pro_d_'+userData?.id);alert('Solicitud reiniciada.')}}>Reiniciar solicitud</p>
                  <div style={{marginTop:24,paddingTop:20,borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                    <p style={{fontSize:12,color:'#666',marginBottom:10}}>¿Ya enviaste el pago y no recibiste confirmación?</p>
                    <a href={`https://wa.me/+32455136804?text=Hola%20CutConnect%2C%20soy%20${encodeURIComponent(userData?.negocio_nombre||'due%C3%B1o')}%20y%20acabo%20de%20pagar%20el%20Plan%20VIP%20Negocio%20por%20Binance%20Pay.`} style={{display:'block',background:'#25D366',color:'#fff',textAlign:'center',padding:'12px',borderRadius:10,fontWeight:700,textDecoration:'none',fontSize:13,textTransform:'uppercase',letterSpacing:0.5}}>📱 Enviar comprobante por WhatsApp</a>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{textAlign:'center',marginBottom:28}}>
                    <div style={{fontSize:44,marginBottom:8}}>👑</div>
                    <p style={{fontSize:11,color:'#C9A84C',textTransform:'uppercase',letterSpacing:4,marginBottom:8}}>Plan VIP Negocio</p>
                    <h2 style={{fontSize:24,fontWeight:900,marginBottom:8}}>Gestiona tu barber\u00eda como un pro</h2>
                    <p style={{color:'#666',fontSize:13,lineHeight:1.7}}>Todo lo que necesitas para hacer crecer tu negocio y tu equipo</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:24}}>
                    {[{icon:'📊',t:'Dashboard financiero',d:'Ingresos hoy, semana y mes'},{icon:'🏆',t:'Ranking del equipo',d:'Qui\u00e9n genera m\u00e1s citas y dinero'},{icon:'📋',t:'Exportar en PDF',d:'Reportes listos para imprimir'},{icon:'⭐',t:'Rese\u00f1as del negocio',d:'Gestiona todas las calificaciones'},{icon:'🌟',t:'Negocio destacado',d:'Aparece primero en b\u00fasquedas'},{icon:'🔔',t:'Notificaciones WhatsApp',d:'Avisos autom\u00e1ticos a clientes'},{icon:'💬',t:'Confirmaci\u00f3n autom\u00e1tica',d:'Citas confirmadas sin intervenci\u00f3n'},{icon:'🎨',t:'Sello Verificado VIP',d:'Insignia visible en tu perfil'}].map(f=>(
                      <div key={f.t} style={{background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.1)',borderRadius:12,padding:'14px 12px',textAlign:'center'}}>
                        <div style={{fontSize:24,marginBottom:6}}>{f.icon}</div>
                        <p style={{fontSize:12,fontWeight:700,color:'#fff',marginBottom:3,lineHeight:1.3}}>{f.t}</p>
                        <p style={{fontSize:10,color:'#555',lineHeight:1.4}}>{f.d}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{background:'#141414',border:'1px solid rgba(201,168,76,0.3)',borderRadius:16,padding:24,marginBottom:20}}>
                    <p style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:2,marginBottom:16,fontWeight:700,textAlign:'center'}}>C\u00f3mo activar tu Plan VIP</p>
                    <div style={{background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.2)',borderRadius:12,padding:24,textAlign:'center',marginBottom:16}}>
                      <p style={{fontSize:32,fontWeight:900,color:'#C9A84C',marginBottom:4}}>$3.99 <span style={{fontSize:16,fontWeight:400,color:'#777'}}>USD/mes</span></p>
                      <p style={{fontSize:13,color:'#555',marginBottom:20}}>Env\u00eda exactamente <strong style={{color:'#C9A84C'}}>$3.99 USDT</strong> por Binance Pay</p>
                      <div style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'10px 14px',marginBottom:16}}>
                        <p style={{fontSize:9,color:'#444',textTransform:'uppercase',letterSpacing:3,marginBottom:4}}>AutomatizaPro · Good Connection · CutConnect</p>
                        <p style={{fontSize:10,color:'#555',marginBottom:4,textTransform:'uppercase',letterSpacing:2}}>Pay ID Binance</p>
                        <p style={{fontSize:26,fontWeight:900,letterSpacing:6,color:'#C9A84C'}}>176779028</p>
                      </div>
                  <img src="data:image/jpeg;base64,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" alt="QR Binance Pay" style={{width:160,height:160,borderRadius:10,border:'1px solid rgba(201,168,76,0.3)',display:'block',margin:'0 auto 16px'}} />
                    </div>
                    <button onClick={async()=>{const ciudad=userData?.ciudad||userData?.pais||'N/A';const payload={titulo:'\ud83d\udcb8 PLAN PRO DUENO - '+userData?.negocio_nombre,descripcion:'Solicitud Pro de due\u00f1o '+userData?.id,ciudad,pais:userData?.pais||'N/A',imagen_url:'https://cutconnect.app/pro-badge.png',tipo:'banner',precio_dia:3.99,anunciante_nombre:userData?.negocio_nombre||userData?.nombre||'dueño',anunciante_email:userData?.email||'',anunciante_telefono:(userData?.negocio_telefono||userData?.telefono||'').replace(/\D/g,'')};const res=await fetch(`${API}/api/anuncios/solicitud`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await res.json().catch(()=>({}));if(res.ok||data.success||data.id||data.message){localStorage.setItem('pro_d_'+userData?.id,'true');alert('\u00a1Solicitud enviada! Te avisaremos cuando se active.');}else{alert('Error al enviar solicitud. Intenta de nuevo.')}}} style={{width:'100%',background:'linear-gradient(135deg,#C9A84C,#B8972A)',color:'#000',border:'none',borderRadius:12,padding:'16px',fontSize:14,fontWeight:900,cursor:'pointer',letterSpacing:0.5,marginBottom:16}}>✅ Ya pagué – Solicitar activación</button>
                    <a href={`https://wa.me/+32455136804?text=Hola%20CutConnect%2C%20soy%20${encodeURIComponent(userData?.negocio_nombre||'due\u00f1o')}%20y%20acabo%20de%20pagar%20el%20Plan%20VIP%20Negocio%20por%20Binance%20Pay.`}
                      style={{display:'block',background:'#25D366',color:'#fff',textAlign:'center',padding:'14px',borderRadius:10,fontWeight:700,textDecoration:'none',fontSize:13,textTransform:'uppercase',letterSpacing:1}}>
                      📱 Enviar comprobante por WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
          {currentPage==='yo-barbero' && (
            <div className="page">
              <h2>✂️ Yo también corto</h2>
              {!perfilDuenoBarbero && !showFormActivar && (
                <div style={{textAlign:'center',padding:'40px 24px'}}>
                  <div style={{fontSize:64,marginBottom:20}}>✂️</div>
                  <h3 style={{fontSize:22,fontWeight:800,marginBottom:12}}>¿Tú también cortas el cabello?</h3>
                  <p style={{color:'#888',fontSize:14,lineHeight:1.7,marginBottom:32,maxWidth:360,margin:'0 auto 32px'}}>Activa tu perfil personal como barbero para que los clientes puedan agendarte directamente a ti, igual que a cualquier miembro de tu equipo.</p>
                  <button onClick={()=>{setFormDuenoBarbero({nombre:userData?.nombre||'',especialidad:'',descripcion:'',horario:{lunes:{activo:true,inicio:'08:00',fin:'18:00'},martes:{activo:true,inicio:'08:00',fin:'18:00'},miercoles:{activo:true,inicio:'08:00',fin:'18:00'},jueves:{activo:true,inicio:'08:00',fin:'18:00'},viernes:{activo:true,inicio:'08:00',fin:'18:00'},sabado:{activo:true,inicio:'08:00',fin:'14:00'},domingo:{activo:false,inicio:'',fin:''}}});setShowFormActivar(true)}} style={{background:'linear-gradient(135deg,#C9A84C,#B8972A)',color:'#000',border:'none',borderRadius:16,padding:'18px 40px',fontSize:16,fontWeight:800,cursor:'pointer',letterSpacing:0.5,boxShadow:'0 8px 30px rgba(201,168,76,0.35)',display:'inline-flex',alignItems:'center',gap:10,transition:'transform 0.15s'}} onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.03)')} onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}>
                    <span style={{fontSize:22}}>✂️</span> Activar mi perfil de barbero
                  </button>
                  <p style={{color:'#444',fontSize:12,marginTop:20}}>Una sola cuenta · Sin configuración extra · Los clientes te ven al instante</p>
                </div>
              )}
              {showFormActivar && (
                <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.05)',borderLeft:'2px solid #C9A84C',borderRadius:14,padding:24,marginBottom:24}}>
                  <h3 style={{marginTop:0,marginBottom:6}}>Tu perfil como barbero</h3>
                  <p style={{color:'#666',fontSize:13,marginBottom:20}}>Esta información verán los clientes al elegirte</p>
                  <form onSubmit={handleGuardarDuenoBarbero} className="form">
                    <div className="form-row">
                      <div className="form-group"><label>Tu nombre</label><input type="text" placeholder="Tu nombre" value={formDuenoBarbero.nombre} onChange={e=>setFormDuenoBarbero({...formDuenoBarbero,nombre:e.target.value})} required /></div>
                      <div className="form-group"><label>Especialidad</label><input type="text" placeholder="Fades, barba, clásico..." value={formDuenoBarbero.especialidad} onChange={e=>setFormDuenoBarbero({...formDuenoBarbero,especialidad:e.target.value})} /></div>
                    </div>
                    <div className="form-group"><label>Descripción (opcional)</label><textarea placeholder="Cuéntale a los clientes tu experiencia..." value={formDuenoBarbero.descripcion} onChange={e=>setFormDuenoBarbero({...formDuenoBarbero,descripcion:e.target.value})} /></div>
                    <div>
                      <p style={{color:'#555',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:2,marginBottom:14}}>Días que atiendes</p>
                      {DIAS.map(dia=>{
                        const h=(formDuenoBarbero.horario as any)[dia]
                        return (
                          <div key={dia} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10,flexWrap:'wrap'}}>
                            <label style={{display:'flex',alignItems:'center',gap:8,minWidth:100,cursor:'pointer'}}>
                              <input type="checkbox" checked={h.activo} onChange={e=>updateHorarioDueno(dia,'activo',e.target.checked)} style={{width:16,height:16,accentColor:'#C9A84C'}} />
                              <span style={{color:'#fff',fontSize:13,fontWeight:600}}>{DIAS_LABELS[dia]}</span>
                            </label>
                            {h.activo&&<>
                              <input type="time" value={h.inicio} onChange={e=>updateHorarioDueno(dia,'inicio',e.target.value)} style={{padding:'6px 10px',fontSize:13,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#fff'}} />
                              <span style={{color:'#333'}}>-</span>
                              <input type="time" value={h.fin} onChange={e=>updateHorarioDueno(dia,'fin',e.target.value)} style={{padding:'6px 10px',fontSize:13,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#fff'}} />
                            </>}
                            {!h.activo&&<span style={{color:'#333',fontSize:12}}>No trabajo este día</span>}
                          </div>
                        )
                      })}
                    </div>
                    {error&&<p className="error">{error}</p>}
                    <div style={{display:'flex',gap:10,marginTop:8}}>
                      <button type="submit" style={{background:'linear-gradient(135deg,#C9A84C,#B8972A)',color:'#000',border:'none',borderRadius:12,padding:'14px 28px',fontSize:14,fontWeight:800,cursor:'pointer',boxShadow:'0 6px 20px rgba(201,168,76,0.3)'}} disabled={loading}>{loading?'Activando...':'🚀 Activar perfil'}</button>
                      <button type="button" className="btn-secondary" onClick={()=>setShowFormActivar(false)}>Cancelar</button>
                    </div>
                  </form>
                </div>
              )}
              {perfilDuenoBarbero && !showFormActivar && (
                <div>
                  <div style={{background:'linear-gradient(135deg,rgba(46,204,113,0.06),rgba(46,204,113,0.02))',border:'1px solid rgba(46,204,113,0.2)',borderRadius:16,padding:24,marginBottom:24,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
                    <BarberoAvatar foto={perfilDuenoBarbero.foto} nombre={perfilDuenoBarbero.nombre} size={64} />
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                        <span style={{background:'rgba(46,204,113,0.15)',color:'#2ECC71',fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,textTransform:'uppercase',letterSpacing:1}}>✓ Perfil activo</span>
                      </div>
                      <h3 style={{margin:'4px 0',fontSize:18,fontWeight:800}}>{perfilDuenoBarbero.nombre}</h3>
                      <p style={{margin:0,color:'#888',fontSize:13}}>{perfilDuenoBarbero.especialidad||'Sin especialidad definida'}</p>
                    </div>
                    <button onClick={()=>{setFormDuenoBarbero({nombre:perfilDuenoBarbero.nombre||'',especialidad:perfilDuenoBarbero.especialidad||'',descripcion:perfilDuenoBarbero.descripcion||'',horario:perfilDuenoBarbero.horario||formDuenoBarbero.horario});setShowFormActivar(true)}} className="btn-secondary" style={{fontSize:13}}>Editar perfil</button>
                  </div>
                  <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
                    <div className="stat-card" style={{flex:1,minWidth:120}}><h4>Mis citas</h4><p className="stat-number">{citasPropias.length}</p></div>
                    <div className="stat-card" style={{flex:1,minWidth:120}}><h4>Días activos</h4><p className="stat-number">{perfilDuenoBarbero.horario?Object.values(perfilDuenoBarbero.horario).filter((d:any)=>d.activo).length:0}</p></div>
                  </div>
                  <h3 style={{marginBottom:16}}>Mis citas personales</h3>
                  {citasPropias.length===0
                    ? <div className="empty-state"><p>Aún no tienes citas asignadas a ti directamente</p></div>
                    : <div className="citas-grid">
                        {citasPropias.map((c:any)=>(
                          <div key={c.id} className="cita-card">
                            <h4>{c.cliente?.nombre||'Cliente'}</h4>
                            <p><strong>Servicio:</strong> {c.servicio?.nombre}</p>
                            <p><strong>Fecha:</strong> {c.fecha}</p>
                            <p><strong>Hora:</strong> {c.hora}</p>
                            <p><strong>Tel:</strong> {c.cliente?.telefono||'-'}</p>
                            <span className="badge-agendada">Confirmada</span>
                            <div className="cita-actions" style={{marginTop:10}}>
                              <button className="btn-confirm" onClick={()=>completarCita(c.id)}>✓ Completar</button>
                              <button className="btn-reject" onClick={()=>cancelarCita(c.id)}>✗ Cancelar</button>
                            </div>
                          </div>
                        ))}
                      </div>
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
if (loggedIn && userData?.rol==='dueño' && userData?.estado_verificacion==='suspendido') return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-left"><div className="navbar-brand"><h1>Cut<span>Connect</span></h1></div><span className="role-badge pending">Suspendido</span></div>
        <div className="nav-links"><button className="btn-logout" onClick={handleLogout}>Salir</button></div>
      </nav>
      <div className="dashboard-content">
        <div className="page">
          <h2>Cuenta suspendida</h2>
          <div className="pending-card">
            <div className="pending-icon">⚠</div>
            <h3>Tu negocio ha sido suspendido</h3>
            <p>Para reactivar tu cuenta contáctanos por WhatsApp.</p>
            <a href="https://wa.me/+32455136804?text=Hola%20CutConnect%2C%20quiero%20reactivar%20mi%20cuenta." target="_blank" rel="noreferrer"
              style={{display:'block',background:'#25D366',color:'#fff',padding:14,borderRadius:10,fontWeight:700,textDecoration:'none',fontSize:13,textTransform:'uppercase',letterSpacing:1,marginBottom:16,textAlign:'center'}}>
              Contactar por WhatsApp
            </a>
            <button onClick={handleLogout} className="btn-secondary">Cerrar sesión</button>
          </div>
        </div>
      </div>
    </div>
  )

  if (loggedIn && userData?.rol==='dueño' && userData?.estado_verificacion==='rechazado') return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-left"><div className="navbar-brand"><h1>Cut<span>Connect</span></h1></div><span className="role-badge pending">Rechazado</span></div>
        <div className="nav-links"><button className="btn-logout" onClick={handleLogout}>Salir</button></div>
      </nav>
      <div className="dashboard-content">
        <div className="page">
          <h2>Solicitud rechazada</h2>
          <div className="pending-card">
            <div className="pending-icon">✗</div>
            <h3>Tu solicitud no fue aprobada</h3>
            <p>Si crees que es un error contáctanos por WhatsApp.</p>
            <a href="https://wa.me/+32455136804?text=Hola%20CutConnect%2C%20mi%20solicitud%20fue%20rechazada%20y%20quisiera%20m%C3%A1s%20informaci%C3%B3n." target="_blank" rel="noreferrer"
              style={{display:'block',background:'#25D366',color:'#fff',padding:14,borderRadius:10,fontWeight:700,textDecoration:'none',fontSize:13,textTransform:'uppercase',letterSpacing:1,marginBottom:16,textAlign:'center'}}>
              Contactar por WhatsApp
            </a>
            <button onClick={handleLogout} className="btn-secondary">Cerrar sesión</button>
          </div>
        </div>
      </div>
    </div>
  )

  return null
}

export default App
