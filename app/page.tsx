import Link from "next/link";
import { FileText, User, Shield, ArrowRight } from "lucide-react";

const features = [
  {
    href: "/apply",
    icon: FileText,
    title: "新規申請",
    description: "調査書・学校推薦書の発行を申請します。",
    color: "text-primary",
    bg: "bg-primary-light",
  },
  {
    href: "/mypage",
    icon: User,
    title: "マイページ",
    description: "申請履歴とステータスを確認できます。",
    color: "text-success",
    bg: "bg-success-light",
  },
  {
    href: "/admin",
    icon: Shield,
    title: "管理画面",
    description: "教員用：申請の管理と発行処理を行います。",
    color: "text-warning",
    bg: "bg-warning-light",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          進路書類申請システム
        </h1>
        <p className="text-gray-500 text-lg">
          調査書・学校推薦書の発行依頼と手数料の確認ができます。
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="space-y-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.href}
              href={feature.href}
              className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group"
            >
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-lg ${feature.bg}`}
              >
                <Icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h2>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </Link>
          );
        })}
      </div>

      {/* Fee Info */}
      <div className="mt-12 p-6 bg-white rounded-xl border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          手数料について
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span>
              <strong>調査書</strong>：今年度の初回申請は1通目が無料、2通目以降は1通200円
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
            <span>
              <strong>学校推薦書</strong>：1通200円
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
