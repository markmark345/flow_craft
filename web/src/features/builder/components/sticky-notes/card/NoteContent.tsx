"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  title: string;
  body: string;
  onChangeTitle: (val: string) => void;
  onChangeBody: (val: string) => void;
  onSelect: () => void;
};

export function NoteContent({
  title,
  body,
  onChangeTitle,
  onChangeBody,
  onSelect,
}: Props) {
  return (
    <div className="flex-1 min-h-0 p-5 pt-4 flex flex-col gap-2">
      <Input
        value={title}
        onChange={(e) => onChangeTitle(e.target.value)}
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onFocus={onSelect}
        className="w-full h-auto bg-transparent border-0 border-b border-transparent focus:border-border rounded-none p-0 outline-none text-lg font-bold placeholder:text-muted"
        placeholder="Note title"
      />

      <Textarea
        value={body}
        onChange={(e) => onChangeBody(e.target.value)}
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onFocus={onSelect}
        spellCheck={false}
        className="w-full flex-1 min-h-0 bg-transparent border-0 p-0 resize-none outline-none text-sm leading-6 placeholder:text-muted"
        placeholder="Write something..."
      />
    </div>
  );
}
