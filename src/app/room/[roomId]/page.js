import { RoomLobby } from "@/components/room/RoomLobby";

export default async function PhotoboothRoomPage({ params }) {
    const { roomId } = await params;

    await new Promise((resolve) => setTimeout(resolve, 3000));

    return <RoomLobby roomId={roomId} />;
}