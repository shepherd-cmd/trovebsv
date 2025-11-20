import { useState } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Historical Maps",
  "Diaries & Journals",
  "Battle Plans & Military",
  "Books & Manuscripts",
  "Letters & Correspondence",
  "Official Documents",
  "Photographs",
  "Other"
];

export function DocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!image || !title || !category) {
      toast({
        title: "Missing information",
        description: "Please provide an image, title, and category",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload image to storage
      const fileName = `${user.id}/${Date.now()}-${image.name}`;
      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      setUploading(false);
      setAnalyzing(true);

      // Call AI analysis
      const { data: analysis, error: analysisError } = await supabase.functions.invoke('analyze-document', {
        body: {
          imageUrl: publicUrl,
          category,
          title,
          description,
        }
      });

      if (analysisError) throw analysisError;

      // Create document record
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title,
          description,
          category,
          image_url: publicUrl,
          rarity_score: analysis.rarity_score,
          usefulness_score: analysis.usefulness_score,
          price_per_page: analysis.price_per_page,
          total_pages: analysis.estimated_pages,
          ai_analysis: analysis,
          status: 'analyzing'
        });

      if (insertError) throw insertError;

      toast({
        title: "Document analyzed!",
        description: "Your document has been uploaded and analyzed successfully",
      });

      // Reset form
      setImage(null);
      setPreview(null);
      setTitle("");
      setDescription("");
      setCategory("");

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Civil War Battle Map 1863"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional context about this document"
              className="mt-2"
              rows={3}
            />
          </div>

          <div>
            <Label>Document Image</Label>
            <div className="mt-2 space-y-4">
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-border"
                />
              )}
              
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => document.getElementById('camera-upload')?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                  id="camera-upload"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleUploadAndAnalyze}
            disabled={uploading || analyzing || !image || !title || !category}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {uploading && "Uploading..."}
            {analyzing && "Analyzing with AI..."}
            {!uploading && !analyzing && "Upload & Analyze"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
