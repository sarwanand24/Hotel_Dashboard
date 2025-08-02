'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RoomForm } from '@/components/dashboard/room-form';
import { Plus, Edit, Trash2, Hotel, Snowflake, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import type { Room } from '@/lib/types';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = () => {
    setRooms(db.getRooms());
  };

  const handleAddRoom = (roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) => {
    db.addRoom(roomData);
    loadRooms();
    setIsFormOpen(false);
  };

  const handleEditRoom = (roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingRoom) {
      db.updateRoom(editingRoom.id, roomData);
      loadRooms();
      setEditingRoom(undefined);
      setIsFormOpen(false);
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      db.deleteRoom(roomId);
      loadRooms();
    }
  };

  const openEditForm = (room: Room) => {
    setEditingRoom(room);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRoom(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-2">Manage your hotel rooms and pricing</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Room
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{rooms.length}</div>
            <div className="text-gray-600 text-sm">Total Rooms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {rooms.filter(room => room.isAvailable).length}
            </div>
            <div className="text-gray-600 text-sm">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {rooms.filter(room => room.hasAC).length}
            </div>
            <div className="text-gray-600 text-sm">AC Rooms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {formatCurrency(
                rooms.reduce((sum, room) => sum + room.pricePerDay, 0) / rooms.length || 0
              )}
            </div>
            <div className="text-gray-600 text-sm">Avg. Price</div>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditForm(room)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteRoom(room.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={room.isAvailable ? "default" : "secondary"}>
                  {room.isAvailable ? 'Available' : 'Occupied'}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {room.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price per day:</span>
                <span className="font-semibold">{formatCurrency(room.pricePerDay)}</span>
              </div>
              
              <div className="flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {room.beds} bed{room.beds > 1 ? 's' : ''}
                </div>
                {room.hasAC && (
                  <div className="flex items-center gap-1">
                    <Snowflake className="h-4 w-4" />
                    AC
                  </div>
                )}
              </div>

              {room.amenities.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Amenities:</div>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {rooms.length === 0 && (
        <Card className="p-12 text-center">
          <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first room.</p>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Room
          </Button>
        </Card>
      )}

      {/* Room Form Modal */}
      <RoomForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingRoom ? handleEditRoom : handleAddRoom}
        room={editingRoom}
      />
    </div>
  );
}