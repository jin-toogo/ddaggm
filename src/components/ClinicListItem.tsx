import React from "react";
import { ExternalLink, MapPin, Phone } from "lucide-react";
import { Clinic } from "@/types/clinics";

interface ClinicListItemProps {
  clinic: Clinic;
}

export function ClinicListItem({ clinic }: ClinicListItemProps) {
  const handleNaverSearch = () => {
    const searchQuery = encodeURIComponent(
      `${clinic.name} ${clinic.district_kor}`
    );
    window.open(
      `https://search.naver.com/search.naver?query=${searchQuery}`,
      "_blank"
    );
  };

  const handleNaverMaps = () => {
    const searchQuery = encodeURIComponent(
      `${clinic.name} ${clinic.district_kor}`
    );
    window.open(`https://map.naver.com/v5/search/${searchQuery}`, "_blank");
  };

  return (
    <div className="border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground mb-2">
            {clinic.name}
          </h3>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{clinic.address}</span>
          </div>

          {/* <div className="flex items-center gap-2">
              <span className="font-medium">지역:</span>
              <span>
                {clinic.city} {clinic.district}
              </span>
            </div> */}
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={handleNaverSearch}
            className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            네이버 검색
          </button>

          <button
            onClick={handleNaverMaps}
            className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
          >
            <MapPin className="w-4 h-4" />
            지도 보기
          </button>
        </div>
      </div>
    </div>
  );
}
