import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Briefcase,
  Calendar,
  DollarSign,
  Edit,
  MessageSquare,
  Star,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// Mock data, in a real app this would come from an API call
const muaData = {
  name: "Sarah Makeup Artist",
  avatarUrl: "/placeholder.svg",
  stats: {
    earnings: 7500000,
    upcomingBookings: 4,
    totalReviews: 127,
    averageRating: 4.8,
  },
  upcomingBookings: [
    {
      id: "BK001",
      customer: "Amelia",
      service: "Bridal Makeup",
      date: "2025-07-05",
      time: "09:00",
      status: "Terkonfirmasi",
    },
    {
      id: "BK002",
      customer: "Rina",
      service: "Party Makeup",
      date: "2025-07-06",
      time: "14:00",
      status: "Terkonfirmasi",
    },
    {
      id: "BK003",
      customer: "Siti",
      service: "Graduation",
      date: "2025-07-08",
      time: "11:00",
      status: "Menunggu",
    },
  ],
  recentReviews: [
    {
      id: "RV001",
      customer: "Bunga",
      rating: 5,
      comment: "Hasilnya luar biasa, sangat rapi dan tahan lama!",
      avatar: "/placeholder.svg",
    },
    {
      id: "RV002",
      customer: "Citra",
      rating: 4,
      comment: "Sangat puas dengan pelayanannya. Ramah dan profesional.",
      avatar: "/placeholder.svg",
    },
  ],
  monthlyRevenue: [
    { month: "Jan", total: 4000000 },
    { month: "Feb", total: 3000000 },
    { month: "Mar", total: 5000000 },
    { month: "Apr", total: 4500000 },
    { month: "May", total: 6000000 },
    { month: "Jun", total: 7500000 },
  ],
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const MUADashboard = () => {
  return (
    <div className="min-h-screen bg-secondary/20 p-4 md:p-8">
      <div className="container mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-heading">
              Selamat Datang, {muaData.name}!
            </h1>
            <p className="text-muted-foreground">
              Berikut ringkasan aktivitas bisnis makeup Anda.
            </p>
          </div>
          <Button className="mt-4 md:mt-0">
            <Edit className="mr-2 h-4 w-4" /> Ubah Profil Publik
          </Button>
        </header>

        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pendapatan (Bulan Ini)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(muaData.stats.earnings)}
              </div>
              <p className="text-xs text-muted-foreground">
                +20.1% dari bulan lalu
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Booking Akan Datang
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                +{muaData.stats.upcomingBookings}
              </div>
              <p className="text-xs text-muted-foreground">
                Dalam 7 hari ke depan
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating Rata-rata</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{muaData.stats.averageRating}</div>
              <p className="text-xs text-muted-foreground">
                Dari {muaData.stats.totalReviews} ulasan
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">152</div>
               <p className="text-xs text-muted-foreground">
                +12 pelanggan baru bulan ini
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content: Upcoming Bookings & Chart */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Booking Akan Datang</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Jadwal</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {muaData.upcomingBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.customer}</TableCell>
                        <TableCell>{booking.service}</TableCell>
                        <TableCell>{booking.date} @ {booking.time}</TableCell>
                        <TableCell>
                          <Badge variant={booking.status === 'Terkonfirmasi' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Grafik Pendapatan</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={muaData.monthlyRevenue}>
                            <XAxis
                                dataKey="month"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${formatCurrency(value as number)}`}
                            />
                             <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                                cursor={{ fill: 'rgba(210, 180, 140, 0.1)' }}
                            />
                            <Bar dataKey="total" fill="#D2B48C" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
          </div>

          {/* Sidebar: Recent Reviews & My Services */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Ulasan Terbaru</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {muaData.recentReviews.map((review) => (
                  <div key={review.id} className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage src={review.avatar} />
                      <AvatarFallback>{review.customer.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{review.customer}</p>
                        <div className="flex items-center text-xs">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          {review.rating}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        "{review.comment}"
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Layanan Saya</span>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded-md hover:bg-secondary/30">
                      <span>Bridal Makeup</span>
                      <span className="font-semibold">{formatCurrency(500000)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-md hover:bg-secondary/30">
                      <span>Party Makeup</span>
                      <span className="font-semibold">{formatCurrency(300000)}</span>
                  </div>
                   <div className="flex justify-between items-center p-2 rounded-md hover:bg-secondary/30">
                      <span>Natural Look</span>
                      <span className="font-semibold">{formatCurrency(200000)}</span>
                  </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MUADashboard;