import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Loader2, Mail, User, Calendar, MessageCircle, Trash2, Eye, Filter, Search, AlertCircle, CheckCircle, Star, Archive, Flag, Reply, Phone, Clock } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}

function MessagesPageContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiRequest("GET", "/api/messages");
      if (response && Array.isArray(response)) {
        setMessages(response);
      } else {
        throw new Error("Format de réponse invalide");
      }
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
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      handleDelete(confirmDeleteId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black text-white p-6 rounded-2xl mb-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl shadow-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">Gestion des Messages</h1>
              <p className="text-gray-300 text-sm">Gérez les messages clients</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-0 shadow-lg">
              {messages.length} Messages
            </Badge>
          </div>
        </div>
      </div>

      {/* Professional Messages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur lors du chargement</h3>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : (messages || []).length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun message trouvé</h3>
            <p className="text-gray-500">Aucun message pour le moment.</p>
          </div>
        ) : (
          messages.map((message: any) => (
            <Card 
              key={message.id} 
              className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative z-10">
                {/* Message Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm group-hover:text-black transition-colors duration-300">
                        {message.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span>{message.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-lg text-xs"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(message.createdAt)}
                    </Badge>
                  </div>
                </div>

                {/* Message Content */}
                <div className="mb-4">
                  <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed">
                    {message.message}
                  </p>
                </div>

                {/* Contact Info */}
                {message.phone && (
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
                    <Phone className="h-3 w-3" />
                    <span>{message.phone}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewMessage(message)}
                      className="text-black hover:text-white hover:bg-black hover:border-black transition-all duration-300 hover:scale-105 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all duration-300 hover:scale-105 text-xs"
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Répondre
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDeleteId(message.id)}
                    disabled={deletingId === message.id}
                    className="text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all duration-300 hover:scale-105 text-xs"
                  >
                    {deletingId === message.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Message Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-black" />
              <span>Détails du Message</span>
            </DialogTitle>
            <DialogDescription>
              Informations complètes du message client
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedMessage.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4" />
                      <span>{selectedMessage.email}</span>
                    </div>
                  </div>
                </div>
                {selectedMessage.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                    <Phone className="h-4 w-4" />
                    <span>{selectedMessage.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(selectedMessage.createdAt)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Message</h4>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{selectedMessage.message}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Fermer
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (selectedMessage) {
                  setConfirmDeleteId(selectedMessage.id);
                  setIsModalOpen(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
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
              onClick={handleConfirmDelete}
              disabled={deletingId !== null}
            >
              {deletingId !== null ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Supprimer
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