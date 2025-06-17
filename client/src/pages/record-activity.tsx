import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { insertActivitySchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, MessageSquare, Activity } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const activityFormSchema = insertActivitySchema.extend({
  date: z.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.number().optional(),
});

type ActivityForm = z.infer<typeof activityFormSchema>;

const activityTypes = {
  "off-course": {
    label: "Off-Course Work",
    description: "Fitness, strength training, and golf-related workouts",
    subtypes: [
      { value: "golf-strength-training", label: "Golf Strength Training" },
      { value: "cardio-workout", label: "Cardio Workout" },
      { value: "flexibility-stretching", label: "Flexibility & Stretching" },
      { value: "hitting-balls-at-home", label: "Hitting Balls at Home" },
    ]
  },
  "on-course": {
    label: "On-Course Play",
    description: "Playing rounds of golf on the course",
    subtypes: [
      { value: "playing-9-holes-walking", label: "9 Holes - Walking" },
      { value: "playing-9-holes-riding", label: "9 Holes - Riding" },
      { value: "playing-18-holes-walking", label: "18 Holes - Walking" },
      { value: "playing-18-holes-riding", label: "18 Holes - Riding" },
    ]
  },
  "practice-area": {
    label: "Practice Area",
    description: "Driving range, putting green, and short game practice",
    subtypes: [
      { value: "driving-range", label: "Driving Range" },
      { value: "putting-practice", label: "Putting Practice" },
      { value: "chipping-practice", label: "Chipping Practice" },
      { value: "wedge-work", label: "Wedge Work" },
      { value: "short-game-all-around", label: "Short Game - All Around" },
    ]
  }
};

export default function RecordActivity() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ActivityForm>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      date: new Date(),
      activityType: "",
      subType: "",
      startTime: "",
      endTime: "",
      comment: "",
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: (data: ActivityForm) => {
      // Convert date and time strings to proper timestamps
      const activityData = {
        ...data,
        startTime: data.startTime ? new Date(`${format(data.date, 'yyyy-MM-dd')}T${data.startTime}:00`) : null,
        endTime: data.endTime ? new Date(`${format(data.date, 'yyyy-MM-dd')}T${data.endTime}:00`) : null,
        duration: data.duration || null,
      };
      return apiRequest('POST', '/api/activities', activityData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/performance'] });
      toast({
        title: "Activity Recorded",
        description: "Your golf activity has been successfully recorded.",
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record activity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ActivityForm) => {
    // Calculate duration if start and end times are provided
    if (data.startTime && data.endTime && !data.duration) {
      const start = new Date(`${format(data.date, 'yyyy-MM-dd')}T${data.startTime}:00`);
      const end = new Date(`${format(data.date, 'yyyy-MM-dd')}T${data.endTime}:00`);
      const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      data.duration = durationMinutes;
    }
    createActivityMutation.mutate(data);
  };

  const selectedActivityType = form.watch("activityType");
  const selectedSubtypes = selectedActivityType ? activityTypes[selectedActivityType as keyof typeof activityTypes]?.subtypes || [] : [];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <Activity className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Record Activity</h1>
        <p className="mt-2 text-gray-600">
          Log your golf activities - whether it's on-course play, practice, or fitness work
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Details</CardTitle>
          <CardDescription>
            Choose your activity type and provide the details below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Activity Type Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Activity Type</Label>
              <RadioGroup
                value={form.watch("activityType")}
                onValueChange={(value) => {
                  form.setValue("activityType", value);
                  form.setValue("subType", ""); // Reset subtype when activity type changes
                }}
                className="space-y-3"
              >
                {Object.entries(activityTypes).map(([key, type]) => (
                  <div key={key} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={key} id={key} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={key} className="font-medium cursor-pointer">
                        {type.label}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Subtype Selection */}
            {selectedActivityType && selectedSubtypes.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="subType">Specific Activity</Label>
                <Select
                  value={form.watch("subType") || ""}
                  onValueChange={(value) => form.setValue("subType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specific activity..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSubtypes.map((subtype) => (
                      <SelectItem key={subtype.value} value={subtype.value}>
                        {subtype.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("date") ? format(form.watch("date"), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("date")}
                    onSelect={(date) => date && form.setValue("date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time (optional)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="startTime"
                    type="time"
                    className="pl-10"
                    {...form.register("startTime")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time (optional)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="endTime"
                    type="time"
                    className="pl-10"
                    {...form.register("endTime")}
                  />
                </div>
              </div>
            </div>

            {/* Duration Input */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes, optional)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="Enter duration in minutes..."
                {...form.register("duration", { valueAsNumber: true })}
              />
              <p className="text-sm text-gray-600">
                Duration will be calculated automatically if you provide start and end times
              </p>
            </div>

            {/* Comment Section */}
            <div className="space-y-2">
              <Label htmlFor="comment">Comments (optional)</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="comment"
                  placeholder="How did it go? Any notes about your session..."
                  className="pl-10 min-h-[100px]"
                  {...form.register("comment")}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createActivityMutation.isPending || !selectedActivityType}
                className="flex-1"
              >
                {createActivityMutation.isPending ? "Recording..." : "Record Activity"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}