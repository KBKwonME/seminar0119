import "../indexStyles.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const dangerBtn = document.getElementById("dangerBtn");

dangerBtn.addEventListener("click", async () => {
  // 버튼 흔들림(기존 효과 유지)
  dangerBtn.classList.remove("shake");
  void dangerBtn.offsetWidth;
  dangerBtn.classList.add("shake");

  await Swal.fire({
    icon: "warning",
    title: "I Said Do Not Click This Button",
    text: "This is your final warning.",
    background: "#081a2f",
    color: "rgba(235, 245, 255, 0.92)",
    confirmButtonText: "Understood",
    confirmButtonColor: "#5fb3ff",
    showClass: { popup: "swal2-show" },
    hideClass: { popup: "swal2-hide" },
  });
});
