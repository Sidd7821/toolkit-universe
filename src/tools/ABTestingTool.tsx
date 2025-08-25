import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  BarChart3, 
  Users, 
  MousePointer, 
  Clock, 
  Target, 
  Copy, 
  Download,
  Eye,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TestVariant {
  id: string;
  name: string;
  content: string;
  views: number;
  clicks: number;
  conversions: number;
  avgTimeOnPage: number;
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  variantA: TestVariant;
  variantB: TestVariant;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  trafficSplit: number; // Percentage to variant B
  primaryMetric: 'clicks' | 'conversions' | 'time';
}

const ABTestingTool = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [currentTest, setCurrentTest] = useState<ABTest | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    variantAContent: "",
    variantBContent: "",
    trafficSplit: 50,
    primaryMetric: 'clicks' as const,
  });

  // Load tests from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("abTests");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTests(parsed.map((test: any) => ({
        ...test,
        startDate: new Date(test.startDate),
        endDate: test.endDate ? new Date(test.endDate) : undefined,
      })));
    }
  }, []);

  // Save tests to localStorage
  useEffect(() => {
    localStorage.setItem("abTests", JSON.stringify(tests));
  }, [tests]);

  const createTest = () => {
    if (!formData.name || !formData.variantAContent || !formData.variantBContent) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newTest: ABTest = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      variantA: {
        id: "A",
        name: "Variant A",
        content: formData.variantAContent,
        views: 0,
        clicks: 0,
        conversions: 0,
        avgTimeOnPage: 0,
      },
      variantB: {
        id: "B",
        name: "Variant B",
        content: formData.variantBContent,
        views: 0,
        clicks: 0,
        conversions: 0,
        avgTimeOnPage: 0,
      },
      startDate: new Date(),
      isActive: true,
      trafficSplit: formData.trafficSplit,
      primaryMetric: formData.primaryMetric,
    };

    setTests((prev) => [...prev, newTest]);
    setCurrentTest(newTest);
    setShowCreateForm(false);
    setFormData({
      name: "",
      description: "",
      variantAContent: "",
      variantBContent: "",
      trafficSplit: 50,
      primaryMetric: 'clicks',
    });

    toast({
      title: "Test created",
      description: `A/B test "${formData.name}" has been created successfully.`,
    });
  };

  const simulateTraffic = (testId: string) => {
    setTests((prev) =>
      prev.map((test) => {
        if (test.id === testId) {
          // Simulate random traffic
          const newViewsA = test.variantA.views + Math.floor(Math.random() * 50) + 10;
          const newViewsB = test.variantB.views + Math.floor(Math.random() * 50) + 10;
          
          const clickRateA = 0.05 + Math.random() * 0.1; // 5-15% click rate
          const clickRateB = 0.05 + Math.random() * 0.1;
          
          const conversionRateA = 0.01 + Math.random() * 0.05; // 1-6% conversion rate
          const conversionRateB = 0.01 + Math.random() * 0.05;

          return {
            ...test,
            variantA: {
              ...test.variantA,
              views: newViewsA,
              clicks: Math.floor(newViewsA * clickRateA),
              conversions: Math.floor(newViewsA * conversionRateA),
              avgTimeOnPage: 30 + Math.random() * 120, // 30-150 seconds
            },
            variantB: {
              ...test.variantB,
              views: newViewsB,
              clicks: Math.floor(newViewsB * clickRateB),
              conversions: Math.floor(newViewsB * conversionRateB),
              avgTimeOnPage: 30 + Math.random() * 120,
            },
          };
        }
        return test;
      })
    );

    toast({
      title: "Traffic simulated",
      description: "New traffic data has been added to the test.",
    });
  };

  const endTest = (testId: string) => {
    setTests((prev) =>
      prev.map((test) =>
        test.id === testId ? { ...test, isActive: false, endDate: new Date() } : test
      )
    );

    toast({
      title: "Test ended",
      description: "The A/B test has been ended.",
    });
  };

  const getWinner = (test: ABTest) => {
    const metricA = test.variantA[test.primaryMetric];
    const metricB = test.variantB[test.primaryMetric];
    
    if (metricA > metricB) return "A";
    if (metricB > metricA) return "B";
    return "Tie";
  };

  const calculateConfidence = (test: ABTest) => {
    // Simplified confidence calculation
    const totalViews = test.variantA.views + test.variantB.views;
    if (totalViews < 100) return "Low";
    if (totalViews < 500) return "Medium";
    return "High";
  };

  const exportResults = (test: ABTest) => {
    const data = {
      testName: test.name,
      startDate: test.startDate.toISOString(),
      endDate: test.endDate?.toISOString(),
      results: {
        variantA: test.variantA,
        variantB: test.variantB,
        winner: getWinner(test),
        confidence: calculateConfidence(test),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ab-test-${test.name.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Results exported",
      description: "Test results have been downloaded as JSON.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Your Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="w-full mb-4"
              >
                Create New Test
              </Button>

              <div className="space-y-3">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      currentTest?.id === test.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setCurrentTest(test)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{test.name}</h3>
                      <Badge variant={test.isActive ? "default" : "secondary"}>
                        {test.isActive ? "Active" : "Ended"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {test.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {test.startDate.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Details */}
        <div className="lg:col-span-2">
          {showCreateForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Create New A/B Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Test Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Homepage Headline Test"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe what you're testing..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="variantA">Variant A Content *</Label>
                    <Textarea
                      id="variantA"
                      value={formData.variantAContent}
                      onChange={(e) =>
                        setFormData({ ...formData, variantAContent: e.target.value })
                      }
                      placeholder="Original version..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="variantB">Variant B Content *</Label>
                    <Textarea
                      id="variantB"
                      value={formData.variantBContent}
                      onChange={(e) =>
                        setFormData({ ...formData, variantBContent: e.target.value })
                      }
                      placeholder="New version..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trafficSplit">Traffic Split to Variant B (%)</Label>
                    <Input
                      id="trafficSplit"
                      type="number"
                      min="10"
                      max="90"
                      value={formData.trafficSplit}
                      onChange={(e) =>
                        setFormData({ ...formData, trafficSplit: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryMetric">Primary Metric</Label>
                    <select
                      id="primaryMetric"
                      value={formData.primaryMetric}
                      onChange={(e) =>
                        setFormData({ ...formData, primaryMetric: e.target.value as any })
                      }
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="clicks">Clicks</option>
                      <option value="conversions">Conversions</option>
                      <option value="time">Time on Page</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={createTest}>Create Test</Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : currentTest ? (
            <div className="space-y-6">
              {/* Test Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{currentTest.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={currentTest.isActive ? "default" : "secondary"}>
                        {currentTest.isActive ? "Active" : "Ended"}
                      </Badge>
                      {currentTest.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => endTest(currentTest.id)}
                        >
                          End Test
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{currentTest.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {currentTest.variantA.views + currentTest.variantB.views}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {getWinner(currentTest)}
                      </div>
                      <div className="text-sm text-muted-foreground">Winner</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {calculateConfidence(currentTest)}
                      </div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {currentTest.trafficSplit}%
                      </div>
                      <div className="text-sm text-muted-foreground">Split to B</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Variants Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="outline">Variant A</Badge>
                      {getWinner(currentTest) === "A" && (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm">{currentTest.variantA.content}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Views:</span>
                        <span className="font-medium">{currentTest.variantA.views}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Clicks:</span>
                        <span className="font-medium">{currentTest.variantA.clicks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Conversions:</span>
                        <span className="font-medium">{currentTest.variantA.conversions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Time:</span>
                        <span className="font-medium">
                          {Math.round(currentTest.variantA.avgTimeOnPage)}s
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Click Rate:</span>
                        <span className="font-medium">
                          {currentTest.variantA.views > 0
                            ? ((currentTest.variantA.clicks / currentTest.variantA.views) * 100).toFixed(1)
                            : "0"}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="outline">Variant B</Badge>
                      {getWinner(currentTest) === "B" && (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm">{currentTest.variantB.content}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Views:</span>
                        <span className="font-medium">{currentTest.variantB.views}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Clicks:</span>
                        <span className="font-medium">{currentTest.variantB.clicks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Conversions:</span>
                        <span className="font-medium">{currentTest.variantB.conversions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Time:</span>
                        <span className="font-medium">
                          {Math.round(currentTest.variantB.avgTimeOnPage)}s
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Click Rate:</span>
                        <span className="font-medium">
                          {currentTest.variantB.views > 0
                            ? ((currentTest.variantB.clicks / currentTest.variantB.views) * 100).toFixed(1)
                            : "0"}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {currentTest.isActive && (
                      <Button
                        onClick={() => simulateTraffic(currentTest.id)}
                        className="flex items-center gap-2"
                      >
                        <Users className="h-4 w-4" />
                        Simulate Traffic
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => exportResults(currentTest)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a test from the list or create a new one to get started.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ABTestingTool;
