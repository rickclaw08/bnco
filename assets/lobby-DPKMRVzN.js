import{Y as S,Z as C}from"./api-D5AyNnuU.js";let s=null,l=null,b=null,u=0;const I=3e4;document.addEventListener("DOMContentLoaded",()=>{if(s=new URLSearchParams(window.location.search).get("studio"),!s){N("No studio specified. Use ?studio=<slug>");return}h(),setInterval(h,1e3),f(),E(),setInterval(()=>f(),6e4)});async function f(){const e=await S(s);if(!e.ok){B();return}v(e.data)}function v(e){const t=document.getElementById("lobbyStudioName");t&&e.studio_name&&(t.textContent=e.studio_name),e.goal&&a(e.goal),e.athlete_of_week&&c(e.athlete_of_week),e.leaderboard&&r(e.leaderboard),e.challenges&&d(e.challenges)}function a(e){const t=document.getElementById("lobbyGoalName"),o=document.getElementById("lobbyGoalFill"),n=document.getElementById("lobbyGoalCurrent"),i=document.getElementById("lobbyGoalTarget"),m=document.getElementById("lobbyGoalPct");if(!e)return;const y=Math.min((e.current||0)/(e.target||1)*100,100);t&&(t.textContent=e.name||"Weekly Goal"),o&&(o.style.width=`${y}%`),n&&(n.textContent=(e.current||0).toLocaleString()),i&&(i.textContent=(e.target||0).toLocaleString()),m&&(m.textContent=`${Math.round(y)}%`)}function c(e){const t=document.getElementById("lobbyAthleteAvatar"),o=document.getElementById("lobbyAthleteName"),n=document.getElementById("lobbyAthleteScore");e&&(t&&(t.textContent=L(e.name||"??")),o&&(o.textContent=e.name||"Unknown"),n&&(n.textContent=`RES ${(e.score||0).toFixed(1)}`))}function r(e){const t=document.getElementById("lobbyLBList");if(!t)return;if(!e||e.length===0){t.innerHTML='<div class="lobby__lb-empty">No entries yet this week</div>';return}const o=e.slice(0,5);t.innerHTML=o.map((n,i)=>`
    <div class="lobby__lb-row ${i===0?"lobby__lb-row--first":""}">
      <div class="lobby__lb-rank">${i+1}</div>
      <div class="lobby__lb-avatar">${L(n.name||n.display_name||"??")}</div>
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
    `}).join("")}}function E(){l&&l.close(),p();try{l=C(s),l.onopen=()=>{u=0,p()},l.onmessage=e=>{try{const t=JSON.parse(e.data);w(t)}catch{}},l.addEventListener("goal",e=>{try{a(JSON.parse(e.data))}catch{}}),l.addEventListener("leaderboard",e=>{try{r(JSON.parse(e.data))}catch{}}),l.addEventListener("athlete",e=>{try{c(JSON.parse(e.data))}catch{}}),l.addEventListener("challenges",e=>{try{d(JSON.parse(e.data))}catch{}}),l.onerror=()=>{_(),g()}}catch{_(),g()}}function w(e){e.type==="full"?v(e):e.type==="goal"?a(e.goal||e):e.type==="leaderboard"?r(e.leaderboard||e.entries):e.type==="athlete"?c(e.athlete_of_week||e):e.type==="challenges"&&d(e.challenges||e)}function g(){if(b)return;u++;const e=Math.min(1e3*Math.pow(2,u),I);b=setTimeout(()=>{b=null,E()},e)}function _(){const e=document.getElementById("lobbyConnection");e&&(e.style.display="flex")}function p(){const e=document.getElementById("lobbyConnection");e&&(e.style.display="none")}function B(){const e=document.getElementById("lobbyStudioName");e&&(e.textContent="Your Studio"),a({name:"No goals set yet",current:0,target:1}),c({name:"Welcome",score:0}),r([]),d([])}function L(e){return e?e.split(" ").map(t=>t[0]).join("").substring(0,2).toUpperCase():"??"}function h(){const e=document.getElementById("lobbyTime");if(!e)return;const t=new Date;e.textContent=t.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}function N(e){const t=document.getElementById("lobby");t&&(t.innerHTML=`
      <div class="lobby__error">
        <div class="lobby__error-icon">⚠️</div>
        <div class="lobby__error-message">${e}</div>
      </div>
    `)}
