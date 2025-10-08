import React, { useEffect, useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';

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
      <h1 className="text-xl font-bold mb-4">Gestion des Utilisateurs</h1>

      {isLoading ? (
        <Loader2 className="h-8 w-8 animate-spin" />
      ) : error ? (
        <p className="text-red-500">Erreur lors du chargement des utilisateurs.</p>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Nom Complet</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.fullname || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.isAdmin ? 'Oui' : 'Non'}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    {!user.isAdmin && ( // Prevent deleting admin users via this interface
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteUserMutation.isLoading}
                      >
                        {deleteUserMutation.isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
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
              disabled={deleteUserMutation.isLoading}
            >
              {deleteUserMutation.isLoading ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
} 