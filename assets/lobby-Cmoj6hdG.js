import{w as L,x as S}from"./api-Bi5SAFn_.js";let a=null,l=null,b=null,u=0;const I=3e4;document.addEventListener("DOMContentLoaded",()=>{if(a=new URLSearchParams(window.location.search).get("studio"),!a){M("No studio specified. Use ?studio=<slug>");return}_(),setInterval(_,1e3),f(),E(),setInterval(()=>f(),6e4)});async function f(){const e=await L(a);if(!e.ok){B();return}v(e.data)}function v(e){const t=document.getElementById("lobbyStudioName");t&&e.studio_name&&(t.textContent=e.studio_name),e.goal&&i(e.goal),e.athlete_of_week&&s(e.athlete_of_week),e.leaderboard&&c(e.leaderboard),e.challenges&&d(e.challenges)}function i(e){const t=document.getElementById("lobbyGoalName"),o=document.getElementById("lobbyGoalFill"),n=document.getElementById("lobbyGoalCurrent"),r=document.getElementById("lobbyGoalTarget"),m=document.getElementById("lobbyGoalPct");if(!e)return;const y=Math.min((e.current||0)/(e.target||1)*100,100);t&&(t.textContent=e.name||"Weekly Goal"),o&&(o.style.width=`${y}%`),n&&(n.textContent=(e.current||0).toLocaleString()),r&&(r.textContent=(e.target||0).toLocaleString()),m&&(m.textContent=`${Math.round(y)}%`)}function s(e){const t=document.getElementById("lobbyAthleteAvatar"),o=document.getElementById("lobbyAthleteName"),n=document.getElementById("lobbyAthleteScore");e&&(t&&(t.textContent=C(e.name||"??")),o&&(o.textContent=e.name||"Unknown"),n&&(n.textContent=`RES ${(e.score||0).toFixed(1)}`))}function c(e){const t=document.getElementById("lobbyLBList");if(!t)return;if(!e||e.length===0){t.innerHTML='<div class="lobby__lb-empty">No entries yet this week</div>';return}const o=e.slice(0,5);t.innerHTML=o.map((n,r)=>`
    <div class="lobby__lb-row ${r===0?"lobby__lb-row--first":""}">
      <div class="lobby__lb-rank">${r+1}</div>
      <div class="lobby__lb-avatar">${C(n.name||n.display_name||"??")}</div>
      <div class="lobby__lb-name">${n.name||n.display_name||"Anonymous"}</div>
      <div class="lobby__lb-score">${(n.score||n.res_score||0).toFixed(1)}</div>
    </div>
  `).join("")}function d(e){const t=document.getElementById("lobbyChallengesList");if(t){if(!e||e.length===0){t.innerHTML='<div class="lobby__lb-empty">No active challenges</div>';return}t.innerHTML=e.map(o=>{const n=Math.min((o.current||0)/(o.target||1)*100,100);return`
      <div class="lobby__challenge">
        <div class="lobby__challenge-name">${o.name||"Challenge"}</div>
        <div class="lobby__challenge-bar">
          <div class="lobby__challenge-fill" style="width: ${n}%"></div>
        </div>
        <div class="lobby__challenge-meta">
          <span>${(o.current||0).toLocaleString()} / ${(o.target||0).toLocaleString()}</span>
          <span>${Math.round(n)}%</span>
        </div>
      </div>
    `}).join("")}}function E(){l&&l.close(),p();try{l=S(a),l.onopen=()=>{u=0,p()},l.onmessage=e=>{try{const t=JSON.parse(e.data);w(t)}catch{}},l.addEventListener("goal",e=>{try{i(JSON.parse(e.data))}catch{}}),l.addEventListener("leaderboard",e=>{try{c(JSON.parse(e.data))}catch{}}),l.addEventListener("athlete",e=>{try{s(JSON.parse(e.data))}catch{}}),l.addEventListener("challenges",e=>{try{d(JSON.parse(e.data))}catch{}}),l.onerror=()=>{h(),g()}}catch{h(),g()}}function w(e){e.type==="full"?v(e):e.type==="goal"?i(e.goal||e):e.type==="leaderboard"?c(e.leaderboard||e.entries):e.type==="athlete"?s(e.athlete_of_week||e):e.type==="challenges"&&d(e.challenges||e)}function g(){if(b)return;u++;const e=Math.min(1e3*Math.pow(2,u),I);b=setTimeout(()=>{b=null,E()},e)}function h(){const e=document.getElementById("lobbyConnection");e&&(e.style.display="flex")}function p(){const e=document.getElementById("lobbyConnection");e&&(e.style.display="none")}function B(){const e=document.getElementById("lobbyStudioName");e&&(e.textContent="CorePower Pilates"),i({name:"March Burn Challenge",current:3420,target:5e3}),s({name:"Jake Rodriguez",score:91.4}),c([{name:"Jake R.",score:91.4},{name:"Maya K.",score:87.2},{name:"Alex L.",score:84.9},{name:"Sarah M.",score:79.8},{name:"Chris P.",score:76.1}]),d([{name:"February Burn Challenge",current:3420,target:5e3},{name:"Step It Up",current:72400,target:1e5},{name:"Recovery Warriors",current:78,target:85}])}function C(e){return e?e.split(" ").map(t=>t[0]).join("").substring(0,2).toUpperCase():"??"}function _(){const e=document.getElementById("lobbyTime");if(!e)return;const t=new Date;e.textContent=t.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}function M(e){const t=document.getElementById("lobby");t&&(t.innerHTML=`
      <div class="lobby__error">
        <div class="lobby__error-icon">⚠️</div>
        <div class="lobby__error-message">${e}</div>
      </div>
    `)}
