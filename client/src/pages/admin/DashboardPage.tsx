import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  ShoppingBag, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Truck,
  Star,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw
} from "lucide-react";
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
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { formatPrice, formatDate } from "@/lib/utils";

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

// Dashboard analytics - Black/White/Red color scheme
const COLORS = ['#000000', '#666666', '#CCCCCC', '#FF0000', '#FF6666'];

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-600">Total des Commandes</CardTitle>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Package className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              {isLoadingOrders ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-xl font-bold text-gray-900 mb-2">{totalOrders}</div>
              )}
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                  +{pendingOrders} en attente
                </Badge>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Total Products Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-600">Total des Produits</CardTitle>
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              {isLoadingProducts ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-xl font-bold text-gray-900 mb-2">{totalProducts}</div>
              )}
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                  {hoodieCount} hoodies
                </Badge>
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                  {tshirtCount} t-shirts
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-600">Revenu Total</CardTitle>
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              {isLoadingOrders ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-xl font-bold text-gray-900 mb-2">{formatPrice(totalRevenue)}</div>
              )}
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                  +{orders.filter((order: any) => order.status === 'delivered').length || 0} livrées
                </Badge>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Visitors Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-600">Visiteurs / Jour</CardTitle>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-xl font-bold text-gray-900 mb-2">{averageVisitorsPerDay}</div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                  Actif
                </Badge>
                <Activity className="h-4 w-4 text-purple-500 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Order Status Chart */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">Statut des Commandes</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                  {totalOrders} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 h-80">
              {isLoadingOrders ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full rounded-lg" />
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
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                      <XAxis 
                        type="number" 
                        allowDecimals={false} 
                        tick={{ fontWeight: 500, fontSize: 12, fill: '#374151' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        tick={{ fontWeight: 500, fontSize: 12, fill: '#374151' }} 
                        width={100}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} commandes`, '']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          fontSize: '12px'
                        }}
                        labelStyle={{ color: '#374151', fontWeight: 600 }}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Nombre de commandes" 
                        radius={[0, 4, 4, 0]} 
                        barSize={24}
                        fill="#000000"
                      >
                        {statusDataFull.map((entry, index) => (
                          <Cell 
                            key={`cell-bar-h-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={1}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-3 mt-4 flex-wrap">
                    {statusDataFull.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-lg shadow-sm">
                        <span
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            display: 'inline-block',
                          }}
                        ></span>
                        <span className="font-semibold text-sm text-gray-700">
                          {entry.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Aucune donnée disponible</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Product Categories Chart */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
                    <PieChartIcon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">Répartition des Produits</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                  {totalProducts} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 h-80 flex flex-col justify-between">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full rounded-lg" />
                </div>
              ) : categoryChartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart
                      data={categoryChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      barCategoryGap={30}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontWeight: 500, fontSize: 12, fill: '#374151' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        allowDecimals={false} 
                        tick={{ fontWeight: 500, fontSize: 12, fill: '#374151' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} produits`, '']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          fontSize: '12px'
                        }}
                        labelStyle={{ color: '#374151', fontWeight: 600 }}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Nombre de produits" 
                        radius={[4, 4, 0, 0]} 
                        barSize={32}
                        fill="#000000"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-bar-cat-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={1}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4 flex-wrap">
                    {categoryChartData.map((entry, index) => (
                      <div key={`legend-cat-${index}`} className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-lg shadow-sm">
                        <span 
                          style={{ 
                            backgroundColor: COLORS[index % COLORS.length], 
                            width: 12, 
                            height: 12, 
                            borderRadius: 6, 
                            display: 'inline-block' 
                          }}
                        ></span>
                        <span className="font-semibold text-sm text-gray-700">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Aucune donnée disponible</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Enhanced Recent Orders Section */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">Commandes Récentes</CardTitle>
              </div>
              <Button 
                variant="outline" 
                className="bg-white/50 border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300 transition-all duration-300 hover:scale-105"
              >
                <Eye className="h-4 w-4 mr-2" />
                Voir Tout
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoadingOrders ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order: any, index: number) => {
                  const sorted = [...orders].sort(
                    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                  );
                  const idx = sorted.findIndex(o => o.id === order.id);
                  const friendlyOrderNumber = idx >= 0 ? idx + 1 : order.id;
                  
                  const getStatusConfig = (status: string) => {
                    const configs = {
                      pending: { 
                        label: 'En attente', 
                        icon: Clock, 
                        className: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg',
                        bgColor: 'from-yellow-500/10 to-orange-500/10'
                      },
                      processing: { 
                        label: 'En traitement', 
                        icon: Activity, 
                        className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg',
                        bgColor: 'from-blue-500/10 to-blue-600/10'
                      },
                      shipped: { 
                        label: 'Expédiée', 
                        icon: Truck, 
                        className: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg',
                        bgColor: 'from-purple-500/10 to-purple-600/10'
                      },
                      delivered: { 
                        label: 'Livrée', 
                        icon: CheckCircle, 
                        className: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg',
                        bgColor: 'from-green-500/10 to-green-600/10'
                      },
                      cancelled: { 
                        label: 'Annulée', 
                        icon: XCircle, 
                        className: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg',
                        bgColor: 'from-red-500/10 to-red-600/10'
                      }
                    };
                    return configs[status as keyof typeof configs] || configs.pending;
                  };
                  
                  const statusConfig = getStatusConfig(order.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div 
                      key={order.id} 
                      className={`group/order relative overflow-hidden bg-gradient-to-r ${statusConfig.bgColor} border border-gray-200/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-gray-300`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg group-hover/order:scale-110 transition-transform duration-300">
                              <StatusIcon className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{index + 1}</span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-sm">
                              Commande #{friendlyOrderNumber}
                            </span>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(order.createdAt)}</span>
                              <span>•</span>
                              <span className="font-medium">{order.customerName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={statusConfig.className}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatPrice(order.total)}
                            </div>
                            <div className="text-xs text-gray-500">Total</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune commande récente</h3>
                <p className="text-gray-500">Les nouvelles commandes apparaîtront ici</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
