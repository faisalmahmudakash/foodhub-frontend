"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    defaultAddress: "",
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(",")[1];
      setImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  }

  function startEditing() {
    if (!user) return;
    setFormData({
      name: user.name ?? "",
      phone: (user as any).phone ?? "",
      defaultAddress: (user as any).defaultAddress ?? "",
    });
    setImagePreview(null);
    setImageBase64(null);
    setError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setImagePreview(null);
    setImageBase64(null);
    setError("");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleUpdate() {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      // Step 1: Profile fields update
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/${user.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        },
      );

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.message?.error ?? "Update failed");
      }

      // Step 2: Image upload (only if a new image was selected)
      if (imageBase64) {
        const imgRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/profile/${user.id}/image`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ imageBase64 }),
          },
        );

        const imgData = await imgRes.json().catch(() => null);
        if (!imgRes.ok || !imgData?.success) {
          throw new Error(imgData?.message?.error ?? "Image upload failed");
        }
      }

      await refetch();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone.",
    );
    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/${user.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message?.error ?? "Delete failed");
      }

      //signout after Account delete -> redirect to home
      await authClient.signOut();
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">You are not logged in.</p>
      </div>
    );
  }

  const avatarSrc = imagePreview ?? user.image ?? null;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {isEditing ? (
              <label className="relative cursor-pointer group">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={user.name}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-primary"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                    {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil className="h-4 w-4 text-white" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            ) : avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                {user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
            )}

            <div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {!isEditing ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={startEditing}
              aria-label="Edit profile"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={cancelEditing}
              aria-label="Cancel editing"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {!isEditing ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProfileField label="Full Name" value={user.name} />
              <ProfileField label="Email" value={user.email} />
              <ProfileField
                label="Email Verified"
                value={user.emailVerified ? "Yes" : "No"}
              />
              <ProfileField label="Phone" value={(user as any).phone} />
              <ProfileField
                label="Default Address"
                value={(user as any).defaultAddress}
              />
              <ProfileField label="Role" value={(user as any).role} />
              <ProfileField label="Status" value={(user as any).status} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase text-muted-foreground">
                  Full Name
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase text-muted-foreground">
                  Email
                </label>
                <Input value={user.email} disabled />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase text-muted-foreground">
                  Phone
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase text-muted-foreground">
                  Default Address
                </label>
                <Input
                  name="defaultAddress"
                  value={formData.defaultAddress}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button onClick={handleUpdate} disabled={loading}>
                {loading ? "Updating..." : "Save Changes"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}
