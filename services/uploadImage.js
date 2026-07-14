
import * as ImageManipulator from "expo-image-manipulator";
 
// Same name/signature as the old Storage version, so existing callers
// (uploadImageAsync(localUri, storagePath)) don't need to change.
// storagePath is no longer used (nothing to path anymore) but is kept
// as a parameter so call sites don't break.
export async function uploadImageAsync(localUri, storagePath, options = {}) {
  const { maxWidth = 600, quality = 0.5 } = options;
 
  const manipulated = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: maxWidth } }],
    {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );
 
  if (!manipulated.base64) {
    throw new Error("Failed to encode image.");
  }
 
  const approxBytes = manipulated.base64.length * 0.75;
  if (approxBytes > 700_000) {
    throw new Error(
      "Image is still too large after compression. Try a smaller maxWidth or lower quality."
    );
  }
 
  // Returned value is used exactly like the old download URL was:
  // store it as a string field in Firestore, and pass it straight
  // into <Image source={{ uri: ... }}/> to render it.
  return `data:image/jpeg;base64,${manipulated.base64}`;
}
 