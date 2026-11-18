import { Mail, Calendar, Briefcase, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import type { ProfileData } from '../api/profile.api';

interface ProfileHeaderProps {
  profile: ProfileData;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <Avatar className="h-24 w-24">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-2xl font-bold">{profile.full_name}</h2>
              {profile.position_name && (
                <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Briefcase className="h-4 w-4" />
                  {profile.position_name}
                  {profile.position_level && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {profile.position_level}
                    </Badge>
                  )}
                </p>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{profile.email}</span>
                {profile.email_verified_at ? (
                  <Badge variant="secondary" className="text-xs">
                    Đã xác thực
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Chưa xác thực
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Tham gia: {formatDate(profile.created_at).split(',')[0]}</span>
              </div>

              {profile.departments.length > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>
                    {profile.departments.map((d) => d.name).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}