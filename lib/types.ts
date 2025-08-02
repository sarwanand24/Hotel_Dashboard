export interface Room {
  id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  hasAC: boolean;
  beds: number;
  pricePerDay: number;
  isAvailable: boolean;
  amenities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  name: string;
  designation: string;
  monthlySalary: number;
  joiningDate: Date;
  contactNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Guest {
  id: string;
  fullName: string;
  mobileNumber: string;
  aadharCardUrl?: string;
  createdAt: Date;
}

export interface Booking {
  id: string;
  guestId: string;
  guest: Guest;
  roomIds: string[];
  rooms: Room[];
  checkInDate: Date;
  checkOutDate: Date;
  totalAmount: number;
  isPaid: boolean;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  activeBookings: number;
  occupancyRate: number;
  totalRooms: number;
  availableRooms: number;
  totalEmployees: number;
  monthlyExpenses: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
}