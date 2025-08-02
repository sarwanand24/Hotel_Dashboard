'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Employee } from '@/lib/types';

const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  designation: z.string().min(1, 'Designation is required'),
  monthlySalary: z.number().min(1, 'Salary must be greater than 0'),
  contactNumber: z.string().min(10, 'Valid contact number required'),
  joiningDate: z.string().min(1, 'Joining date is required'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
  employee?: Employee;
}

export function EmployeeForm({ isOpen, onClose, onSubmit, employee }: EmployeeFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee ? {
      name: employee.name,
      designation: employee.designation,
      monthlySalary: employee.monthlySalary,
      contactNumber: employee.contactNumber,
      joiningDate: employee.joiningDate.toISOString().split('T')[0],
    } : {
      monthlySalary: 20000,
    },
  });

  const handleFormSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true);
    try {
      onSubmit({
        name: data.name,
        designation: data.designation,
        monthlySalary: data.monthlySalary,
        contactNumber: data.contactNumber,
        joiningDate: new Date(data.joiningDate),
        isActive: employee?.isActive ?? true,
      });
      
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting employee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., John Doe"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              {...register('designation')}
              placeholder="e.g., Front Desk Manager"
            />
            {errors.designation && (
              <p className="text-red-500 text-sm">{errors.designation.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlySalary">Monthly Salary (₹)</Label>
              <Input
                id="monthlySalary"
                type="number"
                min="1"
                {...register('monthlySalary', { valueAsNumber: true })}
              />
              {errors.monthlySalary && (
                <p className="text-red-500 text-sm">{errors.monthlySalary.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="joiningDate">Joining Date</Label>
              <Input
                id="joiningDate"
                type="date"
                {...register('joiningDate')}
              />
              {errors.joiningDate && (
                <p className="text-red-500 text-sm">{errors.joiningDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
              id="contactNumber"
              {...register('contactNumber')}
              placeholder="e.g., 9876543210"
            />
            {errors.contactNumber && (
              <p className="text-red-500 text-sm">{errors.contactNumber.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : employee ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}