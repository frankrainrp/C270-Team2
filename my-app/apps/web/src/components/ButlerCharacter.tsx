"use client";

// ============================================================
// components/ButlerCharacter.tsx — 管家人物形象
// 3 姿势：standing（默认）/ serving（生成 & 待核实）/ pointout（提取笔记/DDL）
// 白底通过 CSS mix-blend-mode: multiply 透明融入页面（SVG 内是 JPEG 不带 alpha）
// ============================================================

import React from "react";

export type ButlerPose = "standing" | "serving" | "pointout";

const POSE_SRC: Record<ButlerPose, string> = {
  standing: "/assets/butler-standing.png",
  serving: "/assets/butler-serving.png",
  pointout: "/assets/butler-pointout.png",
};

interface ButlerCharacterProps {
  pose: ButlerPose;
  size?: number;
  /** 填满父容器（width/height 100%）+ objectPosition bottom，让人物"踩"在底部 */
  fillContainer?: boolean;
  /** 是否带柔和阴影 / 渐入动画 */
  withFx?: boolean;
}

export default function ButlerCharacter({ pose, size = 220, fillContainer = false, withFx = true }: ButlerCharacterProps) {
  const containerStyle: React.CSSProperties = fillContainer
    ? { width: "100%", height: "100%", position: "relative", flexShrink: 0 }
    : { width: size, height: size, position: "relative", flexShrink: 0 };
  return (
    <div style={containerStyle}>
      {/* 3 个姿势叠在一起，opacity 切换让姿势之间有交叉淡入感 */}
      {(Object.keys(POSE_SRC) as ButlerPose[]).map((p) => {
        const isActive = p === pose;
        return (
          <img
            key={p}
            src={POSE_SRC[p]}
            alt={`Butler ${p}`}
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: fillContainer ? "bottom" : "center",
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
            bottom: -8,
            left: "15%",
            right: "15%",
            height: 10,
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(27,61,47,0.18), transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
