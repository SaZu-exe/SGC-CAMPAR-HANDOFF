const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const scriptStart = html.indexOf('<script>') + 8;
const scriptEnd = html.lastIndexOf('</script>');
const script = html.substring(scriptStart, scriptEnd);

const auditCode = `
console.log('=== 1. CATÁLOGOS Y ENTIDADES MAESTRAS ===');
console.log('Usuarios autorizados (USERS):', USERS.length);
console.log('Catálogo maestro de tarimas (PRODUCTS):', PRODUCTS.length, 'modelos oficiales');
console.log('Aserraderos operativos (SAWMILLS):', SAWMILLS);
console.log('Etapas del flujo de producción (STAGES):', STAGES.join(' -> '));

console.log('\\n=== 2. ESTADO DEL SISTEMA (BASE DE DATOS) ===');
console.log('Órdenes de Compra registradas:', state.orders.length);
console.log('Asignaciones a aserraderos:', state.allocations.length);
console.log('Lotes de producción generados:', state.lots.length);
console.log('Inspecciones de calidad registradas:', state.inspections.length);
console.log('Entregas / Despachos registrados:', state.deliveries.length);

console.log('\\n=== 3. AUDITORÍA DE CONEXIONES LÓGICAS Y RELACIONES ===');
let issues = [];

// Relación: OC -> Líneas y Productos
state.orders.forEach(o => {
  if(!o.id) issues.push(\`OC sin ID: \${JSON.stringify(o)}\`);
  (o.lines || []).forEach(l => {
    const p = product(l.productCode);
    if(!p || p.code === 'ND') {
      issues.push(\`Error en OC \${o.id}: El producto \${l.productCode} no existe en PRODUCTS.\`);
    }
  });
});

// Relación: Asignaciones -> OCs y Productos
state.allocations.forEach(a => {
  const o = orderById(a.orderId);
  if(!o) issues.push(\`Error en Asignación \${a.id}: Referencia OC inexistente (\${a.orderId}).\`);
  if(!['Cosme', 'Duma'].includes(a.sawmill)) issues.push(\`Error en Asignación \${a.id}: Aserradero desconocido (\${a.sawmill}).\`);
  const p = product(a.productCode);
  if(!p || p.code === 'ND') issues.push(\`Error en Asignación \${a.id}: Producto desconocido (\${a.productCode}).\`);
  
  // Validar balance de etapas
  let sumEtapas = 0;
  for(let st of STAGES){
    sumEtapas += (a.stages && a.stages[st]) || 0;
  }
  if(sumEtapas !== a.qty){
    console.log(\`[Aviso Balance] Asignación \${a.id} (OC \${a.orderId}, \${a.sawmill}): Suma de piezas en etapas (\${sumEtapas}) no coincide con cantidad asignada (\${a.qty}).\`);
  }
});

// Relación: Lotes -> Asignaciones, OCs, Productos
state.lots.forEach(l => {
  const o = orderById(l.orderId);
  if(!o) issues.push(\`Error en Lote \${l.id}: Referencia a OC inexistente (\${l.orderId}).\`);
  const a = state.allocations.find(x => x.id === l.allocationId);
  if(!a) issues.push(\`Error en Lote \${l.id}: Referencia a asignación inexistente (\${l.allocationId}).\`);
  const p = product(l.productCode);
  if(!p || p.code === 'ND') issues.push(\`Error en Lote \${l.id}: Producto desconocido (\${l.productCode}).\`);
});

// Relación: Inspecciones -> Lotes
state.inspections.forEach(i => {
  const l = lotById(i.lotId);
  if(!l) issues.push(\`Error en Inspección \${i.id}: Referencia a Lote inexistente (\${i.lotId}).\`);
});

// Relación: Entregas -> OCs y Lotes
state.deliveries.forEach(d => {
  const o = orderById(d.orderId);
  if(!o) issues.push(\`Error en Entrega \${d.id}: Referencia a OC inexistente (\${d.orderId}).\`);
  const l = lotById(d.lotId);
  if(!l) issues.push(\`Error en Entrega \${d.id}: Referencia a Lote inexistente (\${d.lotId}).\`);
});

// Verificación del motor ATP (Available to Promise)
console.log('\\n=== 4. AUDITORÍA DEL MOTOR ATP (DISPONIBILIDAD Y PROMESAS) ===');
let atpChecked = 0;
PRODUCTS.forEach(p => {
  const atp = getProductAtpData(p);
  if(!atp || typeof atp.finishedStock !== 'number' || typeof atp.balance !== 'number'){
    issues.push(\`Error en ATP para producto \${p.code}: Cálculo de balance inválido.\`);
  } else {
    atpChecked++;
  }
});
console.log(\`Cálculos ATP verificados para \${atpChecked} productos del catálogo.\`);

// Verificación del Simulador de Trailer
console.log('\\n=== 5. AUDITORÍA DEL SIMULADOR DE TRAILER ===');
if(typeof trailerConfig === 'undefined' || !trailerConfig.stacksA || !trailerConfig.stacksB){
  issues.push('trailerConfig no está debidamente inicializado.');
} else {
  console.log(\`Trailer inicializado: Hilera A = \${trailerConfig.stacksA.length} estibas, Hilera B = \${trailerConfig.stacksB.length} estibas.\`);
  const lenA = trailerConfig.stacksA.reduce((s, x) => s + x.lengthM, 0);
  const lenB = trailerConfig.stacksB.reduce((s, x) => s + x.lengthM, 0);
  console.log(\`Largo Hilera A: \${lenA.toFixed(2)} m / 14.50 m útiles\`);
  console.log(\`Largo Hilera B: \${lenB.toFixed(2)} m / 14.50 m útiles\`);
}

// Verificación de los Perfiles de Usuario
console.log('\\n=== 6. AUDITORÍA DE SESIONES Y USUARIOS ===');
USERS.forEach(u => {
  if(!u.id || !u.name || !u.role || !u.dept || !u.pin){
    issues.push(\`Usuario incompleto: \${JSON.stringify(u)}\`);
  } else {
    console.log(\` - Usuario \${u.id}: \${u.name} (\${u.role} - \${u.dept}) | PIN: \${u.pin}\`);
  }
});

console.log('\\n=== RESULTADO DE LA AUDITORÍA DE RELACIONES ===');
if(issues.length === 0){
  console.log('✅ TODAS LAS CONEXIONES Y RELACIONES LÓGICAS ESTÁN 100% CORRECTAS Y CONSISTENTES.');
} else {
  console.error('❌ SE ENCONTRARON DISCREPANCIAS:');
  issues.forEach(iss => console.error(' - ' + iss));
}
`;

const mockEl = {
  style: {},
  classList: { add(){}, remove(){}, contains(){ return false; } },
  appendChild(){},
  innerHTML: '',
  textContent: '',
  value: '',
  addEventListener(){},
  focus(){},
  dataset: {}
};

global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.document = {
  getElementById: () => mockEl,
  querySelectorAll: () => [mockEl],
  addEventListener: () => {},
  createElement: () => mockEl,
  body: mockEl
};
global.window = global;
global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });

eval(script + '\n' + auditCode);
