// ------------------------
// 台灣縣市座標
// ------------------------
const cityCenters = {
  "台北市": [25.0375, 121.5637],
  "新北市": [25.0122, 121.4656],
  "桃園市": [24.9938, 121.2969],
  "台中市": [24.1477, 120.6736],
  "台南市": [22.9999, 120.2270],
  "高雄市": [22.6273, 120.3014]
};

// 區域分類
const regionMap = {
  "台北市": "北部",
  "新北市": "北部",
  "桃園市": "北部",
  "台中市": "中部",
  "台南市": "南部",
  "高雄市": "南部"
};

// 區域中心點
const regionCenters = {
  "北部": [25.1, 121.6],
  "中部": [24.1, 120.6],
  "南部": [23.0, 120.3],
  "東部": [23.7, 121.4]
};

// ------------------------
// 初始化地圖
// ------------------------
const map = L.map('map').setView([23.7, 121], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

L.control.scale({ position: 'bottomright', imperial: false }).addTo(map);
map.zoomControl.setPosition('bottomright');

// ------------------------
// LayerGroup：放縣市圈 / 區域圈
// ------------------------
const cityLayer = L.layerGroup();   
const regionLayer = L.layerGroup();  



// ------------------------
// 從 JSON 載入資料
// ------------------------
fetch("exhibitions.json")
  .then(res => res.json())
  .then(data => {
    drawCityCircles(data);
    drawRegionCircles(data);

    // 預設：顯示大範圍（區域）
    map.addLayer(regionLayer);
  });


// ------------------------
// 1. 畫縣市圈圈（小縮放）
// ------------------------
function drawCityCircles(data) {
  const count = {};

  data.forEach(item => {
    if (!count[item.city]) count[item.city] = 0;
    count[item.city]++;
  });

  Object.keys(count).forEach(city => {
    if (!cityCenters[city]) return;

    const num = count[city];

    const icon = L.divIcon({
      className: "map-circle-wrapper",
      html: `<div class="map-circle">${num}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    L.marker(cityCenters[city], { icon })
      .bindTooltip(`${city}：${num} 筆展覽`)
      .addTo(cityLayer);
  });
}


// ------------------------
// 2. 畫區域圈圈（大縮放）
// ------------------------
function drawRegionCircles(data) {
  const regionCount = {};

  data.forEach(item => {
    const region = regionMap[item.city];
    if (!region) return;

    if (!regionCount[region]) regionCount[region] = 0;
    regionCount[region]++;
  });

  Object.keys(regionCount).forEach(region => {
    const num = regionCount[region];

    const icon = L.divIcon({
      className: "map-circle-wrapper",
      html: `<div class="map-circle" style="border-color: blue; color: blue;">${num}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    L.marker(regionCenters[region], { icon })
      .bindTooltip(`${region}：${num} 筆展覽`)
      .addTo(regionLayer);
  });
}


// ------------------------
// Zoom 切換邏輯：>=10 顯示縣市；<10 顯示區域
// ------------------------
map.on("zoomend", () => {
  const zoom = map.getZoom();

  if (zoom >= 8) {
    map.addLayer(cityLayer);
    map.removeLayer(regionLayer);
  } else {
    map.addLayer(regionLayer);
    map.removeLayer(cityLayer);
  }
});