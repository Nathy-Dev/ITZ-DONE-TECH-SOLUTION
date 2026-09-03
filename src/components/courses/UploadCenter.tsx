"use client";

import { Id } from "../../../convex/_generated/dataModel";

interface UploadCenterProps {
  courseId: Id<"courses">;
}

/**
 * Deprecated: course materials and videos now use the media pipeline via
 * `MediaUpload` and the lesson editor. This component is retained only so that
 * old references continue to resolve during the transition. It renders nothing.
 */
export default function UploadCenter(_props: UploadCenterProps) {
  void _props;
  return null;
}
