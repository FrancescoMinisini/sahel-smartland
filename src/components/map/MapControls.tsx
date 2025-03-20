
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

const MapControls = ({ onZoomIn, onZoomOut, onResetView }: MapControlsProps) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <button 
        onClick={onZoomIn} 
        className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-sahel-earth hover:bg-sahel-green hover:text-white transition-colors"
        aria-label="Zoom in"
      >
        <ZoomIn size={16} />
      </button>
      <button 
        onClick={onZoomOut} 
        className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-sahel-earth hover:bg-sahel-green hover:text-white transition-colors"
        aria-label="Zoom out"
      >
        <ZoomOut size={16} />
      </button>
      <button 
        onClick={onResetView} 
        className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-sahel-earth hover:bg-sahel-green hover:text-white transition-colors"
        aria-label="Reset view"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
};

export default MapControls;
