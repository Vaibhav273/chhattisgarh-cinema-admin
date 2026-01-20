import React from "react";
import { TrendingUp } from "lucide-react";
import ContentListBase from "../../components/ContentListBase";

const SeriesList: React.FC = () => {
  return (
    <ContentListBase
      collectionName="webseries"
      title="Web Series"
      description="Manage all web series"
      icon={<TrendingUp size={32} className="text-purple-500" />}
      addNewPath="/admin/series/new"
    />
  );
};

export default SeriesList;
