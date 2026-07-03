"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { useToast } from "@/components/Toast";
import type { DdlItem, RecurringTask } from "@/lib/types";
import {
  bulkPutRecurring,
  getAllRecurring,
  materializeDue,
  putRecurring,
} from "@/lib/recurring";

interface UseRecurringTasksArgs {
  setDdls: Dispatch<SetStateAction<DdlItem[]>>;
}

export function useRecurringTasks({ setDdls }: UseRecurringTasksArgs) {
  const toast = useToast();
  const [recurringOpen, setRecurringOpen] = useState(false);

  const runMaterialize = useCallback(async () => {
    try {
      const routines = await getAllRecurring();
      if (routines.length === 0) return;

      const { newTasks, updatedRoutines, changed } = materializeDue(routines);
      if (newTasks.length > 0) {
        setDdls((prev) => [...prev, ...newTasks]);
        toast.info(`Generated ${newTasks.length} recurring task instance(s)`);
      }
      if (changed) await bulkPutRecurring(updatedRoutines);
    } catch (e) {
      console.warn("[recurring] materialize failed", e);
    }
  }, [setDdls, toast]);

  const addRecurring = useCallback((routine: RecurringTask) => {
    void (async () => {
      try {
        await putRecurring(routine);
        await runMaterialize();
      } catch (e) {
        console.warn("[recurring] add failed", e);
      }
    })();
  }, [runMaterialize]);

  return {
    recurringOpen,
    setRecurringOpen,
    runMaterialize,
    addRecurring,
  };
}
