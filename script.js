// ------------------------------------
// script.js — IG 漂浮收藏按鈕版本
// ------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("exhibition-list");
  const searchInput = document.getElementById("search");
  const sidebar = document.getElementById("sidebar");
  const hamburger = document.getElementById("hamburger");
  const closeBtn = document.getElementById("close-btn");

  // ------------------------------
  // 收藏用 localStorage
  // ------------------------------
  function getCollects() {
    return JSON.parse(localStorage.getItem("collects")) || [];
  }

  function saveCollects(arr) {
    localStorage.setItem("collects", JSON.stringify(arr));
  }

  function isCollected(id) {
    return getCollects().includes(String(id));
  }

  // ------------------------------
  // 渲染展覽卡片（含浮動愛心）
  // ------------------------------
  function render(items) {
    if (!list) return;

    list.innerHTML = items
      .map(
        (item) => `
        <div class="card">
          <span class="fav-icon ${isCollected(item.id) ? "active" : ""}" data-id="${item.id}">
            ${isCollected(item.id) ? "❤️" : "🖤"}
          </span>

          <img src="${item.image}">
          <h3>${item.title}</h3>
          <p>${item.date}</p>
          <a href="detail.html?id=${item.id}">查看更多</a>
        </div>
      `
      )
      .join("");
  }

  // ------------------------------
  // 點擊愛心（全域監聽）
  // ------------------------------
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("fav-icon")) return;

    const id = String(e.target.dataset.id);
    let collects = getCollects();

    if (collects.includes(id)) {
      collects = collects.filter((x) => x !== id);
      e.target.classList.remove("active");
      e.target.textContent = "🖤";
    } else {
      collects.push(id);
      e.target.classList.add("active");
      e.target.textContent = "❤️";
    }

    saveCollects(collects);
  });

  // ------------------------------
  // 側欄選單
  // ------------------------------
  if (hamburger && sidebar) {
    hamburger.addEventListener("click", () => sidebar.classList.add("active"));
  }

  if (closeBtn && sidebar) {
    closeBtn.addEventListener("click", () => sidebar.classList.remove("active"));
  }

  // ------------------------------
  // 讀取 JSON、搜尋功能
  // ------------------------------
  fetch("exhibitions.json")
    .then((res) => res.json())
    .then((data) => {
      render(data);

      // 搜尋
      if (searchInput) {
        searchInput.addEventListener("input", () => {
          const keyword = searchInput.value.toLowerCase();
          const filtered = data.filter(
            (item) =>
              item.title.toLowerCase().includes(keyword) ||
              item.category.toLowerCase().includes(keyword)
          );
          render(filtered);
        });
      }
    });
});

let allExhibitions = [];

// ------------------------------------
// 讀取資料
// ------------------------------------
fetch("exhibitions.json")
  .then(res => res.json())
  .then(data => {
    allExhibitions = data;
    renderList(allExhibitions); // 初次載入顯示全部
  });

// ------------------------------------
// 渲染展覽卡片
// ------------------------------------
function renderList(items) {
  const container = document.getElementById("exhibition-list");

  container.innerHTML = items
    .map(
      item => `
      <div class="card">
        <img src="${item.image}">
        <h3>${item.title}</h3>
        <p>${item.date}</p>
        <p class="cat">分類：${item.category}</p>
        <a href="detail.html?id=${item.id}">查看更多</a>
      </div>
      `
    )
    .join("");
}

// ------------------------------------
// 分類按鈕事件
// ------------------------------------
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("cat-btn")) return;

  const cat = e.target.dataset.cat;

  if (cat === "all") {
    renderList(allExhibitions);
  } else {
    const filtered = allExhibitions.filter(item => item.category === cat);
    renderList(filtered);
  }
});

// 你的廣告列表（數量未知也 OK）
const ads = [
  "img/廣告1.png",
  "img/廣告2.png",
  "img/廣告3.png"
];

const adTrack = document.getElementById("ad-track");
const prevBtn = document.getElementById("prev-ad");
const nextBtn = document.getElementById("next-ad");
const dotsBox = document.getElementById("ad-dots");

adTrack.innerHTML = "";
dotsBox.innerHTML = "";

// 動態插入廣告
ads.forEach(src => {
  const slide = document.createElement("div");
  slide.className = "ad-slide";

  const img = document.createElement("img");
  img.src = src;

  slide.appendChild(img);
  adTrack.appendChild(slide);
});

// 動態插入圓點
ads.forEach((_, i) => {
  const dot = document.createElement("div");
  dot.className = "ad-dot";
  dot.addEventListener("click", () => {
    showAd(i);
    resetTimer();
  });
  dotsBox.appendChild(dot);
});

const dots = document.querySelectorAll(".ad-dot");

let index = 0;
const total = ads.length;

// 主函式：切換廣告
function showAd(i) {
  index = (i + total) % total;
  adTrack.style.transform = `translateX(-${index * 100}%)`;
  updateDots();
}

// 更新圓點
function updateDots() {
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}

// 自動輪播
let autoTimer = setInterval(() => {
  showAd(index + 1);
}, 5000);

// 重置自動輪播
function resetTimer() {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => showAd(index + 1), 5000);
}

// 左右鍵
prevBtn.addEventListener("click", () => {
  showAd(index - 1);
  resetTimer();
});

nextBtn.addEventListener("click", () => {
  showAd(index + 1);
  resetTimer();
});

// 初始化
showAd(0);