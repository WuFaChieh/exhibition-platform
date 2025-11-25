const form = document.getElementById("submit-form");
const msg = document.getElementById("fake-msg");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  msg.textContent = "展訊已提交！ 感謝您用心填寫";
  msg.style.display = "block";

  form.reset();
});