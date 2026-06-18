import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DashboardTabs, adminTabs } from "@/components/layout/DashboardTabs";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoader } from "@/components/ui/Spinner";
import { formatDate } from "@/lib/format";
import { adminListUsers, adminUpdateUser } from "@/lib/services";
import type { Role } from "@/types";

export function AdminUsers() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "users", q],
    queryFn: () => adminListUsers({ q: q || undefined }),
  });

  const mutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      adminUpdateUser(id, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  return (
    <div>
      <DashboardTabs title="Admin Dashboard" tabs={adminTabs} />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Input
          className="mb-4 max-w-sm"
          placeholder="Search by name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {mutation.isError && (
          <div className="mb-4">
            <ErrorState message={(mutation.error as Error).message} />
          </div>
        )}

        {isLoading ? (
          <PageLoader />
        ) : isError ? (
          <ErrorState message={(error as Error).message} />
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Joined</th>
                  <th className="p-3 font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.map((u) => (
                  <tr key={u.id}>
                    <td className="p-3 font-medium">{u.name || "—"}</td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                    <td className="p-3">
                      <Select
                        value={u.role}
                        onValueChange={(v) =>
                          mutation.mutate({ id: u.id, role: v as Role })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
                {data?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
