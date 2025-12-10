import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-12">
      <header className="flex items-center justify-between border-b pb-6">
        <div>
          <p className="text-sm text-muted-foreground">Shadcn UI / Tailwind v4</p>
          <h1 className="text-2xl font-semibold">组件与主题切换示例</h1>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 rounded-xl border p-4">
          <p className="text-sm font-medium text-muted-foreground">按钮 Button</p>
          <div className="flex flex-wrap gap-3">
            <Button>默认</Button>
            <Button variant="secondary">次要</Button>
            <Button variant="outline">描边</Button>
            <Button variant="ghost">幽灵</Button>
            <Button variant="link">链接</Button>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border p-4">
          <p className="text-sm font-medium text-muted-foreground">输入 Input</p>
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">简介</Label>
            <Textarea id="bio" placeholder="介绍一下自己..." />
          </div>
        </div>

        <div className="space-y-3 rounded-xl border p-4">
          <p className="text-sm font-medium text-muted-foreground">Tabs & Badge</p>
          <Tabs defaultValue="a" className="space-y-3">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="a">概览</TabsTrigger>
              <TabsTrigger value="b">动态</TabsTrigger>
              <TabsTrigger value="c">设置</TabsTrigger>
            </TabsList>
            <TabsContent value="a">
              <div className="flex items-center gap-2">
                <Badge>默认</Badge>
                <Badge variant="secondary">次要</Badge>
                <Badge variant="outline">描边</Badge>
              </div>
            </TabsContent>
            <TabsContent value="b">近期动态...</TabsContent>
            <TabsContent value="c">个性化设置...</TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <Card>
          <CardHeader>
            <CardTitle>Dialog 示例</CardTitle>
            <CardDescription>点击下方按钮打开模态框。</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button>打开 Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>欢迎使用 Shadcn</DialogTitle>
                  <DialogDescription>
                    这里是一个示例对话框。你可以在此放置表单或提示信息。
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Label htmlFor="name">姓名</Label>
                  <Input id="name" placeholder="请输入姓名" />
                </div>
                <CardFooter className="justify-end gap-2 p-0 pt-4">
                  <DialogClose asChild>
                    <Button variant="ghost">取消</Button>
                  </DialogClose>
                  <Button>确认</Button>
                </CardFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>主题切换</CardTitle>
              <CardDescription>明亮 / 黑暗 / 跟随系统</CardDescription>
            </div>
            <ThemeToggle />
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              当前页面已接入 next-themes，使用 class 切换配合 CSS 变量生效。
            </p>
            <div className="rounded-lg border p-3 text-sm">
              试着切换主题，观察按钮、卡片与输入框的样式变化。
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
