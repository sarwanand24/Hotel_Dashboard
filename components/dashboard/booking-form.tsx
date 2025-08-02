'use client';

import { useState, useEffect } from 'react';
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
import { db } from '@/lib/db';
import { calculateTotalAmount } from '@/lib/utils';
import { Booking, Room, Guest } from '@/lib/types';

const bookingSchema = z.object({
  guestName: z.string().min(1, 'Guest name is required'),
  mobileNumber: z.string().min(10, 'Valid mobile number required'),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
  roomIds: z.array(z.string()).min(1, 'At least one room must be selected'),
  notes: z.string().optional(),
}).refine(data => new Date(data.checkOutDate) > new Date(data.checkInDate), {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => void;
  booking?: Booking;
}

export function BookingForm({ isOpen, onClose, onSubmit, booking }: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: booking ? {
      guestName: booking.guest.fullName,
      mobileNumber: booking.guest.mobileNumber,
      checkInDate: booking.checkInDate.toISOString().split('T')[0],
      checkOutDate: booking.checkOutDate.toISOString().split('T')[0],
      roomIds: booking.roomIds,
      notes: booking.notes || '',
    } : {
      roomIds: [],
    },
  });

  const checkInDate = watch('checkInDate');
  const checkOutDate = watch('checkOutDate');

  useEffect(() => {
    setRooms(db.getRooms().filter(room => room.isAvailable));
    if (booking) {
      setSelectedRooms(booking.roomIds);
    }
  }, [booking]);

  useEffect(() => {
    if (selectedRooms.length > 0 && checkInDate && checkOutDate) {
      const selectedRoomObjects = rooms.filter(room => selectedRooms.includes(room.id));
      const amount = calculateTotalAmount(
        selectedRoomObjects,
        new Date(checkInDate),
        new Date(checkOutDate)
      );
      setTotalAmount(amount);
    } else {
      setTotalAmount(0);
    }
  }, [selectedRooms, checkInDate, checkOutDate, rooms]);

  const handleRoomToggle = (roomId: string, checked: boolean) => {
    let updatedRooms: string[];
    if (checked) {
      updatedRooms = [...selectedRooms, roomId];
    } else {
      updatedRooms = selectedRooms.filter(id => id !== roomId);
    }
    setSelectedRooms(updatedRooms);
    setValue('roomIds', updatedRooms);
  };

  const handleFormSubmit = async (data: BookingFormData) => {
    setIsLoading(true);
    try {
      // Find or create guest
      const guests = db.getGuests();
      let guest = guests.find(g => g.mobileNumber === data.mobileNumber);
      
      if (!guest) {
        guest = db.addGuest({
          fullName: data.guestName,
          mobileNumber: data.mobileNumber,
        });
      }

      const selectedRoomObjects = rooms.filter(room => data.roomIds.includes(room.id));
      
      onSubmit({
        guestId: guest.id,
        guest,
        roomIds: data.roomIds,
        rooms: selectedRoomObjects,
        checkInDate: new Date(data.checkInDate),
        checkOutDate: new Date(data.checkOutDate),
        totalAmount,
        isPaid: false,
        paymentStatus: 'unpaid',
        notes: data.notes,
      });
      
      reset();
      setSelectedRooms([]);
      onClose();
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{booking ? 'Edit Booking' : 'Create New Booking'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">Guest Name</Label>
              <Input
                id="guestName"
                {...register('guestName')}
                placeholder="Full name"
              />
              {errors.guestName && (
                <p className="text-red-500 text-sm">{errors.guestName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                {...register('mobileNumber')}
                placeholder="10-digit number"
              />
              {errors.mobileNumber && (
                <p className="text-red-500 text-sm">{errors.mobileNumber.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkInDate">Check-in Date</Label>
              <Input
                id="checkInDate"
                type="date"
                {...register('checkInDate')}
              />
              {errors.checkInDate && (
                <p className="text-red-500 text-sm">{errors.checkInDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOutDate">Check-out Date</Label>
              <Input
                id="checkOutDate"
                type="date"
                {...register('checkOutDate')}
              />
              {errors.checkOutDate && (
                <p className="text-red-500 text-sm">{errors.checkOutDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Rooms</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={room.id}
                    checked={selectedRooms.includes(room.id)}
                    onCheckedChange={(checked) => handleRoomToggle(room.id, !!checked)}
                  />
                  <Label htmlFor={room.id} className="flex-1 cursor-pointer">
                    Room {room.roomNumber} ({room.type}) - ₹{room.pricePerDay}/day
                  </Label>
                </div>
              ))}
            </div>
            {errors.roomIds && (
              <p className="text-red-500 text-sm">{errors.roomIds.message}</p>
            )}
          </div>

          {totalAmount > 0 && (
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-sm text-blue-800">
                Total Amount: <span className="font-bold">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Any special requests or notes..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : booking ? 'Update Booking' : 'Create Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}