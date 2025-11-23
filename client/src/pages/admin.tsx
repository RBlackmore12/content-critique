import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, Copy, CheckCircle, XCircle } from "lucide-react";

interface User {
  id: number;
  email: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Redirect if not admin
  if (user && !user.isAdmin) {
    setLocation("/");
    return null;
  }

  // Fetch all users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiRequest<{ users: User[] }>("/api/auth/admin/users"),
  });

  // Generate invite code
  const generateInviteMutation = useMutation({
    mutationFn: () =>
      apiRequest<{ inviteCode: string; inviteUrl: string }>("/api/auth/admin/invite", {
        method: "POST",
      }),
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.inviteUrl);
      setCopiedCode(data.inviteCode);
      toast({
        title: "Invite Code Generated!",
        description: "The invite URL has been copied to your clipboard.",
      });
      setTimeout(() => setCopiedCode(null), 3000);
    },
  });

  // Deactivate user
  const deactivateMutation = useMutation({
    mutationFn: (userId: number) =>
      apiRequest(`/api/auth/admin/users/${userId}/deactivate`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "User Deactivated",
        description: "The user no longer has access.",
      });
    },
  });

  // Activate user
  const activateMutation = useMutation({
    mutationFn: (userId: number) =>
      apiRequest(`/api/auth/admin/users/${userId}/activate`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "User Activated",
        description: "The user now has access.",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600">
              Manage users and generate invite codes
            </p>
          </div>
          <Button onClick={() => setLocation("/")}>
            Back to Dashboard
          </Button>
        </div>

        {/* Generate Invite Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Generate Invite Code</h2>
          <p className="text-gray-600 mb-4">
            Create a new invite code for a Messaging Lab member
          </p>
          <Button
            onClick={() => generateInviteMutation.mutate()}
            disabled={generateInviteMutation.isPending}
          >
            {generateInviteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>Generate New Invite Code</>
            )}
          </Button>

          {copiedCode && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <Copy className="h-5 w-5" />
                <span className="font-mono">{copiedCode}</span>
              </div>
              <p className="text-sm text-green-700 mt-2">
                Invite URL copied to clipboard! Send this to your new member.
              </p>
            </div>
          )}
        </Card>

        {/* Users List */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">All Users</h2>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Joined</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData?.users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{u.email}</td>
                      <td className="py-3 px-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <XCircle className="h-4 w-4" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {u.isAdmin ? (
                          <span className="text-purple-600 font-semibold">Admin</span>
                        ) : (
                          "Member"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!u.isAdmin && (
                          <>
                            {u.isActive ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deactivateMutation.mutate(u.id)}
                                disabled={deactivateMutation.isPending}
                              >
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => activateMutation.mutate(u.id)}
                                disabled={activateMutation.isPending}
                              >
                                Activate
                              </Button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {usersData?.users.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No users yet. Generate an invite code to get started!
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
