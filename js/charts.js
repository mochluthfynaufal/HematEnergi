const G = '#1a3a5c', Y = '#f5a623', LG = '#f0c060';
Chart.defaults.font.family = "'Inter',sans-serif"; Chart.defaults.color = '#6b6560';
fetch('data/data.json').then(r => r.json()).then(d => {
    document.querySelector('#src').textContent = d.meta.sumber;
    let grp = 'Semua';
    const k = new Chart(document.getElementById('cK'), {
        type: 'bar', data: { labels: d.kebiasaan.labels, datasets: [{ data: d.kebiasaan.series[grp], backgroundColor: G, borderRadius: 8 }] },
        options: { indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.raw + '% selalu melakukan' } } }, scales: { x: { max: 100, ticks: { callback: v => v + '%' } } } }
    });
    const p = new Chart(document.getElementById('cP'), {
        type: 'doughnut', data: { labels: d.pemahaman.labels, datasets: [{ data: d.pemahaman.series[grp], backgroundColor: [G, Y, '#e8c97a'], borderWidth: 0 }] },
        options: { maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom' } } }
    });
    new Chart(document.getElementById('cR'), {
        type: 'bar', data: { labels: d.ruang.labels, datasets: [{ data: d.ruang.values, backgroundColor: d.ruang.values.map(v => v > 45 ? Y : LG), borderRadius: 8 }] },
        options: { maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.raw + '% pengamatan lampu menyala saat kosong' } } }, scales: { y: { max: 100, ticks: { callback: v => v + '%' } } } }
    });
    ['K', 'P', 'R'].forEach(x => document.getElementById('t' + x).textContent = d.catatan[x]);
    document.querySelectorAll('.seg button').forEach(b => b.onclick = () => {
        grp = b.dataset.g;
        document.querySelectorAll('.seg button').forEach(o => o.classList.toggle('on', o === b));
        k.data.datasets[0].data = d.kebiasaan.series[grp]; p.data.datasets[0].data = d.pemahaman.series[grp]; k.update(); p.update()
    });
}).catch(() => { document.querySelector('#src').textContent = 'Data gagal dimuat. Buka lewat server lokal (misalnya ekstensi Live Server) atau GitHub Pages, bukan klik dua kali file HTML.' });