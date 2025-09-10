'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { simulateDrum, simulateLoad } from '@/lib/api';

interface SimulationCardProps {
  title: string;
  description: string;
  defaultValue: number;
  roles: string[];
  simulationType: 'drum' | 'load';
}

const formSchema = z.object({
  value: z.coerce.number(),
  src_role: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SimulationCard({
  title,
  description,
  defaultValue,
  roles,
  simulationType,
}: SimulationCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: defaultValue,
      src_role: roles[0],
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const simulationFn = simulationType === 'drum' ? simulateDrum : simulateLoad;
      // @ts-ignore
      await simulationFn(values);
      toast({
        title: 'Simulation Sent',
        description: `Successfully triggered ${title} write with value ${values.value}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Simulation Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="src_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Trigger Write
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
