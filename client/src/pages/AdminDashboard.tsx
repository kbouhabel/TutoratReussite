import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useToast } from '../hooks/use-toast';
import { Calendar, Users, Clock, Settings } from 'lucide-react';
import type { Booking, User, TimeSlot } from '@shared/schema';

interface BookingWithUser extends Booking {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingWithUser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New time slot form
  const [newTimeSlot, setNewTimeSlot] = useState({
    dateTime: '',
    duration: '1h' as const,
  });

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const [bookingsRes, usersRes] = await Promise.all([
        fetch('/api/admin/bookings', { headers }),
        fetch('/api/admin/users', { headers }),
      ]);

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.map((item: any) => ({
          ...item.booking,
          user: item.user,
        })));
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

    } catch (error) {
      console.error('Error loading admin data:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const createTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/time-slots', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateTime: new Date(newTimeSlot.dateTime).toISOString(),
          duration: newTimeSlot.duration,
        }),
      });

      if (response.ok) {
        toast({
          title: "Créneau créé",
          description: "Le nouveau créneau horaire a été ajouté avec succès.",
        });
        setNewTimeSlot({ dateTime: '', duration: '1h' });
      } else {
        throw new Error('Erreur lors de la création du créneau');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le créneau horaire.",
        variant: "destructive",
      });
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string, notes?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      if (response.ok) {
        await loadAdminData();
        toast({
          title: "Réservation mise à jour",
          description: "Le statut de la réservation a été modifié.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la réservation.",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, role: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, isActive }),
      });

      if (response.ok) {
        await loadAdminData();
        toast({
          title: "Utilisateur mis à jour",
          description: "Les informations de l'utilisateur ont été modifiées.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>
            Vous n'avez pas les autorisations pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-8">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Réservations
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="timeslots" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Créneaux
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des réservations</CardTitle>
              <CardDescription>
                Visualisez et gérez toutes les réservations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Date/Heure</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Lieu</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {booking.firstName} {booking.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.email}
                            </div>
                            {booking.user && (
                              <Badge variant="secondary" className="text-xs">
                                Compte: {booking.user.firstName} {booking.user.lastName}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(booking.dateTime).toLocaleString('fr-CA')}
                        </TableCell>
                        <TableCell>{booking.gradeLevel}</TableCell>
                        <TableCell>{booking.duration}</TableCell>
                        <TableCell>
                          {booking.location === 'teacher' ? 'Chez le prof' : 'À domicile'}
                        </TableCell>
                        <TableCell>{booking.price}$</TableCell>
                        <TableCell>
                          <Select
                            value={booking.status}
                            onValueChange={(value) => updateBookingStatus(booking.id, value, booking.notes)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="confirmed">Confirmé</SelectItem>
                              <SelectItem value="completed">Terminé</SelectItem>
                              <SelectItem value="cancelled">Annulé</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const notes = prompt('Notes administratives:', booking.notes || '');
                              if (notes !== null) {
                                updateBookingStatus(booking.id, booking.status, notes);
                              }
                            }}
                          >
                            Notes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>
                Gérez les comptes utilisateurs et leurs permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) => updateUserRole(user.id, value, user.isActive)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Utilisateur</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('fr-CA')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateUserRole(user.id, user.role, !user.isActive)}
                        >
                          {user.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeslots">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des créneaux horaires</CardTitle>
              <CardDescription>
                Créez de nouveaux créneaux disponibles pour les réservations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createTimeSlot} className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="datetime">Date et heure</Label>
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={newTimeSlot.dateTime}
                      onChange={(e) => setNewTimeSlot(prev => ({ ...prev, dateTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Durée</Label>
                    <Select
                      value={newTimeSlot.duration}
                      onValueChange={(value: '1h' | '1h30' | '2h') => 
                        setNewTimeSlot(prev => ({ ...prev, duration: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 heure</SelectItem>
                        <SelectItem value="1h30">1h30</SelectItem>
                        <SelectItem value="2h">2 heures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit">Créer le créneau</Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminDashboard;