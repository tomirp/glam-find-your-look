// src/components/MUAProfile/ProfileHeader.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Star, MapPin, Phone, Upload } from "lucide-react";
import { MUAProfile, UserProfile } from "./types";
import { ChangeEvent } from "react";
import { UploadProgress } from "@/components/ui/upload-progress";

interface ProfileHeaderProps {
  muaProfile: MUAProfile | null;
  userProfile: UserProfile | null;
  onAvatarUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  avatarUploading?: boolean;
  avatarProgress?: number;
}

export const ProfileHeader = ({ muaProfile, userProfile, onAvatarUpload, avatarUploading, avatarProgress }: ProfileHeaderProps) => {
  return (
    <Card className="mb-8 overflow-hidden border-0 shadow-xl bg-gradient-to-r from-purple-600 to-pink-600">
      <CardContent className="p-4 sm:p-6 text-white">
        <div className="flex items-center gap-4">
          {/* Avatar Section */}
          <div className="relative group flex-shrink-0">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-lg">
              <AvatarImage src={userProfile?.avatar_url || ''} />
              <AvatarFallback className="bg-white text-purple-600 text-2xl font-bold">
                {userProfile?.full_name?.charAt(0) || <User className="h-12 w-12" />}
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

          {/* Info Section */}
          <div className="flex-1 space-y-1 min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold truncate">{muaProfile?.business_name || userProfile?.full_name}</h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{muaProfile?.location_city}</span>
            </div>
            {userProfile?.phone && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{userProfile.phone}</span>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="hidden sm:flex flex-row gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{muaProfile?.total_bookings || 0}</div>
              <div className="text-xs text-white/80">Total Booking</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">{muaProfile?.rating?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="text-xs text-white/80">Rating</div>
            </div>
          </div>
        </div>
        
        {(avatarUploading || avatarProgress) && (
          <div className="mt-4">
            <UploadProgress 
              uploading={avatarUploading || false} 
              progress={avatarProgress || 0} 
              error={null}
              filename="Avatar"
              className="text-white"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};