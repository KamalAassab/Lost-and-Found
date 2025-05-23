import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Loader2, Mail, User, Calendar, MessageCircle, Trash2, Eye } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

function MessagesPageContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest("GET", "/api/messages");
      setMessages(data);
    } catch (err: any) {
      setError(err?.message || "Erreur lors du chargement des messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const response = await apiRequest("DELETE", `/api/messages/${id}`);
      if (response && response.success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
        toast({
          title: "Message supprimé",
          description: "Le message a été supprimé avec succès.",
        });
      } else {
        throw new Error("La suppression a échoué");
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.message || "Une erreur est survenue lors de la suppression du message.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedMessage(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Messages de Contact</h1>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (messages || []).length === 0 ? (
        <div className="text-gray-500 text-center">Aucun message pour le moment.</div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader>
              <TableRow>
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom Complet</TableHead>
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</TableHead>
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</TableHead>
                <TableHead className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Options</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {messages.map((msg) => (
                <TableRow key={msg.id} className="hover:bg-gray-50 text-sm">
                  <TableCell className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{msg.name}</TableCell>
                  <TableCell className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{msg.email}</TableCell>
                  <TableCell className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(msg.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewMessage(msg)}
                      aria-label="Voir le message"
                      className="mr-2"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir les détails du message
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirmDeleteId(msg.id)}
                      disabled={deletingId === msg.id}
                      aria-label="Supprimer le message"
                    >
                      {deletingId === msg.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {/* View Message Dialog */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Détails du Message</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium text-gray-500">De:</p>
                <p className="font-semibold">{selectedMessage.name} &lt;{selectedMessage.email}&gt;</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Sujet:</p>
                <p className="font-medium">{selectedMessage.subject}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Envoyé le:</p>
                <p className="text-sm">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Message:</p>
                <div className="bg-gray-50 p-3 rounded-md whitespace-pre-line text-gray-700 border border-gray-100">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseViewModal}>Fermer</Button>
            {selectedMessage && (
               <Button
                 variant="destructive"
                 onClick={() => {
                   setOrderToDelete(selectedMessage);
                   handleCloseViewModal(); // Close view modal
                   setIsDeleteDialogOpen(true); // Open delete confirmation
                 }}
                 disabled={deletingId === selectedMessage.id}
               >
                 <Trash2 className="h-4 w-4 mr-1" />
                 Supprimer le message
               </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              disabled={deletingId === confirmDeleteId}
            >
              {deletingId === confirmDeleteId ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <AdminLayout>
      <MessagesPageContent />
    </AdminLayout>
  );
} 