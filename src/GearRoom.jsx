import { useState, useEffect, useRef } from "react";
import { Camera, Aperture, Lightbulb, Mic, Wrench, Layers, Battery, Package } from "lucide-react";

const INITIAL_GEAR = [
  { id:1,  name:"Aputure 300d",                qty:1, cat:"Lighting",    group:"Shared Pool",    status:"damaged",   who:null, ret:null, notes:"Reported damaged by Elliott. Needs assessment before next use." },
  { id:2,  name:"Aputure T4C 120cm",           qty:2, cat:"Lighting",    group:"Shared Pool",    status:"available", who:null, ret:null, notes:"" },
  { id:3,  name:"Wescott 1-Stop Scrim",        qty:2, cat:"Lighting",    group:"Shared Pool",    status:"available", who:null, ret:null, notes:"" },
  { id:4,  name:"Wescott Black Nog",           qty:1, cat:"Rigging",     group:"Shared Pool",    status:"available", who:null, ret:null, notes:"" },
  { id:5,  name:"F-Stop Bag",                  qty:1, cat:"Accessories", group:"Shared Pool",    status:"available", who:null, ret:null, notes:"" },
  { id:6,  name:"Rode Lav Premium",            qty:2, cat:"Audio",       group:"Campaigns Team", status:"available", who:null, ret:null, notes:"" },
  { id:7,  name:"Manfrotto Video Head",        qty:1, cat:"Rigging",     group:"Campaigns Team", status:"available", who:null, ret:null, notes:"" },
  { id:8,  name:"Atomos HDMI Coiled",          qty:2, cat:"Accessories", group:"Campaigns Team", status:"available", who:null, ret:null, notes:"" },
  { id:9,  name:"NP Battery",                  qty:2, cat:"Power",       group:"Campaigns Team", status:"available", who:null, ret:null, notes:"" },
  { id:10, name:"PolarPro Mist 82mm",          qty:2, cat:"Accessories", group:"Campaigns Team", status:"available", who:null, ret:null, notes:"" },
  { id:11, name:"Polar Pro VND 77mm",          qty:1, cat:"Accessories", group:"Campaigns Team", status:"available", who:null, ret:null, notes:"" },
  { id:12, name:"iPhone 18 Pro Video Cage",    qty:1, cat:"Rigging",     group:"Campaigns Team", status:"available", who:null, ret:null, notes:"" },
  { id:13, name:"MagEase VND Filter ND2-ND32", qty:2, cat:"Accessories", group:"Campaigns Team", status:"available", who:null, ret:null, notes:"" },
  { id:14, name:"USB-C Hub 4-in-1",            qty:2, cat:"Accessories", group:"Campaigns Team", status:"available", who:null, ret:null, notes:"" },
  { id:15, name:"Tether Block",                qty:1, cat:"Accessories", group:"Campaigns Team", status:"available", who:null, ret:null, notes:"" },
  { id:16, name:"Canon R5C Kit #1", type:"kit", qty:1, cat:"Camera", group:"Campaigns Team", status:"available", who:null, ret:null, notes:"", contents:[
    {cid:1, name:"Canon R5C Body",     cat:"Camera",      status:"available", who:null, ret:null},
    {cid:2, name:"24-70mm f/2.8 Lens", cat:"Lenses",      status:"available", who:null, ret:null},
    {cid:3, name:"50mm f/1.8 Lens",   cat:"Lenses",      status:"available", who:null, ret:null},
    {cid:4, name:"Smallrig Cage",      cat:"Rigging",     status:"available", who:null, ret:null},
    {cid:5, name:"Battery Grip",       cat:"Power",       status:"available", who:null, ret:null},
    {cid:6, name:"V-Mount Battery",    cat:"Power",       status:"available", who:null, ret:null},
  ]},
  { id:17, name:"Canon R5C Kit #2", type:"kit", qty:1, cat:"Camera", group:"Campaigns Team", status:"available", who:null, ret:null, notes:"", contents:[
    {cid:1, name:"Canon R5C Body",     cat:"Camera",      status:"available", who:null, ret:null},
    {cid:2, name:"24-70mm f/2.8 Lens", cat:"Lenses",      status:"available", who:null, ret:null},
    {cid:3, name:"50mm f/1.8 Lens",   cat:"Lenses",      status:"available", who:null, ret:null},
    {cid:4, name:"Smallrig Cage",      cat:"Rigging",     status:"available", who:null, ret:null},
    {cid:5, name:"Battery Grip",       cat:"Power",       status:"available", who:null, ret:null},
    {cid:6, name:"V-Mount Battery",    cat:"Power",       status:"available", who:null, ret:null},
  ]},
];

const TEAM     = ["Alissa Prcevich","André Rodrigues","Andy Lloyd","Chloe Adam","Christian Love","Elliott Small","Jazel Antiporda","Jess Edwards","Jess Holmes","Lucille Figueroa","Lydia Proudlove","Matt Hodges","Michael Amoroso","Neill Pagdanganan","Nem Stankovic","Paige Cooper","Raphael Rigos"];
const GROUPS   = ["Shared Pool","Campaigns Team","Social Team","Growth","Production COE"];
const CATS     = ["Camera","Lenses","Lighting","Audio","Rigging","Support","Power","Accessories"];
const CAT_ICON_MAP = {Camera,Lenses:Aperture,Lighting:Lightbulb,Audio:Mic,Rigging:Wrench,Support:Layers,Power:Battery,Accessories:Package};
function CatIcon({cat,size=18,color="currentColor"}){const Icon=CAT_ICON_MAP[cat]||Package;return<Icon size={size} color={color} strokeWidth={1.75}/>;}
const STATUS   = {
  available:  {label:"Available",   bg:"#E8F9EE",dot:"#34C759",text:"#1A7A3A"},
  checkedout: {label:"Checked Out", bg:"#FFF3E0",dot:"#FF9500",text:"#A04000"},
  damaged:    {label:"Damaged",     bg:"#FDECEA",dot:"#FF3B30",text:"#B71C1C"},
  partial:    {label:"Partial",     bg:"#FFF3E0",dot:"#FF9500",text:"#A04000"},
};

function kitStat(item){
  if(item.type!=="kit"||!item.contents?.length) return item.status;
  const out=item.contents.filter(c=>c.status!=="available").length;
  if(out===0) return "available";
  if(out===item.contents.length) return "checkedout";
  return "partial";
}
function availQty(item){return Math.max(0,item.qty-(item.checkedOutQty||0)-(item.damagedQty||0));}
function getStatus(item){
  if(item.type==="kit") return kitStat(item);
  const o=item.checkedOutQty||0,d=item.damagedQty||0,a=item.qty-o-d;
  if(o===0&&d===0) return "available";
  if(a<=0&&d>0&&o===0) return "damaged";
  if(a<=0&&o>0&&d===0) return "checkedout";
  return "partial";
}
function migrateItem(it){
  if(it.type==="kit"||typeof it.checkedOutQty==="number") return it;
  return{...it,checkedOutQty:it.status==="checkedout"?1:0,damagedQty:it.status==="damaged"?1:0};
}

function fmt(d){return d?new Date(d).toLocaleDateString("en-AU",{day:"numeric",month:"short"}):""}
function todayPlus(n){const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().split("T")[0]}
function nextId(g){return g.length?Math.max(...g.map(x=>x.id))+1:1}
async function postSlack(url,text){if(!url)return;try{await fetch(url,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})})}catch(_){}}

function parseCSV(text){
  const rows=text.trim().split(/\r?\n/).filter(l=>l.trim());
  if(rows.length<2) return [];
  const splitRow=r=>{const out=[];let cur="",inQ=false;for(const ch of r){if(ch==='"'){inQ=!inQ;}else if(ch===','&&!inQ){out.push(cur.trim());cur="";}else{cur+=ch;}}out.push(cur.trim());return out;};
  const heads=splitRow(rows[0]).map(h=>h.replace(/^"|"$/g,'').toLowerCase().trim());
  const idx=kws=>{for(const k of kws){const i=heads.findIndex(h=>h.includes(k));if(i>=0)return i;}return -1;};
  const ni=idx(['name']),ci=idx(['cat']),qi=idx(['qty','quant']),gi=idx(['group','team']),oi=idx(['note']);
  return rows.slice(1).map(r=>{
    const c=splitRow(r).map(x=>x.replace(/^"|"$/g,'').trim());
    const get=i=>i>=0?(c[i]||''):'';
    const name=get(ni>=0?ni:0);
    if(!name) return null;
    const rawCat=get(ci>=0?ci:1);
    const cat=CATS.find(x=>x.toLowerCase()===rawCat.toLowerCase())||CATS.find(x=>x.toLowerCase().startsWith(rawCat.slice(0,3).toLowerCase()))||'Camera';
    const qty=Math.max(1,parseInt(get(qi>=0?qi:2))||1);
    const group=get(gi>=0?gi:-1)||'Shared Pool';
    const notes=get(oi>=0?oi:-1)||'';
    return{name,cat,qty,group,notes,status:'available',who:null,ret:null};
  }).filter(Boolean);
}

function compressImage(file,maxPx=220,quality=0.78){
  return new Promise(resolve=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const scale=Math.min(maxPx/img.width,maxPx/img.height,1);
        const canvas=document.createElement('canvas');
        canvas.width=Math.round(img.width*scale);
        canvas.height=Math.round(img.height*scale);
        canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL('image/jpeg',quality));
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function Badge({status}){const s=STATUS[status]||STATUS.available;return<span style={{display:"inline-flex",alignItems:"center",gap:5,background:s.bg,color:s.text,fontSize:12,fontWeight:600,padding:"4px 10px",borderRadius:20}}><span style={{width:7,height:7,borderRadius:"50%",background:s.dot,flexShrink:0}}/>{s.label}</span>}

function Overlay({children,onClose}){return<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}}><div onClick={e=>e.stopPropagation()} style={{background:"#F2F2F7",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:560,maxHeight:"92vh",overflowY:"auto",paddingBottom:44,boxShadow:"0 -4px 40px rgba(0,0,0,0.2)"}}><div style={{textAlign:"center",paddingTop:14,paddingBottom:8}}><div style={{width:36,height:5,borderRadius:3,background:"#C7C7CC",margin:"0 auto"}}/></div>{children}</div></div>}

function Section({children,mt=8}){return<div style={{background:"#fff",borderRadius:14,margin:`${mt}px 16px 0`,overflow:"hidden"}}>{children}</div>}
function SLabel({children}){return<div style={{padding:"12px 16px 6px",fontSize:12,color:"#8E8E93",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>{children}</div>}
function Btn({label,color="#007AFF",onClick,disabled,mt=12}){return<button onClick={onClick} disabled={disabled} style={{display:"block",width:"calc(100% - 32px)",margin:`${mt}px 16px 0`,background:disabled?"#C7C7CC":color,color:"#fff",fontSize:17,fontWeight:600,padding:16,borderRadius:14,border:"none",cursor:disabled?"default":"pointer"}}>{label}</button>}
function GhostBtn({label,onClick,color="#007AFF"}){return<button onClick={onClick} style={{display:"block",width:"calc(100% - 32px)",margin:"8px 16px 0",background:"transparent",color,fontSize:17,fontWeight:500,padding:14,borderRadius:14,border:"none",cursor:"pointer"}}>{label}</button>}
function SInput({value,onChange,placeholder}){return<input value={value} onChange={onChange} placeholder={placeholder} style={{width:"100%",fontSize:15,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E5E5EA",background:"#F8F8F8",color:"#1C1C1E",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>}
function Toast({msg,onDone}){useEffect(()=>{const t=setTimeout(onDone,2800);return()=>clearTimeout(t)},[onDone]);return<div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",background:"#1C1C1E",color:"#fff",padding:"12px 22px",borderRadius:14,fontSize:14,fontWeight:500,zIndex:300,whiteSpace:"nowrap",boxShadow:"0 4px 24px rgba(0,0,0,0.25)"}}>{msg}</div>}

function GearCard({item,onClick,onLongPress}){
  const [pressed,setPressed]=useState(false);
  const timer=useRef(null);
  const start=()=>{setPressed(true);timer.current=setTimeout(()=>{onLongPress(item);setPressed(false)},600)};
  const end=()=>{clearTimeout(timer.current);setPressed(false)};
  const isKit=item.type==="kit";
  const contents=item.contents||[];
  const kitOutCount=isKit?contents.filter(c=>c.status!=="available").length:0;
  const dispStatus=getStatus(item);
  const isMulti=!isKit&&item.qty>1;
  const avail=isMulti?availQty(item):0;
  const out=isMulti?(item.checkedOutQty||0):0;
  const dmg=isMulti?(item.damagedQty||0):0;
  return<div onClick={()=>onClick(item)} onMouseDown={start} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchEnd={end}
    style={{background:"#fff",borderRadius:18,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.07)",cursor:"pointer",border:dispStatus!=="available"?"1.5px solid #FFE0E0":"1.5px solid transparent",transform:pressed?"scale(0.96)":"scale(1)",transition:"transform 0.1s",display:"flex",flexDirection:"column"}}>
    {item.photo
      ?<div style={{height:130,overflow:"hidden",flexShrink:0,position:"relative"}}>
          <img src={item.photo} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          <div style={{position:"absolute",top:8,right:8}}><Badge status={dispStatus}/></div>
          {isKit&&<span style={{position:"absolute",top:8,left:8,fontSize:10,fontWeight:700,color:"#fff",background:"#007AFF",padding:"2px 7px",borderRadius:6,letterSpacing:0.3}}>KIT</span>}
        </div>
      :<div style={{padding:"14px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <CatIcon cat={item.cat} size={22}/>
            {isKit&&<span style={{fontSize:10,fontWeight:700,color:"#fff",background:"#007AFF",padding:"2px 7px",borderRadius:6,letterSpacing:0.3}}>KIT</span>}
          </div>
          <Badge status={dispStatus}/>
        </div>
    }
    <div style={{padding:item.photo?"12px 14px 14px":"8px 16px 14px",display:"flex",flexDirection:"column",gap:8,flex:1}}>
      <div>
        <div style={{fontSize:15,fontWeight:600,color:"#1C1C1E",lineHeight:1.3}}>{item.name}</div>
        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3,flexWrap:"wrap"}}>
          {isKit&&<span style={{fontSize:12,color:"#8E8E93"}}>{contents.length} items</span>}
          {isMulti&&<span style={{fontSize:12,fontWeight:600,color:"#007AFF",background:"#EAF2FF",borderRadius:6,padding:"2px 7px"}}>×{item.qty}</span>}
          <span style={{fontSize:12,color:"#8E8E93"}}>{item.group}</span>
        </div>
      </div>
      {isMulti&&(out>0||dmg>0)&&(
        <div style={{borderTop:"1px solid #F2F2F7",paddingTop:6,display:"flex",gap:8,flexWrap:"wrap"}}>
          {avail>0&&<span style={{fontSize:12,color:"#34C759",fontWeight:600}}>● {avail} avail</span>}
          {out>0&&<span style={{fontSize:12,color:"#FF9500",fontWeight:600}}>● {out} out{item.who?` (${item.who.split(" ")[0]})`:""}  </span>}
          {dmg>0&&<span style={{fontSize:12,color:"#FF3B30",fontWeight:600}}>● {dmg} dmg</span>}
        </div>
      )}
      {isKit&&kitOutCount>0&&<div style={{borderTop:"1px solid #F2F2F7",paddingTop:6,fontSize:12,color:"#FF9500",fontWeight:600}}>⚠ {kitOutCount} of {contents.length} out</div>}
      {!isKit&&!isMulti&&dispStatus==="checkedout"&&item.who&&<div style={{borderTop:"1px solid #F2F2F7",paddingTop:8}}><div style={{fontSize:12,color:"#8E8E93"}}>With</div><div style={{fontSize:13,fontWeight:600,color:"#1C1C1E"}}>{item.who}</div>{item.ret&&<div style={{fontSize:12,color:"#FF9500",marginTop:2}}>↩ Back by {fmt(item.ret)}</div>}</div>}
      {!isKit&&!isMulti&&dispStatus==="damaged"&&item.notes&&<div style={{fontSize:12,color:"#FF3B30",background:"#FFF5F5",borderRadius:8,padding:"6px 10px"}}>⚠️ {item.notes}</div>}
      <div style={{fontSize:11,color:"#C7C7CC",textAlign:"right"}}>{isKit||isMulti?"Tap to manage · Hold to edit":"Hold to edit"}</div>
    </div>
  </div>
}

function KitSheet({item,gear,setGear,webhook,onEdit,onClose,showToast}){
  const [subModal,setSubModal]=useState(null);
  const [person,setPerson]=useState("");
  const [ret,setRet]=useState(todayPlus(1));
  const kit=gear.find(g=>g.id===item.id)||item;
  const contents=kit.contents||[];
  const available=contents.filter(c=>c.status==="available");

  const updateContent=(cid,changes)=>setGear(g=>g.map(x=>x.id===kit.id?{...x,contents:x.contents.map(c=>c.cid===cid?{...c,...changes}:c)}:x));

  const checkoutItem=async(cid,who,r)=>{
    const ci=contents.find(c=>c.cid===cid);
    updateContent(cid,{status:"checkedout",who,ret:r});
    await postSlack(webhook,`📦 *${who}* checked out *${ci.name}* from *${kit.name}*. Back by ${fmt(r)}.`);
    setSubModal(null);showToast(`✓ ${ci.name} checked out`);
  };
  const returnItem=async(cid)=>{
    const ci=contents.find(c=>c.cid===cid);
    updateContent(cid,{status:"available",who:null,ret:null});
    await postSlack(webhook,`✅ *${ci.who}* returned *${ci.name}* to *${kit.name}*.`);
    setSubModal(null);showToast(`✓ ${ci.name} returned`);
  };
  const checkoutAll=async(who,r)=>{
    setGear(g=>g.map(x=>x.id===kit.id?{...x,contents:x.contents.map(c=>c.status==="available"?{...c,status:"checkedout",who,ret:r}:c)}:x));
    await postSlack(webhook,`📦 *${who}* checked out *${kit.name}* (${available.length} items). Back by ${fmt(r)}.`);
    setSubModal(null);showToast(`✓ ${kit.name} checked out`);onClose();
  };

  if(subModal?.type==="checkout"){
    const label=subModal.cid==="all"?(available.length===contents.length?kit.name:`${available.length} available items from ${kit.name}`):contents.find(c=>c.cid===subModal.cid)?.name;
    return<Overlay onClose={()=>setSubModal(null)}>
      <div style={{padding:"4px 16px 0"}}><div style={{fontSize:13,color:"#8E8E93"}}>Checking out</div><div style={{fontSize:20,fontWeight:700,color:"#1C1C1E",marginTop:2}}>{label}</div></div>
      <Section mt={16}><SLabel>Who are you?</SLabel>
        <div style={{maxHeight:220,overflowY:"auto"}}>
          {TEAM.map(n=><div key={n} onClick={()=>setPerson(n)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",cursor:"pointer",borderTop:"1px solid #F2F2F7",background:person===n?"#F0F7FF":"transparent"}}><span style={{fontSize:15,color:"#1C1C1E"}}>{n}</span>{person===n&&<span style={{color:"#007AFF",fontSize:18,fontWeight:700}}>✓</span>}</div>)}
        </div>
      </Section>
      <Section>
        <SLabel>Returning by</SLabel>
        <div style={{padding:"0 16px 8px",display:"flex",gap:8}}>
          {[1,3,7,14].map(n=><button key={n} onClick={()=>setRet(todayPlus(n))} style={{flex:1,padding:"10px 4px",borderRadius:10,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",background:ret===todayPlus(n)?"#007AFF":"#F2F2F7",color:ret===todayPlus(n)?"#fff":"#1C1C1E"}}>{n===1?"Tmrw":`${n}d`}</button>)}
        </div>
        <div style={{padding:"8px 16px 14px"}}><input type="date" value={ret} min={todayPlus(1)} onChange={e=>setRet(e.target.value)} style={{width:"100%",fontSize:15,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E5E5EA",background:"#F8F8F8",color:"#1C1C1E",outline:"none",boxSizing:"border-box"}}/></div>
      </Section>
      <Btn label="Check Out" onClick={()=>subModal.cid==="all"?checkoutAll(person,ret):checkoutItem(subModal.cid,person,ret)} disabled={!person} mt={16}/>
      <GhostBtn label="Cancel" onClick={()=>setSubModal(null)}/>
    </Overlay>;
  }

  if(subModal?.type==="return"){
    const ci=contents.find(c=>c.cid===subModal.cid);
    return<Overlay onClose={()=>setSubModal(null)}>
      <div style={{padding:"4px 16px 0"}}><div style={{fontSize:13,color:"#8E8E93"}}>Returning from {kit.name}</div><div style={{fontSize:20,fontWeight:700,color:"#1C1C1E",marginTop:2}}>{ci?.name}</div><div style={{fontSize:13,color:"#8E8E93",marginTop:2}}>With {ci?.who}</div></div>
      <Btn label="Return ✓" color="#34C759" onClick={()=>returnItem(subModal.cid)} mt={24}/>
      <GhostBtn label="Cancel" onClick={()=>setSubModal(null)}/>
    </Overlay>;
  }

  return<Overlay onClose={onClose}>
    <div style={{padding:"4px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div>
        <span style={{fontSize:11,fontWeight:700,color:"#fff",background:"#007AFF",padding:"2px 8px",borderRadius:6,letterSpacing:0.3}}>KIT</span>
        <div style={{fontSize:20,fontWeight:700,color:"#1C1C1E",marginTop:6}}>{kit.name}</div>
        <div style={{fontSize:13,color:"#8E8E93",marginTop:2}}>{kit.group}</div>
      </div>
      <button onClick={()=>onEdit(kit)} style={{background:"#F2F2F7",border:"none",borderRadius:10,padding:"6px 12px",fontSize:13,fontWeight:600,color:"#007AFF",cursor:"pointer",marginTop:4,flexShrink:0}}>Edit</button>
    </div>
    <Section mt={16}>
      <SLabel>Contents ({contents.length})</SLabel>
      {contents.length===0
        ?<div style={{padding:"20px 16px",textAlign:"center",color:"#8E8E93",fontSize:14,lineHeight:1.6}}>No items yet.<br/>Tap <span style={{color:"#007AFF",fontWeight:600}}>Edit</span> to add contents to this kit.</div>
        :contents.map((c,i)=>(
          <div key={c.cid} onClick={()=>{setPerson("");setRet(todayPlus(1));setSubModal({type:c.status==="available"?"checkout":"return",cid:c.cid})}}
            style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",cursor:"pointer",borderTop:i>0?"1px solid #F2F2F7":"none",background:c.status!=="available"?"#FFFAF5":"transparent"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <CatIcon cat={c.cat} size={18}/>
              <div>
                <div style={{fontSize:15,color:"#1C1C1E",fontWeight:500}}>{c.name}</div>
                {c.status==="checkedout"&&<div style={{fontSize:12,color:"#FF9500",marginTop:2}}>Out with {c.who} · Back {fmt(c.ret)}</div>}
              </div>
            </div>
            <Badge status={c.status}/>
          </div>
        ))
      }
    </Section>
    {available.length>0&&<Btn label={available.length===contents.length?"Check Out Full Kit":`Check Out ${available.length} Available Items`} onClick={()=>{setPerson("");setRet(todayPlus(1));setSubModal({type:"checkout",cid:"all"})}} mt={16}/>}
    <GhostBtn label="Close" onClick={onClose}/>
  </Overlay>;
}

function EditSheet({item,isNew,onSave,onDelete,onClose}){
  const[f,setF]=useState(isNew
    ?{name:"",qty:1,cat:"Camera",group:"Shared Pool",notes:"",isKit:false,contents:[],photo:null}
    :{name:item.name,qty:item.qty||1,cat:item.cat,group:item.group,notes:item.notes||"",isKit:item.type==="kit",contents:item.contents||[],photo:item.photo||null});
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  const photoRef=useRef(null);
  const handlePhotoChange=async e=>{
    const file=e.target.files?.[0];
    if(!file) return;
    const compressed=await compressImage(file);
    s("photo",compressed);
    e.target.value='';
  };
  const handleSave=()=>{
    const{isKit,contents,...rest}=f;
    const out={...rest};
    if(isKit){out.type="kit";out.contents=contents.filter(c=>c.name.trim());}
    onSave(out);
  };
  return<Overlay onClose={onClose}>
    <div style={{padding:"4px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:20,fontWeight:700,color:"#1C1C1E"}}>{isNew?"Add Equipment":"Edit Equipment"}</div>
      {!isNew&&<button onClick={()=>onDelete(item)} style={{background:"transparent",border:"none",fontSize:13,color:"#FF3B30",fontWeight:600,cursor:"pointer"}}>Delete</button>}
    </div>
    <Section mt={16}>
      <SLabel>Photo</SLabel>
      <div style={{padding:"0 16px 14px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:72,height:72,borderRadius:12,overflow:"hidden",background:"#F2F2F7",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {f.photo?<img src={f.photo} alt="gear" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<CatIcon cat={f.cat} size={28} color="#8E8E93"/>}
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
          <input ref={photoRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{display:"none"}}/>
          <button onClick={()=>photoRef.current?.click()} style={{padding:"9px 14px",borderRadius:10,border:"1.5px solid #007AFF",background:"#F0F7FF",fontSize:13,color:"#007AFF",cursor:"pointer",fontWeight:600,textAlign:"center"}}>📷  {f.photo?"Change Photo":"Add Photo"}</button>
          {f.photo&&<button onClick={()=>s("photo",null)} style={{padding:"7px 14px",borderRadius:10,border:"none",background:"#F2F2F7",fontSize:13,color:"#8E8E93",cursor:"pointer",fontWeight:500}}>Remove Photo</button>}
        </div>
      </div>
    </Section>
    <Section><SLabel>Name</SLabel><div style={{padding:"0 16px 14px"}}><SInput value={f.name} onChange={e=>s("name",e.target.value)} placeholder="e.g. Sony FX6 or Canon R5C Kit"/></div></Section>
    <Section>
      <div style={{padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:15,fontWeight:600,color:"#1C1C1E"}}>This is a kit</div><div style={{fontSize:12,color:"#8E8E93",marginTop:2}}>Group multiple items that go out together</div></div>
        <div onClick={()=>s("isKit",!f.isKit)} style={{width:51,height:31,borderRadius:16,background:f.isKit?"#34C759":"#E5E5EA",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
          <div style={{position:"absolute",top:2,left:f.isKit?22:2,width:27,height:27,borderRadius:"50%",background:"#fff",boxShadow:"0 2px 4px rgba(0,0,0,0.2)",transition:"left 0.2s"}}/>
        </div>
      </div>
    </Section>
    {f.isKit
      ?<Section>
          <SLabel>Kit Contents</SLabel>
          {f.contents.map((c,i)=>(
            <div key={i} style={{borderTop:i>0?"1px solid #F2F2F7":"none",padding:"10px 16px"}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <CatIcon cat={c.cat||"Camera"} size={20} color="#8E8E93"/>
                <SInput value={c.name} onChange={e=>s("contents",f.contents.map((x,j)=>j===i?{...x,name:e.target.value}:x))} placeholder={`Item ${i+1} name`}/>
                <button onClick={()=>s("contents",f.contents.filter((_,j)=>j!==i))} style={{border:"none",background:"none",fontSize:20,color:"#FF3B30",cursor:"pointer",flexShrink:0}}>✕</button>
              </div>
              <div style={{display:"flex",gap:5,marginTop:8,paddingLeft:30,overflowX:"auto",paddingBottom:2}}>
                {CATS.map(cat=><button key={cat} onClick={()=>s("contents",f.contents.map((x,j)=>j===i?{...x,cat}:x))} style={{padding:"4px 9px",borderRadius:8,border:"none",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,display:"inline-flex",alignItems:"center",gap:4,background:(c.cat||"Camera")===cat?"#007AFF":"#F2F2F7",color:(c.cat||"Camera")===cat?"#fff":"#1C1C1E"}}><CatIcon cat={cat} size={11}/>{cat}</button>)}
              </div>
            </div>
          ))}
          <div style={{padding:"8px 16px 14px"}}>
            <button onClick={()=>s("contents",[...f.contents,{cid:Date.now(),name:"",cat:"Camera",status:"available",who:null,ret:null}])} style={{width:"100%",padding:"10px",borderRadius:10,border:"1.5px dashed #C7C7CC",background:"transparent",fontSize:14,color:"#007AFF",cursor:"pointer",fontWeight:600}}>+ Add Item</button>
          </div>
        </Section>
      :<Section>
          <SLabel>Quantity</SLabel>
          <div style={{padding:"0 16px 14px",display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>s("qty",Math.max(1,f.qty-1))} style={{width:44,height:44,borderRadius:12,border:"none",background:"#F2F2F7",fontSize:22,cursor:"pointer",color:"#1C1C1E",flexShrink:0}}>−</button>
            <div style={{flex:1,textAlign:"center",fontSize:28,fontWeight:700,color:"#1C1C1E"}}>{f.qty}</div>
            <button onClick={()=>s("qty",f.qty+1)} style={{width:44,height:44,borderRadius:12,border:"none",background:"#F2F2F7",fontSize:22,cursor:"pointer",color:"#1C1C1E",flexShrink:0}}>+</button>
          </div>
        </Section>
    }
    <Section>
      <SLabel>Category</SLabel>
      <div style={{padding:"0 16px 14px",display:"flex",flexWrap:"wrap",gap:8}}>
        {CATS.map(c=><button key={c} onClick={()=>s("cat",c)} style={{padding:"8px 14px",borderRadius:10,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,background:f.cat===c?"#007AFF":"#F2F2F7",color:f.cat===c?"#fff":"#1C1C1E"}}><CatIcon cat={c} size={14}/>{c}</button>)}
      </div>
    </Section>
    <Section>
      <SLabel>Team / Group</SLabel>
      <div style={{padding:"0 16px 14px"}}>
        <select value={f.group} onChange={e=>s("group",e.target.value)} style={{width:"100%",fontSize:15,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E5E5EA",background:"#F8F8F8",color:"#1C1C1E",outline:"none",fontFamily:"inherit"}}>
          {GROUPS.map(g=><option key={g} value={g}>{g}</option>)}
        </select>
      </div>
    </Section>
    <Section>
      <SLabel>Notes (optional)</SLabel>
      <div style={{padding:"0 16px 14px"}}>
        <textarea value={f.notes} onChange={e=>s("notes",e.target.value)} placeholder="Any notes about this item…" rows={2} style={{width:"100%",fontSize:15,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E5E5EA",background:"#F8F8F8",outline:"none",resize:"none",fontFamily:"inherit",color:"#1C1C1E",boxSizing:"border-box"}}/>
      </div>
    </Section>
    <Btn label={isNew?"Add to Inventory":"Save Changes"} onClick={handleSave} disabled={!f.name.trim()} mt={16}/>
    <GhostBtn label="Cancel" onClick={onClose}/>
  </Overlay>
}

function QtyRow({label,val,setVal,min=1,max}){
  return<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px"}}>
    <span style={{fontSize:15,color:"#1C1C1E",fontWeight:500}}>{label}</span>
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <button onClick={()=>setVal(Math.max(min,val-1))} disabled={val<=min} style={{width:36,height:36,borderRadius:10,border:"none",background:"#F2F2F7",fontSize:22,cursor:"pointer",color:val<=min?"#C7C7CC":"#1C1C1E",fontWeight:300}}>−</button>
      <span style={{fontSize:22,fontWeight:700,color:"#1C1C1E",minWidth:28,textAlign:"center"}}>{val}</span>
      <button onClick={()=>setVal(Math.min(max,val+1))} disabled={val>=max} style={{width:36,height:36,borderRadius:10,border:"none",background:"#F2F2F7",fontSize:22,cursor:"pointer",color:val>=max?"#C7C7CC":"#1C1C1E",fontWeight:300}}>+</button>
    </div>
  </div>;
}

function PersonPicker({person,setPerson}){
  return<div style={{maxHeight:200,overflowY:"auto"}}>
    {TEAM.map(n=><div key={n} onClick={()=>setPerson(n)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",cursor:"pointer",borderTop:"1px solid #F2F2F7",background:person===n?"#F0F7FF":"transparent"}}>
      <span style={{fontSize:15,color:"#1C1C1E"}}>{n}</span>
      {person===n&&<span style={{color:"#007AFF",fontSize:18,fontWeight:700}}>✓</span>}
    </div>)}
  </div>;
}

function ReturnDatePicker({ret,setRet}){
  return<Section>
    <SLabel>Returning by</SLabel>
    <div style={{padding:"0 16px 8px",display:"flex",gap:8}}>
      {[1,3,7,14].map(n=><button key={n} onClick={()=>setRet(todayPlus(n))} style={{flex:1,padding:"10px 4px",borderRadius:10,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",background:ret===todayPlus(n)?"#007AFF":"#F2F2F7",color:ret===todayPlus(n)?"#fff":"#1C1C1E"}}>{n===1?"Tmrw":`${n}d`}</button>)}
    </div>
    <div style={{padding:"4px 16px 14px"}}><input type="date" value={ret} min={todayPlus(1)} onChange={e=>setRet(e.target.value)} style={{width:"100%",fontSize:15,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E5E5EA",background:"#F8F8F8",color:"#1C1C1E",outline:"none",boxSizing:"border-box"}}/></div>
  </Section>;
}

function MultiSheet({item,gear,setGear,webhook,onEdit,onClose,showToast}){
  const[view,setView]=useState("main");
  const[qty,setQty]=useState(1);
  const[person,setPerson]=useState("");
  const[ret,setRet]=useState(todayPlus(1));
  const[dmgNote,setDmgNote]=useState("");
  const live=gear.find(g=>g.id===item.id)||item;
  const out=live.checkedOutQty||0;
  const dmg=live.damagedQty||0;
  const avail=Math.max(0,live.qty-out-dmg);

  const doCheckout=async()=>{
    setGear(g=>g.map(x=>x.id===live.id?{...x,checkedOutQty:(x.checkedOutQty||0)+qty,who:person,ret}:x));
    await postSlack(webhook,`📦 *${person}* checked out *${qty}× ${live.name}* (${live.group}). Back by ${fmt(ret)}.`);
    showToast(`✓ ${qty}× ${live.name} checked out`);onClose();
  };
  const doReturn=async()=>{
    setGear(g=>g.map(x=>{
      if(x.id!==live.id) return x;
      const newOut=Math.max(0,(x.checkedOutQty||0)-qty);
      return{...x,checkedOutQty:newOut,who:newOut>0?x.who:null,ret:newOut>0?x.ret:null};
    }));
    await postSlack(webhook,`✅ *${live.who}* returned *${qty}× ${live.name}*.`);
    showToast(`✓ ${qty}× ${live.name} returned`);onClose();
  };
  const doMarkDamaged=async()=>{
    setGear(g=>g.map(x=>x.id!==live.id?x:{...x,damagedQty:Math.min(x.qty,(x.damagedQty||0)+qty),notes:dmgNote||x.notes}));
    await postSlack(webhook,`⚠️ *${qty}× ${live.name}* marked as damaged.${dmgNote?` "${dmgNote}"`:""}`);
    showToast(`⚠️ ${qty} unit${qty>1?"s":""} marked as damaged`);onClose();
  };
  const doMarkAvailable=async()=>{
    setGear(g=>g.map(x=>x.id!==live.id?x:{...x,damagedQty:Math.max(0,(x.damagedQty||0)-qty),notes:(x.damagedQty||0)-qty<=0?"":x.notes}));
    await postSlack(webhook,`✅ *${qty}× ${live.name}* marked as available.`);
    showToast(`✓ ${qty} unit${qty>1?"s":""} marked available`);onClose();
  };

  if(view==="checkout") return<Overlay onClose={()=>setView("main")}>
    <div style={{padding:"4px 16px 0"}}><div style={{fontSize:13,color:"#8E8E93"}}>Checking out</div><div style={{fontSize:20,fontWeight:700,color:"#1C1C1E",marginTop:2}}>{live.name}</div></div>
    <Section mt={16}><SLabel>How many?</SLabel><QtyRow label={`of ${avail} available`} val={qty} setVal={setQty} min={1} max={avail}/></Section>
    <Section mt={8}><SLabel>Who are you?</SLabel><PersonPicker person={person} setPerson={setPerson}/></Section>
    <ReturnDatePicker ret={ret} setRet={setRet}/>
    <Btn label={`Check Out ${qty} Unit${qty>1?"s":""}`} onClick={doCheckout} disabled={!person} mt={16}/>
    <GhostBtn label="Cancel" onClick={()=>setView("main")}/>
  </Overlay>;

  if(view==="return") return<Overlay onClose={()=>setView("main")}>
    <div style={{padding:"4px 16px 0"}}><div style={{fontSize:13,color:"#8E8E93"}}>Returning</div><div style={{fontSize:20,fontWeight:700,color:"#1C1C1E",marginTop:2}}>{live.name}</div>{live.who&&<div style={{fontSize:13,color:"#8E8E93",marginTop:2}}>With {live.who}</div>}</div>
    <Section mt={16}><SLabel>How many returning?</SLabel><QtyRow label={`of ${out} out`} val={qty} setVal={setQty} min={1} max={out}/></Section>
    <Btn label={`Return ${qty} Unit${qty>1?"s":""} ✓`} color="#34C759" onClick={doReturn} mt={16}/>
    <GhostBtn label="Cancel" onClick={()=>setView("main")}/>
  </Overlay>;

  if(view==="damage") return<Overlay onClose={()=>setView("main")}>
    <div style={{padding:"4px 16px 0"}}><div style={{fontSize:13,color:"#FF3B30",fontWeight:600}}>⚠️ Mark Damaged</div><div style={{fontSize:20,fontWeight:700,color:"#1C1C1E",marginTop:2}}>{live.name}</div></div>
    <Section mt={16}><SLabel>How many units?</SLabel><QtyRow label={`of ${avail} available`} val={qty} setVal={setQty} min={1} max={avail}/></Section>
    <Section mt={8}><SLabel>Damage notes (optional)</SLabel><div style={{padding:"0 16px 14px"}}><textarea value={dmgNote} onChange={e=>setDmgNote(e.target.value)} placeholder="Describe the damage…" rows={2} style={{width:"100%",fontSize:15,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E5E5EA",background:"#F8F8F8",outline:"none",resize:"none",fontFamily:"inherit",color:"#1C1C1E",boxSizing:"border-box"}}/></div></Section>
    <Btn label={`Mark ${qty} Unit${qty>1?"s":""} as Damaged`} color="#FF3B30" onClick={doMarkDamaged} mt={16}/>
    <GhostBtn label="Cancel" onClick={()=>setView("main")}/>
  </Overlay>;

  if(view==="undamage") return<Overlay onClose={()=>setView("main")}>
    <div style={{padding:"4px 16px 0"}}><div style={{fontSize:13,color:"#34C759",fontWeight:600}}>Mark as Available</div><div style={{fontSize:20,fontWeight:700,color:"#1C1C1E",marginTop:2}}>{live.name}</div></div>
    <Section mt={16}><SLabel>How many units are fixed?</SLabel><QtyRow label={`of ${dmg} damaged`} val={qty} setVal={setQty} min={1} max={dmg}/></Section>
    <Btn label={`Mark ${qty} Unit${qty>1?"s":""} as Available ✓`} color="#34C759" onClick={doMarkAvailable} mt={16}/>
    <GhostBtn label="Cancel" onClick={()=>setView("main")}/>
  </Overlay>;

  return<Overlay onClose={onClose}>
    <div style={{padding:"4px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div><div style={{fontSize:20,fontWeight:700,color:"#1C1C1E"}}>{live.name}</div><div style={{fontSize:13,color:"#8E8E93",marginTop:2}}>{live.group} · {live.qty} total</div></div>
      <button onClick={()=>onEdit(live)} style={{background:"#F2F2F7",border:"none",borderRadius:10,padding:"6px 12px",fontSize:13,fontWeight:600,color:"#007AFF",cursor:"pointer",marginTop:4}}>Edit</button>
    </div>
    <Section mt={16}>
      <div style={{display:"flex",borderBottom:"1px solid #F2F2F7"}}>
        {[{n:avail,label:"Available",c:"#34C759"},{n:out,label:"Out",c:"#FF9500"},{n:dmg,label:"Damaged",c:"#FF3B30"}].map((s,i)=>(
          <div key={s.label} style={{flex:1,textAlign:"center",padding:"14px 8px",borderLeft:i>0?"1px solid #F2F2F7":"none"}}>
            <div style={{fontSize:24,fontWeight:700,color:s.c}}>{s.n}</div>
            <div style={{fontSize:11,color:"#8E8E93",fontWeight:500,marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>
      {out>0&&live.who&&<div style={{padding:"12px 16px",borderTop:"1px solid #F2F2F7",fontSize:13,color:"#8E8E93"}}>Out with <span style={{fontWeight:600,color:"#1C1C1E"}}>{live.who}</span>{live.ret&&<span style={{color:"#FF9500"}}> · Back by {fmt(live.ret)}</span>}</div>}
      {dmg>0&&live.notes&&<div style={{padding:"8px 16px 12px",fontSize:13,color:"#FF3B30"}}>⚠️ {live.notes}</div>}
    </Section>
    {avail>0&&<Btn label="Check Out" onClick={()=>{setQty(1);setPerson("");setRet(todayPlus(1));setView("checkout")}} mt={16}/>}
    {out>0&&<Btn label="Return Gear ✓" color="#34C759" onClick={()=>{setQty(1);setView("return")}} mt={8}/>}
    {avail>0&&<Btn label="🚧 Mark as Damaged" color="#FF3B30" onClick={()=>{setQty(1);setDmgNote("");setView("damage")}} mt={8}/>}
    {dmg>0&&<GhostBtn label="Mark Units as Available" onClick={()=>{setQty(1);setView("undamage")}} color="#34C759"/>}
    <GhostBtn label="Close" onClick={onClose}/>
  </Overlay>;
}

function CheckoutSheet({item,onCheckout,onMarkDamaged,onEdit,onClose}){
  const[person,setPerson]=useState("");
  const[ret,setRet]=useState(todayPlus(1));
  const[showDmg,setShowDmg]=useState(false);
  const[dmgNote,setDmgNote]=useState("");
  if(showDmg) return<Overlay onClose={()=>setShowDmg(false)}>
    <div style={{padding:"4px 16px 0"}}><div style={{fontSize:13,color:"#FF3B30",fontWeight:600}}>⚠️ Mark as Damaged</div><div style={{fontSize:20,fontWeight:700,color:"#1C1C1E",marginTop:2}}>{item.name}</div></div>
    <Section mt={16}><SLabel>Describe the issue</SLabel><div style={{padding:"0 16px 14px"}}><textarea value={dmgNote} onChange={e=>setDmgNote(e.target.value)} placeholder="What's wrong with it?" rows={3} style={{width:"100%",fontSize:15,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E5E5EA",background:"#F8F8F8",outline:"none",resize:"none",fontFamily:"inherit",color:"#1C1C1E",boxSizing:"border-box"}}/></div></Section>
    <Btn label="Mark as Damaged" color="#FF3B30" onClick={()=>onMarkDamaged(dmgNote)} mt={16}/>
    <GhostBtn label="Cancel" onClick={()=>setShowDmg(false)}/>
  </Overlay>;
  return<Overlay onClose={onClose}>
    <div style={{padding:"4px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div><div style={{fontSize:13,color:"#8E8E93",fontWeight:500}}>Checking out</div><div style={{fontSize:20,fontWeight:700,color:"#1C1C1E",marginTop:2}}>{item.name}</div></div>
      <button onClick={()=>onEdit(item)} style={{background:"#F2F2F7",border:"none",borderRadius:10,padding:"6px 12px",fontSize:13,fontWeight:600,color:"#007AFF",cursor:"pointer",marginTop:4,flexShrink:0}}>Edit</button>
    </div>
    <Section mt={16}><SLabel>Who are you?</SLabel><PersonPicker person={person} setPerson={setPerson}/></Section>
    <ReturnDatePicker ret={ret} setRet={setRet}/>
    <Btn label="Check Out" onClick={()=>onCheckout(person,ret)} disabled={!person} mt={16}/>
    <GhostBtn label="🚧 Mark as Damaged Instead" onClick={()=>setShowDmg(true)} color="#FF3B30"/>
    <GhostBtn label="Cancel" onClick={onClose}/>
  </Overlay>
}

function ReturnSheet({item,onReturn,onEdit,onClose}){
  const[dmg,setDmg]=useState("");
  return<Overlay onClose={onClose}>
    <div style={{padding:"4px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div><div style={{fontSize:13,color:"#8E8E93",fontWeight:500}}>Returning</div><div style={{fontSize:20,fontWeight:700,color:"#1C1C1E",marginTop:2}}>{item.name}</div><div style={{fontSize:14,color:"#8E8E93",marginTop:2}}>With {item.who}</div></div>
      <button onClick={()=>onEdit(item)} style={{background:"#F2F2F7",border:"none",borderRadius:10,padding:"6px 12px",fontSize:13,fontWeight:600,color:"#007AFF",cursor:"pointer",marginTop:4,flexShrink:0}}>Edit</button>
    </div>
    <Section mt={16}><SLabel>Any damage to report?</SLabel>
      <div style={{padding:"8px 16px 14px"}}><textarea value={dmg} onChange={e=>setDmg(e.target.value)} placeholder="Leave blank if all good…" rows={3} style={{width:"100%",fontSize:15,padding:"10px 12px",borderRadius:10,border:"1.5px solid #E5E5EA",background:"#F8F8F8",outline:"none",resize:"none",fontFamily:"inherit",color:"#1C1C1E",boxSizing:"border-box"}}/></div>
    </Section>
    {dmg?<Btn label="Return & Report Damage" color="#FF3B30" onClick={()=>onReturn(true,dmg)} mt={16}/>:<Btn label="Return Gear ✓" color="#34C759" onClick={()=>onReturn(false,"")} mt={16}/>}
    <GhostBtn label="Cancel" onClick={onClose}/>
  </Overlay>
}

function DamagedSheet({item,onMarkAvailable,onEdit,onClose}){
  return<Overlay onClose={onClose}>
    <div style={{padding:"4px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div><div style={{fontSize:13,color:"#FF3B30",fontWeight:600}}>⚠️ Damaged</div><div style={{fontSize:20,fontWeight:700,color:"#1C1C1E",marginTop:2}}>{item.name}</div></div>
      <button onClick={()=>onEdit(item)} style={{background:"#F2F2F7",border:"none",borderRadius:10,padding:"6px 12px",fontSize:13,fontWeight:600,color:"#007AFF",cursor:"pointer",marginTop:4,flexShrink:0}}>Edit</button>
    </div>
    {item.notes&&<Section mt={16}><div style={{padding:"14px 16px",fontSize:14,color:"#8E8E93",lineHeight:1.5}}>{item.notes}</div></Section>}
    <Btn label="Mark as Available ✓" color="#34C759" onClick={onMarkAvailable} mt={16}/>
    <GhostBtn label="Cancel" onClick={onClose}/>
  </Overlay>
}

function SettingsSheet({webhook,setWebhook,channel,setChannel,onSave,onClose,onImportCSV}){
  const fileRef=useRef(null);
  const handleFile=e=>{
    const file=e.target.files?.[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const items=parseCSV(ev.target.result||'');
      if(items.length>0){onClose();onImportCSV(items);}
      else alert("No valid gear found in the CSV. Make sure it has at least a 'name' column.");
    };
    reader.readAsText(file);
    e.target.value='';
  };
  return<Overlay onClose={onClose}>
    <div style={{padding:"4px 16px 12px"}}><div style={{fontSize:20,fontWeight:700,color:"#1C1C1E"}}>Settings</div></div>
    <Section><SLabel>Slack Webhook URL</SLabel><div style={{padding:"0 16px 8px"}}><SInput value={webhook} onChange={e=>setWebhook(e.target.value)} placeholder="https://hooks.slack.com/services/…"/><div style={{fontSize:12,color:"#8E8E93",marginTop:6}}>Checkout, return, and damage events post to Slack automatically.</div></div></Section>
    <Section><SLabel>Channel (display only)</SLabel><div style={{padding:"0 16px 14px"}}><SInput value={channel} onChange={e=>setChannel(e.target.value)} placeholder="#cameranauts"/></div></Section>
    <Section>
      <SLabel>Bulk Import</SLabel>
      <div style={{padding:"0 16px 14px"}}>
        <div style={{fontSize:12,color:"#8E8E93",marginBottom:10,lineHeight:1.6}}>Upload a CSV with columns: <span style={{fontWeight:600,color:"#1C1C1E"}}>name</span>, <span style={{fontWeight:600,color:"#1C1C1E"}}>category</span>, <span style={{fontWeight:600,color:"#1C1C1E"}}>quantity</span><br/>Optional: group, notes</div>
        <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} style={{display:"none"}}/>
        <button onClick={()=>fileRef.current?.click()} style={{width:"100%",padding:"12px",borderRadius:10,border:"1.5px dashed #007AFF",background:"#F0F7FF",fontSize:14,color:"#007AFF",cursor:"pointer",fontWeight:600}}>📂  Choose CSV File</button>
      </div>
    </Section>
    <Btn label="Save Settings" onClick={onSave} mt={16}/>
    <GhostBtn label="Cancel" onClick={onClose}/>
  </Overlay>
}

function ImportSheet({items,onConfirm,onClose}){
  return<Overlay onClose={onClose}>
    <div style={{padding:"4px 16px 0"}}>
      <div style={{fontSize:20,fontWeight:700,color:"#1C1C1E"}}>Import Gear</div>
      <div style={{fontSize:13,color:"#8E8E93",marginTop:2}}>{items.length} item{items.length!==1?"s":""} found in CSV</div>
    </div>
    <Section mt={16}>
      <SLabel>Preview</SLabel>
      <div style={{maxHeight:360,overflowY:"auto"}}>
        {items.map((item,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 16px",borderTop:i>0?"1px solid #F2F2F7":"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <CatIcon cat={item.cat} size={18} color="#8E8E93"/>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:"#1C1C1E"}}>{item.name}</div>
                <div style={{fontSize:12,color:"#8E8E93"}}>{item.cat} · {item.group}</div>
              </div>
            </div>
            {item.qty>1&&<span style={{fontSize:12,fontWeight:600,color:"#007AFF",background:"#EAF2FF",borderRadius:6,padding:"2px 7px",flexShrink:0}}>×{item.qty}</span>}
          </div>
        ))}
      </div>
    </Section>
    <Btn label={`Add ${items.length} Item${items.length!==1?"s":""} to Inventory`} onClick={onConfirm} mt={16}/>
    <GhostBtn label="Cancel" onClick={onClose}/>
  </Overlay>
}

export default function GearRoom(){
  const[gear,setGear]=useState(()=>{try{const s=localStorage.getItem("gr2");return s?JSON.parse(s).map(migrateItem):INITIAL_GEAR.map(migrateItem)}catch{return INITIAL_GEAR.map(migrateItem)}});
  const[webhook,setWebhook]=useState(()=>localStorage.getItem("gr_wh")||"");
  const[channel,setChannel]=useState(()=>localStorage.getItem("gr_ch")||"#cameranauts");
  const[activeCat,setActiveCat]=useState("All");
  const[search,setSearch]=useState("");
  const[modal,setModal]=useState(null);
  const[sel,setSel]=useState(null);
  const[toast,setToast]=useState(null);
  const[time,setTime]=useState(new Date());
  const[importItems,setImportItems]=useState([]);
  const[collapsed,setCollapsed]=useState({});
  const toggleCat=cat=>setCollapsed(c=>({...c,[cat]:!c[cat]}));

  useEffect(()=>{localStorage.setItem("gr2",JSON.stringify(gear))},[gear]);
  useEffect(()=>{const t=setInterval(()=>setTime(new Date()),30000);return()=>clearInterval(t)},[]);

  const close=()=>{setModal(null);setSel(null)};
  const showToast=m=>setToast(m);

  const filtered=gear.filter(g=>(activeCat==="All"||g.cat===activeCat)&&(!search||g.name.toLowerCase().includes(search.toLowerCase())));
  const stats={
    av:gear.filter(g=>g.type==="kit"?(g.contents||[]).every(c=>c.status==="available"):availQty(g)===g.qty&&(g.damagedQty||0)===0).length,
    out:gear.filter(g=>g.type==="kit"?(g.contents||[]).some(c=>c.status!=="available"):(g.checkedOutQty||0)>0).length,
    iss:gear.filter(g=>(g.damagedQty||0)>0||g.status==="damaged").length
  };

  const openCard=item=>{
    setSel(item);
    if(item.type==="kit"){setModal("kit");return;}
    if(item.qty>1){setModal("multi");return;}
    const st=getStatus(item);
    setModal(st==="available"?"checkout":st==="checkedout"?"return":"damaged");
  };
  const openEdit=item=>{setSel(item);setModal("edit")};

  const handleCheckout=async(person,ret)=>{
    setGear(g=>g.map(x=>x.id===sel.id?{...x,checkedOutQty:1,who:person,ret,status:"checkedout"}:x));
    await postSlack(webhook,`📦 *${person}* checked out *${sel.name}* (${sel.group}). Back by ${fmt(ret)}.`);
    close();showToast(`✓ ${sel.name} checked out`);
  };
  const handleReturn=async(damaged,dmgNote)=>{
    const who=sel.who;
    setGear(g=>g.map(x=>x.id===sel.id?{...x,checkedOutQty:0,damagedQty:damaged?1:0,who:null,ret:null,notes:damaged?dmgNote:x.notes,status:damaged?"damaged":"available"}:x));
    await postSlack(webhook,damaged?`⚠️ *${who}* returned *${sel.name}* with damage: "${dmgNote}"`:`✅ *${who}* returned *${sel.name}* — now available.`);
    close();showToast(damaged?"⚠️ Damage reported":"✓ Gear returned");
  };
  const handleMarkAvailable=async()=>{
    setGear(g=>g.map(x=>x.id===sel.id?{...x,damagedQty:0,checkedOutQty:0,status:"available",notes:""}:x));
    await postSlack(webhook,`✅ *${sel.name}* marked as available.`);
    close();showToast("✓ Marked as available");
  };
  const handleMarkDamaged=async(dmgNote)=>{
    setGear(g=>g.map(x=>x.id===sel.id?{...x,damagedQty:1,status:"damaged",notes:dmgNote}:x));
    await postSlack(webhook,`⚠️ *${sel.name}* marked as damaged.${dmgNote?` "${dmgNote}"`:""}`);
    close();showToast("⚠️ Marked as damaged");
  };
  const handleSaveItem=form=>{
    const{isKit,contents,...rest}=form;
    const item={...rest};
    if(isKit){item.type="kit";item.contents=(contents||[]).filter(c=>c.name?.trim());}
    if(modal==="add"){setGear(g=>[...g,{id:nextId(g),...item,status:"available",who:null,ret:null,checkedOutQty:0,damagedQty:0}]);showToast(`✓ ${form.name} added`);}
    else{setGear(g=>g.map(x=>x.id===sel.id?{...x,...item}:x));showToast("✓ Changes saved");}
    close();
  };
  const handleDelete=item=>{setGear(g=>g.filter(x=>x.id!==item.id));close();showToast(`${item.name} removed`)};
  const saveSettings=()=>{localStorage.setItem("gr_wh",webhook);localStorage.setItem("gr_ch",channel);close();showToast("Settings saved ✓")};
  const handleImportCSV=items=>{setImportItems(items);setModal("import");};
  const handleConfirmImport=()=>{
    setGear(g=>{let id=nextId(g);return[...g,...importItems.map(item=>({...item,id:id++,checkedOutQty:0,damagedQty:0}))];});
    showToast(`✓ ${importItems.length} item${importItems.length!==1?"s":""} imported`);
    close();
  };

  return(
    <div style={{minHeight:"100vh",background:"#F2F2F7",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif",WebkitFontSmoothing:"antialiased"}}>
      <div style={{background:"#fff",padding:"20px 20px 0",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 0 #E5E5EA"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,position:"relative"}}>
          <img src="/canva-logo.svg" alt="Canva" style={{height:20,width:"auto",flexShrink:0}} />
          <div style={{position:"absolute",left:"50%",transform:"translateX(-50%)",textAlign:"center",pointerEvents:"none"}}>
            <div style={{fontSize:17,fontWeight:700,color:"#1C1C1E",letterSpacing:"-0.3px",whiteSpace:"nowrap"}}>SYD Production Gear</div>
            <div style={{fontSize:11,color:"#8E8E93",marginTop:1}}>{time.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"})}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setModal("add")} style={{background:"#007AFF",border:"none",borderRadius:12,width:42,height:42,fontSize:24,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:200}}>+</button>
            <button onClick={()=>setModal("settings")} style={{background:"#F2F2F7",border:"none",borderRadius:12,width:42,height:42,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>⚙️</button>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:14}}>
          {[{n:stats.av,label:"Available",c:"#34C759"},{n:stats.out,label:"Out",c:"#FF9500"},{n:stats.iss,label:"Issues",c:"#FF3B30"}].map(s=>(
            <div key={s.label} style={{flex:1,background:"#F2F2F7",borderRadius:12,padding:"10px 12px",textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:700,color:s.c}}>{s.n}</div>
              <div style={{fontSize:11,color:"#8E8E93",fontWeight:500}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#F2F2F7",borderRadius:12,display:"flex",alignItems:"center",padding:"0 12px",marginBottom:14}}>
          <span style={{fontSize:15,color:"#8E8E93",marginRight:6}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search gear…" style={{flex:1,border:"none",background:"transparent",padding:"10px 0",fontSize:15,color:"#1C1C1E",outline:"none"}}/>
          {search&&<button onClick={()=>setSearch("")} style={{border:"none",background:"#C7C7CC",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>}
        </div>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:14,scrollbarWidth:"none"}}>
          {["All",...CATS].map(c=><button key={c} onClick={()=>setActiveCat(c)} style={{flexShrink:0,padding:"7px 14px",borderRadius:20,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:5,background:activeCat===c?"#007AFF":"#F2F2F7",color:activeCat===c?"#fff":"#8E8E93"}}>{c!=="All"&&<CatIcon cat={c} size={13}/>}{c}</button>)}
        </div>
      </div>

      <div style={{padding:"8px 16px 120px"}}>
        {filtered.length===0
          ?<div style={{textAlign:"center",padding:"60px 20px",color:"#8E8E93"}}><div style={{fontSize:32,marginBottom:12}}>📦</div><div style={{fontSize:16,fontWeight:600,marginBottom:6}}>No gear here yet</div><div style={{fontSize:14}}>Tap + to add equipment</div></div>
          :CATS.filter(cat=>filtered.some(i=>i.cat===cat)).map(cat=>{
            const items=filtered.filter(i=>i.cat===cat);
            const isCollapsed=!!collapsed[cat];
            const hasIssue=items.some(i=>getStatus(i)!=="available");
            return(
              <div key={cat}>
                <div onClick={()=>toggleCat(cat)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 2px 8px",cursor:"pointer",userSelect:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <CatIcon cat={cat} size={14} color="#8E8E93"/>
                    <span style={{fontSize:12,fontWeight:700,color:"#8E8E93",textTransform:"uppercase",letterSpacing:"0.5px"}}>{cat}</span>
                    <span style={{fontSize:11,fontWeight:600,color:"#fff",background:hasIssue?"#FF9500":"#8E8E93",borderRadius:10,padding:"1px 7px",minWidth:18,textAlign:"center"}}>{items.length}</span>
                  </div>
                  <span style={{fontSize:18,color:"#C7C7CC",transition:"transform 0.2s",display:"inline-block",transform:isCollapsed?"rotate(-90deg)":"rotate(0deg)"}}>⌄</span>
                </div>
                {!isCollapsed&&(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:12,padding:"0 0 16px"}}>
                    {items.map(item=><GearCard key={item.id} item={item} onClick={openCard} onLongPress={openEdit}/>)}
                  </div>
                )}
              </div>
            );
          })
        }
      </div>

      <button onClick={()=>setModal("add")} style={{position:"fixed",bottom:28,right:20,width:56,height:56,borderRadius:"50%",background:"#007AFF",border:"none",color:"#fff",fontSize:28,fontWeight:200,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,122,255,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:40}}>+</button>

      {modal==="kit"&&sel&&<KitSheet item={sel} gear={gear} setGear={setGear} webhook={webhook} onEdit={openEdit} onClose={close} showToast={showToast}/>}
      {modal==="multi"&&sel&&<MultiSheet item={sel} gear={gear} setGear={setGear} webhook={webhook} onEdit={openEdit} onClose={close} showToast={showToast}/>}
      {modal==="checkout"&&sel&&<CheckoutSheet item={sel} onCheckout={handleCheckout} onMarkDamaged={handleMarkDamaged} onEdit={openEdit} onClose={close}/>}
      {modal==="return"&&sel&&<ReturnSheet item={sel} onReturn={handleReturn} onEdit={openEdit} onClose={close}/>}
      {modal==="damaged"&&sel&&<DamagedSheet item={sel} onMarkAvailable={handleMarkAvailable} onEdit={openEdit} onClose={close}/>}
      {(modal==="edit"||modal==="add")&&<EditSheet item={sel} isNew={modal==="add"} onSave={handleSaveItem} onDelete={handleDelete} onClose={close}/>}
      {modal==="settings"&&<SettingsSheet webhook={webhook} setWebhook={setWebhook} channel={channel} setChannel={setChannel} onSave={saveSettings} onClose={close} onImportCSV={handleImportCSV}/>}
      {modal==="import"&&<ImportSheet items={importItems} onConfirm={handleConfirmImport} onClose={close}/>}

      {toast&&<Toast msg={toast} onDone={()=>setToast(null)}/>}
    </div>
  );
}
