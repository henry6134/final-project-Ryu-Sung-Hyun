const { createFFmpeg, fetchFile } = FFmpeg;

const ffmpeg = createFFmpeg({ log: false });
let ffmpegReady = false;
let currentMode = "audio";
let currentJob = [];
let cancelFlag = false;

const formats = {
  audio: ["mp3", "wav", "flac", "ogg", "aac"],
  photo: ["jpg", "png", "webp"],
  video: ["mp4", "webm", "mkv", "mov"]
};

const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const list = document.getElementById("list");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const fromFormat = document.getElementById("fromFormat");
const toFormat = document.getElementById("toFormat");

function setFormats(mode) {
  fromFormat.innerHTML = `<option value="">파일 형식</option>`;
  toFormat.innerHTML = formats[mode].map(x => `<option value="${x}">${x}</option>`).join("");
}
setFormats(currentMode);

document.querySelectorAll(".tab").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    currentMode = btn.dataset.mode;
    setFormats(currentMode);
  };
});

async function ensureFFmpeg() {
  if (!ffmpegReady) {
    await ffmpeg.load();
    ffmpegReady = true;
  }
}

document.getElementById("pickFiles").onclick = () => {
  fileInput.removeAttribute("webkitdirectory");
  fileInput.click();
};

document.getElementById("pickFolder").onclick = () => {
  fileInput.setAttribute("webkitdirectory", "");
  fileInput.setAttribute("directory", "");
  fileInput.click();
};

dropZone.addEventListener("dragover", e => {
  e.preventDefault();
  dropZone.classList.add("drag");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag"));
dropZone.addEventListener("drop", async e => {
  e.preventDefault();
  currentJob = await readFiles(e.dataTransfer.files);
});

fileInput.addEventListener("change", async () => {
  currentJob = await readFiles(fileInput.files);
});

function ext(name) {
  return (name.split(".").pop() || "").toLowerCase();
}
function kindFromExt(e) {
  if (formats.audio.includes(e)) return "audio";
  if (formats.photo.includes(e)) return "photo";
  return "video";
}
function sizeText(n) {
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(1)} ${u[i]}`;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;"," >":"&gt;","\"":"&quot;","'":"&#39;" }[c] || c));
}

async function readFiles(fileList) {
  const arr = [...fileList].map(f => ({
    file: f,
    name: f.name,
    path: f.webkitRelativePath || f.name,
    size: f.size,
    date: new Date(f.lastModified).toLocaleString(),
    ext: ext(f.name),
    kind: kindFromExt(ext(f.name)),
    status: "대기"
  }));
  render(arr);
  return arr;
}

function render(items) {
  const sorted = [...items].sort((a, b) => {
    const col = document.body.dataset.sort || "name";
    const dir = document.body.dataset.dir || "asc";
    let va = a[col], vb = b[col];
    if (col === "size") { va = a.size; vb = b.size; }
    if (col === "ext") { va = a.ext; vb = b.ext; }
    if (col === "date") { va = new Date(a.date).getTime(); vb = new Date(b.date).getTime(); }
    if (typeof va === "string") return dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    return dir === "asc" ? va - vb : vb - va;
  });

  list.innerHTML = sorted.map((it, idx) => `
    <div class="row">
      <div><input class="checkbox" type="checkbox" data-index="${idx}"></div>
      <div class="small">${sizeText(it.size)}</div>
      <div class="small">${escapeHtml(it.ext)}</div>
      <div class="small">${escapeHtml(it.date)}</div>
      <div class="small item-name">${escapeHtml(it.name)}</div>
      <div class="small item-name">${escapeHtml(it.path)}</div>
    </div>
  `).join("");
}

document.getElementById("selectAllBtn").onclick = () => {
  document.querySelectorAll(".checkbox").forEach(x => x.checked = true);
};

document.getElementById("deleteBtn").onclick = () => {
  const checked = [...document.querySelectorAll(".checkbox")].map((c, i) => c.checked ? i : -1).filter(i => i >= 0);
  currentJob = currentJob.filter((_, i) => !checked.includes(i));
  render(currentJob);
};

document.getElementById("cancelBtn").onclick = () => {
  cancelFlag = true;
};

document.getElementById("startBtn").onclick = async () => {
  if (!currentJob.length) return alert("파일이나 폴더를 먼저 업로드하세요.");
  await ensureFFmpeg();
  cancelFlag = false;

  const target = toFormat.value || formats[currentMode][0];
  progressFill.style.width = "0%";
  progressText.textContent = "0%";
  const out = [];

  for (let i = 0; i < currentJob.length; i++) {
    if (cancelFlag) break;
    const item = currentJob[i];
    const inputName = `in_${i}_${item.name}`;
    const outputName = `out_${i}.${target}`;

    ffmpeg.FS("writeFile", inputName, await fetchFile(item.file));

    if (currentMode === "audio") {
      await ffmpeg.run("-i", inputName, "-vn", outputName);
    } else if (currentMode === "photo") {
      await ffmpeg.run("-i", inputName, outputName);
    } else {
      await ffmpeg.run("-i", inputName, outputName);
    }

    const data = ffmpeg.FS("readFile", outputName);
    const blob = new Blob([data.buffer], { type: `application/${target}` });
    const url = URL.createObjectURL(blob);

    out.push({
      ...item,
      outputName,
      outputUrl: url,
      outExt: target,
      status: "완료"
    });

    progressFill.style.width = `${Math.round(((i + 1) / currentJob.length) * 100)}%`;
    progressText.textContent = `${Math.round(((i + 1) / currentJob.length) * 100)}%`;
  }

  currentJob = out;
  renderResults(out);
};

function renderResults(items) {
  list.innerHTML = items.map((it, idx) => `
    <div class="row">
      <div><input class="checkbox" type="checkbox" data-index="${idx}"></div>
      <div class="small">${sizeText(it.size)}</div>
      <div class="small">${escapeHtml(it.outExt)}</div>
      <div class="small">${escapeHtml(it.date)}</div>
      <div class="small item-name">${escapeHtml(it.name)}</div>
      <div class="small item-name">${escapeHtml(it.path)}</div>
      <div class="small"><a class="link" href="${it.outputUrl}" download="${it.outputName}">다운로드</a></div>
    </div>
  `).join("");
}

document.getElementById("downloadBtn").onclick = () => {
  const checked = [...document.querySelectorAll(".checkbox")].map((c, i) => c.checked ? i : -1).filter(i => i >= 0);
  checked.forEach(i => {
    const item = currentJob[i];
    if (!item?.outputUrl) return;
    const a = document.createElement("a");
    a.href = item.outputUrl;
    a.download = item.outputName;
    a.click();
  });
};