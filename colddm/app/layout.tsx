import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClientProviders } from "./ClientProviders";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "ColdDM.ai",
	description: "Cold outreach MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<ClientProviders>
					<div className="flex h-screen w-full">
						<Sidebar />
						<div className="flex-1 flex flex-col">
							<Topbar />
							<main className="flex-1 overflow-y-auto p-6">{children}</main>
						</div>
					</div>
				</ClientProviders>
			</body>
		</html>
	);
} 