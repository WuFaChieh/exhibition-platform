// script.js — 整合版（收藏 + 評分 + 搜尋/分類 + 廣告輪播 + 側欄）
// 注意：請確保 HTML 中有 #exhibition-list, #search, #ad-track, #prev-ad, #next-ad, #ad-dots, #hamburger, #sidebar, #close-btn

(() => {
  // ---------- Helper: localStorage for collects ----------
  function getCollects() {
    try { return JSON.parse(localStorage.getItem("collects")) || []; }
    catch { return []; }
  }
  function saveCollects(arr) { localStorage.setItem("collects", JSON.stringify(arr)); }
  function isCollected(id) { return getCollects().includes(String(id)); }

  // ---------- Helper: localStorage for ratings ----------
  function getRatings() {
    try { return JSON.parse(localStorage.getItem("starRatings")) || {}; }
    catch { return {}; }
  }
  function saveRatings(obj) { localStorage.setItem("starRatings", JSON.stringify(obj)); }

  // ---------- Render helper: renderStars ----------
  function renderStars(score) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      html += `<span class="star ${i <= score ? "active" : ""}" data-star="${i}">★</span>`;
    }
    return html;
  }

  // ---------- Main renderList (cards) ----------
  function renderList(items) {
    const container = document.getElementById("exhibition-list");
    if (!container) return;
    const ratings = getRatings();

    container.innerHTML = items
      .map(item => {
        const id = item.id;
        const fav = isCollected(id);
        const score = ratings[id] || 0;

        return `
        <div class="card">
          <span class="col-icon ${fav ? "active" : ""}" data-id="${id}">
            ${fav ? "❤️" : "🖤"}
          </span>

          <div class="img-wrapper">
            <img src="${item.image}" alt="${escapeHtml(item.title)}">
            <div class="rating" data-id="${id}">
              ${renderStars(score)}
            </div>
          </div>

          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.date || "")}</p>
          <p class="cat">分類：${escapeHtml(item.category || "")}</p>
          <a href="detail.html?id=${encodeURIComponent(id)}">查看更多</a>
        </div>`;
      })
      .join("");
  }

  // ---------- Utility: escapeHtml ----------
  function escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ---------- Global variables ----------
  let allExhibitions = [];

  // ---------- DOM ready ----------
  document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    const hamburger = document.getElementById("hamburger");
    const sidebar = document.getElementById("sidebar");
    const closeBtn = document.getElementById("close-btn");

    // ---------- Fetch data (single source) ----------
    fetch("exhibitions.json")
      .then(res => {
        if (!res.ok) throw new Error("fetch exhibitions.json failed: " + res.status);
        return res.json();
      })
      .then(data => {
        allExhibitions = Array.isArray(data) ? data : [];
        renderList(allExhibitions);

        // 搜尋監聽（共用 renderList）
        if (searchInput) {
          searchInput.addEventListener("input", () => {
            const keyword = (searchInput.value || "").toLowerCase();
            const filtered = allExhibitions.filter(item =>
              (item.title || "").toLowerCase().includes(keyword) ||
              (item.category || "").toLowerCase().includes(keyword)
            );
            renderList(filtered);
          });
        }
      })
      .catch(err => {
        console.error(err);
        const container = document.getElementById("exhibition-list");
        if (container) container.innerHTML = "<p>資料讀取失敗，請稍後再試。</p>";
      });

    // ---------- 側欄綁定 ----------
    if (hamburger && sidebar) {
      hamburger.addEventListener("click", () => sidebar.classList.add("active"));
    }
    if (closeBtn && sidebar) {
      closeBtn.addEventListener("click", () => sidebar.classList.remove("active"));
    }
  }); // DOMContentLoaded end

  // ---------- Delegated click handlers (收藏、評分、分類按鈕) ----------
  document.addEventListener("click", (e) => {
    const t = e.target;

    // 收藏（col-icon）
    if (t.classList.contains("col-icon")) {
      const id = String(t.dataset.id);
      let collects = getCollects();
      if (collects.includes(id)) {
        collects = collects.filter(x => x !== id);
        t.classList.remove("active");
        t.textContent = "🖤";
      } else {
        collects.push(id);
        t.classList.add("active");
        t.textContent = "❤️";
      }
      saveCollects(collects);
      return;
    }

    // 評分（star）
    if (t.classList.contains("star")) {
      const ratingDiv = t.closest(".rating");
      if (!ratingDiv) return;
      const id = ratingDiv.dataset.id;
      const clickedIndex = Array.from(ratingDiv.children).indexOf(t) + 1;

      const ratings = getRatings();
      ratings[id] = clickedIndex;
      saveRatings(ratings);

      // 立即更新該 ratingDiv 的 HTML
      ratingDiv.innerHTML = renderStars(clickedIndex);
      return;
    }

    // 分類按鈕（cat-btn）: 若你用委派也可處理這裡，否則已有單獨監聽
    if (t.classList.contains("cat-btn")) {
      const cat = t.dataset.cat;
      if (cat === "all") {
        renderList(allExhibitions);
      } else {
        const filtered = allExhibitions.filter(item => item.category === cat);
        renderList(filtered);
      }
      return;
    }
  });

  // ---------- Advertisement carousel ----------
  // Elements may not exist on pages without ads; guard them
  const adTrack = document.getElementById("ad-track");
  const prevBtn = document.getElementById("prev-ad");
  const nextBtn = document.getElementById("next-ad");
  const dotsBox = document.getElementById("ad-dots");

  if (adTrack && dotsBox && prevBtn && nextBtn) {
    const ads = [
      "img/廣告1.png",
      "img/廣告2.png",
      "img/廣告3.png"
    ];

    // build slides
    adTrack.innerHTML = "";
    ads.forEach(src => {
      const slide = document.createElement("div");
      slide.className = "ad-slide";
      slide.innerHTML = `<img src="${src}" alt="ad">`;
      adTrack.appendChild(slide);
    });

    // build dots
    dotsBox.innerHTML = "";
    ads.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.className = "ad-dot";
      dot.dataset.index = i;
      dot.addEventListener("click", () => {
        showAd(i);
        resetTimer();
      });
      dotsBox.appendChild(dot);
    });

    let dots = dotsBox.querySelectorAll(".ad-dot");
    let index = 0;
    const total = ads.length;

    function showAd(i) {
      index = (i + total) % total;
      adTrack.style.transform = `translateX(-${index * 100}%)`;
      updateDots();
    }

    function updateDots() {
      dots = dotsBox.querySelectorAll(".ad-dot");
      dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    }

    let autoTimer = setInterval(() => showAd(index + 1), 5000);

    function resetTimer() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => showAd(index + 1), 5000);
    }

    prevBtn.addEventListener("click", () => { showAd(index - 1); resetTimer(); });
    nextBtn.addEventListener("click", () => { showAd(index + 1); resetTimer(); });

    // init
    showAd(0);
  }

  // ---------- Ensure renderList includes rating stars even when items updated externally ----------
  // If you have other code that modifies DOM, call applyRatings() to refresh rating visuals.
  function applyRatings() {
    document.querySelectorAll(".rating").forEach(div => {
      const id = div.dataset.id;
      const score = (getRatings()[id]) || 0;
      div.innerHTML = renderStars(score);
    });
  }

  // expose applyRatings if needed globally (optional)
  window.applyRatings = applyRatings;

})();

//鈴鐺
const bell = document.querySelector(".notify-bell");
const panel = document.getElementById("notify-panel");
const count = document.getElementById("notify-count");

let panelVisible = false;

bell.addEventListener("click", () => {
  // 點擊顯示或隱藏通知面板
  panelVisible = !panelVisible;
  panel.style.display = panelVisible ? "block" : "none";

  // 點擊後紅點消失
  count.style.display = "none";
});

// 點其他地方關閉通知面板
document.addEventListener("click", (e) => {
  if (!bell.contains(e.target) && !panel.contains(e.target)) {
    panel.style.display = "none";
    panelVisible = false;
  }
});