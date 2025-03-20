
import * as GeoTIFF from 'geotiff';

// Enhanced land cover type colors with better contrast for visualization
export const landCoverColors = {
  7: '#1a9850', // Forests (vibrant green)
  8: '#91cf60', // Shrublands (medium green)
  9: '#d9ef8b', // Savannas (light green/yellow)
  10: '#fee08b', // Grasslands (light yellow) 
  11: '#66c2a5', // Wetlands (teal)
  12: '#fc8d59', // Croplands (orange)
  13: '#d73027', // Urban (bright red)
  14: '#fdae61', // Cropland/Natural mosaic (peach)
  15: '#f7f7f7', // Snow and ice (white)
  16: '#bababa', // Barren (medium gray)
  0: '#4d4d4d'   // No data (dark gray)
};

// Class names for land cover types
export const landCoverClasses = {
  7: 'Forests',
  8: 'Shrublands',
  9: 'Savannas',
  10: 'Grasslands',
  11: 'Wetlands',
  12: 'Croplands',
  13: 'Urban',
  14: 'Cropland/Natural Mosaic',
  15: 'Snow and Ice',
  16: 'Barren',
  0: 'No Data'
};

// Load and process a GeoTIFF file
export const loadTIFF = async (year: number): Promise<{ 
  data: number[], 
  width: number, 
  height: number 
}> => {
  try {
    const response = await fetch(`/Datasets_Hackathon/Modis_Land_Cover_Data/${year}LCT.tif`);
    const arrayBuffer = await response.arrayBuffer();
    const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    const width = image.getWidth();
    const height = image.getHeight();
    const values = await image.readRasters();
    
    // Convert the TypedArray to a regular Array
    const data = Array.from(values[0] as Uint8Array);
    
    return { data, width, height };
  } catch (error) {
    console.error(`Error loading TIFF for year ${year}:`, error);
    return { data: [], width: 0, height: 0 };
  }
};

// Improved interpolation between two years of data with enhanced transitions
export const interpolateData = (
  startData: number[], 
  endData: number[], 
  progress: number
): number[] => {
  if (startData.length !== endData.length || startData.length === 0) {
    return endData;
  }
  
  // Enhanced transition approach for better visualization:
  // - Areas with changes get more visual emphasis
  // - Smoother blending between states
  return startData.map((startValue, index) => {
    const endValue = endData[index];
    
    // If the land cover class is the same in both years, keep it
    if (startValue === endValue) {
      return startValue;
    }
    
    // For changing areas, use a weighted transition based on progress
    // This creates more noticeable transitions for storytelling
    const threshold = Math.pow(progress, 1.5); // Non-linear progression for more dramatic changes
    return Math.random() < threshold ? endValue : startValue;
  });
};

// Interface for rendering options
export interface RenderOptions {
  enhanceContrast?: boolean;
  highlightChanges?: boolean;
  scaleIntensity?: number;
  opacity?: number;
  bgColor?: string;
}

// Enhanced rendering function with better color handling and background color support
export const renderTIFFToCanvas = (
  ctx: CanvasRenderingContext2D,
  data: number[],
  width: number, 
  height: number,
  options: RenderOptions | number = 1
): void => {
  if (!ctx || data.length === 0 || width === 0 || height === 0) {
    return;
  }

  // Handle both legacy (number) and new options format
  const renderOptions: RenderOptions = typeof options === 'number' 
    ? { opacity: options } 
    : options;
  
  const {
    opacity = 1,
    enhanceContrast = true,
    scaleIntensity = 1.3,
    bgColor = 'hsl(var(--background))'
  } = renderOptions;

  // First clear the canvas and set the background color
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Create an ImageData object
  const imageData = ctx.createImageData(width, height);
  const pixels = imageData.data;

  // Map the data values to RGBA values with improved color mapping and contrast
  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    const color = landCoverColors[value as keyof typeof landCoverColors] || landCoverColors[0];
    
    // Convert hex color to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Apply contrast enhancement if enabled
    const intensity = enhanceContrast ? scaleIntensity : 1;
    const enhancedR = Math.min(255, Math.round(r * intensity));
    const enhancedG = Math.min(255, Math.round(g * intensity));
    const enhancedB = Math.min(255, Math.round(b * intensity));
    
    // Set RGBA values in the ImageData
    const pixelIndex = i * 4;
    pixels[pixelIndex] = enhancedR;
    pixels[pixelIndex + 1] = enhancedG;
    pixels[pixelIndex + 2] = enhancedB;
    pixels[pixelIndex + 3] = opacity * 255; // Alpha channel
  }

  // Put the ImageData onto the canvas
  ctx.putImageData(imageData, 0, 0);
};

// Get a list of available years for land cover data
export const getAvailableYears = (): number[] => {
  return Array.from({ length: 14 }, (_, i) => 2010 + i);
};

// Calculate statistics from land cover data
export const calculateLandCoverStats = (data: number[]): Record<string, number> => {
  const stats: Record<string, number> = {};
  
  // Initialize stats with 0 for all classes
  Object.keys(landCoverClasses).forEach(key => {
    stats[key] = 0;
  });
  
  // Count occurrences of each land cover type
  data.forEach(value => {
    if (stats[value] !== undefined) {
      stats[value]++;
    }
  });
  
  return stats;
};
