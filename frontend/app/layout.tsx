import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import antdTheme from "./config/theme";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "../public/assets/style/globals.scss";
import ToastProvider from "./components/common/ToastProvider";
import DemoNav from "./components/layout/DemoNav";
import SessionWrapper from "./components/common/SessionWrapper";

export const metadata: Metadata = {
  title: "NotifyHub",
  description: "Real-time notification platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AntdRegistry>
          <ConfigProvider theme={antdTheme}>
            <SessionWrapper>
              <DemoNav />
              {children}
              <ToastProvider />
            </SessionWrapper>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
