import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CategoryCardProps {
  slug: string;
  name: string;
  description: string;
  icon: keyof typeof Icons;
}

const CategoryCard = ({ slug, name, description, icon }: CategoryCardProps) => {
  const IconComponent = Icons[icon] as any;
  
  return (
    <Link to={`/category/${slug}`} className="group block" aria-label={`${name} category`}>
      <Card className="h-full transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-lg border-2 hover:border-primary/30 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Icon 
              variant="gradient" 
              size="lg" 
              shape="rounded" 
              className="group-hover:scale-110 transition-transform duration-300"
            >
              <IconComponent className="h-6 w-6" />
            </Icon>
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                {name}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {description}
          </p>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              Explore tools
            </Badge>
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
              <svg className="w-3 h-3 text-primary group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
