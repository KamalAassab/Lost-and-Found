import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, CreditCard, TrendingUp, Users } from "lucide-react";
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
    if (order.status && statusCounts.hasOwnProperty(order.status)) {
      statusCounts[order.status as keyof typeof statusCounts]++;
    }
  });
  
  return Object.entries(statusCounts).map(([name, value]) => ({
    name: name === 'pending' ? 'En attente' :
          name === 'processing' ? 'En traitement' :
          name === 'shipped' ? 'Expédiée' :
          name === 'delivered' ? 'Livrée' :
          name === 'cancelled' ? 'Annulée' : name,
    value
  }));
};

// Dashboard analytics
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF0000'];

export default function DashboardPage() {
  // Set page title
  useEffect(() => {
    document.title = "Tableau de Bord | Admin";
  }, []);
  
  // Fetch orders
  const { data: ordersRaw, isLoading: isLoadingOrders } = useQuery({ 
    queryKey: ['/api/orders'],
  });
  const orders = Array.isArray(ordersRaw) ? ordersRaw : [];
  
  // Fetch products
  const { data: productsRaw, isLoading: isLoadingProducts } = useQuery({ 
    queryKey: ['/api/products'],
  });
  const products = Array.isArray(productsRaw) ? productsRaw : [];

  // Calculate dashboard stats
  const totalOrders = orders.length;
  const totalProducts = products.length;
  
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + Number(order.total), 0);
    
  const pendingOrders = orders.filter((order: any) => order.status === 'pending' || order.status === 'processing').length;

  // --- Visitors per day (demo: random number between 10 and 50) ---
  const averageVisitorsPerDay =  Math.floor(Math.random() * 41) + 10;

  // Create chart data
  const statusData = groupOrdersByStatus(orders);
  const statusDataNonZero = statusData.filter(d => d.value > 0);
  
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
    
  // Category data
  const categoryData = products.reduce((acc: {[key: string]: number}, product: any) => {
    let key = product.category?.toLowerCase();
    if (key === 'hoodie' || key === 'hoodies') key = 'Hoodies';
    else if (key === 'tshirt' || key === 'tshirts') key = 'T-shirts';
    else key = key?.charAt(0).toUpperCase() + key?.slice(1);
    acc[key] = (acc[key] || 0) + 1;
        return acc;
  }, {});
    
  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({ 
    name, 
    value 
  }));

  // Always show all statuses in the chart, even if value is 0
  const allStatusLabels = [
    'En attente',
    'En traitement',
    'Expédiée',
    'Livrée',
    'Annulée'
  ];
  const statusDataFull = allStatusLabels.map((label) => {
    const found = statusData.find(d => d.name === label);
    return found || { name: label, value: 0 };
  });

  // Count hoodies and t-shirts (case-insensitive, singular/plural)
  const hoodieCount = products.filter((p: any) => {
    const cat = (p.category || '').toLowerCase();
    return cat === 'hoodie' || cat === 'hoodies';
  }).length;
  const tshirtCount = products.filter((p: any) => {
    const cat = (p.category || '').toLowerCase();
    return cat === 'tshirt' || cat === 'tshirts' || cat === 't-shirt' || cat === 't-shirts';
  }).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Tableau de Bord</h1>
        
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
                <div className="text-xl font-bold">{totalOrders}</div>
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
                <div className="text-xl font-bold">{totalProducts}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {hoodieCount} hoodies, {tshirtCount} t-shirts
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
                <div className="text-xl font-bold">{formatPrice(totalRevenue)}</div>
              )}
              <p className="text-xs text-muted-foreground">
                +{orders.filter((order: any) => order.status === 'delivered').length || 0} commandes livrées
              </p>
            </CardContent>
          </Card>
          
          {/* Average Visitors Per Day */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visiteurs Moyens / Jour</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{averageVisitorsPerDay}</div>
              <p className="text-xs text-muted-foreground">Toujours plus de 0 visiteurs !</p>
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
              ) : statusDataFull.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statusDataFull}
                      layout="vertical"
                      margin={{ top: 20, right: 40, left: 40, bottom: 5 }}
                      barCategoryGap={30}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontWeight: 600, fontSize: 14 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontWeight: 600, fontSize: 15 }} width={120} />
                      <Tooltip formatter={(value) => [`${value} commandes`, '']} />
                      <Bar dataKey="value" name="Nombre de commandes" radius={[0, 8, 8, 0]} barSize={32}>
                        {statusDataFull.map((entry, index) => (
                          <Cell key={`cell-bar-h-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        {/* Value labels at the end of bars */}
                        {statusDataFull.map((entry, index) => (
                          <text
                            key={`label-bar-h-${index}`}
                            x={entry.value * 40 + 60}
                            y={index * (100 / statusDataFull.length) + 45}
                            dx={0}
                            dy={-10}
                            textAnchor="start"
                            fontSize={15}
                            fontWeight={700}
                            fill="#222"
                            style={{ pointerEvents: 'none' }}
                          >
                            {entry.value > 0 ? entry.value : ''}
                          </text>
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {/* Custom Legend for Order Status */}
                  <div className="flex justify-center gap-2 mt-1 flex-wrap">
                    {statusDataFull.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1">
                        <span
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                            width: 12,
                            height: 12,
                            borderRadius: 3,
                            display: 'inline-block',
                          }}
                        ></span>
                        <span className="font-semibold text-xs" style={{ color: COLORS[index % COLORS.length] }}>
                          {entry.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Aucune donnée disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Product Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des Produits</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex flex-col justify-between">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : categoryChartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="85%">
                  <BarChart
                    data={categoryChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      barCategoryGap={30}
                  >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontWeight: 600, fontSize: 14 }} />
                      <YAxis allowDecimals={false} tick={{ fontWeight: 600, fontSize: 14 }} />
                    <Tooltip formatter={(value) => [`${value} produits`, '']} />
                      <Bar dataKey="value" name="Nombre de produits" radius={[8, 8, 0, 0]} barSize={38}>
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-bar-cat-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        {/* Value labels above bars */}
                        {categoryChartData.map((entry, index) => (
                          <text
                            key={`label-bar-cat-${index}`}
                            x={index * (100 / categoryChartData.length) + 10 + '%'}
                            y={60}
                            dx={0}
                            dy={-10}
                            textAnchor="middle"
                            fontSize={14}
                            fontWeight={700}
                            fill="#222"
                            style={{ pointerEvents: 'none' }}
                          >
                            {entry.value > 0 ? entry.value : ''}
                          </text>
                        ))}
                      </Bar>
                  </BarChart>
                </ResponsiveContainer>
                  {/* Custom Legend */}
                  <div className="flex justify-center gap-6 mt-2">
                    {categoryChartData.map((entry, index) => (
                      <div key={`legend-cat-${index}`} className="flex items-center gap-2">
                        <span style={{ backgroundColor: COLORS[index % COLORS.length], width: 16, height: 16, borderRadius: 4, display: 'inline-block' }}></span>
                        <span className="font-semibold" style={{ color: COLORS[index % COLORS.length] }}>{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Aucune donnée disponible</p>
                </div>
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
                {recentOrders.map((order: any) => {
                  // Friendly order number: position in sorted list (oldest first)
                  const sorted = [...orders].sort(
                    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                  );
                  const idx = sorted.findIndex(o => o.id === order.id);
                  const friendlyOrderNumber = idx >= 0 ? idx + 1 : order.id;
                  return (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div className="flex flex-col">
                        <span className="font-medium">Commande #{friendlyOrderNumber}</span>
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
                          {order.status === 'pending' ? 'En attente' :
                           order.status === 'processing' ? 'En traitement' :
                           order.status === 'shipped' ? 'Expédiée' :
                           order.status === 'delivered' ? 'Livrée' :
                           order.status === 'cancelled' ? 'Annulée' : order.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                  );
                })}
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
