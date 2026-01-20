import React from "react";
import { Clapperboard } from "lucide-react";
import ContentListBase from "../../components/ContentListBase";

const ShortFilmsList: React.FC = () => {
  return (
    <ContentListBase
      collectionName="shortfilms"
      title="Short Films"
      description="Manage all short films"
      icon={<Clapperboard size={32} className="text-pink-500" />}
      addNewPath="/admin/short-films/new"
    />
  );
};

export default ShortFilmsList;
