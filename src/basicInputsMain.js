document.getElementById("submitBtn").addEventListener("click", () => {

    const name = document.getElementById("textInput").value;
    const password = document.getElementById("passwordInput").value;
    const email = document.getElementById("emailInput").value;
    if (!email.includes("@") || !email.includes(".")) {
      alert("이메일 형식이 올바르지 않습니다.");
    }
    const number = document.getElementById("numberInput").value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
  
    const hobbies = document.querySelectorAll('input[name="hobby"]:checked');
    const hobbyValues = Array.from(hobbies).map(h => h.value).join(', ');
  
    const city = document.getElementById("selectCity").value;
    const intro = document.getElementById("textareaInput").value;
    const birth = document.getElementById("dateInput").value;
    const time = document.getElementById("timeInput").value;
    const file = document.getElementById("fileInput").files[0]?.name || "선택 안됨";

    console.log("텍스트:", document.getElementById("textInput").value);
    console.log("비밀번호:", document.getElementById("passwordInput").value);
    console.log("이메일:", document.getElementById("emailInput").value);
    console.log("숫자:", document.getElementById("numberInput").value);
    console.log("성별:", document.querySelector('input[name="gender"]:checked').value);
  
    console.log("취미:", hobbyValues);
  
    console.log("도시:", document.getElementById("selectCity").value);
    console.log("자기소개:", document.getElementById("textareaInput").value);
    console.log("생일:", document.getElementById("dateInput").value);
    console.log("시간:", document.getElementById("timeInput").value);
    console.log("파일:", document.getElementById("fileInput").files[0]?.name || "선택 안됨");

  
    // 결과 HTML 생성
    const resultHTML = `
      <p><strong>이름:</strong> ${name}</p>
      <p><strong>비밀번호:</strong> ${password}</p>
      <p><strong>이메일:</strong> ${email}</p>
      <p><strong>숫자:</strong> ${number}</p>
      <p><strong>성별:</strong> ${gender}</p>
      <p><strong>취미:</strong> ${hobbyValues}</p>
      <p><strong>도시:</strong> ${city}</p>
      <p><strong>자기소개:</strong> ${intro}</p>
      <p><strong>생일:</strong> ${birth}</p>
      <p><strong>시간:</strong> ${time}</p>
      <p><strong>파일:</strong> ${file}</p>
    `;
  
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = resultHTML;
  
    document.getElementById("resultBlock").style.display = "block";

  });
  