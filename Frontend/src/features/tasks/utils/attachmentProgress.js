/**
 * Attachment Upload Smooth Progress Tracker
 *
 * Implements a file-size-based progress animation loop that:
 * 1. Dynamically steps at 25ms intervals based on file.size.
 * 2. Smoothly increments up to a 90% soft ceiling while in-flight,
 *    gradually decelerating between 70% and 90% to avoid sudden freezes.
 * 3. Rapidly sweeps from the current progress (e.g., 65% or 88%) all the way
 *    to 100% when the upload promise resolves with fileId and url.
 * 4. Supports clean abortion on user cancel ('X' click) or component unmount.
 */

/**
 * Calculates dynamic base step percentage per 25ms tick based on file size.
 * Smaller files (<256KB) step faster (~2.0% per tick, reaching ~70% in ~875ms).
 * Medium files (256KB - 1MB) step at ~1.5% per tick.
 * Large files (>1MB) step at ~1.0% per tick, following actual network chunk speed.
 *
 * @param {number} fileSize - File size in bytes
 * @returns {number} Step increment per 25ms tick
 */
export const calculateDynamicStep = (fileSize = 0) => {
  if (fileSize > 1024 * 1024) return 1.0;
  if (fileSize > 256 * 1024) return 1.5;
  return 2.0;
};

/**
 * Factory that starts an active 25ms animation loop for an uploading file.
 *
 * @param {object} options
 * @param {number} [options.fileSize=0] - File size in bytes
 * @param {function} options.onTick - Callback receiving the integer display percentage (0..100)
 * @param {function} [options.onComplete] - Callback fired once 100% is reached after resolution
 * @returns {object} Tracker controls (setNetworkProgress, resolveTarget, abort, getDisplayProgress)
 */
export const createSmoothProgressTracker = ({
  fileSize = 0,
  onTick,
  onComplete,
}) => {
  let targetProgress = 0;
  let displayProgress = 0;
  let isResolved = false;
  let isAborted = false;
  let lastReportedProgress = -1;

  const baseStep = calculateDynamicStep(fileSize);

  const intervalId = setInterval(() => {
    if (isAborted) {
      clearInterval(intervalId);
      return;
    }

    if (!isResolved) {
      // While upload is in-flight: smoothly increment up to 90% soft ceiling
      let step = baseStep;
      if (displayProgress >= 85) {
        // Asymptotic gradual crawl approaching 90%
        step = 0.25;
      } else if (displayProgress >= 70) {
        // Gentle deceleration between 70% and 85%
        step = Math.max(0.5, baseStep * 0.5);
      }

      // If large file with real network progress lagging behind, pace with network chunks
      if (
        fileSize > 1024 * 1024 &&
        targetProgress > 0 &&
        displayProgress > targetProgress + 10
      ) {
        step = 0.1;
      }

      displayProgress = Math.min(90, displayProgress + step);
    } else {
      // Upload promise resolved! Rapidly animate displayProgress to 100%
      const remaining = 100 - displayProgress;
      const rapidStep = Math.max(4, Math.ceil(remaining * 0.35));
      displayProgress = Math.min(100, displayProgress + rapidStep);
    }

    const rounded = Math.min(100, Math.round(displayProgress));
    if (rounded !== lastReportedProgress) {
      lastReportedProgress = rounded;
      onTick?.(rounded);
    }

    if (isResolved && rounded >= 100) {
      clearInterval(intervalId);
      onComplete?.();
    }
  }, 25);

  return {
    setNetworkProgress: (loaded, total) => {
      if (!total) return;
      const percent = Math.round((loaded * 100) / total);
      // Soft ceiling of 90% while still in-flight
      targetProgress = Math.max(targetProgress, Math.min(percent, 90));
    },
    resolveTarget: () => {
      isResolved = true;
      targetProgress = 100;
    },
    abort: () => {
      isAborted = true;
      clearInterval(intervalId);
    },
    getDisplayProgress: () => Math.round(displayProgress),
    getTargetProgress: () => targetProgress,
    getIntervalId: () => intervalId,
  };
};

export default {
  calculateDynamicStep,
  createSmoothProgressTracker,
};
