'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/stats-card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  IndianRupee, 
  Hotel, 
  Users, 
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats, RevenueData } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

  useEffect(() => {
    // Initialize sample data if needed
    db.initializeSampleData();
    
    // Load stats
    setStats(db.getDashboardStats());
    setRevenueData(db.getRevenueData());
  }, []);

  if (!stats) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const roomTypeData = [
    { name: 'Single', value: 40, color: '#3B82F6' },
    { name: 'Double', value: 35, color: '#10B981' },
    { name: 'Suite', value: 20, color: '#F59E0B' },
    { name: 'Deluxe', value: 5, color: '#EF4444' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome to your hotel management dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={IndianRupee}
          description="All time revenue"
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={TrendingUp}
          description="Current month"
        />
        <StatsCard
          title="Active Bookings"
          value={stats.activeBookings}
          icon={Calendar}
          description={`${stats.totalBookings} total bookings`}
        />
        <StatsCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate.toFixed(1)}%`}
          icon={Activity}
          description={`${stats.availableRooms} rooms available`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Room Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Room Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roomTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Rooms"
          value={stats.totalRooms}
          icon={Hotel}
          description="All room inventory"
        />
        <StatsCard
          title="Active Employees"
          value={stats.totalEmployees}
          icon={Users}
          description="Current staff count"
        />
        <StatsCard
          title="Monthly Expenses"
          value={formatCurrency(stats.monthlyExpenses)}
          icon={IndianRupee}
          description="Salary payments"
        />
        <StatsCard
          title="Net Profit"
          value={formatCurrency(stats.monthlyRevenue - stats.monthlyExpenses)}
          icon={TrendingUp}
          description="This month"
        />
      </div>

      {/* Monthly Bookings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}