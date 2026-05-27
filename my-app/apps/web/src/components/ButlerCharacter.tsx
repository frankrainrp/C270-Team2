"use client";

// ============================================================
// components/ButlerCharacter.tsx — 管家人物形象
//
// 7 姿势（详细触发条件见 page.tsx butlerPose 派生）：
//   - standing       默认空闲
//   - serving        AI 待核实 (ai-chat pending)
//   - pointout       PDF 完成短暂高亮 / PDF 待核实
//   - thinking       Flash 模式 content 生成中
//   - thinking-hard  Thinking 模式 reasoning 流中
//   - idea           reasoning→content 过渡的 1s 灵感闪现
//   - rare-thinking  早上 7-9 点 6.1% 概率替代 thinking/thinking-hard 的彩蛋姿势
//
// 渲染策略：所有姿势按各自原始 PNG 尺寸 × scale 缩放，叠加在同一容器内，
// bottom-center 对齐让"脚底踩在同一基准线"，opacity 切换实现交叉淡入。
// 容器尺寸 = 三姿势中的最大值，确保 pose 切换时容器不抖动。
//
// 缺资产降级：img onError 时整个 pose 的 src + 尺寸都切到 standing 资产，
// 这样用户尚未提供新 PNG 时代码可跑、视觉自然降级。
// ============================================================

import React, { useState, useEffect, useRef } from "react";

export type ButlerPose =
  | "standing"
  | "serving"
  | "pointout"
  | "thinking"
  | "thinking-hard"
  | "idea"
  | "rare-thinking";

interface PoseMeta {
  src: string;
  /** PNG 原始宽度（已 trim 透明边） */
  w: number;
  /** PNG 原始高度 */
  h: number;
}

// 4 个新姿势的 PNG 尺寸暂用 standing (374×1094) 占位；
// 用户提供真实资产后改这里即可，不需要碰组件逻辑。
const STANDING_W = 374;
const STANDING_H = 1094;

const POSES: Record<ButlerPose, PoseMeta> = {
  standing:        { src: "/assets/butler-standing.png",      w: STANDING_W, h: STANDING_H },
  serving:         { src: "/assets/butler-serving.png",       w: 683,        h: 1003 },
  pointout:        { src: "/assets/butler-pointout.png",      w: 475,        h: 1067 },
  thinking:        { src: "/assets/butler-thinking.png",      w: STANDING_W, h: STANDING_H },
  "thinking-hard": { src: "/assets/butler-thinking-hard.png", w: STANDING_W, h: STANDING_H },
  idea:            { src: "/assets/butler-idea.png",          w: STANDING_W, h: STANDING_H },
  "rare-thinking": { src: "/assets/butler-rare-thinking.png", w: STANDING_W, h: STANDING_H },
};

const MAX_W = Math.max(...Object.values(POSES).map((p) => p.w));
const MAX_H = Math.max(...Object.values(POSES).map((p) => p.h));

interface ButlerCharacterProps {
  pose: ButlerPose;
  /** 统一缩放倍率（基于 PNG 原始尺寸）；默认 0.33（= 0.55 × 0.6 二次缩减） */
  scale?: number;
  /** 是否带阴影 / 渐入动画 */
  withFx?: boolean;
}

export default function ButlerCharacter({
  pose,
  scale = 0.33,
  withFx = true,
}: ButlerCharacterProps) {
  // 已确认 404 的 pose（缺资产时降级到 standing）
  const [errored, setErrored] = useState<Set<ButlerPose>>(new Set());
  const imgRefs = useRef<Partial<Record<ButlerPose, HTMLImageElement>>>({});

  // mount 后主动检查 — onError 在 SSR/browser cache 场景常漏触发
  // （img 已在 hydrate 前完成加载流程, complete=true 后不再 fire onerror）
  useEffect(() => {
    const check = () => {
      let changed = false;
      const next = new Set(errored);
      (Object.keys(POSES) as ButlerPose[]).forEach((p) => {
        if (p === "standing") return;
        const img = imgRefs.current[p];
        if (img?.complete && img.naturalWidth === 0 && !next.has(p)) {
          next.add(p);
          changed = true;
        }
      });
      if (changed) setErrored(next);
    };
    check();
    const t = setTimeout(check, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerW = Math.round(MAX_W * scale);
  const containerH = Math.round(MAX_H * scale);

  return (
    <div
      style={{
        position: "relative",
        width: containerW,
        height: containerH,
        flexShrink: 0,
        pointerEvents: "none",
      }}
    >
      {(Object.keys(POSES) as ButlerPose[]).map((p) => {
        // 缺资产 → fallback 到 standing 的 src + 尺寸（防图像被拉伸）
        const isFallback = errored.has(p) && p !== "standing";
        const meta = isFallback ? POSES.standing : POSES[p];
        const isActive = p === pose;
        const w = Math.round(meta.w * scale);
        const h = Math.round(meta.h * scale);
        return (
          <img
            key={p}
            ref={(el) => { imgRefs.current[p] = el || undefined; }}
            src={meta.src}
            alt={`Butler ${p}`}
            draggable={false}
            onError={() => {
              if (p !== "standing" && !errored.has(p)) {
                setErrored((prev) => {
                  const next = new Set(prev);
                  next.add(p);
                  return next;
                });
              }
            }}
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: w,
              height: h,
              opacity: isActive ? 1 : 0,
              transition: withFx ? "opacity 0.4s ease" : "none",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* 站立平台阴影，让人物视觉上"踏在"画面上 */}
      {withFx && (
        <div
          style={{
            position: "absolute",
            bottom: -6,
            left: "20%",
            right: "20%",
            height: 8,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(27,61,47,0.22), transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
