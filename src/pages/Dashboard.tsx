import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Leaf, Droplets, Wind, Cloud, Trees, Users } from "lucide-react";
import DataCard from "@/components/DataCard";
import YearSlider from "@/components/YearSlider";
import MapVisualization from "@/components/MapVisualization";
import ChartCarousel from "@/components/ChartCarousel";

const landCoverData = [
  { name: "Forest", value: 120 },
  { name: "Shrubland", value: 150 },
  { name: "Grassland", value: 80 },
  { name: "Wetlands", value: 50 },
  { name: "Cropland", value: 100 },
];

const landCoverColors = ["#22c55e", "#eab308", "#84cc16", "#06b6d4", "#f97316"];

const landCoverTimeSeriesData = [
  { year: 2010, forest: 100, shrubland: 140, grassland: 70, wetlands: 45, cropland: 90 },
  { year: 2011, forest: 105, shrubland: 145, grassland: 72, wetlands: 46, cropland: 92 },
  { year: 2012, forest: 110, shrubland: 150, grassland: 75, wetlands: 47, cropland: 94 },
  { year: 2013, forest: 112, shrubland: 152, grassland: 76, wetlands: 48, cropland: 95 },
  { year: 2014, forest: 115, shrubland: 155, grassland: 78, wetlands: 49, cropland: 96 },
  { year: 2015, forest: 118, shrubland: 158, grassland: 80, wetlands: 50, cropland: 98 },
  { year: 2016, forest: 120, shrubland: 160, grassland: 82, wetlands: 51, cropland: 100 },
  { year: 2017, forest: 122, shrubland: 162, grassland: 83, wetlands: 52, cropland: 102 },
  { year: 2018, forest: 125, shrubland: 165, grassland: 85, wetlands: 53, cropland: 104 },
  { year: 2019, forest: 128, shrubland: 168, grassland: 87, wetlands: 54, cropland: 106 },
  { year: 2020, forest: 130, shrubland: 170, grassland: 88, wetlands: 55, cropland: 108 },
  { year: 2021, forest: 132, shrubland: 172, grassland: 89, wetlands: 56, cropland: 110 },
  { year: 2022, forest: 135, shrubland: 175, grassland: 90, wetlands: 57, cropland: 112 },
  { year: 2023, forest: 138, shrubland: 178, grassland: 92, wetlands: 58, cropland: 115 },
];

const conversionRatesData = [
  { name: "Forest to Shrubland", conversionRate: -5 },
  { name: "Shrubland to Grassland", conversionRate: 8 },
  { name: "Grassland to Cropland", conversionRate: 3 },
  { name: "Wetlands to Cropland", conversionRate: 2 },
];

const climateData = [
  { year: 2010, precipitation: 450, temperature: 28 },
  { year: 2011, precipitation: 460, temperature: 29 },
  { year: 2012, precipitation: 470, temperature: 30 },
  { year: 2013, precipitation: 480, temperature: 31 },
  { year: 2014, precipitation: 490, temperature: 32 },
  { year: 2015, precipitation: 500, temperature: 33 },
  { year: 2016, precipitation: 510, temperature: 34 },
  { year: 2017, precipitation: 520, temperature: 35 },
  { year: 2018, precipitation: 530, temperature: 36 },
  { year: 2019, precipitation: 540, temperature: 37 },
  { year: 2020, precipitation: 550, temperature: 38 },
  { year: 2021, precipitation: 560, temperature: 39 },
  { year: 2022, precipitation: 570, temperature: 40 },
  { year: 2023, precipitation: 580, temperature: 41 },
];

const socioeconomicData = [
  { year: 2010, population: 150000, literacyRate: 0.35 },
  { year: 2011, population: 155000, literacyRate: 0.36 },
  { year: 2012, population: 160000, literacyRate: 0.37 },
  { year: 2013, population: 165000, literacyRate: 0.38 },
  { year: 2014, population: 170000, literacyRate: 0.39 },
  { year: 2015, population: 175000, literacyRate: 0.40 },
  { year: 2016, population: 180000, literacyRate: 0.41 },
  { year: 2017, population: 185000, literacyRate: 0.42 },
  { year: 2018, population: 190000, literacyRate: 0.43 },
  { year: 2019, population: 195000, literacyRate: 0.44 },
  { year: 2020, population: 200000, literacyRate: 0.45 },
  { year: 2021, population: 205000, literacyRate: 0.46 },
  { year: 2022, population: 210000, literacyRate: 0.47 },
  { year: 2023, population: 215000, literacyRate: 0.48 },
];

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState(2023);

  const [landCover, setLandCover] = useState(landCoverData[landCoverData.length - 1].value);
  const [precipitation, setPrecipitation] = useState(climateData[climateData.length - 1].precipitation);
  const [population, setPopulation] = useState(socioeconomicData[socioeconomicData.length - 1].population);

  useEffect(() => {
    const currentLandCover = landCoverData.find(item => item.year === selectedYear)?.value || landCoverData[landCoverData.length - 1].value;
    const currentPrecipitation = climateData.find(item => item.year === selectedYear)?.precipitation || climateData[climateData.length - 1].precipitation;
    const currentPopulation = socioeconomicData.find(item => item.year === selectedYear)?.population || socioeconomicData[socioeconomicData.length - 1].population;

    setLandCover(currentLandCover);
    setPrecipitation(currentPrecipitation);
    setPopulation(currentPopulation);
  }, [selectedYear]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto py-8 px-4 md:px-6"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor environmental and socioeconomic trends in the Assaba region of Mauritania.
          </p>
        </div>

        <YearSlider selectedYear={selectedYear} onChange={setSelectedYear} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DataCard
            title="Land Cover"
            value={`${landCover} km²`}
            description="Total vegetated area"
            icon={<Leaf className="h-4 w-4" />}
            trend={{ value: 5, isPositive: true }}
            analyticsData={landCoverTimeSeriesData.map(item => ({ year: item.year, value: item.forest }))}
          />
          <DataCard
            title="Precipitation"
            value={`${precipitation} mm`}
            description="Average annual rainfall"
            icon={<Droplets className="h-4 w-4" />}
            trend={{ value: 3, isPositive: false }}
            analyticsData={climateData.map(item => ({ year: item.year, value: item.precipitation }))}
          />
          <DataCard
            title="Population"
            value={population}
            description="Total inhabitants"
            icon={<Users className="h-4 w-4" />}
            trend={{ value: 2, isPositive: true }}
            analyticsData={socioeconomicData.map(item => ({ year: item.year, value: item.population }))}
          />
        </div>

        <Tabs defaultValue="land-cover" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="land-cover">Land Cover Change</TabsTrigger>
            <TabsTrigger value="climate">Climate Trends</TabsTrigger>
            <TabsTrigger value="socioeconomic">Socioeconomic Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="land-cover" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-2 md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-xl">Land Cover Distribution</CardTitle>
                  <CardDescription>
                    Distribution of land cover types for {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[350px]">
                    <MapVisualization
                      year={selectedYear}
                      dataType="landCover"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-2 md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl">Land Cover Analysis</CardTitle>
                    <CardDescription>
                      Detailed trends and distributions
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[350px]">
                    <ChartCarousel>
                      {/* Chart 1: Land Cover Distribution */}
                      <div className="px-2">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Land Cover Distribution {selectedYear}</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={landCoverData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {landCoverData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={landCoverColors[index % landCoverColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} km²`, 'Area']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Chart 2: Historical Land Cover Change */}
                      <div className="px-2">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Historical Land Cover Change (2010-2023)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart
                            data={landCoverTimeSeriesData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="forest"
                              name="Forest"
                              stroke="#22c55e"
                              activeDot={{ r: 8 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="shrubland"
                              name="Shrubland"
                              stroke="#eab308"
                            />
                            <Line
                              type="monotone"
                              dataKey="grassland"
                              name="Grassland"
                              stroke="#84cc16"
                            />
                            <Line
                              type="monotone"
                              dataKey="wetlands"
                              name="Wetlands"
                              stroke="#06b6d4"
                            />
                            <Line
                              type="monotone"
                              dataKey="cropland"
                              name="Cropland"
                              stroke="#f97316"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Chart 3: Land Cover Conversion Rates */}
                      <div className="px-2">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Land Cover Conversion Rates (km²/year)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={conversionRatesData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="conversionRate"
                              name="Conversion Rate"
                              fill="#3b82f6"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCarousel>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="climate" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-2 md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-xl">Precipitation</CardTitle>
                  <CardDescription>
                    Average annual rainfall for {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={climateData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="precipitation" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-2 md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-xl">Temperature</CardTitle>
                  <CardDescription>
                    Average annual temperature for {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={climateData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="temperature" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="socioeconomic" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-2 md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-xl">Population</CardTitle>
                  <CardDescription>
                    Total inhabitants for {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={socioeconomicData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="population" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-2 md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-xl">Literacy Rate</CardTitle>
                  <CardDescription>
                    Percentage of literate individuals for {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={socioeconomicData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="literacyRate" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
