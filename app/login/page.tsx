"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 登录表单组件
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("开始登录...", { email, callbackUrl });
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("登录结果:", result);

      if (result?.error) {
        console.error("登录错误:", result.error);
        setError("邮箱或密码错误，请重试");
        setIsLoading(false);
      } else if (result?.ok) {
        console.log("登录成功，跳转到:", callbackUrl);
        // 使用 router 跳转，保留控制台日志
        router.push(callbackUrl);
        router.refresh();
      } else {
        console.error("未知登录状态:", result);
        setError("登录状态异常，请重试");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("登录异常:", err);
      setError("登录失败，请稍后重试");
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-10">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>登录</CardTitle>
          <CardDescription>使用邮箱与密码登录后台。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                "登录"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        没有账号？<Link href="/about" className="text-primary">了解更多</Link>
      </p>
    </div>
  );
}

// 加载状态组件
function LoginLoading() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-10">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>登录</CardTitle>
          <CardDescription>使用邮箱与密码登录后台。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>邮箱</Label>
            <Input disabled placeholder="加载中..." />
          </div>
          <div className="space-y-2">
            <Label>密码</Label>
            <Input disabled placeholder="加载中..." />
          </div>
          <Button className="w-full" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            加载中...
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// 主页面组件，使用 Suspense 包裹
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
