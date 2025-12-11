"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Settings, 
  Globe, 
  Palette, 
  Share2, 
  Search, 
  FileText,
  Save,
  Loader2,
  Check
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { applyThemeColor } from "@/components/theme-color-initializer";

// 表单验证 schema
const settingsSchema = z.object({
  // 基本设置
  siteName: z.string().min(1, "站点名称不能为空"),
  siteDescription: z.string(),
  siteKeywords: z.string(),
  siteAuthor: z.string(),
  siteUrl: z.string().url().or(z.literal("")),
  siteLogo: z.string(),
  siteFavicon: z.string(),
  // 主题颜色
  primaryColor: z.string(),
  // 社交链接
  socialGithub: z.string(),
  socialTwitter: z.string(),
  socialEmail: z.string().email().or(z.literal("")),
  // SEO
  googleAnalyticsId: z.string(),
  // 评论
  enableComments: z.string(),
  // 分页
  postsPerPage: z.string(),
  // 页脚
  footerText: z.string(),
  footerIcp: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;


// 预设主题颜色
const presetColors = [
  { name: "深蓝", value: "#1a1a2e" },
  { name: "靛蓝", value: "#3730a3" },
  { name: "紫色", value: "#7c3aed" },
  { name: "粉色", value: "#db2777" },
  { name: "红色", value: "#dc2626" },
  { name: "橙色", value: "#ea580c" },
  { name: "绿色", value: "#16a34a" },
  { name: "青色", value: "#0891b2" },
  { name: "蓝色", value: "#2563eb" },
  { name: "灰色", value: "#475569" },
];

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: "",
      siteDescription: "",
      siteKeywords: "",
      siteAuthor: "",
      siteUrl: "",
      siteLogo: "",
      siteFavicon: "",
      primaryColor: "#1a1a2e",
      socialGithub: "",
      socialTwitter: "",
      socialEmail: "",
      googleAnalyticsId: "",
      enableComments: "false",
      postsPerPage: "10",
      footerText: "",
      footerIcp: "",
    },
  });

  // 加载设置 - 只在组件挂载时执行一次
  useEffect(() => {
    let isMounted = true;
    
    async function checkPermissionAndLoadSettings() {
      try {
        // 先检查用户权限
        const meResponse = await fetch("/api/auth/me");
        const meData = await meResponse.json();
        
        if (!meData.user || meData.user.role !== "ADMIN") {
          if (isMounted) {
            setHasPermission(false);
            setIsLoading(false);
          }
          return;
        }

        // 加载设置
        const response = await fetch("/api/settings");
        if (response.ok && isMounted) {
          const data = await response.json();
          form.reset(data);
        }
      } catch (error) {
        console.error("加载设置失败:", error);
        if (isMounted) {
          toast({
            title: "加载失败",
            description: "无法加载站点设置",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    checkPermissionAndLoadSettings();
    
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 保存设置
  async function onSubmit(data: SettingsFormValues) {
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "保存成功",
          description: "站点设置已更新",
        });
        // 应用主题颜色
        applyThemeColor(data.primaryColor);
      } else {
        throw new Error("保存失败");
      }
    } catch (error) {
      console.error("保存设置失败:", error);
      toast({
        title: "保存失败",
        description: "无法保存站点设置",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 无权限提示
  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Settings className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">无访问权限</h2>
        <p className="text-muted-foreground">
          只有超级管理员才能访问站点设置
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            站点设置
          </h1>
          <p className="text-muted-foreground mt-1">
            管理您的博客站点配置
          </p>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          保存设置
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">基本设置</span>
              </TabsTrigger>
              <TabsTrigger value="theme" className="gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">主题颜色</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="gap-2">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">社交链接</span>
              </TabsTrigger>
              <TabsTrigger value="seo" className="gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">SEO 设置</span>
              </TabsTrigger>
              <TabsTrigger value="other" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">其他设置</span>
              </TabsTrigger>
            </TabsList>

            {/* 基本设置 */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                  <CardDescription>
                    设置站点的基本信息，这些信息将显示在网站各处
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>站点名称</FormLabel>
                        <FormControl>
                          <Input placeholder="My Blog" {...field} />
                        </FormControl>
                        <FormDescription>
                          显示在浏览器标签和网站头部
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="siteDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>站点描述</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="一个简洁优雅的博客" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          用于 SEO 和社交分享
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="siteKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>关键词</FormLabel>
                        <FormControl>
                          <Input placeholder="博客,技术,编程" {...field} />
                        </FormControl>
                        <FormDescription>
                          多个关键词用逗号分隔
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="siteAuthor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>作者名称</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="siteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>站点 URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          完整的站点地址，用于生成 RSS 和 Sitemap
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>


            {/* 主题颜色 */}
            <TabsContent value="theme">
              <Card>
                <CardHeader>
                  <CardTitle>主题颜色</CardTitle>
                  <CardDescription>
                    自定义站点的主题颜色，影响按钮、链接等元素
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>主色调</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {/* 预设颜色 */}
                            <div className="grid grid-cols-5 gap-3">
                              {presetColors.map((color) => (
                                <button
                                  key={color.value}
                                  type="button"
                                  onClick={() => field.onChange(color.value)}
                                  className={`
                                    relative h-12 rounded-lg border-2 transition-all
                                    ${field.value === color.value 
                                      ? "border-foreground ring-2 ring-offset-2 ring-foreground" 
                                      : "border-transparent hover:border-muted-foreground/50"
                                    }
                                  `}
                                  style={{ backgroundColor: color.value }}
                                  title={color.name}
                                >
                                  {field.value === color.value && (
                                    <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
                                  )}
                                </button>
                              ))}
                            </div>
                            
                            {/* 自定义颜色输入 */}
                            <div className="flex items-center gap-4">
                              <div 
                                className="h-12 w-12 rounded-lg border shadow-sm"
                                style={{ backgroundColor: field.value || "#1a1a2e" }}
                              />
                              <Input
                                type="text"
                                placeholder="#1a1a2e"
                                value={field.value || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  // 只有当值是有效的颜色格式时才更新
                                  if (val === "" || /^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                                    field.onChange(val);
                                  }
                                }}
                                className="w-32 font-mono"
                              />
                              <Input
                                type="color"
                                value={field.value && field.value.match(/^#[0-9A-Fa-f]{6}$/) ? field.value : "#1a1a2e"}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="w-12 h-10 p-1 cursor-pointer"
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          选择预设颜色或输入自定义颜色值
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 颜色预览 */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <h4 className="font-medium">预览效果</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        type="button"
                        style={{ backgroundColor: form.watch("primaryColor") || "#1a1a2e" }}
                      >
                        主要按钮
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        style={{ 
                          borderColor: form.watch("primaryColor") || "#1a1a2e",
                          color: form.watch("primaryColor") || "#1a1a2e"
                        }}
                      >
                        边框按钮
                      </Button>
                      <span 
                        className="inline-flex items-center"
                        style={{ color: form.watch("primaryColor") || "#1a1a2e" }}
                      >
                        链接文字
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 社交链接 */}
            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle>社交链接</CardTitle>
                  <CardDescription>
                    添加您的社交媒体链接，将显示在网站页脚
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="socialGithub"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialTwitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>微信</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮箱</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>


            {/* SEO 设置 */}
            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle>SEO 设置</CardTitle>
                  <CardDescription>
                    配置搜索引擎优化和分析工具
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="googleAnalyticsId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Baidu Analytics ID</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>
                        <FormDescription>
                          用于网站流量分析
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 其他设置 */}
            <TabsContent value="other">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>功能设置</CardTitle>
                    <CardDescription>
                      启用或禁用站点功能
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="enableComments"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              启用评论
                            </FormLabel>
                            <FormDescription>
                              允许访客在文章下方发表评论
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value === "true"}
                              onCheckedChange={(checked) => 
                                field.onChange(checked ? "true" : "false")
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postsPerPage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>每页文章数</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="50"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            首页和列表页每页显示的文章数量
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>页脚设置</CardTitle>
                    <CardDescription>
                      自定义网站页脚显示的内容
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="footerText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>版权信息</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="© 2024 My Blog. All rights reserved." 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="footerIcp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ICP 备案号</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="京ICP备XXXXXXXX号" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            中国大陆网站需要填写
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
