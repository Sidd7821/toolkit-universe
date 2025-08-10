import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";

interface CategoryCardProps {
  slug: string;
  name: string;
  description: string;
  icon: keyof typeof Icons;
}

const CategoryCard = ({ slug, name, description, icon }: CategoryCardProps) => {
  const Icon = Icons[icon] as any;
  return (
    <Link to={`/category/${slug}`} className="group block" aria-label={`${name} category`}>
      <Card className="h-full transition-transform duration-300 group-hover:-translate-y-1">
        <CardHeader>
          <div className="flex items-center gap-3 text-primary">
            <Icon className="h-5 w-5" />
            <CardTitle className="text-lg">{name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
