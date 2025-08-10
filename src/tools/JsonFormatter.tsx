import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const JsonFormatter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const format = () => {
    try {
      const obj = JSON.parse(input);
      setOutput(JSON.stringify(obj, null, 2));
      toast({ title: "Formatted", description: "JSON formatted successfully." });
    } catch (e: any) {
      toast({ title: "Invalid JSON", description: e.message, variant: "destructive" as any });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardContent className="pt-6">
          <label className="block text-sm mb-2">Input JSON</label>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste JSON here…" className="min-h-[260px]" />
          <div className="mt-3">
            <Button variant="hero" onClick={format}>Format JSON</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <label className="block text-sm mb-2">Output</label>
          <Textarea value={output} readOnly placeholder="Formatted JSON…" className="min-h-[260px] font-mono" />
        </CardContent>
      </Card>
    </div>
  );
};

export default JsonFormatter;
