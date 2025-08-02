'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download, Eye } from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generateBillPDF } from '@/lib/pdf-utils';
import type { Booking } from '@/lib/types';

export default function HistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    setBookings(db.getBookings().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        booking.guest.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guest.mobileNumber.includes(searchTerm) ||
        booking.rooms.some(room => room.roomNumber.includes(searchTerm));

      // Payment status filter
      const matchesPayment = paymentFilter === 'all' || 
        (paymentFilter === 'paid' && booking.isPaid) ||
        (paymentFilter === 'unpaid' && !booking.isPaid);

      // Date range filter
      const bookingDate = new Date(booking.createdAt);
      const matchesDateRange = (!dateFrom || bookingDate >= new Date(dateFrom)) &&
        (!dateTo || bookingDate <= new Date(dateTo + 'T23:59:59'));

      return matchesSearch && matchesPayment && matchesDateRange;
    });
  }, [bookings, searchTerm, paymentFilter, dateFrom, dateTo]);

  const handleDownloadBill = (booking: Booking) => {
    generateBillPDF(booking);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPaymentFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const totalRevenue = filteredBookings.filter(b => b.isPaid).reduce((sum, b) => sum + b.totalAmount, 0);
  const totalBookings = filteredBookings.length;
  const paidBookings = filteredBookings.filter(b => b.isPaid).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
        <p className="text-gray-600 mt-2">View and manage all past and current bookings</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Name, mobile, room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment">Payment Status</Label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalBookings}</div>
            <div className="text-gray-600 text-sm">Total Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{paidBookings}</div>
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

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Booking History ({filteredBookings.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{booking.guest.fullName}</h3>
                      <Badge variant={booking.isPaid ? "default" : "secondary"}>
                        {booking.isPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                      <div>
                        <strong>Mobile:</strong> {booking.guest.mobileNumber}
                      </div>
                      <div>
                        <strong>Stay:</strong> {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                      </div>
                      <div>
                        <strong>Rooms:</strong> {booking.rooms.map(r => r.roomNumber).join(', ')}
                      </div>
                      <div>
                        <strong>Amount:</strong> {formatCurrency(booking.totalAmount)}
                      </div>
                    </div>
                    
                    {booking.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Notes:</strong> {booking.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadBill(booking)}
                      title="Download Bill"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}