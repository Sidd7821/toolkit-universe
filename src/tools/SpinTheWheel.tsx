import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Plus, Trash2, Play, Save, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WheelItem {
  id: string;
  text: string;
  color: string;
  weight: number;
}

const SpinTheWheel = () => {
  const [items, setItems] = useState<WheelItem[]>([
    { id: "1", text: "Option 1", color: "#FF6B6B", weight: 1 },
    { id: "2", text: "Option 2", color: "#4ECDC4", weight: 1 },
    { id: "3", text: "Option 3", color: "#45B7D1", weight: 1 },
    { id: "4", text: "Option 4", color: "#96CEB4", weight: 1 },
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [newItemText, setNewItemText] = useState("");
  const [wheelName, setWheelName] = useState("Decision Wheel");
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
  ];

  const addItem = () => {
    if (!newItemText.trim()) {
      toast({ title: "Error", description: "Please enter text", variant: "destructive" });
      return;
    }
    if (items.length >= 20) {
      toast({ title: "Error", description: "Max 20 options allowed", variant: "destructive" });
      return;
    }
    const newItem: WheelItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      color: colors[items.length % colors.length],
      weight: 1
    };
    setItems([...items, newItem]);
    setNewItemText("");
  };

  const removeItem = (id: string) => {
    if (items.length <= 2) {
      toast({ title: "Error", description: "At least 2 options required", variant: "destructive" });
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const updateWeight = (id: string, weight: number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, weight: Math.max(1, Math.min(10, weight)) } : item
    ));
  };

  const spinWheel = () => {
    if (isSpinning || items.length < 2) return;

    setIsSpinning(true);
    setResult(null);

    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;
    for (let i = 0; i < items.length; i++) {
      random -= items[i].weight;
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    // Calculate where that segment is visually
    const segmentAngle = 360 / totalWeight;
    const selectedWeightBefore = items
      .slice(0, selectedIndex)
      .reduce((sum, item) => sum + item.weight, 0);
    const selectedStartAngle = selectedWeightBefore * segmentAngle;
    const selectedMiddleAngle =
      selectedStartAngle + (items[selectedIndex].weight * segmentAngle) / 2;

    // Pointer is at 0°, so we spin enough times and land with the chosen segment's middle under it
    const spins = 5; // full spins before stop
    const finalRotation =
      spins * 360 + (360 - selectedMiddleAngle) + Math.random() * 5 - 2.5;

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setResult(items[selectedIndex].text);
      toast({ title: "Result", description: `Selected: ${items[selectedIndex].text}` });
    }, 3500);
  };

  const resetWheel = () => {
    setRotation(0);
    setResult(null);
    setIsSpinning(false);
  };

  const saveWheel = () => {
    const wheelData = {
      name: wheelName,
      items: items,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(wheelData)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${wheelName.replace(/\s+/g, "_")}.json`;
    link.click();
  };

  const loadWheel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
          setWheelName(data.name || "Loaded Wheel");
        }
      } catch {
        toast({ title: "Error", description: "Invalid file", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let currentAngle = 0;

    items.forEach((item) => {
      const angle = (item.weight / totalWeight) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(currentAngle + angle / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px Arial";
      ctx.fillText(item.text, radius * 0.7, 0);
      ctx.restore();

      currentAngle += angle;
    });

    // Pointer
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 20);
    ctx.lineTo(centerX - 10, centerY - radius);
    ctx.lineTo(centerX + 10, centerY - radius);
    ctx.closePath();
    ctx.fillStyle = "#FF6B6B";
    ctx.fill();
  };

  useEffect(() => {
    drawWheel();
  }, [items]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.transform = `rotate(${rotation}deg)`;
      canvasRef.current.style.transition = isSpinning
        ? "transform 3.5s cubic-bezier(0.17, 0.67, 0.83, 0.67)"
        : "none";
    }
  }, [rotation, isSpinning]);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Wheel Section */}
      <Card>
        <CardHeader>
          <CardTitle>Spin the Wheel</CardTitle>
        </CardHeader>
        <CardContent>
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="mx-auto"
          />
          {result && (
            <div className="text-center mt-4">
              <Badge>{result}</Badge>
            </div>
          )}
          <div className="flex gap-2 mt-4 justify-center">
            <Button onClick={spinWheel} disabled={isSpinning}>
              <Play className="h-4 w-4 mr-2" />
              {isSpinning ? "Spinning..." : "Spin"}
            </Button>
            <Button onClick={resetWheel} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manage Options */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Manage Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Enter option"
              onKeyPress={(e) => e.key === "Enter" && addItem()}
            />
            <Button onClick={addItem}><Plus className="h-4 w-4" /></Button>
          </div>
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <Input
                value={item.text}
                onChange={(e) =>
                  setItems(items.map(i =>
                    i.id === item.id ? { ...i, text: e.target.value } : i
                  ))
                }
              />
              <Input
                type="number"
                min={1}
                max={10}
                value={item.weight}
                onChange={(e) => updateWeight(item.id, parseInt(e.target.value))}
                className="w-16"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2 mt-4">
            <Button onClick={saveWheel} variant="outline">
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
            <label className="relative cursor-pointer flex-1">
              <input
                type="file"
                accept=".json"
                onChange={loadWheel}
                className="hidden"
              />
              <div className="border rounded p-2 text-center">
                <Upload className="h-4 w-4 inline-block mr-1" /> Load
              </div>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpinTheWheel;
