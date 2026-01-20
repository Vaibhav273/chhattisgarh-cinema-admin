import React from "react";
import { Calendar } from "lucide-react";
import ContentListBase from "../../components/ContentListBase";

const EventsList: React.FC = () => {
  return (
    <ContentListBase
      collectionName="events"
      title="Events"
      description="Manage all events"
      icon={<Calendar size={32} className="text-amber-500" />}
      addNewPath="/admin/events/new"
    />
  );
};

export default EventsList;
