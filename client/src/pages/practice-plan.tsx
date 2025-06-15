import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Wand2, Clock, MapPin, Target, TrendingUp, Calendar, Plus, Edit, Trash2, Club, DollarSign } from "lucide-react";

const planGenerationSchema = z.object({
  daysPerWeek: z.coerce.number().min(1).max(7),
  hoursPerSession: z.coerce.number().min(0.5).max(4),
  preferredTime: z.string(),
  availableResources: z.array(z.string()),
  practiceGoal: z.string(),
});

const resourceSchema = z.object({
  type: z.enum(["facility", "equipment"]),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  hours: z.string().optional(),
  cost: z.string().optional(),
  available: z.boolean().default(true),
});

type PlanGenerationForm = z.infer<typeof planGenerationSchema>;
type ResourceForm = z.infer<typeof resourceSchema>;

export default function PracticePlan() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activePlan } = useQuery({
    queryKey: ["/api/practice-plans/active"],
  });

  const { data: resources } = useQuery({
    queryKey: ["/api/resources"],
  });

  const form = useForm<PlanGenerationForm>({
    resolver: zodResolver(planGenerationSchema),
    defaultValues: {
      daysPerWeek: 3,
      hoursPerSession: 1.5,
      preferredTime: "afternoon",
      availableResources: ["driving-range", "putting-green"],
      practiceGoal: "handicap-reduction",
    },
  });

  const resourceForm = useForm<ResourceForm>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      type: "facility",
      name: "",
      description: "",
      location: "",
      hours: "",
      cost: "",
      available: true,
    },
  });

  const generatePlanMutation = useMutation({
    mutationFn: async (data: PlanGenerationForm) => {
      return apiRequest('POST', '/api/practice-plans/generate', data);
    },
    onSuccess: async () => {
      toast({
        title: "Practice Plan Generated",
        description: "Your personalized practice plan is ready!",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/practice-plans"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/practice-plans/active"] });
      setIsGenerating(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const createResourceMutation = useMutation({
    mutationFn: (data: ResourceForm) => apiRequest('POST', '/api/resources', data),
    onSuccess: () => {
      toast({
        title: "Resource Added",
        description: "Your resource has been added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setIsResourceDialogOpen(false);
      resourceForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Resource",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/resources/${id}`),
    onSuccess: () => {
      toast({
        title: "Resource Deleted",
        description: "The resource has been deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete Resource",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PlanGenerationForm) => {
    setIsGenerating(true);
    generatePlanMutation.mutate(data);
  };

  const onResourceSubmit = (data: ResourceForm) => {
    createResourceMutation.mutate(data);
  };

  const availableResources = [
    { id: "driving-range", label: "Driving Range" },
    { id: "putting-green", label: "Putting Green" },
    { id: "chipping-area", label: "Chipping Area" },
    { id: "bunker-practice", label: "Bunker Practice Area" },
    { id: "simulator", label: "Golf Simulator" },
    { id: "course-access", label: "Course Access for Playing" },
  ];

  const durationOptions = [
    { value: "0.5", label: "30 mins" },
    { value: "1", label: "1 hour" },
    { value: "1.5", label: "1.5 hours" },
    { value: "2", label: "2 hours" },
  ];

  return (
    <div className="space-y-8">
      {/* Practice Plan Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Generate Practice Plan</CardTitle>
          <p className="text-gray-600">
            Tell us about your schedule and available resources to get a personalized practice plan.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Availability */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Your Availability</h3>
                  
                  <FormField
                    control={form.control}
                    name="daysPerWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Days per week available</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select days" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[3, 4, 5, 6, 7].map((days) => (
                              <SelectItem key={days} value={days.toString()}>
                                {days} days
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hoursPerSession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hours per session</FormLabel>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                          {durationOptions.map((option) => (
                            <Button
                              key={option.value}
                              type="button"
                              variant={field.value?.toString() === option.value ? "default" : "outline"}
                              onClick={() => field.onChange(parseFloat(option.value))}
                              className="text-sm"
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred time</FormLabel>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="morning" id="morning" className="w-4 h-4" />
                            <label htmlFor="morning" className="text-sm text-gray-700 cursor-pointer">
                              Morning (6AM - 12PM)
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="afternoon" id="afternoon" className="w-4 h-4" />
                            <label htmlFor="afternoon" className="text-sm text-gray-700 cursor-pointer">
                              Afternoon (12PM - 6PM)
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="evening" id="evening" className="w-4 h-4" />
                            <label htmlFor="evening" className="text-sm text-gray-700 cursor-pointer">
                              Evening (6PM - 10PM)
                            </label>
                          </div>
                        </RadioGroup>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Available Resources */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Available Resources</h3>
                  
                  <FormField
                    control={form.control}
                    name="availableResources"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {availableResources.map((resource) => (
                            <div key={resource.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={resource.id}
                                checked={field.value?.includes(resource.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, resource.id]);
                                  } else {
                                    field.onChange(current.filter((id) => id !== resource.id));
                                  }
                                }}
                                className="w-4 h-4 rounded-sm"
                              />
                              <label
                                htmlFor={resource.id}
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                {resource.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="practiceGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Practice Goals</FormLabel>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="handicap-reduction" id="handicap-reduction" className="w-4 h-4" />
                            <label htmlFor="handicap-reduction" className="text-sm text-gray-700 cursor-pointer">
                              Reduce handicap quickly
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="consistency" id="consistency" className="w-4 h-4" />
                            <label htmlFor="consistency" className="text-sm text-gray-700 cursor-pointer">
                              Improve consistency
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="specific-skill" id="specific-skill" className="w-4 h-4" />
                            <label htmlFor="specific-skill" className="text-sm text-gray-700 cursor-pointer">
                              Work on specific weaknesses
                            </label>
                          </div>
                        </RadioGroup>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="bg-primary text-white px-8 py-3 font-medium hover:bg-primary/90"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate My Practice Plan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Generated Practice Plan */}
      {activePlan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Your Personalized Practice Plan</CardTitle>
                <p className="text-gray-600 mt-1">
                  Based on your recent performance and available time
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Target className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekly Overview */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">This Week's Focus</h4>
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <div className="flex items-start">
                  <Target className="text-primary mt-1 mr-3 h-5 w-5" />
                  <div>
                    <h5 className="font-medium text-primary mb-1">
                      Primary Focus: {activePlan.focusAreas?.[0] || "General Improvement"}
                    </h5>
                    <p className="text-sm text-gray-700">
                      {activePlan.aiRecommendations || "Focus on consistent practice to improve your game."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Schedule */}
            {activePlan.weeklySchedule && Array.isArray(activePlan.weeklySchedule) && (
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900">Weekly Schedule</h4>
                
                {activePlan.weeklySchedule.map((day: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-900">
                          {day.day} - {day.title}
                        </h5>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>{day.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-4">
                      {day.activities?.map((activity: any, actIndex: number) => (
                        <div key={actIndex} className="flex items-start">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3 mt-1">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <h6 className="font-medium text-gray-900 mb-1">
                              {activity.name} ({activity.duration})
                            </h6>
                            <p className="text-sm text-gray-600 mb-2">
                              {activity.description}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="mr-1 h-3 w-3" />
                              <span>{activity.location}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Progress Tracking */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Track Your Progress</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">3-6</div>
                  <div className="text-sm text-gray-600">Expected putts saved per round</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">2-3</div>
                  <div className="text-sm text-gray-600">Projected handicap reduction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">4-6</div>
                  <div className="text-sm text-gray-600">Weeks to see improvement</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources Management Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle className="text-xl">Your Practice Resources</CardTitle>
              <p className="text-gray-600 mt-1">
                Manage your available facilities and equipment
              </p>
            </div>
            <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Resource</DialogTitle>
                </DialogHeader>
                <Form {...resourceForm}>
                  <form onSubmit={resourceForm.handleSubmit(onResourceSubmit)} className="space-y-4">
                    <FormField
                      control={resourceForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="facility">Facility</SelectItem>
                              <SelectItem value="equipment">Equipment</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={resourceForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Local Driving Range" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={resourceForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Brief description..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={resourceForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Address or area" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={resourceForm.control}
                        name="cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost</FormLabel>
                            <FormControl>
                              <Input placeholder="$20/hour" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button type="button" variant="outline" onClick={() => setIsResourceDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createResourceMutation.isPending}>
                        {createResourceMutation.isPending ? "Adding..." : "Add Resource"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {resources && resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource: any) => (
                <div key={resource.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-primary/10 mr-3">
                        <Club className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{resource.name}</h4>
                        <Badge variant={resource.type === 'facility' ? 'default' : 'secondary'} className="mt-1">
                          {resource.type}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteResourceMutation.mutate(resource.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {resource.description && (
                    <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                  )}
                  
                  <div className="space-y-2 text-xs text-gray-500">
                    {resource.location && (
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {resource.location}
                      </div>
                    )}
                    {resource.cost && (
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {resource.cost}
                      </div>
                    )}
                    {resource.hours && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {resource.hours}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Club className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No resources yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add your first practice facility or equipment to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
