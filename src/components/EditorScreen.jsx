import { useRef, useState } from 'react'
import Toolbar from './Toolbar'
import CanvasBoard from './CanvasBoard'
import ColorPanel from './ColorPanel'
import SizePopup from './SizePopup'
import ExportPopup from './ExportPopup'
import ImportPopup from './ImportPopup'
import ConfirmPopup from './ConfirmPopup'
import ThemeToggle from './ThemeToggle'
import { usePixelEditor } from '../hooks/usePixelEditor'
import { downloadCanvasPNG, downloadText } from '../utils/exportFile'
import { openFile, readTextFile, readFileAsDataURL } from '../utils/importFile'

export default function EditorScreen({ config, setConfig, onBack, onToggleTheme }) {
  const editor = usePixelEditor(config.width, config.height)
  const canvasRef = useRef(null)

  const [showColor, setShowColor] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showClear, setShowClear] = useState(false)
  const [sizeMode, setSizeMode] = useState(null)    // 'pen' | 'eraser' | null
  const [showSettings, setShowSettings] = useState(false)

  // ── Export ──────────────────────────────────────
  const exportJSON = () =>
    downloadText(
      'pixel-art.json',
      JSON.stringify({ width: config.width, height: config.height, pixels: editor.pixels }, null, 2)
    )

  // ── Import ──────────────────────────────────────
  const importPNG = async (fileArg) => {
    const file = fileArg || (await openFile('.png'))
    if (!file) return
    const dataUrl = await readFileAsDataURL(file)
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = config.width
      c.height = config.height
      const ctx = c.getContext('2d')
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.drawImage(img, 0, 0, c.width, c.height)
      const next = Array.from({ length: config.height }, (_, y) =>
        Array.from({ length: config.width }, (_, x) => {
          const d = ctx.getImageData(x, y, 1, 1).data
          return d[3] === 0 ? null : `rgba(${d[0]},${d[1]},${d[2]},${d[3] / 255})`
        })
      )
      editor.fromJSON({ pixels: next })
    }
    img.src = dataUrl
  }

  const importJSON = async () => {
    const file = await openFile('.json,.png')
    if (!file) return
    if (file.type.includes('png')) return importPNG(file)
    const text = await readTextFile(file)
    editor.fromJSON(JSON.parse(text))
  }

  const openImport = async (kind) => {
    setShowImport(false)
    if (kind === 'json') await importJSON()
    else await importPNG()
  }

  // ── Tool click: second click = size popup (pen) / clear popup (eraser) ──
  const handleToolClick = (nextTool) => {
    if (editor.tool === nextTool) {
      if (nextTool === 'pen')    { setSizeMode('pen');    return }
      if (nextTool === 'eraser') { setShowClear(true);    return }
    }
    editor.setTool(nextTool)
  }

  // Long-press on eraser → eraser size (right-click fallback)
  const handleEraserContextMenu = (e) => {
    e.preventDefault()
    setSizeMode('eraser')
  }

  const doClear = () => {
    setShowClear(false)
    editor.clearAll()
  }

  return (
    <div className={`page theme-${config.theme} editor-page`}>
      <ThemeToggle theme={config.theme} onToggle={onToggleTheme} />

      <Toolbar
        tool={editor.tool}
        setTool={handleToolClick}
        color={editor.color}
        onOpenColor={() => setShowColor(true)}
        onOpenExport={() => setShowExport(true)}
        onOpenImport={() => setShowImport(true)}
        onUndo={editor.undo}
        onRedo={editor.redo}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        onOpenSettings={() => setShowSettings(true)}
        onEraserSize={handleEraserContextMenu}
      />

      {/* Canvas — always centered */}
      <div className="editor-stage">
        <CanvasBoard
          ref={canvasRef}
          pixels={editor.pixels}
          width={config.width}
          height={config.height}
          tool={editor.tool}
          onPaint={editor.paint}
          onPickColor={(x, y) => {
            editor.setColor(editor.getColorAt(x, y) || '#000000')
            editor.setTool('pen')
          }}
        />
      </div>

      <div className="editor-footer">
        <button onClick={onBack}>← 뒤로</button>
        <span className="canvas-info">
          {config.width} × {config.height} px
        </span>
      </div>

      {/* ── Color popup ── */}
      {showColor && (
        <div className="modal-backdrop" onMouseDown={() => setShowColor(false)}>
          <div className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <h3>색 선택</h3>
            <ColorPanel color={editor.color} setColor={editor.setColor} />
            <div className="modal-actions">
              <button className="primary" onClick={() => setShowColor(false)}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Export popup ── */}
      {showExport && (
        <ExportPopup
          onPNG={() => { downloadCanvasPNG(canvasRef.current); setShowExport(false) }}
          onJSON={() => { exportJSON(); setShowExport(false) }}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* ── Import popup ── */}
      {showImport && (
        <ImportPopup
          onImport={openImport}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* ── Clear confirm ── */}
      {showClear && (
        <ConfirmPopup
          title="모두 지우기"
          message="모든 픽셀을 지울까요? 이 작업은 되돌릴 수 없습니다."
          confirmLabel="모두 지우기"
          confirmClass="danger"
          onConfirm={doClear}
          onClose={() => setShowClear(false)}
        />
      )}

      {/* ── Pen size popup ── */}
      {sizeMode === 'pen' && (
        <SizePopup
          title="펜 크기"
          value={editor.penSize}
          setValue={editor.setPenSize}
          onClose={() => setSizeMode(null)}
        />
      )}

      {/* ── Eraser size popup ── (accessible via long-press or separate flow) */}
      {sizeMode === 'eraser' && (
        <SizePopup
          title="지우개 크기"
          value={editor.eraserSize}
          setValue={editor.setEraserSize}
          onClose={() => setSizeMode(null)}
        />
      )}

      {/* ── Settings ── */}
      {showSettings && (
        <ConfirmPopup
          title="설정으로 이동"
          message="초기 화면으로 돌아갑니다. 저장하지 않은 작업은 사라집니다."
          confirmLabel="이동"
          onConfirm={() => { setShowSettings(false); onBack() }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
