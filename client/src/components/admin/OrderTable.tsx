import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Eye, RefreshCw } from "lucide-react";

interface OrderTableProps {
  orders: any[];
}

export default function OrderTable({ orders }: OrderTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const itemsPerPage = 10;
  const { toast } = useToast();

  // Pagination
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Update order status mutation
  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      return await apiRequest('PUT', `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la commande a été mis à jour avec succès.",
      });
    },
    onError: (error) => {
      console.error("Error updating order status:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du statut.",
        variant: "destructive",
      });
    }
  });

  // Fetch order details
  const { data: orderDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: [`/api/orders/${selectedOrder?.id}`],
    enabled: !!selectedOrder,
  });

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsViewOpen(true);
  };

  const handleStatusChange = (orderId: number, status: string) => {
    statusMutation.mutate({ orderId, status });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get badge color based on status
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">En attente</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">En traitement</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-indigo-200">Expédiée</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Livrée</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Annulée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Paiement</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                  </div>
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>{formatPrice(order.total)}</TableCell>
                <TableCell>
                  {getStatusBadge(order.status)}
                </TableCell>
                <TableCell>
                  {order.paymentMethod === 'cash_on_delivery' ? 'À la livraison' : 'Carte bancaire'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-500">
              Affichage de {Math.min(orders.length, (currentPage - 1) * itemsPerPage + 1)} à {Math.min(orders.length, currentPage * itemsPerPage)} sur {orders.length} commandes
            </div>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const pageDiff = Math.abs(page - currentPage);
                  return pageDiff <= 1 || page === 1 || page === totalPages;
                })
                .map((page, index, array) => {
                  // Show ellipsis
                  if (index > 0 && page > array[index - 1] + 1) {
                    return (
                      <span key={`ellipsis-${page}`} className="px-3 py-2">
                        ...
                      </span>
                    );
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-9"
                    >
                      {page}
                    </Button>
                  );
                })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Détails de la commande #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Commande passée le {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Statut:</span>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                    disabled={statusMutation.isPending}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Changer le statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="processing">En traitement</SelectItem>
                      <SelectItem value="shipped">Expédiée</SelectItem>
                      <SelectItem value="delivered">Livrée</SelectItem>
                      <SelectItem value="cancelled">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {statusMutation.isPending && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>
              
              {/* Order details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations client</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium">{selectedOrder.customerName}</p>
                      <p className="text-sm">{selectedOrder.customerEmail}</p>
                      <p className="text-sm">{selectedOrder.customerPhone}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Adresse de livraison</p>
                      <p className="text-sm">{selectedOrder.shippingAddress}</p>
                      <p className="text-sm">{selectedOrder.city}, {selectedOrder.postalCode}</p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Order summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Résumé de la commande</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Mode de paiement:</span>
                      <span className="text-sm font-medium">
                        {selectedOrder.paymentMethod === 'cash_on_delivery' ? 'Paiement à la livraison' : 'Carte bancaire'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Livraison:</span>
                      <span className="text-sm font-medium">
                        {selectedOrder.freeShipping ? (
                          <span className="text-green-600">Gratuite</span>
                        ) : (
                          '50 MAD'
                        )}
                      </span>
                    </div>
                    
                    {selectedOrder.promoApplied && (
                      <div className="flex justify-between">
                        <span className="text-sm">Promotion appliquée:</span>
                        <span className="text-sm font-medium text-green-600">Oui</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold">{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Order items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Articles commandés</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingDetails ? (
                    <div className="text-center py-4">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2 text-sm text-muted-foreground">Chargement des articles...</p>
                    </div>
                  ) : orderDetails?.items?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead>Taille</TableHead>
                          <TableHead>Quantité</TableHead>
                          <TableHead>Prix unitaire</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderDetails.items.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img 
                                  src={item.product.imageUrl} 
                                  alt={item.product.name} 
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div>
                                  <p className="font-medium">{item.product.name}</p>
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {item.product.category}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{item.size}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              {item.isFree ? (
                                <span className="text-accent font-medium">GRATUIT</span>
                              ) : (
                                formatPrice(item.price)
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.isFree ? (
                                <span className="text-accent font-medium">GRATUIT</span>
                              ) : (
                                formatPrice(item.price * item.quantity)
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Aucun article trouvé pour cette commande.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
