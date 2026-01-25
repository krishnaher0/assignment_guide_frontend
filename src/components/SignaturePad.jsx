import { useRef, useEffect, useState } from 'react';
import SignaturePadLib from 'signature_pad';
import { FaEraser, FaUndo, FaPen } from 'react-icons/fa';

export default function SignaturePad({ onSave, onCancel, width = 500, height = 200 }) {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up canvas dimensions
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);

    // Initialize signature pad
    signaturePadRef.current = new SignaturePadLib(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
      minWidth: 1,
      maxWidth: 3,
    });

    signaturePadRef.current.addEventListener('endStroke', () => {
      setIsEmpty(signaturePadRef.current.isEmpty());
    });

    return () => {
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
      }
    };
  }, []);

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setIsEmpty(true);
    }
  };

  const handleUndo = () => {
    if (signaturePadRef.current) {
      const data = signaturePadRef.current.toData();
      if (data && data.length > 0) {
        data.pop();
        signaturePadRef.current.fromData(data);
        setIsEmpty(signaturePadRef.current.isEmpty());
      }
    }
  };

  const handleSave = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const dataUrl = signaturePadRef.current.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400">
          <FaPen className="w-4 h-4" />
          <span className="text-sm">Draw your signature below</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Undo"
          >
            <FaUndo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Clear"
          >
            <FaEraser className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-gray-600 bg-white">
        <canvas
          ref={canvasRef}
          className="w-full touch-none"
          style={{ height: `${height}px` }}
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm">Sign here</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isEmpty}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply Signature
        </button>
      </div>
    </div>
  );
}
