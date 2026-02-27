"use client";

import { Handle, Position } from "reactflow";
import type { RefObject } from "react";

interface NodeHandlesProps {
  hasMainInput: boolean;
  isIf: boolean;
  accentColor: string;
  handleOutsideX: number;
  labelOutsideX: number;
  ifTrueTop: string;
  ifFalseTop: string;
  inputHandleClass: string;
  outputHandleClass: string;
  pickerRef: RefObject<HTMLDivElement | null>;
  onHandleClick: (sourceHandle?: string) => void;
  isErrorBranchEnabled?: boolean;
}

export function NodeHandles({
  hasMainInput,
  isIf,
  accentColor,
  handleOutsideX,
  labelOutsideX,
  ifTrueTop,
  ifFalseTop,
  inputHandleClass,
  outputHandleClass,
  pickerRef,
  onHandleClick,
  isErrorBranchEnabled,
}: NodeHandlesProps) {
  return (
    <>
      {hasMainInput && (
        <Handle
          type="target"
          position={Position.Left}
          className={inputHandleClass}
          style={{
            background: "var(--panel)",
            borderColor: "color-mix(in srgb, var(--border) 60%, transparent)",
            left: -handleOutsideX,
            top: "50%",
            transform: "translate(0, -50%)",
          }}
        />
      )}

      <div ref={pickerRef}>
        {isErrorBranchEnabled ? (
          <>
             <Handle
              id="default"
              type="source"
              position={Position.Right}
              className={outputHandleClass}
              style={{
                background: "var(--panel)",
                borderColor: accentColor,
                top: ifTrueTop,
                right: -handleOutsideX,
                transform: "translate(0, -50%)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onHandleClick(undefined);
              }}
              title="Success path"
            />
            <Handle
              id="error"
              type="source"
              position={Position.Right}
              className={outputHandleClass}
              style={{
                background: "var(--panel)",
                borderColor: "var(--error)",
                top: ifFalseTop,
                right: -handleOutsideX,
                transform: "translate(0, -50%)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onHandleClick("error");
              }}
              title="Error path"
            />
            <div
              className="absolute text-[10px] text-muted select-none -translate-y-1/2"
              style={{ top: ifTrueTop, left: `calc(100% + ${labelOutsideX}px)` }}
            >
              success
            </div>
            <div
              className="absolute text-[10px] text-error select-none -translate-y-1/2"
              style={{ top: ifFalseTop, left: `calc(100% + ${labelOutsideX}px)` }}
            >
              error
            </div>
          </>
        ) : isIf ? (
          <>
            <Handle
              id="true"
              type="source"
              position={Position.Right}
              className={outputHandleClass}
              style={{
                background: "var(--panel)",
                borderColor: accentColor,
                top: ifTrueTop,
                right: -handleOutsideX,
                transform: "translate(0, -50%)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onHandleClick("true");
              }}
              title="Add / connect (true)"
            />
            <Handle
              id="false"
              type="source"
              position={Position.Right}
              className={outputHandleClass}
              style={{
                background: "var(--panel)",
                borderColor: "var(--muted)",
                top: ifFalseTop,
                right: -handleOutsideX,
                transform: "translate(0, -50%)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onHandleClick("false");
              }}
              title="Add / connect (false)"
            />
            <div
              className="absolute text-[10px] text-muted select-none -translate-y-1/2"
              style={{ top: ifTrueTop, left: `calc(100% + ${labelOutsideX}px)` }}
            >
              true
            </div>
            <div
              className="absolute text-[10px] text-muted select-none -translate-y-1/2"
              style={{ top: ifFalseTop, left: `calc(100% + ${labelOutsideX}px)` }}
            >
              false
            </div>
          </>
        ) : (
          <Handle
            type="source"
            position={Position.Right}
            className={outputHandleClass}
            style={{
              background: "var(--panel)",
              borderColor: accentColor,
              right: -handleOutsideX,
              top: "50%",
              transform: "translate(0, -50%)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onHandleClick(undefined);
            }}
            title="Add / connect"
          />
        )}
      </div>
    </>
  );
}
