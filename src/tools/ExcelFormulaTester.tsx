import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  Play, 
  Copy, 
  RefreshCw, 
  BookOpen,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  History,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormulaResult {
  id: string;
  formula: string;
  result: string;
  error?: string;
  timestamp: Date;
  variables: { [key: string]: any };
}

interface FormulaTemplate {
  name: string;
  category: string;
  formula: string;
  description: string;
  example: string;
}

const ExcelFormulaTester = () => {
  const { toast } = useToast();
  const [formula, setFormula] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [variables, setVariables] = useState<{ [key: string]: any }>({});
  const [history, setHistory] = useState<FormulaResult[]>([]);
  const [savedFormulas, setSavedFormulas] = useState<FormulaResult[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showVariables, setShowVariables] = useState(false);

  // Common Excel formula templates
  const formulaTemplates: FormulaTemplate[] = [
    {
      name: "SUM",
      category: "Math",
      formula: "SUM({values})",
      description: "Adds all numbers in a range",
      example: "SUM(A1:A10) or SUM(1,2,3,4,5)"
    },
    {
      name: "AVERAGE",
      category: "Math",
      formula: "AVERAGE({values})",
      description: "Returns the average of the arguments",
      example: "AVERAGE(A1:A10) or AVERAGE(1,2,3,4,5)"
    },
    {
      name: "COUNT",
      category: "Math",
      formula: "COUNT({values})",
      description: "Counts the number of cells that contain numbers",
      example: "COUNT(A1:A10)"
    },
    {
      name: "IF",
      category: "Logical",
      formula: "IF(condition, value_if_true, value_if_false)",
      description: "Returns one value if a condition is true and another if false",
      example: "IF(A1>10, 'High', 'Low')"
    },
    {
      name: "VLOOKUP",
      category: "Lookup",
      formula: "VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])",
      description: "Looks up a value in the first column of a table",
      example: "VLOOKUP('Apple', A1:B10, 2, FALSE)"
    },
    {
      name: "CONCATENATE",
      category: "Text",
      formula: "CONCATENATE(text1, [text2], ...)",
      description: "Joins several text strings into one text string",
      example: "CONCATENATE('Hello', ' ', 'World')"
    },
    {
      name: "DATE",
      category: "Date",
      formula: "DATE(year, month, day)",
      description: "Returns the serial number of a particular date",
      example: "DATE(2024, 1, 15)"
    },
    {
      name: "ROUND",
      category: "Math",
      formula: "ROUND(number, num_digits)",
      description: "Rounds a number to a specified number of digits",
      example: "ROUND(3.14159, 2)"
    }
  ];

  // Excel formula evaluation function
  const evaluateFormula = (formula: string, variables: { [key: string]: any }): string => {
    try {
      // Remove Excel-specific syntax and convert to JavaScript
      let jsFormula = formula.trim();
      
      // Handle common Excel functions
      jsFormula = jsFormula.replace(/SUM\(/gi, 'sum(');
      jsFormula = jsFormula.replace(/AVERAGE\(/gi, 'average(');
      jsFormula = jsFormula.replace(/COUNT\(/gi, 'count(');
      jsFormula = jsFormula.replace(/IF\(/gi, 'if(');
      jsFormula = jsFormula.replace(/VLOOKUP\(/gi, 'vlookup(');
      jsFormula = jsFormula.replace(/CONCATENATE\(/gi, 'concatenate(');
      jsFormula = jsFormula.replace(/DATE\(/gi, 'date(');
      jsFormula = jsFormula.replace(/ROUND\(/gi, 'round(');
      
      // Handle cell references (A1, B2, etc.)
      jsFormula = jsFormula.replace(/([A-Z]+)(\d+)/g, (match, col, row) => {
        const colIndex = col.split('').reduce((acc: number, char: string) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
        const rowIndex = parseInt(row) - 1;
        const key = `${colIndex}_${rowIndex}`;
        return variables[key] !== undefined ? variables[key] : 0;
      });
      
      // Handle range references (A1:A10)
      jsFormula = jsFormula.replace(/([A-Z]+)(\d+):([A-Z]+)(\d+)/g, (match, startCol, startRow, endCol, endRow) => {
        const startColIndex = startCol.split('').reduce((acc: number, char: string) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
        const endColIndex = endCol.split('').reduce((acc: number, char: string) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
        const startRowIndex = parseInt(startRow) - 1;
        const endRowIndex = parseInt(endRow) - 1;
        
        const values = [];
        for (let row = startRowIndex; row <= endRowIndex; row++) {
          for (let col = startColIndex; col <= endColIndex; col++) {
            const key = `${col}_${row}`;
            if (variables[key] !== undefined) {
              values.push(variables[key]);
            }
          }
        }
        return `[${values.join(',')}]`;
      });

      // Helper functions
      const sum = (...args: any[]) => {
        return args.flat().reduce((acc, val) => acc + (Number(val) || 0), 0);
      };
      
      const average = (...args: any[]) => {
        const flatArgs = args.flat();
        const sum = flatArgs.reduce((acc, val) => acc + (Number(val) || 0), 0);
        return flatArgs.length > 0 ? sum / flatArgs.length : 0;
      };
      
      const count = (...args: any[]) => {
        return args.flat().filter(val => !isNaN(Number(val))).length;
      };
      
      const if_ = (condition: any, trueValue: any, falseValue: any) => {
        return condition ? trueValue : falseValue;
      };
      
      const round = (number: number, digits: number) => {
        return Math.round(number * Math.pow(10, digits)) / Math.pow(10, digits);
      };
      
      const concatenate = (...args: any[]) => {
        return args.flat().join('');
      };
      
      const date = (year: number, month: number, day: number) => {
        return new Date(year, month - 1, day).toLocaleDateString();
      };

      // Replace Excel function names with JavaScript equivalents
      jsFormula = jsFormula.replace(/sum\(/g, 'sum(');
      jsFormula = jsFormula.replace(/average\(/g, 'average(');
      jsFormula = jsFormula.replace(/count\(/g, 'count(');
      jsFormula = jsFormula.replace(/if\(/g, 'if_(');
      jsFormula = jsFormula.replace(/round\(/g, 'round(');
      jsFormula = jsFormula.replace(/concatenate\(/g, 'concatenate(');
      jsFormula = jsFormula.replace(/date\(/g, 'date(');

      // Evaluate the JavaScript expression
      const result = eval(jsFormula);
      
      // Format the result
      if (typeof result === 'number') {
        return isNaN(result) ? 'Error' : result.toString();
      } else if (typeof result === 'boolean') {
        return result.toString();
      } else if (Array.isArray(result)) {
        return `[${result.join(', ')}]`;
      } else {
        return result ? result.toString() : '';
      }
    } catch (err) {
      return `Error: ${err instanceof Error ? err.message : 'Invalid formula'}`;
    }
  };

  const handleEvaluate = () => {
    if (!formula.trim()) {
      toast({
        title: "No Formula",
        description: "Please enter a formula to evaluate",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError("");
    
    // Simulate processing time
    setTimeout(() => {
      try {
        const result = evaluateFormula(formula, variables);
        
        if (result.startsWith('Error:')) {
          setError(result);
          setResult("");
        } else {
          setResult(result);
          setError("");
          
          // Add to history
          const newResult: FormulaResult = {
            id: Date.now().toString(),
            formula,
            result,
            timestamp: new Date(),
            variables: { ...variables }
          };
          
          setHistory(prev => [newResult, ...prev.slice(0, 9)]);
        }
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setResult("");
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  const handleTemplateSelect = (templateName: string) => {
    const template = formulaTemplates.find(t => t.name === templateName);
    if (template) {
      setFormula(template.formula);
      setSelectedTemplate(templateName);
      toast({
        title: "Template Loaded",
        description: template.description,
      });
    }
  };

  const handleSaveFormula = () => {
    if (!formula.trim() || !result) {
      toast({
        title: "Cannot Save",
        description: "Please evaluate a formula first",
        variant: "destructive",
      });
      return;
    }

    const newSaved: FormulaResult = {
      id: Date.now().toString(),
      formula,
      result,
      timestamp: new Date(),
      variables: { ...variables }
    };

    setSavedFormulas(prev => [newSaved, ...prev]);
    toast({
      title: "Formula Saved",
      description: "Formula has been saved to your collection",
    });
  };

  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast({
        title: "Copied!",
        description: "Result copied to clipboard",
      });
    }
  };

  const handleClear = () => {
    setFormula("");
    setResult("");
    setError("");
    setVariables({});
    setSelectedTemplate("");
  };

  const addVariable = (key: string, value: string) => {
    const numValue = isNaN(Number(value)) ? value : Number(value);
    setVariables(prev => ({ ...prev, [key]: numValue }));
  };

  const removeVariable = (key: string) => {
    const newVars = { ...variables };
    delete newVars[key];
    setVariables(newVars);
  };

  // Load saved formulas from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedFormulas');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setSavedFormulas(parsed);
      } catch (err) {
        console.error('Failed to load saved formulas');
      }
    }
  }, []);

  // Save formulas to localStorage
  useEffect(() => {
    localStorage.setItem('savedFormulas', JSON.stringify(savedFormulas));
  }, [savedFormulas]);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <FileSpreadsheet className="text-4xl text-green-600" />
          Excel Formula Tester
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Test and validate Excel formulas in a safe sandbox environment. Perfect for learning and debugging!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Formula Tester */}
        <div className="lg:col-span-2 space-y-6">
          {/* Formula Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Formula Input
              </CardTitle>
              <CardDescription>
                Enter your Excel formula and click Evaluate to test it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="formula">Excel Formula</Label>
                <Textarea
                  id="formula"
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  placeholder="Enter Excel formula (e.g., SUM(A1:A10), IF(A1>10, 'High', 'Low'))"
                  className="min-h-[100px] font-mono"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleEvaluate} 
                  disabled={!formula.trim() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Evaluate Formula
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
                <Button variant="outline" onClick={handleSaveFormula}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Result Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <div>
                    <div className="font-medium text-destructive">Formula Error</div>
                    <div className="text-sm text-destructive/80">{error}</div>
                  </div>
                </div>
              ) : result ? (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-green-800">Result</div>
                    <div className="text-2xl font-mono text-green-900">{result}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleCopyResult}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter a formula and click Evaluate to see the result</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variables Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Variables & Cell Values
              </CardTitle>
              <CardDescription>
                Set up cell values and variables for your formula testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cellRef">Cell Reference (e.g., A1, B2)</Label>
                  <Input
                    id="cellRef"
                    placeholder="A1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.currentTarget;
                        const value = input.nextElementSibling as HTMLInputElement;
                        if (value && value.value) {
                          addVariable(input.value, value.value);
                          input.value = '';
                          value.value = '';
                        }
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="cellValue">Value</Label>
                  <Input
                    id="cellValue"
                    placeholder="10"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.currentTarget;
                        const cellRef = input.previousElementSibling as HTMLInputElement;
                        if (cellRef && cellRef.value) {
                          addVariable(cellRef.value, input.value);
                          cellRef.value = '';
                          input.value = '';
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Display current variables */}
              {Object.keys(variables).length > 0 && (
                <div className="mt-4">
                  <Label>Current Variables:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(variables).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="flex items-center gap-1">
                        {key}: {value}
                        <button
                          onClick={() => removeVariable(key)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Formula Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Formula Templates</CardTitle>
              <CardDescription>Common Excel functions to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {formulaTemplates.map((template) => (
                  <div
                    key={template.name}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === template.name ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template.name)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                    <div className="text-xs font-mono bg-muted p-2 rounded">{template.example}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Results</CardTitle>
                <CardDescription>Your recent formula evaluations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {history.map((item) => (
                    <div key={item.id} className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80" onClick={() => {
                      setFormula(item.formula);
                      setVariables(item.variables);
                      setResult(item.result);
                      setError("");
                    }}>
                      <div className="text-sm font-medium truncate">{item.formula}</div>
                      <div className="text-xs text-muted-foreground truncate">= {item.result}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saved Formulas */}
          {savedFormulas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Saved Formulas</CardTitle>
                <CardDescription>Your saved formula collection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {savedFormulas.map((item) => (
                    <div key={item.id} className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80" onClick={() => {
                      setFormula(item.formula);
                      setVariables(item.variables);
                      setResult(item.result);
                      setError("");
                    }}>
                      <div className="text-sm font-medium truncate">{item.formula}</div>
                      <div className="text-xs text-muted-foreground truncate">= {item.result}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelFormulaTester;
