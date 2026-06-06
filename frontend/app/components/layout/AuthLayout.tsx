import ClientOnly from "../common/ClientOnly";

interface AuthLayoutProps {
  pageLabel: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthLayout({ pageLabel, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__bar">Authentication — {pageLabel}</div>

      <div className="auth-layout__main">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
              <div className="auth-layout__card">
                <div className="auth-layout__brand">
                  <div className="auth-layout__brand-title">
                    <i className="fas fa-bell" />
                    NotifyHub
                  </div>
                  <div className="auth-layout__brand-sub">{subtitle}</div>
                </div>

                <ClientOnly>{children}</ClientOnly>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
