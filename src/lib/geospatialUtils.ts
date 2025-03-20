
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
    
    console.log(`Loaded TIFF for year ${year}. Data range:`, Math.min(...data), Math.max(...data));
    return { data, width, height };
  } catch (error) {
    console.error(`Error loading TIFF for year ${year}:`, error);
    return { data: [], width: 0, height: 0 };
  }
};

// Improved interpolation between two years of data with enhanced transition effects
export const interpolateData = (
  startData: number[], 
  endData: number[], 
  progress: number
): number[] => {
  if (startData.length !== endData.length || startData.length === 0) {
    return endData;
  }
  
  // Enhanced interpolation with better transition visualization:
  // For areas that change, create a more dramatic visual transition
  return startData.map((startValue, index) => {
    const endValue = endData[index];
    
    // If the land cover class is the same in both years, keep it
    if (startValue === endValue) {
      return startValue;
    }
    
    // For changing areas, use probability weighted by progress
    // This creates a more visually distinctive transition pattern
    const threshold = Math.pow(progress, 1.5); // Non-linear transition for more visual impact
    return Math.random() < threshold ? endValue : startValue;
  });
};

// Enhanced rendering function with improved visual clarity
export const renderTIFFToCanvas = (
  ctx: CanvasRenderingContext2D,
  data: number[],
  width: number,
  height: number,
  opacity: number = 1
): void => {
  if (!ctx || data.length === 0 || width === 0 || height === 0) {
    console.warn("Invalid rendering parameters:", { dataLength: data.length, width, height });
    return;
  }

  // Clear the canvas with the site's background color
  ctx.fillStyle = "hsl(var(--background))";
  ctx.fillRect(0, 0, width, height);

  // Create an ImageData object
  const imageData = ctx.createImageData(width, height);
  const pixels = imageData.data;

  // Log data statistics for debugging
  const valueSet = new Set(data);
  console.log("Unique values in data:", Array.from(valueSet));

  // Enhanced color mapping with better contrast
  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    
    // Check if value exists in our color mapping
    if (value in landCoverColors || value === 0) {
      const color = landCoverColors[value as keyof typeof landCoverColors] || '#4d4d4d';
      
      // Convert hex color to RGB with enhanced saturation
      let r = parseInt(color.slice(1, 3), 16);
      let g = parseInt(color.slice(3, 5), 16);
      let b = parseInt(color.slice(5, 7), 16);
      
      // Boost color saturation for better visibility
      const enhanceFactor = 1.3;
      const maxChannel = Math.max(r, g, b);
      if (maxChannel > 0) {
        const scale = Math.min(255 / maxChannel, enhanceFactor);
        r = Math.min(255, Math.round(r * scale));
        g = Math.min(255, Math.round(g * scale));
        b = Math.min(255, Math.round(b * scale));
      }
      
      // Set RGBA values in the ImageData
      const pixelIndex = i * 4;
      pixels[pixelIndex] = r;
      pixels[pixelIndex + 1] = g;
      pixels[pixelIndex + 2] = b;
      pixels[pixelIndex + 3] = Math.round(opacity * 255); // Alpha channel
    } else {
      // For unknown values, make them visible for debugging (bright magenta)
      const pixelIndex = i * 4;
      pixels[pixelIndex] = 255;
      pixels[pixelIndex + 1] = 0;
      pixels[pixelIndex + 2] = 255;
      pixels[pixelIndex + 3] = Math.round(opacity * 255);
      
      // Log unusual values (but limit to avoid console spam)
      if (!valueSet.has(value)) {
        valueSet.add(value);
        console.warn(`Unknown land cover value: ${value}`);
      }
    }
  }

  // Put the ImageData onto the canvas
  ctx.putImageData(imageData, 0, 0);
}

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
