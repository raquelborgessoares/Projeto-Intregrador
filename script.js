/* ==========================================================
   AQUASOL CEP — Interatividade do site
   ========================================================== */

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Título com efeito de decodificação ---------- */
function decodificar(el) {
  const alvo = el.dataset.texto;
  if (reduzMovimento) { el.textContent = alvo; return; }
  const chars = '#%0123456789°CAQUSLX';
  let frame = 0;
  const total = alvo.length * 3;
  const timer = setInterval(() => {
    frame++;
    el.textContent = alvo.split('').map((ch, i) => {
      if (ch === ' ' || ch === ',' || ch === '.') return ch;
      if (frame / 3 > i) return ch;
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    if (frame >= total) { el.textContent = alvo; clearInterval(timer); }
  }, 38);
}
window.addEventListener('load', () => {
  $$('.linha-decode').forEach((el, i) => setTimeout(() => decodificar(el), i * 500));
});

/* ---------- Revelação ao rolar + contadores ---------- */
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visivel');
    $$('.contador', e.target).concat(e.target.matches('.contador') ? [e.target] : [])
      .forEach(animarContador);
    observador.unobserve(e.target);
  });
}, { threshold: 0.18 });
$$('.revelar, .titulo').forEach(el => observador.observe(el));

function animarContador(el) {
  if (el.dataset.feito) return;
  el.dataset.feito = '1';
  const alvo = parseFloat(el.dataset.alvo);
  const sufixo = el.dataset.sufixo || '';
  if (reduzMovimento) { el.textContent = alvo + sufixo; return; }
  const inicio = performance.now(), dur = 1400;
  (function passo(t) {
    const p = Math.min((t - inicio) / dur, 1);
    const suave = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(alvo * suave) + sufixo;
    if (p < 1) requestAnimationFrame(passo);
  })(inicio);
}

/* ---------- Cabeçalho: sombra ao rolar + menu mobile ---------- */
const topo = $('#topo');
window.addEventListener('scroll', () => topo.classList.toggle('rolou', window.scrollY > 12), { passive: true });

const menuBtn = $('#menuBtn'), navLista = $('#navegacao');
menuBtn.addEventListener('click', () => {
  const aberto = navLista.classList.toggle('aberto');
  menuBtn.setAttribute('aria-expanded', aberto);
  menuBtn.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
});
$$('a', navLista).forEach(a => a.addEventListener('click', () => {
  navLista.classList.remove('aberto');
  menuBtn.setAttribute('aria-expanded', 'false');
}));

/* ---------- Ferramentas de acessibilidade ---------- */
let tamanhoFonte = 100;
$('#btnAmais').addEventListener('click', () => {
  tamanhoFonte = Math.min(tamanhoFonte + 10, 140);
  document.documentElement.style.fontSize = tamanhoFonte + '%';
});
$('#btnAmenos').addEventListener('click', () => {
  tamanhoFonte = Math.max(tamanhoFonte - 10, 90);
  document.documentElement.style.fontSize = tamanhoFonte + '%';
});
const btnContraste = $('#btnContraste');
btnContraste.addEventListener('click', () => {
  const ativo = document.body.classList.toggle('alto-contraste');
  btnContraste.setAttribute('aria-pressed', ativo);
});

/* ---------- Painel do hero: leituras "ao vivo" ---------- */
const aguaTemp = $('#aguaTemp'), radVal = $('#radVal'), metaFill = $('#metaBarFill');
function fmt(n) { return n.toFixed(1).replace('.', ','); }
function atualizarPainel() {
  const t = 28.4 + (Math.random() - 0.5) * 0.6;
  const r = Math.round(742 + (Math.random() - 0.5) * 120);
  aguaTemp.textContent = fmt(t);
  radVal.textContent = r;
  metaFill.style.width = Math.min((t / 30) * 100, 100) + '%';
}
if (!reduzMovimento) setInterval(atualizarPainel, 2400);

/* ---------- Disco de Newton ---------- */
const disco = $('#disco'), btnDisco = $('#btnDisco'), discoNota = $('#discoNota');
btnDisco.addEventListener('click', () => {
  const girando = disco.classList.toggle('girando');
  btnDisco.setAttribute('aria-pressed', girando);
  btnDisco.textContent = girando ? '■ Parar o disco' : '▶ Girar o disco';
  discoNota.textContent = girando
    ? 'Girando: as sete cores se somam e percebemos um tom quase branco — a luz branca é a mistura de todas elas.'
    : 'Disco parado: você vê as sete cores separadas.';
});

/* ---------- Laboratório de absorção ---------- */
const materiais = [
  { nome: 'Negro fosco (placa do coletor)', cor: '#101418', abs: 95 },
  { nome: 'Azul-escuro',                    cor: '#123a6b', abs: 78 },
  { nome: 'Vermelho',                       cor: '#b3282d', abs: 64 },
  { nome: 'Verde',                          cor: '#2f7d4f', abs: 56 },
  { nome: 'Branco',                         cor: '#f2f2f2', abs: 18 },
  { nome: 'Alumínio polido',                cor: '#c9ced4', abs: 7 },
];
const contAmostras = $('#amostras');
materiais.forEach((m, i) => {
  const b = document.createElement('button');
  b.className = 'amostra';
  b.style.background = m.cor;
  b.setAttribute('aria-label', `Testar material: ${m.nome} — absorção ${m.abs}%`);
  b.setAttribute('aria-pressed', i === 0);
  b.addEventListener('click', () => {
    $$('.amostra').forEach(x => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', 'true');
    aplicarMaterial(m);
  });
  contAmostras.appendChild(b);
});
function aplicarMaterial(m) {
  $('#valAbs').textContent = m.abs + '%';
  $('#valRef').textContent = (100 - m.abs) + '%';
  $('#barAbs').style.width = m.abs + '%';
  $('#barRef').style.width = (100 - m.abs) + '%';
  $('#labNome').textContent = m.nome;
  $('#valDt').textContent = (0.86 * m.abs / 100).toFixed(2).replace('.', ',') + ' °C/h';
}
aplicarMaterial(materiais[0]);

/* ---------- Ciclo de controle do diagrama ---------- */
const etapasCiclo = [
  ['nSol',     '☀ Radiação solar incide sobre o coletor…'],
  ['nColetor', '🔆 Placa negra ABSORVE a luz e aquece a água do circuito…'],
  ['nSensor',  '🌡 Sensor DS18B20 lê a temperatura: 27,1 °C…'],
  ['nCtrl',    '🧠 ESP32 compara com a meta de 30 °C → está abaixo!'],
  ['nBomba',   '⚙ Relé aciona a bomba: água começa a circular…'],
  ['nPiscina', '🏊 Calor é transferido à piscina. O laço se repete a cada 5 s.'],
];
const btnCiclo = $('#btnCiclo'), cicloStatus = $('#cicloStatus');
btnCiclo.addEventListener('click', () => {
  btnCiclo.disabled = true;
  $$('.node').forEach(n => n.classList.remove('ativo'));
  etapasCiclo.forEach(([id, msg], i) => {
    setTimeout(() => {
      $$('.node').forEach(n => n.classList.remove('ativo'));
      $('#' + id).classList.add('ativo');
      cicloStatus.textContent = msg;
      if (i === etapasCiclo.length - 1) {
        setTimeout(() => {
          cicloStatus.textContent = 'Ciclo concluído — o sistema opera continuamente. ▶ Execute novamente!';
          btnCiclo.disabled = false;
        }, 1100);
      }
    }, i * 1100);
  });
});

/* ---------- Simulador de aquecimento ---------- */
const qtdPlacas = $('#qtdPlacas'), horasSol = $('#horasSol'),
      volume = $('#volume'), capa = $('#capa');
const AREA_PLACA = 2.0, EFICIENCIA = 0.62, IRR_POR_HORA = 0.85,
      KWH_KCAL = 860, META = 30, T_INICIAL = 24,
      TARIFA = 0.95, FATOR_CO2 = 0.081;

function simular() {
  $('#outPlacas').textContent = qtdPlacas.value;
  $('#outHoras').textContent = horasSol.value.replace('.', ',');

  const n = +qtdPlacas.value, h = +horasSol.value, v = +volume.value;
  const energiaKwh = n * AREA_PLACA * h * IRR_POR_HORA * EFICIENCIA;
  const kcalDia = energiaKwh * KWH_KCAL;
  let dtDia = kcalDia / v;
  if (capa.checked) dtDia *= 1.28; // capa térmica reduz perdas noturnas

  const dias = (META - T_INICIAL) / dtDia;
  const custoMes = energiaKwh * 30 * TARIFA;
  const co2Mes = energiaKwh * 30 * FATOR_CO2;

  $('#rDt').textContent = dtDia.toFixed(2).replace('.', ',');
  $('#rDias').textContent = dias > 365 ? 'mais de 365' : Math.ceil(dias);
  $('#rEnergia').textContent = Math.round(energiaKwh);
  $('#rCusto').textContent = custoMes.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  $('#rCo2').textContent = Math.round(co2Mes);
  $('#termoFill').style.height = Math.min(dtDia / 10, 1) * 100 + '%';
}
[qtdPlacas, horas
