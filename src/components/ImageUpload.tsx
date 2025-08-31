import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  name: string;
  label: string;
  maxCount: number;
  optional?: boolean;
  requireDescription?: boolean;
  onImagesChange: (images: Array<{ file: File; description: string }>) => void;
}

export const ImageUpload = ({ 
  name, 
  label, 
  maxCount, 
  optional = false, 
  requireDescription = false,
  onImagesChange 
}: ImageUploadProps) => {
  const [images, setImages] = useState<Array<{ file: File | null; description: string }>>([
    { file: null, description: "" }
  ]);

  const handleFileChange = (index: number, file: File | null) => {
    const newImages = [...images];
    newImages[index].file = file;
    setImages(newImages);
    
    const validImages = newImages
      .filter(img => img.file !== null)
      .map(img => ({ file: img.file!, description: img.description }));
    onImagesChange(validImages);
  };

  const handleDescriptionChange = (index: number, description: string) => {
    const newImages = [...images];
    newImages[index].description = description;
    setImages(newImages);
    
    const validImages = newImages
      .filter(img => img.file !== null)
      .map(img => ({ file: img.file!, description: img.description }));
    onImagesChange(validImages);
  };

  const addImageSlot = () => {
    if (images.length < maxCount) {
      setImages([...images, { file: null, description: "" }]);
    }
  };

  const removeImageSlot = (index: number) => {
    if (images.length > 1) {
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      
      const validImages = newImages
        .filter(img => img.file !== null)
        .map(img => ({ file: img.file!, description: img.description }));
      onImagesChange(validImages);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label className="text-foreground font-medium">{label}</Label>
        {optional && <span className="text-muted-foreground text-sm">(optional)</span>}
      </div>
      
      {images.map((image, index) => (
        <Card key={index} className="p-4 bg-chat-bubble-secondary border-border animate-slide-up">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleFileChange(index, file);
                  }}
                  className="bg-background/50 border-border"
                />
              </div>
              
              {maxCount > 1 && (
                <div className="flex gap-2">
                  {index === images.length - 1 && images.length < maxCount && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addImageSlot}
                      className="bg-background/50 border-border hover:bg-primary hover:text-primary-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {images.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImageSlot(index)}
                      className="bg-background/50 border-border hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {(image.file || requireDescription) && (
              <Textarea
                placeholder="Enter description..."
                value={image.description}
                onChange={(e) => handleDescriptionChange(index, e.target.value)}
                className="bg-background/50 border-border resize-none"
                rows={2}
              />
            )}
            
            {image.file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Upload className="h-4 w-4" />
                <span>{image.file.name}</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};