import React from "react";
import { Film } from "lucide-react";
import ContentListBase from "../../components/ContentListBase";

const MoviesList: React.FC = () => {
  return (
    <ContentListBase
      collectionName="movies"
      title="Movies"
      description="Manage all movies"
      icon={<Film size={32} className="text-blue-500" />}
      addNewPath="/admin/movies/new"
    />
  );
};

export default MoviesList;
