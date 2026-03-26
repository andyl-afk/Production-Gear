import { useState, useEffect, useRef } from "react";

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
    {cid:1, name:"Canon R5C Body",     status:"available", who:null, ret:null},
    {cid:2, name:"24-70mm f/2.8 Lens", status:"available", who:null, ret:null},
    {cid:3, name:"50mm f/1.8 Lens",   status:"available", who:null, ret:null},
    {cid:4, name:"Smallrig Cage",      status:"available", who:null, ret:null},
    {cid:5, name:"Battery Grip",       status:"available", who:null, ret:null},
    {cid:6, name:"V-Mount Battery",    status:"available", who:null, ret:null},
  ]},
  { id:17, name:"Canon R5C Kit #2", type:"kit", qty:1, cat:"Camera", group:"Campaigns Team", status:"available", who:null, ret:null, notes:"", contents:[
    {cid:1, name:"Canon R5C Body",     status:"available", who:null, ret:null},
    {cid:2, name:"24-70mm f/2.8 Lens", status:"available", who:null, ret:null},
    {cid:3, name:"50mm f/1.8 Lens",   status:"available", who:null, ret:null},
    {cid:4, name:"Smallrig Cage",      status:"available", who:null, ret:null},
    {cid:5, name:"Battery Grip",       status:"available", who:null, ret:null},
    {cid:6, name:"V-Mount Battery",    status:"available", who:null, ret:null},
  ]},
];

const TEAM     = ["Alissa Prcevich","André Rodrigues","Andy Lloyd","Chloe Adam","Christian Love","Elliott Small","Jazel Antiporda","Jess Edwards","Jess Holmes","Lucille Figueroa","Lydia Proudlove","Matt Hodges","Michael Amoroso","Neill Pagdanganan","Nem Stankovic","Paige Cooper","Raphael Rigos"];
const GROUPS   = ["Shared Pool","Campaigns Team","Social Team","Growth","Production COE"];
const CATS     = ["Camera","Lenses","Lighting","Audio","Rigging","Support","Power","Accessories"];
const CAT_ICON = {Camera:"📹",Lenses:"🔭",Lighting:"💡",Audio:"🎤",Rigging:"🧰",Support:"💪🏼",Power:"🔋",Accessories:"🎬"};
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

function fmt(d){return d?new Date(d).toLocaleDateString("en-AU",{day:"numeric",month:"short"}):""}
function todayPlus(n){const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().split("T")[0]}
function nextId(g){return g.length?Math.max(...g.map(x=>x.id))+1:1}
async function postSlack(url,text){if(!url)return;try{await fetch(url,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})})}catch(_){}}

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
  const outCount=isKit?contents.filter(c=>c.status!=="available").length:0;
  const dispStatus=isKit?kitStat(item):item.status;
  return<div onClick={()=>onClick(item)} onMouseDown={start} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchEnd={end}
    style={{background:"#fff",borderRadius:18,padding:"18px 16px",boxShadow:"0 2px 12px rgba(0,0,0,0.07)",cursor:"pointer",border:dispStatus!=="available"?"1.5px solid #FFE0E0":"1.5px solid transparent",transform:pressed?"scale(0.96)":"scale(1)",transition:"transform 0.1s",display:"flex",flexDirection:"column",gap:10}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:24}}>{CAT_ICON[item.cat]||"📦"}</span>
        {isKit&&<span style={{fontSize:10,fontWeight:700,color:"#fff",background:"#007AFF",padding:"2px 7px",borderRadius:6,letterSpacing:0.3}}>KIT</span>}
      </div>
      <Badge status={dispStatus}/>
    </div>
    <div style={{flex:1}}>
      <div style={{fontSize:15,fontWeight:600,color:"#1C1C1E",lineHeight:1.3}}>{item.name}</div>
      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4,flexWrap:"wrap"}}>
        {isKit&&<span style={{fontSize:12,color:"#8E8E93"}}>{contents.length} items</span>}
        {!isKit&&item.qty>1&&<span style={{fontSize:12,fontWeight:600,color:"#007AFF",background:"#EAF2FF",borderRadius:6,padding:"2px 7px"}}>×{item.qty}</span>}
        <span style={{fontSize:12,color:"#8E8E93"}}>{item.group}</span>
      </div>
    </div>
    {isKit&&outCount>0&&<div style={{borderTop:"1px solid #F2F2F7",paddingTop:8,fontSize:12,color:"#FF9500",fontWeight:600}}>⚠ {outCount} of {contents.length} items out</div>}
    {!isKit&&item.status==="checkedout"&&item.who&&<div style={{borderTop:"1px solid #F2F2F7",paddingTop:10}}><div style={{fontSize:12,color:"#8E8E93"}}>With</div><div style={{fontSize:13,fontWeight:600,color:"#1C1C1E"}}>{item.who}</div>{item.ret&&<div style={{fontSize:12,color:"#FF9500",marginTop:2}}>↩ Back by {fmt(item.ret)}</div>}</div>}
    {!isKit&&item.status==="damaged"&&item.notes&&<div style={{fontSize:12,color:"#FF3B30",background:"#FFF5F5",borderRadius:8,padding:"6px 10px"}}>⚠️ {item.notes}</div>}
    <div style={{fontSize:11,color:"#C7C7CC",textAlign:"right",marginTop:-4}}>{isKit?"Tap to manage · Hold to edit":"Hold to edit"}</div>
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
      {contents.map((c,i)=>(
        <div key={c.cid} onClick={()=>{setPerson("");setRet(todayPlus(1));setSubModal({type:c.status==="available"?"checkout":"return",cid:c.cid})}}
          style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",cursor:"pointer",borderTop:i>0?"1px solid #F2F2F7":"none",background:c.status!=="available"?"#FFFAF5":"transparent"}}>
          <div>
            <div style={{fontSize:15,color:"#1C1C1E",fontWeight:500}}>{c.name}</div>
            {c.status==="checkedout"&&<div style={{fontSize:12,color:"#FF9500",marginTop:2}}>Out with {c.who} · Back {fmt(c.ret)}</div>}
          </div>
          <Badge status={c.status}/>
        </div>
      ))}
    </Section>
    {available.length>0&&<Btn label={available.length===contents.length?"Check Out Full Kit":`Check Out ${available.length} Available Items`} onClick={()=>{setPerson("");setRet(todayPlus(1));setSubModal({type:"checkout",cid:"all"})}} mt={16}/>}
    <GhostBtn label="Close" onClick={onClose}/>
  </Overlay>;
}

function EditSheet({item,isNew,onSave,onDelete,onClose}){
  const[f,setF]=useState(isNew
    ?{name:"",qty:1,cat:"Camera",group:"Shared Pool",notes:"",isKit:false,contents:[]}
    :{name:item.name,qty:item.qty||1,cat:item.cat,group:item.group,notes:item.notes||"",isKit:item.type==="kit",contents:item.contents||[]});
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
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
    <Section mt={16}><SLabel>Name</SLabel><div style={{padding:"0 16px 14px"}}><SInput value={f.name} onChange={e=>s("name",e.target.value)} placeholder="e.g. Sony FX6 or Canon R5C Kit"/></div></Section>
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
            <div key={i} style={{display:"flex",gap:8,padding:"4px 16px 4px",alignItems:"center"}}>
              <SInput value={c.name} onChange={e=>s("contents",f.contents.map((x,j)=>j===i?{...x,name:e.target.value}:x))} placeholder={`Item ${i+1}`}/>
              <button onClick={()=>s("contents",f.contents.filter((_,j)=>j!==i))} style={{border:"none",background:"none",fontSize:20,color:"#FF3B30",cursor:"pointer",flexShrink:0,paddingBottom:2}}>✕</button>
            </div>
          ))}
          <div style={{padding:"8px 16px 14px"}}>
            <button onClick={()=>s("contents",[...f.contents,{cid:Date.now(),name:"",status:"available",who:null,ret:null}])} style={{width:"100%",padding:"10px",borderRadius:10,border:"1.5px dashed #C7C7CC",background:"transparent",fontSize:14,color:"#007AFF",cursor:"pointer",fontWeight:600}}>+ Add Item</button>
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
        {CATS.map(c=><button key={c} onClick={()=>s("cat",c)} style={{padding:"8px 14px",borderRadius:10,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",background:f.cat===c?"#007AFF":"#F2F2F7",color:f.cat===c?"#fff":"#1C1C1E"}}>{CAT_ICON[c]} {c}</button>)}
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

function CheckoutSheet({item,onCheckout,onEdit,onClose}){
  const[person,setPerson]=useState("");
  const[ret,setRet]=useState(todayPlus(1));
  return<Overlay onClose={onClose}>
    <div style={{padding:"4px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div><div style={{fontSize:13,color:"#8E8E93",fontWeight:500}}>Checking out</div><div style={{fontSize:20,fontWeight:700,color:"#1C1C1E",marginTop:2}}>{item.name}</div>{item.qty>1&&<div style={{fontSize:13,color:"#007AFF",marginTop:2}}>×{item.qty} units available</div>}</div>
      <button onClick={()=>onEdit(item)} style={{background:"#F2F2F7",border:"none",borderRadius:10,padding:"6px 12px",fontSize:13,fontWeight:600,color:"#007AFF",cursor:"pointer",marginTop:4,flexShrink:0}}>Edit</button>
    </div>
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
    <Btn label="Check Out" onClick={()=>onCheckout(person,ret)} disabled={!person} mt={16}/>
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

function SettingsSheet({webhook,setWebhook,channel,setChannel,onSave,onClose}){
  return<Overlay onClose={onClose}>
    <div style={{padding:"4px 16px 12px"}}><div style={{fontSize:20,fontWeight:700,color:"#1C1C1E"}}>Settings</div></div>
    <Section><SLabel>Slack Webhook URL</SLabel><div style={{padding:"0 16px 8px"}}><SInput value={webhook} onChange={e=>setWebhook(e.target.value)} placeholder="https://hooks.slack.com/services/…"/><div style={{fontSize:12,color:"#8E8E93",marginTop:6}}>Checkout, return, and damage events post to Slack automatically.</div></div></Section>
    <Section><SLabel>Channel (display only)</SLabel><div style={{padding:"0 16px 14px"}}><SInput value={channel} onChange={e=>setChannel(e.target.value)} placeholder="#cameranauts"/></div></Section>
    <Btn label="Save Settings" onClick={onSave} mt={16}/>
    <GhostBtn label="Cancel" onClick={onClose}/>
  </Overlay>
}

export default function GearRoom(){
  const[gear,setGear]=useState(()=>{try{const s=localStorage.getItem("gr2");return s?JSON.parse(s):INITIAL_GEAR}catch{return INITIAL_GEAR}});
  const[webhook,setWebhook]=useState(()=>localStorage.getItem("gr_wh")||"");
  const[channel,setChannel]=useState(()=>localStorage.getItem("gr_ch")||"#cameranauts");
  const[activeCat,setActiveCat]=useState("All");
  const[search,setSearch]=useState("");
  const[modal,setModal]=useState(null);
  const[sel,setSel]=useState(null);
  const[toast,setToast]=useState(null);
  const[time,setTime]=useState(new Date());

  useEffect(()=>{localStorage.setItem("gr2",JSON.stringify(gear))},[gear]);
  useEffect(()=>{const t=setInterval(()=>setTime(new Date()),30000);return()=>clearInterval(t)},[]);

  const close=()=>{setModal(null);setSel(null)};
  const showToast=m=>setToast(m);

  const filtered=gear.filter(g=>(activeCat==="All"||g.cat===activeCat)&&(!search||g.name.toLowerCase().includes(search.toLowerCase())));
  const stats={
    av:gear.filter(g=>g.type==="kit"?(g.contents||[]).every(c=>c.status==="available"):g.status==="available").length,
    out:gear.filter(g=>g.type==="kit"?(g.contents||[]).some(c=>c.status!=="available"):g.status==="checkedout").length,
    iss:gear.filter(g=>g.status==="damaged").length
  };

  const openCard=item=>{
    setSel(item);
    if(item.type==="kit"){setModal("kit");return;}
    setModal(item.status==="available"?"checkout":item.status==="checkedout"?"return":"damaged");
  };
  const openEdit=item=>{setSel(item);setModal("edit")};

  const handleCheckout=async(person,ret)=>{
    setGear(g=>g.map(x=>x.id===sel.id?{...x,status:"checkedout",who:person,ret}:x));
    await postSlack(webhook,`📦 *${person}* checked out *${sel.name}* (${sel.group}). Back by ${fmt(ret)}.`);
    close();showToast(`✓ ${sel.name} checked out`);
  };
  const handleReturn=async(damaged,dmgNote)=>{
    const who=sel.who;
    setGear(g=>g.map(x=>x.id===sel.id?{...x,status:damaged?"damaged":"available",who:null,ret:null,notes:damaged?dmgNote:x.notes}:x));
    await postSlack(webhook,damaged?`⚠️ *${who}* returned *${sel.name}* with damage: "${dmgNote}"`:`✅ *${who}* returned *${sel.name}* — now available.`);
    close();showToast(damaged?"⚠️ Damage reported":"✓ Gear returned");
  };
  const handleMarkAvailable=async()=>{
    setGear(g=>g.map(x=>x.id===sel.id?{...x,status:"available",notes:""}:x));
    await postSlack(webhook,`✅ *${sel.name}* marked as available.`);
    close();showToast("✓ Marked as available");
  };
  const handleSaveItem=form=>{
    const{isKit,contents,...rest}=form;
    const item={...rest};
    if(isKit){item.type="kit";item.contents=(contents||[]).filter(c=>c.name?.trim());}
    if(modal==="add"){setGear(g=>[...g,{id:nextId(g),...item,status:"available",who:null,ret:null}]);showToast(`✓ ${form.name} added`);}
    else{setGear(g=>g.map(x=>x.id===sel.id?{...x,...item}:x));showToast("✓ Changes saved");}
    close();
  };
  const handleDelete=item=>{setGear(g=>g.filter(x=>x.id!==item.id));close();showToast(`${item.name} removed`)};
  const saveSettings=()=>{localStorage.setItem("gr_wh",webhook);localStorage.setItem("gr_ch",channel);close();showToast("Settings saved ✓")};

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
          {["All",...CATS].map(c=><button key={c} onClick={()=>setActiveCat(c)} style={{flexShrink:0,padding:"7px 14px",borderRadius:20,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",background:activeCat===c?"#007AFF":"#F2F2F7",color:activeCat===c?"#fff":"#8E8E93"}}>{c==="All"?c:(CAT_ICON[c]||"")+" "+c}</button>)}
        </div>
      </div>

      <div style={{padding:"8px 16px 120px"}}>
        {filtered.length===0
          ?<div style={{textAlign:"center",padding:"60px 20px",color:"#8E8E93"}}><div style={{fontSize:32,marginBottom:12}}>📦</div><div style={{fontSize:16,fontWeight:600,marginBottom:6}}>No gear here yet</div><div style={{fontSize:14}}>Tap + to add equipment</div></div>
          :CATS.filter(cat=>filtered.some(i=>i.cat===cat)).map(cat=>(
            <div key={cat}>
              <SLabel>{(CAT_ICON[cat]||"📦")+" "+cat}</SLabel>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:12,padding:"4px 0 16px"}}>
                {filtered.filter(i=>i.cat===cat).map(item=><GearCard key={item.id} item={item} onClick={openCard} onLongPress={openEdit}/>)}
              </div>
            </div>
          ))
        }
      </div>

      <button onClick={()=>setModal("add")} style={{position:"fixed",bottom:28,right:20,width:56,height:56,borderRadius:"50%",background:"#007AFF",border:"none",color:"#fff",fontSize:28,fontWeight:200,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,122,255,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:40}}>+</button>

      {modal==="kit"&&sel&&<KitSheet item={sel} gear={gear} setGear={setGear} webhook={webhook} onEdit={openEdit} onClose={close} showToast={showToast}/>}
      {modal==="checkout"&&sel&&<CheckoutSheet item={sel} onCheckout={handleCheckout} onEdit={openEdit} onClose={close}/>}
      {modal==="return"&&sel&&<ReturnSheet item={sel} onReturn={handleReturn} onEdit={openEdit} onClose={close}/>}
      {modal==="damaged"&&sel&&<DamagedSheet item={sel} onMarkAvailable={handleMarkAvailable} onEdit={openEdit} onClose={close}/>}
      {(modal==="edit"||modal==="add")&&<EditSheet item={sel} isNew={modal==="add"} onSave={handleSaveItem} onDelete={handleDelete} onClose={close}/>}
      {modal==="settings"&&<SettingsSheet webhook={webhook} setWebhook={setWebhook} channel={channel} setChannel={setChannel} onSave={saveSettings} onClose={close}/>}

      {toast&&<Toast msg={toast} onDone={()=>setToast(null)}/>}
    </div>
  );
}
