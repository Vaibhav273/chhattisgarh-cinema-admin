import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Film,
  Star,
  Clock,
  Eye,
  Calendar,
} from "lucide-react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../config/firebase";

interface ContentListBaseProps {
  collectionName: "movies" | "webseries" | "shortfilms" | "videos" | "events";
  title: string;
  description: string;
  icon: React.ReactNode;
  addNewPath: string;
}

const ContentListBase: React.FC<ContentListBaseProps> = ({
  collectionName,
  title,
  description,
  icon,
  addNewPath,
}) => {
  const navigate = useNavigate();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log(`📡 Listening to ${collectionName}...`);

    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        console.log(`✅ ${collectionName} loaded:`, snapshot.docs.length);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setContents(data);
        setLoading(false);
      },
      (error) => {
        console.error(`❌ ${collectionName} error:`, error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [collectionName]);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        console.log("✅ Deleted:", id);
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete");
      }
    }
  };

  const getRating = (rating: any): string => {
    if (!rating) return "N/A";
    if (typeof rating === "number") return rating.toFixed(1);
    if (typeof rating === "object" && rating.average)
      return rating.average.toFixed(1);
    return "N/A";
  };

  const getYear = (content: any): string => {
    if (content.year) return String(content.year);
    if (content.date) {
      try {
        return new Date(content.date).getFullYear().toString();
      } catch {
        return "N/A";
      }
    }
    if (content.releaseDate) {
      try {
        return new Date(content.releaseDate).getFullYear().toString();
      } catch {
        return "N/A";
      }
    }
    return "N/A";
  };

  const getDuration = (content: any): string | undefined => {
    if (collectionName === "webseries") return content.episodeDuration;
    return content.duration;
  };

  const getImage = (content: any): string | undefined => {
    if (collectionName === "events") {
      return content.image || content.bannerImage;
    }
    return content.thumbnail || content.thumbnailUrl || content.posterUrl;
  };

  const filteredContents = contents.filter(
    (content) =>
      content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.titleHindi?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPremium = contents.filter((c) => c.isPremium).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            {icon}
            {title}
          </h1>
          <p className="text-slate-500 mt-1">
            {description} •
            <span className="text-green-600 font-semibold ml-1">
              Live Updates 🟢
            </span>
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(addNewPath)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-2xl shadow-lg shadow-orange-400/30 font-semibold"
        >
          <Plus size={20} />
          Add New
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400/50"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 px-6 py-3 bg-white/80 border border-slate-200 rounded-2xl hover:bg-slate-50"
        >
          <Filter size={20} />
          <span className="font-semibold">Filters</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <p className="text-sm font-semibold text-blue-600 mb-2">
            Total {title}
          </p>
          <h3 className="text-4xl font-black text-blue-900">
            {contents.length}
          </h3>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
          <p className="text-sm font-semibold text-orange-600 mb-2">
            Premium Content
          </p>
          <h3 className="text-4xl font-black text-orange-900">
            {totalPremium}
          </h3>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <p className="text-sm font-semibold text-green-600 mb-2">Published</p>
          <h3 className="text-4xl font-black text-green-900">
            {contents.filter((c) => c.isPublished !== false).length}
          </h3>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-200 animate-pulse h-96 rounded-3xl"
            ></div>
          ))}
        </div>
      ) : filteredContents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredContents.map((content, index) => {
            const duration = getDuration(content);
            const image = getImage(content);

            return (
              <motion.div
                key={content.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 hover:shadow-2xl transition-all"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[2/3] overflow-hidden bg-slate-200">
                  {image ? (
                    <img
                      src={image}
                      alt={content.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film size={48} className="text-slate-400" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white text-xs font-semibold mb-2 line-clamp-2">
                        {content.description ||
                          content.descriptionHindi ||
                          "No description"}
                      </p>
                      <div className="flex items-center gap-2 text-white/80 text-xs">
                        <Eye size={12} />
                        <span>{content.views || 0} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Premium Badge */}
                  {content.isPremium && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                        PREMIUM
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3
                    className="font-bold text-slate-800 mb-1 truncate"
                    title={content.title}
                  >
                    {content.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-600 mb-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star
                        size={12}
                        className="text-amber-500"
                        fill="currentColor"
                      />
                      <span className="font-semibold">
                        {getRating(content.rating)}
                      </span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{getYear(content)}</span>
                    </div>
                    {duration && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{duration}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() =>
                        navigate(`/admin/${collectionName}/edit/${content.id}`)
                      }
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <Edit size={16} />
                      <span className="text-sm font-semibold">Edit</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleDelete(content.id, content.title)}
                      className="flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Film size={64} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            No content found
          </h3>
          <p className="text-slate-500 mb-6">
            {searchTerm
              ? "Try a different search term"
              : `Start by adding your first ${title.toLowerCase()}`}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(addNewPath)}
            className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-2xl shadow-lg font-semibold"
          >
            Add New
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default ContentListBase;
