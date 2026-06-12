import Navbar from './Navbar';
import Sidebar from './Sidebar';
import SSEProvider from '../common/SSEProvider';

interface DashboardLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
  userName?: string;
  userInitials?: string;
}

export default function DashboardLayout({
  children,
  isAdmin = false,
  userName,
  userInitials,
}: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      {/* Opens the SSE stream for regular users — renders nothing visible */}
      <SSEProvider />
      <Navbar
        isAdmin={isAdmin}
        userName={userName}
        userInitials={userInitials}
      />
      <div className="dashboard-layout__body">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
