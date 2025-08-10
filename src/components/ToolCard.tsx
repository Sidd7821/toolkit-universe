import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Link } from "react-router-dom";
import { ExternalLink, Star, Zap } from "lucide-react";

interface ToolCardProps {
  slug: string;
  name: string;
  shortDescription: string;
  isPremium?: boolean;
  tags?: string[];
}

const ToolCard = ({ slug, name, shortDescription, isPremium, tags = [] }: ToolCardProps) => {
  return (
    <Card className="h-full flex flex-col group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors duration-300">
            {name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isPremium && (
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 border-yellow-500/30">
                <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                Pro
              </Badge>
            )}
            <Icon 
              variant="default" 
              size="sm" 
              shape="rounded" 
              className="group-hover:bg-primary/20 transition-colors duration-300"
            >
              <Zap className="h-4 w-4" />
            </Icon>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {shortDescription}
        </p>
        
        <div className="mt-auto space-y-3">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-[10px] px-2 py-1 rounded-full bg-accent/50 text-accent-foreground border-border/60 hover:border-primary/40 transition-colors duration-300"
                >
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-[10px] px-2 py-1 rounded-full">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* Action Button */}
          <Button 
            asChild 
            size="sm" 
            variant="outline" 
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
          >
            <Link to={`/tool/${slug}`} className="flex items-center justify-center gap-2">
              <span>Open Tool</span>
              <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-300" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolCard;
