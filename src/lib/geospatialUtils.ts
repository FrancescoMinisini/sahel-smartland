
import * as GeoTIFF from 'geotiff';

// Land cover type colors - using more distinctive colors for better visualization
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

// Colors for precipitation visualization (blue intensity)
export const precipitationColorScale = [
  '#f7fbff', // Very light blue - lowest precipitation
  '#deebf7',
  '#c6dbef',
  '#9ecae1',
  '#6baed6',
  '#4292c6',
  '#2171b5',
  '#08519c',
  '#08306b'  // Dark blue - highest precipitation
];

// Load and process a GeoTIFF file
export const loadTIFF = async (year: number, dataType = 'landCover'): Promise<{ 
  data: number[], 
  width: number, 
  height: number,
  min?: number,
  max?: number
}> => {
  try {
    let filePath = '';
    
    if (dataType === 'landCover') {
      filePath = `/Datasets_Hackathon/Modis_Land_Cover_Data/${year}LCT.tif`;
    } else if (dataType === 'precipitation') {
      filePath = `/Datasets_Hackathon/Climate_Precipitation_Data/${year}R.tif`;
    } else {
      // Default to land cover
      filePath = `/Datasets_Hackathon/Modis_Land_Cover_Data/${year}LCT.tif`;
    }
    
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    const width = image.getWidth();
    const height = image.getHeight();
    const values = await image.readRasters();
    
    // Convert the TypedArray to a regular Array
    const data = Array.from(values[0] as Uint8Array | Float32Array);
    
    // For precipitation, we need min/max to normalize values for color scale
    if (dataType === 'precipitation') {
      const min = Math.min(...data);
      const max = Math.max(...data);
      return { data, width, height, min, max };
    }
    
    return { data, width, height };
  } catch (error) {
    console.error(`Error loading TIFF for year ${year}:`, error);
    return { data: [], width: 0, height: 0 };
  }
};

// Improved interpolation between two years of data
export const interpolateData = (
  startData: number[], 
  endData: number[], 
  progress: number
): number[] => {
  if (startData.length !== endData.length || startData.length === 0) {
    return endData;
  }
  
  // For land cover data, use a smarter transition approach:
  // - For areas that don't change between years, keep the class
  // - For areas that do change, blend based on progress
  return startData.map((startValue, index) => {
    const endValue = endData[index];
    
    // If the land cover class is the same in both years, keep it
    if (startValue === endValue) {
      return startValue;
    }
    
    // Otherwise, use progress to determine which value to show
    // This creates a more natural-looking transition
    return Math.random() < progress ? endValue : startValue;
  });
};

// Get color for precipitation value between min and max
export const getPrecipitationColor = (value: number, min: number, max: number): string => {
  // Normalize the value to 0-1 range, clamping to the specified range
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  
  // Map to color index
  const index = Math.floor(normalized * (precipitationColorScale.length - 1));
  return precipitationColorScale[index];
};

// Enhanced rendering function that handles both land cover and precipitation data
export const renderTIFFToCanvas = (
  ctx: CanvasRenderingContext2D,
  data: number[],
  width: number,
  height: number,
  options: {
    opacity?: number,
    dataType?: string,
    min?: number,
    max?: number
  } = {}
): void => {
  if (!ctx || data.length === 0 || width === 0 || height === 0) {
    return;
  }

  const { 
    opacity = 1, 
    dataType = 'landCover',
    min = 0,
    max = 500
  } = options;

  // Create an ImageData object
  const imageData = ctx.createImageData(width, height);
  const pixels = imageData.data;

  // Map the data values to RGBA values
  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    let color;
    
    if (dataType === 'precipitation') {
      color = getPrecipitationColor(value, min, max);
    } else {
      // Land cover coloring
      color = landCoverColors[value as keyof typeof landCoverColors] || landCoverColors[0];
    }
    
    // Convert hex color to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Set RGBA values in the ImageData
    const pixelIndex = i * 4;
    pixels[pixelIndex] = r;
    pixels[pixelIndex + 1] = g;
    pixels[pixelIndex + 2] = b;
    pixels[pixelIndex + 3] = opacity * 255; // Alpha channel
  }

  // Put the ImageData onto the canvas
  ctx.putImageData(imageData, 0, 0);
};

// Get a list of available years for land cover data
export const getAvailableYears = (dataType = 'landCover'): number[] => {
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

// Calculate precipitation statistics (average, min, max)
export const calculatePrecipitationStats = (data: number[]): Record<string, number> => {
  if (data.length === 0) return { average: 0, min: 0, max: 0, total: 0 };
  
  let sum = 0;
  let min = data[0];
  let max = data[0];
  
  data.forEach(value => {
    sum += value;
    min = Math.min(min, value);
    max = Math.max(max, value);
  });
  
  return {
    average: sum / data.length,
    min,
    max,
    total: sum
  };
};
