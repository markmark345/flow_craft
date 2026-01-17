"use client";

import { BuilderNodeType } from "../../types";
import { cn } from "@/lib/cn";
import * as AiIcons from "./icons/AiIcons";
import * as AppIcons from "./icons/AppIcons";
import * as LogicIcons from "./icons/LogicIcons";

export function NodeIcon({
  nodeType,
  className,
}: {
  nodeType: BuilderNodeType | string;
  className?: string;
}) {
  switch (nodeType) {
    case "openai":
    case "openaiChatModel":
      return <AiIcons.OpenAI className={className} />;
    case "gemini":
    case "geminiChatModel":
      return <AiIcons.Gemini className={className} />;
    case "grok":
    case "grokChatModel":
      return <AiIcons.Grok className={className} />;
    case "aiAgent":
      return <AiIcons.AgentIcon className={className} />;
    
    case "slack":
      return <AppIcons.Slack className={className} />;
    case "gmail":
      return <AppIcons.Gmail className={className} />;
    case "gsheets":
    case "googleSheets":
      return <AppIcons.GoogleSheets className={className} />;
    case "github":
      return <AppIcons.Github className={className} />;
    case "bannerbear":
    case "bananabear":
      return <AppIcons.Bannerbear className={className} />;
    
    case "httpTrigger":
    case "webhook":
    case "httpRequest":
      return <LogicIcons.HttpTrigger className={className} />;
    case "app":
      return <LogicIcons.AppIcon className={className} />;
    case "database":
      return <LogicIcons.Database className={className} />;
    case "cron":
    case "delay":
      return <LogicIcons.Cron className={className} />;
    case "errorTrigger":
      return <LogicIcons.ErrorTrigger className={className} />;
    case "transform":
      return <LogicIcons.Transform className={className} />;
    case "merge":
      return <LogicIcons.Merge className={className} />;
    case "chatModel":
      return <LogicIcons.ChatModel className={className} />;
    case "if":
    case "switch":
      return <LogicIcons.IfIcon className={className} />;
    
    default:
      return (
        <svg className={cn("h-4 w-4", className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 7h10v10H7z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
