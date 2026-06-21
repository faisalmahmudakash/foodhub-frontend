"use client";

import {
  Check,
  ClipboardList,
  ClipboardCheck,
  ChefHat,
  Truck,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { OrderStatus } from "@/types/order.type";

const STEPS: {
  status: OrderStatus;
  label: string;
  icon: typeof Check;
}[] = [
  { status: "PENDING", label: "Order Placed", icon: ClipboardList },
  { status: "CONFIRMED", label: "Order Confirmed", icon: ClipboardCheck },
  { status: "PREPARING", label: "Preparing Your Food", icon: ChefHat },
  { status: "READY", label: "Out For Delivery", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: PackageCheck },
];

export default function OrderTrackStepper({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#fecaca] bg-[#fef2f2] px-6 py-10 text-center">
        <XCircle className="h-12 w-12 text-[#dc2626]" />
        <p className="text-base font-bold text-[#b91c1c]">
          This order has been cancelled
        </p>
        <p className="text-sm text-[#991b1b]">
          If this was a mistake, please contact support.
        </p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#ede5d8] bg-white shadow-md">
      <div className="bg-[#1a1208] px-5 py-3.5">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-white">
          Follow Your Order
        </h2>
      </div>

      <div className="px-6 py-7">
        {STEPS.map((step, i) => {
          const isDone = i <= currentIndex;
          const lineIsDone = i < currentIndex;
          const isLast = i === STEPS.length - 1;
          const Icon = step.icon;

          return (
            <div key={step.status} className="flex gap-4">
              {/* Connector column */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isDone
                      ? "bg-[#16a34a]"
                      : "border-2 border-[#d8dade] bg-white"
                  }`}
                >
                  {isDone && (
                    <Check className="h-5 w-5 text-white" strokeWidth={3} />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`w-[3px] flex-1 transition-colors ${
                      lineIsDone ? "bg-[#16a34a]" : "bg-[#d8dade]"
                    }`}
                    style={{ minHeight: "44px" }}
                  />
                )}
              </div>

              {/* Icon + label */}
              <div
                className={`flex items-center gap-3 ${isLast ? "pb-0" : "pb-9"}`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    isDone
                      ? "bg-[#dcfce7] text-[#16a34a]"
                      : "bg-[#f3f4f6] text-[#9ca3af]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-sm font-bold sm:text-base ${
                    isDone ? "text-[#16a34a]" : "text-[#9ca3af]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
