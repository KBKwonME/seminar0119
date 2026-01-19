import "../basicChatbotStyles.css";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// DOM
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const statusText = document.getElementById("statusText");

// Conversation state (Responses API)
let previousResponseId = null;

// Basic guards
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

async function callOpenAI(userText) {
  const body = {
    model: "gpt-4o-mini",
    input: userText,
    previous_response_id: previousResponseId,
    instructions:
      "You are a helpful assistant. Keep answers concise. Use Korean unless the user asks otherwise.",
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

  previousResponseId = json?.id ?? previousResponseId;

  const text = extractOutputText(json);
  return text || "(빈 응답)";
}

// initial greeting
appendMessage("bot", "안녕하세요. 메시지를 입력하면 답변합니다.");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = (chatInput.value || "").trim();
  if (!text) return;

  appendMessage("user", text);
  chatInput.value = "";

  if (!OPENAI_API_KEY) return;

  setBusy(true);
  setStatus("Thinking...");

  try {
    const reply = await callOpenAI(text);
    appendMessage("bot", reply);
    setStatus("Ready");
  } catch (err) {
    appendMessage("bot", `오류: ${err?.message || String(err)}`);
    setStatus("Error");
  } finally {
    setBusy(false);
    chatInput.focus();
  }
});
