import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateVendor, type BtlChannel } from '@/hooks/useVendors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const vendorSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  contact_person: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().optional(),
  gst_number: z.string().optional(),
  service_areas: z.array(z.string()).min(1, 'At least one service area is required'),
  specializations: z.array(z.enum(['metro_branding', 'mall_activation', 'pamphlet_distribution', 'street_branding', 'transit_advertising', 'experiential_marketing'])).min(1, 'At least one specialization is required'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

type VendorForm = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  onSuccess?: () => void;
}

const BTL_CHANNELS: { value: BtlChannel; label: string }[] = [
  { value: 'metro_branding', label: 'Metro Branding' },
  { value: 'mall_activation', label: 'Mall Activation' },
  { value: 'pamphlet_distribution', label: 'Pamphlet Distribution' },
  { value: 'street_branding', label: 'Street Branding' },
  { value: 'transit_advertising', label: 'Transit Advertising' },
  { value: 'experiential_marketing', label: 'Experiential Marketing' },
];

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 
  'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur'
];

export const VendorForm: React.FC<VendorFormProps> = ({ onSuccess }) => {
  const createVendorMutation = useCreateVendor();

  const form = useForm<VendorForm>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      gst_number: '',
      service_areas: [],
      specializations: [],
      status: 'active',
    },
  });

  const onSubmit = async (data: VendorForm) => {
    try {
      await createVendorMutation.mutateAsync({
        ...data,
        created_by: '', // This will be set by the backend based on auth.uid()
      });
      onSuccess?.();
    } catch (error) {
      console.error('Error creating vendor:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_person"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact person name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter full address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gst_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GST Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter GST number (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="service_areas"
          render={() => (
            <FormItem>
              <FormLabel>Service Areas</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                {CITIES.map((city) => (
                  <FormField
                    key={city}
                    control={form.control}
                    name="service_areas"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(city)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, city])
                                : field.onChange(field.value?.filter((value) => value !== city));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {city}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specializations"
          render={() => (
            <FormItem>
              <FormLabel>Specializations</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {BTL_CHANNELS.map((channel) => (
                  <FormField
                    key={channel.value}
                    control={form.control}
                    name="specializations"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(channel.value)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, channel.value])
                                : field.onChange(field.value?.filter((value) => value !== channel.value));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {channel.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={createVendorMutation.isPending}>
            {createVendorMutation.isPending ? 'Creating...' : 'Create Vendor'}
          </Button>
        </div>
      </form>
    </Form>
  );
};