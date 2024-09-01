import { useState, useRef, useLayoutEffect } from "react";
type DrawMode = "DRAW" | "ERASE" | "RECTANGLE" | "ELLIPSE";

const getCursor = (icon: string) => {
  return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='black'><text x='0' y='20' font-size='20'>${icon}</text></svg>") 0 0, auto`;
};

export const drawModes: { icon: string; mode: DrawMode }[] = [
  { icon: "✏️", mode: "DRAW" },
  { icon: "🧽", mode: "ERASE" },
  { icon: "🔲", mode: "RECTANGLE" },
  { icon: "🔴", mode: "ELLIPSE" },
];

export const useCanvas = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeMode, setActiveMode] = useState(drawModes[0].mode);
  const canvas = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const imageData = useRef<ImageData[]>([]);
  const startX = useRef(0);
  const startY = useRef(0);
  const color = useRef("#000000");
  const lineWidth = useRef(10);

  useLayoutEffect(() => {
    canvas.current!.width = window.innerWidth;
    canvas.current!.height = window.innerHeight;
    ctx.current = canvas.current!.getContext("2d");
  }, []);

  const onStartDraw = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    startX.current = offsetX;
    startY.current = offsetY;
    // save the current image data
    imageData.current.push(
      ctx.current!.getImageData(
        0,
        0,
        canvas.current!.width,
        canvas.current!.height
      )
    );
  };

  const onContinue = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    startX.current = offsetX;
    startY.current = offsetY;
  };

  const drawLine = (endX: number, endY: number) => {
    if (!ctx.current) return;
    ctx.current.lineWidth = lineWidth.current;
    ctx.current.strokeStyle = color.current;
    ctx.current.beginPath();
    ctx.current.moveTo(startX.current, startY.current);
    ctx.current.lineTo(endX, endY);
    ctx.current.stroke();
  };

  const drawRectangle = (endX: number, endY: number) => {
    if (!ctx.current) return;
    ctx.current.putImageData(imageData.current.at(-1)!, 0, 0);
    ctx.current.lineWidth = lineWidth.current;
    ctx.current.strokeStyle = color.current;
    ctx.current.strokeRect(startX.current, startY.current, endX, endY);
  };

  const drawEllipse = (endX: number, endY: number) => {
    if (!ctx.current) return;
    ctx.current.putImageData(imageData.current.at(-1)!, 0, 0);
    ctx.current.lineWidth = lineWidth.current;
    ctx.current.strokeStyle = color.current;
    ctx.current.beginPath();
    ctx.current.ellipse(
      startX.current + endX / 2,
      startY.current + endY / 2,
      Math.abs(endX / 2),
      Math.abs(endY / 2),
      0,
      0,
      2 * Math.PI
    );
    ctx.current.stroke();
  };

  const onDraw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;

    if (activeMode === "RECTANGLE") {
      drawRectangle(offsetX - startX.current, offsetY - startY.current);
    } else if (activeMode === "ELLIPSE") {
      drawEllipse(offsetX - startX.current, offsetY - startY.current);
    } else {
      drawLine(offsetX, offsetY);
      startX.current = offsetX;
      startY.current = offsetY;
    }
  };

  const onStopDraw = () => {
    setIsDrawing(false);
  };

  const onClear = () => {
    if (!ctx.current) return;
    ctx.current.clearRect(0, 0, canvas.current!.width, canvas.current!.height);
  };

  const onUndo = () => {
    if (!ctx.current) return;
    if (imageData.current.length === 0) return;
    ctx.current.putImageData(imageData.current.pop()!, 0, 0);
  };

  const onChangeMode = (mode: DrawMode, icon: string) => {
    setActiveMode(mode);
    canvas.current!.style.cursor = getCursor(icon);
    ctx.current!.globalCompositeOperation =
      mode === "ERASE" ? "destination-out" : "source-over";
  };
  const onDownload = () =>
    canvas.current?.toBlob((blob) => {
      const url = URL.createObjectURL(blob!);
      const a = document.createElement("a");
      a.href = url;
      a.download = "canvas.png";
      a.click();
      URL.revokeObjectURL(url);
    });

  const setLineWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
    lineWidth.current = parseInt(e.target.value);
  };
  const setColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    color.current = e.target.value;
  };
  return {
    onDraw,
    onStartDraw,
    onContinue,
    setActiveMode,
    getCursor,
    onStopDraw,
    onClear,
    onUndo,
    onChangeMode,
    onDownload,
    setLineWidth,
    setColor,
    activeMode,
    canvas,
    color: color.current,
    lineWidth: lineWidth.current,
    drawModes,
    isCanvasEmpty: imageData.current.length === 0,
  };
};
