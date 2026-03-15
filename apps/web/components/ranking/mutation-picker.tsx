"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAsyncAction } from "@/hooks/use-async-action";
import * as api from "@/lib/api";
import type { MutationType, Script } from "@ugc/shared";

const mutationTypes: MutationType[] = [
  "AGGRESSIVE",
  "UGC",
  "PREMIUM",
  "SHORTER",
  "FACE_CAM",
  "TIKTOK_NATIVE",
];

interface MutationPickerProps {
  scriptId: string;
}

export function MutationPicker({ scriptId }: MutationPickerProps) {
  const { loading, execute } = useAsyncAction<Script>();

  const handleSelect = async (value: string) => {
    await execute(() => api.mutateScript(scriptId, value as MutationType));
  };

  return (
    <Select onValueChange={handleSelect} disabled={loading}>
      <SelectTrigger className="h-8 w-[140px]">
        <SelectValue placeholder={loading ? "Mutating..." : "Mutate"} />
      </SelectTrigger>
      <SelectContent>
        {mutationTypes.map((type) => (
          <SelectItem key={type} value={type}>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
