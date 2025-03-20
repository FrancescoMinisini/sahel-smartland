
import { useState, useRef } from 'react';
import { cn } from "@/lib/utils";
import { useMapData } from '@/hooks/useMapData';
import MapControls from './map/MapControls';
import LayerSelector from './map/LayerSelector';
import MapRenderer from './map/MapRenderer';

interface MapVisualizationProps {
  className?: string;
  year?: number;
}

const MapVisualization = ({ className, year = 2023 }: MapVisualizationProps) => {
  const [activeLayer, setActiveLayer] = useState('landCover');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [transitionAnimationId, setTransitionAnimationId] = useState<number | null>(null);
  const previousYearRef = useRef<number | null>(null);
  
  const { 
    isLoading,
    mapData,
    currentStats,
    setCurrentStats,
    prevYear,
    nextYear,
    progress
  } = useMapData(year);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetView = () => {
    setZoomLevel(1);
  };

  const handleLayerChange = (layer: string) => {
    setActiveLayer(layer);
  };

  const mapLayers = [
    { id: 'landCover', name: 'Land Cover', color: 'bg-sahel-green' },
    { id: 'vegetation', name: 'Vegetation', color: 'bg-sahel-greenLight' },
    { id: 'rainfall', name: 'Rainfall', color: 'bg-sahel-blue' },
    { id: 'population', name: 'Population', color: 'bg-sahel-earth' },
  ];

  return (
    <div className={cn("relative rounded-xl overflow-hidden shadow-lg", className)}>
      {/* Year indicator */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10 bg-white/80 dark:bg-muted/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5 shadow-sm">
        {year}
      </div>
      
      {/* Map Container */}
      <div className="w-full aspect-[4/3] bg-sahel-sandLight overflow-hidden relative">
        <MapRenderer
          isLoading={isLoading}
          mapData={mapData}
          prevYear={prevYear}
          nextYear={nextYear}
          progress={progress}
          zoomLevel={zoomLevel}
          year={year}
          transitionAnimationId={transitionAnimationId}
          setTransitionAnimationId={setTransitionAnimationId}
          previousYearRef={previousYearRef}
          setCurrentStats={setCurrentStats}
        />
      </div>
      
      {/* Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
      />
      
      {/* Layer Selector */}
      <LayerSelector
        mapLayers={mapLayers}
        activeLayer={activeLayer}
        onLayerChange={handleLayerChange}
      />
    </div>
  );
};

export default MapVisualization;
