import { Room, Employee, Booking, Guest, DashboardStats, RevenueData } from './types';

// Mock database using localStorage
class MockDB {
  private getFromStorage<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Rooms
  getRooms(): Room[] {
    return this.getFromStorage<Room>('hotel_rooms').map(room => ({
      ...room,
      createdAt: new Date(room.createdAt),
      updatedAt: new Date(room.updatedAt)
    }));
  }

  addRoom(room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Room {
    const rooms = this.getRooms();
    const newRoom: Room = {
      ...room,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    rooms.push(newRoom);
    this.saveToStorage('hotel_rooms', rooms);
    return newRoom;
  }

  updateRoom(id: string, updates: Partial<Room>): Room | null {
    const rooms = this.getRooms();
    const index = rooms.findIndex(room => room.id === id);
    if (index === -1) return null;
    
    rooms[index] = { ...rooms[index], ...updates, updatedAt: new Date() };
    this.saveToStorage('hotel_rooms', rooms);
    return rooms[index];
  }

  deleteRoom(id: string): boolean {
    const rooms = this.getRooms();
    const filteredRooms = rooms.filter(room => room.id !== id);
    this.saveToStorage('hotel_rooms', filteredRooms);
    return filteredRooms.length !== rooms.length;
  }

  // Employees
  getEmployees(): Employee[] {
    return this.getFromStorage<Employee>('hotel_employees').map(emp => ({
      ...emp,
      joiningDate: new Date(emp.joiningDate),
      createdAt: new Date(emp.createdAt),
      updatedAt: new Date(emp.updatedAt)
    }));
  }

  addEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Employee {
    const employees = this.getEmployees();
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    employees.push(newEmployee);
    this.saveToStorage('hotel_employees', employees);
    return newEmployee;
  }

  updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const employees = this.getEmployees();
    const index = employees.findIndex(emp => emp.id === id);
    if (index === -1) return null;
    
    employees[index] = { ...employees[index], ...updates, updatedAt: new Date() };
    this.saveToStorage('hotel_employees', employees);
    return employees[index];
  }

  deleteEmployee(id: string): boolean {
    const employees = this.getEmployees();
    const filteredEmployees = employees.filter(emp => emp.id !== id);
    this.saveToStorage('hotel_employees', filteredEmployees);
    return filteredEmployees.length !== employees.length;
  }

  // Guests
  getGuests(): Guest[] {
    return this.getFromStorage<Guest>('hotel_guests').map(guest => ({
      ...guest,
      createdAt: new Date(guest.createdAt)
    }));
  }

  addGuest(guest: Omit<Guest, 'id' | 'createdAt'>): Guest {
    const guests = this.getGuests();
    const newGuest: Guest = {
      ...guest,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    guests.push(newGuest);
    this.saveToStorage('hotel_guests', guests);
    return newGuest;
  }

  // Bookings
  getBookings(): Booking[] {
    const bookings = this.getFromStorage<Booking>('hotel_bookings');
    const rooms = this.getRooms();
    const guests = this.getGuests();
    
    return bookings.map(booking => ({
      ...booking,
      checkInDate: new Date(booking.checkInDate),
      checkOutDate: new Date(booking.checkOutDate),
      createdAt: new Date(booking.createdAt),
      updatedAt: new Date(booking.updatedAt),
      guest: guests.find(g => g.id === booking.guestId) || booking.guest,
      rooms: booking.roomIds.map(roomId => rooms.find(r => r.id === roomId)).filter(Boolean) as Room[]
    }));
  }

  addBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Booking {
    const bookings = this.getBookings();
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    bookings.push(newBooking);
    this.saveToStorage('hotel_bookings', bookings);
    return newBooking;
  }

  updateBooking(id: string, updates: Partial<Booking>): Booking | null {
    const bookings = this.getBookings();
    const index = bookings.findIndex(booking => booking.id === id);
    if (index === -1) return null;
    
    bookings[index] = { ...bookings[index], ...updates, updatedAt: new Date() };
    this.saveToStorage('hotel_bookings', bookings);
    return bookings[index];
  }

  deleteBooking(id: string): boolean {
    const bookings = this.getBookings();
    const filteredBookings = bookings.filter(booking => booking.id !== id);
    this.saveToStorage('hotel_bookings', filteredBookings);
    return filteredBookings.length !== bookings.length;
  }

  // Analytics
  getDashboardStats(): DashboardStats {
    const rooms = this.getRooms();
    const employees = this.getEmployees();
    const bookings = this.getBookings();
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });
    
    const activeBookings = bookings.filter(booking => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      return checkIn <= currentDate && checkOut >= currentDate;
    });
    
    const totalRevenue = bookings.filter(b => b.isPaid).reduce((sum, booking) => sum + booking.totalAmount, 0);
    const monthlyRevenue = monthlyBookings.filter(b => b.isPaid).reduce((sum, booking) => sum + booking.totalAmount, 0);
    const monthlyExpenses = employees.filter(emp => emp.isActive).reduce((sum, emp) => sum + emp.monthlySalary, 0);
    
    const occupiedRooms = activeBookings.reduce((count, booking) => count + booking.roomIds.length, 0);
    const occupancyRate = rooms.length > 0 ? (occupiedRooms / rooms.length) * 100 : 0;
    
    return {
      totalRevenue,
      monthlyRevenue,
      totalBookings: bookings.length,
      activeBookings: activeBookings.length,
      occupancyRate,
      totalRooms: rooms.length,
      availableRooms: rooms.length - occupiedRooms,
      totalEmployees: employees.filter(emp => emp.isActive).length,
      monthlyExpenses
    };
  }

  getRevenueData(): RevenueData[] {
    const bookings = this.getBookings();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data: { [key: string]: { revenue: number; bookings: number } } = {};
    
    bookings.forEach(booking => {
      const date = new Date(booking.createdAt);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!data[monthKey]) {
        data[monthKey] = { revenue: 0, bookings: 0 };
      }
      
      if (booking.isPaid) {
        data[monthKey].revenue += booking.totalAmount;
      }
      data[monthKey].bookings += 1;
    });
    
    return Object.keys(data).map(month => ({
      month,
      revenue: data[month].revenue,
      bookings: data[month].bookings
    })).slice(-6); // Last 6 months
  }

  // Initialize with sample data
  initializeSampleData(): void {
    if (typeof window === 'undefined') return;
    
    // Check if data already exists
    if (localStorage.getItem('hotel_rooms')) return;
    
    // Sample rooms
    const sampleRooms: Room[] = [
      {
        id: '1',
        roomNumber: '101',
        type: 'single',
        hasAC: true,
        beds: 1,
        pricePerDay: 2000,
        isAvailable: true,
        amenities: ['WiFi', 'TV', 'Mini Fridge'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        roomNumber: '102',
        type: 'double',
        hasAC: true,
        beds: 2,
        pricePerDay: 3500,
        isAvailable: true,
        amenities: ['WiFi', 'TV', 'Mini Fridge', 'Balcony'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        roomNumber: '201',
        type: 'suite',
        hasAC: true,
        beds: 2,
        pricePerDay: 6000,
        isAvailable: true,
        amenities: ['WiFi', 'TV', 'Mini Fridge', 'Balcony', 'Kitchenette'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Sample employees
    const sampleEmployees: Employee[] = [
      {
        id: '1',
        name: 'Rajesh Kumar',
        designation: 'Front Desk Manager',
        monthlySalary: 35000,
        joiningDate: new Date('2023-01-15'),
        contactNumber: '9876543210',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Priya Sharma',
        designation: 'Housekeeping Supervisor',
        monthlySalary: 28000,
        joiningDate: new Date('2023-03-01'),
        contactNumber: '9876543211',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    this.saveToStorage('hotel_rooms', sampleRooms);
    this.saveToStorage('hotel_employees', sampleEmployees);
    this.saveToStorage('hotel_guests', []);
    this.saveToStorage('hotel_bookings', []);
  }
}

export const db = new MockDB();