// src/components/MUAProfile/ProfileHeader.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Star, MapPin, Phone, Upload } from "lucide-react";
import { MUAProfile, UserProfile } from "./types";
import { ChangeEvent } from "react";

interface ProfileHeaderProps {
  muaProfile: MUAProfile | null;
  userProfile: UserProfile | null;
  onAvatarUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader = ({ muaProfile, userProfile, onAvatarUpload }: ProfileHeaderProps) => {
  return (
    <Card className="mb-8 overflow-hidden border-0 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600">
      {/* PERUBAHAN: Penyesuaian padding dan layout untuk mobile */}
      <CardContent className="p-4 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative group">
            {/* Ukuran Avatar dikecilkan di mobile */}
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-lg">
              <AvatarImage src={userProfile?.avatar_url || ''} />
              <AvatarFallback className="bg-white text-purple-600 text-xl sm:text-2xl font-bold">
                {userProfile?.full_name?.charAt(0) || <User className="h-10 w-10 sm:h-12 sm:w-12" />}
              </AvatarFallback>
            </Avatar>
            <Label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
              <Upload className="h-6 w-6 text-white" />
            </Label>
            <Input
              id="avatar-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={onAvatarUpload}
            />
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            {/* Ukuran font dikecilkan di mobile */}
            <h1 className="text-2xl sm:text-3xl font-bold">{muaProfile?.business_name || userProfile?.full_name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center sm:justify-start text-white/90">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <MapPin className="h-4 w-4" />
                <span>{muaProfile?.location_city}</span>
              </div>
              {userProfile?.phone && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Phone className="h-4 w-4" />
                  <span>{userProfile.phone}</span>
                </div>
              )}
            </div>
            {userProfile?.bio && (
              <p className="text-white/90 text-sm max-w-2xl hidden sm:block">{userProfile.bio}</p>
            )}
          </div>

          <div className="flex flex-row gap-4 mt-4 sm:mt-0">
            {/* Ukuran box statistik dikecilkan di mobile */}
            <div className="text-center bg-white/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold">{muaProfile?.total_bookings || 0}</div>
              <div className="text-xs sm:text-sm text-white/80">Total Booking</div>
            </div>
            <div className="text-center bg-white/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl sm:text-2xl font-bold">{muaProfile?.rating?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="text-xs sm:text-sm text-white/80">Rating</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};