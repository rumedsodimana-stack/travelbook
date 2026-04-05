import { PlanItem } from '@/types';

/**
 * When the user selects a different option for a PlanItem,
 * recalculate all subsequent items' scheduledAt times.
 */
export function cascadeTimingChange(
  items: PlanItem[],
  changedItemIndex: number,
  newSelectedOptionIndex: number
): PlanItem[] {
  const updated = [...items];
  const changedItem = { ...updated[changedItemIndex], selectedOptionIndex: newSelectedOptionIndex };
  const selectedOption = changedItem.options[newSelectedOptionIndex];
  const newDuration = selectedOption?.duration ?? changedItem.durationMinutes;
  const startMs = new Date(changedItem.scheduledAt).getTime();
  const endMs = startMs + newDuration * 60_000;
  updated[changedItemIndex] = {
    ...changedItem,
    durationMinutes: newDuration,
    endAt: new Date(endMs).toISOString(),
  };
  for (let i = changedItemIndex + 1; i < updated.length; i++) {
    const prev = updated[i - 1];
    const prevEndMs = prev.endAt
      ? new Date(prev.endAt).getTime()
      : new Date(prev.scheduledAt).getTime() + prev.durationMinutes * 60_000;
    const travelMs = (updated[i].travelTimeTo ?? 0) * 60_000;
    const newStartMs = prevEndMs + travelMs;
    const dur = updated[i].durationMinutes;
    updated[i] = {
      ...updated[i],
      scheduledAt: new Date(newStartMs).toISOString(),
      endAt: new Date(newStartMs + dur * 60_000).toISOString(),
    };
  }
  return updated;
}
