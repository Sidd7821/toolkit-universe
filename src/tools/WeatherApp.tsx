import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Sunrise,
  Sunset
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

// Map Open-Meteo weather codes to descriptions and icon names
const weatherCodeMap: Record<
  number,
  { desc: string; icon: string }
> = {
  0: { desc: "Clear sky", icon: "☀️" },
  1: { desc: "Mainly clear", icon: "🌤️" },
  2: { desc: "Partly cloudy", icon: "⛅" },
  3: { desc: "Overcast", icon: "☁️" },
  45: { desc: "Fog", icon: "🌫️" },
  48: { desc: "Depositing rime fog", icon: "🌫️" },
  51: { desc: "Light drizzle", icon: "🌦️" },
  53: { desc: "Moderate drizzle", icon: "🌦️" },
  55: { desc: "Dense drizzle", icon: "🌧️" },
  61: { desc: "Slight rain", icon: "🌦️" },
  63: { desc: "Moderate rain", icon: "🌧️" },
  65: { desc: "Heavy rain", icon: "🌧️" },
  71: { desc: "Slight snow fall", icon: "🌨️" },
  73: { desc: "Moderate snow fall", icon: "🌨️" },
  75: { desc: "Heavy snow fall", icon: "❄️" },
  95: { desc: "Thunderstorm", icon: "⛈️" },
  96: { desc: "Thunderstorm with hail", icon: "⛈️" },
  99: { desc: "Thunderstorm with heavy hail", icon: "⛈️" }
};

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function WeatherApp() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async (lat: number, lon: number, locName: string) => {
    setLoading(true);
    setError("");

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weathercode&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();

      const cw = data.current_weather;
      const wmo = weatherCodeMap[cw.weathercode] || {
        desc: "Unknown",
        icon: "❓"
      };

      setWeather({
        location: locName,
        temperature: cw.temperature,
        windspeed: cw.windspeed,
        weatherDesc: wmo.desc,
        weatherIcon: wmo.icon,
        sunrise: formatTime(data.daily.sunrise[0]),
        sunset: formatTime(data.daily.sunset[0])
      });

      const forecastData = data.daily.time.map((date: string, idx: number) => {
        const code = data.daily.weathercode[idx];
        const wmoDay = weatherCodeMap[code] || {
          desc: "Unknown",
          icon: "❓"
        };
        return {
          date: new Date(date).toLocaleDateString("en-US", {
            weekday: "short"
          }),
          max: data.daily.temperature_2m_max[idx],
          min: data.daily.temperature_2m_min[idx],
          icon: wmoDay.icon,
          desc: wmoDay.desc
        };
      });

      setForecast(forecastData);
    } catch (err) {
      setError("Could not load weather data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!location.trim()) {
      setError("Please enter a location");
      return;
    }
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          location
        )}`
      );
      const geo = await geoRes.json();
      if (!geo.results || geo.results.length === 0)
        throw new Error("Location not found");
      const { latitude, longitude, name, country } = geo.results[0];
      fetchWeather(latitude, longitude, `${name}, ${country}`);
    } catch {
      setError("Unable to find that location");
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          fetchWeather(
            pos.coords.latitude,
            pos.coords.longitude,
            "Current Location"
          );
        },
        () => {
          fetchWeather(23.03, 72.58, "Ahmedabad, India");
        }
      );
    } else {
      fetchWeather(23.03, 72.58, "Ahmedabad, India");
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Weather Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="location" className="sr-only">
                Location
              </Label>
              <Input
                id="location"
                placeholder="Enter city..."
                value={location}
                onChange={e => setLocation(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>

      {weather && (
        <>
          {/* Current Weather */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {weather.location}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-center">
              <div className="text-4xl">
                {weather.weatherIcon} {weather.temperature}°C
                <div className="text-sm text-muted-foreground">
                  {weather.weatherDesc}
                </div>
              </div>
              <div className="flex flex-col justify-center gap-2">
                <div className="flex items-center gap-1 justify-center">
                  <Wind className="h-4 w-4 text-green-500" />{" "}
                  {weather.windspeed} km/h
                </div>
                <div className="flex items-center gap-1 justify-center">
                  <Sunrise className="h-4 w-4 text-yellow-500" />{" "}
                  {weather.sunrise}
                </div>
                <div className="flex items-center gap-1 justify-center">
                  <Sunset className="h-4 w-4 text-orange-500" />{" "}
                  {weather.sunset}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>7-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 text-center">
                {forecast.map((day, idx) => (
                  <div
                    key={idx}
                    className="p-2 border rounded-lg shadow-sm bg-muted/30"
                  >
                    <div className="font-semibold">{day.date}</div>
                    <div className="text-2xl">{day.icon}</div>
                    <div className="text-xs text-muted-foreground">
                      {day.desc}
                    </div>
                    <div className="font-medium">
                      {day.max}° / {day.min}°
                    </div>
                  </div>
                ))}
              </div>

              {/* Temp Chart */}
              <div className="mt-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecast}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="max"
                      stroke="#f97316"
                      name="Max Temp"
                    />
                    <Line
                      type="monotone"
                      dataKey="min"
                      stroke="#3b82f6"
                      name="Min Temp"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
