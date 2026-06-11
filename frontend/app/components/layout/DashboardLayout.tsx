import Navbar from './Navbar';
import Sidebar from './Sidebar';

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
