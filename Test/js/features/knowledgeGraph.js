/**
 * AURA Interactive Force-Directed Knowledge Graph Visualizer
 * Renders interactive node-link network of concepts, entities, and citations.
 */

export class KnowledgeGraphVisualizer {
  constructor(canvasElement, onNodeClick) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.onNodeClick = onNodeClick;
    this.nodes = [];
    this.links = [];
    this.animId = null;
    this.hoveredNode = null;
    this.draggedNode = null;
    this.pan = { x: 0, y: 0 };
    this.zoom = 1;
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };

    this.initEvents();
  }

  setData(graphData) {
    if (!graphData || !graphData.nodes) return;

    const width = this.canvas.width = this.canvas.parentElement.clientWidth || 400;
    const height = this.canvas.height = this.canvas.parentElement.clientHeight || 300;

    // Position nodes radially around center
    const cx = width / 2;
    const cy = height / 2;

    this.nodes = graphData.nodes.map((node, i) => {
      const angle = (i / graphData.nodes.length) * Math.PI * 2;
      const dist = i === 0 ? 0 : 80 + (i % 3) * 35;
      return {
        ...node,
        x: cx + Math.cos(angle) * dist + (Math.random() - 0.5) * 20,
        y: cy + Math.sin(angle) * dist + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
        radius: node.radius || 18,
        color: this.getNodeColor(node.group)
      };
    });

    this.links = (graphData.links || []).map(link => {
      const sourceNode = this.nodes.find(n => n.id === link.source) || this.nodes[0];
      const targetNode = this.nodes.find(n => n.id === link.target) || this.nodes[1];
      return { source: sourceNode, target: targetNode };
    });

    this.startSimulation();
  }

  getNodeColor(group) {
    switch (group) {
      case 'core': return { fill: '#6366f1', glow: 'rgba(99, 102, 241, 0.6)' };
      case 'principle': return { fill: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' };
      case 'algorithm': return { fill: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)' };
      case 'hardware': return { fill: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' };
      case 'security': return { fill: '#f43f5e', glow: 'rgba(244, 63, 94, 0.6)' };
      default: return { fill: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' };
    }
  }

  startSimulation() {
    if (this.animId) cancelAnimationFrame(this.animId);

    const tick = () => {
      this.updatePhysics();
      this.render();
      this.animId = requestAnimationFrame(tick);
    };
    this.animId = requestAnimationFrame(tick);
  }

  stop() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  updatePhysics() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    // Repulsion between all nodes
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n1 = this.nodes[i];
        const n2 = this.nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy || 1;
        const dist = Math.sqrt(distSq);

        if (dist < 180) {
          const force = (180 - dist) / dist * 0.05;
          if (n1 !== this.draggedNode) { n1.vx -= dx * force; n1.vy -= dy * force; }
          if (n2 !== this.draggedNode) { n2.vx += dx * force; n2.vy += dy * force; }
        }
      }
    }

    // Link spring tension
    for (const link of this.links) {
      if (!link.source || !link.target) continue;
      const dx = link.target.x - link.source.x;
      const dy = link.target.y - link.source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = 90;
      const force = (dist - targetDist) * 0.03;

      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (link.source !== this.draggedNode) {
        link.source.vx += fx;
        link.source.vy += fy;
      }
      if (link.target !== this.draggedNode) {
        link.target.vx -= fx;
        link.target.vy -= fy;
      }
    }

    // Centering gravitation and friction
    for (const node of this.nodes) {
      if (node === this.draggedNode) continue;
      node.vx += (cx - node.x) * 0.005;
      node.vy += (cy - node.y) * 0.005;

      node.vx *= 0.88;
      node.vy *= 0.88;

      node.x += node.vx;
      node.y += node.vy;
    }
  }

  render() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw Links
    ctx.lineWidth = 1.5;
    for (const link of this.links) {
      if (!link.source || !link.target) continue;
      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.stroke();
    }

    // Draw Nodes
    for (const node of this.nodes) {
      const isHovered = this.hoveredNode === node;
      const isDragged = this.draggedNode === node;

      // Glow effect
      ctx.save();
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + (isHovered ? 6 : 2), 0, Math.PI * 2);
      ctx.fillStyle = node.color.glow;
      ctx.shadowColor = node.color.fill;
      ctx.shadowBlur = isHovered ? 18 : 10;
      ctx.fill();
      ctx.restore();

      // Node solid body
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color.fill;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = isHovered || isDragged ? 2.5 : 1;
      ctx.stroke();

      // Text label
      ctx.font = `${isHovered ? '600 11px' : '500 10px'} 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = isHovered ? '#ffffff' : '#cbd5e1';
      ctx.textAlign = 'center';
      ctx.fillText(node.id, node.x, node.y + node.radius + 14);
    }
  }

  initEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
        y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
      };
    };

    const findNodeAt = (pos) => {
      for (let i = this.nodes.length - 1; i >= 0; i--) {
        const n = this.nodes[i];
        const dx = pos.x - n.x;
        const dy = pos.y - n.y;
        if (Math.sqrt(dx * dx + dy * dy) <= n.radius + 5) {
          return n;
        }
      }
      return null;
    };

    this.canvas.addEventListener('mousemove', (e) => {
      const pos = getPos(e);
      if (this.isDragging && this.draggedNode) {
        this.draggedNode.x = pos.x;
        this.draggedNode.y = pos.y;
      } else {
        this.hoveredNode = findNodeAt(pos);
        this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'default';
      }
    });

    this.canvas.addEventListener('mousedown', (e) => {
      const pos = getPos(e);
      const hit = findNodeAt(pos);
      if (hit) {
        this.draggedNode = hit;
        this.isDragging = true;
      }
    });

    window.addEventListener('mouseup', () => {
      this.draggedNode = null;
      this.isDragging = false;
    });

    this.canvas.addEventListener('click', (e) => {
      const pos = getPos(e);
      const hit = findNodeAt(pos);
      if (hit && this.onNodeClick) {
        this.onNodeClick(hit.id);
      }
    });
  }
}
