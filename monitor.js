// monitor.js
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const { execSync } = require('child_process');

const screen = blessed.screen();
const grid = new contrib.grid({ rows: 2, cols: 1, screen });

const totalVram = parseFloat(
  execSync('nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits').toString().trim()
);

const AMBER = '#FFBF00';

const memLine = grid.set(0, 0, 1, 1, contrib.line, {
  label: `GPU Memory (MB)  [total: ${totalVram} MB]`,
  style: { line: 'cyan', text: 'white', baseline: 'yellow', border: { fg: AMBER }, label: { fg: AMBER } },
  xLabelPadding: 3, xPadding: 5, showLegend: false,
  maxY: totalVram * 1.05,
  border: { type: 'line', fg: AMBER },
});

const utlLine = grid.set(1, 0, 1, 1, contrib.line, {
  label: 'GPU Utilization (%)',
  style: { line: 'yellow', text: 'white', baseline: 'yellow', border: { fg: AMBER }, label: { fg: AMBER } },
  xLabelPadding: 3, xPadding: 5, showLegend: false,
  maxY: 100,
  border: { type: 'line', fg: AMBER },
});

const MEM_MAX = 60;
let memData = Array(MEM_MAX).fill(0);
let utlData = Array(MEM_MAX).fill(0);
let labels  = Array(MEM_MAX).fill('');
let tick = 0;

function getGpuStats() {
  const out = execSync(
    'nvidia-smi --query-gpu=memory.used,utilization.gpu --format=csv,noheader,nounits'
  ).toString().trim().split(',');
  return { mem: parseFloat(out[0]), utl: parseFloat(out[1]) };
}

function update() {
  const { mem, utl } = getGpuStats();
  memData = [...memData.slice(1), mem];
  utlData = [...utlData.slice(1), utl];
  labels  = [...labels.slice(1), String(tick++)];

  memLine.setData([{ title: 'VRAM MB', x: labels, y: memData }]);
  utlLine.setData([{ title: 'Util %',  x: labels, y: utlData }]);
  screen.render();
}

screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
setInterval(update, 1000);
update();
