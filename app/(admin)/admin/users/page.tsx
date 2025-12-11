"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Shield,
  User,
  Loader2,
  Search,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "AUTHOR";
  avatarUrl: string | null;
  createdAt: string;
  postCount: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const { toast } = useToast();

  // 表单状态
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "AUTHOR" as "ADMIN" | "AUTHOR",
  });

  // 加载用户列表
  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const response = await fetch("/api/admin/users");
      if (response.status === 403) {
        setHasPermission(false);
        setIsLoading(false);
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("加载用户失败:", error);
      toast({
        title: "加载失败",
        description: "无法加载用户列表",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // 创建用户
  async function handleCreate() {
    if (!formData.email || !formData.password) {
      toast({
        title: "验证失败",
        description: "请填写邮箱和密码",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: "创建成功", description: "用户已创建" });
        setIsCreateDialogOpen(false);
        resetForm();
        loadUsers();
      } else {
        toast({
          title: "创建失败",
          description: data.error || "无法创建用户",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "创建失败",
        description: "网络错误",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  // 更新用户
  async function handleUpdate() {
    if (!selectedUser) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          password: formData.password || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: "更新成功", description: "用户信息已更新" });
        setIsEditDialogOpen(false);
        resetForm();
        loadUsers();
      } else {
        toast({
          title: "更新失败",
          description: data.error || "无法更新用户",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "更新失败",
        description: "网络错误",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  // 删除用户
  async function handleDelete() {
    if (!selectedUser) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: "删除成功", description: "用户已删除" });
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
        loadUsers();
      } else {
        toast({
          title: "删除失败",
          description: data.error || "无法删除用户",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "删除失败",
        description: "网络错误",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function resetForm() {
    setFormData({
      email: "",
      password: "",
      name: "",
      role: "AUTHOR",
    });
    setSelectedUser(null);
  }

  function openEditDialog(user: UserData) {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "",
      name: user.name || "",
      role: user.role,
    });
    setIsEditDialogOpen(true);
  }

  function openDeleteDialog(user: UserData) {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  }

  // 过滤用户
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 格式化日期
  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
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
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">无访问权限</h2>
        <p className="text-muted-foreground">
          只有超级管理员才能访问用户管理功能
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
            <Users className="h-6 w-6" />
            用户管理
          </h1>
          <p className="text-muted-foreground mt-1">
            管理系统用户和权限
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          添加用户
        </Button>
      </div>

      {/* 搜索和统计 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>用户列表</CardTitle>
              <CardDescription>
                共 {users.length} 个用户，其中 {users.filter(u => u.role === "ADMIN").length} 个管理员
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索用户..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>文章数</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead className="w-[80px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {user.role === "ADMIN" ? (
                          <Shield className="h-5 w-5 text-primary" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{user.name || "未设置"}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role === "ADMIN" ? "超级管理员" : "普通用户"}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.postCount} 篇</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(user)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(user)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-muted-foreground">暂无用户数据</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 创建用户对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加用户</DialogTitle>
            <DialogDescription>创建一个新的系统用户</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱 *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码 *</Label>
              <Input
                id="password"
                type="password"
                placeholder="至少6个字符"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">昵称</Label>
              <Input
                id="name"
                placeholder="用户昵称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">角色</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "ADMIN" | "AUTHOR") =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTHOR">普通用户</SelectItem>
                  <SelectItem value="ADMIN">超级管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑用户对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>修改用户信息和权限</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>邮箱</Label>
              <Input value={formData.email} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">昵称</Label>
              <Input
                id="edit-name"
                placeholder="用户昵称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">新密码</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="留空则不修改"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">角色</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "ADMIN" | "AUTHOR") =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTHOR">普通用户</SelectItem>
                  <SelectItem value="ADMIN">超级管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除用户 &quot;{selectedUser?.name || selectedUser?.email}&quot; 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
