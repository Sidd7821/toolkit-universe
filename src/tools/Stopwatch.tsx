import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Play, Pause, RotateCcw, Flag, Clock } from "lucide-react";

interface Lap {
  id: number;
  time: number;
  totalTime: number;
}

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [lapCount, setLapCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const startStopwatch = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now() - time;
      setIsRunning(true);
      toast({ title: "Stopwatch Started", description: "Timer is now running." });
    }
  };

  const pauseStopwatch = () => {
    setIsRunning(false);
    toast({ title: "Stopwatch Paused", description: "Timer has been paused." });
  };

  const resetStopwatch = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    setLapCount(0);
    toast({ title: "Stopwatch Reset", description: "Timer has been reset to zero." });
  };

  const recordLap = () => {
    if (!isRunning) return;
    
    const newLap: Lap = {
      id: lapCount + 1,
      time: time - (laps.length > 0 ? laps[laps.length - 1].totalTime : 0),
      totalTime: time
    };
    
    setLaps([...laps, newLap]);
    setLapCount(lapCount + 1);
    toast({ title: "Lap Recorded", description: `Lap ${newLap.id} recorded!` });
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      centiseconds: centiseconds.toString().padStart(2, '0')
    };
  };

  const { hours, minutes, seconds, centiseconds } = formatTime(time);

  const getFastestLap = () => {
    if (laps.length === 0) return null;
    return laps.reduce((fastest, lap) => lap.time < fastest.time ? lap : fastest);
  };

  const getSlowestLap = () => {
    if (laps.length === 0) return null;
    return laps.reduce((slowest, lap) => lap.time > slowest.time ? lap : slowest);
  };

  const fastestLap = getFastestLap();
  const slowestLap = getSlowestLap();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Stopwatch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Time Display */}
          <div className="text-center space-y-2">
            <Label className="text-lg font-medium">Elapsed Time</Label>
            <div className="font-mono text-4xl lg:text-6xl font-bold tracking-wider">
              {hours}:{minutes}:{seconds}.{centiseconds}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {!isRunning ? (
              <Button 
                onClick={startStopwatch} 
                className="flex-1"
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button 
                onClick={pauseStopwatch} 
                className="flex-1"
                size="lg"
                variant="outline"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            
            <Button 
              onClick={recordLap} 
              variant="outline"
              size="lg"
              disabled={!isRunning}
            >
              <Flag className="h-4 w-4 mr-2" />
              Lap
            </Button>
            
            <Button 
              onClick={resetStopwatch} 
              variant="outline"
              size="lg"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Statistics */}
          {laps.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Statistics</Label>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-muted-foreground">Total Laps</div>
                  <div className="font-semibold text-lg">{laps.length}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-muted-foreground">Average Lap</div>
                  <div className="font-semibold text-lg">
                    {formatTime(laps.reduce((sum, lap) => sum + lap.time, 0) / laps.length).minutes}:
                    {formatTime(laps.reduce((sum, lap) => sum + lap.time, 0) / laps.length).seconds}
                  </div>
                </div>
                {fastestLap && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-green-600 dark:text-green-400">Fastest Lap</div>
                    <div className="font-semibold text-lg">
                      {formatTime(fastestLap.time).minutes}:{formatTime(fastestLap.time).seconds}
                    </div>
                  </div>
                )}
                {slowestLap && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-red-600 dark:text-red-400">Slowest Lap</div>
                    <div className="font-semibold text-lg">
                      {formatTime(slowestLap.time).minutes}:{formatTime(slowestLap.time).seconds}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Lap Times ({laps.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {laps.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {laps.map((lap, index) => {
                const { minutes: lapMin, seconds: lapSec, centiseconds: lapCent } = formatTime(lap.time);
                const { minutes: totalMin, seconds: totalSec, centiseconds: totalCent } = formatTime(lap.totalTime);
                const isFastest = fastestLap && lap.id === fastestLap.id;
                const isSlowest = slowestLap && lap.id === slowestLap.id;
                
                return (
                  <div 
                    key={lap.id}
                    className={`p-3 rounded-lg border ${
                      isFastest 
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                        : isSlowest 
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-semibold">Lap {lap.id}</div>
                      <div className="text-right">
                        <div className="font-mono text-lg">
                          {lapMin}:{lapSec}.{lapCent}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total: {totalMin}:{totalSec}.{totalCent}
                        </div>
                      </div>
                    </div>
                    {isFastest && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ⭐ Fastest Lap
                      </div>
                    )}
                    {isSlowest && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        🐌 Slowest Lap
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No laps recorded yet</p>
              <p className="text-sm">Start the stopwatch and click "Lap" to record lap times</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Stopwatch;
