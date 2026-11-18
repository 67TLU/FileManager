import { StatsCards } from '../components/stats-cards';
import { RecentActivity } from '../components/recent-activity';
import { QuickActions } from '../components/quick-actions';
import { StorageTrend } from '../components/storage-trend';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Tổng quan về tài nguyên và hoạt động của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - 2/3 width */}
        <div className="md:col-span-2 space-y-6">
          <StorageTrend />
          <RecentActivity />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}