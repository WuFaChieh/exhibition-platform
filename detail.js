document.getElementById("detail").innerHTML = `
  <h1>${item.title}</h1>
  <img src="${item.image}" class="detail-img">

  <div class="detail-row">
    <div class="detail-label">日期</div>
    <div class="detail-value">${item.date}</div>
  </div>

  <div class="detail-row">
    <div class="detail-label">地點</div>
    <div class="detail-value">${item.location}</div>
  </div>

  <div class="detail-row">
    <div class="detail-label">分類</div>
    <div class="detail-value">${item.category}</div>
  </div>

  <p>${item.description}</p>
`;

div.textContent = text;