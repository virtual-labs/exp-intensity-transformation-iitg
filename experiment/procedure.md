1. Load a grayscale/RGB input image.
2. Convert to grayscale if required.
3. Apply:
  • Negative transformation.
  • Gamma correction for multiple γ values (e.g., 0.5, 1, 2).
  • Contrast stretching using min–max normalization.
4. Display original and transformed images.
5. Compare intensity histograms for each output.
6. Conclude which method best improves visibility for the given image type.

   Simulator
• Read image using cv2.imread() and convert if needed using cv2.cvtColor().
• Negative: neg = 255 - img.
• Gamma correction using LUT or img**gamma.
• Contrast stretching by normalization.
• Plot histograms using Matplotlib for comparison.

