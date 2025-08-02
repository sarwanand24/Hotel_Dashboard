import jsPDF from 'jspdf';
import { Booking } from './types';
import { formatCurrency, formatDate, calculateDays } from './utils';

export function generateBillPDF(booking: Booking): void {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Hotel Bill', 20, 20);
  
  doc.setFontSize(12);
  doc.text('Hotel Management System', 20, 30);
  doc.text('Invoice #: ' + booking.id, 20, 40);
  doc.text('Date: ' + formatDate(new Date()), 20, 50);
  
  // Guest Details
  doc.setFontSize(14);
  doc.text('Guest Details:', 20, 70);
  doc.setFontSize(12);
  doc.text('Name: ' + booking.guest.fullName, 20, 80);
  doc.text('Mobile: ' + booking.guest.mobileNumber, 20, 90);
  doc.text('Check-in: ' + formatDate(booking.checkInDate), 20, 100);
  doc.text('Check-out: ' + formatDate(booking.checkOutDate), 20, 110);
  
  // Room Details
  doc.setFontSize(14);
  doc.text('Room Details:', 20, 130);
  doc.setFontSize(12);
  
  let yPos = 140;
  const days = calculateDays(booking.checkInDate, booking.checkOutDate);
  
  booking.rooms.forEach((room, index) => {
    doc.text(`Room ${room.roomNumber} (${room.type})`, 20, yPos);
    doc.text(`₹${room.pricePerDay}/day × ${days} days`, 100, yPos);
    doc.text(`₹${(room.pricePerDay * days).toLocaleString()}`, 160, yPos);
    yPos += 10;
  });
  
  // Total
  doc.setFontSize(14);
  doc.text('Total Amount: ' + formatCurrency(booking.totalAmount), 20, yPos + 20);
  doc.text('Payment Status: ' + (booking.isPaid ? 'Paid' : 'Unpaid'), 20, yPos + 30);
  
  // Footer
  doc.setFontSize(10);
  doc.text('Thank you for choosing our hotel!', 20, 250);
  doc.text('For any queries, please contact the front desk.', 20, 260);
  
  // Save the PDF
  doc.save(`hotel-bill-${booking.id}.pdf`);
}