'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookingForm } from '@/components/dashboard/booking-form';
import { generateBillPDF } from '@/lib/pdf-utils';
import { Plus, Edit, Trash2, Calendar, Download, CheckCircle, XCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Booking } from '@/lib/types';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | undefined>();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    setBookings(db.getBookings().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const handleAddBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    db.addBooking(bookingData);
    loadBookings();
    setIsFormOpen(false);
  };

  const handleEditBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingBooking) {
      db.updateBooking(editingBooking.id, bookingData);
      loadBookings();
      setEditingBooking(undefined);
      setIsFormOpen(false);
    }
  };

  const handleDeleteBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      db.deleteBooking(bookingId);
      loadBookings();
    }
  };

  const togglePaymentStatus = (booking: Booking) => {
    db.updateBooking(booking.id, { 
      isPaid: !booking.isPaid,
      paymentStatus: !booking.isPaid ? 'paid' : 'unpaid'
    });
    loadBookings();
  };

  const openEditForm = (booking: Booking) => {
    setEditingBooking(booking);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingBooking(undefined);
  };

  const handleDownloadBill = (booking: Booking) => {
    generateBillPDF(booking);
  };

  const activeBookings = bookings.filter(booking => {
    const now = new Date();
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    return checkIn <= now && checkOut >= now;
  });

  const totalRevenue = bookings.filter(b => b.isPaid).reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-2">Manage guest bookings and billing</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Booking
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{bookings.length}</div>
            <div className="text-gray-600 text-sm">Total Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{activeBookings.length}</div>
            <div className="text-gray-600 text-sm">Active Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.isPaid).length}
            </div>
            <div className="text-gray-600 text-sm">Paid Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="text-gray-600 text-sm">Total Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{booking.guest.fullName}</h3>
                    <Badge variant={booking.isPaid ? "default" : "secondary"}>
                      {booking.isPaid ? 'Paid' : 'Unpaid'}
                    </Badge>
                    {activeBookings.some(ab => ab.id === booking.id) && (
                      <Badge variant="outline" className="text-green-700 border-green-700">
                        Active
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Mobile:</strong> {booking.guest.mobileNumber}
                    </div>
                    <div>
                      <strong>Check-in:</strong> {formatDate(booking.checkInDate)}
                    </div>
                    <div>
                      <strong>Check-out:</strong> {formatDate(booking.checkOutDate)}
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <strong className="text-sm text-gray-600">Rooms:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {booking.rooms.map((room) => (
                        <Badge key={room.id} variant="outline">
                          {room.roomNumber} ({room.type})
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-3 text-lg font-semibold">
                    Total: {formatCurrency(booking.totalAmount)}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => togglePaymentStatus(booking)}
                    className={booking.isPaid ? "text-red-600" : "text-green-600"}
                  >
                    {booking.isPaid ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadBill(booking)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditForm(booking)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bookings.length === 0 && (
        <Card className="p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-4">Create your first booking to get started.</p>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Booking
          </Button>
        </Card>
      )}

      {/* Booking Form Modal */}
      <BookingForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingBooking ? handleEditBooking : handleAddBooking}
        booking={editingBooking}
      />
    </div>
  );
}