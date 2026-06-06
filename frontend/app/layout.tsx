import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "../public/assets/style/globals.scss";
import DemoNav from "./components/layout/DemoNav";

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
          <DemoNav />
          {children}
        </AntdRegistry>
      </body>
    </html>
  );
}
