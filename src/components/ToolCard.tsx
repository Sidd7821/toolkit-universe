import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ToolCardProps {
  slug: string;
  name: string;
  shortDescription: string;
  isPremium?: boolean;
  tags?: string[];
}

const ToolCard = ({ slug, name, shortDescription, isPremium, tags = [] }: ToolCardProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {name}
          {isPremium && (
            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] leading-none text-secondary-foreground border border-border">Pro</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-3">{shortDescription}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border/60">
                {t}
              </span>
            ))}
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to={`/tool/${slug}`}>Open</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolCard;
