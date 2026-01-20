import React from "react";
import { Video } from "lucide-react";
import ContentListBase from "../../components/ContentListBase";

const VideosList: React.FC = () => {
  return (
    <ContentListBase
      collectionName="videos"
      title="Videos"
      description="Manage all videos"
      icon={<Video size={32} className="text-green-500" />}
      addNewPath="/admin/videos/new"
    />
  );
};

export default VideosList;
