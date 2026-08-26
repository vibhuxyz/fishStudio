import { useEffect, useState } from "react";
import { InteractionManager } from "react-native";

// Reveals a screen in stages instead of mounting everything on first render.
//
// A screen like the home tab fires five requests and renders a hundred cards
// the moment it mounts, so the first frame waits on all of it. This walks a
// counter up from 0, one step at a time, letting a screen gate its heavier
// sections (and their queries) behind a stage number. Each step waits for
// InteractionManager first, so a step never lands mid-scroll or mid-animation.
export function useProgressiveRender(totalStages: number, stepMs = 120) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage >= totalStages) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const interaction = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => setStage((current) => current + 1), stepMs);
    });

    return () => {
      interaction.cancel();
      if (timer) clearTimeout(timer);
    };
  }, [stage, totalStages, stepMs]);

  return stage;
}
