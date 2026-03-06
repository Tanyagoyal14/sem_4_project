import { useEffect, useRef } from "react";

function AIFeedbackBackground() {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5
    }));

    function draw() {

      ctx.clearRect(0,0,canvas.width,canvas.height);

      // sentiment heatmap glow
      const gradient = ctx.createRadialGradient(
        canvas.width/2,
        canvas.height/2,
        100,
        canvas.width/2,
        canvas.height/2,
        800
      );

      gradient.addColorStop(0,"rgba(0,255,150,0.2)");
      gradient.addColorStop(0.5,"rgba(255,200,0,0.15)");
      gradient.addColorStop(1,"rgba(255,0,80,0.1)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0,0,canvas.width,canvas.height);

      // draw nodes
      nodes.forEach(n => {

        n.x += n.vx;
        n.y += n.vy;

        if(n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if(n.y < 0 || n.y > canvas.height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x,n.y,2,0,Math.PI*2);
        ctx.fillStyle = "#8b5cf6";
        ctx.fill();

      });

      // draw neural connections
      for(let i=0;i<nodes.length;i++){

        for(let j=i+1;j<nodes.length;j++){

          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx*dx+dy*dy);

          if(dist < 120){

            ctx.strokeStyle = "rgba(139,92,246,0.2)";
            ctx.beginPath();
            ctx.moveTo(nodes[i].x,nodes[i].y);
            ctx.lineTo(nodes[j].x,nodes[j].y);
            ctx.stroke();

          }

        }

      }

      requestAnimationFrame(draw);

    }

    draw();

  },[]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10"
    />
  );

}

export default AIFeedbackBackground;