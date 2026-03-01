// ============================================
// 3D Office Scene - OpenClaw Crab Agents
// Exact match to openclaw.ai SVG logo:
// Cute rounded bell/blob body, two feet, small side claws,
// big dark eyes with cyan pupils, short antennae
// ============================================

var scene, camera, renderer, officeGroup;
var animationId;
var agentMeshes = {};
var clock;

// Camera orbit
var camDist = 22;
var camTheta = 0;
var camPhi = 0.55;
var camTX = 0, camTY = 2, camTZ = 0;
var dragging = false;
var dragLX = 0, dragLY = 0;

function initScene() {
  var canvas = document.getElementById('office-scene');
  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050810);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
  syncCam();

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  officeGroup = new THREE.Group();
  scene.add(officeGroup);

  buildRoom();
  placeAgents();
  addLights();
  addMotes();

  canvas.addEventListener('wheel', function(e) {
    e.preventDefault();
    camDist = Math.max(5, Math.min(45, camDist + e.deltaY * 0.025));
    syncCam();
  }, { passive: false });
  canvas.addEventListener('mousedown', function(e) { dragging = true; dragLX = e.clientX; dragLY = e.clientY; });
  canvas.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    camTheta -= (e.clientX - dragLX) * 0.005;
    camPhi = Math.max(0.1, Math.min(1.5, camPhi + (e.clientY - dragLY) * 0.005));
    dragLX = e.clientX; dragLY = e.clientY;
    syncCam();
  });
  canvas.addEventListener('mouseup', function() { dragging = false; });
  canvas.addEventListener('mouseleave', function() { dragging = false; });
  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  tick();
}

function syncCam() {
  camera.position.set(
    camTX + camDist * Math.sin(camTheta) * Math.cos(camPhi),
    camTY + camDist * Math.sin(camPhi),
    camTZ + camDist * Math.cos(camTheta) * Math.cos(camPhi)
  );
  camera.lookAt(camTX, camTY, camTZ);
}

// =================== ROOM ===================
function buildRoom() {
  // Floor
  var floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x0a0f1a, roughness: 0.15, metalness: 0.8 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  officeGroup.add(floor);

  var grid = new THREE.GridHelper(50, 100, 0x111827, 0x111827);
  grid.position.y = 0.01;
  officeGroup.add(grid);

  // Walls
  var wm = new THREE.MeshStandardMaterial({ color: 0x0a0f1a, roughness: 0.9 });
  var bw = new THREE.Mesh(new THREE.PlaneGeometry(50, 14), wm);
  bw.position.set(0, 7, -16); officeGroup.add(bw);

  var gm = new THREE.MeshStandardMaterial({ color: 0x0a0f1a, transparent: true, opacity: 0.25 });
  var lw = new THREE.Mesh(new THREE.PlaneGeometry(32, 14), gm);
  lw.position.set(-18, 7, 0); lw.rotation.y = Math.PI / 2; officeGroup.add(lw);
  var rw = new THREE.Mesh(new THREE.PlaneGeometry(32, 14), gm);
  rw.position.set(18, 7, 0); rw.rotation.y = -Math.PI / 2; officeGroup.add(rw);

  // Back screen
  var scr = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 4.5),
    new THREE.MeshBasicMaterial({ color: 0xff4d4d, transparent: true, opacity: 0.05 })
  );
  scr.position.set(0, 7, -15.9); officeGroup.add(scr);
  var brd = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(14.2, 4.7)),
    new THREE.LineBasicMaterial({ color: 0xff4d4d, transparent: true, opacity: 0.3 })
  );
  brd.position.set(0, 7, -15.85); officeGroup.add(brd);

  // Ceiling strips
  for (var i = -12; i <= 12; i += 6) {
    var s = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.03, 30),
      new THREE.MeshBasicMaterial({ color: 0xff4d4d, transparent: true, opacity: 0.06 })
    );
    s.position.set(i, 9, 0); officeGroup.add(s);
  }
}

// =================== DESK ===================
function makeDesk(x, z) {
  var g = new THREE.Group();
  g.position.set(x, 0, z);
  var dm = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.7, roughness: 0.25 });
  var lm = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 });

  var top = new THREE.Mesh(new THREE.BoxGeometry(3, 0.06, 1.5), dm);
  top.position.set(0, 0.85, 0); top.castShadow = true; g.add(top);

  // Edge glow
  var eg = new THREE.Mesh(new THREE.BoxGeometry(3.02, 0.018, 0.018), new THREE.MeshBasicMaterial({ color: 0xff4d4d, transparent: true, opacity: 0.2 }));
  eg.position.set(0, 0.88, 0.76); g.add(eg);

  // Legs
  var lps = [[-1.4, 0.42, -0.65], [1.4, 0.42, -0.65], [-1.4, 0.42, 0.65], [1.4, 0.42, 0.65]];
  for (var i = 0; i < 4; i++) {
    var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.84), lm);
    leg.position.set(lps[i][0], lps[i][1], lps[i][2]); g.add(leg);
  }

  // Monitor
  var mon = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.8, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x050810, emissive: 0x00e5cc, emissiveIntensity: 0.03 }));
  mon.position.set(0, 1.45, -0.5); g.add(mon);
  var sg = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.7), new THREE.MeshBasicMaterial({ color: 0x00e5cc, transparent: true, opacity: 0.04 }));
  sg.position.set(0, 1.45, -0.47); g.add(sg);
  var st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.3), lm);
  st.position.set(0, 1.0, -0.5); g.add(st);

  // Keyboard
  var kb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.015, 0.24), dm);
  kb.position.set(0, 0.89, 0.15); g.add(kb);

  officeGroup.add(g);
}

// =================== CRAB (exact OpenClaw logo in 3D) ===================
// The logo is a cute rounded bell/blob with:
// - Big rounded body (like a Pac-Man ghost shape)
// - Two small feet at the bottom
// - Two small teardrop claws on the sides
// - Two big dark circular eyes with tiny cyan glowing pupils
// - Two short curved antennae on top
// Scale: making them about 1.5 units tall to be visible

function makeCrab(agent, x, z) {
  var g = new THREE.Group();
  g.position.set(x, 1.1, z + 0.55);
  g.userData = {
    id: agent.id,
    phase: Math.random() * 6.28,
    br: 1.0 + Math.random() * 0.3,
    sr: 0.5 + Math.random() * 0.3,
  };

  var col = new THREE.Color(agent.color);
  var S = 1.0; // scale factor

  // ---- BODY: Rounded bell shape ----
  // Use a lathe geometry to create the exact bell/ghost profile from the SVG
  // SVG profile (normalized to 0-1, x=radius from center, y=height from bottom):
  // Top is narrow, widens in middle, narrows slightly at bottom with two feet
  var bodyPts = [];
  // Build the right-side profile of the bell shape
  // Going from bottom to top:
  bodyPts.push(new THREE.Vector2(0.0,  0.0));   // center bottom
  bodyPts.push(new THREE.Vector2(0.15, 0.0));   // foot area - slight gap
  bodyPts.push(new THREE.Vector2(0.2,  0.05));  // foot top
  bodyPts.push(new THREE.Vector2(0.3,  0.08));  // above feet
  bodyPts.push(new THREE.Vector2(0.5,  0.15));  // widening
  bodyPts.push(new THREE.Vector2(0.6,  0.25));  // wider
  bodyPts.push(new THREE.Vector2(0.65, 0.4));   // widest point
  bodyPts.push(new THREE.Vector2(0.62, 0.55));  // starting to narrow
  bodyPts.push(new THREE.Vector2(0.55, 0.7));   // narrowing
  bodyPts.push(new THREE.Vector2(0.42, 0.82));  // near top
  bodyPts.push(new THREE.Vector2(0.3,  0.9));   // rounding top
  bodyPts.push(new THREE.Vector2(0.15, 0.95));  // almost top
  bodyPts.push(new THREE.Vector2(0.0,  0.98));  // top center

  var bodyGeo = new THREE.LatheGeometry(bodyPts, 24);
  bodyGeo.scale(S, S * 1.4, S);
  var bodyMat = new THREE.MeshStandardMaterial({
    color: col, roughness: 0.25, metalness: 0.45,
    emissive: col, emissiveIntensity: 0.12
  });
  var body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = -0.3;
  body.castShadow = true;
  body.userData.t = 'body';
  g.add(body);

  // Shell highlight (cute glossy top)
  var shGeo = new THREE.LatheGeometry(bodyPts, 20);
  shGeo.scale(S * 0.92, S * 1.35, S * 0.92);
  var shMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.1, metalness: 0.4,
    transparent: true, opacity: 0.1
  });
  var sh = new THREE.Mesh(shGeo, shMat);
  sh.position.y = -0.25;
  g.add(sh);

  // ---- FEET (two small cylinder stubs at bottom, like the SVG) ----
  var footMat = new THREE.MeshStandardMaterial({ color: col.getHex(), roughness: 0.3, metalness: 0.45 });
  var footL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.15, 8), footMat);
  footL.position.set(-0.2, -0.35, 0);
  g.add(footL);
  var footR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.15, 8), footMat);
  footR.position.set(0.2, -0.35, 0);
  g.add(footR);

  // ---- EYES (big dark circles, exactly like SVG) ----
  // SVG eyes: circles at ~37.5% and 62.5% of width, at ~25% from top
  // In our model: positioned on the front face
  var eyeBg = new THREE.MeshStandardMaterial({ color: 0x050810, roughness: 0.1, metalness: 0.2 });
  var pupMat = new THREE.MeshBasicMaterial({ color: 0x00e5cc });

  // Left eye
  var eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), eyeBg);
  eyeL.position.set(-0.24, 0.65, 0.48);
  eyeL.scale.set(1, 1, 0.5); // flatten into face
  g.add(eyeL);
  var pupL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), pupMat);
  pupL.position.set(-0.22, 0.66, 0.54);
  pupL.userData.t = 'pupil';
  g.add(pupL);

  // Right eye
  var eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), eyeBg);
  eyeR.position.set(0.24, 0.65, 0.48);
  eyeR.scale.set(1, 1, 0.5);
  g.add(eyeR);
  var pupR = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), pupMat);
  pupR.position.set(0.22, 0.66, 0.54);
  pupR.userData.t = 'pupil';
  g.add(pupR);

  // ---- ANTENNAE (short curved strokes on top, like SVG) ----
  // SVG: M45 15 Q35 5 30 8 and M75 15 Q85 5 90 8
  // Short curves going outward and slightly up from top of head
  var antMat = new THREE.MeshBasicMaterial({ color: col.getHex(), transparent: true, opacity: 0.8 });

  for (var side = -1; side <= 1; side += 2) {
    var pts = [
      new THREE.Vector3(side * 0.12, 1.05, 0.15),  // base on head
      new THREE.Vector3(side * 0.25, 1.2, 0.1),     // curving out and up
      new THREE.Vector3(side * 0.38, 1.15, 0.05),   // tip curving slightly back down
    ];
    var curve = new THREE.CatmullRomCurve3(pts);
    var tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 8, 0.02, 6, false),
      antMat
    );
    g.add(tube);

    // Antenna tip dot
    var tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 8, 8),
      new THREE.MeshBasicMaterial({ color: col.getHex(), transparent: true, opacity: 0.7 })
    );
    tip.position.copy(pts[2]);
    tip.userData.t = 'tip';
    g.add(tip);
  }

  // ---- CLAWS (small teardrop pincers on sides, like SVG) ----
  // SVG claws are small teardrop shapes positioned at the sides
  // Left: centered around x=15, y=52 in normalized coords
  // Right: mirror
  var clawMat = new THREE.MeshStandardMaterial({
    color: col, roughness: 0.25, metalness: 0.5,
    emissive: col, emissiveIntensity: 0.08
  });

  for (var side = -1; side <= 1; side += 2) {
    var cg = new THREE.Group();
    cg.position.set(side * 0.65, 0.35, 0.1);
    cg.userData.t = 'claw';
    cg.userData.side = side;

    // Teardrop claw shape - use a sphere squished into a teardrop
    var clawBody = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), clawMat);
    clawBody.scale.set(0.7, 1.0, 0.65);
    clawBody.position.set(side * 0.05, 0, 0);
    cg.add(clawBody);

    // Pincer tips (two small prongs)
    var tipUp = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.12, 6), clawMat);
    tipUp.rotation.z = side * 0.6;
    tipUp.position.set(side * 0.14, 0.08, 0);
    tipUp.userData.t = 'upincer';
    cg.add(tipUp);

    var tipLo = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.1, 6), clawMat);
    tipLo.rotation.z = side * -0.5;
    tipLo.position.set(side * 0.12, -0.06, 0);
    tipLo.userData.t = 'lpincer';
    cg.add(tipLo);

    g.add(cg);
  }

  // ---- GLOW RING (status indicator) ----
  var ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.75, 0.012, 8, 48),
    new THREE.MeshBasicMaterial({ color: col.getHex(), transparent: true, opacity: 0.15 })
  );
  ring.position.y = -0.42;
  ring.rotation.x = Math.PI / 2;
  ring.userData.t = 'ring';
  g.add(ring);

  // ---- NAME TAG ----
  var tagTex = makeNameTex(agent.name, agent.role, agent.color);
  var tagMat = new THREE.SpriteMaterial({ map: tagTex, transparent: true });
  var tag = new THREE.Sprite(tagMat);
  tag.position.y = 1.8;
  tag.scale.set(3, 1, 1);
  tag.userData.t = 'tag';
  g.add(tag);

  agentMeshes[agent.id] = g;
  officeGroup.add(g);
}

function makeNameTex(name, role, color) {
  var c = document.createElement('canvas');
  c.width = 800; c.height = 256;
  var ctx = c.getContext('2d');

  rrect(ctx, 60, 16, 680, 224, 32);
  ctx.fillStyle = 'rgba(5, 8, 16, 0.9)';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.font = 'bold 80px -apple-system, BlinkMacSystemFont, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f0f4ff';
  ctx.fillText(name, 400, 120);

  ctx.font = '600 44px -apple-system, BlinkMacSystemFont, Arial, sans-serif';
  ctx.fillStyle = color;
  ctx.fillText(role, 400, 195);

  var tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// =================== PLACE AGENTS ===================
function placeAgents() {
  var spots = [
    [0,  -7],   // Rick
    [-6, -3],   // Morgan
    [6,  -3],   // Victoria
    [-6,  3],   // Ethan
    [6,   3],   // Harper
    [-3,  7],   // Jordan
    [3,   7],   // Avery
    [0,   3],   // Quinn
  ];
  for (var i = 0; i < AGENTS.length; i++) {
    makeDesk(spots[i][0], spots[i][1]);
    makeCrab(AGENTS[i], spots[i][0], spots[i][1]);
  }
}

// =================== LIGHTS ===================
function addLights() {
  scene.add(new THREE.AmbientLight(0x1a2540, 1.5));
  var main = new THREE.PointLight(0xffffff, 2.0, 40);
  main.position.set(0, 12, 0); main.castShadow = true; scene.add(main);

  var fps = [[-8,9,-4],[8,9,-4],[-8,9,4],[8,9,4],[0,9,0]];
  for (var i = 0; i < fps.length; i++) {
    var fl = new THREE.PointLight(0xffffff, 0.4, 16);
    fl.position.set(fps[i][0], fps[i][1], fps[i][2]); scene.add(fl);
  }

  var cl = new THREE.PointLight(0xff4d4d, 0.6, 25);
  cl.position.set(0, 6, -14); scene.add(cl);
  var cy = new THREE.PointLight(0x00e5cc, 0.4, 22);
  cy.position.set(8, 5, 8); scene.add(cy);
  var cy2 = new THREE.PointLight(0x00e5cc, 0.3, 20);
  cy2.position.set(-8, 5, -5); scene.add(cy2);
}

// =================== PARTICLES ===================
function addMotes() {
  var n = 400;
  var pos = new Float32Array(n * 3);
  var cols = new Float32Array(n * 3);
  var coral = new THREE.Color(0xff4d4d);
  var cyan = new THREE.Color(0x00e5cc);
  for (var i = 0; i < n; i++) {
    pos[i*3] = (Math.random()-0.5)*40;
    pos[i*3+1] = Math.random()*12;
    pos[i*3+2] = (Math.random()-0.5)*32;
    var c = Math.random()>0.5 ? coral.clone() : cyan.clone();
    c.multiplyScalar(0.4+Math.random()*0.6);
    cols[i*3]=c.r; cols[i*3+1]=c.g; cols[i*3+2]=c.b;
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  var pts = new THREE.Points(geo, new THREE.PointsMaterial({
    size:0.06, transparent:true, opacity:0.35, blending:THREE.AdditiveBlending, vertexColors:true
  }));
  pts.userData.t = 'particles';
  scene.add(pts);
}

// =================== ANIMATION ===================
function tick() {
  animationId = requestAnimationFrame(tick);
  var t = clock.getElapsedTime();

  for (var id in agentMeshes) {
    var g = agentMeshes[id];
    var ud = g.userData;
    var p = ud.phase;

    for (var ci = 0; ci < g.children.length; ci++) {
      var ch = g.children[ci];
      var ct = ch.userData ? ch.userData.t : null;

      // Body: gentle breathing/bounce (like the SVG hover animation)
      if (ct === 'body') {
        var breathe = Math.sin(t * ud.br + p) * 0.012;
        ch.scale.y = 1.4 * (1 + breathe);
        ch.position.y = -0.3 + Math.sin(t * 0.8 + p) * 0.02;
      }

      // Eyes look around
      if (ct === 'pupil') {
        ch.position.z += Math.sin(t * 0.6 + p) * 0.0008;
        ch.position.x += Math.sin(t * 0.4 + p + 1) * 0.0004;
      }

      // Claw snap (matches SVG: clawSnap 4s ease-in-out, rotate)
      if (ct === 'claw') {
        var side = ch.userData.side;
        var cycle = ((t * ud.sr + p + (side > 0 ? 0.5 : 0)) % 4) / 4;
        var rot = 0;
        if (cycle > 0.85 && cycle < 0.92) {
          rot = ((cycle - 0.85) / 0.07) * 0.35;
        } else if (cycle >= 0.92) {
          rot = ((1 - (cycle - 0.92) / 0.08)) * 0.35;
        }
        ch.rotation.z = side * rot;

        // Subtle sway
        ch.rotation.y = Math.sin(t * 0.3 + p + side) * 0.08;
      }

      // Ring pulse
      if (ct === 'ring') {
        ch.rotation.z = t * 0.3 + p;
        ch.material.opacity = 0.12 + Math.sin(t * 1.5 + p) * 0.06;
      }

      // Name tag float
      if (ct === 'tag') {
        ch.position.y = 1.8 + Math.sin(t * 0.5 + p) * 0.06;
      }

      // Antenna tips pulse
      if (ct === 'tip') {
        ch.material.opacity = 0.5 + Math.sin(t * 2 + p) * 0.3;
        var s = 1 + Math.sin(t * 2 + p) * 0.2;
        ch.scale.set(s, s, s);
      }
    }

    // Whole crab gentle hover/bob
    g.position.y = 1.1 + Math.sin(t * 0.7 + p) * 0.025;
    // Subtle idle sway
    g.rotation.y = Math.sin(t * 0.25 + p) * 0.03;
  }

  // Particles
  scene.traverse(function(obj) {
    if (obj.userData && obj.userData.t === 'particles') {
      var pa = obj.geometry.attributes.position.array;
      for (var i = 0; i < pa.length; i += 3) {
        pa[i+1] += Math.sin(t*0.4+i)*0.0005;
        pa[i] += Math.cos(t*0.2+i*0.3)*0.0002;
        if (pa[i+1] > 12) pa[i+1] = 0;
      }
      obj.geometry.attributes.position.needsUpdate = true;
    }
  });

  renderer.render(scene, camera);
}

function highlightAgent3D(agentId) {
  for (var id in agentMeshes) {
    var g = agentMeshes[id];
    for (var ci = 0; ci < g.children.length; ci++) {
      var ch = g.children[ci];
      if (ch.userData && ch.userData.t === 'body' && ch.material) {
        ch.material.emissiveIntensity = (id === agentId) ? 0.4 : 0.12;
      }
      if (ch.userData && ch.userData.t === 'ring' && ch.material) {
        ch.material.opacity = (id === agentId) ? 0.4 : 0.12;
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  try {
    initScene();
    console.log('ClawOps HQ loaded');
  } catch(e) {
    console.error('Scene error:', e);
    document.body.innerHTML = '<div style="color:#ff4d4d;padding:40px;font-size:18px">Error: ' + e.message + '</div>';
  }
});
