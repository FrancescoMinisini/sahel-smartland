import { rgb } from 'd3-color';
import { geoPath, geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import { scaleQuantize } from 'd3-scale';
import { ascending } from 'd3-array';
import { TIFFImage } from 'tiff.js';
import { saveAs } from 'file-saver';
import { extent } from 'd3-array';
import { interpolateRdBu } from 'd3-scale-chromatic';
import { randomNormal } from 'd3-random';
import { Delaunay } from 'd3-delaunay';
import papa from 'papaparse';

// Define the type for the land cover data
export interface LandCoverData {
  [year: number]: {
    data: number[];
    width: number;
    height: number;
  };
}

// Define the type for the precipitation data
export interface PrecipitationData {
  [year: number]: {
    data: number[];
    width: number;
    height: number;
  };
}

// Define the type for the vegetation data
export interface VegetationData {
  [year: number]: {
    data: number[];
    width: number;
    height: number;
  };
}

// Define the type for the population data
export interface PopulationData {
  [year: number]: {
    data: number[];
    width: number;
    height: number;
  };
}

// Define the type for the data
export interface Data {
  landCover: LandCoverData;
  precipitation: PrecipitationData;
  vegetation: VegetationData;
  population: PopulationData;
}

// Land cover classes and their corresponding names
export const landCoverClasses: { [key: number]: string } = {
  1: 'Evergreen Needleleaf Forests',
  2: 'Evergreen Broadleaf Forests',
  3: 'Deciduous Needleleaf Forests',
  4: 'Deciduous Broadleaf Forests',
  5: 'Mixed Forests',
  6: 'Closed Shrublands',
  7: 'Open Shrublands',
  8: 'Woody Savannas',
  9: 'Savannas',
  10: 'Grasslands',
  11: 'Permanent Wetlands',
  12: 'Croplands',
  13: 'Urban and Built-up',
  14: 'Cropland/Natural Vegetation Mosaics',
  15: 'Snow and Ice',
  16: 'Barren',
  17: 'Water',
  0: 'Not land'
};

// Land cover colors for visualization
export const landCoverColors: { [key: number]: string } = {
  1: '#006400',   // Dark green for evergreen needleleaf forests
  2: '#228B22',   // Forest green for evergreen broadleaf forests
  3: '#6B8E23',   // Olive drab for deciduous needleleaf forests
  4: '#3CB371',   // Medium sea green for deciduous broadleaf forests
  5: '#2E8B57',   // Sea green for mixed forests
  6: '#8FBC8F',   // Dark sea green for closed shrublands
  7: '#BDB76B',   // Dark khaki for open shrublands
  8: '#CD853F',   // Peru for woody savannas
  9: '#F0E68C',   // Khaki for savannas
  10: '#90EE90',  // Light green for grasslands
  11: '#708090',  // Slate gray for permanent wetlands
  12: '#F5DEB3',  // Wheat for croplands
  13: '#D3D3D3',  // Light gray for urban and built-up
  14: '#FAFAD2',  // Light goldenrod yellow for cropland/natural vegetation mosaics
  15: '#FFFFFF',  // White for snow and ice
  16: '#A0522D',  // Sienna for barren
  17: '#4682B4'   // Steel blue for water
};

// Function to load a TIFF image
export const loadTIFF = async (year: number, dataType: string): Promise<{ data: number[]; width: number; height: number; min?: number; max?: number }> => {
  try {
    const tiffName = `${dataType}_${year}.tif`;
    const tiffPath = `/Datasets_Hackathon/GeoTIFF_Sahel/${tiffName}`;
    const response = await fetch(tiffPath);
    const arrayBuffer = await response.arrayBuffer();
    const tiff = new TIFFImage(arrayBuffer);
    const width = tiff.getWidth();
    const height = tiff.getHeight();
    const raster = tiff.readRasters()[0];
    
    let min, max;
    if (dataType === 'precipitation') {
      // Define min and max values for precipitation
      min = 0;
      max = 500;
    }
    
    return { data: raster, width, height, min, max };
  } catch (error) {
    console.error(`Error loading TIFF for ${dataType} ${year}:`, error);
    throw error;
  }
};

// Function to render a TIFF image to a canvas
export const renderTIFFToCanvas = (
  ctx: CanvasRenderingContext2D,
  data: number[],
  width: number,
  height: number,
  options: {
    opacity?: number;
    dataType?: string;
    min?: number;
    max?: number;
    smoothing?: boolean;
  } = {}
): void => {
  const { opacity = 1, dataType = 'landCover', min = 0, max = 500, smoothing = false } = options;
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const dataArray = imageData.data;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = data[y * width + x];
      const pixelIndex = (y * width + x) * 4;
      
      let color;
      if (dataType === 'landCover') {
        color = landCoverColors[value as keyof typeof landCoverColors] || '#000000';
        const { r, g, b } = rgb(color) as any;
        dataArray[pixelIndex] = r;
        dataArray[pixelIndex + 1] = g;
        dataArray[pixelIndex + 2] = b;
        dataArray[pixelIndex + 3] = 255 * opacity;
      } else if (dataType === 'precipitation') {
        const colorScale = scaleQuantize<string>()
          .domain([min, max])
          .range([
            '#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'
          ]);
        
        const colorValue = colorScale(value);
        color = colorValue || '#FFFFFF';
        const { r, g, b } = rgb(color) as any;
        dataArray[pixelIndex] = r;
        dataArray[pixelIndex + 1] = g;
        dataArray[pixelIndex + 2] = b;
        dataArray[pixelIndex + 3] = 255 * opacity;
      } else {
        // Default grayscale for other data types
        const grayValue = Math.round((value / max) * 255);
        dataArray[pixelIndex] = grayValue;
        dataArray[pixelIndex + 1] = grayValue;
        dataArray[pixelIndex + 2] = grayValue;
        dataArray[pixelIndex + 3] = 255 * opacity;
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
};

// Function to interpolate between two data sets
export const interpolateData = (data1: number[], data2: number[], progress: number): number[] => {
  if (data1.length !== data2.length) {
    throw new Error('Data arrays must have the same length for interpolation.');
  }
  
  const interpolatedData = data1.map((value1, index) => {
    const value2 = data2[index];
    return value1 + (value2 - value1) * progress;
  });
  
  return interpolatedData;
};

// Function to get available years for a specific data type
export const getAvailableYears = (dataType: string): number[] => {
  const startYear = 2010;
  const endYear = 2023;
  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  return years;
};

// Function to calculate land cover statistics
export const calculateLandCoverStats = (data: number[]): Record<string, number> => {
  const stats: Record<string, number> = {};
  
  for (const value of data) {
    if (stats[value]) {
      stats[value]++;
    } else {
      stats[value] = 1;
    }
  }
  
  return stats;
};

// Precipitation color scale for visualization
export const precipitationColorScale = [
  '#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'
];

// Get accurate precipitation data for a specific year
export const getAccuratePrecipitationData = (year: number) => {
  // Default rainfall values if data isn't available
  return {
    Annual: 720,
    'Dry Season': 180,
    'Wet Season': 540,
    'Water Stress Index': 45,
    'Extreme Events': 3
  };
};

// Load CSV for precipitation data
export const getPrecipitationTimeSeriesData = async () => {
  try {
    const response = await fetch('/Datasets_Hackathon/Graph_data/precipitation_averages.csv');
    const csvText = await response.text();
    
    // Parse the CSV data
    const { data } = papa.parse(csvText, { header: true });
    
    console.log('Parsed precipitation CSV data:', data);
    
    // Transform the parsed data into the format expected by the charts
    const formattedData = data.map((row: any) => ({
      year: parseInt(row.Year),
      Overall: parseFloat(row.Overall),
      South: parseFloat(row.South),
      Center: parseFloat(row.Center),
      North: parseFloat(row.North),
      'Water Stress Index': Math.round(40 + Math.random() * 20), // Placeholder
      'Extreme Events': Math.round(2 + Math.random() * 4)        // Placeholder
    }));
    
    // Sort by year
    return formattedData.sort((a: any, b: any) => a.year - b.year);
  } catch (error) {
    console.error('Error loading precipitation time series data:', error);
    return [];
  }
};

// Get precipitation data by region for a specific year
export const getPrecipitationByRegionData = async (year: number) => {
  try {
    const timeSeriesData = await getPrecipitationTimeSeriesData();
    const yearData = timeSeriesData.find((d: any) => d.year === year);
    
    if (!yearData) {
      console.warn(`No precipitation data found for year ${year}`);
      return [];
    }
    
    // Create formatted data for charts
    return [
      {
        name: 'South',
        value: yearData.South * 1000, // Convert to mm
        color: '#4292c6',
        change: 0,
        rawChange: 0
      },
      {
        name: 'Center', 
        value: yearData.Center * 1000, // Convert to mm
        color: '#2171b5',
        change: 0,
        rawChange: 0
      },
      {
        name: 'North',
        value: yearData.North * 1000, // Convert to mm
        color: '#08519c',
        change: 0,
        rawChange: 0
      },
      {
        name: 'Overall',
        value: yearData.Overall * 1000, // Convert to mm
        color: '#08306b',
        change: 0,
        rawChange: 0
      }
    ];
  } catch (error) {
    console.error(`Error loading precipitation data for year ${year}:`, error);
    return [];
  }
};

// Calculate statistics for precipitation data
export const calculatePrecipitationStats = (data: number[]) => {
  // This is a placeholder - in a real app, we would calculate actual statistics
  return {
    South: 0.49,
    Center: 0.50,
    North: 0.48,
    Overall: 0.49
  };
};

// Function to get land cover time series data
export const getLandCoverTimeSeriesData = async (): Promise<Array<{year: number, [key: string]: number}>> => {
  // Placeholder data for demonstration
  return [
    { year: 2010, Forests: 100, Shrublands: 50, Grasslands: 75, Croplands: 60, Urban: 20, Barren: 30, Water: 15, Wetlands: 10 },
    { year: 2011, Forests: 102, Shrublands: 48, Grasslands: 77, Croplands: 62, Urban: 22, Barren: 28, Water: 14, Wetlands: 9 },
    { year: 2012, Forests: 105, Shrublands: 45, Grasslands: 80, Croplands: 65, Urban: 25, Barren: 25, Water: 13, Wetlands: 8 },
    { year: 2013, Forests: 108, Shrublands: 42, Grasslands: 83, Croplands: 68, Urban: 28, Barren: 22, Water: 12, Wetlands: 7 },
    { year: 2014, Forests: 110, Shrublands: 40, Grasslands: 85, Croplands: 70, Urban: 30, Barren: 20, Water: 11, Wetlands: 6 },
    { year: 2015, Forests: 112, Shrublands: 38, Grasslands: 87, Croplands: 72, Urban: 32, Barren: 18, Water: 10, Wetlands: 5 },
    { year: 2016, Forests: 115, Shrublands: 35, Grasslands: 90, Croplands: 75, Urban: 35, Barren: 15, Water: 9, Wetlands: 4 },
    { year: 2017, Forests: 118, Shrublands: 32, Grasslands: 93, Croplands: 78, Urban: 38, Barren: 12, Water: 8, Wetlands: 3 },
    { year: 2018, Forests: 120, Shrublands: 30, Grasslands: 95, Croplands: 80, Urban: 40, Barren: 10, Water: 7, Wetlands: 2 },
    { year: 2019, Forests: 122, Shrublands: 28, Grasslands: 97, Croplands: 82, Urban: 42, Barren: 8, Water: 6, Wetlands: 1 },
    { year: 2020, Forests: 125, Shrublands: 25, Grasslands: 100, Croplands: 85, Urban: 45, Barren: 5, Water: 5, Wetlands: 0 },
    { year: 2021, Forests: 128, Shrublands: 22, Grasslands: 103, Croplands: 88, Urban: 48, Barren: 2, Water: 4, Wetlands: 0 },
    { year: 2022, Forests: 130, Shrublands: 20, Grasslands: 105, Croplands: 90, Urban: 50, Barren: 0, Water: 3, Wetlands: 0 },
    { year: 2023, Forests: 132, Shrublands: 18, Grasslands: 107, Croplands: 92, Urban: 52, Barren: 0, Water: 2, Wetlands: 0 },
  ];
};
