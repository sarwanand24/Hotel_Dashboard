'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Room } from '@/lib/types';

const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  type: z.enum(['single', 'double', 'suite', 'deluxe']),
  hasAC: z.boolean(),
  beds: z.number().min(1, 'At least 1 bed required'),
  pricePerDay: z.number().min(1, 'Price must be greater than 0'),
  amenities: z.string(),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface RoomFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) => void;
  room?: Room;
}

export function RoomForm({ isOpen, onClose, onSubmit, room }: RoomFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: room ? {
      roomNumber: room.roomNumber,
      type: room.type,
      hasAC: room.hasAC,
      beds: room.beds,
      pricePerDay: room.pricePerDay,
      amenities: room.amenities.join(', '),
    } : {
      type: 'single',
      hasAC: true,
      beds: 1,
      pricePerDay: 2000,
      amenities: '',
    },
  });

  const handleFormSubmit = async (data: RoomFormData) => {
    setIsLoading(true);
    try {
      const amenitiesArray = data.amenities
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      onSubmit({
        roomNumber: data.roomNumber,
        type: data.type,
        hasAC: data.hasAC,
        beds: data.beds,
        pricePerDay: data.pricePerDay,
        amenities: amenitiesArray,
        isAvailable: room?.isAvailable ?? true,
      });
      
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{room ? 'Edit Room' : 'Add New Room'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input
              id="roomNumber"
              {...register('roomNumber')}
              placeholder="e.g., 101"
            />
            {errors.roomNumber && (
              <p className="text-red-500 text-sm">{errors.roomNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Room Type</Label>
            <Select 
              value={watch('type')} 
              onValueChange={(value: any) => setValue('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="double">Double</SelectItem>
                <SelectItem value="suite">Suite</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="beds">Number of Beds</Label>
              <Input
                id="beds"
                type="number"
                min="1"
                {...register('beds', { valueAsNumber: true })}
              />
              {errors.beds && (
                <p className="text-red-500 text-sm">{errors.beds.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerDay">Price per Day (₹)</Label>
              <Input
                id="pricePerDay"
                type="number"
                min="1"
                {...register('pricePerDay', { valueAsNumber: true })}
              />
              {errors.pricePerDay && (
                <p className="text-red-500 text-sm">{errors.pricePerDay.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasAC"
              checked={watch('hasAC')}
              onCheckedChange={(checked) => setValue('hasAC', !!checked)}
            />
            <Label htmlFor="hasAC">Air Conditioning</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amenities">Amenities (comma-separated)</Label>
            <Textarea
              id="amenities"
              {...register('amenities')}
              placeholder="e.g., WiFi, TV, Mini Fridge, Balcony"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : room ? 'Update Room' : 'Add Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}