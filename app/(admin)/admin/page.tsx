import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const session = await auth();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      {/* 欢迎卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>欢迎回来</CardTitle>
          <CardDescription>
            {session?.user?.name || session?.user?.email || "管理员"}，您已登录后台管理系统
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 统计卡片占位 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>文章总数</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">统计功能开发中</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>草稿数</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">统计功能开发中</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>已发布</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">统计功能开发中</p>
          </CardContent>
        </Card>
      </div>

      {/* 最近文章占位 */}
      <Card>
        <CardHeader>
          <CardTitle>最近文章</CardTitle>
          <CardDescription>最近发布的 5 篇文章</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            文章列表功能开发中，请稍后访问。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
