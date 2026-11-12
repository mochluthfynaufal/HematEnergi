/* =========================================================
   charts-perilaku.js  —  Data & Fakta (Perilaku Hemat Energi)
   Menggunakan DATA_ENERGI dari data/data-perilaku-energi.js
   ========================================================= */

const D = DATA_ENERGI;

/* ── Palet warna ── */
const PAL = {
  navy:    '#1a3a5c',
  amber:   '#f5a623',
  orange:  '#e8720c',
  gold:    '#e8c97a',
  slate:   '#8a9aaa',
  cream:   '#fdf8f0',
  mut:     '#6b6560',
  sb:      '#f5a623',   // Sangat Baik
  b:       '#1a3a5c',   // Baik
  c:       '#e8720c',   // Cukup
  k:       '#c0392b',   // Kurang
};

Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#6b6560';

/* ── Helper: short label ── */
function shortLabel(label, max = 28) {
  return label.length > max ? label.slice(0, max) + '…' : label;
}

/* ═══════════════════════════════════════════════════
   TAB NAVIGASI
════════════════════════════════════════════════════ */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

/* ═══════════════════════════════════════════════════
   TAB 1 — RINGKASAN
════════════════════════════════════════════════════ */

/* 1A. Kategori Donut */
{
  const kat = D.ringkasan.kategori;
  new Chart(document.getElementById('cKategori'), {
    type: 'doughnut',
    data: {
      labels: ['Sangat Baik', 'Baik', 'Cukup', 'Kurang'],
      datasets: [{
        data: [kat['Sangat Baik'], kat['Baik'], kat['Cukup'], kat['Kurang']],
        backgroundColor: [PAL.sb, PAL.b, PAL.c, PAL.k],
        borderWidth: 0,
        hoverOffset: 8,
      }]
    },
    options: {
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const pct = D.ringkasan.kategori_persen[ctx.label];
              return ` ${ctx.label}: ${ctx.raw} siswa (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

/* 1B. Rata-rata per Butir Bar */
{
  const labels = D.per_butir.map(b => shortLabel(b.label, 24));
  const vals   = D.per_butir.map(b => b.rata_rata);
  const avg    = D.ringkasan.rata_rata_skor;

  new Chart(document.getElementById('cRataButir'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Rata-rata skor',
        data: vals,
        backgroundColor: vals.map(v => v >= avg ? PAL.amber : PAL.slate),
        borderRadius: 6,
      }]
    },
    options: {
      indexAxis: 'x',
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => D.per_butir[ctx[0].dataIndex].label,
            label: ctx => ` Rata-rata: ${ctx.raw.toFixed(2)} / 4,00`
          }
        },
        annotation: undefined,
      },
      scales: {
        y: {
          min: 2.8,
          max: 4.0,
          ticks: { stepSize: .2, callback: v => v.toFixed(1) },
          grid: { color: '#f0ebe0' }
        },
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 35 } }
      }
    },
    plugins: [{
      id: 'avgLine',
      afterDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        const y = scales.y.getPixelForValue(avg);
        ctx.save();
        ctx.strokeStyle = PAL.orange;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(chartArea.left, y);
        ctx.lineTo(chartArea.right, y);
        ctx.stroke();
        ctx.restore();
      }
    }]
  });
}

/* 1C. % Sering per Butir Horizontal Bar */
{
  const sorted = [...D.per_butir].sort((a, b) => b.persen_sering - a.persen_sering);
  new Chart(document.getElementById('cSeringButir'), {
    type: 'bar',
    data: {
      labels: sorted.map(b => shortLabel(b.label, 32)),
      datasets: [{
        label: '% Sering/Selalu',
        data: sorted.map(b => b.persen_sering),
        backgroundColor: sorted.map((b, i) =>
          i < 3 ? PAL.amber : (i >= sorted.length - 3 ? PAL.orange : PAL.navy + 'cc')
        ),
        borderRadius: 6,
      }]
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.raw}% siswa menjawab Sering/Selalu` } }
      },
      scales: {
        x: { min: 80, max: 100, ticks: { callback: v => v + '%' }, grid: { color: '#f0ebe0' } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });
}

/* ═══════════════════════════════════════════════════
   TAB 2 — PER BUTIR
════════════════════════════════════════════════════ */

/* 2A. Stacked Bar distribusi jawaban */
{
  const labels = D.per_butir.map(b => b.kode);
  const s1 = D.per_butir.map(b => b.persen_per_skor['1']);
  const s2 = D.per_butir.map(b => b.persen_per_skor['2']);
  const s3 = D.per_butir.map(b => b.persen_per_skor['3']);
  const s4 = D.per_butir.map(b => b.persen_per_skor['4']);

  new Chart(document.getElementById('cStackedButir'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: '4 · Selalu',       data: s4, backgroundColor: PAL.amber,       borderRadius: { topLeft: 6, topRight: 6 } },
        { label: '3 · Sering',       data: s3, backgroundColor: PAL.navy + 'cc' },
        { label: '2 · Jarang',       data: s2, backgroundColor: PAL.slate },
        { label: '1 · Tidak Pernah', data: s1, backgroundColor: PAL.orange,       borderRadius: { bottomLeft: 6, bottomRight: 6 } },
      ]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 14, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            title: ctx => {
              const b = D.per_butir[ctx[0].dataIndex];
              return `${b.kode} — ${b.label}`;
            },
            label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}%`
          }
        }
      },
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: { stacked: true, max: 100, ticks: { callback: v => v + '%' }, grid: { color: '#f0ebe0' } }
      }
    }
  });
}

/* 2B. Butir list (progress bar visual) */
{
  const container = document.getElementById('butirList');
  const sorted = [...D.per_butir].sort((a, b) => b.rata_rata - a.rata_rata);
  sorted.forEach(b => {
    const pct = ((b.rata_rata - 1) / 3 * 100).toFixed(1);
    container.insertAdjacentHTML('beforeend', `
      <div class="butir-row">
        <span class="butir-label">${b.kode} · ${b.label}</span>
        <span class="butir-score">${b.rata_rata.toFixed(2)}</span>
        <div class="bar-wrap">
          <div class="bar-fill" style="width:${pct}%"></div>
        </div>
      </div>
    `);
  });
}

/* ═══════════════════════════════════════════════════
   TAB 3 — PER JURUSAN
════════════════════════════════════════════════════ */

const jurusanSorted = [...D.per_jurusan].sort((a, b) => b.rata_rata_skor - a.rata_rata_skor);

/* 3A. Bar jurusan */
{
  new Chart(document.getElementById('cJurusanBar'), {
    type: 'bar',
    data: {
      labels: jurusanSorted.map(j => j.kode),
      datasets: [{
        label: 'Rata-rata skor',
        data: jurusanSorted.map(j => j.rata_rata_skor),
        backgroundColor: jurusanSorted.map((j, i) => i === 0 ? PAL.amber : (i === jurusanSorted.length - 1 ? PAL.orange : PAL.navy + 'cc')),
        borderRadius: 8,
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => jurusanSorted[ctx[0].dataIndex].nama,
            label: ctx => ` Rata-rata: ${ctx.raw.toFixed(2)} / 4,00  (n=${jurusanSorted[ctx[0].dataIndex].jumlah_responden})`
          }
        }
      },
      scales: {
        y: { min: 3.0, max: 3.6, ticks: { callback: v => v.toFixed(1) }, grid: { color: '#f0ebe0' } },
        x: { grid: { display: false } }
      }
    }
  });
}

/* 3B. Sangat Baik per Jurusan */
{
  new Chart(document.getElementById('cJurusanSB'), {
    type: 'bar',
    data: {
      labels: jurusanSorted.map(j => j.kode),
      datasets: [{
        label: '% Sangat Baik',
        data: jurusanSorted.map(j => j.kategori_persen['Sangat Baik']),
        backgroundColor: PAL.amber + 'cc',
        borderRadius: 8,
      }, {
        label: '% Baik',
        data: jurusanSorted.map(j => j.kategori_persen['Baik']),
        backgroundColor: PAL.navy + '88',
        borderRadius: 8,
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            title: ctx => jurusanSorted[ctx[0].dataIndex].nama,
            label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}%`
          }
        }
      },
      scales: {
        y: { max: 85, ticks: { callback: v => v + '%' }, grid: { color: '#f0ebe0' } },
        x: { grid: { display: false } }
      }
    }
  });
}

/* 3C. Radar per Jurusan */
{
  const RADAR_PAL = [PAL.amber, PAL.navy, PAL.orange, '#7c3aed', '#059669', '#db2777', '#0284c7'];
  const butirLabels = D.per_butir.map(b => shortLabel(b.label, 20));

  new Chart(document.getElementById('cRadarJurusan'), {
    type: 'radar',
    data: {
      labels: butirLabels,
      datasets: D.per_jurusan.map((j, i) => ({
        label: j.kode,
        data: j.rata_rata_per_butir,
        borderColor: RADAR_PAL[i % RADAR_PAL.length],
        backgroundColor: RADAR_PAL[i % RADAR_PAL.length] + '18',
        borderWidth: 2,
        pointRadius: 3,
      }))
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            title: ctx => D.per_jurusan.find(j => j.kode === ctx[0].dataset.label)?.nama || ctx[0].dataset.label,
            label: ctx => ` ${D.per_butir[ctx.dataIndex].label}: ${ctx.raw.toFixed(2)}`
          }
        }
      },
      scales: {
        r: {
          min: 2.8, max: 4.0,
          ticks: { stepSize: .4, font: { size: 9 }, backdropColor: 'transparent' },
          pointLabels: { font: { size: 10 } },
          grid: { color: '#e8dcc8' },
          angleLines: { color: '#e8dcc8' }
        }
      }
    }
  });
}

/* 3D. Jurusan rank list */
{
  const container = document.getElementById('jurusanRank');
  jurusanSorted.forEach((j, i) => {
    const pct = ((j.rata_rata_skor - 3.0) / 0.6 * 100).toFixed(0);
    container.insertAdjacentHTML('beforeend', `
      <div class="jurusan-row">
        <span class="jurusan-rank">${i + 1}</span>
        <div class="jurusan-name">
          <strong>${j.nama}</strong><br>
          <span class="jurusan-kode">${j.kode} · ${j.jumlah_responden} responden</span>
        </div>
        <div class="jurusan-bar-wrap">
          <div class="jurusan-bar-fill" style="width:${Math.max(10, pct)}%"></div>
        </div>
        <span class="jurusan-score">${j.rata_rata_skor.toFixed(2)}</span>
        <span class="badge ${i === 0 ? 'badge-sb' : (j.rata_rata_skor >= 3.26 ? 'badge-sb' : 'badge-b')}">
          ${j.rata_rata_skor >= 3.26 ? 'Sangat Baik' : 'Baik'}
        </span>
      </div>
    `);
  });
}

/* ═══════════════════════════════════════════════════
   TAB 4 — SEBARAN SKOR
════════════════════════════════════════════════════ */

/* 4A. Histogram skor total */
{
  const hData = D.sebaran_skor_total;
  new Chart(document.getElementById('cHistogram'), {
    type: 'bar',
    data: {
      labels: hData.map(d => d.skor_total),
      datasets: [{
        label: 'Jumlah siswa',
        data: hData.map(d => d.jumlah),
        backgroundColor: hData.map(d => {
          if (d.skor_total >= 33) return PAL.amber + 'cc';
          if (d.skor_total >= 26) return PAL.navy + 'aa';
          return PAL.orange + '99';
        }),
        borderRadius: 4,
        barPercentage: 0.9,
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.raw} siswa dengan skor total ${ctx.label}` } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0 } },
        y: { grid: { color: '#f0ebe0' }, ticks: { stepSize: 10 } }
      }
    }
  });
}

/* 4B. Pie kategori */
{
  const kat = D.ringkasan.kategori;
  const pct = D.ringkasan.kategori_persen;
  new Chart(document.getElementById('cPieKategori'), {
    type: 'pie',
    data: {
      labels: ['Sangat Baik', 'Baik', 'Cukup', 'Kurang'],
      datasets: [{
        data: [kat['Sangat Baik'], kat['Baik'], kat['Cukup'], kat['Kurang']],
        backgroundColor: [PAL.sb, PAL.b, PAL.c, PAL.k],
        borderWidth: 2,
        borderColor: '#fdf8f0',
        hoverOffset: 8,
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 14, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.raw} siswa (${pct[ctx.label]}%)`
          }
        }
      }
    }
  });
}

/* 4C. Jumlah responden per jurusan */
{
  const jSorted = [...D.per_jurusan].sort((a, b) => b.jumlah_responden - a.jumlah_responden);
  new Chart(document.getElementById('cNJurusan'), {
    type: 'bar',
    data: {
      labels: jSorted.map(j => j.kode),
      datasets: [{
        label: 'Jumlah responden',
        data: jSorted.map(j => j.jumlah_responden),
        backgroundColor: PAL.navy + 'cc',
        borderRadius: 8,
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => jSorted[ctx[0].dataIndex].nama,
            label: ctx => ` ${ctx.raw} responden`
          }
        }
      },
      scales: {
        y: { grid: { color: '#f0ebe0' } },
        x: { grid: { display: false } }
      }
    }
  });
}

