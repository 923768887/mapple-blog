import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-10">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>登录</CardTitle>
          <CardDescription>使用邮箱与密码登录后台。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full">登录</Button>
          <p className="text-center text-xs text-muted-foreground">
            暂未接入认证，后续将使用 NextAuth。
          </p>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        没有账号？<Link href="/about" className="text-primary">了解更多</Link>
      </p>
    </div>
  );
}

