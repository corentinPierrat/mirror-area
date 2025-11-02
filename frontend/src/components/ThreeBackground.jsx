import React, { useRef, useEffect } from "react";

const FlowFieldBackground = ({ width = 800, height = 600, color1 = "#6b5bff", color2 = "#4bd1ff" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    let particles = [];
    const numParticles = 200;
    const tail = 50;
    let time = 0;

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.lx = x;
        this.ly = y;
        this.vx = 0;
        this.vy = 0;
      }
      update() {
        const angle = Math.sin(this.y * 0.01 + time * 0.002) * Math.PI * 2;
        const speed = 0.2;
        this.vx += Math.cos(angle) * 0.01;
        this.vy += Math.sin(angle) * 0.01;
        this.x += this.vx * speed;
        this.y += this.vy * speed;
        this.vx *= 0.95;
        this.vy *= 0.95;
      }
      draw() {
        ctx.beginPath();
        ctx.moveTo(this.lx, this.ly);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsla(${Math.random() * 360}, 80%, 60%, 0.3)`;
        ctx.lineWidth = 1;
        ctx.stroke();
        this.lx = this.x;
        this.ly = this.y;
      }
    }

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle(Math.random() * width, Math.random() * height));
    }

    const animate = () => {
      time++;
      ctx.fillStyle = "rgba(10,10,20,0.1)";
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [width, height, color1, color2]);

  return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />;
};

export default FlowFieldBackground;
