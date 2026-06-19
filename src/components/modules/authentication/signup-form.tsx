"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription, 
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

export function SignupForm(props: React.ComponentProps<typeof Card>) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    defaultAddress: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { data, error } = await authClient.signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      defaultAddress: form.defaultAddress,
      image: "https://example.com/image.png",
      callbackURL: `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
    });

    if (error) {
      setError(error.message ?? "Signup failed");
      setLoading(false);
      return;
    }

    console.log(error, data);

    setLoading(false);
    router.push("/auth/login");
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel>Full Name</FieldLabel>
              <Input
                id="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </Field>

            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="m@example.com"
                required
              />
            </Field>

            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <FieldLabel>Confirm Password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <FieldLabel>Phone</FieldLabel>
              <Input
                id="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
              />
            </Field>

            <Field>
              <FieldLabel>Address</FieldLabel>
              <Input
                id="defaultAddress"
                value={form.defaultAddress}
                onChange={handleChange}
                placeholder="Fatullah, Narayanganj"
              />
            </Field>

            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}

            <Field>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <Button variant="outline" type="button" className="w-full mt-2">
                Sign up with Google
              </Button>

              <FieldDescription className="text-center mt-2">
                Already have an account?{" "}
                <Link href="/auth/login" className="underline">
                  Sign in
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
