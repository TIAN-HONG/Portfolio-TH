const canvas = document.querySelector("#portfolioCanvas");
const year = document.querySelector("#year");

year.textContent = new Date().getFullYear();

if (canvas) {
  const ctx = canvas.getContext("2d");
  const palette = ["#0f766e", "#de5b45", "#d8a31d", "#325f9b", "#151516"];
  let animationFrame;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function roundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function drawNode(x, y, size, color, label) {
    ctx.fillStyle = color;
    roundedRect(x, y, size, size, 8);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 14px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + size / 2, y + size / 2);
  }

  function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const now = Date.now() * 0.001;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(21, 21, 22, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 26; x < width; x += 34) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 26; y < height; y += 34) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const nodes = [
      [width * 0.18, height * 0.28, 58, palette[0], "UI"],
      [width * 0.43, height * 0.18, 68, palette[3], "JS"],
      [width * 0.66, height * 0.36, 58, palette[1], "UX"],
      [width * 0.32, height * 0.58, 62, palette[2], "Git"],
      [width * 0.58, height * 0.64, 72, palette[4], "Web"],
    ];

    ctx.strokeStyle = "rgba(21, 21, 22, 0.34)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 10]);
    nodes.forEach((node, index) => {
      const next = nodes[(index + 1) % nodes.length];
      ctx.beginPath();
      ctx.moveTo(node[0] + node[2] / 2, node[1] + node[2] / 2);
      ctx.lineTo(next[0] + next[2] / 2, next[1] + next[2] / 2);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    nodes.forEach((node, index) => {
      const drift = Math.sin(now + index) * 6;
      drawNode(node[0], node[1] + drift, node[2], node[3], node[4]);
    });

    animationFrame = requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
    } else {
      draw();
    }
  });
}
