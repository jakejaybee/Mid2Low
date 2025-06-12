import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const roundSchema = z.object({
  date: z.string().min(1, "Date is required"),
  courseName: z.string().min(1, "Course name is required"),
  totalScore: z.coerce.number().min(50).max(150),
  courseRating: z.coerce.number().optional(),
  slopeRating: z.coerce.number().optional(),
  fairwaysHit: z.coerce.number().optional(),
  greensInRegulation: z.coerce.number().optional(),
  totalPutts: z.coerce.number().optional(),
  penalties: z.coerce.number().optional(),
});

type RoundForm = z.infer<typeof roundSchema>;

export default function SubmitRound() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RoundForm>({
    resolver: zodResolver(roundSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      courseName: "",
      totalScore: 0,
    },
  });

  const submitRoundMutation = useMutation({
    mutationFn: (data: RoundForm) => apiRequest('POST', '/api/rounds', data),
    onSuccess: () => {
      toast({
        title: "Round Submitted",
        description: "Your round has been submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rounds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/performance"] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RoundForm) => {
    submitRoundMutation.mutate(data);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Submit Round Data</CardTitle>
          <p className="text-gray-600">
            Enter your round details manually or sync automatically with GHIN API integration.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Round Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Round Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="courseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter course name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Score Entry */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Round Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="totalScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Score</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="84" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="courseRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Rating</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="72.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slopeRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slope Rating</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="131" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Advanced Stats */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Additional Stats (Optional)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="fairwaysHit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fairways Hit</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="8" {...field} />
                        </FormControl>
                        <span className="text-xs text-gray-500">out of 14</span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="greensInRegulation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Greens in Regulation</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="9" {...field} />
                        </FormControl>
                        <span className="text-xs text-gray-500">out of 18</span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalPutts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Putts</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="32" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="penalties"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Penalties</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitRoundMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {submitRoundMutation.isPending ? "Submitting..." : "Submit Round"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
