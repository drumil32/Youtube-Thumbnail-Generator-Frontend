import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CategorySelectProps {
  onCategoryChange: (category: string) => void;
  selectedCategory?: string;
}

const CATEGORIES = [
  { id: 'lifestyle', name: 'Lifestyle', icon: '🌟' },
  { id: 'technology', name: 'Technology', icon: '💻' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'gaming', name: 'Gaming', icon: '🎮' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'news', name: 'News', icon: '📰' }
];

export const CategorySelect = ({ onCategoryChange, selectedCategory }: CategorySelectProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-foreground font-medium">Category</Label>
      
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((category) => (
          <Card
            key={category.id}
            className={cn(
              "p-4 cursor-pointer transition-all duration-200 hover:scale-105 border",
              selectedCategory === category.id 
                ? "bg-gradient-primary border-primary shadow-glow" 
                : "bg-chat-bubble-secondary border-border hover:border-primary/50"
            )}
            onClick={() => onCategoryChange(category.id)}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category.icon}</span>
              <span className={cn(
                "font-medium",
                selectedCategory === category.id 
                  ? "text-chat-bubble-foreground" 
                  : "text-foreground"
              )}>
                {category.name}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};