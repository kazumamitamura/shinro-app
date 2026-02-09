"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  User,
  Shield,
  GraduationCap,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";
import { getCurrentUser, logoutUser } from "@/app/actions/auth";

const navItems = [
  { href: "/apply", label: "新規申請", icon: FileText, auth: true },
  { href: "/mypage", label: "マイページ", icon: User, auth: true },
  { href: "/admin", label: "管理画面", icon: Shield, auth: false },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      setIsLoggedIn(!!user);
    });
  }, [pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch {
      // redirect throws, which is expected
    }
    setIsLoggedIn(false);
    setLoggingOut(false);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-primary font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <GraduationCap className="w-6 h-6" />
            <span className="hidden sm:inline">進路書類申請</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {/* メインナビ */}
            {navItems.map((item) => {
              // 認証が必要なリンクは、ログイン時のみ表示
              if (item.auth && !isLoggedIn) return null;

              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-primary-light text-primary"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* 認証リンク */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">ログアウト</span>
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === "/login"
                      ? "bg-primary-light text-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">ログイン</span>
                </Link>
                <Link
                  href="/register"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === "/register"
                      ? "bg-primary-light text-primary"
                      : "text-primary bg-primary-light hover:bg-primary/15"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">新規登録</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
