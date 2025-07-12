import React, { useState, useEffect } from 'react';

export default function ScrollProgress ({
  topElementId,
  bottomElementId,
  className = "",
  showPercentage = false,
  height = "h-1"
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const topElement = document.getElementById(topElementId);
      const bottomElement = document.getElementById(bottomElementId);

      if (!topElement || !bottomElement) {
        console.warn(`Elements with IDs "${topElementId}" or "${bottomElementId}" not found`);
        return;
      }

      const topRect = topElement.getBoundingClientRect();
      const bottomRect = bottomElement.getBoundingClientRect();

      // Get the viewport height
      const viewportHeight = window.innerHeight;

      // Calculate the total scrollable distance between elements
      const totalDistance = bottomRect.top - topRect.top;

      // Calculate how much has been scrolled
      // When top element is at viewport top, progress should be 0
      // When bottom element is at viewport top, progress should be 100
      const scrolled = Math.max(0, -topRect.top);
      const maxScroll = Math.max(0, totalDistance - viewportHeight);

      // Calculate progress percentage
      let progressPercentage = 0;
      if (maxScroll > 0) {
        progressPercentage = Math.min(100, Math.max(0, (scrolled / maxScroll) * 100));
      }

      setProgress(progressPercentage);
    };

    // Calculate initial progress
    calculateProgress();

    // Add scroll event listener
    window.addEventListener('scroll', calculateProgress);
    window.addEventListener('resize', calculateProgress);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', calculateProgress);
      window.removeEventListener('resize', calculateProgress);
    };
  }, [topElementId, bottomElementId]);

  return (
    <div className={`w-full ${className}`}>
      <div className={`bg-gray-200 dark:bg-gray-800 rounded-full ${height} overflow-hidden`}>
        <div
          className="bg-primary h-full transition-all duration-150 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-center">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};