import React,{useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Search,Orbit,ChartNoAxesColumn,ArrowLeft,ArrowUpRight,Network,ChevronRight,FileText,MessageCircle,Activity,MapPin,Link2,Info} from 'lucide-react';
import {titulares,diputados,sections,loadText,parseDialog,parseMetrics,getStats} from './data';
import './style.css';

const entries=Object.entries(titulares);
const tabs=[['resumen','Resumen',FileText],['pregyresp','Preguntas y respuestas',MessageCircle],['indicadores','Indicadores',Activity],['analisis','Análisis',ChartNoAxesColumn],['intersec','Relaciones',Link2]];
const criteria=[['preguntas','Preguntas recibidas'],['tiempo','Minutos de intervención'],['datos','Datos numéricos'],['acciones','Acciones reportadas']];
const logoUrl='/documentos/logoQHE.png'; // Archivo en public/documentos/logoQHE.png
const normalizeName=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
function PersonPhoto({name,src,size=48}){
 const [failed,setFailed]=useState(false);
 useEffect(()=>setFailed(false),[src]);
 const style={width:size,height:size,flex:'none',borderRadius:'50%',objectFit:'cover',objectPosition:'center top',background:'#d2e5d7',color:'#12312b',display:'inline-grid',placeItems:'center',fontWeight:700};
 return src&&!failed?<img src={src} alt={`Fotografía de ${name}`} loading="lazy" onError={()=>setFailed(true)} style={style}/>:<span role="img" aria-label={`Sin fotografía de ${name}`} style={style}>{name.split(' ').map(w=>w[0]).slice(0,2).join('')}</span>;
}
function BrandLogo(){const [failed,setFailed]=useState(false);return !failed?<img src={logoUrl} alt="Logo QHE" onError={()=>setFailed(true)} style={{width:100,height:100,objectFit:'contain',marginRight:12}}/>:null}
function findDiputado(name){const key=normalizeName(name);return diputados.find(d=>normalizeName(d.name)===key)||diputados.find(d=>key.length>5&&(normalizeName(d.name).includes(key)||key.includes(normalizeName(d.name))))}

function OrbitPhotos({onSelect,onHover,reduced,hoveredId,relations}){
   const containerRef=React.useRef(null);
 const refs=React.useRef([]);
 const pointsRef = React.useRef([]);
const linesRef = React.useRef({});
const hoveredRef = React.useRef(hoveredId);
const relationsRef = React.useRef(relations);

hoveredRef.current = hoveredId;
relationsRef.current = relations;

const drawLines = () => {
  const source = hoveredRef.current;
  if (!source) return;

  const sourceIndex = entries.findIndex(([id]) => id === source);
  const start = pointsRef.current[sourceIndex];
  if (!start) return;

  for (const target of relationsRef.current[source] || []) {
    const targetIndex = entries.findIndex(([id]) => id === target);
    const end = pointsRef.current[targetIndex];
    const line = linesRef.current[target];

    if (end && line) {
      line.setAttribute('x1', start.x);
      line.setAttribute('y1', start.y);
      line.setAttribute('x2', end.x);
      line.setAttribute('y2', end.y);
    }
  }
};
 useEffect(()=>{
   let frame;
   const container=containerRef.current;
   const start=performance.now();
   const update=now=>{
     if(!container) return;
     const {width:w,height:h}=container.getBoundingClientRect();
     if(!w||!h) return;
     const count=entries.length;
     const size=Math.max(32,Math.min(58,Math.sqrt(w*h/Math.max(count,1))*.43));
     const coreSize=w<=700?108:142;
     const t=reduced?0:(now-start)/1000;
     const points=entries.map((_,i)=>{
const angle = i * 2.39996 + t * (.025 + .007 * (i % 4));
const radius = .62 + .13 * (i % 3);
const inclination = .35 + .22 * (i % 4);
const plane = i * 1.618;

const orbitalX = radius * Math.cos(angle);
const orbitalY = radius * Math.sin(angle) * Math.cos(inclination);

const x = orbitalX * Math.cos(plane) - orbitalY * Math.sin(plane);
const y = orbitalX * Math.sin(plane) + orbitalY * Math.cos(plane);
const z = radius * Math.sin(angle) * Math.sin(inclination);
       const depth=Math.max(-1,Math.min(1,z));
       const scale=.78+.32*(depth+1)/2;
       const perspective=1+depth*.13;
       return {x:w/2+x*w*.38*perspective,y:h/2+y*h*.39*perspective,z:depth,scale};
     });
     // Resuelve las colisiones en pantalla, incluso cuando se cruzan en profundidad.
     for(let pass=0;pass<30;pass++){
       for(let i=0;i<count;i++){
         const p=points[i];
         let dx=p.x-w/2,dy=p.y-h/2,dist=Math.hypot(dx,dy);
         const minCore=coreSize/2+size*p.scale/2+8;
         if(dist<minCore){
           if(dist<.001){dx=Math.cos(i*2.4);dy=Math.sin(i*2.4);dist=1}
           p.x+=dx/dist*(minCore-dist);p.y+=dy/dist*(minCore-dist);
         }
         for(let j=i+1;j<count;j++){
           const q=points[j];
           let vx=q.x-p.x,vy=q.y-p.y,d=Math.hypot(vx,vy);
           if(d<.001){vx=Math.cos((i+j)*2.4);vy=Math.sin((i+j)*2.4);d=1}
           const gap=size*(p.scale+q.scale)/2+7;
           if(d<gap){const push=(gap-d)/2;p.x-=vx/d*push;p.y-=vy/d*push;q.x+=vx/d*push;q.y+=vy/d*push}
         }
       }
       for(const p of points){
         const radius=size*p.scale/2+4;
         p.x=Math.max(radius,Math.min(w-radius,p.x));
         p.y=Math.max(radius,Math.min(h-radius,p.y));
       }
     }
         points.forEach((p,i)=>{
      const el=refs.current[i];if(!el)return;
      el.style.left=`${p.x}px`;
      el.style.top=`${p.y}px`;
      el.style.width=el.style.height=`${size}px`;
      el.style.transform=`translate(-50%,-50%) scale(${p.scale})`;
      el.style.zIndex=String(Math.round((p.z+1)*100));
    });

    pointsRef.current = points;
    drawLines();

    if(!reduced)frame=requestAnimationFrame(update);
  };

  frame=requestAnimationFrame(update);
  return ()=>cancelAnimationFrame(frame);
},[reduced]);

useEffect(() => {
  drawLines();
}, [hoveredId, relations]);

return (
  <div ref={containerRef} className="orbit-photos">
    <svg className="orbit-links" aria-hidden="true">
      {(hoveredId ? relations[hoveredId] || [] : []).map(target => (
        <line
          key={target}
          ref={el => { linesRef.current[target] = el; }}
        />
      ))}
    </svg>

    {entries.map(([id,p],i) => (
      <button
        key={id}
        ref={el => { refs.current[i] = el; }}
        className="orbit-photo"
        type="button"
        aria-label={`Ver ${p.secretariado}: ${p.name}`}
        onClick={() => onSelect(id)}
        onMouseEnter={() => onHover(id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(id)}
        onBlur={() => onHover(null)}
      >
        <PersonPhoto name={p.name} src={p.photo} size="100%"/>
      </button>
    ))}
  </div>
);}

function CoreLogo(){const [failed,setFailed]=useState(false);return <div className="core-logo" aria-label="QHE, núcleo principal">{!failed?<img src={logoUrl} alt="QHE" onError={()=>setFailed(true)}/>:<strong>QHE</strong>}</div>}

function Stat({label,value}){return <div className="stat"><strong>{value}</strong><span>{label}</span></div>}

function App(){
 const [view,setView]=useState('universo');
 const [selected,setSelected]=useState(null);
 const [hover,setHover]=useState(null);
 const [tab,setTab]=useState('resumen');
 const [dialogMode,setDialogMode]=useState('completo');
 const [criterion,setCriterion]=useState('preguntas');
 const [query,setQuery]=useState('');
 const [theme,setTheme]=useState(()=>localStorage.getItem('glosa-theme')||'dark');
 const [data,setData]=useState({});
 const relations = useMemo(() => {
  const links = Object.fromEntries(
    Object.keys(titulares).map(id => [id, new Set()])
  );

  for (const [source, files] of Object.entries(data)) {
    if (!links[source]) continue;

    const content = files.intersec || '';

    for (const target of Object.keys(titulares)) {
      if (target === source) continue;

      const abbreviation = new RegExp(
        '(^|[^A-Za-z0-9])' + target + '(?=$|[^A-Za-z0-9])',
        'i'
      );

      if (abbreviation.test(content)) {
        links[source].add(target);
        links[target].add(source);
      }
    }
  }

  return Object.fromEntries(
    Object.entries(links).map(([id, targets]) => [id, [...targets]])
  );
}, [data]);
 const [network,setNetwork]=useState(false);

 const reduced=useMemo(()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false,[]);

 useEffect(()=>{
   document.documentElement.dataset.theme=theme;
   localStorage.setItem('glosa-theme',theme);
 },[theme]);

 useEffect(()=>{
   let live=true;
   Promise.all(entries.map(async([id])=>{
     const pairs=await Promise.all([...new Set([...sections,'resupregyresp'])].map(async section=>[section,await loadText(section,id)]));
     return [id,Object.fromEntries(pairs)];
   })).then(rows=>{if(live)setData(Object.fromEntries(rows))});
   return()=>{live=false};
 },[]);


 const filtered=entries.filter(([id,p])=>{
   const q=query.toLocaleLowerCase('es');
   return !q||`${id} ${p.name} ${p.secretariado} ${Object.values(data[id]||{}).join(' ')}`.toLocaleLowerCase('es').includes(q)||diputados.some(d=>d.name.toLocaleLowerCase('es').includes(q)&&(data[id]?.pregyresp||'').toLocaleLowerCase('es').includes(d.name.toLocaleLowerCase('es')));
 });

 const ranking=filtered.map(([id,p])=>({id,...p,stats:getStats(data[id]||{})})).sort((a,b)=>b.stats[criterion]-a.stats[criterion]||a.name.localeCompare(b.name));
 const max=Math.max(1,...ranking.map(x=>x.stats[criterion]));
 const detail=data[selected]||{};
 const stats=getStats(detail);
 const hovered=hover&&titulares[hover];

 const choose=id=>{
   setSelected(id);
   setTab('resumen');
   setDialogMode('completo');
   setNetwork(false);
   setHover(null);
 };

 const close=()=>{
   setSelected(null);
   setNetwork(false);
 };

 return (
   <div className="app">
     {/* HEADER LIMPIO (Solo marca y botón de tema) */}
     <header className="header">
       <button className="brand" onClick={close} aria-label="Volver al inicio">
         <BrandLogo/>
         <span>
           <b>Comparecencias</b>
           <small>PODER EJECUTIVO · QUERÉTARO</small>
         </span>
       </button>
     </header>

     <main>
       {!selected ? (
         <>
           <div className="intro">
             <div>
               <h1>Los datos de<br/><i>la Glosa 2026</i></h1>
             </div>
           </div>

           {/* TOOLBAR CON BUSCADOR Y PESTAÑAS DE VISTA INTEGRADAS */}
           <div className="toolbar" style={{display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center'}}>
             <label className="search" style={{flex: '1 1 280px'}}>
               <Search size={18}/>
               <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar dependencia, titular o tema..." aria-label="Buscar"/>
               <span>⌘ K</span>
             </label>

             {/* Menú de vistas rediseñado de tamaño grande al lado del buscador */}
             <nav aria-label="Vistas" style={{display: 'flex', gap: '8px', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '10px', padding: '4px'}}>
               <button 
                 onClick={()=>{setView('universo');close();}} 
                 style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '700', borderRadius: '7px', border: 'none', cursor: 'pointer', background: view==='universo'?'var(--lime)':'transparent', color: view==='universo'?'#12312b':'var(--muted)'}}
               >
                 <Orbit size={20}/> Universo 3D
               </button>
               <button 
                 onClick={()=>{setView('ranking');close();}} 
                 style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '700', borderRadius: '7px', border: 'none', cursor: 'pointer', background: view==='ranking'?'var(--lime)':'transparent', color: view==='ranking'?'#12312b':'var(--muted)'}}
               >
                 <ChartNoAxesColumn size={20}/> Ranking
               </button>
             </nav>
           </div>

           {view==='universo'?(
             <section className="universe">
               <div className="universe-copy">
                 <span className="kicker">EXPLORA</span>
                 <h2>5to Informe <br/>de Gobienro</h2>
                 <p>Análisi de las comparecencias, principales indicadores y los vínculos entre dependencias y legisladores.</p>
                 <div className="hint"><span className="hint-dot"/> SELECCIONA</div>
               </div>
               <div className="scene" aria-label="Visualización orbital de dependencias">
             
                 <CoreLogo/>
<OrbitPhotos
  onSelect={choose}
  onHover={setHover}
  reduced={reduced}
  hoveredId={hover}
  relations={relations}
/>                 {hovered&&(
                   <div className="orbit-tooltip">
                     <PersonPhoto name={hovered.name} src={hovered.photo} size={52}/>
                     <span>{hover}</span>
                     <b>{hovered.secretariado}</b>
                     <small>{hovered.name}</small>
                     <small>{(data[hover]?.resumen||'').slice(0,110)||'Ver información de la comparecencia'}</small>
                   </div>
                 )}
               </div>
               <aside className="directory">
                 <div className="directory-title">DEPENDENCIAS <span>{String(filtered.length).padStart(2,'0')}</span></div>
                 <div className="directory-list">
                   {filtered.map(([id,p],i)=>(
                     <button key={id} onMouseEnter={()=>setHover(id)} onMouseLeave={()=>setHover(null)} onClick={()=>choose(id)}>
                       <span className="dir-num">{String(i+1).padStart(2,'0')}</span>
                       <PersonPhoto name={p.name} src={p.photo} size={38}/>
                       <span className="dir-main"><b>{p.secretariado}</b><small>{id} · {p.name}</small></span>
                       <ArrowUpRight size={17}/>
                     </button>
                   ))}
                 </div>
               </aside>
             </section>
           ):(
             <section className="ranking">
               <div className="section-heading">
                 <div>
                   <span className="kicker">EVALUACIÓN COMPARATIVA</span>
                   <h2>Ranking de comparecencias</h2>
                   <p>Las cifras se calculan a partir de los archivos cargados. Una barra vacía indica que faltan datos.</p>
                 </div>
                 <label>ORDENAR POR
                   <select value={criterion} onChange={e=>setCriterion(e.target.value)}>
                     {criteria.map(([k,v])=><option key={k} value={k}>{v}</option>)}
                   </select>
                 </label>
               </div>
               <div className="rank-list">
                 {ranking.map((p,i)=>(
                   <button className="rank-row" key={p.id} onClick={()=>choose(p.id)}>
                     <span className="rank-index">{String(i+1).padStart(2,'0')}</span>
                     <PersonPhoto name={p.name} src={p.photo} size={44}/>
                     <span className="rank-name"><b>{p.secretariado}</b><small>{p.name}</small></span>
                     <span className="bar"><span style={{width:`${p.stats[criterion]/max*100}%`}}/></span>
                     <strong>{p.stats[criterion]}</strong>
                     <ChevronRight size={18}/>
                   </button>
                 ))}
               </div>
             </section>
           )}
         </>
       ):(
         <>
           <div className="detail-top">
             <button className="back" onClick={close}><ArrowLeft size={17}/> VOLVER A {view==='ranking'?'RANKING':'UNIVERSO'}</button>
             <span>GLOSA 2026 / {selected}</span>
           </div>
           <section className="detail-hero">
             <div className="wordcloud" aria-hidden="true">
               {(detail.nube||'transparencia participación desarrollo Querétaro resultados bienestar').split(/[,\n;]+|\s+/).filter(w=>w.length>4).slice(0,30).map((w,i)=><span key={i} style={{left:`${(i*37)%90}%`,top:`${(i*23)%85}%`,fontSize:`${14+i%5*7}px`}}>{w}</span>)}
             </div>
             <div className="detail-content">
               <PersonPhoto name={titulares[selected].name} src={titulares[selected].photo} size={112}/>
               <div className="eyebrow">DEPENDENCIA / {selected}</div>
               <h1>{titulares[selected].secretariado}</h1>
               <p>{titulares[selected].name} <span>·</span> Comparecencia ante la LXI Legislatura</p>
               <button className={network?'network-button on':'network-button'} onClick={()=>setNetwork(!network)}>
                 <Network size={17}/>{network?'Cerrar relaciones':'Explorar relaciones'}
               </button>
             </div>
             <div className="detail-number">{String(entries.findIndex(([id])=>id===selected)+1).padStart(2,'0')} / 18</div>
           </section>
           <div className="stats-grid">
             <Stat label="PREGUNTAS" value={stats.preguntas}/>
             <Stat label="MINUTOS" value={stats.tiempo||'—'}/>
             <Stat label="DATOS NUMÉRICOS" value={stats.datos}/>
             <Stat label="ACCIONES" value={stats.acciones}/>
           </div>
           {network?(
             <NetworkView selected={selected} detail={detail}/>
           ):(
             <>
               <div className="tabs" role="tablist">
                 {tabs.map(([id,label,Icon])=>(
                   <button role="tab" aria-selected={tab===id} className={tab===id?'current':''} key={id} onClick={()=>setTab(id)}>
                     <Icon size={16}/>{label}
                   </button>
                 ))}
               </div>
               <section className="content-panel" role="tabpanel">
                 <Content tab={tab} text={detail[tab]||''} selected={selected} summaryText={detail.resupregyresp||''} dialogMode={dialogMode} onDialogModeChange={setDialogMode}/>
               </section>
             </>
           )}
         </>
       )}
       <footer>
         <span>GLOSA 2026 · QUERÉTARO</span>
         <span>Visualización de información pública </span>
       </footer>
     </main>
   </div>
 );
}

function Content({tab,text,selected,summaryText,dialogMode,onDialogModeChange}){
  if(tab==='pregyresp'){
    const showingSummary=dialogMode==='sintesis';
    const activeText=showingSummary?summaryText:text;
    const folder=showingSummary?'resupregyresp':'pregyresp';
    return <div className="dialog">
      <div className="dialog-header">
        <div className="panel-heading"><span>DIÁLOGO LEGISLATIVO</span><h2>Preguntas y respuestas</h2></div>
        <div className="dialog-switch" role="group" aria-label="Extensión de preguntas y respuestas">
          <button type="button" className={!showingSummary?'active':''} aria-pressed={!showingSummary} onClick={()=>onDialogModeChange('completo')}>Texto completo</button>
          <button type="button" className={showingSummary?'active':''} aria-pressed={showingSummary} onClick={()=>onDialogModeChange('sintesis')}>Síntesis</button>
        </div>
      </div>
      {activeText?parseDialog(activeText).map((x,i)=>{const person=x.type==='pregunta'?findDiputado(x.speaker):x.type==='respuesta'?titulares[selected]:null;return <div className={`bubble ${x.type}`} key={i}>{person&&<PersonPhoto name={person.name} src={person.photo} size={48}/>}<small>{x.type==='pregunta'?'DIP.':x.type==='respuesta'?'TITULAR':'NOTA'} {x.speaker&&`· ${x.speaker}`}</small><p>{x.text}</p></div>}):<div className="empty"><Info size={28}/><h3>Información pendiente</h3><p>Aún no hay un archivo para {titulares[selected].secretariado} en <code>public/{folder}/{selected}.txt</code>.</p></div>}
    </div>;
  }
  if(!text)return <div className="empty"><Info size={28}/><h3>Información pendiente</h3><p>Aún no hay un archivo para {titulares[selected].secretariado} en <code>public/{tab}/{selected}.txt</code>.</p></div>;
  if (tab === 'analisis') {
  const m = parseMetrics(text);

  return (
    <div className="prose analysis-prose">
      <div className="panel-heading">
        <span>LECTURA DEL DISCURSO</span>
        <h2>Análisis político</h2>
      </div>

      <div className="metric-grid">
        {Object.entries(m).map(([k, v]) => (
          <div
            className={`metric ${k === 'puntos_de_friccion' ? 'metric-friction' : ''}`}
            key={k}
          >
            <b>{v}</b>
            <small>{k.replaceAll('_', ' ')}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

return (
  <div className="prose">
    <div className="panel-heading">
      <span>{tab.toUpperCase()}</span>
      <h2>{tabs.find(x => x[0] === tab)?.[1]}</h2>
    </div>
    {text.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
  </div>
);
}

function NetworkView({selected,detail}){
  const dialog=parseDialog(detail.pregyresp||'');
  const names=[...new Set(dialog.filter(x=>x.type==='pregunta').map(x=>x.speaker).filter(Boolean))];
  const related=Object.keys(titulares).filter(id=>id!==selected&&new RegExp(`\\b${id}\\b`,'i').test(detail.intersec||''));
  return <section className="network-view"><div className="panel-heading"><span>MAPA DE RELACIONES</span><h2>Conexiones de {selected}</h2><p>Relaciones extraídas de preguntas y del archivo de intersecciones.</p></div><div className="network-cols"><div><h3>Diputaciones que preguntaron <span>{names.length}</span></h3>{names.length?names.map(n=><div className="network-item" key={n}><PersonPhoto name={n} src={findDiputado(n)?.photo} size={42}/>{n}</div>):<p>Sin registros estructurados.</p>}</div><div><h3>Dependencias relacionadas <span>{related.length}</span></h3>{related.length?related.map(id=><div className="network-item" key={id}><PersonPhoto name={titulares[id].name} src={titulares[id].photo} size={42}/>{titulares[id].secretariado} <small>{id}</small></div>):<p>Sin códigos de dependencia detectados.</p>}</div><div><h3>Acciones conjuntas y fricciones</h3><p className="network-raw">{detail.intersec||'Agrega acciones conjuntas en public/intersec/ para visualizar los vínculos.'}</p><p className="network-raw">{parseMetrics(detail.analisis||'').puntos_de_friccion||''}</p></div></div></section>;
}

createRoot(document.getElementById('root')).render(<App/>);
