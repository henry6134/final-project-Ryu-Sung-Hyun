import { useRef } from 'react'
import Toolbar from './Toolbar'
import CanvasBoard from './CanvasBoard'
import ColorPanel from './ColorPanel'
import SizePopup from './SizePopup'
import { usePixelEditor } from '../hooks/usePixelEditor'
import { downloadCanvasPNG, downloadText } from '../utils/exportFile'
import { openFile, readTextFile, readFileAsDataURL } from '../utils/importFile'

export default function EditorScreen({ config, setConfig, onBack }) {
  const editor = usePixelEditor(config.width, config.height)
  const canvasRef = useRef(null)

  const exportJSON = () => {
    downloadText(
      'pixel-art.json',
      JSON.stringify({ width: config.width, height: config.height, pixels: editor.pixels }, null, 2)
    )
  }

  const importJSON = async () => {
    const file = await openFile('.json')
    if (!file) return
    const text = await readTextFile(file)
    editor.fromJSON(JSON.parse(text))
  }

  const importPNG = async () => {
    const file = await openFile('.png')
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

  const clearAll = () => {
    if (confirm('모든 픽셀을 지우시겠어요?')) editor.clearAll()
  }

  return (
    <div className={`page theme-${config.theme} editor-page`}>
      <Toolbar
        tool={editor.tool}
        setTool={editor.setTool}
        onUndo={editor.undo}
        onRedo={editor.redo}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        onImportJSON={importJSON}
        onExportPNG={() => downloadCanvasPNG(canvasRef.current)}
        onExportJSON={exportJSON}
        onToggleTheme={() =>
          setConfig((c) => ({ ...c, theme: c.theme === 'light' ? 'dark' : 'light' }))
        }
        theme={config.theme}
      />

      <div className="editor-top">
        <ColorPanel color={editor.color} setColor={editor.setColor} />

        <div className="sizes">
          <SizePopup label="펜 크기" value={editor.penSize} setValue={editor.setPenSize} />
          <SizePopup label="지우개 크기" value={editor.eraserSize} setValue={editor.setEraserSize} />
        </div>

        <div className="erase-group">
          <button onClick={importPNG}>PNG 불러오기</button>
          <button onClick={clearAll}>모두 지우기</button>
        </div>

        <button onClick={onBack}>설정으로</button>
      </div>

      <div className="canvas-wrap">
        <CanvasBoard
          ref={canvasRef}
          pixels={editor.pixels}
          width={config.width}
          height={config.height}
          tool={editor.tool}
          onPaint={editor.paint}
          onPickColor={(x, y) => editor.setColor(editor.getColorAt(x, y) || '#000000')}
        />
      </div>
    </div>
  )
}