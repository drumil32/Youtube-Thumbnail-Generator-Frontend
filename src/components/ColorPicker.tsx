import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  onColorChange: (color: string) => void;
  selectedColor?: string;
}

const PRESET_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", 
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
];

const GRADIENT_COLORS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)"
];

export const ColorPicker = ({ onColorChange, selectedColor }: ColorPickerProps) => {
  const [colorType, setColorType] = useState<'simple' | 'gradient'>('simple');

  return (
    <div className="space-y-3 sm:space-y-4">
      <Label className="text-foreground font-medium text-xs sm:text-sm">Theme Color</Label>
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant={colorType === 'simple' ? 'default' : 'outline'}
          onClick={() => setColorType('simple')}
          className="bg-chat-bubble-secondary border-border text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2"
        >
          Simple
        </Button>
        <Button
          type="button"
          variant={colorType === 'gradient' ? 'default' : 'outline'}
          onClick={() => setColorType('gradient')}
          className="bg-chat-bubble-secondary border-border text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2"
        >
          Gradient
        </Button>
      </div>

      <Card className="p-3 sm:p-4 bg-chat-bubble-secondary border-border">
        {colorType === 'simple' ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
            {PRESET_COLORS.map((color, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  "w-8 h-8 sm:w-12 sm:h-12 rounded-lg border-2 transition-all duration-200 hover:scale-110",
                  selectedColor === color ? "border-primary shadow-glow" : "border-border"
                )}
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {GRADIENT_COLORS.map((gradient, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  "w-full h-8 sm:h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105",
                  selectedColor === gradient ? "border-primary shadow-glow" : "border-border"
                )}
                style={{ background: gradient }}
                onClick={() => onColorChange(gradient)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};