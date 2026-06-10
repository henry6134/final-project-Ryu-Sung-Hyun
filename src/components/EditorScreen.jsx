// src/components/EditorScreen.jsx
import { useRef } from 'react'
import Toolbar from './Toolbar'
import CanvasBoard from './CanvasBoard'
import ColorPanel from './ColorPanel'
import SizePopup from './SizePopup'
import { usePixelEditor } from '../hooks/usePixelEditor'
import { downloadCanvasPNG, downloadText } from '../utils/exportFile'
import { openFile, readTextFile } from '../utils/importFile'

export default function EditorScreen({ config, onBack }) {
  const editor = usePixelEditor(config.width, config.height)
  const canvasRef = useRef(null)

  const exportJSON = () => {
    downloadText('pixel-art.json', JSON.stringify({ width: config.width, height: config.height, pixels: editor.pixels }, null, 2))
  }

  const importJSON = async () => {
    const file = await openFile('.json')
    if (!file) return
    const text = await readTextFile(file)
    editor.fromJSON(JSON.parse(text))
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
      />

      <div className="editor-top">
        <ColorPanel color={editor.color} setColor={editor.setColor} />
        <div className="sizes">
          <SizePopup label="펜 크기" value={editor.penSize} setValue={editor.setPenSize} />
          <SizePopup label="지우개 크기" value={editor.eraserSize} setValue={editor.setEraserSize} />
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