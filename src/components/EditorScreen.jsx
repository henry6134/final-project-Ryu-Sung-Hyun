import { useEffect, useRef, useState } from 'react'
import Toolbar from './Toolbar'
import CanvasBoard from './CanvasBoard'
import ColorPanel from './ColorPanel'
import SizePopup from './SizePopup'
import ExportPopup from './ExportPopup'
import ImportPopup from './ImportPopup'
import ConfirmPopup from './ConfirmPopup'
import { usePixelEditor } from '../hooks/usePixelEditor'
import { downloadCanvasPNG, downloadCanvasJPG, downloadText } from '../utils/exportFile'
import { openFile, readTextFile, readFileAsDataURL } from '../utils/importFile'

export default function EditorScreen({ config, setConfig, onBack, onToggleTheme }) {
  const editor = usePixelEditor(config.width, config.height)
  const canvasRef = useRef(null)

  const [showColor, setShowColor]   = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showClear, setShowClear]   = useState(false)
  const [sizeMode, setSizeMode]     = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [bgImage, setBgImage]       = useState(null)

  // ── 색 히스토리: 실제 용지에 칠해진 색만 추적 ──
  // paint가 호출될 때마다 pixels에서 실제 사용 색 추출
  const [colorHistory, setColorHistory] = useState([])

  // pixels 변경 시 히스토리 동기화
  useEffect(() => {
    const used = editor.getUsedColors()
    if (used.length === 0) return
    setColorHistory((prev) => {
      const merged = [...used, ...prev.filter(c => !used.includes(c))].slice(0, 20)
      return merged
    })
  }, [editor.pixels])

  // ── Export ──────────────────────────────────────
  const exportJSON = () =>
    downloadText(
      'pixel-art.json',
      JSON.stringify({ width: config.width, height: config.height, pixels: editor.pixels }, null, 2)
    )

  // ── Import helpers ───────────────────────────────
  const importPixelFromPNG = async (fileArg) => {
    const file = fileArg || (await openFile('.png,.jpg,.jpeg,.webp'))
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

  const importBgFromPNG = async () => {
    const file = await openFile('.png,.jpg,.jpeg,.webp')
    if (!file) return
    const dataUrl = await readFileAsDataURL(file)
    setBgImage(dataUrl)
  }

  const importJSON = async () => {
    const file = await openFile('.json,.png,.jpg,.jpeg,.webp')
    if (!file) return
    if (file.type.startsWith('image/')) return importPixelFromPNG(file)
    const text = await readTextFile(file)
    editor.fromJSON(JSON.parse(text))
  }

  const openImport = async (kind) => {
    setShowImport(false)
    if (kind === 'json')      await importJSON()
    if (kind === 'png-pixel') await importPixelFromPNG()
    if (kind === 'png-bg')    await importBgFromPNG()
  }

  // ── Tool click ───────────────────────────────────
  const handleToolClick = (nextTool) => {
    if (editor.tool === nextTool) {
      if (nextTool === 'pen')    { setSizeMode('pen');   return }
      if (nextTool === 'eraser') { setShowClear(true);   return }
    }
    editor.setTool(nextTool)
  }

  const handleEraserContextMenu = (e) => {
    e.preventDefault()
    setSizeMode('eraser')
  }

  const doClear = () => {
    setShowClear(false)
    editor.clearAll()
    setColorHistory([])
  }

  // ── 전체 채우기 ──────────────────────────────────
  const handleFill = () => {
    editor.fillAll()
    setShowColor(false)
  }

  return (
    <div className={`page theme-${config.theme} editor-page`}>
      <Toolbar
        tool={editor.tool}
        setTool={handleToolClick}
        color={editor.color}
        theme={config.theme}
        onOpenColor={() => setShowColor(true)}
        onOpenExport={() => setShowExport(true)}
        onOpenImport={() => setShowImport(true)}
        onUndo={editor.undo}
        onRedo={editor.redo}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        onOpenSettings={() => setShowSettings(true)}
        onEraserSize={handleEraserContextMenu}
        onToggleTheme={onToggleTheme}
      />

      {/* Canvas — always centered */}
      <div className="editor-stage">
        <CanvasBoard
          ref={canvasRef}
          pixels={editor.pixels}
          width={config.width}
          height={config.height}
          tool={editor.tool}
          bgImage={bgImage}
          onPaint={editor.paint}
          onPickColor={(x, y) => {
            editor.setColor(editor.getColorAt(x, y) || '#000000')
            editor.setTool('pen')
          }}
        />
      </div>

      <div className="editor-footer">
        <button onClick={onBack}>← 뒤로</button>
        <span className="canvas-info">{config.width} × {config.height} px</span>
      </div>

      {/* ── Color popup ── */}
      {showColor && (
        <div className="modal-backdrop" onMouseDown={() => setShowColor(false)}>
          <div className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <h3>색 선택</h3>
            <ColorPanel
              color={editor.color}
              setColor={editor.setColor}
              history={colorHistory}
              setHistory={setColorHistory}
              onFill={handleFill}
            />
            <div className="modal-actions">
              <button className="primary" onClick={() => setShowColor(false)}>확인</button>
            </div>
          </div>
        </div>
      )}

      {showExport && (
        <ExportPopup
          onPNG={() => {
            downloadCanvasPNG(canvasRef.current, editor.pixels, config.width, config.height)
            setShowExport(false)
          }}
          onJPG={(withGrid) => {
            downloadCanvasJPG(canvasRef.current, editor.pixels, config.width, config.height, withGrid)
            setShowExport(false)
          }}
          onJSON={() => { exportJSON(); setShowExport(false) }}
          onClose={() => setShowExport(false)}
        />
      )}

      {showImport && (
        <ImportPopup onImport={openImport} onClose={() => setShowImport(false)} />
      )}

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

      {sizeMode === 'pen' && (
        <SizePopup title="펜 크기" value={editor.penSize} setValue={editor.setPenSize} onClose={() => setSizeMode(null)} />
      )}
      {sizeMode === 'eraser' && (
        <SizePopup title="지우개 크기" value={editor.eraserSize} setValue={editor.setEraserSize} onClose={() => setSizeMode(null)} />
      )}

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
