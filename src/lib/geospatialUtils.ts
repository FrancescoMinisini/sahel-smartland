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

// Enhanced rendering function with better color blending
export const renderTIFFToCanvas = (
  ctx: CanvasRenderingContext2D,
  data: number[],
  width: number,
  height: number,
  opacity: number = 1
): void => {
  if (!ctx || data.length === 0 || width === 0 || height === 0) {
    return;
  }

  // Create an ImageData object
  const imageData = ctx.createImageData(width, height);
  const pixels = imageData.data;

  // Map the data values to RGBA values with improved color mapping
  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    const color = landCoverColors[value as keyof typeof landCoverColors] || landCoverColors[0];
    
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
