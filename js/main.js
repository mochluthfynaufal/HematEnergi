const $ = s => document.querySelector(s), id = n => n.toLocaleString('id-ID', { maximumFractionDigits: 1 });
$('.burger').onclick = () => document.body.classList.toggle('nav-open');
const io = new IntersectionObserver(e => e.forEach(x => x.isIntersecting && x.target.classList.add('in')), { threshold: .15 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));
const TARIF = 1444.7, CO2 = 0.87;
const hero = $('.hero');
if (hero) {
  let lit = true, jam = 0, wh = 0; const W = 40, L = $('#lamp'), m = $('#meter');
  const draw = () => { m.innerHTML = `<div><b>${jam}</b><small>jam menyala</small></div><div><b>${id(wh)}</b><small>Wh terbuang</small></div><div><b>Rp${id(wh / 1000 * TARIF)}</b><small>biaya</small></div>` };
  const txt = () => {
    $('#hl').textContent = lit ? 'Lampu menyala. Ruangannya kosong.' : 'Selesai. Cuma satu klik.';
    $('#sub').textContent = lit ? 'Setiap lampu yang dibiarkan menyala tanpa orang adalah energi dan uang yang terbuang. Tarik tali lampunya.' : 'Kebiasaan kecil seperti ini, dikali seluruh ruangan di sekolah kita, jadi angka yang besar. Lihat buktinya di halaman Data.';
    L.setAttribute('aria-pressed', lit); L.setAttribute('aria-label', lit ? 'Matikan lampu' : 'Nyalakan lampu')
  };
  L.onclick = () => {
    lit = !lit;
    hero.classList.toggle('lit', lit);
    // toggle bohlam nyala/mati
    const bulbLit = L.querySelector('.bulb-lit');
    if (bulbLit) bulbLit.style.opacity = lit ? '1' : '0';
    txt()
  };
  setInterval(() => { if (lit) { jam++; wh += W; draw() } }, 1000);
  $('#reset').onclick = () => { jam = wh = 0; draw() };
  // Set initial lamp state
  const bulbLit = L.querySelector('.bulb-lit');
  if (bulbLit) bulbLit.style.opacity = '1';
  draw(); txt()
}
const c = $('#calc');
if (c) {
  const f = () => {
    const n = +$('#n').value, w = +$('#w').value, h = +$('#h').value, k = n * w * h * 30 / 1000;
    $('#vn').textContent = n; $('#vw').textContent = w + ' W'; $('#vh').textContent = h + ' jam';
    $('#kwh').textContent = id(k) + ' kWh'; $('#rp').textContent = 'Rp' + id(k * TARIF); $('#co').textContent = id(k * CO2) + ' kg CO₂'
  };
  c.addEventListener('input', f); f()
}