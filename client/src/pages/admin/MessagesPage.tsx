import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Mail, User, Calendar, MessageCircle, Trash2 } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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

  return (
    <div className="container mx-auto py-10">
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
        <div className="grid gap-8 md:grid-cols-2">
          {messages.map((msg) => (
            <Card key={msg.id} className="shadow-lg rounded-xl border border-neutral-200 bg-white hover:shadow-2xl transition-shadow duration-200 relative">
              <CardContent className="p-6 flex flex-col gap-3 h-full">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">{msg.name}</span>
                  <span className="ml-auto text-xs text-gray-500 flex items-center gap-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {msg.email}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span className="font-bold text-base text-primary/90">{msg.subject}</span>
                </div>
                <div className="mb-2 px-2 py-2 bg-gray-50 rounded text-gray-700 whitespace-pre-line border border-gray-100">
                  {msg.message}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="text-white bg-red-500 hover:bg-red-600 shadow-md ml-2"
                    onClick={() => setConfirmDeleteId(msg.id)}
                    disabled={deletingId === msg.id}
                    aria-label="Supprimer le message"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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