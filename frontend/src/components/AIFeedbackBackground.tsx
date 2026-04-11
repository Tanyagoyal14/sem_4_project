import { useEffect, useRef } from "react";

function AIFeedbackBackground() {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const nodes = Array.from({ length: 45 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6
    }));

    function draw() {

      ctx.clearRect(0, 0, width, height);

      // SENTIMENT HEATMAP
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        100,
        width / 2,
        height / 2,
        900
      );

      gradient.addColorStop(0, "rgba(34,197,94,0.25)");   // positive
      gradient.addColorStop(0.5, "rgba(250,204,21,0.15)"); // neutral
      gradient.addColorStop(1, "rgba(239,68,68,0.12)");    // negative

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);


      // MOVE + DRAW NODES
      nodes.forEach(n => {

        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.8, 0, Math.PI * 2);

        ctx.fillStyle = "#8b5cf6";
        ctx.shadowColor = "#8b5cf6";
        ctx.shadowBlur = 6;

        ctx.fill();

        ctx.shadowBlur = 0;

      });


      // NEURAL CONNECTIONS
      for (let i = 0; i < nodes.length; i++) {

        for (let j = i + 1; j < nodes.length; j++) {

          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;

          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {

            ctx.strokeStyle = "rgba(139,92,246,0.18)";
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

          }

        }

      }

      requestAnimationFrame(draw);

    }

    draw();


    // HANDLE WINDOW RESIZE
    const handleResize = () => {

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width;
      canvas.height = height;

    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
    />
  );

}

export default AIFeedbackBackground;