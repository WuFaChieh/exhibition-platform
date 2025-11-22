// ------------------------------
// 讀取收藏 ID
// ------------------------------
function getCollects() {
  return JSON.parse(localStorage.getItem("collects")) || [];
}

// ------------------------------
// 載入收藏展覽
// ------------------------------
const colList = getCollects();
const container = document.getElementById("collect-list");

fetch("exhibitions.json")
  .then(res => res.json())
  .then(data => {
    const filtered = data.filter(item =>
      colList.includes(String(item.id))
    );
    renderCollects(filtered);
  });

// ------------------------------
// 渲染收藏展覽（與首頁一致）
// ------------------------------
function renderCollects(items) {

if (items.length === 0) {
  container.innerHTML = `
    <div style="
      width:100%;
      display:flex;
      justify-content:center;
      align-items:center;
      height:150px;
      text-align:center;
      font-size:20px;
    ">
      目前尚無收藏展覽
    </div>`;
  return;
}

  container.innerHTML = items
    .map(
      item => `
      <div class="card">
        <img src="${item.image}">
        <h3>${item.title}</h3>
        <p>${item.date}</p>

        <a href="detail.html?id=${item.id}">查看更多</a>

        <button class="col-btn active" data-id="${item.id}">
          ❤️ 已收藏
        </button>
      </div>
      `
    )
    .join("");
}

// ------------------------------
// 收藏 / 取消收藏按鈕
// ------------------------------
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("col-btn")) return;

  const id = e.target.dataset.id;
  let list = getCollects();

  // 取消收藏
  if (list.includes(id)) {
    list = list.filter(x => x !== id);
    e.target.classList.remove("active");
  } else {
    // 加入收藏
    list.push(id);
    e.target.textContent = "❤️ 已收藏";
    e.target.classList.add("active");
  }

  // 存回 localStorage
  localStorage.setItem("collects", JSON.stringify(list));

  // 重新渲染收藏頁
  setTimeout(() => location.reload(), 150);
});