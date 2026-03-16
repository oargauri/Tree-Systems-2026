import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "d3";

// ─────────────────────────────────────────────
//  RAW DATA (parsed from CSV)
// ─────────────────────────────────────────────
const PEOPLE_RAW = [
  // Gen 1 – Great Great Grandparents
  { id:"Kopa I",      place:"Pride Lands",         birth:1880, death:1940, p1:null,     p2:null,      gen:1, role:"Great-Great Grandparent" },
  { id:"Eshe",        place:"Pride Lands",         birth:1885, death:1950, p1:null,     p2:null,      gen:1, role:"Great-Great Grandparent" },
  { id:"Chumvi",      place:"Pride Lands",         birth:1882, death:1945, p1:null,     p2:null,      gen:1, role:"Great-Great Grandparent" },
  { id:"Kula",        place:"Pride Lands",         birth:1886, death:1955, p1:null,     p2:null,      gen:1, role:"Great-Great Grandparent" },
  // Gen 2 – Great Grandparents
  { id:"Mohatu",      place:"Pride Lands",         birth:1915, death:1975, p1:"Kopa I", p2:"Eshe",    gen:2, role:"Great Grandparent" },
  { id:"Afua",        place:"Pride Lands",         birth:1918, death:1980, p1:"Chumvi", p2:"Kula",    gen:2, role:"Great Grandparent" },
  { id:"Jabari",      place:"Pride Lands",         birth:1920, death:1985, p1:null,     p2:null,      gen:2, role:"Great Grandparent" },
  { id:"Zola",        place:"Pride Lands",         birth:1925, death:1990, p1:null,     p2:null,      gen:2, role:"Great Grandparent" },
  { id:"Akili",       place:"Pride Lands",         birth:1928, death:1995, p1:null,     p2:null,      gen:2, role:"Great Grandparent" },
  { id:"Safiya",      place:"Pride Lands",         birth:1930, death:1998, p1:null,     p2:null,      gen:2, role:"Great Grandparent" },
  // Gen 3 – Grandparents
  { id:"Ahadi",       place:"Pride Lands",         birth:1945, death:2005, p1:"Mohatu", p2:"Afua",    gen:3, role:"Grandparent" },
  { id:"Uru",         place:"Pride Lands",         birth:1948, death:2008, p1:"Jabari", p2:"Zola",    gen:3, role:"Grandparent" },
  { id:"Obasi",       place:"Pride Lands",         birth:1950, death:2010, p1:"Akili",  p2:"Safiya",  gen:3, role:"Grandparent" },
  { id:"Eshe II",     place:"Pride Lands",         birth:1953, death:2015, p1:null,     p2:null,      gen:3, role:"Grandparent" },
  { id:"Kiongozi",    place:"Pride Lands",         birth:1952, death:2010, p1:null,     p2:null,      gen:3, role:"Grandparent" },
  { id:"Imara",       place:"Pride Lands",         birth:1956, death:2012, p1:null,     p2:null,      gen:3, role:"Grandparent" },
  { id:"Moyo",        place:"Pride Lands",         birth:1957, death:2018, p1:null,     p2:null,      gen:3, role:"Grandparent" },
  // Gen 4 – Parents
  { id:"Mufasa",      place:"Pride Lands",         birth:1965, death:1994, p1:"Ahadi",  p2:"Uru",     gen:4, role:"Parent" },
  { id:"Scar (Taka)", place:"Pride Lands",         birth:1968, death:1994, p1:"Ahadi",  p2:"Uru",     gen:4, role:"Parent" },
  { id:"Sarabi",      place:"Pride Lands",         birth:1967, death:null, p1:"Obasi",  p2:"Eshe II", gen:4, role:"Parent" },
  { id:"Sarafina",    place:"Pride Lands",         birth:1968, death:null, p1:"Kiongozi",p2:"Imara",  gen:4, role:"Parent" },
  { id:"Zira",        place:"Outlands",            birth:1975, death:2004, p1:"Moyo",   p2:null,      gen:4, role:"Parent" },
  { id:"Chumvi II",   place:"Pride Lands",         birth:1972, death:null, p1:"Moyo",   p2:null,      gen:4, role:"Parent" },
  { id:"Kula II",     place:"Pride Lands",         birth:1974, death:null, p1:"Moyo",   p2:null,      gen:4, role:"Parent" },
  { id:"Tamaa",       place:"Pride Lands",         birth:1976, death:null, p1:null,     p2:null,      gen:4, role:"Parent" },
  { id:"Nuru",        place:"Pride Lands",         birth:1978, death:null, p1:null,     p2:null,      gen:4, role:"Parent" },
  { id:"Azra",        place:"Pride Lands",         birth:1979, death:null, p1:null,     p2:null,      gen:4, role:"Parent" },
  // Gen 5 – Children
  { id:"Simba",       place:"Pride Lands",         birth:1985, death:null, p1:"Mufasa", p2:"Sarabi",  gen:5, role:"Child" },
  { id:"Nala",        place:"Pride Lands",         birth:1986, death:null, p1:null,     p2:"Sarafina",gen:5, role:"Child" },
  { id:"Nuka",        place:"Outlands",            birth:1995, death:2004, p1:null,     p2:"Zira",    gen:5, role:"Child" },
  { id:"Vitani",      place:"Outlands",            birth:1998, death:null, p1:null,     p2:"Zira",    gen:5, role:"Child" },
  { id:"Kovu",        place:"Outlands/Pride Lands",birth:2000, death:null, p1:null,     p2:"Zira",    gen:5, role:"Child" },
  { id:"Kiara",       place:"Pride Lands",         birth:2005, death:null, p1:"Simba",  p2:"Nala",    gen:5, role:"Child" },
  { id:"Kion",        place:"Pride Lands",         birth:2007, death:null, p1:"Simba",  p2:"Nala",    gen:5, role:"Child" },
  { id:"Rani",        place:"Tree of Life",        birth:2007, death:null, p1:"Surak",  p2:"Nirmala", gen:5, role:"Child" },
  { id:"Baliyo",      place:"Tree of Life",        birth:2006, death:null, p1:"Surak",  p2:"Nirmala", gen:5, role:"Child" },
  { id:"Surak",       place:"Tree of Life",        birth:1980, death:null, p1:null,     p2:null,      gen:5, role:"Child" },
  { id:"Nirmala",     place:"Tree of Life",        birth:1982, death:null, p1:null,     p2:null,      gen:5, role:"Child" },
  { id:"Jasiri",      place:"Outlands",            birth:2003, death:null, p1:null,     p2:null,      gen:5, role:"Child" },
  { id:"Janja",       place:"Outlands",            birth:2002, death:null, p1:null,     p2:null,      gen:5, role:"Child" },
  { id:"Cheezi",      place:"Outlands",            birth:2003, death:null, p1:null,     p2:null,      gen:5, role:"Child" },
  { id:"Chungu",      place:"Outlands",            birth:2003, death:null, p1:null,     p2:null,      gen:5, role:"Child" },
  { id:"Bunga",       place:"Pride Lands",         birth:2007, death:null, p1:null,     p2:null,      gen:5, role:"Child" },
  { id:"Ono",         place:"Pride Lands",         birth:2007, death:null, p1:null,     p2:null,      gen:5, role:"Child" },
  { id:"Fuli",        place:"Pride Lands",         birth:2006, death:null, p1:null,     p2:null,      gen:5, role:"Child" },
  { id:"Beshte",      place:"Pride Lands",         birth:2006, death:null, p1:null,     p2:null,      gen:5, role:"Child" },
  { id:"Anga",        place:"Pride Lands",         birth:2006, death:null, p1:null,     p2:null,      gen:5, role:"Child" },
];

// ─────────────────────────────────────────────
//  RELATIONSHIPS + LOOKUP
// ─────────────────────────────────────────────
function buildGraph(people) {
  const byId = {};
  people.forEach(p => (byId[p.id] = p));
  const rel = {};
  people.forEach(p => {
    const parents  = [p.p1, p.p2].filter(x => x && byId[x]);
    const children = people.filter(c => c.p1 === p.id || c.p2 === p.id).map(c => c.id);
    const siblings = [...new Set(
      people
        .filter(s => s.id !== p.id && parents.some(par => s.p1 === par || s.p2 === par))
        .map(s => s.id)
    )];
    rel[p.id] = { parents, children, siblings };
  });
  return { byId, rel };
}

// ─────────────────────────────────────────────
//  THEME COLORS per generation
// ─────────────────────────────────────────────
const GEN_COLORS = {
  1: "#c0783c",  // terracotta
  2: "#d4943c",  // amber
  3: "#b8820a",  // gold
  4: "#8b5e2a",  // warm brown
  5: "#3d7a5c",  // savanna green
};
const GEN_LABELS = {
  1: "Great-Great Grandparents",
  2: "Great Grandparents",
  3: "Grandparents",
  4: "Parents",
  5: "Children",
};

function avatarUrl(name) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}&backgroundColor=b45309,d97706,92400e&backgroundType=gradientLinear`;
}

// ─────────────────────────────────────────────
//  PROFILE PANEL
// ─────────────────────────────────────────────
function ProfilePanel({ personId, byId, rel, onClose, onSelect }) {
  const p = byId[personId];
  if (!p) return null;
  const r = rel[p.id] || { parents: [], children: [], siblings: [] };
  const isLiving = !p.death;

  return (
    <div
      style={{
        position:"fixed", top:0, right:0, height:"100%", width:340,
        background:"linear-gradient(160deg,#1c100a 0%,#2d1a0a 100%)",
        borderLeft:"1px solid rgba(196,131,60,0.3)",
        boxShadow:"-8px 0 40px rgba(0,0,0,0.6)",
        zIndex:1000, overflowY:"auto",
        fontFamily:"'Crimson Text', Georgia, serif",
        display:"flex", flexDirection:"column",
        animation:"slideIn 0.3s cubic-bezier(0.22,1,0.36,1)"
      }}
    >
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }
        .chip:hover { opacity:0.8; cursor:pointer; }
      `}</style>

      {/* Header */}
      <div style={{ position:"relative", background:"rgba(0,0,0,0.3)", padding:"20px 20px 0" }}>
        <button onClick={onClose}
          style={{ position:"absolute",top:12,right:12, background:"rgba(255,255,255,0.1)",
            border:"none", color:"#f4c875", fontSize:18, width:32, height:32, borderRadius:"50%",
            cursor:"pointer", display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>

        <div style={{ display:"flex", alignItems:"flex-end", gap:14, paddingBottom:16 }}>
          <img src={avatarUrl(p.id)}
            style={{ width:80, height:80, borderRadius:"50%",
              border:`3px solid ${GEN_COLORS[p.gen]}`,
              boxShadow:`0 0 20px ${GEN_COLORS[p.gen]}55` }}
            onError={e => { e.target.style.background="#5a3010"; e.target.src=""; }}
          />
          <div>
            <div style={{ color:GEN_COLORS[p.gen], fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:2 }}>
              Generation {p.gen}
            </div>
            <div style={{ color:"#fdf0d5", fontSize:22, fontWeight:700, lineHeight:1.1 }}>{p.id}</div>
            <div style={{ color:"#a07840", fontSize:13, marginTop:3 }}>{p.role}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:16 }}>
        {/* Vital stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            { label:"Born", value: p.birth },
            { label:"Died", value: p.death ? p.death : isLiving ? "Living" : "Unknown" },
            { label:"Location", value: p.place, span:2 },
          ].map(({ label, value, span }) => (
            <div key={label} style={{
              background:"rgba(255,255,255,0.04)", borderRadius:8,
              padding:"10px 12px", gridColumn: span ? `span ${span}` : undefined,
              border:"1px solid rgba(196,131,60,0.15)"
            }}>
              <div style={{ color:"#8a6030", fontSize:10, textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>{label}</div>
              <div style={{ color:"#fdf0d5", fontSize:15 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Lifespan bar */}
        {p.birth && (
          <div>
            <div style={{ color:"#8a6030", fontSize:10, textTransform:"uppercase", letterSpacing:1.5, marginBottom:6 }}>Lifespan</div>
            <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:4, height:6, overflow:"hidden" }}>
              <div style={{
                height:"100%", borderRadius:4,
                background:`linear-gradient(90deg,${GEN_COLORS[p.gen]},${GEN_COLORS[p.gen]}88)`,
                width:`${Math.min(100, ((( p.death || 2026) - p.birth) / 150) * 100)}%`
              }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", color:"#6a4820", fontSize:11, marginTop:3 }}>
              <span>{p.birth}</span>
              <span>{p.death ? `${p.death - p.birth} years` : `${2026 - p.birth}+ years`}</span>
              <span>{p.death || "Present"}</span>
            </div>
          </div>
        )}

        {/* Parents */}
        {r.parents.length > 0 && (
          <RelGroup label="Parents" ids={r.parents} byId={byId} onSelect={onSelect} />
        )}
        {/* Children */}
        {r.children.length > 0 && (
          <RelGroup label="Children" ids={r.children} byId={byId} onSelect={onSelect} />
        )}
        {/* Siblings */}
        {r.siblings.length > 0 && (
          <RelGroup label="Siblings" ids={r.siblings} byId={byId} onSelect={onSelect} />
        )}
      </div>
    </div>
  );
}

function RelGroup({ label, ids, byId, onSelect }) {
  return (
    <div>
      <div style={{ color:"#8a6030", fontSize:10, textTransform:"uppercase", letterSpacing:1.5, marginBottom:8 }}>
        {label} <span style={{ color:"#5a3010" }}>({ids.length})</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {ids.map(id => {
          const person = byId[id];
          if (!person) return null;
          return (
            <button key={id} className="chip" onClick={() => onSelect(id)}
              style={{
                display:"flex", alignItems:"center", gap:10,
                background:"rgba(255,255,255,0.04)",
                border:`1px solid rgba(196,131,60,0.2)`,
                borderRadius:8, padding:"8px 10px", cursor:"pointer",
                color:"#fdf0d5", textAlign:"left", transition:"all 0.15s"
              }}>
              <img src={avatarUrl(id)}
                style={{ width:32, height:32, borderRadius:"50%", border:`2px solid ${GEN_COLORS[person.gen]}` }}
                onError={e => { e.target.style.display="none"; }} />
              <div>
                <div style={{ fontSize:14, fontWeight:600 }}>{id}</div>
                <div style={{ fontSize:11, color:"#a07840" }}>{person.birth}{person.death ? ` – ${person.death}` : ""}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  TABLE VIEW
// ─────────────────────────────────────────────
function TableView({ people, selectedId, onSelect, rel }) {
  const [search, setSearch] = useState("");
  const [genFilter, setGenFilter] = useState(0);
  const [sortKey, setSortKey] = useState("birth");
  const [sortDir, setSortDir] = useState(1);

  const filtered = useMemo(() => {
    let list = people;
    if (genFilter) list = list.filter(p => p.gen === genFilter);
    if (search) list = list.filter(p =>
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.place.toLowerCase().includes(search.toLowerCase())
    );
    list = [...list].sort((a, b) => {
      const av = a[sortKey] ?? (sortKey === "death" ? 9999 : 0);
      const bv = b[sortKey] ?? (sortKey === "death" ? 9999 : 0);
      if (typeof av === "string") return sortDir * av.localeCompare(bv);
      return sortDir * (av - bv);
    });
    return list;
  }, [people, search, genFilter, sortKey, sortDir]);

  const toggleSort = key => {
    if (sortKey === key) setSortDir(d => -d);
    else { setSortKey(key); setSortDir(1); }
  };

  const cols = [
    { key:"id",    label:"Name" },
    { key:"gen",   label:"Generation" },
    { key:"place", label:"Location" },
    { key:"birth", label:"Born" },
    { key:"death", label:"Died" },
  ];

  return (
    <div style={{ padding:"20px 24px", fontFamily:"'Crimson Text', Georgia, serif" }}>
      {/* Controls */}
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#8a6030", fontSize:14 }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or location…"
            style={{
              width:"100%", padding:"9px 12px 9px 32px",
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(196,131,60,0.25)",
              borderRadius:8, color:"#fdf0d5", fontSize:14, outline:"none",
              fontFamily:"'Crimson Text', Georgia, serif",
              boxSizing:"border-box"
            }} />
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {[0,1,2,3,4,5].map(g => (
            <button key={g} onClick={() => setGenFilter(g)}
              style={{
                padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer",
                fontSize:12, fontWeight:600, letterSpacing:0.5,
                background: genFilter === g ? (g ? GEN_COLORS[g] : "#f4c875") : "rgba(255,255,255,0.07)",
                color: genFilter === g ? "#1a0f00" : "#a07840",
                transition:"all 0.15s"
              }}>
              {g === 0 ? "All" : `Gen ${g}`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid rgba(196,131,60,0.2)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"rgba(0,0,0,0.4)" }}>
              {cols.map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)}
                  style={{
                    padding:"12px 16px", textAlign:"left", cursor:"pointer",
                    color:"#c48c3c", fontSize:11, textTransform:"uppercase", letterSpacing:1.5,
                    fontWeight:700, userSelect:"none", whiteSpace:"nowrap",
                    borderBottom:"1px solid rgba(196,131,60,0.2)"
                  }}>
                  {col.label}
                  {sortKey === col.key && <span style={{ marginLeft:4 }}>{sortDir > 0 ? "↑" : "↓"}</span>}
                </th>
              ))}
              <th style={{ padding:"12px 16px", color:"#c48c3c", fontSize:11, textTransform:"uppercase", letterSpacing:1.5, borderBottom:"1px solid rgba(196,131,60,0.2)" }}>
                Family
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const r = rel[p.id] || {};
              const isSelected = selectedId === p.id;
              return (
                <tr key={p.id} onClick={() => onSelect(p.id)}
                  style={{
                    cursor:"pointer",
                    background: isSelected
                      ? `${GEN_COLORS[p.gen]}22`
                      : i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                    borderLeft: isSelected ? `3px solid ${GEN_COLORS[p.gen]}` : "3px solid transparent",
                    transition:"background 0.15s"
                  }}>
                  <td style={{ padding:"10px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <img src={avatarUrl(p.id)}
                        style={{ width:32, height:32, borderRadius:"50%", border:`2px solid ${GEN_COLORS[p.gen]}` }}
                        onError={e => { e.target.style.display="none"; }} />
                      <span style={{ color:"#fdf0d5", fontSize:15, fontWeight:600 }}>{p.id}</span>
                    </div>
                  </td>
                  <td style={{ padding:"10px 16px" }}>
                    <span style={{
                      background:`${GEN_COLORS[p.gen]}22`, color:GEN_COLORS[p.gen],
                      padding:"2px 10px", borderRadius:20, fontSize:12, fontWeight:600
                    }}>
                      Gen {p.gen}
                    </span>
                  </td>
                  <td style={{ padding:"10px 16px", color:"#a07840", fontSize:14 }}>{p.place}</td>
                  <td style={{ padding:"10px 16px", color:"#fdf0d5", fontSize:14 }}>{p.birth}</td>
                  <td style={{ padding:"10px 16px", color: p.death ? "#c47060" : "#5da87c", fontSize:14 }}>
                    {p.death || <span style={{ fontSize:12 }}>Living</span>}
                  </td>
                  <td style={{ padding:"10px 16px" }}>
                    <div style={{ display:"flex", gap:6, color:"#8a6030", fontSize:12 }}>
                      {(r.parents||[]).length > 0 && <span title={`Parents: ${r.parents.join(", ")}`}>👥 {r.parents.length}p</span>}
                      {(r.children||[]).length > 0 && <span title={`Children: ${r.children.join(", ")}`}>🌱 {r.children.length}c</span>}
                      {(r.siblings||[]).length > 0 && <span title={`Siblings: ${r.siblings.join(", ")}`}>↔ {r.siblings.length}s</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px", color:"#8a6030", fontStyle:"italic" }}>
            No family members found
          </div>
        )}
      </div>
      <div style={{ marginTop:12, color:"#6a4820", fontSize:13, textAlign:"right" }}>
        {filtered.length} of {people.length} members
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  TREE VIEW
// ─────────────────────────────────────────────
function TreeView({ people, byId, rel, selectedId, onSelect }) {
  const svgRef = useRef(null);
  const gRef   = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg    = d3.select(svgRef.current);
    const W      = svgRef.current.clientWidth  || 1000;
    const H      = svgRef.current.clientHeight || 700;

    // Build stratify data – virtual root for orphan nodes
    const VIRTUAL = "__ROOT__";
    const items = people.map(p => ({
      id:       p.id,
      parentId: (p.p1 && byId[p.p1]) ? p.p1
              : (p.p2 && byId[p.p2]) ? p.p2
              : VIRTUAL
    }));
    items.push({ id: VIRTUAL, parentId: null });

    let root;
    try {
      root = d3.stratify().id(d => d.id).parentId(d => d.parentId)(items);
    } catch(e) {
      console.error("stratify error", e);
      return;
    }

    // Horizontal tree layout
    const treeLayout = d3.tree()
      .nodeSize([56, 220])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.4));
    treeLayout(root);

    // Remove virtual root offset
    const vRoot = root.descendants().find(d => d.id === VIRTUAL);
    if (vRoot) {
      const offsetY = vRoot.x;
      root.each(d => { d.x -= offsetY; });
    }

    // Clear and rebuild
    svg.selectAll("*").remove();

    // Zoom
    const zoom = d3.zoom()
      .scaleExtent([0.15, 3])
      .on("zoom", e => d3.select(gRef.current).attr("transform", e.transform));
    svg.call(zoom);

    const g = svg.append("g").attr("class","tree-root")
      .attr("transform", `translate(120,${H/2})`);
    gRef.current = g.node();

    const nodes = root.descendants().filter(d => d.id !== VIRTUAL);
    const links = root.links().filter(l => l.source.id !== VIRTUAL);

    // Links
    g.append("g").attr("class","links")
      .selectAll("path").data(links).join("path")
      .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x))
      .attr("fill","none")
      .attr("stroke","rgba(196,131,60,0.3)")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", d => d.source.id === VIRTUAL ? "4,4" : null);

    // Node groups
    const nodeG = g.append("g").attr("class","nodes")
      .selectAll("g").data(nodes).join("g")
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .attr("cursor","pointer")
      .on("click", (e, d) => { e.stopPropagation(); onSelect(d.id); })
      .on("mouseenter", (e, d) => {
        d3.select(e.currentTarget).select("circle.main-circle")
          .transition().duration(150).attr("r", 22);
        setTooltip({ id: d.id, x: e.clientX, y: e.clientY });
      })
      .on("mousemove", (e) => setTooltip(t => t ? {...t, x: e.clientX, y: e.clientY} : null))
      .on("mouseleave", (e, d) => {
        d3.select(e.currentTarget).select("circle.main-circle")
          .transition().duration(150).attr("r", d.id === selectedId ? 22 : 18);
        setTooltip(null);
      });

    // Glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id","glow");
    filter.append("feGaussianBlur").attr("stdDeviation","3").attr("result","blur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in","blur");
    feMerge.append("feMergeNode").attr("in","SourceGraphic");

    // Outer ring (selection indicator)
    nodeG.append("circle")
      .attr("r", 26)
      .attr("fill","none")
      .attr("stroke", d => d.id === selectedId ? GEN_COLORS[byId[d.id]?.gen] : "transparent")
      .attr("stroke-width", 2)
      .attr("opacity", 0.6)
      .attr("class","selection-ring");

    // Main circle
    nodeG.append("circle")
      .attr("class","main-circle")
      .attr("r", d => d.id === selectedId ? 22 : 18)
      .attr("fill", d => {
        const gen = byId[d.id]?.gen || 1;
        return d.id === selectedId ? GEN_COLORS[gen] : `${GEN_COLORS[gen]}cc`;
      })
      .attr("stroke", d => GEN_COLORS[byId[d.id]?.gen || 1])
      .attr("stroke-width", 2)
      .attr("filter", d => d.id === selectedId ? "url(#glow)" : null);

    // Clip paths for avatar images
    nodes.forEach((d, i) => {
      const clipId = `clip-${i}`;
      defs.append("clipPath").attr("id", clipId)
        .append("circle").attr("r", 16).attr("cx", 0).attr("cy", 0);

      d3.select(nodeG.nodes()[i]).append("image")
        .attr("href", avatarUrl(d.id))
        .attr("x", -16).attr("y", -16)
        .attr("width", 32).attr("height", 32)
        .attr("clip-path", `url(#${clipId})`)
        .attr("opacity", 0.9);
    });

    // Name label
    nodeG.append("text")
      .attr("x", 26)
      .attr("y", 4)
      .attr("font-size", 11)
      .attr("font-family", "'Crimson Text', Georgia, serif")
      .attr("font-weight", "600")
      .attr("fill", "#fdf0d5")
      .attr("text-anchor","start")
      .text(d => d.id.length > 14 ? d.id.slice(0,12)+"…" : d.id);

    // Birth-death label
    nodeG.append("text")
      .attr("x", 26).attr("y", 16)
      .attr("font-size", 9)
      .attr("font-family","monospace")
      .attr("fill","#8a6030")
      .text(d => {
        const person = byId[d.id];
        if (!person) return "";
        return `${person.birth}${person.death ? "–"+person.death : "–"}`;
      });

    // Auto-fit on first render
    const bounds = g.node().getBBox();
    const scale  = Math.min(W / (bounds.width + 160), H / (bounds.height + 80), 0.9);
    const tx     = (W - bounds.width  * scale) / 2 - bounds.x * scale;
    const ty     = (H - bounds.height * scale) / 2 - bounds.y * scale;
    svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));

  }, [people, selectedId]);  // eslint-disable-line

  return (
    <div style={{ position:"relative", width:"100%", height:"100%" }}>
      <svg ref={svgRef} style={{ width:"100%", height:"100%", display:"block" }}
        onClick={() => onSelect(null)} />

      {/* Legend */}
      <div style={{
        position:"absolute", bottom:16, left:16,
        background:"rgba(20,10,4,0.85)", borderRadius:10, padding:"10px 14px",
        border:"1px solid rgba(196,131,60,0.2)",
        fontFamily:"'Crimson Text',Georgia,serif"
      }}>
        {[1,2,3,4,5].map(g => (
          <div key={g} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <div style={{ width:12, height:12, borderRadius:"50%", background:GEN_COLORS[g] }} />
            <span style={{ color:"#a07840", fontSize:11 }}>Gen {g} · {GEN_LABELS[g]}</span>
          </div>
        ))}
      </div>

      {/* Controls hint */}
      <div style={{
        position:"absolute", top:16, left:16,
        background:"rgba(20,10,4,0.75)", borderRadius:8, padding:"6px 12px",
        color:"#6a4820", fontSize:11,
        fontFamily:"'Crimson Text',Georgia,serif",
        border:"1px solid rgba(196,131,60,0.15)"
      }}>
        Scroll to zoom · Drag to pan · Click node for profile
      </div>

      {/* Tooltip */}
      {tooltip && byId[tooltip.id] && (
        <div style={{
          position:"fixed", left:tooltip.x + 14, top:tooltip.y - 10,
          background:"rgba(20,10,4,0.95)", borderRadius:8, padding:"8px 12px",
          border:`1px solid ${GEN_COLORS[byId[tooltip.id].gen]}55`,
          pointerEvents:"none", zIndex:999,
          fontFamily:"'Crimson Text',Georgia,serif"
        }}>
          <div style={{ color:"#fdf0d5", fontWeight:700, fontSize:14 }}>{tooltip.id}</div>
          <div style={{ color:"#a07840", fontSize:12 }}>{byId[tooltip.id].place}</div>
          <div style={{ color:"#6a4820", fontSize:11 }}>
            {byId[tooltip.id].birth} {byId[tooltip.id].death ? `– ${byId[tooltip.id].death}` : "– Present"}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  TIMELINE VIEW
// ─────────────────────────────────────────────
function TimelineView({ people, byId, rel, selectedId, onSelect }) {
  const containerRef = useRef(null);
  const svgRef       = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const W = container.clientWidth || 900;

    const sorted  = [...people].sort((a,b) => a.birth - b.birth);
    const ROW_H   = 38;
    const LABEL_W = 140;
    const PAD_T   = 50;
    const PAD_B   = 40;
    const H       = PAD_T + sorted.length * ROW_H + PAD_B;

    const minYear = 1870;
    const maxYear = 2030;
    const xScale  = d3.scaleLinear().domain([minYear, maxYear]).range([LABEL_W, W - 20]);

    const svg = d3.select(svgRef.current)
      .attr("width",  W)
      .attr("height", H);
    svg.selectAll("*").remove();

    // Background grid
    const gridYears = d3.range(1880, 2031, 20);
    gridYears.forEach(yr => {
      svg.append("line")
        .attr("x1", xScale(yr)).attr("x2", xScale(yr))
        .attr("y1", PAD_T - 10).attr("y2", H - PAD_B)
        .attr("stroke","rgba(196,131,60,0.1)").attr("stroke-width",1);
    });

    // Axis
    const xAxis = d3.axisTop(xScale)
      .ticks(8).tickFormat(d3.format("d")).tickSize(6);
    svg.append("g").attr("transform",`translate(0,${PAD_T})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill","#8a6030").attr("font-size",11)
      .attr("font-family","'Crimson Text',Georgia,serif");
    svg.select(".domain").attr("stroke","rgba(196,131,60,0.3)");
    svg.selectAll(".tick line").attr("stroke","rgba(196,131,60,0.3)");

    // Current year line
    svg.append("line")
      .attr("x1",xScale(2026)).attr("x2",xScale(2026))
      .attr("y1",PAD_T-10).attr("y2",H-PAD_B)
      .attr("stroke","#f4c875").attr("stroke-width",1.5)
      .attr("stroke-dasharray","4,3").attr("opacity",0.5);
    svg.append("text")
      .attr("x",xScale(2026)+4).attr("y",PAD_T-14)
      .attr("fill","#f4c875").attr("font-size",10)
      .attr("font-family","'Crimson Text',Georgia,serif")
      .text("NOW");

    // Rows
    sorted.forEach((p, i) => {
      const y      = PAD_T + i * ROW_H + ROW_H / 2;
      const isSelected = selectedId === p.id;
      const color  = GEN_COLORS[p.gen];
      const endYr  = p.death || 2026;
      const barX   = xScale(p.birth);
      const barW   = Math.max(4, xScale(endYr) - barX);

      // Row background on hover/select
      const rowBg = svg.append("rect")
        .attr("x",0).attr("y", y - ROW_H/2)
        .attr("width",W).attr("height",ROW_H)
        .attr("fill", isSelected ? `${color}14` : "transparent")
        .attr("cursor","pointer")
        .on("click", () => onSelect(p.id))
        .on("mouseenter", function() {
          d3.select(this).attr("fill", `${color}10`);
        })
        .on("mouseleave", function() {
          d3.select(this).attr("fill", isSelected ? `${color}14` : "transparent");
        });

      // Name label
      svg.append("text")
        .attr("x",LABEL_W - 8).attr("y",y+5)
        .attr("text-anchor","end")
        .attr("fill", isSelected ? color : "#a07840")
        .attr("font-size",12).attr("font-weight",isSelected?700:400)
        .attr("font-family","'Crimson Text',Georgia,serif")
        .attr("cursor","pointer")
        .on("click",()=>onSelect(p.id))
        .text(p.id.length>16?p.id.slice(0,14)+"…":p.id);

      // Life bar background
      svg.append("rect")
        .attr("x",xScale(minYear)).attr("y",y-7)
        .attr("width",xScale(maxYear)-xScale(minYear)).attr("height",14)
        .attr("rx",7).attr("fill","rgba(255,255,255,0.03)");

      // Life bar
      const bar = svg.append("rect")
        .attr("x",barX).attr("y",y-7)
        .attr("width",0).attr("height",14)
        .attr("rx",7)
        .attr("fill",isSelected ? color : `${color}bb`)
        .attr("stroke",isSelected?color:"none")
        .attr("stroke-width",1)
        .attr("filter",isSelected?"url(#glow2)":null)
        .attr("cursor","pointer")
        .on("click",()=>onSelect(p.id));

      // Animate bar in
      bar.transition().duration(600).delay(i*12)
        .attr("width",barW);

      // Year labels on bar
      if (barW > 60) {
        svg.append("text")
          .attr("x",barX+6).attr("y",y+4)
          .attr("fill",isSelected?"#1a0f00":"rgba(20,10,4,0.8)")
          .attr("font-size",10)
          .attr("font-family","monospace")
          .attr("pointer-events","none")
          .text(`${p.birth}${p.death?`–${p.death}`:"–"}`);
      }

      // Death marker
      if (p.death) {
        svg.append("circle")
          .attr("cx",xScale(p.death)).attr("cy",y)
          .attr("r",4).attr("fill","#c47060")
          .attr("stroke","rgba(20,10,4,0.8)").attr("stroke-width",1)
          .attr("cursor","pointer")
          .on("click",()=>onSelect(p.id));
      }

      // Selection dot at birth
      if (isSelected) {
        svg.append("circle")
          .attr("cx",barX).attr("cy",y)
          .attr("r",5).attr("fill",color)
          .attr("stroke","#1a0f00").attr("stroke-width",1.5);
      }
    });

    // Glow filter
    const defs = svg.append("defs");
    const filter2 = defs.append("filter").attr("id","glow2");
    filter2.append("feGaussianBlur").attr("stdDeviation","2").attr("result","blur");
    const fm2 = filter2.append("feMerge");
    fm2.append("feMergeNode").attr("in","blur");
    fm2.append("feMergeNode").attr("in","SourceGraphic");

  }, [people, selectedId]); // eslint-disable-line

  return (
    <div ref={containerRef} style={{ width:"100%", height:"100%", overflowY:"auto", overflowX:"hidden", padding:"0 16px" }}>
      <svg ref={svgRef} style={{ display:"block", minWidth:"100%" }} />
    </div>
  );
}

// ─────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [view, setView]           = useState("tree");
  const [selectedId, setSelectedId] = useState(null);

  const people = useMemo(() => PEOPLE_RAW, []);
  const { byId, rel } = useMemo(() => buildGraph(people), [people]);

  const handleSelect = useCallback((id) => {
    setSelectedId(prev => prev === id ? null : id);
  }, []);

  const VIEWS = [
    { id:"tree",     label:"🌳 Tree" },
    { id:"table",    label:"📋 Table" },
    { id:"timeline", label:"📅 Timeline" },
  ];

  return (
    <div style={{
      width:"100vw", height:"100vh", overflow:"hidden",
      background:"linear-gradient(135deg,#0f0800 0%,#1a0d04 40%,#0d1108 100%)",
      display:"flex", flexDirection:"column",
      fontFamily:"'Crimson Text',Georgia,serif",
      color:"#fdf0d5"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Crimson+Text:wght@400;600;700&display=swap');
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb { background:rgba(196,131,60,0.35); border-radius:3px; }
        ::-webkit-scrollbar-thumb:hover { background:rgba(196,131,60,0.55); }
        input::placeholder { color:#5a3818; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 28px", height:64,
        background:"rgba(0,0,0,0.4)",
        borderBottom:"1px solid rgba(196,131,60,0.2)",
        backdropFilter:"blur(12px)",
        flexShrink:0
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{
            width:40, height:40, borderRadius:"50%",
            background:"linear-gradient(135deg,#c4782c,#f4c050)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:20, boxShadow:"0 0 20px rgba(196,120,44,0.5)"
          }}>🦁</div>
          <div>
            <div style={{
              fontFamily:"'Playfair Display',Georgia,serif",
              fontSize:20, fontWeight:900, color:"#f4c875",
              letterSpacing:0.5, lineHeight:1
            }}>Pride Lands</div>
            <div style={{ color:"#8a6030", fontSize:11, letterSpacing:2, textTransform:"uppercase" }}>
              Genealogy Explorer
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display:"flex", gap:4 }}>
          {VIEWS.map(v => (
            <button key={v.id} onClick={() => setView(v.id)}
              style={{
                padding:"7px 18px", borderRadius:8, border:"none", cursor:"pointer",
                background: view === v.id ? "rgba(196,131,60,0.2)" : "transparent",
                color: view === v.id ? "#f4c875" : "#7a5030",
                fontSize:14, fontWeight:600, transition:"all 0.15s",
                fontFamily:"'Crimson Text',Georgia,serif",
                borderBottom: view === v.id ? "2px solid #f4c875" : "2px solid transparent"
              }}>
              {v.label}
            </button>
          ))}
        </nav>

        {/* Stats */}
        <div style={{ display:"flex", gap:20 }}>
          {[
            { label:"Members", value:people.length },
            { label:"Generations", value:5 },
            { label:"Living", value:people.filter(p=>!p.death).length },
          ].map(s => (
            <div key={s.label} style={{ textAlign:"center" }}>
              <div style={{ color:"#f4c875", fontSize:18, fontWeight:700, lineHeight:1 }}>{s.value}</div>
              <div style={{ color:"#6a4820", fontSize:10, textTransform:"uppercase", letterSpacing:1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* ── Main ── */}
      <div style={{ flex:1, overflow:"hidden", position:"relative" }}>
        {view === "table" && (
          <div style={{ height:"100%", overflowY:"auto" }}>
            <TableView people={people} selectedId={selectedId} onSelect={handleSelect} rel={rel} />
          </div>
        )}
        {view === "tree" && (
          <div style={{ height:"100%" }}>
            <TreeView people={people} byId={byId} rel={rel} selectedId={selectedId} onSelect={handleSelect} />
          </div>
        )}
        {view === "timeline" && (
          <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"12px 24px 4px", display:"flex", gap:16, alignItems:"center", flexShrink:0 }}>
              <span style={{ color:"#8a6030", fontSize:12 }}>Sorted by birth year</span>
              <span style={{ color:"rgba(196,131,60,0.3)" }}>·</span>
              <span style={{ display:"flex", alignItems:"center", gap:6, color:"#8a6030", fontSize:12 }}>
                <span style={{ width:12, height:2, background:"#c47060", display:"inline-block", borderRadius:1 }}/>
                Death marker
              </span>
              <span style={{ display:"flex", alignItems:"center", gap:6, color:"#8a6030", fontSize:12 }}>
                <span style={{ width:20, height:2, background:"#f4c875", display:"inline-block", borderRadius:1 }}/>
                Present (2026)
              </span>
            </div>
            <div style={{ flex:1, overflow:"hidden" }}>
              <TimelineView people={people} byId={byId} rel={rel} selectedId={selectedId} onSelect={handleSelect} />
            </div>
          </div>
        )}
      </div>

      {/* ── Profile Panel ── */}
      {selectedId && (
        <ProfilePanel
          personId={selectedId}
          byId={byId}
          rel={rel}
          onClose={() => setSelectedId(null)}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
