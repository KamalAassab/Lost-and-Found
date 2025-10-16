import React, { useEffect, useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Loader2, Users, User, Mail, Calendar, Shield, AlertCircle, Eye, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface User {
  id: number;
  username: string;
  email: string;
  fullname?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt?: string;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);

  // Fetch users
  const { data: users = [], isLoading, error } = useQuery<User[]>({ 
    queryKey: ['/api/admin/users'],
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => apiRequest('DELETE', `/api/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès.",
      });
    },
    onError: (err) => {
      toast({
        title: "Erreur",
        description: `Échec de la suppression de l'utilisateur: ${err.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteUser = (userId: number) => {
    setUserToDeleteId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDeleteId !== null) {
      deleteUserMutation.mutate(userToDeleteId);
      setIsDeleteDialogOpen(false);
      setUserToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setUserToDeleteId(null);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Professional Header */}
        <div className="bg-gradient-to-r from-black via-gray-900 to-black text-white p-8 rounded-2xl mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Gestion des Utilisateurs</h1>
                <p className="text-gray-300 text-sm">Gérez les comptes utilisateurs</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-0 shadow-lg">
                {users.length} Utilisateurs
              </Badge>
            </div>
          </div>
        </div>

        {/* Enhanced Users Table */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-black" />
              <span>Liste des Utilisateurs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
      {isLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Chargement des utilisateurs...</p>
                </div>
              </div>
      ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur lors du chargement</h3>
                <p className="text-red-600 font-medium">Erreur lors du chargement des utilisateurs.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200">
          <Table>
                  <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <TableRow className="border-gray-200">
                      <TableHead className="px-6 py-4 text-left font-bold text-gray-700">Utilisateur</TableHead>
                      <TableHead className="px-6 py-4 text-left font-bold text-gray-700">Nom Complet</TableHead>
                      <TableHead className="px-6 py-4 text-left font-bold text-gray-700">Email</TableHead>
                      <TableHead className="px-6 py-4 text-left font-bold text-gray-700">Rôle</TableHead>
                      <TableHead className="px-6 py-4 text-left font-bold text-gray-700">Inscrit le</TableHead>
                      <TableHead className="px-6 py-4 text-center font-bold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
                  <TableBody className="bg-white divide-y divide-gray-100">
              {users.map((user) => (
                      <TableRow 
                        key={user.id} 
                        className="hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 border-gray-100"
                      >
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="font-semibold text-gray-900 text-sm">{user.username}</div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900 font-medium">{user.fullname || 'N/A'}</div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant="secondary"
                            className={`${
                              user.isAdmin 
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg' 
                                : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-lg'
                            }`}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {user.isAdmin ? 'Admin' : 'Utilisateur'}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                          {!user.isAdmin && (
                      <Button 
                              variant="outline"
                        size="sm" 
                        onClick={() => handleDeleteUser(user.id)}
                              disabled={deleteUserMutation.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-300 hover:scale-105"
                      >
                              {deleteUserMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Supprimer
                                </>
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>Annuler</Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
} 