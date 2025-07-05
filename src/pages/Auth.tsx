import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, role, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "", password: "", confirmPassword: "", fullName: "", phone: "",
    userType: "customer" as "customer" | "mua",
  });

  useEffect(() => {
    if (!authLoading && user) {
      if (role === 'mua') {
        toast({ title: "Berhasil!", description: "Anda masuk sebagai MUA." });
        navigate('/mua/profile');
      } else if (role === 'customer') {
        toast({ title: "Berhasil!", description: "Anda berhasil masuk." });
        navigate('/');
      }
    }
  }, [user, role, authLoading, navigate, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      toast({ title: "Error", description: "Password tidak cocok", variant: "destructive" });
      setLoading(false); return;
    }
    if (registerData.password.length < 6) {
      toast({ title: "Error", description: "Password minimal 6 karakter", variant: "destructive" });
      setLoading(false); return;
    }

    const { error } = await signUp(registerData.email, registerData.password, {
      fullName: registerData.fullName, userType: registerData.userType, phone: registerData.phone,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Pendaftaran Berhasil!",
        description: "Silakan periksa email untuk verifikasi dan masuk ke akun Anda.",
      });
      setActiveTab("login"); 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 flex items-center space-x-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
        </Button>
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary font-heading mb-2">GlamFind</h1>
            <p className="text-muted-foreground">Platform terpercaya untuk layanan makeup artist</p>
        </div>
        <Card>
            <CardHeader className="text-center">
                <CardTitle>Masuk ke Akun Anda</CardTitle>
                <CardDescription>Masuk atau daftar untuk melanjutkan</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Masuk</TabsTrigger>
                        <TabsTrigger value="register">Daftar</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="nama@email.com" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Masukkan password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
                                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}
                                    </Button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading || authLoading}>
                                {loading || authLoading ? "Memproses..." : "Masuk"}
                            </Button>
                        </form>
                    </TabsContent>
                    <TabsContent value="register">
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="userType">Jenis Akun</Label>
                                <RadioGroup value={registerData.userType} onValueChange={(value) => setRegisterData({ ...registerData, userType: value as "customer" | "mua" })} className="flex flex-row space-x-6">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="customer" id="customer" />
                                    <Label htmlFor="customer">Pelanggan</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="mua" id="mua" />
                                    <Label htmlFor="mua">Makeup Artist</Label>
                                </div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nama Lengkap</Label>
                                <Input id="fullName" placeholder="Masukkan nama lengkap" value={registerData.fullName} onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Nomor Telepon</Label>
                                <Input id="phone" placeholder="08123456789" value={registerData.phone} onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="registerEmail">Email</Label>
                                <Input id="registerEmail" type="email" placeholder="nama@email.com" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="registerPassword">Password</Label>
                                <div className="relative">
                                <Input id="registerPassword" type={showPassword ? "text" : "password"} placeholder="Minimal 6 karakter" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} required />
                                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}
                                </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                                <Input id="confirmPassword" type="password" placeholder="Ulangi password" value={registerData.confirmPassword} onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} required />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading || authLoading}>
                                {loading || authLoading ? "Memproses..." : "Daftar"}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
