import "../basicChatbotStyles.css";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// DOM
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const statusText = document.getElementById("statusText");

// Chat history
const chatHistory = []; // { role: "user" | "assistant", content: string }

if (!OPENAI_API_KEY) {
  appendMessage("bot", "환경변수 VITE_OPENAI_API_KEY가 설정되지 않았습니다. (.env 확인)");
  setStatus("Missing API key");
}

function setStatus(text) {
  statusText.textContent = text;
}

function nowTime() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function appendMessage(role, text) {
  const row = document.createElement("div");
  row.className = `msgRow ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = role === "user" ? `You · ${nowTime()}` : `Bot · ${nowTime()}`;

  if (role === "user") {
    row.appendChild(meta);
    row.appendChild(bubble);
  } else {
    row.appendChild(bubble);
    row.appendChild(meta);
  }

  chatLog.appendChild(row);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function setBusy(busy) {
  sendBtn.disabled = busy;
  chatInput.disabled = busy;
}

function extractOutputText(respJson) {
  const output = respJson?.output ?? [];
  const parts = [];

  for (const item of output) {
    if (item?.type !== "message") continue;
    const content = item?.content ?? [];
    for (const c of content) {
      if (c?.type === "output_text" && typeof c?.text === "string") {
        parts.push(c.text);
      }
    }
  }

  return parts.join("\n").trim();
}

function looksDecided(text) {
  // “먹을래/먹으려고/정했어/그걸로” 등은 이미 결정을 의미하는 신호로 처리
  const t = (text || "").trim();
  return /먹(을래|으려고|어|자)|그걸로|정했|확정|갈래|시킬래|주문/.test(t);
}

function buildInputMessages() {
  const MAX_TURNS = 30;
  const recent = chatHistory.slice(-MAX_TURNS);

  return recent.map((m) => {
    const contentType = m.role === "user" ? "input_text" : "output_text";
    return {
      role: m.role,
      content: [{ type: contentType, text: m.content }],
    };
  });
}

async function callOpenAI(contextHint) {
  const body = {
    model: "gpt-4o-mini",
    instructions: [
      "너는 '점심 메뉴 결정' 전용 챗봇이다.",
      "",
      "[핵심 규칙]",
      "1) 사용자가 이미 먹을 메뉴를 정했거나(예: '~먹으려고', '그걸로', '정했어'), 특정 메뉴를 강하게 원하면: 더 이상 다른 메뉴를 추천하지 말고, 그 메뉴를 더 만족스럽게 먹기 위한 선택지를 제시한다.",
      "   - 예: 맵기/양/사이드/음료/가게 선택 기준/대체 옵션(품절 대비) 1~2개",
      "2) 사용자가 배가 덜 고프다고 했으면: 가벼운 옵션(양/맵기/사이드 조절)을 우선 고려한다.",
      "3) 사용자가 아직 못 정했을 때만 2~4개 후보 + '오늘의 추천 1개' 형식을 사용한다.",
      "4) 질문은 최대 1개만 한다. 부족한 정보가 있어도 우선 제안한다.",
      "5) 답변은 한국어, 간결하게.",
      "",
      "[현재 대화 상황 힌트]",
      contextHint || "",
    ].join("\n"),
    input: buildInputMessages(),
    max_output_tokens: 500,
    temperature: 0.7,
  };

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      json?.error?.message ||
      `Request failed (HTTP ${res.status}). 브라우저 CORS/키 노출/모델 권한을 확인하세요.`;
    throw new Error(msg);
  }

  const text = extractOutputText(json);
  return text || "(빈 응답)";
}

// initial greeting
const greeting =
  "안녕하세요. 점심 메뉴 결정봇입니다.\n원하는 종류/예산/매운 정도/혼밥 여부 중 하나만 말해도 도와드릴게요.";
appendMessage("bot", greeting);
chatHistory.push({ role: "assistant", content: greeting });

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = (chatInput.value || "").trim();
  if (!text) return;

  appendMessage("user", text);
  chatHistory.push({ role: "user", content: text });
  chatInput.value = "";

  if (!OPENAI_API_KEY) return;

  setBusy(true);
  setStatus("Thinking...");

  try {
    const decided = looksDecided(text);
    const hint = decided
      ? "사용자가 이미 메뉴를 정한 것으로 보인다. 다른 메뉴 추천 대신, 선택/옵션/가게/사이드 등 결정 지원으로 전환하라."
      : "사용자가 아직 메뉴를 확정하지 않았을 수 있다. 필요하면 후보를 제시하고 최종 추천 1개를 선택하라.";

    const reply = await callOpenAI(hint);
    appendMessage("bot", reply);
    chatHistory.push({ role: "assistant", content: reply });
    setStatus("Ready");
  } catch (err) {
    const msg = `오류: ${err?.message || String(err)}`;
    appendMessage("bot", msg);
    chatHistory.push({ role: "assistant", content: msg });
    setStatus("Error");
  } finally {
    setBusy(false);
    chatInput.focus();
  }
});
