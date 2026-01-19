import "../indexStyles.css";

const dangerBtn = document.getElementById("dangerBtn");
const warningMsg = document.getElementById("warningMsg");

dangerBtn.addEventListener("click", () => {
  warningMsg.textContent = "I Said Do Not Click This Button";
  warningMsg.classList.add("show");

  // 클릭할 때마다 짧게 흔들리는 효과 재생
  dangerBtn.classList.remove("shake");
  // reflow 트릭으로 애니메이션 재시작
  void dangerBtn.offsetWidth;
  dangerBtn.classList.add("shake");
});
