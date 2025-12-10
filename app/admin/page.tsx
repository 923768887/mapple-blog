import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>后台入口（占位）</CardTitle>
          <CardDescription>
            后续将接入鉴权与文章管理、标签管理、评论审核等功能。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            当前为静态占位页面，用于导航和路由测试。
          </p>
          <Button disabled>进入仪表盘（未开放）</Button>
        </CardContent>
      </Card>
    </div>
  );
}

