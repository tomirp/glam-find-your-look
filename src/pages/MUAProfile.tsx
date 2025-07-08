
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Import komponen UI yang dibutuhkan
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";

// Import komponen dan hooks yang telah direfactor
import { useMUAProfileData } from "@/hooks/useMUAProfileData";
import { ProfileHeader } from "@/components/MUAProfile/ProfileHeader";
import { DashboardTab } from "@/components/MUAProfile/DashboardTab";
import { ServicesPortfolioTab } from "@/components/MUAProfile/ServicesPortfolioTab";
import { EditProfileTab } from "@/components/MUAProfile/EditProfileTab";
import { ScheduleTab } from "@/components/MUAProfile/ScheduleTab";

const MUAProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    muaProfile,
    userProfile,
    bookings,
    services,
    unavailableDates,
    setUnavailableDates,
    pageLoading,
    authLoading,
    editForm,
    setEditForm,
    fetchAllData,
    handlePortfolioUpload,
    handleAvatarUpload,
    handleProfileUpdate
  } = useMUAProfileData();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: "Gagal Keluar", description: error.message, variant: "destructive" });
    }
  };

  if (pageLoading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div><p className="text-gray-600">Memuat Profil...</p></div></div>;
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")} className="hover:bg-purple-50">
              <ArrowLeft className="h-4 w-4 mr-2" />Kembali ke Beranda
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="border-purple-200 hover:bg-purple-50">
              Keluar
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <ProfileHeader 
          muaProfile={muaProfile}
          userProfile={userProfile}
          onAvatarUpload={handleAvatarUpload}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-1">
            <TabsList className="grid w-full grid-cols-4 bg-transparent">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="layanan" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                Layanan & Portfolio
              </TabsTrigger>
              <TabsTrigger value="edit_profil" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                Edit Profil
              </TabsTrigger>
              <TabsTrigger value="jadwal" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                Jadwal
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="dashboard" className="space-y-6">
            <DashboardTab bookings={bookings} services={services} />
          </TabsContent>

          <TabsContent value="layanan" className="space-y-6">
            <ServicesPortfolioTab 
              muaProfile={muaProfile}
              services={services}
              onPortfolioUpload={handlePortfolioUpload}
              onServiceAdded={fetchAllData}
            />
          </TabsContent>

          <TabsContent value="edit_profil">
            <EditProfileTab 
              editForm={editForm}
              setEditForm={setEditForm}
              onSubmit={handleProfileUpdate}
            />
          </TabsContent>
          
          <TabsContent value="jadwal">
            <ScheduleTab 
              unavailableDates={unavailableDates}
              setUnavailableDates={setUnavailableDates}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MUAProfile;
