import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Club, MapPin, Clock, DollarSign } from "lucide-react";

const resourceSchema = z.object({
  type: z.enum(["facility", "equipment"]),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  hours: z.string().optional(),
  cost: z.string().optional(),
  available: z.boolean().default(true),
});

type ResourceForm = z.infer<typeof resourceSchema>;

export default function Resources() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resources, isLoading } = useQuery({
    queryKey: ["/api/resources"],
  });

  const form = useForm<ResourceForm>({
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

  const createResourceMutation = useMutation({
    mutationFn: (data: ResourceForm) => apiRequest('POST', '/api/resources', data),
    onSuccess: () => {
      toast({
        title: "Resource Added",
        description: "Your resource has been added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Resource",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateResourceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ResourceForm> }) =>
      apiRequest('PATCH', `/api/resources/${id}`, data),
    onSuccess: () => {
      toast({
        title: "Resource Updated",
        description: "Your resource has been updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setEditingResource(null);
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Resource",
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

  const onSubmit = (data: ResourceForm) => {
    if (editingResource) {
      updateResourceMutation.mutate({ id: editingResource.id, data });
    } else {
      createResourceMutation.mutate(data);
    }
  };

  const openEditDialog = (resource: any) => {
    setEditingResource(resource);
    form.reset({
      type: resource.type,
      name: resource.name,
      description: resource.description || "",
      location: resource.location || "",
      hours: resource.hours || "",
      cost: resource.cost || "",
      available: resource.available,
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingResource(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const facilities = resources?.filter((r: any) => r.type === "facility") || [];
  const equipment = resources?.filter((r: any) => r.type === "equipment") || [];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Practice Resources</CardTitle>
          <p className="text-gray-600">
            Manage your available practice facilities and equipment to optimize your training.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Facilities */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Practice Facilities</h3>
                <Button onClick={openAddDialog} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Facility
                </Button>
              </div>
              <div className="space-y-4">
                {facilities.map((facility: any) => (
                  <div key={facility.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                          <Club className="text-primary h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{facility.name}</h4>
                          <p className="text-sm text-gray-600">{facility.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={facility.available ? "default" : "secondary"}>
                          {facility.available ? "Available" : "Unavailable"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(facility)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteResourceMutation.mutate(facility.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {(facility.hours || facility.location || facility.cost) && (
                      <div className="mt-3 text-sm text-gray-600 space-y-1">
                        {facility.hours && (
                          <p className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <strong>Hours:</strong> {facility.hours}
                          </p>
                        )}
                        {facility.location && (
                          <p className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <strong>Location:</strong> {facility.location}
                          </p>
                        )}
                        {facility.cost && (
                          <p className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <strong>Cost:</strong> {facility.cost}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {facilities.length === 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg py-8 px-4 text-center">
                    <Club className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No facilities added yet</p>
                    <Button onClick={openAddDialog} className="mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Your First Facility
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Equipment Inventory */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Equipment</h3>
                <Button onClick={openAddDialog} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Equipment
                </Button>
              </div>
              <div className="space-y-4">
                {equipment.map((item: any) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                          <Club className="text-accent h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={item.available ? "default" : "secondary"}>
                          {item.available ? "Available" : "Unavailable"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteResourceMutation.mutate(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {equipment.length === 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg py-8 px-4 text-center">
                    <Club className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No equipment added yet</p>
                    <Button onClick={openAddDialog} className="mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Your First Equipment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingResource ? "Edit Resource" : "Add New Resource"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 6AM - 10PM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $15/bucket" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createResourceMutation.isPending || updateResourceMutation.isPending}>
                  {editingResource ? "Update" : "Add"} Resource
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
