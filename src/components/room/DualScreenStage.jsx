"use client";

import { LocalVideoStage } from "./LocalVideoStage";
import { PeerVideoStage } from "./PeerVideoStage";

export function DualScreenStage({
  // Local Screen props
  videoRef,
  cameraActive,
  isLoadingCamera,
  cameraPermission,
  cameraError,
  isMirrored,
  micActive,
  isMicAvailable,
  micPermission,
  isSpeaking,
  onToggleMirror,
  onMicClick,
  onCameraClick,
  onOpenPermissionDialog,
  onStartMedia,
  // Engine overlay props
  sessionState,
  countdownValue,
  currentShot,
  transitionText,
  // Peer Screen props
  isPeerJoined,
  onShareWhatsApp,
  onCopyLink,
  copied,
  onToggleTestPeer,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <LocalVideoStage
        videoRef={videoRef}
        cameraActive={cameraActive}
        isLoadingCamera={isLoadingCamera}
        cameraPermission={cameraPermission}
        cameraError={cameraError}
        isMirrored={isMirrored}
        micActive={micActive}
        isMicAvailable={isMicAvailable}
        micPermission={micPermission}
        isSpeaking={isSpeaking}
        onToggleMirror={onToggleMirror}
        onMicClick={onMicClick}
        onCameraClick={onCameraClick}
        onOpenPermissionDialog={onOpenPermissionDialog}
        onStartMedia={onStartMedia}
        sessionState={sessionState}
        countdownValue={countdownValue}
        currentShot={currentShot}
        transitionText={transitionText}
      />

      <PeerVideoStage
        isPeerJoined={isPeerJoined}
        onShareWhatsApp={onShareWhatsApp}
        onCopyLink={onCopyLink}
        copied={copied}
        onToggleTestPeer={onToggleTestPeer}
      />
    </div>
  );
}
