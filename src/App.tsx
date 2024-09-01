import "./App.css";
import { useCanvas } from "./hooks/use-canvas";

function App() {
  const {
    isCanvasEmpty,
    canvas,
    color,
    lineWidth,
    activeMode,
    drawModes,
    onDraw,
    onStartDraw,
    onContinue,
    onStopDraw,
    onUndo,
    onClear,
    onChangeMode,
    onDownload,
    setLineWidth,
    setColor,
  } = useCanvas();
  return (
    <>
      <canvas
        className="canvas"
        ref={canvas}
        onMouseDown={onStartDraw}
        onMouseMove={onDraw}
        onMouseOver={onContinue}
        onMouseUp={onStopDraw}
      />

      <div className="menu-options">
        <button
          className="option-button"
          disabled={isCanvasEmpty}
          onClick={onUndo}
        >
          Deshacer
        </button>

        <button className="option-button" onClick={onClear}>
          Limpiar
        </button>
        <input
          className="option-button"
          type="color"
          defaultValue={color}
          onChange={setColor}
        />
        <input
          className="option-button"
          type="range"
          min="1"
          max="50"
          defaultValue={lineWidth.toString()}
          onChange={setLineWidth}
        />

        <div className="divider" />

        {drawModes.map(({ icon, mode }) => (
          <button
            key={mode}
            className={
              mode === activeMode ? "mode-button active" : "mode-button"
            }
            onClick={() => onChangeMode(mode, icon)}
          >
            <span role="img" aria-label={mode}>
              {icon}
            </span>
          </button>
        ))}
        <div className="divider" />

        <button className="option-button" onClick={onDownload}>
          <span role="img" aria-label="Descargar">
            ⬇️
          </span>
        </button>
      </div>
    </>
  );
}

export default App;
