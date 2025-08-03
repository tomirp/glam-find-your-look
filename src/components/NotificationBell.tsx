// src/components/NotificationBell.tsx

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';

type Notification = Database['public']['Tables']['notifications']['Row'];

const NotificationBell = () => {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel('realtime-notifications')
      .on<Notification>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id);

      if (!error) {
        setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      }
    }
    
    // Jika notifikasi memiliki link spesifik, gunakan link tersebut.
    // Jika tidak, arahkan ke halaman default berdasarkan peran.
    if (notification.link) {
      navigate(notification.link);
    } else if (role === 'mua') {
      navigate('/mua/dashboard');
    } else {
      navigate('/activity');
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 font-semibold border-b">Notifikasi</div>
        <div className="flex flex-col max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 border-b cursor-pointer hover:bg-muted ${!notification.is_read ? 'bg-blue-50' : 'bg-white'}`}
              >
                {/* --- PERBAIKAN DI SINI --- */}
                {/* Menggunakan 'message' sebagai teks utama notifikasi */}
                <p className="font-medium text-sm">{notification.message}</p>
                {/* ------------------------- */}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.created_at).toLocaleString('id-ID')}
                </p>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Tidak ada notifikasi baru.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;