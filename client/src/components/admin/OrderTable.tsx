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
import { ChevronLeft, ChevronRight, Eye, RefreshCw, Trash2, ChevronUp, ChevronDown, User, Package, CreditCard, MapPin, Calendar, Clock, CheckCircle, Truck, XCircle, X } from "lucide-react";

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

  // Get badge color based on status - matching Dashboard colors
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold text-xs px-3 py-1 rounded-full">En attente</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold text-xs px-3 py-1 rounded-full">En traitement</Badge>;
      case 'shipped':
        return <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold text-xs px-3 py-1 rounded-full">Expédiée</Badge>;
      case 'delivered':
        return <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold text-xs px-3 py-1 rounded-full">Livrée</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold text-xs px-3 py-1 rounded-full">Annulée</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold text-xs px-3 py-1 rounded-full">{status}</Badge>;
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
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-hidden">
          <DialogHeader className="bg-black text-white px-4 py-3 -m-6 mb-4">
            <DialogTitle className="text-lg font-bold flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Commande #{(() => {
                if (!selectedOrder) return '';
                const sorted = [...orders].sort(
                  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                const idx = sorted.findIndex(o => o.id === selectedOrder.id);
                return idx >= 0 ? idx + 1 : selectedOrder.id;
              })()}</span>
              <span className="text-sm text-gray-300 ml-2">
                {selectedOrder && formatDate(selectedOrder.createdAt)}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {/* Order Status Card */}
              <Card className="border border-gray-300 shadow-sm">
                <CardHeader className="bg-black text-white px-3 py-2">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span>Statut</span>
                    </div>
                    {getStatusBadge(selectedOrder.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                      disabled={statusMutation.isPending}
                    >
                      <SelectTrigger className="w-[160px] h-8 text-xs border-gray-300 focus:border-red-500 focus:ring-red-500">
                        <SelectValue placeholder="Changer" />
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
                      <RefreshCw className="h-4 w-4 animate-spin text-red-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Order details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Customer Information Card */}
                <Card className="border border-gray-300 shadow-sm">
                  <CardHeader className="bg-black text-white px-3 py-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4" />
                      <span>Client</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-sm">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-600">{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-600">{selectedOrder.customerPhone}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">Adresse</span>
                      </div>
                      <p className="text-xs text-gray-600 ml-6">{selectedOrder.shippingAddress}</p>
                      <p className="text-xs text-gray-600 ml-6">{selectedOrder.city}, {selectedOrder.postalCode}</p>
                    </div>
                  </CardContent>
                </Card>
                {/* Order Summary Card */}
                <Card className="border border-gray-300 shadow-sm">
                  <CardHeader className="bg-black text-white px-3 py-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <CreditCard className="h-4 w-4" />
                      <span>Paiement</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Produits:</span>
                      <span className="font-semibold text-sm">
                        {formatPrice(
                          (order.items?.reduce(
                            (sum: number, item: any) => sum + (item.price * item.quantity),
                            0
                          )) || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Livraison:</span>
                      <span className="font-semibold text-sm">
                        {order.free_shipping ? (
                          <span className="text-red-600 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Gratuite
                          </span>
                        ) : (
                          '50 MAD'
                        )}
                      </span>
                    </div>
                    {order.promoApplied && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Promotion:</span>
                        <span className="text-xs text-red-600 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Oui
                        </span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center bg-black text-white p-2 rounded">
                      <span className="font-bold text-sm">Total:</span>
                      <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-600">
                        {selectedOrder.paymentMethod === 'credit_card' ? 'Carte bancaire' : 'À la livraison'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Order Items Card */}
              <Card className="border border-gray-300 shadow-sm">
                <CardHeader className="bg-black text-white px-3 py-2">
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <Package className="h-4 w-4" />
                    <span>Articles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    {(order?.items?.length === 0 || !order?.items) && (
                      <div className="text-center py-4 text-gray-500">
                        <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-xs">Aucun article</p>
                      </div>
                    )}
                    {order?.items?.map((item: any, index: number) => (
                      <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 p-2 border border-gray-200 rounded hover:bg-gray-50">
                        <div className="relative">
                          <img 
                            src={item.product?.imageUrl || undefined}
                            alt={item.product?.name}
                            className="w-10 h-10 object-cover rounded border border-gray-200"
                          />
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold text-sm text-gray-900">{item.product?.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-600 bg-gray-200 px-1 py-0.5 rounded">
                              {item.size}
                            </span>
                            <span className="text-xs text-gray-600 bg-red-100 px-1 py-0.5 rounded">
                              x{item.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                          <p className="text-xs text-gray-500">
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
          
          {/* Action Buttons - Compact */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-300 -m-6 px-4 py-3 bg-gray-50">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              <span>{selectedOrder && formatDate(selectedOrder.createdAt)}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsViewOpen(false)}
                className="h-8 px-3 text-xs border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <X className="h-3 w-3 mr-1" />
                Fermer
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setOrderToDelete(selectedOrder);
                  setIsViewOpen(false);
                  setIsDeleteDialogOpen(true);
                }}
                disabled={deleteMutation.isPending}
                className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white border-0"
              >
                {deleteMutation.isPending ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Supprimer
                  </>
                )}
              </Button>
            </div>
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
