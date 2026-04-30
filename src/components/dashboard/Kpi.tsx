import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
} from "recharts";
import { Card } from "../ui/Card";

type Trend = {
  delta: number;
  label: string;
  direction?: "up" | "down" | "flat";
  good?: "up" | "down";
};

type KpiProps = {
  label: string;
  value: string;
  sub?: ReactNode;
  trend?: Trend;
  spark?: { v: number }[];
  accent?: string;
};

export function Kpi({ label, value, sub, trend, spark, accent }: KpiProps) {
  const direction = trend
    ? (trend.direction ??
      (trend.delta > 0 ? "up" : trend.delta < 0 ? "down" : "flat"))
    : undefined;
  const good = trend?.good ?? "up";
  const isGood =
    direction === undefined
      ? false
      : direction === "flat"
        ? true
        : direction === good;
  const Icon =
    direction === "up"
      ? ArrowUpRight
      : direction === "down"
        ? ArrowDownRight
        : Minus;
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-eyebrow">{label}</div>
          <div className="stat-num mt-1">{value}</div>
          {sub && <div className="text-[12px] text-ink-500 mt-1">{sub}</div>}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-0.5 text-[12px] font-semibold rounded-md px-1.5 py-0.5 ${
              isGood
                ? "bg-success-50 text-success-700"
                : "bg-danger-50 text-danger-700"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {Math.abs(trend.delta)}
            {trend.delta % 1 === 0 ? "" : ""}%
          </div>
        )}
      </div>
      {spark && (
        <div className="h-10 -mx-1 mt-2">
          <ResponsiveContainer>
            <AreaChart data={spark}>
              <defs>
                <linearGradient
                  id={`spark-${label.replace(/\s+/g, "-")}`}
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={accent ?? "#0e8a99"}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor={accent ?? "#0e8a99"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <Area
                type="monotone"
                dataKey="v"
                stroke={accent ?? "#0e8a99"}
                strokeWidth={2}
                fill={`url(#spark-${label.replace(/\s+/g, "-")})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {trend && (
        <div className="text-[11px] text-ink-400 mt-1">{trend.label}</div>
      )}
    </Card>
  );
}
