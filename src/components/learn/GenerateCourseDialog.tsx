import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';

interface GenerateCourseDialogProps {
  onGenerate: (topic: string, level: string) => Promise<string | null>;
  isGenerating: boolean;
}

export const GenerateCourseDialog = ({ onGenerate, isGenerating }: GenerateCourseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    const courseId = await onGenerate(topic.trim(), level);
    if (courseId) {
      setOpen(false);
      setTopic('');
      setLevel('beginner');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate AI Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-heading">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Generate AI Course
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Enter a topic and our AI will create a personalized course with modules and lessons.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="topic" className="text-text-heading">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., Cryptocurrency Investing, Options Trading"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-background dark:bg-slate-800"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="level" className="text-text-heading">Difficulty Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="bg-background dark:bg-slate-800">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={!topic.trim() || isGenerating}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Course
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
