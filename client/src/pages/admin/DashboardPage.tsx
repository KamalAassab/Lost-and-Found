import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, CreditCard, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from "recharts";
import { formatPrice } from "@/lib/utils";

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', { 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
};

// Helper function to group orders by status
const groupOrdersByStatus = (orders: any[]) => {
  const statusCounts = {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  };
  
  orders.forEach(order => {
    statusCounts[order.status as keyof typeof statusCounts] += 1;
  });
  
  return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
};

// Dashboard analytics
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF0000'];

export default function DashboardPage() {
  // Set page title
  useEffect(() => {
    document.title = "Tableau de Bord | Admin";
  }, []);
  
  // Fetch orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery({ 
    queryKey: ['/api/orders'],
  });
  
  // Fetch products
  const { data: products, isLoading: isLoadingProducts } = useQuery({ 
    queryKey: ['/api/products'],
  });

  // Calculate dashboard stats
  const totalOrders = orders?.length || 0;
  const totalProducts = products?.length || 0;
  
  const totalRevenue = orders
    ? orders.reduce((sum: number, order: any) => sum + Number(order.total), 0)
    : 0;
    
  const pendingOrders = orders
    ? orders.filter((order: any) => order.status === 'pending' || order.status === 'processing').length
    : 0;

  // Create chart data
  const statusData = orders ? groupOrdersByStatus(orders) : [];
  
  const recentOrders = orders 
    ? [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5) 
    : [];
    
  // Category data
  const categoryData = products 
    ? products.reduce((acc: {[key: string]: number}, product: any) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {}) 
    : {};
    
  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({ 
    name: name === 'hoodie' ? 'Hoodies' : 'T-shirts', 
    value 
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total des Commandes</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl font-bold">{totalOrders}</div>
              )}
              <p className="text-xs text-muted-foreground">
                +{pendingOrders} en attente
              </p>
            </CardContent>
          </Card>
          
          {/* Total Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total des Produits</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingProducts ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl font-bold">{totalProducts}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {products?.filter((p: any) => p.category === 'hoodie').length || 0} hoodies, {products?.filter((p: any) => p.category === 'tshirt').length || 0} t-shirts
              </p>
            </CardContent>
          </Card>
          
          {/* Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
              )}
              <p className="text-xs text-muted-foreground">
                +{orders?.filter((order: any) => order.status === 'delivered').length || 0} commandes livrées
              </p>
            </CardContent>
          </Card>
          
          {/* Average Order Value */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Panier Moyen</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {totalOrders ? formatPrice(totalRevenue / totalOrders) : formatPrice(0)}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                sur {totalOrders} commandes
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts and tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Statut des Commandes</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {isLoadingOrders ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} commandes`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          {/* Product Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des Produits</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} produits`, '']} />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Nombre de produits" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div className="flex flex-col">
                      <span className="font-medium">Commande #{order.id}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)} - {order.customerName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full uppercase"
                          style={{
                            backgroundColor: 
                              order.status === 'delivered' ? 'rgba(0, 196, 159, 0.2)' :
                              order.status === 'shipped' ? 'rgba(0, 136, 254, 0.2)' :
                              order.status === 'processing' ? 'rgba(255, 187, 40, 0.2)' :
                              order.status === 'cancelled' ? 'rgba(255, 0, 0, 0.2)' :
                              'rgba(150, 150, 150, 0.2)',
                            color:
                              order.status === 'delivered' ? 'rgb(0, 196, 159)' :
                              order.status === 'shipped' ? 'rgb(0, 136, 254)' :
                              order.status === 'processing' ? 'rgb(255, 187, 40)' :
                              order.status === 'cancelled' ? 'rgb(255, 0, 0)' :
                              'rgb(150, 150, 150)'
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">Aucune commande récente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
