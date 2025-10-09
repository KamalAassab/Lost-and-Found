import React, { useState, useEffect } from "react";
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
  DialogTitle,
  DialogDescription
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
import { formatPrice, formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Eye, RefreshCw, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface OrderTableProps {
  orders: any[];
}

export default function OrderTable({ orders }: OrderTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [localOrders, setLocalOrders] = useState(orders);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  // Sort orders oldest first
  const sortedOrders = [...localOrders].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (sortBy === "customerName") {
      aVal = a.customerName?.toLowerCase() || "";
      bVal = b.customerName?.toLowerCase() || "";
    }
    if (sortBy === "customerEmail") {
      aVal = a.customerEmail?.toLowerCase() || "";
      bVal = b.customerEmail?.toLowerCase() || "";
    }
    if (sortBy === "total") {
      aVal = Number(a.total);
      bVal = Number(b.total);
    }
    if (sortBy === "createdAt") {
      aVal = new Date(a.createdAt).getTime();
      bVal = new Date(b.createdAt).getTime();
    }
    if (sortBy === "status") {
      aVal = a.status || "";
      bVal = b.status || "";
    }
    if (sortBy === "paymentMethod") {
      aVal = a.paymentMethod || "";
      bVal = b.paymentMethod || "";
    }
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Update order status mutation
  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      const response = await apiRequest('PUT', `/api/orders/${orderId}/status`, { status });
      return response;
    },
    onSuccess: (data) => {
      // Update the local order data
      setSelectedOrder((prev: any) => prev ? { ...prev, status: data.status } : null);
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la commande a été mis à jour avec succès.",
      });
    },
    onError: (error: any) => {
      console.error("Order status update error details:", error);
      toast({
        title: "Erreur",
        description: (error.details || error.message) ?? "Une erreur est survenue lors de la mise à jour du statut.",
        variant: "destructive",
      });
    }
  });

  // Delete order mutation
  const deleteMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiRequest('DELETE', `/api/orders/${orderId}`);
      if (response && response.message === "Commande supprimée avec succès") {
        return true;
      }
      throw new Error(response?.message || 'Erreur lors de la suppression de la commande');
    },
    onSuccess: (_, orderId) => {
      setLocalOrders((prev: any[]) => prev.filter((o: any) => o.id !== orderId));
      toast({
        title: 'Commande supprimée',
        description: 'La commande a été supprimée avec succès.',
      });
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la suppression.',
        variant: 'destructive',
      });
    },
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

  // In the JSX for the order details dialog, replace all uses of selectedOrder.items with order.items, where:
  const order = orderDetails || selectedOrder;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  };

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader>
            <TableRow>
              <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</TableHead>
              <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</TableHead>
              <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer flex items-center" onClick={() => handleSort("createdAt")}>Date</TableHead>
              <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("total")}>Total</TableHead>
              <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("status")}>Statut</TableHead>
              <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("paymentMethod")}>Paiement</TableHead>
              <TableHead className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {paginatedOrders.map((order, index) => (
              <TableRow key={order.id} className="hover:bg-gray-50 text-sm">
                <TableCell className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell className="px-3 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                  <div className="text-sm text-gray-500">{order.customerEmail}</div>
                </TableCell>
                <TableCell className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</TableCell>
                <TableCell className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{formatPrice(order.total)}</TableCell>
                <TableCell className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                  {getStatusBadge(order.status)}
                </TableCell>
                <TableCell className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{order.paymentMethod === 'credit_card' ? 'Carte de crédit' : order.paymentMethod === 'cash_on_delivery' ? 'Paiement à la livraison' : order.paymentMethod}</TableCell>
                <TableCell className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewOrder(order)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
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
            <DialogTitle>
              Détails de la commande{' '}
              {(() => {
                if (!selectedOrder) return '';
                // Sort orders by creation date (oldest first)
                const sorted = [...orders].sort(
                  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                // Find the index of the selected order
                const idx = sorted.findIndex(o => o.id === selectedOrder.id);
                return idx >= 0 ? idx + 1 : selectedOrder.id;
              })()}
            </DialogTitle>
            <DialogDescription>
              Détails et actions pour cette commande.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
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
                {/* Order summary and payment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Résumé de la commande</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Produits:</span>
                      <span className="text-sm font-medium">
                        {formatPrice(
                          (order.items?.reduce(
                            (sum: number, item: any) => sum + (item.price * item.quantity),
                            0
                          )) || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Livraison:</span>
                      <span className="text-sm font-medium">
                        {order.free_shipping ? (
                          <span className="text-green-600">Gratuite</span>
                        ) : (
                          '50 MAD'
                        )}
                      </span>
                    </div>
                    {order.promoApplied && (
                      <div className="flex justify-between">
                        <span className="text-sm">Promotion appliquée:</span>
                        <span className="text-sm font-medium text-green-600">Oui</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold">{formatPrice(order.total)}</span>
                    </div>
                    {/* Payment method section */}
                    <Separator />
                    <div>
                      <span className="font-medium">Méthode de paiement:</span>
                      <span className="ml-2">
                        {selectedOrder.paymentMethod === 'credit_card' ? 'Carte bancaire' : 'À la livraison'}
                      </span>
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
                  <div className="space-y-4">
                    {(order?.items?.length === 0 || !order?.items) && (
                      <div className="text-center py-4 text-muted-foreground">Aucun article dans cette commande</div>
                    )}
                    {order?.items?.map((item: any) => (
                      <div key={`${item.productId}-${item.size}`} className="flex items-center gap-4">
                                <img 
                          src={item.product?.image ? `/uploads/${item.product.image}` : undefined}
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded-md"
                                />
                        <div className="flex-grow">
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Taille: {item.size} | Quantité: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price)} × {item.quantity}
                                  </p>
                                </div>
                              </div>
                    ))}
                    </div>
                </CardContent>
              </Card>
            </div>
          )}
          {/* Add Delete Button Here */}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Fermer</Button>
            <Button
              variant="destructive"
              onClick={() => {
                setOrderToDelete(selectedOrder);
                setIsViewOpen(false);
                setIsDeleteDialogOpen(true);
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer la commande
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la commande</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (orderToDelete) deleteMutation.mutate(orderToDelete.id);
              }}
              disabled={deleteMutation.isPending}
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
