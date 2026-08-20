// Tiny Sleek Compressed Ribbons Cursor Follower
(function () {
  const colors = ['#0ea5e9', '#38bdf8', '#7dd3fc', '#ffffff', '#0284c7'];
  const ribbonCount = colors.length;
  const pointCount = 14;          // Short, compact compressed trail
  const baseThickness = 1.8;       // Micro-thin sleek lines

  let canvas, ctx;
  let width, height;
  let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false };

  // Create delicate tightly-compressed ribbon lines
  const ribbons = colors.map((color, index) => {
    const center = (ribbonCount - 1) / 2;
    const offset = (index - center) * 1.2; // Tightly compressed offset
    const points = [];
    for (let i = 0; i < pointCount; i++) {
      points.push({ x: -1000, y: -1000, vx: 0, vy: 0 });
    }
    return {
      color,
      offset,
      spring: 0.12 + (index * 0.01),
      friction: 0.72 - (index * 0.01),
      thickness: Math.max(0.9, baseThickness - Math.abs(index - center) * 0.25),
      points
    };
  });

  function init() {
    canvas = document.createElement('canvas');
    canvas.className = 'ribbons-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999';
    document.body.prepend(canvas);

    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', resize, { passive: true });
    }

    function onPointerMove(e) {
      let x = e.clientX;
      let y = e.clientY;
      if (e.touches && e.touches.length) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      }
      mouse.targetX = x;
      mouse.targetY = y;

      if (!mouse.active) {
        mouse.active = true;
        mouse.x = x;
        mouse.y = y;
        ribbons.forEach(ribbon => {
          ribbon.points.forEach(p => {
            p.x = x;
            p.y = y;
          });
        });
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });

    requestAnimationFrame(animate);
  }

  function resize() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    if (ctx.resetTransform) {
      ctx.resetTransform();
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.scale(dpr, dpr);
  }

  let time = 0;
  function animate() {
    time += 0.05;
    ctx.clearRect(0, 0, width, height);

    if (mouse.active) {
      // Smooth responsive tracking
      mouse.x += (mouse.targetX - mouse.x) * 0.55;
      mouse.y += (mouse.targetY - mouse.y) * 0.55;

      ribbons.forEach((ribbon, rIdx) => {
        const head = ribbon.points[0];
        const wave = Math.sin(time * 4 + rIdx) * 0.7;
        const targetX = mouse.x + ribbon.offset;
        const targetY = mouse.y + wave;

        head.vx += (targetX - head.x) * ribbon.spring;
        head.vy += (targetY - head.y) * ribbon.spring;
        head.vx *= ribbon.friction;
        head.vy *= ribbon.friction;
        head.x += head.vx;
        head.y += head.vy;

        // Trailing points tightly follow with swift damping
        for (let i = 1; i < ribbon.points.length; i++) {
          const p = ribbon.points[i];
          const prev = ribbon.points[i - 1];
          p.x += (prev.x - p.x) * 0.65;
          p.y += (prev.y - p.y) * 0.65;
        }

        // Draw delicate compressed micro ribbon path
        if (ribbon.points.length > 2) {
          ctx.beginPath();
          ctx.moveTo(ribbon.points[0].x, ribbon.points[0].y);

          for (let i = 1; i < ribbon.points.length - 1; i++) {
            const xc = (ribbon.points[i].x + ribbon.points[i + 1].x) / 2;
            const yc = (ribbon.points[i].y + ribbon.points[i + 1].y) / 2;
            ctx.quadraticCurveTo(ribbon.points[i].x, ribbon.points[i].y, xc, yc);
          }

          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.lineWidth = ribbon.thickness;
          ctx.strokeStyle = ribbon.color;
          ctx.shadowColor = ribbon.color;
          ctx.shadowBlur = 3;
          ctx.globalAlpha = 0.85;
          ctx.stroke();

          // Reset shadows
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      });
    }

    requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
